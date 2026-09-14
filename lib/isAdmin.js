'use strict';

/**
 * Normalize any JID form to a bare number:
 *   ":17@s.whatsapp.net" → ""
 *   "120363408055942569@lid"       → "120363408055942569"
 *   ""                   → ""
 */
function norm(jid) {
    if (!jid) return '';
    return String(jid).split('@')[0].split(':')[0];
}

/**
 * Determine whether the BOT and the SENDER are admins in a group.
 *
 * @param {object} sock      Baileys socket
 * @param {string} chatId    group jid (e.g. "1203...@g.us")
 * @param {string} senderId  sender jid (may contain device suffix or @lid)
 * @param {object} [meta]    optional pre-fetched group metadata — avoids a
 *                           network call when the caller already has it
 * @returns {Promise<{isSenderAdmin: boolean, isBotAdmin: boolean}>}
 */
async function isAdmin(sock, chatId, senderId, meta) {
    try {
        const metadata = meta || await sock.groupMetadata(chatId);
        const participants = metadata.participants || [];

        const botId     = sock.user?.id || '';
        const botLid    = sock.user?.lid || '';
        const botIdNorm = norm(botId);
        const botLidNorm = norm(botLid);
        const senderNorm = norm(senderId);

        const isBotAdmin = participants.some(p => {
            const admin = p.admin === 'admin' || p.admin === 'superadmin';
            if (!admin) return false;
            const pIdNorm  = norm(p.id);
            const pLidNorm = norm(p.lid);
            const pPnNorm  = norm(p.phoneNumber);
            return (botIdNorm && (botIdNorm === pIdNorm || botIdNorm === pLidNorm || (pPnNorm && botIdNorm === pPnNorm)))
                || (botLidNorm && (botLidNorm === pIdNorm || botLidNorm === pLidNorm));
        });

        const isSenderAdmin = participants.some(p => {
            const admin = p.admin === 'admin' || p.admin === 'superadmin';
            if (!admin) return false;
            const pIdNorm  = norm(p.id);
            const pLidNorm = norm(p.lid);
            const pPnNorm  = norm(p.phoneNumber);
            return !!senderNorm && (senderNorm === pIdNorm || senderNorm === pLidNorm || (pPnNorm && senderNorm === pPnNorm));
        });

        return { isSenderAdmin, isBotAdmin };
    } catch (err) {
        console.error('❌ Error in isAdmin:', err);
        return { isSenderAdmin: false, isBotAdmin: false };
    }
}

module.exports = isAdmin;
module.exports.norm = norm;
