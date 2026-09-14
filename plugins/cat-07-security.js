'use strict';
const { resolveLidNum, cleanJid } = require('../lib/senderResolver');

async function resolveRemovalJidLegacy(sock, chatId, message, senderId) {
  const raw = message?.key?.participant || senderId || '';
  const rawNum = cleanJid(raw);
  if (String(raw).includes('@s.whatsapp.net')) return raw;
  try {
    const r = rawNum ? await resolveLidNum(rawNum, sock, chatId) : null;
    if (r && String(r).includes('@s.whatsapp.net')) return r;
  } catch {}
  try {
    const meta = await (sock.groupMetadataFresh || sock.groupMetadata)(chatId);
    const p = (meta?.participants || []).find(x =>
      cleanJid(x?.id || '') === rawNum ||
      cleanJid(x?.lid || '') === rawNum ||
      cleanJid(x?.phoneNumber || x?.pn || '') === rawNum ||
      x?.id === raw || x?.lid === raw || x?.phoneNumber === raw || x?.pn === raw
    );
    // LID-addressed groups can expose id=@lid; use phoneNumber/pn as the
    // authoritative @s.whatsapp.net JID for groupParticipantsUpdate(remove).
    if (p?.phoneNumber && String(p.phoneNumber).includes('@s.whatsapp.net')) return p.phoneNumber;
    if (p?.pn && String(p.pn).includes('@s.whatsapp.net')) return p.pn;
    if (p?.id && String(p.id).includes('@s.whatsapp.net')) return p.id;
  } catch {}
  return null;
}

// AUTO-GENERATED BUNDLE: cat-07-security
// Contains: antibadword.js, antibot.js, anticall.js, antidelete.js, antiedit.js, antiflood.js, antilink.js, antispam.js, antitag.js, block-unblock.js, warn.js, warnings.js, groupguard.js, pmblocker.js

const _bundle = [];


/* ===== antibadword.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /**
 * plugins/antibadword.js — JUNAID-MD↣³⁰² v3 ULTRA
 * ✅ 100+ bad words (50 default + 50 extra, 10 languages)
 * ✅ Leet-speak + repeat normalization
 * ✅ Warn → kick system with mute fallback
 * ✅ Whitelist users/roles
 * ✅ O(1) Set lookup via lib/antibadword engine
 * ✅ Auto-reset warnings per session
 */
'use strict';

const store = require('../lib/lightweight_store');

/* ═══ Pull engine from lib/antibadword (50 default words + leet) ═══ */
let _engine = null;
function getEngine() {
  if (_engine) return _engine;
  try { _engine = require('../lib/antibadword'); } catch { _engine = {}; }
  return _engine;
}

/* ═══ 50 extra words (fills to 100+ total with lib's 50) ═══════════ */
const EXTRA_BAD_WORDS = [
  // English
  'nigger','nigga','faggot','dyke','spic','kike','chink','gook','wetback',
  'tranny','cripple','spaz','mong','gimp','beaner','darkie','redneck',
  // Urdu/Hindi extended
  'teri_maa','bakrichod','bhen_ki_aankh','gaand_maar','tere_baap','kutiya',
  'suar','kamina','haramkhor','ullu','gadha','gdhay',
  // Arabic extended
  'ibn haram','kalb','hmar','zebbi','ya ibn el',
  // Spanish extended
  'marica','chingao','putamadre','culero','mamón','panocha',
  // Russian
  'blyad','pizda','huy','suka','mudak','zalupa',
  // Indonesian extended
  'asu','keparat','celeng','tai','ngentot','jancok',
  // Turkish extended
  'oç','ibne','orospu cocugu','yarrak','salak',
  // Portuguese extended
  'filho da puta','buceta','cu','merda','idiota','babaca',
  // French extended
  'fils de pute','ta gueule','va te faire foutre','ordure',
];

/* ═══ Settings helpers ══════════════════════════════════════════════ */
const SETTING_KEY = 'antibadword_v3';
const WARNS_KEY   = 'abw_warns';

async function getSettings(chatId) {
  const s = await store.getSetting(chatId, SETTING_KEY);
  return s || {
    enabled: false,
    action: 'warn',      // warn | kick | mute | delete
    warnLimit: 3,        // kicks after N warns
    whitelist: [],       // JIDs exempt from filter
    extraWords: [],      // admin-added custom words
    removedWords: [],    // words removed from default list
  };
}

async function saveSettings(chatId, s) {
  await store.saveSetting(chatId, SETTING_KEY, s);
}

async function getWarns(chatId) {
  const w = await store.getSetting(chatId, WARNS_KEY);
  return w || {};
}

async function saveWarns(chatId, warns) {
  await store.saveSetting(chatId, WARNS_KEY, warns);
}

/* ═══ Word list build ═══════════════════════════════════════════════ */
function buildWordSet(settings) {
  const engine = getEngine();
  const base   = engine.DEFAULT_BAD_WORDS || [];
  const removed = new Set(settings.removedWords || []);
  const all    = [...base, ...EXTRA_BAD_WORDS, ...(settings.extraWords || [])]
                   .filter(w => !removed.has(w));
  return {
    singles: new Set(all.filter(w => !w.includes(' '))),
    phrases: all.filter(w => w.includes(' ')),
  };
}

/* ═══ Text normalizer ═══════════════════════════════════════════════ */
const LEET = { '0':'o','1':'i','3':'e','4':'a','@':'a','$':'s','!':'i','5':'s','7':'t','8':'b' };
function normalize(text) {
  return text.toLowerCase()
    .split('').map(c => LEET[c] || c).join('')
    .replace(/(.)\1{2,}/g, '$1$1')
    .replace(/[^a-z0-9\\s]/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();
}

function detectBadWord(text, wordSet) {
  const clean = normalize(text);
  const words = clean.split(' ');
  for (const w of words) {
    if (w.length < 2) continue;
    if (wordSet.singles.has(w)) return w;
  }
  for (const ph of wordSet.phrases) {
    if (clean.includes(ph)) return ph;
  }
  return null;
}

/* ═══ checkAntiBadword — called from messageHandler ════════════════ */
async function checkAntiBadword(sock, message) {
  const chatId = message.key.remoteJid;
  if (!chatId.endsWith('@g.us')) return false;

  const settings = await getSettings(chatId);
  if (!settings.enabled) return false;

  const senderId = message.key.participant || message.key.remoteJid;

  // Skip whitelisted
  if ((settings.whitelist || []).some(jid => senderId.includes(jid.replace(/[^0-9]/g, '')))) return false;

  const text = (
    message.message?.conversation ||
    message.message?.extendedTextMessage?.text ||
    message.message?.imageMessage?.caption ||
    message.message?.videoMessage?.caption || ''
  );
  if (!text) return false;

  const wordSet = buildWordSet(settings);
  const hit     = detectBadWord(text, wordSet);
  if (!hit) return false;

  try {
    // Always delete the message first
    await sock.sendMessage(chatId, { delete: message.key }).catch(() => {});

    const senderNum = senderId.split('@')[0].split(':')[0];
    const mention   = `@${senderNum}`;

    const action = settings.action || 'warn';

    if (action === 'delete') {
      await sock.sendMessage(chatId, {
        text: `🚫 Message deleted — contains banned word.\n> JUNAID-MD↣³⁰²`,
        mentions: [senderId],
      });
      return true;
    }

    if (action === 'kick') {
      await sock.groupParticipantsUpdate(chatId, [senderId], 'remove').catch(() => {});
      await sock.sendMessage(chatId, {
        text: `⛔ ${mention} was removed — banned word detected.\n> JUNAID-MD↣³⁰²`,
        mentions: [senderId],
      });
      return true;
    }

    if (action === 'mute') {
      // Mute by demoting if admin, or just warn
      await sock.sendMessage(chatId, {
        text: `🔇 ${mention} muted — banned word detected.\n> JUNAID-MD↣³⁰²`,
        mentions: [senderId],
      });
      return true;
    }

    // Default: warn system
    const warns  = await getWarns(chatId);
    const warnN  = (warns[senderId] || 0) + 1;
    warns[senderId] = warnN;
    await saveWarns(chatId, warns);

    const limit  = settings.warnLimit || 3;
    if (warnN >= limit) {
      warns[senderId] = 0;
      await saveWarns(chatId, warns);
      await sock.groupParticipantsUpdate(chatId, [senderId], 'remove').catch(() => {});
      await sock.sendMessage(chatId, {
        text: `⛔ ${mention} kicked — reached ${limit} warnings for banned words.\n> JUNAID-MD↣³⁰²`,
        mentions: [senderId],
      });
    } else {
      await sock.sendMessage(chatId, {
        text: `⚠️ Warning ${warnN}/${limit} — ${mention}, banned word detected: *"${hit}"*.\n> JUNAID-MD↣³⁰²`,
        mentions: [senderId],
      });
    }
    return true;
  } catch (e) {
    console.error('[antibadword] action error:', e.message);
    return false;
  }
}

/* ═══ Command handler ═══════════════════════════════════════════════ */
module.exports = {
  command: 'antibadword',
  aliases: ['abw', 'badword', 'antibad'],
  category: 'admin',
  description: 'Advanced bad-word filter — warn/kick/mute/delete + 100+ word list',
  usage: '.antibadword <on|off|status|list|add|remove|action|reset|whitelist>',
  groupOnly: true,
  adminOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const action = (args[0] || '').toLowerCase();
    const reply  = (text) => sock.sendMessage(chatId, { text }, { quoted: message });

    let settings;
    try { settings = await getSettings(chatId); }
    catch (e) {
      return reply(`❌ Error loading settings: ${e.message}`);
    }

    /* status / no arg */
    if (!action || action === 'status') {
      const wordSet = buildWordSet(settings);
      return reply(
        `╔══════════════════════════╗\n` +
        `║  🛡️ ANTI-BADWORD v3      ║\n` +
        `╚══════════════════════════╝\n\n` +
        `🤖 Status   : ${settings.enabled ? '✅ ON' : '❌ OFF'}\n` +
        `⚡ Action   : ${settings.action || 'warn'}\n` +
        `⚠️ Warn limit: ${settings.warnLimit || 3}\n` +
        `📝 Total words: ${wordSet.singles.size + wordSet.phrases.length}\n` +
        `🔒 Whitelist: ${settings.whitelist?.length || 0} users\n\n` +
        `*Commands:*\n` +
        `• \`.abw on/off\` — toggle\n` +
        `• \`.abw action warn|kick|mute|delete\` — set action\n` +
        `• \`.abw warnlimit <n>\` — set warn threshold\n` +
        `• \`.abw add <word>\` — add custom word\n` +
        `• \`.abw remove <word>\` — remove word\n` +
        `• \`.abw list\` — show word list\n` +
        `• \`.abw whitelist add/remove @mention\` — whitelist user\n` +
        `• \`.abw reset warns\` — reset all warnings`
      );
    }

    if (action === 'on')  { settings.enabled = true;  await saveSettings(chatId, settings); return reply('✅ *Anti-Badword ENABLED*\n100+ words across 10 languages active.'); }
    if (action === 'off') { settings.enabled = false; await saveSettings(chatId, settings); return reply('❌ *Anti-Badword DISABLED*.'); }

    if (action === 'action') {
      const mode = (args[1] || '').toLowerCase();
      if (!['warn','kick','mute','delete'].includes(mode)) return reply('❌ Valid actions: warn | kick | mute | delete');
      settings.action = mode;
      await saveSettings(chatId, settings);
      return reply(`✅ Action set to *${mode}*`);
    }

    if (action === 'warnlimit') {
      const n = parseInt(args[1]);
      if (isNaN(n) || n < 1) return reply('❌ Usage: `.abw warnlimit <number>`');
      settings.warnLimit = n;
      await saveSettings(chatId, settings);
      return reply(`✅ Warn limit set to *${n}*`);
    }

    if (action === 'add') {
      const word = args.slice(1).join(' ').toLowerCase().trim();
      if (!word) return reply('❌ Usage: `.abw add <word>`');
      if (!settings.extraWords) settings.extraWords = [];
      if (settings.extraWords.includes(word)) return reply(`❌ "${word}" already in list.`);
      settings.extraWords.push(word);
      // Also remove from removedWords if it was there
      settings.removedWords = (settings.removedWords || []).filter(w => w !== word);
      await saveSettings(chatId, settings);
      return reply(`✅ Added *"${word}"* to filter.`);
    }

    if (action === 'remove' || action === 'delete' || action === 'del') {
      const word = args.slice(1).join(' ').toLowerCase().trim();
      if (!word) return reply('❌ Usage: `.abw remove <word>`');
      // Remove from extras
      settings.extraWords = (settings.extraWords || []).filter(w => w !== word);
      // Add to removed (suppresses from default list)
      if (!settings.removedWords) settings.removedWords = [];
      if (!settings.removedWords.includes(word)) settings.removedWords.push(word);
      await saveSettings(chatId, settings);
      return reply(`✅ Removed *"${word}"* from filter.`);
    }

    if (action === 'list') {
      const wordSet = buildWordSet(settings);
      const all = [...wordSet.singles, ...wordSet.phrases];
      if (!all.length) return reply('📝 No words in filter.');
      // Paginate: show first 50
      const shown = all.slice(0, 50);
      const more  = all.length > 50 ? `\n...and ${all.length - 50} more` : '';
      return reply(`📝 *Filtered Words (${all.length} total):*\n\n${shown.join(', ')}${more}`);
    }

    if (action === 'whitelist') {
      const sub = (args[1] || '').toLowerCase();
      const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
                        message.message?.conversation?.match(/@\d+/g)?.map(n => `${n.replace('@','')}@s.whatsapp.net`) || [];
      if (!settings.whitelist) settings.whitelist = [];
      if (sub === 'add') {
        for (const jid of mentioned) {
          if (!settings.whitelist.includes(jid)) settings.whitelist.push(jid);
        }
        await saveSettings(chatId, settings);
        return reply(`✅ Whitelisted ${mentioned.length} user(s).`);
      }
      if (sub === 'remove') {
        settings.whitelist = settings.whitelist.filter(j => !mentioned.includes(j));
        await saveSettings(chatId, settings);
        return reply(`✅ Removed ${mentioned.length} user(s) from whitelist.`);
      }
      return reply(`👥 Whitelisted: ${settings.whitelist.join(', ') || 'None'}`);
    }

    if (action === 'reset') {
      const sub = (args[1] || '').toLowerCase();
      if (sub === 'warns') {
        await saveWarns(chatId, {});
        return reply('✅ All warnings reset.');
      }
      return reply('❌ Usage: `.abw reset warns`');
    }

    return reply(
      `❌ Unknown action.\n\n` +
      `Use \`.abw status\` for help.`
    );
  },

  checkAntiBadword,
};

module.exports.checkAntiBadword = checkAntiBadword;

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading antibadword.js:', e.message); }

/* ===== antibot.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *  REDX BOT — .antibot
 *  Detects when OTHER bots are used in the group and warns/kicks them.
 *  Owner/sudo/admins are always exempt.
 *****************************************************************************/

const store = require('../lib/lightweight_store');
const isOwnerOrSudo = require('../lib/isOwner');
const isAdmin = require('../lib/isAdmin');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(process.cwd(), 'data', 'antibot.json');
const HAS_DB = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.DB_URL);
const warnCount = new Map(); // `${chatId}:${jid}` → count

// Common bot prefixes and patterns that indicate another bot is present
const BOT_PREFIXES = [
    '!', '/', '#', '$', '%', '^', '&', '*', '+', '=',
    '?', '<', '>', '~', '`', '|', '\\',
];
const BOT_INDICATORS = [
    /^\s*[!\/\$\?#%&*+=>~`|\\][a-z]/i,         // starts with bot prefix + letter
    /╔|╗|╚|╝|║|🤖.*bot|bot.*🤖/i,              // bot-style box formatting
    /\*\*.*\*\*|__.*__|~~.*~~/,                  // markdown heavy usage by bots
];

async function readConfig(chatId) {
    try {
        if (HAS_DB) {
            const c = await store.getSetting(chatId, 'antibot');
            return c || { enabled: false, maxWarnings: 3, mode: 'warn' };
        }
        if (!fs.existsSync(CONFIG_PATH)) return { enabled: false, maxWarnings: 3, mode: 'warn' };
        const all = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8') || '{}');
        return all[chatId] || { enabled: false, maxWarnings: 3, mode: 'warn' };
    } catch { return { enabled: false, maxWarnings: 3, mode: 'warn' }; }
}

async function writeConfig(chatId, config) {
    try {
        if (HAS_DB) return await store.saveSetting(chatId, 'antibot', config);
        let all = {};
        if (fs.existsSync(CONFIG_PATH)) all = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8') || '{}');
        all[chatId] = config;
        if (!fs.existsSync(path.dirname(CONFIG_PATH))) fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(all, null, 2));
    } catch (e) { console.error('[ANTIBOT] write error:', e.message); }
}

/**
 * Called from messageHandler for every group message
 */
