'use strict';

module.exports = {
  command: 'boom',
  aliases: ['booom'],
  category: 'fun',
  description: 'Send a fun BOOM reply',
  usage: '.boom',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key?.remoteJid;
    if (!chatId) return;
    return sock.sendMessage(chatId, {
      text: '💥💣 B O O M ! 💣💥\n🔥 JUNAID-MD 🔥'
    }, { quoted: message });
  }
};
