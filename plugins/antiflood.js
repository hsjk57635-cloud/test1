// plugins/antiflood.js — JUNAID-MD↣³⁰² Ultra Anti-Flood v2
'use strict';
// ✅ FIX: was require('../lib/store') — that store has NO getSetting/saveSetting,
// so every config read/save threw and .antiflood could never be enabled.
const store = require('../lib/lightweight_store');

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

// Config cache (10s TTL) — avoids a file/DB read on EVERY group message
const cfgCache = new Map();
const CFG_TTL = 10000;

/** Normalize any JID form to a bare number (device suffix + @domain stripped) */
function norm(jid) {
  if (!jid) return '';
  return String(jid).split('@')[0].split(':')[0];
}

async function getConfig(chatId) {
  try {
    const c = cfgCache.get(chatId);
    if (c && Date.now() - c.ts < CFG_TTL) return c.cfg;
    const cfg = (await store.getSetting(chatId, KEY)) || { ...DEFAULT };
    cfgCache.set(chatId, { cfg, ts: Date.now() });
    return cfg;
  } catch { return { ...DEFAULT }; }
}
async function setConfig(chatId, cfg) {
  cfgCache.set(chatId, { cfg, ts: Date.now() });
  await store.saveSetting(chatId, KEY, cfg);
}

async function isBotAdmin(sock, chatId, meta) {
  try {
    const m = meta || await sock.groupMetadata(chatId);
    const botIdNorm = norm(sock.user?.id);
    const botLidNorm = norm(sock.user?.lid);
    return m.participants.some(p => {
      if (p.admin !== 'admin' && p.admin !== 'superadmin') return false;
      const pIdNorm = norm(p.id);
      const pLidNorm = norm(p.lid);
      const pPnNorm = norm(p.phoneNumber);
      return (botIdNorm && (botIdNorm === pIdNorm || botIdNorm === pLidNorm || (pPnNorm && botIdNorm === pPnNorm)))
          || (botLidNorm && (botLidNorm === pIdNorm || botLidNorm === pLidNorm));
    });
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
async function checkFlood(sock, message, chatId, senderId, meta) {
  if (!chatId.endsWith('@g.us')) return;
  const cfg = await getConfig(chatId);
  if (!cfg.enabled) return;

  const senderNorm = norm(senderId);

  // Skip admins (uses cached group metadata when available)
  try {
    const m = meta || await sock.groupMetadata(chatId);
    const p = m.participants.find(x => norm(x.id) === senderNorm || norm(x.lid) === senderNorm);
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
  const canAct = await isBotAdmin(sock, chatId, meta);

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

    // ✅ Guard: group admin + bot admin required (isBotAdmin/isSenderAdmin are
    // computed by the message handler)
    if (context.isBotAdmin === false)
      return sock.sendMessage(chatId, { text: '❌ *Please make the bot an admin first.*' }, { quoted: message });
    if (!context.isSenderAdmin && !context.senderIsOwnerOrSudo)
      return sock.sendMessage(chatId, { text: '❌ *Group admins only.*' }, { quoted: message });

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