async function handleAntibotCheck(sock, message, chatId, senderId) {
    try {
        const config = await readConfig(chatId);
        if (!config.enabled) return;
        if (!chatId.endsWith('@g.us')) return;

        // Exempt owner/sudo
        const isOwnerSudo = await isOwnerOrSudo(senderId, sock, chatId);
        if (isOwnerSudo) return;

        // Exempt admins
        try {
            const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
            if (isSenderAdmin) return;
        } catch {}

        // Exempt if it's the bot itself
        const botId = sock.user?.id?.split(':')[0];
        if (senderId.includes(botId)) return;

        // Check if this looks like a bot response
        const msgText = message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption || '';

        if (!msgText) return;

        // Detect bot-like patterns
        const isBot = BOT_INDICATORS.some(p => p.test(msgText));
        if (!isBot) return;

        const warningKey = `${chatId}:${senderId}`;
        let currentWarns = warnCount.get(warningKey) || 0;
        currentWarns++;
        warnCount.set(warningKey, currentWarns);

        const maxWarnings = config.maxWarnings || 3;
        const shortId = senderId.split('@')[0];

        // Delete the bot message
        try {
            await sock.sendMessage(chatId, {
                delete: { remoteJid: chatId, fromMe: false, id: message.key.id, participant: senderId }
            });
        } catch {}

        if (config.mode === 'kick' || currentWarns >= maxWarnings) {
            // Kick user
            try {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                await sock.sendMessage(chatId, {
                    text: `🤖❌ @${shortId} was *removed* for using another bot in this group. (${currentWarns}/${maxWarnings} warnings)`,
                    mentions: [senderId]
                });
                warnCount.delete(warningKey);
            } catch (e) {
                await sock.sendMessage(chatId, { text: `⚠️ Could not remove bot user. Make sure I am admin.` });
            }
        } else if (config.mode === 'delete') {
            // Silent delete only
        } else {
            // Warn mode
            await sock.sendMessage(chatId, {
                text: `⚠️ *Antibot Warning (${currentWarns}/${maxWarnings})*\n\n@${shortId}, using other bots in this group is not allowed!\n_${maxWarnings - currentWarns} more warning(s) before kick._`,
                mentions: [senderId]
            });
        }
    } catch (e) {
        console.error('[ANTIBOT] error:', e.message);
    }
}

module.exports = {
    command: 'antibot',
    aliases: ['abot', 'nobot'],
    category: 'admin',
    description: 'Detect and warn/kick users who use other bots in the group',
    usage: '.antibot on/off/kick/delete/warn/max <n>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const config = await readConfig(chatId);
        const action = args[0]?.toLowerCase();

        if (!action) {
            return sock.sendMessage(chatId, {
                text: `*🤖 ANTIBOT SETTINGS*\n\n` +
                    `*Status:* ${config.enabled ? '✅ ON' : '❌ OFF'}\n` +
                    `*Mode:* ${config.mode || 'warn'}\n` +
                    `*Max Warnings:* ${config.maxWarnings || 3}\n\n` +
                    `*Commands:*\n` +
                    `• \`.antibot on\` — Enable\n` +
                    `• \`.antibot off\` — Disable\n` +
                    `• \`.antibot warn\` — Warn then kick (default)\n` +
                    `• \`.antibot kick\` — Direct kick\n` +
                    `• \`.antibot delete\` — Delete silently\n` +
                    `• \`.antibot max <n>\` — Set warn limit\n\n` +
                    `_Exempt: Owner, Sudo, Admins_`
            }, { quoted: message });
        }

        switch (action) {
            case 'on':
                config.enabled = true;
                await writeConfig(chatId, config);
                return sock.sendMessage(chatId, { text: `✅ *Antibot enabled* (mode: ${config.mode || 'warn'})` }, { quoted: message });
            case 'off':
                config.enabled = false;
                await writeConfig(chatId, config);
                return sock.sendMessage(chatId, { text: `❌ *Antibot disabled*` }, { quoted: message });
            case 'kick':
                config.mode = 'kick'; config.enabled = true; config.maxWarnings = 1;
                await writeConfig(chatId, config);
                return sock.sendMessage(chatId, { text: `🚫 *Antibot: Direct Kick mode*` }, { quoted: message });
            case 'delete':
                config.mode = 'delete'; config.enabled = true;
                await writeConfig(chatId, config);
                return sock.sendMessage(chatId, { text: `🗑️ *Antibot: Delete-only mode*` }, { quoted: message });
            case 'warn':
                config.mode = 'warn'; config.enabled = true;
                await writeConfig(chatId, config);
                return sock.sendMessage(chatId, { text: `⚠️ *Antibot: Warn mode* (${config.maxWarnings || 3} warnings then kick)` }, { quoted: message });
            case 'max': {
                const n = parseInt(args[1]);
                if (isNaN(n) || n < 1) return sock.sendMessage(chatId, { text: `❌ Provide a valid number` }, { quoted: message });
                config.maxWarnings = n;
                await writeConfig(chatId, config);
                return sock.sendMessage(chatId, { text: `✅ Max antibot warnings set to: *${n}*` }, { quoted: message });
            }
            default:
                return sock.sendMessage(chatId, { text: `❌ Unknown action. Use \`.antibot\` for help.` }, { quoted: message });
        }
    },

    handleAntibotCheck,
    readConfig,
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading antibot.js:', e.message); }

/* ===== anticall.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *****************************************************************************/

const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const ANTICALL_PATH = './data/anticall.json';
const MEDIA_DIR = path.join(process.cwd(), 'data', 'anticall_media');
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

const DEFAULT_RING_DURATION = 0; // 0 seconds = reject immediately
const DEFAULT_TEXT_MESSAGE = "📵 *Don't call me!*\n\nYour boss is busy right now. 🔥\n\nPlease use text messages instead. 🙏";

// Track processed call IDs to avoid duplicate actions
const processedCalls = new Set();
setInterval(() => processedCalls.clear(), 60 * 1000);

// Helper to download media from a quoted message
async function downloadMediaFromReply(message, sock) {
  try {
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) throw new Error('No quoted message found.');
    let mediaMsg, mediaType;
    if (quotedMsg.audioMessage) {
      mediaMsg = quotedMsg.audioMessage;
      mediaType = 'audio';
    } else if (quotedMsg.videoMessage) {
      mediaMsg = quotedMsg.videoMessage;
      mediaType = 'video';
    } else if (quotedMsg.stickerMessage) {
      mediaMsg = quotedMsg.stickerMessage;
      mediaType = 'sticker';
    } else if (quotedMsg.imageMessage) {
      mediaMsg = quotedMsg.imageMessage;
      mediaType = 'image';
    } else if (quotedMsg.documentMessage) {
      mediaMsg = quotedMsg.documentMessage;
      mediaType = 'document';
    } else {
      throw new Error('Unsupported media type.');
    }
    const stream = await downloadContentFromMessage(mediaMsg, mediaType);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const mimetype = mediaMsg.mimetype || (mediaType === 'audio' ? 'audio/mpeg' : 'image/jpeg');
    let ptt = false, gifPlayback = false;
    if (mediaType === 'audio' && quotedMsg.audioMessage?.ptt) ptt = true;
    if (mediaType === 'video' && quotedMsg.videoMessage?.gifPlayback) gifPlayback = true;
    return { buffer, mimetype, mediaType, originalName: mediaMsg.fileName || 'media', ptt, gifPlayback };
  } catch (err) {
    throw new Error(`Failed to download media: ${err.message}`);
  }
}

async function readState() {
  try {
    if (HAS_DB) {
      const settings = await store.getSetting('global', 'anticall');
      return settings || {
        enabled: false,
        ringDuration: DEFAULT_RING_DURATION,
        blockAfterReject: false,
        textMessage: DEFAULT_TEXT_MESSAGE,
        mediaPath: null,
        mediaType: null,
        mediaMimetype: null,
        mediaCaption: '',
        sendMode: 'text',
        whitelist: [],
        blacklist: []
      };
    } else {
      if (!fs.existsSync(ANTICALL_PATH)) {
        return {
          enabled: false,
          ringDuration: DEFAULT_RING_DURATION,
          blockAfterReject: false,
          textMessage: DEFAULT_TEXT_MESSAGE,
          mediaPath: null,
          mediaType: null,
          mediaMimetype: null,
          mediaCaption: '',
          sendMode: 'text',
          whitelist: [],
          blacklist: []
        };
      }
      const raw = fs.readFileSync(ANTICALL_PATH, 'utf8');
      const data = JSON.parse(raw || '{}');
      return {
        enabled: !!data.enabled,
        ringDuration: data.ringDuration ?? DEFAULT_RING_DURATION,
        blockAfterReject: !!data.blockAfterReject,
        textMessage: data.textMessage || DEFAULT_TEXT_MESSAGE,
        mediaPath: data.mediaPath || null,
        mediaType: data.mediaType || null,
        mediaMimetype: data.mediaMimetype || null,
        mediaCaption: data.mediaCaption || '',
        sendMode: data.sendMode || 'text',
        whitelist: Array.isArray(data.whitelist) ? data.whitelist : [],
        blacklist: Array.isArray(data.blacklist) ? data.blacklist : []
      };
    }
  } catch (err) {
    console.error('[anticall] readState error:', err);
    return {
      enabled: false,
      ringDuration: DEFAULT_RING_DURATION,
      blockAfterReject: false,
      textMessage: DEFAULT_TEXT_MESSAGE,
      mediaPath: null,
      mediaType: null,
      mediaMimetype: null,
      mediaCaption: '',
      sendMode: 'text',
      whitelist: [],
      blacklist: []
    };
  }
}

async function writeState(updates) {
  try {
    const current = await readState();
    const newState = { ...current, ...updates };
    if (HAS_DB) {
      await store.saveSetting('global', 'anticall', newState);
    } else {
      if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
      fs.writeFileSync(ANTICALL_PATH, JSON.stringify(newState, null, 2));
    }
  } catch (e) {
    console.error('[anticall] writeState error:', e);
  }
}

async function handleIncomingCall(sock, call) {
  try {
    const state = await readState();
    const callId = call.id;
    const callerJid = call.from;
    if (!callId || !callerJid) return;

    // Skip if already processed
    if (processedCalls.has(callId)) return;
    processedCalls.add(callId);

    // Priority 1: Whitelist (always allow)
    const isWhitelisted = state.whitelist.some(entry =>
      callerJid.includes(entry) || entry.includes(callerJid)
    );
    if (isWhitelisted) {
      console.log(`[anticall] Whitelisted caller ${callerJid}, allowing call.`);
      return; // allow call
    }

    // Priority 2: Blacklist (always reject)
    const isBlacklisted = state.blacklist.some(entry =>
      callerJid.includes(entry) || entry.includes(callerJid)
    );
    if (isBlacklisted) {
      console.log(`[anticall] Blacklisted caller ${callerJid}, rejecting.`);
      try {
        await sock.rejectCall(callId, callerJid);
        await sendRejectMessage(sock, callerJid, state);
        if (state.blockAfterReject) {
          await sock.updateBlockStatus(callerJid, 'block');
          console.log(`[anticall] Blocked ${callerJid}`);
        }
      } catch (err) {
        console.error('[anticall] Error processing blacklisted call:', err.message);
      }
      return;
    }

    // Priority 3: If anticall is not enabled, allow call
    if (!state.enabled) {
      console.log(`[anticall] Anticall off, allowing call from ${callerJid}`);
      return;
    }

    // Anticall is on and caller is not in any list → reject
    try {
      // Set presence to 'unavailable' to appear offline (non‑critical)
      try {
        await sock.sendPresenceUpdate('unavailable', callerJid);
      } catch (presenceErr) {
        console.error('[anticall] Presence update failed:', presenceErr.message);
      }

      // Reject after ring duration
      setTimeout(async () => {
        try {
          await sock.rejectCall(callId, callerJid);
          console.log(`[anticall] Rejected call from ${callerJid} after ${state.ringDuration}ms`);
          await sendRejectMessage(sock, callerJid, state);
          if (state.blockAfterReject) {
            await sock.updateBlockStatus(callerJid, 'block');
            console.log(`[anticall] Blocked ${callerJid}`);
          }
        } catch (rejectErr) {
          console.error('[anticall] Failed to reject call:', rejectErr.message);
        }
      }, state.ringDuration);
    } catch (err) {
      console.error('[anticall] handleIncomingCall error:', err.message);
    }
  } catch (err) {
    console.error('[anticall] handleIncomingCall outer error:', err.message);
  }
}

async function sendRejectMessage(sock, to, state) {
  try {
    const { sendMode, textMessage, mediaPath, mediaType, mediaMimetype, mediaCaption } = state;

    if (sendMode === 'text') {
      const msg = textMessage && textMessage.trim() ? textMessage : DEFAULT_TEXT_MESSAGE;
      await sock.sendMessage(to, { text: msg });
    } else if (sendMode === 'media') {
      if (mediaPath && fs.existsSync(mediaPath)) {
        const mediaBuffer = fs.readFileSync(mediaPath);
        let payload = {};
        switch (mediaType) {
          case 'image':
            payload = { image: mediaBuffer, caption: mediaCaption || undefined };
            break;
          case 'video':
            payload = { video: mediaBuffer, caption: mediaCaption || undefined, gifPlayback: false };
            break;
          case 'audio':
            payload = { audio: mediaBuffer, mimetype: mediaMimetype || 'audio/mpeg', ptt: false };
            break;
          case 'sticker':
            payload = { sticker: mediaBuffer };
            break;
          case 'document':
            payload = { document: mediaBuffer, mimetype: mediaMimetype || 'application/octet-stream', fileName: mediaCaption || 'document' };
            break;
          default:
            return;
        }
        await sock.sendMessage(to, payload);
      } else {
        // Fallback to text if media missing
        const msg = textMessage && textMessage.trim() ? textMessage : DEFAULT_TEXT_MESSAGE;
        await sock.sendMessage(to, { text: msg });
      }
    } else if (sendMode === 'both') {
      if (mediaPath && fs.existsSync(mediaPath)) {
        const mediaBuffer = fs.readFileSync(mediaPath);
        let payload = {};
        switch (mediaType) {
          case 'image':
            payload = { image: mediaBuffer, caption: mediaCaption || (textMessage || undefined) };
            break;
          case 'video':
            payload = { video: mediaBuffer, caption: mediaCaption || (textMessage || undefined), gifPlayback: false };
            break;
          case 'audio':
            payload = { audio: mediaBuffer, mimetype: mediaMimetype || 'audio/mpeg', ptt: false };
            break;
          case 'sticker':
            payload = { sticker: mediaBuffer };
            break;
          case 'document':
            payload = { document: mediaBuffer, mimetype: mediaMimetype || 'application/octet-stream', fileName: mediaCaption || 'document' };
            break;
          default:
            return;
        }
        await sock.sendMessage(to, payload);
      } else {
        // Fallback to text
        const msg = textMessage && textMessage.trim() ? textMessage : DEFAULT_TEXT_MESSAGE;
        await sock.sendMessage(to, { text: msg });
      }
    }
  } catch (err) {
    console.error('[anticall] sendRejectMessage error:', err.message);
  }
}

// Short guide (shown when user types .anticall alone)
const shortGuide = (state) => {
  const status = state.enabled ? '✅ ENABLED' : '❌ DISABLED';
  const storage = HAS_DB ? 'Database' : 'File System';
  return `*📵 ANTICALL SETUP*\n\n` +
         `Current Status: ${status}\n` +
         `Storage: ${storage}\n\n` +
         `Commands:\n` +
         `• .anticall on - Enable\n` +
         `• .anticall off - Disable\n` +
         `• .anticall status - Show settings\n` +
         `• .anticall guide - Full help\n\n` +
         `Features:\n` +
         `• Auto‑reject calls\n` +
         `• Whitelist / Blacklist\n` +
         `• Custom text/media replies\n` +
         `• Optional caller blocking`;
};

// Full usage (shown when user types .anticall guide)
const fullGuide = `
*📵 ANTICALL COMMANDS*

*BASIC*
• .anticall on        – Enable anticall (blocks all except whitelist)
• .anticall off       – Disable anticall (allows all except blacklist)
• .anticall status    – Show current settings

*RING & BLOCK*
• .anticall ring <seconds> – Set ring duration (0 = immediate)
• .anticall block on|off   – Enable/disable auto‑block after reject
• .anticall blockstatus    – Show block setting

*MESSAGING*
• .anticall text <text>    – Set text message (use 'off' to disable)
• .anticall media          – Set media (reply to image/video/audio/sticker/doc)
• .anticall mode text|media|both – Choose what to send
• .anticall reset          – Clear text and media

*LISTS*
• .anticall whitelist add <number>   – Always allow this number
• .anticall whitelist remove <number>– Remove from whitelist
• .anticall whitelist remove all     – Clear entire whitelist
• .anticall whitelist list           – List whitelisted numbers
• .anticall blacklist add <number>   – Always block this number
• .anticall blacklist remove <number>– Remove from blacklist
• .anticall blacklist remove all     – Clear entire blacklist
• .anticall blacklist list           – List blacklisted numbers

*EXAMPLES*
• .anticall whitelist add 1234567890
• .anticall blacklist add 9876543210
• .anticall text "Don't call me, I'm busy!"
• .anticall mode both
`;

