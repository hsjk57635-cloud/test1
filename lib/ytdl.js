const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const NodeID3 = require('node-id3');
const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');
const ytM = require('node-youtube-music');
const axios = require('axios');

const ytIdRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/;

class YTDownloader {
    constructor() {
        this.tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(this.tmpDir)) {
            fs.mkdirSync(this.tmpDir, { recursive: true });
        }
        
        // Try to load cookies for better reliability
        this.agent = null;
        this.loadCookies();
    }

    loadCookies() {
        const cookiePath = path.join(process.cwd(), 'cookies.json');
        if (fs.existsSync(cookiePath)) {
            try {
                const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));
                this.agent = ytdl.createAgent(cookies);
                console.log('✅ YouTube cookies loaded');
            } catch (err) {
                console.warn('⚠️ Failed to load cookies:', err.message);
            }
        }
    }

    /**
     * Set custom agent (for cookies/proxy)
     */
    setAgent(agent) {
        this.agent = agent;
    }

    /**
     * Check if string is valid YouTube URL
     */
    static isYTUrl(url) {
        return ytIdRegex.test(url);
    }

    /**
     * Extract video ID from URL
     */
    static getVideoID(url) {
        if (!this.isYTUrl(url)) throw new Error('Not a YouTube URL');
        return ytIdRegex.exec(url)[1];
    }

    /**
     * Search YouTube videos
     */
    static async search(query, options = {}) {
        const result = await yts.search({ query, hl: 'id', gl: 'ID', ...options });
        return result.videos;
    }

    /**
     * Search music tracks with details
     */
    static async searchTrack(query) {
        const ytMusic = await ytM.searchMusics(query);
        return ytMusic.map(t => ({
            isYtMusic: true,
            title: `${t.title} - ${t.artists.map(a => a.name).join(' ')}`,
            artist: t.artists.map(a => a.name).join(' '),
            id: t.youtubeId,
            url: 'https://youtu.be/' + t.youtubeId,
            album: t.album,
            duration: {
                seconds: t.duration?.totalSeconds || 0,
                label: t.duration?.label || '',
            },
            image: t.thumbnailUrl?.replace('w120-h120', 'w600-h600') || '',
        }));
    }

    /**
     * Get video info with all formats
     */
    async getInfo(url) {
        const options = {
            playerClients: ['WEB_CREATOR', 'IOS', 'ANDROID', 'TV'] // More clients = more formats
        };
        if (this.agent) options.agent = this.agent;
        
        return await ytdl.getInfo(url, options);
    }

    /**
     * Download video with specified quality (handles 1080p+ properly)
     * @param {string} url - YouTube URL or ID
     * @param {string|number} quality - Desired quality (e.g., 'highestvideo', 1080, '720p')
     * @returns {Promise<Object>} - Video info and download URL
     */
    async getVideo(url, quality = 'highestvideo') {
        const videoId = YTDownloader.isYTUrl(url) ? YTDownloader.getVideoID(url) : url;
        const fullUrl = 'https://www.youtube.com/watch?v=' + videoId;
        
        const info = await this.getInfo(fullUrl);
        
        // Parse quality request
        let targetHeight = 0;
        if (typeof quality === 'number') {
            targetHeight = quality;
        } else if (typeof quality === 'string') {
            const match = quality.match(/(\d+)/);
            if (match) targetHeight = parseInt(match[1]);
        }

        // Strategy: For 720p and below, try combined video+audio first
        // For 1080p+, use separate streams and merge
        let videoFormat, audioFormat;
        
        if (targetHeight <= 720) {
            // Try to find combined format with desired quality
            const combinedFormats = ytdl.filterFormats(info.formats, 'videoandaudio');
            videoFormat = ytdl.chooseFormat(combinedFormats, { 
                quality: targetHeight > 0 ? targetHeight : 'highest',
                filter: 'videoandaudio'
            });
        }

        // If no combined format or we want higher quality, get separate streams
        if (!videoFormat || targetHeight > 720) {
            // Get best video-only format at desired quality
            const videoFormats = ytdl.filterFormats(info.formats, 'videoonly');
            videoFormat = ytdl.chooseFormat(videoFormats, { 
                quality: targetHeight > 0 ? targetHeight : 'highestvideo'
            });

            // Get best audio-only format
            const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
            audioFormat = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
        }

        return {
            title: info.videoDetails.title,
            thumb: info.videoDetails.thumbnails.slice(-1)[0],
            date: info.videoDetails.publishDate,
            duration: info.videoDetails.lengthSeconds,
            channel: info.videoDetails.ownerChannelName,
            description: info.videoDetails.description,
            videoFormat,
            audioFormat,
            requiresMerge: !!audioFormat
        };
    }

    /**
     * Download and optionally merge video+audio
     * @returns {Promise<string>} - Path to final file
     */
    async downloadVideo(url, quality = 'highestvideo') {
        const videoId = YTDownloader.isYTUrl(url) ? YTDownloader.getVideoID(url) : url;
        const fullUrl = 'https://www.youtube.com/watch?v=' + videoId;
        
        const { title, videoFormat, audioFormat, requiresMerge } = await this.getVideo(fullUrl, quality);
        
        const outputPath = path.join(this.tmpDir, `${randomBytes(4).toString('hex')}.mp4`);
        
        if (!requiresMerge) {
            // Direct download for combined format
            return new Promise((resolve, reject) => {
                const stream = ytdl.downloadFromInfo({ formats: [videoFormat] }, { 
                    format: videoFormat,
                    dlChunkSize: 0 // Disable chunking for faster download
                });
                
                const writeStream = fs.createWriteStream(outputPath);
                stream.pipe(writeStream);
                
                writeStream.on('finish', () => resolve(outputPath));
                stream.on('error', reject);
                writeStream.on('error', reject);
            });
        } else {
            // Download separate streams and merge with ffmpeg
            const videoPath = path.join(this.tmpDir, `${randomBytes(4).toString('hex')}_video.mp4`);
            const audioPath = path.join(this.tmpDir, `${randomBytes(4).toString('hex')}_audio.mp4`);
            
            // Download video stream
            await new Promise((resolve, reject) => {
                const stream = ytdl.downloadFromInfo({ formats: [videoFormat] }, { format: videoFormat });
                const writeStream = fs.createWriteStream(videoPath);
                stream.pipe(writeStream);
                writeStream.on('finish', resolve);
                stream.on('error', reject);
                writeStream.on('error', reject);
            });
            
            // Download audio stream
            await new Promise((resolve, reject) => {
                const stream = ytdl.downloadFromInfo({ formats: [audioFormat] }, { format: audioFormat });
                const writeStream = fs.createWriteStream(audioPath);
                stream.pipe(writeStream);
                writeStream.on('finish', resolve);
                stream.on('error', reject);
                writeStream.on('error', reject);
            });
            
            // Merge with ffmpeg
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(videoPath)
                    .input(audioPath)
                    .videoCodec('copy')
                    .audioCodec('aac')
                    .format('mp4')
                    .on('end', resolve)
                    .on('error', reject)
                    .save(outputPath);
            });
            
            // Cleanup temp files
            try {
                fs.unlinkSync(videoPath);
                fs.unlinkSync(audioPath);
            } catch (e) {}
            
            return outputPath;
        }
    }

    /**
     * Download audio as MP3
     */
    async downloadAudio(url, addMetadata = true) {
        const videoId = YTDownloader.isYTUrl(url) ? YTDownloader.getVideoID(url) : url;
        const fullUrl = 'https://www.youtube.com/watch?v=' + videoId;
        
        const info = await this.getInfo(fullUrl);
        
        // Get best audio format
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        const audioFormat = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
        
        const outputPath = path.join(this.tmpDir, `${randomBytes(4).toString('hex')}.mp3`);
        
        // Download audio stream
        await new Promise((resolve, reject) => {
            const stream = ytdl.downloadFromInfo({ formats: [audioFormat] }, { format: audioFormat });
            
            ffmpeg(stream)
                .audioBitrate(128)
                .audioCodec('libmp3lame')
                .format('mp3')
                .on('end', resolve)
                .on('error', reject)
                .save(outputPath);
        });
        
        if (addMetadata) {
            const thumbUrl = info.videoDetails.thumbnails.slice(-1)[0].url;
            let thumbBuffer = null;
            try {
                const response = await axios.get(thumbUrl, { responseType: 'arraybuffer' });
                thumbBuffer = Buffer.from(response.data);
            } catch (e) {}
            
            const tags = {
                title: info.videoDetails.title,
                artist: info.videoDetails.ownerChannelName || 'Unknown',
                album: 'YouTube Download',
                year: info.videoDetails.publishDate?.split('-')[0] || '',
                ...(thumbBuffer && {
                    image: {
                        mime: 'jpeg',
                        type: { id: 3, name: 'front cover' },
                        imageBuffer: thumbBuffer,
                        description: `Cover of ${info.videoDetails.title}`,
                    }
                })
            };
            NodeID3.write(tags, outputPath);
        }
        
        return {
            path: outputPath,
            title: info.videoDetails.title,
            duration: info.videoDetails.lengthSeconds,
            size: fs.statSync(outputPath).size
        };
    }

    /**
     * Clean up old temp files
     */
    cleanup(maxAge = 3600000) { // 1 hour default
        const now = Date.now();
        fs.readdirSync(this.tmpDir).forEach(file => {
            const filePath = path.join(this.tmpDir, file);
            const stats = fs.statSync(filePath);
            if (now - stats.mtimeMs > maxAge) {
                try { fs.unlinkSync(filePath); } catch (e) {}
            }
        });
    }
}

module.exports = new YTDownloader();
