'use strict';
// AUTO-GENERATED BUNDLE: cat-11-owner
// Contains: owner.js, ownerinfo.js, ownername.js, botname.js, botdesc.js, botdp.js, settings.js, botsettings.js, sudo.js, maintenance.js, mode.js, reload.js, update.js, pull.js, shutdown.js, clearmemory.js, prefix.js, panel.js, staff.js, repo.js, source.js, on.js, delplugin.js, installplugin.js, getplugin.js, listplugins.js, loop.js, memory.js

const _bundle = [];


/* ===== owner.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const settings = require('../settings');

module.exports = {
  command: 'owner',
  aliases: ['ownerinfo', 'contact'],
  category: 'info',
  description: 'Show bot owner contact',
  usage: '.owner',
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:' + settings.botOwner + '\nTEL;waid=' + settings.ownerNumber + ':+' + settings.ownerNumber + '\nEND:VCARD';
    await sock.sendMessage(chatId, {
      contacts: {
        displayName: settings.botOwner,
        contacts: [{ vcard }]
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading owner.js:', e.message); }

/* ===== ownerinfo.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const settings = require('../settings');

module.exports = {
    command: 'oi',
    aliases: ['ownerinfo', 'coowner'],
    category: 'info',
    description: 'Show owner information with video',
    usage: '.oi',
    ownerOnly: false,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        const ownerName   = settings.ownerName   || settings.botOwner || 'Owner';
        const ownerNumber = settings.ownerNumber  || '';
        const ownerVideo  = settings.ownerVideo   || '';

        let text = `👑 *OWNER INFO* 👑\n\n`;
        text += `🔹 *Owner:* ${ownerName}\n`;
        text += `\n📱 *Video:* Sending...`;

        await sock.sendMessage(chatId, { text }, { quoted: message });

        if (ownerVideo) {
            try {
                await sock.sendMessage(chatId, {
                    video: { url: ownerVideo },
                    caption: `👑 *${ownerName}* – Owner & Developer`
                }, { quoted: message });
            } catch (err) {
                console.error('Owner video error:', err.message);
                await sock.sendMessage(chatId, { text: '❌ Failed to send owner video.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading ownerinfo.js:', e.message); }

/* ===== ownername.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/botname.js
module.exports = {
  command: 'botname',
  aliases: ['setbotname'],
  category: 'owner',
  description: 'Change bot display name (pushname)',
  usage: '.botname <new name>',
  
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
        text: '❌ Please provide a new name.\nExample: .botname REDXBOT'
      }, { quoted: message });
    }

    try {
      // Attempt to update profile name
      await sock.updateProfileName(newName);
      await sock.sendMessage(chatId, {
        text: `✅ Bot name changed to: *${newName}*`
      }, { quoted: message });
    } catch (error) {
      console.error('BotName error:', error);
      
      // Specific error message for "app state key not present"
      if (error.message.includes('app state key not present')) {
        await sock.sendMessage(chatId, {
          text: `❌ Failed to update name. This is a known Baileys bug. Try restarting the bot and use the command again. If it persists, your session may need to be re-paired.`
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, {
          text: `❌ Failed to update name: ${error.message}`
        }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading ownername.js:', e.message); }

/* ===== botname.js ===== */
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

const store = require('../lib/lightweight_store');

// Default name from .env or fallback
const DEFAULT_NAME = process.env.BOT_NAME || 'REDX BOT';

module.exports = {
    command: 'botname',
    aliases: ['setbotname', 'setname'],
    usage: '.botname <new name>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        // Get current name from store, fallback to env/default
        const storedName = await store.getSetting('global', 'botName');
        const currentName = storedName || DEFAULT_NAME;

        if (args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `📛 *Current Bot Name:* ${currentName}\n\nUse \`.botname <new name>\` to change.`,
                ...channelInfo
            }, { quoted: message });
        }

        const newName = args.join(' ').trim();
        if (newName.length < 3 || newName.length > 30) {
            return await sock.sendMessage(chatId, {
                text: '❌ Name must be between 3 and 30 characters.',
                ...channelInfo
            }, { quoted: message });
        }

        try {
            // Update profile name via WhatsApp
            await sock.updateProfileName(newName);
        } catch (error) {
            // Fallback: use raw query
            try {
                await sock.query({
                    tag: 'iq',
                    attrs: {
                        to: 's.whatsapp.net',
                        type: 'set',
                        xmlns: 'w:profile:name'
                    },
                    content: [
                        { tag: 'name', attrs: {}, content: Buffer.from(newName, 'utf-8') }
                    ]
                });
            } catch (err) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Failed to update name: ${error.message}`,
                    ...channelInfo
                }, { quoted: message });
            }
        }

        // Save the new name to store
        await store.saveSetting('global', 'botName', newName);

        await sock.sendMessage(chatId, {
            text: `✅ Bot name updated to:\n${newName}`,
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading botname.js:', e.message); }

/* ===== botdesc.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    'use strict';
/*****************************************************************************
 *  botdesc.js — AI-POWERED AUTO DESCRIPTION ULTRA v2.0 — REDXBOT302        *
 *  ✅ Auto-update WhatsApp About (description) with AI                       *
 *  ✅ Custom interval scheduling                                             *
 *  ✅ Multiple modes: AI / Quote / Custom                                    *
 *  ✅ Covers .autoabout, .autodescription, .setabout                        *
 *****************************************************************************/

const store  = require('../lib/lightweight_store');
const axios  = require('axios');
const config = require('../config');

const BOT_NAME   = process.env.BOT_NAME   || config.BOT_NAME   || 'JUNAID-MD↣³⁰²';
const OWNER_NAME = process.env.OWNER_NAME || config.OWNER_NAME || 'JUNAID-MD↣³⁰²';

const DELINE = 'https://api.deline.web.id/ai';
const SAQIB  = 'https://apisaqib.vercel.app/api/v1';

const FALLBACK_DESCS = [
  `🤖 Advanced WhatsApp Bot by ${OWNER_NAME}`,
  '🚀 Powered by JUNAID-MD↣³⁰² v7 ULTRA',
  '✨ Your intelligent WhatsApp companion',
  '💎 Smart. Fast. Reliable. JUNAID-MD↣³⁰².',
  '🌟 Next-gen WhatsApp automation bot',
  '🔥 Built for speed, built for you.',
];

async function generateAIDesc(mood = '') {
  const prompt = `Write a short, creative WhatsApp "About" description${mood ? ` with a ${mood} vibe` : ''}. ` +
    `Max 139 chars. Professional. Just the text, no quotes or explanation.`;
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
        (data?.result?.text || data?.result || data?.answer || data?.response || data?.reply);
      if (ans && typeof ans === 'string' && ans.trim().length > 5) {
        return ans.trim().substring(0, 139);
      }
    } catch {}
  }
  return null;
}

async function updateAutoDesc(sock) {
  try {
    const s = await store.getSetting('global', 'autoDesc');
    if (!s?.enabled) return;

    let desc;
    if (s.aiMode) {
      desc = await generateAIDesc(s.aiMood || '');
      if (!desc) desc = FALLBACK_DESCS[Math.floor(Math.random() * FALLBACK_DESCS.length)];
    } else if (s.custom) {
      desc = s.custom;
    } else {
      desc = FALLBACK_DESCS[Math.floor(Math.random() * FALLBACK_DESCS.length)];
    }

    if (desc.length > 139) desc = desc.substring(0, 136) + '...';
    await sock.updateProfileStatus(desc);
    await store.saveSetting('global', 'autoDesc', { ...s, lastUpdated: new Date().toISOString() });
  } catch (e) {
    console.error('[AutoDesc] error:', e.message);
  }
}

let descCronJob = null;

function startAutoDesc(sock, intervalMin = 30) {
  stopAutoDesc();
  const ms = Math.max(1, intervalMin) * 60 * 1000;
  updateAutoDesc(sock);
  descCronJob = setInterval(() => updateAutoDesc(sock), ms);
  console.log(`[AutoDesc] Started — every ${intervalMin} min`);
}

function stopAutoDesc() {
  if (descCronJob) { clearInterval(descCronJob); descCronJob = null; }
}

module.exports = {
  command: 'botdesc',
  aliases: ['setabout', 'autoabout', 'autodescription', 'setdesc'],
  category: 'owner',
  description: '📝 AI-powered auto WhatsApp About/Description with scheduling',
  usage: '.botdesc <on|off|ai|mood|interval|set|reset|preview|now>',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId      = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const action      = args[0]?.toLowerCase();

    const reply = (text) =>
      sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

    const s = (await store.getSetting('global', 'autoDesc')) ||
      { enabled: false, custom: null, aiMode: false, aiMood: '', intervalMin: 30 };

    // ── Status panel ─────────────────────────────────────────────────────────
    if (!action) {
      return reply(
`╔══════════════════════════════════════╗
║  📝  *AUTO DESCRIPTION — ULTRA v2.0*  ║
╚══════════════════════════════════════╝

📊 *Status:*    ${s.enabled ? '🟢 Active' : '🔴 Inactive'}
🧠 *AI Mode:*   ${s.aiMode  ? '🟢 Enabled' : '🔴 Disabled'}
😊 *AI Mood:*   ${s.aiMood  || 'neutral'}
⏱️  *Interval:* Every ${s.intervalMin || 30} minute(s)
📝 *Custom:*    ${s.custom  ? 'Set ✅' : 'Not set'}
🕒 *Last Set:*  ${s.lastUpdated ? new Date(s.lastUpdated).toLocaleString() : 'Never'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 \`.botdesc on\`             — Enable auto-description
🔴 \`.botdesc off\`            — Disable auto-description
🧠 \`.botdesc ai on/off\`     — Toggle AI mode
😊 \`.botdesc mood <mood>\`   — Set AI mood
⏱️  \`.botdesc interval <min>\`— Set update interval
📝 \`.botdesc set <text>\`    — Set custom description
🔄 \`.botdesc reset\`         — Reset to default
👁️  \`.botdesc preview\`      — Preview next description
▶️  \`.botdesc now\`           — Apply description now

> 📝 *${BOT_NAME} AutoDesc — WhatsApp About Automation*`
      );
    }

    if (action === 'on') {
      if (s.enabled) return reply('⚠️ *AutoDesc already active!*');
      s.enabled = true;
      await store.saveSetting('global', 'autoDesc', s);
      startAutoDesc(sock, s.intervalMin || 30);
      return reply(
`╔════════════════════════════════╗
║  🟢 *AUTO DESCRIPTION ENABLED!* ║
╚════════════════════════════════╝

✅ *WhatsApp About will auto-update*
🧠 *Mode:* ${s.aiMode ? 'AI Generation' : 'Default Descriptions'}
⏱️  *Every:* ${s.intervalMin || 30} minute(s)

> 📝 *${BOT_NAME} AutoDesc Active*`
      );
    }

    if (action === 'off') {
      if (!s.enabled) return reply('⚠️ *AutoDesc already disabled!*');
      s.enabled = false;
      await store.saveSetting('global', 'autoDesc', s);
      stopAutoDesc();
      return reply(
`╔════════════════════════════════╗
║  🔴 *AUTO DESCRIPTION DISABLED* ║
╚════════════════════════════════╝

❌ *WhatsApp About auto-update stopped*
💡 Use \`.botdesc on\` to re-enable

> 🔴 *AutoDesc Stopped*`
      );
    }

    if (action === 'ai') {
      const sub = args[1]?.toLowerCase();
      if (!['on', 'off'].includes(sub)) return reply('❌ *Usage:* `.botdesc ai on` or `.botdesc ai off`');
      s.aiMode = sub === 'on';
      await store.saveSetting('global', 'autoDesc', s);
      return reply(
`╔══════════════════════════════╗
║  🧠 *AI MODE ${sub.toUpperCase()} *           ║
╚══════════════════════════════╝

${sub === 'on' ? '🧠 *Descriptions will be AI-generated*' : '📋 *Using default descriptions*'}
💡 Set mood: \`.botdesc mood professional\`

> 🧠 *AI Mode ${sub === 'on' ? 'Enabled' : 'Disabled'}*`
      );
    }

    if (action === 'mood') {
      const mood = args.slice(1).join(' ').trim();
      if (!mood) return reply('❌ *Usage:* `.botdesc mood professional`');
      s.aiMood = mood;
      await store.saveSetting('global', 'autoDesc', s);
      return reply(`✅ *AI Mood set to:* \`${mood}\`\n🧠 Next description will use this mood.`);
    }

    if (action === 'interval') {
      const min = parseInt(args[1]);
      if (!min || min < 1) return reply('❌ *Usage:* `.botdesc interval <minutes>`');
      s.intervalMin = min;
      await store.saveSetting('global', 'autoDesc', s);
      if (s.enabled) startAutoDesc(sock, min);
      return reply(
`╔══════════════════════════════╗
║  ⏱️  *INTERVAL UPDATED*       ║
╚══════════════════════════════╝

✅ *New interval:* Every ${min} minute(s)

> ⏱️ *Description updates every ${min} min*`
      );
    }

    if (action === 'set') {
      const text = args.slice(1).join(' ').trim();
      if (!text) return reply('❌ *Provide description text!*\n*Example:* `.botdesc set Powered by AI 🤖`');
      if (text.length > 139) return reply(`❌ *Too long!* Max 139 chars (yours: ${text.length})`);
      s.custom = text;
      await store.saveSetting('global', 'autoDesc', s);
      if (s.enabled) await updateAutoDesc(sock);
      return reply(
`╔════════════════════════════════╗
║  📝 *CUSTOM DESCRIPTION SET*   ║
╚════════════════════════════════╝

✅ *Description:* "${text}"
${s.enabled ? '🔄 Applied now!' : '⚠️ Enable with `.botdesc on`'}

> 📝 *Custom description saved*`
      );
    }

    if (action === 'reset') {
      s.custom  = null;
      s.aiMood  = '';
      s.aiMode  = false;
      await store.saveSetting('global', 'autoDesc', s);
      return reply('✅ *Reset to defaults!* Custom description and AI mood cleared.');
    }

    if (action === 'preview') {
      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });
      let desc;
      if (s.aiMode) {
        desc = await generateAIDesc(s.aiMood || '');
        if (!desc) desc = FALLBACK_DESCS[0];
      } else if (s.custom) {
        desc = s.custom;
      } else {
        desc = FALLBACK_DESCS[Math.floor(Math.random() * FALLBACK_DESCS.length)];
      }
      return reply(
`╔══════════════════════════════╗
║  👁️  *DESCRIPTION PREVIEW*    ║
╚══════════════════════════════╝

📝 *Next description:*
"${desc}"

🧠 *Source:* ${s.aiMode ? 'AI Generated' : s.custom ? 'Custom' : 'Default List'}
> 👁️ *Preview only — not applied*`
      );
    }

    if (action === 'now') {
      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });
      try {
        await updateAutoDesc(sock);
        return reply('✅ *WhatsApp About updated now!*');
      } catch (e) {
        return reply(`❌ *Failed:* ${e.message}`);
      }
    }

    return reply('❌ *Unknown option.* Use `.botdesc` to see all commands.');
  },

  startAutoDesc,
  stopAutoDesc,
  updateAutoDesc,
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading botdesc.js:', e.message); }