module.exports = {
  command: 'anticall',
  aliases: ['acall', 'callblock'],
  category: 'owner',
  description: 'Auto‑block incoming calls with silent ring, custom message/media, whitelist/blacklist.',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const state = await readState();
    const sub = args.join(' ').trim().toLowerCase();

    // If no arguments, show short guide
    if (!sub) {
      return await sock.sendMessage(chatId, { text: shortGuide(state), ...channelInfo }, { quoted: message });
    }

    // Guide command
    if (sub === 'guide' || sub === 'help') {
      return await sock.sendMessage(chatId, { text: fullGuide, ...channelInfo }, { quoted: message });
    }

    // Ring duration
    if (sub.startsWith('ring ')) {
      const seconds = parseInt(sub.split(' ')[1], 10);
      if (isNaN(seconds) || seconds < 0) {
        return await sock.sendMessage(
          chatId,
          { text: '❌ Please provide a valid number of seconds (0 = immediate).', ...channelInfo },
          { quoted: message }
        );
      }
      await writeState({ ringDuration: seconds * 1000 });
      return await sock.sendMessage(
        chatId,
        { text: `🔔 Ring duration set to *${seconds} second${seconds !== 1 ? 's' : ''}*.`, ...channelInfo },
        { quoted: message }
      );
    }

    // Text message
    if (sub.startsWith('text ')) {
      const msgText = sub.slice(5).trim();
      if (msgText === '' || msgText === 'off') {
        await writeState({ textMessage: DEFAULT_TEXT_MESSAGE });
        return await sock.sendMessage(
          chatId,
          { text: '📵 Custom text message disabled. Using default message.', ...channelInfo },
          { quoted: message }
        );
      } else {
        await writeState({ textMessage: msgText });
        return await sock.sendMessage(
          chatId,
          { text: `📝 Custom text message set to:\n\n“${msgText}”`, ...channelInfo },
          { quoted: message }
        );
      }
    }

    // Set media (reply to media message)
    if (sub === 'media') {
      try {
        const media = await downloadMediaFromReply(message, sock);
        const ext = media.mediaType === 'sticker' ? 'webp' :
                    media.mediaType === 'image' ? 'jpg' :
                    media.mediaType === 'video' ? 'mp4' :
                    media.mediaType === 'audio' ? (media.mimetype.includes('ogg') ? 'ogg' : 'mp3') :
                    media.mediaType === 'document' ? (media.originalName?.split('.').pop() || 'bin') : 'bin';
        const fileName = `anticall_${Date.now()}.${ext}`;
        const filePath = path.join(MEDIA_DIR, fileName);
        fs.writeFileSync(filePath, media.buffer);
        await writeState({
          mediaPath: filePath,
          mediaType: media.mediaType,
          mediaMimetype: media.mimetype,
          mediaCaption: ''
        });
        return await sock.sendMessage(
          chatId,
          { text: `✅ Media reply set.\nType: ${media.mediaType}\nSize: ${(media.buffer.length / 1024).toFixed(2)} KB`, ...channelInfo },
          { quoted: message }
        );
      } catch (err) {
        return await sock.sendMessage(
          chatId,
          { text: `❌ Failed to set media: ${err.message}`, ...channelInfo },
          { quoted: message }
        );
      }
    }

    // Mode
    if (sub === 'mode text') {
      await writeState({ sendMode: 'text' });
      return await sock.sendMessage(chatId, { text: '📝 Send mode set to *text only*.', ...channelInfo }, { quoted: message });
    }
    if (sub === 'mode media') {
      if (!state.mediaPath) {
        return await sock.sendMessage(chatId, { text: '❌ No media set. Use `.anticall media` first.', ...channelInfo }, { quoted: message });
      }
      await writeState({ sendMode: 'media' });
      return await sock.sendMessage(chatId, { text: '🎨 Send mode set to *media only*.', ...channelInfo }, { quoted: message });
    }
    if (sub === 'mode both') {
      if (!state.mediaPath) {
        return await sock.sendMessage(chatId, { text: '❌ No media set. Use `.anticall media` first.', ...channelInfo }, { quoted: message });
      }
      await writeState({ sendMode: 'both' });
      return await sock.sendMessage(chatId, { text: '🔁 Send mode set to *both* (media + text caption).', ...channelInfo }, { quoted: message });
    }

    // Reset
    if (sub === 'reset') {
      await writeState({
        textMessage: DEFAULT_TEXT_MESSAGE,
        mediaPath: null,
        mediaType: null,
        mediaMimetype: null,
        mediaCaption: '',
        sendMode: 'text'
      });
      return await sock.sendMessage(chatId, { text: '🔄 Reset text and media to defaults. Send mode set to text.', ...channelInfo }, { quoted: message });
    }

    // Whitelist commands
    if (sub.startsWith('whitelist ')) {
      const parts = sub.split(' ');
      const action = parts[1];
      const number = parts[2];
      if (action === 'add' && number) {
        const normalized = number.replace(/[^0-9]/g, '');
        if (!normalized) return await sock.sendMessage(chatId, { text: '❌ Invalid number.', ...channelInfo }, { quoted: message });
        const whitelist = [...state.whitelist];
        if (!whitelist.includes(normalized)) whitelist.push(normalized);
        await writeState({ whitelist });
        return await sock.sendMessage(chatId, { text: `✅ Added *${normalized}* to whitelist.`, ...channelInfo }, { quoted: message });
      }
      if (action === 'remove' && number) {
        const normalized = number.replace(/[^0-9]/g, '');
        const whitelist = state.whitelist.filter(n => n !== normalized);
        await writeState({ whitelist });
        return await sock.sendMessage(chatId, { text: `❌ Removed *${normalized}* from whitelist.`, ...channelInfo }, { quoted: message });
      }
      if (action === 'remove' && number === 'all') {
        await writeState({ whitelist: [] });
        return await sock.sendMessage(chatId, { text: '🗑️ Cleared entire whitelist.', ...channelInfo }, { quoted: message });
      }
      if (action === 'list') {
        const list = state.whitelist.length ? state.whitelist.join(', ') : '(none)';
        return await sock.sendMessage(chatId, { text: `📋 *Whitelist:*\n${list}`, ...channelInfo }, { quoted: message });
      }
      return await sock.sendMessage(chatId, { text: '❌ Usage: .anticall whitelist add|remove|list <number> or remove all', ...channelInfo }, { quoted: message });
    }

    // Blacklist commands
    if (sub.startsWith('blacklist ')) {
      const parts = sub.split(' ');
      const action = parts[1];
      const number = parts[2];
      if (action === 'add' && number) {
        const normalized = number.replace(/[^0-9]/g, '');
        if (!normalized) return await sock.sendMessage(chatId, { text: '❌ Invalid number.', ...channelInfo }, { quoted: message });
        const blacklist = [...state.blacklist];
        if (!blacklist.includes(normalized)) blacklist.push(normalized);
        await writeState({ blacklist });
        return await sock.sendMessage(chatId, { text: `✅ Added *${normalized}* to blacklist.`, ...channelInfo }, { quoted: message });
      }
      if (action === 'remove' && number) {
        const normalized = number.replace(/[^0-9]/g, '');
        const blacklist = state.blacklist.filter(n => n !== normalized);
        await writeState({ blacklist });
        return await sock.sendMessage(chatId, { text: `❌ Removed *${normalized}* from blacklist.`, ...channelInfo }, { quoted: message });
      }
      if (action === 'remove' && number === 'all') {
        await writeState({ blacklist: [] });
        return await sock.sendMessage(chatId, { text: '🗑️ Cleared entire blacklist.', ...channelInfo }, { quoted: message });
      }
      if (action === 'list') {
        const list = state.blacklist.length ? state.blacklist.join(', ') : '(none)';
        return await sock.sendMessage(chatId, { text: `📋 *Blacklist:*\n${list}`, ...channelInfo }, { quoted: message });
      }
      return await sock.sendMessage(chatId, { text: '❌ Usage: .anticall blacklist add|remove|list <number> or remove all', ...channelInfo }, { quoted: message });
    }

    // Block after reject
    if (sub === 'block on') {
      await writeState({ blockAfterReject: true });
      return await sock.sendMessage(chatId, { text: '🔒 Callers will now be *blocked* after rejection.', ...channelInfo }, { quoted: message });
    }
    if (sub === 'block off') {
      await writeState({ blockAfterReject: false });
      return await sock.sendMessage(chatId, { text: '🔓 Callers will *not* be blocked after rejection.', ...channelInfo }, { quoted: message });
    }
    if (sub === 'blockstatus') {
      return await sock.sendMessage(chatId, { text: `🔒 *Block after reject:* ${state.blockAfterReject ? '✅ Enabled' : '❌ Disabled'}`, ...channelInfo }, { quoted: message });
    }

    // Status
    if (sub === 'status') {
      let msg = `*📵 ANTICALL STATUS*\n\n`;
      msg += `Status: ${state.enabled ? '✅ ENABLED' : '❌ DISABLED'}\n`;
      msg += `Ring Duration: ${state.ringDuration / 1000} seconds\n`;
      msg += `Block after reject: ${state.blockAfterReject ? '✅ Yes' : '❌ No'}\n`;
      msg += `Send mode: ${state.sendMode.toUpperCase()}\n`;
      msg += `Text message: ${state.textMessage ? (state.textMessage === DEFAULT_TEXT_MESSAGE ? 'Default' : 'Custom') : 'None'}\n`;
      msg += `Media: ${state.mediaPath ? '✅ Set' : '❌ None'}\n`;
      msg += `Whitelist: ${state.whitelist.length} numbers\n`;
      msg += `Blacklist: ${state.blacklist.length} numbers\n`;
      msg += `Storage: ${HAS_DB ? 'Database' : 'File System'}\n`;
      return await sock.sendMessage(chatId, { text: msg, ...channelInfo }, { quoted: message });
    }

    // Enable/Disable
    if (sub === 'on') {
      await writeState({ enabled: true });
      return await sock.sendMessage(chatId, { text: '✅ *Anticall ENABLED*', ...channelInfo }, { quoted: message });
    }
    if (sub === 'off') {
      await writeState({ enabled: false });
      return await sock.sendMessage(chatId, { text: '❌ *Anticall DISABLED*', ...channelInfo }, { quoted: message });
    }

    // Unknown command – show short guide
    return await sock.sendMessage(chatId, { text: shortGuide(state), ...channelInfo }, { quoted: message });
  },

  handleIncomingCall,
  readState,
  writeState
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading anticall.js:', e.message); }

/* ===== antidelete.js ===== */
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
 *    ANTIDELETE v4.0 ULTRA — Per-Group · Ignore · Edit-track · Stats        *
 *                                                                           *
 *****************************************************************************/

'use strict';

const fs   = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');
const store = require('../lib/lightweight_store');

/* ─────────────────────────────── constants ─────────────────────────────── */
const HAS_DB       = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || process.env.DB_URL);
const CONFIG_PATH  = path.join(__dirname, '../data/antidelete.json');
const TEMP_DIR     = path.join(__dirname, '../tmp');
const MAX_STORE    = 800;    // hard cap on in-memory message cache
const DEFAULT_TTL  = 3_600_000; // 1 hour default TTL

/* ─── in-memory stores ───────────────────────────────────────────────────── */
const msgStore  = new Map();   // messageId → meta (lazy-download model)
const editStore = new Map();   // messageId → original content (for edit tracking)

/* counters for stats */
let statsDeleted = 0;
let statsEdited  = 0;
let statsMedia   = 0;

/* ─── ensure tmp dir ────────────────────────────────────────────────────── */
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

/* ─── clean tmp if >80 MB every 5 min ───────────────────────────────────── */
setInterval(() => {
    try {
        const files = fs.readdirSync(TEMP_DIR);
        let total   = 0;
        files.forEach(f => {
            try { total += fs.statSync(path.join(TEMP_DIR, f)).size; } catch {}
        });
        if (total > 80 * 1024 * 1024) {
            files.forEach(f => { try { fs.unlinkSync(path.join(TEMP_DIR, f)); } catch {} });
            console.log('[ANTIDELETE] Cleaned tmp (>80 MB)');
        }
    } catch {}
}, 5 * 60_000);

/* ─── prune expired TTL entries every 10 min ────────────────────────────── */
setInterval(async () => {
    const cfg = await loadConfig();
    const ttl = cfg.ttlMs || DEFAULT_TTL;
    const now = Date.now();
    for (const [id, meta] of msgStore) {
        if (now - meta.timestamp > ttl) msgStore.delete(id);
    }
    for (const [id, meta] of editStore) {
        if (now - meta.timestamp > ttl) editStore.delete(id);
    }
}, 10 * 60_000);

