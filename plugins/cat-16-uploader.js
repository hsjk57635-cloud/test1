'use strict';
// AUTO-GENERATED BUNDLE: cat-16-uploader
// Contains: u-aupload.js, u-catbox.js, u-freeimg.js, u-litterbox.js, u-pixhost.js, u-pomf.js, u-quax.js, u-tmpfile.js, u-uguuse.js, u-xoat.js

const _bundle = [];


/* ===== u-aupload.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { uploadFile } = require('../lib/uploaders');

module.exports = {
    command: 'aupload',
    aliases: ['upall', 'aup', 'toall'],
    category: 'upload',
    description: 'Upload media to cloud and get URL',
    usage: '.aupload (reply to image/video/gif/sticker)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please reply to an image, video, GIF, or sticker!' }, { quoted: message });
                return;
            }

            const type = Object.keys(quotedMsg)[0];
            const supportedTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'];
            
            if (!supportedTypes.includes(type)) {
                await sock.sendMessage(chatId, { text: '⚠️ Unsupported file type! Reply to image/video/gif/sticker/document' }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, { text: 'Uploading to cloud...' }, { quoted: message });

            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(quotedMsg[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let ext = 'bin';
            if (type === 'imageMessage') ext = 'jpg';
            else if (type === 'videoMessage') ext = 'mp4';
            else if (type === 'stickerMessage') ext = 'webp';
            else if (type === 'documentMessage') {
                const fileName = quotedMsg[type].fileName || 'file';
                ext = fileName.split('.').pop() || 'bin';
            }

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `upload_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);

            const stats = fs.statSync(tempPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            const result = await uploadFile(tempPath);

            await sock.sendMessage(chatId, { 
                text: `✅ *Upload Successful!*\n\n` +
                      `📊 *Service:* ${result.service}\n` +
                      `📦 *Size:* ${fileSizeMB} MB\n` +
                      `🔗 *URL:* ${result.url}\n\n` +
                      `_Click the link to view/download_`
            }, { quoted: message });

            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error('Upload Error:', error);
            await sock.sendMessage(chatId, { 
                text: `❌ Upload failed!\n\nError: ${error.message}` 
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
} catch(e) { console.warn('[BUNDLE:cat-16-uploader] Error loading u-aupload.js:', e.message); }

/* ===== u-catbox.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { uploadToCatbox } = require('../lib/uploaders');

module.exports = {
    command: 'catbox',
    aliases: ['cb'],
    category: 'upload',
    description: 'Upload to Catbox.moe (200MB, permanent)',
    usage: '.catbox (reply to media)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please reply to media!' }, { quoted: message });
                return;
            }

            const type = Object.keys(quotedMsg)[0];
            const supportedTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'];
            
            if (!supportedTypes.includes(type)) {
                await sock.sendMessage(chatId, { text: '⚠️ Unsupported type!' }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, { text: 'Uploading to Catbox...' }, { quoted: message });

            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(quotedMsg[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let ext = 'bin';
            if (type === 'imageMessage') ext = 'jpg';
            else if (type === 'videoMessage') ext = 'mp4';
            else if (type === 'stickerMessage') ext = 'webp';
            else if (quotedMsg[type].fileName) {
                ext = quotedMsg[type].fileName.split('.').pop() || 'bin';
            }

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `catbox_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);

            const result = await uploadToCatbox(tempPath);

            await sock.sendMessage(chatId, { 
                text: `✅ *Catbox Upload Success!*\n\n🔗 ${result.url}`
            }, { quoted: message });

            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error('Catbox Error:', error);
            await sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-16-uploader] Error loading u-catbox.js:', e.message); }

/* ===== u-freeimg.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { uploadToFreeimage } = require('../lib/uploaders');

module.exports = {
    command: 'freeimage',
    aliases: ['fimg', 'freeimg'],
    category: 'upload',
    description: 'Upload to Freeimage.host',
    usage: '.freeimage (reply to image)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg?.imageMessage) {
                await sock.sendMessage(chatId, { text: '⚠️ Please reply to an image!' }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, { text: 'Uploading to Freeimage...' }, { quoted: message });

            const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `freeimage_${Date.now()}.jpg`);
            fs.writeFileSync(tempPath, buffer);

            const result = await uploadToFreeimage(tempPath);

            await sock.sendMessage(chatId, { 
                text: `✅ *Freeimage Upload Success!*\n\n` +
                      `🔗 *URL:* ${result.url}\n` +
                      `🖼️ *Display:* ${result.display_url}\n` +
                      `🗑️ *Delete:* ${result.delete_url}`
            }, { quoted: message });

            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error('Freeimage Error:', error);
            await sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-16-uploader] Error loading u-freeimg.js:', e.message); }

/* ===== u-litterbox.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { uploadToLitterbox } = require('../lib/uploaders');

module.exports = {
    command: 'litterbox',
    aliases: ['tempup', 'litter', 'litr'],
    category: 'upload',
    description: 'Upload temporarily (1h/12h/24h/72h)',
    usage: '.litterbox <1h/12h/24h/72h> (reply to media)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please reply to media!' }, { quoted: message });
                return;
            }

            const type = Object.keys(quotedMsg)[0];
            const supportedTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'];
            
            if (!supportedTypes.includes(type)) {
                await sock.sendMessage(chatId, { text: '⚠️ Unsupported type!' }, { quoted: message });
                return;
            }

            const time = args[0] || '1h';
            const validTimes = ['1h', '12h', '24h', '72h'];
            const uploadTime = validTimes.includes(time) ? time : '1h';

            await sock.sendMessage(chatId, { text: `Uploading to Litterbox (${uploadTime})...` }, { quoted: message });

            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(quotedMsg[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let ext = 'bin';
            if (type === 'imageMessage') ext = 'jpg';
            else if (type === 'videoMessage') ext = 'mp4';
            else if (type === 'stickerMessage') ext = 'webp';
            else if (quotedMsg[type].fileName) {
                ext = quotedMsg[type].fileName.split('.').pop() || 'bin';
            }

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `litterbox_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);

            const result = await uploadToLitterbox(tempPath, uploadTime);

            await sock.sendMessage(chatId, { 
                text: `✅ *Litterbox Upload Success!*\n\n` +
                      `⏰ *Expires:* ${result.expires}\n` +
                      `🔗 *URL:* ${result.url}\n\n` +
                      `_Link will expire after ${result.expires}_`
            }, { quoted: message });

            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error('Litterbox Error:', error);
            await sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-16-uploader] Error loading u-litterbox.js:', e.message); }

/* ===== u-pixhost.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { uploadToPixhost } = require('../lib/uploaders');

module.exports = {
    command: 'pixhost',
    aliases: ['ph', 'pix'],
    category: 'upload',
    description: 'Upload to Pixhost (images only)',
    usage: '.pixhost (reply to media or caption on media)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const hasMedia = message.message?.imageMessage || 
                           message.message?.videoMessage || 
                           message.message?.stickerMessage || 
                           message.message?.documentMessage;
            
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!hasMedia && !quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please send media with caption or reply to media!' }, { quoted: message });
                return;
            }

            const mediaSource = hasMedia ? message.message : quotedMsg;
            const type = Object.keys(mediaSource).find(key => 
                ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'].includes(key)
            );

            if (!type) {
                await sock.sendMessage(chatId, { text: '⚠️ Unsupported media type!' }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, { text: 'Uploading to Pixhost...' }, { quoted: message });

            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(mediaSource[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let ext = 'bin';
            if (type === 'imageMessage') ext = 'jpg';
            else if (type === 'videoMessage') ext = 'mp4';
            else if (type === 'stickerMessage') ext = 'webp';
            else if (mediaSource[type].fileName) {
                ext = mediaSource[type].fileName.split('.').pop() || 'bin';
            }

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `pixhost_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);

            const result = await uploadToPixhost(tempPath);

            await sock.sendMessage(chatId, { 
                text: `✅ *Pixhost Upload Success!*\n\n🔗 ${result.url}`
            }, { quoted: message });

            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error('Pixhost Error:', error);
            await sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-16-uploader] Error loading u-pixhost.js:', e.message); }

/* ===== u-pomf.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { uploadToPomf2 } = require('../lib/uploaders');

module.exports = {
    command: 'pomf',
    aliases: ['lain'],
    category: 'upload',
    description: 'Upload to Pomf.lain.la (1GB, permanent)',
    usage: '.pomf (reply to media)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please reply to media!' }, { quoted: message });
                return;
            }

            const type = Object.keys(quotedMsg)[0];
            const supportedTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'];
            
            if (!supportedTypes.includes(type)) {
                await sock.sendMessage(chatId, { text: '⚠️ Unsupported type!' }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, { text: 'Uploading to Pomf...' }, { quoted: message });

            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(quotedMsg[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let ext = 'bin';
            if (type === 'imageMessage') ext = 'jpg';
            else if (type === 'videoMessage') ext = 'mp4';
            else if (type === 'stickerMessage') ext = 'webp';
            else if (quotedMsg[type].fileName) {
                ext = quotedMsg[type].fileName.split('.').pop() || 'bin';
            }

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `pomf_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);

            const result = await uploadToPomf2(tempPath);

            await sock.sendMessage(chatId, { 
                text: `✅ *Pomf Upload Success!*\n\n🔗 ${result.url}`
            }, { quoted: message });

            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error('Pomf Error:', error);
            await sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-16-uploader] Error loading u-pomf.js:', e.message); }

/* ===== u-quax.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { uploadToQuax } = require('../lib/uploaders');

module.exports = {
    command: 'quax',
    aliases: ['qu', 'qx'],
    category: 'upload',
    description: 'Upload to Qu.ax (anonymous)',
    usage: '.quax (reply to media or caption on media)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const hasMedia = message.message?.imageMessage || 
                           message.message?.videoMessage || 
                           message.message?.stickerMessage || 
                           message.message?.documentMessage;
            
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!hasMedia && !quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please send media with caption or reply to media!' }, { quoted: message });
                return;
            }

            const mediaSource = hasMedia ? message.message : quotedMsg;
            const type = Object.keys(mediaSource).find(key => 
                ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'].includes(key)
            );

            if (!type) {
                await sock.sendMessage(chatId, { text: '⚠️ Unsupported media type!' }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, { text: 'Uploading to Quax...' }, { quoted: message });

            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(mediaSource[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let ext = 'bin';
            if (type === 'imageMessage') ext = 'jpg';
            else if (type === 'videoMessage') ext = 'mp4';
            else if (type === 'stickerMessage') ext = 'webp';
            else if (mediaSource[type].fileName) {
                ext = mediaSource[type].fileName.split('.').pop() || 'bin';
            }

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `quax_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);

            const result = await uploadToQuax(tempPath);

            await sock.sendMessage(chatId, { 
                text: `✅ *Qu.ax Upload Success!*\n\n🔗 ${result.url}`
            }, { quoted: message });

            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error('Qu.ax Error:', error);
            await sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-16-uploader] Error loading u-quax.js:', e.message); }

/* ===== u-tmpfile.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { uploadToTmpfiles } = require('../lib/uploaders');

module.exports = {
    command: 'tmpfiles',
    aliases: ['tmpf', 'tfiles'],
    category: 'upload',
    description: 'Upload to Tmpfiles.org (temporary)',
    usage: '.tmpfiles (reply to media or caption on media)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const hasMedia = message.message?.imageMessage || 
                           message.message?.videoMessage || 
                           message.message?.stickerMessage || 
                           message.message?.documentMessage;
            
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!hasMedia && !quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please send media with caption or reply to media!' }, { quoted: message });
                return;
            }

            const mediaSource = hasMedia ? message.message : quotedMsg;
            const type = Object.keys(mediaSource).find(key => 
                ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'].includes(key)
            );

            if (!type) {
                await sock.sendMessage(chatId, { text: '⚠️ Unsupported media type!' }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, { text: 'Uploading to Tmpfiles...' }, { quoted: message });

            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(mediaSource[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let ext = 'bin';
            if (type === 'imageMessage') ext = 'jpg';
            else if (type === 'videoMessage') ext = 'mp4';
            else if (type === 'stickerMessage') ext = 'webp';
            else if (mediaSource[type].fileName) {
                ext = mediaSource[type].fileName.split('.').pop() || 'bin';
            }

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `tmpfiles_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);

            const result = await uploadToTmpfiles(tempPath);

            await sock.sendMessage(chatId, { 
                text: `✅ *Tmpfiles Upload Success!*\n\n🔗 Direct: ${result.url}\n📄 Page: ${result.page_url}`
            }, { quoted: message });

            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error('Tmpfiles Error:', error);
            await sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-16-uploader] Error loading u-tmpfile.js:', e.message); }

/* ===== u-uguuse.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { uploadToUguu } = require('../lib/uploaders');

module.exports = {
    command: 'uguu',
    aliases: ['ug', 'uguuse'],
    category: 'upload',
    description: 'Upload to Uguu.se (temporary)',
    usage: '.uguu (reply to media or caption on media)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const hasMedia = message.message?.imageMessage || 
                           message.message?.videoMessage || 
                           message.message?.stickerMessage || 
                           message.message?.documentMessage;
            
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!hasMedia && !quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please send media with caption or reply to media!' }, { quoted: message });
                return;
            }

            const mediaSource = hasMedia ? message.message : quotedMsg;
            const type = Object.keys(mediaSource).find(key => 
                ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'].includes(key)
            );

            if (!type) {
                await sock.sendMessage(chatId, { text: '⚠️ Unsupported media type!' }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, { text: 'Uploading to Uguu...' }, { quoted: message });

            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(mediaSource[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let ext = 'bin';
            if (type === 'imageMessage') ext = 'jpg';
            else if (type === 'videoMessage') ext = 'mp4';
            else if (type === 'stickerMessage') ext = 'webp';
            else if (mediaSource[type].fileName) {
                ext = mediaSource[type].fileName.split('.').pop() || 'bin';
            }

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `uguu_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);

            const result = await uploadToUguu(tempPath);

            await sock.sendMessage(chatId, { 
                text: `✅ *Uguu Upload Success!*\n\n🔗 ${result.url}\n⚠️ Temporary link`
            }, { quoted: message });

            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error('Uguu Error:', error);
            await sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-16-uploader] Error loading u-uguuse.js:', e.message); }

/* ===== u-xoat.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { uploadToX0 } = require('../lib/uploaders');

module.exports = {
    command: 'xoat',
    aliases: ['xo', 'x0at', 'x0'],
    category: 'upload',
    description: 'Upload to X0.at (anonymous)',
    usage: '.xoat (reply to media or caption on media)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const hasMedia = message.message?.imageMessage || 
                           message.message?.videoMessage || 
                           message.message?.stickerMessage || 
                           message.message?.documentMessage;
            
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!hasMedia && !quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please send media with caption or reply to media!' }, { quoted: message });
                return;
            }

            const mediaSource = hasMedia ? message.message : quotedMsg;
            const type = Object.keys(mediaSource).find(key => 
                ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'].includes(key)
            );

            if (!type) {
                await sock.sendMessage(chatId, { text: '⚠️ Unsupported media type!' }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, { text: 'Uploading to X0at...' }, { quoted: message });

            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(mediaSource[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let ext = 'bin';
            if (type === 'imageMessage') ext = 'jpg';
            else if (type === 'videoMessage') ext = 'mp4';
            else if (type === 'stickerMessage') ext = 'webp';
            else if (mediaSource[type].fileName) {
                ext = mediaSource[type].fileName.split('.').pop() || 'bin';
            }

            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `x0_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);

            const result = await uploadToX0(tempPath);

            await sock.sendMessage(chatId, { 
                text: `✅ *X0at Upload Success!*\n\n🔗 ${result.url}`
            }, { quoted: message });

            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error('X0.at Error:', error);
            await sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-16-uploader] Error loading u-xoat.js:', e.message); }

module.exports = _bundle;