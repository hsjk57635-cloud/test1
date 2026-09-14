/**
 * BGM Plugin — JUNAID-MD↣³⁰²  (TRIGGER FIX v2)
 * Developed by JUNAID-MD↣³⁰²
 *
 * FIXES:
 * - loadTriggers() now awaited on startup (race-condition fix)
 * - checkAndPlay() reloads cache if empty (restart-safe)
 * - fromMe messages now also fire triggers (self-bot compatible)
 * - Trigger matching is trim/lowercase-safe
 * - BGM works even when message has extra whitespace
 */

const fs   = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const store = require('../lib/lightweight_store');

const CONFIG_KEY = 'bgm_config';
const MEDIA_DIR  = path.join(process.cwd(), 'data', 'bgm_media');
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

/* ─── In-memory trigger cache ──────────────────────────────────────────── */
let triggersCache = new Map();
let configCache   = null;   // full config cache (including enabled flag)
let cacheLoadedAt = 0;
const CACHE_TTL   = 60 * 1000; // refresh every 60 s

/* ─── Config helpers ────────────────────────────────────────────────────── */
async function getConfig(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && configCache && (now - cacheLoadedAt) < CACHE_TTL) {
        return configCache;
    }
    try {
        const cfg = await store.getSetting('global', CONFIG_KEY);
        configCache  = cfg || { enabled: false, triggers: {} };
        cacheLoadedAt = now;
        return configCache;
    } catch (err) {
        console.error('[BGM] Failed to load config:', err.message);
        return configCache || { enabled: false, triggers: {} };
    }
}

async function saveConfig(config) {
    await store.saveSetting('global', CONFIG_KEY, config);
    // invalidate & rebuild
    configCache   = config;
    cacheLoadedAt = Date.now();
    triggersCache.clear();
    for (const [word, data] of Object.entries(config.triggers || {})) {
        triggersCache.set(word.toLowerCase().trim(), data);
    }
    console.log(`[BGM] Cache rebuilt — ${triggersCache.size} trigger(s).`);
}

/* ─── Load triggers (called on startup) ────────────────────────────────── */
async function loadTriggers() {
    const config = await getConfig(true);
    triggersCache.clear();
    for (const [word, data] of Object.entries(config.triggers || {})) {
        triggersCache.set(word.toLowerCase().trim(), data);
    }
    console.log(`[BGM] Loaded ${triggersCache.size} trigger(s). Enabled: ${config.enabled}`);
}

/* ─── Media download helper ─────────────────────────────────────────────── */
async function downloadMediaFromReply(message, sock) {
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) throw new Error('No quoted message found. Please reply to a media file.');

    let mediaMsg, mediaType;
    if (quotedMsg.audioMessage)    { mediaMsg = quotedMsg.audioMessage;    mediaType = 'audio';    }
    else if (quotedMsg.videoMessage)   { mediaMsg = quotedMsg.videoMessage;   mediaType = 'video';    }
    else if (quotedMsg.documentMessage){ mediaMsg = quotedMsg.documentMessage;mediaType = 'document'; }
    else if (quotedMsg.imageMessage)   { mediaMsg = quotedMsg.imageMessage;   mediaType = 'image';    }
    else throw new Error('Unsupported media type. Reply to audio, video, document, or image.');

    const stream = await downloadContentFromMessage(mediaMsg, mediaType);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer   = Buffer.concat(chunks);
    const mimetype = mediaMsg.mimetype || (
        mediaType === 'audio' ? 'audio/mpeg' :
        mediaType === 'image' ? 'image/jpeg' : 'application/octet-stream'
    );
    return { buffer, mimetype, mediaType, originalName: mediaMsg.fileName || 'media' };
}

/* ─── Audio → voice-note conversion ────────────────────────────────────── */
async function convertToVoiceNote(buffer) {
    const tag        = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const inputFile  = path.join(MEDIA_DIR, `bgm_in_${tag}.tmp`);
    const outputFile = path.join(MEDIA_DIR, `bgm_out_${tag}.opus`);
    fs.writeFileSync(inputFile, buffer);
    try {
        const bin = process.env.FFMPEG_PATH || 'ffmpeg';
        await exec(`"${bin}" -i "${inputFile}" -c:a libopus -ar 24000 -b:a 24k -ac 1 -f ogg "${outputFile}" -y`);
        return fs.readFileSync(outputFile);
    } finally {
        if (fs.existsSync(inputFile))  fs.unlinkSync(inputFile);
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    }
}

/* ─── MAIN TRIGGER CHECK (called from messageHandler for every message) ─── */
async function checkAndPlay(sock, message, text, chatId, channelInfo) {
    try {
        const config = await getConfig();
        if (!config.enabled) return false;

        // Reload cache if empty (e.g. after process restart)
        if (triggersCache.size === 0 && Object.keys(config.triggers || {}).length > 0) {
            await loadTriggers();
        }
        if (triggersCache.size === 0) return false;

        const word = (text || '').trim().toLowerCase();
        if (!word) return false;

        const trigger = triggersCache.get(word);
        if (!trigger) return false;

        const filePath = trigger.filePath;
        if (!fs.existsSync(filePath)) {
            console.error(`[BGM] File missing for trigger "${word}" at ${filePath}`);
            return false;
        }

        const fileBuffer = fs.readFileSync(filePath);
        const { mediaType, mimetype, originalName } = trigger;

        let content = {};
        if (mediaType === 'audio') {
            try {
                const voiceBuffer = await convertToVoiceNote(fileBuffer);
                content = { audio: voiceBuffer, mimetype: 'audio/ogg; codecs=opus', ptt: true };
            } catch {
                // fallback: send as regular audio
                content = { audio: fileBuffer, mimetype };
            }
        } else if (mediaType === 'image') {
            content = { image: fileBuffer, caption: `🎵 ${word}` };
        } else if (mediaType === 'video') {
            content = { video: fileBuffer, caption: `🎵 ${word}` };
        } else if (mediaType === 'document') {
            content = { document: fileBuffer, mimetype, fileName: originalName || 'document' };
        } else {
            return false;
        }

        await sock.sendMessage(chatId, { ...content, ...(channelInfo || {}) }, { quoted: message });
        return true;
    } catch (err) {
        console.error(`[BGM] checkAndPlay error:`, err.message);
        return false;
    }
}

