'use strict';

module.exports = {
  command: 'jaan',
  aliases: ['jan'],
  category: 'fun',
  description: 'Send a cute Jaan reply',
  usage: '.jaan',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key?.remoteJid;
    if (!chatId) return;
    const replies = [
      '❤️ Jaan, bolo... main yahin hoon 😘',
      '🥰 Ji jaan, kya hua?',
      '💖 Haan jaan, batao kya chahiye?',
      '😘 Jaan keh diya, ab dil bhi rakh lo ❤️'
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    return sock.sendMessage(chatId, { text: reply }, { quoted: message });
  }
};
