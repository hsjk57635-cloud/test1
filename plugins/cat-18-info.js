'use strict';
// AUTO-GENERATED BUNDLE: cat-18-info
// Contains: alive.js, uptime.js, sysinfo.js, sysmonitor.js, stats.js, rank.js, siminfo.js, ping.js, speedtest.js, listcmd.js, searchcmd.js, guide.js, menu.js, smartmenu.js, list.js

const _bundle = [];


/* ===== alive.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const os = require('os');
const process = require('process');

module.exports = {
  command: 'alive',
  aliases: ['status', 'bot'],
  category: 'info',
  description: 'Check if bot is alive',
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    const cpu = os.loadavg()[0].toFixed(2);

    const text = `🤖 *JUNAID-MD↣³⁰² is alive!*\n\n` +
      `⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n` +
      `💾 *RAM:* ${ram} MB\n` +
      `🖥️ *CPU Load:* ${cpu}\n\n` +
      `✨ *Powered by JUNAID-MD↣³⁰²* ✨\n` +
      `🔗 Join Channel: https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f`;

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
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading alive.js:', e.message); }

/* ===== uptime.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                                *
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


module.exports = {
  command: 'uptime',
  aliases: ['runtime'],
  category: 'general',
  description: 'Show bot status information',
  usage: '.uptime',
  isPrefixless: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const uptimeMs = process.uptime() * 1000;

      const formatUptime = (ms) => {
        const sec = Math.floor(ms / 1000) % 60;
        const min = Math.floor(ms / (1000 * 60)) % 60;
        const hr  = Math.floor(ms / (1000 * 60 * 60)) % 24;
        const day = Math.floor(ms / (1000 * 60 * 60 * 24));

        let parts = [];
        if (day) parts.push(`${day}d`);
        if (hr) parts.push(`${hr}h`);
        if (min) parts.push(`${min}m`);
        parts.push(`${sec}s`);

        return parts.join(' ');
      };

      const startedAt = new Date(Date.now() - uptimeMs).toLocaleString();
      const ramMb = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

      // ✅ FIX: commandHandler was required lazily and its .commands.size call
      // could throw if the module hadn't finished loading, silently killing
      // the whole reply with no error shown to the user. Now it's optional.
      let commandCount = 'N/A';
      try {
        const commandHandler = require('../lib/commandHandler');
        commandCount = commandHandler.commands.size;
      } catch {}

      const text =
        `🤖 *JUNAID-MD↣³⁰² STATUS*\n\n` +
        `⏱ Uptime: ${formatUptime(uptimeMs)}\n` +
        `🚀 Started: ${startedAt}\n` +
        `📦 Plugins: ${commandCount}\n` +
        `💾 RAM: ${ramMb} MB`;

      await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch (e) {
      console.error('[UPTIME] error:', e.message);
      await sock.sendMessage(chatId, { text: `❌ Failed to get uptime: ${e.message}` }, { quoted: message }).catch(() => {});
    }
  }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                                *
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
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading uptime.js:', e.message); }

/* ===== sysinfo.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const os = require('os');
module.exports = [{
  pattern: "sysinfo",
  alias: ["system", "stats"],
  desc: "Show system information",
  category: "utility",
  react: "💻",
  filename: __filename,
  use: ".sysinfo",
  execute: async (conn, mek, m, { from, reply }) => {
    const uptime = process.uptime();
    const days = Math.floor(uptime / (24 * 3600));
    const hours = Math.floor((uptime % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const memory = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    const info = `
💻 *System Information*
⏱️ *Uptime:* ${uptimeStr}
🖥️ *Platform:* ${os.platform()} (${os.arch()})
🧠 *CPU:* ${os.cpus()[0].model}
📊 *Memory Usage:*
  RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB
  Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB
  Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB
  External: ${(memory.external / 1024 / 1024).toFixed(2)} MB
💾 *Total RAM:* ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB
💾 *Free RAM:* ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB
📦 *Node.js:* ${process.version}
⚡ *Commands Loaded:* ${global.commands ? global.commands.size : 'N/A'}
    `;

    await reply(info);
  }
}];

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading sysinfo.js:', e.message); }

/* ===== sysmonitor.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    'use strict';
/*****************************************************************************
 *  sysmonitor.js — ULTRA SYSTEM MONITOR — JUNAID-MD↣³⁰²                        *
 *  🆕 NEW PLUGIN v1.0                                                        *
 *  ✅ Real-time CPU, RAM, Disk, Network, Processes                           *
 *  ✅ Temperature (if available)                                             *
 *  ✅ Process list (top 5 by memory)                                         *
 *****************************************************************************/

'use strict';
const os     = require('os');
const fs     = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const config = require('../config');

const BOT_NAME = process.env.BOT_NAME || config.BOT_NAME || 'JUNAID-MD↣³⁰²';

function formatBytes(b) {
  if (!b) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(2)} ${s[i]}`;
}

function bar(pct, len = 10) {
  const f = Math.round(pct / (100 / len));
  return '█'.repeat(Math.max(0, f)) + '░'.repeat(Math.max(0, len - f)) + ` ${pct.toFixed(1)}%`;
}

function getStatusEmoji(pct) {
  if (pct < 50)  return '🟢';
  if (pct < 75)  return '🟡';
  if (pct < 90)  return '🟠';
  return '🔴';
}

async function getCPULoad() {
  try {
    const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}'", { timeout: 5000 });
    const load = parseFloat(stdout.trim());
    return isNaN(load) ? null : load;
  } catch {
    // Fallback: calculate from os.cpus()
    const cpus = os.cpus();
    let idle = 0, total = 0;
    for (const c of cpus) { for (const [k,v] of Object.entries(c.times)) { total += v; if (k === 'idle') idle += v; } }
    return parseFloat(((1 - idle/total) * 100).toFixed(1));
  }
}

async function getTopProcesses() {
  try {
    const { stdout } = await execAsync("ps aux --sort=-%mem | awk 'NR<=6{print $1,$2,$3,$4,$11}' | tail -5", { timeout: 5000 });
    return stdout.trim().split('\n').filter(Boolean).map(line => {
      const [user, pid, cpu, mem, cmd] = line.trim().split(/\s+/);
      return `  • \`${(cmd || 'unknown').substring(0, 18).padEnd(18)}\` CPU:${cpu}% MEM:${mem}%`;
    });
  } catch { return ['  Unable to fetch processes']; }
}

async function getDisk() {
  try {
    const { stdout } = await execAsync("df -h / | tail -1 | awk '{print $2,$3,$4,$5}'", { timeout: 5000 });
    const [total, used, avail, pct] = stdout.trim().split(/\s+/);
    return { total, used, avail, pct: parseFloat(pct) };
  } catch {
    try {
      const stat = fs.statfsSync('/');
      const total = stat.bsize * stat.blocks;
      const free  = stat.bsize * stat.bfree;
      const used2 = total - free;
      return { total: formatBytes(total), used: formatBytes(used2), avail: formatBytes(free), pct: (used2/total*100) };
    } catch { return null; }
  }
}

