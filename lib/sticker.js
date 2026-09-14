const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { fileTypeFromBuffer } = require('file-type');
const webp = require('node-webpmux');
const fetch = require('node-fetch');
const { writeExifImg } = require('./exif');

const tmp = path.join(__dirname, '../tmp');
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

/**
 * Convert image buffer to WebP sticker
 * @param {Buffer} buffer Input image buffer
 * @returns {Promise<Buffer>}
 */
async function imageToWebp(buffer) {
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !type.mime.startsWith('image/')) throw new Error('Not an image');

    const inputPath = path.join(tmp, `${crypto.randomBytes(6).toString('hex')}.${type.ext}`);
    const outputPath = path.join(tmp, `${crypto.randomBytes(6).toString('hex')}.webp`);

    await fs.promises.writeFile(inputPath, buffer);

    return new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', [
            '-i', inputPath,
            '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
            '-y', outputPath
        ]);
        ff.on('error', reject);
        ff.on('close', async (code) => {
            try {
                await fs.promises.unlink(inputPath);
                if (code !== 0) return reject(new Error('FFmpeg error'));
                const result = await fs.promises.readFile(outputPath);
                await fs.promises.unlink(outputPath);
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
    });
}

/**
 * Convert video buffer to WebP animated sticker
 * @param {Buffer} buffer Input video buffer
 * @returns {Promise<Buffer>}
 */
async function videoToWebp(buffer) {
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !type.mime.startsWith('video/')) throw new Error('Not a video');

    const inputPath = path.join(tmp, `${crypto.randomBytes(6).toString('hex')}.${type.ext}`);
    const outputPath = path.join(tmp, `${crypto.randomBytes(6).toString('hex')}.webp`);

    await fs.promises.writeFile(inputPath, buffer);

    return new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', [
            '-i', inputPath,
            '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,fps=15',
            '-vcodec', 'libwebp',
            '-lossless', '0',
            '-compression_level', '6',
            '-q:v', '70',
            '-loop', '0',
            '-preset', 'default',
            '-an',
            '-vsync', '0',
            '-y', outputPath
        ]);
        ff.on('error', reject);
        ff.on('close', async (code) => {
            try {
                await fs.promises.unlink(inputPath);
                if (code !== 0) return reject(new Error('FFmpeg error'));
                const result = await fs.promises.readFile(outputPath);
                await fs.promises.unlink(outputPath);
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
    });
}

/**
 * Add EXIF metadata to a WebP sticker
 * @param {Buffer} webpBuffer WebP buffer
 * @param {string} packname Sticker pack name
 * @param {string} author Sticker author
 * @param {string[]} categories Emoji categories
 * @returns {Promise<Buffer>}
 */
async function addExif(webpBuffer, packname = 'REDX Stickers', author = 'JUNAID-MD↣³⁰²', categories = ['🤖']) {
    const img = new webp.Image();
    const stickerPackId = crypto.randomBytes(32).toString('hex');
    const json = {
        'sticker-pack-id': stickerPackId,
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'emojis': categories
    };
    let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    let exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    await img.load(webpBuffer);
    img.exif = exif;
    return await img.save(null);
}

/**
 * Create sticker from image/video buffer with metadata
 * @param {Buffer} buffer Input buffer
 * @param {string} packname Sticker pack name
 * @param {string} author Sticker author
 * @param {string[]} categories Emoji categories
 * @returns {Promise<Buffer>}
 */
async function createSticker(buffer, packname = 'REDX Stickers', author = 'JUNAID-MD↣³⁰²', categories = ['🤖']) {
    const type = await fileTypeFromBuffer(buffer);
    if (!type) throw new Error('Unknown file type');
    
    let webpBuffer;
    if (type.mime.startsWith('image/')) {
        webpBuffer = await imageToWebp(buffer);
    } else if (type.mime.startsWith('video/')) {
        webpBuffer = await videoToWebp(buffer);
    } else {
        throw new Error('Unsupported media type');
    }
    
    return await addExif(webpBuffer, packname, author, categories);
}

module.exports = {
    createSticker,
    imageToWebp,
    videoToWebp,
    addExif
};
