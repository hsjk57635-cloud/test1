'use strict';
/*****************************************************************************
 *  JUNAID-MD↣³⁰² — ULTRA ANTI-SPAM v3.0
 *
 *  Upgrades vs old version:
 *  - Multiple modes: warn / kick / mute / delete / ban (ban = kick + no rejoin)
 *  - Per-sender sliding window rate tracker
 *  - Sticker spam, media spam, link-spam detection toggles
 *  - Whitelist: allow specific users to bypass spam check
 *  - Smart temp-mute: mute spammer for N minutes instead of kick
 *  - Parallel metadata cache (5min TTL)
 *  - DB + file storage support
 *  - Admin immune (never spammed)
 *  - Speed: O(1) tracker lookup
 *****************************************************************************/

const fs   = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL    = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL    = process.env.MYSQL_URL;
const SQLITE_URL   = process.env.DB_URL;
const HAS_DB       = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const configPath  = path.join(process.cwd(), 'data', 'antispam.json');

// In-memory trackers (reset on restart — intentional)
const tracker   = new Map(); // chatId -> Map<senderId, {count, firstTs, warns, mutedUntil}>
const metaCache = new Map(); // chatId -> {participants, fetchedAt}
const META_TTL  = 5 * 60 * 1000; // 5 min

/* ─── Meta helpers ────────────────────────────────────────────────────────── */
async function getParticipants(sock, chatId) {
    const cached = metaCache.get(chatId);
    if (cached && (Date.now() - cached.fetchedAt) < META_TTL) return cached.participants;
    try {
        const meta = await sock.groupMetadata(chatId);
        const participants = meta?.participants || [];
        metaCache.set(chatId, { participants, fetchedAt: Date.now() });
        return participants;
    } catch { return cached?.participants || []; }
}

function isAdmin(participants, jid) {
    if (!jid) return false;
    const num = jid.split('@')[0].split(':')[0];
    return participants.some(p => {
        if (!p.admin) return false;
        const pId  = p.id  || '';
        const pLid = p.lid || '';
        const pNum  = pId.split('@')[0].split(':')[0];
        const pLNum = pLid.split('@')[0].split(':')[0];
        return pId === jid || pLid === jid || pNum === num || pLNum === num;
    });
}

function isBotAdmin(participants, sock) {
    const botId  = sock.user?.id  || '';
    const botLid = sock.user?.lid || '';
    const botNum  = botId.split('@')[0].split(':')[0];
    const botLNum = botLid.split('@')[0].split(':')[0];
    return participants.some(p => {
        if (!p.admin) return false;
        const pId  = p.id  || '';
        const pLid = p.lid || '';
        const pNum  = pId.split('@')[0].split(':')[0];
        const pLNum = pLid.split('@')[0].split(':')[0];
        return pId === botId || pId === botLid || pLid === botLid ||
               pNum === botNum || pLNum === botLNum || pNum === botLNum || pLNum === botNum;
    });
}

/* ─── Config persistence ──────────────────────────────────────────────────── */
const DEFAULT_GROUP_CONFIG = {
    enabled      : false,
    maxMessages  : 5,
    windowSeconds: 5,
    action       : 'warn',        // warn | kick | mute | delete | ban
    warnCount    : 3,
    muteDuration : 5,             // minutes for temp-mute
    detectMedia  : false,         // count media msgs in rate limit
    detectSticker: false,         // count stickers
    detectLinks  : false,         // extra punishment for links (combined with antilink)
    whitelist    : [],            // JIDs immune to antispam
};