async function getNetworkStats() {
  try {
    const ifaces = os.networkInterfaces();
    const active = Object.entries(ifaces)
      .filter(([, addrs]) => addrs?.some(a => !a.internal && a.family === 'IPv4'))
      .map(([name, addrs]) => ({ name, ip: addrs.find(a => a.family === 'IPv4')?.address }))
      .slice(0, 3);
    return active;
  } catch { return []; }
}

module.exports = {
  command: 'sysmon',
  aliases: ['sysmonitor', 'monitor', 'serverstats', 'serverinfo'],
  category: 'owner',
  description: '🖥️ Ultra system monitor — CPU, RAM, Disk, Network, Processes',
  usage: '.sysmon [cpu|ram|disk|network|processes|full]',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId      = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const sub         = args[0]?.toLowerCase() || 'full';

    const reply = (text) =>
      sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

    await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

    const mem     = process.memoryUsage();
    const sysTot  = os.totalmem();
    const sysFree = os.freemem();
    const sysUsed = sysTot - sysFree;
    const ramPct  = (sysUsed / sysTot) * 100;
    const heapPct = (mem.heapUsed / mem.heapTotal) * 100;

    // ── RAM only ──────────────────────────────────────────────────────────────
    if (sub === 'ram') {
      return reply(
`╔══════════════════════════════════╗
║  💾  *RAM MONITOR*                ║
╚══════════════════════════════════╝

📊 *System RAM:*
${getStatusEmoji(ramPct)} ${bar(ramPct)}
• Used:  ${formatBytes(sysUsed)}
• Free:  ${formatBytes(sysFree)}
• Total: ${formatBytes(sysTot)}

🧠 *Process Heap:*
${getStatusEmoji(heapPct)} ${bar(heapPct)}
• Used:  ${formatBytes(mem.heapUsed)}
• Total: ${formatBytes(mem.heapTotal)}

📦 *RSS (total process):* ${formatBytes(mem.rss)}
📎 *External C++:* ${formatBytes(mem.external)}

> 💾 *${BOT_NAME} RAM Monitor*`
      );
    }

    // ── CPU only ──────────────────────────────────────────────────────────────
    if (sub === 'cpu') {
      const cpuLoad = await getCPULoad();
      const cpus    = os.cpus();
      return reply(
`╔══════════════════════════════════╗
║  ⚙️  *CPU MONITOR*                ║
╚══════════════════════════════════╝

🔢 *Cores:*   ${cpus.length}
🖥️  *Model:*  ${cpus[0]?.model?.trim().substring(0, 40)}
⚡ *Speed:*   ${cpus[0]?.speed} MHz
${cpuLoad !== null ? `📊 *Load:*    ${getStatusEmoji(cpuLoad)} ${bar(cpuLoad)}` : '📊 *Load:*    N/A'}
🏗️  *Arch:*   ${os.arch()}
🐧 *Platform:* ${os.platform()}

> ⚙️ *${BOT_NAME} CPU Monitor*`
      );
    }

    // ── Disk only ─────────────────────────────────────────────────────────────
    if (sub === 'disk') {
      const disk = await getDisk();
      if (!disk) return reply('❌ *Could not read disk info*');
      return reply(
`╔══════════════════════════════════╗
║  💽  *DISK MONITOR*               ║
╚══════════════════════════════════╝

📊 *Usage:*
${getStatusEmoji(disk.pct)} ${bar(disk.pct)}

• Used:  ${disk.used}
• Free:  ${disk.avail}
• Total: ${disk.total}

> 💽 *${BOT_NAME} Disk Monitor*`
      );
    }

    // ── Network ───────────────────────────────────────────────────────────────
    if (sub === 'network') {
      const nets = await getNetworkStats();
      const lines = nets.length
        ? nets.map(n => `• \`${n.name}\` — ${n.ip}`)
        : ['• No active interfaces'];
      return reply(
`╔══════════════════════════════════╗
║  🌐  *NETWORK MONITOR*            ║
╚══════════════════════════════════╝

🔌 *Active Interfaces:*
${lines.join('\n')}

🏠 *Hostname:* ${os.hostname()}

> 🌐 *${BOT_NAME} Network Monitor*`
      );
    }

    // ── Top processes ─────────────────────────────────────────────────────────
    if (sub === 'processes' || sub === 'ps') {
      const procs = await getTopProcesses();
      return reply(
`╔══════════════════════════════════╗
║  📋  *TOP PROCESSES (by MEM)*     ║
╚══════════════════════════════════╝

${procs.join('\n')}

> 📋 *${BOT_NAME} Process Monitor*`
      );
    }

    // ── FULL (default) ────────────────────────────────────────────────────────
    const [cpuLoad, disk, nets, procs] = await Promise.all([
      getCPULoad(),
      getDisk(),
      getNetworkStats(),
      getTopProcesses(),
    ]);

    const uptimeSec = os.uptime();
    const uptimeH   = Math.floor(uptimeSec / 3600);
    const uptimeM   = Math.floor((uptimeSec % 3600) / 60);

    const diskLine = disk
      ? `${getStatusEmoji(disk.pct)} ${bar(disk.pct)}\n     ${disk.used} used / ${disk.total} total`
      : 'Unavailable';

    const netLine = nets.length
      ? nets.map(n => `${n.name}: ${n.ip}`).join(' | ')
      : 'No interfaces';

    const text =
`╔══════════════════════════════════════╗
║  🖥️   *SYSTEM MONITOR — ULTRA*        ║
╚══════════════════════════════════════╝

⏱️ *OS Uptime:*   ${uptimeH}h ${uptimeM}m
🐧 *Platform:*   ${os.platform()} ${os.arch()} · ${os.hostname()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💾 *RAM:*
${getStatusEmoji(ramPct)} ${bar(ramPct)}
  Used: ${formatBytes(sysUsed)} / ${formatBytes(sysTot)}

${cpuLoad !== null
  ? `⚙️ *CPU:*\n${getStatusEmoji(cpuLoad)} ${bar(cpuLoad)}\n  Model: ${os.cpus()[0]?.model?.trim().substring(0, 35)}`
  : '⚙️ *CPU:* N/A'}

💽 *Disk (/):\n${diskLine}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 *Network:* ${netLine}
📦 *Node.js:* ${process.version}
🔌 *PID:*     ${process.pid}

📋 *Top Processes:*
${procs.join('\n')}

> 🖥️ *${BOT_NAME} SysMon ULTRA — Full Report*`;

    return reply(text);
  },
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading sysmonitor.js:', e.message); }

