/*****************************************************************************
 *  lib/modeCheck.js — REDXBOT302 RC12 ULTRA REWRITE
 *  Owner: JUNAID-MD↣³⁰²
 *
 *  Central mode gate. Called ONCE per message in messageHandler.js.
 *
 *  Mode matrix:
 *    public  → all users, all chats (DM + group)
 *    groups  → all users, groups only
 *    inbox   → all users, DM only
 *    private → owner + sudo only (everywhere)
 *    self    → owner only (strictest)
 *
 *  Owner + sudo ALWAYS bypass mode (checked before mode gate).
 *  Bot echoes (fromMe=true) ALWAYS bypass.
 *
 *  Group detection: ONLY remoteJid.endsWith('@g.us').
 *  Nothing else — no heuristics, no LID suffix guessing.
 *****************************************************************************/
'use strict';

const settings = require('../settings');
const { cleanJid, samePhone, lidToPhone } = require('./senderResolver');

/* ── Sync owner check (no async needed here — modeCheck is hot path) ── */
function _isOwnerSync(senderJid) {
    const ownerNum = (settings.ownerNumber || '').replace(/\D/g, '');
    if (!ownerNum) return false;
    const senderNum = cleanJid(senderJid);
    if (samePhone(senderNum, ownerNum)) return true;
    // LID cache fallback
    const resolved = lidToPhone.get(senderNum);
    if (resolved) return samePhone(cleanJid(resolved), ownerNum);
    return false;
}

async function _isSudoAsync(senderJid) {
    try {
        const { isSudo } = require('./index');
        if (await isSudo(senderJid)) return true;
        const phoneNum = cleanJid(senderJid);
        if (phoneNum && await isSudo(`${phoneNum}@s.whatsapp.net`)) return true;
    } catch {}
    return false;
}

/**
 * passesMode({ senderJid, isGroup, isFromMe?, mode? }) → Promise<boolean>
 *
 * @param {string}  params.senderJid  Resolved sender JID from resolveSender()
 * @param {boolean} params.isGroup    remoteJid.endsWith('@g.us')
 * @param {boolean} [params.isFromMe] message.key.fromMe
 * @param {string}  [params.mode]     Override — defaults to store.getBotMode()
 */
async function passesMode({ senderJid, isGroup, isFromMe = false, mode }) {
    // 1. Bot's own echoes always pass
    if (isFromMe) return true;

    // 2. Owner always passes
    if (_isOwnerSync(senderJid)) return true;

    // 3. Sudo always passes
    if (await _isSudoAsync(senderJid)) return true;

    // 4. Fetch current mode
    let currentMode = mode;
    if (!currentMode) {
        try {
            const store = require('./lightweight_store');
            currentMode = await store.getBotMode();
        } catch {
            currentMode = process.env.MODE || 'public';
        }
    }
    currentMode = (currentMode || 'public').toLowerCase().trim();

    // 5. Apply mode rule
    switch (currentMode) {
        case 'public':
            return true;                   // everyone, everywhere

        case 'groups':
            return isGroup === true;       // groups only

        case 'inbox':
            return isGroup === false;      // DM only

        case 'private':
        case 'self':
            return false;                  // owner/sudo already returned true above

        default:
            console.warn(`[modeCheck] Unknown mode "${currentMode}" — defaulting public`);
            return true;
    }
}

/** Human-readable mode label for display commands */
function modeLabel(mode) {
    const m = (mode || 'public').toLowerCase().trim();
    return {
        public:  '🌍 PUBLIC  — all users, all chats',
        groups:  '👥 GROUPS  — group chats only',
        inbox:   '📥 INBOX   — DM / private chats only',
        private: '🔒 PRIVATE — owner & sudo only',
        self:    '👑 SELF    — owner only (strictest)',
    }[m] || `❓ UNKNOWN (${m}) — treated as public`;
}

module.exports = { passesMode, modeLabel, _isOwnerSync };
