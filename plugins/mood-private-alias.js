'use strict';
// Compatibility command: .mood private is treated as .mode private.
// Keeps the user's requested command while using the bot's existing mode system.
const store = require('../lib/lightweight_store');

function allowed(context = {}, message = {}) {
  return !!(message.key?.fromMe || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck || context.isOwner || context.isSudo);
}

async function handler(sock, message, args, context = {}) {
  const chatId = context.chatId || message.key.remoteJid;
  const mode = String(args[0] || '').toLowerCase().trim();
  if (mode !== 'private') {
    return sock.sendMessage(chatId, { text: 'Usage: `.mood private`\n\nThis command enables PRIVATE mode (Owner + Sudo only).' }, { quoted: message });
  }
  if (!allowed(context, message)) {
    return sock.sendMessage(chatId, { text: '❌ Only the bot owner or sudo can enable PRIVATE mode.' }, { quoted: message });
  }
  await store.setBotMode('private');
  global.BOT_MODE = 'private';
  try {
    if (global.deploys && global.DEPLOY_ID && global.deploys[global.DEPLOY_ID]) global.deploys[global.DEPLOY_ID].mode = 'private';
  } catch {}
  if (typeof global._bustSpeedCache === 'function') global._bustSpeedCache();
  return sock.sendMessage(chatId, { text: '🔒 *PRIVATE MODE ENABLED*\n\nOnly the Owner and Sudo users can use the bot now.\n\nUse `.mode public` to return to public mode.' }, { quoted: message });
}

module.exports = {
  command: 'mood',
  aliases: ['moodprivate'],
  category: 'owner',
  description: 'Compatibility command for private mode',
  usage: '.mood private',
  handler
};
