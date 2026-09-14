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
const MUTES_KEY   = 'abw_mutes';

async function getSettings(chatId) {
  const s = await store.getSetting(chatId, SETTING_KEY);
  return s || {
    enabled: false,
    action: 'warn',      // warn | kick | mute | delete
    warnLimit: 3,        // kicks after N warns
    whitelist: [],       // JIDs exempt from filter
    extraWords: [],      // admin-added custom words
    removedWords: [],    // words removed from default list
    muteMinutes: 15,     // ✅ NEW: how long "mute" action silences a user
    exemptAdmins: true,  // ✅ NEW: group admins are skipped by default
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

// ✅ NEW: real per-user mute state (timed), since WhatsApp has no native
// per-participant mute — this is enforced by deleting every message the
// muted user sends until their mute expires.
async function getMutes(chatId) {
  const m = await store.getSetting(chatId, MUTES_KEY);
  return m || {};
}
async function saveMutes(chatId, mutes) {
  await store.saveSetting(chatId, MUTES_KEY, mutes);
}
async function muteUser(chatId, jid, minutes) {
  const mutes = await getMutes(chatId);
  mutes[jid] = Date.now() + minutes * 60 * 1000;
  await saveMutes(chatId, mutes);
}
/** Call this on EVERY group message (not just ones with a bad word) to
 * enforce active mutes. Returns true if the message was deleted. */
async function checkMuted(sock, message) {
  const chatId = message.key.remoteJid;
  if (!chatId?.endsWith('@g.us')) return false;
  const senderId = message.key.participant || message.key.remoteJid;
  const mutes = await getMutes(chatId);
  const until = mutes[senderId];
  if (!until) return false;
  if (Date.now() > until) { delete mutes[senderId]; await saveMutes(chatId, mutes); return false; }
  try { await sock.sendMessage(chatId, { delete: message.key }); } catch {}
  return true;
}

async function isGroupAdmin(sock, chatId, jid) {
  try {
    const meta = await sock.groupMetadata(chatId);
    const p = meta.participants?.find(x => x.id === jid);
    return !!(p && (p.admin === 'admin' || p.admin === 'superadmin'));
  } catch { return false; }
}
async function botIsAdmin(sock, chatId) {
  try {
    const meta = await sock.groupMetadata(chatId);
    const me = meta.participants?.find(x => x.id === sock.user?.id?.split(':')[0] + '@s.whatsapp.net' || x.id === sock.user?.id);
    return !!(me && (me.admin === 'admin' || me.admin === 'superadmin'));
  } catch { return false; }
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
  // ✅ FIX: these were written as `\\s` (double backslash) inside a regex
  // literal, which matches a literal backslash + "s" instead of whitespace
  // — so whitespace runs never actually collapsed. Single backslash is the
  // real whitespace shorthand.
  return text.toLowerCase()
    .split('').map(c => LEET[c] || c).join('')
    .replace(/(.)\1{2,}/g, '$1$1')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
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

  // ✅ NEW: skip group admins by default — a strict filter that catches
  // admins too usually isn't what group owners want, and it also avoids
  // the bot trying (and failing) to kick someone it can't remove.
  if (settings.exemptAdmins !== false && await isGroupAdmin(sock, chatId, senderId)) return false;

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
    // ✅ FIX: kick/warn-limit-kick were fired blind — if the bot isn't a
    // group admin, groupParticipantsUpdate silently fails (caught and
    // swallowed) while the bot still announced "removed". Check first and
    // say so honestly instead of lying about the outcome.
    const canKick = (action === 'kick' || (action === 'warn')) ? await botIsAdmin(sock, chatId) : true;

    if (action === 'delete') {
      await sock.sendMessage(chatId, {
        text: `🚫 Message deleted — contains banned word.\n> JUNAID-MD↣³⁰²`,
        mentions: [senderId],
      });
      return true;
    }

    if (action === 'kick') {
      if (!canKick) {
        await sock.sendMessage(chatId, { text: `🚫 Message deleted — banned word from ${mention}.\n⚠️ I need to be a group admin to remove members.`, mentions: [senderId] });
        return true;
      }
      await sock.groupParticipantsUpdate(chatId, [senderId], 'remove').catch(() => {});
      await sock.sendMessage(chatId, {
        text: `⛔ ${mention} was removed — banned word detected.\n> JUNAID-MD↣³⁰²`,
        mentions: [senderId],
      });
      return true;
    }

    if (action === 'mute') {
      const minutes = settings.muteMinutes || 15;
      await muteUser(chatId, senderId, minutes);
      await sock.sendMessage(chatId, {
        text: `🔇 ${mention} muted for ${minutes} min — banned word detected.\nAny message they send will be auto-deleted until then.\n> JUNAID-MD↣³⁰²`,
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
      if (!canKick) {
        await sock.sendMessage(chatId, { text: `⚠️ ${mention} hit the ${limit}-warning limit, but I'm not a group admin so I can't remove them.\n> JUNAID-MD↣³⁰²`, mentions: [senderId] });
        return true;
      }
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

    if (action === 'mute') {
      const minutes = parseInt(args[1]);
      if (!isNaN(minutes) && minutes > 0) {
        settings.muteMinutes = minutes;
        await saveSettings(chatId, settings);
        return reply(`✅ Mute duration set to *${minutes} min*.`);
      }
      settings.action = 'mute';
      await saveSettings(chatId, settings);
      return reply(`✅ Action set to *mute* (${settings.muteMinutes || 15} min). Use \`.abw mute <minutes>\` to change duration.`);
    }

    return reply(
      `❌ Unknown action.\n\n` +
      `Use \`.abw status\` for help.`
    );
  },

  checkAntiBadword,
};

module.exports.checkAntiBadword = checkAntiBadword;
module.exports.checkMuted = checkMuted;
