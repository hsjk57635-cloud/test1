'use strict';
// AUTO-GENERATED BUNDLE: cat-17-profile
// Contains: setpp.js, setbio.js, setdp.js, privacy.js, stealth.js, setgpp.js, setgname.js, setgdesc.js, setcmd.js, delcmd.js, description.js

const _bundle = [];


/* ===== setpp.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const isOwnerOrSudo = require('../lib/isOwner');

module.exports = {
  command: 'setpp',
  aliases: ['setppic', 'setdp'],
  category: 'owner',
  description: 'Set or update the bot profile picture (owner only)',
  usage: '.setpp (reply to an image)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const senderId = message.key.participant || message.key.remoteJid;
      const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

      if (!message.key.fromMe && !isOwner) {
        await sock.sendMessage(chatId, { 
          text: '*This command is only available for the owner!*' 
        }, { quoted: message });
        return;
      }
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMessage) {
        await sock.sendMessage(chatId, { 
          text: '⚠️ Please reply to an image with the .setpp command!' 
        }, { quoted: message });
        return;
      }
      const imageMessage = quotedMessage.imageMessage || quotedMessage.stickerMessage;
      if (!imageMessage) {
        await sock.sendMessage(chatId, { 
          text: '*The replied message must contain an image!*' 
        }, { quoted: message });
        return;
      }
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const stream = await downloadContentFromMessage(imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const imagePath = path.join(tmpDir, `profile_${Date.now()}.jpg`);
      fs.writeFileSync(imagePath, buffer);

      await sock.updateProfilePicture(sock.user.id, { url: imagePath });
      fs.unlinkSync(imagePath);

      await sock.sendMessage(chatId, { 
        text: '✅ Successfully updated bot profile picture!' 
      }, { quoted: message });

    } catch (error) {
      console.error('SetPP Command Error:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ Failed to update profile picture!' 
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
} catch(e) { console.warn('[BUNDLE:cat-17-profile] Error loading setpp.js:', e.message); }

/* ===== setbio.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    'use strict';
/*****************************************************************************
 *  setbio.js — AI-POWERED AUTOBIO ULTRA v2.0 — JUNAID-MD↣³⁰²                  *
 *  ✅ AI bio generation (RedxAI multi-model fallback)                        *
 *  ✅ Custom interval (any minute value)                                     *
 *  ✅ Quote library (Islamic / Motivational / Pickup)                        *
 *  ✅ Heavy stylish emoji formatting                                         *
 *****************************************************************************/

const store  = require('../lib/lightweight_store');
const axios  = require('axios');
const config = require('../config');

const BOT_NAME   = process.env.BOT_NAME   || config.BOT_NAME   || 'JUNAID-MD↣³⁰²';
const OWNER_NAME = process.env.OWNER_NAME || config.OWNER_NAME || 'JUNAID-MD↣³⁰²';

const QUOTE_URLS = [
  'https://raw.githubusercontent.com/AbdulRehman19721986/Islamic-Database/main/text/random_quotes.txt',
  'https://raw.githubusercontent.com/AbdulRehman19721986/Islamic-Database/main/text/motivational_quotes.txt',
  'https://raw.githubusercontent.com/AbdulRehman19721986/Islamic-Database/main/text/pickup_quotes.txt',
];

// ── AI endpoints (same pattern as redxai.js) ─────────────────────────────────
const DELINE = 'https://api.deline.web.id/ai';
const SAQIB  = 'https://apisaqib.vercel.app/api/v1';

async function generateAIBio(mood = '') {
  const prompt = `Generate a creative, short WhatsApp bio/about status${mood ? ` with a ${mood} tone` : ''}. ` +
    `It should be inspiring, clever, and under 130 characters. ` +
    `Do NOT use quotes around it. Just the bio text only. No explanation.`;
  const encoded = encodeURIComponent(prompt);
  const apis = [
    { url: `${DELINE}/copilot-think?text=${encoded}`, ext: d => d?.result?.text },
    { url: `${DELINE}/copilot?text=${encoded}`,       ext: d => d?.result },
    { url: `${SAQIB}/1027?text=${encoded}`,           ext: null },
    { url: `${SAQIB}/1026?query=${encoded}`,          ext: null },
  ];
  for (const a of apis) {
    try {
      const { data } = await axios.get(a.url, { timeout: 15000 });
      const ans = a.ext ? a.ext(data) :
        (data?.result?.text || data?.result || data?.answer ||
         data?.response || data?.reply || data?.message);
      if (ans && typeof ans === 'string' && ans.trim().length > 5) {
        return ans.trim().substring(0, 139);
      }
    } catch {}
  }
  return null;
}

// ── Quote cache ───────────────────────────────────────────────────────────────
let cachedQuotes = [], lastFetch = 0;
const CACHE_DUR  = 3600 * 1000;