/* ===== stats.js ===== */
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


const CommandHandler = require('../lib/commandHandler');
const settings = require("../settings");

module.exports = {
  command: 'perf',
  aliases: ['metrics', 'diagnostics'],
  category: 'general',
  description: 'View command performance and error metrics',
  usage: '.perf',
  ownerOnly: 'true',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const report = CommandHandler.getDiagnostics();
      
      if (!report || report.length === 0) {
        return await sock.sendMessage(chatId, { text: '_No performance data collected yet._' }, { quoted: message });
      }

      let text = `📊 *PLUGINS PERFORMANCE*\n\n`;
      
      report.forEach((cmd, index) => {
        const errorText = cmd.errors > 0 ? `❗ Errors: ${cmd.errors}` : `✅ Smooth`;
        text += `${index + 1}. *${cmd.command.toUpperCase()}*\n`;
        text += `   ↳ Calls: ${cmd.usage}\n`;
        text += `   ↳ Latency: ${cmd.average_speed}\n`;
        text += `   ↳ Status: ${errorText}\n\n`;
      });

      await sock.sendMessage(chatId, {
        text: text.trim(),
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363408055942569@newsletter',
            newsletterName: 'JUNAID-MD↣³⁰²',
            serverMessageId: -1
          }
        }
      }, { quoted: message });

    } catch (error) {
      console.error('Error in perf command:', error);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch performance metrics.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading stats.js:', e.message); }

/* ===== rank.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const store = require('../lib/lightweight_store')

/**
 * Increment message count for a user in a chat
 * Now uses the unified store system (backward compatible)
 */
async function incrementMessageCount(chatId, userId) {
    try {
        await store.incrementMessageCount(chatId, userId)
    } catch (error) {
        console.error('Error incrementing message count:', error)
    }
}

/**
 * Load all message counts (backward compatible)
 * Returns same format as old JSON file
 */
async function loadMessageCounts() {
    try {
        const data = await store.getAllMessageCounts()
        return data.messageCount || {}
    } catch (error) {
        console.error('Error loading message counts:', error)
        return {}
    }
}

/**
 * Save message counts (backward compatible, but now a no-op)
 * Data is auto-saved by the store system
 */
function saveMessageCounts(messageCounts) {
    console.log('[RANK] saveMessageCounts called (no-op - auto-saved by store)')
}

module.exports = {
    command: 'rank',
    aliases: ['top', 'topusers', 'leaderboard', 'ranks'],
    category: 'group',
    description: 'Show top 5 most active members based on message count',
    usage: '.rank',
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid
        
        try {
            const messageCounts = await loadMessageCounts()
            const groupCounts = messageCounts[chatId] || {}

            const sortedMembers = Object.entries(groupCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)

            if (sortedMembers.length === 0) {
                await sock.sendMessage(chatId, {
                    text: '📊 *No message activity recorded yet*\n\nStart chatting to appear on the leaderboard!'
                }, { quoted: message })
                return
            }

            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
            let messageText = '🏆 *TOP MEMBERS LEADERBOARD*\n\n'
            
            sortedMembers.forEach(([userId, count], index) => {
                const username = userId.split('@')[0]
                messageText += `${medals[index]} @${username}\n💬 ${count} messages\n\n`
            })

            messageText += '_Keep chatting to climb the ranks!_'

            await sock.sendMessage(chatId, {
                text: messageText,
                mentions: sortedMembers.map(([userId]) => userId)
            }, { quoted: message })
            
        } catch (error) {
            console.error('Rank Command Error:', error)
            await sock.sendMessage(chatId, {
                text: '❌ Failed to load leaderboard. Please try again later.'
            }, { quoted: message })
        }
    },

    incrementMessageCount,
    loadMessageCounts,
    saveMessageCounts
}


/*
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'messageCount.json');

function loadMessageCounts() {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath);
        return JSON.parse(data);
    }
    return {};
}

function saveMessageCounts(messageCounts) {
    fs.writeFileSync(dataFilePath, JSON.stringify(messageCounts, null, 2));
}

function incrementMessageCount(groupId, userId) {
    const messageCounts = loadMessageCounts();

    if (!messageCounts[groupId]) {
        messageCounts[groupId] = {};
    }

    if (!messageCounts[groupId][userId]) {
        messageCounts[groupId][userId] = 0;
    }

    messageCounts[groupId][userId] += 1;

    saveMessageCounts(messageCounts);
}

module.exports = {
    command: 'rank',
    aliases: ['top', 'topusers', 'leaderboard', 'ranks'],
    category: 'group',
    description: 'Show top 5 most active members based on message count',
    usage: '.rank',
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        
        const messageCounts = loadMessageCounts();
        const groupCounts = messageCounts[chatId] || {};

        const sortedMembers = Object.entries(groupCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        if (sortedMembers.length === 0) {
            await sock.sendMessage(chatId, {
                text: '📊 *No message activity recorded yet*\n\nStart chatting to appear on the leaderboard!'
            }, { quoted: message });
            return;
        }

        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        let messageText = '🏆 *TOP MEMBERS LEADERBOARD*\n\n';
        
        sortedMembers.forEach(([userId, count], index) => {
            const username = userId.split('@')[0];
            messageText += `${medals[index]} @${username}\n💬 ${count} messages\n\n`;
        });

        messageText += '_Keep chatting to climb the ranks!_';

        await sock.sendMessage(chatId, {
            text: messageText,
            mentions: sortedMembers.map(([userId]) => userId)
        }, { quoted: message });
    },

    incrementMessageCount,
    loadMessageCounts,
    saveMessageCounts
};
*/


    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading rank.js:', e.message); }

/* ===== siminfo.js ===== */
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
 *****************************************************************************/

const axios = require('axios');

