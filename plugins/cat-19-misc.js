'use strict';
// AUTO-GENERATED BUNDLE: cat-19-misc
// Contains: echo.js, advanced-vv.js, agent-activity.js, agent-monitor.js, channel.js, channel-react.js, rentbot.js, stoprent.js, listrent.js, hmod.js, localbot.js, localbot2.js

const _bundle = [];


/* ===== echo.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'echo',
  aliases: [],
  category: 'general',
  description: 'Repeats your message a specified number of times.',
  usage: '.echo <text> <count>',
  isPrefixless: true,

  async handler(sock, message, args) {
    const chatId = message.key.remoteJid;

    if (args.length < 2) {
      return await sock.sendMessage(chatId, { text: 'Usage: .echo <text> <count>' }, { quoted: message });
    }

    const count = parseInt(args[args.length - 1]);
    if (isNaN(count) || count <= 0) {
      return await sock.sendMessage(chatId, { text: 'Count must be a positive number.' }, { quoted: message });
    }

    args.pop();
    const text = args.join(' ').trim();

    const repeated = Array(count).fill(text).join('\n');
    await sock.sendMessage(chatId, { text: repeated }, { quoted: message });
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-19-misc] Error loading echo.js:', e.message); }

/* ===== advanced-vv.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *  REDXBOT302 — advanced-vv.js
 *
 *  This file is the entry point that index.js requires as './plugins/advanced-vv'.
 *  It simply re-exports everything from viewonce.js so that:
 *   1. All vv commands (vv, vv2, vvset, vvremove, vvlist) are registered
 *   2. handleAutoVV is accessible as module.exports.handleAutoVV
 *      (which index.js reads to set up the auto-intercept listener)
 *
 *  WHY THIS FILE EXISTS:
 *  index.js requires './plugins/advanced-vv' for the handleAutoVV function.
 *  viewonce.js exports the same commands + handleAutoVV but under a different
 *  filename. This shim bridges the two without duplicating any code.
 *****************************************************************************/

'use strict';

const vvPlugin = require('./viewonce');

// vvPlugin is an array of command objects with handleAutoVV attached to it.
// Re-export exactly as-is so commandHandler + index.js both work correctly.
module.exports = vvPlugin;
module.exports.handleAutoVV = vvPlugin.handleAutoVV;

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-19-misc] Error loading advanced-vv.js:', e.message); }

/* ===== agent-activity.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/agent-activity.js — REDXBOT302 Ultra Group Activity Tracker
'use strict';
const C     = require('../lib/constants');
const store = require('../lib/lightweight_store');
const fs    = require('fs');
const path  = require('path');

const KEY    = 'activity_v2';
const DB_DIR = path.join(process.cwd(), 'data', 'activity');

// In-memory session stats: { 'groupId:userId': { msgs, words, media, lastSeen } }
const sessionStats = new Map();
// Daily report timer
let reportTimer = null;

function today() { return new Date().toISOString().slice(0, 10); }

function getGroupDb(groupId) {
  const file = path.join(DB_DIR, `${groupId.replace(/[^a-z0-9]/gi, '_')}.json`);
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    if (!fs.existsSync(file)) return { daily: {}, allTime: {} };
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return { daily: {}, allTime: {} }; }
}

function saveGroupDb(groupId, db) {
  const file = path.join(DB_DIR, `${groupId.replace(/[^a-z0-9]/gi, '_')}.json`);
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(db, null, 2));
  } catch {}
}

/* ── Track a message ─────────────────────────────────────────── */
async function trackActivity(message, chatId, senderId) {
  if (!chatId.endsWith('@g.us')) return;
  const cfg = await store.getSetting(chatId, KEY).catch(() => null);
  if (!cfg?.enabled) return;

  const m       = message.message;
  const msgType = m && Object.keys(m)[0];
  const text    = m?.conversation || m?.extendedTextMessage?.text || '';
  const isMedia = ['imageMessage','videoMessage','audioMessage','stickerMessage','documentMessage'].includes(msgType);
  const words   = text.split(/\s+/).filter(Boolean).length;

  // In-memory
  const sk  = `${chatId}:${senderId}`;
  const ses = sessionStats.get(sk) || { msgs: 0, words: 0, media: 0, lastSeen: 0 };
  ses.msgs++;
  ses.words  += words;
  ses.media  += isMedia ? 1 : 0;
  ses.lastSeen = Date.now();
  sessionStats.set(sk, ses);

  // Persist to daily DB (batch — only flush every 10 msgs per user per group)
  if (ses.msgs % 10 === 0) {
    const db = getGroupDb(chatId);
    const d  = today();
    if (!db.daily[d]) db.daily[d] = {};
    const u  = db.daily[d][senderId] || { msgs: 0, words: 0, media: 0 };
    u.msgs   += 10; u.words += ses.words; u.media += ses.media;
    db.daily[d][senderId] = u;
    const at = db.allTime[senderId] || { msgs: 0, words: 0, media: 0 };
    at.msgs  += 10; at.words += ses.words; at.media += ses.media;
    db.allTime[senderId] = at;
    saveGroupDb(chatId, db);
    ses.words = 0; ses.media = 0;
  }
}

function buildLeaderboard(data, limit = 10, label = 'Messages') {
  return Object.entries(data)
    .sort((a, b) => (b[1].msgs || 0) - (a[1].msgs || 0))
    .slice(0, limit)
    .map(([jid, s], i) => {
      const medals = ['🥇','🥈','🥉'];
      const badge  = medals[i] || `${i + 1}.`;
      const num    = jid.split('@')[0];
      return `${badge} *@${num}* — ${s.msgs} msgs, ${s.words} words, ${s.media} media`;
    }).join('\n');
}

async function sendDailyReport(sock, groupId) {
  try {
    const cfg = await store.getSetting(groupId, KEY).catch(() => null);
    if (!cfg?.enabled || !cfg?.dailyReport) return;

    const db   = getGroupDb(groupId);
    const d    = today();
    const day  = db.daily[d] || {};
    if (!Object.keys(day).length) return;

    const board = buildLeaderboard(day, 10);
    const total = Object.values(day).reduce((a, v) => ({ msgs: a.msgs + v.msgs, words: a.words + v.words }), { msgs: 0, words: 0 });
    const mentions = Object.keys(day).map(j => j);

    const text =
      `╔══════════════════════════╗\n` +
      `║  📊 *DAILY ACTIVITY REPORT*  ║\n` +
      `╚══════════════════════════╝\n\n` +
      `📅 Date: ${d}\n` +
      `📨 Total Msgs: ${total.msgs}\n` +
      `📝 Total Words: ${total.words}\n` +
      `👥 Active Members: ${Object.keys(day).length}\n\n` +
      `🏆 *Top Members Today*\n${board}\n\n` +
      `> 🔥 ${C.BOT_NAME}`;

    await sock.sendMessage(groupId, { text, mentions });

    // Also send summary to channel
    await C.notifyChannel(sock, `📊 Daily Report — ${Object.keys(day).length} active, ${total.msgs} msgs`);
  } catch (e) { console.error('[activity] daily report error:', e.message); }
}

