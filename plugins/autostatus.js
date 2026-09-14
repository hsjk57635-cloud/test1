/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const configPath = path.join(process.cwd(), 'data', 'autoStatus.json');

// Cache to avoid processing the same status multiple times
const processedStatusIds = new Set();
setInterval(() => processedStatusIds.clear(), 60 * 60 * 1000);

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363408055942569@newsletter',
            newsletterName: 'JUNAID-MD↣³⁰²',
            serverMessageId: -1
        }
    }
};

async function readConfig() {
    try {
        if (HAS_DB) {
            const config = await store.getSetting('global', 'autoStatus');
            return config || {
                enabled: false,
                reactOn: false,
                reactEmoji: '💚',
                reactText: ''
            };
        } else {
            if (!fs.existsSync(configPath)) {
                fs.mkdirSync(path.dirname(configPath), { recursive: true });
                fs.writeFileSync(configPath, JSON.stringify({
                    enabled: false,
                    reactOn: false,
                    reactEmoji: '💚',
                    reactText: ''
                }, null, 2));
            }
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch {
        return {
            enabled: false,
            reactOn: false,
            reactEmoji: '💚',
            reactText: ''
        };
    }
}

async function writeConfig(config) {
    try {
        if (HAS_DB) {
            await store.saveSetting('global', 'autoStatus', config);
        } else {
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
    } catch (error) {
        console.error('Error writing auto status config:', error);
    }
}

async function isAutoStatusEnabled() {
    const config = await readConfig();
    return config.enabled;
}

async function isStatusReactionEnabled() {
    const config = await readConfig();
    return config.reactOn;
}

async function reactToStatus(sock, statusKey) {
    try {
        const config = await readConfig();
        if (!config.reactOn) return;

        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: config.reactEmoji
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
        console.log(`✅ Reacted to status with ${config.reactEmoji}`);
    } catch (error) {
        console.error('❌ Error reacting to status:', error.message);
    }
}

async function handleStatusUpdate(sock, status) {
    try {
        const config = await readConfig();
        if (!config.enabled) return;

        await new Promise(resolve => setTimeout(resolve, 1000));

        let key = null;
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                key = msg.key;
            }
        } else if (status.key && status.key.remoteJid === 'status@broadcast') {
            key = status.key;
        } else if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            key = status.reaction.key;
        }

        if (!key) return;

        if (processedStatusIds.has(key.id)) {
            console.log('⏭️ Status already processed, skipping');
            return;
        }
        processedStatusIds.add(key.id);

        try {
            await sock.readMessages([key]);
            console.log('✅ Viewed status');
            if (config.reactText) {
                // Optionally send a text reaction (comment) – WhatsApp doesn't support text comments on status, but we can send a DM?
                // For now, just react with emoji.
            }
            await reactToStatus(sock, key);
        } catch (err) {
            if (err.message?.includes('rate-overlimit')) {
                console.log('⚠️ Rate limit hit, waiting...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                await sock.readMessages([key]);
                await reactToStatus(sock, key);
            } else throw err;
        }
    } catch (error) {
        console.error('❌ Error in auto status view:', error.message);
    }
}

module.exports = {
    command: 'autostatus',
    aliases: ['autoview', 'statusview'],
    category: 'owner',
    description: 'Automatically view and react to WhatsApp statuses',
    usage: `
        .autostatus on|off                      – Enable/disable auto view
        .autostatus react on|off                 – Enable/disable reactions
        .autostatus emoji <emoji>                 – Set reaction emoji (default 💚)
        .autostatus text <text>                    – Set custom text (not used yet)
        .autostatus status                         – Show current settings
    `,
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const config = await readConfig();

            if (args.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `🔄 *Auto Status – JUNAID-MD↣³⁰²*\n\n` +
                          `Auto View: ${config.enabled ? '✅' : '❌'}\n` +
                          `Reactions: ${config.reactOn ? '✅' : '❌'}\n` +
                          `Reaction Emoji: ${config.reactEmoji}\n` +
                          `Custom Text: ${config.reactText || '(none)'}\n\n` +
                          `Commands:\n` +
                          `• \`.autostatus on/off\`\n` +
                          `• \`.autostatus react on/off\`\n` +
                          `• \`.autostatus emoji <emoji>\`\n` +
                          `• \`.autostatus text <text>\`\n` +
                          `• \`.autostatus status\``,
                    ...channelInfo
                }, { quoted: message });
            }

            const subCmd = args[0].toLowerCase();

            if (subCmd === 'status') {
                return await sock.sendMessage(chatId, {
                    text: `🔄 *Auto Status*\n\n` +
                          `Enabled: ${config.enabled ? '✅' : '❌'}\n` +
                          `Reactions: ${config.reactOn ? '✅' : '❌'}\n` +
                          `Emoji: ${config.reactEmoji}\n` +
                          `Text: ${config.reactText || '(none)'}\n` +
                          `Storage: ${HAS_DB ? 'Database' : 'File'}`,
                    ...channelInfo
                }, { quoted: message });
            }

            if (subCmd === 'on') {
                config.enabled = true;
                await writeConfig(config);
                return await sock.sendMessage(chatId, { text: '✅ Auto status view enabled.', ...channelInfo }, { quoted: message });
            }

            if (subCmd === 'off') {
                config.enabled = false;
                await writeConfig(config);
                return await sock.sendMessage(chatId, { text: '❌ Auto status view disabled.', ...channelInfo }, { quoted: message });
            }

            if (subCmd === 'react') {
                if (args.length < 2) return await sock.sendMessage(chatId, { text: '❌ Usage: .autostatus react on/off', ...channelInfo }, { quoted: message });
                const reactSub = args[1].toLowerCase();
                if (reactSub === 'on') {
                    config.reactOn = true;
                    await writeConfig(config);
                    return await sock.sendMessage(chatId, { text: '💫 Reactions enabled.', ...channelInfo }, { quoted: message });
                } else if (reactSub === 'off') {
                    config.reactOn = false;
                    await writeConfig(config);
                    return await sock.sendMessage(chatId, { text: '❌ Reactions disabled.', ...channelInfo }, { quoted: message });
                } else {
                    return await sock.sendMessage(chatId, { text: '❌ Use on/off.', ...channelInfo }, { quoted: message });
                }
            }

            if (subCmd === 'emoji') {
                if (args.length < 2) return await sock.sendMessage(chatId, { text: '❌ Usage: .autostatus emoji <emoji>', ...channelInfo }, { quoted: message });
                const emoji = args[1];
                config.reactEmoji = emoji;
                await writeConfig(config);
                return await sock.sendMessage(chatId, { text: `✅ Reaction emoji set to ${emoji}.`, ...channelInfo }, { quoted: message });
            }

            if (subCmd === 'text') {
                if (args.length < 2) return await sock.sendMessage(chatId, { text: '❌ Usage: .autostatus text <text>', ...channelInfo }, { quoted: message });
                const text = args.slice(1).join(' ');
                config.reactText = text;
                await writeConfig(config);
                return await sock.sendMessage(chatId, { text: `✅ Custom text set. (Currently not used, reserved for future)`, ...channelInfo }, { quoted: message });
            }

            return await sock.sendMessage(chatId, {
                text: '❌ Unknown subcommand. Use `.autostatus` for help.',
                ...channelInfo
            }, { quoted: message });

        } catch (error) {
            console.error('Error in autostatus command:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *Error occurred while managing auto status!*\n\nError: ' + error.message,
                ...channelInfo
            }, { quoted: message });
        }
    },

    handleStatusUpdate,
    isAutoStatusEnabled,
    isStatusReactionEnabled,
    reactToStatus,
    readConfig,
    writeConfig
};
