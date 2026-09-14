'use strict';
// HARD FIX: .mode private / .modeprivate must immediately put the bot in PRIVATE mode.
// Uses the same owner/sudo context supplied by messageHandler and persists the mode.
const store = require('../lib/lightweight_store');

function isAllowed(context = {}, message = {}) {
  return !!(message.key?.fromMe || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck || context.isOwner || context.isSudo);
}

async function setPrivate(sock, message, context) {
  const chatId = context.chatId || message.key.remoteJid;
  if (!isAllowed(context, message)) {
    return sock.sendMessage(chatId, { text: '❌ Only the bot owner or sudo can enable PRIVATE mode.' }, { quoted: message });
  }
  await store.setBotMode('private');
  global.BOT_MODE = 'private';
  try {
    if (global.deploys && global.DEPLOY_ID && global.deploys[global.DEPLOY_ID]) global.deploys[global.DEPLOY_ID].mode = 'private';
  } catch {}
  if (typeof global._bustSpeedCache === 'function') global._bustSpeedCache();
  return sock.sendMessage(chatId, {
    text: '🔒 *PRIVATE MODE ENABLED*\n\nOnly the owner and sudo users can use the bot now.\n\nUse `.mode public` to make the bot public again.'
  }, { quoted: message });
}

module.exports = {
  command: 'modeprivate',
  aliases: ['private-mode', 'private'],
  category: 'owner',
  description: 'Enable private mode',
  usage: '.modeprivate',
  handler: setPrivate
};
