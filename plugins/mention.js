/**
 * Mention Plugin – Per‑User Mention Replies (Enhanced UI)
 *
 * Each user can set their own mention reply (text or media).
 * Triggers:
 *   - 🤖 Mention (@, number, name) → mentionEnabled
 *   - 💬 Reply to your message → replyEnabled
 * Both triggers are OFF by default and can be toggled independently.
 */

const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const store = require('../lib/lightweight_store');

const CONFIG_KEY = 'mention_configs';
const MEDIA_DIR = path.join(process.cwd(), 'data', 'mention_media');
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

const DEFAULT_CONFIG = {
    mentionEnabled: false,
    replyEnabled: false,
    type: 'text',
    text: '⚠️ Don’t mention me, I’m busy.',
    mediaPath: null,
    mimetype: null,
    ptt: false,
    gifPlayback: false,
    displayName: null,
};

// ----------------------------------------------------------------------
// Config helpers (unchanged)
// ----------------------------------------------------------------------
async function getAllConfigs() {
    try {
        const cfg = await store.getSetting('global', CONFIG_KEY);
        return cfg || {};
    } catch {
        return {};
    }
}

async function getUserConfig(jid) {
    const all = await getAllConfigs();
    let cfg = all[jid];
    if (cfg && cfg.enabled !== undefined && cfg.mentionEnabled === undefined) {
        cfg.mentionEnabled = cfg.enabled;
        cfg.replyEnabled = cfg.enabled;
        delete cfg.enabled;
        await saveUserConfig(jid, cfg);
    }
    return cfg ? { ...DEFAULT_CONFIG, ...cfg } : { ...DEFAULT_CONFIG };
}

async function saveUserConfig(jid, config) {
    const all = await getAllConfigs();
    all[jid] = config;
    await store.saveSetting('global', CONFIG_KEY, all);
}

// ----------------------------------------------------------------------
// Download media from a quoted message (unchanged)
// ----------------------------------------------------------------------
async function downloadMediaFromReply(message, sock) {
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) throw new Error('No quoted message found.');
    let mediaMsg, mediaType;
    if (quotedMsg.audioMessage) {
        mediaMsg = quotedMsg.audioMessage;
        mediaType = 'audio';
    } else if (quotedMsg.videoMessage) {
        mediaMsg = quotedMsg.videoMessage;
        mediaType = 'video';
    } else if (quotedMsg.stickerMessage) {
        mediaMsg = quotedMsg.stickerMessage;
        mediaType = 'sticker';
    } else if (quotedMsg.imageMessage) {
        mediaMsg = quotedMsg.imageMessage;
        mediaType = 'image';
    } else {
        throw new Error('Unsupported media type.');
    }
    const stream = await downloadContentFromMessage(mediaMsg, mediaType);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const mimetype = mediaMsg.mimetype || (mediaType === 'audio' ? 'audio/mpeg' : 'image/jpeg');
    let ptt = false, gifPlayback = false;
    if (mediaType === 'audio' && quotedMsg.audioMessage?.ptt) ptt = true;
    if (mediaType === 'video' && quotedMsg.videoMessage?.gifPlayback) gifPlayback = true;
    return { buffer, mimetype, mediaType, originalName: mediaMsg.fileName || 'media', ptt, gifPlayback };
}

