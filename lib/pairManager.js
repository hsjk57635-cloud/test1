/*****************************************************************************
 *  PAIR MANAGER — REDXBOT302 v8.0                                           *
 *  Handles pairing logic for both the REST /api/pair endpoint               *
 *  and the WhatsApp .pair plugin command.                                   *
 *                                                                           *
 *  Usage:                                                                   *
 *    const pm = require('./lib/pairManager');                               *
 *    pm.init(deps);          ← called once from index.js on startup        *
 *    pm.requestPair(number)  ← returns { pairingCode, number }             *
 *    pm.getStatus(number)    ← { connected, pending, lastCode }            *
 *                                                                           *
 *  © 2026 JUNAID-MD↣³⁰². All rights reserved.                       *
 *****************************************************************************/

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Rate-limit: one pending request per number per 90 s ──────────────────
const _pending  = new Map();   // number → { ts, code }
const RATE_LIMIT_MS = 90_000;

let _deps = null;   // populated by init()

/* ── Called once from index.js after all vars are set up ─────────────────── */
function init(deps) {
  /*
    deps = {
      makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion,
      Browsers, P, DisconnectReason,
      SESSIONS_DIR, activeConnections, deploys, DEPLOY_ID,
      BOT_NAME, OWNER_NUM, CO_OWNER_NUM, NL_JID, WA_GROUP,
      PREFIX, BOT_IMG, REPO_LINK, NL_NAME,
      setupHandlers,         ← function(conn, number, saveCreds)
      initPresenceManager,   ← from presenceManager
      destroyPresenceManager,
      io,                    ← socket.io instance
      statsData, saveStats, saveDeploys, broadcastStats,
      detectPlatform,
    }
  */
  _deps = deps;
}

/* ── Core: create socket, get code, store entry ─────────────────────────── */
async function requestPair(number, { force = false } = {}) {
  if (!_deps) throw new Error('PairManager not initialized');

  const {
    makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion,
    Browsers, P, SESSIONS_DIR, activeConnections,
    setupHandlers, destroyPresenceManager,
  } = _deps;

  const num = (number || '').replace(/\D/g, '');
  if (!num || num.length < 7) throw new Error('Invalid phone number — include country code, no +');

  // Rate-limit check
  const prev = _pending.get(num);
  if (prev && !force && (Date.now() - prev.ts) < RATE_LIMIT_MS) {
    const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - prev.ts)) / 1000);
    // Return cached code if still fresh
    if (prev.code) return { pairingCode: prev.code, number: num, cached: true, waitSeconds: wait };
    throw new Error(`⏳ Please wait ${wait}s before requesting a new code.`);
  }

  const existing = activeConnections.get(num);

  // Already fully connected
  if (existing?.connected && !force) {
    return { alreadyConnected: true, number: num };
  }

  // Clean up stale connection
  if (existing) {
    try { existing.conn?.ev?.removeAllListeners(); existing.conn?.ws?.terminate(); } catch {}
    destroyPresenceManager(num);
    activeConnections.delete(num);
    await new Promise(r => setTimeout(r, 800));
  }

  const sessionDir = path.join(SESSIONS_DIR, num);
  if (force && fs.existsSync(sessionDir)) {
    try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
  }
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version }          = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    version,
    logger:                P({ level: 'silent' }),
    printQRInTerminal:     false,
    auth:                  state,
    browser:               Browsers.macOS('Safari'),
    connectTimeoutMs:      35_000,
    keepAliveIntervalMs:   10_000,
    defaultQueryTimeoutMs: 30_000,
    retryRequestDelayMs:   300,
    maxRetries:            3,
    markOnlineOnConnect:   false,
    syncFullHistory:       false,
  });

  activeConnections.set(num, { conn, saveCreds, connected: false, hasWelcomed: false, reconnectAttempts: 0 });
  setupHandlers(conn, num, saveCreds);

  // Wait for WS to be ready
  await new Promise(r => setTimeout(r, 3_500));

  if (!conn.ws || conn.ws.readyState > 1) {
    throw new Error('Connection dropped before code was issued. Please try again.');
  }

  const rawCode = await conn.requestPairingCode(num);
  const code    = (rawCode || '').toString().trim();
  if (!code) throw new Error('Empty pairing code received — please try again.');

  const formatted = code.match(/.{1,4}/g)?.join('-') || code;

  // Cache for rate-limit window
  _pending.set(num, { ts: Date.now(), code: formatted });
  setTimeout(() => _pending.delete(num), RATE_LIMIT_MS);

  return { pairingCode: formatted, number: num };
}

/* ── Status check ────────────────────────────────────────────────────────── */
function getStatus(number) {
  if (!_deps) return { error: 'not_init' };
  const num = (number || '').replace(/\D/g, '');
  const entry   = _deps.activeConnections.get(num);
  const pending = _pending.get(num);
  return {
    number: num,
    connected:  !!entry?.connected,
    pending:    !!pending,
    lastCode:   pending?.code || null,
  };
}

module.exports = { init, requestPair, getStatus };
