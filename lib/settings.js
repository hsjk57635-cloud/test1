'use strict';
/*****************************************************************************
 *  REDXBOT302 — ULTRA SETTINGS PANEL v3.0
 *  Features: Full group + global config, inline toggle commands,
 *            antispam stats, live data, speed optimized
 *****************************************************************************/

const isOwnerOrSudo = require('../lib/isOwner');
const { cleanJid, getSessionNum } = require('../lib/isOwner');
const store = require('../lib/lightweight_store');
const settings = require('../settings');

const getSt = (val) => val ? '✅ ON' : '❌ OFF';
const getIcon = (val) => val ? '🟢' : '🔴';

module.exports = {
    command: 'settings',
    aliases: ['config', 'setting', 'panel', 'cfg'],
    category: 'owner',
    description: 'Full bot settings panel — view and toggle all configs',
    usage: '.settings [global|group|antispam|toggle <feature> on/off]',

    async handler(sock, message, args, context = {}) {
        const chatId    = context.chatId || message.key.remoteJid;
        const senderId  = message.key.participant || message.key.remoteJid;
        const fromMe    = message.key.fromMe;
        const sessionId = context.sessionId || getSessionNum(sock);

        // Permission check — owner, sudo, paired session
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId, fromMe, sessionId);
        if (!isOwner && !fromMe) {
            return sock.sendMessage(chatId, {
                text: '❌ *Access Denied*\n\n_Only the bot owner can view/change settings._'
            }, { quoted: message });
        }

        const isGroup   = chatId.endsWith('@g.us');
        const sub       = (Array.isArray(args) ? args[0] : args)?.toLowerCase()?.trim() || 'main';
        const channelInfo = context.channelInfo || {};

        // ── Inline toggle: .settings toggle <feature> on/off ─────────────
        if (sub === 'toggle' || sub === 'set') {
            const feature = (Array.isArray(args) ? args[1] : '')?.toLowerCase();
            const val     = (Array.isArray(args) ? args[2] : '')?.toLowerCase();
            const enable  = val === 'on' || val === '1' || val === 'true' || val === 'enable';
            const disable = val === 'off' || val === '0' || val === 'false' || val === 'disable';

            if (!feature || (!enable && !disable)) {
                return sock.sendMessage(chatId, {
                    text: `⚙️ *Settings Toggle*\n\nUsage: *.settings toggle <feature> on/off*\n\nFeatures: autostatus, autoread, autotyping, pmblocker, anticall, chatbot, welcome, goodbye, antilink, antibadword, antitag, antispam`
                }, { quoted: message });
            }

            const scope = ['chatbot','welcome','goodbye','antilink','antibadword','antitag','antispam'].includes(feature)
                ? chatId : 'global';

            await store.saveSetting(scope, feature, { enabled: enable });
            return sock.sendMessage(chatId, {
                text: `${enable ? '✅' : '❌'} *${feature.toUpperCase()}* ${enable ? 'enabled' : 'disabled'}`
            }, { quoted: message });
        }

        try {
            // ── Parallel fetch all settings ───────────────────────────────
            const [allGlobal, allGroup, botMode, prefix, botName] = await Promise.all([
                store.getAllSettings('global').catch(() => ({})),
                isGroup ? store.getAllSettings(chatId).catch(() => ({})) : Promise.resolve({}),
                store.getBotMode().catch(() => 'public'),
                store.getSetting('global', 'prefix').catch(() => null),
                store.getSetting('global', 'botName').catch(() => null),
            ]);

            const dynPrefix  = prefix  || settings.prefix  || '.';
            const dynName    = botName || settings.botName || 'JUNAID-MD↣³⁰²';
            const sessionNum = getSessionNum(sock) || sessionId;

            // Global configs
            const autoStatus  = allGlobal.autoStatus  || {};
            const autoread    = allGlobal.autoread     || {};
            const autotyping  = allGlobal.autotyping   || {};
            const pmblocker   = allGlobal.pmblocker    || {};
            const anticall    = allGlobal.anticall     || {};
            const autoReact   = allGlobal.autoReaction || false;

            let t = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`;
            t += `┃  ⚙️  *${dynName} SETTINGS*  ⚙️\n`;
            t += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

            t += `┌─ 🤖 *BOT INFO* ────────────\n`;
            t += `│ 👤 Session: *+${sessionNum || '?'}*\n`;
            t += `│ ⚙️  Mode: *${botMode.toUpperCase()}*\n`;
            t += `│ 📦 Prefix: *${dynPrefix}*\n`;
            t += `│ 🌐 Version: *${settings.version || 'v7.0'}*\n`;
            t += `└────────────────────────────\n\n`;

            t += `┌─ 🌍 *GLOBAL FEATURES* ─────\n`;
            t += `│ ${getIcon(autoStatus?.enabled)} Auto Status View\n`;
            t += `│ ${getIcon(autoread?.enabled)} Auto Read Messages\n`;
            t += `│ ${getIcon(autotyping?.enabled)} Auto Typing Indicator\n`;
            t += `│ ${getIcon(pmblocker?.enabled)} PM Blocker\n`;
            t += `│ ${getIcon(anticall?.enabled)} Anti Call\n`;
            t += `│ ${getIcon(autoReact)} Auto Reaction\n`;
            t += `└────────────────────────────\n\n`;

            if (isGroup) {
                // Group-specific settings
                const groupAntilink  = allGroup.antilink    || {};
                const groupBadword   = allGroup.antibadword || {};
                const groupAntitag   = allGroup.antitag     || {};
                const groupChatbot   = allGroup.chatbot     || false;
                const groupWelcome   = allGroup.welcome     || false;
                const groupGoodbye   = allGroup.goodbye     || false;
                const groupAntispam  = allGroup.antispam    || {};
                const groupAntibot   = allGroup.antibot     || {};
                const groupDisappear = allGroup.disappear   || {};
                const groupMute      = allGroup.mute        || {};

                t += `┌─ 👥 *GROUP FEATURES* ──────\n`;
                t += `│ ${getIcon(groupAntilink.enabled)} Antilink\n`;
                t += `│   └ Action: ${groupAntilink.action || 'delete'}\n`;
                t += `│ ${getIcon(groupBadword.enabled)} Anti Badword\n`;
                t += `│ ${getIcon(groupAntitag.enabled)} Anti Tag\n`;
                t += `│ ${getIcon(groupAntispam.enabled)} Anti Spam\n`;
                t += `│   └ Limit: ${groupAntispam.maxMessages || 5} msgs/${groupAntispam.windowSeconds || 5}s\n`;
                t += `│   └ Action: ${groupAntispam.action || 'warn'}\n`;
                t += `│ ${getIcon(groupAntibot.enabled)} Anti Bot\n`;
                t += `│ ${getIcon(groupChatbot)} Chatbot\n`;
                t += `│ ${getIcon(groupWelcome)} Welcome Message\n`;
                t += `│ ${getIcon(groupGoodbye)} Goodbye Message\n`;
                t += `│ ${getIcon(groupDisappear.enabled)} Disappearing Messages\n`;
                t += `│ ${getIcon(groupMute.enabled)} Group Mute\n`;
                t += `└────────────────────────────\n\n`;
            } else {
                t += `💡 _Use in a group for group-specific settings_\n\n`;
            }

            t += `┌─ 💡 *TOGGLE COMMANDS* ──────\n`;
            t += `│ *.settings toggle autostatus on*\n`;
            t += `│ *.settings toggle antispam on*\n`;
            t += `│ *.settings toggle antilink off*\n`;
            t += `│ *.mode public/private/groups*\n`;
            t += `└────────────────────────────\n`;
            t += `\n> ⚙️ *Settings Panel — ${dynName}*`;

            await sock.sendMessage(chatId, {
                text: t,
                mentions: [senderId],
                contextInfo: {
                    externalAdReply: {
                        title: `${dynName} — Settings`,
                        body: `Mode: ${botMode.toUpperCase()} | Prefix: ${dynPrefix}`,
                        thumbnailUrl: settings.botDp || 'https://files.catbox.moe/dfseqs.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                },
                ...channelInfo
            }, { quoted: message });

        } catch (err) {
            console.error('[SETTINGS ERROR]', err.message);
            await sock.sendMessage(chatId, {
                text: `❌ Settings error: ${err.message}`
            }, { quoted: message });
        }
    }
};
