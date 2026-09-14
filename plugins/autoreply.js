/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *    AUTOREPLY v3.0 ULTRA — Multi-match · Priority · Cooldown · Stats       *
 *                                                                           *
 *****************************************************************************/

'use strict';

const fs   = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');
const { sendSafeMessage } = require('../lib/sendSafeMessage');

/* ─────────────────────────────── constants ─────────────────────────────── */
const HAS_DB      = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || process.env.DB_URL);
const CONFIG_PATH = path.join(process.cwd(), 'data', 'autoreplies.json');
const MATCH_TYPES = ['contains', 'exact', 'regex', 'startsWith', 'endsWith'];

/* ─── in-memory cooldown map: key = `${senderJid}::${triggerId}` ────────── */
const cooldownMap = new Map();

/* ─────────────────────────────── config I/O ─────────────────────────────── */
async function initConfig() {
    try {
        if (HAS_DB) {
            const cfg = await store.getSetting('global', 'autoreplies');
            return _mergeDefaults(cfg);
        }
        if (!fs.existsSync(CONFIG_PATH)) {
            fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
            const def = _defaultConfig();
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(def, null, 2));
            return def;
        }
        return _mergeDefaults(JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')));
    } catch {
        return _defaultConfig();
    }
}

async function saveConfig(config) {
    try {
        if (HAS_DB) {
            await store.saveSetting('global', 'autoreplies', config);
        } else {
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        }
    } catch (e) {
        console.error('[AUTOREPLY] saveConfig error:', e.message);
    }
}

function _defaultConfig() {
    return {
        enabled: true,
        replies: [],
        perGroup: {}          // groupJid → { enabled: bool }
    };
}

function _mergeDefaults(raw) {
    if (!raw) return _defaultConfig();
    return {
        enabled:  raw.enabled  ?? true,
        replies:  Array.isArray(raw.replies) ? raw.replies : [],
        perGroup: raw.perGroup || {}
    };
}

/* ─────────────────────────────── matching ──────────────────────────────── */
function _matches(rule, lowerMsg, rawMsg) {
    const t  = rule.caseSensitive ? rule.trigger : rule.trigger.toLowerCase();
    const m  = rule.caseSensitive ? rawMsg       : lowerMsg;
    switch (rule.matchType || 'contains') {
        case 'exact':      return m === t;
        case 'startsWith': return m.startsWith(t);
        case 'endsWith':   return m.endsWith(t);
        case 'regex':
            try { return new RegExp(rule.trigger, rule.caseSensitive ? '' : 'i').test(rawMsg); }
            catch { return false; }
        default:           return m.includes(t);           // 'contains'
    }
}

/* ─────────────────────────────── variable injection ────────────────────── */
function _inject(template, { name, number, group, time, date }) {
    return template
        .replace(/\{name\}/gi,   name)
        .replace(/\{number\}/gi, number)
        .replace(/\{group\}/gi,  group)
        .replace(/\{time\}/gi,   time)
        .replace(/\{date\}/gi,   date);
}

/* ─────────────────────────────── time restrict ─────────────────────────── */
function _inTimeWindow(rule, tz) {
    if (!rule.timeRestrict) return true;
    const { startHour, endHour } = rule.timeRestrict;
    if (startHour == null || endHour == null) return true;
    const now  = new Date(new Date().toLocaleString('en-US', { timeZone: tz || 'UTC' }));
    const hour = now.getHours();
    return startHour <= endHour
        ? hour >= startHour && hour < endHour
        : hour >= startHour || hour < endHour;   // overnight window
}

