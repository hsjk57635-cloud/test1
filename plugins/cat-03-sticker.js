'use strict';
// AUTO-GENERATED BUNDLE: cat-03-sticker
// Contains: stickers.js, sticker2.js, sticker-alt.js, stickercrop.js, stickername.js, stickerpack.js, stickertelegram.js, take.js, emojimix.js, simage.js, igs.js, igsc.js, attp.js, grayscale.js, sepia.js, invert.js, sharpen.js, img-blur.js, resize.js, gif.js, randompic.js, random-img.js, quoted.js, exad.js, excard.js

const _bundle = [];


/* ===== stickers.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('stickers-formatter');

module.exports = {
  command: 'sticker',
  aliases: ['s', 'sk'],
  category: 'stickers',
  description: 'Create a sticker from an image or video',
  usage: '.sticker (reply to image/video) [type]',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted || !(quoted.imageMessage || quoted.videoMessage)) {
      return await sock.sendMessage(chatId, {
        text: '❌ Reply to an image or video.',
        ...channelInfo
      }, { quoted: message });
    }

    // Optional sticker type from args (default, full, circle, rounded, crop)
    const typeArg = args[0]?.toLowerCase();
    const typeMap = {
      default: StickerTypes.DEFAULT,
      full: StickerTypes.FULL,
      circle: StickerTypes.CIRCLE,
      rounded: StickerTypes.ROUNDED,
      crop: StickerTypes.CROPPED
    };
    const stickerType = typeMap[typeArg] || StickerTypes.DEFAULT;

    try {
      const mediaType = quoted.imageMessage ? 'image' : 'video';
      const stream = await downloadContentFromMessage(
        quoted.imageMessage || quoted.videoMessage,
        mediaType
      );

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Create sticker with stickers-formatter
      const sticker = new Sticker(buffer, {
        pack: 'REDX Stickers',
        author: 'Abdul Rehman & Muzamil',
        type: stickerType,
        quality: 80,
        categories: ['🤖', '✨']
      });

      const stickerBuffer = await sticker.toBuffer();

      await sock.sendMessage(chatId, {
        sticker: stickerBuffer,
        ...channelInfo
      }, { quoted: message });

    } catch (error) {
      console.error('Sticker creation error:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to create sticker.',
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading stickers.js:', e.message); }

/* ===== sticker2.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const webp = require('node-webpmux');
const crypto = require('crypto');

module.exports = {
  command: 'sticker2',
  aliases: ['s2', 'stik2'],
  category: 'stickers',
  description: 'Convert image/video to sticker',
  usage: '.sticker2 (reply to image/video or send with caption)',
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const messageToQuote = message;
    let targetMessage = message;

    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quotedInfo = message.message.extendedTextMessage.contextInfo;
      targetMessage = {
        key: {
          remoteJid: chatId,
          id: quotedInfo.stanzaId,
          participant: quotedInfo.participant
        },
        message: quotedInfo.quotedMessage
      };
    }

    const mediaMessage = targetMessage.message?.imageMessage || targetMessage.message?.videoMessage || targetMessage.message?.documentMessage;

    if (!mediaMessage) {
      await sock.sendMessage(chatId, { 
        text: 'Please reply to an image/video with .sticker2, or send an image/video with .sticker2 as the caption.',
        ...channelInfo
      }, { quoted: messageToQuote });
      return;
    }

    try {
      const mediaBuffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { 
        logger: undefined, 
        reuploadRequest: sock.updateMediaMessage 
      });

      if (!mediaBuffer) {
        await sock.sendMessage(chatId, { 
          text: 'Failed to download media. Please try again.',
          ...channelInfo
        }, { quoted: messageToQuote });
        return;
      }

      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const tempInput = path.join(tmpDir, `temp_${Date.now()}`);
      const tempOutput = path.join(tmpDir, `sticker_${Date.now()}.webp`);

      fs.writeFileSync(tempInput, mediaBuffer);

      const isAnimated = mediaMessage.mimetype?.includes('gif') || 
                        mediaMessage.mimetype?.includes('video') || 
                        mediaMessage.seconds > 0;

      const ffmpegCommand = isAnimated
        ? `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`
        : `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;

      await new Promise((resolve, reject) => {
        exec(ffmpegCommand, (error) => {
          if (error) {
            console.error('FFmpeg error:', error);
            reject(error);
          } else resolve();
        });
      });

      let webpBuffer = fs.readFileSync(tempOutput);
      
      if (isAnimated && webpBuffer.length > 1000 * 1024) {
        try {
          const tempOutput2 = path.join(tmpDir, `sticker_fallback_${Date.now()}.webp`);
          const fileSizeKB = mediaBuffer.length / 1024;
          const isLargeFile = fileSizeKB > 5000;
          const fallbackCmd = isLargeFile
            ? `ffmpeg -y -i "${tempInput}" -t 2 -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=8,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput2}"`
            : `ffmpeg -y -i "${tempInput}" -t 3 -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=12,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 45 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput2}"`;
          await new Promise((resolve, reject) => {
            exec(fallbackCmd, (error) => error ? reject(error) : resolve());
          });
          if (fs.existsSync(tempOutput2)) {
            webpBuffer = fs.readFileSync(tempOutput2);
            try { fs.unlinkSync(tempOutput2); } catch {}
          }
        } catch {}
      }

      const img = new webp.Image();
      await img.load(webpBuffer);

      const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': settings.packname || 'JUNAID-MD↣³⁰²',
        'emojis': ['🤖']
      };

      const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;

      let finalBuffer = await img.save(null);

      if (isAnimated && finalBuffer.length > 900 * 1024) {
        try {
          const tempOutput3 = path.join(tmpDir, `sticker_small_${Date.now()}.webp`);
          const smallCmd = `ffmpeg -y -i "${tempInput}" -t 2 -vf "scale=320:320:force_original_aspect_ratio=decrease,fps=8,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 80k -max_muxing_queue_size 1024 "${tempOutput3}"`;
          await new Promise((resolve, reject) => {
            exec(smallCmd, (error) => error ? reject(error) : resolve());
          });
          if (fs.existsSync(tempOutput3)) {
            const smallWebp = fs.readFileSync(tempOutput3);
            const img2 = new webp.Image();
            await img2.load(smallWebp);
            const json2 = {
              'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
              'sticker-pack-name': settings.packname || 'JUNAID-MD↣³⁰²',
              'emojis': ['🤖']
            };
            const exifAttr2 = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer2 = Buffer.from(JSON.stringify(json2), 'utf8');
            const exif2 = Buffer.concat([exifAttr2, jsonBuffer2]);
            exif2.writeUIntLE(jsonBuffer2.length, 14, 4);
            img2.exif = exif2;
            finalBuffer = await img2.save(null);
            try { fs.unlinkSync(tempOutput3); } catch {}
          }
        } catch {}
      }

      await sock.sendMessage(chatId, { 
        sticker: finalBuffer,
        ...channelInfo
      }, { quoted: messageToQuote });

      try {
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);
      } catch (err) {
        console.error('Error cleaning up temp files:', err);
      }

    } catch (error) {
      console.error('Error in sticker command:', error);
      await sock.sendMessage(chatId, { 
        text: 'Failed to create sticker! Try again later.',
        ...channelInfo
      }, { quoted: messageToQuote });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading sticker2.js:', e.message); }

/* ===== sticker-alt.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    command: 'sticker',
    aliases: ['stik', 's'],
    category: 'stickers',
    description: 'Convert an image or video into a sticker',
    usage: '.sticker (reply to image/video)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please reply to an image or video!' }, { quoted: message });
                return;
            }

            const type = Object.keys(quotedMsg)[0];
            if (!['imageMessage', 'videoMessage'].includes(type)) {
                await sock.sendMessage(chatId, { text: '⚠️ Please reply to an image or video!' }, { quoted: message });
                return;
            }

            const stream = await downloadContentFromMessage(quotedMsg[type], type.split('Message')[0]);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempInput = path.join(tempDir, `temp_${Date.now()}.${type === 'imageMessage' ? 'jpg' : 'mp4'}`);
            const tempOutput = path.join(tempDir, `sticker_${Date.now()}.webp`);

            fs.writeFileSync(tempInput, buffer);

            await new Promise((resolve, reject) => {
                const cmd = type === 'imageMessage'
                    ? `ffmpeg -i "${tempInput}" -vf "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease" "${tempOutput}"`
                    : `ffmpeg -i "${tempInput}" -vf "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease" -c:v libwebp -preset default -loop 0 -vsync 0 -t 6 "${tempOutput}"`;

                exec(cmd, (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });

            await sock.sendMessage(chatId, { sticker: fs.readFileSync(tempOutput) }, { quoted: message });

            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempOutput);

        } catch (error) {
            console.error('Sticker Command Error:', error);
            await sock.sendMessage(chatId, { text: '❌ Failed to create sticker!' }, { quoted: message });
        }
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading sticker-alt.js:', e.message); }

/* ===== stickercrop.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const webp = require('node-webpmux');
const crypto = require('crypto');

async function stickercropFromBuffer(inputBuffer, isAnimated) {
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const tempInput = path.join(tmpDir, `cropbuf_${Date.now()}`);
  const tempOutput = path.join(tmpDir, `cropbuf_out_${Date.now()}.webp`);

  fs.writeFileSync(tempInput, inputBuffer);
  const fileSizeKB = inputBuffer.length / 1024;
  const isLargeFile = fileSizeKB > 5000;

  let ffmpegCommand;
  if (isAnimated) {
    if (isLargeFile) {
      ffmpegCommand = `ffmpeg -y -i "${tempInput}" -t 2 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput}"`;
    } else {
      ffmpegCommand = `ffmpeg -y -i "${tempInput}" -t 3 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 50 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;
    }
  } else {
    ffmpegCommand = `ffmpeg -y -i "${tempInput}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,format=rgba" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;
  }

  await new Promise((resolve, reject) => {
    exec(ffmpegCommand, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });

  const webpBuffer = fs.readFileSync(tempOutput);

  const img = new webp.Image();
  await img.load(webpBuffer);
  const json = {
    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
    'sticker-pack-name': settings.packname || 'KnightBot',
    'emojis': ['✂️']
  };
  const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  img.exif = exif;
  const finalBuffer = await img.save(null);

  try {
    fs.unlinkSync(tempInput);
    fs.unlinkSync(tempOutput);
  } catch {}

  return finalBuffer;
}

module.exports = {
  command: 'crop',
  aliases: ['stickercrop', 'scrop'],
  category: 'stickers',
  description: 'Crop image/video/sticker to circle sticker',
  usage: '.crop (reply to image/video/sticker)',
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const messageToQuote = message;
    let targetMessage = message;

    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quotedInfo = message.message.extendedTextMessage.contextInfo;
      targetMessage = {
        key: {
          remoteJid: chatId,
          id: quotedInfo.stanzaId,
          participant: quotedInfo.participant
        },
        message: quotedInfo.quotedMessage
      };
    }

    const mediaMessage = targetMessage.message?.imageMessage || targetMessage.message?.videoMessage || targetMessage.message?.documentMessage || targetMessage.message?.stickerMessage;

    if (!mediaMessage) {
      await sock.sendMessage(chatId, { 
        text: 'Please reply to an image/video/sticker with .crop, or send an image/video/sticker with .crop as the caption.',
        ...channelInfo
      }, { quoted: messageToQuote });
      return;
    }

    try {
      const mediaBuffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { 
        logger: undefined, 
        reuploadRequest: sock.updateMediaMessage 
      });

      if (!mediaBuffer) {
        await sock.sendMessage(chatId, { 
          text: 'Failed to download media. Please try again.',
          ...channelInfo
        }, { quoted: messageToQuote });
        return;
      }
      
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      
      const tempInput = path.join(tmpDir, `temp_${Date.now()}`);
      const tempOutput = path.join(tmpDir, `crop_${Date.now()}.webp`);

      fs.writeFileSync(tempInput, mediaBuffer);
      
      const isAnimated = mediaMessage.mimetype?.includes('gif') || 
                        mediaMessage.mimetype?.includes('video') || 
                        mediaMessage.seconds > 0;

      const fileSizeKB = mediaBuffer.length / 1024;
      const isLargeFile = fileSizeKB > 5000;

      let ffmpegCommand;
      
      if (isAnimated) {
        if (isLargeFile) {
          ffmpegCommand = `ffmpeg -i "${tempInput}" -t 2 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput}"`;
        } else {
          ffmpegCommand = `ffmpeg -i "${tempInput}" -t 3 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 50 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;
        }
      } else {
        ffmpegCommand = `ffmpeg -i "${tempInput}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,format=rgba" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;
      }

      await new Promise((resolve, reject) => {
        exec(ffmpegCommand, (error, stdout, stderr) => {
          if (error) {
            console.error('FFmpeg error:', error);
            console.error('FFmpeg stderr:', stderr);
            reject(error);
          } else {
            console.log('FFmpeg stdout:', stdout);
            resolve();
          }
        });
      });

      if (!fs.existsSync(tempOutput)) {
        throw new Error('FFmpeg failed to create output file');
      }

      const outputStats = fs.statSync(tempOutput);
      if (outputStats.size === 0) {
        throw new Error('FFmpeg created empty output file');
      }
      
      let webpBuffer = fs.readFileSync(tempOutput);
      const finalSizeKB = webpBuffer.length / 1024;
      console.log(`Final sticker size: ${Math.round(finalSizeKB)} KB`);
      
      if (finalSizeKB > 1000) {
        console.log(`⚠️ Warning: Sticker size (${Math.round(finalSizeKB)} KB) exceeds recommended limit but will be sent anyway`);
      }
      
      const img = new webp.Image();
      await img.load(webpBuffer);

      const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': settings.packname || 'KnightBot',
        'emojis': ['✂️']
      };

      const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;
      const finalBuffer = await img.save(null);

      await sock.sendMessage(chatId, { 
        sticker: finalBuffer,
        ...channelInfo
      }, { quoted: messageToQuote });

      try {
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);
      } catch (err) {
        console.error('Error cleaning up temp files:', err);
      }

    } catch (error) {
      console.error('Error in stickercrop command:', error);
      await sock.sendMessage(chatId, { 
        text: 'Failed to crop sticker! Try with an image.',
        ...channelInfo
      }, { quoted: messageToQuote });
    }
  },
  
  stickercropFromBuffer
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading stickercrop.js:', e.message); }

/* ===== stickername.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/stickername.js
const store = require('../lib/lightweight_store');

module.exports = {
  command: 'stickername',
  aliases: ['setpack'],
  category: 'owner',
  description: 'Change default sticker pack name',
  usage: '.stickername <new pack name>',
  
  async handler(sock, message, args, context) {
    if (!message.key.fromMe) {
      return await sock.sendMessage(message.key.remoteJid, {
        text: '❌ This command can only be used by the bot itself.'
      }, { quoted: message });
    }

    const { chatId } = context;
    const newName = args.join(' ').trim();

    if (!newName) {
      return await sock.sendMessage(chatId, {
        text: '❌ Please provide a new sticker pack name.\nExample: .stickername REDXBOT Pack'
      }, { quoted: message });
    }

    try {
      // Save in database
      await store.saveSetting('global', 'stickerPackName', newName);
      await sock.sendMessage(chatId, {
        text: `✅ Sticker pack name changed to: *${newName}*`
      }, { quoted: message });
    } catch (error) {
      console.error('StickerName error:', error);
      await sock.sendMessage(chatId, {
        text: `❌ Failed to save sticker name: ${error.message}`
      }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading stickername.js:', e.message); }

/* ===== stickerpack.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { writeFile } = require('fs/promises');

const TEMP_DIR = path.join(process.cwd(), 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

module.exports = {
  command: 'stickerpack',
  aliases: ['spack', 'getstickers'],
  category: 'general',
  description: 'Extract all stickers from a sticker pack message.',
  usage: '.stickerpack (reply to a sticker pack message)',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted || !quoted.stickerPackMessage) {
        return await sock.sendMessage(chatId, {
          text: '❌ Please reply to a *sticker pack message*.'
        }, { quoted: message });
      }

      const pack = quoted.stickerPackMessage;
      const stickers = pack.stickers || [];

      if (stickers.length === 0) {
        return await sock.sendMessage(chatId, {
          text: '❌ No stickers found in this pack.'
        }, { quoted: message });
      }

      await sock.sendMessage(chatId, {
        text: `📦 Sticker pack: *${pack.name || 'Unnamed'}*\nPublisher: ${pack.publisher || 'Unknown'}\nExtracting ${stickers.length} sticker(s)...`
      });

      for (let i = 0; i < stickers.length; i++) {
        const sticker = stickers[i];
        // Construct a fake message object that downloadContentFromMessage can use
        const stickerMsg = {
          stickerMessage: {
            url: `https://mmg.whatsapp.net${sticker.directPath}`,
            directPath: sticker.directPath,
            mediaKey: sticker.mediaKey,
            mimetype: sticker.mimetype || 'image/webp',
            fileEncSha256: sticker.fileEncSha256,
            fileSha256: sticker.fileSha256,
            fileLength: sticker.fileLength,
          }
        };

        try {
          const stream = await downloadContentFromMessage(stickerMsg.stickerMessage, 'sticker');
          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }

          const fileName = `sticker_${i+1}_${Date.now()}.webp`;
          const filePath = path.join(TEMP_DIR, fileName);
          await writeFile(filePath, buffer);

          await sock.sendMessage(chatId, {
            sticker: { url: filePath },
            mimetype: 'image/webp'
          });

          // Clean up temp file
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Failed to download sticker ${i+1}:`, err);
          await sock.sendMessage(chatId, {
            text: `⚠️ Failed to download sticker ${i+1}.`
          });
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await sock.sendMessage(chatId, {
        text: '✅ All stickers extracted!'
      });

    } catch (error) {
      console.error('Error in stickerpack command:', error);
      await sock.sendMessage(chatId, {
        text: '❌ An error occurred while processing the sticker pack.'
      }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading stickerpack.js:', e.message); }

/* ===== stickertelegram.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fetch = require('node-fetch');
const { writeExifImg } = require('../lib/exif');
const delay = time => new Promise(res => setTimeout(res, time));
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const webp = require('node-webpmux');
const crypto = require('crypto');
const { exec } = require('child_process');
const settings = require('../settings');

module.exports = {
  command: 'tgstk',
  aliases: ['telegram', 'tgsticker'],
  category: 'stickers',
  description: 'Download stickers from Telegram',
  usage: '.tgstk <telegram sticker URL>',
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      if (!args[0]) {
        await sock.sendMessage(chatId, { 
          text: '⚠️ Please enter the Telegram sticker URL!\n\nExample: .tgstk https://t.me/addstickers/Porcientoreal',
          ...channelInfo
        }, { quoted: message });
        return;
      }
      
      if (!args[0].match(/(https:\/\/t.me\/addstickers\/)/gi)) {
        await sock.sendMessage(chatId, { 
          text: '❌ Invalid URL! Make sure it\'s a Telegram sticker URL.',
          ...channelInfo
        }, { quoted: message });
        return;
      }
      
      const packName = args[0].replace("https://t.me/addstickers/", "");
      const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
      
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodeURIComponent(packName)}`,
          { 
            method: "GET",
            headers: {
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0"
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const stickerSet = await response.json();
        
        if (!stickerSet.ok || !stickerSet.result) {
          throw new Error('Invalid sticker pack or API response');
        }
        
        await sock.sendMessage(chatId, { 
          text: `📦 Found ${stickerSet.result.stickers.length} stickers\n⏳ Starting download...`,
          ...channelInfo
        }, { quoted: message });
        
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        let successCount = 0;
        for (let i = 0; i < stickerSet.result.stickers.length; i++) {
          try {
            const sticker = stickerSet.result.stickers[i];
            const fileId = sticker.file_id;
            
            const fileInfo = await fetch(
              `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
            );
            
            if (!fileInfo.ok) continue;
            
            const fileData = await fileInfo.json();
            if (!fileData.ok || !fileData.result.file_path) continue;

            const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
            const imageResponse = await fetch(fileUrl);
            const imageBuffer = await imageResponse.buffer();
            const tempInput = path.join(tmpDir, `temp_${Date.now()}_${i}`);
            const tempOutput = path.join(tmpDir, `sticker_${Date.now()}_${i}.webp`);
            fs.writeFileSync(tempInput, imageBuffer);

            const isAnimated = sticker.is_animated || sticker.is_video;
            
            const ffmpegCommand = isAnimated
              ? `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`
              : `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;

            await new Promise((resolve, reject) => {
              exec(ffmpegCommand, (error) => {
                if (error) {
                  console.error('FFmpeg error:', error);
                  reject(error);
                } else resolve();
              });
            });

            const webpBuffer = fs.readFileSync(tempOutput);

            const img = new webp.Image();
            await img.load(webpBuffer);

            const metadata = {
              'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
              'sticker-pack-name': settings.packname,
              'emojis': sticker.emoji ? [sticker.emoji] : ['🤖']
            };

            const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(metadata), 'utf8');
            const exif = Buffer.concat([exifAttr, jsonBuffer]);
            exif.writeUIntLE(jsonBuffer.length, 14, 4);

            img.exif = exif;

            const finalBuffer = await img.save(null);

            await sock.sendMessage(chatId, { 
              sticker: finalBuffer,
              ...channelInfo
            });

            successCount++;
            await delay(1000);
            
            try {
              fs.unlinkSync(tempInput);
              fs.unlinkSync(tempOutput);
            } catch (err) {
              console.error('Error cleaning up temp files:', err);
            }

          } catch (err) {
            console.error(`Error processing sticker ${i}:`, err);
            continue;
          }
        }
        
        await sock.sendMessage(chatId, { 
          text: `✅ Successfully downloaded ${successCount}/${stickerSet.result.stickers.length} stickers!`,
          ...channelInfo
        }, { quoted: message });

      } catch (error) {
        throw new Error(`Failed to process sticker pack: ${error.message}`);
      }

    } catch (error) {
      console.error('Error in stickertelegram command:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ Failed to process Telegram stickers!\nMake sure:\n1. The URL is correct\n2. The sticker pack exists\n3. The sticker pack is public',
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading stickertelegram.js:', e.message); }

/* ===== take.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');
const crypto = require('crypto');

module.exports = {
  command: 'take',
  aliases: ['steal', 'wm'],
  category: 'stickers',
  description: 'Change sticker pack name',
  usage: '.take <packname> (reply to sticker)',
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!quotedMessage?.stickerMessage) {
        await sock.sendMessage(chatId, { 
          text: '❌ Reply to a sticker with .take <packname>',
          ...channelInfo
        }, { quoted: message });
        return;
      }
      
      const packname = args.join(' ') || 'JUNAID-MD↣³⁰²';

      try {
        const stickerBuffer = await downloadMediaMessage(
          {
            key: message.message.extendedTextMessage.contextInfo.stanzaId,
            message: quotedMessage,
            messageType: 'stickerMessage'
          },
          'buffer',
          {},
          {
            logger: console,
            reuploadRequest: sock.updateMediaMessage
          }
        );

        if (!stickerBuffer) {
          await sock.sendMessage(chatId, { 
            text: '❌ Failed to download sticker',
            ...channelInfo
          }, { quoted: message });
          return;
        }
        
        const img = new webp.Image();
        await img.load(stickerBuffer);

        const json = {
          'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
          'sticker-pack-name': packname,
          'emojis': ['🤖']
        };

        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
        const exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);

        img.exif = exif;

        const finalBuffer = await img.save(null);

        await sock.sendMessage(chatId, {
          sticker: finalBuffer,
          ...channelInfo
        }, {
          quoted: message
        });

      } catch (error) {
        console.error('Sticker processing error:', error);
        await sock.sendMessage(chatId, { 
          text: '❌ Error processing sticker',
          ...channelInfo
        }, { quoted: message });
      }

    } catch (error) {
      console.error('Error in take command:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ Error processing command',
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading take.js:', e.message); }

/* ===== emojimix.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

module.exports = {
  command: 'emojimix',
  aliases: ['mixemoji', 'emix'],
  category: 'stickers',
  description: 'Mix two emojis into a sticker',
  usage: '.emojimix 😎+🥰',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      if (!args[0]) {
        await sock.sendMessage(chatId, {
          text: '🎴 Example: .emojimix 😎+🥰'
        }, { quoted: message });
        return;
      }

      if (!args[0].includes('+')) {
        await sock.sendMessage(chatId, {
          text: '✳️ Separate the emoji with a *+* sign\n\n📌 Example:\n.emojimix 😎+🥰'
        }, { quoted: message });
        return;
      }

      let [emoji1, emoji2] = args[0].split('+').map(e => e.trim());

      const url =
        `https://tenor.googleapis.com/v2/featured?` +
        `key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ` +
        `&contentfilter=high&media_filter=png_transparent` +
        `&component=proactive&collection=emoji_kitchen_v5` +
        `&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        await sock.sendMessage(chatId, {
          text: '❌ These emojis cannot be mixed! Try different ones.'
        }, { quoted: message });
        return;
      }

      const imageUrl = data.results[0].url;
      const tmpDir = path.join(process.cwd(), 'tmp');

      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const tempFile = path.join(tmpDir, `temp_${Date.now()}.png`).replace(/\\/g, '/');
      const outputFile = path.join(tmpDir, `sticker_${Date.now()}.webp`).replace(/\\/g, '/');

      const imageResponse = await fetch(imageUrl);
      const buffer = await imageResponse.buffer();
      fs.writeFileSync(tempFile, buffer);

      const ffmpegCommand =
        `ffmpeg -i "${tempFile}" ` +
        `-vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,` +
        `pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ` +
        `"${outputFile}"`;

      await new Promise((resolve, reject) => {
        exec(ffmpegCommand, (error) => {
          if (error) {
            console.error('FFmpeg error:', error);
            reject(error);
          } else {
            resolve();
          }
        });
      });

      if (!fs.existsSync(outputFile)) {
        throw new Error('Sticker creation failed');
      }

      const stickerBuffer = fs.readFileSync(outputFile);

      await sock.sendMessage(chatId, {
        sticker: stickerBuffer
      }, { quoted: message });

      // Cleanup
      try {
        fs.unlinkSync(tempFile);
        fs.unlinkSync(outputFile);
      } catch (err) {
        console.error('Temp cleanup error:', err);
      }

    } catch (error) {
      console.error('Error in emojimix command:', error);
      await sock.sendMessage(chatId, {
        text:
          '❌ Failed to mix emojis!\n\n' +
          '📌 Example:\n.emojimix 😎+🥰'
      }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading emojimix.js:', e.message); }

/* ===== simage.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const sharp = require('sharp');
const fs = require('fs');
const fsPromises = require('fs/promises');
const fse = require('fs-extra');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const tempDir = './temp';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const scheduleFileDeletion = (filePath) => {
    setTimeout(async () => {
        try {
            await fse.remove(filePath);
            console.log(`File deleted: ${filePath}`);
        } catch (error) {
            console.error(`Failed to delete file:`, error);
        }
    }, 10000); // 10 seconds
};

module.exports = {
    command: 's2img',
    aliases: ['simage', 'stoimg'],
    category: 'stickers',
    description: 'Convert a sticker to an image',
    usage: '.s2img (reply to a sticker)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMessage?.stickerMessage) {
                await sock.sendMessage(chatId, { text: '⚠️ Reply to a sticker with .simage to convert it.' }, { quoted: message });
                return;
            }

            const stickerFilePath = path.join(tempDir, `sticker_${Date.now()}.webp`);
            const outputImagePath = path.join(tempDir, `converted_image_${Date.now()}.png`);

            const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            await fsPromises.writeFile(stickerFilePath, buffer);
            await sharp(stickerFilePath).toFormat('png').toFile(outputImagePath);

            const imageBuffer = await fsPromises.readFile(outputImagePath);
            await sock.sendMessage(chatId, { image: imageBuffer, caption: '✨ Here is the converted image!' }, { quoted: message });

            scheduleFileDeletion(stickerFilePath);
            scheduleFileDeletion(outputImagePath);

        } catch (error) {
            console.error('SImage Command Error:', error);
            await sock.sendMessage(chatId, { text: '❌ An error occurred while converting the sticker.' }, { quoted: message });
        }
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading simage.js:', e.message); }

/* ===== igs.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { igdl } = require('ruhend-scraper');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');
const settings = require('../settings');
const { stickercropFromBuffer } = require('./stickercrop');

async function convertBufferToStickerWebp(inputBuffer, isAnimated, cropSquare) {
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const tempInputBase = path.join(tmpDir, `igs_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const tempInput = isAnimated ? `${tempInputBase}.mp4` : `${tempInputBase}.jpg`;
  const tempOutput = path.join(tmpDir, `igs_out_${Date.now()}_${Math.random().toString(36).slice(2)}.webp`);

  fs.writeFileSync(tempInput, inputBuffer);
  const filesToDelete = [];
  const scheduleDelete = (p) => {
    if (!p) return;
    filesToDelete.push(p);
    setTimeout(() => {
      try { fs.unlinkSync(p); } catch {}
    }, 5000);
  };
  
  const vfCropSquareImg = "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512";
  const vfPadSquareImg = "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";

  let ffmpegCommand;
  if (isAnimated) {
    const isLargeVideo = inputBuffer.length > (5 * 1024 * 1024);
    if (cropSquare) {
      if (isLargeVideo) {
        ffmpegCommand = `ffmpeg -y -i "${tempInput}" -t 2 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput}"`;
      } else {
        ffmpegCommand = `ffmpeg -y -i "${tempInput}" -t 3 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 50 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;
      }
    } else {
      if (isLargeVideo) {
        ffmpegCommand = `ffmpeg -y -i "${tempInput}" -t 2 -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 35 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput}"`;
      } else {
        ffmpegCommand = `ffmpeg -y -i "${tempInput}" -t 3 -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 45 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;
      }
    }
  } else {
    const vf = `${cropSquare ? vfCropSquareImg : vfPadSquareImg},format=rgba`;
    ffmpegCommand = `ffmpeg -y -i "${tempInput}" -vf "${vf}" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;
  }

  await new Promise((resolve, reject) => {
    exec(ffmpegCommand, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
  
  let webpBuffer = fs.readFileSync(tempOutput);
  scheduleDelete(tempOutput);
  
  if (isAnimated && webpBuffer.length > 1000 * 1024) {
    try {
      const tempOutput2 = path.join(tmpDir, `igs_out2_${Date.now()}_${Math.random().toString(36).slice(2)}.webp`);
      const harsherCmd = cropSquare
        ? `ffmpeg -y -i "${tempInput}" -t 2 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput2}"`
        : `ffmpeg -y -i "${tempInput}" -t 2 -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 35 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput2}"`;
      await new Promise((resolve, reject) => {
        exec(harsherCmd, (error) => error ? reject(error) : resolve());
      });
      if (fs.existsSync(tempOutput2)) {
        webpBuffer = fs.readFileSync(tempOutput2);
        scheduleDelete(tempOutput2);
      }
    } catch {}
  }

  const img = new webp.Image();
  await img.load(webpBuffer);

  const json = {
    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
    'sticker-pack-name': settings.packname || 'MegaBot',
    'emojis': ['📸']
  };
  const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  img.exif = exif;

  let finalBuffer = await img.save(null);
  
  if (finalBuffer.length > 900 * 1024) {
    try {
      const tempOutput3 = path.join(tmpDir, `igs_out3_${Date.now()}_${Math.random().toString(36).slice(2)}.webp`);
      const vfSmall = cropSquare
        ? `crop=min(iw\\,ih):min(iw\\,ih),scale=320:320${isAnimated ? ',fps=8' : ''}`
        : `scale=320:320:force_original_aspect_ratio=decrease,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=#00000000${isAnimated ? ',fps=8' : ''}`;
      const cmdSmall = `ffmpeg -y -i "${tempInput}" ${isAnimated ? '-t 2' : ''} -vf "${vfSmall}" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality ${isAnimated ? 28 : 65} -compression_level 6 -b:v 80k -max_muxing_queue_size 1024 "${tempOutput3}"`;
      await new Promise((resolve, reject) => {
        exec(cmdSmall, (error) => error ? reject(error) : resolve());
      });
      if (fs.existsSync(tempOutput3)) {
        const smallWebp = fs.readFileSync(tempOutput3);
        const img2 = new webp.Image();
        await img2.load(smallWebp);
        const json2 = {
          'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
          'sticker-pack-name': settings.packname || 'MegaBot',
          'emojis': ['📸']
        };
        const exifAttr2 = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuffer2 = Buffer.from(JSON.stringify(json2), 'utf8');
        const exif2 = Buffer.concat([exifAttr2, jsonBuffer2]);
        exif2.writeUIntLE(jsonBuffer2.length, 14, 4);
        img2.exif = exif2;
        finalBuffer = await img2.save(null);
        scheduleDelete(tempOutput3);
      }
    } catch {}
  }
  scheduleDelete(tempInput);

  return finalBuffer;
}

async function fetchBufferFromUrl(url) {
  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity'
      },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      decompress: true,
      validateStatus: s => s >= 200 && s < 400
    });
    return Buffer.from(res.data);
  } catch (e1) {
    try {
      const res = await axios.get(url, {
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Accept-Encoding': 'identity'
        },
        timeout: 40000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        validateStatus: s => s >= 200 && s < 400
      });
      const chunks = [];
      await new Promise((resolve, reject) => {
        res.data.on('data', c => chunks.push(c));
        res.data.on('end', resolve);
        res.data.on('error', reject);
      });
      return Buffer.concat(chunks);
    } catch (e2) {
      console.error('Both axios download attempts failed:', e1?.message || e1, e2?.message || e2);
      throw e2;
    }
  }
}

async function forceMiniSticker(inputBuffer, isVideo, cropSquare) {
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const tempInput = path.join(tmpDir, `mini_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`);
  const tempOutput = path.join(tmpDir, `mini_out_${Date.now()}.webp`);
  fs.writeFileSync(tempInput, inputBuffer);

  const vf = cropSquare
    ? `crop=min(iw\\,ih):min(iw\\,ih),scale=256:256${isVideo ? ',fps=6' : ''}`
    : `scale=256:256:force_original_aspect_ratio=decrease,pad=256:256:(ow-iw)/2:(oh-ih)/2:color=#00000000${isVideo ? ',fps=6' : ''}`;

  const cmd = `ffmpeg -y -i "${tempInput}" ${isVideo ? '-t 2' : ''} -vf "${vf}" -c:v libwebp -preset default -loop 0 -pix_fmt yuva420p -quality 25 -compression_level 6 -b:v 60k "${tempOutput}"`;

  await new Promise((resolve, reject) => {
    exec(cmd, (error) => error ? reject(error) : resolve());
  });

  if (!fs.existsSync(tempOutput)) {
    try { fs.unlinkSync(tempInput); } catch {}
    return null;
  }
  
  const smallWebp = fs.readFileSync(tempOutput);

  const img = new webp.Image();
  await img.load(smallWebp);
  const json = {
    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
    'sticker-pack-name': settings.packname || 'MegaBot',
    'emojis': ['📸']
  };
  const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  img.exif = exif;
  const finalBuffer = await img.save(null);

  try { fs.unlinkSync(tempInput); } catch {}
  try { fs.unlinkSync(tempOutput); } catch {}

  return finalBuffer;
}

module.exports = {
  command: 'igs',
  aliases: ['igsticker', 'instasticker'],
  category: 'stickers',
  description: 'Convert Instagram post/reel to sticker',
  usage: '.igs <instagram URL>',
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      const urlMatch = text.match(/https?:\/\/\S+/);
      
      if (!urlMatch) {
        await sock.sendMessage(chatId, { 
          text: `Send an Instagram post/reel link.\nUsage: .igs <url>`,
          ...channelInfo
        }, { quoted: message });
        return;
      }

      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

      const downloadData = await igdl(urlMatch[0]).catch(() => null);
      if (!downloadData || !downloadData.data) {
        await sock.sendMessage(chatId, { 
          text: '❌ Failed to fetch media from Instagram link.',
          ...channelInfo
        }, { quoted: message });
        return;
      }
      
      const rawItems = (downloadData?.data || []).filter(m => m && m.url);
      const seenUrls = new Set();
      const items = [];
      for (const m of rawItems) {
        if (!seenUrls.has(m.url)) {
          seenUrls.add(m.url);
          items.push(m);
        }
      }
      
      if (items.length === 0) {
        await sock.sendMessage(chatId, { 
          text: '❌ No media found at the provided link.',
          ...channelInfo
        }, { quoted: message });
        return;
      }
      
      const maxItems = Math.min(items.length, 10);
      const seenHashes = new Set();
      
      for (let i = 0; i < maxItems; i++) {
        try {
          const media = items[i];
          const mediaUrl = media.url;
          const isVideo = (media?.type === 'video') || /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl);

          const buffer = await fetchBufferFromUrl(mediaUrl);
          const hash = require('crypto').createHash('sha1').update(buffer).digest('hex');
          if (seenHashes.has(hash)) {
            continue;
          }
          seenHashes.add(hash);

          let stickerBuffer = await convertBufferToStickerWebp(buffer, isVideo, false);

          let finalSticker = stickerBuffer;
          if (finalSticker.length > 900 * 1024) {
            try {
              const fallback = await forceMiniSticker(buffer, isVideo, false);
              if (fallback && fallback.length <= 900 * 1024) {
                finalSticker = fallback;
              }
            } catch (e) {
              console.error('forceMiniSticker error:', e);
            }
          }

          await sock.sendMessage(chatId, { 
            sticker: finalSticker,
            ...channelInfo
          }, { quoted: message });

          if (i < maxItems - 1) {
            await new Promise(r => setTimeout(r, 800));
          }
        } catch (perItemErr) {
          console.error('IGS item error:', perItemErr);
        }
      }

    } catch (err) {
      console.error('Error in igs command:', err);
      await sock.sendMessage(chatId, { 
        text: 'Failed to create sticker from Instagram link.',
        ...channelInfo
      }, { quoted: message });
    }
  }
};



    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading igs.js:', e.message); }

/* ===== igsc.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { igdl } = require('ruhend-scraper');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');
const settings = require('../settings');
const { stickercropFromBuffer } = require('./stickercrop');

async function convertBufferToStickerWebp(inputBuffer, isAnimated, cropSquare) {
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const tempInputBase = path.join(tmpDir, `igs_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const tempInput = isAnimated ? `${tempInputBase}.mp4` : `${tempInputBase}.jpg`;
  const tempOutput = path.join(tmpDir, `igs_out_${Date.now()}_${Math.random().toString(36).slice(2)}.webp`);

  fs.writeFileSync(tempInput, inputBuffer);
  const scheduleDelete = (p) => {
    if (!p) return;
    setTimeout(() => {
      try { fs.unlinkSync(p); } catch {}
    }, 5000);
  };
  
  const vfCropSquareImg = "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512";
  const vfPadSquareImg = "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";

  let ffmpegCommand;
  if (isAnimated) {
    const isLargeVideo = inputBuffer.length > (5 * 1024 * 1024);
    if (cropSquare) {
      ffmpegCommand = isLargeVideo
        ? `ffmpeg -y -i "${tempInput}" -t 2 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput}"`
        : `ffmpeg -y -i "${tempInput}" -t 3 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 50 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;
    } else {
      ffmpegCommand = isLargeVideo
        ? `ffmpeg -y -i "${tempInput}" -t 2 -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 35 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput}"`
        : `ffmpeg -y -i "${tempInput}" -t 3 -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 45 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;
    }
  } else {
    const vf = `${cropSquare ? vfCropSquareImg : vfPadSquareImg},format=rgba`;
    ffmpegCommand = `ffmpeg -y -i "${tempInput}" -vf "${vf}" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;
  }

  await new Promise((resolve, reject) => {
    exec(ffmpegCommand, (error) => error ? reject(error) : resolve());
  });
  
  let webpBuffer = fs.readFileSync(tempOutput);
  scheduleDelete(tempOutput);
  scheduleDelete(tempInput);

  const img = new webp.Image();
  await img.load(webpBuffer);

  const json = {
    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
    'sticker-pack-name': settings.packname || 'MegaBot',
    'emojis': ['📸']
  };
  const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  img.exif = exif;

  return await img.save(null);
}

async function fetchBufferFromUrl(url) {
  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    return Buffer.from(res.data);
  } catch (e) {
    throw e;
  }
}

module.exports = {
  command: 'igsc',
  aliases: ['igstickercrop', 'instacrop'],
  category: 'stickers',
  description: 'Convert Instagram post/reel to cropped sticker',
  usage: '.igsc <instagram URL>',
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      const urlMatch = text.match(/https?:\/\/\S+/);
      
      if (!urlMatch) {
        await sock.sendMessage(chatId, { 
          text: `Send an Instagram post/reel link.\nUsage: .igsc <url>`,
          ...channelInfo
        }, { quoted: message });
        return;
      }

      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

      const downloadData = await igdl(urlMatch[0]).catch(() => null);
      if (!downloadData || !downloadData.data) {
        await sock.sendMessage(chatId, { 
          text: '❌ Failed to fetch media from Instagram link.',
          ...channelInfo
        }, { quoted: message });
        return;
      }
      
      const rawItems = (downloadData?.data || []).filter(m => m && m.url);
      const seenUrls = new Set();
      const items = [];
      for (const m of rawItems) {
        if (!seenUrls.has(m.url)) {
          seenUrls.add(m.url);
          items.push(m);
        }
      }
      
      if (items.length === 0) {
        await sock.sendMessage(chatId, { 
          text: '❌ No media found at the provided link.',
          ...channelInfo
        }, { quoted: message });
        return;
      }
      
      const maxItems = Math.min(items.length, 10);
      const seenHashes = new Set();
      
      for (let i = 0; i < maxItems; i++) {
        try {
          const media = items[i];
          const mediaUrl = media.url;
          const isVideo = (media?.type === 'video') || /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl);

          const buffer = await fetchBufferFromUrl(mediaUrl);
          const hash = require('crypto').createHash('sha1').update(buffer).digest('hex');
          if (seenHashes.has(hash)) continue;
          seenHashes.add(hash);

          const stickerBuffer = await stickercropFromBuffer(buffer, isVideo);

          await sock.sendMessage(chatId, { 
            sticker: stickerBuffer,
            ...channelInfo
          }, { quoted: message });

          if (i < maxItems - 1) {
            await new Promise(r => setTimeout(r, 800));
          }
        } catch (perItemErr) {
          console.error('IGSC item error:', perItemErr);
        }
      }

    } catch (err) {
      console.error('Error in igsc command:', err);
      await sock.sendMessage(chatId, { 
        text: 'Failed to create cropped sticker from Instagram link.',
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading igsc.js:', e.message); }

/* ===== attp.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { writeExifImg, writeExifVid } = require('../lib/exif');

module.exports = {
  command: 'attp',
  aliases: ['texts', 'textsticker'],
  category: 'stickers',
  description: 'Generate an animated sticker from text',
  usage: '.attp <text>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(' ');

    if (!text) {
      return await sock.sendMessage(chatId, { text: 'Please provide text after the .attp command.' }, { quoted: message });
    }

    try {
      const mp4Buffer = await renderBlinkingVideoWithFfmpeg(text);
      const webpPath = await writeExifVid(mp4Buffer, { packname: 'Mega Md' });
      const webpBuffer = fs.readFileSync(webpPath);
      try { fs.unlinkSync(webpPath); } catch {}
      await sock.sendMessage(chatId, { sticker: webpBuffer }, { quoted: message });
    } catch {
      await sock.sendMessage(chatId, { text: '❌ Failed to generate the sticker locally.' }, { quoted: message });
    }
  }
};

function renderTextToPngWithFfmpeg(text) {
    return new Promise((resolve, reject) => {
        const fontPath = process.platform === 'win32'
            ? 'C:/Windows/Fonts/arialbd.ttf'
            : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

        // Robust escaping for ffmpeg drawtext
        const escapeDrawtextText = (s) => s
            .replace(/\\/g, '\\\\')
            .replace(/:/g, '\\:')
            .replace(/'/g, "\\'")
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/%/g, '\\%');

        const safeText = escapeDrawtextText(text);
        const safeFontPath = process.platform === 'win32'
            ? fontPath.replace(/\\/g, '/').replace(':', '\\:')
            : fontPath;

        const args = [
            '-y',
            '-f', 'lavfi',
            '-i', 'color=c=#00000000:s=512x512',
            '-vf', `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=white:fontsize=56:borderw=2:bordercolor=black@0.6:x=(w-text_w)/2:y=(h-text_h)/2`,
            '-frames:v', '1',
            '-f', 'image2',
            'pipe:1'
        ];

        const ff = spawn('ffmpeg', args);
        const chunks = [];
        const errors = [];
        ff.stdout.on('data', d => chunks.push(d));
        ff.stderr.on('data', e => errors.push(e));
        ff.on('error', reject);
        ff.on('close', code => {
            if (code === 0) return resolve(Buffer.concat(chunks));
            reject(new Error(Buffer.concat(errors).toString() || `ffmpeg exited with code ${code}`));
        });
    });
}

function renderBlinkingVideoWithFfmpeg(text) {
    return new Promise((resolve, reject) => {
        const fontPath = process.platform === 'win32'
            ? 'C:/Windows/Fonts/arialbd.ttf'
            : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

        const escapeDrawtextText = (s) => s
            .replace(/\\/g, '\\\\')
            .replace(/:/g, '\\:')
            .replace(/,/g, '\\,')
            .replace(/'/g, "\\'")
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/%/g, '\\%');

        const safeText = escapeDrawtextText(text);
        const safeFontPath = process.platform === 'win32'
            ? fontPath.replace(/\\/g, '/').replace(':', '\\:')
            : fontPath;

        // Blink cycle length (seconds) and fast delay ~0.1s per color
        const cycle = 0.3;
        const dur = 1.8; // 6 cycles

        const drawRed = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=red:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='lt(mod(t\,${cycle})\,0.1)'`;
        const drawBlue = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=blue:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(mod(t\,${cycle})\,0.1\,0.2)'`;
        const drawGreen = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=green:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='gte(mod(t\,${cycle})\,0.2)'`;

        const filter = `${drawRed},${drawBlue},${drawGreen}`;

        const args = [
            '-y',
            '-f', 'lavfi',
            '-i', `color=c=black:s=512x512:d=${dur}:r=20`,
            '-vf', filter,
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart+frag_keyframe+empty_moov',
            '-t', String(dur),
            '-f', 'mp4',
            'pipe:1'
        ];

        const ff = spawn('ffmpeg', args);
        const chunks = [];
        const errors = [];
        ff.stdout.on('data', d => chunks.push(d));
        ff.stderr.on('data', e => errors.push(e));
        ff.on('error', reject);
        ff.on('close', code => {
            if (code === 0) return resolve(Buffer.concat(chunks));
            reject(new Error(Buffer.concat(errors).toString() || `ffmpeg exited with code ${code}`));
        });
    });
}

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading attp.js:', e.message); }

/* ===== grayscale.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'grayscale',
  aliases: ['gray', 'grey'],
  category: 'tools',
  description: 'Convert an image to grayscale',
  usage: 'Reply to an image with .grayscale',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const quoted =
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted?.imageMessage) {
        return await sock.sendMessage(
          chatId,
          { text: '🖤 *Grayscale Image*\n\nReply to an image to convert it to grayscale\n\nUsage:\n.grayscale' },
          { quoted: message }
        );
      }

      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tempFile = path.join(__dirname, `grayscale_${Date.now()}.jpg`);
      fs.writeFileSync(tempFile, buffer);

      const form = new FormData();
      form.append('apikey', 'guru');
      form.append('file', fs.createReadStream(tempFile));

      const res = await axios.post(
        'https://discardapi.dpdns.org/api/image/grayscale',
        form,
        { headers: form.getHeaders(), responseType: 'arraybuffer', timeout: 60000 }
      );
      fs.unlinkSync(tempFile);

      if (!res?.data) throw new Error('Grayscale conversion failed');

      const grayFile = path.join(__dirname, `grayscale_result_${Date.now()}.jpg`);
      fs.writeFileSync(grayFile, res.data);

      await sock.sendMessage(
        chatId,
        {
          image: { url: grayFile },
          caption: `🖤 *Grayscale Image*\n\nProcessed by: JUNAID-MD↣³⁰²`
        },
        { quoted: message }
      );
      fs.unlinkSync(grayFile);

    } catch (err) {
      console.error('Grayscale Plugin Error:', err);
      await sock.sendMessage(
        chatId,
        { text: '❌ Failed to convert image to grayscale. Make sure the image is clear and try again.' },
        { quoted: message }
      );
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading grayscale.js:', e.message); }

/* ===== sepia.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'sepia',
  aliases: ['vintage'],
  category: 'tools',
  description: 'Convert an image to sepia',
  usage: 'Reply to an image with .sepia',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const quoted =
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted?.imageMessage) {
        return await sock.sendMessage(
          chatId,
          { text: '🧡 *Sepia Image*\n\nReply to an image to convert it to sepia\n\nUsage:\n.sepia' },
          { quoted: message }
        );
      }

      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tempFile = path.join(__dirname, `sepia_${Date.now()}.jpg`);
      fs.writeFileSync(tempFile, buffer);

      const form = new FormData();
      form.append('apikey', 'guru');
      form.append('file', fs.createReadStream(tempFile));

      const res = await axios.post(
        'https://discardapi.dpdns.org/api/image/sepia',
        form,
        { headers: form.getHeaders(), responseType: 'arraybuffer', timeout: 60000 }
      );
      fs.unlinkSync(tempFile);

      if (!res?.data) throw new Error('Sepia conversion failed');

      const grayFile = path.join(__dirname, `sepia_result_${Date.now()}.jpg`);
      fs.writeFileSync(grayFile, res.data);

      await sock.sendMessage(
        chatId,
        {
          image: { url: grayFile },
          caption: `🧡 *Sepia Image*\n\nProcessed by: JUNAID-MD↣³⁰²`
        },
        { quoted: message }
      );
      fs.unlinkSync(grayFile);

    } catch (err) {
      console.error('Sepia Plugin Error:', err);
      await sock.sendMessage(
        chatId,
        { text: '❌ Failed to convert image to sepia. Make sure the image is clear and try again.' },
        { quoted: message }
      );
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading sepia.js:', e.message); }

/* ===== invert.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'invert',
  aliases: ['negative'],
  category: 'tools',
  description: 'Convert an image to negative',
  usage: 'Reply to an image with .invert',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const quoted =
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted?.imageMessage) {
        return await sock.sendMessage(
          chatId,
          { text: '🤍 *Invert Image*\n\nReply to an image to convert it to negative\n\nUsage:\n.invert' },
          { quoted: message }
        );
      }

      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tempFile = path.join(__dirname, `invert_${Date.now()}.jpg`);
      fs.writeFileSync(tempFile, buffer);

      const form = new FormData();
      form.append('apikey', 'guru');
      form.append('file', fs.createReadStream(tempFile));

      const res = await axios.post(
        'https://discardapi.dpdns.org/api/image/invert',
        form,
        { headers: form.getHeaders(), responseType: 'arraybuffer', timeout: 60000 }
      );
      fs.unlinkSync(tempFile);

      if (!res?.data) throw new Error('Negative conversion failed');

      const grayFile = path.join(__dirname, `invert_result_${Date.now()}.jpg`);
      fs.writeFileSync(grayFile, res.data);

      await sock.sendMessage(
        chatId,
        {
          image: { url: grayFile },
          caption: `🤍 *Inverted Image*\n\nProcessed by: JUNAID-MD↣³⁰²`
        },
        { quoted: message }
      );
      fs.unlinkSync(grayFile);

    } catch (err) {
      console.error('Invert Plugin Error:', err);
      await sock.sendMessage(
        chatId,
        { text: '❌ Failed to convert image to sepia. Make sure the image is clear and try again.' },
        { quoted: message }
      );
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading invert.js:', e.message); }

/* ===== sharpen.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'sharpen',
  aliases: ['enhance'],
  category: 'tools',
  description: 'Convert an image to sharpen',
  usage: 'Reply to an image with .sharpen',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const quoted =
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted?.imageMessage) {
        return await sock.sendMessage(
          chatId,
          { text: '🩵 *Sharpen Image*\n\nReply to an image to convert it to sepia\n\nUsage:\n.sharpen' },
          { quoted: message }
        );
      }

      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tempFile = path.join(__dirname, `sepia_${Date.now()}.jpg`);
      fs.writeFileSync(tempFile, buffer);

      const form = new FormData();
      form.append('apikey', 'guru');
      form.append('file', fs.createReadStream(tempFile));

      const res = await axios.post(
        'https://discardapi.dpdns.org/api/image/sharpen',
        form,
        { headers: form.getHeaders(), responseType: 'arraybuffer', timeout: 60000 }
      );
      fs.unlinkSync(tempFile);

      if (!res?.data) throw new Error('Sharpen conversion failed');

      const grayFile = path.join(__dirname, `sepia_result_${Date.now()}.jpg`);
      fs.writeFileSync(grayFile, res.data);

      await sock.sendMessage(
        chatId,
        {
          image: { url: grayFile },
          caption: `🩵 *Sharpen Image*\n\n𝙿𝚛𝚘𝚌𝚎𝚜𝚜𝚎𝚍 𝚋𝚢: 𝙼𝙴𝙶𝙰-𝙼𝙳`
        },
        { quoted: message }
      );
      fs.unlinkSync(grayFile);

    } catch (err) {
      console.error('Sharpen Plugin Error:', err);
      await sock.sendMessage(
        chatId,
        { text: '❌ Failed to convert image to sepia. Make sure the image is clear and try again.' },
        { quoted: message }
      );
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading sharpen.js:', e.message); }

/* ===== img-blur.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

module.exports = {
  command: 'blur',
  aliases: ['blurimg', 'blurpic'],
  category: 'tools',
  description: 'Apply a blur effect to an image',
  usage: '.blur (reply to an image or send image with caption)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    try {
      let imageBuffer;
      if (quotedMessage?.imageMessage) {
        const quoted = { message: { imageMessage: quotedMessage.imageMessage } };
        imageBuffer = await downloadMediaMessage(quoted, 'buffer', {}, {});
      } else if (message.message?.imageMessage) {
        imageBuffer = await downloadMediaMessage(message, 'buffer', {}, {});
      } else {
        await sock.sendMessage(chatId, { 
          text: 'Please reply to an image or send an image with caption `.blur`' 
        }, { quoted: message });
        return;
      }
      const resizedImage = await sharp(imageBuffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();
      const blurredImage = await sharp(resizedImage)
        .blur(10)
        .toBuffer();

      await sock.sendMessage(chatId, {
        image: blurredImage,
        caption: '✨ *Image Blurred Successfully!*',
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363408055942569@newsletter',
            newsletterName: 'JUNAID-MD↣³⁰²',
            serverMessageId: -1
          }
        }
      }, { quoted: message });

    } catch (error) {
      console.error('Error in blur command:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ Failed to blur image. Please try again later.' 
      }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading img-blur.js:', e.message); }

/* ===== resize.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { uploadImage } = require('../lib/uploadImage');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function downloadMedia(msg, type) {
  const stream = await downloadContentFromMessage(msg, type);
  let buffer = Buffer.alloc(0);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}

module.exports = {
  command: 'length',
  aliases: ['filelength', 'resize'],
  category: 'tools',
  description: 'Send an image or video with a custom file length',
  usage: '.length <size> (reply to media)',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args?.join(' ')?.trim();

    try {
      let mediaMsg, mediaType;
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted) {
        if (quoted.imageMessage) {
          mediaMsg = quoted.imageMessage;
          mediaType = 'image';
        } else if (quoted.videoMessage) {
          mediaMsg = quoted.videoMessage;
          mediaType = 'video';
        }
      }

      if (!mediaMsg) {
        if (message.message?.imageMessage) {
          mediaMsg = message.message.imageMessage;
          mediaType = 'image';
        } else if (message.message?.videoMessage) {
          mediaMsg = message.message.videoMessage;
          mediaType = 'video';
        }
      }
      if (!mediaMsg) {
        return await sock.sendMessage(chatId, { text: '*⚠️ Reply to an image or video.*' }, { quoted: message });
      }
      if (!text || isNaN(text)) {
        return await sock.sendMessage(chatId, { text: '*🔢 Provide numeric file size.*\nExample: .length 999999' }, { quoted: message });
      }

      const buffer = await downloadMedia(mediaMsg, mediaType);
      const url = await uploadImage(buffer);

      await sock.sendMessage(
        chatId,
        mediaType === 'image'
          ? { image: { url }, caption: 'Here you go', fileLength: text }
          : { video: { url }, caption: 'Here you go', fileLength: text },
        { quoted: message }
      );

    } catch (err) {
      console.error('FileLength plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to process media.' }, { quoted: message });
    }}
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading resize.js:', e.message); }

/* ===== gif.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const settings = require('../settings');

module.exports = {
  command: 'gif',
  aliases: ['giphy', 'searchgif'],
  category: 'stickers',
  description: 'Get a GIF based on a search term',
  usage: '.gif <search term>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(' ');
    if (!query) {
      await sock.sendMessage(chatId, { text: 'Please provide a search term for the GIF.' }, { quoted: message });
      return;
    }
    try {
      const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
        params: {
          api_key: settings.giphyApiKey,
          q: query,
          limit: 1,
          rating: 'g'
        }
      });
      const gifData = response.data.data[0];
      if (!gifData) {
        await sock.sendMessage(chatId, { text: 'No GIFs found for your search term.' }, { quoted: message });
        return;
      }
      const mp4Url = gifData.images.original_mp4?.mp4;
      if (mp4Url) {
        await sock.sendMessage(chatId, { video: { url: mp4Url }, caption: `Here is your GIF for "${query}"` }, { quoted: message });
      } else {
        const gifUrl = gifData.images.original?.url;
        await sock.sendMessage(chatId, { document: { url: gifUrl }, mimetype: 'image/gif', caption: `Here is your GIF for "${query}"` }, { quoted: message });
      }

    } catch (error) {
      console.error('Error in gif command:', error);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch GIF. Please try again later.' }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading gif.js:', e.message); }

/* ===== randompic.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/randompic.js
const axios = require('axios');
const settings = require('../settings');

module.exports = {
  command: 'randompic',
  aliases: ['randombg', 'randimage'],
  category: 'fun',
  description: 'Get a random picture (from various categories)',
  usage: '.randompic [category] (default: ba)',
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const category = args[0]?.toLowerCase() || 'ba';

    await sock.sendPresenceUpdate('composing', chatId);
    await sock.sendMessage(chatId, {
      text: `🔍 Fetching random ${category} image...`,
      ...channelInfo
    }, { quoted: message });

    try {
      const apiUrl = `https://jawad-tech.vercel.app/random/${encodeURIComponent(category)}`;
      
      // First, try to fetch as binary and check content-type
      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: { 'Accept': 'image/*, text/html, */*' }
      });

      const contentType = response.headers['content-type'] || '';

      if (contentType.startsWith('image/')) {
        // Direct image – send it
        const imageBuffer = Buffer.from(response.data);
        await sock.sendMessage(chatId, {
          image: imageBuffer,
          caption: `🖼️ Random ${category} image`,
          ...channelInfo
        }, { quoted: message });
        return;
      }

      // If not an image, it might be HTML – try to extract image URL
      const html = response.data.toString('utf-8');
      
      // Try to find an image URL in the HTML (common patterns)
      const patterns = [
        /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i,
        /<img[^>]+src="([^"]+\.(?:jpg|jpeg|png|gif|webp))"/i,
        /<a[^>]+href="([^"]+\.(?:jpg|jpeg|png|gif|webp))"/i,
        /(https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|gif|webp))/i
      ];

      let imageUrl = null;
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          imageUrl = match[1];
          break;
        }
      }

      if (!imageUrl) {
        // If still no image, maybe the endpoint itself is the image when accessed directly?
        // Some sites serve the image directly but with HTML error pages. Try appending a random parameter.
        const fallbackUrl = apiUrl + '?t=' + Date.now();
        const fallbackResponse = await axios.get(fallbackUrl, {
          responseType: 'arraybuffer',
          timeout: 10000,
          headers: { 'Accept': 'image/*' }
        });
        if (fallbackResponse.headers['content-type']?.startsWith('image/')) {
          const imageBuffer = Buffer.from(fallbackResponse.data);
          await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `🖼️ Random ${category} image`,
            ...channelInfo
          }, { quoted: message });
          return;
        }
        throw new Error('No image URL found');
      }

      // Download the image from extracted URL
      const imgRes = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const imageBuffer = Buffer.from(imgRes.data);

      await sock.sendMessage(chatId, {
        image: imageBuffer,
        caption: `🖼️ Random ${category} image`,
        ...channelInfo
      }, { quoted: message });

    } catch (error) {
      console.error('Randompic error:', error);
      let errorMsg = '❌ Failed to fetch random image. ';
      if (error.response) {
        errorMsg += `Server returned ${error.response.status}.`;
      } else if (error.request) {
        errorMsg += 'No response from server.';
      } else {
        errorMsg += error.message;
      }
      await sock.sendMessage(chatId, {
        text: errorMsg,
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading randompic.js:', e.message); }

/* ===== random-img.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fetch = require('node-fetch');

const imageUrls = {
    chinese: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/tiktokpics/china.json',
    hijab: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/tiktokpics/hijab.json',
    malaysia: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/tiktokpics/malaysia.json',
    japanese: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/tiktokpics/japan.json',
    korean: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/tiktokpics/korea.json',
    malay: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/tiktokpics/malaysia.json',
    random: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/tiktokpics/random.json',
    random2: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/tiktokpics/random2.json',
    thai: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/tiktokpics/thailand.json',
    vietnamese: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/tiktokpics/vietnam.json',
    indo: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/tiktokpics/indonesia.json',
    boneka: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/boneka.json',
    blackpink3: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/blackpink.json',
    bike: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/bike.json',
    antiwork: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/antiwork.json',
    aesthetic: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/aesthetic.json',
    justina: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/justina.json',
    doggo: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/doggo.json',
    cosplay2: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/cosplay.json',
    cat: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/cat.json',
    car: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/car.json',
    profile2: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/profile.json',
    ppcouple2: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/ppcouple.json',
    notnot: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/notnot.json',
    kpop: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/kpop.json',
    kayes: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/kayes.json',
    ulzzanggirl: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/ulzzanggirl.json',
    ulzzangboy: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/ulzzangboy.json',
    ryujin: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/ryujin.json',
    rose: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/rose.json',
    pubg: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/pubg.json',
    wallml: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/wallml.json',
    wallhp: 'https://raw.githubusercontent.com/AbdulRehman19721986/GLOBAL-XMD/master/src/media/randompics/wallhp.json',
};

function pickRandom(arr, count = 1) {
    const result = [];
    const copy = [...arr];
    for (let i = 0; i < count; i++) {
        if (copy.length === 0) break;
        const index = Math.floor(Math.random() * copy.length);
        result.push(copy.splice(index, 1)[0]);
    }
    return result;
}

module.exports = {
    command: 'images',
    aliases: ['wallpics', 'pics'],
    category: 'menu',
    description: 'Send 3 random images for a given category',
    usage: '.images <category>',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const category = (args[0] || '').toLowerCase();
        if (!category || !imageUrls[category]) {
            const categoriesList = Object.keys(imageUrls)
                .map((c, i) => `┃ ${i + 1}. ${c}`)
                .join('\n');

            const menuText = `
╭──── *『 IMAGES 』* ──◆
┃ Available Categories:
${categoriesList}
┃
┃ *Usage example:*
┃   .images cat
╰━━━━━━━━━━━━━━────⊷
            `.trim();
            return await sock.sendMessage(chatId, { text: menuText }, { quoted: message });
        }
        try {
            const res = await fetch(imageUrls[category]);
            if (!res.ok) throw new Error('Failed to fetch image dataset');

            const images = await res.json();

            if (!Array.isArray(images) || images.length === 0) {
                throw new Error('No images found in the dataset');
            }
            const selectedImages = pickRandom(images, 3);

            for (const img of selectedImages) {
                await sock.sendMessage(chatId, {
                    image: { url: img.url },
                    caption: `📷 Random ${category} image`
                }, { quoted: message });
            }

        } catch (err) {
            console.error('Images Command Error:', err);
            await sock.sendMessage(chatId, {
                text: '❌ An error occurred while processing your request. Please try again later.'
            }, { quoted: message });
        }
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading random-img.js:', e.message); }

/* ===== quoted.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = {
  command: 'quoted',
  aliases: ['q', 'fakereply'],
  category: 'stickers',
  description: 'Generate a quote sticker from text',
  usage: '.quote <text> or reply to a message',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let text = args.join(' ').trim();

    try {
      // Check if no text and no quoted message
      if (!text && !message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        return await sock.sendMessage(chatId, { 
          text: '📝 Please provide some text or reply to a message to create a quote.\n\nUsage: .quote <text>' 
        }, { quoted: message });
      }

      // Get text from quoted message if available
      if (!text && message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
        text = quotedMsg.conversation || 
               quotedMsg.extendedTextMessage?.text || 
               quotedMsg.imageMessage?.caption || 
               quotedMsg.videoMessage?.caption || 
               'Media message';
      }

      // Determine who to get profile picture from
      let who;
      if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        // Quoted message sender
        who = message.message.extendedTextMessage.contextInfo.participant;
      } else if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
        // Mentioned user
        who = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else {
        // Message sender
        who = message.key.participant || message.key.remoteJid;
      }

      // React with waiting emoji
      await sock.sendMessage(chatId, {
        react: {
          text: '⏳',
          key: message.key
        }
      });

      // Get profile picture
      let userPfp;
      try {
        userPfp = await sock.profilePictureUrl(who, 'image');
      } catch (err) {
        userPfp = 'https://i.ibb.co/9HY4wjz/a4c0b1af253197d4837ff6760d5b81c0.jpg';
      }

      // Get user name (try to extract from contact or use phone number)
      let userName = who.split('@')[0];
      try {
        const contactInfo = await sock.onWhatsApp(who);
        if (contactInfo?.[0]?.notify) {
          userName = contactInfo[0].notify;
        }
      } catch (err) {
        // Use default name
      }

      // Prepare quote JSON
      const quoteJson = {
        type: 'quote',
        format: 'png',
        backgroundColor: '#FFFFFF',
        width: 1800,
        height: 200,
        scale: 2,
        messages: [
          {
            entities: [],
            avatar: true,
            from: {
              id: 1,
              name: userName,
              photo: {
                url: userPfp,
              },
            },
            text: text,
            replyMessage: {},
          },
        ],
      };

      // Fetch quote image from API
      const res = await axios.post('https://bot.lyo.su/quote/generate', quoteJson, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      if (!res.data?.result?.image) {
        throw new Error('Invalid API response');
      }

      // Convert base64 to buffer
      const bufferImage = Buffer.from(res.data.result.image, 'base64');

      // Save to temporary file
      const tempImagePath = path.join(os.tmpdir(), `quote_${Date.now()}.png`);
      fs.writeFileSync(tempImagePath, bufferImage);

      // Create sticker
      const sticker = new Sticker(tempImagePath, {
        pack: 'WhatsApp Bot',
        author: userName,
        type: StickerTypes.FULL,
        categories: ['🤩', '🎉'],
        id: Math.floor(100000 + Math.random() * 900000).toString(),
        quality: 100,
        background: '#00000000',
      });

      // Send sticker
      try {
        const stickerBuffer = await sticker.toBuffer();
        await sock.sendMessage(chatId, {
          sticker: stickerBuffer
        }, { quoted: message });

        // React with success emoji
        await sock.sendMessage(chatId, {
          react: {
            text: '✅',
            key: message.key
          }
        });
      } catch (stickerError) {
        console.error('Error sending sticker:', stickerError);
        
        // Fallback: send as image
        await sock.sendMessage(chatId, {
          image: bufferImage,
          caption: '📝 Quote image (sticker conversion failed)'
        }, { quoted: message });

        await sock.sendMessage(chatId, {
          react: {
            text: '⚠️',
            key: message.key
          }
        });
      }

      // Clean up temporary file
      try {
        fs.unlinkSync(tempImagePath);
      } catch (err) {
        console.error('Error cleaning up temp file:', err);
      }

    } catch (err) {
      console.error('Quote plugin error:', err);

      // React with error emoji
      await sock.sendMessage(chatId, {
        react: {
          text: '❌',
          key: message.key
        }
      });

      let errorMessage = '❌ Failed to generate quote. ';
      
      if (err.message.includes('timeout')) {
        errorMessage += 'Request timed out. Please try again.';
      } else if (err.message.includes('Invalid API response')) {
        errorMessage += 'API returned invalid data.';
      } else {
        errorMessage += 'Please try again later.';
      }

      await sock.sendMessage(chatId, { 
        text: errorMessage 
      }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading quoted.js:', e.message); }

/* ===== exad.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'excard',
  aliases: [],
  category: 'tools',
  description: 'Create a rich media card',
  usage: '.excard Title | Body | ImageURL',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const input = args.join(' ');

    if (!input.includes('|')) {
      return await sock.sendMessage(chatId, { 
        text: '*Usage:* .excard Title | Body | ImageURL\n\n*Example:* .excard Google | Search anything | https://google.com/logo.png' 
      }, { quoted: message });
    }

    const [title, body, url] = input.split('|').map(t => t.trim());

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const hasQuotedImage = quoted?.imageMessage;

    await sock.sendMessage(chatId, { 
      text: body || " ",
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'Shared via Mega Md',
          thumbnailUrl: url || 'https://i.ibb.co/3S6f0mS/default.jpg',
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: url || 'https://github.com'
        }
      }
    }, { quoted: message });
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading exad.js:', e.message); }

/* ===== excard.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

module.exports = {
    command: 'excard',
    aliases: [],
    category: 'tools',
    description: 'Create a rich media card',
    usage: '.excard Title | Body | ImageURL',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const input = args.join(' ');

        if (!input.includes('|')) {
            return await sock.sendMessage(chatId, {
                text: '*Usage:* .excard Title | Body | ImageURL\n\n*Example:* .excard Google | Search anything | https://google.com/logo.png'
            }, { quoted: message });
        }

        const [title, body, url] = input.split('|').map(t => t.trim());

        await sock.sendMessage(chatId, {
            text: body || " ",
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: 'Shared via Mega Md',
                    thumbnailUrl: url || 'https://i.ibb.co/3S6f0mS/default.jpg',
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    sourceUrl: url || 'https://github.com'
                }
            }
        }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-03-sticker] Error loading excard.js:', e.message); }

module.exports = _bundle;
