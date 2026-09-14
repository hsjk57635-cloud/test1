/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *  🔗  Telegram : https://t.me/Hamza302bot                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

const SEARCH_API = 'https://api.deline.web.id/search/xvideos?q=';
const DOWNLOAD_API = 'https://api.deline.web.id/downloader/xvideos?url=';

const sessions = new Map();

// Helper to get the best video URL from the download API's videos object
function getBestVideoUrl(videos) {
    if (!videos) return null;
    // Priority: high (360p) > low (240p) > HLS
    if (videos.high) return videos.high;
    if (videos.low) return videos.low;
    if (videos.HLS) return videos.HLS;
    return null;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    command: 'xv2',
    aliases: ['xv2dl', 'xv2search'],
    category: 'downloader',
    description: 'Search and download videos from xv website with thumbnail browsing (owner/sudo only)',
    usage: '.xv2 <search query>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const senderId = context.senderId || message.key.participant || message.key.remoteJid;
        const query = args.join(' ').trim();

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `🎬 *XV2 Video Downloader (with thumbnails)*\n\n` +
                      `*Usage:* \`.xv2 <search term>\`\n\n` +
                      `*Examples:*\n• \`.xv2 doggy style\`\n• \`.xv2 cat videos\`\n\n` +
                      `*Navigation:*\n` +
                      `- Type a *number* (1-9) to jump\n` +
                      `- Type *next* or *prev* to browse\n` +
                      `- Type *download* to get the current video`,
                ...channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        try {
            // 1. Search – note the new endpoint and result structure
            const searchUrl = `${SEARCH_API}${encodeURIComponent(query)}`;
            const { data: searchData } = await axios.get(searchUrl, { timeout: 15000 });

            if (!searchData?.status) {
                throw new Error(`Search API returned status false: ${searchData?.message || 'unknown'}`);
            }

            const items = searchData.result?.items;
            if (!items || !Array.isArray(items) || items.length === 0) {
                return sock.sendMessage(chatId, { text: '❌ No results found.', ...channelInfo }, { quoted: message });
            }

            const results = items.slice(0, 9); // max 9 results
            let currentIndex = 0;

            // 2. Send the first result thumbnail (if cover exists)
            const firstResult = results[0];
            if (firstResult.cover) {
                await sock.sendMessage(chatId, {
                    image: { url: firstResult.cover },
                    caption: `*Result 1/${results.length}*`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ No thumbnail available for first result.`,
                    ...channelInfo
                });
            }

            // 3. Build details function
            const buildDetails = (idx) => {
                const r = results[idx];
                return `*${idx+1}/${results.length}* – *${r.title || 'Untitled'}*\n\n` +
                       `📺 Resolution: ${r.resolution || 'Unknown'}\n` +
                       `⏱️ Duration: ${r.duration || 'Unknown'}\n` +
                       `🎵 Artist: ${r.artist || 'Unknown'}\n` +
                       `\n✳️ *Commands:*\n` +
                       `• \`<number>\` – jump to that result\n` +
                       `• \`next\` or \`prev\` – browse\n` +
                       `• \`download\` – get this video`;
            };

            // Send editable text message with details
            const promptMsg = await sock.sendMessage(chatId, { text: buildDetails(currentIndex), ...channelInfo });
            const promptKey = promptMsg.key;

            // 4. Store session
            sessions.set(senderId, {
                results,
                currentIndex,
                promptKey,
                query
            });

            // 5. Reply handler
            const handler = async (update) => {
                const msg = update.messages?.[0];
                if (!msg?.message) return;
                if (msg.message.reactionMessage) return;
                if (msg.key.remoteJid !== chatId) return;

                const session = sessions.get(senderId);
                if (!session) return;

                const body = (msg.message.conversation ||
                             msg.message.extendedTextMessage?.text ||
                             msg.message.imageMessage?.caption ||
                             msg.message.videoMessage?.caption ||
                             '').toLowerCase().trim();

                const replyKey = msg.key;

                // Helper to edit the prompt
                const editPrompt = async (text) => {
                    await sock.sendMessage(chatId, { text, edit: promptKey });
                };

                // Handle navigation commands
                let newIndex = session.currentIndex;

                if (body === 'next') {
                    newIndex = session.currentIndex + 1;
                    if (newIndex >= session.results.length) {
                        await editPrompt(`❌ Already at the last result (${session.results.length}).`);
                        return;
                    }
                } else if (body === 'prev') {
                    newIndex = session.currentIndex - 1;
                    if (newIndex < 0) {
                        await editPrompt(`❌ Already at the first result.`);
                        return;
                    }
                } else if (/^\d+$/.test(body)) {
                    const num = parseInt(body, 10);
                    if (num >= 1 && num <= session.results.length) {
                        newIndex = num - 1;
                    } else {
                        await editPrompt(`❌ Invalid number. Choose 1-${session.results.length}.`);
                        return;
                    }
                } else if (body === 'download') {
                    // Download current video
                    const selected = session.results[session.currentIndex];
                    await sock.sendMessage(chatId, { react: { text: '📥', key: replyKey } });
                    await editPrompt(`⏳ Fetching download link for *${selected.title}*...`);

                    try {
                        // Use the 'url' field from search result (video page URL)
                        const videoPageUrl = selected.url;
                        if (!videoPageUrl) {
                            throw new Error('Missing video URL in search result');
                        }

                        const downloadUrl = `${DOWNLOAD_API}${encodeURIComponent(videoPageUrl)}`;
                        console.log(`[XV2] Download request URL: ${downloadUrl}`);

                        const { data: dlData } = await axios.get(downloadUrl, { timeout: 20000 });
                        console.log(`[XV2] Download API response:`, JSON.stringify(dlData, null, 2));

                        if (!dlData?.status) {
                            throw new Error(`Download API returned status false: ${dlData?.message || 'unknown'}`);
                        }

                        // The videos object is nested under result.videos.videos
                        const videosObj = dlData.result?.videos?.videos;
                        if (!videosObj) {
                            throw new Error('No videos object found in download response');
                        }

                        const videoUrl = getBestVideoUrl(videosObj);
                        if (!videoUrl) {
                            throw new Error('No downloadable video URL found in response');
                        }

                        const caption = `🎬 *${selected.title}*\n` +
                                        `📀 Quality: ${dlData.result.quality || 'Auto'}\n` +
                                        `🕒 Duration: ${dlData.result.duration || selected.duration || '?'}\n\n` +
                                        `*Downloaded by JUNAID-MD↣³⁰²*\n` +
                                        `_Owner: JUNAID-MD↣³⁰² _`;

                        await sock.sendMessage(chatId, {
                            video: { url: videoUrl },
                            caption: caption,
                            mimetype: 'video/mp4'
                        });

                        sessions.delete(senderId);
                        await editPrompt(`✅ *Download complete!*\n${selected.title} sent.`);
                        await delay(3000);
                        await editPrompt(`_Session closed._`);
                        sock.ev.off('messages.upsert', handler);
                    } catch (err) {
                        console.error('[XV2] Download error:', err);
                        await editPrompt(`❌ Failed to download: ${err.message}`);
                        sessions.delete(senderId);
                        sock.ev.off('messages.upsert', handler);
                    }
                    return;
                } else {
                    // Not a recognized command – ignore
                    return;
                }

                // If we reach here, navigation was successful
                if (newIndex !== session.currentIndex) {
                    session.currentIndex = newIndex;
                    const newResult = session.results[newIndex];

                    // Send new thumbnail (if cover exists)
                    if (newResult.cover) {
                        await sock.sendMessage(chatId, {
                            image: { url: newResult.cover },
                            caption: `*Result ${newIndex+1}/${session.results.length}*`,
                            ...channelInfo
                        });
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `⚠️ No thumbnail available for result ${newIndex+1}.`,
                            ...channelInfo
                        });
                    }

                    // Update the editable text
                    await editPrompt(buildDetails(newIndex));
                }
            };

            sock.ev.on('messages.upsert', handler);
            // Auto‑clean after 10 minutes
            setTimeout(() => {
                if (sessions.has(senderId)) {
                    sessions.delete(senderId);
                    sock.ev.off('messages.upsert', handler);
                }
            }, 10 * 60 * 1000);

        } catch (error) {
            console.error('[XV2] Search error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Search failed: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};
