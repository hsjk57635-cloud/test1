'use strict';
// AUTO-GENERATED BUNDLE: cat-12-tools
// Contains: translate.js, calc.js, qrcode.js, qr.js, qrcustom.js, readqr.js, distance.js, units.js, math.js, cipher.js, base64.js, url.js, urldecode.js, shorturl.js, unshort.js, tourl.js, pingweb.js, define.js, dictionary.js, ocr.js, bfread.js, brainfuck.js, rle.js, dna.js, analyze.js, string.js, element.js, crypto.js, conversion.js, tiny.js, iplookup.js, whois.js, fetch.js, nssearch.js, seo.js, momo.js
// NOTE: movsearch.js (TMDB, duplicate 'movie' alias) removed — .movie now lives only in plugins/moviedl.js (Arslan MD API)

const _bundle = [];


/* ===== translate.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
  command: 'translate',
  aliases: ['trt'],
  category: 'tools',
  description: 'Translate text to the specified language.',
  usage: '.translate <text> <lang> or reply to a message with .translate <lang>',
  
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      await sock.presenceSubscribe(chatId);
      await sock.sendPresenceUpdate('composing', chatId);

      let textToTranslate = '';
      let lang = '';

      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMessage) {
        textToTranslate = quotedMessage.conversation || 
                          quotedMessage.extendedTextMessage?.text || 
                          quotedMessage.imageMessage?.caption || 
                          quotedMessage.videoMessage?.caption || 
                          '';

        lang = args[0]?.trim();
      } else {
        if (args.length < 2) {
          return await sock.sendMessage(chatId, {
            text: `*TRANSLATOR*\n\nUsage:\n1. Reply to a message with: .translate <lang> or .trt <lang>\n2. Or type: .translate <text> <lang> or .trt <text> <lang>\n\nExample:\n.translate hello fr\n.trt hello fr\n\nLanguage codes:\nfr - French\nes - Spanish\nde - German\nit - Italian\npt - Portuguese\nru - Russian\nja - Japanese\nko - Korean\nzh - Chinese\nar - Arabic\nhi - Hindi`,
            quoted: message
          });
        }

        lang = args.pop();
        textToTranslate = args.join(' ');
      }

      if (!textToTranslate) {
        return await sock.sendMessage(chatId, {
          text: 'No text found to translate. Please provide text or reply to a message.',
          quoted: message
        });
      }

      let translatedText = null;
      let error = null;
      try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(textToTranslate)}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data[0] && data[0][0] && data[0][0][0]) {
            translatedText = data[0][0][0];
          }
        }
      } catch (e) {
        error = e;
      }
      if (!translatedText) {
        try {
          const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${lang}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.responseData && data.responseData.translatedText) {
              translatedText = data.responseData.translatedText;
            }
          }
        } catch (e) {
          error = e;
        }
      }
      if (!translatedText) {
        try {
          const response = await fetch(`https://api.dreaded.site/api/translate?text=${encodeURIComponent(textToTranslate)}&lang=${lang}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.translated) {
              translatedText = data.translated;
            }
          }
        } catch (e) {
          error = e;
        }
      }
      if (!translatedText) {
        throw new Error('All translation APIs failed');
      }
      await sock.sendMessage(chatId, {
        text: `${translatedText}`,
      }, {
        quoted: message
      });

    } catch (error) {
      console.error('❌ Error in translate command:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to translate text. Please try again later.\n\nUsage:\n1. Reply to a message with: .translate <lang> or .trt <lang>\n2. Or type: .translate <text> <lang> or .trt <text> <lang>',
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading translate.js:', e.message); }

/* ===== calc.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/calc.js – CommonJS version
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
  command: 'calc',
  aliases: ['calculator'],
  category: 'tools',
  description: 'Evaluate a mathematical expression',
  usage: '.calc <expression>',
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const expression = args.join(' ');

    if (!expression) {
      return sock.sendMessage(chatId, {
        text: '❌ Please provide an expression.\nExample: `.calc 2 + 2`',
        ...channelInfo
      }, { quoted: message });
    }

    try {
      // Safer evaluation using a subprocess (avoid eval)
      const { stdout, stderr } = await execPromise(`node -p "${expression.replace(/"/g, '\\"')}"`);
      if (stderr) throw new Error(stderr);
      const result = stdout.trim();

      await sock.sendMessage(chatId, {
        text: `📟 *Result:* ${result}`,
        ...channelInfo
      }, { quoted: message });
    } catch (err) {
      await sock.sendMessage(chatId, {
        text: `❌ Error: ${err.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading calc.js:', e.message); }

/* ===== qrcode.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const QRCode = require('qrcode');
const settings = require('../settings'); // Ensure this file exists

module.exports = {
  command: 'qrcode',
  aliases: ['qr'],
  category: 'tools',
  description: 'Generate a QR code from text',
  usage: '.qrcode <text>',

  async handler(sock, message, args, context = {}) {
    const { chatId, channelInfo } = context;
    const text = args?.join(' ')?.trim();

    if (!text) {
      return await sock.sendMessage(chatId, { 
        text: '*Provide text to generate QR*\nExample: .qrcode Hello World',
        ...channelInfo 
      }, { quoted: message });
    }

    try {
      const qr = await QRCode.toDataURL(text.slice(0, 2048), {
        errorCorrectionLevel: 'H',
        scale: 8
      });

      await sock.sendMessage(chatId, { 
        image: { url: qr }, 
        caption: `✅ QR Code Generated | ${settings.botName || 'REDXBOT'}`,
        ...channelInfo 
      }, { quoted: message });
    } catch (err) {
      console.error('QR plugin error:', err);
      await sock.sendMessage(chatId, { 
        text: '❌ Failed to generate QR code.',
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading qrcode.js:', e.message); }

/* ===== qr.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const QRCode = require('qrcode');
module.exports = [{
  pattern: "qr",
  alias: ["qrcode"],
  desc: "Generate QR code from text",
  category: "utility",
  react: "📱",
  filename: __filename,
  use: ".qr <text>",
  execute: async (conn, mek, m, { from, args, q, reply }) => {
    try {
      if (!args.length) return reply("❌ Please provide text.\nExample: .qr Hello World");
      
      const text = args.join(" ");
      const qrBuffer = await QRCode.toBuffer(text);
      
      await conn.sendMessage(from, {
        image: qrBuffer,
        caption: `✅ QR Code for: ${text}`
      }, { quoted: mek });
      
    } catch (e) {
      await reply(`❌ Failed to generate QR code.`);
    }
  }
}];

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading qr.js:', e.message); }

/* ===== qrcustom.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

const AXIOS_DEFAULTS = {
  timeout: 60000,
  responseType: 'arraybuffer'
};

module.exports = {
  command: 'customqr',
  aliases: ['makeqr', 'qrgen'],
  category: 'tools',
  description: 'Generate a custom QR code from text with optional size and color',
  usage: '.customqr <text> | <size> | <color>',
  
  async handler(sock, message, args) {
    const chatId = message.key.remoteJid;
    const rawInput = args.join(' ').split('|').map(s => s.trim());
    
    const text = rawInput[0];
    const size = rawInput[1] || '300×300';
    const color = rawInput[2] || '255-0-0';

    if (!text) {
      return await sock.sendMessage(
        chatId,
        {
          text:
`🎨 *Custom QR Generator*

📌 Usage:
.customqr <text> | <size> | <color>

✨ Example:
.customqr Qasim | 400×400 | 0-0-255

🧩 Generates a colorful QR image`
        },
        { quoted: message }
      );
    }

    try {
      const apiUrl =
        `https://discardapi.dpdns.org/api/maker/customqr` +
        `?apikey=guru&text=${encodeURIComponent(text)}` +
        `&size=${encodeURIComponent(size)}` +
        `&color=${encodeURIComponent(color)}`;

      await sock.sendMessage(chatId, {
        react: { text: '🧩', key: message.key }
      });

      const res = await axios.get(apiUrl, AXIOS_DEFAULTS);

      await sock.sendMessage(
        chatId,
        {
          image: Buffer.from(res.data),
          caption:
`✅ *QR Code Generated*

📝 Text: ${text}
📐 Size: ${size}
🎨 Color: ${color}

𝗕𝗬 𝗠𝗘𝗚𝗔 𝗔𝗜`
        },
        { quoted: message }
      );

    } catch (err) {
      console.error('Custom QR Error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to generate QR code.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading qrcustom.js:', e.message); }

/* ===== readqr.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'readqr',
  aliases: ['qrread', 'decodeqr'],
  category: 'tools',
  description: 'Read QR code from an image',
  usage: 'Reply to an image with .readqr',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const quoted =
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted?.imageMessage) {
        return await sock.sendMessage(
          chatId,
          { text: '🧾 *QR Reader*\n\n📌 Reply to an image that contains a QR code\n\nUsage:\n.readqr' },
          { quoted: message }
        );
      }

      await sock.sendMessage(chatId, {
        react: { text: '🔍', key: message.key }
      });

      const stream = await downloadContentFromMessage(
        quoted.imageMessage,
        'image'
      );

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tempFile = path.join(__dirname, `qr_${Date.now()}.png`);
      fs.writeFileSync(tempFile, buffer);

      const form = new FormData();
      form.append('apikey', 'guru');
      form.append('image', fs.createReadStream(tempFile));

      const res = await axios.post(
        'https://discardapi.dpdns.org/api/tools/readqr',
        form,
        { headers: form.getHeaders(), timeout: 60000 }
      );

      fs.unlinkSync(tempFile);

      if (!res?.data?.status) throw new Error('Decode failed');

      await sock.sendMessage(
        chatId,
        {
          text:
`✅ *QR Code Decoded*

📄 *Result:*
\`\`\`
${res.data.result}
\`\`\`

👤 ${res.data.creator}
`
        },
        { quoted: message }
      );

    } catch (err) {
      console.error('QR Reader Error:', err);
      await sock.sendMessage(
        chatId,
        { text: '❌ Failed to read QR code. Please try a clearer image.' },
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading readqr.js:', e.message); }

/* ===== distance.js ===== */
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

const CITIES = {
    // Pakistan
    karachi:      { name: 'Karachi',       country: 'Pakistan',      lat: 24.8607,  lon: 67.0011,  flag: '🇵🇰' },
    lahore:       { name: 'Lahore',         country: 'Pakistan',      lat: 31.5204,  lon: 74.3587,  flag: '🇵🇰' },
    islamabad:    { name: 'Islamabad',      country: 'Pakistan',      lat: 33.6844,  lon: 73.0479,  flag: '🇵🇰' },
    rawalpindi:   { name: 'Rawalpindi',     country: 'Pakistan',      lat: 33.5651,  lon: 73.0169,  flag: '🇵🇰' },
    faisalabad:   { name: 'Faisalabad',     country: 'Pakistan',      lat: 31.4504,  lon: 73.1350,  flag: '🇵🇰' },
    peshawar:     { name: 'Peshawar',       country: 'Pakistan',      lat: 34.0151,  lon: 71.5249,  flag: '🇵🇰' },
    quetta:       { name: 'Quetta',         country: 'Pakistan',      lat: 30.1798,  lon: 66.9750,  flag: '🇵🇰' },
    multan:       { name: 'Multan',         country: 'Pakistan',      lat: 30.1575,  lon: 71.5249,  flag: '🇵🇰' },
    hyderabad:    { name: 'Hyderabad',      country: 'Pakistan',      lat: 25.3960,  lon: 68.3578,  flag: '🇵🇰' },
    gujranwala:   { name: 'Gujranwala',     country: 'Pakistan',      lat: 32.1877,  lon: 74.1945,  flag: '🇵🇰' },
    // India
    mumbai:       { name: 'Mumbai',         country: 'India',         lat: 19.0760,  lon: 72.8777,  flag: '🇮🇳' },
    delhi:        { name: 'New Delhi',      country: 'India',         lat: 28.6139,  lon: 77.2090,  flag: '🇮🇳' },
    bangalore:    { name: 'Bangalore',      country: 'India',         lat: 12.9716,  lon: 77.5946,  flag: '🇮🇳' },
    chennai:      { name: 'Chennai',        country: 'India',         lat: 13.0827,  lon: 80.2707,  flag: '🇮🇳' },
    kolkata:      { name: 'Kolkata',        country: 'India',         lat: 22.5726,  lon: 88.3639,  flag: '🇮🇳' },
    hyderabadin:  { name: 'Hyderabad (IN)', country: 'India',         lat: 17.3850,  lon: 78.4867,  flag: '🇮🇳' },
    // Middle East
    dubai:        { name: 'Dubai',          country: 'UAE',           lat: 25.2048,  lon: 55.2708,  flag: '🇦🇪' },
    abudhabi:     { name: 'Abu Dhabi',      country: 'UAE',           lat: 24.4539,  lon: 54.3773,  flag: '🇦🇪' },
    riyadh:       { name: 'Riyadh',         country: 'Saudi Arabia',  lat: 24.7136,  lon: 46.6753,  flag: '🇸🇦' },
    jeddah:       { name: 'Jeddah',         country: 'Saudi Arabia',  lat: 21.3891,  lon: 39.8579,  flag: '🇸🇦' },
    mecca:        { name: 'Mecca',          country: 'Saudi Arabia',  lat: 21.3891,  lon: 39.8579,  flag: '🇸🇦' },
    medina:       { name: 'Medina',         country: 'Saudi Arabia',  lat: 24.5247,  lon: 39.5692,  flag: '🇸🇦' },
    kuwait:       { name: 'Kuwait City',    country: 'Kuwait',        lat: 29.3759,  lon: 47.9774,  flag: '🇰🇼' },
    doha:         { name: 'Doha',           country: 'Qatar',         lat: 25.2854,  lon: 51.5310,  flag: '🇶🇦' },
    muscat:       { name: 'Muscat',         country: 'Oman',          lat: 23.5880,  lon: 58.3829,  flag: '🇴🇲' },
    manama:       { name: 'Manama',         country: 'Bahrain',       lat: 26.2235,  lon: 50.5876,  flag: '🇧🇭' },
    tehran:       { name: 'Tehran',         country: 'Iran',          lat: 35.6892,  lon: 51.3890,  flag: '🇮🇷' },
    // Asia
    beijing:      { name: 'Beijing',        country: 'China',         lat: 39.9042,  lon: 116.4074, flag: '🇨🇳' },
    shanghai:     { name: 'Shanghai',       country: 'China',         lat: 31.2304,  lon: 121.4737, flag: '🇨🇳' },
    tokyo:        { name: 'Tokyo',          country: 'Japan',         lat: 35.6762,  lon: 139.6503, flag: '🇯🇵' },
    seoul:        { name: 'Seoul',          country: 'South Korea',   lat: 37.5665,  lon: 126.9780, flag: '🇰🇷' },
    bangkok:      { name: 'Bangkok',        country: 'Thailand',      lat: 13.7563,  lon: 100.5018, flag: '🇹🇭' },
    singapore:    { name: 'Singapore',      country: 'Singapore',     lat: 1.3521,   lon: 103.8198, flag: '🇸🇬' },
    kualalumpur:  { name: 'Kuala Lumpur',   country: 'Malaysia',      lat: 3.1390,   lon: 101.6869, flag: '🇲🇾' },
    jakarta:      { name: 'Jakarta',        country: 'Indonesia',     lat: -6.2088,  lon: 106.8456, flag: '🇮🇩' },
    manila:       { name: 'Manila',         country: 'Philippines',   lat: 14.5995,  lon: 120.9842, flag: '🇵🇭' },
    dhaka:        { name: 'Dhaka',          country: 'Bangladesh',    lat: 23.8103,  lon: 90.4125,  flag: '🇧🇩' },
    colombo:      { name: 'Colombo',        country: 'Sri Lanka',     lat: 6.9271,   lon: 79.8612,  flag: '🇱🇰' },
    kathmandu:    { name: 'Kathmandu',      country: 'Nepal',         lat: 27.7172,  lon: 85.3240,  flag: '🇳🇵' },
    kabul:        { name: 'Kabul',          country: 'Afghanistan',   lat: 34.5553,  lon: 69.2075,  flag: '🇦🇫' },
    // Europe
    london:       { name: 'London',         country: 'UK',            lat: 51.5074,  lon: -0.1278,  flag: '🇬🇧' },
    paris:        { name: 'Paris',          country: 'France',        lat: 48.8566,  lon: 2.3522,   flag: '🇫🇷' },
    berlin:       { name: 'Berlin',         country: 'Germany',       lat: 52.5200,  lon: 13.4050,  flag: '🇩🇪' },
    madrid:       { name: 'Madrid',         country: 'Spain',         lat: 40.4168,  lon: -3.7038,  flag: '🇪🇸' },
    rome:         { name: 'Rome',           country: 'Italy',         lat: 41.9028,  lon: 12.4964,  flag: '🇮🇹' },
    amsterdam:    { name: 'Amsterdam',      country: 'Netherlands',   lat: 52.3676,  lon: 4.9041,   flag: '🇳🇱' },
    moscow:       { name: 'Moscow',         country: 'Russia',        lat: 55.7558,  lon: 37.6173,  flag: '🇷🇺' },
    istanbul:     { name: 'Istanbul',       country: 'Turkey',        lat: 41.0082,  lon: 28.9784,  flag: '🇹🇷' },
    // Americas
    newyork:      { name: 'New York',       country: 'USA',           lat: 40.7128,  lon: -74.0060, flag: '🇺🇸' },
    losangeles:   { name: 'Los Angeles',    country: 'USA',           lat: 34.0522,  lon: -118.2437,flag: '🇺🇸' },
    chicago:      { name: 'Chicago',        country: 'USA',           lat: 41.8781,  lon: -87.6298, flag: '🇺🇸' },
    toronto:      { name: 'Toronto',        country: 'Canada',        lat: 43.6532,  lon: -79.3832, flag: '🇨🇦' },
    saopaulo:     { name: 'São Paulo',      country: 'Brazil',        lat: -23.5505, lon: -46.6333, flag: '🇧🇷' },
    buenosaires:  { name: 'Buenos Aires',   country: 'Argentina',     lat: -34.6037, lon: -58.3816, flag: '🇦🇷' },
    // Africa
    cairo:        { name: 'Cairo',          country: 'Egypt',         lat: 30.0444,  lon: 31.2357,  flag: '🇪🇬' },
    lagos:        { name: 'Lagos',          country: 'Nigeria',       lat: 6.5244,   lon: 3.3792,   flag: '🇳🇬' },
    nairobi:      { name: 'Nairobi',        country: 'Kenya',         lat: -1.2921,  lon: 36.8219,  flag: '🇰🇪' },
    johannesburg: { name: 'Johannesburg',   country: 'South Africa',  lat: -26.2041, lon: 28.0473,  flag: '🇿🇦' },
    // Oceania
    sydney:       { name: 'Sydney',         country: 'Australia',     lat: -33.8688, lon: 151.2093, flag: '🇦🇺' },
    melbourne:    { name: 'Melbourne',      country: 'Australia',     lat: -37.8136, lon: 144.9631, flag: '🇦🇺' },
};

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function findCity(input) {
    const key = input.toLowerCase().replace(/[\s\-_]/g, '');
    if (CITIES[key]) return CITIES[key];
    for (const [k, city] of Object.entries(CITIES)) {
        if (k.includes(key) || key.includes(k)) return city;
        if (city.name.toLowerCase().replace(/\s/g, '').includes(key)) return city;
    }
    return null;
}

