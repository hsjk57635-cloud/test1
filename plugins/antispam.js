/*****************************************************************************
 *  antispam.js — ULTRA v1  (JUNAID-MD↣³⁰²)
 *  Developed by JUNAID-MD↣³⁰²
 *  Ported & enhanced from MEGA-MDX
 *
 *  Features:
 *  - Per-group flood tracking (in-memory, sliding window)
 *  - Actions: warn | kick | mute
 *  - Group metadata TTL cache (5-min) — no repeated API calls
 *  - Configurable: msgs/window, warn count
 *  - DB + JSON file fallback
 *****************************************************************************/

'use strict';
const fs   = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const HAS_DB = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || process.env.DB_URL);
const configPath = path.join(process.cwd(), 'data', 'antispam.json');

const DEFAULT_GROUP_CONFIG = {
    enabled: false,
    maxMessages: 5,
    windowSeconds: 5,
    action: 'warn',
    warnCount: 3
};

// In-memory flood tracker: chatId → Map<senderId, {count, firstMessageTime, warns}>
const tracker = new Map();

// Group metadata TTL cache
const metaCache = new Map();
const META_TTL_MS = 5 * 60 * 1000;

async function getParticipants(sock, chatId) {
    const cached = metaCache.get(chatId);
    if (cached && (Date.now() - cached.fetchedAt) < META_TTL_MS) return cached.participants;
    try {
        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata?.participants || [];
        metaCache.set(chatId, { participants, fetchedAt: Date.now() });
        return participants;
    } catch { return cached?.participants || []; }
}

function invalidateGroupCache(chatId) {
    metaCache.delete(chatId);
}

function isParticipantAdmin(participants, jid) {
    if (!jid) return false;
    const num = jid.split('@')[0].split(':')[0];
    return participants.some(p => {
        if (p.admin !== 'admin' && p.admin !== 'superadmin') return false;
        const pId = p.id || '', pNum = pId.split('@')[0].split(':')[0];
        return pId === jid || pNum === num;
    });
}

function getBotAdminStatus(participants, sock) {
    const botId = sock.user?.id || '';
    const botNum = botId.split('@')[0].split(':')[0];
    return participants.some(p => {
        if (p.admin !== 'admin' && p.admin !== 'superadmin') return false;
        const pId = p.id || '', pNum = pId.split('@')[0].split(':')[0];
        return pId === botId || pNum === botNum;
    });
}

