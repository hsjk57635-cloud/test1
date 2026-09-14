'use strict';
/*****************************************************************************
 *  cat-21-pro.js — JUNAID-MD↣³⁰² PRO Bundle
 *  Developed By JUNAID-MD↣³⁰²
 *
 *  5 Professional Heavy Commands:
 *  1. .mediafire  — download any MediaFire file (cheerio scraper, MEGA-MDX)
 *  2. .ytplaylist — download first N songs from a YouTube playlist
 *  3. .voiceclone — convert text to speech in multiple voices/languages
 *  4. .scrapeweb  — scrape title, description, links, images from any URL
 *  5. .socialbio  — full social media profile lookup across platforms
 *
 *  + extras from MEGA-MDX:
 *  .twitter, .facebook improvements already in cat-04
 *  .mediafire — here
 *****************************************************************************/

const _bundle = [];
const axios  = require('axios');

/* ══════════════════════════════════════════════════════════════════
   1. .mediafire  (MEGA-MDX exact cheerio scraper)
══════════════════════════════════════════════════════════════════ */
async function mediafireScrape(url) {
    const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0' },
        timeout: 20000
    });
    let cheerio;
    try { cheerio = require('cheerio'); } catch { throw new Error('cheerio not installed. Run: npm install cheerio'); }
    const $ = cheerio.load(data);
    const link = $('#downloadButton').attr('href');
    const name = $('div.dl-info > div.promo-text').text().trim() || $('.dl-btn-label').attr('title') || 'file';
    const size = $('#downloadButton').text().replace(/Download|[()]\s*/g, '').trim() || 'Unknown';
    const ext  = name.split('.').pop() || 'bin';
    return { name, size, link, ext };
}

_bundle.push({
    command: 'mediafire', aliases: ['mfire', 'mf', 'mediafiredl'],
    category: 'download', description: 'Download any file from MediaFire',
    usage: '.mediafire <MediaFire URL>',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const url    = args.join(' ').trim();
        if (!url || !url.includes('mediafire.com')) return sock.sendMessage(chatId, {
            text: '❌ Provide a MediaFire URL.\nExample:\n.mfire https://www.mediafire.com/file/abc123/file.zip/file'
        }, { quoted: message });
        try {
            await sock.sendMessage(chatId, { text: '⏳ Parsing MediaFire page...' }, { quoted: message });
            const info = await mediafireScrape(url);
            if (!info?.link) return sock.sendMessage(chatId, { text: '❌ Failed to parse MediaFire page. Link may be private or broken.' }, { quoted: message });

            await sock.sendMessage(chatId, {
                text: `≡ *MEDIAFIRE DOWNLOADER*\n\n` +
                      `▢ *File:* ${info.name}\n` +
                      `▢ *Size:* ${info.size}\n` +
                      `▢ *Type:* .${info.ext}\n\n` +
                      `*Downloading... Please Wait ⌛*`
            }, { quoted: message });

            const { data: fileBuf, headers } = await axios.get(info.link, {
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'Mozilla/5.0', Referer: url },
                timeout: 120000,
                maxContentLength: 100 * 1024 * 1024
            });
            const mime = headers['content-type'] || 'application/octet-stream';
            await sock.sendMessage(chatId, {
                document: Buffer.from(fileBuf),
                fileName: info.name,
                mimetype: mime,
                caption: `✅ *${info.name}* (${info.size})`
            }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(chatId, { text: `❌ MediaFire error: ${e.message}` }, { quoted: message });
        }
    }
});

