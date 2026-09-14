'use strict';
// Shared "download from anything" client — https://jawad-tech.vercel.app/downloader
// Used as a shared fallback/primary across facebook/instagram/tiktok/twitter
// plugins since the old per-platform scraper APIs kept going dead (404 /
// ENOTFOUND). Response schema for a *populated* result isn't documented
// anywhere public, so this parses defensively across the field names these
// APIs commonly use rather than assuming one exact shape.
const axios = require('axios');

async function jawadDownload(url) {
  const api = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(url)}`;
  const { data } = await axios.get(api, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!data || data.status === false) throw new Error(data?.message || 'jawad-tech API returned no result');

  let items = data.result;
  if (items == null) items = [];
  if (!Array.isArray(items)) items = [items];

  const media = [];
  const pull = (obj) => {
    if (!obj) return null;
    if (typeof obj === 'string') return obj;
    return obj.url || obj.link || obj.downloadUrl || obj.download_url || obj.videoUrl
        || obj.hd || obj.sd || obj.high || obj.play || obj.download || null;
  };
  for (const it of items) {
    const link = pull(it);
    if (!link) continue;
    const type = (it && it.type) || (/\.(mp4|mov|m4v)(\?|$)/i.test(link) ? 'video'
      : /\.(jpg|jpeg|png|webp)(\?|$)/i.test(link) ? 'image' : undefined);
    media.push({ url: link, type, title: it?.title || it?.caption || '' });
  }
  if (!media.length && data.metadata) {
    const link = pull(data.metadata);
    if (link) media.push({ url: link });
  }
  if (!media.length) throw new Error('No downloadable media in response (link may be private, expired, or unsupported on this API).');
  return { platform: data.platform, media, raw: data };
}

module.exports = { jawadDownload };