async function loadConfig() {
    try {
        if (HAS_DB) { const d = await store.getSetting('global', 'antispam'); return d || { groups: {} }; }
        if (!fs.existsSync(configPath)) {
            const dir = path.dirname(configPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(configPath, JSON.stringify({ groups: {} }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch { return { groups: {} }; }
}

async function saveConfig(config) {
    if (HAS_DB) { await store.saveSetting('global', 'antispam', config); return; }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

async function handleAntiSpam(sock, chatId, message, senderId, senderIsOwnerOrSudo) {
    try {
        if (message.key.fromMe || senderIsOwnerOrSudo) return false;
        const config = await loadConfig();
        const groupConfig = config.groups[chatId];
        if (!groupConfig || !groupConfig.enabled) return false;

        const participants = await getParticipants(sock, chatId);
        const isBotAdmin = getBotAdminStatus(participants, sock);
        const isSenderAdmin = isParticipantAdmin(participants, senderId);
        if (isSenderAdmin) return false;

        const now = Date.now();
        const windowMs = groupConfig.windowSeconds * 1000;

        if (!tracker.has(chatId)) tracker.set(chatId, new Map());
        const groupTracker = tracker.get(chatId);

        if (!groupTracker.has(senderId)) {
            groupTracker.set(senderId, { count: 1, firstMessageTime: now, warns: 0 });
            return false;
        }

        const userData = groupTracker.get(senderId);
        if (now - userData.firstMessageTime > windowMs) {
            userData.count = 1; userData.firstMessageTime = now; return false;
        }

        userData.count++;
        if (userData.count <= groupConfig.maxMessages) return false;

        // Spam detected
        userData.count = 0; userData.firstMessageTime = now;

        // React to indicate detection
        try { await sock.sendMessage(chatId, { react: { text: '🚨', key: message.key } }); } catch {}

        if (groupConfig.action === 'warn') {
            userData.warns++;
            const warnsLeft = groupConfig.warnCount - userData.warns;
            if (warnsLeft > 0) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ @${senderId.split('@')[0]} *Stop spamming!*\n_Warning ${userData.warns}/${groupConfig.warnCount}. ${warnsLeft} more before removal._`,
                    mentions: [senderId]
                });
            } else {
                userData.warns = 0;
                if (isBotAdmin) {
                    await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                    await sock.sendMessage(chatId, {
                        text: `🚫 @${senderId.split('@')[0]} removed for spamming.`,
                        mentions: [senderId]
                    });
                } else {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ @${senderId.split('@')[0]} hit spam limit but I need admin to remove them.`,
                        mentions: [senderId]
                    });
                }
            }
            return true;
        }

        if (groupConfig.action === 'kick') {
            if (isBotAdmin) {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                await sock.sendMessage(chatId, {
                    text: `🚫 @${senderId.split('@')[0]} kicked for spamming.`,
                    mentions: [senderId]
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ Spam detected from @${senderId.split('@')[0]} but bot needs admin to kick.`,
                    mentions: [senderId]
                });
            }
            return true;
        }

        if (groupConfig.action === 'mute') {
            if (isBotAdmin) {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'restrict');
                await sock.sendMessage(chatId, {
                    text: `🔇 @${senderId.split('@')[0]} muted for spamming. Ask admin to unmute.`,
                    mentions: [senderId]
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ Spam detected but bot needs admin to mute.`,
                    mentions: [senderId]
                });
            }
            return true;
        }
    } catch (e) {
        console.error('[ANTISPAM] Error:', e.message);
    }
    return false;
}

module.exports = {
    command: 'antispam',
    aliases: ['floodprotect', 'antiflood', 'spamprotect'],
    category: 'admin',
    description: 'Per-group flood/spam protection — configurable rate limit, warn/kick/mute actions',
    usage: '.antispam on|off|status|set <msgs> <seconds>|action <warn/kick/mute>|warns <n>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const isBotAdmin = context.isBotAdmin || false;

        const config = await loadConfig();
        if (!config.groups[chatId]) config.groups[chatId] = { ...DEFAULT_GROUP_CONFIG };
        const groupConfig = config.groups[chatId];
        const action = args[0]?.toLowerCase();

        const reply = (text) => sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (!action || action === 'status') {
            return reply(
                `*🛡️ ANTI-SPAM STATUS*\n\n` +
                `*Status:*      ${groupConfig.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                `*Limit:*       ${groupConfig.maxMessages} msgs in ${groupConfig.windowSeconds}s\n` +
                `*Action:*      ${groupConfig.action.toUpperCase()}\n` +
                `*Warn limit:*  ${groupConfig.warnCount} before kick\n` +
                `*Bot admin:*   ${isBotAdmin ? '✅' : '❌ (needed for kick/mute)'}\n\n` +
                `*Commands:*\n` +
                `• \`.antispam on/off\`\n` +
                `• \`.antispam set 5 10\` — 5 msgs in 10s\n` +
                `• \`.antispam action warn|kick|mute\`\n` +
                `• \`.antispam warns 3\` — warns before kick`
            );
        }

        if (action === 'on' || action === 'enable') {
            groupConfig.enabled = true; await saveConfig(config);
            return reply(`✅ *Anti-spam enabled!*\nLimit: ${groupConfig.maxMessages} msgs in ${groupConfig.windowSeconds}s | Action: ${groupConfig.action.toUpperCase()}`);
        }
        if (action === 'off' || action === 'disable') {
            groupConfig.enabled = false; await saveConfig(config);
            return reply('❌ *Anti-spam disabled.*');
        }

        if (action === 'set') {
            const maxMsgs = parseInt(args[1], 10), windowSec = parseInt(args[2], 10);
            if (isNaN(maxMsgs) || isNaN(windowSec) || maxMsgs < 2 || windowSec < 1)
                return reply('❌ Usage: `.antispam set <messages> <seconds>`\nExample: `.antispam set 5 10`');
            groupConfig.maxMessages = maxMsgs; groupConfig.windowSeconds = windowSec;
            await saveConfig(config);
            return reply(`✅ Limit: *${maxMsgs} msgs* in *${windowSec}s*`);
        }

        if (action === 'action') {
            const newAction = args[1]?.toLowerCase();
            if (!['warn', 'kick', 'mute'].includes(newAction))
                return reply('❌ Choose: `warn`, `kick`, or `mute`');
            groupConfig.action = newAction; await saveConfig(config);
            return reply(`✅ Action: *${newAction.toUpperCase()}*`);
        }

        if (action === 'warns') {
            const count = parseInt(args[1], 10);
            if (isNaN(count) || count < 1) return reply('❌ Example: `.antispam warns 3`');
            groupConfig.warnCount = count; await saveConfig(config);
            return reply(`✅ Warn limit: *${count}* before action.`);
        }

        return reply('❌ Unknown option. Use `.antispam status`');
    },

    handleAntiSpam,
    invalidateGroupCache,
};
