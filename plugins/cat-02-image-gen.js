'use strict';
// AUTO-GENERATED BUNDLE: cat-02-image-gen
// Contains: imagen-dalle.js, imagen-flux.js, imagine-diffusion.js, imagine.js, sora.js, codingImg.js, cyberImg.js, gameImg.js, techImg.js, islamicImg.js, mountImg.js, mountainImg.js, meme.js, maker.js, wasted.js, hack.js, couples-dp.js, pies.js, quozio.js, textmaker.js, styletext.js, tinytext.js, quote.js, quote2.js, alamy.js, istock.js, getty.js, gimage.js

const _bundle = [];


/* ===== imagen-dalle.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & JUNAID-MD↣³⁰²                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

const IMAGE_APIS = [
    (p) => `https://stable.stacktoy.workers.dev/?apikey=Suhail&prompt=${encodeURIComponent(p)}`,
    (p) => `https://dalle.stacktoy.workers.dev/?apikey=Suhail&prompt=${encodeURIComponent(p)}`,
    (p) => `https://flux.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(p)}`
];

const generateImage = async (prompt) => {
    for (const apiUrl of IMAGE_APIS) {
        try {
            const { data } = await axios.get(apiUrl(prompt), {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            const buf = Buffer.from(data);
            if (buf[0] === 0x89 || buf[0] === 0xFF) return buf;
        } catch {
            continue;
        }
    }
    throw new Error('All image generation APIs failed');
};

const enhancePrompt = (prompt) => {
    const enhancers = [
        'high quality', 'detailed', 'masterpiece', 'best quality',
        'ultra realistic', '4k', 'highly detailed', 'cinematic lighting'
    ];
    const selected = enhancers
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 3);
    return `${prompt}, ${selected.join(', ')}`;
};

module.exports = {
    command: 'dalle',
    aliases: ['aiimage', 'draw', 'genimage'],
    category: 'ai',
    description: 'Generate an AI image based on your prompt',
    usage: '.dalle <prompt>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const imagePrompt = args.join(' ').trim();

        if (!imagePrompt) {
            return sock.sendMessage(
                chatId,
                { text: '🎨 *AI Image Generator*\n\nUsage: `.dalle <prompt>`\nExample: `.dalle a beautiful sunset over mountains`' },
                { quoted: message }
            );
        }

        await sock.sendMessage(chatId, { react: { text: '🎨', key: message.key } });
        await sock.sendMessage(chatId, { text: '🎨 Generating your image... Please wait.' }, { quoted: message });

        try {
            const enhanced = enhancePrompt(imagePrompt);
            const imageBuffer = await generateImage(enhanced);

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🎨 *Generated Image*\n📝 Prompt: _${imagePrompt}_`
            }, { quoted: message });

        } catch (error) {
            console.error('Imagine error:', error.message);
            await sock.sendMessage(
                chatId,
                { text: '❌ Failed to generate image. Please try again later.' },
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading imagen-dalle.js:', e.message); }

/* ===== imagen-flux.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & JUNAID-MD↣³⁰²                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

const IMAGE_APIS = [
    (p) => `https://stable.stacktoy.workers.dev/?apikey=Suhail&prompt=${encodeURIComponent(p)}`,
    (p) => `https://dalle.stacktoy.workers.dev/?apikey=Suhail&prompt=${encodeURIComponent(p)}`,
    (p) => `https://flux.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(p)}`
];

const generateImage = async (prompt) => {
    for (const apiUrl of IMAGE_APIS) {
        try {
            const { data } = await axios.get(apiUrl(prompt), {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            const buf = Buffer.from(data);
            if (buf[0] === 0x89 || buf[0] === 0xFF) return buf;
        } catch {
            continue;
        }
    }
    throw new Error('All image generation APIs failed');
};

const enhancePrompt = (prompt) => {
    const enhancers = [
        'high quality', 'detailed', 'masterpiece', 'best quality',
        'ultra realistic', '4k', 'highly detailed', 'cinematic lighting'
    ];
    const selected = enhancers
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 3);
    return `${prompt}, ${selected.join(', ')}`;
};

module.exports = {
    command: 'flux',
    aliases: ['aiimage', 'imagen', 'draw', 'genimage'],
    category: 'ai',
    description: 'Generate an AI image based on your prompt',
    usage: '.flux <prompt>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const imagePrompt = args.join(' ').trim();

        if (!imagePrompt) {
            return sock.sendMessage(
                chatId,
                { text: '🎨 *AI Image Generator*\n\nUsage: `.flux <prompt>`\nExample: `.flux a beautiful sunset over mountains`' },
                { quoted: message }
            );
        }

        await sock.sendMessage(chatId, { react: { text: '🎨', key: message.key } });
        await sock.sendMessage(chatId, { text: '🎨 Generating your image... Please wait.' }, { quoted: message });

        try {
            const enhanced = enhancePrompt(imagePrompt);
            const imageBuffer = await generateImage(enhanced);

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🎨 *Generated Image*\n📝 Prompt: _${imagePrompt}_`
            }, { quoted: message });

        } catch (error) {
            console.error('Imagine error:', error.message);
            await sock.sendMessage(
                chatId,
                { text: '❌ Failed to generate image. Please try again later.' },
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading imagen-flux.js:', e.message); }

/* ===== imagine-diffusion.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & JUNAID-MD↣³⁰²                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

const IMAGE_APIS = [
    (p) => `https://stable.stacktoy.workers.dev/?apikey=Suhail&prompt=${encodeURIComponent(p)}`,
    (p) => `https://dalle.stacktoy.workers.dev/?apikey=Suhail&prompt=${encodeURIComponent(p)}`,
    (p) => `https://flux.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(p)}`
];

const generateImage = async (prompt) => {
    for (const apiUrl of IMAGE_APIS) {
        try {
            const { data } = await axios.get(apiUrl(prompt), {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            const buf = Buffer.from(data);
            if (buf[0] === 0x89 || buf[0] === 0xFF) return buf;
        } catch {
            continue;
        }
    }
    throw new Error('All image generation APIs failed');
};

const enhancePrompt = (prompt) => {
    const enhancers = [
        'high quality', 'detailed', 'masterpiece', 'best quality',
        'ultra realistic', '4k', 'highly detailed', 'cinematic lighting'
    ];
    const selected = enhancers
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 3);
    return `${prompt}, ${selected.join(', ')}`;
};

module.exports = {
    command: 'diffusion',
    aliases: ['aiimage', 'draw', 'genimage'],
    category: 'ai',
    description: 'Generate an AI image based on your prompt',
    usage: '.diffusion <prompt>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const imagePrompt = args.join(' ').trim();

        if (!imagePrompt) {
            return sock.sendMessage(
                chatId,
                { text: '🎨 *AI Image Generator*\n\nUsage: `.diffusion <prompt>`\nExample: `.diffusion a beautiful sunset over mountains`' },
                { quoted: message }
            );
        }

        await sock.sendMessage(chatId, { react: { text: '🎨', key: message.key } });
        await sock.sendMessage(chatId, { text: '🎨 Generating your image... Please wait.' }, { quoted: message });

        try {
            const enhanced = enhancePrompt(imagePrompt);
            const imageBuffer = await generateImage(enhanced);

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🎨 *Generated Image*\n📝 Prompt: _${imagePrompt}_`
            }, { quoted: message });

        } catch (error) {
            console.error('Imagine error:', error.message);
            await sock.sendMessage(
                chatId,
                { text: '❌ Failed to generate image. Please try again later.' },
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading imagine-diffusion.js:', e.message); }

/* ===== imagine.js ===== */
// Moved to standalone plugins/zz-imagine.js for reliable command registration.