/* ===== botdp.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    'use strict';
/*****************************************************************************
 *  botdp.js — AUTO DP ULTRA v2.0 — REDXBOT302                              *
 *  ✅ Auto-DP with scheduled interval                                        *
 *  ✅ URL rotation (multiple DPs in a playlist)                              *
 *  ✅ Heavy stylish emoji formatting                                         *
 *****************************************************************************/

const axios  = require('axios');
const store  = require('../lib/lightweight_store');
const config = require('../config');

const BOT_NAME   = process.env.BOT_NAME   || config.BOT_NAME   || 'JUNAID-MD↣³⁰²';
const OWNER_NAME = process.env.OWNER_NAME || config.OWNER_NAME || 'JUNAID-MD↣³⁰²';

let dpCronJob    = null;
let dpIndexCache = 0;

async function applyDP(sock, url) {
  const res    = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
  const buffer = Buffer.from(res.data, 'binary');
  await sock.updateProfilePicture(sock.user.id, buffer);
  return buffer.length;
}

async function runAutoDP(sock) {
  try {
    const s = await store.getSetting('global', 'autoDP');
    if (!s?.enabled) return;

    const urls = s.urls || (s.url ? [s.url] : []);
    if (!urls.length) return;

    // Rotate through URLs
    const idx = dpIndexCache % urls.length;
    dpIndexCache = (idx + 1) % urls.length;
    const url  = urls[idx];

    await applyDP(sock, url);
    await store.saveSetting('global', 'autoDP', { ...s, lastUpdated: new Date().toISOString(), lastIdx: idx });
  } catch (e) {
    console.error('[AutoDP] error:', e.message);
  }
}

function startAutoDP(sock, intervalMin = 60) {
  stopAutoDP();
  const ms = Math.max(1, intervalMin) * 60 * 1000;
  runAutoDP(sock);
  dpCronJob = setInterval(() => runAutoDP(sock), ms);
  console.log(`[AutoDP] Started — every ${intervalMin} min`);
}

function stopAutoDP() {
  if (dpCronJob) { clearInterval(dpCronJob); dpCronJob = null; }
}

module.exports = {
  command: 'setdp',
  aliases: ['autodp', 'setbotdp', 'fulldp', 'botdp'],
  category: 'owner',
  description: '📸 Auto-change bot DP with scheduling & URL rotation',
  usage: '.setdp <url | on | off | add | list | remove | interval | now>',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId      = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const action      = args[0]?.toLowerCase();

    const reply = (text) =>
      sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

    const s = (await store.getSetting('global', 'autoDP')) ||
      { enabled: false, urls: [], intervalMin: 60 };

    // ── Status (no args) ─────────────────────────────────────────────────────
    if (!action) {
      return reply(
`╔══════════════════════════════════╗
║  📸  *AUTO DP — ULTRA v2.0*       ║
╚══════════════════════════════════╝

📊 *Status:*     ${s.enabled ? '🟢 Active' : '🔴 Inactive'}
⏱️  *Interval:*  Every ${s.intervalMin || 60} minute(s)
🖼️  *DP URLs:*   ${s.urls?.length || 0} saved
🕒 *Last Set:*   ${s.lastUpdated ? new Date(s.lastUpdated).toLocaleString() : 'Never'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 \`.setdp on\`              — Enable auto-DP
🔴 \`.setdp off\`             — Disable auto-DP
➕ \`.setdp add <url>\`       — Add URL to rotation
📋 \`.setdp list\`            — List all DP URLs
🗑️  \`.setdp remove <#>\`    — Remove URL by number
⏱️  \`.setdp interval <min>\` — Set update interval
🔄 \`.setdp now\`             — Apply DP immediately
🖼️  \`.setdp <url>\`         — Set single DP directly

> 📸 *${BOT_NAME} AutoDP — Automated Profile Picture*`
      );
    }

    // ── Enable ────────────────────────────────────────────────────────────────
    if (action === 'on') {
      if (s.enabled) return reply('⚠️ *AutoDP is already active!*');
      if (!s.urls?.length) return reply('❌ *No DP URLs set!* Add one with `.setdp add <url>`');
      s.enabled = true;
      await store.saveSetting('global', 'autoDP', s);
      startAutoDP(sock, s.intervalMin || 60);
      return reply(
`╔══════════════════════════════╗
║  🟢 *AUTO DP ENABLED!*        ║
╚══════════════════════════════╝

✅ *Auto DP is now ACTIVE*
🖼️  *URLs in rotation:* ${s.urls.length}
⏱️  *Interval:* Every ${s.intervalMin || 60} min
🔄 *First DP being applied...*

> 📸 *${BOT_NAME} — DP rotation started*`
      );
    }

    // ── Disable ───────────────────────────────────────────────────────────────
    if (action === 'off') {
      if (!s.enabled) return reply('⚠️ *AutoDP is already disabled!*');
      s.enabled = false;
      await store.saveSetting('global', 'autoDP', s);
      stopAutoDP();
      return reply(
`╔══════════════════════════════╗
║  🔴 *AUTO DP DISABLED*        ║
╚══════════════════════════════╝

❌ *Auto DP is now INACTIVE*
💡 Use \`.setdp on\` to re-enable

> 🔴 *DP rotation stopped*`
      );
    }

    // ── Add URL ───────────────────────────────────────────────────────────────
    if (action === 'add') {
      const url = args[1]?.trim();
      if (!url || !/^https?:\/\//i.test(url)) {
        return reply('❌ *Provide a valid image URL!*\n*Example:* `.setdp add https://catbox.moe/img.jpg`');
      }
      if (!s.urls) s.urls = [];
      s.urls.push(url);
      await store.saveSetting('global', 'autoDP', s);
      return reply(
`╔════════════════════════════╗
║  ➕ *DP URL ADDED*           ║
╚════════════════════════════╝

✅ *URL added to rotation*
📋 *Total URLs:* ${s.urls.length}
💡 ${s.enabled ? 'Will be used in next rotation' : 'Enable with `.setdp on`'}

> ➕ *Rotation list updated*`
      );
    }

    // ── List URLs ─────────────────────────────────────────────────────────────
    if (action === 'list') {
      const urls = s.urls || [];
      if (!urls.length) return reply('📭 *No DP URLs saved yet.*\nAdd one with `.setdp add <url>`');
      return reply(
`╔══════════════════════════════╗
║  📋 *DP URL ROTATION LIST*   ║
╚══════════════════════════════╝

${urls.map((u, i) => `${i + 1}. ${u}`).join('\n')}

📦 *Total:* ${urls.length} URL(s)
⏱️  *Interval:* Every ${s.intervalMin || 60} min

> 📋 *Remove with .setdp remove <number>*`
      );
    }

    // ── Remove URL ────────────────────────────────────────────────────────────
    if (action === 'remove') {
      const idx = parseInt(args[1]) - 1;
      const urls = s.urls || [];
      if (isNaN(idx) || idx < 0 || idx >= urls.length) {
        return reply(`❌ *Invalid number.* Use \`.setdp list\` to see URLs (1-${urls.length})`);
      }
      const removed = urls.splice(idx, 1)[0];
      s.urls = urls;
      await store.saveSetting('global', 'autoDP', s);
      return reply(
`╔══════════════════════════════╗
║  🗑️  *DP URL REMOVED*         ║
╚══════════════════════════════╝

✅ *Removed URL #${idx + 1}*
📋 *Remaining:* ${urls.length} URL(s)

> 🗑️ *Rotation list updated*`
      );
    }

    // ── Interval ──────────────────────────────────────────────────────────────
    if (action === 'interval') {
      const min = parseInt(args[1]);
      if (!min || min < 1) return reply('❌ *Usage:* `.setdp interval <minutes>` (min: 1)');
      s.intervalMin = min;
      await store.saveSetting('global', 'autoDP', s);
      if (s.enabled) startAutoDP(sock, min);
      return reply(
`╔══════════════════════════════╗
║  ⏱️  *INTERVAL UPDATED*       ║
╚══════════════════════════════╝

✅ *New interval:* Every ${min} minute(s)
📊 *Status:* ${s.enabled ? '🟢 Active' : '🔴 Inactive'}

> ⏱️ *DP will change every ${min} min*`
      );
    }

    // ── Now (apply immediately) ───────────────────────────────────────────────
    if (action === 'now') {
      const urls = s.urls || (s.url ? [s.url] : []);
      if (!urls.length) return reply('❌ *No DP URLs set!* Add one with `.setdp add <url>`');
      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });
      try {
        await runAutoDP(sock);
        return reply(
`╔══════════════════════════════╗
║  ✅ *DP APPLIED!*              ║
╚══════════════════════════════╝

🖼️ *Profile picture updated now!*

> 📸 *${BOT_NAME} DP changed successfully*`
        );
      } catch (e) {
        return reply(`❌ *Failed to apply DP:* ${e.message}`);
      }
    }

    // ── Direct URL (single set) ────────────────────────────────────────────────
    const url = args[0]?.trim();
    if (url && /^https?:\/\//i.test(url)) {
      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });
      try {
        const size = await applyDP(sock, url);
        s.urls = [url];
        await store.saveSetting('global', 'autoDP', s);
        return reply(
`╔══════════════════════════════════╗
║  ✅ *PROFILE PICTURE UPDATED!*    ║
╚══════════════════════════════════╝

🖼️ *DP applied successfully!*
📦 *Size:* ${Math.round(size / 1024)} KB

> 📸 *Uploaded by ${OWNER_NAME} via ${BOT_NAME}*`
        );
      } catch (e) {
        return reply(`❌ *Failed to update DP:* ${e.message}`);
      }
    }

    return reply('❌ *Unknown option.* Use `.setdp` to see all commands.');
  },

  startAutoDP,
  stopAutoDP,
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading botdp.js:', e.message); }

