/*****************************************************************************
 *  antibot.js — ULTRA v3  (JUNAID-MD↣³⁰²)
 *  Developed by JUNAID-MD↣³⁰²
 *
 *  ULTRA features:
 *  - Reply to any message → .antibot add → registers that sender as known bot
 *  - Per-group known-bot JID registry (persistent)
 *  - Pattern-based auto-detection (prefixes, box formatting, signatures)
 *  - Sensitivity levels: low / medium / high
 *  - Modes: warn | kick | delete | mute
 *  - Whitelist (exempt specific JIDs)
 *  - Per-group warning counters
 *  - safeSend (rate-overlimit safe)
 *  - isBotAdmin checked before kick/delete
 *****************************************************************************/

'use strict';

const store        = require('../lib/lightweight_store');
const isOwnerOrSudo = require('../lib/isOwner');
const isAdmin      = require('../lib/isAdmin');

/* ─── Default config per group ────────────────────────────────────────────── */
const DEFAULT_CONFIG = {
    enabled:        false,
    mode:           'warn',      // warn | kick | delete | mute
    maxWarnings:    3,
    sensitivity:    'medium',    // low | medium | high
    patternDetect:  true,        // pattern-based auto-detection
    knownBots:      [],          // JIDs registered as bots in this group
    whitelist:      [],          // JIDs exempt from antibot
};

/* ─── In-memory state ─────────────────────────────────────────────────────── */
const warnCount  = new Map();   // `${chatId}:${jid}` → number
const lastAction = new Map();   // chatId → timestamp  (rate gate)
const ACTION_CD  = 2000;        // ms between actions per group

/* ─── Config cache (10s TTL) — avoids a file/DB read on EVERY group message ── */
const cfgCache = new Map();     // chatId → { cfg, ts }
const CFG_TTL  = 10000;

/* ─── Store helpers ───────────────────────────────────────────────────────── */
async function readConfig(chatId) {
    try {
        const cached = cfgCache.get(chatId);
        if (cached && Date.now() - cached.ts < CFG_TTL) return cached.cfg;
        const c = await store.getSetting(chatId, 'antibot_v3');
        const cfg = c ? { ...DEFAULT_CONFIG, ...c } : { ...DEFAULT_CONFIG };
        cfgCache.set(chatId, { cfg, ts: Date.now() });
        return cfg;
    } catch { return { ...DEFAULT_CONFIG }; }
}
async function writeConfig(chatId, cfg) {
    cfgCache.set(chatId, { cfg, ts: Date.now() });
    try { await store.saveSetting(chatId, 'antibot_v3', cfg); }
    catch (e) { console.error('[ANTIBOT] write:', e.message); }
}

