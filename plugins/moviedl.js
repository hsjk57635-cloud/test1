'use strict';
// .movie — THE single movie command, powered by the JUNAID-MD↣³⁰² API.
// Search → pick number → pick quality → download. Numbered replies are
// wired centrally through lib/selectionHandler (see index.js).
const axios = require('axios');
const { registerHandler } = require('../lib/selectionHandler');

// ✅ Endpoint fallbacks: try each in order until one responds.
const SEARCH_ENDPOINTS = [
  'https://arslan-apis-v2.vercel.app/movie/moviesearch',
  'https://api.arslanxd.com/movie/moviesearch',
];
const DL_ENDPOINTS = [
  'https://arslan-apis-v2.vercel.app/movie/moviesdl',
  'https://api.arslanxd.com/movie/moviesdl',
];
const TTL_MS = 5 * 60 * 1000;

// key: `${chatId}:${senderId}` -> { stage, items|item|downloads, query, expiresAt }
const pending = new Map();
function cleanExpired() {
  const now = Date.now();
  for (const [k, v] of pending) if (v.expiresAt < now) pending.delete(k);
}
function parseSize(s) {
  const m = /([\d.]+)\s*(mb|gb)/i.exec(s || '');
  if (!m) return 0;
  let n = parseFloat(m[1]);
  if (/gb/i.test(m[2])) n *= 1024;
  return n;
}
async function tryEndpoints(endpoints, params) {
  let lastErr = null;
  for (const url of endpoints) {
    try {
      const { data } = await axios.get(url, { params, timeout: 35000 });
      if (data && data.status !== false) return data;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Movie API unreachable');
}
function cleanName(s) { return (s || '').replace(/[\\/:*?"<>|]/g, '').slice(0, 80); }

registerHandler({
  name: 'movie-select',
  async check(sock, message, context, number) {
    cleanExpired();
    const chatId   = context.chatId || message.key.remoteJid;
    const senderId = message.key.participant || message.key.remoteJid;
    const key      = `${chatId}:${senderId}`;
    const state    = pending.get(key);
    if (!state) return false;
    if (number < 1 || number > (state.items?.length || state.downloads?.length || 0)) return false;

    // ── STAGE 1: movie chosen → fetch download links, show quality options ──
    if (state.stage === 'list') {
      const item = state.items[number - 1];
      pending.set(key, { ...state, stage: 'dl', item, expiresAt: Date.now() + TTL_MS });
      await sock.sendMessage(chatId, { text: `⏳ Fetching download links for *${item.title}*...` }, { quoted: message });
      try {
        const data = await tryEndpoints(DL_ENDPOINTS, { url: item.url });
        const r = data?.result || {};
        const downloads = r.downloads || [];
        if (!downloads.length) {
          pending.delete(key);
          return sock.sendMessage(chatId, { text: `❌ No download links found for *${item.title}*.` }, { quoted: message });
        }
        if (downloads.length === 1) {
          pending.delete(key);
          const best = downloads[0];
          return sock.sendMessage(chatId, {
            document: { url: best.url },
            mimetype: 'video/mp4',
            fileName: `${cleanName(r.movieName || item.title)}.mp4`,
            caption: `🎬 *${r.movieName || item.title}*\n⭐ ${r.rating || 'N/A'} | 📅 ${r.releaseDate || 'N/A'}\n📦 ${best.size || 'Unknown size'}`,
          }, { quoted: message });
        }
        pending.set(key, { ...state, stage: 'dl2', downloads, movieName: r.movieName || item.title, rating: r.rating, releaseDate: r.releaseDate, expiresAt: Date.now() + TTL_MS });
        const list = downloads.map((d, i) => `*${i + 1}.* ${d.quality || 'Auto'} — ${d.size || '?'}`).join('\n');
        return sock.sendMessage(chatId, {
          text: `🎬 *${r.movieName || item.title}*\n⭐ ${r.rating || 'N/A'} | 📅 ${r.releaseDate || 'N/A'}\n\n*Choose quality:*\n${list}\n\n👉 Reply with a number (1-${downloads.length})`,
        }, { quoted: message });
      } catch (e) {
        pending.delete(key);
        return sock.sendMessage(chatId, { text: `❌ Failed to fetch download links: ${e.message}` }, { quoted: message });
      }
    }

    // ── STAGE 2: quality chosen → send the file ──
    if (state.stage === 'dl2') {
      const d = state.downloads[number - 1];
      pending.delete(key);
      await sock.sendMessage(chatId, { text: `⏳ Sending *${state.movieName}* (${d.size || 'unknown size'})...` }, { quoted: message });
      return sock.sendMessage(chatId, {
        document: { url: d.url },
        mimetype: 'video/mp4',
        fileName: `${cleanName(state.movieName)}.mp4`,
        caption: `🎬 *${state.movieName}*\n⭐ ${state.rating || 'N/A'} | 📅 ${state.releaseDate || 'N/A'}\n📦 ${d.size || 'Unknown size'}`,
      }, { quoted: message });
    }
    return false;
  },
});

module.exports = {
  command: 'movie',
  aliases: ['moviedl', 'film', 'movies'],   // ✅ single movie command — old ones removed
  category: 'download',
  description: 'Search movies and download (Arslan MD API) — pick a number',
  usage: '.movie <movie name>',

  async handler(sock, message, args, context = {}) {
    const chatId   = context.chatId || message.key.remoteJid;
    const senderId = message.key.participant || message.key.remoteJid;
    const query    = args.join(' ').trim();
    if (!query) return sock.sendMessage(chatId, { text: '🎬 *Movie Downloader*\n\nUsage: .movie <movie name>\n\nExample: .movie avengers endgame' }, { quoted: message });

    await sock.sendMessage(chatId, { text: `🔎 Searching *${query}*...` }, { quoted: message });
    try {
      const data = await tryEndpoints(SEARCH_ENDPOINTS, { q: query });
      const results = data?.result || [];
      if (!Array.isArray(results) || !results.length) {
        return sock.sendMessage(chatId, { text: '❌ No movies found for that search. Try a different title.' }, { quoted: message });
      }

      const items = results.slice(0, 9);
      cleanExpired();
      pending.set(`${chatId}:${senderId}`, { stage: 'list', items, query, expiresAt: Date.now() + TTL_MS });

      const list = items.map((m, i) => `*${i + 1}.* ${m.title}`).join('\n\n');
      const caption = `🎬 *Results for "${query}"*\n\n${list}\n\n👉 Reply with a number (1-${items.length}) to choose.\n⏱️ Expires in 5 min.`;
      const poster = items.find(m => m.poster)?.poster;
      if (poster) {
        try { return await sock.sendMessage(chatId, { image: { url: poster }, caption }, { quoted: message }); } catch {}
      }
      return sock.sendMessage(chatId, { text: caption }, { quoted: message });
    } catch (e) {
      return sock.sendMessage(chatId, { text: `❌ Search failed: ${e.message}` }, { quoted: message });
    }
  },
};
