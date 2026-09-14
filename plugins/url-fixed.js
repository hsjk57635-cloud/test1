'use strict';

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { uploadFile } = require('../lib/uploaders');

module.exports = {
  command: 'url',
  aliases: ['url3', 'fileurl'],
  category: 'utility',
  description: 'Upload replied media and return a direct URL',
  usage: '.url (reply to image/video/audio/document)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key?.remoteJid;
    if (!chatId) return;

    let tempPath;
    try {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const target = quoted || message.message;
      if (!target) {
        return sock.sendMessage(chatId, { text: '❌ Reply to an image, video, audio, or document with .url' }, { quoted: message });
      }

      let node, mediaType, ext;
      if (target.imageMessage) { node = target.imageMessage; mediaType = 'image'; ext = '.jpg'; }
      else if (target.videoMessage) { node = target.videoMessage; mediaType = 'video'; ext = '.mp4'; }
      else if (target.audioMessage) { node = target.audioMessage; mediaType = 'audio'; ext = '.mp3'; }
      else if (target.documentMessage) {
        node = target.documentMessage; mediaType = 'document';
        ext = path.extname(node.fileName || '') || '.bin';
      } else {
        return sock.sendMessage(chatId, { text: '❌ Unsupported media. Reply to an image, video, audio, or document.' }, { quoted: message });
      }

      await sock.sendMessage(chatId, { text: '⏳ Uploading media, please wait...' }, { quoted: message });
      const stream = await downloadContentFromMessage(node, mediaType);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      if (!buffer.length) throw new Error('Media download returned an empty file');

      tempPath = path.join(os.tmpdir(), `junaid_url_${Date.now()}${ext}`);
      fs.writeFileSync(tempPath, buffer);
      const result = await uploadFile(tempPath);
      if (!result?.url) throw new Error('Uploader did not return a URL');

      await sock.sendMessage(chatId, {
        text: `✅ *URL Generated Successfully*\n\n🔗 ${result.url}`
      }, { quoted: message });
    } catch (err) {
      console.error('[URL] Error:', err);
      await sock.sendMessage(chatId, { text: `❌ URL upload failed: ${err.message || 'Unknown error'}` }, { quoted: message });
    } finally {
      if (tempPath) { try { fs.unlinkSync(tempPath); } catch {} }
    }
  }
};
