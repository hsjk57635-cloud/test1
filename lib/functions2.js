'use strict';
const fs = require('fs');
const pathModule = require('path');  // renamed to avoid conflict
const axios = require('axios');
const FormData = require('form-data');

// Upload file to empire CDN
async function empiretourl(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('originalFileName', filePath.split('/').pop());
  const response = await axios.post('https://cdn.empiretech.biz.id/api/upload.php', form, {
    headers: form.getHeaders(), maxContentLength: Infinity, maxBodyLength: Infinity,
  });
  return response.data;
}

// Fetch a buffer from a URL
async function getBuffer(url, options = {}) {
  try {
    const res = await axios({ method: 'get', url, headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1 }, ...options, responseType: 'arraybuffer' });
    return res.data;
  } catch (e) { console.error(e); return null; }
}

// Download media buffer from Baileys message
async function downloadMedia(message, type) {
  try {
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const m = message.message || {};
    const quoted = m.extendedTextMessage?.contextInfo?.quotedMessage;
    const media = m[`${type}Message`] || quoted?.[`${type}Message`];
    if (!media) return null;
    const stream = await downloadContentFromMessage(media, type);
    const chunks = [];
    for await (const c of stream) chunks.push(c);
    return Buffer.concat(chunks);
  } catch { return null; }
}

// Convert URL to base64
async function urlToBase64(url) {
  try {
    const buf = await getBuffer(url);
    if (!buf) return null;
    return Buffer.from(buf).toString('base64');
  } catch { return null; }
}

// Shorten URL
async function shortenUrl(url) {
  const clean = /^https?:\/\//i.test(String(url || '')) ? String(url) : `https://${String(url || '')}`;
  const providers = [
    `https://tinyurl.com/api-create.php?url=${encodeURIComponent(clean)}`,
    `https://is.gd/create.php?format=simple&url=${encodeURIComponent(clean)}`,
    `https://da.gd/s?url=${encodeURIComponent(clean)}`
  ];
  for (const endpoint of providers) {
    try {
      const res = await axios.get(endpoint, { timeout: 12000, headers: { 'User-Agent': 'JUNAID-MD/7.0' } });
      const out = String(res.data || '').trim();
      if (/^https?:\/\//i.test(out)) return out;
    } catch (_) {}
  }
  return clean;
}

// Translate text
async function translate(text, to = 'en') {
  try {
    const res = await axios.get(`https://api.siputzx.my.id/api/tools/translate?text=${encodeURIComponent(text)}&to=${to}`, { timeout: 10000 });
    return res.data?.result || text;
  } catch { return text; }
}

// Wikipedia summary
async function wikiSummary(query) {
  try {
    const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, { timeout: 10000 });
    return res.data?.extract || 'Not found.';
  } catch { return 'Wikipedia unavailable.'; }
}

// Random quote
async function randomQuote() {
  try {
    const res = await axios.get('https://api.quotable.io/random', { timeout: 8000 });
    return `"${res.data.content}" — ${res.data.author}`;
  } catch { return '"The only way to do great work is to love what you do." — Steve Jobs'; }
}

// Weather info
async function getWeather(city) {
  try {
    const res = await axios.get(`https://api.siputzx.my.id/api/tools/weather?city=${encodeURIComponent(city)}`, { timeout: 10000 });
    return res.data?.data || res.data;
  } catch { return null; }
}

// Get group admins
const getGroupAdmins = (participants) => {
  const admins = [];
  for (let p of participants) { if (p.admin !== null) admins.push(p.id); }
  return admins;
};

// Random string with extension
const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

// Format large numbers
const h2k = (n) => {
  const lyrik = ['', 'K', 'M', 'B', 'T'];
  const ma = Math.floor(Math.log10(Math.abs(n || 1)) / 3);
  if (ma === 0) return String(n);
  return (n / Math.pow(10, ma * 3)).toFixed(1).replace(/\.0$/, '') + lyrik[ma];
};

// Is URL check
const isUrl = (url) => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/.test(url);

// JSON stringify
const Json = (obj) => JSON.stringify(obj, null, 2);

// Runtime string
const runtime = (seconds) => {
  seconds = Math.floor(seconds);
  const d = Math.floor(seconds / 86400), h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(' ');
};

// Sleep
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Fetch JSON GET
const fetchJson = async (url, options = {}) => {
  try {
    const res = await axios({ method: 'GET', url, headers: { 'User-Agent': 'Mozilla/5.0 REDXBOT302/5.0' }, ...options });
    return res.data;
  } catch (err) { console.error(err.message); return null; }
};

// Fetch JSON POST
const fetchPostJson = async (url, data, options = {}) => {
  try {
    const res = await axios.post(url, data, { headers: { 'User-Agent': 'REDXBOT302/5.0' }, timeout: 15000, ...options });
    return res.data;
  } catch (err) { console.error(err.message); return null; }
};

// Save config to .env file
const saveConfig = (key, value) => {
  const cfgPath = pathModule.join(process.cwd(), 'config.env');
  let lines = fs.existsSync(cfgPath) ? fs.readFileSync(cfgPath, 'utf8').split('\n') : [];
  let found = false;
  lines = lines.map(l => { if (l.startsWith(`${key}=`)) { found = true; return `${key}=${value}`; } return l; });
  if (!found) lines.push(`${key}=${value}`);
  fs.writeFileSync(cfgPath, lines.join('\n'), 'utf8');
};

module.exports = {
  empiretourl, getBuffer, downloadMedia, urlToBase64, shortenUrl,
  translate, wikiSummary, randomQuote, getWeather,
  getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep,
  fetchJson, fetchPostJson, saveConfig,
};