/* ===== sora.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & JUNAID-MD↣³⁰²                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { fromBuffer } = require('file-type');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// List of free video generation APIs
const VIDEO_APIS = [
    { url: 'https://okatsu-rolezapiiz.vercel.app/ai/txt2video', param: 'text' },
    { url: 'https://api.agaxt.dev/ai/text2video', param: 'text' },
    { url: 'https://api.neoxr.eu/api/text2video', param: 'text' },
    { url: 'https://api.ryzendesu.vip/api/ai/text2video', param: 'text' },
    { url: 'https://api.giftedtech.my.id/api/ai/text2video', param: 'q', apikey: 'gifted' }
];

/**
 * Convert any video to MP4 using ffmpeg
 */
async function convertToMp4(inputBuffer, inputExt) {
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const id = Date.now();
    const inputPath = path.join(tempDir, `sora_in_${id}.${inputExt}`);
    const outputPath = path.join(tempDir, `sora_out_${id}.mp4`);

    fs.writeFileSync(inputPath, inputBuffer);

    try {
        await execAsync(`ffmpeg -i "${inputPath}" -c:v libx264 -preset ultrafast -c:a aac "${outputPath}"`, { timeout: 60000 });
        const outputBuffer = fs.readFileSync(outputPath);
        return outputBuffer;
    } finally {
        // Cleanup
        try { fs.unlinkSync(inputPath); } catch {}
        try { fs.unlinkSync(outputPath); } catch {}
    }
}