/* ══════════════════════════════════════════════════════════════════
   2. .ytplaylist — Download first N songs from YouTube playlist
══════════════════════════════════════════════════════════════════ */
_bundle.push({
    command: 'ytplaylist', aliases: ['playlist', 'plsong', 'dlplaylist'],
    category: 'music', description: 'Download first N MP3s from a YouTube playlist',
    usage: '.ytplaylist <playlist URL> [count 1-5]',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const url    = args[0]?.trim();
        const count  = Math.min(parseInt(args[1]) || 3, 5);
        if (!url || !url.includes('list=')) return sock.sendMessage(chatId, {
            text: '🎵 *YouTube Playlist Downloader*\n\nUsage: `.ytplaylist <playlist URL> [count]`\nMax: 5 songs\n\nExample:\n`.ytplaylist https://youtube.com/playlist?list=PLxxx 3`'
        }, { quoted: message });
        try {
            await sock.sendMessage(chatId, { text: `⏳ Fetching playlist, downloading *${count}* song(s)...` }, { quoted: message });
            const yts = require('yt-search');
            const { playlist } = await yts({ listId: url.match(/list=([^&]+)/)?.[1] || '' });
            if (!playlist?.videos?.length) return sock.sendMessage(chatId, { text: '❌ Could not fetch playlist. Check the URL.' }, { quoted: message });

            const videos = playlist.videos.slice(0, count);
            let done = 0;
            for (const v of videos) {
                try {
                    await sock.sendMessage(chatId, { text: `⬇️ [${done+1}/${count}] ${v.title}` });
                    const { data } = await axios.get('https://api.qasimdev.dpdns.org/api/loaderto/download', {
                        params: { apiKey: 'qasim-dev', format: 'mp3', url: v.url }, timeout: 90000
                    });
                    if (data?.data?.downloadUrl) {
                        await sock.sendMessage(chatId, {
                            audio: { url: data.data.downloadUrl }, mimetype: 'audio/mpeg',
                            fileName: `${v.title || 'song'}.mp3`, ptt: false
                        }, { quoted: message });
                        done++;
                    }
                    await new Promise(r => setTimeout(r, 2000));
                } catch (e) {
                    await sock.sendMessage(chatId, { text: `⚠️ Skipped: ${v.title} — ${e.message}` });
                }
            }
            await sock.sendMessage(chatId, { text: `✅ Done! Downloaded *${done}/${count}* songs.` }, { quoted: message });
        } catch (e) {
            await sock.sendMessage(chatId, { text: `❌ Playlist error: ${e.message}` }, { quoted: message });
        }
    }
});

