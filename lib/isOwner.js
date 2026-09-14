'use strict';
/*****************************************************************************
 *  JUNAID-MD↣³⁰² — PERMISSION SYSTEM (Fixed v2.0)
 *
 *  Permission Tiers:
 *   1. REAL OWNER    — OWNER_NUMBER in .env (main account)
 *   2. CO-OWNER      — CO_OWNER_NUM in .env (trusted partner)
 *   3. SUDO USER     — added via .sudo add command (can use all owner cmds)
 *   4. PAIRED USER   — anyone who pairs their number = becomes co-owner level
 *                      (they can use ALL owner commands, NOT the real owner)
 *   5. REGULAR USER  — general public
 *
 *  Key rules:
 *   - fromMe = true AND session belongs to OWNER_NUMBER or CO_OWNER_NUM → owner
 *   - fromMe = true BUT session is a PAIRED USER → co-owner (can use owner cmds)
 *   - Linked device (fromMe with :N suffix) resolves to base number for checks
 *****************************************************************************/

const settings = require('../settings');
const { isSudo } = require('./index');

/**
 * Strip device suffix and @domain from any JID.
 * ":12@s.whatsapp.net" → ""
 */
function cleanJid(jid) {
    if (!jid) return '';
    return jid.split(':')[0].split('@')[0];
}

/**
 * Get owner number cleanly (no + or spaces)
 */
function getOwnerNum() {
    return cleanJid(settings.ownerNumber || process.env.OWNER_NUMBER || '');
}

/**
 * Get co-owner number cleanly
 */
function getCoOwnerNum() {
    return cleanJid(process.env.CO_OWNER_NUM || '');
}

/**
 * Check if a jid is the real owner or co-owner (NOT sudo, NOT paired users)
 * Used for strictOwnerOnly commands.
 */
function isOwnerOnly(senderId) {
    const senderClean = cleanJid(senderId);
    const ownerClean = getOwnerNum();
    const coOwnerClean = getCoOwnerNum();

    if (ownerClean && senderClean === ownerClean) return true;
    if (coOwnerClean && senderClean === coOwnerClean) return true;
    return false;
}

/**
 * Check if user is owner, co-owner, sudo, or a paired session user.
 * Paired users (anyone who connected their bot via pairing) get co-owner access.
 *
 * @param {string} senderId   - The JID of the sender
 * @param {object} [sock]     - Baileys socket (for group @lid resolution)
 * @param {string} [chatId]   - Group JID (for @lid resolution)
 * @param {boolean} [fromMe]  - message.key.fromMe
 * @param {string} [sessionId] - The session number this bot is running as
 */
async function isOwnerOrSudo(senderId, sock = null, chatId = null, fromMe = false, sessionId = null) {
    const senderClean = cleanJid(senderId);
    const ownerClean = getOwnerNum();
    const coOwnerClean = getCoOwnerNum();

    // 1. Real owner or co-owner by number match
    if (ownerClean && senderClean === ownerClean) return true;
    if (coOwnerClean && senderClean === coOwnerClean) return true;

    // 2. fromMe = true means the bot's own account sent this.
    //    If session (paired number) != owner, it's still a co-owner (paired user).
    //    Paired users get full owner-level command access.
    if (fromMe && sessionId) {
        // Any paired session can use owner commands (they ARE the user of this bot instance)
        return true;
    }

    // 3. Sudo users
    const isSudoUser = await isSudo(senderId);
    if (isSudoUser) return true;

    // 4. Linked device variant (with :N suffix stripped)
    if (senderId.includes(':')) {
        const baseJid = cleanJid(senderId) + '@s.whatsapp.net';
        const baseClean = cleanJid(baseJid);
        if (ownerClean && baseClean === ownerClean) return true;
        if (coOwnerClean && baseClean === coOwnerClean) return true;
        if (await isSudo(baseJid)) return true;
    }

    // 5. Handle @lid participants in groups (linked device IDs)
    if (sock && chatId && chatId.endsWith('@g.us') && senderId.includes('@lid')) {
        try {
            const metadata = await sock.groupMetadata(chatId);
            const participants = metadata.participants || [];
            const participant = participants.find(p => p.lid === senderId || p.id === senderId);
            if (participant) {
                const pRealClean = cleanJid(participant.id);
                if (ownerClean && pRealClean === ownerClean) return true;
                if (coOwnerClean && pRealClean === coOwnerClean) return true;
                if (await isSudo(participant.id)) return true;
            }
        } catch (_) {}
    }

    return false;
}

/**
 * Helper: get a clean display number from JID
 */
async function getCleanName(jid, sock) {
    if (!jid) return 'Unknown';
    const cleanNumber = cleanJid(jid);
    try {
        if (sock) {
            const contact = await sock.onWhatsApp(jid);
            if (contact && contact[0] && contact[0].exists) return cleanNumber;
        }
    } catch (_) {}
    return cleanNumber;
}

module.exports = isOwnerOrSudo;
module.exports.isOwnerOnly = isOwnerOnly;
module.exports.cleanJid = cleanJid;
module.exports.getCleanName = getCleanName;
module.exports.getOwnerNum = getOwnerNum;
module.exports.getCoOwnerNum = getCoOwnerNum;

// ── Extra exports required by plugins/antidelete.js ──────────────────────────

/** Check if a JID is a linked-device (LID) JID — ends with @lid */
function isLidJid(jid) {
    if (!jid) return false;
    return jid.endsWith('@lid') || jid.includes('@lid');
}
module.exports.isLidJid = isLidJid;

/** Alias of getOwnerNum — returns clean owner number (no + or spaces) */
function resolveOwnerNumber() {
    return getOwnerNum();
}
module.exports.resolveOwnerNumber = resolveOwnerNumber;