async function fetchQuotes() {
  if (cachedQuotes.length && Date.now() - lastFetch < CACHE_DUR) return cachedQuotes;
  const all = [];
  for (const url of QUOTE_URLS) {
    try {
      const { data } = await axios.get(url, { timeout: 15000 });
      all.push(...data.split('\n').map(l => l.trim()).filter(l => l.length > 10));
    } catch {}
  }
  if (!all.length) return [
    '💎 Be the energy you want to attract.',
    '🌟 Work hard in silence. Let success make the noise.',
    '🚀 Dream it. Believe it. Achieve it.',
    '✨ Your vibe attracts your tribe.',
    '🎯 Focus on your goals, not the obstacles.',
  ];
  cachedQuotes = all;
  lastFetch    = Date.now();
  return all;
}

function randomQuote(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Bio update logic ──────────────────────────────────────────────────────────
async function updateAutoBio(sock) {
  try {
    const s = await store.getSetting('global', 'autoBio');
    if (!s?.enabled) return;

    let bio;
    if (s.aiMode) {
      // AI-generated bio
      const ai = await generateAIBio(s.aiMood || '');
      bio = ai || randomQuote(await fetchQuotes());
    } else if (s.customBio) {
      const q = randomQuote(await fetchQuotes());
      bio = s.customBio.replace('{quote}', q);
    } else {
      bio = randomQuote(await fetchQuotes());
    }

    if (bio.length > 139) bio = bio.substring(0, 136) + '...';
    await sock.updateProfileStatus(bio);
  } catch (e) {
    console.error('[AutoBio] update error:', e.message);
  }
}

let bioCronJob = null;

function startAutoBio(sock, intervalMin = 10) {
  stopAutoBio();
  const ms = Math.max(1, intervalMin) * 60 * 1000;
  updateAutoBio(sock); // run immediately
  bioCronJob = setInterval(() => updateAutoBio(sock), ms);
  console.log(`[AutoBio] Started — every ${intervalMin} min`);
}

function stopAutoBio() {
  if (bioCronJob) { clearInterval(bioCronJob); bioCronJob = null; }
}

// ── COMMAND HANDLER ───────────────────────────────────────────────────────────
module.exports = {
  command: 'setbio',
  aliases: ['autobio', 'bio'],
  category: 'owner',
  description: '🤖 AI-powered auto-bio with custom scheduling',
  usage: '.setbio <on|off|set|reset|ai|interval|mood|preview|status>',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const action = args[0]?.toLowerCase();

    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });

    const s = await store.getSetting('global', 'autoBio') ||
      { enabled: false, customBio: null, aiMode: false, aiMood: '', intervalMin: 10 };

    // ── Status (no args) ─────────────────────────────────────────────────────
    if (!action) {
      const quotes = await fetchQuotes();
      return reply(
`╔═══════════════════════════════════╗
║  🤖 *AUTO BIO — ULTRA v2.0*        ║
╚═══════════════════════════════════╝

📊 *Status:*    ${s.enabled  ? '🟢 Active'   : '🔴 Inactive'}
🧠 *AI Mode:*   ${s.aiMode   ? '🟢 Enabled'  : '🔴 Disabled'}
😊 *AI Mood:*   ${s.aiMood   || 'neutral'}
⏱️  *Interval:* Every ${s.intervalMin || 10} minute(s)
📝 *Custom Bio:* ${s.customBio ? 'Set ✅' : 'Not set'}
📚 *Quotes:*    ${quotes.length} loaded

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 \`.setbio on\`              — Enable
🔴 \`.setbio off\`             — Disable
🧠 \`.setbio ai on\`           — Use AI to generate bio
🧠 \`.setbio ai off\`          — Use quotes instead
😊 \`.setbio mood <mood>\`     — Set AI mood (happy/sad/funny/pro)
⏱️  \`.setbio interval <min>\` — Set update interval
📝 \`.setbio set <text>\`      — Set custom bio template
🔄 \`.setbio reset\`           — Reset to default
👁️  \`.setbio preview\`        — Preview next bio
📊 \`.setbio status\`          — Show this panel

> 🤖 *${BOT_NAME} AutoBio — Powered by AI*`
      );
    }

    // ── on ───────────────────────────────────────────────────────────────────
    if (action === 'on') {
      if (s.enabled) return reply('⚠️ *AutoBio is already enabled!*');
      s.enabled = true;
      await store.saveSetting('global', 'autoBio', s);
      startAutoBio(sock, s.intervalMin || 10);
      return reply(
`╔═══════════════════════════════╗
║  🟢 *AUTOBIO ENABLED!*          ║
╚═══════════════════════════════╝

✅ *Auto bio is now ACTIVE*
🧠 *Mode:*     ${s.aiMode ? 'AI Generation' : 'Quote Library'}
⏱️  *Updates:*  Every ${s.intervalMin || 10} min
😊 *Mood:*     ${s.aiMood || 'neutral'}

💡 Use \`.setbio ai on\` for AI-generated bios
> 🤖 *${BOT_NAME} AutoBio Active*`
      );
    }

    // ── off ──────────────────────────────────────────────────────────────────
    if (action === 'off') {
      if (!s.enabled) return reply('⚠️ *AutoBio is already disabled!*');
      s.enabled = false;
      await store.saveSetting('global', 'autoBio', s);
      stopAutoBio();
      return reply(
`╔══════════════════════════════╗
║  🔴 *AUTOBIO DISABLED*        ║
╚══════════════════════════════╝

❌ *Auto bio is now INACTIVE*
💡 Use \`.setbio on\` to re-enable

> 🔴 *${BOT_NAME} AutoBio Stopped*`
      );
    }

    // ── ai on/off ─────────────────────────────────────────────────────────────
    if (action === 'ai') {
      const sub = args[1]?.toLowerCase();
      if (!sub || !['on', 'off'].includes(sub)) {
        return reply('❌ *Usage:* `.setbio ai on` or `.setbio ai off`');
      }
      s.aiMode = sub === 'on';
      await store.saveSetting('global', 'autoBio', s);
      return reply(
`╔════════════════════════════╗
║  🧠 *AI MODE ${sub === 'on' ? 'ENABLED' : 'DISABLED'}*      ║
╚════════════════════════════╝

${sub === 'on' ? '🧠 *Bio will be generated by AI*' : '📚 *Bio will use quote library*'}
😊 *Current mood:* ${s.aiMood || 'neutral'}
💡 Set mood with \`.setbio mood happy\`

> 🧠 *AI Bio Mode ${sub === 'on' ? 'Active' : 'Inactive'}*`
      );
    }

    // ── mood ─────────────────────────────────────────────────────────────────
    if (action === 'mood') {
      const mood = args.slice(1).join(' ').trim();
      if (!mood) return reply('❌ *Usage:* `.setbio mood happy` (happy/sad/funny/professional/motivational)');
      s.aiMood = mood;
      await store.saveSetting('global', 'autoBio', s);
      return reply(
`╔═══════════════════════════╗
║  😊 *AI MOOD SET*           ║
╚═══════════════════════════╝

✅ *AI Mood:* \`${mood}\`
🧠 *Next bio will reflect this mood*

> 😊 *Mood saved — AI will adapt*`
      );
    }

    // ── interval ─────────────────────────────────────────────────────────────
    if (action === 'interval') {
      const min = parseInt(args[1]);
      if (!min || min < 1) return reply('❌ *Usage:* `.setbio interval <minutes>` (min: 1)');
      s.intervalMin = min;
      await store.saveSetting('global', 'autoBio', s);
      if (s.enabled) startAutoBio(sock, min);
      return reply(
`╔══════════════════════════════╗
║  ⏱️  *INTERVAL UPDATED*       ║
╚══════════════════════════════╝

✅ *New interval:* Every ${min} minute(s)
📊 *Status:* ${s.enabled ? '🟢 Active' : '🔴 Inactive (enable first)'}

> ⏱️ *Bio will update every ${min} min*`
      );
    }

    // ── set custom bio ────────────────────────────────────────────────────────
    if (action === 'set') {
      let text = args.slice(1).join(' ').trim();
      if (!text) {
        const q = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        text = q?.conversation || q?.extendedTextMessage?.text || '';
      }
      if (!text) return reply('❌ *Provide bio text.* Use `{quote}` for random quotes.\n*Example:* `.setbio set Hello World {quote}`');
      s.customBio = text;
      await store.saveSetting('global', 'autoBio', s);
      if (s.enabled) await updateAutoBio(sock);
      return reply(
`╔════════════════════════════════╗
║  📝 *CUSTOM BIO SET*            ║
╚════════════════════════════════╝

✅ *Your bio template:*
${text}

💡 \`{quote}\` = replaced with random quote
${s.enabled ? '🔄 *Bio updated now!*' : '⚠️ Enable with \`.setbio on\`'}

> 📝 *Template saved successfully*`
      );
    }

    // ── reset ─────────────────────────────────────────────────────────────────
    if (action === 'reset') {
      s.customBio = null;
      s.aiMood    = '';
      s.aiMode    = false;
      await store.saveSetting('global', 'autoBio', s);
      return reply(
`╔══════════════════════════════╗
║  🔄 *BIO RESET*               ║
╚══════════════════════════════╝

✅ *Reset to default settings*
📚 *Mode:* Quote Library
😊 *Mood:* Neutral

> 🔄 *All customizations cleared*`
      );
    }

    // ── preview ───────────────────────────────────────────────────────────────
    if (action === 'preview') {
      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });
      let bio;
      if (s.aiMode) {
        bio = await generateAIBio(s.aiMood || '');
        if (!bio) bio = randomQuote(await fetchQuotes());
      } else if (s.customBio) {
        bio = s.customBio.replace('{quote}', randomQuote(await fetchQuotes()));
      } else {
        bio = randomQuote(await fetchQuotes());
      }
      return reply(
`╔══════════════════════════════╗
║  👁️  *BIO PREVIEW*            ║
╚══════════════════════════════╝

📝 *Next bio will be:*

"${bio.substring(0, 139)}"

🧠 *Source:* ${s.aiMode ? 'AI Generated' : 'Quote Library'}
> 👁️ *This is just a preview — not applied yet*`
      );
    }

    return reply('❌ *Unknown action.* Use `.setbio` to see all options.');
  },

  startAutoBio,
  stopAutoBio,
  updateAutoBio,
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-17-profile] Error loading setbio.js:', e.message); }

