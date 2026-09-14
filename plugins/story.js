'use strict';
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function downloadMedia(msg, type) {
  const stream = await downloadContentFromMessage(msg, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function getQuoted(message) {
  return message?.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    message?.message?.imageMessage?.contextInfo?.quotedMessage ||
    message?.message?.videoMessage?.contextInfo?.quotedMessage ||
    message?.message?.audioMessage?.contextInfo?.quotedMessage;
}

module.exports = {
  command: 'story',
  aliases: ['statusstory', 'poststory'],
  category: 'owner',
  description: 'Post text, image, video or audio to WhatsApp Status',
  usage: '.story <text> OR reply to media with .story [caption]',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const { chatId, channelInfo } = context;
    const quoted = getQuoted(message);
    const text = args.join(' ').trim();

    if (!quoted && !text) {
      return sock.sendMessage(chatId, {
        text: '📖 *Story / Status*\n\n• `.story Hello` — text status\n• Reply to an image/video/audio with `.story [caption]` — media status',
        ...channelInfo
      }, { quoted: message });
    }

    try {
      await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
      let content;

      if (quoted?.imageMessage) {
        const media = await downloadMedia(quoted.imageMessage, 'image');
        content = { image: media, caption: text || '' };
      } else if (quoted?.videoMessage) {
        const media = await downloadMedia(quoted.videoMessage, 'video');
        content = { video: media, caption: text || '' };
      } else if (quoted?.audioMessage) {
        const media = await downloadMedia(quoted.audioMessage, 'audio');
        content = {
          audio: media,
          mimetype: quoted.audioMessage.mimetype || 'audio/ogg; codecs=opus',
          ptt: !!quoted.audioMessage.ptt
        };
      } else if (quoted) {
        return sock.sendMessage(chatId, {
          text: '❌ Reply to an image, video, or audio message.',
          ...channelInfo
        }, { quoted: message });
      } else {
        content = { text };
      }

      // WhatsApp Status broadcast. No fake confirmation: success is returned only
      // after Baileys accepts the sendMessage call.
      await sock.sendMessage('status@broadcast', content);
      await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
      return sock.sendMessage(chatId, {
        text: '✅ *Story posted successfully!*\nAll your contacts can see it.',
        ...channelInfo
      }, { quoted: message });
    } catch (err) {
      console.error('[STORY] post failed:', err);
      await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } }).catch(() => {});
      return sock.sendMessage(chatId, {
        text: `❌ *Story failed*\n${err?.message || 'Unable to post status.'}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