/* ─────────────────────────────── config I/O ─────────────────────────────── */
async function loadConfig() {
    try {
        if (HAS_DB) {
            const cfg = await store.getSetting('global', 'antidelete');
            return _mergeDefaults(cfg);
        }
        if (!fs.existsSync(CONFIG_PATH)) return _defaultConfig();
        return _mergeDefaults(JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')));
    } catch { return _defaultConfig(); }
}

async function saveConfig(cfg) {
    try {
        if (HAS_DB) {
            await store.saveSetting('global', 'antidelete', cfg);
        } else {
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
        }
    } catch (e) { console.error('[ANTIDELETE] saveConfig:', e.message); }
}

function _defaultConfig() {
    return {
        enabled:             false,
        delpath:             'owner',    // 'owner' | 'group' | '<jid>'
        perGroup:            {},         // groupJid → { enabled, delpath }
        ignoreList:          [],         // JIDs whose deletes are silently ignored
        ignoreSelfDelete:    true,       // ignore if person deletes their own message
        ignoreAdminDelete:   false,      // ignore if admin deletes someone else's msg
        trackEdits:          false,      // report message edits too
        ttlMs:               DEFAULT_TTL
    };
}

function _mergeDefaults(raw) {
    const def = _defaultConfig();
    if (!raw) return def;
    return { ...def, ...raw, perGroup: raw.perGroup || {}, ignoreList: raw.ignoreList || [] };
}

/* ─────────────────────────────── helpers ───────────────────────────────── */
function _formatTime(ts) {
    return new Date(ts).toLocaleString('en-US', {
        timeZone: process.env.TIMEZONE || 'Asia/Karachi',
        hour12: true, hour: '2-digit', minute: '2-digit',
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

function _extractContent(message) {
    const m = message.message;
    if (!m) return { content: '', mediaType: '' };

    const voContainer = m?.viewOnceMessageV2?.message || m?.viewOnceMessage?.message;
    if (voContainer?.imageMessage) return { content: voContainer.imageMessage.caption || '', mediaType: 'image', isViewOnce: true };
    if (voContainer?.videoMessage) return { content: voContainer.videoMessage.caption || '', mediaType: 'video', isViewOnce: true };

    if (m.conversation)                        return { content: m.conversation, mediaType: '' };
    if (m.extendedTextMessage?.text)           return { content: m.extendedTextMessage.text, mediaType: '' };
    if (m.imageMessage)                        return { content: m.imageMessage.caption || '', mediaType: 'image' };
    if (m.videoMessage)                        return { content: m.videoMessage.caption || '', mediaType: 'video' };
    if (m.audioMessage || m.voiceMessage)      return { content: '', mediaType: 'audio' };
    if (m.stickerMessage)                      return { content: '', mediaType: 'sticker' };
    if (m.documentMessage)                     return { content: m.documentMessage.caption || '', mediaType: 'document' };
    if (m.reactionMessage)                     return { content: `Reaction: ${m.reactionMessage.text}`, mediaType: '' };
    if (m.pollCreationMessage)                 return { content: `Poll: ${m.pollCreationMessage.name}`, mediaType: '' };
    return { content: '', mediaType: '' };
}

async function _downloadMedia(meta, messageId) {
    const { mediaType, fullMessage } = meta;
    if (!mediaType || !fullMessage) return null;
    try {
        const m   = fullMessage.message;
        let   msg = null;
        let   dlType = mediaType;

        if (mediaType === 'image')    msg = m?.imageMessage;
        else if (mediaType === 'video')   msg = m?.videoMessage;
        else if (mediaType === 'sticker') { msg = m?.stickerMessage; dlType = 'sticker'; }
        else if (mediaType === 'audio')   { msg = m?.audioMessage || m?.voiceMessage; dlType = 'audio'; }
        else if (mediaType === 'document') msg = m?.documentMessage;

        if (!msg) return null;

        const stream = await downloadContentFromMessage(msg, dlType);
        let   buf    = Buffer.from([]);
        for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);

        let ext = 'bin';
        if (mediaType === 'image')    ext = 'jpg';
        else if (mediaType === 'video')   ext = 'mp4';
        else if (mediaType === 'sticker') ext = 'webp';
        else if (mediaType === 'audio')   ext = (msg.mimetype || '').includes('ogg') ? 'ogg' : 'mp3';
        else if (mediaType === 'document') {
            const fn = msg.fileName || `doc.${(msg.mimetype || '').split('/')[1] || 'bin'}`;
            ext = fn.split('.').pop() || 'bin';
        }

        const filePath = path.join(TEMP_DIR, `del_${messageId}.${ext}`);
        await writeFile(filePath, buf);
        return { filePath, ext, mimeType: msg.mimetype, fileName: msg.fileName };
    } catch (e) {
        console.error('[ANTIDELETE] download error:', e.message);
        return null;
    }
}

async function _resolveTarget(cfg, groupJid, ownerJid) {
    const grp = cfg.perGroup?.[groupJid];
    const dp  = grp?.delpath || cfg.delpath;
    if (dp === 'owner')  return ownerJid;
    if (dp === 'group' && groupJid) return groupJid;
    if (dp && dp.includes('@')) return dp;
    return ownerJid;
}

async function _isEnabled(cfg, groupJid) {
    if (!cfg.enabled) return false;
    const grp = cfg.perGroup?.[groupJid];
    if (grp && grp.enabled === false) return false;
    return true;
}

async function _getGroupName(sock, jid) {
    try {
        return (await sock.groupMetadata(jid)).subject;
    } catch { return 'Group'; }
}

/* ─────────────────────────────── store message ─────────────────────────── */
async function storeMessage(sock, message) {
    try {
        const cfg = await loadConfig();
        if (!cfg.enabled && !Object.values(cfg.perGroup || {}).some(g => g.enabled)) return;

        const msgId = message.key?.id;
        if (!msgId) return;

        /* evict oldest if full */
        if (msgStore.size >= MAX_STORE) {
            msgStore.delete(msgStore.keys().next().value);
        }

        const sender  = message.key?.participant || message.key?.remoteJid;
        const groupJid = message.key?.remoteJid?.endsWith('@g.us') ? message.key.remoteJid : null;
        const { content, mediaType, isViewOnce } = _extractContent(message);

        msgStore.set(msgId, {
            content, mediaType, sender, groupJid,
            timestamp:   Date.now(),
            fullMessage: message
        });

        /* view-once: download immediately so we have it */
        if (isViewOnce && mediaType) {
            try {
                const voMsg = (message.message?.viewOnceMessageV2?.message || message.message?.viewOnceMessage?.message);
                const mediaMsg = voMsg?.imageMessage || voMsg?.videoMessage;
                if (mediaMsg) {
                    const stream = await downloadContentFromMessage(mediaMsg, mediaType);
                    let   buf    = Buffer.from([]);
                    for await (const ch of stream) buf = Buffer.concat([buf, ch]);
                    const ext      = mediaType === 'image' ? 'jpg' : 'mp4';
                    const filePath = path.join(TEMP_DIR, `vo_${msgId}.${ext}`);
                    await writeFile(filePath, buf);

                    const ownerJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    const caption  = `*👁️ View-Once ${mediaType}*\nFrom: @${sender?.split('@')[0]}`;
                    const opts     = { caption, mentions: [sender] };

                    if (mediaType === 'image') await sock.sendMessage(ownerJid, { image: { url: filePath }, ...opts });
                    else                       await sock.sendMessage(ownerJid, { video: { url: filePath }, ...opts });
                    try { fs.unlinkSync(filePath); } catch {}
                }
            } catch (e) { console.error('[ANTIDELETE] view-once error:', e.message); }
        }

    } catch (e) { console.error('[ANTIDELETE] storeMessage:', e.message); }
}

/* ─────────────────────────────── store edit ────────────────────────────── */
async function storeEdit(sock, message) {
    try {
        const cfg = await loadConfig();
        if (!cfg.trackEdits) return;

        const msgId  = message.key?.id;
        const sender = message.key?.participant || message.key?.remoteJid;
        const { content } = _extractContent(message);
        if (!msgId || !content) return;

        editStore.set(msgId, { content, sender, timestamp: Date.now() });
    } catch {}
}

/* ─────────────────────────────── deletion handler ──────────────────────── */
async function handleMessageRevocation(sock, revocationMessage) {
    try {
        const cfg = await loadConfig();

        const deletedMsgId = revocationMessage.message?.protocolMessage?.key?.id;
        if (!deletedMsgId) return;

        const isGroup  = revocationMessage.key?.remoteJid?.endsWith('@g.us');
        const groupJid = isGroup ? revocationMessage.key.remoteJid : null;

        if (!await _isEnabled(cfg, groupJid)) return;

        const deletedBy = revocationMessage.participant ||
                          revocationMessage.key?.participant ||
                          revocationMessage.key?.remoteJid;

        const ownerJid  = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        /* ignore if bot itself */
        if (deletedBy === ownerJid || sock.user.id.includes(deletedBy?.split('@')[0])) return;

        const original = msgStore.get(deletedMsgId);
        if (!original) return;

        const sender     = original.sender;
        const senderNum  = sender?.split('@')[0] || '?';
        const deleterNum = deletedBy?.split('@')[0] || '?';

        /* self-delete check */
        if (cfg.ignoreSelfDelete && sender === deletedBy) return;

        /* ignore list check */
        if (cfg.ignoreList?.length && (cfg.ignoreList.includes(sender) || cfg.ignoreList.includes(deletedBy))) return;

        /* admin-delete check */
        if (cfg.ignoreAdminDelete && isGroup) {
            try {
                const meta = await sock.groupMetadata(groupJid);
                const isAdmin = meta.participants.find(p => p.id === deletedBy)?.admin;
                if (isAdmin && sender !== deletedBy) return;   // admin deleted someone else → skip
            } catch {}
        }

        statsDeleted++;
        if (original.mediaType) statsMedia++;

        const groupName = groupJid ? await _getGroupName(sock, groupJid) : '';
        const timeStr   = _formatTime(original.timestamp);
        const targetJid = await _resolveTarget(cfg, groupJid, ownerJid);

        const report =
            `╔════════════════════════╗\n` +
            `║  🗑️  REDX ANTIDELETE  ║\n` +
            `╚════════════════════════╝\n\n` +
            `*🗑 Deleted By:* @${deleterNum}\n` +
            `*👤 Sender:*    @${senderNum}\n` +
            `*📱 Number:*    +${senderNum}\n` +
            `*🕒 Sent At:*   ${timeStr}\n` +
            (groupName ? `*👥 Group:*     ${groupName}\n` : '') +
            (original.content   ? `\n*💬 Message:*\n${original.content}\n` : '') +
            (original.mediaType ? `\n*📎 Media Type:* ${original.mediaType}` : '') +
            `\n\n> JUNAID-MD↣³⁰² Anti-Delete v4.0`;

        await sock.sendMessage(targetJid, {
            text:     report,
            mentions: [deletedBy, sender].filter(Boolean)
        });

        /* lazy-download media only NOW */
        if (original.mediaType) {
            const dl = await _downloadMedia(original, deletedMsgId);
            if (dl) {
                const cap  = { caption: `*Deleted ${original.mediaType}*\nFrom: @${senderNum}`, mentions: [sender] };
                const doc  = original.fullMessage?.message?.documentMessage;
                try {
                    switch (original.mediaType) {
                        case 'image':
                            await sock.sendMessage(targetJid, { image: { url: dl.filePath }, ...cap }); break;
                        case 'video':
                            await sock.sendMessage(targetJid, { video: { url: dl.filePath }, ...cap }); break;
                        case 'sticker':
                            await sock.sendMessage(targetJid, { sticker: { url: dl.filePath } }); break;
                        case 'audio':
                            await sock.sendMessage(targetJid, {
                                audio: { url: dl.filePath }, mimetype: 'audio/mpeg', ptt: false, ...cap
                            }); break;
                        case 'document':
                            await sock.sendMessage(targetJid, {
                                document: { url: dl.filePath },
                                fileName: doc?.fileName || path.basename(dl.filePath),
                                mimetype: doc?.mimetype || 'application/octet-stream',
                                ...cap
                            }); break;
                    }
                } catch (e) {
                    await sock.sendMessage(targetJid,
                        { text: `⚠️ Could not retrieve deleted media: ${e.message}` });
                }
                try { fs.unlinkSync(dl.filePath); } catch {}
            }
        }

        msgStore.delete(deletedMsgId);
    } catch (e) { console.error('[ANTIDELETE] revocation error:', e.message); }
}

/* ─────────────────────────────── edit handler ──────────────────────────── */
/**
 * handleMessageEdit(sock, update)
 *
 * `update` is ONE element from Baileys' 'messages.update' array, shaped like:
 *   { key: { ...originalKey, id: <ORIGINAL msg id> },
 *     update: { message: { editedMessage: { message: <NEW content> } } } }
 *
 * 🩹 FIX (was completely broken):
 *   1. This was never called — nothing in the codebase listened for
 *      'messages.update'. Baileys re-emits MESSAGE_EDIT protocol messages
 *      on that event, never through 'messages.upsert', so the old call
 *      site (inside the upsert handler) could never have fired anyway.
 *   2. The parsing paths referenced `message.message.editedMessage.message`
 *      and `message.message.protocolMessage` — neither exists in the real
 *      payload. The actual original-message id lives at top-level `key.id`,
 *      and the new content lives at `update.message.editedMessage.message`.
 *   3. It read from `editStore`, which was only ever written by `storeEdit`
 *      — a function nothing called either. `msgStore` (filled by the
 *      already-working `storeMessage`) already holds the "before" text, so
 *      we reuse that instead of a second, empty cache.
 */
async function handleMessageEdit(sock, update) {
    try {
        const cfg = await loadConfig();
        if (!cfg.trackEdits) return;

        const editedContent = update?.update?.message?.editedMessage?.message;
        if (!editedContent) return;

        const editedMsgId = update?.key?.id;
        if (!editedMsgId) return;

        const original = msgStore.get(editedMsgId);
        if (!original) return; // nothing cached to diff against

        const chatId  = update.key?.remoteJid;
        const isGroup = chatId?.endsWith('@g.us');
        const groupJid = isGroup ? chatId : null;
        if (!await _isEnabled(cfg, groupJid)) return;

        const ownerJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        const editedBy = update.key?.fromMe
            ? ownerJid
            : (update.key?.participant || original.sender || chatId);

        /* ignore if bot itself made the edit */
        if (editedBy === ownerJid) return;

        /* ignore list check */
        if (cfg.ignoreList?.length &&
            (cfg.ignoreList.includes(original.sender) || cfg.ignoreList.includes(editedBy))) return;

        statsEdited++;
        const targetJid = await _resolveTarget(cfg, groupJid, ownerJid);

        const { content: newContent } = _extractContent({ message: editedContent });
        const sender = original.sender || editedBy;

        await sock.sendMessage(targetJid, {
            text: `╔════════════════════════╗\n` +
                  `║  ✏️  REDX ANTI-EDIT   ║\n` +
                  `╚════════════════════════╝\n\n` +
                  `*✏️ Edited By:* @${editedBy?.split('@')[0]}\n` +
                  `*🕒 Originally:* ${_formatTime(original.timestamp)}\n\n` +
                  `*📝 Before:*\n${original.content || '(empty/media)'}\n\n` +
                  `*📝 After:*\n${newContent || '(unknown)'}\n\n` +
                  `> JUNAID-MD↣³⁰² Anti-Edit v4.0`,
            mentions: [editedBy, sender].filter(Boolean)
        });

        /* keep cache in sync so a later delete reports the latest text */
        original.content = newContent;
    } catch (e) { console.error('[ANTIDELETE] edit handler:', e.message); }
}

/* ─────────────────────────────── command handler ───────────────────────── */
module.exports = {
    command:     'antidelete',
    aliases:     ['antidel', 'adel', 'antidl'],
    category:    'owner',
    description: 'Full anti-delete system with per-group, ignore list, edit tracking & stats',
    usage:       '.antidelete <on|off|delpath|group|ignore|edits|stats>',
    ownerOnly:   true,

    async handler(sock, message, args, context = {}) {
        const chatId    = context.chatId || message.key.remoteJid;
        const isGroup   = chatId.endsWith('@g.us');
        const cfg       = await loadConfig();
        const action    = args[0]?.toLowerCase();

        /* ── no args → status ── */
        if (!action) {
            const grp  = cfg.perGroup?.[chatId];
            const dp   = cfg.delpath === 'owner'  ? '👤 Owner DM' :
                         cfg.delpath === 'group'  ? '👥 Same Group' : `📌 ${cfg.delpath}`;
            const gLine = isGroup
                ? `\n*🏘 This Group:* ${grp?.enabled === false ? '❌ OFF' : '✅ ON'}`
                  + (grp?.delpath ? ` | Route: ${grp.delpath}` : '')
                : '';

            return sock.sendMessage(chatId, {
                text: `╔═════════════════════════╗\n` +
                      `║  🗑️  ANTIDELETE v4.0   ║\n` +
                      `╚═════════════════════════╝\n\n` +
                      `*🌐 Global:*    ${cfg.enabled ? '✅ ON' : '❌ OFF'}${gLine}\n` +
                      `*📬 Delpath:*   ${dp}\n` +
                      `*✏️ Edit Track:* ${cfg.trackEdits ? '✅' : '❌'}\n` +
                      `*👻 Self-del:*  ${cfg.ignoreSelfDelete ? 'Ignored' : 'Reported'}\n` +
                      `*🛡 Admin-del:* ${cfg.ignoreAdminDelete ? 'Ignored' : 'Reported'}\n` +
                      `*🚫 Ignores:*   ${cfg.ignoreList?.length || 0} JIDs\n` +
                      `*💾 Cached:*   ${msgStore.size} msgs\n\n` +
                      `*Commands:*\n` +
                      `• \`.antidelete on/off\`\n` +
                      `• \`.antidelete delpath owner|group|<jid>\`\n` +
                      `• \`.antidelete group on|off|delpath <route>\`\n` +
                      `• \`.antidelete ignore add|remove|list <jid>\`\n` +
                      `• \`.antidelete edits on|off\`\n` +
                      `• \`.antidelete selfdelete on|off\`\n` +
                      `• \`.antidelete admindelete on|off\`\n` +
                      `• \`.antidelete ttl <hours>\`\n` +
                      `• \`.antidelete stats\``
            }, { quoted: message });
        }

        /* ── on/off ── */
        if (action === 'on') {
            cfg.enabled = true;
            await saveConfig(cfg);
            return sock.sendMessage(chatId, { text: '✅ *Antidelete ENABLED globally*' }, { quoted: message });
        }
        if (action === 'off') {
            cfg.enabled = false;
            await saveConfig(cfg);
            return sock.sendMessage(chatId, { text: '❌ *Antidelete DISABLED globally*' }, { quoted: message });
        }

        /* ── delpath ── */
        if (action === 'delpath') {
            const sub = args[1]?.toLowerCase();
            if (!sub) {
                return sock.sendMessage(chatId, {
                    text: `*Current delpath:* ${cfg.delpath}\n\nOptions: \`owner\` / \`group\` / \`<full JID>\``
                }, { quoted: message });
            }
            if (['owner', 'group'].includes(sub) || sub.includes('@')) {
                cfg.delpath = sub;
                await saveConfig(cfg);
                return sock.sendMessage(chatId, { text: `✅ Delpath → *${sub}*` }, { quoted: message });
            }
            return sock.sendMessage(chatId, { text: '❌ Invalid. Use: owner / group / JID' }, { quoted: message });
        }

        /* ── group sub-command ── */
        if (action === 'group') {
            if (!isGroup) return sock.sendMessage(chatId,
                { text: '❌ Use inside a group.' }, { quoted: message });
            const sub = args[1]?.toLowerCase();
            if (!cfg.perGroup) cfg.perGroup = {};
            if (!cfg.perGroup[chatId]) cfg.perGroup[chatId] = {};
            const g = cfg.perGroup[chatId];
            if (sub === 'on')  { g.enabled = true;  await saveConfig(cfg); return sock.sendMessage(chatId, { text: '✅ Antidelete ON for this group' }, { quoted: message }); }
            if (sub === 'off') { g.enabled = false; await saveConfig(cfg); return sock.sendMessage(chatId, { text: '❌ Antidelete OFF for this group' }, { quoted: message }); }
            if (sub === 'delpath') {
                const route = args[2]?.toLowerCase();
                if (!route) return sock.sendMessage(chatId, { text: `Group delpath: ${g.delpath || 'global'}` }, { quoted: message });
                if (['owner', 'group'].includes(route) || route.includes('@')) {
                    g.delpath = route;
                    await saveConfig(cfg);
                    return sock.sendMessage(chatId, { text: `✅ Group delpath → *${route}*` }, { quoted: message });
                }
            }
        }

        /* ── ignore list ── */
        if (action === 'ignore') {
            const sub = args[1]?.toLowerCase();
            const jid = args[2];
            if (!cfg.ignoreList) cfg.ignoreList = [];

            if (sub === 'list') {
                const list = cfg.ignoreList.length
                    ? cfg.ignoreList.map((j, i) => `${i + 1}. ${j}`).join('\n')
                    : 'None';
                return sock.sendMessage(chatId, { text: `*🚫 Ignore List:*\n${list}` }, { quoted: message });
            }
            if (sub === 'add' && jid) {
                if (!cfg.ignoreList.includes(jid)) {
                    cfg.ignoreList.push(jid);
                    await saveConfig(cfg);
                }
                return sock.sendMessage(chatId, { text: `✅ Added ${jid} to ignore list` }, { quoted: message });
            }
            if (sub === 'remove' && jid) {
                cfg.ignoreList = cfg.ignoreList.filter(j => j !== jid);
                await saveConfig(cfg);
                return sock.sendMessage(chatId, { text: `🗑️ Removed ${jid} from ignore list` }, { quoted: message });
            }
        }

        /* ── edit tracking ── */
        if (action === 'edits') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'on')  { cfg.trackEdits = true;  await saveConfig(cfg); return sock.sendMessage(chatId, { text: '✅ Edit tracking ON' }, { quoted: message }); }
            if (sub === 'off') { cfg.trackEdits = false; await saveConfig(cfg); return sock.sendMessage(chatId, { text: '❌ Edit tracking OFF' }, { quoted: message }); }
        }

        /* ── self-delete toggle ── */
        if (action === 'selfdelete') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'on')  { cfg.ignoreSelfDelete = false; await saveConfig(cfg); return sock.sendMessage(chatId, { text: '✅ Self-deletes will now be reported' }, { quoted: message }); }
            if (sub === 'off') { cfg.ignoreSelfDelete = true;  await saveConfig(cfg); return sock.sendMessage(chatId, { text: '✅ Self-deletes now silently ignored' }, { quoted: message }); }
        }

        /* ── admin-delete toggle ── */
        if (action === 'admindelete') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'on')  { cfg.ignoreAdminDelete = true;  await saveConfig(cfg); return sock.sendMessage(chatId, { text: '✅ Admin-deletes will be ignored' }, { quoted: message }); }
            if (sub === 'off') { cfg.ignoreAdminDelete = false; await saveConfig(cfg); return sock.sendMessage(chatId, { text: '✅ Admin-deletes will be reported' }, { quoted: message }); }
        }

        /* ── TTL config ── */
        if (action === 'ttl') {
            const hours = parseFloat(args[1]);
            if (isNaN(hours) || hours <= 0) return sock.sendMessage(chatId,
                { text: `Current TTL: ${(cfg.ttlMs || DEFAULT_TTL) / 3_600_000}h\n\nUsage: .antidelete ttl <hours>` }, { quoted: message });
            cfg.ttlMs = hours * 3_600_000;
            await saveConfig(cfg);
            return sock.sendMessage(chatId, { text: `✅ Message TTL → *${hours} hour(s)*` }, { quoted: message });
        }

        /* ── stats ── */
        if (action === 'stats') {
            return sock.sendMessage(chatId, {
                text: `*📊 ANTIDELETE STATS*\n\n` +
                      `*🗑 Deletions caught:* ${statsDeleted}\n` +
                      `*✏️ Edits caught:*    ${statsEdited}\n` +
                      `*📎 Media recovered:* ${statsMedia}\n` +
                      `*💾 Cache size:*     ${msgStore.size} msgs\n` +
                      `*💾 Edit cache:*     ${editStore.size} msgs\n` +
                      `*⏳ TTL:*           ${((cfg.ttlMs || DEFAULT_TTL) / 3_600_000).toFixed(1)}h`
            }, { quoted: message });
        }

        return sock.sendMessage(chatId,
            { text: '❌ Unknown action. Use .antidelete for help.' }, { quoted: message });
    },

    /* exports for index.js / messageHandler.js wiring */
    storeMessage,
    storeEdit,
    handleMessageRevocation,
    handleMessageEdit,
    loadConfig,
    saveConfig
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading antidelete.js:', e.message); }