module.exports = {
    command: 'sora',
    aliases: ['aivideo', 'text2video'],
    category: 'ai',
    description: 'Generate AI video from text prompt',
    usage: '.sora <prompt>',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;

        try {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
            const prompt = args.join(' ') || quotedText;

            if (!prompt) {
                await sock.sendMessage(chatId, {
                    text: `🎬 *SORA AI VIDEO GENERATOR*\n\n` +
                          `*Usage:* \`.sora <prompt>\`\n` +
                          `*Example:* \`.sora A cat playing in a garden\``,
                    ...channelInfo
                }, { quoted: message });
                return;
            }

            const statusMsg = await sock.sendMessage(chatId, {
                text: `🎬 Generating video for:\n"${prompt}"\n\n⏳ This may take 60-90 seconds...`,
                ...channelInfo
            }, { quoted: message });

            let videoBuffer = null;
            let lastError = null;

            // Try each API
            for (const api of VIDEO_APIS) {
                try {
                    let url;
                    if (api.apikey) {
                        url = `${api.url}?${api.param}=${encodeURIComponent(prompt)}&apikey=${api.apikey}`;
                    } else {
                        url = `${api.url}?${api.param}=${encodeURIComponent(prompt)}`;
                    }

                    const response = await axios.get(url, {
                        timeout: 45000,
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });

                    const data = response.data;
                    let videoUrl = data?.videoUrl || data?.result || data?.data?.videoUrl ||
                                   data?.url || data?.video || data?.download || data?.link;

                    if (videoUrl) {
                        // Download video
                        const videoRes = await axios.get(videoUrl, {
                            responseType: 'arraybuffer',
                            timeout: 60000
                        });
                        videoBuffer = Buffer.from(videoRes.data);
                        break;
                    }
                } catch (e) {
                    lastError = e;
                    console.log(`[SORA] API ${api.url} failed: ${e.message}`);
                }
            }

            if (!videoBuffer) {
                throw new Error(lastError?.message || 'All video APIs failed');
            }

            // Check video type and convert if needed
            const type = await fromBuffer(videoBuffer);
            let finalBuffer = videoBuffer;
            let mimetype = type?.mime || 'video/mp4';

            // If not MP4, try to convert
            if (!type || type.mime !== 'video/mp4') {
                await sock.sendMessage(chatId, {
                    text: '🔄 Converting video to MP4...',
                    edit: statusMsg.key
                }, { quoted: message });

                finalBuffer = await convertToMp4(videoBuffer, type?.ext || 'bin');
                mimetype = 'video/mp4';
            }

            // Send video
            await sock.sendMessage(chatId, {
                video: finalBuffer,
                mimetype: mimetype,
                caption: `🎬 *Generated Video*\n\nPrompt: ${prompt}`,
                ...channelInfo
            }, { quoted: message });

            // Clean up status
            await sock.sendMessage(chatId, { delete: statusMsg.key });

        } catch (error) {
            console.error('[SORA] Error:', error.message);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to generate video.\nReason: ${error.message}\n\nTry a different prompt or try again later.`,
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading sora.js:', e.message); }

/* ===== codingImg.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'coding',
  aliases: ['codingimg', 'programming', 'programmingimg'],
  category: 'images',
  description: 'Get a random programming image',
  usage: '.coding',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const res = await axios.get('https://raw.githubusercontent.com/AbdulRehman19721986/Database/main/images/coding.json');

      if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to fetch image.' }, { quoted: message });
      }

      const randomImage = res.data[Math.floor(Math.random() * res.data.length)];

      await sock.sendMessage(chatId, { image: { url: randomImage }, caption: '💻 Programming Image' }, { quoted: message });

    } catch (err) {
      console.error('Programming image plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Error while fetching image.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading codingImg.js:', e.message); }

/* ===== cyberImg.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

module.exports = {
    command: 'cyberimg',
    aliases: ['cyber', 'cyberspace'],
    category: 'images',
    description: 'Get a random cyberspace image',
    usage: '.cyberimg',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const res = await axios.get('https://raw.githubusercontent.com/AbdulRehmanRajpoot/Database/main/images/cyberspace.json');

            if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
                return await sock.sendMessage(chatId, { text: '❌ Failed to fetch image.' }, { quoted: message });
            }

            const randomImage = res.data[Math.floor(Math.random() * res.data.length)];

            await sock.sendMessage(chatId, { image: { url: randomImage }, caption: '🌐 Cyberspace Image' }, { quoted: message });

        } catch (err) {
            console.error('Cyberspace image plugin error:', err);
            await sock.sendMessage(chatId, { text: '❌ Error while fetching image.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading cyberImg.js:', e.message); }

/* ===== gameImg.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'game',
  aliases: ['gaming', 'gameimg'],
  category: 'images',
  description: 'Get a random gaming image',
  usage: '.game',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const res = await axios.get('https://raw.githubusercontent.com/AbdulRehman19721986/Database/main/images/game.json');

      if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to fetch image.' }, { quoted: message });
      }

      const randomImage = res.data[Math.floor(Math.random() * res.data.length)];

      await sock.sendMessage(chatId, { image: { url: randomImage }, caption: '🎮 Gaming Image' }, { quoted: message });

    } catch (err) {
      console.error('Game image plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Error while fetching image.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading gameImg.js:', e.message); }

/* ===== techImg.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'tech',
  aliases: ['technology', 'techimg'],
  category: 'images',
  description: 'Get a random tech image',
  usage: '.tech',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const res = await axios.get('https://raw.githubusercontent.com/AbdulRehman19721986/Database/main/images/tech.json');

      if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to fetch image.' }, { quoted: message });
      }

      const randomImage = res.data[Math.floor(Math.random() * res.data.length)];

      await sock.sendMessage(chatId, { image: { url: randomImage }, caption: '💻 Tech Image' }, { quoted: message });

    } catch (err) {
      console.error('Tech image plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Error while fetching image.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading techImg.js:', e.message); }

/* ===== islamicImg.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'islamic',
  aliases: ['islampic', 'muslimpic'],
  category: 'images',
  description: 'Get a random Islamic image',
  usage: '.islamic',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const res = await axios.get('https://raw.githubusercontent.com/AbdulRehman19721986/Database/main/images/islamic.json');

      if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to fetch image.' }, { quoted: message });
      }

      const randomImage = res.data[Math.floor(Math.random() * res.data.length)];

      await sock.sendMessage(chatId, { image: { url: randomImage }, caption: '🕌 Islamic Image' }, { quoted: message });

    } catch (err) {
      console.error('Islamic image plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Error while fetching image.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading islamicImg.js:', e.message); }

/* ===== mountImg.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'mountain',
  aliases: ['mountains', 'mountainimg'],
  category: 'images',
  description: 'Get a random mountain image',
  usage: '.mountain',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const res = await axios.get('https://raw.githubusercontent.com/AbdulRehman19721986/Database/main/images/mountain.json');

      if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to fetch image.' }, { quoted: message });
      }

      const randomImage = res.data[Math.floor(Math.random() * res.data.length)];

      await sock.sendMessage(chatId, { image: { url: randomImage }, caption: '🏔️ Mountain Image' }, { quoted: message });

    } catch (err) {
      console.error('Mountain image plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Error while fetching image.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading mountImg.js:', e.message); }

/* ===== mountainImg.js ===== */
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

const axios = require('axios');

module.exports = {
    command: 'mountain',
    aliases: ['mountains', 'mountainimg'],
    category: 'images',
    description: 'Get a random mountain image',
    usage: '.mountain',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const res = await axios.get('https://raw.githubusercontent.com/GlobalTechInfo/Database/main/images/mountain.json');

            if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
                return await sock.sendMessage(chatId, { text: '❌ Failed to fetch image.' }, { quoted: message });
            }

            const randomImage = res.data[Math.floor(Math.random() * res.data.length)];

            await sock.sendMessage(chatId, { image: { url: randomImage }, caption: '🏔️ Mountain Image' }, { quoted: message });

        } catch (err) {
            console.error('Mountain image plugin error:', err);
            await sock.sendMessage(chatId, { text: '❌ Error while fetching image.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading mountainImg.js:', e.message); }

/* ===== meme.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
  command: 'meme',
  aliases: ['cheems', 'memes'],
  category: 'fun',
  description: 'Get a random cheems meme with buttons for another meme or joke',
  usage: '.meme',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const res = await fetch('https://shizoapi.onrender.com/api/memes/cheems?apikey=shizo');

      if (!res.ok) throw `API request failed with status ${res.status}`;

      const contentType = res.headers.get('content-type');

      if (contentType && contentType.includes('image')) {
        const imageBuffer = await res.buffer();

        const buttons = [
          { buttonId: '.meme', buttonText: { displayText: '🎭 Another Meme' }, type: 1 },
          { buttonId: '.joke', buttonText: { displayText: '😄 Joke' }, type: 1 }
        ];

        await sock.sendMessage(chatId, {
          image: imageBuffer,
          caption: "🐕 > Here's your cheems meme!",
          buttons: buttons,
          headerType: 1
        }, { quoted: message });

      } else {
        await sock.sendMessage(chatId, {
          text: '❌ The API did not return a valid image.',
          quoted: message
        });
      }

    } catch (error) {
      console.error('Meme Command Error:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to fetch meme. Please try again later.',
        quoted: message
      });
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading meme.js:', e.message); }

/* ===== maker.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/maker.js
const axios = require('axios');

async function sendImageFromUrl(sock, chatId, message, url, caption = '') {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
  const buffer = Buffer.from(res.data);
  await sock.sendMessage(chatId, { image: buffer, caption }, { quoted: message });
}

// Helper for emoji mix (returns PNG URL)
async function getEmojiMix(emoji1, emoji2) {
  const url = `https://api.deline.web.id/maker/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;
  const { data } = await axios.get(url);
  if (!data.status) throw new Error(data.error);
  return data.result.png;
}

module.exports = [
  {
    command: 'cewekbrat',
    aliases: ['brat'],
    category: 'maker',
    description: 'Generate a "brat girl" image with custom text',
    usage: '.cewekbrat <text>',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      const text = args.join(' ').trim();
      if (!text) return sock.sendMessage(chatId, { text: '❌ Provide text for the image.' }, { quoted: message });
      const url = `https://api.deline.web.id/maker/cewekbrat?text=${encodeURIComponent(text)}`;
      try {
        await sendImageFromUrl(sock, chatId, message, url, `✨ *Brat Girl*: ${text}`);
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed: ${err.message}` }, { quoted: message });
      }
    }
  },
  {
    command: 'emojigif',
    aliases: ['egif'],
    category: 'maker',
    description: 'Get animated GIF version of an emoji',
    usage: '.emojigif <emoji>',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      const emoji = args[0];
      if (!emoji) return sock.sendMessage(chatId, { text: '❌ Provide an emoji.' }, { quoted: message });
      const url = `https://api.deline.web.id/maker/emojigif?emoji=${encodeURIComponent(emoji)}`;
      try {
        await sendImageFromUrl(sock, chatId, message, url, `🎞️ Animated ${emoji}`);
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed: ${err.message}` }, { quoted: message });
      }
    }
  },
  {
    command: 'emojimix',
    aliases: ['mix'],
    category: 'maker',
    description: 'Combine two emojis into a sticker',
    usage: '.emojimix 🗿 😭',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      if (args.length < 2) return sock.sendMessage(chatId, { text: '❌ Provide two emojis: .emojimix 🗿 😭' }, { quoted: message });
      const [e1, e2] = args;
      try {
        const imgUrl = await getEmojiMix(e1, e2);
        await sendImageFromUrl(sock, chatId, message, imgUrl, `🔄 ${e1} + ${e2}`);
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed: ${err.message}` }, { quoted: message });
      }
    }
  },
  {
    command: 'iqc',
    aliases: ['iphonechat'],
    category: 'maker',
    description: 'Generate a fake iPhone chat screenshot',
    usage: '.iqc <text> [time] [statusTime]',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      let text = args.join(' ');
      let chatTime = '22:11';
      let statusTime = '22:20';
      // Simple parsing: if last argument is like HH:MM, treat as chatTime
      const parts = text.split(' ');
      const last = parts[parts.length-1];
      if (/^\d{2}:\d{2}$/.test(last)) {
        chatTime = last;
        text = parts.slice(0, -1).join(' ');
      }
      if (!text) return sock.sendMessage(chatId, { text: '❌ Provide text for the chat.' }, { quoted: message });
      const url = `https://api.deline.web.id/maker/iqc?text=${encodeURIComponent(text)}&chatTime=${encodeURIComponent(chatTime)}&statusBarTime=${encodeURIComponent(statusTime)}`;
      try {
        await sendImageFromUrl(sock, chatId, message, url, `📱 *iPhone Chat*\n${text}`);
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed: ${err.message}` }, { quoted: message });
      }
    }
  },
  {
    command: 'qc',
    aliases: ['quote'],
    category: 'maker',
    description: 'Generate a custom quote image',
    usage: '.qc <text> [color] [avatar] [name]',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      let text = args.join(' ');
      let color = 'white';
      let avatar = 'https://api.deline.web.id/4w9O3SzQWY.jpg';
      let name = 'agas';
      // parse simple options (color as last word if known)
      const words = text.split(' ');
      const last = words[words.length-1];
      const colors = ['red','blue','green','yellow','black','white','purple','brown','orange','cyan','magenta','fuchsia','lime','indigo','violet','gold','silver','beige','turquoise','peach','salmon','mint','lavender','chartreuse','khaki','plum','olive','orchid','sienna','tomato','tan','snow','azure','slategray','royalblue','navy','maroon','teal','lavenderblush','gray','grey'];
      if (colors.includes(last)) {
        color = last;
        text = words.slice(0, -1).join(' ');
      }
      if (!text) return sock.sendMessage(chatId, { text: '❌ Provide quote text.' }, { quoted: message });
      const url = `https://api.deline.web.id/maker/qc?text=${encodeURIComponent(text)}&color=${encodeURIComponent(color)}&avatar=${encodeURIComponent(avatar)}&nama=${encodeURIComponent(name)}`;
      try {
        await sendImageFromUrl(sock, chatId, message, url, `📜 *Quote*: ${text}`);
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed: ${err.message}` }, { quoted: message });
      }
    }
  },
  {
    command: 'smeme',
    aliases: ['memesticker'],
    category: 'maker',
    description: 'Create a meme sticker from an image URL with top/bottom text',
    usage: '.smeme <image_url> <top> <bottom>',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      if (args.length < 3) return sock.sendMessage(chatId, { text: '❌ Usage: .smeme <image_url> <top text> <bottom text>' }, { quoted: message });
      const [image, top, bottom] = args;
      const url = `https://api.deline.web.id/maker/smeme?image=${encodeURIComponent(image)}&top=${encodeURIComponent(top)}&bottom=${encodeURIComponent(bottom)}`;
      try {
        await sendImageFromUrl(sock, chatId, message, url, `🧩 *Meme*: ${top} / ${bottom}`);
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed: ${err.message}` }, { quoted: message });
      }
    }
  }
];

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading maker.js:', e.message); }

/* ===== wasted.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

module.exports = {
  command: 'wasted',
  aliases: ['waste'],
  category: 'group',
  description: 'Waste someone in style!',
  usage: '.wasted @user',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let userToWaste;
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
      userToWaste = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
      userToWaste = message.message.extendedTextMessage.contextInfo.participant;
    }
    if (!userToWaste) {
      return await sock.sendMessage(chatId, {
        text: 'Please mention someone or reply to their message to waste them!',
        ...channelInfo
      }, { quoted: message });
    }

    try {
      let profilePic;
      try {
        profilePic = await sock.profilePictureUrl(userToWaste, 'image');
      } catch {
        profilePic = 'https://i.imgur.com/2wzGhpF.jpeg';
      }
      const wastedResponse = await axios.get(
        `https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`,
        { responseType: 'arraybuffer' }
      );
      await sock.sendMessage(chatId, {
        image: Buffer.from(wastedResponse.data),
        caption: `⚰️ *Wasted* : ${userToWaste.split('@')[0]} 💀\n\nRest in pieces!`,
        mentions: [userToWaste],
        ...channelInfo
      }, { quoted: message });

    } catch (error) {
      console.error('Error in wasted command:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to create wasted image! Try again later.',
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading wasted.js:', e.message); }

/* ===== hack.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  command: 'hack',
  aliases: ['fakehack', 'prankhack'],
  category: 'fun',
  description: 'Simulate a hack sequence (fun prank)',
  usage: '.hack [target]',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const target = args[0] || 'anonymous';

    try {
      // Send initial message and capture its key
      const initialMsg = await sock.sendMessage(chatId, {
        text: `*💻 Initializing hack sequence on ${target}...*`
      }, { quoted: message });
      const key = initialMsg.key;

      // Helper to edit the same message
      const edit = async (newText) => {
        await sock.sendMessage(chatId, { text: newText, edit: key });
      };

      // Helper to simulate a progress bar
      const progressTask = async (taskName, emoji, steps) => {
        for (let i = 1; i <= steps; i++) {
          const percent = Math.round((i / steps) * 100);
          const bar = '█'.repeat(i) + '░'.repeat(steps - i);
          await edit(`${emoji} *${taskName}:* [${bar}] ${percent}%`);
          await delay(1000);
        }
        await edit(`✅ *${taskName} completed!*`);
        await delay(600);
      };

      // Sequence steps
      await edit(`*💻 Hacking target: ${target}*`);
      await delay(1500);

      await edit('*🔌 Establishing secure connection...*');
      await delay(1500);

      await progressTask('Bypassing firewalls', '🛡️', 5);
      await progressTask('Cracking encryption', '🔑', 6);
      await progressTask('Downloading data', '📥', 4);
      await progressTask('Planting backdoor', '🔒', 3);

      await edit(`*💥 Hack complete! Target "${target}" compromised.*`);
      await delay(1000);
      await edit('*🤖 Logging off...*');
    } catch (err) {
      console.error('Hack command error:', err);
      await sock.sendMessage(chatId, { text: '⚠️ Hack simulation failed. Try again.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading hack.js:', e.message); }

/* ===== couples-dp.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *  COUPLES DP — JUNAID-MD↣³⁰² v7.0 ULTRA                                      *
 *                                                                           *
 *  Commands:                                                                *
 *   • .couplepp — fetch a random male + female couple profile picture pair  *
 *                                                                           *
 *****************************************************************************/

'use strict';

const axios = require('axios');

/* ── Config ──────────────────────────────────────────────────────────────── */
const CPP_CONFIG = {
    processingEmoji: '💑',
    successEmoji   : '✅',
    errorEmoji     : '❌',

    // Tried in order — first success wins
    apis: [
        'https://api.davidcyriltech.my.id/couplepp',
        'https://apis.davidcyriltech.my.id/couplepp',
    ],
    timeout: 15000,

    maleCaption:
        `👨 *Male — Couple DP*\n\n` +
        `_Pair this with the female DP below_ 💑\n\n` +
        `_Powered by JUNAID-MD↣³⁰²_ 🔥`,

    femaleCaption:
        `👩 *Female — Couple DP*\n\n` +
        `_Set these as your profile pictures together_ 💕\n\n` +
        `_Powered by JUNAID-MD↣³⁰²_ 🔥`,
};

/* ── Exports (single object — matches original loader format) ────────────── */
module.exports = {
    command    : 'couplepp',
    aliases    : ['couple', 'cpp', 'coupledp'],
    category   : 'image',
    description: 'Get a random male + female couple profile picture pair',
    usage      : '.couplepp',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        await sock.sendMessage(chatId, { react: { text: CPP_CONFIG.processingEmoji, key: message.key } });

        /* ── Fetch from API (with fallback) ───────────────────────────── */
        let data = null;
        for (const apiUrl of CPP_CONFIG.apis) {
            try {
                const res = await axios.get(apiUrl, { timeout: CPP_CONFIG.timeout });
                if (res.data?.success && (res.data.male || res.data.female)) {
                    data = res.data;
                    break;
                }
            } catch (e) {
                console.warn(`[COUPLEPP] API failed (${apiUrl}):`, e.message);
            }
        }

        if (!data) {
            await sock.sendMessage(chatId, { react: { text: CPP_CONFIG.errorEmoji, key: message.key } });
            return await sock.sendMessage(chatId, {
                text: '❌ *Could not fetch couple pictures right now.*\n_Please try again later._ 🔄'
            }, { quoted: message });
        }

        try {
            if (data.male) {
                await sock.sendMessage(chatId, {
                    image  : { url: data.male },
                    caption: CPP_CONFIG.maleCaption,
                }, { quoted: message });
            }

            if (data.female) {
                await sock.sendMessage(chatId, {
                    image  : { url: data.female },
                    caption: CPP_CONFIG.femaleCaption,
                }, { quoted: message });
            }

            await sock.sendMessage(chatId, { react: { text: CPP_CONFIG.successEmoji, key: message.key } });

        } catch (e) {
            console.error('[COUPLEPP ERROR]', e.message);
            await sock.sendMessage(chatId, { react: { text: CPP_CONFIG.errorEmoji, key: message.key } });
            await sock.sendMessage(chatId,
                { text: `❌ *Error fetching couple DP:* \`${e.message}\`` },
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading couples-dp.js:', e.message); }

/* ===== pies.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fetch = require('node-fetch');

const BASE = 'https://shizoapi.onrender.com/api/pies';
const VALID_COUNTRIES = ['china', 'indonesia', 'japan', 'korea', 'hijab'];

async function fetchPiesImageBuffer(country) {
  const url = `${BASE}/${country}?apikey=shizo`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('image')) throw new Error('API did not return an image');
  return res.buffer();
}

module.exports = {
  command: 'pies',
  aliases: ['pie'],
  category: 'images',
  description: 'Get a pies image from a specific country',
  usage: `.pies <country>\nAvailable countries: ${VALID_COUNTRIES.join(', ')}`,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sub = (args[0] || '').toLowerCase();

    if (!sub) {
      await sock.sendMessage(chatId, {
        text: `Usage: .pies <country>\nCountries: ${VALID_COUNTRIES.join(', ')}`
      }, { quoted: message });
      return;
    }
    if (!VALID_COUNTRIES.includes(sub)) {
      await sock.sendMessage(chatId, {
        text: `Unsupported country: ${sub}. Try one of: ${VALID_COUNTRIES.join(', ')}`
      }, { quoted: message });
      return;
    }
    try {
      const imageBuffer = await fetchPiesImageBuffer(sub);
      await sock.sendMessage(chatId, {
        image: imageBuffer,
        caption: `🍰 pies: ${sub}`
      }, { quoted: message });
    } catch (err) {
      console.error('Pies Command Error:', err);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to fetch image. Please try again.'
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading pies.js:', e.message); }

/* ===== quozio.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
  command: 'qmaker',
  aliases: ['qmkr', 'quozio'],
  category: 'tools',
  description: 'Create a quote image from text or replied message',
  usage: '.qmaker <text> or reply to a message',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let text = args?.join(' ')?.trim();

    try {
      if (!text) {
        const quotedText = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
        if (!quotedText) {
          return await sock.sendMessage(chatId, { text: '*Provide text or reply to a message to create a quote.*' }, { quoted: message });
        }
        text = quotedText;
      }

      const author = message.pushName || message?.key?.participant || 'Anonymous';

      const createRes = await fetch('https://quozio.com/api/v1/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: author,
          quote: text
        })
      });

      const quoteData = await createRes.json();
      if (!quoteData?.quoteId) throw new Error('Quote creation failed');

      const quoteId = quoteData.quoteId;

      const templatesRes = await fetch('https://quozio.com/api/v1/templates');
      const templatesData = await templatesRes.json();
      const templates = templatesData.data;

      if (!templates?.length) throw new Error('No templates found');

      const template = templates[Math.floor(Math.random() * templates.length)];

      const imageRes = await fetch(
        `https://quozio.com/api/v1/quotes/${quoteId}/imageUrls?templateId=${template.templateId}`
      );
      const imageData = await imageRes.json();

      if (!imageData?.medium) throw new Error('Image generation failed');

      await sock.sendMessage(chatId, { image: { url: imageData.medium }, caption: `📝 Quote Created\n\nAuthor: ${author}\n\n${text}` }, { quoted: message });

    } catch (error) {
      console.error('Quote plugin error:', error);
      await sock.sendMessage(chatId, { text: '❌ Failed to create quote. Try again later.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading quozio.js:', e.message); }

/* ===== textmaker.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const mumaker = require('mumaker');

const allTypes = [
    'metallic','ice','snow','impressive','matrix','light','neon','devil',
    'purple','thunder','leaves','1917','arena','hacker','sand',
    'blackpink','glitch','fire'
];

module.exports = {
    command: 'ephoto',
    aliases: ['tmaker', 'textmaker'],
    category: 'menu',
    description: 'Generate styled text with various effects',
    usage: '.ephoto <type> <text>',

    async handler(sock, message, args) {
        const chatId = message.key.remoteJid;
        const type = args[0]?.toLowerCase();
        const text = args.slice(1).join(' ');

        if (!type || !allTypes.includes(type) || !text) {
            let menuText =
`✨🎨 *EPHOTO TEXT MAKER* 🎨✨
━━━━━━━━━━━━━━━━━━━
🖌️ *Create stunning text styles*
⚡ Fast • Stylish • HD Effects

📌 *Usage*
👉 *.ephoto <type> <text>*
📖 Example:
👉 *.ephoto metallic Hello*

━━━━━━━━━━━━━━━━━━━
🎭 *AVAILABLE STYLES*
`;

            allTypes.forEach((t, i) => {
                menuText += `🔹 *${i + 1}.* ${t}\n`;
            });

            menuText +=
`━━━━━━━━━━━━━━━━━━━
💡 *Tip:* Use short & clear text for best results
🤖 Powered by *JUNAID-MD↣³⁰²*`;

            return await sock.sendMessage(
                chatId,
                { text: menuText },
                { quoted: message }
            );
        }

        try {
            let url;
            switch (type) {
                case 'metallic': url = "https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html"; break;
                case 'ice': url = "https://en.ephoto360.com/ice-text-effect-online-101.html"; break;
                case 'snow': url = "https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html"; break;
                case 'impressive': url = "https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html"; break;
                case 'matrix': url = "https://en.ephoto360.com/matrix-text-effect-154.html"; break;
                case 'light': url = "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html"; break;
                case 'neon': url = "https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html"; break;
                case 'devil': url = "https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html"; break;
                case 'purple': url = "https://en.ephoto360.com/purple-text-effect-online-100.html"; break;
                case 'thunder': url = "https://en.ephoto360.com/thunder-text-effect-online-97.html"; break;
                case 'leaves': url = "https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html"; break;
                case '1917': url = "https://en.ephoto360.com/1917-style-text-effect-523.html"; break;
                case 'arena': url = "https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html"; break;
                case 'hacker': url = "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html"; break;
                case 'sand': url = "https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html"; break;
                case 'blackpink': url = "https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html"; break;
                case 'glitch': url = "https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html"; break;
                case 'fire': url = "https://en.ephoto360.com/flame-lettering-effect-372.html"; break;
            }

            const result = await mumaker.ephoto(url, text);

            if (!result?.image) {
                throw new Error('No image URL received from the API');
            }

            await sock.sendMessage(
                chatId,
                {
                    image: { url: result.image },
                    caption: `🔥 *GENERATED SUCCESSFULLY* 🔥\n✨ Powered by *JUNAID-MD↣³⁰²*`
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error generating styled text:', error);
            await sock.sendMessage(
                chatId,
                { text: `❌ *Generation Failed*\nReason: ${error.message}` },
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading textmaker.js:', e.message); }

/* ===== styletext.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const Qasim = require('api-qasim');

module.exports = {
  command: 'stext',
  aliases: ['fancytext', 'textstyle', 'styletext'],
  category: 'menu',
  description: 'Style text in different fancy formats',
  usage: '.stext <text>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(' ');
    try {
      if (!text || text.trim() === '') {
        await sock.sendMessage(chatId, { 
          text: "*Please provide a text to style.*\nExample: .stext Hello" 
        }, { quoted: message });
        return;
      }
      const styledResult = await Qasim.styletext(text);

      if (!Array.isArray(styledResult) || styledResult.length === 0) {
        throw new Error('No styled text found.');
      }
      let messageText = 'Reply with choosen number:\n\n';
      styledResult.forEach((item, index) => {
        const styledText = item.result || item;
        messageText += `*${index + 1}.* ${styledText}\n`;
      });

      const sentMsg = await sock.sendMessage(chatId, {
        text: messageText
      }, { quoted: message });

      sock.styletext = sock.styletext || {};
      sock.styletext[sentMsg.key.id] = styledResult;

      const listener = async ({ messages }) => {
        const m = messages[0];
        if (!m.message || !m.key || !m.key.remoteJid) return;
        if (m.key.remoteJid !== chatId) return;

        let isQuoted = false;
        if (m.message.extendedTextMessage &&
            m.message.extendedTextMessage.contextInfo &&
            m.message.extendedTextMessage.contextInfo.quotedMessage) {
          const quotedId = m.message.extendedTextMessage.contextInfo.stanzaId 
            || m.message.extendedTextMessage.contextInfo.quotedMessageKey?.id;
          if (quotedId === sentMsg.key.id) isQuoted = true;
        }

        let userReply = m.message.conversation || '';
        if (m.message.extendedTextMessage && m.message.extendedTextMessage.text) 
          userReply = m.message.extendedTextMessage.text;

        if (!userReply) return;
        if (!isQuoted && m.message.conversation !== sentMsg.key.id) return;

        const choice = parseInt(userReply.trim());
        if (!isNaN(choice) && choice >= 1 && choice <= styledResult.length) {
          const selectedText = styledResult[choice - 1].result || styledResult[choice - 1];
          await sock.sendMessage(m.key.remoteJid, { text: selectedText }, { quoted: m });
          delete sock.styletext[sentMsg.key.id];
          sock.ev.off('messages.upsert', listener);
        } else {
          await sock.sendMessage(m.key.remoteJid, { 
            text: `Invalid selection. Please choose a number between 1 and ${styledResult.length}.` 
          }, { quoted: m });
        }
      };

      sock.ev.on('messages.upsert', listener);

    } catch (error) {
      console.error('Error in styleTextCommand:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ Failed to style the text. Please try again later.' 
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading styletext.js:', e.message); }

/* ===== tinytext.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@AbdulRehman19721986                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *                                                                           *
 *    © 2026 AbdulRehman19721986. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the JUNAID-MD↣³⁰² Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/


module.exports = {
  command: 'smallcaps',
  aliases: ['tinytext', 'mini'],
  category: 'tools',
  description: 'Convert text to small-capital style',
  usage: '.smallcaps <text> OR reply to a message',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    
    try {
      let txt = args?.join(' ') || "";
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted) {
        txt = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || txt;
      }
      
      txt = txt.replace(/^\.\w+\s*/, '').trim();

      if (!txt) {
        return await sock.sendMessage(chatId, { 
          text: 'Please provide text or reply to a message to convert.\nExample: `.smallcaps Hello World`' 
        }, { quoted: message });
      }

    const capsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ',
        'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ',
        'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
        'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ꜰ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ', 'J': 'ᴊ',
        'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ', 'S': 's', 'T': 'ᴛ',
        'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ',
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };

    const result = txt.split('').map(char => capsMap[char] || char).join('');
      await sock.sendMessage(chatId, { text: result }, { quoted: message });

    } catch (err) {
      console.error('SmallCaps Error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to process text.' });
    }
  }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@AbdulRehman19721986                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *                                                                           *
 *    © 2026 AbdulRehman19721986. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the REDXBOT302 Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading tinytext.js:', e.message); }