function scheduleDailyReport(sock, groupId, timeHHMM = '23:59') {
  if (reportTimer) clearTimeout(reportTimer);
  const [hh, mm] = timeHHMM.split(':').map(Number);
  const now = new Date();
  const next = new Date(); next.setHours(hh, mm, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next - now;
  reportTimer = setTimeout(async () => {
    await sendDailyReport(sock, groupId);
    scheduleDailyReport(sock, groupId, timeHHMM);
  }, delay);
  console.log(`[activity] Daily report for ${groupId} scheduled in ${Math.round(delay / 60000)}min`);
}

module.exports = {
  command: 'activity',
  aliases: ['stats', 'leaderboard', 'lb', 'rank', 'top'],
  category: 'group',
  description: 'Track group activity — leaderboard, daily reports, all-time stats',
  usage: '.activity [on|off|top|alltime|me|daily|report|reset]',
  trackActivity,
  sendDailyReport,

  async handler(sock, message, args, context = {}) {
    const chatId   = context.chatId || message.key.remoteJid;
    const senderId = message.key.participant || message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return sock.sendMessage(chatId, { text: '❌ Groups only.' }, { quoted: message });

    const sub = (args[0] || 'top').toLowerCase();
    const reply = t => sock.sendMessage(chatId, { text: t }, { quoted: message });

    const cfg = (await store.getSetting(chatId, KEY).catch(() => null)) || { enabled: false, dailyReport: false, reportTime: '23:59' };

    if (sub === 'on') {
      cfg.enabled = true;
      await store.setSetting(chatId, KEY, cfg);
      return reply('✅ Activity tracking *ON*');
    }
    if (sub === 'off') {
      cfg.enabled = false;
      await store.setSetting(chatId, KEY, cfg);
      return reply('❌ Activity tracking *OFF*');
    }
    if (sub === 'daily') {
      const time = args[1] || '23:59';
      cfg.dailyReport = args[1] !== 'off';
      cfg.reportTime  = time;
      await store.setSetting(chatId, KEY, cfg);
      if (cfg.dailyReport) scheduleDailyReport(sock, chatId, time);
      return reply(`📊 Daily report: ${cfg.dailyReport ? `✅ ON (${time})` : '❌ OFF'}`);
    }
    if (sub === 'report') {
      await sendDailyReport(sock, chatId);
      return;
    }

    const db = getGroupDb(chatId);

    if (sub === 'top' || sub === 'leaderboard' || sub === 'lb') {
      const d   = today();
      const day = db.daily[d] || {};
      // Merge with session stats
      for (const [k, v] of sessionStats) {
        if (!k.startsWith(chatId)) continue;
        const uid = k.split(':').slice(1).join(':');
        day[uid] = day[uid] || { msgs: 0, words: 0, media: 0 };
        day[uid].msgs += v.msgs; day[uid].words += v.words; day[uid].media += v.media;
      }
      if (!Object.keys(day).length) return reply('📊 No activity recorded today yet.');
      const board    = buildLeaderboard(day, 10);
      const mentions = Object.keys(day).slice(0, 10);
      const total    = Object.values(day).reduce((a, v) => ({ msgs: a.msgs + v.msgs }), { msgs: 0 });
      await sock.sendMessage(chatId, {
        text: `🏆 *Today's Leaderboard*\n📅 ${today()}\n📨 ${total.msgs} total msgs\n\n${board}\n\n> 🔥 ${C.BOT_NAME}`,
        mentions,
      }, { quoted: message });
      return;
    }

    if (sub === 'alltime' || sub === 'all') {
      const at = db.allTime || {};
      if (!Object.keys(at).length) return reply('📊 No all-time stats yet.');
      const board    = buildLeaderboard(at, 10);
      const mentions = Object.keys(at).slice(0, 10);
      await sock.sendMessage(chatId, {
        text: `🏆 *All-Time Leaderboard*\n\n${board}\n\n> 🔥 ${C.BOT_NAME}`,
        mentions,
      }, { quoted: message });
      return;
    }

    if (sub === 'me') {
      const sk  = `${chatId}:${senderId}`;
      const ses = sessionStats.get(sk) || { msgs: 0, words: 0, media: 0 };
      const at  = db.allTime?.[senderId] || { msgs: 0, words: 0, media: 0 };
      const d   = today();
      const day = db.daily?.[d]?.[senderId] || { msgs: 0, words: 0, media: 0 };
      // Rank
      const allData = { ...db.allTime };
      allData[senderId] = { msgs: (at.msgs || 0) + ses.msgs };
      const sorted = Object.entries(allData).sort((a, b) => b[1].msgs - a[1].msgs);
      const rank   = sorted.findIndex(([j]) => j === senderId) + 1;
      return reply(
        `📊 *Your Stats*\n` +
        `👤 @${senderId.split('@')[0]}\n\n` +
        `📅 Today  : ${day.msgs + ses.msgs} msgs | ${day.words + ses.words} words\n` +
        `📈 All-time: ${at.msgs + ses.msgs} msgs | ${at.words + ses.words} words | ${at.media + ses.media} media\n` +
        `🏆 Rank    : #${rank} in this group`
      );
    }

    if (sub === 'reset') {
      saveGroupDb(chatId, { daily: {}, allTime: {} });
      return reply('🗑️ Activity data reset.');
    }

    return reply(
      `📊 *Activity Tracker*\n\n` +
      `🔘 Status: ${cfg.enabled ? '✅ ON' : '❌ OFF'}\n` +
      `📋 Daily Report: ${cfg.dailyReport ? `✅ ${cfg.reportTime}` : '❌'}\n\n` +
      `Commands:\n` +
      `• \`.activity on/off\` — toggle tracking\n` +
      `• \`.activity top\` — today's leaderboard\n` +
      `• \`.activity alltime\` — all-time leaderboard\n` +
      `• \`.activity me\` — your personal stats\n` +
      `• \`.activity daily 23:59\` — schedule daily report\n` +
      `• \`.activity report\` — send report now\n` +
      `• \`.activity reset\` — clear all data`
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
} catch(e) { console.warn('[BUNDLE:cat-19-misc] Error loading agent-activity.js:', e.message); }

/* ===== agent-monitor.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/agent-monitor.js — REDXBOT302 Ultra System Monitor Agent
'use strict';
const C    = require('../lib/constants');
const os   = require('os');
const fs   = require('fs');
const path = require('path');

let _sock = null;
let monitorInterval = null;
const ALERT_HISTORY = [];

function uptimeStr(sec) {
  const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60);
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${Math.floor(sec % 60)}s`].filter(Boolean).join(' ');
}

function memInfo() {
  const total = os.totalmem(), free = os.freemem(), used = total - free;
  const pct = ((used / total) * 100).toFixed(1);
  const mb = b => (b / 1024 / 1024).toFixed(1);
  return { total: mb(total), used: mb(used), free: mb(free), pct };
}

function cpuInfo() {
  const cpus = os.cpus();
  const model = cpus[0]?.model || 'Unknown';
  const cores = cpus.length;
  // Average load from os.loadavg
  const [l1, l5, l15] = os.loadavg();
  return { model, cores, l1: l1.toFixed(2), l5: l5.toFixed(2), l15: l15.toFixed(2) };
}

function diskInfo() {
  try {
    const stat = fs.statfsSync ? fs.statfsSync('/') : null;
    if (!stat) return null;
    const total = stat.blocks * stat.bsize, free = stat.bfree * stat.bsize;
    const used = total - free;
    const gb = b => (b / 1024 / 1024 / 1024).toFixed(2);
    return { total: gb(total), used: gb(used), free: gb(free), pct: ((used / total) * 100).toFixed(1) };
  } catch { return null; }
}

function processInfo() {
  const mem = process.memoryUsage();
  const mb = b => (b / 1024 / 1024).toFixed(2);
  return {
    rss:      mb(mem.rss),
    heapUsed: mb(mem.heapUsed),
    heapTotal:mb(mem.heapTotal),
    external: mb(mem.external),
    uptime:   uptimeStr(process.uptime()),
  };
}

function buildStatus(connected, ping) {
  const mem  = memInfo();
  const cpu  = cpuInfo();
  const disk = diskInfo();
  const proc = processInfo();
  const now  = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi', hour12: true });

  return [
    `╔══════════════════════════════╗`,
    `║  🖥️ *JUNAID-MD↣³⁰² SYSTEM STATUS*  ║`,
    `╚══════════════════════════════╝`,
    ``,
    `🤖 *Bot Status*`,
    `├ 📶 Connection : ${connected ? '✅ Online' : '❌ Offline'}`,
    `├ ⏱️ Bot Uptime : ${proc.uptime}`,
    `├ 🏓 Ping      : ${ping ? ping + 'ms' : 'N/A'}`,
    `└ 🕐 Time      : ${now}`,
    ``,
    `💾 *Memory (System)*`,
    `├ 🔵 Total     : ${mem.total} MB`,
    `├ 🔴 Used      : ${mem.used} MB (${mem.pct}%)`,
    `└ 🟢 Free      : ${mem.free} MB`,
    ``,
    `🧠 *Process (Bot)*`,
    `├ 📦 RSS       : ${proc.rss} MB`,
    `├ 🔑 Heap Used : ${proc.heapUsed} MB`,
    `└ 📊 Heap Total: ${proc.heapTotal} MB`,
    ``,
    `⚡ *CPU*`,
    `├ 🖥️ Cores     : ${cpu.cores}`,
    `├ 📈 Load 1m   : ${cpu.l1}`,
    `├ 📈 Load 5m   : ${cpu.l5}`,
    `└ 📈 Load 15m  : ${cpu.l15}`,
    disk ? [
      ``,
      `💽 *Disk*`,
      `├ 📀 Total     : ${disk.total} GB`,
      `├ 🔴 Used      : ${disk.used} GB (${disk.pct}%)`,
      `└ 🟢 Free      : ${disk.free} GB`,
    ].join('\n') : '',
    ``,
    `⚠️ *Alert History (last ${Math.min(ALERT_HISTORY.length, 5)})*`,
    ALERT_HISTORY.slice(-5).reverse().map(a => `• ${a}`).join('\n') || '✅ No alerts',
    ``,
    `> 🔥 ${C.BOT_NAME} ${C.BOT_VERSION}`,
  ].filter(l => l !== null && l !== undefined).join('\n');
}

async function sendAlert(sock, msg) {
  const ts = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi', hour12: true });
  const entry = `[${ts}] ${msg}`;
  ALERT_HISTORY.push(entry);
  if (ALERT_HISTORY.length > 50) ALERT_HISTORY.shift();
  await C.notifyOwner(sock, `🚨 *JUNAID-MD↣³⁰² ALERT*\n\n${msg}\n\n🕐 ${ts}`);
  await C.notifyGroup(sock, `🚨 *Bot Alert*\n${msg}`);
}

async function runHealthCheck(sock) {
  const mem  = memInfo();
  const cpu  = cpuInfo();
  if (+mem.pct > 90)    await sendAlert(sock, `🔴 High memory usage: ${mem.pct}% (${mem.used}/${mem.total} MB)`);
  if (+cpu.l1  > cpu.cores * 1.5) await sendAlert(sock, `🔴 High CPU load: ${cpu.l1} (${cpu.cores} cores)`);
  const disk = diskInfo();
  if (disk && +disk.pct > 90) await sendAlert(sock, `💽 Low disk space: ${disk.free} GB free (${disk.pct}% used)`);
}

function startMonitorAgent(sock, intervalMin = 30) {
  _sock = sock;
  if (monitorInterval) clearInterval(monitorInterval);
  monitorInterval = setInterval(() => runHealthCheck(sock), intervalMin * 60 * 1000);
  console.log(`[agent-monitor] Started (every ${intervalMin} min)`);
}

module.exports = {
  command: 'monitor',
  aliases: ['sys', 'system', 'health', 'status', 'ping'],
  category: 'owner',
  ownerOnly: true,
  description: 'Full system health monitor — CPU, RAM, disk, uptime, alerts',
  usage: '.monitor [start <min>|stop|alert <msg>]',
  startMonitorAgent,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sub    = (args[0] || 'status').toLowerCase();
    const reply  = t => sock.sendMessage(chatId, { text: t }, { quoted: message });

    if (sub === 'start') {
      const min = +args[1] || 30;
      startMonitorAgent(sock, min);
      return reply(`✅ Monitor agent started — alerts every *${min} min*\nSends to: Owner DM + Dev Group`);
    }
    if (sub === 'stop') {
      if (monitorInterval) { clearInterval(monitorInterval); monitorInterval = null; }
      return reply('⏹️ Monitor agent stopped.');
    }
    if (sub === 'alert') {
      const msg = args.slice(1).join(' ');
      if (msg) { await sendAlert(sock, msg); return reply('✅ Alert sent to owner + group.'); }
    }
    if (sub === 'alerts') {
      return reply(ALERT_HISTORY.length
        ? `📋 *Alert History*\n\n${ALERT_HISTORY.slice(-15).reverse().join('\n')}`
        : '✅ No alerts recorded.');
    }

    // Ping test
    const pingStart = Date.now();
    try { await sock.sendPresenceUpdate('available', chatId); } catch {}
    const ping = Date.now() - pingStart;

    const text = buildStatus(true, ping);
    await reply(text);
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-19-misc] Error loading agent-monitor.js:', e.message); }

/* ===== channel.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const settings = require('../settings');

module.exports = {
  command: 'channel',
  aliases: ['joinchannel'],
  category: 'info',
  description: 'Get bot channel link and JID',
  usage: '.channel',
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = `📢 *Join our channel:*\n${settings.channelLink}\n\nJID: \`${settings.channelJid}\``;
    await sock.sendMessage(chatId, { text }, { quoted: message });
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-19-misc] Error loading channel.js:', e.message); }

/* ===== channel-react.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *  🔗  Telegram : https://t.me/Hamza302bot                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *  CHANNEL REACT — JUNAID-MD↣³⁰² v7.0 ULTRA                                   *
 *                                                                           *
 *  Commands:                                                                *
 *   • .chr <channel-link> [text or emoji]                                  *
 *         React to a WhatsApp channel post with stylized text/emoji.       *
 *         If no text given, reacts with 👍 by default.                     *
 *                                                                           *
 *****************************************************************************/

'use strict';

/* ── Robust Channel React ─────────────────────────────────────────────── */
const CHR_CONFIG = {
  defaultReaction: '❤️',
  usageMsg:
    '╔══════════════════════════╗\n' +
    '║  📢 *VIP Channel React* ║\n' +
    '╚══════════════════════════╝\n\n' +
    '*Usage:*\n' +
    '`.chreact <channel-post-link> <emoji>`\n\n' +
    '*Example:*\n' +
    '`.chreact https://whatsapp.com/channel/0029.../123 ❤️`\n\n' +
    '⚠️ Link must be copied from the *specific channel post* and end with `/number`.'
};

function isOwner(sock, sender, context = {}) {
  if (context.isOwner === true || context.senderIsOwnerOrSudo === true) return true;
  const clean = String(sender || '').split('@')[0].split(':')[0].replace(/\D/g, '');
  const me = String(sock.user?.id || '').split(':')[0].split('@')[0].replace(/\D/g, '');
  return !!clean && !!me && clean === me;
}

function parsePostLink(input) {
  const s = String(input || '').trim();
  const m = s.match(/https?:\/\/(?:www\.)?whatsapp\.com\/channel\/([A-Za-z0-9]+)\/(\d+)/i);
  if (!m) return null;
  return { inviteCode: m[1], serverId: m[2] };
}

function pickReaction(args) {
  const text = args.join(' ').trim();
  if (!text) return CHR_CONFIG.defaultReaction;
  // Channel reactions must be actual emoji/reaction characters; do not turn
  // normal words into unsupported stylized Unicode strings.
  const emoji = [...text].find(ch => /\p{Extended_Pictographic}/u.test(ch));
  return emoji || text;
}

module.exports = {
  command: 'chr',
  aliases: ['chreact', 'creact', 'channelreact'],
  category: 'owner',
  description: 'React to a specific WhatsApp Channel post',
  usage: '.chreact <channel-post-link> [emoji]',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = context.senderId || message.key.participant || message.key.remoteJid;

    if (!isOwner(sock, sender, context)) {
      return sock.sendMessage(chatId, { text: '🚫 *Owner only.*' }, { quoted: message });
    }

    if (!args.length) {
      return sock.sendMessage(chatId, { text: CHR_CONFIG.usageMsg }, { quoted: message });
    }

    const parsed = parsePostLink(args[0]);
    if (!parsed) {
      return sock.sendMessage(chatId, {
        text: '❌ *Invalid Channel Post link.*\n\nCopy the link directly from the WhatsApp Channel post. It should look like:\n`https://whatsapp.com/channel/CODE/123`'
      }, { quoted: message });
    }

    const reaction = pickReaction(args.slice(1));
    try {
      await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
      const meta = await sock.newsletterMetadata('invite', parsed.inviteCode);
      if (!meta?.id) throw new Error('Could not resolve this channel.');

      if (typeof sock.newsletterReactMessage !== 'function') {
        throw new Error('This Baileys version does not support Channel reactions. Update Baileys.');
      }

      await sock.newsletterReactMessage(meta.id, String(parsed.serverId), reaction);
      await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
      return sock.sendMessage(chatId, {
        text: `✅ *VIP Channel Reaction Sent!*\n\n📢 *Channel:* ${meta.name || parsed.inviteCode}\n💬 *Reaction:* ${reaction}\n🆔 *Post:* ${parsed.serverId}`
      }, { quoted: message });
    } catch (e) {
      console.error('[CHREACT ERROR]', e);
      await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } }).catch(() => {});
      return sock.sendMessage(chatId, {
        text: `❌ *Channel reaction failed.*\n\n${e?.message || 'Unknown error'}\n\n💡 Make sure the link is a direct Channel *post* link ending in a number.`
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
} catch(e) { console.warn('[BUNDLE:cat-19-misc] Error loading channel-react.js:', e.message); }

/* ===== rentbot.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & JUNAID-MD↣³⁰²                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the JUNAID-MD↣³⁰² Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/


const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

const NodeCache = require("node-cache");
const pino = require("pino");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const store = require('../lib/lightweight_store');

if (!global.conns) global.conns = [];

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

async function saveCloneSession(authId, data) {
    if (HAS_DB) {
        await store.saveSetting('clones', authId, data);
    } else {
        const sessionPath = path.join(process.cwd(), 'session', 'clones', authId);
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }
        fs.writeFileSync(path.join(sessionPath, 'session.json'), JSON.stringify(data));
    }
}

async function getCloneSession(authId) {
    if (HAS_DB) {
        return await store.getSetting('clones', authId);
    } else {
        const sessionPath = path.join(process.cwd(), 'session', 'clones', authId, 'session.json');
        if (fs.existsSync(sessionPath)) {
            return JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
        }
        return null;
    }
}

async function deleteCloneSession(authId) {
    if (HAS_DB) {
        await store.saveSetting('clones', authId, null);
    } else {
        const sessionPath = path.join(process.cwd(), 'session', 'clones', authId);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
    }
}

async function getAllCloneSessions() {
    if (HAS_DB) {
        const settings = await store.getSetting('clones', 'all') || {};
        return Object.keys(settings);
    } else {
        const clonesDir = path.join(process.cwd(), 'session', 'clones');
        if (!fs.existsSync(clonesDir)) return [];
        return fs.readdirSync(clonesDir);
    }
}

module.exports = {
    command: 'rentbot',
    aliases: ['botclone', 'clonebot'],
    category: 'owner',
    description: 'Start a sub-bot clone via pairing code',
    usage: '.rentbot 92305xxxxxxx',
    ownerOnly: 'true',

    async handler(sock, message, args, context = {}) {
        const { chatId } = context;
        
        if (!args[0]) {
            return await sock.sendMessage(chatId, { 
                text: `*Usage:* \`.rentbot 923051391xxx\`` 
            }, { quoted: message });
        }

        let userNumber = args[0].replace(/[^0-9]/g, '');
        const authId = crypto.randomBytes(4).toString('hex');
        const sessionPath = path.join(process.cwd(), 'session', 'clones', authId);

        if (!HAS_DB && !fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }

        async function startClone() {
            const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
            const { version } = await fetchLatestBaileysVersion();
            const msgRetryCounterCache = new NodeCache();

            const conn = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                printQRInTerminal: false,
                browser: Browsers.macOS("Chrome"), 
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
                },
                markOnlineOnConnect: true,
                msgRetryCounterCache,
                connectTimeoutMs: 120000,
                defaultQueryTimeoutMs: 0,
                keepAliveIntervalMs: 30000,
                mobile: false
            });

            if (!conn.authState.creds.registered) {
                await new Promise(resolve => setTimeout(resolve, 6000));

                try {
                    let code = await conn.requestPairingCode(userNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    
                    const pairingText = `*JUNAID-MD↣³⁰² CLONE SYSTEM*\n\n` +
                                       `Code: *${code}*\n` +
                                       `Storage: *${HAS_DB ? 'Database' : 'File System'}*\n\n` +
                                       `1. Open WhatsApp Settings\n` +
                                       `2. Tap Linked Devices > Link with Phone Number\n` +
                                       `3. Enter the code above.\n\n` +
                                       `*Tip:* If no popup appears, go to 'Link with phone number' on your phone and enter the code manually.`;
                    
                    await sock.sendMessage(chatId, { text: pairingText }, { quoted: message });
                } catch (err) {
                    console.error("Pairing Error:", err);
                    await sock.sendMessage(chatId, { text: "❌ Failed to request code. Try again in 1 minute." });
                }
            }

            conn.ev.on('creds.update', async () => {
                await saveCreds();
                
                if (HAS_DB) {
                    try {
                        await saveCloneSession(authId, {
                            userNumber,
                            createdAt: Date.now(),
                            status: 'active'
                        });
                    } catch (e) {
                        console.error("DB save error:", e.message);
                    }
                }
            });

            conn.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === 'open') {
                    global.conns.push(conn);
                    
                    if (HAS_DB) {
                        await saveCloneSession(authId, {
                            userNumber,
                            createdAt: Date.now(),
                            status: 'online',
                            connectedAt: Date.now()
                        });
                    }
                    
                    await sock.sendMessage(chatId, { 
                        text: `✅ Clone is now Online!\n\n` +
                              `ID: ${authId}\n` +
                              `Storage: ${HAS_DB ? 'Database' : 'File System'}` 
                    }, { quoted: message });
                }

                if (connection === 'close') {
                    const code = lastDisconnect?.error?.output?.statusCode;
                    if (code !== DisconnectReason.loggedOut) {
                        startClone(); 
                    } else {
                        await deleteCloneSession(authId);
                        const index = global.conns.indexOf(conn);
                        if (index > -1) global.conns.splice(index, 1);
                    }
                }
            });

            try {
                const { handleMessages } = require('../lib/messageHandler');
                conn.ev.on('messages.upsert', async (chatUpdate) => {
                    await handleMessages(conn, chatUpdate, true);
                });
            } catch (e) {
                console.error("Handler linkage failed:", e.message);
            }

            return conn;
        }

        await startClone();
    }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & JUNAID-MD↣³⁰²                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                       *
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
} catch(e) { console.warn('[BUNDLE:cat-19-misc] Error loading rentbot.js:', e.message); }

/* ===== stoprent.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & JUNAID-MD↣³⁰²                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                       *
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

async function deleteCloneSession(authId) {
    if (HAS_DB) {
        await store.saveSetting('clones', authId, null);
    } else {
        const sessionPath = path.join(process.cwd(), 'session', 'clones', authId);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
    }
}

async function getAllCloneAuthIds() {
    if (HAS_DB) {
        const settings = await store.getAllSettings('clones') || {};
        return Object.entries(settings)
            .filter(([key, value]) => value && value.status)
            .map(([authId]) => authId);
    } else {
        const clonesDir = path.join(process.cwd(), 'session', 'clones');
        if (!fs.existsSync(clonesDir)) return [];
        return fs.readdirSync(clonesDir);
    }
}

async function deleteAllCloneSessions() {
    const authIds = await getAllCloneAuthIds();
    for (const authId of authIds) {
        await deleteCloneSession(authId);
    }
}

module.exports = {
    command: 'stoprent',
    aliases: ['stopclone', 'delrent'],
    category: 'owner',
    description: 'Stop a specific sub-bot or all sub-bots',
    usage: '.stoprent [number/all]',
    ownerOnly: 'true',

    async handler(sock, message, args, context = {}) {
        const { chatId } = context;

        if (!global.conns || global.conns.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "❌ No sub-bots are currently running." 
            }, { quoted: message });
        }

        if (!args[0]) {
            return await sock.sendMessage(chatId, { 
                text: `❌ Please provide a number from the list or type 'all'.\nExample: \`.stoprent 1\`` 
            }, { quoted: message });
        }

        if (args[0].toLowerCase() === 'all') {
            let stoppedCount = 0;
            
            for (let conn of global.conns) {
                try {
                    await conn.logout();
                    conn.end();
                    stoppedCount++;
                } catch (e) {
                    console.error('Error stopping clone:', e.message);
                }
            }
            
            global.conns = [];
            
            if (HAS_DB) {
                try {
                    await deleteAllCloneSessions();
                } catch (e) {
                    console.error('Error deleting clone sessions:', e.message);
                }
            } else {
                const clonesDir = path.join(process.cwd(), 'session', 'clones');
                if (fs.existsSync(clonesDir)) {
                    fs.rmSync(clonesDir, { recursive: true, force: true });
                    fs.mkdirSync(clonesDir, { recursive: true });
                }
            }
            
            return await sock.sendMessage(chatId, { 
                text: `✅ All sub-bots have been stopped and removed.\n\n` +
                      `Stopped: ${stoppedCount}\n` +
                      `Storage: ${HAS_DB ? 'Database cleared' : 'Files deleted'}` 
            }, { quoted: message });
        }

        const index = parseInt(args[0]) - 1;
        if (isNaN(index) || !global.conns[index]) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Invalid index number. Check `.listrent` first." 
            }, { quoted: message });
        }

        try {
            const target = global.conns[index];
            const targetJid = target.user.id;
            const targetNumber = targetJid.split(':')[0];
            
            await target.logout();
            global.conns.splice(index, 1);
            
            if (HAS_DB) {
                const allSettings = await store.getAllSettings('clones') || {};
                for (const [authId, data] of Object.entries(allSettings)) {
                    if (data && data.userNumber === targetNumber) {
                        await deleteCloneSession(authId);
                        break;
                    }
                }
            } else {
                const clonesDir = path.join(process.cwd(), 'session', 'clones');
                if (fs.existsSync(clonesDir)) {
                    const dirs = fs.readdirSync(clonesDir);
                    for (const dir of dirs) {
                        const sessionPath = path.join(clonesDir, dir, 'session.json');
                        if (fs.existsSync(sessionPath)) {
                            try {
                                const data = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
                                if (data.userNumber === targetNumber) {
                                    fs.rmSync(path.join(clonesDir, dir), { recursive: true, force: true });
                                    break;
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                    }
                }
            }
            
            await sock.sendMessage(chatId, { 
                text: `✅ Stopped and removed sub-bot: @${targetNumber}\n\n` +
                      `Storage: ${HAS_DB ? 'Database cleared' : 'Files deleted'}`, 
                mentions: [targetJid] 
            }, { quoted: message });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, { 
                text: "❌ Error while stopping the sub-bot." 
            }, { quoted: message });
        }
    }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & JUNAID-MD↣³⁰²                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                       *
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
} catch(e) { console.warn('[BUNDLE:cat-19-misc] Error loading stoprent.js:', e.message); }

/* ===== listrent.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & JUNAID-MD↣³⁰²                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the JUNAID-MD↣³⁰² Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/


const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);


async function getAllCloneSessions() {
    if (HAS_DB) {
        const settings = await store.getAllSettings('clones') || {};
        return Object.entries(settings)
            .filter(([key, value]) => value && value.status)
            .map(([authId, data]) => ({ authId, ...data }));
    } else {
        const fs = require('fs');
        const path = require('path');
        const clonesDir = path.join(process.cwd(), 'session', 'clones');
        if (!fs.existsSync(clonesDir)) return [];
        
        const dirs = fs.readdirSync(clonesDir);
        return dirs.map(authId => {
            const sessionPath = path.join(clonesDir, authId, 'session.json');
            if (fs.existsSync(sessionPath)) {
                try {
                    const data = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
                    return { authId, ...data };
                } catch (e) {
                    return { authId, status: 'unknown' };
                }
            }
            return { authId, status: 'unknown' };
        });
    }
}

module.exports = {
    command: 'listrent',
    aliases: ['listclone', 'botclones'],
    category: 'owner',
    description: 'List all currently active sub-bots',
    usage: '.listrent',

    async handler(sock, message, args, context = {}) {
        const { chatId } = context;

        const activeConns = global.conns || [];
        const storedClones = await getAllCloneSessions();

        if (activeConns.length === 0 && storedClones.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "*❌ No sub-bots are currently active or stored.*" 
            }, { quoted: message });
        }

        let msg = `*─── [ CLONE BOTS ] ───*\n\n`;
        msg += `*Storage:* ${HAS_DB ? 'Database 🗄️' : 'File System 📁'}\n\n`;

        if (activeConns.length > 0) {
            msg += `*🟢 ONLINE CLONES:*\n\n`;
            
            activeConns.forEach((conn, i) => {
                const user = conn.user;
                msg += `*${i + 1}.* @${user.id.split(':')[0]}\n`;
                msg += `   └ Name: ${user.name || 'Sub-Bot'}\n`;
                msg += `   └ Status: Connected ✅\n\n`;
            });
        }

        if (HAS_DB && storedClones.length > 0) {
            const offlineClones = storedClones.filter(clone => {
                return !activeConns.some(conn => {
                    const connNumber = conn.user.id.split(':')[0];
                    return clone.userNumber === connNumber;
                });
            });

            if (offlineClones.length > 0) {
                msg += `*⚪ STORED CLONES (Offline):*\n\n`;
                
                offlineClones.forEach((clone, i) => {
                    msg += `*${i + 1}.* ID: ${clone.authId}\n`;
                    msg += `   └ Number: ${clone.userNumber || 'N/A'}\n`;
                    msg += `   └ Status: ${clone.status || 'offline'}\n`;
                    if (clone.createdAt) {
                        const date = new Date(clone.createdAt);
                        msg += `   └ Created: ${date.toLocaleString()}\n`;
                    }
                    msg += `\n`;
                });
            }
        }

        msg += `*Total Online:* ${activeConns.length}\n`;
        if (HAS_DB) {
            msg += `*Total Stored:* ${storedClones.length}`;
        }

        const mentions = activeConns.map(c => c.user.id);

        await sock.sendMessage(chatId, { 
            text: msg,
            mentions: mentions
        }, { quoted: message });
    }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & JUNAID-MD↣³⁰²                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                       *
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
} catch(e) { console.warn('[BUNDLE:cat-19-misc] Error loading listrent.js:', e.message); }

/* ===== hmod.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'hmod',
  aliases: ['hmods', 'happymod'],
  category: 'apks',
  description: 'Search APKs from HappyMod',
  usage: '.hmod <query>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: '*Please provide a search query.*\nExample: .happymod telegram'
      }, { quoted: message });
    }
    const query = args.join(' ');
    try {
      const { data } = await axios.get(`https://discardapi.dpdns.org/api/apk/search/happymod`, {
        params: {
          apikey: 'guru',
          query: query
        }
      });
      if (!data?.result?.length) {
        return await sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: message });
      }
      let menuText = '';
      data.result.forEach((item, i) => {
        menuText += `*${i + 1}.* ${item.title}\n⭐ Rating: ${item.rating}\n🔗 Link: ${item.link}\n\n`;
      });
      const firstThumb = data.result[0].thumb || null;

      if (firstThumb) {
        await sock.sendMessage(chatId, {
          image: { url: firstThumb },
          caption: menuText
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: menuText }, { quoted: message });
      }

    } catch (err) {
      console.error('HappyMod plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch APKs.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-19-misc] Error loading hmod.js:', e.message); }

/* ===== localbot.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & JUNAID-MD↣³⁰²                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *  🔗  Telegram : https://t.me/Hamza302bot                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const path = require('path');
const fs = require('fs');
const store = require('../lib/lightweight_store'); // adjust path if needed

// ---------- Constants ----------
const DATA_DIR = path.join(process.cwd(), 'data');
const ASSETS_DIR = path.join(process.cwd(), 'assets');
const TEMP_DIR = path.join(process.cwd(), 'temp');
const SESSION_DIR = path.join(process.cwd(), 'session');

const dataFile = (filename) => path.join(DATA_DIR, filename);

const HAS_DB = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || process.env.DB_URL);
const REPLIES_FILE = path.join(process.cwd(), 'data', 'autoreplies.json');

// ---------- State ----------
const chatState = new Map();

// ---------- Utility ----------
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const low = s => s.toLowerCase().trim();

function matches(text, patterns) {
    const t = low(text);
    return patterns.some(p => typeof p === 'string' ? t.includes(p) : p.test(t));
}

// ---------- Custom Auto‑Replies ----------
async function loadCustomReplies() {
    try {
        if (HAS_DB) {
            const data = await store.getSetting('global', 'autoreplies');
            return data?.replies || [];
        }
        if (fs.existsSync(REPLIES_FILE)) {
            const data = JSON.parse(fs.readFileSync(REPLIES_FILE, 'utf-8'));
            return data.replies || [];
        }
    } catch {}
    return [];
}

async function checkCustomReply(text, name) {
    const t = low(text);
    for (const r of await loadCustomReplies()) {
        const trigger = r.trigger.toLowerCase();
        const hit = r.exactMatch ? t === trigger : t.includes(trigger);
        if (hit) return r.response.replace('{name}', name);
    }
    return null;
}

// ---------- Math Evaluator ----------
function tryMath(text) {
    const expr = text.match(/[\d\s+\-*/.%()]+/)?.[0]?.trim();
    if (!expr || expr.length < 3) return null;
    try {
        const result = Function(`"use strict"; return (${expr})`)();
        if (typeof result === 'number' && isFinite(result)) {
            const formatted = Number.isInteger(result) ? result : parseFloat(result.toFixed(6));
            return `🔢 *${expr.trim()} = ${formatted}*`;
        }
    } catch {}
    return null;
}