// ----------------------------------------------------------------------
// Detection logic (unchanged)
// ----------------------------------------------------------------------
async function detectTriggers(message, userJid, userConfig) {
    const msg = message.message || {};
    if (!msg) return { mention: false, reply: false };

    const userNumber = userJid.split('@')[0].replace(/[^0-9]/g, '');
    const userNumberShort = userNumber.length > 10 ? userNumber.slice(-10) : userNumber;
    const displayName = (userConfig.displayName || '').toLowerCase();

    // ----- 1. Check for mentions (@, number, name) -----
    let mention = false;

    // 1a. mentionedJid arrays
    const allMentionedJids = [];
    const contexts = [
        msg.extendedTextMessage?.contextInfo,
        msg.imageMessage?.contextInfo,
        msg.videoMessage?.contextInfo,
        msg.documentMessage?.contextInfo,
        msg.stickerMessage?.contextInfo,
        msg.buttonsResponseMessage?.contextInfo,
        msg.listResponseMessage?.contextInfo,
        msg.templateButtonReplyMessage?.contextInfo
    ].filter(Boolean);
    for (const ctx of contexts) {
        if (ctx?.mentionedJid && Array.isArray(ctx.mentionedJid)) allMentionedJids.push(...ctx.mentionedJid);
    }
    if (msg.extendedTextMessage?.mentionedJid) allMentionedJids.push(...msg.extendedTextMessage.mentionedJid);
    if (msg.mentionedJid) allMentionedJids.push(...msg.mentionedJid);
    if (allMentionedJids.includes(userJid)) mention = true;

    // 1b. Check raw text for user number or name
    const rawText = msg.conversation ||
        msg.extendedTextMessage?.text ||
        msg.imageMessage?.caption ||
        msg.videoMessage?.caption ||
        msg.documentMessage?.caption ||
        msg.stickerMessage?.caption ||
        '';
    if (rawText) {
        const cleanNumbers = rawText.replace(/[^0-9]/g, '');
        if (cleanNumbers.includes(userNumber) || cleanNumbers.includes(userNumberShort)) mention = true;
        const regexNumber = new RegExp(`@?\\+?${userNumber}\\b`, 'i');
        if (regexNumber.test(rawText)) mention = true;
        const regexNumberShort = new RegExp(`@?\\+?${userNumberShort}\\b`, 'i');
        if (regexNumberShort.test(rawText)) mention = true;

        if (displayName) {
            const normalizedName = displayName.replace(/\s/g, '');
            if (rawText.toLowerCase().includes(normalizedName)) mention = true;
            const regexName = new RegExp(`@?${displayName.replace(/\s+/g, '\\s+')}`, 'i');
            if (regexName.test(rawText)) mention = true;
        }
    }

    // 1c. Special case for channels
    if (msg.newsletterMessage) {
        const inner = msg.newsletterMessage;
        const innerText = inner.conversation || inner.extendedTextMessage?.text || inner.imageMessage?.caption || '';
        if (innerText) {
            const clean = innerText.replace(/[^0-9]/g, '');
            if (clean.includes(userNumber) || clean.includes(userNumberShort)) mention = true;
            if (new RegExp(`@?\\+?${userNumber}\\b`, 'i').test(innerText)) mention = true;
            if (displayName && innerText.toLowerCase().includes(displayName.replace(/\s/g, ''))) mention = true;
        }
    }

    // ----- 2. Check if this message is a reply to a message from the user -----
    let reply = false;
    const contextInfo = msg.extendedTextMessage?.contextInfo ||
                       msg.imageMessage?.contextInfo ||
                       msg.videoMessage?.contextInfo ||
                       msg.stickerMessage?.contextInfo ||
                       msg.documentMessage?.contextInfo;
    if (contextInfo?.quotedMessage) {
        let quotedSender = contextInfo.participant;
        if (!quotedSender && contextInfo.quotedMessage?.key) {
            quotedSender = contextInfo.quotedMessage.key.participant || contextInfo.quotedMessage.key.remoteJid;
        }
        if (quotedSender === userJid) reply = true;
    }

    return { mention, reply };
}

// ----------------------------------------------------------------------
// Main detection handler – called for every message
// ----------------------------------------------------------------------
async function handleMention(sock, message) {
    try {
        if (message.key?.fromMe) return;
        const allConfigs = await getAllConfigs();
        for (const [userJid, config] of Object.entries(allConfigs)) {
            const triggers = await detectTriggers(message, userJid, config);
            let shouldReply = false;
            if (triggers.mention && config.mentionEnabled) shouldReply = true;
            if (triggers.reply && config.replyEnabled) shouldReply = true;
            if (!shouldReply) continue;

            const chatId = message.key.remoteJid;
            if (config.type === 'text') {
                await sock.sendMessage(chatId, { text: config.text }, { quoted: message });
                return;
            }

            if (!config.mediaPath || !fs.existsSync(config.mediaPath)) {
                await sock.sendMessage(chatId, { text: config.text }, { quoted: message });
                return;
            }

            const mediaBuffer = fs.readFileSync(config.mediaPath);
            let payload = {};
            switch (config.type) {
                case 'sticker': payload = { sticker: mediaBuffer }; break;
                case 'image': payload = { image: mediaBuffer }; break;
                case 'video':
                    payload = { video: mediaBuffer };
                    if (config.gifPlayback) payload.gifPlayback = true;
                    break;
                case 'audio':
                    payload = {
                        audio: mediaBuffer,
                        mimetype: config.mimetype || 'audio/mpeg',
                        ptt: config.ptt || false
                    };
                    break;
                default: continue;
            }
            await sock.sendMessage(chatId, payload, { quoted: message });
            return;
        }
    } catch (err) {
        console.error('[Mention] handleMention error:', err);
    }
}

