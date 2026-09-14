/*****************************************************************************
 *  AUTO-UPDATE SYSTEM — JUNAID-MD↣³⁰² (INTERNAL — DO NOT EXPOSE)              *
 *  Checks GitHub for new plugin versions and patches them silently.        *
 *  Triggered on startup and by .update command (owner only).               *
 *                                                                           *
 *  © 2026 JUNAID-MD↣³⁰². All rights reserved.                       *
 *****************************************************************************/

'use strict';

const fs      = require('fs');
const path    = require('path');
const https   = require('https');
const crypto  = require('crypto');

// ── CONFIG (hidden — never sent to client) ────────────────────────────────
const UPDATE_REPO_OWNER = 'JUNAID-MD↣³⁰²';
const UPDATE_REPO_NAME  = 'JUNAID-MD↣³⁰²_beckend';
const UPDATE_BRANCH     = 'main';
const UPDATE_PATHS      = ['plugins', 'lib'];           // folders to sync
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;          // check every 6 h
const MANIFEST_URL      = `https://raw.githubusercontent.com/${UPDATE_REPO_OWNER}/${UPDATE_REPO_NAME}/${UPDATE_BRANCH}/update-manifest.json`;

let _interval = null;
let _lastCheck = null;
let _lastResult = { status: 'never_checked', ts: null };

/* ── HTTP GET helper ─────────────────────────────────────────────────────── */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'JUNAID-MD↣³⁰²-autoupdate/1.0' } }, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return httpsGet(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

/* ── SHA256 of a file ────────────────────────────────────────────────────── */
function fileHash(fpath) {
  try {
    return crypto.createHash('sha256').update(fs.readFileSync(fpath)).digest('hex');
  } catch { return null; }
}

/* ── Fetch & apply one file update ──────────────────────────────────────── */
async function applyFile(baseDir, relPath, rawUrl) {
  try {
    const dest = path.join(baseDir, relPath);
    const { status, body } = await httpsGet(rawUrl);
    if (status !== 200 || !body) return false;

    // Don't overwrite if identical
    const incoming = crypto.createHash('sha256').update(body).digest('hex');
    if (fileHash(dest) === incoming) return false; // already up to date

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, body, 'utf8');

    // Hot-reload: flush require cache so the new code takes effect
    try { delete require.cache[require.resolve(dest)]; } catch {}
    console.log(`[UPDATE] ✅ Applied: ${relPath}`);
    return true;
  } catch (e) {
    console.error(`[UPDATE] ❌ Failed ${relPath}: ${e.message}`);
    return false;
  }
}

/* ── Main update check ───────────────────────────────────────────────────── */
async function checkForUpdates(baseDir) {
  try {
    _lastCheck = new Date().toISOString();
    console.log('[UPDATE] 🔍 Checking for updates…');

    const { status, body } = await httpsGet(MANIFEST_URL);
    if (status !== 200) {
      _lastResult = { status: 'manifest_unavailable', ts: _lastCheck };
      return _lastResult;
    }

    let manifest;
    try { manifest = JSON.parse(body); } catch {
      _lastResult = { status: 'bad_manifest', ts: _lastCheck };
      return _lastResult;
    }

    const files   = manifest.files || [];
    let updated   = 0;

    for (const entry of files) {
      const rawUrl = `https://raw.githubusercontent.com/${UPDATE_REPO_OWNER}/${UPDATE_REPO_NAME}/${UPDATE_BRANCH}/${entry.path}`;
      const changed = await applyFile(baseDir, entry.path, rawUrl);
      if (changed) updated++;
    }

    _lastResult = { status: updated ? `updated_${updated}_files` : 'up_to_date', ts: _lastCheck, updated };
    console.log(`[UPDATE] 🏁 Done — ${updated} file(s) updated`);
    return _lastResult;

  } catch (e) {
    _lastResult = { status: 'error', error: e.message, ts: _lastCheck };
    console.error('[UPDATE] ❌', e.message);
    return _lastResult;
  }
}

/* ── Start background scheduler ─────────────────────────────────────────── */
function startAutoUpdater(baseDir) {
  if (_interval) return; // already running
  // Run once on startup (delayed by 30 s so bot can connect first)
  setTimeout(() => checkForUpdates(baseDir).catch(() => {}), 30_000);
  // Then run every CHECK_INTERVAL_MS
  _interval = setInterval(() => checkForUpdates(baseDir).catch(() => {}), CHECK_INTERVAL_MS);
  console.log('[UPDATE] 🚀 Auto-updater started (checks every 6 h)');
}

function stopAutoUpdater() {
  if (_interval) { clearInterval(_interval); _interval = null; }
}

function getLastResult() { return _lastResult; }

module.exports = { checkForUpdates, startAutoUpdater, stopAutoUpdater, getLastResult };
