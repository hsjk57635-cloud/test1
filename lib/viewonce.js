/*****************************************************************************
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *  ADVANCED VIEW-ONCE RETRIEVER — REDXBOT302 v7.2 ULTRA                    *
 *                                                                           *
 *  FIXED v7.2:                                                              *
 *   • @lid linked device permission check (fromMe flag + sock.user.id)     *
 *   • .vv inbox now correctly delivers to sock.user.id (linked device DM)  *
 *   • .vv2 uses downloadContentFromMessage (more reliable)                  *
 *   • isSudoOrOwner respects context.isOwnerOrSudoCheck from messageHandler*
 *****************************************************************************/

'use strict';

const fs   = require('fs');
const path = require('path');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');

/* ── Config ────────────────────────────────────────────────────────────────── */
const VV_CONFIG = {
    successEmoji   : '👁️',
    processingEmoji: '⏳',
    errorEmoji     : '❌',
    dmEmoji        : '📥',

    dmSentMsg   : '📥 *View-once sent to your DM silently.*\n_No trace left in this chat._ 🤫',
    retrievedMsg: '👁️ *View-Once Retrieved!*\n\n_Powered by REDXBOT302 v7.2 ULTRA_ 🔥',
    autoCaption : '🤫 *Auto-intercepted view-once*\n\n_Someone sent this in a monitored chat_ 👁️',

    noMediaMsg    : '⚠️ *Please reply to a view-once image, video, audio, or voice note.*',
    noReplyMsg    : '❌ *Reply to a view-once message first, then use this command.*',
    notVVMsg      : '❌ *That quoted message is not a view-once.*',
    errorMsg      : '❌ *Failed to retrieve the view-once media. Please try again later.*',
    invalidOptMsg : '❌ *Invalid option.*\nUse `.vv`, `.vv inbox`, or `.vv group`',
    notAllowedMsg : '❌ *This command is for the owner and sudo users only.*',
};

/* ── Trigger storage ───────────────────────────────────────────────────────── */
const TRIGGERS_FILE = path.join(__dirname, '../data/vv_triggers.json');

function loadTriggers() {
    try { return JSON.parse(fs.readFileSync(TRIGGERS_FILE, 'utf8')); }
    catch (e) { if (e.code !== 'ENOENT') console.error('[VV] loadTriggers:', e.message); return []; }
}

function saveTriggers(list) {
    try {
        fs.mkdirSync(path.dirname(TRIGGERS_FILE), { recursive: true });
        fs.writeFileSync(TRIGGERS_FILE, JSON.stringify(list, null, 2));
        return true;
    } catch (e) { console.error('[VV] saveTriggers:', e.message); return false; }
}

/* ══════════════════════════════════════════════════════════════════
   PERMISSION HELPERS — @lid aware
   Linked devices send @lid JIDs. We must use fromMe flag and
   sock.user.id to identify them as the owner.
══════════════════════════════════════════════════════════════════ */
const SUDO_FILE = path.join(__dirname, '../data/sudo.json');

function loadSudoList() {
    try { return JSON.parse(fs.readFileSync(SUDO_FILE, 'utf8')); }
    catch { return []; }
}

function normaliseNum(jid = '') {
    return String(jid).replace(/^\+/, '').split(':')[0].split('@')[0].trim();
}

function isLidJid(jid) {
    return typeof jid === 'string' && jid.endsWith('@lid');
}

function loadSettings() {
    try {
        const s = require('../settings');
        return { ownerNumber: normaliseNum(String(s.ownerNumber || '')) };
    } catch { return { ownerNumber: '' }; }
}

function getSender(message, context = {}) {
    if (context.senderId) return context.senderId;
    const remoteJid = message.key?.remoteJid || '';
    if (remoteJid.endsWith('@g.us')) return message.key?.participant || '';
    return remoteJid;
}

/**
 * Get the correct DM JID to send the view-once to.
 *
 * IMPORTANT: When a linked device sends a command, their senderId is a @lid
 * like "79268218458117@lid". You CANNOT send a DM to a @lid JID — it will fail.
 *
 * The correct inbox for the owner/linked device is always sock.user.id
 * (the real phone number the bot is running as, e.g. @s.whatsapp.net).
 *
 * So:
 *  - If sender is a @lid   → send to sock.user.id (the owner's real number)
 *  - If sender is owner    → send to sock.user.id (same inbox)
 *  - If sender is sudo     → send to their real number
 */