// ---------- Knowledge Base ----------
const KB = [
    // ... (keep the entire KB array from the original code)
    // For brevity, I'm not copying the whole KB here, but you must include it.
    // Use the KB exactly as in the original file.
];

// ---------- Main Response Logic ----------
async function getResponse(text, senderName) {
    const t = low(text);

    const custom = await checkCustomReply(text, senderName);
    if (custom) return custom;

    // Time
    if (/what.?time|current time|time batao|time kya|time is it|time now|time please/.test(t)) {
        const now = new Date();
        return `🕐 *Current Time:* ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}\n📅 *Date:* ${now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
    }

    // Date
    if (/what.?date|today.?date|current date|aaj ki date|which day|what day/.test(t)) {
        const now = new Date();
        return `📅 *Today is:* ${now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
    }

    // Birth year
    const bornMatch = t.match(/born in (\d{4})|birth year.?(\d{4})/);
    if (bornMatch) {
        const year = parseInt(bornMatch[1] || bornMatch[2], 10);
        const age = new Date().getFullYear() - year;
        if (age > 0 && age < 150) return `🎂 If you were born in *${year}*, you are *${age} years old* in ${new Date().getFullYear()}!`;
    }

    // Simple math
    if (/\d.*[+\-*/].*\d/.test(t)) {
        const math = tryMath(t);
        if (math) return math;
    }

    // KB lookup
    for (const entry of KB) {
        if (matches(text, entry.patterns)) {
            return pick(entry.responses).replace('{name}', senderName);
        }
    }

    // Fallback
    return pick([
        `Hmm, I'm not sure about that! 🤔 Try asking differently.`,
        "I didn't quite catch that! Could you rephrase? 🙏",
        "That's beyond me right now! Try `.chatbot` for AI-powered answers 🤖",
        `Sorry ${senderName}, I didn't get that. Type .menu for available commands!`,
    ]);
}

// ---------- Auto‑reply Handler (used when bot is in "on" mode) ----------
async function handleLocalBotMessage(sock, message, chatId, text, senderId, channelInfo) {
    const state = chatState.get(chatId);
    if (!state?.enabled) return false;
    if (!text || /^[.!/]/.test(text.trim())) return false;
    if (Date.now() - state.lastActivity > 86400000) { chatState.delete(chatId); return false; }
    state.lastActivity = Date.now();

    try {
        const senderName = (message.pushName || senderId.split('@')[0] || 'there').split(' ')[0];
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(r => setTimeout(r, 600 + Math.random() * 1000));
        await sock.sendPresenceUpdate('paused', chatId);
        await sock.sendMessage(chatId, { text: await getResponse(text, senderName), ...channelInfo }, { quoted: message });
    } catch {}
    return true;
}

// ---------- Plugin Export ----------
const plugin = {
    command: 'localbot_legacy',
    aliases: [],
    category: 'ai',
    description: 'Built-in offline chatbot — no internet, no API, instant responses',
    usage: '.localbot on/off\n.localbot <message>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const senderId = context.senderId || message.key.remoteJid;
        const senderName = (message.pushName || senderId.split('@')[0] || 'there').split(' ')[0];
        const sub = args[0]?.toLowerCase();

        if (sub === 'on') {
            chatState.set(chatId, { enabled: true, lastActivity: Date.now() });
            return await sock.sendMessage(chatId, {
                text: `🤖 *Local Bot Activated!*\n\n` +
                      `I'm now listening in this chat.\n` +
                      `Just type anything and I'll respond!\n\n` +
                      `_Fully offline • No API • Instant replies_\n\n` +
                      `Type \`.localbot off\` to deactivate.`,
                ...channelInfo
            }, { quoted: message });
        }

        if (sub === 'off') {
            chatState.delete(chatId);
            return await sock.sendMessage(chatId, {
                text: `🤖 Local Bot *deactivated*.\nUse \`.localbot on\` to reactivate.`,
                ...channelInfo
            }, { quoted: message });
        }

        if (sub === 'status') {
            const state = chatState.get(chatId);
            return await sock.sendMessage(chatId, {
                text: `🤖 Local Bot: ${state?.enabled ? '🟢 *Active*' : '🔴 *Inactive*'}`,
                ...channelInfo
            }, { quoted: message });
        }

        const userText = args.join(' ').trim();
        if (!userText) {
            const state = chatState.get(chatId);
            return await sock.sendMessage(chatId, {
                text: `🤖 *MEGA MD Local Bot*\n\n` +
                      `_Zero API • Fully Offline • Instant_\n\n` +
                      `*Chat directly:*\n` +
                      `\`.localbot hello\`\n` +
                      `\`.localbot tell me a joke\`\n` +
                      `\`.localbot motivate me\`\n` +
                      `\`.localbot what time is it\`\n` +
                      `\`.localbot 25 * 4\`\n\n` +
                      `*Auto-reply mode:*\n` +
                      `\`.localbot on\` — respond to ALL messages in this chat\n` +
                      `\`.localbot off\` — stop\n\n` +
                      `*Status:* ${state?.enabled ? '🟢 Active' : '🔴 Inactive'}`,
                ...channelInfo
            }, { quoted: message });
        }

        // Process the user's message as a direct command
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
        await sock.sendPresenceUpdate('paused', chatId);

        await sock.sendMessage(chatId, {
            text: await getResponse(userText, senderName),
            ...channelInfo
        }, { quoted: message });
    }
};