/* ===== quote.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
  command: 'quote',
  aliases: ['quotes', 'quotetext'],
  category: 'quotes',
  description: 'Get a random quote',
  usage: '.quote',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const apiKey = 'shizo';
      const res = await fetch(`https://shizoapi.onrender.com/api/texts/quotes?apikey=${apiKey}`);
      if (!res.ok) throw await res.text();
      const json = await res.json();
      const quoteMessage = json.result;
      await sock.sendMessage(chatId, { text: quoteMessage }, { quoted: message });
    } catch (error) {
      console.error('Quote Command Error:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to get quote. Please try again later!'
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading quote.js:', e.message); }

/* ===== quote2.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'quote2',
  aliases: ['quotes2', 'randomquote'],
  category: 'quotes',
  description: 'Get a random inspirational quote',
  usage: '.quote2',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const res = await axios.get('https://discardapi.dpdns.org/api/quotes/random?apikey=guru');

      if (!res.data || res.data.status !== true) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to fetch quote.' }, { quoted: message });
      }

      const quote = res.data.result?.quote || 'No quote found.';
      const creator = res.data.creator || 'Unknown';

      const replyText = `💬 *Random Quote*\n\n${quote}`;

      await sock.sendMessage(chatId, { text: replyText }, { quoted: message });

    } catch (err) {
      console.error('Quote plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Error while fetching quote.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading quote2.js:', e.message); }

/* ===== alamy.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

'use strict';

const axios = require('axios');

module.exports = {
    command    : 'alamy',
    aliases    : ['alamydl', 'alamydownload'],
    category   : 'download',
    description: 'Download image or video from Alamy URL',
    usage      : '.alamy <Alamy URL>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const url    = args?.[0]?.trim();

        if (!url || !url.startsWith('http')) {
            return await sock.sendMessage(chatId, {
                text:
                    `❌ *Please provide a valid Alamy URL.*\n\n` +
                    `*Usage:* \`.alamy <Alamy URL>\`\n` +
                    `*Example:* \`.alamy https://www.alamy.com/video/beautiful-lake...\``
            }, { quoted: message });
        }

        // Processing reaction
        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        try {
            const apiUrl = `https://discardapi.dpdns.org/api/dl/alamy?apikey=guru&url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl, { timeout: 15000 });

            if (!data?.status || !data.result?.length) {
                await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
                return await sock.sendMessage(chatId, {
                    text: '❌ *Failed to fetch media from the provided Alamy URL.*\n_Make sure the URL is correct and publicly accessible._'
                }, { quoted: message });
            }

            let sent = 0;
            for (const item of data.result) {
                if (item.video) {
                    await sock.sendMessage(chatId, {
                        video  : { url: item.video },
                        caption: `🎬 *Alamy Video*\n\n_Downloaded by JUNAID-MD↣³⁰²_ 🔥`,
                    }, { quoted: message });
                    sent++;
                }
                if (item.image) {
                    await sock.sendMessage(chatId, {
                        image  : { url: item.image },
                        caption: `🖼️ *Alamy Image*\n\n_Downloaded by JUNAID-MD↣³⁰²_ 🔥`,
                    }, { quoted: message });
                    sent++;
                }
            }

            if (sent === 0) {
                await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
                return await sock.sendMessage(chatId, {
                    text: '❌ *No downloadable media found in the response.*'
                }, { quoted: message });
            }

            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error('[ALAMY ERROR]', err.message);
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });

            const errText = err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT'
                ? '❌ *Request timed out.* The API may be slow or temporarily unavailable. Try again later.'
                : `❌ *Failed to download media from Alamy URL.*\n_Error:_ \`${err.message}\``;

            await sock.sendMessage(chatId, { text: errText }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading alamy.js:', e.message); }

/* ===== istock.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'istock',
  aliases: ['istockdl', 'istockdownload'],
  category: 'download',
  description: 'Download image or video from iStock URL',
  usage: '.istock <iStock URL>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args?.[0]?.trim();

    if (!url) {
      return await sock.sendMessage(chatId, { text: 'Please provide an iStock URL.\nExample: .istock https://www.istockphoto.com/video/...' }, { quoted: message });
    }

    try {
      const apiUrl = `https://discardapi.dpdns.org/api/dl/istock?apikey=guru&url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, { timeout: 10000 });

      if (!data?.status || !data.result) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to fetch media from the provided iStock URL.' }, { quoted: message });
      }

      const item = data.result;

      if (item.video) {
        await sock.sendMessage(chatId, { video: { url: item.video }, caption: '🎬 *iStock Video*' }, { quoted: message });
      }

      if (item.image) {
        await sock.sendMessage(chatId, { image: { url: item.image }, caption: '🖼️ *iStock Image*' }, { quoted: message });
      }

    } catch (error) {
      console.error('iStock download plugin error:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { text: '❌ Request timed out. The API may be slow or unreachable.' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: '❌ Failed to download media from iStock URL.' }, { quoted: message });
      }
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading istock.js:', e.message); }

/* ===== getty.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'getty',
  aliases: ['gettyvideo', 'gettydl'],
  category: 'download',
  description: 'Download video or image from Getty Images',
  usage: '.getty <Getty URL>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args?.[0];

    if (!url) {
      return await sock.sendMessage(chatId, { text: 'Please provide a Getty URL.\nExample: .getty https://www.gettyimages.com/detail/video/482277170' }, { quoted: message });
    }

    try {
      const apiUrl = `https://discardapi.dpdns.org/api/dl/getty?apikey=guru&url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, { timeout: 10000 });

      if (!data?.status || !data.result?.length) {
        return await sock.sendMessage(chatId, { text: '❌ No video found for this URL.' }, { quoted: message });
      }

      const videoUrl = data.result[0].video;
      const imageUrl = data.result[0].image;

      if (imageUrl) {
        await sock.sendMessage(chatId, { image: { url: imageUrl }, caption: '🖼️ Getty Thumbnail' }, { quoted: message });
      }

      if (videoUrl) {
        await sock.sendMessage(chatId, { video: { url: videoUrl }, caption: '🎬 Getty Video' }, { quoted: message });
      }

    } catch (error) {
      console.error('Getty plugin error:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { text: '❌ Request timed out. The API may be slow or unreachable.' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch Getty video.' }, { quoted: message });
      }
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading getty.js:', e.message); }

/* ===== gimage.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/gimage.js
const axios = require('axios');
const MAX_IMAGES = 30;

const APIS = [
  {
    name: 'JawadTech',
    url: 'https://jawad-tech.vercel.app/search/gimage?q={query}',
    parser: (data) => data?.status && Array.isArray(data.result) ? data.result : null
  },
  {
    name: 'Maher Zubair',
    url: 'https://api.maher-zubair.tech/search/googleimage?q={query}',
    parser: (data) => data?.status && Array.isArray(data.result) ? data.result : null
  },
  {
    name: 'Siputzx',
    url: 'https://api.siputzx.my.id/api/search/googleimg?q={query}',
    parser: (data) => data?.status && Array.isArray(data.result) ? data.result : null
  },
  {
    name: 'Botcahx',
    url: 'https://api.botcahx.lol/api/search/googleimage?q={query}',
    parser: (data) => data?.status && Array.isArray(data.result) ? data.result : null
  }
];

module.exports = {
  command: 'gimage',
  aliases: ['gimg', 'googleimage'],
  category: 'download',
  description: 'Search and download images',
  usage: '.gimage <search term> [number]',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    if (!args.length) {
      return sock.sendMessage(chatId, {
        text: '🖼️ *Google Image Downloader*\n\nUsage: .gimage <search term> [number]\nExample: .gimage cute cats 10',
        ...channelInfo
      }, { quoted: message });
    }

    let num = 5;
    let query = args.join(' ');
    const last = args[args.length - 1];
    if (!isNaN(last) && args.length > 1) {
      num = parseInt(last);
      query = args.slice(0, -1).join(' ');
    }
    if (num > MAX_IMAGES) num = MAX_IMAGES;

    await sock.sendMessage(chatId, { text: `🔍 Searching for "${query}"...` }, { quoted: message });

    let allResults = null;
    for (const api of APIS) {
      try {
        const url = api.url.replace('{query}', encodeURIComponent(query));
        const { data } = await axios.get(url, { timeout: 15000 });
        const parsed = api.parser(data);
        if (parsed && parsed.length) {
          allResults = parsed;
          break;
        }
      } catch (err) { console.log(`${api.name} failed:`, err.message); }
    }

    if (!allResults || !allResults.length) {
      return sock.sendMessage(chatId, { text: '❌ No images found. Try a different search term.' }, { quoted: message });
    }

    // Remove duplicates
    const seen = new Set();
    const unique = [];
    for (const item of allResults) {
      const url = item.url || item.image || item.thumbnail;
      if (url && !seen.has(url)) {
        seen.add(url);
        unique.push({ url, ...item });
      }
    }

    const toDownload = Math.min(num, unique.length);
    await sock.sendMessage(chatId, { text: `✅ Found ${unique.length} images. Downloading ${toDownload}...` }, { quoted: message });

    for (let i = 0; i < toDownload; i++) {
      const img = unique[i];
      const imageUrl = img.url || img.image || img.thumbnail;
      try {
        const res = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const buffer = Buffer.from(res.data);
        const caption = `🖼️ *${query}* (${i+1}/${toDownload})`;
        await sock.sendMessage(chatId, { image: buffer, caption }, { quoted: message });
        if (i < toDownload - 1) await new Promise(r => setTimeout(r, 800));
      } catch (err) {
        console.error(`Failed image ${i+1}:`, err.message);
      }
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
} catch(e) { console.warn('[BUNDLE:cat-02-image-gen] Error loading gimage.js:', e.message); }

module.exports = _bundle;