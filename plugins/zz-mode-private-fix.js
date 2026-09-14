'use strict';

// MODE PRIVATE FIX
// Provides explicit aliases and a stable plugin implementation for installations
// that route .mode through the normal command loader instead of index.js.
const store = require('../lib/lightweight_store');

module.exports = {
  command: 'modeprivate',
  aliases: ['private-mode', 'private'],
  category: 'owner',
  description: 'Set bot access mode to PRIVATE (owner + sudo only)',
  usage: '.modeprivate',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const isOwnerOrSudo = !!(
      message.key?.fromMe ||
      context.isOwner ||
      context.isOwnerOrSudo ||
      context.senderIsOwnerOrSudo ||
      context.isSudo
    );
    if (!isOwnerOrSudo) {
      return sock.sendMessage(chatId, { text: '❌ Only the bot owner or sudo can enable PRIVATE mode.' }, { quoted: message });
    }
    await store.setBotMode('private');
    global.BOT_MODE = 'private';
    if (typeof global._bustSpeedCache === 'function') global._bustSpeedCache();
    return sock.sendMessage(chatId, {
      text: '🔒 *PRIVATE MODE ENABLED*\n\nOnly the bot owner and sudo users can use the bot now.\n\nUse `.mode public` to return to public mode.'
    }, { quoted: message });
  }
};