function flightTime(km) {
    const hours = km / 900;
    if (hours < 1) return `~${Math.round(hours * 60)} min`;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}

function drivingTime(km) {
    const hours = km / 80;
    if (hours < 1) return `~${Math.round(hours * 60)} min`;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}

module.exports = {
    command: 'distance',
    aliases: ['dist', 'distancecalc', 'citydist'],
    category: 'utility',
    description: 'Calculate distance between two cities with flight and driving time estimates',
    usage: '.distance <city1> to <city2>\nExample: .distance karachi to dubai',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const input = args.join(' ').trim().toLowerCase();

        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `🌍 *Distance Calculator*\n\n` +
                      `*Usage:* \`.distance <city1> to <city2>\`\n\n` +
                      `*Examples:*\n` +
                      `• \`.distance karachi to dubai\`\n` +
                      `• \`.distance lahore to islamabad\`\n` +
                      `• \`.distance london to newyork\`\n` +
                      `• \`.distance tokyo to singapore\`\n\n` +
                      `*Supported cities include:*\n` +
                      `🇵🇰 PK · 🇮🇳 IN · 🇦🇪 UAE · 🇸🇦 SA · 🇬🇧 UK\n` +
                      `🇺🇸 USA · 🇨🇳 CN · 🇯🇵 JP · 🇫🇷 FR · 🇩🇪 DE\n` +
                      `🇧🇩 BD · 🇦🇫 AF · 🇮🇷 IR · 🇹🇷 TR · + many more`,
                ...channelInfo
            }, { quoted: message });
        }

        const toIndex = args.findIndex(a => a.toLowerCase() === 'to');
        if (toIndex === -1 || toIndex === 0 || toIndex === args.length - 1) {
            return await sock.sendMessage(chatId, {
                text: `❌ Use: \`.distance <city1> to <city2>\``,
                ...channelInfo
            }, { quoted: message });
        }

        const city1Input = args.slice(0, toIndex).join('').toLowerCase();
        const city2Input = args.slice(toIndex + 1).join('').toLowerCase();

        const city1 = findCity(city1Input);
        const city2 = findCity(city2Input);

        if (!city1) {
            return await sock.sendMessage(chatId, {
                text: `❌ City not found: *${args.slice(0, toIndex).join(' ')}*\n\nTry common city names like: karachi, dubai, london, newyork`,
                ...channelInfo
            }, { quoted: message });
        }
        if (!city2) {
            return await sock.sendMessage(chatId, {
                text: `❌ City not found: *${args.slice(toIndex + 1).join(' ')}*\n\nTry common city names like: karachi, dubai, london, newyork`,
                ...channelInfo
            }, { quoted: message });
        }

        if (city1.name === city2.name) {
            return await sock.sendMessage(chatId, {
                text: `😄 Both cities are the same! Distance is 0 km.`,
                ...channelInfo
            }, { quoted: message });
        }

        const km = haversine(city1.lat, city1.lon, city2.lat, city2.lon);
        const miles = km * 0.621371;
        const nm = km * 0.539957;

        await sock.sendMessage(chatId, {
            text: `🌍 *Distance Calculator*\n\n` +
                  `${city1.flag} *From:* ${city1.name}, ${city1.country}\n` +
                  `${city2.flag} *To:* ${city2.name}, ${city2.country}\n\n` +
                  `━━━━━━━━━━━━━━━━━\n` +
                  `📏 *Distance:*\n` +
                  `   • ${Math.round(km).toLocaleString()} km\n` +
                  `   • ${Math.round(miles).toLocaleString()} miles\n` +
                  `   • ${Math.round(nm).toLocaleString()} nautical miles\n\n` +
                  `✈️ *Flight time:* ${flightTime(km)}\n` +
                  `🚗 *Drive time:* ${drivingTime(km)}\n\n` +
                  `📍 *Coordinates:*\n` +
                  `   ${city1.name}: ${city1.lat.toFixed(4)}, ${city1.lon.toFixed(4)}\n` +
                  `   ${city2.name}: ${city2.lat.toFixed(4)}, ${city2.lon.toFixed(4)}`,
            ...channelInfo
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading distance.js:', e.message); }

/* ===== units.js ===== */
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

const UNITS = {
    length: {
        mm:    { factor: 0.001,        base: 'm', name: 'Millimeter' },
        cm:    { factor: 0.01,         base: 'm', name: 'Centimeter' },
        m:     { factor: 1,            base: 'm', name: 'Meter' },
        km:    { factor: 1000,         base: 'm', name: 'Kilometer' },
        in:    { factor: 0.0254,       base: 'm', name: 'Inch' },
        ft:    { factor: 0.3048,       base: 'm', name: 'Foot' },
        yd:    { factor: 0.9144,       base: 'm', name: 'Yard' },
        mi:    { factor: 1609.344,     base: 'm', name: 'Mile' },
        nmi:   { factor: 1852,         base: 'm', name: 'Nautical Mile' },
        ly:    { factor: 9.461e15,     base: 'm', name: 'Light Year' },
    },
    weight: {
        mg:    { factor: 0.000001,     base: 'kg', name: 'Milligram' },
        g:     { factor: 0.001,        base: 'kg', name: 'Gram' },
        kg:    { factor: 1,            base: 'kg', name: 'Kilogram' },
        t:     { factor: 1000,         base: 'kg', name: 'Metric Ton' },
        oz:    { factor: 0.0283495,    base: 'kg', name: 'Ounce' },
        lb:    { factor: 0.453592,     base: 'kg', name: 'Pound' },
        st:    { factor: 6.35029,      base: 'kg', name: 'Stone' },
    },
    temperature: {
        c:     { factor: 1, offset: 0,       base: 'c', name: 'Celsius' },
        f:     { factor: 1, offset: 0,       base: 'c', name: 'Fahrenheit' },
        k:     { factor: 1, offset: 0,       base: 'c', name: 'Kelvin' },
    },
    speed: {
        mps:   { factor: 1,            base: 'mps', name: 'Meters/sec' },
        kph:   { factor: 0.277778,     base: 'mps', name: 'Km/hour' },
        mph:   { factor: 0.44704,      base: 'mps', name: 'Miles/hour' },
        knot:  { factor: 0.514444,     base: 'mps', name: 'Knot' },
        fps:   { factor: 0.3048,       base: 'mps', name: 'Feet/sec' },
        mach:  { factor: 343,          base: 'mps', name: 'Mach' },
    },
    data: {
        bit:   { factor: 1,            base: 'bit', name: 'Bit' },
        byte:  { factor: 8,            base: 'bit', name: 'Byte' },
        kb:    { factor: 8000,         base: 'bit', name: 'Kilobyte' },
        mb:    { factor: 8e6,          base: 'bit', name: 'Megabyte' },
        gb:    { factor: 8e9,          base: 'bit', name: 'Gigabyte' },
        tb:    { factor: 8e12,         base: 'bit', name: 'Terabyte' },
        pb:    { factor: 8e15,         base: 'bit', name: 'Petabyte' },
        kib:   { factor: 8192,         base: 'bit', name: 'Kibibyte' },
        mib:   { factor: 8388608,      base: 'bit', name: 'Mebibyte' },
        gib:   { factor: 8589934592,   base: 'bit', name: 'Gibibyte' },
    },
    area: {
        mm2:   { factor: 1e-6,         base: 'm2', name: 'mm²' },
        cm2:   { factor: 1e-4,         base: 'm2', name: 'cm²' },
        m2:    { factor: 1,            base: 'm2', name: 'm²' },
        km2:   { factor: 1e6,          base: 'm2', name: 'km²' },
        in2:   { factor: 0.00064516,   base: 'm2', name: 'in²' },
        ft2:   { factor: 0.092903,     base: 'm2', name: 'ft²' },
        ac:    { factor: 4046.86,      base: 'm2', name: 'Acre' },
        ha:    { factor: 10000,        base: 'm2', name: 'Hectare' },
    },
    volume: {
        ml:    { factor: 0.001,        base: 'l', name: 'Milliliter' },
        l:     { factor: 1,            base: 'l', name: 'Liter' },
        m3:    { factor: 1000,         base: 'l', name: 'm³' },
        tsp:   { factor: 0.00492892,   base: 'l', name: 'Teaspoon' },
        tbsp:  { factor: 0.0147868,    base: 'l', name: 'Tablespoon' },
        floz:  { factor: 0.0295735,    base: 'l', name: 'Fl Ounce' },
        cup:   { factor: 0.236588,     base: 'l', name: 'Cup' },
        pt:    { factor: 0.473176,     base: 'l', name: 'Pint' },
        qt:    { factor: 0.946353,     base: 'l', name: 'Quart' },
        gal:   { factor: 3.78541,      base: 'l', name: 'Gallon (US)' },
    },
    time: {
        ms:    { factor: 0.001,        base: 's', name: 'Millisecond' },
        s:     { factor: 1,            base: 's', name: 'Second' },
        min:   { factor: 60,           base: 's', name: 'Minute' },
        hr:    { factor: 3600,         base: 's', name: 'Hour' },
        day:   { factor: 86400,        base: 's', name: 'Day' },
        wk:    { factor: 604800,       base: 's', name: 'Week' },
        mo:    { factor: 2629800,      base: 's', name: 'Month (avg)' },
        yr:    { factor: 31557600,     base: 's', name: 'Year' },
    },
    pressure: {
        pa:    { factor: 1,            base: 'pa', name: 'Pascal' },
        kpa:   { factor: 1000,         base: 'pa', name: 'Kilopascal' },
        mpa:   { factor: 1e6,          base: 'pa', name: 'Megapascal' },
        bar:   { factor: 100000,       base: 'pa', name: 'Bar' },
        atm:   { factor: 101325,       base: 'pa', name: 'Atmosphere' },
        psi:   { factor: 6894.76,      base: 'pa', name: 'PSI' },
        mmhg:  { factor: 133.322,      base: 'pa', name: 'mmHg / Torr' },
    },
    energy: {
        j:     { factor: 1,            base: 'j', name: 'Joule' },
        kj:    { factor: 1000,         base: 'j', name: 'Kilojoule' },
        cal:   { factor: 4.184,        base: 'j', name: 'Calorie' },
        kcal:  { factor: 4184,         base: 'j', name: 'Kilocalorie' },
        wh:    { factor: 3600,         base: 'j', name: 'Watt-hour' },
        kwh:   { factor: 3.6e6,        base: 'j', name: 'Kilowatt-hour' },
        btu:   { factor: 1055.06,      base: 'j', name: 'BTU' },
        ev:    { factor: 1.602e-19,    base: 'j', name: 'Electron Volt' },
    },
};

const UNIT_TO_CATEGORY = {};
for (const [cat, units] of Object.entries(UNITS)) {
    for (const sym of Object.keys(units)) {
        UNIT_TO_CATEGORY[sym] = cat;
    }
}

function convertTemperature(value, from, to) {
    let celsius;
    if (from === 'c') celsius = value;
    else if (from === 'f') celsius = (value - 32) * 5 / 9;
    else celsius = value - 273.15;

    if (to === 'c') return celsius;
    if (to === 'f') return celsius * 9 / 5 + 32;
    return celsius + 273.15;
}

function convert(value, from, to) {
    from = from.toLowerCase();
    to = to.toLowerCase();

    const cat = UNIT_TO_CATEGORY[from];
    if (!cat || UNIT_TO_CATEGORY[to] !== cat) return null;

    if (cat === 'temperature') {
        return { result: convertTemperature(value, from, to), category: cat };
    }

    const fromUnit = UNITS[cat][from];
    const toUnit = UNITS[cat][to];
    const base = value * fromUnit.factor;
    const result = base / toUnit.factor;
    return { result, category: cat };
}

function formatNumber(n) {
    if (Math.abs(n) < 0.0001 || Math.abs(n) >= 1e12) return n.toExponential(4);
    const str = n.toPrecision(8).replace(/\.?0+$/, '');
    return str;
}

module.exports = {
    command: 'units',
    aliases: ['convert', 'conv', 'unit'],
    category: 'utility',
    description: 'Convert between 100+ units — length, weight, speed, data, temperature and more',
    usage: '.units <value> <from> to <to>\nExample: .units 100 km to miles',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const input = args.join(' ').trim().toLowerCase();

        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `📏 *Unit Converter*\n\n` +
                      `*Usage:* \`.units <value> <from> to <to>\`\n\n` +
                      `*Examples:*\n` +
                      `• \`.units 100 km to mi\`\n` +
                      `• \`.units 70 kg to lb\`\n` +
                      `• \`.units 37 c to f\`\n` +
                      `• \`.units 1 gb to mb\`\n` +
                      `• \`.units 60 mph to kph\`\n` +
                      `• \`.units 1 yr to day\`\n` +
                      `• \`.units 1 atm to psi\`\n` +
                      `• \`.units 500 kcal to kj\`\n\n` +
                      `*Categories:*\n` +
                      `📐 length · ⚖️ weight · 🌡️ temperature\n` +
                      `💨 speed · 💾 data · 📦 volume\n` +
                      `🗺️ area · ⏱️ time · 🔋 energy · 🌬️ pressure`,
                ...channelInfo
            }, { quoted: message });
        }

        const toIndex = args.findIndex(a => a.toLowerCase() === 'to');
        let value, fromUnit, toUnit;

        if (toIndex === 2 && args.length === 4) {
            value = parseFloat(args[0]);
            fromUnit = args[1].toLowerCase();
            toUnit = args[3].toLowerCase();
        } else if (args.length === 3 && toIndex === -1) {
            value = parseFloat(args[0]);
            fromUnit = args[1].toLowerCase();
            toUnit = args[2].toLowerCase();
        } else {
            return await sock.sendMessage(chatId, {
                text: `❌ Wrong format.\n\nUse: \`.units 100 km to mi\``,
                ...channelInfo
            }, { quoted: message });
        }

        if (isNaN(value)) {
            return await sock.sendMessage(chatId, {
                text: `❌ Invalid number: \`${args[0]}\``,
                ...channelInfo
            }, { quoted: message });
        }

        const res = convert(value, fromUnit, toUnit);

        if (!res) {
            const fromCat = UNIT_TO_CATEGORY[fromUnit];
            const toCat = UNIT_TO_CATEGORY[toUnit];
            if (!fromCat) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Unknown unit: \`${fromUnit}\`\n\nUse \`.units\` to see all supported units.`,
                    ...channelInfo
                }, { quoted: message });
            }
            if (!toCat) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Unknown unit: \`${toUnit}\``,
                    ...channelInfo
                }, { quoted: message });
            }
            return await sock.sendMessage(chatId, {
                text: `❌ Cannot convert *${fromUnit}* (${fromCat}) to *${toUnit}* (${toCat}) — different categories.`,
                ...channelInfo
            }, { quoted: message });
        }

        const fromName = UNITS[res.category][fromUnit].name;
        const toName = UNITS[res.category][toUnit].name;
        const catEmojis = {
            length: '📐', weight: '⚖️', temperature: '🌡️', speed: '💨',
            data: '💾', area: '🗺️', volume: '📦', time: '⏱️',
            pressure: '🌬️', energy: '🔋'
        };
        const emoji = catEmojis[res.category] || '📏';

        await sock.sendMessage(chatId, {
            text: `${emoji} *Unit Converter*\n\n` +
                  `📥 *Input:* ${value} ${fromName} (${fromUnit})\n` +
                  `📤 *Result:* ${formatNumber(res.result)} ${toName} (${toUnit})\n\n` +
                  `📂 *Category:* ${res.category.charAt(0).toUpperCase() + res.category.slice(1)}`,
            ...channelInfo
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading units.js:', e.message); }

/* ===== math.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const mathGames = {};

const modes = {
  noob: [-3, 3, -3, 3, '+-', 15000],
  easy: [-10, 10, -10, 10, '*/+-', 20000],
  normal: [-40, 40, -20, 20, '*/+-', 40000],
  hard: [-100, 100, -70, 70, '*/+-', 60000],
  extreme: [-999999, 999999, -999999, 999999, '*/', 99999],
  impossible: [-99999999999, 99999999999, -99999999999, 999999999999, '*/', 30000],
  impossible2: [-999999999999999, 999999999999999, -999, 999, '/', 30000],
};

const operators = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
};

