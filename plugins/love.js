'use strict';

module.exports = {
  command: 'love',
  aliases: ['luv'],
  category: 'fun',
  description: 'Send a cute love reply',
  usage: '.love',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key?.remoteJid;
    if (!chatId) return;
    const replies = [
      '❤️ Love you too! 🥰',
      '💖 Dil se love! 😘',
      '🥰 Awww, so much love! ❤️',
      '💕 Love vibes only! 😍',
      '😘❤️ Junaid MD ki taraf se full love! 💖'
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    return sock.sendMessage(chatId, { text: reply }, { quoted: message });
  }
};