/* ─── Safe send (swallows rate-overlimit) ─────────────────────────────────── */
async function safeSend(sock, chatId, content, opts = {}) {
    try { await sock.sendMessage(chatId, content, opts); }
    catch (e) {
        if (!e.message?.includes('rate-overlimit'))
            console.error('[ANTIBOT] send err:', e.message);
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  DETECTION ENGINE
 * ══════════════════════════════════════════════════════════════════════════ */

/* ── Known bot command prefixes ────────────────────────────────────────────── */
const BOT_PREFIXES_RE = /^[!\/\$\?#%&*+=~`|\\<>][a-zA-Z]/;

/* ── Signature patterns (high confidence) ─────────────────────────────────── */
const HIGH_CONF = [
    /╔[═─]+╗|╚[═─]+╝/,                         // box drawing
    /┌[─]+┐|└[─]+┘/,                            // thin box drawing
    /\*\[MENU\]\*|\*\[HELP\]\*|\*\[BOT\]\*/i,    // menu headers
    /\bpowered\s+by\b/i,                         // "powered by XYZ" (any framing, not just "...bot")
    /\bbot\s+version\b|\bv\d+\.\d+.*bot\b/i,    // bot version strings
    /^\s*「.*」\s*$/m,                           // Japanese bracket formatting
    /📌\s*\*.*\*\s*📌/,                          // pinned-style bot headers
    /━+|▬+|⬛+|🔲+/,                             // bot dividers (3+ consecutive)
    // ── "-MD" family: the overwhelming majority of forked WA bots (Jawad-MD,
    // Techno-MD, Raganork-MD, Queen-MD, Levanter-MD, etc.) brand themselves
    // as "<name>-MD" / "<name> MD" / "<NAME>MD" in menus, footers and replies.
    /\b[a-z][\w]{2,20}[-\s]?md\b/i,
    /\bdon'?t\s+(use|remove|delete|edit)\s+(other\s+)?bots?\b/i, // "don't use other bots" credit lines
    /\bcredits?\s*[:：]|\bcredit\s*to\b/i,       // "credit:" / "credit to" footers
    /\bsudo\s*(mode|command|list)?\b.*\bowner\b/i, // "sudo ... owner" style status lines
    /\bprefix\s*[:：]\s*[^\s]{1,3}\b/i,          // "prefix: ." style bot status/menu output
];

/* ── Medium confidence patterns ────────────────────────────────────────────── */
const MED_CONF = [
    /^\s*[^\w\s]{2,}\s*\*/m,                    // starts with emoji/symbols then bold
    /\*[A-Z\s]{5,}\*/,                          // ALL CAPS bold header
    /(?:🤖|👾|⚙️|🔧)\s*(?:BOT|CMD|MENU)/i,      // bot-indicator emoji + keyword
    /_{3,}|-{5,}|={5,}/,                        // long underline/dash separators
    /\[✅\]|\[❌\]|\[⚠️\]/,                     // checkbox-style bot output
];

/* ── Low confidence (only fires at high sensitivity) ──────────────────────── */
const LOW_CONF = [
    /^\s*[•●○◆◇▶►]\s+\S/m,                     // bulleted list (bots love these)
    /\d{1,2}[.)]\s+\w.*\n\d{1,2}[.)]/s,        // numbered list with newlines
    /_{2,}|\*{2,}/,                             // double underscore / bold formatting
];

/* ── Sensitivity thresholds (score needed to flag) ────────────────────────── */
const THRESHOLDS = { low: 3, medium: 2, high: 1 };

/**
 * Score a message for bot likelihood.
 * Returns { isBot, score, reason }
 */
function scoreMessage(text, sensitivity = 'medium') {
    if (!text || text.length < 3) return { isBot: false, score: 0 };

    let score = 0;
    let reason = '';

    // Command prefix (instant flag regardless of sensitivity)
    if (BOT_PREFIXES_RE.test(text)) {
        return { isBot: true, score: 10, reason: 'bot command prefix' };
    }

    // High confidence
    for (const p of HIGH_CONF) {
        if (p.test(text)) { score += 2; reason = reason || 'bot signature'; }
    }

    // Medium confidence
    if (sensitivity !== 'low') {
        for (const p of MED_CONF) {
            if (p.test(text)) { score += 1; reason = reason || 'bot formatting'; }
        }
    }

    // Low confidence (high sensitivity only)
    if (sensitivity === 'high') {
        for (const p of LOW_CONF) {
            if (p.test(text)) { score += 1; reason = reason || 'bot-like formatting'; }
        }
    }

    const threshold = THRESHOLDS[sensitivity] ?? 2;
    return { isBot: score >= threshold, score, reason };
}

/* ── Extract quoted message sender ───────────────────────────────────────────
 *  When admin replies to a bot message, we pull the sender from contextInfo.
 */
function getQuotedSender(message) {
    const ctx = message.message?.extendedTextMessage?.contextInfo ||
                message.message?.imageMessage?.contextInfo ||
                message.message?.videoMessage?.contextInfo ||
                message.message?.documentMessage?.contextInfo;
    if (!ctx) return null;
    return ctx.participant || ctx.remoteJid || null;
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  MAIN DETECTION HANDLER (called from messageHandler for every group msg)
 * ══════════════════════════════════════════════════════════════════════════ */
async function handleAntibotCheck(sock, message, chatId, senderId, meta) {
    try {
        const config = await readConfig(chatId);
        if (!config.enabled) return;
        if (!chatId.endsWith('@g.us')) return;

        // Exempt owner / sudo
        let isOwnerSudo = false;
        try { isOwnerSudo = await isOwnerOrSudo(senderId, sock, chatId); } catch {}
        if (isOwnerSudo) return;

        // Exempt bot itself
        const botIdClean = sock.user?.id?.split(':')[0];
        if (botIdClean && senderId.includes(botIdClean)) return;

        // Exempt whitelisted JIDs
        if (config.whitelist?.includes(senderId)) return;

        // Admin/bot-admin check (uses cached group metadata when available)
        let isBotAdmin = false, isSenderAdmin = false;
        try {
            const res = await isAdmin(sock, chatId, senderId, meta);
            isBotAdmin    = res.isBotAdmin;
            isSenderAdmin = res.isSenderAdmin;
        } catch {}
        if (isSenderAdmin) return;

        /* ── REGISTERED BOT JID check (always fires if listed) ─────────── */
        const senderNum = senderId.split('@')[0];
        const isRegistered = config.knownBots?.some(b =>
            b === senderId || b === senderNum
        );

        /* ── PATTERN DETECTION check ────────────────────────────────────── */
        let patternHit = false;
        let detectionReason = '';

        if (!isRegistered && config.patternDetect) {
            const text =
                message.message?.conversation ||
                message.message?.extendedTextMessage?.text ||
                message.message?.imageMessage?.caption ||
                message.message?.videoMessage?.caption || '';

            if (text) {
                const { isBot, reason } = scoreMessage(text, config.sensitivity || 'medium');
                patternHit = isBot;
                detectionReason = reason;
            }
        }

        if (!isRegistered && !patternHit) return;

        /* ── Per-group cooldown ──────────────────────────────────────────── */
        const now = Date.now();
        if (now - (lastAction.get(chatId) || 0) < ACTION_CD) return;
        lastAction.set(chatId, now);

        const warningKey  = `${chatId}:${senderId}`;
        const warns       = (warnCount.get(warningKey) || 0) + 1;
        warnCount.set(warningKey, warns);
        const max         = config.maxWarnings || 3;
        const label       = isRegistered ? '📋 Registered bot' : `🔍 Auto-detected (${detectionReason})`;

        /* ── Delete message (needs bot admin) ───────────────────────────── */
        if (isBotAdmin) {
            try {
                await sock.sendMessage(chatId, {
                    delete: {
                        remoteJid:   chatId,
                        fromMe:      false,
                        id:          message.key.id,
                        participant: message.key.participant || senderId,
                    }
                });
            } catch {}
        }

        /* ── React ──────────────────────────────────────────────────────── */
        try { await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } }); } catch {}

        /* ── Modes ──────────────────────────────────────────────────────── */
        const BRAND = '🚫 Only *JUNAID-MD↣³⁰²* is allowed in this group. Other bots are not permitted here.';

        if (config.mode === 'delete') {
            // ✅ FIX: this used to be completely silent — the message got
            // deleted but nobody in the group ever saw why. Now it still
            // deletes, but also drops one branded line so admins/members
            // know an outside bot got wiped.
            await safeSend(sock, chatId, {
                text: `🗑️ *Message deleted* — 🤖 @${senderNum} (${label})\n${BRAND}`,
                mentions: [senderId]
            });
            return;
        }

        if (config.mode === 'mute') {
            if (isBotAdmin) {
                try { await sock.groupParticipantsUpdate(chatId, [senderId], 'restrict'); } catch {}
            }
            await safeSend(sock, chatId, {
                text: `🤖 @${senderNum} — Bot detected (${label}). Muted.\n${BRAND}\n_Use .antibot whitelist add to exempt._`,
                mentions: [senderId]
            });
            return;
        }

        if (config.mode === 'kick' || warns >= max) {
            warnCount.set(warningKey, 0);
            if (isBotAdmin) {
                try { await sock.groupParticipantsUpdate(chatId, [senderId], 'remove'); } catch {}
                await safeSend(sock, chatId, {
                    text: `🤖❌ @${senderNum} removed — Bot detected (${label}). (${warns}/${max} warnings)\n${BRAND}`,
                    mentions: [senderId]
                });
            } else {
                await safeSend(sock, chatId, {
                    text: `⚠️ Bot @${senderNum} detected but bot needs admin rights to remove them. (${label})\n${BRAND}`,
                    mentions: [senderId]
                });
            }
            return;
        }

        // Warn mode
        await safeSend(sock, chatId, {
            text: `⚠️ *Antibot Warning ${warns}/${max}*\n\n` +
                  `🤖 @${senderNum} appears to be a bot!\n` +
                  `${label}\n\n` +
                  `${BRAND}\n\n` +
                  `_${max - warns} more warning(s) before action._`,
            mentions: [senderId]
        });

    } catch (e) {
        console.error('[ANTIBOT] handler error:', e.message);
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  COMMAND HANDLER
 * ══════════════════════════════════════════════════════════════════════════ */
module.exports = {
    command:     'antibot',
    aliases:     ['abot', 'nobot', 'botblock'],
    category:    'admin',
    description: 'Ultra bot detector — reply to add, pattern detection, warn/kick/mute',
    usage:       '.antibot <on|off|status|add|remove|list|mode|max|sensitivity|patterns|whitelist|reset>',
    groupOnly:   true,
    adminOnly:   true,

    async handler(sock, message, args, context = {}) {
        const chatId  = context.chatId || message.key.remoteJid;
        const config  = await readConfig(chatId);
        const action  = args[0]?.toLowerCase();

        const reply = (text) => safeSend(sock, chatId, { text }, { quoted: message });

        // ✅ Guard: admin commands need a group admin AND the bot must be admin
        // (context.isBotAdmin/isSenderAdmin are computed by the message handler)
        if (chatId.endsWith('@g.us')) {
            if (context.isBotAdmin === false)
                return reply('❌ *Please make the bot an admin first.*');
            if (!context.isSenderAdmin && !context.senderIsOwnerOrSudo)
                return reply('❌ *Group admins only.*');
        }

        /* ── STATUS ───────────────────────────────────────────────────────── */
        if (!action || action === 'status') {
            return reply(
                `╔═══════════════════════╗\n` +
                `║  🤖 ANTIBOT ULTRA v3  ║\n` +
                `╚═══════════════════════╝\n\n` +
                `*Status:*       ${config.enabled ? '✅ ON' : '❌ OFF'}\n` +
                `*Mode:*         ${(config.mode || 'warn').toUpperCase()}\n` +
                `*Max Warns:*    ${config.maxWarnings}\n` +
                `*Sensitivity:*  ${config.sensitivity || 'medium'}\n` +
                `*Pattern Det:*  ${config.patternDetect ? '✅' : '❌'}\n` +
                `*Known Bots:*   ${config.knownBots?.length || 0} registered\n` +
                `*Whitelist:*    ${config.whitelist?.length || 0} exempt\n\n` +
                `*Commands:*\n` +
                `• \`.antibot on/off\`\n` +
                `• \`.antibot add\` — reply to bot msg to register it\n` +
                `• \`.antibot add <number>\` — add by number\n` +
                `• \`.antibot remove <number>\` — remove\n` +
                `• \`.antibot list\` — show registered bots\n` +
                `• \`.antibot mode warn|kick|delete|mute\`\n` +
                `• \`.antibot max <n>\` — warn limit\n` +
                `• \`.antibot sensitivity low|medium|high\`\n` +
                `• \`.antibot patterns on|off\` — auto-detection\n` +
                `• \`.antibot whitelist add|remove|list <number>\`\n` +
                `• \`.antibot reset\``
            );
        }

        /* ── ON / OFF ─────────────────────────────────────────────────────── */
        if (action === 'on') {
            config.enabled = true;
            await writeConfig(chatId, config);
            return reply(`✅ *Antibot ENABLED*\nMode: ${config.mode} | Sensitivity: ${config.sensitivity}`);
        }
        if (action === 'off') {
            config.enabled = false;
            await writeConfig(chatId, config);
            return reply('❌ *Antibot disabled.*');
        }

        /* ── ADD BOT ──────────────────────────────────────────────────────── */
        if (action === 'add') {
            if (!config.knownBots) config.knownBots = [];

            // Priority 1: reply to a bot message
            const quotedSender = getQuotedSender(message);
            if (quotedSender) {
                const num = quotedSender.split('@')[0];
                const jid = `${num}@s.whatsapp.net`;
                if (!config.knownBots.includes(jid)) {
                    config.knownBots.push(jid);
                    await writeConfig(chatId, config);
                    return reply(
                        `✅ *Bot registered!*\n\n` +
                        `📋 JID: \`${jid}\`\n` +
                        `Total registered: ${config.knownBots.length}\n\n` +
                        `_This sender will now be flagged in this group._`
                    );
                }
                return reply(`ℹ️ \`${jid}\` already in bot list.`);
            }

            // Priority 2: add by number arg
            const numArg = args[1]?.replace(/\D/g, '');
            if (numArg) {
                const jid = `${numArg}@s.whatsapp.net`;
                if (!config.knownBots.includes(jid)) {
                    config.knownBots.push(jid);
                    await writeConfig(chatId, config);
                    return reply(`✅ Added \`${jid}\` to bot registry.`);
                }
                return reply(`ℹ️ Already registered.`);
            }

            return reply(
                `❌ To add a bot:\n\n` +
                `*Method 1:* Reply to the bot's message, then type \`.antibot add\`\n` +
                `*Method 2:* \`.antibot add <number>\` e.g. \`.antibot add \``
            );
        }

        /* ── REMOVE BOT ───────────────────────────────────────────────────── */
        if (action === 'remove') {
            if (!config.knownBots) config.knownBots = [];
            const numArg = args[1]?.replace(/\D/g, '');

            // Also support replying to remove
            const quotedSender = getQuotedSender(message);
            const target = numArg
                ? `${numArg}@s.whatsapp.net`
                : quotedSender ? `${quotedSender.split('@')[0]}@s.whatsapp.net` : null;

            if (!target) return reply('❌ Reply to a message or provide a number: `.antibot remove <number>`');

            const before = config.knownBots.length;
            config.knownBots = config.knownBots.filter(b => b !== target && b !== target.split('@')[0]);
            if (config.knownBots.length < before) {
                await writeConfig(chatId, config);
                return reply(`✅ Removed \`${target}\` from bot registry.`);
            }
            return reply(`ℹ️ \`${target}\` was not in the bot list.`);
        }

        /* ── LIST ─────────────────────────────────────────────────────────── */
        if (action === 'list') {
            if (!config.knownBots?.length) return reply('📭 No bots registered in this group.');
            const lines = config.knownBots.map((j, i) => `${i + 1}. +${j.split('@')[0]}`).join('\n');
            return reply(`📋 *Registered Bots (${config.knownBots.length}):*\n\n${lines}`);
        }

        /* ── MODE ─────────────────────────────────────────────────────────── */
        if (action === 'mode') {
            const m = args[1]?.toLowerCase();
            const valid = ['warn', 'kick', 'delete', 'mute'];
            if (!valid.includes(m)) return reply(`❌ Valid modes: ${valid.join(' | ')}`);
            config.mode = m;
            if (m === 'kick') { config.enabled = true; }
            await writeConfig(chatId, config);
            return reply(`✅ Antibot mode → *${m.toUpperCase()}*`);
        }

        /* ── MAX WARNINGS ─────────────────────────────────────────────────── */
        if (action === 'max') {
            const n = parseInt(args[1]);
            if (isNaN(n) || n < 1) return reply('❌ Usage: `.antibot max <number>`');
            config.maxWarnings = n;
            await writeConfig(chatId, config);
            return reply(`✅ Max warnings → *${n}*`);
        }

        /* ── SENSITIVITY ──────────────────────────────────────────────────── */
        if (action === 'sensitivity') {
            const s = args[1]?.toLowerCase();
            if (!['low', 'medium', 'high'].includes(s))
                return reply('❌ Sensitivity: `low` | `medium` | `high`\n\n*low* — only obvious bots\n*medium* — balanced (default)\n*high* — aggressive (may flag normal users)');
            config.sensitivity = s;
            await writeConfig(chatId, config);
            return reply(`✅ Sensitivity → *${s.toUpperCase()}*`);
        }

        /* ── PATTERN DETECTION TOGGLE ─────────────────────────────────────── */
        if (action === 'patterns') {
            const s = args[1]?.toLowerCase();
            if (s === 'on')  { config.patternDetect = true;  await writeConfig(chatId, config); return reply('✅ Pattern detection *ON*'); }
            if (s === 'off') { config.patternDetect = false; await writeConfig(chatId, config); return reply('❌ Pattern detection *OFF* — only registered JIDs will be flagged'); }
            return reply(`Pattern detection: ${config.patternDetect ? '✅ ON' : '❌ OFF'}\nUse \`.antibot patterns on|off\``);
        }

        /* ── WHITELIST ────────────────────────────────────────────────────── */
        if (action === 'whitelist') {
            const sub = args[1]?.toLowerCase();
            if (!config.whitelist) config.whitelist = [];

            const quotedSender = getQuotedSender(message);
            const numArg = args[2]?.replace(/\D/g, '') || (quotedSender ? quotedSender.split('@')[0] : null);

            if (sub === 'list') {
                if (!config.whitelist.length) return reply('📭 Whitelist is empty.');
                return reply(`✅ *Whitelisted (exempt):*\n${config.whitelist.map((j,i) => `${i+1}. +${j.split('@')[0]}`).join('\n')}`);
            }
            if (sub === 'add') {
                if (!numArg) return reply('❌ Reply to a message or: `.antibot whitelist add <number>`');
                const jid = `${numArg}@s.whatsapp.net`;
                if (!config.whitelist.includes(jid)) { config.whitelist.push(jid); await writeConfig(chatId, config); }
                return reply(`✅ Added \`${jid}\` to whitelist — will be exempt from antibot.`);
            }
            if (sub === 'remove') {
                if (!numArg) return reply('❌ Reply or: `.antibot whitelist remove <number>`');
                const jid = `${numArg}@s.whatsapp.net`;
                config.whitelist = config.whitelist.filter(j => j !== jid);
                await writeConfig(chatId, config);
                return reply(`✅ Removed \`${jid}\` from whitelist.`);
            }
            return reply('❌ Usage: `.antibot whitelist add|remove|list <number>`');
        }

        /* ── RESET ────────────────────────────────────────────────────────── */
        if (action === 'reset') {
            await writeConfig(chatId, { ...DEFAULT_CONFIG });
            warnCount.forEach((_, k) => { if (k.startsWith(chatId)) warnCount.delete(k); });
            return reply('🔄 Antibot reset to defaults. All registered bots and settings cleared.');
        }

        return reply('❌ Unknown action. Use `.antibot` for help.');
    },

    handleAntibotCheck,
    readConfig,
};