function resolveInboxJid(senderJid, sock) {
    // @lid or owner → always use bot's own number (the linked device's inbox)
    if (isLidJid(senderJid)) {
        const num = normaliseNum(sock.user?.id || '');
        return num ? `${num}@s.whatsapp.net` : null;
    }
    const { ownerNumber } = loadSettings();
    const senderNum = normaliseNum(senderJid);
    // Owner → their inbox = sock.user.id number
    if (senderNum && ownerNumber && senderNum === ownerNumber) {
        const num = normaliseNum(sock.user?.id || '') || ownerNumber;
        return `${num}@s.whatsapp.net`;
    }
    // Sudo or other — use their own number
    if (senderNum) return `${senderNum}@s.whatsapp.net`;
    // Fallback
    const botNum = normaliseNum(sock.user?.id || '');
    return botNum ? `${botNum}@s.whatsapp.net` : null;
}

/**
 * isSudoOrOwner — respects:
 *  1. context.isOwnerOrSudoCheck / context.senderIsOwnerOrSudo  (from messageHandler)
 *  2. message.key.fromMe  (linked device always has this true)
 *  3. settings.ownerNumber digit match
 *  4. sock.user.id digit match
 *  5. sudo list
 */
function isSudoOrOwner(sock, senderJid, context = {}, message = null) {
    // messageHandler already computed this — trust it
    if (context?.isOwnerOrSudoCheck === true) return true;
    if (context?.senderIsOwnerOrSudo === true) return true;

    // fromMe = linked device / owner sent this
    if (message?.key?.fromMe === true) return true;

    // @lid in DM = owner's linked device
    if (isLidJid(senderJid)) {
        const botNum     = normaliseNum(sock.user?.id || '');
        const ownerNum   = loadSettings().ownerNumber;
        if (botNum && ownerNum && botNum === ownerNum) return true;
        // Even if numbers don't match perfectly — any @lid DM is owner's device
        if (botNum) return true;
    }

    const senderNum  = normaliseNum(senderJid);
    const { ownerNumber } = loadSettings();

    if (senderNum && ownerNumber && senderNum === ownerNumber) return true;

    const botNum = normaliseNum(sock.user?.id || '');
    if (botNum && senderNum === botNum) return true;

    // Sudo list
    const diskSudo = loadSudoList();
    if (diskSudo.map(s => normaliseNum(String(s))).includes(senderNum)) return true;

    if (Array.isArray(context?.sudo)) {
        if (context.sudo.map(s => normaliseNum(String(s))).includes(senderNum)) return true;
    }

    return false;
}

function safeArgs(args) {
    if (Array.isArray(args)) return args;
    if (typeof args === 'string') return args.split(' ');
    return [];
}

/* ── View-once detection ──────────────────────────────────────────────────── */
function detectViewOnce(quotedMsg) {
    if (!quotedMsg) return null;

    function extractMedia(inner) {
        if (!inner) return null;
        if (inner.imageMessage) return { mtype: 'image', msgObj: inner.imageMessage, inner };
        if (inner.videoMessage) return { mtype: 'video', msgObj: inner.videoMessage, inner };
        if (inner.audioMessage) return { mtype: 'audio', msgObj: inner.audioMessage, inner };
        return null;
    }

    const r1 = extractMedia(quotedMsg.viewOnceMessage?.message);           if (r1) return r1;
    const r2 = extractMedia(quotedMsg.viewOnceMessageV2?.message);         if (r2) return r2;
    const r3 = extractMedia(quotedMsg.viewOnceMessageV2Extension?.message); if (r3) return r3;

    if (quotedMsg.imageMessage?.viewOnce)
        return { mtype: 'image', msgObj: quotedMsg.imageMessage, inner: quotedMsg };
    if (quotedMsg.videoMessage?.viewOnce)
        return { mtype: 'video', msgObj: quotedMsg.videoMessage, inner: quotedMsg };
    if (quotedMsg.audioMessage?.viewOnce)
        return { mtype: 'audio', msgObj: quotedMsg.audioMessage, inner: quotedMsg };

    return null;
}

/* ── Download via downloadMediaMessage ────────────────────────────────────── */
async function downloadBuffer(sock, msg, inner) {
    const fakeMsg = { key: msg.key, message: inner };
    return await downloadMediaMessage(fakeMsg, 'buffer', {}, {
        logger: {
            level: 'silent',
            info: () => {}, warn: () => {}, error: () => {},
            debug: () => {}, trace: () => {},
            child: () => ({ level: 'silent', info: () => {}, warn: () => {},
                error: () => {}, debug: () => {}, trace: () => {}, child: () => ({}) }),
        },
        reuploadRequest: sock.updateMediaMessage,
    });
}

