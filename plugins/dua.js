'use strict';

module.exports = {
  command: 'dua',
  aliases: ['duaa'],
  category: 'islamic',
  description: 'Send a short dua',
  usage: '.dua',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key?.remoteJid;
    if (!chatId) return;
    return sock.sendMessage(chatId, {
      text: '🤲 بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ\n\nاللّٰهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي۔\n\n🤲 اے اللہ! ہمیں معاف فرما، ہم پر رحم فرما، ہمیں ہدایت دے، عافیت عطا فرما اور حلال رزق عطا فرما۔ آمین۔ ❤️'
    }, { quoted: message });
  }
};
