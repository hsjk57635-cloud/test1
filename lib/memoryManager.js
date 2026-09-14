const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let forwardedCache = null;
let chatMemory = null;
// ✅ FIX ("tmp/cache RAM management"): groupMetaCache, _sudoCache,
// _lidOwnerCache and the per-chat _msgStore in index.js grew forever for
// the life of the process — every unique jid the bot ever saw stayed
// cached, with nothing ever evicting old entries. Over a long uptime that's
// an unbounded leak. Let index.js register these with the same manager
// that already sweeps forwardedCache/chatMemory on a timer, instead of
// each cache silently growing on its own.
const extraCaches = [];

function setCaches(forwarded, chat) {
  forwardedCache = forwarded;
  chatMemory = chat;
}

// Register any additional Map-like cache (must support .clear() or .size)
// to be periodically trimmed. `maxSize` clears it once it exceeds that many
// entries — keeps it simple and avoids needing per-entry timestamps.
function registerExtraCache(map, maxSize = 500) {
  if (map && typeof map.clear === 'function') extraCaches.push({ map, maxSize });
}

// Heroku free: 512MB. We clean aggressively but NEVER restart automatically.
// Manual restart can be triggered via .panel or Heroku dashboard.
const MEMORY_CLEAN_MB = 350;   // start cleanup
const MEMORY_WARN_MB  = 420;   // warn owner
const MEMORY_HARD_MB  = 490;   // last-resort aggressive clean (no restart)
const CHECK_INTERVAL  = 60000; // every 60s

let ownerNotified = false;
let sockRef = null;
let ownerJid = null;

function setSockRef(sock, ownerNumber) {
  sockRef = sock;
  ownerJid = ownerNumber ? ownerNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;
}

async function cleanupMemory(level = 'normal') {
  console.log(`[MEM] 🧹 Cleanup (${level})...`);

  if (forwardedCache && typeof forwardedCache.clear === 'function') {
    forwardedCache.clear();
  }
  if (chatMemory) {
    if (chatMemory.messages) chatMemory.messages.clear();
    if (chatMemory.userInfo) chatMemory.userInfo.clear();
  }

  // Clean tmp/temp folders
  for (const dir of ['tmp', 'temp']) {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      try {
        const files = fs.readdirSync(fullPath);
        let cleaned = 0;
        for (const file of files) {
          const filePath = path.join(fullPath, file);
          try {
            const stat = fs.statSync(filePath);
            // On normal clean: remove files older than 10 min
            // On aggressive clean: remove all files
            const ageMs = Date.now() - stat.mtimeMs;
            if (level === 'aggressive' || ageMs > 10 * 60 * 1000) {
              fs.unlinkSync(filePath);
              cleaned++;
            }
          } catch {}
        }
        if (cleaned > 0) console.log(`[MEM] Cleaned ${cleaned} files from /${dir}`);
      } catch {}
    }
  }

  if (global.gc) {
    try { global.gc(); } catch {}
  }

  // Trim any registered extra caches that have grown past their cap —
  // on 'aggressive' clear them fully, otherwise only once oversized.
  for (const { map, maxSize } of extraCaches) {
    if (!map || typeof map.size !== 'number') continue;
    if (level === 'aggressive' || map.size > maxSize) {
      const before = map.size;
      map.clear();
      if (before > 0) console.log(`[MEM] Cleared cache (${before} entries)`);
    }
  }
}

function checkMemory() {
  const usage = process.memoryUsage();
  const heapMB = usage.heapUsed / 1024 / 1024;
  const rssMB  = usage.rss / 1024 / 1024;

  console.log(`[MEM] Heap: ${heapMB.toFixed(1)}MB | RSS: ${rssMB.toFixed(1)}MB`);

  if (rssMB >= MEMORY_HARD_MB) {
    console.warn(`[MEM] ⚠️ CRITICAL ${rssMB.toFixed(0)}MB — aggressive cleanup`);
    cleanupMemory('aggressive');
    if (sockRef && ownerJid && !ownerNotified) {
      ownerNotified = true;
      sockRef.sendMessage(ownerJid, {
        text: `⚠️ *REDX BOT — Memory Warning*\n\nRAM: ${rssMB.toFixed(0)}MB / 512MB\n\nAggressive cleanup done. Bot is *NOT* restarting.\n\nIf bot becomes slow, use \`.cleartmp\` or restart from Heroku dashboard.`
      }).catch(() => {});
      setTimeout(() => { ownerNotified = false; }, 30 * 60 * 1000); // re-notify after 30 min
    }
  } else if (rssMB >= MEMORY_WARN_MB) {
    console.warn(`[MEM] ⚠️ High RAM ${rssMB.toFixed(0)}MB — running cleanup`);
    cleanupMemory('normal');
  } else if (rssMB >= MEMORY_CLEAN_MB) {
    cleanupMemory('light');
  }
}

function startMonitoring() {
  console.log('[MEM] 📊 Memory monitor started (no-restart mode)');
  setInterval(checkMemory, CHECK_INTERVAL);
  setTimeout(checkMemory, 10000);
}

module.exports = { startMonitoring, setCaches, cleanupMemory, setSockRef, registerExtraCache };