/* ══════════════════════════════════════════════════════════════════
   3. .tts — REMOVED (duplicate).
   ✅ FIX: three plugins registered .tts (this one, cat-15-media tts.js,
   and sound2's 'tts' alias). The last file loaded won, so .tts was the
   raw-MP3 version with dead fallbacks → unplayable audio. The single
   canonical .tts now lives in cat-15-media (gtts → StreamElements →
   Google REST, converted to ogg/opus so WhatsApp actually plays it).
══════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════
   4. .scrapeweb — Deep web scraper: title, meta, links, images
══════════════════════════════════════════════════════════════════ */
_bundle.push({
    command: 'scrapeweb', aliases: ['scrape', 'webscrape', 'urlinfo', 'siteinfo'],
    category: 'tools', description: 'Deep scrape any URL — title, description, links, images, metadata',
    usage: '.scrapeweb <URL>',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const url    = args[0]?.trim();
        if (!url || !/^https?:\/\//i.test(url)) return sock.sendMessage(chatId, {
            text: '🌐 *Web Scraper*\n\nUsage: `.scrapeweb <URL>`\nExample: `.scrapeweb https://example.com`'
        }, { quoted: message });
        try {
            await sock.sendMessage(chatId, { text: '🔍 Scraping...' }, { quoted: message });
            let cheerio;
            try { cheerio = require('cheerio'); } catch { throw new Error('cheerio not installed. Run: npm install cheerio'); }

            const { data, headers, status } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JUNAID-MD↣³⁰²/1.0; +https://t.me/TeamRedxhacker2)' },
                timeout: 20000, maxContentLength: 5 * 1024 * 1024
            });

            const $ = cheerio.load(data);
            const title       = $('title').text().trim().slice(0,200) || '(none)';
            const description = $('meta[name="description"]').attr('content')?.slice(0,300)
                             || $('meta[property="og:description"]').attr('content')?.slice(0,300) || '(none)';
            const ogImage     = $('meta[property="og:image"]').attr('content') || '';
            const keywords    = $('meta[name="keywords"]').attr('content')?.slice(0,200) || '(none)';
            const author      = $('meta[name="author"]').attr('content') || '(none)';
            const contentType = headers['content-type'] || '?';
            const server      = headers['server'] || '?';

            const links    = []; $('a[href]').each((_, el) => { const h = $(el).attr('href'); if (h?.startsWith('http')) links.push(h); });
            const imgSrcs  = []; $('img[src]').each((_, el) => { const s = $(el).attr('src'); if (s?.startsWith('http')) imgSrcs.push(s); });
            const h1s      = []; $('h1').each((_, el) => h1s.push($(el).text().trim().slice(0,80)));
            const wordCount = $('body').text().replace(/\s+/g,' ').trim().split(' ').length;

            let report =
                `🌐 *Web Scrape Report*\n━━━━━━━━━━━━━━━━━━━\n\n` +
                `🔗 *URL:* ${url}\n` +
                `📊 *Status:* ${status}\n` +
                `🖥️ *Server:* ${server}\n` +
                `📄 *Content-Type:* ${contentType}\n\n` +
                `📌 *Title:*\n${title}\n\n` +
                `📝 *Description:*\n${description}\n\n` +
                `🔑 *Keywords:* ${keywords}\n` +
                `👤 *Author:* ${author}\n\n` +
                `📊 *Stats:*\n` +
                `• Links found: ${links.length}\n` +
                `• Images found: ${imgSrcs.length}\n` +
                `• Word count: ~${wordCount}\n`;

            if (h1s.length) report += `\n🏷️ *H1 Headers:*\n${h1s.slice(0,5).map(h=>`• ${h}`).join('\n')}\n`;
            if (links.length) report += `\n🔗 *Sample Links:*\n${links.slice(0,5).map(l=>`• ${l}`).join('\n')}\n`;
            if (imgSrcs.length) report += `\n🖼️ *Sample Images:*\n${imgSrcs.slice(0,3).map(i=>`• ${i}`).join('\n')}`;

            if (ogImage) {
                await sock.sendMessage(chatId, { image: { url: ogImage }, caption: report.slice(0, 1024) }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { text: report }, { quoted: message });
            }
        } catch (e) {
            await sock.sendMessage(chatId, { text: `❌ Scrape failed: ${e.message}` }, { quoted: message });
        }
    }
});