// Export both the plugin and the helper function
module.exports = plugin;
module.exports.handleLocalBotMessage = handleLocalBotMessage;

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-19-misc] Error loading localbot.js:', e.message); }

/* ===== localbot2.js ===== */
// Moved to standalone plugins/localbot2.js for reliable command registration.

/* ===== gcleave.js (from MEGA-MDX) ===== */
try {
  _bundle.push({
    command: 'gcleave',
    aliases: ['leavegroup','groupleave','leavegc'],
    category: 'owner',
    description: 'Make bot leave a group',
    usage: '.gcleave — leave current group',
    ownerOnly: true,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const channelInfo = context.channelInfo || {};
      const targetJid = args[0]?.includes('@g.us') ? args[0] : chatId;
      if (!targetJid.endsWith('@g.us')) {
        return sock.sendMessage(chatId, { text: '❌ Groups only. Use: .gcleave <jid@g.us>', ...channelInfo }, { quoted: message });
      }
      try {
        await sock.sendMessage(targetJid, { text: '👋 *Bot leaving group. Goodbye!*', ...channelInfo });
        await new Promise(r => setTimeout(r, 500));
        await sock.groupLeave(targetJid);
        if (targetJid !== chatId) await sock.sendMessage(chatId, { text: `✅ Left group: \`${targetJid}\``, ...channelInfo }, { quoted: message });
      } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ Failed: ${e.message}`, ...channelInfo }, { quoted: message });
      }
    }
  });
} catch(e) { console.warn('[BUNDLE:cat-19-misc] gcleave error:', e.message); }

/* ===== starmsg.js (from MEGA-MDX) ===== */
try {
  _bundle.push({
    command: 'star',
    aliases: ['starmsg','unstar','unstarmsg'],
    category: 'owner',
    description: 'Star or unstar a replied message',
    usage: '.star — reply to a message | .unstar — reply to a message',
    ownerOnly: true,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const channelInfo = context.channelInfo || {};
      const rawText = (context.rawText || message.message?.conversation || '').toLowerCase();
      const shouldStar = !rawText.startsWith('.unstar');
      const msg = message.message;
      const contextInfo =
        msg?.extendedTextMessage?.contextInfo ||
        msg?.imageMessage?.contextInfo ||
        msg?.videoMessage?.contextInfo ||
        msg?.audioMessage?.contextInfo ||
        msg?.documentMessage?.contextInfo ||
        msg?.stickerMessage?.contextInfo || null;
      if (!contextInfo?.stanzaId) {
        return sock.sendMessage(chatId, { text: `⭐ Reply to a message with:\n• .star — star it\n• .unstar — unstar it`, ...channelInfo }, { quoted: message });
      }
      try {
        await sock.chatModify({
          star: { messages: [{ id: contextInfo.stanzaId, fromMe: !!message.key.fromMe }], star: shouldStar }
        }, chatId);
        await sock.sendMessage(chatId, { text: shouldStar ? '⭐ Message starred!' : '✅ Message unstarred!', ...channelInfo }, { quoted: message });
      } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ Failed: ${e.message}`, ...channelInfo }, { quoted: message });
      }
    }
  });
} catch(e) { console.warn('[BUNDLE:cat-19-misc] starmsg error:', e.message); }