/* ── Download via downloadContentFromMessage (more reliable for recent msgs) */
async function downloadContentBuffer(msgObj, mediaType) {
    const stream = await downloadContentFromMessage(msgObj, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
}

/* ── Build content for sending ────────────────────────────────────────────── */
function buildContent(mtype, buf, msgObj, caption) {
    if (mtype === 'image') {
        return { image: buf, caption: caption || msgObj.caption || VV_CONFIG.retrievedMsg };
    }
    if (mtype === 'video') {
        return { video: buf, mimetype: 'video/mp4', caption: caption || msgObj.caption || VV_CONFIG.retrievedMsg };
    }
    if (mtype === 'audio') {
        const isPtt = msgObj?.ptt === true;
        return {
            audio   : buf,
            mimetype: msgObj?.mimetype || (isPtt ? 'audio/ogg; codecs=opus' : 'audio/mp4'),
            ptt     : isPtt,
            fileName: isPtt ? 'voice.ogg' : 'audio.mp3',
        };
    }
    return null;
}

/* ── Auto-intercept ───────────────────────────────────────────────────────── */
async function handleAutoVV(sock, msg) {
    try {
        const triggers = loadTriggers();
        if (!triggers.length) return;

        const chatId = msg.key?.remoteJid;
        if (!chatId) return;

        const body = (
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption || ''
        ).trim().toLowerCase();

        if (!triggers.some(t => body === t.toLowerCase() || body.includes(t.toLowerCase()))) return;

        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        if (!contextInfo?.quotedMessage) return;

        const detected = detectViewOnce(contextInfo.quotedMessage);
        if (!detected) return;

        const { mtype, msgObj, inner } = detected;
        const fakeMsg = { key: { remoteJid: chatId }, message: contextInfo.quotedMessage };
        const buf     = await downloadBuffer(sock, fakeMsg, inner);

        const botNum   = normaliseNum(sock.user?.id || '');
        const ownerJid = botNum ? `${botNum}@s.whatsapp.net` : null;
        if (ownerJid) {
            const content = buildContent(mtype, buf, msgObj, VV_CONFIG.autoCaption);
            if (content) await sock.sendMessage(ownerJid, content);
        }
    } catch (e) { console.error('[VV-AUTO]', e.message); }
}

/* ══════════════════════════════════════════════════════════════════
   COMMAND: .vv / .viewonce
   • .vv          → sends media to the INBOX of whoever used it
   • .vv inbox    → same (explicit)
   • .vv group    → re-sends in current group
   ⚠️  Inbox delivery uses resolveInboxJid() which correctly maps
       @lid senders → sock.user.id (the linked device's real inbox)
══════════════════════════════════════════════════════════════════ */
const vvCommand = {
    command    : 'viewonce',
    aliases    : ['vv', 'viewmedia', 'vvget'],
    category   : 'general',
    description: 'Re-send a view-once image, video, audio, or voice note.',
    usage      : '.vv [inbox|group]',

    async handler(sock, message, args, context = {}) {
        const chatId    = context.chatId || message.key.remoteJid;
        const isGroup   = chatId.endsWith('@g.us');
        const senderJid = getSender(message, context);

        const sub = (safeArgs(args)[0] || '').toLowerCase().trim();
        let targetChat, destination;

        if (sub === 'group') {
            if (!isGroup) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ *You are not in a group.*\nSending to your inbox instead.'
                }, { quoted: message });
                targetChat  = resolveInboxJid(senderJid, sock);
                destination = 'inbox';
            } else {
                targetChat  = chatId;
                destination = 'group';
            }
        } else if (sub === 'inbox' || sub === '') {
            targetChat  = resolveInboxJid(senderJid, sock);
            destination = 'inbox';
        } else {
            return await sock.sendMessage(chatId, { text: VV_CONFIG.invalidOptMsg }, { quoted: message });
        }

        if (!targetChat) {
            return await sock.sendMessage(chatId, { text: '❌ Could not resolve inbox target.' }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: VV_CONFIG.processingEmoji, key: message.key } });

        try {
            const contextInfo = message.message?.extendedTextMessage?.contextInfo;
            const quotedMsg   = contextInfo?.quotedMessage;

            if (!quotedMsg) {
                await sock.sendMessage(chatId, { react: { text: VV_CONFIG.errorEmoji, key: message.key } });
                return await sock.sendMessage(chatId, { text: VV_CONFIG.noReplyMsg }, { quoted: message });
            }

            const detected = detectViewOnce(quotedMsg);
            if (!detected) {
                await sock.sendMessage(chatId, { react: { text: VV_CONFIG.errorEmoji, key: message.key } });
                return await sock.sendMessage(chatId, { text: VV_CONFIG.noMediaMsg }, { quoted: message });
            }

            const { mtype, msgObj, inner } = detected;

            // Try downloadContentFromMessage first (newer, more reliable)
            let buffer;
            try {
                buffer = await downloadContentBuffer(msgObj, mtype);
            } catch {
                // Fallback to downloadMediaMessage
                buffer = await downloadBuffer(sock, message, inner);
            }

            const content = buildContent(mtype, buffer, msgObj);
            if (content) await sock.sendMessage(targetChat, content, { quoted: message });

            await sock.sendMessage(chatId, { react: { text: VV_CONFIG.successEmoji, key: message.key } });

        } catch (err) {
            console.error('[VIEWONCE ERROR]', err.message);
            await sock.sendMessage(chatId, { react: { text: VV_CONFIG.errorEmoji, key: message.key } });
            await sock.sendMessage(chatId, { text: VV_CONFIG.errorMsg }, { quoted: message });
        }
    }
};