/* ─────────────────────────────── core handler ──────────────────────────── */
async function handleAutoReply(sock, chatId, message, userMessage) {
    try {
        const config = await initConfig();
        if (!config.replies.length) return false;

        /* global toggle */
        if (!config.enabled) return false;

        /* per-group toggle */
        const isGroup  = chatId.endsWith('@g.us');
        const grpCfg   = config.perGroup?.[chatId];
        if (isGroup && grpCfg?.enabled === false) return false;

        const sender   = message.key?.participant || message.key?.remoteJid;
        const rawMsg   = userMessage.trim();
        const lowerMsg = rawMsg.toLowerCase();

        /* sort by priority (lower = first) */
        const sorted = [...config.replies].sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5));

        for (const rule of sorted) {
            /* scope guards */
            if (rule.groupOnly && !isGroup) continue;
            if (rule.dmOnly   &&  isGroup) continue;

            if (!_matches(rule, lowerMsg, rawMsg)) continue;

            /* time-window check */
            const tz = process.env.TIMEZONE || 'Asia/Karachi';
            if (!_inTimeWindow(rule, tz)) continue;

            /* cooldown check */
            const cdKey  = `${sender}::${rule.id}`;
            const lastAt = cooldownMap.get(cdKey) || 0;
            const cdMs   = rule.cooldownMs ?? 0;
            if (cdMs > 0 && Date.now() - lastAt < cdMs) continue;
            cooldownMap.set(cdKey, Date.now());

            /* build vars */
            const senderName = message.pushName || sender?.split('@')[0] || 'there';
            const now        = new Date();
            const tz2        = process.env.TIMEZONE || 'Asia/Karachi';
            const timeStr    = now.toLocaleTimeString('en-US', { timeZone: tz2, hour12: true });
            const dateStr    = now.toLocaleDateString('en-US', { timeZone: tz2 });
            const groupName  = isGroup
                ? (await sock.groupMetadata(chatId).catch(() => ({ subject: 'Group' }))).subject
                : 'DM';

            /* pick response (supports arrays for random) */
            const responses = Array.isArray(rule.response) ? rule.response : [rule.response];
            const rawResp   = responses[Math.floor(Math.random() * responses.length)];
            const responseText = _inject(rawResp, {
                name:   senderName,
                number: sender?.split('@')[0] || '',
                group:  groupName,
                time:   timeStr,
                date:   dateStr
            });

            /* react to trigger if configured */
            if (rule.reactEmoji) {
                await sock.sendMessage(chatId, { react: { text: rule.reactEmoji, key: message.key } }).catch(() => {});
            }

            /* send response */
            if (rule.responseType === 'image' && rule.mediaUrl) {
                await sendSafeMessage(sock, chatId, {
                    image:   { url: rule.mediaUrl },
                    caption: responseText
                }, { quoted: message });
            } else {
                await sendSafeMessage(sock, chatId, {
                    text: responseText,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded:     true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid:     '120363408055942569@newsletter',
                            newsletterName:    'JUNAID-MD↣³⁰²',
                            serverMessageId:   -1
                        }
                    }
                }, { quoted: message });
            }

            /* update hit stats in config */
            rule.hitCount    = (rule.hitCount || 0) + 1;
            rule.lastHit     = Date.now();
            saveConfig(config).catch(() => {});   // async, non-blocking

            return true;   // stop at first match
        }
    } catch (e) {
        console.error('[AUTOREPLY] handleAutoReply error:', e.message);
    }
    return false;
}

