/**
 * JUNAID-MD↣³⁰² — Core Utility Functions
 * Owner: JUNAID-MD↣³⁰²
 */

'use strict';

const axios  = require('axios');
const fs     = require('fs');
const path   = require('path');

// ── Buffer from URL ──────────────────────────────────────
async function getBuffer(url, options = {}) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000, ...options });
  return Buffer.from(res.data);
}

// ── Group admins ─────────────────────────────────────────
function getGroupAdmins(participants) {
  return participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id);
}

// ── Random from array ────────────────────────────────────
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Human-readable number ─────────────────────────────────
function h2k(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

// ── URL validator ─────────────────────────────────────────
function isUrl(text) {
  try { new URL(text); return true; } catch { return false; }
}

// ── JSON stringify ────────────────────────────────────────
function Json(obj) {
  return JSON.stringify(obj, null, 2);
}

// ── Runtime string ────────────────────────────────────────
function runtime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(' ');
}

// ── Sleep ─────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Fetch JSON ────────────────────────────────────────────
async function fetchJson(url, options = {}) {
  const res = await axios.get(url, { timeout: 15000, headers: { 'User-Agent': 'REDXBOT302/1.0' }, ...options });
  return res.data;
}

// ── Fetch POST JSON ───────────────────────────────────────
async function fetchPostJson(url, data, options = {}) {
  const res = await axios.post(url, data, { timeout: 15000, headers: { 'User-Agent': 'REDXBOT302/1.0' }, ...options });
  return res.data;
}

// ── Random int between ─────────────────────────────────────
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Format bytes ─────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k    = 1024;
  const sizes = ['B','KB','MB','GB','TB'];
  const i    = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// ── Generate REDXBOT302 message footer ────────────────────
function botFooter() {
  return '\n\n> 🔥 *JUNAID-MD↣³⁰²* By JUNAID-MD↣³⁰²';
}

// ── Check is JID admin ────────────────────────────────────
function isAdminJid(participants, jid) {
  const p = participants.find(x => x.id === jid);
  return p?.admin === 'admin' || p?.admin === 'superadmin';
}

// ── Temp file path ────────────────────────────────────────
function tmpPath(ext = 'tmp') {
  const dir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `redx_${Date.now()}.${ext}`);
}

// ── Clean temp files ─────────────────────────────────────
function cleanTmp() {
  const dir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const fp  = path.join(dir, f);
    const age = Date.now() - fs.statSync(fp).mtimeMs;
    if (age > 10 * 60 * 1000) { // 10 mins
      try { fs.unlinkSync(fp); } catch {}
    }
  }
}
setInterval(cleanTmp, 5 * 60 * 1000);

module.exports = {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson,
  fetchPostJson,
  randomBetween,
  formatBytes,
  botFooter,
  isAdminJid,
  tmpPath,
  cleanTmp,
};