/* ══════════════════════════════════════════════════════════════════
   COMMAND: .vv2
   Retrieve view-once → caller's OWN DM silently (no chat trace).
   Owner + sudo + linked devices (@lid) allowed.
══════════════════════════════════════════════════════════════════ */
const vv2Command = {
    command    : 'vv2',
    aliases    : ['vvdm', 'vvinbox'],
    category   : 'owner',
    description: 'Retrieve view-once → your DM silently (no chat trace)',
    usage      : '.vv2 — reply to a view-once',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const sender = getSender(message, context);

        if (!isSudoOrOwner(sock, sender, context, message)) {
            return await sock.sendMessage(chatId, { text: VV_CONFIG.notAllowedMsg }, { quoted: message });
        }

        const contextInfo = message.message?.extendedTextMessage?.contextInfo;
        if (!contextInfo?.quotedMessage) {
            return await sock.sendMessage(chatId, { text: '*🍁 Please reply to a view once message!*' }, { quoted: message });
        }

        const detected = detectViewOnce(contextInfo.quotedMessage);
        if (!detected) {
            return await sock.sendMessage(chatId, { text: VV_CONFIG.notVVMsg }, { quoted: message });
        }

        const { mtype, msgObj, inner } = detected;

        let buffer, mimetype = '', caption = '', isPtt = false;
        try {
            // Try downloadContentFromMessage first
            try {
                buffer = await downloadContentBuffer(msgObj, mtype);
            } catch {
                buffer = await downloadBuffer(sock, message, inner);
            }
            mimetype = mtype === 'audio' ? 'audio/mp4' : (msgObj.mimetype || (mtype === 'image' ? 'image/jpeg' : 'video/mp4'));
            caption  = msgObj.caption || '';
            isPtt    = msgObj.ptt || false;
        } catch (e) {
            console.error('[VV2 DOWNLOAD ERROR]', e.message);
            return await sock.sendMessage(chatId, { text: VV_CONFIG.errorMsg }, { quoted: message });
        }

        let messageContent = {};
        if (mtype === 'image')      messageContent = { image: buffer, caption, mimetype };
        else if (mtype === 'video') messageContent = { video: buffer, caption, mimetype };
        else if (mtype === 'audio') messageContent = { audio: buffer, mimetype, ptt: isPtt };

        // Resolve correct inbox (handles @lid → sock.user.id)
        const callerDm = resolveInboxJid(sender, sock);
        if (!callerDm) {
            return await sock.sendMessage(chatId, { text: '❌ Could not resolve inbox target.' }, { quoted: message });
        }

        try {
            await sock.sendMessage(callerDm, messageContent, { quoted: message });
        } catch (e) {
            console.error('[VV2 SEND ERROR]', e.message);
            return await sock.sendMessage(chatId, { text: VV_CONFIG.errorMsg }, { quoted: message });
        }

        await sock.sendMessage(chatId, { text: VV_CONFIG.dmSentMsg }, { quoted: message });
        await new Promise(r => setTimeout(r, 2000));
        try { await sock.sendMessage(chatId, { delete: message.key }); } catch {}
    }
};

