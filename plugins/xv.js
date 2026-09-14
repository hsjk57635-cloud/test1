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

const SEARCH_API = 'https://api.deline.web.id/search/xnxx?q=';
const DOWNLOAD_API = 'https://api.deline.web.id/downloader/xnxx?url=';

const sessions = new Map();

function getBestVideoUrl(files) {
    if (!files) return null;
    if (files.hd1080) return files.hd1080;
    if (files['1080p']) return files['1080p'];
    if (files.high) return files.high;
    if (files.low) return files.low;
    if (files.HLS) return files.HLS;
    return null;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    command: 'xv',
    aliases: ['xvdl', 'xvsearch', 'xvideo'],
    category: 'downloader',
    description: 'Search and download videos from xv website (owner/sudo only)',
    usage: '.xv <search query>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const senderId = context.senderId || message.key.participant || message.key.remoteJid;
        const query = args.join(' ').trim();

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `🎬 *XV Video Downloader*\n\n` +
                      `*Usage:* \`.xv <search term>\`\n\n` +
                      `*Examples:*\n• \`.xv doggy style\`\n• \`.xv cat videos\``,
                ...channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        try {
            const searchUrl = `${SEARCH_API}${encodeURIComponent(query)}`;
            const { data: searchData } = await axios.get(searchUrl, { timeout: 15000 });

            if (!searchData?.status || !Array.isArray(searchData.result) || searchData.result.length === 0) {
                return sock.sendMessage(chatId, { text: '❌ No results found.', ...channelInfo }, { quoted: message });
            }

            const results = searchData.result.slice(0, 9);

            let listText = `🔍 *Search Results for:* "${query}"\n\n`;
            results.forEach((item, idx) => {
                listText += `*${idx + 1}. ${item.title || 'Untitled'}*\n`;
                if (item.info) listText += `   ${item.info}\n`;
                if (item.resolution) listText += `   📺 ${item.resolution}\n`;
                if (item.duration) listText += `   ⏱️ ${item.duration}\n`;
                if (item.artist) listText += `   🎵 ${item.artist}\n`;
                listText += '\n';
            });
            listText += `✳️ Reply with the *number* (1-${results.length}) to download.`;

            const promptMsg = await sock.sendMessage(chatId, { text: listText, ...channelInfo });
            const promptKey = promptMsg.key;

            sessions.set(senderId, {
                stage: 'search',
                results,
                promptKey
            });

            const handler = async (update) => {
                const msg = update.messages?.[0];
                if (!msg?.message) return;
                if (msg.message.reactionMessage) return;
                if (msg.key.remoteJid !== chatId) return;

                const session = sessions.get(senderId);
                if (!session) return;

                const body = msg.message.conversation ||
                             msg.message.extendedTextMessage?.text ||
                             msg.message.imageMessage?.caption ||
                             msg.message.videoMessage?.caption ||
                             '';
                const choice = parseInt(body);
                if (isNaN(choice)) return;

                const replyMsgKey = msg.key;

                const editPrompt = async (text) => {
                    await sock.sendMessage(chatId, { text, edit: promptKey });
                };

                if (session.stage === 'search') {
                    const selected = session.results[choice - 1];
                    if (!selected) {
                        await editPrompt(`❌ Invalid number. Please choose between 1 and ${session.results.length}.`);
                        return;
                    }

                    await sock.sendMessage(chatId, { react: { text: '📥', key: replyMsgKey } });
                    await editPrompt(`⏳ Fetching download link for *${selected.title}*...`);

                    try {
                        // *** FIX: Use 'link' instead of 'url' ***
                        const videoUrl = selected.link || selected.url;
                        if (!videoUrl) {
                            throw new Error('No video URL in search result (missing link/url field)');
                        }

                        const downloadUrl = `${DOWNLOAD_API}${encodeURIComponent(videoUrl)}`;
                        console.log(`[XV] Download URL: ${downloadUrl}`); // Debug

                        const { data: dlData } = await axios.get(downloadUrl, { timeout: 20000 });
                        console.log(`[XV] Download API response:`, JSON.stringify(dlData, null, 2)); // Debug

                        if (!dlData?.status || !dlData.result?.files) {
                            throw new Error(`Invalid download response: ${dlData?.message || 'no files'}`);
                        }

                        const finalVideoUrl = getBestVideoUrl(dlData.result.files);
                        if (!finalVideoUrl) {
                            throw new Error('No downloadable video URL found in API response');
                        }

                        const caption = `🎬 *${selected.title}*\n` +
                                        `📀 Quality: ${dlData.result.quality || 'Auto'}\n` +
                                        `🕒 Duration: ${dlData.result.duration || selected.duration || '?'}\n\n` +
                                        `*Downloaded by JUNAID-MD↣³⁰²*\n` +
                                        `_Owner: JUNAID-MD↣³⁰² _`;

                        await sock.sendMessage(chatId, {
                            video: { url: finalVideoUrl },
                            caption: caption,
                            mimetype: 'video/mp4'
                        });

                        sessions.delete(senderId);
                        await editPrompt(`✅ *Download complete!*\n${selected.title} sent.`);
                        await delay(3000);
                        await editPrompt(`_Session closed._`);
                        sock.ev.off('messages.upsert', handler);

                    } catch (err) {
                        console.error('[XV] Download error:', err);
                        await editPrompt(`❌ Failed to download: ${err.message}`);
                        sessions.delete(senderId);
                        sock.ev.off('messages.upsert', handler);
                    }
                }
            };

            sock.ev.on('messages.upsert', handler);
            setTimeout(() => {
                if (sessions.has(senderId)) {
                    sessions.delete(senderId);
                    sock.ev.off('messages.upsert', handler);
                }
            }, 10 * 60 * 1000);

        } catch (error) {
            console.error('[XV] Search error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Search failed: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};
