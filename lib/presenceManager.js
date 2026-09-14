'use strict';
/**
 * PRESENCE MANAGER — ANTI-BAN EDITION v9.0
 * ✅ Fixed: was calling goOffline every 30s (presence spam = ban trigger)
 * ✅ Now: 5-minute re-apply interval — quiet and stealth
 */

const OWNER_ONLINE_MS    = 8_000;
// ✅ ANTI-BAN: 5 minutes, NOT 30 seconds — presence spam triggers rate-limiting/ban
const REAPPLY_OFFLINE_MS = 5 * 60 * 1000;

const _timers    = new Map();
const _intervals = new Map();

async function goOffline(sock) {
  try { await sock.sendPresenceUpdate('unavailable'); } catch {}
}

async function _pulse(sock, number) {
  try {
    const prev = _timers.get(number);
    if (prev) { clearTimeout(prev); _timers.delete(number); }
    await sock.sendPresenceUpdate('available');
    const t = setTimeout(() => {
      goOffline(sock).catch(() => {});
      _timers.delete(number);
    }, OWNER_ONLINE_MS);
    _timers.set(number, t);
  } catch {}
}

function initPresenceManager(sock, number) {
  destroyPresenceManager(number);
  // Go offline 5 seconds after connect
  setTimeout(() => goOffline(sock).catch(() => {}), 5_000);
  // Re-apply offline every 5 MINUTES — not every 30s (ban fix)
  const iv = setInterval(() => goOffline(sock).catch(() => {}), REAPPLY_OFFLINE_MS);
  _intervals.set(number, iv);
  console.log(`[PRESENCE:${number}] 🕵️ Stealth mode — appears offline (5-min re-apply)`);
}

function onOwnerActivity(sock, number) {
  _pulse(sock, number).catch(() => {});
}

function destroyPresenceManager(number) {
  const iv = _intervals.get(number);
  if (iv) { clearInterval(iv); _intervals.delete(number); }
  const t  = _timers.get(number);
  if (t)  { clearTimeout(t);  _timers.delete(number); }
}

module.exports = { initPresenceManager, onOwnerActivity, destroyPresenceManager, goOffline };