module.exports = {
  command: 'math',
  aliases: ['maths', 'ganit'],
  category: 'games',
  description: 'Solve math problems',
  usage: '.math',
  
  async handler(sock, message, args) {
    const chatId = message.key.remoteJid;

    if (mathGames[chatId]) {
      return sock.sendMessage(chatId, { text: '⚠️ Solve the current problem first!' }, { quoted: mathGames[chatId].msg });
    }

    let mode = args[0]?.toLowerCase();
    if (!mode || !(mode in modes)) {
      return sock.sendMessage(chatId, { 
        text: `🧮 *Available Difficulties:*\n\n${Object.keys(modes).join(' | ')}\n\n_Example: .math normal_` 
      }, { quoted: message });
    }

    let math = genMath(mode);
    let text = `▢ HOW MUCH IS IT *${math.str}*=\n\n_Time:_ ${(math.time / 1000).toFixed(2)} seconds`;
    
    let sentMsg = await sock.sendMessage(chatId, { text }, { quoted: message });

    mathGames[chatId] = {
      msg: sentMsg,
      math,
      attempts: 4,
      timeout: setTimeout(() => {
        if (mathGames[chatId]) {
          sock.sendMessage(chatId, { text: `⏳ *Time is up!*\nThe answer was: *${math.result}*` }, { quoted: mathGames[chatId].msg });
          delete mathGames[chatId];
        }
      }, math.time)
    };

    if (!this.initialized) {
      this.initialized = true;
      sock.ev.on('messages.upsert', async (upsert) => {
        const m = upsert.messages[0];
        if (!m.message || m.key.fromMe) return;

        const chat = m.key.remoteJid;
        if (!mathGames[chat]) return;

        const body = (m.message.conversation || m.message.extendedTextMessage?.text || "").trim();
        if (!/^-?[0-9]+(\.[0-9]+)?$/.test(body)) return;

        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || "";
        if (!/^▢ HOW MUCH IS IT/i.test(quotedText)) return;

        const game = mathGames[chat];
        if (body == game.math.result) {
          clearTimeout(game.timeout);
          delete mathGames[chat];
          await sock.sendMessage(chat, { text: `✅ *Correct answer!*\n\nYou won the game.` }, { quoted: m });
        } else {
          game.attempts--;
          if (game.attempts <= 0) {
            clearTimeout(game.timeout);
            delete mathGames[chat];
            await sock.sendMessage(chat, { text: `❌ *Game Over!*\n\nThe correct answer was: *${game.math.result}*` }, { quoted: m });
          } else {
            await sock.sendMessage(chat, { text: `❎ *Wrong answer!*\n\nYou have ${game.attempts} attempts left.` }, { quoted: m });
          }
        }
      });
    }
  }
};

function genMath(mode) {
  let [a1, a2, b1, b2, ops, time] = modes[mode];
  let a = randomInt(a1, a2);
  let b = randomInt(b1, b2);
  let op = pickRandom([...ops]);
  let result = new Function(`return ${a} ${op.replace('/', '*')} ${b < 0 ? `(${b})` : b}`)();
  if (op == '/') [a, result] = [result, a];
  return { str: `${a} ${operators[op]} ${b}`, mode, time, result };
}

function randomInt(from, to) {
  if (from > to) [from, to] = [to, from];
  return Math.floor(Math.random() * (Math.floor(to) - Math.ceil(from) + 1) + Math.ceil(from));
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
  }


    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading math.js:', e.message); }

/* ===== cipher.js ===== */
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

const { getBin } = require('../lib/compile.js');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

