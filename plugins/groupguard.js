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