/* ─── Command handler ───────────────────────────────────────────────────── */
module.exports = {
    command: 'bgm',
    aliases: ['background'],
    category: 'owner',
    description: 'Set media as a response to a trigger word (owner/sudo only)',
    usage: `
  .bgm on              — Enable BGM
  .bgm off             — Disable BGM
  .bgm set <word>      — Reply to media to set trigger
  .bgm list            — List all triggers
  .bgm remove <word>   — Remove a trigger
  .bgm clear           — Remove ALL triggers
  .bgm test <word>     — Test if trigger is set
  .bgm guide           — Show this guide
    `,
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId     = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        const reply = (text) =>
            sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (!args.length) return reply(module.exports.usage);

        const config = await getConfig(true);
        const sub    = args[0].toLowerCase();

        if (sub === 'on') {
            config.enabled = true;
            await saveConfig(config);
            return reply(`✅ BGM enabled! You have *${Object.keys(config.triggers || {}).length}* trigger(s).\nSend the trigger word (without any prefix) to play media.`);
        }

        if (sub === 'off') {
            config.enabled = false;
            await saveConfig(config);
            return reply('❌ BGM disabled.');
        }

        if (sub === 'list') {
            const triggers = Object.keys(config.triggers || {});
            if (!triggers.length) return reply('📭 No triggers set yet.\nUse `.bgm set <word>` replying to media.');
            return reply(`🔊 *Active Triggers (${triggers.length}):*\n${triggers.map((t, i) => `${i+1}. \`${t}\``).join('\n')}`);
        }

        if (sub === 'clear') {
            const count = Object.keys(config.triggers || {}).length;
            for (const t of Object.values(config.triggers || {})) {
                if (t.filePath && fs.existsSync(t.filePath)) fs.unlinkSync(t.filePath);
            }
            config.triggers = {};
            await saveConfig(config);
            return reply(`🗑️ Cleared *${count}* trigger(s).`);
        }

        if (sub === 'remove') {
            if (args.length < 2) return reply('❌ Usage: `.bgm remove <word>`');
            const word    = args.slice(1).join(' ').trim().toLowerCase();
            const trigger = config.triggers?.[word];
            if (!trigger) return reply(`❌ Trigger "${word}" not found.`);
            if (trigger.filePath && fs.existsSync(trigger.filePath)) fs.unlinkSync(trigger.filePath);
            delete config.triggers[word];
            await saveConfig(config);
            return reply(`✅ Trigger "${word}" removed.`);
        }

        if (sub === 'test') {
            if (args.length < 2) return reply('❌ Usage: `.bgm test <word>`');
            const word = args.slice(1).join(' ').trim().toLowerCase();
            const t    = config.triggers?.[word];
            if (!t) return reply(`❌ No trigger for "${word}".`);
            const exists = fs.existsSync(t.filePath);
            return reply(`✅ Trigger "${word}" exists.\nType: ${t.mediaType} | File: ${exists ? '✅ found' : '❌ MISSING!'}`);
        }

        if (sub === 'guide') {
            return reply(module.exports.usage);
        }

        if (sub === 'set') {
            if (args.length < 2) return reply('❌ Usage: `.bgm set <word>` — reply to audio/video/image/document');
            const word = args.slice(1).join(' ').trim().toLowerCase();
            if (!word) return reply('❌ Word cannot be empty.');

            let media;
            try { media = await downloadMediaFromReply(message, sock); }
            catch (err) { return reply(`❌ ${err.message}`); }

            const safeWord  = word.replace(/[^a-z0-9]/gi, '_');
            const ext       = path.extname(media.originalName) ||
                              (media.mediaType === 'audio' ? '.mp3' : media.mediaType === 'image' ? '.jpg' : '.bin');
            const fileName  = `${safeWord}_${Date.now()}${ext}`;
            const filePath  = path.join(MEDIA_DIR, fileName);

            // Remove old file if trigger already existed
            const old = config.triggers?.[word];
            if (old?.filePath && fs.existsSync(old.filePath)) fs.unlinkSync(old.filePath);

            fs.writeFileSync(filePath, media.buffer);

            if (!config.triggers) config.triggers = {};
            config.triggers[word] = {
                filePath,
                mediaType:    media.mediaType,
                mimetype:     media.mimetype,
                originalName: media.originalName,
                setBy:        (context.senderId || '').split(':')[0],
                timestamp:    new Date().toISOString()
            };
            await saveConfig(config);
            return reply(`✅ Trigger *"${word}"* set!\n\nNow send the word *${word}* (without any prefix) and the bot will play this ${media.mediaType}.\n\nMake sure BGM is enabled: \`.bgm on\``);
        }

        return reply('❌ Unknown sub-command. Send `.bgm guide` for help.');
    },

    checkAndPlay,
    loadTriggers
};
