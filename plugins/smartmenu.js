/*****************************************************************************
 *  JUNAID-MD↣³⁰² - SMART MENU (.smenu)
 *  Number-selection category menu — send category number to get command list
 *  NOTE: .menu is NOT touched. Only .smenu is changed.
 *****************************************************************************/

const CommandHandler = require('../lib/commandHandler');
const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const { selectionHandler } = require('../lib/selectionHandler');

const LOGO = `╔══════════════════════════╗
║   🤖  JUNAID-MD↣³⁰² B O T   ║
║     by JUNAID-MD↣³⁰²     ║
╚══════════════════════════╝`;

const CAT_EMOJI = {
    general: '📱', owner: '👑', admin: '🛡️', group: '👥',
    download: '📥', ai: '🤖', search: '🔍', fun: '🎮',
    sticker: '🎭', tools: '🔧', info: 'ℹ️', games: '🕹️',
    images: '🖼️', music: '🎵', stalk: '👀', quotes: '💬',
    utility: '⚙️', nsfw: '🔞', apks: '📲',
};

function catEmoji(cat) {
    return CAT_EMOJI[cat.toLowerCase()] || '📂';
}

function formatTime() {
    return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: settings.timeZone || 'Asia/Karachi'
    });
}

module.exports = {
    command: 'smenu',
    aliases: ['shelp', 'smart'],
    category: 'general',
    description: 'Interactive numbered category menu',
    usage: '.smenu  or  .smenu <category>  or  .smenu <number>',
    isPrefixless: false,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        try {
            // ✅ FIX: was reading settings.botName only — after `.botname <new>`
            // saves to the DB, this stayed on the old default forever within
            // the same process. Check the saved value first, same as menu.js.
            const store = require('../lib/lightweight_store');
            const dynamicBotName = await store.getSetting('global', 'botName') || settings.botName;

            const categories = Array.from(CommandHandler.categories.keys());
            const query = args.join(' ').trim().toLowerCase();

            // If user sent a number or category name, show that category
            const numInput = parseInt(query);
            let targetCat = null;

            if (!isNaN(numInput) && numInput >= 1 && numInput <= categories.length) {
                targetCat = categories[numInput - 1];
            } else if (query && categories.some(c => c.toLowerCase() === query)) {
                targetCat = categories.find(c => c.toLowerCase() === query);
            }

            if (targetCat) {
                // Show commands in this category
                const cmds = CommandHandler.getCommandsByCategory(targetCat);
                const prefix = settings.prefixes?.[0] || '.';

                let text = `${catEmoji(targetCat)} *${targetCat.toUpperCase()} COMMANDS*\n`;
                text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

                cmds.forEach((cmdName, i) => {
                    const isOff = CommandHandler.disabledCommands?.has(cmdName.toLowerCase());
                    const status = isOff ? '❌' : '✅';
                    text += `${status} \`${prefix}${cmdName}\`\n`;
                });

                text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
                text += `📊 *${cmds.length} commands* in this category\n`;
                text += `Type \`.smenu\` to go back to main menu`;

                await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
                return;
            }

            // Show main numbered menu
            const totalCmds = CommandHandler.commands.size;
            const prefix = settings.prefixes?.[0] || '.';

            let menuText = `${LOGO}\n\n`;
            menuText += `📱 *Bot:* ${dynamicBotName}\n`;
            menuText += `👤 *Owner:* ${settings.botOwner || 'JUNAID-MD↣³⁰²'}\n`;
            menuText += `🔖 *Prefix:* ${prefix}\n`;
            menuText += `⏰ *Time:* ${formatTime()}\n`;
            menuText += `📦 *Commands:* ${totalCmds}\n\n`;
            menuText += `━━━━━━━━━━━━━━━━━━━━\n`;
            menuText += `📋 *CATEGORIES — Send number to view*\n`;
            menuText += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            categories.forEach((cat, i) => {
                const cmds = CommandHandler.getCommandsByCategory(cat);
                const emoji = catEmoji(cat);
                menuText += `*${i + 1}.* ${emoji} ${cat.toUpperCase()} — (${cmds.length} cmds)\n`;
            });

            menuText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
            menuText += `💡 *Reply with a number* (1–${categories.length})\n`;
            menuText += `or type \`.smenu <name>\` e.g. \`.smenu download\`\n`;
            menuText += `━━━━━━━━━━━━━━━━━━━━`;

            // Register a selection handler for this user's next reply
            const senderId = message.key.participant || message.key.remoteJid;
            const pendingKey = `smenu_${chatId}_${senderId}`;

            // Store pending selection (expires in 60s)
            global._smenuPending = global._smenuPending || new Map();
            global._smenuPending.set(pendingKey, {
                categories,
                expires: Date.now() + 60000
            });

            const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
            const thumbnail = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null;

            if (thumbnail) {
                await sock.sendMessage(chatId, {
                    image: thumbnail,
                    caption: menuText,
                    ...channelInfo
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { text: menuText, ...channelInfo }, { quoted: message });
            }

        } catch (err) {
            console.error('[SMENU] Error:', err);
            await sock.sendMessage(chatId, { text: `❌ Menu error: ${err.message}`, ...channelInfo }, { quoted: message });
        }
    }
};