/* ─────────────────────────────── command handler ───────────────────────── */
module.exports = {
    command:     'autoreply',
    aliases:     ['ar', 'autorespond'],
    category:    'owner',
    description: 'Manage the auto-reply system (v3.0 Ultra)',
    usage:       '.autoreply <on|off|status|group|stats>',
    ownerOnly:   true,

    async handler(sock, message, args, context = {}) {
        const chatId     = context.chatId     || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        try {
            const config = await initConfig();
            const action = args[0]?.toLowerCase();
            const isGroup = chatId.endsWith('@g.us');

            /* ── no args → status panel ── */
            if (!action) {
                const grpCfg = config.perGroup?.[chatId];
                const grpStatus = isGroup
                    ? `\n*🏘 This Group:* ${grpCfg?.enabled === false ? '❌ Disabled' : '✅ Enabled (inherits global)'}`
                    : '';

                return await sendSafeMessage(sock, chatId, {
                    text: `╔═══════════════════════╗\n` +
                          `║   🤖 AUTO-REPLY v3.0  ║\n` +
                          `╚═══════════════════════╝\n\n` +
                          `*🌐 Global:* ${config.enabled ? '✅ ON' : '❌ OFF'}${grpStatus}\n` +
                          `*📦 Rules:* ${config.replies.length}\n` +
                          `*💾 Storage:* ${HAS_DB ? 'Database' : 'File System'}\n\n` +
                          `*📋 Commands:*\n` +
                          `• \`.autoreply on/off\` — global toggle\n` +
                          `• \`.autoreply group on/off\` — this group toggle\n` +
                          `• \`.autoreply stats\` — hit statistics\n` +
                          `• \`.addreply\` — add trigger\n` +
                          `• \`.delreply\` — remove trigger\n` +
                          `• \`.listreplies\` — view all triggers`,
                    ...channelInfo
                }, { quoted: message });
            }

            /* ── on/off global ── */
            if (action === 'on'  || action === 'enable') {
                if (config.enabled) return await sendSafeMessage(sock, chatId,
                    { text: '⚠️ *Auto-reply is already ON*', ...channelInfo }, { quoted: message });
                config.enabled = true;
                await saveConfig(config);
                return await sendSafeMessage(sock, chatId,
                    { text: '✅ *Auto-reply ENABLED globally*', ...channelInfo }, { quoted: message });
            }

            if (action === 'off' || action === 'disable') {
                if (!config.enabled) return await sendSafeMessage(sock, chatId,
                    { text: '⚠️ *Auto-reply is already OFF*', ...channelInfo }, { quoted: message });
                config.enabled = false;
                await saveConfig(config);
                return await sendSafeMessage(sock, chatId,
                    { text: '❌ *Auto-reply DISABLED globally*', ...channelInfo }, { quoted: message });
            }

            /* ── group sub-command ── */
            if (action === 'group') {
                if (!isGroup) return await sendSafeMessage(sock, chatId,
                    { text: '❌ This sub-command only works inside a group.', ...channelInfo }, { quoted: message });
                const sub = args[1]?.toLowerCase();
                if (!sub) {
                    const cur = config.perGroup?.[chatId]?.enabled;
                    return await sendSafeMessage(sock, chatId,
                        { text: `*This group auto-reply:* ${cur === false ? '❌ OFF' : '✅ ON (inherits global)'}\n\n` +
                                `Use \`.autoreply group on/off\` to override.`, ...channelInfo }, { quoted: message });
                }
                if (!config.perGroup) config.perGroup = {};
                if (!config.perGroup[chatId]) config.perGroup[chatId] = {};
                if (sub === 'on') {
                    config.perGroup[chatId].enabled = true;
                    await saveConfig(config);
                    return await sendSafeMessage(sock, chatId,
                        { text: '✅ *Auto-reply enabled for this group*', ...channelInfo }, { quoted: message });
                }
                if (sub === 'off') {
                    config.perGroup[chatId].enabled = false;
                    await saveConfig(config);
                    return await sendSafeMessage(sock, chatId,
                        { text: '❌ *Auto-reply disabled for this group*', ...channelInfo }, { quoted: message });
                }
            }

            /* ── stats ── */
            if (action === 'stats') {
                if (!config.replies.length)
                    return await sendSafeMessage(sock, chatId,
                        { text: '📊 No triggers configured yet.', ...channelInfo }, { quoted: message });

                const sorted = [...config.replies].sort((a, b) => (b.hitCount || 0) - (a.hitCount || 0));
                const top    = sorted.slice(0, 10);
                const lines  = top.map((r, i) => {
                    const last = r.lastHit ? `🕒 ${new Date(r.lastHit).toLocaleDateString()}` : 'never';
                    return `${i + 1}. *${r.trigger}* — ${r.hitCount || 0} hits · ${last}`;
                }).join('\n');
                const total  = config.replies.reduce((s, r) => s + (r.hitCount || 0), 0);

                return await sendSafeMessage(sock, chatId, {
                    text: `*📊 AUTO-REPLY STATS*\n\n` +
                          `*Total hits:* ${total}\n*Rules:* ${config.replies.length}\n\n` +
                          `*🏆 Top Triggers:*\n${lines}`,
                    ...channelInfo
                }, { quoted: message });
            }

            return await sendSafeMessage(sock, chatId, {
                text: '❌ Unknown action. Use: `.autoreply on/off/group/stats`',
                ...channelInfo
            }, { quoted: message });

        } catch (e) {
            console.error('[AUTOREPLY] handler error:', e.message);
            await sendSafeMessage(sock, chatId,
                { text: '❌ Error processing command.' }, { quoted: message });
        }
    },

    /* exports for sub-plugins (addreply / delreply / listreplies) */
    handleAutoReply,
    initConfig,
    saveConfig,
    MATCH_TYPES
};