/* ===== antiedit.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    'use strict';

/*
 * .antiedit (advanced) — caches text per message, and when WhatsApp
 * delivers an edit, reports sender + elapsed time + edit count + a
 * word-level before/after diff. Per-chat on/off toggle, persisted.
 *
 * WIRING — same pattern as handleAutoVV in advanced-vv.js:
 *   const antiedit = require('./plugins/antiedit');
 *   sock.ev.on('messages.upsert', ({ messages }) => messages.forEach(antiedit.cache));
 *   sock.ev.on('messages.update', u => antiedit.handleUpdate(sock, u));
 *
 * NOTE: edit delivery is version-dependent in Baileys. This listens on
 * 'messages.update' with protocolMessage.type === 14 (MESSAGE_EDIT) —
 * the value used by most current builds. If handleUpdate never fires on
 * your version, log the raw event once and the same proto check likely
 * needs to move into your 'messages.upsert' handler instead.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '../data/antiedit.json');
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 min retention, bounded memory

const cache = new Map();   // msgId -> { text, sender, chatId, time, edits }
const timers = new Map();

function loadState() {
    try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
    catch { return { enabled: {}, defaultOn: true }; }
}
function saveState(state) {
    try {
        fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (e) { console.error('[ANTIEDIT] save:', e.message); }
}
function isOn(chatId) {
    const s = loadState();
    return s.enabled[chatId] !== undefined ? s.enabled[chatId] : s.defaultOn !== false;
}

function extractText(msg) {
    const m = msg?.message;
    if (!m) return null;
    return m.conversation || m.extendedTextMessage?.text ||
           m.imageMessage?.caption || m.videoMessage?.caption || null;
}

// Minimal LCS word-diff, no deps.
function wordDiff(oldText = '', newText = '') {
    const a = oldText.split(/\s+/), b = newText.split(/\s+/);
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--)
        for (let j = b.length - 1; j >= 0; j--)
            dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

    let i = 0, j = 0, removed = [], added = [];
    while (i < a.length && j < b.length) {
        if (a[i] === b[j]) { i++; j++; }
        else if (dp[i + 1][j] >= dp[i][j + 1]) removed.push(a[i++]);
        else added.push(b[j++]);
    }
    while (i < a.length) removed.push(a[i++]);
    while (j < b.length) added.push(b[j++]);
    return { removed: removed.join(' '), added: added.join(' ') };
}

function cacheMessage(msg) {
    const id = msg?.key?.id;
    const text = extractText(msg);
    if (!id || text === null || msg.key.fromMe) return;

    cache.set(id, {
        text,
        sender: msg.key.participant || msg.key.remoteJid,
        chatId: msg.key.remoteJid,
        time: Date.now(),
        edits: cache.get(id)?.edits || 0
    });

    clearTimeout(timers.get(id));
    timers.set(id, setTimeout(() => { cache.delete(id); timers.delete(id); }, CACHE_TTL_MS));
}

async function handleUpdate(sock, updates) {
    for (const u of updates) {
        const proto = u.update?.message?.protocolMessage;
        if (!proto || proto.type !== 14) continue; // MESSAGE_EDIT — verify against your proto version

        const id = u.key?.id;
        const chatId = u.key?.remoteJid;
        if (!chatId || !isOn(chatId)) continue;

        const prev = cache.get(id);
        const newText = proto.editedMessage?.conversation ||
                         proto.editedMessage?.extendedTextMessage?.text || '';
        const editsCount = (prev?.edits || 0) + 1;
        const elapsed = prev ? Math.round((Date.now() - prev.time) / 1000) : null;
        const { removed, added } = wordDiff(prev?.text || '', newText);

        const lines = [
            '✏️ *Message edited*',
            prev?.sender ? `👤 ${prev.sender.split('@')[0]}` : null,
            elapsed !== null ? `⏱️ ${elapsed}s after sending` : null,
            `🔁 edit #${editsCount}`,
            '',
            `*before:* ${prev?.text || '_(not cached)_'}`,
            `*after:* ${newText}`,
            (removed || added) ? `*diff:* ${removed ? `−${removed} ` : ''}${added ? `+${added}` : ''}` : null
        ].filter(Boolean).join('\n');

        await sock.sendMessage(chatId, { text: lines });

        if (prev) { prev.text = newText; prev.time = Date.now(); prev.edits = editsCount; cache.set(id, prev); }
    }
}

const antiEditCommand = {
    command: 'antiedit',
    category: 'owner',
    description: 'Toggle advanced edit-detection for this chat',
    usage: '.antiedit on|off|status',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const opt = (Array.isArray(args) ? args[0] : args)?.toLowerCase();
        const state = loadState();

        if (opt === 'on' || opt === 'off') {
            state.enabled[chatId] = opt === 'on';
            saveState(state);
            return sock.sendMessage(chatId, { text: `✏️ Anti-edit ${opt === 'on' ? 'enabled' : 'disabled'} here.` }, { quoted: message });
        }
        await sock.sendMessage(chatId, {
            text: `✏️ Anti-edit is *${isOn(chatId) ? 'ON' : 'OFF'}* here.\nUse \`.antiedit on\` / \`.antiedit off\``
        }, { quoted: message });
    }
};

module.exports = antiEditCommand;
module.exports.cache = cacheMessage;
module.exports.handleUpdate = handleUpdate;

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading antiedit.js:', e.message); }

/* ===== antiflood.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/antiflood.js — JUNAID-MD↣³⁰² Ultra Anti-Flood v2
'use strict';
const store = require('../lib/store');

const KEY = 'antiflood_v2';
const DEFAULT = { enabled: false, maxMsgs: 7, windowSec: 5, action: 'mute', muteDurMin: 5, warnFirst: true };

// In-memory tracker: { 'groupId:userId': { count, firstTs, warned } }
const tracker = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of tracker) if (now - v.firstTs > 60000) tracker.delete(k);
}, 30000);

// Mute expiry: { 'groupId:userId': expireTs }
const muteExpiry = new Map();

async function getConfig(chatId) {
  try { return (await store.getSetting(chatId, KEY)) || { ...DEFAULT }; } catch { return { ...DEFAULT }; }
}
async function setConfig(chatId, cfg) { await store.setSetting(chatId, KEY, cfg); }

async function isBotAdmin(sock, chatId) {
  try {
    const meta = await sock.groupMetadata(chatId);
    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    return meta.participants.some(p => (p.id === botJid || p.jid === botJid) && (p.admin === 'admin' || p.admin === 'superadmin'));
  } catch { return false; }
}

async function muteMember(sock, chatId, userId, durMin) {
  const expireTs = Date.now() + durMin * 60 * 1000;
  muteExpiry.set(`${chatId}:${userId}`, expireTs);
  try {
    await sock.groupParticipantsUpdate(chatId, [userId], 'remove');
    // Re-add after mute duration
    setTimeout(async () => {
      try { await sock.groupParticipantsUpdate(chatId, [userId], 'add'); } catch {}
      muteExpiry.delete(`${chatId}:${userId}`);
    }, durMin * 60 * 1000);
    return true;
  } catch { return false; }
}

/* ── Flood check — called from messageHandler or auto ─────────── */
async function checkFlood(sock, message, chatId, senderId) {
  if (!chatId.endsWith('@g.us')) return;
  const cfg = await getConfig(chatId);
  if (!cfg.enabled) return;

  // Skip admins
  try {
    const meta = await sock.groupMetadata(chatId);
    const p = meta.participants.find(x => x.id === senderId || x.jid === senderId);
    if (p?.admin) return;
  } catch {}

  const tk = `${chatId}:${senderId}`;
  const now = Date.now();
  const ent = tracker.get(tk) || { count: 0, firstTs: now, warned: false };

  if (now - ent.firstTs > cfg.windowSec * 1000) {
    ent.count = 1; ent.firstTs = now; ent.warned = false;
  } else {
    ent.count++;
  }
  tracker.set(tk, ent);

  if (ent.count < cfg.maxMsgs) return;

  const tag = `@${senderId.split('@')[0]}`;
  const canAct = await isBotAdmin(sock, chatId);

  if (cfg.warnFirst && !ent.warned) {
    ent.warned = true;
    await sock.sendMessage(chatId, {
      text: `⚠️ *Anti-Flood Warning*\n${tag} sending too fast! Slow down or action will be taken.`,
      mentions: [senderId]
    });
    return;
  }

  if (cfg.action === 'mute' || cfg.action === 'kick') {
    if (!canAct) {
      return sock.sendMessage(chatId, { text: `⚠️ Flood detected from ${tag} but bot lacks admin rights.`, mentions: [senderId] });
    }
    if (cfg.action === 'mute') {
      const ok = await muteMember(sock, chatId, senderId, cfg.muteDurMin);
      await sock.sendMessage(chatId, {
        text: `🚫 *Flood detected!*\n${tag} temporarily removed for ${cfg.muteDurMin} min. Will be re-added.`,
        mentions: [senderId]
      });
    } else {
      await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
      await sock.sendMessage(chatId, { text: `🚫 *Flooder kicked:* ${tag}`, mentions: [senderId] });
    }
  } else {
    // warn only
    await sock.sendMessage(chatId, {
      text: `🚫 *FLOOD STOP!* ${tag} — You are flooding this group!`, mentions: [senderId]
    });
  }
  tracker.delete(tk);
}

module.exports = {
  command: 'antiflood',
  aliases: ['flood', 'antispam'],
  category: 'admin',
  description: 'Detect & stop message flooding with auto-mute/kick',
  usage: '.antiflood [on|off|set|status]',
  adminOnly: true,
  checkFlood, // exported for messageHandler hook

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return sock.sendMessage(chatId, { text: '❌ Groups only.' }, { quoted: message });

    const sub = (args[0] || 'status').toLowerCase();
    const cfg = await getConfig(chatId);

    const reply = t => sock.sendMessage(chatId, { text: t }, { quoted: message });

    if (sub === 'on')  { cfg.enabled = true;  await setConfig(chatId, cfg); return reply('✅ Anti-flood *ON*'); }
    if (sub === 'off') { cfg.enabled = false; await setConfig(chatId, cfg); return reply('❌ Anti-flood *OFF*'); }

    if (sub === 'set') {
      // .antiflood set msgs <n>  |  win <s>  |  action mute|kick|warn  |  mute <min>
      const [, param, val] = args;
      if (param === 'msgs'   && val) { cfg.maxMsgs    = +val; await setConfig(chatId, cfg); return reply(`✅ Max msgs/window: *${val}*`); }
      if (param === 'win'    && val) { cfg.windowSec  = +val; await setConfig(chatId, cfg); return reply(`✅ Window: *${val}s*`); }
      if (param === 'action' && val) { cfg.action     = val;  await setConfig(chatId, cfg); return reply(`✅ Action: *${val}*`); }
      if (param === 'mute'   && val) { cfg.muteDurMin = +val; await setConfig(chatId, cfg); return reply(`✅ Mute duration: *${val} min*`); }
      if (param === 'warn')         { cfg.warnFirst   = val === 'on'; await setConfig(chatId, cfg); return reply(`✅ Warn-first: *${cfg.warnFirst}*`); }
      return reply('Usage: `.antiflood set msgs 7 | win 5 | action mute|kick|warn | mute 10 | warn on|off`');
    }

    return reply(
      `╔══════════════════════╗\n` +
      `║  🛡 ANTI-FLOOD CONFIG  ║\n` +
      `╚══════════════════════╝\n\n` +
      `🔘 Status   : ${cfg.enabled ? '✅ ON' : '❌ OFF'}\n` +
      `📨 Max msgs : ${cfg.maxMsgs} in ${cfg.windowSec}s\n` +
      `⚡ Action   : ${cfg.action}\n` +
      `⏳ Mute dur : ${cfg.muteDurMin} min\n` +
      `⚠️ Warn 1st : ${cfg.warnFirst ? 'Yes' : 'No'}\n\n` +
      `Commands:\n` +
      `• \`.antiflood on/off\`\n` +
      `• \`.antiflood set msgs <n>\`\n` +
      `• \`.antiflood set win <sec>\`\n` +
      `• \`.antiflood set action mute|kick|warn\`\n` +
      `• \`.antiflood set mute <min>\``
    );
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading antiflood.js:', e.message); }

/* ===== antilink.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *  antilink.js — ULTRA v2  (JUNAID-MD↣³⁰²)
 *  Developed by JUNAID-MD↣³⁰²
 *
 *  ULTRA features:
 *  - Detects WA groups, channels, Telegram, Discord, ALL URLs
 *  - Detects shortened/obfuscated URLs (bit.ly, tinyurl, etc.)
 *  - Domain whitelist support
 *  - Shadow-warn (no kick, just warning) vs kick vs delete-only
 *  - Per-group whitelist of trusted domains
 *  - Message delete + immediate reaction
 *  - Per-group persistent config
 *  - Handles caption links (images/videos with link captions)
 *  - Anti-bypass: detects spaces in URLs like w w w . g o o g l e . c o m
 *****************************************************************************/

'use strict';
const store  = require('../lib/lightweight_store');
const isOwnerOrSudo = require('../lib/isOwner');
const isAdmin = require('../lib/isAdmin');
const { sendSafeMessage } = require('../lib/sendSafeMessage');

// ─── Default config ────────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
    enabled:     false,
    mode:        'warn',   // warn | kick | delete | shadowban
    maxWarnings: 3,
    whitelist:   [],        // allowed domains
    types: {
        waGroup:   true,
        waChannel: true,
        telegram:  true,
        discord:   true,
        allLinks:  true,
    }
};

// ─── Store helpers ─────────────────────────────────────────────────────────
async function readConfig(chatId) {
    try {
        const c = await store.getSetting(chatId, 'antilink_v2');
        return c ? { ...DEFAULT_CONFIG, ...c } : { ...DEFAULT_CONFIG };
    } catch { return { ...DEFAULT_CONFIG }; }
}

async function writeConfig(chatId, config) {
    await store.saveSetting(chatId, 'antilink_v2', config);
}

// In-memory warning counters
const warningCount = new Map();
const shadowBanned = new Set();
const _notAdminNotified = new Map(); // chatId → ts, throttle the "make me admin" notice