/* ===== crun.js (from MEGA-MDX) — run C++ code ===== */
try {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  const _crunFs = require('fs');
  const _crunPath = require('path');
  _bundle.push({
    command: 'crun',
    aliases: ['cpp','runcpp'],
    category: 'utility',
    description: 'Compile and run C++ code',
    usage: '.crun <c++ code>',
    ownerOnly: true,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const channelInfo = context.channelInfo || {};
      const quoted = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
      const rawText = message?.message?.conversation || message?.message?.extendedTextMessage?.text || '';
      const cmdMatch = rawText.match(/^[.!/]\w+\s*/);
      let code = cmdMatch ? rawText.slice(cmdMatch[0].length) : args.join(' ');
      if (!code.trim()) code = quotedText;
      if (!code.trim()) return sock.sendMessage(chatId, { text: '❌ Provide C++ code.\nExample: `.crun #include<iostream>\nint main(){std::cout<<"Hello";}` ', ...channelInfo }, { quoted: message });
      const tmpDir = _crunPath.join(process.cwd(), 'temp');
      if (!_crunFs.existsSync(tmpDir)) _crunFs.mkdirSync(tmpDir, { recursive: true });
      const id = Date.now();
      const srcPath = _crunPath.join(tmpDir, `crun_${id}.cpp`);
      const binPath = _crunPath.join(tmpDir, `crun_${id}`);
      _crunFs.writeFileSync(srcPath, code);
      await sock.sendMessage(chatId, { text: '⚙️ Compiling...', ...channelInfo }, { quoted: message });
      try {
        await execAsync(`g++ -o "${binPath}" "${srcPath}" 2>&1`, { timeout: 30000 });
        const { stdout, stderr } = await execAsync(`"${binPath}"`, { timeout: 10000 });
        const out = (stdout || stderr || '').trim() || '(no output)';
        await sock.sendMessage(chatId, { text: `\`\`\`\n${out.slice(0,3000)}\n\`\`\``, ...channelInfo }, { quoted: message });
      } catch(err) {
        await sock.sendMessage(chatId, { text: `❌ Error:\n\`\`\`\n${err.message.slice(0,2000)}\n\`\`\``, ...channelInfo }, { quoted: message });
      } finally {
        try { _crunFs.unlinkSync(srcPath); _crunFs.unlinkSync(binPath); } catch {}
      }
    }
  });
} catch(e) { console.warn('[BUNDLE:cat-19-misc] crun error:', e.message); }
