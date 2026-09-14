'use strict';

/**
 * .dp2 — Get a WhatsApp user's profile picture.
 * Supports: .dp2, .dp2 @user, .dp2 <number>, or reply to a user.
 */
module.exports = {
  command: 'dp2',
  category: 'general',
  description: 'Get a user profile picture',
  usage: '.dp2 @user | reply | number',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key?.remoteJid;
    if (!chatId) return;

    try {
      const info = message.message?.extendedTextMessage?.contextInfo || {};
      let target = info.mentionedJid?.[0] || info.participant;

      if (!target && args[0]) {
        const number = args[0].replace(/[^0-9]/g, '');
        if (number.length < 7) {
          return sock.sendMessage(chatId, {
            text: '❌ Invalid number. Use .dp2 @user, reply to a user, or enter a WhatsApp number.'
          }, { quoted: message });
        }
        target = `${number}@s.whatsapp.net`;
      }

      if (!target) target = message.key?.participant || message.key?.remoteJid;
      if (!target) return;

      // Resolve LID to the participant's real JID when used in a group.
      if (target.endsWith('@lid') && chatId.endsWith('@g.us')) {
        const metadata = await sock.groupMetadata(chatId);
        const participant = metadata.participants?.find(p => p.lid === target || p.id === target);
        if (participant?.id) target = participant.id;
      }

      const ppUrl = await sock.profilePictureUrl(target, 'image');
      if (!ppUrl) throw new Error('No profile picture');

      let name = 'User';
      try {
        const n = await sock.getName(target);
        if (n) name = n;
      } catch {}

      await sock.sendMessage(chatId, {
        image: { url: ppUrl },
        caption: `🖼️ *Profile Picture*\n\n👤 ${name}`
      }, { quoted: message });
    } catch (error) {
      console.error('[DP2] Error:', error.message);
      await sock.sendMessage(chatId, {
        text: '❌ This user has no accessible profile picture.'
      }, { quoted: message });
    }
  }
};