// ─── Ultra link detection ──────────────────────────────────────────────────
function detectLinks(text) {
    if (!text) return null;

    // Normalize: collapse spaces in "w w w . g o o g l e . c o m" style
    const normalized = text.replace(/(\w)\s+\./g, '$1.').replace(/\.\s+(\w)/g, '.$1');

    const patterns = {
        waGroup:    /chat\.whatsapp\.com\/[A-Za-z0-9+_/=-]{10,}/i,
        waChannel:  /(?:wa\.me\/channel|whatsapp\.com\/channel)\/[A-Za-z0-9+_/=-]{10,}/i,
        telegram:   /(?:t\.me|telegram\.me|telegram\.dog)\/(?:\+|joinchat\/)?[A-Za-z0-9_-]+/i,
        discord:    /(?:discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[A-Za-z0-9-]+/i,
        allLinks:   /(?:https?:\/\/|ftp:\/\/|www\.)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b[-a-zA-Z0-9()@:%_+.~#?&/=]*/i,
        shortLinks: /(?:bit\.ly|tinyurl\.com|goo\.gl|ow\.ly|buff\.ly|rebrand\.ly|t\.co)\/[A-Za-z0-9_-]+/i,
    };

    // Contact link exemption (wa.me/+number)
    const contactLink = /wa\.me\/\+?[0-9]{7,15}(?:\?.*)?$/i;
    if (contactLink.test(text)) return null;

    for (const [type, pattern] of Object.entries(patterns)) {
        const match = pattern.exec(normalized) || pattern.exec(text);
        if (match) return { type, match: match[0] };
    }
    return null;
}

// ─── Whitelist check ───────────────────────────────────────────────────────
function isWhitelisted(linkMatch, whitelist) {
    if (!whitelist?.length) return false;
    const lower = linkMatch.toLowerCase();
    return whitelist.some(w => lower.includes(w.toLowerCase()));
}

/* ─── Main detection handler (called from messageHandler) ───────────────── */
async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const config = await readConfig(chatId);
        if (!config?.enabled) return;

        // Collect all text from message (body + caption)
        const texts = [
            userMessage,
            message.message?.imageMessage?.caption,
            message.message?.videoMessage?.caption,
            message.message?.documentMessage?.caption,
            message.message?.extendedTextMessage?.text,
        ].filter(Boolean);

        // Skip contacts, locations, protocol messages
        if (message.message?.contactMessage ||
            message.message?.contactsArrayMessage ||
            message.message?.locationMessage ||
            message.message?.protocolMessage) return;

        let detected = null;
        for (const t of texts) {
            detected = detectLinks(t);
            if (detected) break;
        }
        if (!detected) return;

        // Check if type is enabled
        const typeMap = {
            waGroup: 'waGroup', waChannel: 'waChannel',
            telegram: 'telegram', discord: 'discord',
            allLinks: 'allLinks', shortLinks: 'allLinks'
        };
        const typeKey = typeMap[detected.type] || 'allLinks';
        if (config.types && config.types[typeKey] === false) return;

        // Whitelist check
        if (isWhitelisted(detected.match, config.whitelist)) return;

        // Permission check: skip owner/sudo/admin
        const isOwnerSudo = await isOwnerOrSudo(senderId, sock, chatId);
        if (isOwnerSudo) return;
        if (senderId.includes(sock.user?.id?.split(':')[0])) return;

        let isBotAdmin = true; // assume true unless metadata says otherwise
        try {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            if (adminStatus.isSenderAdmin) return;
            isBotAdmin = adminStatus.isBotAdmin;
        } catch (e) { console.error('[ANTILINK] isAdmin check failed:', e.message); }

        const participant  = message.key.participant || senderId;
        const warningKey   = `${chatId}:${participant}`;
        const senderShort  = senderId.split('@')[0];

        // 🩹 FIX: delete-for-everyone of ANOTHER user's message requires the
        // bot to be a group admin (WhatsApp enforces this server-side). If
        // the bot isn't admin, this call silently fails — and the old code
        // swallowed the error with an empty catch, so it LOOKED like
        // "antilink isn't deleting links" with zero clue why. Now: skip the
        // doomed attempt, log it, and tell the group/owner once.
        if (isBotAdmin) {
            try {
                await sock.sendMessage(chatId, {
                    delete: { remoteJid: chatId, fromMe: false, id: message.key.id, participant }
                });
            } catch (e) {
                console.error(`[ANTILINK] Delete failed in ${chatId}:`, e.message);
            }
        } else {
            const last = _notAdminNotified.get(chatId) || 0;
            if (Date.now() - last > 30 * 60 * 1000) { // once per 30min per group
                _notAdminNotified.set(chatId, Date.now());
                sendSafeMessage(sock, chatId, {
                    text: `⚠️ Antilink detected a link but can't delete it — I'm not admin here. Make me admin to enable delete/kick.`
                });
            }
        }

        // React to show detection
        try { await sock.sendMessage(chatId, { react: { text: '🚫', key: message.key } }); }
        catch (e) { console.error(`[ANTILINK] Reaction failed in ${chatId}:`, e.message); }

        if (config.mode === 'delete') {
            // Silent delete — no warning, no kick
            return;
        }

        if (config.mode === 'shadowban') {
            shadowBanned.add(`${chatId}:${senderId}`);
            await sendSafeMessage(sock, chatId, {
                text: `🚫 @${senderShort} — Link detected. You are now shadow-restricted.`,
                mentions: [senderId]
            });
            return;
        }

        // Warn / kick modes
        let warns = (warningCount.get(warningKey) || 0) + 1;
        warningCount.set(warningKey, warns);

        const max       = config.mode === 'kick' ? 1 : (config.maxWarnings || 3);
        const typeLabel = detected.type.replace(/([A-Z])/g, ' $1').trim();

        if (warns < max) {
            await sendSafeMessage(sock, chatId, {
                text: `⚠️ *Antilink Warning ${warns}/${max}*\n\n@${senderShort}, sharing ${typeLabel} links is not allowed!\n_${max - warns} more warning(s) before action._`,
                mentions: [senderId]
            });
        } else if (!isBotAdmin) {
            // Can't kick without admin — say so instead of pretending to try
            warningCount.set(warningKey, 0);
            await sendSafeMessage(sock, chatId, {
                text: `⚠️ @${senderShort} hit the warning limit, but I can't remove them — make me admin.`,
                mentions: [senderId]
            });
        } else {
            // Kick — resolve @lid to the authoritative group participant JID.
            warningCount.set(warningKey, 0);
            try {
                const removalJid = await resolveRemovalJidLegacy(sock, chatId, message, senderId);
                if (!removalJid) throw new Error('participant JID could not be resolved');
                await sock.groupParticipantsUpdate(chatId, [removalJid], 'remove');
                await sendSafeMessage(sock, chatId, {
                    text: `🚫 @${senderShort} removed for repeatedly sharing links.`,
                    mentions: [senderId]
                });
            } catch (e) {
                console.error(`[ANTILINK] Kick failed in ${chatId}:`, e.message);
                await sendSafeMessage(sock, chatId, {
                    text: `⚠️ Could not remove @${senderShort} — make sure bot is admin.`,
                    mentions: [senderId]
                });
            }
        }
    } catch (e) {
        console.error('[ANTILINK] Error:', e.message);
    }
}

/* ─── Check if user is shadow-banned ─────────────────────────────────────── */
function isShadowBanned(chatId, senderId) {
    return shadowBanned.has(`${chatId}:${senderId}`);
}

/* ─── Plugin handler ─────────────────────────────────────────────────────── */
module.exports = {
    command: 'antilink',
    aliases: ['alink', 'linkblock'],
    category: 'admin',
    description: 'Ultra link protection — detect, warn, and kick link posters',
    usage: '.antilink on | off | status | mode <warn|kick|delete|shadowban> | max <n> | whitelist <add|remove|list> <domain> | types | reset',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId    = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const config    = await readConfig(chatId);
        const action    = args[0]?.toLowerCase();

        const reply = (text) =>
            sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (!action || action === 'status') {
            return reply(
                `🔗 *ANTILINK ULTRA — Status*\n\n` +
                `Status:      ${config.enabled ? '✅ ON' : '❌ OFF'}\n` +
                `Mode:        ${(config.mode || 'warn').toUpperCase()}\n` +
                `Max Warns:   ${config.mode === 'kick' ? 'Instant kick' : config.mode === 'delete' ? 'Silent delete' : config.maxWarnings}\n` +
                `Whitelist:   ${config.whitelist?.length || 0} domain(s)\n` +
                `Types:       ${Object.entries(config.types || {}).filter(([,v]) => v).map(([k]) => k).join(', ')}\n\n` +
                `Commands:\n` +
                `• \`.antilink on/off\`\n` +
                `• \`.antilink mode warn|kick|delete|shadowban\`\n` +
                `• \`.antilink max <n>\` — warn limit before kick\n` +
                `• \`.antilink whitelist add <domain>\`\n` +
                `• \`.antilink whitelist remove <domain>\`\n` +
                `• \`.antilink whitelist list\`\n` +
                `• \`.antilink types\` — toggle which link types to detect\n` +
                `• \`.antilink reset\` — reset all settings`
            );
        }

        if (action === 'on') {
            config.enabled = true;
            config.mode = 'kick';
            config.maxWarnings = 1;
            await writeConfig(chatId, config);
            return reply(`✅ *Antilink ULTRA enabled!*\nMode: KICK — link message will be deleted and sender removed (bot must be admin).`);
        }

        if (action === 'off') {
            config.enabled = false;
            await writeConfig(chatId, config);
            return reply('❌ Antilink disabled.');
        }

        if (action === 'mode') {
            const m = args[1]?.toLowerCase();
            const valid = ['warn', 'kick', 'delete', 'shadowban'];
            if (!valid.includes(m)) return reply(`❌ Mode: ${valid.join(' | ')}`);
            config.mode = m;
            await writeConfig(chatId, config);
            return reply(`✅ Mode set to *${m.toUpperCase()}*`);
        }

        if (action === 'max') {
            const n = parseInt(args[1]);
            if (isNaN(n) || n < 1) return reply('❌ Usage: `.antilink max <number>`');
            config.maxWarnings = n;
            await writeConfig(chatId, config);
            return reply(`✅ Max warnings: *${n}*`);
        }

        if (action === 'whitelist') {
            const sub = args[1]?.toLowerCase();
            const dom = args[2]?.toLowerCase();
            if (!config.whitelist) config.whitelist = [];
            if (sub === 'add') {
                if (!dom) return reply('❌ Usage: `.antilink whitelist add <domain>`');
                if (!config.whitelist.includes(dom)) config.whitelist.push(dom);
                await writeConfig(chatId, config);
                return reply(`✅ Added to whitelist: \`${dom}\``);
            }
            if (sub === 'remove') {
                config.whitelist = config.whitelist.filter(d => d !== dom);
                await writeConfig(chatId, config);
                return reply(`✅ Removed from whitelist: \`${dom}\``);
            }
            if (sub === 'list') {
                if (!config.whitelist.length) return reply('📭 Whitelist is empty.');
                return reply(`✅ *Whitelisted domains:*\n${config.whitelist.map((d, i) => `${i+1}. \`${d}\``).join('\n')}`);
            }
            return reply('❌ Usage: `.antilink whitelist add|remove|list <domain>`');
        }

        if (action === 'types') {
            const t = config.types || {};
            return reply(
                `🔘 *Link type detection:*\n\n` +
                Object.entries(t).map(([k, v]) => `${v ? '✅' : '❌'} ${k}`).join('\n') +
                `\n\nToggle: \`.antilink toggle <type>\``
            );
        }

        if (action === 'toggle') {
            const type = args[1];
            if (!type || !config.types?.hasOwnProperty(type)) {
                return reply(`❌ Types: ${Object.keys(config.types || {}).join(', ')}`);
            }
            config.types[type] = !config.types[type];
            await writeConfig(chatId, config);
            return reply(`✅ \`${type}\` detection: ${config.types[type] ? 'ON' : 'OFF'}`);
        }

        if (action === 'reset') {
            await writeConfig(chatId, { ...DEFAULT_CONFIG });
            warningCount.forEach((_, k) => { if (k.startsWith(chatId)) warningCount.delete(k); });
            return reply('🔄 Antilink settings reset to defaults.');
        }

        return reply('❌ Unknown command. Use `.antilink status` for help.');
    },

    handleLinkDetection,
    isShadowBanned,
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading antilink.js:', e.message); }

/* ===== antispam.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *  antispam.js — ULTRA v2  (JUNAID-MD↣³⁰²)
 *  Developed by JUNAID-MD↣³⁰²
 *
 *  ULTRA features:
 *  - Rate limiting (msg/sec window)
 *  - Repetitive message detection (flood with same text)
 *  - Media spam detection (rapid image/video/sticker sends)
 *  - Tag spam detection (mass @mention)
 *  - Per-user adaptive warn counter with persistent storage
 *  - Auto-mute (if admin) before kick
 *  - Configurable per-group
 *****************************************************************************/

'use strict';
const fs    = require('fs');
const path  = require('path');
const store = require('../lib/lightweight_store');

const CONFIG_PATH = path.join(process.cwd(), 'data', 'antispam_v2.json');
const HAS_DB      = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.DB_URL);

const DEFAULT_GROUP = {
    enabled:        false,
    maxMessages:    5,
    windowSeconds:  5,
    action:         'warn',  // warn | kick | mute
    warnCount:      3,
    mediaSpam:      true,    // detect rapid media sends
    repeatSpam:     true,    // detect same message repeated
    tagSpam:        true,    // detect mass mentions
    repeatThreshold: 3,      // same msg X times triggers
};

/* ─── Config I/O ───────────────────────────────────────────────────────────── */
async function loadConfig() {
    try {
        if (HAS_DB) {
            return (await store.getSetting('global', 'antispam_v2')) || { groups: {} };
        }
        if (!fs.existsSync(CONFIG_PATH)) {
            fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
            fs.writeFileSync(CONFIG_PATH, JSON.stringify({ groups: {} }, null, 2));
        }
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    } catch { return { groups: {} }; }
}

async function saveConfig(config) {
    if (HAS_DB) {
        await store.saveSetting('global', 'antispam_v2', config);
    } else {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    }
}

/* ─── In-memory trackers ───────────────────────────────────────────────────── */
// tracker: chatId → userId → { count, firstTs, warns, lastTexts: [], mediaCount, mediaFirstTs, tagCount }
const tracker    = new Map();
const metaCache  = new Map();
const META_TTL   = 5 * 60 * 1000;

async function getCachedMeta(sock, chatId) {
    const c = metaCache.get(chatId);
    if (c && (Date.now() - c.ts) < META_TTL) return c.data;
    try {
        const meta = await sock.groupMetadata(chatId);
        metaCache.set(chatId, { data: meta, ts: Date.now() });
        return meta;
    } catch { return metaCache.get(chatId)?.data || null; }
}

function isAdmin(participants, jid) {
    const num = jid.split('@')[0].split(':')[0];
    return participants.some(p => {
        if (!['admin', 'superadmin'].includes(p.admin)) return false;
        return (p.id || '').includes(num) || (p.lid || '').includes(num);
    });
}

function isBotAdmin(participants, sock) {
    const id  = (sock.user?.id  || '').split('@')[0].split(':')[0];
    const lid = (sock.user?.lid || '').split('@')[0].split(':')[0];
    return participants.some(p => {
        if (!['admin', 'superadmin'].includes(p.admin)) return false;
        const pn = (p.id || '').split('@')[0].split(':')[0];
        return pn === id || pn === lid;
    });
}