/* ══════════════════════════════════════════════════════════════════
   5. .socialbio — Social media profile lookup across platforms
══════════════════════════════════════════════════════════════════ */
_bundle.push({
    command: 'socialbio', aliases: ['social', 'profilelookup', 'userlookup', 'whois'],
    category: 'info', description: 'Look up social media profiles by username across platforms',
    usage: '.socialbio <username>',
    async handler(sock, message, args, context = {}) {
        const chatId  = context.chatId || message.key.remoteJid;
        const username = args[0]?.replace('@','').trim();
        if (!username) return sock.sendMessage(chatId, {
            text: '👤 *Social Profile Lookup*\n\nUsage: `.socialbio <username>`\nExample: `.socialbio elonmusk`\n\nChecks: Twitter/X, Instagram, GitHub, TikTok, YouTube, LinkedIn, Reddit, Snapchat, Pinterest, Telegram'
        }, { quoted: message });

        await sock.sendMessage(chatId, { text: `🔍 Looking up *@${username}* across platforms...` }, { quoted: message });

        const platforms = [
            { name: 'Twitter/X',  url: `https://x.com/${username}`,              check: 'x.com' },
            { name: 'Instagram',  url: `https://instagram.com/${username}`,       check: 'instagram.com' },
            { name: 'GitHub',     url: `https://github.com/${username}`,          check: 'github.com', api: `https://api.github.com/users/${username}` },
            { name: 'TikTok',     url: `https://tiktok.com/@${username}`,         check: 'tiktok.com' },
            { name: 'YouTube',    url: `https://youtube.com/@${username}`,        check: 'youtube.com' },
            { name: 'Reddit',     url: `https://reddit.com/user/${username}`,     check: 'reddit.com', api: `https://www.reddit.com/user/${username}/about.json` },
            { name: 'Snapchat',   url: `https://snapchat.com/add/${username}`,    check: 'snapchat.com' },
            { name: 'Pinterest',  url: `https://pinterest.com/${username}`,       check: 'pinterest.com' },
            { name: 'Telegram',   url: `https://t.me/${username}`,                check: 't.me' },
            { name: 'LinkedIn',   url: `https://linkedin.com/in/${username}`,     check: 'linkedin.com' },
        ];

        const results = [];
        let githubData = null, redditData = null;

        await Promise.allSettled(platforms.map(async (p) => {
            try {
                // Try API first if available
                if (p.api) {
                    const headers = p.name === 'GitHub' ? { 'User-Agent': 'JUNAID-MD↣³⁰²' } : {};
                    const { data, status } = await axios.get(p.api, { timeout: 8000, headers });
                    if (status === 200) {
                        results.push({ name: p.name, url: p.url, found: true });
                        if (p.name === 'GitHub') githubData = data;
                        if (p.name === 'Reddit') redditData = data?.data;
                        return;
                    }
                }
                // HEAD check
                const { status } = await axios.head(p.url, {
                    timeout: 8000,
                    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
                    maxRedirects: 3
                });
                results.push({ name: p.name, url: p.url, found: status < 400 });
            } catch {
                results.push({ name: p.name, url: p.url, found: false });
            }
        }));

        const found    = results.filter(r => r.found);
        const notFound = results.filter(r => !r.found);

        let report =
            `👤 *Social Bio — @${username}*\n━━━━━━━━━━━━━━━━━━━\n\n` +
            `✅ *Found on ${found.length}/${platforms.length} platforms:*\n` +
            found.map(r => `• *${r.name}:* ${r.url}`).join('\n');

        if (notFound.length) report += `\n\n❌ *Not found:* ${notFound.map(r=>r.name).join(', ')}`;

        // GitHub enrichment
        if (githubData) {
            report +=
                `\n\n🐙 *GitHub Profile:*\n` +
                `• Name: ${githubData.name || '?'}\n` +
                `• Bio: ${githubData.bio?.slice(0,150) || 'N/A'}\n` +
                `• Repos: ${githubData.public_repos}\n` +
                `• Followers: ${githubData.followers}\n` +
                `• Following: ${githubData.following}\n` +
                (githubData.location ? `• Location: ${githubData.location}\n` : '') +
                (githubData.blog ? `• Website: ${githubData.blog}\n` : '');
        }

        // Reddit enrichment
        if (redditData) {
            report +=
                `\n\n🤖 *Reddit Profile:*\n` +
                `• Karma: ${redditData.link_karma + redditData.comment_karma}\n` +
                `• Created: ${new Date(redditData.created_utc * 1000).toDateString()}\n` +
                `• Verified: ${redditData.verified ? 'Yes' : 'No'}`;
        }

        const avatarUrl = githubData?.avatar_url;
        if (avatarUrl) {
            await sock.sendMessage(chatId, { image: { url: avatarUrl }, caption: report }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: report }, { quoted: message });
        }
    }
});

/* ─── Register ────────────────────────────────────────────────────────────── */
for (const m of _bundle) {
    try {
        const ch = require('../lib/commandHandler');
        if (m.command) ch.registerCommand(m.command, m);
        if (m.aliases) m.aliases.forEach(a => { try { ch.registerCommand(a, m); } catch {} });
    } catch {}
}
module.exports = _bundle;