// ----------------------------------------------------------------------
// Command handler with enhanced UI (clean guide)
// ----------------------------------------------------------------------
const shortGuide = (config) => {
    const status = config.mentionEnabled || config.replyEnabled ? '✅ ON' : '❌ OFF';
    return `*🤖 MENTION SETUP*\n\n` +
           `Current Status: ${status}\n` +
           `Storage: ${require('../lib/lightweight_store').HAS_DB ? 'Database' : 'File System'}\n\n` +
           `Commands:\n` +
           `• .mention on - Enable both triggers\n` +
           `• .mention off - Disable both triggers\n` +
           `• .mention status - View current settings\n` +
           `• .mention guide - Full help\n\n` +
           `Features:\n` +
           `• 🤖 Mention detection (@, number, name)\n` +
           `• 💬 Reply detection (replies to your messages)\n` +
           `• 📝 Text or 🎨 Media replies\n` +
           `• 🏷️ Custom display name detection`;
};

const fullGuide = `
*🤖 MENTION COMMANDS*

*BASIC*
• .mention on          – Enable both triggers
• .mention off         – Disable both triggers
• .mention status      – View current settings

*TRIGGER TOGGLES*
• .mention mention on|off – 🤖 Mentions only
• .mention reply on|off   – 💬 Replies only

*SETUP*
• .mention set text       – Set text reply (reply to a text)
• .mention set media      – Set media reply (sticker/image/video/audio)
• .mention setname "Name" – Set custom display name for mentions
• .mention reset          – Reset to default settings

*HELP*
• .mention guide          – Show this guide

*EXAMPLES*
• .mention mention on
• .mention set text (reply to a message)
• .mention status

_⚠️ Note: All commands require owner/sudo privileges._
`;