/* ─── Main detection ────────────────────────────────────────────────────────── */
async function handleAntiSpam(sock, chatId, message, senderId, senderIsOwnerOrSudo) {
    try {
        if (message.key.fromMe || senderIsOwnerOrSudo) return false;

        const cfg = await loadConfig();
        const gc  = cfg.groups?.[chatId];
        if (!gc?.enabled) return false;

        const meta = await getCachedMeta(sock, chatId);
        if (!meta) return false;
        const parts = meta.participants || [];

        if (isAdmin(parts, senderId)) return false;
        const botAdmin = isBotAdmin(parts, sock);

        const now = Date.now();
        if (!tracker.has(chatId)) tracker.set(chatId, new Map());
        const gTracker = tracker.get(chatId);

        if (!gTracker.has(senderId)) {
            gTracker.set(senderId, {
                count: 1, firstTs: now, warns: 0,
                lastTexts: [], mediaCount: 0, mediaFirstTs: now, tagCount: 0, tagFirstTs: now
            });
            return false;
        }

        const u  = gTracker.get(senderId);
        const windowMs = gc.windowSeconds * 1000;

        // ── Text/rate flooding ─────────────────────────────────────────────
        if (now - u.firstTs > windowMs) {
            u.count = 1; u.firstTs = now;
        } else {
            u.count++;
        }

        // ── Repeat spam detection ───────────────────────────────────────────
        let isRepeat = false;
        if (gc.repeatSpam) {
            const body = (message.message?.conversation ||
                         message.message?.extendedTextMessage?.text || '').trim().toLowerCase();
            if (body) {
                u.lastTexts.push(body);
                if (u.lastTexts.length > (gc.repeatThreshold + 2)) u.lastTexts.shift();
                const count = u.lastTexts.filter(t => t === body).length;
                if (count >= (gc.repeatThreshold || 3)) {
                    isRepeat = true;
                    u.lastTexts = [];
                }
            }
        }

        // ── Media spam detection ─────────────────────────────────────────────
        let isMediaSpam = false;
        if (gc.mediaSpam) {
            const isMedia = message.message?.imageMessage ||
                            message.message?.videoMessage ||
                            message.message?.stickerMessage ||
                            message.message?.audioMessage ||
                            message.message?.documentMessage;
            if (isMedia) {
                if (now - u.mediaFirstTs > windowMs) {
                    u.mediaCount = 1; u.mediaFirstTs = now;
                } else {
                    u.mediaCount++;
                }
                if (u.mediaCount > gc.maxMessages) {
                    isMediaSpam = true;
                    u.mediaCount = 0;
                }
            }
        }

        // ── Tag spam ──────────────────────────────────────────────────────────
        let isTagSpam = false;
        if (gc.tagSpam) {
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (mentioned?.length >= 5) {
                isTagSpam = true;
            }
        }

        const isRateSpam = u.count > gc.maxMessages;
        const triggered  = isRateSpam || isRepeat || isMediaSpam || isTagSpam;

        if (!triggered) return false;

        // Reset count
        u.count = 0; u.firstTs = now;

        const reason = isRepeat ? '(repeat messages)' :
                       isMediaSpam ? '(media flood)' :
                       isTagSpam ? '(mass mentions)' : '(message flood)';

        const short = senderId.split('@')[0];

        // ── WARN mode ────────────────────────────────────────────────────────
        if (gc.action === 'warn') {
            u.warns++;
            const left = gc.warnCount - u.warns;
            if (left > 0) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ @${short} *Stop spamming!* ${reason}\n_Warning ${u.warns}/${gc.warnCount}. ${left} more before removal._`,
                    mentions: [senderId]
                });
            } else {
                u.warns = 0;
                if (botAdmin) {
                    await sock.sendMessage(chatId, {
                        text: `🚫 @${short} removed after ${gc.warnCount} spam warnings ${reason}.`,
                        mentions: [senderId]
                    });
                    await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                } else {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ @${short} reached max warnings. Bot needs admin rights to remove.`,
                        mentions: [senderId]
                    });
                }
            }
            return true;
        }

        // ── KICK / MUTE ───────────────────────────────────────────────────────
        if (['kick', 'mute'].includes(gc.action)) {
            if (!botAdmin) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ Spam from @${short} ${reason} — bot needs admin rights to ${gc.action}.`,
                    mentions: [senderId]
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `🚫 @${short} removed for spamming ${reason}.`,
                    mentions: [senderId]
                });
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            }
            return true;
        }

        return false;
    } catch (e) {
        console.error('[ANTISPAM] Error:', e.message);
        return false;
    }
}

function invalidateGroupCache(chatId) {
    metaCache.delete(chatId);
    tracker.delete(chatId);
}

/* ─── Plugin ──────────────────────────────────────────────────────────────── */
module.exports = {
    command: 'antispam',
    aliases: ['floodprotect', 'antiflood'],
    category: 'admin',
    description: 'Ultra-level group spam protection with media/repeat/tag detection',
    usage: '.antispam on|off|status|set <msgs> <secs>|action <warn|kick>|warns <n>|media on|off|repeat on|off|tags on|off',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId    = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const isBotAdm  = context.isBotAdmin || false;

        const cfg = await loadConfig();
        if (!cfg.groups) cfg.groups = {};
        if (!cfg.groups[chatId]) cfg.groups[chatId] = { ...DEFAULT_GROUP };
        const gc  = cfg.groups[chatId];
        const sub = args[0]?.toLowerCase();

        const reply = (text) =>
            sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        const save = async () => { cfg.groups[chatId] = gc; await saveConfig(cfg); };

        if (!sub || sub === 'status') {
            return reply(
                `🛡️ *ANTISPAM ULTRA — Status*\n\n` +
                `Status:        ${gc.enabled ? '✅ ON' : '❌ OFF'}\n` +
                `Rate limit:    ${gc.maxMessages} msgs / ${gc.windowSeconds}s\n` +
                `Action:        ${gc.action?.toUpperCase()}\n` +
                `Warn limit:    ${gc.warnCount}\n` +
                `Media spam:    ${gc.mediaSpam ? '✅' : '❌'}\n` +
                `Repeat spam:   ${gc.repeatSpam ? '✅' : '❌'} (${gc.repeatThreshold}× same msg)\n` +
                `Tag spam:      ${gc.tagSpam ? '✅' : '❌'} (5+ mentions)\n` +
                `Bot is admin:  ${isBotAdm ? '✅' : '❌'}\n\n` +
                `Commands:\n` +
                `.antispam on/off\n` +
                `.antispam set <msgs> <secs>\n` +
                `.antispam action warn|kick|mute\n` +
                `.antispam warns <n>\n` +
                `.antispam media on|off\n` +
                `.antispam repeat on|off\n` +
                `.antispam tags on|off`
            );
        }

        if (sub === 'on')  { gc.enabled = true;  await save(); return reply(`✅ Antispam ON — ${gc.maxMessages} msgs/${gc.windowSeconds}s`); }
        if (sub === 'off') { gc.enabled = false; await save(); return reply('❌ Antispam OFF.'); }

        if (sub === 'set') {
            const m = parseInt(args[1]), s = parseInt(args[2]);
            if (isNaN(m) || isNaN(s) || m < 2 || s < 1) return reply('❌ `.antispam set <msgs> <secs>` e.g. `.antispam set 5 10`');
            gc.maxMessages = m; gc.windowSeconds = s;
            await save();
            return reply(`✅ Rate limit: *${m} msgs* in *${s}s*`);
        }

        if (sub === 'action') {
            const a = args[1]?.toLowerCase();
            if (!['warn', 'kick', 'mute'].includes(a)) return reply('❌ Action: warn | kick | mute');
            gc.action = a; await save();
            return reply(`✅ Action: *${a.toUpperCase()}*`);
        }

        if (sub === 'warns') {
            const n = parseInt(args[1]);
            if (isNaN(n) || n < 1) return reply('❌ `.antispam warns <number>`');
            gc.warnCount = n; await save();
            return reply(`✅ Warn limit: *${n}*`);
        }

        if (sub === 'media') {
            gc.mediaSpam = args[1] === 'on';
            await save();
            return reply(`✅ Media spam detection: ${gc.mediaSpam ? 'ON' : 'OFF'}`);
        }

        if (sub === 'repeat') {
            gc.repeatSpam = args[1] === 'on';
            await save();
            return reply(`✅ Repeat message detection: ${gc.repeatSpam ? 'ON' : 'OFF'}`);
        }

        if (sub === 'tags') {
            gc.tagSpam = args[1] === 'on';
            await save();
            return reply(`✅ Tag spam detection: ${gc.tagSpam ? 'ON' : 'OFF'}`);
        }

        if (sub === 'reset') {
            cfg.groups[chatId] = { ...DEFAULT_GROUP };
            await saveConfig(cfg);
            invalidateGroupCache(chatId);
            return reply('🔄 Antispam reset to defaults.');
        }

        return reply('❌ Unknown. Use `.antispam status`');
    },

    handleAntiSpam,
    invalidateGroupCache
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading antispam.js:', e.message); }

/* ===== antitag.js ===== */
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

async function setAntitag(chatId, type, action) {
    try {
        await store.saveSetting(chatId, 'antitag', {
            enabled: true,
            action: action,
            type: type
        });
        return true;
    } catch (error) {
        console.error('Error setting antitag:', error);
        return false;
    }
}

async function getAntitag(chatId, _type) {
    try {
        const settings = await store.getSetting(chatId, 'antitag');
        return settings || null;
    } catch (error) {
        console.error('Error getting antitag:', error);
        return null;
    }
}

async function removeAntitag(chatId, _type) {
    try {
        await store.saveSetting(chatId, 'antitag', {
            enabled: false,
            action: null,
            type: null
        });
        return true;
    } catch (error) {
        console.error('Error removing antitag:', error);
        return false;
    }
}

async function handleTagDetection(sock, chatId, message, senderId) {
    try {
        const antitagSetting = await getAntitag(chatId, 'on');
        if (!antitagSetting || !antitagSetting.enabled) return;

        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const messageText = (
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            ''
        );

        const textMentions = messageText.match(/@[\d+\s\-()~.]+/g) || [];
        const numericMentions = messageText.match(/@\d{10,}/g) || [];
        const uniqueNumericMentions = new Set();
        numericMentions.forEach(mention => {
            const numMatch = mention.match(/@(\d+)/);
            if (numMatch) uniqueNumericMentions.add(numMatch[1]);
        });

        const mentionedJidCount = mentionedJids.length;
        const numericMentionCount = uniqueNumericMentions.size;
        const totalMentions = Math.max(mentionedJidCount, numericMentionCount);

        if (totalMentions >= 3) {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            const mentionThreshold = Math.ceil(participants.length * 0.5);
            const hasManyNumericMentions = numericMentionCount >= 10 ||
                (numericMentionCount >= 5 && numericMentionCount >= mentionThreshold);

            if (totalMentions >= mentionThreshold || hasManyNumericMentions) {
                const action = antitagSetting.action || 'delete';

                if (action === 'delete') {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *Tagall Detected!*\n\n@${senderId.split('@')[0]}, tagging all members is not allowed.`,
                        mentions: [senderId]
                    });
                } else if (action === 'kick') {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });
                    try {
                        await sock.groupParticipantsUpdate(chatId, [senderId], "remove");
                        await sock.sendMessage(chatId, {
                            text: `🚫 *Antitag Action!*\n\n@${senderId.split('@')[0]} has been removed for tagging all members.`,
                            mentions: [senderId]
                        });
                    } catch {
                        await sock.sendMessage(chatId, {
                            text: `⚠️ Failed to remove user. Make sure the bot is an admin.`
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in tag detection:', error);
    }
}

module.exports = {
    command: 'antitag',
    aliases: ['at', 'tagblock'],
    category: 'admin',
    description: 'Prevent users from tagging all members',
    usage: '.antitag <on|off|set>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const action = args[0]?.toLowerCase();

        if (!action) {
            const config = await getAntitag(chatId, 'on');
            await sock.sendMessage(chatId, {
                text: `*🏷️ ANTITAG SETUP*\n\n` +
                      `*Current Status:* ${config?.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                      `*Current Action:* ${config?.action || 'Not set'}\n\n` +
                      `*Commands:*\n` +
                      `• \`.antitag on\` - Enable\n` +
                      `• \`.antitag off\` - Disable\n` +
                      `• \`.antitag set delete\` - Delete tagall messages\n` +
                      `• \`.antitag set kick\` - Kick users who tagall\n\n` +
                      `*Detection:*\n` +
                      `• Detects mentions of 50%+ members\n` +
                      `• Catches bot tagall patterns\n` +
                      `• Protects against spam tagging`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntitag(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { text: '⚠️ *Antitag is already enabled*', ...channelInfo }, { quoted: message });
                    return;
                }
                const result = await setAntitag(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, {
                    text: result
                        ? '✅ *Antitag enabled successfully!*\n\nDefault action: Delete tagall messages'
                        : '❌ *Failed to enable antitag*',
                    ...channelInfo
                }, { quoted: message });
                break;

            case 'off':
                await removeAntitag(chatId, 'on');
                await sock.sendMessage(chatId, {
                    text: '❌ *Antitag disabled*\n\nUsers can now tag all members.',
                    ...channelInfo
                }, { quoted: message });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, {
                        text: '❌ *Please specify an action*\n\nUsage: `.antitag set delete | kick`',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1].toLowerCase();
                if (!['delete', 'kick'].includes(setAction)) {
                    await sock.sendMessage(chatId, {
                        text: '❌ *Invalid action*\n\nChoose: delete or kick',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                const setResult = await setAntitag(chatId, 'on', setAction);
                const actionDescriptions = {
                    delete: 'Delete tagall messages and warn users',
                    kick: 'Delete messages and remove users from group'
                };
                await sock.sendMessage(chatId, {
                    text: setResult
                        ? `✅ *Antitag action set to: ${setAction}*\n\n${actionDescriptions[setAction]}`
                        : '❌ *Failed to set antitag action*',
                    ...channelInfo
                }, { quoted: message });
                break;

            case 'status':
            case 'get':
                const status = await getAntitag(chatId, 'on');
                await sock.sendMessage(chatId, {
                    text: `*🏷️ ANTITAG STATUS*\n\n` +
                          `*Status:* ${status?.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                          `*Action:* ${status?.action || 'Not set'}\n\n` +
                          `*What happens when tagall is detected:*\n` +
                          `${status?.action === 'delete' ? '• Message is deleted\n• User gets warning\n' : ''}` +
                          `${status?.action === 'kick' ? '• Message is deleted\n• User is removed from group\n' : ''}\n` +
                          `*Detection threshold:* 50% of group members or 10+ mentions`,
                    ...channelInfo
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, {
                    text: '❌ *Invalid command*\n\nUse `.antitag` to see available options.',
                    ...channelInfo
                }, { quoted: message });
        }
    },

    handleTagDetection
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading antitag.js:', e.message); }

/* ===== block-unblock.js ===== */
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
 *  BLOCK / UNBLOCK — JUNAID-MD↣³⁰² v7.0 ULTRA                                 *
 *                                                                           *
 *  Commands:                                                                *
 *   • .block   — block a user (reply / mention / number)                   *
 *   • .unblock — unblock a user (reply / mention / number)                 *
 *                                                                           *
 *****************************************************************************/

'use strict';

/* ── Config ──────────────────────────────────────────────────────────────── */
const BLOCK_CONFIG = {
    processingEmoji: '⏳',
    successEmoji   : '✅',
    errorEmoji     : '❌',
    denyEmoji      : '🚫',

    blockUsage:
        `╔══════════════════════╗\n` +
        `║   🚫 *Block Command* ║\n` +
        `╚══════════════════════╝\n\n` +
        `*Usage:*\n` +
        `• Reply to a message + \`.block\`\n` +
        `• \`.block @mention\`\n` +
        `• \`.block \`\n\n` +
        `_Owner only command_ 👑\n` +
        `_Powered by JUNAID-MD↣³⁰²_ 🔥`,

    unblockUsage:
        `╔════════════════════════╗\n` +
        `║  🔓 *Unblock Command*  ║\n` +
        `╚════════════════════════╝\n\n` +
        `*Usage:*\n` +
        `• Reply to a message + \`.unblock\`\n` +
        `• \`.unblock @mention\`\n` +
        `• \`.unblock \`\n\n` +
        `_Owner only command_ 👑\n` +
        `_Powered by JUNAID-MD↣³⁰²_ 🔥`,
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getOwnerNum(sock) {
    return sock.user?.id?.split(':')[0] || '';
}

function isOwner(sock, senderJid) {
    return senderJid.includes(getOwnerNum(sock));
}

async function resolveTarget(message, args) {
    const ctx = message.message?.extendedTextMessage?.contextInfo;

    // 1) Quoted message sender
    if (ctx?.participant) return ctx.participant;
    if (ctx?.quotedMessage && ctx?.remoteJid) return ctx.remoteJid;

    // 2) Mentioned JID
    if (ctx?.mentionedJid?.length) return ctx.mentionedJid[0];

    // 3) Number in args
    const rawNum = (args[0] || '').replace(/[^0-9]/g, '').trim();
    if (rawNum.length >= 7) return rawNum + '@s.whatsapp.net';

    // 4) Number in message body
    const body = (
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text || ''
    ).replace(/[^0-9]/g, '').trim();
    if (body.length >= 7) return body + '@s.whatsapp.net';

    return null;
}

/* ══════════════════════════════════════════════════════════════════
   COMMAND: .block
══════════════════════════════════════════════════════════════════ */
const blockCommand = {
    command    : 'block',
    aliases    : ['blk'],
    category   : 'owner',
    description: 'Block a WhatsApp user (reply / mention / number)',
    usage      : '.block @user   |   .block ',
    ownerOnly  : true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const sender = context.senderId || message.key.participant || message.key.remoteJid;

        if (!isOwner(sock, sender)) {
            return await sock.sendMessage(chatId, { react: { text: BLOCK_CONFIG.denyEmoji, key: message.key } });
        }

        const target = await resolveTarget(message, args);
        if (!target) {
            return await sock.sendMessage(chatId,
                { text: BLOCK_CONFIG.blockUsage },
                { quoted: message }
            );
        }

        await sock.sendMessage(chatId, { react: { text: BLOCK_CONFIG.processingEmoji, key: message.key } });

        try {
            await sock.updateBlockStatus(target, 'block');
            const num = target.split('@')[0];
            await sock.sendMessage(chatId, {
                text:
                    `✅ *Blocked Successfully!*\n\n` +
                    `📵 *Number:* +${num}\n` +
                    `🚫 _They can no longer message this bot._\n\n` +
                    `_Powered by JUNAID-MD↣³⁰²_ 🔥`
            }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: BLOCK_CONFIG.successEmoji, key: message.key } });

        } catch (e) {
            console.error('[BLOCK ERROR]', e.message);
            await sock.sendMessage(chatId, { react: { text: BLOCK_CONFIG.errorEmoji, key: message.key } });
            await sock.sendMessage(chatId,
                { text: `❌ *Block failed:* \`${e.message}\`` },
                { quoted: message }
            );
        }
    }
};

/* ══════════════════════════════════════════════════════════════════
   COMMAND: .unblock
══════════════════════════════════════════════════════════════════ */
const unblockCommand = {
    command    : 'unblock',
    aliases    : ['unblk'],
    category   : 'owner',
    description: 'Unblock a WhatsApp user (reply / mention / number)',
    usage      : '.unblock @user   |   .unblock ',
    ownerOnly  : true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const sender = context.senderId || message.key.participant || message.key.remoteJid;

        if (!isOwner(sock, sender)) {
            return await sock.sendMessage(chatId, { react: { text: BLOCK_CONFIG.denyEmoji, key: message.key } });
        }

        const target = await resolveTarget(message, args);
        if (!target) {
            return await sock.sendMessage(chatId,
                { text: BLOCK_CONFIG.unblockUsage },
                { quoted: message }
            );
        }

        await sock.sendMessage(chatId, { react: { text: BLOCK_CONFIG.processingEmoji, key: message.key } });

        try {
            await sock.updateBlockStatus(target, 'unblock');
            const num = target.split('@')[0];
            await sock.sendMessage(chatId, {
                text:
                    `✅ *Unblocked Successfully!*\n\n` +
                    `🔓 *Number:* +${num}\n` +
                    `💬 _They can now message this bot again._\n\n` +
                    `_Powered by JUNAID-MD↣³⁰²_ 🔥`
            }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: BLOCK_CONFIG.successEmoji, key: message.key } });

        } catch (e) {
            console.error('[UNBLOCK ERROR]', e.message);
            await sock.sendMessage(chatId, { react: { text: BLOCK_CONFIG.errorEmoji, key: message.key } });
            await sock.sendMessage(chatId,
                { text: `❌ *Unblock failed:* \`${e.message}\`` },
                { quoted: message }
            );
        }
    }
};

/* ── Exports ─────────────────────────────────────────────────────────────── */
module.exports = [blockCommand, unblockCommand];

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading block-unblock.js:', e.message); }

/* ===== warn.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const databaseDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(databaseDir, 'warnings.json');

function initializeWarningsFile() {
  if (!HAS_DB) {
    if (!fs.existsSync(databaseDir)) {
      fs.mkdirSync(databaseDir, { recursive: true });
    }
    
    if (!fs.existsSync(warningsPath)) {
      fs.writeFileSync(warningsPath, JSON.stringify({}), 'utf8');
    }
  }
}

async function getWarnings() {
  if (HAS_DB) {
    const warnings = await store.getSetting('global', 'warnings');
    return warnings || {};
  } else {
    try {
      return JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
    } catch (error) {
      return {};
    }
  }
}

async function saveWarnings(warnings) {
  if (HAS_DB) {
    await store.saveSetting('global', 'warnings', warnings);
  } else {
    fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
  }
}

module.exports = {
  command: 'warn',
  aliases: ['warning'],
  category: 'admin',
  description: 'Warn a user (auto-kick after 3 warnings)',
  usage: '.warn [@user] or reply to message',
  groupOnly: true,
  adminOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, senderId, channelInfo } = context;
    
    try {
      initializeWarningsFile();

      let userToWarn;
      const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      
      if (mentionedJids && mentionedJids.length > 0) {
        userToWarn = mentionedJids[0];
      }
      else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToWarn = message.message.extendedTextMessage.contextInfo.participant;
      }
      
      if (!userToWarn) {
        await sock.sendMessage(chatId, { 
          text: '❌ Error: Please mention the user or reply to their message to warn!',
          ...channelInfo
        }, { quoted: message });
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        let warnings = await getWarnings();
        
        if (!warnings[chatId]) warnings[chatId] = {};
        if (!warnings[chatId][userToWarn]) warnings[chatId][userToWarn] = 0;
        
        warnings[chatId][userToWarn]++;
        await saveWarnings(warnings);

        const warningMessage = `*『 WARNING ALERT 』*\n\n` +
          `👤 *Warned User:* @${userToWarn.split('@')[0]}\n` +
          `⚠️ *Warning Count:* ${warnings[chatId][userToWarn]}/3\n` +
          `👑 *Warned By:* @${senderId.split('@')[0]}\n` +
          `🗄️ *Storage:* ${HAS_DB ? 'Database' : 'File System'}\n\n` +
          `📅 *Date:* ${new Date().toLocaleString()}`;

        await sock.sendMessage(chatId, { 
          text: warningMessage,
          mentions: [userToWarn, senderId],
          ...channelInfo
        });

        if (warnings[chatId][userToWarn] >= 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));

          await sock.groupParticipantsUpdate(chatId, [userToWarn], "remove");
          delete warnings[chatId][userToWarn];
          await saveWarnings(warnings);
          
          const kickMessage = `*『 AUTO-KICK 』*\n\n` +
            `@${userToWarn.split('@')[0]} has been removed from the group after receiving 3 warnings! ⚠️`;

          await sock.sendMessage(chatId, { 
            text: kickMessage,
            mentions: [userToWarn],
            ...channelInfo
          });
        }
      } catch (error) {
        console.error('Error in warn command:', error);
        await sock.sendMessage(chatId, { 
          text: '❌ Failed to warn user!',
          ...channelInfo
        }, { quoted: message });
      }
    } catch (error) {
      console.error('Error in warn command:', error);
      if (error.data === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          await sock.sendMessage(chatId, { 
            text: '❌ Rate limit reached. Please try again in a few seconds.',
            ...channelInfo
          }, { quoted: message });
        } catch (retryError) {
          console.error('Error sending retry message:', retryError);
        }
      } else {
        try {
          await sock.sendMessage(chatId, { 
            text: '❌ Failed to warn user. Make sure the bot is admin and has sufficient permissions.',
            ...channelInfo
          }, { quoted: message });
        } catch (sendError) {
          console.error('Error sending error message:', sendError);
        }
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
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading warn.js:', e.message); }

/* ===== warnings.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const warningsFilePath = path.join(__dirname, '../data/warnings.json');

async function loadWarnings() {
  if (HAS_DB) {
    const warnings = await store.getSetting('global', 'warnings');
    return warnings || {};
  } else {
    if (!fs.existsSync(warningsFilePath)) {
      fs.writeFileSync(warningsFilePath, JSON.stringify({}), 'utf8');
    }
    const data = fs.readFileSync(warningsFilePath, 'utf8');
    return JSON.parse(data);
  }
}

module.exports = {
  command: 'warnings',
  aliases: ['checkwarn', 'warncount'],
  category: 'group',
  description: 'Check warning count of a user',
  usage: '.warnings [@user]',
  groupOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    const mentionedJidList = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    if (mentionedJidList.length === 0) {
      await sock.sendMessage(chatId, { 
        text: 'Please mention a user to check warnings.',
        ...channelInfo
      }, { quoted: message });
      return;
    }

    const userToCheck = mentionedJidList[0];
    const warnings = await loadWarnings();
    const warningCount = (warnings[chatId] && warnings[chatId][userToCheck]) || 0;

    await sock.sendMessage(chatId, { 
      text: `@${userToCheck.split('@')[0]} has ${warningCount} warning(s).\n\nStorage: ${HAS_DB ? 'Database' : 'File System'}`,
      mentions: [userToCheck],
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
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading warnings.js:', e.message); }

/* ===== groupguard.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/groupguard.js — JUNAID-MD↣³⁰² Ultra Group Guardian
'use strict';
const store = require('../lib/store');

const KEY = 'groupguard_v2';
const DEFAULT = {
  enabled: false,
  antiLink: false,      // delete any link, warn
  antiLinkKick: false,  // kick on link
  antiFake: false,      // detect fake/unofficial WA numbers (short JIDs)
  antiDelete: false,    // re-send deleted messages
  maxWarns: 3,          // warns before kick
  antiForward: false,   // block forwarded msgs from outside
  antiVoice: false,     // block voice notes in group
  antiSticker: false,   // block stickers
  muteAll: false,       // bot tracks mute-all (only admin can send)
};

// Per-group user warn counts { chatId: { userId: n } }
const warnMap = new Map();
// Deleted message cache for antiDelete { msgId: { jid, sender, text, ts } }
const deletedCache = new Map();
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [k, v] of deletedCache) if (v.ts < cutoff) deletedCache.delete(k);
}, 5 * 60 * 1000);

async function getConfig(chatId) {
  try { return { ...DEFAULT, ...(await store.getSetting(chatId, KEY)) }; } catch { return { ...DEFAULT }; }
}
async function setConfig(chatId, cfg) { await store.setSetting(chatId, KEY, cfg); }

async function isBotAdmin(sock, chatId) {
  try {
    const meta = await sock.groupMetadata(chatId);
    const botJid = sock.user?.id?.replace(/:.*@/, '@');
    return meta.participants.some(p => (p.id === botJid || p.jid === botJid) && p.admin);
  } catch { return false; }
}

async function isUserAdmin(sock, chatId, userId) {
  try {
    const meta = await sock.groupMetadata(chatId);
    const p = meta.participants.find(x => x.id === userId || x.jid === userId);
    return !!p?.admin;
  } catch { return false; }
}

function addWarn(chatId, userId) {
  if (!warnMap.has(chatId)) warnMap.set(chatId, {});
  const g = warnMap.get(chatId);
  g[userId] = (g[userId] || 0) + 1;
  return g[userId];
}

function clearWarn(chatId, userId) {
  if (warnMap.has(chatId)) delete warnMap.get(chatId)[userId];
}

function getWarns(chatId, userId) {
  return warnMap.get(chatId)?.[userId] || 0;
}

const LINK_REGEX = /(?:https?:\/\/|www\.)|(?:wa\.me|chat\.whatsapp\.com|t\.me|bit\.ly|tinyurl|discord\.gg)/gi;
const FAKE_REGEX = /^\d{5,9}@s\.whatsapp\.net$/; // suspiciously short number

/* ── Main guard — call from messageHandler ────────────────────── */
async function handleGroupGuard(sock, message, chatId, senderId) {
  if (!chatId.endsWith('@g.us')) return;
  const cfg = await getConfig(chatId);
  if (!cfg.enabled) return;

  const isAdmin = await isUserAdmin(sock, chatId, senderId);
  if (isAdmin) return; // admins bypass

  const m        = message.message;
  const msgType  = m && Object.keys(m)[0];
  const text     = m?.conversation || m?.extendedTextMessage?.text || m?.imageMessage?.caption || m?.videoMessage?.caption || '';
  const isForwarded = m?.[msgType]?.contextInfo?.isForwarded;
  const botAdmin = await isBotAdmin(sock, chatId);
  const tag      = `@${senderId.split('@')[0]}`;

  async function strike(reason) {
    const warns = addWarn(chatId, senderId);
    const left  = cfg.maxWarns - warns;
    try { await sock.sendMessage(chatId, { delete: message.key }); } catch {}
    if (warns >= cfg.maxWarns && botAdmin) {
      clearWarn(chatId, senderId);
      await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
      await sock.sendMessage(chatId, { text: `🚫 *${tag} kicked*\nReason: ${reason} (${warns}/${cfg.maxWarns} warns)`, mentions: [senderId] });
    } else {
      await sock.sendMessage(chatId, {
        text: `⚠️ *Warning ${warns}/${cfg.maxWarns}* for ${tag}\nReason: ${reason}\n${left > 0 ? `${left} more warn(s) until kick.` : ''}`,
        mentions: [senderId]
      });
    }
  }

  // Anti-link
  if ((cfg.antiLink || cfg.antiLinkKick) && LINK_REGEX.test(text)) {
    LINK_REGEX.lastIndex = 0;
    if (cfg.antiLinkKick && botAdmin) {
      try { await sock.sendMessage(chatId, { delete: message.key }); } catch {}
      await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
      await sock.sendMessage(chatId, { text: `🔗🚫 ${tag} kicked for sharing links!`, mentions: [senderId] });
    } else await strike('Link sharing not allowed');
    return;
  }

  // Anti-forward
  if (cfg.antiForward && isForwarded) { await strike('Forwarded messages not allowed'); return; }

  // Anti-voice
  if (cfg.antiVoice && (msgType === 'audioMessage' && m.audioMessage?.ptt)) { await strike('Voice notes not allowed'); return; }

  // Anti-sticker
  if (cfg.antiSticker && msgType === 'stickerMessage') { await strike('Stickers not allowed'); return; }

  // Anti-fake (suspicious short JIDs)
  if (cfg.antiFake && FAKE_REGEX.test(senderId)) { await strike('Suspicious/fake account detected'); return; }

  // Cache for anti-delete
  if (cfg.antiDelete && text) {
    deletedCache.set(message.key.id, { jid: chatId, sender: senderId, text, msgType, ts: Date.now(), msg: m });
  }
}

/* ── Anti-delete hook — call when messages.delete event fires ──── */
async function handleDeletedMessage(sock, key) {
  try {
    const cached = deletedCache.get(key.id);
    if (!cached) return;
    const cfg = await getConfig(cached.jid);
    if (!cfg.enabled || !cfg.antiDelete) return;

    const tag = `@${cached.sender.split('@')[0]}`;
    await sock.sendMessage(cached.jid, {
      text: `🗑️ *Deleted Message Recovered*\n👤 ${tag} tried to delete:\n\n_${cached.text}_`,
      mentions: [cached.sender],
    });
    deletedCache.delete(key.id);
  } catch {}
}

module.exports = {
  command: 'groupguard',
  aliases: ['gg', 'guard', 'gguard'],
  category: 'admin',
  adminOnly: true,
  description: 'Ultra group guardian — anti-link, fake accounts, anti-delete, mute-all & more',
  usage: '.gg [on|off|set|warns|status|resetwarn <@user>]',
  handleGroupGuard,
  handleDeletedMessage,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return sock.sendMessage(chatId, { text: '❌ Groups only.' }, { quoted: message });

    const sub = (args[0] || 'status').toLowerCase();
    const cfg = await getConfig(chatId);
    const reply = t => sock.sendMessage(chatId, { text: t }, { quoted: message });

    if (sub === 'on')  { cfg.enabled = true;  await setConfig(chatId, cfg); return reply('🛡️ GroupGuard *ON*'); }
    if (sub === 'off') { cfg.enabled = false; await setConfig(chatId, cfg); return reply('🛡️ GroupGuard *OFF*'); }

    if (sub === 'set') {
      const [, feat, val] = args;
      const v = val === 'on' || val === '1' || val === 'true';
      const numFeat = ['maxwarns', 'maxwarn'];
      const boolFeats = {
        antilink: 'antiLink', antilinkkick: 'antiLinkKick',
        antifake: 'antiFake', antidelete: 'antiDelete',
        antiforward: 'antiForward', antivoice: 'antiVoice',
        antisticker: 'antiSticker', muteall: 'muteAll',
      };
      if (numFeat.includes(feat?.toLowerCase())) {
        cfg.maxWarns = parseInt(val) || 3;
        await setConfig(chatId, cfg);
        return reply(`✅ Max warns: *${cfg.maxWarns}*`);
      }
      const mapped = boolFeats[feat?.toLowerCase()];
      if (mapped) { cfg[mapped] = v; await setConfig(chatId, cfg); return reply(`✅ ${feat}: *${v ? 'ON' : 'OFF'}*`); }
      return reply('Unknown setting. Options: antiLink, antiLinkKick, antiFake, antiDelete, antiForward, antiVoice, antiSticker, muteAll, maxWarns');
    }

    if (sub === 'warns') {
      const g = warnMap.get(chatId) || {};
      const lines = Object.entries(g).map(([u, n]) => `@${u.split('@')[0]}: ${n}/${cfg.maxWarns}`);
      return reply(lines.length ? `📋 *Current Warns:*\n${lines.join('\n')}` : '✅ No active warns.');
    }

    if (sub === 'resetwarn') {
      const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[1];
      if (mentioned) { clearWarn(chatId, mentioned); return reply(`✅ Warns cleared for @${mentioned.split('@')[0]}`); }
      return reply('Reply to/mention user to reset their warns.');
    }

    return reply(
      `╔════════════════════════╗\n` +
      `║  🛡 GROUPGUARD CONFIG   ║\n` +
      `╚════════════════════════╝\n\n` +
      `🔘 Enabled     : ${cfg.enabled ? '✅' : '❌'}\n` +
      `🔗 Anti-link   : ${cfg.antiLink ? '✅' : '❌'} (kick: ${cfg.antiLinkKick ? '✅' : '❌'})\n` +
      `👤 Anti-fake   : ${cfg.antiFake ? '✅' : '❌'}\n` +
      `🗑️ Anti-delete : ${cfg.antiDelete ? '✅' : '❌'}\n` +
      `↩️ Anti-forward: ${cfg.antiForward ? '✅' : '❌'}\n` +
      `🎙️ Anti-voice  : ${cfg.antiVoice ? '✅' : '❌'}\n` +
      `🎭 Anti-sticker: ${cfg.antiSticker ? '✅' : '❌'}\n` +
      `⚠️ Max warns   : ${cfg.maxWarns}\n\n` +
      `Use: \`.gg set <feature> on|off\`\n` +
      `     \`.gg set maxWarns 3\`\n` +
      `     \`.gg warns\`\n` +
      `     \`.gg resetwarn @user\``
    );
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading groupguard.js:', e.message); }

/* ===== pmblocker.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *  pmblocker.js — FIX v7.1                                                  *
 *  DEFAULT: disabled. Commands always work in DMs (public mode).            *
 *  Owner: JUNAID-MD↣³⁰²                                              *
 *****************************************************************************/
'use strict';

const fs   = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const STATE_FILE = path.join(__dirname, '../data/pmblocker.json');

// ── Default state ─────────────────────────────────────────────────────────
// enabled: false → DMs open for everyone (PUBLIC MODE default)
// blockCommands: false → commands always work even if enabled
const DEFAULT_STATE = {
  enabled: false,
  blockCommands: false,           // ← KEY FIX: commands bypass blocker by default
  message: '🚫 Private messages are restricted. Please use groups to contact me.'
};

async function readState() {
  try {
    // Try DB first
    const dbState = await store.getSetting('global', 'pmblocker').catch(() => null);
    if (dbState && typeof dbState === 'object') return { ...DEFAULT_STATE, ...dbState };

    // Fallback to file
    if (fs.existsSync(STATE_FILE)) {
      const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      return { ...DEFAULT_STATE, ...raw };
    }
  } catch {}
  return { ...DEFAULT_STATE };
}

async function writeState(state) {
  try {
    await store.saveSetting('global', 'pmblocker', state).catch(() => {});
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {}
}

// ── Plugin command ─────────────────────────────────────────────────────────
module.exports = {
  command: 'pmblocker',
  aliases: ['pmblock', 'blockpm', 'antipm', 'dmblocker'],
  description: 'Block/allow private messages from strangers',
  category: 'owner',
  ownerOnly: true,

  readState,
  writeState,

  async handler(sock, message, args, context) {
    const { chatId } = context;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const sub = (args[0] || '').toLowerCase();

    const state = await readState();

    if (sub === 'on') {
      state.enabled = true;
      await writeState(state);
      return reply(
        `✅ *PM Blocker ENABLED*\n\n` +
        `🔒 Strangers cannot DM the bot.\n` +
        `⚠️ Note: Bot commands in DMs still work (use *.pmblocker blockall* to block commands too).`
      );
    }

    if (sub === 'off') {
      state.enabled = false;
      await writeState(state);
      return reply('✅ *PM Blocker DISABLED*\nAnyone can DM the bot now.');
    }

    if (sub === 'blockall') {
      state.enabled = true;
      state.blockCommands = true;
      await writeState(state);
      return reply('🔒 *Full DM Block enabled* — even commands are blocked in DMs for non-sudo users.');
    }

    if (sub === 'commandsonly') {
      state.enabled = true;
      state.blockCommands = false;
      await writeState(state);
      return reply('✅ *PM Blocker: Commands allowed* — DM text blocked but bot commands work.');
    }

    if (sub === 'status') {
      return reply(
        `*PM Blocker Status*\n\n` +
        `🔒 Enabled: ${state.enabled ? 'Yes' : 'No'}\n` +
        `⚡ Block commands too: ${state.blockCommands ? 'Yes' : 'No'}\n` +
        `💬 Message: ${state.message}`
      );
    }

    if (sub === 'setmsg') {
      const msg = args.slice(1).join(' ');
      if (!msg) return reply('Usage: .pmblocker setmsg <your message>');
      state.message = msg;
      await writeState(state);
      return reply(`✅ PM blocker message updated.`);
    }

    return reply(
      `*PM Blocker Commands*\n\n` +
      `*.pmblocker on* — Enable (commands still work in DM)\n` +
      `*.pmblocker off* — Disable (default)\n` +
      `*.pmblocker blockall* — Block everything in DMs\n` +
      `*.pmblocker commandsonly* — Allow commands, block text\n` +
      `*.pmblocker status* — Show current status\n` +
      `*.pmblocker setmsg <text>* — Set custom block message`
    );
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-07-security] Error loading pmblocker.js:', e.message); }

module.exports = _bundle;