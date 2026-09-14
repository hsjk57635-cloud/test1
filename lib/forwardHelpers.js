  /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const store = require('./lightweight_store');
const { printLog } = require('./print');
const isAdmin = require('./isAdmin');
const isOwnerOrSudo = require('./isOwner');

// ✅ Must match the key used in plugins/autoforward.js
const AUTO_FORWARD_KEY = 'auto_forward_config';

async function getAutoForwardRules() {
    try {
        const rules = await store.getSetting('global', AUTO_FORWARD_KEY);
        printLog('debug', `[AUTO-FWD] Raw rules from store: ${JSON.stringify(rules)}`);
        return Array.isArray(rules) ? rules : [];
    } catch (e) {
        printLog('error', `[AUTO-FWD] Failed to load rules: ${e.message}`);
        return [];
    }
}

async function shouldForward(sock, message, mode, isGroup, senderId) {
    if (mode === 'all') return true;

    if (mode === 'owner') {
        if (message.key.fromMe) return true;
        const isOwner = await isOwnerOrSudo(senderId, sock, message.key.remoteJid);
        return isOwner;
    }

    if (mode === 'others') {
        if (message.key.fromMe) return false;
        const isOwner = await isOwnerOrSudo(senderId, sock, message.key.remoteJid);
        return !isOwner;
    }

    if (mode === 'admin') {
        if (!isGroup) return false;
        const { isSenderAdmin } = await isAdmin(sock, message.key.remoteJid, senderId);
        return isSenderAdmin;
    }

    return false;
}

async function forwardMessage(sock, originalMessage, destJid) {
    const msg = originalMessage.message;
    if (!msg) {
        printLog('warn', '[AUTO-FWD] No message content to forward');
        return;
    }

    let forwardedMsg = msg;
    if (msg.viewOnceMessageV2) forwardedMsg = msg.viewOnceMessageV2.message;
    else if (msg.viewOnceMessage) forwardedMsg = msg.viewOnceMessage.message;

    const mType = Object.keys(forwardedMsg).find(k => k.endsWith('Message') || k === 'conversation');
    if (!mType) {
        printLog('warn', `[AUTO-FWD] Unknown message type: ${Object.keys(forwardedMsg)}`);
        return;
    }

    try {
        let content = {};

        if (mType === 'conversation') {
            content.text = forwardedMsg.conversation;
        } else if (mType === 'extendedTextMessage') {
            content.text = forwardedMsg.extendedTextMessage.text;
        } else if (mType === 'imageMessage') {
            const buffer = await downloadMediaMessage(originalMessage, 'buffer', {});
            content.image = buffer;
            content.caption = forwardedMsg.imageMessage.caption || '';
        } else if (mType === 'videoMessage') {
            const buffer = await downloadMediaMessage(originalMessage, 'buffer', {});
            content.video = buffer;
            content.caption = forwardedMsg.videoMessage.caption || '';
        } else if (mType === 'audioMessage') {
            const buffer = await downloadMediaMessage(originalMessage, 'buffer', {});
            content.audio = buffer;
            content.mimetype = forwardedMsg.audioMessage.mimetype;
            content.ptt = forwardedMsg.audioMessage.ptt;
        } else if (mType === 'documentMessage') {
            const buffer = await downloadMediaMessage(originalMessage, 'buffer', {});
            content.document = buffer;
            content.mimetype = forwardedMsg.documentMessage.mimetype;
            content.fileName = forwardedMsg.documentMessage.fileName || 'document';
        } else if (mType === 'stickerMessage') {
            const buffer = await downloadMediaMessage(originalMessage, 'buffer', {});
            content.sticker = buffer;
        } else {
            printLog('warn', `[AUTO-FWD] Unsupported type: ${mType}`);
            return;
        }

        await sock.sendMessage(destJid, content);
        printLog('success', `[AUTO-FWD] ✅ Message forwarded to ${destJid}`);
    } catch (err) {
        printLog('error', `[AUTO-FWD] ❌ Forward error: ${err.message}`);
    }
}

module.exports = { getAutoForwardRules, shouldForward, forwardMessage };                                          
