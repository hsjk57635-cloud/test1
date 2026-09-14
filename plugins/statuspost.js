'use strict';
// .statuspost — post ONE WhatsApp status on EVERY paired session at once.
// (Also available as .panel poststatus / .panel poststatusimg)
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function imageFromMessage(message) {
  const img = message.message?.imageMessage ||
              message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!img) throw new Error('Reply to an image with .statuspostimg');
  const stream = await downloadContentFromMessage(img, 'image');
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks);
}

module.exports = [
  {
    command: 'statuspost',
    aliases: ['poststatus', 'sendstatus'],
    category: 'owner',
    description: 'Post a text status on ALL paired sessions at once',
    usage: '.statuspost <text>',
    ownerOnly: true,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = args.join(' ').trim();
      if (!text) {
        return sock.sendMessage(chatId, {
          text: '📤 *Status Broadcast*\n\nUsage: `.statuspost <text>`\n\nPosts this status from EVERY paired session.\n\nImage version: reply to an image with `.statuspostimg`'
        }, { quoted: message });
      }
      if (typeof global.postStatusToAll !== 'function') {
        return sock.sendMessage(chatId, { text: '❌ Status broadcast service not ready yet. Try again in a few seconds.' }, { quoted: message });
      }
      await sock.sendMessage(chatId, { text: '📤 Posting status on all paired sessions...' }, { quoted: message });
      const res = await global.postStatusToAll({ text });
      return sock.sendMessage(chatId, {
        text: `✅ Status posted on *${res.ok}* session(s)${res.failed ? `, *${res.failed}* failed` : ''}.${res.errors.length ? `\n\n⚠️ ${res.errors.slice(0, 3).join('\n')}` : ''}`
      }, { quoted: message });
    }
  },
  {
    command: 'statuspostimg',
    aliases: ['poststatusimg', 'sendstatusimg'],
    category: 'owner',
    description: 'Post a status image on ALL paired sessions at once',
    usage: '.statuspostimg (reply to an image) [caption]',
    ownerOnly: true,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      if (typeof global.postStatusToAll !== 'function') {
        return sock.sendMessage(chatId, { text: '❌ Status broadcast service not ready yet. Try again in a few seconds.' }, { quoted: message });
      }
      try {
        const buf = await imageFromMessage(message);
        const caption = args.join(' ').trim() || undefined;
        await sock.sendMessage(chatId, { text: '📤 Posting status image on all paired sessions...' }, { quoted: message });
        const res = await global.postStatusToAll(caption ? { image: buf, caption } : { image: buf });
        return sock.sendMessage(chatId, {
          text: `✅ Status image posted on *${res.ok}* session(s)${res.failed ? `, *${res.failed}* failed` : ''}.`
        }, { quoted: message });
      } catch (e) {
        return sock.sendMessage(chatId, { text: `❌ ${e.message}` }, { quoted: message });
      }
    }
  }
];