/* ══════════════════════════════════════════════════════════════════
   COMMAND: .vvset / .vvadd
══════════════════════════════════════════════════════════════════ */
const vvSetCommand = {
    command: 'vvset', aliases: ['vvadd', 'vvtrigger'],
    category: 'owner', description: 'Add a trigger word/emoji for auto-intercept',
    usage: '.vvset <word or emoji>',

    async handler(sock, message, args, context = {}) {
        const chatId  = context.chatId || message.key.remoteJid;
        const sender  = getSender(message, context);
        if (!isSudoOrOwner(sock, sender, context, message)) {
            return await sock.sendMessage(chatId, { text: VV_CONFIG.notAllowedMsg }, { quoted: message });
        }

        const trigger = safeArgs(args).join(' ').trim();
        if (!trigger) {
            return await sock.sendMessage(chatId, {
                text: `╔══════════════════════════╗\n║   📌 *VV Trigger Setup*  ║\n╚══════════════════════════╝\n\n` +
                      `*Usage:* \`.vvset <word or emoji>\`\n\n*Examples:*\n• \`.vvset 👀\`\n• \`.vvset save\`\n• \`.vvset 🔥\`\n\n` +
                      `_When anyone replies to a view-once with your trigger word, it silently lands in the owner's DM._ 📥`
            }, { quoted: message });
        }

        const triggers = loadTriggers();
        if (triggers.some(t => t.toLowerCase() === trigger.toLowerCase())) {
            return await sock.sendMessage(chatId, { text: `✅ Trigger *"${trigger}"* is already set.` }, { quoted: message });
        }
        triggers.push(trigger);
        if (!saveTriggers(triggers)) {
            return await sock.sendMessage(chatId, { text: '❌ *Failed to save trigger.*' }, { quoted: message });
        }
        await sock.sendMessage(chatId, {
            text: `✅ *Trigger Added!*\n\n🔑 *Word/Emoji:* \`${trigger}\`\n📊 *Total:* ${triggers.length}\n\n_Reply to a view-once with this word to auto-save it to owner DM._ 🤫`
        }, { quoted: message });
    }
};

/* ── .vvremove ─────────────────────────────────────────────────────────────── */
const vvRemoveCommand = {
    command: 'vvremove', aliases: ['vvdel', 'vvunset'],
    category: 'owner', description: 'Remove a view-once trigger word',
    usage: '.vvremove <word>',

    async handler(sock, message, args, context = {}) {
        const chatId  = context.chatId || message.key.remoteJid;
        const sender  = getSender(message, context);
        if (!isSudoOrOwner(sock, sender, context, message)) {
            return await sock.sendMessage(chatId, { text: VV_CONFIG.notAllowedMsg }, { quoted: message });
        }
        const trigger = safeArgs(args).join(' ').trim();
        if (!trigger) return await sock.sendMessage(chatId, { text: '*Usage:* `.vvremove <trigger>`' }, { quoted: message });

        let triggers = loadTriggers();
        const idx = triggers.findIndex(t => t.toLowerCase() === trigger.toLowerCase());
        if (idx === -1) return await sock.sendMessage(chatId, { text: `❌ Trigger *"${trigger}"* not found.` }, { quoted: message });

        triggers.splice(idx, 1);
        saveTriggers(triggers);
        await sock.sendMessage(chatId, { text: `🗑️ Trigger *"${trigger}"* removed.\n📊 *Remaining:* ${triggers.length}` }, { quoted: message });
    }
};

/* ── .vvlist ───────────────────────────────────────────────────────────────── */
const vvListCommand = {
    command: 'vvlist', aliases: ['vvtriggers'],
    category: 'owner', description: 'List all active view-once triggers',
    usage: '.vvlist',

    async handler(sock, message, args, context = {}) {
        const chatId  = context.chatId || message.key.remoteJid;
        const sender  = getSender(message, context);
        if (!isSudoOrOwner(sock, sender, context, message)) {
            return await sock.sendMessage(chatId, { text: VV_CONFIG.notAllowedMsg }, { quoted: message });
        }
        const triggers = loadTriggers();
        if (!triggers.length) {
            return await sock.sendMessage(chatId, {
                text: `📋 *VV Triggers*\n\n_No triggers set yet._\nUse \`.vvset <word>\` to add one.`
            }, { quoted: message });
        }
        const list = triggers.map((t, i) => `  ${i + 1}. ${t}`).join('\n');
        await sock.sendMessage(chatId, {
            text: `╔════════════════════════════╗\n║  📋 *Active VV Triggers*   ║\n╚════════════════════════════╝\n\n${list}\n\n*Total:* ${triggers.length}\n\n_Reply to any view-once with these words to auto-save to owner DM._ 👁️`
        }, { quoted: message });
    }
};

/* ── Exports ──────────────────────────────────────────────────────────────── */
module.exports = [vvCommand, vv2Command, vvSetCommand, vvRemoveCommand, vvListCommand];
module.exports.handleAutoVV = handleAutoVV;