/* ===== settings.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const isOwnerOrSudo = require('../lib/isOwner');
const store = require('../lib/lightweight_store');
const { cleanJid } = require('../lib/isOwner');

module.exports = {
    command: 'settings',
    aliases: ['config', 'setting'],
    category: 'owner',
    description: 'Show bot settings and per-group configurations',
    usage: '.settings',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;

        try {
            const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
            const isMe = message.key.fromMe;

            if (!isMe && !isOwner) {
                return await sock.sendMessage(chatId, { 
                    text: '❌ *Access Denied:* Only Owner/Sudo can view settings.' 
                }, { quoted: message });
            }
            
            const isGroup = chatId.endsWith('@g.us');

            const botMode = await store.getBotMode();
            
            const allSettings = await store.getAllSettings('global');
            const autoStatus = allSettings.autoStatus || { enabled: false };
            const autoread = allSettings.autoread || { enabled: false };
            const autotyping = allSettings.autotyping || { enabled: false };
            const pmblocker = allSettings.pmblocker || { enabled: false };
            const anticall = allSettings.anticall || { enabled: false };
            const autoReaction = allSettings.autoReaction || false;

            const getSt = (val) => val ? '✅' : '❌';

            let menuText = `╭━〔 *MEGA SETTINGS* 〕━┈\n┃\n`;
            menuText += `┃ 👤 *User:* @${cleanJid(senderId)}\n`;
            menuText += `┃ 🤖 *Mode:* ${botMode.toUpperCase()}\n`;
            menuText += `┃\n┣━〔 *GLOBAL CONFIG* 〕━┈\n`;
            menuText += `┃ ${getSt(autoStatus?.enabled)} *Auto Status*\n`;
            menuText += `┃ ${getSt(autoread?.enabled)} *Auto Read*\n`;
            menuText += `┃ ${getSt(autotyping?.enabled)} *Auto Typing*\n`;
            menuText += `┃ ${getSt(pmblocker?.enabled)} *PM Blocker*\n`;
            menuText += `┃ ${getSt(anticall?.enabled)} *Anti Call*\n`;
            menuText += `┃ ${getSt(autoReaction)} *Auto Reaction*\n`;
            menuText += `┃\n`;

            if (isGroup) {
                const groupSettings = await store.getAllSettings(chatId);
                
                const groupAntilink = groupSettings.antilink || { enabled: false };
                const groupBadword = groupSettings.antibadword || { enabled: false };
                const groupAntitag = groupSettings.antitag || { enabled: false };
                const groupChatbot = groupSettings.chatbot || false;
                const groupWelcome = groupSettings.welcome || false;
                const groupGoodbye = groupSettings.goodbye || false;

                menuText += `┣━〔 *GROUP CONFIG* 〕━┈\n`;
                menuText += `┃ ${getSt(groupAntilink.enabled)} *Antilink*\n`;
                menuText += `┃ ${getSt(groupBadword.enabled)} *Antibadword*\n`;
                menuText += `┃ ${getSt(groupAntitag.enabled)} *Antitag*\n`;
                menuText += `┃ ${getSt(groupChatbot)} *Chatbot*\n`;
                menuText += `┃ ${getSt(groupWelcome)} *Welcome*\n`;
                menuText += `┃ ${getSt(groupGoodbye)} *Goodbye*\n`;
            } else {
                menuText += `┃ 💡 *Note:* _Use in group for group configs._\n`;
            }

            menuText += `┃\n╰━━━━━━━━━━━━━━━━┈`;

            await sock.sendMessage(chatId, { 
                text: menuText,
                mentions: [senderId],
                contextInfo: {
                    externalAdReply: {
                        title: "SYSTEM SETTINGS PANEL",
                        body: "Configuration Status",
                        thumbnailUrl: "https://github.com/AbdulRehman19721986.png",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: message });

        } catch (error) {
            console.error('Settings Command Error:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ Error: Failed to load settings.' 
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading settings.js:', e.message); }

/* ===== botsettings.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

const store = require('../lib/lightweight_store');
const settings = require('../settings');

module.exports = {
    command: 'botsettings',
    aliases: ['bset'],
    category: 'owner',
    description: 'View and modify bot settings',
    usage: '.botsettings [setting] [value]',
    ownerOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        // If no args, show all settings
        if (args.length === 0) {
            // Get dynamic settings from store
            const prefix = await store.getSetting('global', 'prefix') || settings.prefixes[0];
            const botDp = await store.getSetting('global', 'botDp') || settings.botDp;
            const botName = await store.getSetting('global', 'botName') || settings.botName;
            const commandMode = await store.getSetting('global', 'commandMode') || settings.commandMode;

            const platform = settings.platform.toUpperCase();

            const text = `⚙️ *BOT SETTINGS* ⚙️

*Platform:* ${platform}
*Version:* ${settings.version}
*Prefix:* \`${prefix}\`
*Bot Name:* ${botName}
*Command Mode:* ${commandMode}
*Owner:* ${settings.botOwner || settings.ownerName}

*To change a setting:* 
\`.botsettings <setting> <value>\`

*Available settings:*
• prefix (new prefix)
• botname (new name)
• mode (public/private/self/groups/inbox)
• dp (image URL)`;

            return await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
        }

        const setting = args[0].toLowerCase();
        const value = args.slice(1).join(' ');

        if (!value) {
            return await sock.sendMessage(chatId, {
                text: `❌ Please provide a value for \`${setting}\`.`,
                ...channelInfo
            }, { quoted: message });
        }

        // Handle different settings
        switch (setting) {
            case 'prefix':
                if (value.length > 2) return await sock.sendMessage(chatId, { text: '❌ Prefix must be 1-2 characters.' }, { quoted: message });
                await store.saveSetting('global', 'prefix', value);
                settings.prefixes = [value, ...settings.prefixes.filter(p => p !== value)];
                break;

            case 'botname':
                await store.saveSetting('global', 'botName', value);
                settings.botName = value;
                break;

            case 'mode':
                const modes = ['public', 'private', 'self', 'groups', 'inbox'];
                if (!modes.includes(value)) {
                    return await sock.sendMessage(chatId, {
                        text: `❌ Invalid mode. Choose: ${modes.join(', ')}`,
                        ...channelInfo
                    }, { quoted: message });
                }
                // FIX: use setBotMode so passesMode/getBotMode picks up the change immediately
                await store.setBotMode(value);
                settings.commandMode = value;
                break;

            case 'dp':
                if (!/^https?:\/\//i.test(value)) {
                    return await sock.sendMessage(chatId, { text: '❌ Invalid URL.' }, { quoted: message });
                }
                await store.saveSetting('global', 'botDp', value);
                settings.botDp = value;
                // Optionally update profile picture immediately
                try {
                    const axios = require('axios');
                    const response = await axios.get(value, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data, 'binary');
                    await sock.updateProfilePicture(sock.user.id, buffer);
                } catch (e) {
                    // fail silently
                }
                break;

            default:
                return await sock.sendMessage(chatId, {
                    text: `❌ Unknown setting: \`${setting}\`.\nUse \`.botsettings\` to see available settings.`,
                    ...channelInfo
                }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: `✅ *${setting}* updated to:\n\`${value}\``,
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading botsettings.js:', e.message); }

/* ===== sudo.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const settings = require('../settings');
const { addSudo, removeSudo, getSudoList } = require('../lib/index');
const isOwnerModule = require('../lib/isOwner');
const { cleanJid } = require('../lib/isOwner');

function extractTargetJid(message, args) {
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
        return message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        return message.message.extendedTextMessage.contextInfo.participant;
    }
    const text = args.join(' ');
    const match = text.match(/\b(\d{7,15})\b/);
    if (match) return match[1] + '@s.whatsapp.net';
    return null;
}

module.exports = {
    command: 'sudo',
    aliases: [],
    category: 'owner',
    description: 'Add or remove sudo users or list them',
    usage: '.sudo add|del|list <@user|number>',
    ownerOnly: true,   // owner + sudo can use (list is open to sudo, add/del restricted inside)

    async handler(sock, message, args, context = {}) {
        const chatId    = context.chatId    || message.key.remoteJid;
        const senderJid = context.senderId  || message.key.participant || message.key.remoteJid;
        const isGroup   = chatId.endsWith('@g.us');

        // isRealOwner: strict owner only (for add/del actions)
        const isRealOwner = context.isRealOwner ||
                            message.key.fromMe  ||
                            isOwnerModule.isOwnerOnly(senderJid);

        const sub = (args[0] || '').toLowerCase();

        if (!sub || !['add', 'del', 'remove', 'list'].includes(sub)) {
            await sock.sendMessage(chatId, {
                text:
                    '╭━━━〔 *SUDO MANAGER* 〕━━━┈\n┃\n' +
                    '┃ 📝 *Usage:*\n' +
                    '┃ ▢ .sudo add <@tag/reply/num>\n' +
                    '┃ ▢ .sudo del <@tag/reply/num>\n' +
                    '┃ ▢ .sudo list\n┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━┈'
            }, { quoted: message });
            return;
        }

        // list — owner + sudo can use
        if (sub === 'list') {
            const list = await getSudoList();
            if (list.length === 0) {
                await sock.sendMessage(chatId, { text: '❌ No sudo users found.' }, { quoted: message });
                return;
            }
            const textList = list.map((j, i) => `┃ ${i + 1}. @${cleanJid(j)}`).join('\n');
            await sock.sendMessage(chatId, {
                text: `╭━━〔 *SUDO USERS* 〕━━┈\n┃\n${textList}\n┃\n╰━━━━━━━━━━━━━━━┈`,
                mentions: list
            }, { quoted: message });
            return;
        }

        // add / del — real owner only
        if (!isRealOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ *Access Denied:* Only the Main Owner can add/remove Sudo privileges.'
            }, { quoted: message });
            return;
        }

        const targetJid = extractTargetJid(message, args.slice(1));
        if (!targetJid) {
            await sock.sendMessage(chatId, {
                text: '❌ Please mention a user, reply to their message, or provide a number.'
            }, { quoted: message });
            return;
        }

        let displayId = cleanJid(targetJid);
        if (targetJid.includes('@lid') && isGroup) {
            try {
                const metadata = await sock.groupMetadata(chatId);
                const found = metadata.participants.find(p => p.lid === targetJid || p.id === targetJid);
                if (found && found.id && !found.id.includes('@lid')) displayId = cleanJid(found.id);
            } catch (_) {}
        }

        if (sub === 'add') {
            const ok = await addSudo(targetJid);
            await sock.sendMessage(chatId, {
                text: ok
                    ? `✅ *Success:* @${displayId} has been granted Sudo privileges.`
                    : `❌ *Error:* Failed to add sudo.`,
                mentions: [targetJid]
            }, { quoted: message });
            return;
        }

        if (sub === 'del' || sub === 'remove') {
            const ownerNumberClean = cleanJid(settings.ownerNumber);
            if (displayId === ownerNumberClean) {
                await sock.sendMessage(chatId, { text: '❌ *Action Denied:* Cannot remove the Main Owner.' }, { quoted: message });
                return;
            }
            const ok = await removeSudo(targetJid);
            await sock.sendMessage(chatId, {
                text: ok
                    ? `✅ *Success:* Sudo privileges revoked from @${displayId}.`
                    : `❌ *Error:* Failed to remove sudo.`,
                mentions: [targetJid]
            }, { quoted: message });
            return;
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading sudo.js:', e.message); }

/* ===== maintenance.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
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


const CommandHandler = require('../lib/commandHandler');

let activeMaintenanceTimer = null;

module.exports = {
  command: 'maintenance',
  aliases: ['mtnc', 'lockdown'],
  category: 'owner',
  description: 'Disable non-owner commands for a duration or stop it early',
  usage: '.maintenance [minutes / stop]',
  ownerOnly: 'true',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    const input = args[0]?.toLowerCase();

    if (input === 'stop' || input === 'off') {
      if (activeMaintenanceTimer) {
        clearTimeout(activeMaintenanceTimer);
        activeMaintenanceTimer = null;
      }
      
      const allCommands = Array.from(CommandHandler.commands.values());
      allCommands.forEach(cmd => {
        if (cmd.category !== 'owner') {
          CommandHandler.disabledCommands.delete(cmd.command.toLowerCase());
        }
      });

      return await sock.sendMessage(chatId, { text: '✅ *MAINTENANCE ENDED EARLY*\nAll commands are now active.' }, { quoted: message });
    }
    
    const minutes = parseInt(input);
    if (isNaN(minutes) || minutes <= 0) {
      return await sock.sendMessage(chatId, { text: '❌ Usage: .maintenance [minutes] OR .maintenance stop' }, { quoted: message });
    }

    try {
      if (activeMaintenanceTimer) clearTimeout(activeMaintenanceTimer);

      const allCommands = Array.from(CommandHandler.commands.values());
      let affectedCount = 0;

      allCommands.forEach(cmd => {
        if (cmd.category !== 'owner' && cmd.command !== 'maintenance') {
          const key = cmd.command.toLowerCase();
          if (!CommandHandler.disabledCommands.has(key)) {
            CommandHandler.disabledCommands.add(key);
            affectedCount++;
          }
        }
      });

      await sock.sendMessage(chatId, { 
        text: `⚠️ *MAINTENANCE MODE STARTING*\n\n` +
              `Locked: ${affectedCount} commands\n` +
              `Duration: ${minutes}m\n\n` +
              `_Type ".maintenance stop" to enable commands early._`
      }, { quoted: message });

      activeMaintenanceTimer = setTimeout(async () => {
        allCommands.forEach(cmd => {
          if (cmd.category !== 'owner') {
            CommandHandler.disabledCommands.delete(cmd.command.toLowerCase());
          }
        });
        activeMaintenanceTimer = null;
        await sock.sendMessage(chatId, { text: '✅ *MAINTENANCE FINISHED*\nCommands re-enabled automatically.' });
      }, minutes * 60000);

    } catch (error) {
      console.error('Maintenance Error:', error);
      await sock.sendMessage(chatId, { text: '❌ Action failed.' }, { quoted: message });
    }
  }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading maintenance.js:', e.message); }

/* ===== mode.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *  REDXBOT302 — plugins/mode.js  (FIXED — REDXBOT302 mode-fix patch)
 *  Applies central modeCheck.js, syncs global.MODE and config.MODE
 *
 *  Commands:
 *    .mode              → show current mode + all options
 *    .mode public       → everyone (all chats)
 *    .mode groups       → group chats only
 *    .mode inbox        → private / DM only
 *    .mode private      → owner + sudo only
 *    .mode self         → owner only (strictest)
 *****************************************************************************/

