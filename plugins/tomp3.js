'use strict';

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const os = require('os');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

function quotedMessageOf(message) {
  const m = message?.message || {};
  return m?.extendedTextMessage?.contextInfo?.quotedMessage ||
    m?.buttonsResponseMessage?.contextInfo?.quotedMessage ||
    m?.templateButtonReplyMessage?.contextInfo?.quotedMessage ||
    m?.interactiveResponseMessage?.contextInfo?.quotedMessage || null;
}

module.exports = {
  command: 'tomp3',
  aliases: ['tomp3', 'mp3convert'],
  category: 'converter',
  description: 'Convert replied video/audio to MP3',
  usage: '.tomp3 (reply to a video or audio)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key?.remoteJid;
    if (!chatId) return;

    let inputPath, outputPath;
    try {
      const quoted = quotedMessageOf(message);
      const target = quoted || message.message || {};
      let node, mediaType, inputExt;

      if (target.videoMessage) {
        node = target.videoMessage;
        mediaType = 'video';
        inputExt = '.mp4';
      } else if (target.audioMessage) {
        node = target.audioMessage;
        mediaType = 'audio';
        inputExt = '.audio';
      } else {
        return sock.sendMessage(chatId, {
          text: '❌ Reply to a video or audio with *.tomp3* to convert it to MP3.'
        }, { quoted: message });
      }

      await sock.sendMessage(chatId, { text: '⏳ Converting to MP3, please wait...' }, { quoted: message });

      const stream = await downloadContentFromMessage(node, mediaType);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      if (!buffer.length) throw new Error('Media download returned an empty file');

      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      inputPath = path.join(os.tmpdir(), `junaid_tomp3_${id}${inputExt}`);
      outputPath = path.join(os.tmpdir(), `junaid_tomp3_${id}.mp3`);
      fs.writeFileSync(inputPath, buffer);

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .noVideo()
          .audioCodec('libmp3lame')
          .audioBitrate('128k')
          .format('mp3')
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });

      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        throw new Error('MP3 conversion produced an empty file');
      }

      await sock.sendMessage(chatId, {
        audio: { url: outputPath },
        mimetype: 'audio/mpeg',
        fileName: 'JUNAID-MD-302.mp3',
        ptt: false
      }, { quoted: message });
    } catch (err) {
      console.error('[TOMP3] Error:', err);
      await sock.sendMessage(chatId, {
        text: `❌ MP3 conversion failed: ${err.message || 'Unknown error'}`
      }, { quoted: message });
    } finally {
      if (inputPath) { try { fs.unlinkSync(inputPath); } catch (_) {} }
      if (outputPath) { setTimeout(() => { try { fs.unlinkSync(outputPath); } catch (_) {} }, 30000); }
    }
  }
};