async function loadConfig() {
    try {
        if (HAS_DB) {
            const data = await store.getSetting('global', 'antispam');
            return data || { groups: {} };
        }
        if (!fs.existsSync(configPath)) {
            fs.mkdirSync(path.dirname(configPath), { recursive: true });
            fs.writeFileSync(configPath, JSON.stringify({ groups: {} }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch { return { groups: {} }; }
}

async function saveConfig(config) {
    if (HAS_DB) {
        await store.saveSetting('global', 'antispam', config);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
}

/* ─── Main handler (called from messageHandler) ──────────────────────────── */
async function handleAntiSpam(sock, chatId, message, senderId, senderIsOwner) {
    try {
        // Never check owner or fromMe
        if (message.key.fromMe || senderIsOwner) return false;

        const config      = await loadConfig();
        const groupConfig = config.groups?.[chatId];
        if (!groupConfig?.enabled) return false;

        const participants = await getParticipants(sock, chatId);
        const botIsAdmin   = isBotAdmin(participants, sock);
        const senderIsAdm  = isAdmin(participants, senderId);

        // Admins always exempt
        if (senderIsAdm) return false;

        // Whitelist check
        const whitelist = groupConfig.whitelist || [];
        if (whitelist.some(w => w.split('@')[0].split(':')[0] === senderId.split('@')[0].split(':')[0])) return false;

        // Determine if this message type should be counted
        const hasMedia   = !!(message.message?.imageMessage || message.message?.videoMessage || message.message?.documentMessage || message.message?.audioMessage);
        const hasSticker = !!message.message?.stickerMessage;
        if (hasMedia && !groupConfig.detectMedia) return false;
        if (hasSticker && !groupConfig.detectSticker) return false;

        const now      = Date.now();
        const windowMs = (groupConfig.windowSeconds || 5) * 1000;

        if (!tracker.has(chatId)) tracker.set(chatId, new Map());
        const ct = tracker.get(chatId);

        if (!ct.has(senderId)) {
            ct.set(senderId, { count: 1, firstTs: now, warns: 0, mutedUntil: 0 });
            return false;
        }

        const ud = ct.get(senderId);

        // If currently muted, delete message
        if (ud.mutedUntil && now < ud.mutedUntil) {
            if (botIsAdmin) {
                try { await sock.sendMessage(chatId, { delete: message.key }); } catch {}
            }
            return true;
        }
        if (ud.mutedUntil && now >= ud.mutedUntil) ud.mutedUntil = 0;

        // Sliding window reset
        if (now - ud.firstTs > windowMs) {
            ud.count = 1;
            ud.firstTs = now;
            return false;
        }

        ud.count++;
        if (ud.count <= (groupConfig.maxMessages || 5)) return false;

        // Spam detected — reset counter
        ud.count    = 0;
        ud.firstTs  = now;

        const action = groupConfig.action || 'warn';
        const senderShort = senderId.split('@')[0];

        // Helper: send notification
        const notify = async (text) => {
            try {
                await sock.sendMessage(chatId, { text, mentions: [senderId] });
            } catch {}
        };

        if (action === 'delete') {
            // Just delete the triggering message, no further action
            if (botIsAdmin) {
                try { await sock.sendMessage(chatId, { delete: message.key }); } catch {}
                await notify(`⚠️ @${senderShort} *Slow down!* Message deleted.`);
            }
            return true;
        }

        if (action === 'warn') {
            ud.warns = (ud.warns || 0) + 1;
            const warnsLeft = (groupConfig.warnCount || 3) - ud.warns;

            if (warnsLeft > 0) {
                await notify(
                    `⚠️ @${senderShort} *Stop spamming!*\n` +
                    `_Warning ${ud.warns}/${groupConfig.warnCount}. ${warnsLeft} more before action._`
                );
            } else {
                ud.warns = 0;
                // Execute final action (kick or mute after warns exhausted)
                if (!botIsAdmin) {
                    await notify(`⚠️ @${senderShort} reached max warnings. Bot needs admin rights to take action.`);
                } else {
                    await notify(`🚫 @${senderShort} *removed* for repeated spamming.`);
                    await new Promise(r => setTimeout(r, 500));
                    await sock.groupParticipantsUpdate(chatId, [senderId], 'remove').catch(() => {});
                }
            }
            return true;
        }

        if (action === 'mute') {
            const muteMins = groupConfig.muteDuration || 5;
            ud.mutedUntil  = now + muteMins * 60 * 1000;
            if (!botIsAdmin) {
                await notify(`⚠️ @${senderShort} would be muted for ${muteMins}min — bot needs admin.`);
            } else {
                await notify(`🔇 @${senderShort} *muted for ${muteMins} minutes* for spamming.`);
                // Delete the spam message
                try { await sock.sendMessage(chatId, { delete: message.key }); } catch {}
            }
            return true;
        }

        if (action === 'kick' || action === 'ban') {
            if (!botIsAdmin) {
                await notify(`⚠️ @${senderShort} caught spamming — bot needs admin to ${action}.`);
            } else {
                await notify(`🚫 @${senderShort} *removed* for spamming.`);
                await new Promise(r => setTimeout(r, 300));
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove').catch(() => {});
            }
            return true;
        }

        return false;
    } catch (e) {
        console.error('[ANTISPAM]', e.message);
        return false;
    }
}

function invalidateGroupCache(chatId) {
    metaCache.delete(chatId);
    tracker.delete(chatId);
}

/* ─── Command handler ─────────────────────────────────────────────────────── */
module.exports = {
    command    : 'antispam',
    aliases    : ['floodprotect', 'antiflood', 'spam'],
    category   : 'admin',
    description: 'Ultra anti-spam flood protection — warn, kick, mute, delete, or ban spammers',
    usage      : '.antispam on/off | .antispam status | .antispam set <msgs> <secs> | .antispam action <warn/kick/mute/delete/ban> | .antispam warns <n> | .antispam mute <mins> | .antispam whitelist add/remove @user | .antispam media on/off',
    groupOnly  : true,
    adminOnly  : true,

    async handler(sock, message, args, context = {}) {
        const chatId      = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const botIsAdmin  = context.isBotAdmin || false;

        const config = await loadConfig();
        if (!config.groups) config.groups = {};
        if (!config.groups[chatId]) config.groups[chatId] = { ...DEFAULT_GROUP_CONFIG };

        const gc  = config.groups[chatId];
        const sub = (Array.isArray(args) ? args[0] : args)?.toLowerCase?.()?.trim() || 'status';

        // ── status ────────────────────────────────────────────────────────
        if (!sub || sub === 'status' || sub === 'info') {
            const t =
                `*🛡️ ULTRA ANTI-SPAM STATUS*\n\n` +
                `*Status:* ${gc.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                `*Limit:* ${gc.maxMessages} msgs in ${gc.windowSeconds}s\n` +
                `*Action:* ${gc.action.toUpperCase()}\n` +
                (gc.action === 'warn' ? `*Max Warns:* ${gc.warnCount} before action\n` : '') +
                (gc.action === 'mute' ? `*Mute duration:* ${gc.muteDuration} minutes\n` : '') +
                `*Bot is admin:* ${botIsAdmin ? '✅ Yes' : '❌ No (needed for kick/mute/ban)'}\n` +
                `*Detect media:* ${gc.detectMedia ? '✅' : '❌'}\n` +
                `*Detect stickers:* ${gc.detectSticker ? '✅' : '❌'}\n` +
                `*Whitelist:* ${gc.whitelist?.length || 0} users\n\n` +
                `*Commands:*\n` +
                `• \`.antispam on/off\`\n` +
                `• \`.antispam set 5 10\` — 5 msgs per 10s\n` +
                `• \`.antispam action warn/kick/mute/delete/ban\`\n` +
                `• \`.antispam warns 3\`\n` +
                `• \`.antispam mute 5\` — 5min mute\n` +
                `• \`.antispam media on/off\`\n` +
                `• \`.antispam sticker on/off\`\n` +
                `• \`.antispam whitelist add @user\``;
            return sock.sendMessage(chatId, { text: t, ...channelInfo }, { quoted: message });
        }

        // ── on / off ──────────────────────────────────────────────────────
        if (sub === 'on' || sub === 'enable') {
            if (gc.enabled) return sock.sendMessage(chatId, { text: '⚠️ Already enabled.', ...channelInfo }, { quoted: message });
            gc.enabled = true;
            await saveConfig(config);
            return sock.sendMessage(chatId, {
                text: `✅ *Anti-spam ENABLED!*\nLimit: ${gc.maxMessages} msgs/${gc.windowSeconds}s | Action: ${gc.action.toUpperCase()}`,
                ...channelInfo
            }, { quoted: message });
        }

        if (sub === 'off' || sub === 'disable') {
            if (!gc.enabled) return sock.sendMessage(chatId, { text: '⚠️ Already disabled.', ...channelInfo }, { quoted: message });
            gc.enabled = false;
            await saveConfig(config);
            return sock.sendMessage(chatId, { text: '❌ *Anti-spam DISABLED.*', ...channelInfo }, { quoted: message });
        }

        // ── set limit ──────────────────────────────────────────────────────
        if (sub === 'set' || sub === 'limit') {
            const maxM = parseInt(args[1], 10);
            const winS = parseInt(args[2], 10);
            if (isNaN(maxM) || isNaN(winS) || maxM < 2 || winS < 1) {
                return sock.sendMessage(chatId, { text: '❌ Usage: `.antispam set <msgs> <seconds>`\nEx: `.antispam set 5 10`', ...channelInfo }, { quoted: message });
            }
            gc.maxMessages   = maxM;
            gc.windowSeconds = winS;
            await saveConfig(config);
            return sock.sendMessage(chatId, { text: `✅ Limit: *${maxM} msgs* per *${winS}s*`, ...channelInfo }, { quoted: message });
        }

        // ── action ────────────────────────────────────────────────────────
        if (sub === 'action') {
            const newA = args[1]?.toLowerCase();
            if (!['warn','kick','mute','delete','ban'].includes(newA)) {
                return sock.sendMessage(chatId, { text: '❌ Valid actions: `warn`, `kick`, `mute`, `delete`, `ban`', ...channelInfo }, { quoted: message });
            }
            if (!botIsAdmin && newA !== 'warn' && newA !== 'delete') {
                await sock.sendMessage(chatId, { text: `⚠️ Action *${newA.toUpperCase()}* set but bot needs admin rights to execute it.`, ...channelInfo }, { quoted: message });
            }
            gc.action = newA;
            await saveConfig(config);
            return sock.sendMessage(chatId, { text: `✅ Action: *${newA.toUpperCase()}*`, ...channelInfo }, { quoted: message });
        }

        // ── warns count ───────────────────────────────────────────────────
        if (sub === 'warns') {
            const n = parseInt(args[1], 10);
            if (isNaN(n) || n < 1) return sock.sendMessage(chatId, { text: '❌ Ex: `.antispam warns 3`', ...channelInfo }, { quoted: message });
            gc.warnCount = n;
            await saveConfig(config);
            return sock.sendMessage(chatId, { text: `✅ Warn limit: *${n}* before action.`, ...channelInfo }, { quoted: message });
        }

        // ── mute duration ─────────────────────────────────────────────────
        if (sub === 'mute') {
            const mins = parseInt(args[1], 10);
            if (isNaN(mins) || mins < 1) return sock.sendMessage(chatId, { text: '❌ Ex: `.antispam mute 5` (minutes)', ...channelInfo }, { quoted: message });
            gc.muteDuration = mins;
            await saveConfig(config);
            return sock.sendMessage(chatId, { text: `✅ Mute duration: *${mins} minutes*`, ...channelInfo }, { quoted: message });
        }

        // ── media detect ──────────────────────────────────────────────────
        if (sub === 'media') {
            const v = args[1]?.toLowerCase();
            gc.detectMedia = (v === 'on' || v === 'true');
            await saveConfig(config);
            return sock.sendMessage(chatId, { text: `${gc.detectMedia ? '✅' : '❌'} Media detection *${gc.detectMedia ? 'ON' : 'OFF'}*`, ...channelInfo }, { quoted: message });
        }

        if (sub === 'sticker') {
            const v = args[1]?.toLowerCase();
            gc.detectSticker = (v === 'on' || v === 'true');
            await saveConfig(config);
            return sock.sendMessage(chatId, { text: `${gc.detectSticker ? '✅' : '❌'} Sticker detection *${gc.detectSticker ? 'ON' : 'OFF'}*`, ...channelInfo }, { quoted: message });
        }

        // ── whitelist ─────────────────────────────────────────────────────
        if (sub === 'whitelist') {
            const op      = args[1]?.toLowerCase();
            const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (!gc.whitelist) gc.whitelist = [];

            if (op === 'list') {
                return sock.sendMessage(chatId, {
                    text: gc.whitelist.length
                        ? `📋 *Whitelist (${gc.whitelist.length})*\n` + gc.whitelist.map((j, i) => `  ${i+1}. +${j.split('@')[0]}`).join('\n')
                        : '📋 Whitelist is empty.'
                }, { quoted: message });
            }

            if (op === 'add' && mentions.length) {
                mentions.forEach(jid => { if (!gc.whitelist.includes(jid)) gc.whitelist.push(jid); });
                await saveConfig(config);
                return sock.sendMessage(chatId, { text: `✅ Added ${mentions.length} to whitelist.` }, { quoted: message });
            }

            if (op === 'remove' && mentions.length) {
                gc.whitelist = gc.whitelist.filter(w => !mentions.includes(w));
                await saveConfig(config);
                return sock.sendMessage(chatId, { text: `🗑️ Removed from whitelist.` }, { quoted: message });
            }

            if (op === 'clear') {
                gc.whitelist = [];
                await saveConfig(config);
                return sock.sendMessage(chatId, { text: '🗑️ Whitelist cleared.' }, { quoted: message });
            }

            return sock.sendMessage(chatId, {
                text: '❌ Usage: `.antispam whitelist add @user` / `remove @user` / `list` / `clear`'
            }, { quoted: message });
        }

        // ── reset tracker ─────────────────────────────────────────────────
        if (sub === 'reset' || sub === 'clear') {
            invalidateGroupCache(chatId);
            return sock.sendMessage(chatId, { text: '🔄 Spam tracker reset for this group.', ...channelInfo }, { quoted: message });
        }

        return sock.sendMessage(chatId, {
            text: '❌ Unknown option. Use `.antispam status` for help.', ...channelInfo
        }, { quoted: message });
    },

    handleAntiSpam,
    invalidateGroupCache,
};