const store    = require('../lib/lightweight_store');
const { modeLabel } = require('../lib/modeCheck');
const { sendSafeMessage } = require('../lib/sendSafeMessage');

const VALID_MODES = ['public', 'groups', 'inbox', 'private', 'self'];

const MODE_INFO = {
  public:  { emoji: '🌍', name: 'PUBLIC',  desc: 'Everyone can use the bot in all chats (groups + private).',  who: 'All users' },
  groups:  { emoji: '👥', name: 'GROUPS',  desc: 'Only group chat messages are processed.',                     who: 'All users (groups only)' },
  inbox:   { emoji: '📥', name: 'INBOX',   desc: 'Only private / DM messages are processed.',                   who: 'All users (private only)' },
  private: { emoji: '🔒', name: 'PRIVATE', desc: 'Only owner and sudo users can use the bot.',                  who: 'Owner + sudo' },
  self:    { emoji: '👑', name: 'SELF',    desc: 'Only the owner can use the bot (strictest).',                 who: 'Owner only' },
};

module.exports = {
  command:  'mode',
  aliases:  ['botmode', 'setmode'],
  category: 'owner',
  description: 'View or change bot access mode',
  usage:    '.mode [public|groups|inbox|private|self]',
  ownerOnly: false, // viewing is public; changing is gated below

  async handler(sock, message, args, context = {}) {
    const chatId           = context.chatId  || message.key.remoteJid;
    const channelInfo      = context.channelInfo || {};
    const senderIsOwnerOrSudo = message.key.fromMe || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck || context.isOwner || context.isSudo;

    const currentMode = (await store.getBotMode() || 'public').toLowerCase();
    const requested   = (args[0] || '').toLowerCase().trim();

    // ── No arg → show current mode ──────────────────────────────
    if (!requested || requested === 'status' || requested === 'check') {
      const info = MODE_INFO[currentMode] || MODE_INFO.public;

      const lines = [
        `╔══════════════════════════════╗`,
        `║   🤖 *BOT MODE STATUS*`,
        `╚══════════════════════════════╝`,
        ``,
        `${info.emoji} *Current Mode:* ${info.name}`,
        `📋 *Description:* ${info.desc}`,
        `👤 *Accessible by:* ${info.who}`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `*Available Modes:*`,
        ``,
        ...Object.entries(MODE_INFO).map(([k, v]) =>
          `${v.emoji} *${v.name}*${k === currentMode ? ' ✅ _(active)_' : ''}  — ${v.desc}`
        ),
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `_Use .mode <name> to change_`,
        `_e.g.  .mode public_`,
      ];

      return sendSafeMessage(sock, chatId, { text: lines.join('\n'), ...channelInfo }, { quoted: message });
    }

    // ── Change mode → owner only ─────────────────────────────────
    if (!senderIsOwnerOrSudo) {
      return sendSafeMessage(sock, chatId, {
        text: '❌ Only the bot owner or sudo can change the mode.',
        ...channelInfo
      }, { quoted: message });
    }

    if (!VALID_MODES.includes(requested)) {
      return sendSafeMessage(sock, chatId, {
        text: `❌ *Invalid mode:* \`${requested}\`\n\nValid modes: ${VALID_MODES.join(', ')}\n\nUse \`.mode\` to see all options.`,
        ...channelInfo
      }, { quoted: message });
    }

    // Apply — persist to store AND sync globals
    await store.setBotMode(requested);
    global.MODE = requested;

    // Bust messageHandler speed cache so new mode takes effect immediately
    if (typeof global._bustSpeedCache === 'function') global._bustSpeedCache();

    // Also sync config.MODE if the module supports it
    try {
      const cfg = require('../config');
      if (typeof cfg.saveMode === 'function') cfg.saveMode(requested);
    } catch {}

    const info = MODE_INFO[requested];
    const reply = [
      `╔══════════════════════════════╗`,
      `║   ✅ *MODE CHANGED*`,
      `╚══════════════════════════════╝`,
      ``,
      `${info.emoji} *New Mode:* ${info.name}`,
      `📋 ${info.desc}`,
      `👤 *Now accessible by:* ${info.who}`,
    ].join('\n');

    return sendSafeMessage(sock, chatId, { text: reply, ...channelInfo }, { quoted: message });
  },
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading mode.js:', e.message); }

/* ===== reload.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fs = require('fs');
const path = require('path');

module.exports = [{
  pattern: "reload",
  alias: ["refresh", "rld"],
  desc: "Reload all commands without restart (owner only)",
  category: "owner",
  react: "🔄",
  filename: __filename,
  use: ".reload",
  execute: async (conn, mek, m, { from, reply, sender }) => {
    const ownerJid = '61468259338@s.whatsapp.net';
    if (sender !== ownerJid) {
      return reply("❌ Only owner can use this command.");
    }

    await reply("🔄 Reloading commands...");

    try {
      // Path to plugins folder
      const pluginsPath = path.join(__dirname);
      
      // Get all plugin files (excluding this one)
      const files = fs.readdirSync(pluginsPath).filter(file => 
        file.endsWith('.js') && file !== 'reload.js'
      );

      // Clear require cache for each file
      files.forEach(file => {
        const filePath = path.join(pluginsPath, file);
        delete require.cache[require.resolve(filePath)];
      });

      // If global.commands exists, rebuild it
      if (global.commands && typeof global.commands.clear === 'function') {
        global.commands.clear();
        
        files.forEach(file => {
          const filePath = path.join(pluginsPath, file);
          try {
            const commandModule = require(filePath);
            // Handle both single command and array formats
            if (Array.isArray(commandModule)) {
              commandModule.forEach(cmd => {
                if (cmd && cmd.pattern) {
                  global.commands.set(cmd.pattern, cmd);
                  // Also register aliases if present
                  if (cmd.alias && Array.isArray(cmd.alias)) {
                    cmd.alias.forEach(alias => global.commands.set(alias, cmd));
                  }
                }
              });
            } else if (commandModule && commandModule.pattern) {
              global.commands.set(commandModule.pattern, commandModule);
              if (commandModule.alias && Array.isArray(commandModule.alias)) {
                commandModule.alias.forEach(alias => global.commands.set(alias, commandModule));
              }
            }
          } catch (err) {
            console.error(`Error reloading ${file}:`, err.message);
          }
        });

        await reply(`✅ Commands reloaded. Total: ${global.commands.size}`);
      } else {
        await reply("✅ Cache cleared. Please restart the bot for changes to take effect.");
      }

    } catch (err) {
      await reply(`❌ Error: ${err.message}`);
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading reload.js:', e.message); }

/* ===== update.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const settings = require('../settings');

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
      if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
      resolve((stdout || '').toString());
    });
  });
}

async function hasGitRepo() {
  const gitDir = path.join(process.cwd(), '.git');
  if (!fs.existsSync(gitDir)) return false;
  try {
    await run('git --version');
    return true;
  } catch {
    return false;
  }
}

async function updateViaGit() {
  const oldRev = (await run('git rev-parse HEAD').catch(() => 'unknown')).trim();
  await run('git fetch --all --prune');
  const newRev = (await run('git rev-parse origin/main')).trim();
  const alreadyUpToDate = oldRev === newRev;
  const commits = alreadyUpToDate ? '' : await run(`git log --pretty=format:"%h %s (%an)" ${oldRev}..${newRev}`).catch(() => '');
  const files = alreadyUpToDate ? '' : await run(`git diff --name-status ${oldRev} ${newRev}`).catch(() => '');
  await run(`git reset --hard ${newRev}`);
  await run('git clean -fd');
  return { oldRev, newRev, alreadyUpToDate, commits, files };
}

function downloadFile(url, dest, visited = new Set()) {
  return new Promise((resolve, reject) => {
    try {
      if (visited.has(url) || visited.size > 5) {
        return reject(new Error('Too many redirects'));
      }
      visited.add(url);

      const useHttps = url.startsWith('https://');
      const client = useHttps ? require('https') : require('http');
      const req = client.get(url, {
        headers: {
          'User-Agent': 'MegaBot-Updater/1.0',
          'Accept': '*/*'
        }
      }, res => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          const location = res.headers.location;
          if (!location) return reject(new Error(`HTTP ${res.statusCode} without Location`));
          const nextUrl = new URL(location, url).toString();
          res.resume();
          return downloadFile(nextUrl, dest, visited).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }

        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', err => {
          try { file.close(() => {}); } catch {}
          fs.unlink(dest, () => reject(err));
        });
      });
      req.on('error', err => {
        fs.unlink(dest, () => reject(err));
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function extractZip(zipPath, outDir) {
  if (process.platform === 'win32') {
    const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`;
    await run(cmd);
    return;
  }
  try {
    await run('command -v unzip');
    await run(`unzip -o '${zipPath}' -d '${outDir}'`);
    return;
  } catch {}
  try {
    await run('command -v 7z');
    await run(`7z x -y '${zipPath}' -o'${outDir}'`);
    return;
  } catch {}
  try {
    await run('busybox unzip -h');
    await run(`busybox unzip -o '${zipPath}' -d '${outDir}'`);
    return;
  } catch {}
  throw new Error("No system unzip tool found (unzip/7z/busybox). Git mode is recommended on this panel.");
}

function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (ignore.includes(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.lstatSync(s);
    if (stat.isDirectory()) {
      copyRecursive(s, d, ignore, path.join(relative, entry), outList);
    } else {
      fs.copyFileSync(s, d);
      if (outList) outList.push(path.join(relative, entry).replace(/\\/g, '/'));
    }
  }
}

async function updateViaZip(sock, chatId, message, zipOverride) {
  // ✅ FIX: default source repo wasn't configured, so .update threw
  // "No ZIP URL configured" for anyone who hadn't manually set
  // UPDATE_ZIP_URL. Default to the bot's own repo — this value is only
  // ever used internally to download+extract, never echoed back to chat.
  const DEFAULT_ZIP_URL = 'https://github.com/AbdulRehman19721986/redxminibot_beckend/archive/refs/heads/main.zip';
  const zipUrl = (zipOverride || settings.updateZipUrl || process.env.UPDATE_ZIP_URL || DEFAULT_ZIP_URL).trim();
  if (!zipUrl) {
    throw new Error('No update source configured. Contact the bot owner.');
  }
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const zipPath = path.join(tmpDir, 'update.zip');
  await downloadFile(zipUrl, zipPath);
  const extractTo = path.join(tmpDir, 'update_extract');
  if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
  await extractZip(zipPath, extractTo);

  const [root] = fs.readdirSync(extractTo).map(n => path.join(extractTo, n));
  const srcRoot = fs.existsSync(root) && fs.lstatSync(root).isDirectory() ? root : extractTo;
  const ignore = ['node_modules', '.git', 'sessions', 'session', 'tmp', 'tmp/', 'temp', 'data', 'baileys_store.json'];
  const copied = [];
  let preservedOwner = null;
  let preservedBotOwner = null;
  try {
    const currentSettings = require('../settings');
    preservedOwner = currentSettings && currentSettings.ownerNumber ? String(currentSettings.ownerNumber) : null;
    preservedBotOwner = currentSettings && currentSettings.botOwner ? String(currentSettings.botOwner) : null;
  } catch {}
  copyRecursive(srcRoot, process.cwd(), ignore, '', copied);
  if (preservedOwner) {
    try {
      const settingsPath = path.join(process.cwd(), 'settings.js');
      if (fs.existsSync(settingsPath)) {
        let text = fs.readFileSync(settingsPath, 'utf8');
        text = text.replace(/ownerNumber:\s*'[^']*'/, `ownerNumber: '${preservedOwner}'`);
        if (preservedBotOwner) {
          text = text.replace(/botOwner:\s*'[^']*'/, `botOwner: '${preservedBotOwner}'`);
        }
        fs.writeFileSync(settingsPath, text);
      }
    } catch {}
  }
  try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch {}
  try { fs.rmSync(zipPath, { force: true }); } catch {}
  return { copiedFiles: copied };
}

async function restartProcess() {
  // Give WhatsApp WS time to flush the final message before we exit
  await new Promise(r => setTimeout(r, 2000));
  // Try pm2 first (won't work on Render but works on VPS/Heroku with pm2)
  try {
    await run('pm2 restart all');
    return;
  } catch {}
  // Render / Railway / plain Node: process.exit(0) causes Render to restart the service
  // (Render auto-restarts web services on exit; free tier has no persistent disk so
  //  sessions in /sessions folder are restored from Supabase on the next boot)
  process.exit(0);
}

module.exports = {
  command: 'update',
  aliases: ['upgrade', 'botupdate'],
  category: 'owner',
  description: 'Update bot from git or zip without stopping',
  usage: '.update [zip_url]',
  ownerOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    let progressKey = null;

    // Helper to edit the same message repeatedly
    const updateProgress = async (newText) => {
      if (progressKey) {
        // Edit the existing message
        await sock.sendMessage(chatId, { text: newText, edit: progressKey, ...channelInfo });
      } else {
        // Send the first message and store its key
        const sent = await sock.sendMessage(chatId, { text: newText, ...channelInfo }, { quoted: message });
        progressKey = sent.key;
      }
    };

    try {
      // Step 1: Initialize
      await updateProgress('⚙️ Initializing update...');

      // Step 2: Check for repository type
      await updateProgress('🔍 Checking repository...');
      const useGit = await hasGitRepo();

      let changesSummary = '';
      let versionInfo = '';

      // Step 3: Perform update
      await updateProgress(useGit ? '📦 Updating via Git...' : '📦 Updating via ZIP...');

      if (useGit) {
        const { oldRev, newRev, alreadyUpToDate, commits, files } = await updateViaGit();

        if (alreadyUpToDate) {
          changesSummary = `✅ Bot is already up to date\n🔖 Current commit: ${newRev.substring(0, 7)}`;
        } else {
          changesSummary = `✅ Updated successfully!\n\n`;
          changesSummary += `📌 Old commit: ${oldRev.substring(0, 7)}\n`;
          changesSummary += `📌 New commit: ${newRev.substring(0, 7)}\n\n`;

          if (commits) {
            const commitLines = commits.split('\n').slice(0, 5);
            changesSummary += `📝 Recent commits:\n${commitLines.map(c => `• ${c}`).join('\n')}\n\n`;
          }

          const fileCount = files ? files.split('\n').length : 0;
          changesSummary += `📁 Files changed: ${fileCount}`;
        }

        // Only run npm install if package.json changed (saves time and avoids issues)
      try { await run('npm install --no-audit --no-fund --prefer-offline'); }
      catch (npmErr) { console.warn('[update] npm install warning:', npmErr.message.slice(0,200)); }
      } else {
        const zipOverride = args[0] || null;
        const { copiedFiles } = await updateViaZip(sock, chatId, message, zipOverride);

        changesSummary = `✅ Updated from ZIP!\n\n`;
        changesSummary += `📁 Files updated: ${copiedFiles.length}`;
      }

      // Append version if available
      try {
        delete require.cache[require.resolve('../settings')];
        const newSettings = require('../settings');
        const v = newSettings.version || 'unknown';
        versionInfo = `\n\n🔖 Version: ${v}`;
      } catch {}

      // Final message before restart
      const finalText = `⚙️ ${changesSummary}${versionInfo}\n\n♻️ Restarting bot...`;
      await updateProgress(finalText);

      // Restart immediately – the restart function has its own tiny delay
      await restartProcess();

    } catch (err) {
      console.error('Update failed:', err);
      const errorText = `❌ Update failed:\n${String(err.message || err)}`;
      if (progressKey) {
        // Edit the existing message with the error
        await sock.sendMessage(chatId, { text: errorText, edit: progressKey, ...channelInfo });
      } else {
        await sock.sendMessage(chatId, { text: errorText, ...channelInfo }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading update.js:', e.message); }

/* ===== pull.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const simpleGit = require('simple-git');

module.exports = {
  command: 'gitpull',
  aliases: ['refresh', 'pull'],
  category: 'owner',
  description: 'Reload all plugins (Pull changes from git if available)',
  usage: '.gitpull',
  ownerOnly: true,

  async handler(sock, message) {
    const chatId = message.key.remoteJid;
    const commandHandler = require('../lib/commandHandler');
    const git = simpleGit();

    const start = Date.now();
    let gitStatus = 'Local reload only';

    try {
      const isRepo = await git.checkIsRepo();

      if (isRepo) {
        const remotes = await git.getRemotes(true);

        if (remotes.some(r => r.name === 'origin')) {
          await git.pull();
          gitStatus = 'Pulled from git remote';
        }
      }
    } catch (err) {
      gitStatus = 'Git unavailable, used local files';
    }

    try {
      commandHandler.reloadCommands();

      const end = Date.now();

      await sock.sendMessage(chatId, {
        text:
          `✅ Reload complete\n` +
          `🔄 Mode: ${gitStatus}\n` +
          `📦 Plugins: ${commandHandler.commands.size}\n` +
          `⏱ Time: ${end - start}ms`
      });
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `❌ Reload failed: ${error.message}`
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading pull.js:', e.message); }

/* ===== shutdown.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'shutdown',
  aliases: ['stop', 'exit'],
  category: 'owner',
  description: 'Shutdown the bot process',
  usage: '.shutdown',
  ownerOnly: true,

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;

    try {
      await sock.sendMessage(chatId, {
        text: '🔌 Shutting down... Goodbye!',
        ...channelInfo
      }, { quoted: message });

      // Give the message time to send
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    } catch (err) {
      console.error('Shutdown error:', err);
      // Even if sending fails, exit
      process.exit(1);
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading shutdown.js:', e.message); }

/* ===== clearmemory.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const memoryManager = require('../lib/memoryManager');

module.exports = {
  command: 'clearmemory',
  aliases: ['clearcache', 'freemem'],
  category: 'owner',
  description: 'Clear all caches and free memory',
  usage: '.clearmemory',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    await memoryManager.cleanupMemory();
    await sock.sendMessage(chatId, { text: '🗑️ Memory caches cleared.' }, { quoted: message });
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading clearmemory.js:', e.message); }

/* ===== prefix.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

const store = require('../lib/lightweight_store');

module.exports = {
    command: 'prefix',
    aliases: ['setprefix'],
    category: 'owner',
    description: 'Change bot prefix (owner only)',
    usage: '.prefix <new prefix>',
    ownerOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        if (args.length === 0) {
            const current = await store.getSetting('global', 'prefix') || '.';
            return await sock.sendMessage(chatId, {
                text: `🔧 *Current Prefix:* \`${current}\`\n\nUse \`.prefix <new>\` to change.`,
                ...channelInfo
            }, { quoted: message });
        }

        const newPrefix = args[0].trim();
        if (newPrefix.length > 2) {
            return await sock.sendMessage(chatId, {
                text: '❌ Prefix must be 1-2 characters.',
                ...channelInfo
            }, { quoted: message });
        }

        await store.saveSetting('global', 'prefix', newPrefix);
        // Update settings.prefixes to only this prefix
        const settings = require('../settings');
        settings.prefixes = [newPrefix];

        await sock.sendMessage(chatId, {
            text: `✅ Prefix changed to \`${newPrefix}\``,
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading prefix.js:', e.message); }

/* ===== panel.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *  REDX BOT — .panel command  (ULTRA V4)
 *  ZERO password visibility in chat – default redx2008 (never shown)
 *  - Auto-delete all password messages
 *  - Enterprise session management, broadcast, backup
 *  - No "default password" text anywhere
 *****************************************************************************/

'use strict';
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');
const os      = require('os');
const store   = require('../lib/lightweight_store');

const PANEL_CONFIG_PATH = path.join(__dirname, '../data/panel.json');
const PANEL_LOG_PATH    = path.join(__dirname, '../data/panel_log.json');
const HAS_DB = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.DB_URL);

// In-memory sessions
const sessions  = new Map();
const SESSION_TTL = 15 * 60 * 1000;
const MAX_FAILS   = 5;
const LOCKOUT_TTL = 30 * 60 * 1000;

/* ─── Secure helpers ───────────────────────────────────────────────────── */
function hashPass(raw) {
    return crypto.createHash('sha256').update(raw + 'redxsalt2026').digest('hex');
}

// Initial default password = redx2008 (but NEVER shown in chat)
const DEFAULT_PASS_HASH = hashPass('redx2008');

async function deleteMsg(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, { delete: message.key });
    } catch {}
}