module.exports = {
    command: 'siminfo',
    aliases: ['phoneinfo', 'numinfo', 'carrier', 'phinfo', 'sim', 'simdb', 'simdata'],
    category: 'utility',
    description: 'Get SIM card owner information for any Pakistani number',
    usage: '.siminfo <phone number>\nExample: .siminfo 3001234567 or .siminfo +',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const input = args.join('').trim().replace(/\s+/g, '');

        // ─── No input: show help ──────────────────────────────────────────────
        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `🎀 *━━━━━━━ SIM DATABASE ━━━━━━━* 🎀\n\n` +
                      `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
                      `┃  📱 SIM INFO TOOL   ┃\n` +
                      `┗━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                      `✨ *Usage:* .siminfo 3xxxxxxxxx\n\n` +
                      `📌 *Examples:*\n` +
                      `• \`.siminfo \`\n` +
                      `• \`.siminfo +\`\n` +
                      `• \`.siminfo \`\n\n` +
                      `🌸 *Features:*\n` +
                      `├─👉 Owner Details\n` +
                      `├─👉 CNIC Info\n` +
                      `├─👉 Address\n` +
                      `└─👉 Network Provider\n\n` +
                      `🎀 *BY: JUNAID-MD↣³⁰² * 🎀`,
                ...channelInfo
            }, { quoted: message });
        }

        // ─── Clean / validate number ──────────────────────────────────────────
        let cleanNumber = input
            .replace(/^\+/, '')   // remove 
            .replace(/^92/, '')     // remove 92
            .replace(/^0/, '');     // remove leading 0

        if (!/^\d+$/.test(cleanNumber) || cleanNumber.length < 10) {
            return await sock.sendMessage(chatId, {
                text: `❌ *INVALID NUMBER!*\n\nPlease enter a valid Pakistani number.\nExample: **`,
                ...channelInfo
            }, { quoted: message });
        }

        // ─── Loading message ──────────────────────────────────────────────────
        const loadingMsg = await sock.sendMessage(chatId, {
            text: `🔍 *SEARCHING DATABASE* 🔍\n\n` +
                  `┏━━━━━━━━━━━━━━━━━━━━┓\n` +
                  `┃ 📡 Checking: ${cleanNumber}\n` +
                  `┃ ⏳ Please wait...\n` +
                  `┗━━━━━━━━━━━━━━━━━━━━┛`
        }, { quoted: message });

        // ─── API call ─────────────────────────────────────────────────────────
        let response;
        try {
            const { data } = await axios.get(
                `https://sim-info-api.wasif-ali.workers.dev/?search=${cleanNumber}`,
                { timeout: 10000 }
            );
            response = data;
        } catch (err) {
            await sock.sendMessage(chatId, { delete: loadingMsg.key });
            return await sock.sendMessage(chatId, {
                text: `⚠️ *API ERROR*\n\n❌ ${err.message || 'Connection failed'}\n\n🔄 Try again later.`,
                ...channelInfo
            }, { quoted: message });
        }

        // ─── Delete loading message ───────────────────────────────────────────
        await sock.sendMessage(chatId, { delete: loadingMsg.key });

        // ─── No records found ─────────────────────────────────────────────────
        if (!response || !response.success || !response.records || response.records.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `📭 *NO DATA FOUND*\n\n🔍 Number: ${cleanNumber}\n\n💔 No records available in database.`,
                ...channelInfo
            }, { quoted: message });
        }

        // ─── Build result text ────────────────────────────────────────────────
        let resultText = `🎀 *━━━━━━━ SIM CARD DATA ━━━━━━━* 🎀\n\n`;
        resultText += `📱 *NUMBER:* ${cleanNumber}\n`;
        resultText += `📊 *TOTAL:* ${response.records.length} Record(s)\n`;
        resultText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        for (let i = 0; i < response.records.length; i++) {
            const record = response.records[i];

            resultText += `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
            resultText += `┃  📇 RECORD ${i + 1} - CARD DATA  ┃\n`;
            resultText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;

            resultText += `┌────────────────────────────────┐\n`;
            resultText += `│ 👤 *NAME*                        │\n`;
            resultText += `│ ${(record.name || 'N/A').padEnd(32)}│\n`;
            resultText += `├────────────────────────────────┤\n`;
            resultText += `│ 🆔 *CNIC*                        │\n`;
            resultText += `│ ${(record.cnic || 'N/A').padEnd(32)}│\n`;
            resultText += `├────────────────────────────────┤\n`;
            resultText += `│ 📞 *SIM NUMBER*                  │\n`;
            resultText += `│ ${(record.mobile || cleanNumber).padEnd(32)}│\n`;
            resultText += `├────────────────────────────────┤\n`;
            resultText += `│ 🏠 *ADDRESS*                     │\n`;
            resultText += `│ ${(record.address || 'N/A').padEnd(32)}│\n`;
            resultText += `├────────────────────────────────┤\n`;
            resultText += `│ 📡 *NETWORK*                     │\n`;
            resultText += `│ ${(record.network || 'Unknown').padEnd(32)}│\n`;
            resultText += `└────────────────────────────────┘\n`;

            if (i < response.records.length - 1) {
                resultText += `\n🌸 *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━* 🌸\n\n`;
            }
        }

        // ─── Credit block ─────────────────────────────────────────────────────
        resultText += `\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        resultText += `┃ 💝 *CREDIT & SUPPORT* 💝       ┃\n`;
        resultText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;

        resultText += `┌────────────────────────────────┐\n`;
        resultText += `│ 👨‍💻 *DEVELOPER*                  │\n`;
        resultText += `│ ✨ JUNAID-MD↣³⁰² ✨      │\n`;
        resultText += `├────────────────────────────────┤\n`;
        resultText += `│ 🌐 *GITHUB*                     │\n`;
        resultText += `│ github.com/AbdulRehman19721986  │\n`;
        resultText += `├────────────────────────────────┤\n`;
        resultText += `│ 📢 *WHATSAPP CHANNEL*           │\n`;
        resultText += `│ whatsapp.com/channel/           │\n`;
        resultText += `│ 0029Vb7dmVQ6rsQt3kJY131f       │\n`;
        resultText += `├────────────────────────────────┤\n`;
        resultText += `│ 📱 *TELEGRAM*                   │\n`;
        resultText += `│ @HAMZA2               │\n`;
        resultText += `└────────────────────────────────┘\n\n`;

        resultText += `🎀 *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━* 🎀\n`;
        resultText += `   ⚡ *POWERED BY JUNAID-MD↣³⁰² * ⚡\n`;
        resultText += `🎀 *━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━* 🎀\n\n`;
        resultText += `✨ *FOR JUNAID-MD↣³⁰² * ✨`;

        // ─── Send result ──────────────────────────────────────────────────────
        await sock.sendMessage(chatId, {
            text: resultText,
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
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading siminfo.js:', e.message); }

/* ===== ping.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    'use strict';

/*
 * .ping — live latency, not canned text.
 * Sends placeholder, measures real socket round-trip, edits same msg
 * with actual number. If your loader needs array exports, wrap below
 * in module.exports = [pingCommand];
 */

const pingCommand = {
    command: 'ping',
    aliases: ['p', 'speed'],
    category: 'general',
    description: 'Live bot response latency',
    usage: '.ping',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        // ✅ FIX: previously sent a placeholder, then tried to `edit` it —
        // that's 2 network round-trips (slow, and edit fails silently on
        // some Baileys builds, doubling latency further with the fallback
        // send). One send, measured cleanly, is faster and 100% reliable.
        const t0 = Date.now();
        await sock.sendMessage(chatId, { text: '🏓 Pinging...' }, { quoted: message });
        const ms = Date.now() - t0;

        await sock.sendMessage(chatId, { text: `🏓 Pong! \`${ms}ms\`` }, { quoted: message });
    }
};

module.exports = pingCommand;

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading ping.js:', e.message); }

/* ===== speedtest.js ===== */
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

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

module.exports = {
    command: 'speedtest',
    aliases: ['speed', 'netspeed'],
    category: 'utility',
    description: 'Test internet speed of the server',
    usage: '.speedtest',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        await sock.sendMessage(chatId, {
            text: '🔄 *Testing internet speed...*\n\nPlease wait, this may take a moment.',
            ...channelInfo
        }, { quoted: message });

        try {
            const { stdout, stderr } = await execAsync('python3 lib/speed.py', { timeout: 120000 });
            const result = (stdout || stderr || '').trim();

            if (!result) {
                return await sock.sendMessage(chatId, {
                    text: '❌ No output from speed test.',
                    ...channelInfo
                }, { quoted: message });
            }

            await sock.sendMessage(chatId, { text: result, ...channelInfo }, { quoted: message });

        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Speed test failed: ${error.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading speedtest.js:', e.message); }

/* ===== listcmd.js ===== */
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

module.exports = {
    command: 'listcmd',
    aliases: ['cmdlist'],
    category: 'owner',
    description: 'List all sticker commands',
    usage: '.listcmd',

    async handler(sock, message, args, context = {}) {
        const { chatId } = context;
        
        const stickers = await getStickerCommands();
        const entries = Object.entries(stickers);

        if (entries.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: '✳️ No sticker commands found' 
            }, { quoted: message });
        }

        const stickerList = entries
            .map(([key, value], index) => 
                `${index + 1}. ${value.locked ? `*(blocked)* ${key}` : key} : ${value.text}`
            )
            .join('\n');

        const mentions = entries
            .map(([, value]) => value.mentionedJid)
            .flat()
            .filter(Boolean);

        await sock.sendMessage(chatId, {
            text: `*COMMAND LIST*\n\n▢ *Info:* If it's in *bold*, it is blocked\n\n──────────────────\n${stickerList}`,
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
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading listcmd.js:', e.message); }

/* ===== searchcmd.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                        *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the JUNAID-MD↣³⁰² Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/

const CommandHandler = require('../lib/commandHandler');

module.exports = {
  command: 'find',
  aliases: ['lookup', 'searchcmd'],
  category: 'general',
  description: 'Find a command by keyword or description',
  usage: '.find [keyword]',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(' ').toLowerCase();

    if (!query) {
      return await sock.sendMessage(chatId, { text: 'What are you looking for? Example: *.find status*' }, { quoted: message });
    }

    try {
      const allCommands = Array.from(CommandHandler.commands.values());

      const results = allCommands.filter(commandObject => {
        const nameMatch = commandObject.command?.toLowerCase().includes(query);
        const descMatch = commandObject.description?.toLowerCase().includes(query);
        const aliasMatch = commandObject.aliases?.some(a => a.toLowerCase().includes(query));

        return nameMatch || descMatch || aliasMatch;
      });

      if (results.length === 0) {
        const suggestion = CommandHandler.findSuggestion(query);
        let failText = `❌ No commands found matching *"${query}"*`;
        if (suggestion) failText += `\n\nDid you mean: *.${suggestion}*?`;
        
        return await sock.sendMessage(chatId, { text: failText }, { quoted: message });
      }

      let resultText = `🔍 *SEARCH RESULTS FOR:* "${query.toUpperCase()}"\n\n`;

      results.forEach((res, index) => {
        const status = CommandHandler.disabledCommands.has(res.command.toLowerCase()) ? '🔸' : '🔹';
        resultText += `${index + 1}. ${status} *.${res.command}*\n`;
        resultText += `📝 _${res.description || 'No description available.'}_\n`;
        if (res.aliases && res.aliases.length > 0) {
          resultText += `🔗 Aliases: ${res.aliases.join(', ')}\n`;
        }
        resultText += `\n`;
      });

      resultText += `💡 _Tip: Use the prefix before the command name to run it._`;

      await sock.sendMessage(chatId, { text: resultText }, { quoted: message });

    } catch (error) {
      console.error('Search Error:', error);
      await sock.sendMessage(chatId, { text: '❌ An error occurred during the search.' });
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
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading searchcmd.js:', e.message); }

/* ===== guide.js ===== */
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
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *  🔗  Telegram : https://t.me/Hamza302bot                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

module.exports = {
    command: 'guide',
    aliases: ['help', 'commands', 'cmds'],
    category: 'main',
    description: 'Show how to use bot commands and tools',
    usage: '.guide [category]',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const category = args[0] ? args[0].toLowerCase() : null;

        const fullGuide = `╭────────────────────────────╮
│    📚 *JUNAID-MD↣³⁰² USER GUIDE*    │
╰────────────────────────────╯

*🔹 Getting Started*
• Use \`.guide\` to see this menu.
• Type any command with prefix \`.\` (dot).
• Example: \`.menu\` to see all commands.

*🔹 Main Categories*
• \`.guide ai\`       – AI tools (chat, image, video)
• \`.guide fun\`      – Fun & games (gaali, shayari, tictactoe)
• \`.guide media\`    – Download music, video, docs
• \`.guide group\`    – Group management (welcome, admin tools)
• \`.guide owner\`    – Bot owner commands (restart, broadcast)
• \`.guide auto\`     – Auto‑forward setup

*🔹 Need Help?*
Contact: @JUNAID
Channel: https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f

_Powered by JUNAID-MD↣³⁰² & JUNAID-MD↣³⁰²_`;

        const aiGuide = `*🤖 AI Commands*
\`.gpt <question>\`      – Ask GPT‑4
\`.gemini <question>\`   – Google Gemini AI
\`.llama <question>\`    – Llama 3
\`.imagine <prompt>\`    – Generate image
\`.sora <prompt>\`       – Generate video (text‑to‑video)`;

        const funGuide = `*🎉 Fun Commands*
\`.gaali\`               – Get random funny abuse
\`.shayari\`             – Romantic / sad poetry
\`.joke\`                – Random joke
\`.fact\`                – Random fact
\`.dirty\`               – Dirty lines (18+)
\`.tictactoe @user\`     – Start a TicTacToe game
\`.connect4 @user\`      – Start Connect4 game`;

        const mediaGuide = `*🎵 Media Download*
\`.play <song>\`         – Download audio from YouTube
\`.video <query>\`       – Download video
\`.ig <url>\`            – Instagram reels / post
\`.fb <url>\`            – Facebook video
\`.tt <url>\`            – TikTok video
\`.yt <query>\`          – YouTube search`;

        const groupGuide = `*👥 Group Commands*
\`.welcome on/off\`      – Toggle welcome message
\`.goodbye on/off\`      – Toggle goodbye message
\`.antilink on/off\`     – Block links
\`.antibadword on/off\`  – Block bad words
\`.tagall <text>\`       – Mention everyone
\`.hidetag <text>\`      – Mention everyone silently
\`.kick @user\`          – Remove member
\`.promote @user\`       – Make admin
\`.demote @user\`        – Remove admin`;

        const ownerGuide = `*👑 Owner Commands*
\`.broadcast <text>\`    – Send message to all chats
\`.restart\`             – Restart bot
\`.shutdown\`            – Stop bot
\`.eval <code>\`         – Execute JS code
\`.autoforward\`         – Configure auto‑forward
\`.addsudo <number>\`    – Add sudo user`;

        const autoGuide = `*🔄 Auto‑forward Setup*
\`.autoforward source <jid>\`   – Set source group/chat
\`.autoforward target <jid>\`   – Set destination
\`.autoforward mode <option>\`  – all | owner | others | admin
\`.autoforward on\`              – Enable forwarding
\`.autoforward off\`             – Disable
\`.autoforward\`                  – Show current config

*Mode explanation:*
• \`all\`    – forward every message
• \`owner\`  – forward only bot owner's messages
• \`others\` – forward messages from everyone except bot owner
• \`admin\`  – forward only group admins' messages`;

        let responseText;
        if (!category) {
            responseText = fullGuide;
        } else if (category === 'ai') {
            responseText = aiGuide;
        } else if (category === 'fun') {
            responseText = funGuide;
        } else if (category === 'media') {
            responseText = mediaGuide;
        } else if (category === 'group') {
            responseText = groupGuide;
        } else if (category === 'owner') {
            responseText = ownerGuide;
        } else if (category === 'auto') {
            responseText = autoGuide;
        } else {
            responseText = `❌ Unknown category. Available: ai, fun, media, group, owner, auto`;
        }

        await sock.sendMessage(chatId, {
            text: responseText,
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
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading guide.js:', e.message); }

/* ===== menu.js ===== */
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

const settings = require('../settings');
const commandHandler = require('../lib/commandHandler');
const store = require('../lib/lightweight_store');
const axios = require('axios');
const { sendInteractiveMessage } = require('gifted-btns');

const MENU_IMAGE_URL = 'https://i.ibb.co/n8kzCwBx/jawadmd.jpg';

module.exports = {
    command: 'menu',
    aliases: ['help', 'cmd'],
    category: 'main',
    description: 'Show main command list and separate quick‑link buttons',
    usage: '.menu',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;

        try {
            // Get dynamic values from DB (with fallback to settings)
            const dynamicPrefix = await store.getSetting('global', 'prefix') || settings.prefixes[0];
            const dynamicBotName = await store.getSetting('global', 'botName') || settings.botName;
            const dynamicBotDesc = await store.getSetting('global', 'botDesc') || settings.botDesc;
            const dynamicBotDp = await store.getSetting('global', 'botDp') || settings.botDp;

            // Get runtime
            const uptimeSeconds = process.uptime();
            const hours = Math.floor(uptimeSeconds / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            const seconds = Math.floor(uptimeSeconds % 60);
            const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

            // Get bot mode
            const botMode = await store.getBotMode();

            // Total commands
            const totalCommands = commandHandler.commands.size;

            // Build menu text
            let menuText = `╭┈┄───【 *${dynamicBotName}* 】───┄┈╮\n`;
            menuText += `├■ 🤖 *Owner:* ${settings.botOwner} & ${settings.secondOwner}\n`;
            menuText += `├■ 📜 *Commands:* ${totalCommands}\n`;
            menuText += `├■ ⏱️ *Runtime:* ${uptimeString}\n`;
            menuText += `├■ 📡 *Baileys:* Multi Device\n`;
            menuText += `├■ ☁️ *Platform:* ${settings.platform.toUpperCase()}\n`;
            menuText += `├■ 📦 *Prefix:* ${dynamicPrefix}\n`;
            menuText += `├■ ⚙️ *Mode:* ${botMode}\n`;
            menuText += `├■ 🖼️ *Version:* ${settings.version}\n`;
            menuText += `├■ 📝 *About:* ${dynamicBotDesc}\n`;
            menuText += `╰───────────────┄┈╯\n\n`;

            // Categories
            const categories = Array.from(commandHandler.categories.keys()).sort();
            for (const cat of categories) {
                const cmdList = commandHandler.getCommandsByCategory(cat);
                if (cmdList.length === 0) continue;

                menuText += `『 *${cat.toUpperCase()}* 』\n`;
                menuText += `╭───────────────┄┈╮\n`;
                cmdList.forEach(cmd => {
                    menuText += `┋ ➜ *${cmd}*\n`;
                });
                menuText += `╰───────────────┄┈╯\n\n`;
            }

            menuText += `> *© Powered by JUNAID-MD↣³⁰² *`;

            // Fetch image with fallback
            let imageUrl = dynamicBotDp !== 'uploaded via image' ? dynamicBotDp : MENU_IMAGE_URL;
            let imageBuffer = null;
            try {
                const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
                imageBuffer = Buffer.from(response.data);
            } catch (err) {
                console.error('Failed to fetch menu image:', err.message);
                // Try fallback image if the primary failed
                if (imageUrl !== MENU_IMAGE_URL) {
                    try {
                        const fallbackRes = await axios.get(MENU_IMAGE_URL, { responseType: 'arraybuffer', timeout: 10000 });
                        imageBuffer = Buffer.from(fallbackRes.data);
                    } catch (fallbackErr) {
                        console.error('Failed to fetch fallback image:', fallbackErr.message);
                    }
                }
            }

            // Send main menu – only send image if we have a buffer
            if (imageBuffer) {
                await sock.sendMessage(chatId, {
                    image: imageBuffer,
                    caption: menuText,
                    ...channelInfo
                }, { quoted: message });
            } else {
                // Send as text only
                await sock.sendMessage(chatId, {
                    text: menuText,
                    ...channelInfo
                }, { quoted: message });
            }

            // ==================== SIMPLIFIED QUICK LINKS ====================
            const quickLinkButtons = [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '👥 WhatsApp Group',
                        url: settings.whatsappGroup || 'https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f'
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '💬 Telegram Group',
                        url: settings.telegramGroup || 'https://t.me/Hamza302bot'
                    })
                }
            ];

            // Send quick‑links as interactive message
            await sendInteractiveMessage(sock, chatId, {
                text: '🔗 *JOIN OUR COMMUNITIES*\n\nTap the buttons below to join our WhatsApp and Telegram groups.',
                footer: 'Stay connected!',
                interactiveButtons: quickLinkButtons
            }, { quoted: message });

        } catch (error) {
            console.error('Error in menu command:', error);
            await sock.sendMessage(chatId, {
                text: '❌ An error occurred while displaying the menu.',
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
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading menu.js:', e.message); }

/* ===== smartmenu.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *  JUNAID-MD↣³⁰² - SMART MENU (.smenu)
 *  Number-selection category menu — send category number to get command list
 *  NOTE: .menu is NOT touched. Only .smenu is changed.
 *****************************************************************************/

const CommandHandler = require('../lib/commandHandler');
const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const { selectionHandler } = require('../lib/selectionHandler');

const LOGO = `╔══════════════════════════╗
║   🤖  JUNAID  B O T   ║
║     by JUNAID-MD↣³⁰²     ║
╚══════════════════════════╝`;

const CAT_EMOJI = {
    general: '📱', owner: '👑', admin: '🛡️', group: '👥',
    download: '📥', ai: '🤖', search: '🔍', fun: '🎮',
    sticker: '🎭', tools: '🔧', info: 'ℹ️', games: '🕹️',
    images: '🖼️', music: '🎵', stalk: '👀', quotes: '💬',
    utility: '⚙️', nsfw: '🔞', apks: '📲',
};

function catEmoji(cat) {
    return CAT_EMOJI[cat.toLowerCase()] || '📂';
}

function formatTime() {
    return new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: settings.timeZone || 'Asia/Karachi'
    });
}

module.exports = {
    command: 'smenu',
    aliases: ['shelp', 'smart'],
    category: 'general',
    description: 'Interactive numbered category menu',
    usage: '.smenu  or  .smenu <category>  or  .smenu <number>',
    isPrefixless: false,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        try {
            const categories = Array.from(CommandHandler.categories.keys());
            const query = args.join(' ').trim().toLowerCase();

            // If user sent a number or category name, show that category
            const numInput = parseInt(query);
            let targetCat = null;

            if (!isNaN(numInput) && numInput >= 1 && numInput <= categories.length) {
                targetCat = categories[numInput - 1];
            } else if (query && categories.some(c => c.toLowerCase() === query)) {
                targetCat = categories.find(c => c.toLowerCase() === query);
            }

            if (targetCat) {
                // Show commands in this category
                const cmds = CommandHandler.getCommandsByCategory(targetCat);
                const prefix = settings.prefixes?.[0] || '.';

                let text = `${catEmoji(targetCat)} *${targetCat.toUpperCase()} COMMANDS*\n`;
                text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

                cmds.forEach((cmdName, i) => {
                    const isOff = CommandHandler.disabledCommands?.has(cmdName.toLowerCase());
                    const status = isOff ? '❌' : '✅';
                    text += `${status} \`${prefix}${cmdName}\`\n`;
                });

                text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
                text += `📊 *${cmds.length} commands* in this category\n`;
                text += `Type \`.smenu\` to go back to main menu`;

                await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
                return;
            }

            // Show main numbered menu
            const totalCmds = CommandHandler.commands.size;
            const prefix = settings.prefixes?.[0] || '.';

            let menuText = `${LOGO}\n\n`;
            menuText += `📱 *Bot:* ${settings.botName || 'JUNAID-MD↣³⁰²'}\n`;
            menuText += `👤 *Owner:* ${settings.botOwner || 'JUNAID-MD↣³⁰²'}\n`;
            menuText += `🔖 *Prefix:* ${prefix}\n`;
            menuText += `⏰ *Time:* ${formatTime()}\n`;
            menuText += `📦 *Commands:* ${totalCmds}\n\n`;
            menuText += `━━━━━━━━━━━━━━━━━━━━\n`;
            menuText += `📋 *CATEGORIES — Send number to view*\n`;
            menuText += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            categories.forEach((cat, i) => {
                const cmds = CommandHandler.getCommandsByCategory(cat);
                const emoji = catEmoji(cat);
                menuText += `*${i + 1}.* ${emoji} ${cat.toUpperCase()} — (${cmds.length} cmds)\n`;
            });

            menuText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
            menuText += `💡 *Reply with a number* (1–${categories.length})\n`;
            menuText += `or type \`.smenu <name>\` e.g. \`.smenu download\`\n`;
            menuText += `━━━━━━━━━━━━━━━━━━━━`;

            // Register a selection handler for this user's next reply
            const senderId = message.key.participant || message.key.remoteJid;
            const pendingKey = `smenu_${chatId}_${senderId}`;

            // Store pending selection (expires in 60s)
            global._smenuPending = global._smenuPending || new Map();
            global._smenuPending.set(pendingKey, {
                categories,
                expires: Date.now() + 60000
            });

            const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
            const thumbnail = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null;

            if (thumbnail) {
                await sock.sendMessage(chatId, {
                    image: thumbnail,
                    caption: menuText,
                    ...channelInfo
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { text: menuText, ...channelInfo }, { quoted: message });
            }

        } catch (err) {
            console.error('[SMENU] Error:', err);
            await sock.sendMessage(chatId, { text: `❌ Menu error: ${err.message}`, ...channelInfo }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading smartmenu.js:', e.message); }

/* ===== list.js ===== */
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


const settings = require('../settings');
const commandHandler = require('../lib/commandHandler');
const path = require('path');
const fs = require('fs');
function formatTime() {
    const now = new Date();
    const options = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: settings.timeZone || 'UTC'
    };
    return now.toLocaleTimeString('en-US', options);
}

const menuStyles = [
  {
    render({ title, info, categories, prefix }) {
      let t = `╭━━『 *MEGA MENU* 』━⬣\n`;
      t += `┃ ✨ *Bot: ${info.bot}*\n`;
      t += `┃ 🔧 *Prefix: ${info.prefix}*\n`;
      t += `┃ 📦 *Plugin: ${info.total}*\n`;
      t += `┃ 💎 *Version: ${info.version}*\n`;
      t += `┃ ⏰ *Time: ${info.time}*\n`;

      for (const [cat, cmds] of categories) {
        t += `┃━━━ *${cat.toUpperCase()}* ━✦\n`;
        for (const c of cmds)
          t += `┃ ➤ ${prefix}${c}\n`;
      }
      t += `╰━━━━━━━━━━━━━⬣`;
      return t;
    }
  },

  {
    render({ title, info, categories, prefix }) {
      let t = `◈╭─❍「 *MEGA MENU* 」❍\n`;
      t += `◈├• 🌟 *Bot: ${info.bot}*\n`;
      t += `◈├• ⚙️ *Prefix: ${info.prefix}*\n`;
      t += `◈├• 🍫 *Plugins: ${info.total}*\n`;
      t += `◈├• 💎 *Version: ${info.version}*\n`;
      t += `◈├• ⏰ *Time: ${info.time}*\n`;

      for (const [cat, cmds] of categories) {
        t += `◈├─❍「 *${cat.toUpperCase()}* 」❍\n`;
        for (const c of cmds)
          t += `◈├• ${prefix}${c}\n`;
      }
      t += `◈╰──★─☆──♪♪─❍`;
      return t;
    }
  },

  {
    render({ title, info, categories, prefix }) {
      let t = `┏━━━━ *MEGA MENU* ━━━┓\n`;
      t += `┃• *Bot : ${info.bot}*\n`;
      t += `┃• *Prefixes : ${info.prefix}*\n`;
      t += `┃• *Plugins : ${info.total}*\n`;
      t += `┃• *Version : ${info.version}*\n`;
      t += `┃• *Time : ${info.time}*\n`;

      for (const [cat, cmds] of categories) {
        t += `┃━━━━ *${cat.toUpperCase()}* ━━◆\n`;
        for (const c of cmds)
          t += `┃ ▸ ${prefix}${c}\n`;
      }
      t += `┗━━━━━━━━━━━━━━━┛`;
      return t;
    }
  },

  {
    render({ title, info, categories, prefix }) {
      let t = `✦═══ *MEGA MENU* ═══✦\n`;
      t += `║➩ *Bot: ${info.bot}*\n`;
      t += `║➩ *Prefixes: ${info.prefix}*\n`;
      t += `║➩ *Plugins: ${info.total}*\n`;
      t += `║➩ *Version: ${info.version}*\n`;
      t += `║➩ *Time: ${info.time}*\n`;

      for (const [cat, cmds] of categories) {
        t += `║══ *${cat.toUpperCase()}* ══✧\n`;
        for (const c of cmds)
          t += `║ ✦ ${prefix}${c}\n`;
      }
      t += `✦══════════════✦`;
      return t;
    }
  },

  {
    render({ title, info, categories, prefix }) {
      let t = `❀━━━ *MEGA MENU* ━━━❀\n`;
      t += `┃☞ *Bot: ${info.bot}*\n`;
      t += `┃☞ *Prefixes: ${info.prefix}*\n`;
      t += `┃☞ *Plugins: ${info.total}*\n`;
      t += `┃☞ *Version: ${info.version}*\n`;
      t += `┃☞ *Time: ${info.time}*\n`;

      for (const [cat, cmds] of categories) {
        t += `┃━━━〔 *${cat.toUpperCase()}* 〕━❀\n`;
        for (const c of cmds)
          t += `┃☞ ${prefix}${c}\n`;
      }
      t += `❀━━━━━━━━━━━━━━❀`;
      return t;
    }
  },

  {
    render({ title, info, categories, prefix }) {
      let t = `◆━━━ *MEGA MENU* ━━━◆\n`;
      t += `┃ ¤ *Bot: ${info.bot}*\n`;
      t += `┃ ¤ *Prefixes: ${info.prefix}*\n`;
      t += `┃ ¤ *Plugins: ${info.total}*\n`;
      t += `┃ ¤ *Version: ${info.version}*\n`;
      t += `┃ ¤ *Time: ${info.time}*\n`;
      for (const [cat, cmds] of categories) {
        t += `┃━━ *${cat.toUpperCase()}* ━━◆◆\n`;
        for (const c of cmds)
          t += `┃ ¤ ${prefix}${c}\n`;
      }
      t += `◆━━━━━━━━━━━━━━━━◆`;
      return t;
    }
  },

  {
    render({ title, info, categories, prefix }) {
      let t = `╭───⬣ *MEGA MENU* ──⬣\n`;
      t += ` | ● *Bot: ${info.bot}*\n`;
      t += ` | ● *Prefixes: ${info.prefix}*\n`;
      t += ` | ● *Plugins: ${info.total}*\n`;
      t += ` | ● *Version: ${info.version}*\n`;
      t += ` | ● *Time: ${info.time}*\n`;
      for (const [cat, cmds] of categories) {
        t += ` |───⬣ *${cat.toUpperCase()}* ──⬣\n`;
        for (const c of cmds)
          t += ` | ● ${prefix}${c}\n`;
      }
      t += `╰──────────⬣`;
      return t;
    }
  }
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

module.exports = {
  command: 'menu',
  aliases: ['help', 'commands', 'h', 'list'],
  category: 'general',
  description: 'Show all commands',
  usage: '.menu [command]',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const prefix = settings.prefixes[0];
    const imagePath = path.join(__dirname, '../assets/bot_image.jpg');

    if (args.length) {
      const searchTerm = args[0].toLowerCase();
      
      let cmd = commandHandler.commands.get(searchTerm);
      
      if (!cmd && commandHandler.aliases.has(searchTerm)) {
        const mainCommand = commandHandler.aliases.get(searchTerm);
        cmd = commandHandler.commands.get(mainCommand);
      }
      
      if (!cmd) {
        return sock.sendMessage(chatId, { 
          text: `❌ Command "${args[0]}" not found.\n\nUse ${prefix}menu to see all commands.`,
          ...channelInfo
        }, { quoted: message });
      }

      const text = 
`╭━━━━━━━━━━━━━━⬣
┃ 📌 *COMMAND INFO*
┃
┃ ⚡ *Command:* ${prefix}${cmd.command}
┃ 📝 *Desc:* ${cmd.description || 'No description'}
┃ 📖 *Usage:* ${cmd.usage || `${prefix}${cmd.command}`}
┃ 🏷️ *Category:* ${cmd.category || 'misc'}
┃ 🔖 *Aliases:* ${cmd.aliases?.length ? cmd.aliases.map(a => prefix + a).join(', ') : 'None'}
┃
╰━━━━━━━━━━━━━━⬣`;

      if (fs.existsSync(imagePath)) {
        return sock.sendMessage(chatId, {
          image: { url: imagePath },
          caption: text,
          ...channelInfo
        }, { quoted: message });
      }

      return sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }

    const style = pick(menuStyles);

    const text = style.render({
      title: settings.botName,
      prefix,
      info: {
        bot: settings.botName,
        prefix: settings.prefixes.join(', '),
        total: commandHandler.commands.size,
        version: settings.version || "5.0.0",
        time: formatTime()
      },
      categories: commandHandler.categories
    });

    if (fs.existsSync(imagePath)) {
      await sock.sendMessage(chatId, {
        image: { url: imagePath },
        caption: text,
        ...channelInfo
      }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
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
 *    © 2026 JUNAID-MD↣³⁰² . All rights reserved.                            *
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
} catch(e) { console.warn('[BUNDLE:cat-18-info] Error loading list.js:', e.message); }

module.exports = _bundle;