async function commandHandler(sock, message, args, context = {}) {
    try {
        const chatId = context.chatId || message.key?.remoteJid;
        const senderId = (context.senderId || message.key?.participant || message.key?.remoteJid || '').split(':')[0];
        const channelInfo = context.channelInfo || {};

        if (!chatId || !senderId) return;

        const reply = (text, mentions = []) =>
            sock.sendMessage(chatId, { text, mentions, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            const config = await getUserConfig(senderId);
            return reply(shortGuide(config));
        }

        const config = await getUserConfig(senderId);
        const sub = args[0].toLowerCase();

        // --- Guide command ---
        if (sub === 'guide' || sub === 'help') {
            return reply(fullGuide);
        }

        // --- On / Off (both) ---
        if (sub === 'on') {
            config.mentionEnabled = true;
            config.replyEnabled = true;
            await saveUserConfig(senderId, config);
            return reply(`✅ *Both triggers enabled*\n🤖 Mentions: ON\n💬 Replies: ON`);
        }

        if (sub === 'off') {
            config.mentionEnabled = false;
            config.replyEnabled = false;
            await saveUserConfig(senderId, config);
            return reply(`❌ *Both triggers disabled*\nNo automatic replies will be sent.`);
        }

        // --- Mention trigger toggle ---
        if (sub === 'mention') {
            if (args.length < 2) return reply('❌ *Usage:* `.mention mention on|off`');
            const action = args[1].toLowerCase();
            if (action === 'on') {
                config.mentionEnabled = true;
                await saveUserConfig(senderId, config);
                return reply(`✅ *🤖 Mention trigger enabled*\nNow the bot will reply when someone mentions you (by @, number, or name).`);
            } else if (action === 'off') {
                config.mentionEnabled = false;
                await saveUserConfig(senderId, config);
                return reply(`❌ *🤖 Mention trigger disabled*\nMentions will no longer trigger a reply.`);
            } else {
                return reply('❌ *Invalid action.* Use `on` or `off`.');
            }
        }

        // --- Reply trigger toggle ---
        if (sub === 'reply') {
            if (args.length < 2) return reply('❌ *Usage:* `.mention reply on|off`');
            const action = args[1].toLowerCase();
            if (action === 'on') {
                config.replyEnabled = true;
                await saveUserConfig(senderId, config);
                return reply(`✅ *💬 Reply trigger enabled*\nNow the bot will reply when someone replies to your messages.`);
            } else if (action === 'off') {
                config.replyEnabled = false;
                await saveUserConfig(senderId, config);
                return reply(`❌ *💬 Reply trigger disabled*\nReplies to your messages will no longer trigger a reply.`);
            } else {
                return reply('❌ *Invalid action.* Use `on` or `off`.');
            }
        }

        // --- Status ---
        if (sub === 'status') {
            let info = `*📊 MENTION STATUS*\n\n`;
            info += `🤖 *Mention trigger:* ${config.mentionEnabled ? '✅ ON' : '❌ OFF'}\n`;
            info += `💬 *Reply trigger:*   ${config.replyEnabled ? '✅ ON' : '❌ OFF'}\n`;
            info += `📦 *Reply type:* ${config.type === 'text' ? '📝 Text' : '🎨 Media'}\n`;
            if (config.type === 'text') {
                info += `📄 *Text:*\n   ${config.text}\n`;
            } else {
                info += `🖼️ *Media:* ${config.mediaPath ? '✅ Set' : '❌ Not set'}\n`;
            }
            if (config.displayName) {
                info += `🏷️ *Display name:* ${config.displayName}\n`;
            }
            return reply(info);
        }

        // --- Reset ---
        if (sub === 'reset') {
            config.mentionEnabled = false;
            config.replyEnabled = false;
            config.type = 'text';
            config.text = DEFAULT_CONFIG.text;
            config.mediaPath = null;
            config.mimetype = null;
            config.ptt = false;
            config.gifPlayback = false;
            config.displayName = null;
            await saveUserConfig(senderId, config);
            return reply(`🔄 *Reset to default*\nBoth triggers are now OFF.\nDefault text: "${config.text}"`);
        }

        // --- Set Display Name ---
        if (sub === 'setname') {
            if (args.length < 2) return reply('❌ *Usage:* `.mention setname "Your Name"`');
            const name = args.slice(1).join(' ').trim();
            if (!name) return reply('❌ *Name cannot be empty.*');
            config.displayName = name;
            await saveUserConfig(senderId, config);
            return reply(`✅ *Display name set*\nNow mentions of *"${name}"* will trigger your reply.`);
        }

        // --- Set text / media ---
        if (sub === 'set') {
            if (args.length < 2) return reply('❌ *Usage:* `.mention set text` or `.mention set media`');
            const setType = args[1].toLowerCase();
            if (setType === 'text') {
                const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                let text = '';
                if (quotedMsg?.conversation) text = quotedMsg.conversation;
                else if (quotedMsg?.extendedTextMessage?.text) text = quotedMsg.extendedTextMessage.text;
                else return reply('❌ *Please reply to a text message.*');
                if (!text.trim()) return reply('❌ *Empty text.*');
                config.type = 'text';
                config.text = text.trim();
                config.mediaPath = null;
                await saveUserConfig(senderId, config);
                return reply(`✅ *Text reply set*\n📝 *Text:* ${config.text}`);
            } else if (setType === 'media') {
                try {
                    const media = await downloadMediaFromReply(message, sock);
                    const ext = media.mediaType === 'sticker' ? 'webp' :
                                media.mediaType === 'image' ? 'jpg' :
                                media.mediaType === 'video' ? 'mp4' :
                                media.mediaType === 'audio' ? (media.mimetype.includes('ogg') ? 'ogg' : 'mp3') : 'bin';
                    const fileName = `mention_${senderId}_${Date.now()}.${ext}`;
                    const filePath = path.join(MEDIA_DIR, fileName);
                    fs.writeFileSync(filePath, media.buffer);
                    config.type = media.mediaType;
                    config.mediaPath = filePath;
                    config.mimetype = media.mimetype;
                    config.ptt = media.ptt;
                    config.gifPlayback = media.gifPlayback;
                    config.text = DEFAULT_CONFIG.text;
                    await saveUserConfig(senderId, config);
                    return reply(`✅ *Media reply set*\n🎨 Type: ${media.mediaType}\n📦 Size: ${(media.buffer.length / 1024).toFixed(2)} KB`);
                } catch (err) {
                    return reply(`❌ *Error:* ${err.message}`);
                }
            } else {
                return reply('❌ *Usage:* `.mention set text` or `.mention set media`');
            }
        }

        // Unknown command – show short guide
        return reply(shortGuide(config));
    } catch (err) {
        console.error('[Mention] commandHandler error:', err);
        const chatId = context.chatId || message.key?.remoteJid;
        if (chatId) {
            await sock.sendMessage(chatId, { text: '❌ *An error occurred while processing your command.*' }, { quoted: message });
        }
    }
}

// ----------------------------------------------------------------------
// Export
// ----------------------------------------------------------------------
module.exports = {
    command: 'mention',
    aliases: ['setmention'],
    category: 'owner',
    description: 'Configure your own mention reply with separate toggles for mentions and replies',
    ownerOnly: true,
    handler: commandHandler,
    handleMention
};