async function loadPanelConfig() {
    try {
        if (HAS_DB) {
            const cfg = await store.getSetting('global', 'panel_ultra');
            return cfg || { password: DEFAULT_PASS_HASH, locked: false, failCounts: {} };
        }
        if (!fs.existsSync(PANEL_CONFIG_PATH)) {
            return { password: DEFAULT_PASS_HASH, locked: false, failCounts: {} };
        }
        const data = JSON.parse(fs.readFileSync(PANEL_CONFIG_PATH, 'utf8'));
        // Migrate old empty password? If empty, set default
        if (!data.password) data.password = DEFAULT_PASS_HASH;
        return data;
    } catch { return { password: DEFAULT_PASS_HASH, locked: false, failCounts: {} }; }
}

async function savePanelConfig(cfg) {
    try {
        if (HAS_DB) return await store.saveSetting('global', 'panel_ultra', cfg);
        const dir = path.dirname(PANEL_CONFIG_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(PANEL_CONFIG_PATH, JSON.stringify(cfg, null, 2));
    } catch (e) { console.error('[PANEL] save error:', e.message); }
}

function addLog(senderId, action) {
    try {
        let logs = [];
        if (fs.existsSync(PANEL_LOG_PATH)) {
            logs = JSON.parse(fs.readFileSync(PANEL_LOG_PATH, 'utf8') || '[]');
        }
        logs.unshift({ ts: new Date().toISOString(), user: senderId.split('@')[0], action });
        if (logs.length > 100) logs = logs.slice(0, 100);
        fs.writeFileSync(PANEL_LOG_PATH, JSON.stringify(logs, null, 2));
    } catch {}
}

function getLogs() {
    try {
        if (!fs.existsSync(PANEL_LOG_PATH)) return [];
        return JSON.parse(fs.readFileSync(PANEL_LOG_PATH, 'utf8') || '[]');
    } catch { return []; }
}

function isUnlocked(senderId) {
    const s = sessions.get(senderId);
    if (!s) return false;
    if (Date.now() > s.expires) { sessions.delete(senderId); return false; }
    return s.unlocked;
}

function unlock(senderId) {
    sessions.set(senderId, { unlocked: true, expires: Date.now() + SESSION_TTL });
}

function refreshSession(senderId) {
    const s = sessions.get(senderId);
    if (s) s.expires = Date.now() + SESSION_TTL;
}

/* ─── System stats ────────────────────────────────────────────────────── */
function getStats() {
    const uptime  = process.uptime();
    const mem     = process.memoryUsage();
    const free    = os.freemem();
    const total   = os.totalmem();
    const uptimeH = Math.floor(uptime / 3600);
    const uptimeM = Math.floor((uptime % 3600) / 60);
    const uptimeS = Math.floor(uptime % 60);
    const cpuCores = os.cpus().length;
    const loadAvg = os.loadavg().map(l => l.toFixed(2)).join(', ');
    return (
        `📊 *BOT HEALTH*\n` +
        `⏱ Uptime: ${uptimeH}h ${uptimeM}m ${uptimeS}s\n` +
        `🧠 Heap: ${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB\n` +
        `💾 Free RAM: ${Math.round(free / 1024 / 1024)}MB / ${Math.round(total / 1024 / 1024)}MB\n` +
        `🖥️ CPU cores: ${cpuCores}  |  Load: ${loadAvg}\n` +
        `📱 Platform: ${os.platform()} ${os.arch()}\n` +
        `🔢 Node: ${process.version}  |  PID: ${process.pid}`
    );
}

/* ─── ULTRA MENU (NO PASSWORD HINTS) ──────────────────────────────────── */
function panelMenu() {
    return `╔══════════════════════════════╗
║  ⚡  R E D X  P A N E L  ⚡  ║
║        ULTRA V4 — Zero Leak    ║
╚══════════════════════════════╝

*⚙️ BOT CONTROLS*
├ \`.panel restart\` – Restart bot
├ \`.panel stop\` – Shutdown
├ \`.panel status\` – Stats + health
├ \`.panel cleartmp\` – Clear temp
├ \`.panel clearmem\` – Force GC
├ \`.panel broadcast <msg>\` – Announce to all chats

*👥 USER MANAGEMENT*
├ \`.panel ban <num>\` – Ban user
├ \`.panel unban <num>\` – Unban
├ \`.panel sudo add/remove/list <num>\`
├ \`.panel listbanned\` – Show banned

*🔐 SECURITY & SESSIONS*
├ \`.panel changepass <new>\` – Change password
├ \`.panel lock\` – Lock your session
├ \`.panel sessions\` – View active logins
├ \`.panel killall\` – Logout all sessions
├ \`.panel emergency\` – Global lockdown

*💾 ADVANCED*
├ \`.panel backup\` – Export config
├ \`.panel log\` – Activity log
├ \`.panel setname/prefix/owner/mode\`

*ℹ️ INFO*
└ Session auto-lock: 15 min
└ All password attempts are auto‑deleted`;
}

/* ─── Broadcast helper ────────────────────────────────────────────────── */
async function broadcastToAll(sock, text, ownerJid) {
    const chats = sock.chats || new Map();
    let sent = 0;
    for (const [jid] of chats) {
        if (jid.endsWith('@g.us') || jid.endsWith('@s.whatsapp.net')) {
            try {
                await sock.sendMessage(jid, { text: `📢 *BROADCAST*\n\n${text}` });
                sent++;
                await new Promise(r => setTimeout(r, 500));
            } catch {}
        }
    }
    return sent;
}

/* ─── Main handler ────────────────────────────────────────────────────── */
module.exports = {
    command: 'panel',
    aliases: ['admin-panel', 'cp', 'control'],
    category: 'owner',
    description: 'ULTRA secure admin panel – no password ever shown',
    usage: '.panel <password>  or  .panel <command>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId    = context.chatId || message.key.remoteJid;
        const senderId  = (message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};
        const settings  = require('../settings');

        const reply = (text) =>
            sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        let cfg = await loadPanelConfig();

        // Emergency lock
        if (cfg.emergencyLock && !isUnlocked(senderId)) {
            return reply(`🚨 *PANEL EMERGENCY LOCKED*\nAll sessions revoked. Use \`.panel <password> emergency-unlock\` if you are owner.`);
        }

        // Lockout check
        const failInfo = cfg.failCounts?.[senderId];
        if (failInfo && failInfo.count >= MAX_FAILS && (Date.now() - failInfo.lastFail) < LOCKOUT_TTL) {
            const remaining = Math.ceil((LOCKOUT_TTL - (Date.now() - failInfo.lastFail)) / 60000);
            return reply(`🔒 Too many failures – locked for ${remaining} min.`);
        }

        // No args – show menu if unlocked, else ask for password (NO default hint)
        if (!args.length) {
            if (isUnlocked(senderId)) {
                refreshSession(senderId);
                return reply(panelMenu());
            }
            // Absolutely no mention of any default password
            return reply(`🔐 *REDX PANEL*\n\nSend \`.panel <password>\` to access.\n_${MAX_FAILS} wrong attempts = lockout_`);
        }

        const sub = args[0].toLowerCase();

        // ─── UNLOCK ATTEMPT (password) ─────────────────────────────────
        if (!isUnlocked(senderId)) {
            const attempt = args[0];
            const correct = cfg.password === hashPass(attempt);

            // DELETE the password message immediately
            await deleteMsg(sock, chatId, message);

            if (correct) {
                if (cfg.failCounts?.[senderId]) delete cfg.failCounts[senderId];
                await savePanelConfig(cfg);
                unlock(senderId);
                addLog(senderId, 'UNLOCKED');
                await reply(`✅ *Panel unlocked* — session 15 min.\n\n` + panelMenu());
                if (args[1] === 'emergency-unlock') {
                    cfg.emergencyLock = false;
                    await savePanelConfig(cfg);
                    await reply('🔓 Emergency lock cleared.');
                }
                return;
            } else {
                if (!cfg.failCounts) cfg.failCounts = {};
                cfg.failCounts[senderId] = {
                    count: (cfg.failCounts[senderId]?.count || 0) + 1,
                    lastFail: Date.now()
                };
                await savePanelConfig(cfg);
                const left = MAX_FAILS - cfg.failCounts[senderId].count;
                return reply(`❌ Wrong password.\n${left > 0 ? `${left} attempt(s) left` : 'Locked out for 30 min.'}`);
            }
        }

        // ─── ALREADY UNLOCKED ──────────────────────────────────────────
        refreshSession(senderId);
        addLog(senderId, sub + (args[1] ? ' ' + args[1] : ''));

        // HELP
        if (sub === 'help') return reply(panelMenu());

        // STATUS
        if (sub === 'status') return reply(getStats());

        // LOG
        if (sub === 'log') {
            const logs = getLogs();
            if (!logs.length) return reply('📭 No log entries.');
            const lines = logs.slice(0, 20).map(l =>
                `[${l.ts.slice(0,19).replace('T',' ')}] *${l.user}* → ${l.action}`
            ).join('\n');
            return reply(`📋 *Activity Log (last 20)*\n\n${lines}`);
        }

        // CLEARTMP
        if (sub === 'cleartmp') {
            try {
                const tmpDir = path.join(process.cwd(), 'temp');
                if (fs.existsSync(tmpDir)) {
                    let count = 0;
                    for (const f of fs.readdirSync(tmpDir)) {
                        try { fs.unlinkSync(path.join(tmpDir, f)); count++; } catch {}
                    }
                    return reply(`🗑️ Deleted ${count} temp file(s).`);
                }
                return reply('📁 Temp folder empty.');
            } catch (e) { return reply(`❌ ${e.message}`); }
        }

        // CLEARMEM
        if (sub === 'clearmem') {
            if (global.gc) { global.gc(); return reply('✅ Garbage collector triggered.'); }
            return reply('⚠️ Run node with --expose-gc to enable GC.');
        }

        // RESTART / STOP
        if (sub === 'restart') {
            await reply('🔄 Restarting...');
            setTimeout(() => process.exit(0), 1000);
            return;
        }
        if (sub === 'stop') {
            await reply('🛑 Shutting down.');
            setTimeout(() => process.exit(0), 1000);
            return;
        }

        // EMERGENCY LOCK
        if (sub === 'emergency') {
            cfg.emergencyLock = true;
            await savePanelConfig(cfg);
            sessions.clear();
            return reply('🚨 *EMERGENCY LOCK* – all sessions revoked.\nUnlock: `.panel <pass> emergency-unlock`');
        }

        // SESSION MANAGEMENT
        if (sub === 'sessions') {
            const active = [...sessions.entries()].filter(([_, s]) => Date.now() < s.expires);
            if (!active.length) return reply('📭 No active sessions.');
            const list = active.map(([id, s]) => {
                const expiry = Math.floor((s.expires - Date.now()) / 1000);
                return `👤 ${id.split('@')[0]}  (${expiry}s left)`;
            }).join('\n');
            return reply(`*Active panel sessions:*\n${list}`);
        }
        if (sub === 'killall') {
            sessions.clear();
            return reply('🔒 All sessions terminated.');
        }
        if (sub === 'lock' || sub === 'logout') {
            sessions.delete(senderId);
            return reply('🔒 Your session is locked. Send `.panel <password>` to re-enter.');
        }

        // CHANGE PASSWORD (auto‑delete)
        if (sub === 'changepass' || sub === 'setpass') {
            const newPass = args[1];
            if (!newPass || newPass.length < 6) return reply('❌ New password must be ≥6 characters.');
            cfg.password = hashPass(newPass);
            await savePanelConfig(cfg);
            await deleteMsg(sock, chatId, message);
            // Mask the new password when showing confirmation
            const masked = newPass[0] + '*'.repeat(newPass.length - 2) + newPass[newPass.length - 1];
            return reply(`✅ Password changed.\n_New password: ${masked}_\n⚠️ Keep it secret.`);
        }

        // BROADCAST
        if (sub === 'broadcast') {
            const msg = args.slice(1).join(' ');
            if (!msg) return reply('❌ Usage: `.panel broadcast <message>`');
            const sent = await broadcastToAll(sock, msg, settings.ownerNumber);
            return reply(`📢 Broadcast sent to ${sent} chat(s).`);
        }

        // BACKUP
        if (sub === 'backup') {
            const backup = {
                timestamp: new Date().toISOString(),
                config: cfg,
                settings: { owner: settings.ownerNumber, prefixes: settings.prefixes, mode: global.MODE }
            };
            const backupPath = path.join(__dirname, '../data/backup_panel.json');
            fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
            return reply(`💾 Backup saved to \`data/backup_panel.json\``);
        }

        // BAN / UNBAN / LISTBANNED
        if (sub === 'ban') {
            const num = (args[1] || '').replace(/[^0-9]/g, '');
            if (!num) return reply('❌ Usage: `.panel ban <number>`');
            const banStore = require('../lib/isBanned');
            await banStore.banUser?.(`${num}@s.whatsapp.net`);
            return reply(`🚫 Banned: +${num}`);
        }
        if (sub === 'unban') {
            const num = (args[1] || '').replace(/[^0-9]/g, '');
            if (!num) return reply('❌ Usage: `.panel unban <number>`');
            const banStore = require('../lib/isBanned');
            await banStore.unbanUser?.(`${num}@s.whatsapp.net`);
            return reply(`✅ Unbanned: +${num}`);
        }
        if (sub === 'listbanned') {
            const banStore = require('../lib/isBanned');
            const list = await banStore.getBannedList?.() || [];
            if (!list.length) return reply('📭 No banned users.');
            return reply(`🚫 *Banned (${list.length})*\n${list.map(j => `+${j.split('@')[0]}`).join('\n')}`);
        }

        // SUDO MANAGEMENT
        if (sub === 'sudo') {
            const action = args[1]?.toLowerCase();
            const num = (args[2] || '').replace(/[^0-9]/g, '');
            const s = require('../settings');
            if (action === 'add') {
                if (!num) return reply('❌ Usage: `.panel sudo add <number>`');
                if (!s.sudoNumbers) s.sudoNumbers = [];
                const jid = `${num}@s.whatsapp.net`;
                if (!s.sudoNumbers.includes(jid)) s.sudoNumbers.push(jid);
                return reply(`✅ Sudo added: +${num}`);
            }
            if (action === 'remove') {
                if (!num) return reply('❌ Usage: `.panel sudo remove <number>`');
                s.sudoNumbers = (s.sudoNumbers || []).filter(j => !j.includes(num));
                return reply(`✅ Sudo removed: +${num}`);
            }
            if (action === 'list') {
                const list = s.sudoNumbers || [];
                if (!list.length) return reply('📭 No sudo users.');
                return reply(`🔑 *Sudo list*\n${list.map(j => `+${j.split('@')[0]}`).join('\n')}`);
            }
            return reply('❌ `.panel sudo add/remove/list <number>`');
        }
        if (sub === 'listsudo') {
            const s = require('../settings');
            const list = s.sudoNumbers || [];
            if (!list.length) return reply('📭 No sudo users.');
            return reply(`🔑 *Sudo users*\n${list.map(j => `+${j.split('@')[0]}`).join('\n')}`);
        }

        // MODE
        if (sub === 'mode') {
            const newMode = args[1]?.toLowerCase();
            const valid = ['public', 'private', 'groups', 'inbox', 'self'];
            if (!valid.includes(newMode)) return reply(`❌ Mode must be: ${valid.join(', ')}`);
            const cfg2 = require('../config');
            cfg2.saveMode?.(newMode);
            global.MODE = newMode;
            const store2 = require('../lib/lightweight_store');
            await store2.setBotMode(newMode).catch(() => {});
            if (typeof global._bustSpeedCache === 'function') global._bustSpeedCache();
            return reply(`✅ Bot mode → *${newMode.toUpperCase()}*`);
        }

        // SETNAME / SETPREFIX / SETOWNER
        if (sub === 'setname') {
            const name = args.slice(1).join(' ').trim();
            if (!name) return reply('❌ Usage: `.panel setname <name>`');
            try {
                await sock.updateProfileName(name);
                return reply(`✅ Bot name set to *${name}*`);
            } catch (e) { return reply(`❌ ${e.message}`); }
        }
        if (sub === 'setprefix') {
            const prefix = args[1];
            if (!prefix) return reply('❌ Usage: `.panel setprefix <symbol>`');
            settings.prefixes = [prefix];
            return reply(`✅ Prefix changed to \`${prefix}\``);
        }
        if (sub === 'setowner') {
            const num = (args[1] || '').replace(/[^0-9]/g, '');
            if (!num) return reply('❌ Usage: `.panel setowner <number>`');
            settings.ownerNumber = num;
            return reply(`✅ Owner changed to +${num}`);
        }

        // DEFAULT – show menu
        return reply(panelMenu());
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading panel.js:', e.message); }

/* ===== staff.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'staff',
  aliases: ['admins', 'adminlist'],
  category: 'group',
  description: 'Display list of group admins',
  usage: '.staff',
  groupOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const groupMetadata = await sock.groupMetadata(chatId);
      
      let pp;
      try {
        pp = await sock.profilePictureUrl(chatId, 'image');
      } catch {
        pp = 'https://i.imgur.com/2wzGhpF.jpeg';
      }
      
      const participants = groupMetadata.participants;
      const groupAdmins = participants.filter(p => p.admin);
      const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n▢ ');

      const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

      const text = `
≡ *GROUP ADMINS* _${groupMetadata.subject}_

┌─⊷ *ADMINS*
▢ ${listAdmin}
└───────────
`.trim();

      await sock.sendMessage(chatId, {
        image: { url: pp },
        caption: text,
        mentions: [...groupAdmins.map(v => v.id), owner],
        ...channelInfo
      });

    } catch (error) {
      console.error('Error in staff command:', error);
      await sock.sendMessage(chatId, { 
        text: 'Failed to get admin list!',
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading staff.js:', e.message); }

/* ===== repo.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const settings = require('../settings');
const axios = require('axios');

const REPO_IMAGE_URL = 'https://d.uguu.se/rdsobzqr.jpg'; // same image as menu

module.exports = {
  command: 'repo',
  aliases: ['repository', 'github'],
  category: 'main',
  description: 'Show JUNAID-MD↣³⁰² repository information',
  usage: '.repo',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;

    // Build repository information text with emojis
    let repoText = `╭─〔 *JUNAID-MD↣³⁰² REPOSITORY* 〕─⊷\n`;
    repoText += `│\n`;
    repoText += `├─ 📌 *Repository Name:* JUNAID-MD↣³⁰²\n`;
    repoText += `├─ 👑 *Owner:* JUNAID-MD↣³⁰² & JUNAID-MD↣³⁰²\n`;
    repoText += `├─ ⭐ *Stars:* 100+\n`;
    repoText += `├─ ⑂ *Forks:* 50+\n`;
    repoText += `├─ 📝 *Description:* Advanced WhatsApp Bot with 100+ features – group management, downloads, AI, stickers, and more.\n`;
    repoText += `│\n`;
    repoText += `├─ 🔗 *GitHub Link:*\n`;
    repoText += `│   https://github.com/AbdulRehman19721986/redxbot302\n`;
    repoText += `│\n`;
    repoText += `├─ 🤖 *Pair Link:*\n`;
    repoText += `│   http://redxpair.gt.tc\n`;
    repoText += `│\n`;
    repoText += `├─ 🌐 *Join Channel:*\n`;
    repoText += `│   https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f\n`;
    repoText += `╰───────────────────⊷\n\n`;
    repoText += `✨ *Powered by JUNAID-MD↣³⁰² & JUNAID-MD↣³⁰²* ✨\n`;
    repoText += `🔗 *Join Channel:* https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f`;

    // Fetch image buffer
    let imageBuffer;
    try {
      const response = await axios.get(REPO_IMAGE_URL, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(response.data);
    } catch (err) {
      console.error('Failed to fetch repo image:', err.message);
      // Fallback: send only text
      return await sock.sendMessage(chatId, {
        text: repoText,
        ...channelInfo
      }, { quoted: message });
    }

    // Send image with caption
    await sock.sendMessage(chatId, {
      image: imageBuffer,
      caption: repoText,
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading repo.js:', e.message); }

/* ===== source.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
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
  command: 'getpage',
  aliases: ['source', 'viewsource'],
  category: 'tools',
  description: 'Get the raw HTML source of a website',
  usage: '.getpage <url>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args[0];

    if (!url || !url.startsWith('http')) {
      return await sock.sendMessage(chatId, { text: 'Provide a valid URL (include http/https).' }, { quoted: message });
    }

    try {
      await sock.sendMessage(chatId, { text: '🌐 *Fetching source code...*' });
      
      const res = await axios.get(url);
      const html = res.data;
      const buffer = Buffer.from(html, 'utf-8');

      await sock.sendMessage(chatId, { 
        document: buffer, 
        mimetype: 'text/html', 
        fileName: 'source.html',
        caption: `*Source code for:* ${url}`
      }, { quoted: message });

    } catch (err) {
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch source. The site might be protected.' });
    }
  }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading source.js:', e.message); }

/* ===== on.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}};

    module.exports = {
      command: 'on',
      aliases: ['restart', 'reboot'],
      category: 'owner',
      description: 'Keep the bot running safely on Railway',
      usage: '.on',
      ownerOnly: true,

      async handler(sock, message, args, context = {}) {
        const { chatId, channelInfo } = context;

        try {
          // Railway-safe: NEVER call pm2 or process.exit() here.
          // This command only confirms that the bot is online.
          await sock.sendMessage(
            chatId,
            {
              text: '🟢 Bot is already ON and running safely on Railway.\n\n♻️ No process restart was performed.',
              ...channelInfo
            },
            { quoted: message }
          );
        } catch (err) {
          console.error('[ON] Safe response error:', err);
        }
      }
    };

    return module.exports;
  })();

  if (_m) {
    if (Array.isArray(_m)) {
      _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function'));
    } else if (_m.command && typeof _m.handler === 'function') {
      _bundle.push(_m);
    } else {
      for (const k of Object.keys(_m)) {
        const v = _m[k];
        if (Array.isArray(v)) {
          _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function'));
        }
      }
    }
  }
} catch(e) {
  console.warn('[BUNDLE:cat-11-owner] Error loading on.js:', e.message);
}

/* ===== delplugin.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { join } = require('path');
const { unlinkSync, readdirSync } = require('fs');

module.exports = {
  command: 'delplugin',
  aliases: ['deleteplugin', 'rmplugin'],
  category: 'owner',
  description: 'Delete a plugin by name (owner only)',
  usage: '.delplugin <plugin_name>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      if (!args || !args[0]) {
        return await sock.sendMessage(chatId, { 
          text: `*🌟Example usage:*\n.delplugin main-menu` 
        }, { quoted: message });
      }

      const pluginDir = join(__dirname, '..', 'plugins');
      const pluginFiles = readdirSync(pluginDir).filter(f => f.endsWith('.js'));
      const pluginNames = pluginFiles.map(f => f.replace('.js', ''));

      if (!pluginNames.includes(args[0])) {
        return await sock.sendMessage(chatId, {
          text: `🗃️ This plugin doesn't exist!\n\nAvailable plugins:\n${pluginNames.join('\n')}`
        }, { quoted: message });
      }

      const filePath = join(pluginDir, args[0] + '.js');
      unlinkSync(filePath);

      await sock.sendMessage(chatId, { text: `⚠️ Plugin "${args[0]}.js" has been deleted.` }, { quoted: message });

    } catch (err) {
      console.error('rmplugin error:', err);
      await sock.sendMessage(chatId, {  text: `❌ Failed to delete plugin: ${err.message}` 
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading delplugin.js:', e.message); }

/* ===== installplugin.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'addplugin',
  aliases: ['installplugin', 'install'],
  category: 'owner',
  description: 'Install a plugin from a GitHub Gist URL (owner only)',
  usage: '.addplugin <Gist URL>',

  /**
   * @param {object} sock - Baileys sock
   * @param {object} message - the original message object
   * @param {Array} args - command arguments
   * @param {object} context - additional context
   */
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    const text = args?.[0];
    if (!text) {
      return await sock.sendMessage(chatId, { 
        text: 'Please provide a plugin URL.\nExample: .addplugin https://gist.github.com/username/gistid' 
      }, { quoted: message });
    }

    const gistMatch = text.match(/(?:\/|gist\.github\.com\/)([a-fA-F0-9]+)/);
    if (!gistMatch) {
      return await sock.sendMessage(chatId, { text: '❌ Invalid plugin URL.' }, { quoted: message });
    }

    const gistId = gistMatch[1];
    const gistURL = `https://api.github.com/gists/${gistId}`;

    try {
      const response = await axios.get(gistURL);
      const gistData = response.data;

      if (!gistData || !gistData.files) {
        return await sock.sendMessage(chatId, { text: '❌ No valid files found in the Gist.' }, { quoted: message });
      }

      const pluginDir = path.join(__dirname, '..', 'plugins');

      for (const file of Object.values(gistData.files)) {
        const pluginName = file.filename;
        const pluginPath = path.join(pluginDir, pluginName);

        await fs.promises.writeFile(pluginPath, file.content);
      }

      await sock.sendMessage(chatId, { text: '*✅ Successfully installed plugin from Gist.*' }, { quoted: message });
    } catch (error) {
      console.error('install plugin error:', error);
      await sock.sendMessage(chatId, { text: `❌ Error fetching or saving the plugin: ${error.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading installplugin.js:', e.message); }

/* ===== getplugin.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
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


const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'inspect',
  aliases: ['cat', 'readcode', 'getplugin'],
  category: 'owner',
  description: 'Read the source code of a specific plugin',
  usage: '.inspect [plugin_name]',
  ownerOnly: 'true',

  async handler(sock, message, args, context = {}) {
    const chatId = message.key.remoteJid;

    const pluginName = args[0];
    if (!pluginName) {
      return await sock.sendMessage(chatId, { text: 'Which plugin do you want to inspect? Example: *.inspect convert*' }, { quoted: message });
    }

    try {
      const pluginsDir = path.join(__dirname, '../plugins');
      
      const fileName = pluginName.endsWith('.js') ? pluginName : `${pluginName}.js`;
      const filePath = path.join(pluginsDir, fileName);

      if (!fs.existsSync(filePath)) {
        return await sock.sendMessage(chatId, { text: `❌ Plugin "${fileName}" not found.` }, { quoted: message });
      }

      const code = fs.readFileSync(filePath, 'utf8');

      const formattedCode = `💻 *SOURCE CODE: ${fileName}*\n\n\`\`\`javascript\n${code}\n\`\`\``;

      if (formattedCode.length > 4000) {
        await sock.sendMessage(chatId, {
          document: Buffer.from(code),
          fileName: fileName,
          mimetype: 'text/javascript',
          caption: `📄 Code for *${fileName}* (File too large for text message)`
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: formattedCode }, { quoted: message });
      }

    } catch (error) {
      console.error('Inspect Error:', error);
      await sock.sendMessage(chatId, { text: '❌ Failed to read the plugin file.' });
    }
  }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading getplugin.js:', e.message); }

/* ===== listplugins.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = [{
  pattern: "listplugins",
  alias: ["plugins", "cmdlist"],
  desc: "List all loaded commands",
  category: "utility",
  react: "📋",
  filename: __filename,
  use: ".listplugins",
  execute: async (conn, mek, m, { from, reply }) => {
    if (!global.commands) {
      return reply("❌ Commands map not found. Make sure global.commands is set.");
    }

    const allCommands = Array.from(global.commands.keys()).sort();
    const total = allCommands.length;

    // Send in chunks to avoid message too long
    const chunkSize = 30;
    for (let i = 0; i < allCommands.length; i += chunkSize) {
      const chunk = allCommands.slice(i, i + chunkSize);
      await conn.sendMessage(from, {
        text: `📋 *Loaded Commands (${total} total)*\n\n${chunk.map(cmd => `• ${cmd}`).join('\n')}`
      }, { quoted: mek });
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
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading listplugins.js:', e.message); }

/* ===== loop.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
    command: 'loop',
    aliases: ['repeat'],
    category: 'owner',
    description: 'Repeat a message multiple times (all in one message)',
    usage: '.loop <count> <message>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        if (args.length < 2) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Usage:* `.loop <count> <message>`\n\nExample: `.loop 5 Hello everyone!`' 
            }, { quoted: message });
            return;
        }

        const count = parseInt(args[0], 10);
        if (isNaN(count) || count <= 0 || count > 1000) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Invalid count* (must be between 1 and 1000)' 
            }, { quoted: message });
            return;
        }

        const messageText = args.slice(1).join(' ');
        if (!messageText.trim()) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Message cannot be empty*' 
            }, { quoted: message });
            return;
        }

        // Build a single message with repeated lines
        const repeatedLines = Array(count).fill(messageText).join('\n');
        // Send as plain text – no channelInfo, no extra context
        await sock.sendMessage(chatId, { text: repeatedLines }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading loop.js:', e.message); }

/* ===== memory.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

// ==================== Game Logic ====================
const symbols = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼']; // 8 pairs

class Memory {
    constructor() {
        // Create 4x4 board with pairs
        let cards = [...symbols.slice(0,8), ...symbols.slice(0,8)];
        this.board = this.shuffle(cards);
        this.revealed = Array(16).fill(false);
        this.matched = Array(16).fill(false);
        this.selected = null; // index of first card flipped
        this.gameOver = false;
    }

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    flip(index) {
        if (this.gameOver) return { error: 'Game already ended' };
        if (index < 0 || index >= 16) return { error: 'Invalid card index (1-16)' };
        if (this.matched[index]) return { error: 'That card is already matched' };
        if (this.revealed[index]) return { error: 'Card already flipped' };

        if (this.selected === null) {
            // first card flipped
            this.revealed[index] = true;
            this.selected = index;
            return { success: true, state: 'first' };
        } else {
            // second card flipped
            this.revealed[index] = true;

            // Check match
            if (this.board[this.selected] === this.board[index]) {
                // Match found
                this.matched[this.selected] = true;
                this.matched[index] = true;
                this.revealed[this.selected] = true;
                this.revealed[index] = true;
                this.selected = null;

                // Check win
                if (this.matched.every(v => v)) {
                    this.gameOver = true;
                    return { success: true, win: true };
                }
                return { success: true, match: true };
            } else {
                // No match, will flip back after showing
                return { success: true, match: false, first: this.selected, second: index };
            }
        }
    }

    // Call after showing mismatch to flip back
    resetMismatch(first, second) {
        this.revealed[first] = false;
        this.revealed[second] = false;
        this.selected = null;
    }

    getDisplayBoard() {
        let str = '```\n    1   2   3   4\n';
        for (let r = 0; r < 4; r++) {
            str += ` ${r+1}  `;
            for (let c = 0; c < 4; c++) {
                const idx = r*4 + c;
                if (this.matched[idx]) {
                    str += this.board[idx] + '  ';
                } else if (this.revealed[idx]) {
                    str += this.board[idx] + '  ';
                } else {
                    str += '⬛  ';
                }
            }
            str += '\n';
        }
        str += '```';
        return str;
    }
}

// ==================== Storage ====================
const games = new Map(); // key = `memory-${chatId}:${player}`

module.exports = {
    command: 'memory',
    aliases: ['mem'],
    category: 'games',
    description: 'Flip cards to find matching pairs.',
    usage: 
        '.mem start                  – Start a new game\n' +
        '.mem flip <card>             – Flip a card (1-16, left to right, top to bottom)\n' +
        '.mem guide                    – Show game guide',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const reply = async (text) => 
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            return await reply(
                `🧠 *Memory Match Commands*\n\n` +
                `• \`.mem start\` – New game\n` +
                `• \`.mem flip <card>\` – Flip a card (1-16)\n` +
                `• \`.mem guide\` – Show guide`
            );
        }

        const subCmd = args[0].toLowerCase();

        if (subCmd === 'guide') {
            return await reply(
                `📖 *Memory Match Guide*\n\n` +
                `1. Start a game: \`.mem start\`\n` +
                `2. Cards are numbered 1-16 (left to right, top to bottom)\n` +
                `3. Flip two cards: \`.mem flip 5\` then \`.mem flip 8\`\n` +
                `4. If they match, they stay revealed\n` +
                `5. If not, they flip back after a short delay\n` +
                `6. Match all 8 pairs to win!`
            );
        }

        // Find existing game
        let gameKey = null;
        let game = null;
        for (let [key, g] of games.entries()) {
            if (key.startsWith(`memory-${chatId}:${senderId}`)) {
                gameKey = key;
                game = g;
                break;
            }
        }

        if (subCmd === 'start') {
            if (game) games.delete(gameKey);
            const newGame = new Memory();
            const newKey = `memory-${chatId}:${senderId}-${Date.now()}`;
            games.set(newKey, newGame);
            return await reply(
                `🧠 *Memory Match Started!*\n\n${newGame.getDisplayBoard()}\n\nFlip cards with \`.mem flip <card>\``
            );
        }

        if (!game) return await reply('❌ No game in progress. Start one with `.mem start`');

        if (subCmd === 'flip') {
            if (args.length < 2) return await reply('❌ Usage: `.mem flip <card>`');
            const card = parseInt(args[1]);
            if (isNaN(card) || card < 1 || card > 16) return await reply('❌ Card must be between 1 and 16.');

            const result = game.flip(card - 1);
            if (result.error) return await reply(`❌ ${result.error}`);

            if (result.win) {
                games.delete(gameKey);
                return await reply(`🎉 *You Win!*\n\n${game.getDisplayBoard()}`);
            }

            if (result.match === false) {
                // Show mismatch, then flip back after 2 seconds
                await reply(`No match!\n\n${game.getDisplayBoard()}`);
                setTimeout(() => {
                    game.resetMismatch(result.first, result.second);
                    sock.sendMessage(chatId, { text: game.getDisplayBoard(), ...channelInfo });
                }, 2000);
                return;
            }

            await reply(game.getDisplayBoard());
            return;
        }

        await reply('❌ Unknown subcommand. Use `.mem guide` for help.');
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-11-owner] Error loading memory.js:', e.message); }

module.exports = _bundle;