module.exports = {
    command: 'cipher',
    aliases: ['encrypt', 'decrypt', 'encode', 'crypt'],
    category: 'utility',
    description: 'Encrypt or decrypt text using Caesar, Vigenere, or XOR cipher',
    usage: '.cipher <type> <encode|decode> <key> <text>',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;

        if (args.length < 4) {
            return await sock.sendMessage(chatId, {
                text: `🔐 *Text Cipher*\n\n` +
                      `*Usage:* \`.cipher <type> <encode|decode> <key> <text>\`\n\n` +
                      `*Cipher types:*\n\n` +
                      `*caesar* — shift letters by a number (key = number)\n` +
                      `• \`.cipher caesar encode 13 Hello World\`\n` +
                      `• \`.cipher caesar decode 13 Uryyb Jbeyq\`\n\n` +
                      `*vigenere* — polyalphabetic cipher (key = word)\n` +
                      `• \`.cipher vigenere encode SECRET Hello World\`\n` +
                      `• \`.cipher vigenere decode SECRET Zincs Pgvnu\`\n\n` +
                      `*xor* — XOR byte cipher, output is hex (key = any text)\n` +
                      `• \`.cipher xor encode mykey Hello\`\n` +
                      `• \`.cipher xor decode mykey 25090a0e06\``,
                ...channelInfo
            }, { quoted: message });
        }

        const cipherType = args[0].toLowerCase();
        const mode       = args[1].toLowerCase();
        const key        = args[2];
        const text       = args.slice(3).join(' ').trim();

        if (!['caesar', 'vigenere', 'xor'].includes(cipherType)) {
            return await sock.sendMessage(chatId, {
                text: `❌ Unknown cipher: *${cipherType}*\nUse: \`caesar\`, \`vigenere\`, or \`xor\``,
                ...channelInfo
            }, { quoted: message });
        }

        if (!['encode', 'decode', 'encrypt', 'decrypt'].includes(mode)) {
            return await sock.sendMessage(chatId, {
                text: `❌ Unknown mode: *${mode}*\nUse: \`encode\` or \`decode\``,
                ...channelInfo
            }, { quoted: message });
        }

        if (!text) {
            return await sock.sendMessage(chatId, {
                text: `❌ No text provided.`,
                ...channelInfo
            }, { quoted: message });
        }

        if (cipherType === 'caesar' && isNaN(parseInt(key, 10))) {
            return await sock.sendMessage(chatId, {
                text: `❌ Caesar cipher key must be a number (e.g. 13)`,
                ...channelInfo
            }, { quoted: message });
        }

        try {
            const bin = getBin('cipher');
            const safeText = text.replace(/"/g, '\\"');
            const safeKey  = key.replace(/"/g, '\\"');
            const { stdout, stderr } = await execAsync(
                `"${bin}" ${cipherType} ${mode} "${safeKey}" "${safeText}"`,
                { timeout: 10000 }
            );

            if (stderr && !stdout) {
                return await sock.sendMessage(chatId, {
                    text: `❌ ${stderr.trim()}`,
                    ...channelInfo
                }, { quoted: message });
            }

            const result = stdout.trim();
            const cipherNames = {
                caesar: 'Caesar', vigenere: 'Vigenère', xor: 'XOR'
            };
            const modeLabel = (mode === 'encode' || mode === 'encrypt') ? '🔒 Encrypted' : '🔓 Decrypted';

            await sock.sendMessage(chatId, {
                text: `🔐 *${cipherNames[cipherType]} Cipher*\n\n` +
                      `📥 *Input:* \`${text}\`\n` +
                      `🔑 *Key:* \`${key}\`\n` +
                      `${modeLabel}: \`${result}\``,
                ...channelInfo
            }, { quoted: message });

        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Failed: ${error.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading cipher.js:', e.message); }

/* ===== base64.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'base64',
  aliases: ['b64', 'encode'],
  category: 'tools',
  description: 'Encode text to Base64',
  usage: '.base64 <text> OR reply to a message',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      let txt = args?.join(' ') || "";

      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted) {
        txt = quoted.conversation || 
              quoted.extendedTextMessage?.text || 
              quoted.imageMessage?.caption || 
              quoted.videoMessage?.caption || 
              txt;
      }

      txt = txt.replace(/^\.\w+\s*/, '').trim();

      if (!txt) {
        return await sock.sendMessage(chatId, { text: '*Please provide text to encode or reply to a message.*\nExample: .base64 Hello World' }, { quoted: message });
      }

      const encoded = Buffer.from(txt, 'utf-8').toString('base64');
      
      const response = `*🔗 Base64 Encoded:*\n\n${encoded}`;
      await sock.sendMessage(chatId, { text: response }, { quoted: message });

    } catch (err) {
      console.error('Base64 plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to encode text.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading base64.js:', e.message); }

/* ===== url.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/url.js — Upload media to Catbox & return URL
// Fix: Uses OWNER_NAME from config instead of hardcoded name
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const axios     = require('axios');
const FormData  = require('form-data');
const fs        = require('fs');
const os        = require('os');
const path      = require('path');
const fakevCard = require('../lib/fakevcard');
const config    = require('../config');

const OWNER_NAME = process.env.OWNER_NAME || config.OWNER_NAME || 'JUNAID-MD↣³⁰²';
const BOT_NAME   = process.env.BOT_NAME   || config.BOT_NAME   || 'JUNAID-MD↣³⁰²';

module.exports = {
  command: 'url',
  aliases: ['url3', 'catbox', 'fileurl'],
  desc: '🔗 Upload media to Catbox & get direct URL',
  react: '🖇️',
  category: 'utility',
  filename: __filename,
  use: '.url [reply to any media]',

  execute: async (conn, message, m, { from }) => {
    const sendMsg = async (text, quoted = message) =>
      conn.sendMessage(from, {
        text,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: global.NEWSLETTER_JID || '120363408055942569@newsletter',
            newsletterName: 'JUNAID-MD↣³⁰²',
            serverMessageId: 200,
          },
        },
      }, { quoted: fakevCard });

    try {
      // Resolve quoted or current message
      const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const target    = quotedMsg || message.message;

      if (!target) {
        return sendMsg(
`╔══════════════════════════════╗
║  🖇️  *URL UPLOADER — ERROR*   ║
╚══════════════════════════════╝

❌ *No media found!*
📌 Reply to a media file with \`.url\`

📎 *Supported:* Image, Video, Audio, Document

> 🖇️ *${BOT_NAME} URL Uploader*`
        );
      }

      // Detect media type
      let mediaNode = null, mediaType = null;
      if (target.imageMessage)    { mediaNode = target.imageMessage;    mediaType = 'image';    }
      else if (target.videoMessage)    { mediaNode = target.videoMessage;    mediaType = 'video';    }
      else if (target.audioMessage)    { mediaNode = target.audioMessage;    mediaType = 'audio';    }
      else if (target.documentMessage) { mediaNode = target.documentMessage; mediaType = 'document'; }
      else {
        return sendMsg(
`╔══════════════════════════════╗
║  🖇️  *URL UPLOADER — ERROR*   ║
╚══════════════════════════════╝

❌ *Unsupported media type!*
📎 *Supported:* Image, Video, Audio, Document

> 🖇️ *Reply to a valid media file*`
        );
      }

      // React
      try {
        await conn.sendMessage(from, { react: { text: '⬆️', key: message.key } });
      } catch {}

      // Download
      const stream = await downloadContentFromMessage(mediaNode, mediaType);
      let buffer   = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      if (!buffer || !buffer.length) {
        return sendMsg('❌ *Failed to download media. File may be expired.*');
      }

      // Extension
      let ext = '';
      if (mediaType === 'image')    ext = '.jpg';
      else if (mediaType === 'video')    ext = '.mp4';
      else if (mediaType === 'audio')    ext = '.mp3';
      else if (mediaType === 'document') {
        ext = path.extname(mediaNode.fileName || '') || '.bin';
      }

      const tmp  = path.join(os.tmpdir(), `redx_url_${Date.now()}${ext}`);
      fs.writeFileSync(tmp, buffer);

      // Upload to Catbox
      const form = new FormData();
      form.append('fileToUpload', fs.createReadStream(tmp));
      form.append('reqtype', 'fileupload');

      const res = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 60000,
      });

      try { fs.unlinkSync(tmp); } catch {}

      if (!res.data || !res.data.startsWith('https://')) {
        throw new Error('Catbox returned invalid response');
      }

      const mediaIcons = { image: '🖼️', video: '🎬', audio: '🎵', document: '📄' };

      await sendMsg(
`╔══════════════════════════════════╗
║  🖇️  *UPLOAD SUCCESSFUL!*          ║
╚══════════════════════════════════╝

${mediaIcons[mediaType] || '📎'} *Type:*  ${mediaType.toUpperCase()}
📦 *Size:*  ${formatBytes(buffer.length)}
🔗 *URL:*

${res.data}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 🖇️ *Uploaded by ${OWNER_NAME} via ${BOT_NAME}*`
      );

    } catch (err) {
      console.error('[URL] Error:', err.message);
      await sendMsg(
`╔══════════════════════════════╗
║  ❌  *UPLOAD FAILED*          ║
╚══════════════════════════════╝

⚠️ *Error:* ${err.message || 'Unknown error'}
💡 *Try again or check file size*

> ❌ *${BOT_NAME} URL Uploader*`
      );
    }
  },
};

function formatBytes(b) {
  if (!b) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${s[i]}`;
}

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading url.js:', e.message); }

/* ===== urldecode.js ===== */
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

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);
const WA_LIMIT = 60000;

function getQuoted(message) {
    return message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

async function sendResult(sock, chatId, channelInfo, message, text, filename) {
    if (text.length > WA_LIMIT) {
        const tmpFile = path.join(process.cwd(), 'temp', filename);
        fs.mkdirSync(path.dirname(tmpFile), { recursive: true });
        fs.writeFileSync(tmpFile, text);
        await sock.sendMessage(chatId, {
            document: fs.readFileSync(tmpFile),
            mimetype: 'text/plain',
            fileName: filename,
            caption: '🌐 Result too large for WhatsApp, sent as file.',
            ...channelInfo
        }, { quoted: message });
        try { fs.unlinkSync(tmpFile); } catch {}
    } else {
        await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }
}

module.exports = {
    command: 'urldecode',
    aliases: ['urlencode', 'urlextract', 'links', 'extractlinks'],
    category: 'utility',
    description: 'Encode/decode URLs or extract all links from text/files',
    usage: '.urldecode <url>\n.urlencode <text>\n.extractlinks <text or reply to file>',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo, userMessage } = context;
        const scriptPath = path.join(process.cwd(), 'lib', 'urltool.py');

        if (!fs.existsSync(scriptPath)) {
            return await sock.sendMessage(chatId, {
                text: `❌ urltool.py not found in lib/.`,
                ...channelInfo
            }, { quoted: message });
        }

        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const hasDoc = !!quoted?.documentMessage;

        let mode = 'decode';
        if (userMessage.startsWith('urlencode') || userMessage.startsWith('/urlencode') ||
            userMessage.startsWith('.urlencode') || userMessage.startsWith('!urlencode')) {
            mode = 'encode';
        } else if (userMessage.startsWith('extractlinks') || userMessage.startsWith('/extractlinks') ||
                   userMessage.startsWith('.extractlinks') || userMessage.startsWith('!extractlinks') ||
                   userMessage.startsWith('links')) {
            mode = 'extract';
        } else if (args[0]?.toLowerCase() === 'encode') {
            mode = 'encode';
            args = args.slice(1);
        } else if (args[0]?.toLowerCase() === 'extract' || args[0]?.toLowerCase() === 'links') {
            mode = 'extract';
            args = args.slice(1);
        } else if (args[0]?.toLowerCase() === 'decode') {
            mode = 'decode';
            args = args.slice(1);
        }

        const textInput = args.join(' ').trim() || quotedText;

        if (!textInput && !hasDoc) {
            return await sock.sendMessage(chatId, {
                text: `🌐 *URL Tools*\n\n` +
                      `*Decode a URL:*\n` +
                      `\`.urldecode https://example.com/path%20with%20spaces\`\n\n` +
                      `*Encode text to URL:*\n` +
                      `\`.urlencode hello world & more\`\n\n` +
                      `*Extract all links from text:*\n` +
                      `\`.extractlinks <paste text>\`\n` +
                      `Or reply to any text message or file with \`.extractlinks\`\n\n` +
                      `*Shortcut modes:*\n` +
                      `\`.urldecode encode <text>\`\n` +
                      `\`.urldecode extract <text>\``,
                ...channelInfo
            }, { quoted: message });
        }

        const tempDir = path.join(process.cwd(), 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        const id = Date.now();

        try {
            let stdout;

            if (hasDoc && quoted && mode === 'extract') {
                await sock.sendMessage(chatId, { text: '⏳ Reading file...', ...channelInfo }, { quoted: message });
                const msgObj = { message: { documentMessage: quoted.documentMessage } };
                const buf = await downloadMediaMessage(msgObj, 'buffer', {});
                const tmpFile = path.join(tempDir, `url_in_${id}.txt`);
                fs.writeFileSync(tmpFile, buf);
                const result = await execAsync(`python3 "${scriptPath}" extract --file "${tmpFile}"`, { timeout: 30000 });
                stdout = result.stdout;
                try { fs.unlinkSync(tmpFile); } catch {}
            } else {
                const safeText = textInput.replace(/'/g, "'\"'\"'");
                const result = await execAsync(
                    `python3 "${scriptPath}" ${mode} '${safeText}'`,
                    { timeout: 30000 }
                );
                stdout = result.stdout;
            }

            const data = JSON.parse(stdout.trim());
            if (data.error) {
                return await sock.sendMessage(chatId, { text: `❌ ${data.error}`, ...channelInfo }, { quoted: message });
            }

            let resultText = '';
            if (mode === 'decode') {
                resultText = `🌐 *URL Decoder*\n\n` +
                             `📥 *Original:*\n\`${data.original}\`\n\n` +
                             `📤 *Decoded:*\n\`${data.decoded}\``;
                if (data.scheme) resultText += `\n\n🔍 *Breakdown:*\n• Scheme: ${data.scheme}\n• Host: ${data.host}\n• Path: ${data.path}`;
                if (data.query_params) {
                    const params = Object.entries(data.query_params).map(([k, v]) => `  • ${k}: ${v}`).join('\n');
                    resultText += `\n• Params:\n${params}`;
                }
                if (data.fragment) resultText += `\n• Fragment: ${data.fragment}`;
            } else if (mode === 'encode') {
                resultText = `🌐 *URL Encoder*\n\n` +
                             `📥 *Original:*\n\`${data.original}\`\n\n` +
                             `🔒 *Fully Encoded:*\n\`${data.fully_encoded}\`\n\n` +
                             `🔓 *Safe Encoded:*\n\`${data.safe_encoded}\``;
            } else {
                if (data.total === 0) {
                    resultText = `🌐 *Link Extractor*\n\n❌ No links found in the text.`;
                } else {
                    const lines = [`🌐 *Link Extractor — ${data.total} links found*\n`];
                    if (data.social?.length) {
                        lines.push(`📱 *Social Media (${data.social.length}):*`);
                        data.social.forEach(u => lines.push(`• ${u}`));
                        lines.push('');
                    }
                    if (data.media?.length) {
                        lines.push(`🖼️ *Media Files (${data.media.length}):*`);
                        data.media.forEach(u => lines.push(`• ${u}`));
                        lines.push('');
                    }
                    if (data.documents?.length) {
                        lines.push(`📄 *Documents (${data.documents.length}):*`);
                        data.documents.forEach(u => lines.push(`• ${u}`));
                        lines.push('');
                    }
                    if (data.other?.length) {
                        lines.push(`🔗 *Other Links (${data.other.length}):*`);
                        data.other.forEach(u => lines.push(`• ${u}`));
                    }
                    resultText = lines.join('\n');
                }
            }

            await sendResult(sock, chatId, channelInfo, message, resultText, `urls_${id}.txt`);

        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Failed: ${error.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading urldecode.js:', e.message); }

/* ===== shorturl.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
module.exports = [{
  pattern: "short",
  alias: ["shorturl", "tiny"],
  desc: "Shorten a URL",
  category: "utility",
  react: "🔗",
  filename: __filename,
  use: ".short <url>",
  execute: async (conn, mek, m, { from, args, q, reply }) => {
    try {
      if (!args.length) return reply("❌ Please provide URL.\nExample: .short https://example.com");
      
      const url = args[0];
      const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      
      await reply(`✅ *Short URL:*\n${res.data}`);
      
    } catch (e) {
      await reply(`❌ Failed to shorten URL.`);
    }
  }
}];

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading shorturl.js:', e.message); }

/* ===== unshort.js ===== */
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
 *    Description: This file is part of the REDXBOT302 Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/


const axios = require('axios');

module.exports = {
  command: 'unshorten',
  aliases: ['expand', 'trace'],
  category: 'tools',
  description: 'See where a short link actually goes',
  usage: '.unshorten <short_url>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args[0];

    if (!url) {
      return await sock.sendMessage(chatId, { 
        text: '*Please provide a URL*\n\n*Usage:* .unshorten <url>' 
      }, { quoted: message });
    }

    let targetUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      targetUrl = 'https://' + url;
    }

    try {

      const res = await axios.get(targetUrl, { 
        maxRedirects: 10,
        timeout: 15000,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });

      const finalUrl = res.request.res.responseUrl || res.config.url || targetUrl;
      const redirectCount = res.request._redirectable._redirectCount || 0;

      let report = `*🔗 LINK TRACE RESULTS*\n\n`;
      report += `*Original:*\n${url}\n\n`;
      report += `*Destination:*\n${finalUrl}\n\n`;
      report += `*Redirects:* ${redirectCount}\n`;
      report += `*Status:* ${res.status} ${res.statusText || 'OK'}`;

      await sock.sendMessage(chatId, { text: report }, { quoted: message });

    } catch (err) {
      let errorMsg = '❌ *Failed to trace URL*\n\n';
      
      if (err.code === 'ENOTFOUND') {
        errorMsg += '*Reason:* Domain not found';
      } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
        errorMsg += '*Reason:* Connection timeout';
      } else if (err.response) {
        errorMsg += `*Status:* ${err.response.status} ${err.response.statusText}`;
      } else {
        errorMsg += `*Error:* ${err.message}`;
      }

      await sock.sendMessage(chatId, { text: errorMsg }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading unshort.js:', e.message); }

/* ===== tourl.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}};
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    const axios = require('axios');
    const FormData = require('form-data');
    const config = require('../config');

    const OWNER_NAME = process.env.OWNER_NAME || config.OWNER_NAME || 'JUNAID-MD↣³⁰²';
    const BOT_NAME   = process.env.BOT_NAME || config.BOT_NAME || 'JUNAID-MD↣³⁰²';

    function getQuotedMessage(message) {
      const ctx = message?.message?.extendedTextMessage?.contextInfo;
      if (!ctx?.quotedMessage) return null;
      return {
        key: {
          remoteJid: message.key.remoteJid,
          fromMe: false,
          id: ctx.stanzaId,
          participant: ctx.participant,
        },
        message: ctx.quotedMessage,
      };
    }

    function hasMedia(m) {
      return !!(m?.message?.imageMessage || m?.message?.videoMessage ||
        m?.message?.audioMessage || m?.message?.stickerMessage ||
        m?.message?.documentMessage || m?.message?.documentWithCaptionMessage);
    }

    function formatBytes(b) {
      if (!b) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB'];
      const i = Math.min(Math.floor(Math.log(b) / Math.log(1024)), units.length - 1);
      return `${parseFloat((b / Math.pow(1024, i)).toFixed(2))} ${units[i]}`;
    }

    function detectFileType(buffer) {
      if (!buffer || buffer.length < 4) return null;
      const b = buffer;
      if (b[0]===0xFF && b[1]===0xD8 && b[2]===0xFF) return {mime:'image/jpeg',ext:'jpg'};
      if (b[0]===0x89 && b[1]===0x50 && b[2]===0x4E && b[3]===0x47) return {mime:'image/png',ext:'png'};
      if (b[0]===0x47 && b[1]===0x49 && b[2]===0x46) return {mime:'image/gif',ext:'gif'};
      if (b.slice(0,4).toString('ascii')==='RIFF' && b.slice(8,12).toString('ascii')==='WEBP') return {mime:'image/webp',ext:'webp'};
      if (b.slice(0,4).toString('ascii')==='RIFF' && b.slice(8,12).toString('ascii')==='AVI ') return {mime:'video/x-msvideo',ext:'avi'};
      if (b.slice(0,4).toString('ascii')==='RIFF' && b.slice(8,12).toString('ascii')==='WAVE') return {mime:'audio/wav',ext:'wav'};
      if (b.length>11 && b.slice(4,8).toString('ascii')==='ftyp') {
        const sub=b.slice(8,12).toString('ascii');
        return {mime:(sub.startsWith('M4A')||sub.startsWith('M4B'))?'audio/mp4':'video/mp4',ext:(sub.startsWith('M4A')||sub.startsWith('M4B'))?'m4a':'mp4'};
      }
      if (b.slice(0,4).toString('ascii')==='\x1A\x45\xDF\xA3') return {mime:'video/webm',ext:'webm'};
      if (b.slice(0,3).toString('ascii')==='ID3' || (b[0]===0xFF && (b[1]&0xE0)===0xE0)) return {mime:'audio/mpeg',ext:'mp3'};
      if (b.slice(0,4).toString('ascii')==='OggS') return {mime:'audio/ogg',ext:'ogg'};
      if (b.slice(0,4).toString('ascii')==='%PDF') return {mime:'application/pdf',ext:'pdf'};
      if (b[0]===0x50 && b[1]===0x4B && b[2]===0x03 && b[3]===0x04) return {mime:'application/zip',ext:'zip'};
      return null;
    }

    async function postMultipart(endpoint, form, extraHeaders = {}) {
      const res = await axios.post(endpoint, form, {
        headers: { ...form.getHeaders(), ...extraHeaders },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 90000,
        validateStatus: s => s >= 200 && s < 300,
      });
      return res;
    }

    async function uploadToCatbox(buffer, type) {
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', buffer, {
        filename: `junaid_${Date.now()}.${type.ext}`,
        contentType: type.mime,
        knownLength: buffer.length,
      });
      const res = await postMultipart('https://catbox.moe/user/api.php', form, {
        'User-Agent': 'JUNAID-MD/7.0',
      });
      const url = typeof res.data === 'string' ? res.data.trim() : '';
      if (!/^https?:\/\/files\.catbox\.moe\//i.test(url)) throw new Error(`Catbox invalid response: ${String(res.data).slice(0,120)}`);
      return url;
    }

    async function uploadToUguu(buffer, type) {
      const form = new FormData();
      form.append('files[]', buffer, {
        filename: `junaid_${Date.now()}.${type.ext}`,
        contentType: type.mime,
        knownLength: buffer.length,
      });
      const res = await postMultipart('https://uguu.se/upload.php', form, {
        'User-Agent': 'JUNAID-MD/7.0',
      });
      const url = res.data?.files?.[0]?.url;
      if (!url || !/^https?:\/\//i.test(url)) throw new Error(`Uguu invalid response: ${JSON.stringify(res.data).slice(0,160)}`);
      return url;
    }

    async function uploadTo0x0(buffer, type) {
      const form = new FormData();
      form.append('file', buffer, {
        filename: `junaid_${Date.now()}.${type.ext}`,
        contentType: type.mime,
        knownLength: buffer.length,
      });
      const res = await postMultipart('https://0x0.st', form, {
        'User-Agent': 'curl/8 JUNAID-MD/7.0',
      });
      const url = typeof res.data === 'string' ? res.data.trim() : '';
      if (!/^https?:\/\//i.test(url)) throw new Error(`0x0 invalid response: ${String(res.data).slice(0,120)}`);
      return url;
    }

    async function uploadToLitterbox(buffer, type) {
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('time', '72h');
      form.append('fileToUpload', buffer, {
        filename: `junaid_${Date.now()}.${type.ext}`,
        contentType: type.mime,
        knownLength: buffer.length,
      });
      const res = await postMultipart('https://litterbox.catbox.moe/resources/internals/api.php', form, {
        'User-Agent': 'JUNAID-MD/7.0',
      });
      const url = typeof res.data === 'string' ? res.data.trim() : '';
      if (!/^https?:\/\//i.test(url)) throw new Error(`Litterbox invalid response: ${String(res.data).slice(0,120)}`);
      return url;
    }

    async function detectType(buffer, targetMsg) {
      try {
        const { fromBuffer } = require('file-type');
        const ft = await fromBuffer(buffer);
        if (ft?.mime && ft?.ext) return { mime: ft.mime, ext: ft.ext };
      } catch (_) {}
      const msg = targetMsg?.message || {};
      for (const key of ['imageMessage','videoMessage','audioMessage','stickerMessage','documentMessage']) {
        const mm = msg[key]?.mimetype;
        if (mm) {
          const ext = mm.split('/')[1]?.split(';')[0] || 'bin';
          return { mime: mm, ext: ext === 'jpeg' ? 'jpg' : ext };
        }
      }
      return null;
    }

    module.exports = {
      command: 'tourl',
      aliases: ['imgtourl', 'imgurl', 'geturl', 'upload', 'mediaurl'],
      category: 'utility',
      description: '🔗 Convert replied media to a direct URL',
      usage: '.tourl (reply to media)',

      async handler(sock, message, args, context = {}) {
        const chatId = message?.key?.remoteJid;
        const channelInfo = context?.channelInfo || {};
        const reply = (text) => sock.sendMessage(chatId, {text, ...channelInfo}, {quoted: message});

        try {
          let targetMsg = hasMedia(message) ? message : null;
          if (!targetMsg) {
            const quoted = getQuotedMessage(message);
            if (quoted && hasMedia(quoted)) targetMsg = quoted;
          }
          if (!targetMsg) return reply(`❌ *Media नहीं मिला!*\n\n📌 किसी image/video/audio/document/sticker को reply करके `.tourl` भेजें.`);

          await sock.sendMessage(chatId, {react:{text:'⬆️',key:message.key}}).catch(()=>{});
          const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, {
            logger: sock.logger,
            reuploadRequest: sock.updateMediaMessage,
          });
          if (!buffer?.length) throw new Error('Media download failed');
          if (buffer.length > 200 * 1024 * 1024) throw new Error(`File too large: ${formatBytes(buffer.length)} (max 200 MB)`);

          const type = await detectType(buffer, targetMsg);
          if (!type) throw new Error('Unsupported or unknown file type');

          const providers = [
            ['Catbox', uploadToCatbox],
            ['Uguu', uploadToUguu],
            ['0x0.st', uploadTo0x0],
            ['Litterbox', uploadToLitterbox],
          ];
          let url = null;
          let service = '';
          const uploadErrors = [];
          for (const [name, fn] of providers) {
            try {
              url = await fn(buffer, type);
              service = name;
              break;
            } catch (err) {
              uploadErrors.push(`${name}: ${err.message}`);
              console.warn(`[TOURL] ${name} failed:`, err.message);
            }
          }
          if (!url) throw new Error(`All upload hosts failed. ${uploadErrors.join(' | ')}`);

          await reply(`╔══════════════════════════════╗
║  ✅ *UPLOAD SUCCESSFUL*       ║
╚══════════════════════════════╝

📎 *Type:* ${type.mime}
📦 *Size:* ${formatBytes(buffer.length)}
🌐 *Host:* ${service}

🔗 *Direct URL:*
${url}

> 🔗 *${BOT_NAME} • ${OWNER_NAME}*`);
        } catch (e) {
          console.error('[TOURL]', e.stack || e.message);
          await reply(`❌ *TOURL FAILED*\n\n⚠️ ${e.message || 'Upload failed'}\n\n📌 Media को reply करके फिर से `.tourl` try करें.`).catch(()=>{});
        }
      },
    };

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m);
    else for (const k of Object.keys(_m)) { const v=_m[k]; if(Array.isArray(v)) _bundle.push(...v.filter(p=>p&&p.command&&typeof p.handler==='function')); }
  }
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading tourl.js:', e.message); }

/* ===== pingweb.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'pingweb',
  aliases: ['pweb'],
  category: 'general',
  description: 'Check bot response time and ping a website',
  usage: '.pingweb [website URL]',
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo, rawText } = context;
    
    const prefix = rawText.match(/^[.!#]/)?.[0] || '.';
    const commandPart = rawText.slice(prefix.length).trim();
    const parts = commandPart.split(/\s+/);
    const url = parts.slice(1).join(' ').trim();
    
    const startBot = Date.now();
    const sent = await sock.sendMessage(chatId, { 
      text: '🏓 Pinging...',
      ...channelInfo
    }, { quoted: message });
    const endBot = Date.now();
    const botLatency = endBot - startBot;
    
    let responseText = `🏓 *Pong!*\n\n📶 *Bot Latency:* ${botLatency}ms`;
    
    if (url) {
      try {
        let testUrl = url;
        if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
          testUrl = 'https://' + testUrl;
        }
        
        const urlObj = new URL(testUrl);
        
        const startWeb = Date.now();
        const response = await axios.get(testUrl, {
          timeout: 10000,
          validateStatus: () => true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        const endWeb = Date.now();
        const webLatency = endWeb - startWeb;
        
        responseText += `\n\n🌐 *Website:* ${urlObj.hostname}`;
        responseText += `\n⚡ *Response Time:* ${webLatency}ms`;
        responseText += `\n📡 *Status:* ${response.status} ${response.statusText}`;
        responseText += `\n✅ *Reachable:* Yes`;
        
      } catch (error) {
        if (error.code === 'ENOTFOUND') {
          responseText += `\n\n🌐 *Website:* ${url}`;
          responseText += `\n❌ *Error:* Domain not found`;
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
          responseText += `\n\n🌐 *Website:* ${url}`;
          responseText += `\n❌ *Error:* Connection timeout`;
        } else if (error.message.includes('Invalid URL')) {
          responseText += `\n\n❌ *Invalid URL format*`;
          responseText += `\n💡 Example: .ping google.com`;
        } else {
          responseText += `\n\n🌐 *Website:* ${url}`;
          responseText += `\n❌ *Error:* ${error.message}`;
        }
      }
    } else {
      responseText += `\n\n💡 *Tip:* Use \`.ping <url>\` to test website response time`;
      responseText += `\n📝 *Example:* .ping google.com`;
    }
    
    await sock.sendMessage(chatId, {
      text: responseText,
      edit: sent.key,
      ...channelInfo
    });
  }
};


    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading pingweb.js:', e.message); }

/* ===== define.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'define',
  aliases: ['dict', 'urban'],
  category: 'search',
  description: 'Search a word on Dictionary',
  usage: '.define <word>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args?.join(' ')?.trim();

    if (!query) {
      return await sock.sendMessage(chatId, { text: '*Please provide a word to search for.*\nExample: .define hello' }, { quoted: message });
    }

    try {
      const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`;
      const { data: json } = await axios.get(url);

      if (!json?.list || json.list.length === 0) {
        return await sock.sendMessage(chatId, { text: '❌ Word not found in the dictionary.' }, { quoted: message });
      }

      const firstEntry = json.list[0];
      const definition = firstEntry.definition || 'No definition available';
      const example = firstEntry.example ? `*Example:* ${firstEntry.example}` : '';

      const text = `🔍 *Dictionary*\n\n*Word:* ${query}\n*Definition:* ${definition}\n${example}`;
      await sock.sendMessage(chatId, { text }, { quoted: message });

    } catch (error) {
      console.error('Urban plugin error:', error);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch definition.', }, { quoted: message });
    }}
};


    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading define.js:', e.message); }

/* ===== dictionary.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
module.exports = [{
  pattern: "define",
  alias: ["dictionary", "meaning"],
  desc: "Get word definition",
  category: "utility",
  react: "📚",
  filename: __filename,
  use: ".define <word>",
  execute: async (conn, mek, m, { from, args, q, reply }) => {
    try {
      if (!args.length) return reply("❌ Please provide a word.\nExample: .define hello");
      
      const word = args[0];
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = res.data[0];
      
      let meanings = '';
      data.meanings.slice(0, 3).forEach(m => {
        meanings += `\n*${m.partOfSpeech}*: ${m.definitions[0].definition}`;
      });
      
      const info = `
📖 *${word}*
${meanings}
🔊 *Phonetic:* ${data.phonetic || 'N/A'}
      `;
      
      await reply(info);
      
    } catch (e) {
      await reply(`❌ Word not found.`);
    }
  }
}];

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading dictionary.js:', e.message); }

/* ===== ocr.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const FormData = require('form-data');
module.exports = [{
  pattern: "ocr",
  alias: ["imagetotext"],
  desc: "Extract text from image",
  category: "utility",
  react: "📝",
  filename: __filename,
  use: ".ocr (reply to image)",
  execute: async (conn, mek, m, { from, reply }) => {
    try {
      const quoted = m.quoted || m;
      const mime = (quoted.msg || quoted).mimetype || '';
      
      if (!mime.startsWith('image')) {
        return reply("❌ Please reply to an image.");
      }
      
      const buffer = await quoted.download();
      const formData = new FormData();
      formData.append('file', buffer, { filename: 'image.jpg' });
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      
      const res = await axios.post('https://api.ocr.space/parse/image', formData, {
        headers: {
          ...formData.getHeaders(),
          'apikey': 'helloworld' // Free API key - rate limited
        }
      });
      
      const text = res.data.ParsedResults[0]?.ParsedText;
      if (!text) throw new Error("No text found");
      
      await reply(`📝 *Extracted Text:*\n\n${text}`);
      
    } catch (e) {
      await reply(`❌ OCR failed: ${e.message}`);
    }
  }
}];

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading ocr.js:', e.message); }

/* ===== bfread.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'bfdecode',
  aliases: ['brun', 'bfread'],
  category: 'tools',
  description: 'Decode/Run Brainfuck code',
  usage: 'Reply to BF code with .bfdecode',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      let code = args?.join('') || "";

      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (quoted) {
        code = quoted.conversation || 
               quoted.extendedTextMessage?.text || 
               quoted.imageMessage?.caption || 
               quoted.videoMessage?.caption || 
               "";
      }

      code = code.trim();

      if (!code) {
        return await sock.sendMessage(chatId, { text: '*Please reply to a Brainfuck code or provide it after the command.*' }, { quoted: message });
      }

      const bf = code.replace(/[^><+\-.,[\]]/g, '');
      const tape = new Uint8Array(30000);
      let ptr = 0, pc = 0, output = "", steps = 0;
      const maxSteps = 100000;

      while (pc < bf.length && steps < maxSteps) {
        const char = bf[pc];
        if (char === '>') ptr++;
        else if (char === '<') ptr--;
        else if (char === '+') tape[ptr]++;
        else if (char === '-') tape[ptr]--;
        else if (char === '.') output += String.fromCharCode(tape[ptr]);
        else if (char === '[') {
          if (tape[ptr] === 0) {
            let depth = 1;
            while (depth > 0) {
              pc++;
              if (bf[pc] === '[') depth++;
              if (bf[pc] === ']') depth--;
            }
          }
        } else if (char === ']') {
          if (tape[ptr] !== 0) {
            let depth = 1;
            while (depth > 0) {
              pc--;
              if (bf[pc] === ']') depth++;
              if (bf[pc] === '[') depth--;
            }
          }
        }
        pc++;
        steps++;
      }

      await sock.sendMessage(chatId, { text: `*🔓 Decoded Result:* \n\n${output || "_No output generated_"}` }, { quoted: message });

    } catch (err) {
      console.error('BF Error:', err);
      await sock.sendMessage(chatId, { text: '❌ Error reading quoted message.' });
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading bfread.js:', e.message); }

/* ===== brainfuck.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'brainfuck',
  aliases: ['bfcode', 'obfuscate'],
  category: 'tools',
  description: 'Convert text into Brainfuck code',
  usage: '.brainfuck <text> OR reply to a message',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      let text = args?.join(' ') || "";

      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted) {
        text = quoted.conversation || 
               quoted.extendedTextMessage?.text || 
               quoted.imageMessage?.caption || 
               quoted.videoMessage?.caption || 
               text;
      }

      text = text.replace(/^\.\w+\s*/, '').trim();

      if (!text) {
        return await sock.sendMessage(chatId, { text: '*Please provide text or reply to a message to obfuscate!*' }, { quoted: message });
      }

      let bfCode = "";
      let lastAscii = 0;

      for (let i = 0; i < text.length; i++) {
        const ascii = text.charCodeAt(i);
        const diff = ascii - lastAscii;

        if (diff > 0) {
          bfCode += "+".repeat(diff);
        } else if (diff < 0) {
          bfCode += "-".repeat(Math.abs(diff));
        }

        bfCode += ".";
        lastAscii = ascii; 
      }

      const response = `*❄️ Brainfuck Obfuscated Text:*\n\n${bfCode}`;
      
      await sock.sendMessage(chatId, { text: response }, { quoted: message });

    } catch (err) {
      console.error('BF Encoding Error:', err);
      await sock.sendMessage(chatId, { text: '❌ Error generating code.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading brainfuck.js:', e.message); }

/* ===== rle.js ===== */
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

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

function getQuoted(message) {
    return message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

function getMediaType(quoted) {
    if (quoted?.imageMessage) return 'image';
    if (quoted?.videoMessage) return 'video';
    if (quoted?.audioMessage) return 'audio';
    if (quoted?.documentMessage) return 'document';
    if (quoted?.stickerMessage) return 'sticker';
    return null;
}

module.exports = {
    command: 'rle',
    aliases: ['compress', 'decompress', 'rlecompress'],
    category: 'utility',
    description: 'Compress or decompress text/files using Run-Length Encoding (C++ powered)',
    usage: '.rle compress <text or reply to media>\n.rle decompress <encoded or reply to compressed file>',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;

        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const mediaType = getMediaType(quoted);

        if (!args.length) {
            return await sock.sendMessage(chatId, {
                text: `🗜️ *RLE Compressor*\n\n` +
                      `*Text:*\n` +
                      `\`.rle compress AAABBBCCDDDD\`\n` +
                      `\`.rle decompress <encoded>\`\n\n` +
                      `*File/Media (reply to any file or media):*\n` +
                      `\`.rle compress\` — reply to image/video/audio/doc\n` +
                      `\`.rle decompress\` — reply to .rle compressed file\n\n` +
                      `⚠️ RLE works best on data with repeated bytes.\n` +
                      `For photos/videos, compression may increase size.`,
                ...channelInfo
            }, { quoted: message });
        }

        const mode = args[0]?.toLowerCase();
        if (mode !== 'compress' && mode !== 'decompress') {
            return await sock.sendMessage(chatId, {
                text: `❌ Use \`compress\` or \`decompress\``,
                ...channelInfo
            }, { quoted: message });
        }

        const binPath = path.join(process.cwd(), 'lib', 'bin', 'rle');
        if (!fs.existsSync(binPath)) {
            return await sock.sendMessage(chatId, {
                text: `❌ RLE binary not available on this server (g++ not installed).`,
                ...channelInfo
            }, { quoted: message });
        }

        const tempDir = path.join(process.cwd(), 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        const id = Date.now();

        try {
            if (mode === 'compress') {
                let inputBuffer;
                let sourceLabel;
                let originalName = `file_${id}`;

                if (mediaType && quoted) {
                    await sock.sendMessage(chatId, { text: '⏳ Downloading media...', ...channelInfo }, { quoted: message });
                    const msgObj = { message: { [`${mediaType}Message`]: quoted[`${mediaType}Message`] } };
                    inputBuffer = await downloadMediaMessage(msgObj, 'buffer', {});
                    sourceLabel = `${mediaType} (${inputBuffer.length.toLocaleString()} bytes)`;
                    originalName = `${mediaType}_${id}`;
                } else {
                    const textInput = args.slice(1).join(' ').trim() || quotedText;
                    if (!textInput) {
                        return await sock.sendMessage(chatId, {
                            text: `❌ No input. Provide text or reply to a media message.`,
                            ...channelInfo
                        }, { quoted: message });
                    }
                    inputBuffer = Buffer.from(textInput, 'utf8');
                    sourceLabel = `text (${inputBuffer.length} bytes)`;
                }

                const inFile = path.join(tempDir, `rle_in_${id}`);
                const outFile = path.join(tempDir, `rle_out_${id}.rle`);
                fs.writeFileSync(inFile, inputBuffer);

                await sock.sendMessage(chatId, { text: '🗜️ Compressing...', ...channelInfo }, { quoted: message });

                const { stdout, stderr } = await execAsync(
                    `"${binPath}" compress file "${inFile}"`,
                    { timeout: 60000, maxBuffer: 100 * 1024 * 1024 }
                );

                const result = stdout.trim();
                fs.writeFileSync(outFile, result);

                let statsLine = '';
                if (stderr) {
                    const match = stderr.match(/STATS\|original=(\d+)\|compressed=(\d+)\|ratio=(-?\d+)%/);
                    if (match) {
                        const orig = parseInt(match[1], 10);
                        const comp = result.length;
                        const saved = orig - comp;
                        const pct = ((1 - comp / orig) * 100).toFixed(1);
                        statsLine = saved > 0
                            ? `\n💾 Saved: ${Math.abs(saved).toLocaleString()} bytes (${pct}%)`
                            : `\n⚠️ File grew by ${Math.abs(saved).toLocaleString()} bytes (RLE not ideal for this data)`;
                    }
                }

                await sock.sendMessage(chatId, {
                    document: fs.readFileSync(outFile),
                    mimetype: 'application/octet-stream',
                    fileName: `${originalName}.rle`,
                    caption: `🗜️ *RLE Compressed*\n\n` +
                             `📥 *Source:* ${sourceLabel}${statsLine}\n\n` +
                             `_Reply with \`.rle decompress\` to restore_`,
                    ...channelInfo
                }, { quoted: message });

                for (const f of [inFile, outFile]) try { fs.unlinkSync(f); } catch {}

            } else {
                let encodedData;

                if (quoted?.documentMessage) {
                    await sock.sendMessage(chatId, { text: '⏳ Reading compressed file...', ...channelInfo }, { quoted: message });
                    const msgObj = { message: { documentMessage: quoted.documentMessage } };
                    const buf = await downloadMediaMessage(msgObj, 'buffer', {});
                    encodedData = buf.toString('utf8').trim();
                } else {
                    encodedData = args.slice(1).join(' ').trim() || quotedText;
                }

                if (!encodedData) {
                    return await sock.sendMessage(chatId, {
                        text: `❌ No compressed input. Reply to an .rle file or provide encoded text.`,
                        ...channelInfo
                    }, { quoted: message });
                }

                await sock.sendMessage(chatId, { text: '📦 Decompressing...', ...channelInfo }, { quoted: message });

                const inFile = path.join(tempDir, `rle_dec_in_${id}.txt`);
                fs.writeFileSync(inFile, encodedData);

                const { stdout, stderr } = await execAsync(
                    `"${binPath}" decompress text "${encodedData.replace(/"/g, '\\"')}"`,
                    { timeout: 60000, maxBuffer: 100 * 1024 * 1024 }
                );

                if (stderr && !stdout) {
                    return await sock.sendMessage(chatId, { text: `❌ ${stderr.trim()}`, ...channelInfo }, { quoted: message });
                }

                const result = stdout;
                const resultBuf = Buffer.from(result);
                const outFile = path.join(tempDir, `rle_decompressed_${id}`);
                fs.writeFileSync(outFile, resultBuf);

                if (result.length > 800 || resultBuf.some(b => b < 9 || (b > 13 && b < 32))) {
                    await sock.sendMessage(chatId, {
                        document: resultBuf,
                        mimetype: 'application/octet-stream',
                        fileName: `rle_decompressed_${id}`,
                        caption: `📦 *RLE Decompressed*\n\n📤 *Size:* ${resultBuf.length.toLocaleString()} bytes`,
                        ...channelInfo
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        text: `📦 *RLE Decompressed*\n\n\`\`\`\n${result.trim()}\n\`\`\``,
                        ...channelInfo
                    }, { quoted: message });
                }

                for (const f of [inFile, outFile]) try { fs.unlinkSync(f); } catch {}
            }

        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Failed: ${error.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading rle.js:', e.message); }

/* ===== dna.js ===== */
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

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

function getQuoted(message) {
    return message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

function getMediaType(quoted) {
    if (quoted?.imageMessage) return 'image';
    if (quoted?.videoMessage) return 'video';
    if (quoted?.audioMessage) return 'audio';
    if (quoted?.documentMessage) return 'document';
    if (quoted?.stickerMessage) return 'sticker';
    return null;
}

module.exports = {
    command: 'dna',
    aliases: ['dnaencode', 'dnadecode'],
    category: 'utility',
    description: 'Encode any text or media to DNA sequence (ATCG) or decode it back',
    usage: '.dna encode <text or reply to media>\n.dna decode <DNA or reply to DNA file>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const mediaType = getMediaType(quoted);

        if (!args.length) {
            return await sock.sendMessage(chatId, {
                text: `🧬 *DNA Encoder / Decoder*\n\n` +
                      `*Text:*\n` +
                      `\`.dna encode Hello World\`\n` +
                      `\`.dna decode ATCGATCG...\`\n\n` +
                      `*Media/File (reply to any media):*\n` +
                      `\`.dna encode\` — reply to image/video/audio/doc\n` +
                      `\`.dna decode\` — reply to a .txt file with DNA\n\n` +
                      `ℹ️ Each byte becomes 4 DNA bases (A, T, C, G)`,
                ...channelInfo
            }, { quoted: message });
        }

        const mode = args[0]?.toLowerCase();
        if (mode !== 'encode' && mode !== 'decode') {
            return await sock.sendMessage(chatId, {
                text: `❌ Use \`encode\` or \`decode\``,
                ...channelInfo
            }, { quoted: message });
        }

        const binPath = path.join(process.cwd(), 'lib', 'bin', 'dna');
        if (!fs.existsSync(binPath)) {
            return await sock.sendMessage(chatId, {
                text: `❌ DNA binary not available on this server (g++ not installed).`,
                ...channelInfo
            }, { quoted: message });
        }

        const tempDir = path.join(process.cwd(), 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        const id = Date.now();

        try {
            if (mode === 'encode') {
                let inputBuffer;
                let sourceLabel;

                if (mediaType && quoted) {
                    await sock.sendMessage(chatId, { text: '⏳ Downloading media...', ...channelInfo }, { quoted: message });
                    const msgObj = { message: { [`${mediaType}Message`]: quoted[`${mediaType}Message`] } };
                    inputBuffer = await downloadMediaMessage(msgObj, 'buffer', {});
                    sourceLabel = `${mediaType} file (${inputBuffer.length} bytes)`;
                } else {
                    const textInput = args.slice(1).join(' ').trim() || quotedText;
                    if (!textInput) {
                        return await sock.sendMessage(chatId, {
                            text: `❌ No input. Provide text or reply to a media message.`,
                            ...channelInfo
                        }, { quoted: message });
                    }
                    inputBuffer = Buffer.from(textInput, 'utf8');
                    sourceLabel = `text (${inputBuffer.length} bytes)`;
                }

                const inFile = path.join(tempDir, `dna_in_${id}.bin`);
                const outFile = path.join(tempDir, `dna_out_${id}.txt`);
                fs.writeFileSync(inFile, inputBuffer);

                await sock.sendMessage(chatId, { text: '🧬 Encoding to DNA...', ...channelInfo }, { quoted: message });

                const b64 = inputBuffer.toString('base64');
                const b64File = path.join(tempDir, `dna_b64_${id}.txt`);
                fs.writeFileSync(b64File, b64);

                const { stdout } = await execAsync(`"${binPath}" encode "${b64}"`, { timeout: 30000, maxBuffer: 50 * 1024 * 1024 });
                const dnaResult = stdout.trim();

                fs.writeFileSync(outFile, dnaResult);

                await sock.sendMessage(chatId, {
                    document: fs.readFileSync(outFile),
                    mimetype: 'text/plain',
                    fileName: `dna_encoded_${id}.txt`,
                    caption: `🧬 *DNA Encoded*\n\n` +
                             `📥 *Source:* ${sourceLabel}\n` +
                             `📤 *DNA bases:* ${dnaResult.length.toLocaleString()}\n\n` +
                             `_Reply to this file with \`.dna decode\` to restore_`,
                    ...channelInfo
                }, { quoted: message });

                [inFile, outFile, b64File].forEach(f => { try { fs.unlinkSync(f); } catch {} });

            } else { // decode
                let dnaInput;

                if (quoted?.documentMessage) {
                    await sock.sendMessage(chatId, { text: '⏳ Reading DNA file...', ...channelInfo }, { quoted: message });
                    const msgObj = { message: { documentMessage: quoted.documentMessage } };
                    const buf = await downloadMediaMessage(msgObj, 'buffer', {});
                    dnaInput = buf.toString('utf8').trim();
                } else {
                    dnaInput = args.slice(1).join(' ').trim() || quotedText;
                }

                if (!dnaInput) {
                    return await sock.sendMessage(chatId, {
                        text: `❌ No DNA input. Provide DNA text or reply to a DNA .txt file.`,
                        ...channelInfo
                    }, { quoted: message });
                }

                if (!/^[ATCGatcg\s]+$/.test(dnaInput)) {
                    return await sock.sendMessage(chatId, {
                        text: `❌ Invalid DNA sequence. Only A, T, C, G allowed.`,
                        ...channelInfo
                    }, { quoted: message });
                }

                const cleanDna = dnaInput.replace(/\s/g, '');
                await sock.sendMessage(chatId, { text: '🔬 Decoding DNA...', ...channelInfo }, { quoted: message });

                const { stdout, stderr } = await execAsync(
                    `"${binPath}" decode "${cleanDna}"`,
                    { timeout: 30000, maxBuffer: 50 * 1024 * 1024 }
                );

                if (stderr && !stdout) {
                    return await sock.sendMessage(chatId, { text: `❌ ${stderr.trim()}`, ...channelInfo }, { quoted: message });
                }

                const decoded = stdout.trim();
                const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(decoded) && decoded.length % 4 === 0;

                if (isBase64 && decoded.length > 100) {
                    const fileBuffer = Buffer.from(decoded, 'base64');
                    const outFile = path.join(tempDir, `dna_decoded_${id}.bin`);
                    fs.writeFileSync(outFile, fileBuffer);

                    await sock.sendMessage(chatId, {
                        document: fileBuffer,
                        mimetype: 'application/octet-stream',
                        fileName: `dna_decoded_${id}`,
                        caption: `🧬 *DNA Decoded*\n\n📦 *Restored file:* ${fileBuffer.length.toLocaleString()} bytes`,
                        ...channelInfo
                    }, { quoted: message });

                    try { fs.unlinkSync(outFile); } catch {}
                } else {
                    if (decoded.length > 800) {
                        const outFile = path.join(tempDir, `dna_decoded_${id}.txt`);
                        fs.writeFileSync(outFile, decoded);
                        await sock.sendMessage(chatId, {
                            document: fs.readFileSync(outFile),
                            mimetype: 'text/plain',
                            fileName: `dna_decoded_${id}.txt`,
                            caption: `🧬 *DNA Decoded* — ${decoded.length} chars`,
                            ...channelInfo
                        }, { quoted: message });
                        try { fs.unlinkSync(outFile); } catch {}
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `🧬 *DNA Decoded*\n\n📤 *Result:*\n\`\`\`\n${decoded}\n\`\`\``,
                            ...channelInfo
                        }, { quoted: message });
                    }
                }
            }
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Failed: ${error.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading dna.js:', e.message); }

/* ===== analyze.js ===== */
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

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const { promisify } = require('util');
const { getBin } = require('../lib/compile.js');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);
const WA_LIMIT = 60000;

function getQuoted(message) {
    return message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

async function sendResult(sock, chatId, channelInfo, message, text, filename) {
    if (text.length > WA_LIMIT) {
        const tmpFile = path.join(process.cwd(), 'temp', filename);
        fs.mkdirSync(path.dirname(tmpFile), { recursive: true });
        fs.writeFileSync(tmpFile, text);
        await sock.sendMessage(chatId, {
            document: fs.readFileSync(tmpFile),
            mimetype: 'text/plain',
            fileName: filename,
            caption: '📈 Result too large for WhatsApp, sent as file.',
            ...channelInfo
        }, { quoted: message });
        try { fs.unlinkSync(tmpFile); } catch {}
    } else {
        await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }
}

module.exports = {
    command: 'analyze',
    aliases: ['textanalyze', 'textanalyser', 'analyse', 'readability'],
    category: 'utility',
    description: 'Deep text analysis: reading level, sentiment, word stats (C++ powered)',
    usage: '.analyze <text or reply to any message/file>',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;

        const binPath = getBin('analyze');
        if (!fs.existsSync(binPath)) {
            return await sock.sendMessage(chatId, {
                text: `❌ Analyze binary not available on this server (g++ not installed or not yet compiled).`,
                ...channelInfo
            }, { quoted: message });
        }

        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const hasDoc = !!quoted?.documentMessage;

        const textInput = args.join(' ').trim() || quotedText;

        if (!textInput && !hasDoc) {
            return await sock.sendMessage(chatId, {
                text: `📈 *Text Analyzer*\n\n` +
                      `*Usage:* \`.analyze <paste any text>\`\n\n` +
                      `*Or reply to:*\n` +
                      `• Any text message\n` +
                      `• A .txt or document file\n\n` +
                      `*Output includes:*\n` +
                      `📊 Word/sentence/paragraph count\n` +
                      `📖 Flesch Reading Ease score & level\n` +
                      `😊 Sentiment analysis (positive/negative/neutral)\n` +
                      `⏱️ Reading time estimate\n` +
                      `🏆 Top 20 keywords`,
                ...channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { text: '🔍 Analyzing...', ...channelInfo }, { quoted: message });

        const tempDir = path.join(process.cwd(), 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        const id = Date.now();

        try {
            let stdout;

            if (hasDoc && quoted) {
                const msgObj = { message: { documentMessage: quoted.documentMessage } };
                const buf = await downloadMediaMessage(msgObj, 'buffer', {});
                const tmpFile = path.join(tempDir, `analyze_in_${id}.txt`);
                fs.writeFileSync(tmpFile, buf);
                const result = await execAsync(`"${binPath}" --file "${tmpFile}"`, { timeout: 30000 });
                stdout = result.stdout;
                try { fs.unlinkSync(tmpFile); } catch {}
            } else {
                const tmpFile = path.join(tempDir, `analyze_in_${id}.txt`);
                fs.writeFileSync(tmpFile, textInput);
                const result = await execAsync(`"${binPath}" --file "${tmpFile}"`, { timeout: 30000 });
                stdout = result.stdout;
                try { fs.unlinkSync(tmpFile); } catch {}
            }

            const data = JSON.parse(stdout.trim());

            const bar = (score) => {
                const filled = Math.round(score / 10);
                return '█'.repeat(filled) + '░'.repeat(10 - filled);
            };

            const fleschBar = bar(data.flesch_score / 10);
            const sentBar = data.sentiment_score >= 0
                ? '🟢'.repeat(Math.min(5, Math.round(data.sentiment_score / 20)))
                : '🔴'.repeat(Math.min(5, Math.round(Math.abs(data.sentiment_score) / 20)));

            const topWordsText = data.top_words?.length
                ? data.top_words.slice(0, 15).map((w, i) =>
                    `${String(i + 1).padStart(2)}. ${w.word.padEnd(15)} ${w.count}x`
                  ).join('\n')
                : 'N/A';

            const resultText =
                `📈 *Text Analysis Report*\n\n` +
                `━━━━━━ 📊 Counts ━━━━━━\n` +
                `📖 *Words:* ${data.total_words?.toLocaleString()} (${data.unique_words?.toLocaleString()} unique)\n` +
                `📝 *Characters:* ${data.total_chars?.toLocaleString()} (${data.chars_no_spaces?.toLocaleString()} no spaces)\n` +
                `📜 *Sentences:* ${data.sentences}\n` +
                `📄 *Paragraphs:* ${data.paragraphs}\n` +
                `🔤 *Syllables:* ${data.syllables?.toLocaleString()}\n` +
                `📏 *Avg word length:* ${data.avg_word_length} chars\n` +
                `📐 *Avg sentence length:* ${data.avg_sentence_length} words\n` +
                `🔠 *Complex words (>6 chars):* ${data.long_words}\n\n` +
                `━━━━━━ 📖 Readability ━━━━━━\n` +
                `📊 *Flesch Score:* ${data.flesch_score}/100\n` +
                `${fleschBar}\n` +
                `🎓 *Reading Level:* ${data.reading_level}\n` +
                `⏱️ *Reading Time:* ${data.reading_time}\n\n` +
                `━━━━━━ 😊 Sentiment ━━━━━━\n` +
                `${sentBar || '⬜⬜⬜⬜⬜'}\n` +
                `🎭 *Overall:* ${data.sentiment}\n` +
                `✅ *Positive words:* ${data.positive_words}\n` +
                `❌ *Negative words:* ${data.negative_words}\n\n` +
                `━━━━━━ 🏆 Top Keywords ━━━━━━\n` +
                `\`\`\`\n${topWordsText}\n\`\`\``;

            await sendResult(sock, chatId, channelInfo, message, resultText, `analysis_${id}.txt`);

        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Analysis failed: ${error.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading analyze.js:', e.message); }

/* ===== string.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'string',
  aliases: ['textinfo', 'textstats'],
  category: 'info',
  description: 'Get detailed info about a text string',
  usage: '.string <text>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const textInput = args?.join(' ')?.trim();

    if (!textInput) {
      return await sock.sendMessage(chatId, { text: '*Provide some text to analyze.*\nExample: .string What is AI' }, { quoted: message });
    }

    try {
      const apiUrl = `https://discardapi.dpdns.org/api/tools/string?apikey=guru&text=${encodeURIComponent(textInput)}`;
      const { data } = await axios.get(apiUrl, { timeout: 10000 });

      if (!data?.status) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to analyze text.' }, { quoted: message });
      }
      
      const reply = 
        `📝 *Text Analysis*\n\n` +
        `✏️ Text: ${textInput}\n` +
        `🔠 Letters: ${data.letters}\n` +
        `🔢 Characters (including spaces): ${data.length}\n` +
        `📄 Words: ${data.words}\n\n` +
        `💡 Tip: Keep your text concise for better readability!`;

      await sock.sendMessage(chatId, { text: reply }, { quoted: message });

    } catch (error) {
      console.error('String plugin error:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { text: '❌ Request timed out. Please try again later.' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch text information.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading string.js:', e.message); }

/* ===== element.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'element',
  aliases: ['atom', 'periodictable'],
  category: 'search',
  description: 'Get information about a chemical element',
  usage: '.element <name or symbol>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args?.join(' ')?.trim();

    if (!query) {
      return await sock.sendMessage(chatId, { text: '*Provide element name or symbol.*\nExample: .element H' }, { quoted: message });
    }

    try {
      const { data: json } = await axios.get(`https://api.popcat.xyz/periodic-table?element=${encodeURIComponent(query)}`);

      if (!json?.name) {
        return await sock.sendMessage(chatId, { text: '❌ Element not found.' }, { quoted: message });
      }

      const text = 
        `🧪 *Element Info*\n` +
        `• Name: ${json.name}\n` +
        `• Symbol: ${json.symbol}\n` +
        `• Atomic #: ${json.atomic_number}\n` +
        `• Atomic Mass: ${json.atomic_mass}\n` +
        `• Period: ${json.period}\n` +
        `• Phase: ${json.phase}\n` +
        `• Discovered By: ${json.discovered_by || 'Unknown'}\n\n` +
        `📘 Summary:\n${json.summary}`;

      await sock.sendMessage(chatId, { image: { url: json.image }, caption: text }, { quoted: message });

    } catch (error) {
      console.error('Element plugin error:', error);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch element info.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading element.js:', e.message); }

/* ===== crypto.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
module.exports = [{
  pattern: "crypto",
  alias: ["btc", "eth"],
  desc: "Get cryptocurrency price",
  category: "utility",
  react: "💰",
  filename: __filename,
  use: ".crypto <coin>",
  execute: async (conn, mek, m, { from, args, q, reply }) => {
    try {
      if (!args.length) return reply("❌ Please provide coin name.\nExample: .crypto bitcoin");
      
      const coin = args[0].toLowerCase();
      const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd,gbp,eur,inr&include_24hr_change=true`);
      
      const data = res.data[coin];
      if (!data) throw new Error("Coin not found");
      
      const info = `
💰 *${coin.toUpperCase()} Price*
🇺🇸 USD: $${data.usd}
🇪🇺 EUR: €${data.eur}
🇬🇧 GBP: £${data.gbp}
🇮🇳 INR: ₹${data.inr}
📈 24h Change: ${data.usd_24h_change?.toFixed(2)}%
      `;
      
      await reply(info);
      
    } catch (e) {
      await reply(`❌ Error: ${e.message}`);
    }
  }
}];

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading crypto.js:', e.message); }

/* ===== conversion.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'convert',
  aliases: ['unit', 'unitconvert'],
  category: 'tools',
  description: 'Convert units (e.g., c → f, m → km, kg → g)',
  usage: '.convert <from_unit> <to_unit> <value>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    if (!args || args.length < 3) {
      return await sock.sendMessage(chatId, { text: '*Usage:* .convert <from_unit> <to_unit> <value>\nExample: .convert c f 20' }, { quoted: message });
    }

    const fromUnit = args[0].toLowerCase();
    const toUnit = args[1].toLowerCase();
    const value = args[2];

    if (isNaN(value)) {
      return await sock.sendMessage(chatId, { text: '❌ Value must be a number.' }, { quoted: message });
    }

    try {
      const apiUrl = `https://discardapi.dpdns.org/api/convert/unit?apikey=guru&from=${encodeURIComponent(fromUnit)}&to=${encodeURIComponent(toUnit)}&value=${encodeURIComponent(value)}`;

      const { data } = await axios.get(apiUrl, { timeout: 10000 });

      if (!data?.status) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to convert the units. Check if the units are correct.' }, { quoted: message });
      }

      const reply = 
        `⚡ *Unit Conversion*\n\n` +
        `🔹 From: ${data.input} ${data.from}\n` +
        `🔹 To: ${data.to}\n` +
        `✅ Result: ${data.output}\n\n` +
        `💡 Tip: You can convert all units like m, km, kg, g, c, f, etc.`;

      await sock.sendMessage(chatId, { text: reply }, { quoted: message });

    } catch (error) {
      console.error('Unit conversion plugin error:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { text: '❌ Request timed out. The API may be slow or unreachable.' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: '❌ Failed to convert units.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading conversion.js:', e.message); }

/* ===== tiny.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
  command: 'tinyurl',
  aliases: ['shorten', 'tiny'],
  category: 'tools',
  description: 'Shorten a URL using TinyURL with automatic fallbacks',
  usage: '.tinyurl <url>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message?.key?.remoteJid;
    const query = args?.join(' ')?.trim();
    const send = (text) => sock.sendMessage(chatId, { text }, { quoted: message });

    if (!query) {
      return send('*Please provide a URL to shorten.*\nExample: .tinyurl https://example.com');
    }

    let url = query;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try { new URL(url); } catch { return send('❌ Invalid URL. Please send a valid http/https link.'); }

    const providers = [
      async () => {
        const r = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 JUNAID-MD/1.0' }
        });
        const t = (await r.text()).trim();
        if (!r.ok || !/^https?:\/\/tinyurl\.com\//i.test(t)) throw new Error(`TinyURL HTTP ${r.status}`);
        return t;
      },
      async () => {
        const r = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 JUNAID-MD/1.0' }
        });
        const t = (await r.text()).trim();
        if (!r.ok || !/^https?:\/\/is\.gd\//i.test(t)) throw new Error(`is.gd HTTP ${r.status}`);
        return t;
      },
      async () => {
        const r = await fetch(`https://da.gd/s?url=${encodeURIComponent(url)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 JUNAID-MD/1.0' }
        });
        const t = (await r.text()).trim();
        if (!r.ok || !/^https?:\/\/da\.gd\//i.test(t)) throw new Error(`da.gd HTTP ${r.status}`);
        return t;
      }
    ];

    let shortUrl = null;
    let provider = '';
    const errors = [];
    for (const fn of providers) {
      try {
        shortUrl = await Promise.race([
          fn(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000))
        ]);
        provider = shortUrl.includes('tinyurl.com') ? 'TinyURL' : shortUrl.includes('is.gd') ? 'is.gd' : 'da.gd';
        break;
      } catch (e) { errors.push(e.message); }
    }

    if (!shortUrl) {
      console.error('[TINYURL] All providers failed:', errors.join(' | '));
      return send('❌ *URL SHORTENER FAILED*\n\nTinyURL और backup shorteners अभी reachable नहीं हैं. थोड़ी देर बाद फिर try करें.');
    }

    await send(`✨ *YOUR SHORT URL*\n\n🔗 *Original Link:*\n${url}\n\n✂️ *Shortened URL (${provider}):*\n${shortUrl}`);
  }
};


    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading tiny.js:', e.message); }

/* ===== iplookup.js ===== */
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
    command: 'whoisip',
    aliases: ['ip', 'iplookup'],
    category: 'search',
    description: 'Get location info from an IP or Domain',
    usage: '.ip <address/domain>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args[0];

        if (!query) {
            return await sock.sendMessage(chatId, { text: 'Enter an IP or Domain (e.g., google.com).' }, { quoted: message });
        }

        try {
            const res = await axios.get(`http://ip-api.com/json/${query}?fields=status,message,country,regionName,city,zip,isp,org,as,query`);
            const data = res.data;

            if (data.status === 'fail') {
                return await sock.sendMessage(chatId, { text: `❌ Error: ${data.message}` }, { quoted: message });
            }

            const info = `
🌐 *IP/Domain Lookup*
---
🔍 *Target:* ${data.query}
📍 *Country:* ${data.country}
🏙️ *City/Region:* ${data.city}, ${data.regionName}
📮 *Zip:* ${data.zip}
📡 *ISP:* ${data.isp}
🏢 *Organization:* ${data.org}
            `.trim();

            await sock.sendMessage(chatId, { text: info }, { quoted: message });

        } catch (err) {
            await sock.sendMessage(chatId, { text: '❌ Network error.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading iplookup.js:', e.message); }

/* ===== whois.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'whois',
  aliases: ['domaininfo'],
  category: 'info',
  description: 'Get WHOIS information of a domain',
  usage: '.whois <domain>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let domain = args?.[0]?.trim();

    if (!domain) {
      return await sock.sendMessage(chatId, { text: '*Provide a domain.*\nExample: .whois google.com' }, { quoted: message });
    }

    domain = domain.replace(/^https?:\/\//i, '');

    try {
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
        return await sock.sendMessage(chatId, { text: '❌ Invalid domain provided.' }, { quoted: message });
      }

      const apiUrl = `https://discardapi.dpdns.org/api/tools/whois?apikey=guru&domain=${encodeURIComponent(domain)}`;

      const { data } = await axios.get(apiUrl, { timeout: 10000 });

      if (!data?.status || !data.result?.domain) {
        return await sock.sendMessage(chatId, { text: '❌ Could not fetch WHOIS information.' }, { quoted: message });
      }

      const { domain: dom, registrar, registrant, technical } = data.result;

      const text =
        `🌐 *WHOIS Information*\n\n` +
        `• Domain: ${dom.domain}\n` +
        `• Name: ${dom.name}\n` +
        `• Extension: .${dom.extension}\n` +
        `• WHOIS Server: ${dom.whois_server}\n` +
        `• Status: ${dom.status.join(', ')}\n` +
        `• Name Servers: ${dom.name_servers.join(', ')}\n` +
        `• Created: ${dom.created_date_in_time}\n` +
        `• Updated: ${dom.updated_date_in_time}\n` +
        `• Expires: ${dom.expiration_date_in_time}\n\n` +
        `🏢 Registrar: ${registrar.name}\n` +
        `📞 Phone: ${registrar.phone}\n` +
        `📧 Email: ${registrar.email}\n` +
        `🔗 Website: ${registrar.referral_url}\n\n` +
        `👤 Registrant: ${registrant.organization || 'N/A'}\n` +
        `🌍 Country: ${registrant.country || 'N/A'}\n` +
        `📧 Email: ${registrant.email || 'N/A'}\n\n` +
        `⚙ Technical Email: ${technical.email || 'N/A'}`;

      await sock.sendMessage(chatId, { text }, { quoted: message });

    } catch (error) {
      console.error('WHOIS plugin error:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { text: '❌ Request timed out. The API may be slow or unreachable.' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch WHOIS information.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading whois.js:', e.message); }

/* ===== fetch.js ===== */
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
const { fromBuffer } = require('file-type');

const MAX_TEXT_LENGTH = 60000; // WhatsApp max message length

/**
 * Pretty‑print JSON with syntax highlighting using ANSI codes.
 * Falls back to plain JSON if highlight fails.
 */
function formatJSON(json) {
	try {
		const obj = typeof json === 'string' ? JSON.parse(json) : json;
		const pretty = JSON.stringify(obj, null, 2);

		// Simple ANSI colouring for keys and values (optional)
		return pretty.replace(/"([^"]+)":/g, '\x1b[36m$1\x1b[0m:') // cyan keys
			.replace(/: (\d+)/g, ': \x1b[33m$1\x1b[0m')            // yellow numbers
			.replace(/: "(.*?)"/g, ': \x1b[32m"$1"\x1b[0m');       // green strings
	} catch {
		return String(json);
	}
}

module.exports = {
	command: 'fetch',
	aliases: ['get', 'download', 'json'],
	category: 'tools',
	description: 'Fetch any URL and send content (binary or formatted JSON)',
	usage: '.fetch <url>',

	async handler(sock, message, args, context) {
		const chatId = context.chatId || message.key.remoteJid;
		const channelInfo = context.channelInfo || {};
		const url = args[0];

		if (!url || !url.startsWith('http')) {
			return await sock.sendMessage(chatId, {
				text: '❌ Provide a valid URL starting with http/https.',
				...channelInfo
			}, { quoted: message });
		}

		try {
			await sock.sendMessage(chatId, {
				text: '📡 Fetching data...',
				...channelInfo
			}, { quoted: message });

			const res = await axios.get(url, {
				responseType: 'arraybuffer',
				timeout: 30000,
				validateStatus: () => true // don't throw on any status
			});

			const buffer = Buffer.from(res.data);
			const contentType = res.headers['content-type'] || '';

			// ---- JSON handling ----
			if (contentType.includes('application/json') || url.endsWith('.json')) {
				let jsonText;
				try {
					// Try to parse and pretty‑print
					const obj = JSON.parse(buffer.toString('utf-8'));
					jsonText = JSON.stringify(obj, null, 2);
				} catch {
					// If parsing fails, send raw text
					jsonText = buffer.toString('utf-8').slice(0, MAX_TEXT_LENGTH);
				}

				if (jsonText.length > MAX_TEXT_LENGTH) {
					// Send as file if too long
					return await sock.sendMessage(chatId, {
						document: Buffer.from(jsonText),
						mimetype: 'application/json',
						fileName: 'response.json',
						caption: '📄 JSON response (sent as file due to length)',
						...channelInfo
					}, { quoted: message });
				} else {
					// Send as formatted text (monospace recommended)
					return await sock.sendMessage(chatId, {
						text: `\`\`\`json\n${jsonText}\n\`\`\``,
						...channelInfo
					}, { quoted: message });
				}
			}

			// ---- Binary file handling ----
			const type = await fromBuffer(buffer);
			if (!type) {
				// Unknown type – send as text up to limit
				const text = buffer.toString('utf-8').slice(0, MAX_TEXT_LENGTH);
				return await sock.sendMessage(chatId, {
					text: text || 'Empty response',
					...channelInfo
				}, { quoted: message });
			}

			// Send according to mime type
			if (type.mime.startsWith('image/')) {
				await sock.sendMessage(chatId, { image: buffer, ...channelInfo }, { quoted: message });
			} else if (type.mime.startsWith('video/')) {
				await sock.sendMessage(chatId, { video: buffer, ...channelInfo }, { quoted: message });
			} else if (type.mime.startsWith('audio/')) {
				await sock.sendMessage(chatId, { audio: buffer, mimetype: type.mime, ...channelInfo }, { quoted: message });
			} else {
				await sock.sendMessage(chatId, {
					document: buffer,
					mimetype: type.mime,
					fileName: `file.${type.ext}`,
					...channelInfo
				}, { quoted: message });
			}

		} catch (err) {
			console.error('[FETCH] Error:', err.message);
			await sock.sendMessage(chatId, {
				text: '❌ Failed to fetch. URL might be private, invalid, or unreachable.',
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading fetch.js:', e.message); }


/* ===== nssearch.js ===== */
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
 *    NSSEARCH v1.0 — News Search · Sliding Carousel · GNews API             *
 *                                                                           *
 *****************************************************************************/

'use strict';

const axios = require('axios');
const { generateWAMessageFromContent, generateWAMessageContent } = require('@whiskeysockets/baileys');

/* ─── config ────────────────────────────────────────────────────────────── */
const GNEWS_KEY    = process.env.GNEWS_KEY    || '';
const NEWSAPI_KEY  = process.env.NEWSAPI_KEY  || '';
const GNEWS_BASE   = 'https://gnews.io/api/v4';
const NEWSAPI_BASE = 'https://newsapi.org/v2';

/* ─── placeholder image for articles without image ─────────────────────── */
const PLACEHOLDER_IMG = 'https://via.placeholder.com/600x400/1a1a2e/ffffff?text=NEWS';

/* ─── fetch via GNews ───────────────────────────────────────────────────── */
async function fetchGNews(query) {
    const res = await axios.get(`${GNEWS_BASE}/search`, {
        params: { q: query, token: GNEWS_KEY, lang: 'en', max: 10 },
        timeout: 8000
    });
    return (res.data?.articles || []).map(a => ({
        title:       a.title,
        description: a.description || a.content || '',
        imageUrl:    a.image || PLACEHOLDER_IMG,
        source:      a.source?.name || 'Unknown',
        publishedAt: a.publishedAt,
        url:         a.url
    }));
}

/* ─── fetch via NewsAPI (fallback) ─────────────────────────────────────── */
async function fetchNewsAPI(query) {
    const res = await axios.get(`${NEWSAPI_BASE}/everything`, {
        params: { q: query, apiKey: NEWSAPI_KEY, language: 'en',
                  sortBy: 'relevancy', pageSize: 10 },
        timeout: 8000
    });
    return (res.data?.articles || []).map(a => ({
        title:       a.title,
        description: a.description || '',
        imageUrl:    a.urlToImage || PLACEHOLDER_IMG,
        source:      a.source?.name || 'Unknown',
        publishedAt: a.publishedAt,
        url:         a.url
    }));
}

/* ─── format date ───────────────────────────────────────────────────────── */
function fmtDate(iso) {
    if (!iso) return 'N/A';
    try {
        return new Date(iso).toLocaleDateString('en-US',
            { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return iso.substring(0, 10); }
}

/* ─── build carousel ────────────────────────────────────────────────────── */
async function buildNewsCarousel(sock, chatId, articles, query) {
    const cards = [];

    for (const article of articles.slice(0, 8)) {
        try {
            const imgContent = await generateWAMessageContent(
                { image: { url: article.imageUrl } },
                { upload: sock.waUploadToServer }
            );
            if (!imgContent?.imageMessage) continue;

            const desc = article.description
                ? article.description.substring(0, 140) + (article.description.length > 140 ? '…' : '')
                : 'No description available.';

            cards.push({
                header: {
                    title:              article.title.substring(0, 60),
                    hasMediaAttachment: true,
                    imageMessage:       imgContent.imageMessage
                },
                body: {
                    text: `📰 *${article.source}*  ·  📅 ${fmtDate(article.publishedAt)}\n\n${desc}`
                },
                footer: { text: '📡 JUNAID-MD↣³⁰² News Search' },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name:             'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📰 Read Full Article',
                                url:          article.url,
                                merchant_url: article.url
                            })
                        }
                    ]
                }
            });
        } catch { continue; }
    }

    if (!cards.length) throw new Error('No cards built');

    const msg = generateWAMessageFromContent(chatId, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body:            { text: `📡 *News Search:* ${query}\n📰 ${cards.length} articles found` },
                    footer:          { text: 'Swipe ◀️▶️ • JUNAID-MD↣³⁰² News' },
                    carouselMessage: { cards }
                }
            }
        }
    }, {});

    await sock.relayMessage(chatId, msg.message, { messageId: msg.key.id });
    return cards.length;
}

/* ─── fallback text list ────────────────────────────────────────────────── */
async function sendFallbackList(sock, chatId, articles, query, message) {
    const lines = articles.slice(0, 6).map((a, i) =>
        `${i + 1}. *${a.title}*\n` +
        `   📰 ${a.source} · 📅 ${fmtDate(a.publishedAt)}\n` +
        `   ${(a.description || '').substring(0, 80)}…\n` +
        `   🔗 ${a.url}`
    ).join('\n\n');

    await sock.sendMessage(chatId, {
        text: `📡 *News: "${query}"*\n\n${lines}`
    }, { quoted: message });
}

/* ─── command export ────────────────────────────────────────────────────── */
module.exports = {
    command:     'nssearch',
    aliases:     ['news', 'newsearch', 'gnews', 'headline'],
    category:    'search',
    description: 'Search news articles with sliding carousel (GNews / NewsAPI)',
    usage:       '.nssearch <topic>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const query  = args.join(' ').trim();

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `*📡 NEWS SEARCH v1.0*\n\n` +
                      `Usage: \`.nssearch <topic>\`\n\n` +
                      `Examples:\n` +
                      `• \`.nssearch artificial intelligence\`\n` +
                      `• \`.nssearch Pakistan economy\`\n` +
                      `• \`.nssearch crypto bitcoin\`\n\n` +
                      `*APIs:*\n` +
                      `• \`GNEWS_KEY\` — ${GNEWS_KEY ? '✅' : '❌'} (https://gnews.io)\n` +
                      `• \`NEWSAPI_KEY\` — ${NEWSAPI_KEY ? '✅' : '❌'} (https://newsapi.org)`
            }, { quoted: message });
        }

        if (!GNEWS_KEY && !NEWSAPI_KEY) {
            return sock.sendMessage(chatId, {
                text: `❌ *No news API key configured!*\n\nSet in .env:\n` +
                      `\`GNEWS_KEY=your_key\` → https://gnews.io\n` +
                      `\`NEWSAPI_KEY=your_key\` → https://newsapi.org`
            }, { quoted: message });
        }

        const react = (e) => sock.sendMessage(chatId, { react: { text: e, key: message.key } }).catch(() => {});
        await react('📰');

        const waitMsg = await sock.sendMessage(chatId,
            { text: `📡 Searching news for *"${query}"*…` }, { quoted: message });

        try {
            let articles = [];

            if (GNEWS_KEY)   articles = await fetchGNews(query).catch(() => []);
            if (!articles.length && NEWSAPI_KEY)
                articles = await fetchNewsAPI(query).catch(() => []);

            if (!articles.length) {
                await react('❌');
                await sock.sendMessage(chatId, { delete: waitMsg.key }).catch(() => {});
                return sock.sendMessage(chatId,
                    { text: `❌ No news found for *"${query}"*` }, { quoted: message });
            }

            try {
                await buildNewsCarousel(sock, chatId, articles, query);
                await react('✅');
            } catch {
                await sendFallbackList(sock, chatId, articles, query, message);
                await react('✅');
            }

            await sock.sendMessage(chatId, { delete: waitMsg.key }).catch(() => {});

        } catch (e) {
            await react('❌');
            console.error('[NSSEARCH] error:', e.message);
            await sock.sendMessage(chatId, { delete: waitMsg.key }).catch(() => {});
            await sock.sendMessage(chatId,
                { text: `❌ News search failed: ${e.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading nssearch.js:', e.message); }

/* ===== seo.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'seo',
  aliases: ['seoanalyse', 'seotools'],
  category: 'tools',
  description: 'Get full SEO analysis of a website (split into multiple messages for WhatsApp)',
  usage: '.seo <url>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let url = args?.[0]?.trim();

    if (!url) {
      return await sock.sendMessage(chatId, { text: '*Provide a website URL.*\nExample: .seo https://discardapi.dpdns.org' }, { quoted: message });
    }

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    try {
      new URL(url);
    } catch {
      return await sock.sendMessage(chatId, { text: '❌ Invalid URL provided.' }, { quoted: message });
    }

    try {
      const apiUrl = `https://discardapi.dpdns.org/api/tools/seo?apikey=guru&url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, { timeout: 10000 });

      if (!data?.status || !data.result) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to fetch SEO data.' }, { quoted: message });
      }

      const r = data.result;
      const sendSection = async (title, contentArray) => {
        if (!contentArray?.length) return;
        let text = `🔹 *${title}*\n\n`;
        contentArray.forEach(line => {
          text += `• ${line}\n`;
        });
        
        const maxLength = 6000; // safe limit for WhatsApp
        for (let i = 0; i < text.length; i += maxLength) {
          await sock.sendMessage(chatId, { text: text.slice(i, i + maxLength) }, { quoted: message });
        }
      };

      await sendSection('Overview', [
        `Domain: ${r.overview.domain}`,
        `Rank: ${r.overview.rank}`,
        `Last Updated: ${r.overview.last_updated}`
      ]);
      await sendSection('Verification', r.verification.map(v => `${v.name}: ${v.value} (${v.description})`));

      await sendSection('Metrics', r.metrics.map(m => `${m.name}: ${m.score}`));

      await sendSection('Charset', r.charset?.map(c => `${c.name}: ${c.charset} (${c.details})`));

      if (r.meta_keywords) {
        await sendSection('Meta Keywords', [
          `Count: ${r.meta_keywords.count}`,
          `Keywords: ${r.meta_keywords.keywords.join(', ')}`
        ]);
      }

      if (r.google_preview) {
        await sendSection('Google Preview', [
          `Title: ${r.google_preview.title}`,
          `URL: ${r.google_preview.url}`,
          `Description: ${r.google_preview.description}`
        ]);
      }

      if (r.page_size) {
        await sendSection('Page Size', [
          `Document Size: ${r.page_size.document_size}`,
          `Code Size: ${r.page_size.code_size}`,
          `Text Size: ${r.page_size.text_size}`,
          `Code/Text Ratio: ${r.page_size.code_ratio}`
        ]);
      }

      if (r.cards?.length) {
        await sendSection('Traffic Stats', r.cards.map(c => `${c.title} (${c.subtitle}): ${c.value}`));
      }

      if (r.speed_tips?.length) {
        await sendSection('SEO Tips', r.speed_tips.map(t => `${t.name}: ${t.details}`));
      }

      if (r.broken_links?.length) {
        await sendSection('Broken Links', r.broken_links.map(l => `${l.text} (${l.url}) Status: ${l.status}`));
      }

      if (r.domain_available?.length) {
        await sendSection('Domain Availability', r.domain_available.map(d => `${d.domain}: ${d.status}`));
      }

      if (r.information_server?.header_text) {
        await sendSection('Server Info', [`Headers: ${r.information_server.header_text}`]);
      }

    } catch (error) {
      console.error('SEO plugin error:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { text: '❌ Request timed out. The API may be slow or unreachable.' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch SEO information.' }, { quoted: message });
      }
    }
  }
};


/*
const axios = require('axios');

module.exports = {
  command: 'seo',
  aliases: ['seoanalyse', 'seotools'],
  category: 'tools',
  description: 'Get full SEO analysis of a website',
  usage: '.seo <url>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let url = args?.[0]?.trim();

    if (!url) {
      return await sock.sendMessage(chatId, { text: '*Provide a website URL.*\nExample: .seo https://discardapi.dpdns.org' }, { quoted: message });
    }

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    try {
      new URL(url);
    } catch {
      return await sock.sendMessage(chatId, { text: '❌ Invalid URL provided.' }, { quoted: message });
    }

    try {
      const apiUrl = `https://discardapi.dpdns.org/api/tools/seo?apikey=guru&url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, { timeout: 10000 });

      if (!data?.status || !data.result) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to fetch SEO data.' }, { quoted: message });
      }

      const r = data.result;

      let text = `🔍 *Full SEO Report*\n\n`;

      text += `🌐 *Overview*\n`;
      text += `• Domain: ${r.overview.domain}\n`;
      text += `• Rank: ${r.overview.rank}\n`;
      text += `• Last Updated: ${r.overview.last_updated}\n\n`;

      text += `✅ *Verification*\n`;
      r.verification.forEach(v => {
        text += `• ${v.name}: ${v.value} (${v.description})\n`;
      });
      text += `\n`;

      text += `📊 *Metrics*\n`;
      r.metrics.forEach(m => {
        text += `• ${m.name}: ${m.score}\n`;
      });
      text += `\n`;

      if (r.charset?.length) {
        text += `🔤 *Charset*\n`;
        r.charset.forEach(c => {
          text += `• ${c.name}: ${c.charset} (${c.details})\n`;
        });
        text += `\n`;
      }

      if (r.meta_keywords) {
        text += `🏷️ *Meta Keywords* (${r.meta_keywords.count})\n`;
        text += `• ${r.meta_keywords.keywords.join(', ')}\n\n`;
      }

      if (r.google_preview) {
        text += `🔎 *Google Preview*\n`;
        text += `• Title: ${r.google_preview.title}\n`;
        text += `• URL: ${r.google_preview.url}\n`;
        text += `• Description: ${r.google_preview.description}\n\n`;
      }

      if (r.page_size) {
        text += `📄 *Page Size*\n`;
        text += `• Document Size: ${r.page_size.document_size}\n`;
        text += `• Code Size: ${r.page_size.code_size}\n`;
        text += `• Text Size: ${r.page_size.text_size}\n`;
        text += `• Code/Text Ratio: ${r.page_size.code_ratio}\n\n`;
      }

      if (r.cards?.length) {
        text += `📈 *Traffic Stats*\n`;
        r.cards.forEach(c => {
          text += `• ${c.title} (${c.subtitle}): ${c.value}\n`;
        });
        text += `\n`;
      }

      if (r.speed_tips?.length) {
        text += `⚡ *SEO Tips*\n`;
        r.speed_tips.forEach(t => {
          text += `• ${t.name}: ${t.details}\n`;
        });
        text += `\n`;
      }

      if (r.broken_links?.length) {
        text += `🔗 *Broken Links*\n`;
        r.broken_links.forEach(l => {
          text += `• ${l.text} (${l.url}) Status: ${l.status}\n`;
        });
        text += `\n`;
      }

      if (r.domain_available?.length) {
        text += `🌐 *Domain Availability*\n`;
        r.domain_available.forEach(d => {
          text += `• ${d.domain}: ${d.status}\n`;
        });
        text += `\n`;
      }

      if (r.information_server?.header_text) {
        text += `🖥️ *Server Info*\n`;
        text += `• Headers: ${r.information_server.header_text}\n`;
      }

      await sock.sendMessage(chatId, { text }, { quoted: message });

    } catch (error) {
      console.error('SEO plugin error:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { text: '❌ Request timed out. The API may be slow or unreachable.' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch SEO information.' }, { quoted: message });
      }
    }
  }
};
   */   

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading seo.js:', e.message); }

/* ===== momo.js ===== */
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

const MOMO_DATA = {
    mtn: {
        name: 'MTN Mobile Money (MoMo)',
        countries: ['Ghana 🇬🇭', 'Uganda 🇺🇬', 'Rwanda 🇷🇼', 'Cameroon 🇨🇲', 'Ivory Coast 🇨🇮',
                    'Zambia 🇿🇲', 'Benin 🇧🇯', 'South Africa 🇿🇦', 'Nigeria 🇳🇬', 'Congo 🇨🇬'],
        ussd: {
            'Ghana': '*170#',
            'Uganda': '*165#',
            'Rwanda': '*182#',
            'Cameroon': '*126#',
            'Nigeria': '*671#',
            'Zambia': '*303#',
        },
        shortcodes: {
            'Ghana': '1-300',
            'Uganda': '165',
            'Rwanda': '182',
        },
        features: [
            'Send & receive money',
            'Buy airtime & data',
            'Pay bills (electricity, water, TV)',
            'Bank transfers',
            'International transfers',
            'Merchant payments',
            'Savings & loans',
            'Insurance',
        ],
        website: 'mtn.com/momo',
        helpline: {
            'Ghana': '100',
            'Uganda': '100',
            'Rwanda': '100',
            'Nigeria': '180',
        }
    },
    airtel: {
        name: 'Airtel Money',
        countries: ['Kenya 🇰🇪', 'Tanzania 🇹🇿', 'Uganda 🇺🇬', 'Rwanda 🇷🇼', 'Zambia 🇿🇲',
                    'Malawi 🇲🇼', 'Madagascar 🇲🇬', 'Niger 🇳🇪', 'Congo DR 🇨🇩', 'Seychelles 🇸🇨'],
        ussd: {
            'Kenya': '*334#',
            'Tanzania': '*150*60#',
            'Uganda': '*185#',
            'Rwanda': '*171#',
            'Zambia': '*778#',
            'Malawi': '*121#',
        },
        shortcodes: {
            'Kenya': '334',
            'Tanzania': '150',
            'Uganda': '185',
        },
        features: [
            'Send & receive money',
            'Buy airtime & data',
            'Pay bills',
            'Bank to Airtel Money',
            'Airtel Money to bank',
            'International remittance',
            'Merchant payments',
        ],
        website: 'airtel.com/airtelmoney',
        helpline: {
            'Kenya': '100',
            'Tanzania': '100',
            'Uganda': '100',
        }
    },
    mpesa: {
        name: 'M-Pesa',
        countries: ['Kenya 🇰🇪', 'Tanzania 🇹🇿', 'Mozambique 🇲🇿', 'DRC 🇨🇩',
                    'Lesotho 🇱🇸', 'Ghana 🇬🇭', 'Egypt 🇪🇬', 'Ethiopia 🇪🇹'],
        ussd: {
            'Kenya': '*334# or *737#',
            'Tanzania': '*150*00#',
            'Mozambique': '*150*5#',
            'Ghana': '*500#',
            'Egypt': '*9#',
        },
        shortcodes: {
            'Kenya': '737 / 334',
            'Tanzania': '150',
        },
        features: [
            'Send money (Lipa na M-Pesa)',
            'Withdraw at agents',
            'Buy airtime',
            'Pay bills & merchants',
            'M-Shwari savings & loans',
            'KCB M-Pesa loans',
            'International transfers (WorldRemit, Western Union)',
            'Pay with QR code',
            'M-Pesa App',
        ],
        website: 'safaricom.co.ke/mpesa',
        helpline: {
            'Kenya': '234',
            'Tanzania': '100',
        }
    },
    orange: {
        name: 'Orange Money',
        countries: ['Senegal 🇸🇳', 'Mali 🇲🇱', 'Cameroon 🇨🇲', 'Ivory Coast 🇨🇮',
                    'Burkina Faso 🇧🇫', 'Guinea 🇬🇳', 'Madagascar 🇲🇬', 'Tunisia 🇹🇳'],
        ussd: {
            'Senegal': '#144#',
            'Mali': '#144#',
            'Cameroon': '#150#',
            'Ivory Coast': '#144#',
        },
        shortcodes: { 'Senegal': '144' },
        features: [
            'Send & receive money',
            'Buy airtime',
            'Pay bills',
            'Orange Bank transfers',
            'International transfers',
        ],
        website: 'orange.com/orangemoney',
        helpline: { 'Senegal': '888', 'Mali': '888' }
    },
    wave: {
        name: 'Wave Mobile Money',
        countries: ['Senegal 🇸🇳', 'Ivory Coast 🇨🇮', 'Mali 🇲🇱', 'Burkina Faso 🇧🇫',
                    'Guinea 🇬🇳', 'Uganda 🇺🇬', 'Gambia 🇬🇲'],
        ussd: {
            'Senegal': '*999#',
            'Ivory Coast': '*999#',
        },
        shortcodes: {},
        features: [
            'Zero fees on transfers (between Wave users)',
            'Send & receive money',
            'Pay merchants',
            'Buy airtime',
            'Cash in/out at agents',
            'Wave App (iOS & Android)',
        ],
        website: 'wave.com',
        helpline: { 'Senegal': '33 889 05 55' }
    },
};

module.exports = {
    command: 'momo',
    aliases: ['mobilemoney', 'mpesa', 'airtelmoney', 'mtnmomo', 'wave'],
    category: 'info',
    description: 'Mobile Money info for African networks (MTN, Airtel, M-Pesa, Wave, Orange)',
    usage: '.momo mtn\n.momo mpesa\n.momo airtel',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const userMessage = context.userMessage || '';

        let query = args[0]?.toLowerCase() || '';
        if (userMessage.includes('mpesa')) query = 'mpesa';
        else if (userMessage.includes('airtelmoney')) query = 'airtel';
        else if (userMessage.includes('mtnmomo')) query = 'mtn';
        else if (userMessage.includes('wave')) query = 'wave';

        if (!query) {
            const list = Object.entries(MOMO_DATA).map(([k, v]) =>
                `• \`.momo ${k}\` — ${v.name}`
            ).join('\n');

            return await sock.sendMessage(chatId, {
                text: `📡 *Mobile Money Info*\n\n` +
                      `*Available networks:*\n${list}\n\n` +
                      `*Examples:*\n` +
                      `\`.momo mtn\`\n` +
                      `\`.momo mpesa\`\n` +
                      `\`.momo airtel\``,
                ...channelInfo
            }, { quoted: message });
        }

        const key = Object.keys(MOMO_DATA).find(k =>
            query.includes(k) || k.includes(query) ||
            MOMO_DATA[k].name.toLowerCase().includes(query)
        );

        if (!key) {
            return await sock.sendMessage(chatId, {
                text: `❌ Unknown network: *${query}*\n\nAvailable: ${Object.keys(MOMO_DATA).join(', ')}`,
                ...channelInfo
            }, { quoted: message });
        }

        const m = MOMO_DATA[key];
        const ussdList = Object.entries(m.ussd).map(([c, u]) => `• ${c}: \`${u}\``).join('\n');
        const helpList = Object.entries(m.helpline).map(([c, h]) => `• ${c}: ${h}`).join('\n');
        const featureList = m.features.map(f => `✅ ${f}`).join('\n');

        await sock.sendMessage(chatId, {
            text: `📡 *${m.name}*\n\n` +
                  `🌍 *Available in:*\n${m.countries.join(', ')}\n\n` +
                  `📲 *USSD Codes:*\n${ussdList}\n\n` +
                  `⚡ *Features:*\n${featureList}\n\n` +
                  (helpList ? `📞 *Helpline:*\n${helpList}\n\n` : '') +
                  `🌐 *Website:* ${m.website}`,
            ...channelInfo
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
} catch(e) { console.warn('[BUNDLE:cat-12-tools] Error loading momo.js:', e.message); }

module.exports = _bundle;