/* ===== setdp.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const store = require('../lib/lightweight_store');
const settings = require('../settings');

module.exports = {
    command: 'setdp',
    aliases: ['setbotdp', 'fulldp'],
    category: 'owner',
    description: 'Change bot profile picture (owner only)',
    usage: '.setdp <image url>  OR  reply to an image with .setdp',
    ownerOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        let imageBuffer = null;
        let imageUrl = null;

        // Case 1: User replied to an image
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedMsg?.imageMessage) {
            try {
                imageBuffer = await downloadMediaMessage(
                    { 
                        key: { 
                            id: message.message.extendedTextMessage.contextInfo.stanzaId,
                            remoteJid: message.key.remoteJid,
                            fromMe: false
                        },
                        message: quotedMsg 
                    },
                    'buffer',
                    {}
                );
            } catch (e) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Failed to download image: ${e.message}`,
                    ...channelInfo
                }, { quoted: message });
            }
        }
        // Case 2: URL provided
        else if (args.length > 0) {
            const url = args[0].trim();
            if (!/^https?:\/\//i.test(url)) {
                return await sock.sendMessage(chatId, {
                    text: '❌ Invalid URL.',
                    ...channelInfo
                }, { quoted: message });
            }
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                imageBuffer = Buffer.from(response.data, 'binary');
                imageUrl = url;
            } catch (e) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Failed to download from URL: ${e.message}`,
                    ...channelInfo
                }, { quoted: message });
            }
        } else {
            return await sock.sendMessage(chatId, {
                text: '❌ Please provide an image URL or reply to an image.\n\nUsage:\n`.setdp https://example.com/image.jpg`\nor reply to an image with `.setdp`',
                ...channelInfo
            }, { quoted: message });
        }

        try {
            // Update bot's profile picture
            await sock.updateProfilePicture(sock.user.id, imageBuffer);
            
            // Save URL to DB and update settings
            if (imageUrl) {
                await store.saveSetting('global', 'botDp', imageUrl);
                settings.botDp = imageUrl;
            } else {
                await store.saveSetting('global', 'botDp', 'uploaded via image');
                // Keep existing URL? We'll leave as is.
            }

            await sock.sendMessage(chatId, {
                text: '✅ Bot profile picture updated successfully!',
                ...channelInfo
            }, { quoted: message });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Failed to update DP: ${error.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-17-profile] Error loading setdp.js:', e.message); }

/* ===== privacy.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *  🔗  Telegram : https://t.me/Hamza302bot                              *
 *                                                                           *
 *    © 2026 Abdul JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

module.exports = {
    command: 'privacy',
    aliases: ['setprivacy', 'pvcy', 'pri'],
    category: 'menu',
    description: 'Manage all WhatsApp privacy settings, block/unblock users',
    usage: '.privacy — show menu',
    ownerOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const setting = args[0]?.toLowerCase();
        const value = args[1]?.toLowerCase();

        if (!setting) {
            return await sock.sendMessage(chatId, {
                text:
                    `╔══════════════╗\n` +
                    `║🔒*PRIVACY SETTING*║\n` +
                    `╚══════════════╝\n` +
                    `📌 *Usage:* \`.pvcy <set> <val>\`\n\n` +
                    `────────────────────\n` +
                    `*⚙️ PRIVACY CONTROLS*\n\n` +
                    `👁️ *lastseen* — \`all\` \`contacts\` \`blacklist\` \`none\`\n\n` +
                    `🟢 *online* — \`all\` \`match_last_seen\`\n\n` +
                    `🖼️ *profile* — \`all\` \`contacts\` \`blacklist\` \`none\`\n\n` +
                    `📊 *status* — \`all\` \`contacts\` \`blacklist\` \`none\`\n\n` +
                    `✅ *receipts* — \`all\` \`none\`\n\n` +
                    `👥 *groups* — \`all\` \`contacts\` \`blacklist\`\n\n` +
                    `⏳ *timer* — \`off\` \`24h\` \`7d\` \`90d\`\n\n` +
                    `*🚫 BLOCK CONTROLS*\n\n` +
                    `🔴 *block* — \`<number>\` or reply to msg\n\n` +
                    `🟢 *unblock* — \`<number>\` or reply to msg\n\n` +
                    `📋 *blocklist* — view blocked users\n\n` +
                    `*📊 INFO*\n` +
                    `🔍 *status* — view privacy settings\n` +
                    `────────────────────\n\n` +
                    `💡 *Examples:*\n` +
                    `› \`.privacy lastseen all\`\n\n` +
                    `› \`.privacy receipts none\`\n\n` +
                    `› \`.privacy timer 7d\`\n\n` +
                    `› \`.privacy block \`\n\n` +
                    `› \`.privacy blocklist\`\n\n` +
                    `› \`.privacy status\``,
                ...channelInfo
            }, { quoted: message });
        }

        if (setting === 'status') {
            try {
                const s = await sock.fetchPrivacySettings(true);
                const fmt = (v) => v ? `\`${v}\`` : `\`unknown\``;
                return await sock.sendMessage(chatId, {
                    text:
                        `╔═══════════════╗\n` +
                        `║🔒*CURRENT PRIVACY*║\n` +
                        `╚═══════════════╝\n\n` +
                        `👁️ *Last Seen:* ${fmt(s.last)}\n\n` +
                        `🟢 *Online:* ${fmt(s.online)}\n\n` +
                        `🖼️ *Profile Pic:* ${fmt(s.profile)}\n\n` +
                        `📊 *Status:* ${fmt(s.status)}\n\n` +
                        `✅ *Read Receipts:* ${fmt(s.readreceipts)}\n\n` +
                        `👥 *Groups Add:* ${fmt(s.groupadd)}\n\n` +
                        `_Use \`.pvcy <set> <value>\` to change_`,
                    ...channelInfo
                }, { quoted: message });
            } catch (e) {
                return await sock.sendMessage(chatId, { text: `❌ Failed to fetch settings: ${e.message}`, ...channelInfo }, { quoted: message });
            }
        }

        if (setting === 'blocklist') {
            try {
                const list = await sock.fetchBlocklist();
                if (!list || list.length === 0) {
                    return await sock.sendMessage(chatId, { text: `📋 *Block List*\n\n_No blocked users._`, ...channelInfo }, { quoted: message });
                }
                const entries = list.map((jid, i) => `${i + 1}. +${jid.split('@')[0]}`).join('\n');
                return await sock.sendMessage(chatId, {
                    text:
                        `╔═════════════╗\n` +
                        `║🚫 *BLOCK LIST*   ║\n` +
                        `╚═════════════╝\n\n` +
                        `${entries}\n\n` +
                        `────────────────────\n` +
                        `*Total:* ${list.length} blocked user(s)`,
                    ...channelInfo
                }, { quoted: message });
            } catch (e) {
                return await sock.sendMessage(chatId, { text: `❌ Failed to fetch block list: ${e.message}`, ...channelInfo }, { quoted: message });
            }
        }

        if (setting === 'block' || setting === 'unblock') {
            let targetJid = null;

            const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;
            if (quotedParticipant) {
                const num = quotedParticipant.split('@')[0].split(':')[0];
                targetJid = `${num}@s.whatsapp.net`;
            }

            if (!targetJid && value) {
                const num = value.replace(/[^0-9]/g, '');
                if (num.length >= 7) targetJid = `${num}@s.whatsapp.net`;
            }

            if (!targetJid && !chatId.endsWith('@g.us')) {
                targetJid = chatId;
            }

            if (!targetJid) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Provide a number or reply to a message.\n\nExample: \`.privacy block \``,
                    ...channelInfo
                }, { quoted: message });
            }

            try {
                await sock.updateBlockStatus(targetJid, setting);
                const icon = setting === 'block' ? '🚫' : '✅';
                const action = setting === 'block' ? 'Blocked' : 'Unblocked';
                return await sock.sendMessage(chatId, {
                    text: `${icon} *${action}* +${targetJid.split('@')[0]}`,
                    ...channelInfo
                }, { quoted: message });
            } catch (e) {
                return await sock.sendMessage(chatId, { text: `❌ Failed to ${setting}: ${e.message}`, ...channelInfo }, { quoted: message });
            }
        }

        if (setting === 'timer') {
            const durations = {
                'off': 0, '0': 0,
                '24h': 86400, '1d': 86400,
                '7d': 604800, '1w': 604800,
                '90d': 7776000, '3m': 7776000,
            };
            if (!value || !(value in durations)) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Choose: \`off\` \`24h\` \`7d\` \`90d\`\n\nExample: \`.privacy timer 7d\``,
                    ...channelInfo
                }, { quoted: message });
            }
            try {
                await sock.updateDefaultDisappearingMode(durations[value]);
                const label = value === 'off' || value === '0' ? 'disabled' : `set to *${value}*`;
                return await sock.sendMessage(chatId, { text: `⏳ Default disappearing timer ${label}`, ...channelInfo }, { quoted: message });
            } catch (e) {
                return await sock.sendMessage(chatId, { text: `❌ Failed to set timer: ${e.message}`, ...channelInfo }, { quoted: message });
            }
        }

        const privacySettings = {
            lastseen: { fn: (v) => sock.updateLastSeenPrivacy(v),        allowed: ['all', 'contacts', 'contact_blacklist', 'blacklist', 'none'], label: 'Last Seen' },
            online:   { fn: (v) => sock.updateOnlinePrivacy(v),          allowed: ['all', 'match_last_seen'],                                    label: 'Online Status' },
            profile:  { fn: (v) => sock.updateProfilePicturePrivacy(v),  allowed: ['all', 'contacts', 'contact_blacklist', 'blacklist', 'none'], label: 'Profile Picture' },
            status:   { fn: (v) => sock.updateStatusPrivacy(v),          allowed: ['all', 'contacts', 'contact_blacklist', 'blacklist', 'none'], label: 'Status' },
            receipts: { fn: (v) => sock.updateReadReceiptsPrivacy(v),    allowed: ['all', 'none'],                                               label: 'Read Receipts' },
            groups:   { fn: (v) => sock.updateGroupsAddPrivacy(v),       allowed: ['all', 'contacts', 'contact_blacklist', 'blacklist'],         label: 'Groups Add' },
        };

        const config = privacySettings[setting];
        if (!config) {
            return await sock.sendMessage(chatId, {
                text: `❌ Unknown option: *${setting}*\n\nUse \`.privacy\` to see all commands.`,
                ...channelInfo
            }, { quoted: message });
        }

        if (!value || !config.allowed.includes(value)) {
            return await sock.sendMessage(chatId, {
                text: `❌ Invalid value for *${setting}*\n\nAllowed: ${config.allowed.filter(v => v !== 'contact_blacklist').map(v => `\`${v}\``).join(' ')}`,
                ...channelInfo
            }, { quoted: message });
        }

        const resolvedValue = value === 'blacklist' ? 'contact_blacklist' : value;

        try {
            await config.fn(resolvedValue);
            return await sock.sendMessage(chatId, {
                text: `✅ *${config.label}* set to \`${value}\``,
                ...channelInfo
            }, { quoted: message });
        } catch (e) {
            console.error('[PRIVACY] Error:', e.message);
            return await sock.sendMessage(chatId, {
                text: `❌ Failed to update ${config.label}: ${e.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-17-profile] Error loading privacy.js:', e.message); }

/* ===== stealth.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const store = require('../lib/lightweight_store');

module.exports = {
    command: 'stealth',
    aliases: ['alwaysonline', 'stealthmode'],
    category: 'owner',
    description: 'Toggle online status - bot will not send presence updates if off',
    usage: '.stealth <on|off>',
    ownerOnly: 'true',

    async handler(sock, message, args, context = {}) {
        const { chatId } = context;
        
        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off'].includes(action)) {
            const currentState = await store.getSetting('global', 'stealthMode');
            const status = currentState?.enabled ? 'ON' : 'OFF';
            
            let autotypingWarning = '';
            try {
                const autotypingState = await store.getSetting('global', 'autotyping');
                if (autotypingState?.enabled && currentState?.enabled) {
                    autotypingWarning = '\n\n⚠️ *Autotyping is enabled* but will be blocked by stealth mode.';
                }
            } catch (e) {}

            let autoreadWarning = '';
            try {
                const autoreadState = await store.getSetting('global', 'autoread');
                if (autoreadState?.enabled && currentState?.enabled) {
                    autoreadWarning = '\n⚠️ *Autoread is enabled* but will be blocked by stealth mode.';
                }
            } catch (e) {}
            
            return await sock.sendMessage(chatId, { 
                text: `👻 *Stealth Mode Status:* ${status}\n\n*Usage:* .stealth <on|off>\n\n*What it does:*\n• Blocks all presence updates (typing, online, last seen)\n• Makes the bot completely invisible\n\n*When enabled:*\n✓ No "typing..." indicator\n✓ No "online" status\n✓ Complete stealth mode${autotypingWarning}${autoreadWarning}` 
            }, { quoted: message });
        }

        const enabled = action === 'on';
        await store.saveSetting('global', 'stealthMode', { enabled });

        let warnings = '';
        if (enabled) {
            try {
                const autotypingState = await store.getSetting('global', 'autotyping');
                const autoreadState = await store.getSetting('global', 'autoread');
                
                if (autotypingState?.enabled || autoreadState?.enabled) {
                    warnings = '\n\n*⚠️ Note:*\n';
                    if (autotypingState?.enabled) warnings += '• Autotyping is enabled but will be blocked\n';
                    if (autoreadState?.enabled) warnings += '• Autoread is enabled but will be blocked\n';
                }
            } catch (e) {}
        }

        await sock.sendMessage(chatId, { 
            text: `👻 Stealth mode has been turned *${enabled ? 'ON' : 'OFF'}*\n\n${enabled ? '✓ Bot is now in complete stealth mode\n✓ No presence updates\n✓ No typing indicators' : '✓ Presence updates enabled\n✓ Typing indicators enabled (if autotyping is on)'}${warnings}` 
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
} catch(e) { console.warn('[BUNDLE:cat-17-profile] Error loading stealth.js:', e.message); }

/* ===== setgpp.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    command: 'setgpp',
    aliases: ['setgpic', 'grouppp', 'setgrouppic'],
    category: 'admin',
    description: 'Change group profile picture',
    usage: '.setgpp (reply to image)',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = quoted?.imageMessage || quoted?.stickerMessage;

        if (!imageMessage) {
            await sock.sendMessage(chatId, {
                text: '❌ *Please reply to an image or sticker*\n\nUsage: Reply to an image with `.setgpp`'
            }, { quoted: message });
            return;
        }

        try {
            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }

            const stream = await downloadContentFromMessage(imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const imgPath = path.join(tmpDir, `gpp_${Date.now()}.jpg`);
            fs.writeFileSync(imgPath, buffer);

            await sock.updateProfilePicture(chatId, { url: imgPath });

            try {
                fs.unlinkSync(imgPath);
            } catch (e) {}

            await sock.sendMessage(chatId, {
                text: '✅ *Group profile picture updated successfully!*'
            }, { quoted: message });

        } catch (error) {
            console.error('Error updating group photo:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *Failed to update group profile picture*\n\nMake sure the bot is an admin and the image is valid.'
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
} catch(e) { console.warn('[BUNDLE:cat-17-profile] Error loading setgpp.js:', e.message); }

/* ===== setgname.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
    command: 'setgname',
    aliases: ['groupname'],
    category: 'admin',
    description: 'Change group name',
    usage: '.setgname <new name>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const name = args.join(' ').trim();

        if (!name) {
            await sock.sendMessage(chatId, {
                text: '❌ *Please provide a group name*\n\nUsage: `.setgname <new name>`'
            }, { quoted: message });
            return;
        }

        try {
            await sock.groupUpdateSubject(chatId, name);
            await sock.sendMessage(chatId, {
                text: `✅ *Group name updated to:*\n${name}`
            }, { quoted: message });
        } catch (error) {
            console.error('Error updating group name:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *Failed to update group name*\n\nMake sure the bot is an admin.'
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
} catch(e) { console.warn('[BUNDLE:cat-17-profile] Error loading setgname.js:', e.message); }

/* ===== setgdesc.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
    command: 'setgdesc',
    aliases: ['setdesc', 'groupdesc'],
    category: 'admin',
    description: 'Change group description',
    usage: '.setgdesc <new description>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const desc = args.join(' ').trim();

        if (!desc) {
            await sock.sendMessage(chatId, {
                text: '❌ *Please provide a description*\n\nUsage: `.setgdesc <description>`'
            }, { quoted: message });
            return;
        }

        try {
            await sock.groupUpdateDescription(chatId, desc);
            await sock.sendMessage(chatId, {
                text: '✅ *Group description updated successfully!*'
            }, { quoted: message });
        } catch (error) {
            console.error('Error updating group description:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *Failed to update group description*\n\nMake sure the bot is an admin.'
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
} catch(e) { console.warn('[BUNDLE:cat-17-profile] Error loading setgdesc.js:', e.message); }

/* ===== setcmd.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@AbdulRehman19721986                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the JUNAID-MD↣³⁰² Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/


const store = require('../lib/lightweight_store');
const fs = require('fs');
const path = require('path');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const STICKER_FILE = path.join(__dirname, '../data/sticker_commands.json');

async function getStickerCommands() {
    if (HAS_DB) {
        const data = await store.getSetting('global', 'stickerCommands');
        return data || {};
    } else {
        try {
            const dir = path.dirname(STICKER_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            if (!fs.existsSync(STICKER_FILE)) {
                fs.writeFileSync(STICKER_FILE, JSON.stringify({}));
                return {};
            }
            return JSON.parse(fs.readFileSync(STICKER_FILE, 'utf8'));
        } catch {
            return {};
        }
    }
}

async function saveStickerCommands(data) {
    if (HAS_DB) {
        await store.saveSetting('global', 'stickerCommands', data);
    } else {
        const dir = path.dirname(STICKER_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(STICKER_FILE, JSON.stringify(data, null, 2));
    }
}

module.exports = {
    command: 'setcmd',
    aliases: ['addcmd'],
    category: 'owner',
    description: 'Set a sticker command',
    usage: '.setcmd <text>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const { chatId, senderId } = context;
        
        if (!message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            return await sock.sendMessage(chatId, { 
                text: '✳️ Please reply to a sticker to set a command' 
            }, { quoted: message });
        }

        const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
        
        if (!quotedMsg.stickerMessage) {
            return await sock.sendMessage(chatId, { 
                text: '⚠️ Please reply to a sticker, not a regular message' 
            }, { quoted: message });
        }

        const fileSha256 = quotedMsg.stickerMessage.fileSha256;
        if (!fileSha256) {
            return await sock.sendMessage(chatId, { 
                text: '⚠️ File SHA256 not found' 
            }, { quoted: message });
        }

        const text = args.join(' ');
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: 'Command text is missing' 
            }, { quoted: message });
        }

        const stickers = await getStickerCommands();
        const hash = Buffer.from(fileSha256).toString('base64');

        if (stickers[hash] && stickers[hash].locked) {
            return await sock.sendMessage(chatId, { 
                text: '⚠️ You do not have permission to change this sticker command' 
            }, { quoted: message });
        }

        stickers[hash] = {
            text,
            mentionedJid: message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [],
            creator: senderId,
            at: Date.now(),
            locked: false,
        };

        await saveStickerCommands(stickers);

        await sock.sendMessage(chatId, { 
            text: '✅ Command saved successfully' 
        }, { quoted: message });
    }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@AbdulRehman19721986                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the JUNAID-MD↣³⁰² Project.                 *
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
} catch(e) { console.warn('[BUNDLE:cat-17-profile] Error loading setcmd.js:', e.message); }

/* ===== delcmd.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const store = require('../lib/lightweight_store');
const fs = require('fs');
const path = require('path');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);


const STICKER_FILE = path.join(__dirname, '../data/sticker_commands.json');

async function getStickerCommands() {
    if (HAS_DB) {
        const data = await store.getSetting('global', 'stickerCommands');
        return data || {};
    } else {
        try {
            if (!fs.existsSync(STICKER_FILE)) {
                return {};
            }
            return JSON.parse(fs.readFileSync(STICKER_FILE, 'utf8'));
        } catch {
            return {};
        }
    }
}

async function saveStickerCommands(data) {
    if (HAS_DB) {
        await store.saveSetting('global', 'stickerCommands', data);
    } else {
        const dir = path.dirname(STICKER_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(STICKER_FILE, JSON.stringify(data, null, 2));
    }
}

module.exports = {
    command: 'delcmd',
    aliases: ['removecmd'],
    category: 'owner',
    description: 'Delete a sticker command',
    usage: '.delcmd <text>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const { chatId } = context;
        
        let hash = args.join(' ');

        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) {
            const fileSha256 = message.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage.fileSha256;
            if (fileSha256) {
                hash = Buffer.from(fileSha256).toString('hex');
            }
        }

        if (!hash) {
            return await sock.sendMessage(chatId, { 
                text: '✳️ Please enter the command name or reply to a sticker' 
            }, { quoted: message });
        }

        const stickers = await getStickerCommands();

        if (stickers[hash] && stickers[hash].locked) {
            return await sock.sendMessage(chatId, { 
                text: '✳️ You cannot delete this command' 
            }, { quoted: message });
        }

        if (!stickers[hash]) {
            return await sock.sendMessage(chatId, { 
                text: '⚠️ Command not found' 
            }, { quoted: message });
        }

        delete stickers[hash];
        await saveStickerCommands(stickers);

        await sock.sendMessage(chatId, { 
            text: '✅ Command deleted' 
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
} catch(e) { console.warn('[BUNDLE:cat-17-profile] Error loading delcmd.js:', e.message); }

/* ===== description.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/description.js
module.exports = {
  command: 'description',
  aliases: ['setdesc', 'setabout'],
  category: 'owner',
  description: 'Change bot description (about/bio)',
  usage: '.description <new description>',
  
  async handler(sock, message, args, context) {
    if (!message.key.fromMe) {
      return await sock.sendMessage(message.key.remoteJid, {
        text: '❌ This command can only be used by the bot itself.'
      }, { quoted: message });
    }

    const { chatId } = context;
    const newDesc = args.join(' ').trim();

    if (!newDesc) {
      return await sock.sendMessage(chatId, {
        text: '❌ Please provide a new description.\nExample: .description Powered by JUNAID-MD↣³⁰²'
      }, { quoted: message });
    }

    try {
      await sock.updateProfileStatus(newDesc);
      await sock.sendMessage(chatId, {
        text: `✅ Bot description updated to:\n*${newDesc}*`
      }, { quoted: message });
    } catch (error) {
      console.error('Description error:', error);
      await sock.sendMessage(chatId, {
        text: `❌ Failed to update description: ${error.message}`
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
} catch(e) { console.warn('[BUNDLE:cat-17-profile] Error loading description.js:', e.message); }

module.exports = _bundle;