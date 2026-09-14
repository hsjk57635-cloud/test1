/*****************************************************************************
 *  lib/permissionMiddleware.js — REDXBOT302 RC12 ULTRA
 *  Owner: JUNAID-MD↣³⁰²
 *
 *  Central permission gate for all plugin commands.
 *  Plugins declare flags; middleware enforces everything.
 *  Plugins contain ZERO permission logic.
 *
 *  Plugin flags (set in plugin export object):
 *    ownerOnly     — only owner or sudo can run
 *    strictOwner   — only exact owner (no sudo)
 *    sudoOnly      — sudo or owner
 *    adminOnly     — group admin (or bot must be admin)
 *    groupOnly     — must be in a group
 *    privateOnly   — must be in a DM
 *    publicAllowed — true by default; set false to disable for non-auth users
 *
 *  checkPermission(command, context) → Promise<{ allowed, reason }>
 *
 *  context shape (built in messageHandler):
 *    { senderId, isGroup, isFromMe, senderIsOwnerOrSudo,
 *      isSenderAdmin, isBotAdmin, sock, chatId, message }
 *****************************************************************************/
'use strict';

const { isOwnerOnly } = require('./isOwner');

/**
 * @param {object} command  Plugin command export (has permission flags)
 * @param {object} ctx      Message context from messageHandler
 * @returns {Promise<{ allowed: boolean, reason: string }>}
 */
async function checkPermission(command, ctx) {
    const {
        senderId,
        isGroup,
        isFromMe,
        senderIsOwnerOrSudo,
        isSenderAdmin,
        isBotAdmin,
    } = ctx;

    // ── strictOwner — exact owner only, no sudo ────────────────────────────
    if (command.strictOwner || command.strictOwnerOnly) {
        const ok = isOwnerOnly(senderId, isFromMe);
        if (!ok) return { allowed: false, reason: '❌ Owner only command.' };
    }

    // ── ownerOnly — owner or sudo ──────────────────────────────────────────
    if (command.ownerOnly && !senderIsOwnerOrSudo) {
        return { allowed: false, reason: '❌ Owner or sudo only.' };
    }

    // ── sudoOnly — sudo or owner ───────────────────────────────────────────
    if (command.sudoOnly && !senderIsOwnerOrSudo) {
        return { allowed: false, reason: '❌ Sudo or owner only.' };
    }

    // ── groupOnly — must be in a group ────────────────────────────────────
    if (command.groupOnly && !isGroup) {
        return { allowed: false, reason: '⚠️ This command only works in groups.' };
    }

    // ── privateOnly — must be in a DM ─────────────────────────────────────
    if (command.privateOnly && isGroup) {
        return { allowed: false, reason: '⚠️ This command only works in private chats.' };
    }

    // ── adminOnly — sender must be group admin; bot must be admin ─────────
    if (command.adminOnly && isGroup) {
        if (!isBotAdmin) {
            return { allowed: false, reason: '❌ Make the bot an admin first.' };
        }
        if (!isSenderAdmin && !senderIsOwnerOrSudo) {
            return { allowed: false, reason: '❌ Group admins only.' };
        }
    }

    return { allowed: true, reason: '' };
}

module.exports = { checkPermission };
