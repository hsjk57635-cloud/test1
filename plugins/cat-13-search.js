'use strict';
// AUTO-GENERATED BUNDLE: cat-13-search
// Contains: wikipedia.js, weather.js, news.js, news2.js, imdb.js, pokedex.js, genshin.js, animes.js, anime.js, anisearch.js, gsearch.js, bing.js, jobstreet.js, booksearch.js, trends.js, medicine.js, quran.js, prayer.js, npm.js, npmstalk.js, pinterest.js, snapchat.js
// NOTE: movie.js (duplicate TMDB 'movie' command) removed — .movie now lives only in plugins/moviedl.js (Arslan MD API). imdb.js kept as .imdb only (no more 'movie'/'film' alias clash).

const _bundle = [];


/* ===== wikipedia.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

module.exports = {
  command: 'wiki',
  aliases: ['wikipedia'],
  category: 'search',
  description: 'Search Wikipedia for a topic!',
  usage: '.wiki <query>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(' ').trim();

    if (!query) {
      return await sock.sendMessage(chatId, {
        text: "*Enter what you want to search for on Wikipedia.*\nExample: .wiki Pakistan",
        ...channelInfo
      }, { quoted: message });
    }

    const formattedQuery = query.replace(/ /g, "_");

    try {
      const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formattedQuery)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MEGA-BOT/1.0',
          'Accept-Language': 'en'
        }
      });

      const data = res.data;

      if (data.extract) {
        await sock.sendMessage(chatId, {
          text: `▢ *Wikipedia*\n\n‣ Search: ${data.title}\n\n${data.extract}\n\nRead more: ${data.content_urls.desktop.page}`,
          ...channelInfo
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, {
          text: "⚠️ No results found.",
          ...channelInfo
        }, { quoted: message });
      }
    } catch (e) {
      console.error('Wikipedia plugin error:', e.message || e);
      await sock.sendMessage(chatId, {
        text: "⚠️ No results found or Wikipedia blocked the request.",
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading wikipedia.js:', e.message); }

/* ===== weather.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

module.exports = {
  command: 'weather',
  aliases: ['forecast', 'climate'],
  category: 'info',
  description: 'Get the current weather for a specific city!',
  usage: '.weather <city>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const city = args.join(' ').trim();

    if (!city) {
      return await sock.sendMessage(chatId, {
        text: "*Please provide a place to search.*\nExample: .weather Karachi",
        ...channelInfo
      }, { quoted: message });
    }

    try {
      const apiKey = '060a6bcfa19809c2cd4d97a212b19273';
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`);
      const weather = response.data;

      const weatherText = 
        `ʜᴇʀᴇ ɪs ʏᴏᴜʀ ᴘʟᴀᴄᴇ ᴡᴇᴀᴛʜᴇʀ\n\n` +
        `「 🌅 」ᴘʟᴀᴄᴇ: ${weather.name}\n` +
        `「 🗺️ 」ᴄᴏᴜɴᴛʀʏ: ${weather.sys.country}\n` +
        `「 🌤️ 」ᴠɪᴇᴡ: ${weather.weather[0].description}\n` +
        `「 🌡️ 」ᴛᴇᴍᴘᴇʀᴀᴛᴜʀᴇ: ${weather.main.temp}°C\n` +
        `「 💠 」ᴍɪɴɪᴍᴜᴍ ᴛᴇᴍᴘᴇʀᴀᴛᴜʀᴇ: ${weather.main.temp_min}°C\n` +
        `「 🔥 」ᴍᴀxɪᴍᴜᴍ ᴛᴇᴍᴘᴇʀᴀᴛᴜʀᴇ: ${weather.main.temp_max}°C\n` +
        `「 💦 」ʜᴜᴍɪᴅɪᴛʏ: ${weather.main.humidity}%\n` +
        `「 🌬️ 」ᴡɪɴᴅ sᴘᴇᴇᴅ: ${weather.wind.speed} km/h`;

      await sock.sendMessage(chatId, {
        text: weatherText,
        ...channelInfo
      }, { quoted: message });

    } catch (error) {
      console.error('Weather plugin error:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Sorry, I could not fetch the weather. Make sure the place name is correct.',
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading weather.js:', e.message); }

/* ===== news.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'news',
  aliases: ['headlines', 'latestnews'],
  category: 'info',
  description: 'Get the latest top 5 news headlines from the US',
  usage: '.news',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const apiKey = 'dcd720a6f1914e2d9dba9790c188c08c';
      const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
      if (!response.data || !response.data.articles) throw 'Invalid API response';
      const articles = response.data.articles.slice(0, 5);
      if (articles.length === 0) {
        await sock.sendMessage(chatId, {
          text: '❌ No news found at the moment. Please try again later.',
          quoted: message
        });
        return;
      }
      let newsMessage = '📰 *Latest News*:\n\n';
      articles.forEach((article, index) => {
        newsMessage += `${index + 1}. *${article.title}*\n${article.description || 'No description'}\n\n`;
      });
      await sock.sendMessage(chatId, {
        text: newsMessage.trim(),
        quoted: message
      });
    } catch (error) {
      console.error('News Command Error:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Sorry, I could not fetch news right now. Please try again later.',
        quoted: message
      });
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading news.js:', e.message); }

/* ===== news2.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/news2.js
const axios = require('axios');

function formatNews(data, source) {
  let text = `📰 *${source} News* ──────────\n\n`;
  data.slice(0, 5).forEach((item, i) => {
    text += `${i+1}. *${item.title}*\n   🔗 ${item.link}\n\n`;
  });
  return text;
}

module.exports = [
  {
    command: 'antara',
    aliases: ['newsid2'],
    category: 'news2',
    description: 'Latest news from Antara (Indonesia)',
    usage: '.antara',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      try {
        const { data } = await axios.get('https://api.deline.web.id/berita/antara', { timeout: 10000 });
        if (!data.status) throw new Error('No news');
        const text = formatNews(data.data, 'ANTARA');
        await sock.sendMessage(chatId, { text }, { quoted: message });
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed to fetch news: ${err.message}` }, { quoted: message });
      }
    }
  },
  {
    command: 'cnbc',
    aliases: ['cnbcnews'],
    category: 'news',
    description: 'Latest news from CNBC Indonesia',
    usage: '.cnbc',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      try {
        const { data } = await axios.get('https://api.deline.web.id/berita/cnbc', { timeout: 10000 });
        if (!data.status) throw new Error('No news');
        const text = formatNews(data.data, 'CNBC Indonesia');
        await sock.sendMessage(chatId, { text }, { quoted: message });
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed to fetch news: ${err.message}` }, { quoted: message });
      }
    }
  }
];

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading news2.js:', e.message); }

/* ===== imdb.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
  command: 'imdb',
  aliases: [],
  category: 'info',
  description: 'Get detailed information about a movie or series from IMDB',
  usage: '.imdb <movie/series title>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(' ').trim();

    if (!text) {
      await sock.sendMessage(chatId, { 
        text: '*Please provide a movie or series title.*\nExample: `.imdb Inception`', 
        quoted: message 
      });
      return;
    }
    try {
      const res = await fetch(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(text)}`);
      if (!res.ok) throw new Error(`API request failed with status ${res.status}`);
      const json = await res.json();
      const ratings = (json.ratings || [])
        .map(r => `⭐ *${r.source}:* ${r.value}`)
        .join('\n') || 'No ratings available';

      const movieInfo = `
🎬 *${json.title || 'N/A'}* (${json.year || 'N/A'})
🎭 *Genres:* ${json.genres || 'N/A'}
📺 *Type:* ${json.type || 'N/A'}
📝 *Plot:* ${json.plot || 'N/A'}
⭐ *IMDB Rating:* ${json.rating || 'N/A'} (${json.votes || 'N/A'} votes)
🏆 *Awards:* ${json.awards || 'N/A'}
🎬 *Director:* ${json.director || 'N/A'}
✍️ *Writer:* ${json.writer || 'N/A'}
👨‍👩‍👧‍👦 *Actors:* ${json.actors || 'N/A'}
⏱️ *Runtime:* ${json.runtime || 'N/A'}
📅 *Released:* ${json.released || 'N/A'}
🌐 *Country:* ${json.country || 'N/A'}
🗣️ *Languages:* ${json.languages || 'N/A'}
💰 *Box Office:* ${json.boxoffice || 'N/A'}
💽 *DVD Release:* ${json.dvd || 'N/A'}
🏢 *Production:* ${json.production || 'N/A'}
🔗 *Website:* ${json.website || 'N/A'}

*Ratings:*
${ratings}
      `.trim();
      if (json.poster) {
        await sock.sendMessage(chatId, { 
          image: { url: json.poster }, 
          caption: movieInfo, 
          quoted: message 
        });
      } else {
        await sock.sendMessage(chatId, { text: movieInfo, quoted: message });
      }
    } catch (error) {
      console.error('IMDB Command Error:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ Failed to fetch movie information. Please try again later.', 
        quoted: message 
      });
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading imdb.js:', e.message); }

/* ===== pokedex.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
  command: 'pokedex',
  aliases: ['pokemon', 'poke'],
  category: 'info',
  description: 'Get information about a Pokémon',
  usage: '.pokedex <pokemon name>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(' ').trim();
    if (!text) {
      return await sock.sendMessage(chatId, {
        text: '*Please provide a Pokémon name to search for.*\nExample: `.pokedex pikachu`'
      }, { quoted: message });
    }

    try {
      const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw json.error || 'Unknown error';

      const messageText = `
*≡ Name:* ${json.name}
*≡ ID:* ${json.id}
*≡ Type:* ${Array.isArray(json.type) ? json.type.join(', ') : json.type}
*≡ Abilities:* ${Array.isArray(json.abilities) ? json.abilities.join(', ') : json.abilities}
*≡ Species:* ${Array.isArray(json.species) ? json.species.join(', ') : json.species}
*≡ Height:* ${json.height}
*≡ Weight:* ${json.weight}
*≡ Experience:* ${json.base_experience}
*≡ Description:* ${json.description}
      `.trim();
      await sock.sendMessage(chatId, { text: messageText, quoted: message });
    } catch (error) {
      console.error('Pokedex Command Error:', error);
      await sock.sendMessage(chatId, { text: `❌ Error: ${error}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading pokedex.js:', e.message); }

/* ===== genshin.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

// Utility to decode Unicode escapes
function decodeUnicode(str) {
  if (!str) return 'N/A';
  return str.replace(/\\u[\dA-F]{4}/gi, match =>
    String.fromCharCode(parseInt(match.replace("\\u", ""), 16))
  );
}

module.exports = {
  command: 'genshin',
  aliases: ['gh', 'uid'],
  category: 'stalk',
  description: 'Stalk Genshin Impact UID',
  usage: '.genshin <UID>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: '*Please provide a Genshin UID.*\nExample: .genshin 826401293'
      }, { quoted: message });
    }
    const uid = args[0];
    try {
      const { data } = await axios.get(`https://discardapi.dpdns.org/api/stalk/genshin`, {
        params: { apikey: 'guru', text: uid }
      });

      if (!data?.result) {
        return await sock.sendMessage(chatId, { text: '❌ UID not found or invalid.' }, { quoted: message });
      }

      const result = data.result;
      const caption = `🎮 *Genshin UID Info*\n\n` +
                      `👤 Nickname: ${result.nickname || 'N/A'}\n` +
                      `🆔 UID: ${result.uid || 'N/A'}\n` +
                      `🏆 Achievements: ${result.achivement || 'N/A'}\n` +
                      `⚡ Level: ${result.level || 'N/A'}\n` +
                      `🌌 World Level: ${result.world_level || 'N/A'}\n` +
                      `🌀 Spiral Abyss: ${decodeUnicode(result.spiral_abyss)}\n` +
                      `💳 Card ID: ${result.card_id || 'N/A'}`;

      await sock.sendMessage(chatId, { image: { url: result.image }, caption: caption }, { quoted: message });

    } catch (err) {
      console.error('Genshin plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch UID info.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading genshin.js:', e.message); }

/* ===== animes.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

const supportedAnimes = [
  'akira','akiyama','anna','asuna','ayuzawa','boruto','chiho','chitoge',
  'deidara','erza','elaina','eba','emilia','hestia','hinata','inori',
  'isuzu','itachi','itori','kaga','kagura','kaori','keneki','kotori',
  'kurumi','madara','mikasa','miku','minato','naruto','nezuko','sagiri',
  'sasuke','sakura'
];

function pickRandom(arr, count = 1) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const animuMenu =
'🎀 *Animes Menu* 🎀\n\n' +
'• *akira*\n' +
'• *akiyama*\n' +
'• *anna*\n' +
'• *asuna*\n' +
'• *ayuzawa*\n' +
'• *boruto*\n' +
'• *chiho*\n' +
'• *chitoge*\n' +
'• *deidara*\n' +
'• *erza*\n' +
'• *elaina*\n' +
'• *eba*\n' +
'• *emilia*\n' +
'• *hestia*\n' +
'• *hinata*\n' +
'• *inori*\n' +
'• *isuzu*\n' +
'• *itachi*\n' +
'• *itori*\n' +
'• *kaga*\n' +
'• *kagura*\n' +
'• *kaori*\n' +
'• *keneki*\n' +
'• *kotori*\n' +
'• *kurumi*\n' +
'• *madara*\n' +
'• *mikasa*\n' +
'• *miku*\n' +
'• *minato*\n' +
'• *naruto*\n' +
'• *nezuko*\n' +
'• *sagiri*\n' +
'• *sasuke*\n' +
'• *sakura*\n\n' +
'📌 *Usage:*\n' +
'.animes <name>\n' +
'Example: *.animes naruto*';

module.exports = {
  command: 'animes',
  aliases: ['animeimg', 'animepic'],
  category: 'menu',
  description: 'Send random anime images',
  usage: '.animes <anime_name>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const input = args[0] ? args[0] : '';
    const typeLower = input.toLowerCase();

    if (!input || !supportedAnimes.includes(typeLower)) {
      const replyText = input && !supportedAnimes.includes(typeLower)
        ? `Unsupported anime: ${typeLower}\n\n`
        : '';
      return await sock.sendMessage(chatId, { text: replyText + animuMenu }, { quoted: message });
    }

    try {
      const apiUrl = `https://raw.githubusercontent.com/Guru322/api/Guru/BOT-JSON/anime-${typeLower}.json`;
      const res = await axios.get(apiUrl, { timeout: 15000, validateStatus: s => s < 500 });
      const images = res.data;
      if (!Array.isArray(images) || images.length === 0) throw new Error('No images found');
      const randomImages = pickRandom(images, Math.min(3, images.length));

      for (const img of randomImages) {
        try {
          const imageData = await axios.get(img, { responseType: 'arraybuffer', timeout: 15000 });
          await sock.sendMessage(chatId, { image: Buffer.from(imageData.data), caption: `_${typeLower}_` }, { quoted: message });
        } catch {}
      }

    } catch (err) {
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch anime images. Please try again later.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading animes.js:', e.message); }

/* ===== anime.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');

const ANIMU_BASE = 'https://api.some-random-api.com/animu';

function normalizeType(input) {
  const lower = (input || '').toLowerCase();
  if (lower === 'facepalm' || lower === 'face_palm') return 'face-palm';
  if (lower === 'quote' || lower === 'animu-quote' || lower === 'animuquote') return 'quote';
  return lower;
}

async function convertMediaToSticker(mediaBuffer, isAnimated) {
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const inputExt = isAnimated ? 'gif' : 'jpg';
  const input = path.join(tmpDir, `animu_${Date.now()}.${inputExt}`);
  const output = path.join(tmpDir, `animu_${Date.now()}.webp`);
  fs.writeFileSync(input, mediaBuffer);

  const ffmpegCmd = isAnimated
    ? `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=15" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 60 -compression_level 6 "${output}"`
    : `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${output}"`;

  await new Promise((resolve, reject) => {
    exec(ffmpegCmd, (err) => (err ? reject(err) : resolve()));
  });

  let webpBuffer = fs.readFileSync(output);
  const img = new webp.Image();
  await img.load(webpBuffer);

  const json = {
    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
    'sticker-pack-name': 'Anime Stickers',
    'emojis': ['🎌']
  };
  const exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  img.exif = exif;

  const finalBuffer = await img.save(null);

  try { fs.unlinkSync(input); } catch {}
  try { fs.unlinkSync(output); } catch {}
  return finalBuffer;
}

async function sendAnimu(sock, chatId, message, type) {
  try {
    const res = await axios.get(`${ANIMU_BASE}/${type}`);
    const data = res.data || {};

    if (data.link) {
      const link = data.link;
      const lower = link.toLowerCase();
      const isGif = lower.endsWith('.gif');
      const isImage = lower.match(/\.(jpg|jpeg|png|webp)$/);

      if (isGif || isImage) {
        const resp = await axios.get(link, { responseType: 'arraybuffer', timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const stickerBuf = await convertMediaToSticker(Buffer.from(resp.data), isGif);
        return await sock.sendMessage(chatId, { sticker: stickerBuf }, { quoted: message });
      }

      return await sock.sendMessage(chatId, { image: { url: link }, caption: `anime: ${type}` }, { quoted: message });
    }

    if (data.quote) {
      return await sock.sendMessage(chatId, { text: data.quote }, { quoted: message });
    }

    return await sock.sendMessage(chatId, { text: '❌ Failed to fetch animu.' }, { quoted: message });

  } catch (err) {
    console.error('Error sending animu:', err);
    await sock.sendMessage(chatId, { text: '❌ An error occurred while fetching animu.' }, { quoted: message });
  }
}

module.exports = {
  command: 'animu',
  aliases: ['anime'],
  category: 'menu',
  description: 'Send anime stickers or quotes',
  usage: '.animu <type>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const subArg = args && args[0] ? args[0] : '';
    const type = normalizeType(subArg);

    const supported = ['nom', 'poke', 'cry', 'kiss', 'pat', 'hug', 'wink', 'face-palm', 'quote'];

    try {
      if (!type) {
        try {
          const res = await axios.get(ANIMU_BASE);
          const apiTypes = res.data?.types?.map(s => s.replace('/animu/', '')) || supported;
          return await sock.sendMessage(chatId, { text: `Usage: .animu <type>\nTypes: ${apiTypes.join(', ')}` }, { quoted: message });
        } catch {
          return await sock.sendMessage(chatId, { text: `Usage: .animu <type>\nTypes: ${supported.join(', ')}` }, { quoted: message });
        }
      }

      if (!supported.includes(type)) {
        return await sock.sendMessage(chatId, { text: `❌ Unsupported type: ${type}. Try one of: ${supported.join(', ')}` }, { quoted: message });
      }

      await sendAnimu(sock, chatId, message, type);

    } catch (err) {
      console.error('Error in animu handler:', err);
      await sock.sendMessage(chatId, { text: '❌ An error occurred while fetching animu.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading anime.js:', e.message); }

/* ===== anisearch.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *    ANISEARCH v1.0 — Anime Search · Sliding Carousel · Jikan v4 API        *
 *                                                                           *
 *****************************************************************************/

'use strict';

const axios = require('axios');
const { generateWAMessageFromContent, generateWAMessageContent } = require('@whiskeysockets/baileys');

/* ─── config ────────────────────────────────────────────────────────────── */
const JIKAN_BASE = 'https://api.jikan.moe/v4';
const MAL_LINK   = 'https://myanimelist.net/anime/';

/* ─── fetch anime ───────────────────────────────────────────────────────── */
async function searchAnime(query) {
    const res = await axios.get(`${JIKAN_BASE}/anime`, {
        params: { q: query, limit: 10, sfw: true, order_by: 'score', sort: 'desc' },
        timeout: 10000
    });
    return (res.data?.data || []).filter(a => a.images?.jpg?.large_image_url);
}

/* ─── helpers ───────────────────────────────────────────────────────────── */
function starRating(score) {
    if (!score) return '☆☆☆☆☆';
    const stars = Math.round((score / 10) * 5);
    return '⭐'.repeat(Math.max(0, stars)) + '☆'.repeat(Math.max(0, 5 - stars));
}

function formatStatus(status) {
    const map = {
        'Finished Airing':   '✅ Finished',
        'Currently Airing':  '📡 Airing',
        'Not yet aired':     '🔜 Upcoming'
    };
    return map[status] || status || 'N/A';
}

function trimSynopsis(text, max = 150) {
    if (!text) return 'No synopsis available.';
    return text.length > max ? text.substring(0, max).trimEnd() + '…' : text;
}

/* ─── build carousel ────────────────────────────────────────────────────── */
async function buildAnimeCarousel(sock, chatId, animes, query) {
    const cards = [];

    for (const anime of animes.slice(0, 8)) {
        try {
            const posterUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
            const imgContent = await generateWAMessageContent(
                { image: { url: posterUrl } },
                { upload: sock.waUploadToServer }
            );
            if (!imgContent?.imageMessage) continue;

            const score      = anime.score || 0;
            const episodes   = anime.episodes ? `${anime.episodes} eps` : '? eps';
            const genres     = (anime.genres || []).slice(0, 3).map(g => g.name).join(' · ') || 'N/A';
            const year       = anime.year || anime.aired?.from?.split('-')[0] || 'N/A';
            const type       = anime.type || 'N/A';
            const malId      = anime.mal_id;

            cards.push({
                header: {
                    title:              `${anime.title}`.substring(0, 60),
                    hasMediaAttachment: true,
                    imageMessage:       imgContent.imageMessage
                },
                body: {
                    text: `${starRating(score)} ${score}/10\n` +
                          `📺 ${type} · ${episodes} · ${year}\n` +
                          `${formatStatus(anime.status)}\n` +
                          `🎭 ${genres}\n\n` +
                          trimSynopsis(anime.synopsis)
                },
                footer: { text: '🌸 JUNAID-MD↣³⁰² Anime Search' },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name:             'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '🔗 View on MAL',
                                url:          `${MAL_LINK}${malId}`,
                                merchant_url: `${MAL_LINK}${malId}`
                            })
                        }
                    ]
                }
            });
        } catch { continue; }
    }

    if (!cards.length) throw new Error('No cards built');

    const msg = generateWAMessageFromContent(chatId, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body:            { text: `🌸 *Anime Search:* ${query}\n✨ ${cards.length} results found` },
                    footer:          { text: 'Swipe ◀️▶️ • Powered by Jikan/MAL' },
                    carouselMessage: { cards }
                }
            }
        }
    }, {});

    await sock.relayMessage(chatId, msg.message, { messageId: msg.key.id });
    return cards.length;
}

/* ─── fallback text list ─────────────────────────────────────────────────── */
async function sendFallbackList(sock, chatId, animes, query, message) {
    const lines = animes.slice(0, 6).map((a, i) =>
        `${i + 1}. *${a.title}* (${a.year || 'N/A'})\n` +
        `   ⭐ ${a.score || '?'}/10 · ${a.type || 'N/A'} · ${a.episodes || '?'} eps\n` +
        `   ${trimSynopsis(a.synopsis, 80)}\n` +
        `   🔗 ${MAL_LINK}${a.mal_id}`
    ).join('\n\n');

    await sock.sendMessage(chatId, {
        text: `🌸 *Anime Search: "${query}"*\n\n${lines}\n\n_Powered by Jikan · MyAnimeList_`
    }, { quoted: message });
}

/* ─── command export ────────────────────────────────────────────────────── */
module.exports = {
    command:     'anisearch',
    aliases:     ['anime', 'anim', 'animes', 'mal'],
    category:    'search',
    description: 'Search anime with sliding carousel (Jikan/MAL, no API key needed)',
    usage:       '.anisearch <title>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const query  = args.join(' ').trim();

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `*🌸 ANIME SEARCH v1.0*\n\n` +
                      `Usage: \`.anisearch <title>\`\n\n` +
                      `Examples:\n` +
                      `• \`.anisearch Naruto\`\n` +
                      `• \`.anisearch Attack on Titan\`\n` +
                      `• \`.anisearch Death Note\`\n` +
                      `• \`.anisearch One Piece\`\n\n` +
                      `_No API key needed — powered by Jikan/MyAnimeList_`
            }, { quoted: message });
        }

        const react = (e) => sock.sendMessage(chatId, { react: { text: e, key: message.key } }).catch(() => {});
        await react('🔍');

        const waitMsg = await sock.sendMessage(chatId,
            { text: `🌸 Searching anime for *"${query}"*…` }, { quoted: message });

        try {
            const animes = await searchAnime(query);

            if (!animes.length) {
                await react('❌');
                await sock.sendMessage(chatId, { delete: waitMsg.key }).catch(() => {});
                return sock.sendMessage(chatId,
                    { text: `❌ No anime found for *"${query}"*` }, { quoted: message });
            }

            try {
                await buildAnimeCarousel(sock, chatId, animes, query);
                await react('✅');
            } catch {
                await sendFallbackList(sock, chatId, animes, query, message);
                await react('✅');
            }

            await sock.sendMessage(chatId, { delete: waitMsg.key }).catch(() => {});

        } catch (e) {
            await react('❌');
            console.error('[ANISEARCH] error:', e.message);
            await sock.sendMessage(chatId, { delete: waitMsg.key }).catch(() => {});
            await sock.sendMessage(chatId,
                { text: `❌ Anime search failed: ${e.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading anisearch.js:', e.message); }

/* ===== gsearch.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *    GSEARCH v1.0 — Image Search · Sliding Carousel · Pexels API            *
 *                                                                           *
 *****************************************************************************/

'use strict';

const axios = require('axios');
const { generateWAMessageFromContent, generateWAMessageContent } = require('@whiskeysockets/baileys');

/* ─── API config ───────────────────────────────────────────────────────── */
const PEXELS_KEY     = process.env.PEXELS_KEY || '';
const PIXABAY_KEY    = process.env.PIXABAY_KEY || '';
const RESULTS_COUNT  = 8;

/* ─── fetch images from Pexels ─────────────────────────────────────────── */
async function fetchPexels(query) {
    const res = await axios.get('https://api.pexels.com/v1/search', {
        params: { query, per_page: RESULTS_COUNT, orientation: 'landscape' },
        headers: { Authorization: PEXELS_KEY },
        timeout: 8000
    });
    return (res.data?.photos || []).map(p => ({
        title:       p.alt || query,
        imageUrl:    p.src?.large || p.src?.original,
        thumb:       p.src?.medium,
        photographer: p.photographer,
        link:        p.url,
        width:       p.width,
        height:      p.height
    })).filter(p => p.imageUrl);
}

/* ─── fetch images from Pixabay (fallback) ─────────────────────────────── */
async function fetchPixabay(query) {
    const res = await axios.get('https://pixabay.com/api/', {
        params: { key: PIXABAY_KEY, q: query, per_page: RESULTS_COUNT,
                  image_type: 'photo', safesearch: 'true' },
        timeout: 8000
    });
    return (res.data?.hits || []).map(p => ({
        title:        p.tags?.split(',')[0]?.trim() || query,
        imageUrl:     p.webformatURL,
        thumb:        p.previewURL,
        photographer: p.user,
        link:         p.pageURL,
        width:        p.webformatWidth,
        height:       p.webformatHeight
    })).filter(p => p.imageUrl);
}

/* ─── build carousel ────────────────────────────────────────────────────── */
async function buildCarousel(sock, chatId, photos, query) {
    const cards = [];

    for (const photo of photos.slice(0, 8)) {
        try {
            const imageContent = await generateWAMessageContent(
                { image: { url: photo.imageUrl } },
                { upload: sock.waUploadToServer }
            );
            if (!imageContent?.imageMessage) continue;

            cards.push({
                header: {
                    title:              photo.title.substring(0, 60),
                    hasMediaAttachment: true,
                    imageMessage:       imageContent.imageMessage
                },
                body: {
                    text: `📸 By: ${photo.photographer || 'Unknown'}\n` +
                          `📐 ${photo.width}×${photo.height}`
                },
                footer: { text: '🖼 JUNAID-MD↣³⁰² Image Search' },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name:             'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '🔗 Open Full',
                                url:          photo.link,
                                merchant_url: photo.link
                            })
                        }
                    ]
                }
            });
        } catch { continue; }
    }

    if (!cards.length) throw new Error('No cards built');

    const msg = generateWAMessageFromContent(chatId, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body:            { text: `🔍 *Image Search:* ${query}\n📦 ${cards.length} results` },
                    footer:          { text: 'Swipe ◀️▶️ • JUNAID-MD↣³⁰²' },
                    carouselMessage: { cards }
                }
            }
        }
    }, {});

    await sock.relayMessage(chatId, msg.message, { messageId: msg.key.id });
    return cards.length;
}

/* ─── fallback: send as album ───────────────────────────────────────────── */
async function sendFallbackAlbum(sock, chatId, photos, message) {
    for (const photo of photos.slice(0, 5)) {
        await sock.sendMessage(chatId, {
            image:   { url: photo.imageUrl },
            caption: `*${photo.title}*\nBy: ${photo.photographer || 'Unknown'}\n${photo.link}`
        }, { quoted: message }).catch(() => {});
    }
}

/* ─── command export ────────────────────────────────────────────────────── */
module.exports = {
    command:     'gsearch',
    aliases:     ['imgsearch', 'imgs', 'pexels', 'pixabay', 'gimage'],
    category:    'search',
    description: 'Search images with sliding carousel (Pexels / Pixabay)',
    usage:       '.gsearch <query>',

    async handler(sock, message, args, context = {}) {
        const chatId    = context.chatId || message.key.remoteJid;
        const query     = args.join(' ').trim();

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `*🖼 IMAGE SEARCH v1.0*\n\n` +
                      `Usage: \`.gsearch <query>\`\n\n` +
                      `Examples:\n` +
                      `• \`.gsearch sunset beach\`\n` +
                      `• \`.gsearch mountain landscape 4k\`\n` +
                      `• \`.gsearch cute cats\`\n\n` +
                      `*API:* ${PEXELS_KEY ? '✅ Pexels' : PIXABAY_KEY ? '✅ Pixabay' : '❌ No API key set!'}\n` +
                      `Set \`PEXELS_KEY\` or \`PIXABAY_KEY\` in .env`
            }, { quoted: message });
        }

        if (!PEXELS_KEY && !PIXABAY_KEY) {
            return sock.sendMessage(chatId, {
                text: `❌ *No API key configured!*\n\n` +
                      `Add to .env:\n\`PEXELS_KEY=your_key\`\nOR\n\`PIXABAY_KEY=your_key\`\n\n` +
                      `Get free keys:\n• https://www.pexels.com/api/\n• https://pixabay.com/api/docs/`
            }, { quoted: message });
        }

        const react  = (emoji) => sock.sendMessage(chatId, { react: { text: emoji, key: message.key } }).catch(() => {});
        await react('🔍');

        const waitMsg = await sock.sendMessage(chatId, {
            text: `🔍 Searching images for *"${query}"*…`
        }, { quoted: message });

        try {
            let photos = [];

            if (PEXELS_KEY) {
                photos = await fetchPexels(query);
            }
            if (!photos.length && PIXABAY_KEY) {
                photos = await fetchPixabay(query);
            }

            if (!photos.length) {
                await react('❌');
                return sock.sendMessage(chatId, {
                    text: `❌ No images found for *"${query}"*\nTry different keywords.`
                }, { quoted: message });
            }

            try {
                const count = await buildCarousel(sock, chatId, photos, query);
                await react('✅');
                await sock.sendMessage(chatId, { delete: waitMsg.key }).catch(() => {});
            } catch {
                /* carousel failed → fallback album */
                await sendFallbackAlbum(sock, chatId, photos, message);
                await react('✅');
                await sock.sendMessage(chatId, { delete: waitMsg.key }).catch(() => {});
            }

        } catch (e) {
            await react('❌');
            console.error('[GSEARCH] error:', e.message);
            await sock.sendMessage(chatId, {
                text: `❌ Image search failed: ${e.message}`
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading gsearch.js:', e.message); }

/* ===== bing.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'bing',
  aliases: ['bingsearch'],
  category: 'search',
  description: 'Search something on Bing',
  usage: '.bing <query>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args?.join(' ')?.trim();
    if (!query) {
      return await sock.sendMessage(chatId, { text: '*Please provide something to search.*\nExample: .bing Pakistan' }, { quoted: message });
    }

    try {
      const url = `https://discardapi.dpdns.org/api/search/bing?apikey=guru&query=${encodeURIComponent(query)}`;
      const response = await axios.get(url);
      const data = response.data;

      if (!data?.status || !data?.result?.status || !Array.isArray(data.result.results.results) || data.result.results.results.length === 0) {
        return await sock.sendMessage(chatId, { text: '❌ No search results found.' }, { quoted: message });
      }
      const results = data.result.results.results.slice(0, 5);
      const text =
        `🔍 *Bing Search Results*\n\n` +
        results
          .map(
            (r, i) =>
              `「 ${i + 1} 」 *${r.title}*\n${r.description}\n🔗 ${r.url}`
          )
          .join('\n\n');

      await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch (error) {
      console.error('Bing plugin error:', error);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch Bing search results.' }, { quoted: message });
    }}
};


    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading bing.js:', e.message); }

/* ===== jobstreet.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
    command: 'jobstreet',
    aliases: ['jobs'],
    category: 'search',
    description: 'Search jobs on JobStreet',
    usage: '.jobstreet <job title> [city]',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        let city = 'Jakarta';
        let query = args.join(' ');
        if (args.length > 1 && args[args.length-1].match(/^[A-Z]/)) {
            city = args.pop();
            query = args.join(' ');
        }
        if (!query) return sock.sendMessage(chatId, { text: 'Provide job title.' }, { quoted: message });
        const statusMsg = await sock.sendMessage(chatId, { text: '⏳ Searching jobs...' }, { quoted: message });
        try {
            const { data } = await axios.get(`https://api.deline.web.id/search/jobstreet?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`, { timeout: 20000 });
            if (!data.status || !data.result.length) throw new Error('No jobs found');
            let reply = `💼 *JobStreet: ${query} in ${city}*\n━━━━━━━━━━━━━━━━━━━\n`;
            data.result.slice(0, 5).forEach((job, i) => {
                reply += `\n${i+1}. *${job.judul}*\n🏢 ${job.perusahaan}\n📍 ${job.lokasi}\n💰 ${job.gaji}\n🔗 ${job.link}\n`;
            });
            await sock.sendMessage(chatId, { text: reply, ...channelInfo }, { quoted: message });
            await sock.sendMessage(chatId, { delete: statusMsg.key });
        } catch (err) {
            await sock.sendMessage(chatId, { text: `❌ ${err.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading jobstreet.js:', e.message); }

/* ===== booksearch.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *    BOOKSEARCH v1.0 — Book Search · Sliding Carousel · Google Books API    *
 *                                                                           *
 *****************************************************************************/

'use strict';

const axios = require('axios');
const { generateWAMessageFromContent, generateWAMessageContent } = require('@whiskeysockets/baileys');

/* ─── config ────────────────────────────────────────────────────────────── */
const GBOOKS_BASE  = 'https://www.googleapis.com/books/v1/volumes';
const GBOOKS_KEY   = process.env.GBOOKS_KEY || '';           // optional; increases quota
const PLACEHOLDER  = 'https://via.placeholder.com/400x600/1a1a2e/ffffff?text=📚+BOOK';

/* ─── fetch books ───────────────────────────────────────────────────────── */
async function searchBooks(query, maxResults = 10) {
    const params = {
        q:          query,
        maxResults,
        printType:  'books',
        langRestrict: 'en',
        orderBy:    'relevance'
    };
    if (GBOOKS_KEY) params.key = GBOOKS_KEY;

    const res = await axios.get(GBOOKS_BASE, { params, timeout: 8000 });
    return (res.data?.items || []).map(item => {
        const info = item.volumeInfo || {};
        const sale = item.saleInfo  || {};
        return {
            id:          item.id,
            title:       info.title     || 'Unknown Title',
            authors:     (info.authors  || ['Unknown']).join(', '),
            publisher:   info.publisher || '',
            publishedAt: info.publishedDate || '',
            description: info.description  || '',
            categories:  (info.categories  || []).slice(0, 2).join(' · '),
            pages:       info.pageCount   || null,
            rating:      info.averageRating  || null,
            ratingCount: info.ratingsCount   || 0,
            language:    (info.language || 'en').toUpperCase(),
            imageUrl:    info.imageLinks?.thumbnail?.replace('http:', 'https:') ||
                         info.imageLinks?.smallThumbnail?.replace('http:', 'https:') ||
                         PLACEHOLDER,
            previewLink: info.previewLink || `https://books.google.com/books?id=${item.id}`,
            infoLink:    info.infoLink    || `https://books.google.com/books?id=${item.id}`,
            buyLink:     sale.buyLink     || null,
            price:       sale.listPrice   || null,
            maturity:    info.maturityRating || ''
        };
    });
}

/* ─── helpers ───────────────────────────────────────────────────────────── */
function starRating(score, max = 5) {
    if (!score) return '☆☆☆☆☆';
    const stars = Math.round(score);
    return '⭐'.repeat(Math.min(stars, 5)) + '☆'.repeat(Math.max(0, 5 - stars));
}

function trimDesc(text, max = 150) {
    if (!text) return 'No description available.';
    const clean = text.replace(/<[^>]*>/g, '');   // strip any HTML tags
    return clean.length > max ? clean.substring(0, max).trimEnd() + '…' : clean;
}

function fmtYear(date) {
    return date?.substring(0, 4) || 'N/A';
}

/* ─── build carousel ────────────────────────────────────────────────────── */
async function buildBookCarousel(sock, chatId, books, query) {
    const cards = [];

    for (const book of books.slice(0, 8)) {
        try {
            const imgContent = await generateWAMessageContent(
                { image: { url: book.imageUrl } },
                { upload: sock.waUploadToServer }
            );
            if (!imgContent?.imageMessage) continue;

            const ratingLine = book.rating
                ? `${starRating(book.rating)} ${book.rating}/5 (${book.ratingCount} reviews)\n`
                : '';
            const pagesLine  = book.pages   ? `📄 ${book.pages} pages · ` : '';
            const catLine    = book.categories ? `🏷️ ${book.categories}\n` : '';
            const priceStr   = book.price
                ? `💰 ${book.price.currencyCode} ${book.price.amount}`
                : 'Price: N/A';

            const bodyText =
                `✍️ ${book.authors}\n` +
                (book.publisher ? `🏢 ${book.publisher} · ` : '') +
                `📅 ${fmtYear(book.publishedAt)}\n` +
                ratingLine +
                `${pagesLine}🌐 ${book.language}\n` +
                catLine +
                `\n${trimDesc(book.description)}`;

            const btns = [
                {
                    name:             'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📖 Preview Book',
                        url:          book.previewLink,
                        merchant_url: book.previewLink
                    })
                }
            ];

            if (book.buyLink) {
                btns.push({
                    name:             'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: `🛒 Buy (${priceStr})`,
                        url:          book.buyLink,
                        merchant_url: book.buyLink
                    })
                });
            }

            cards.push({
                header: {
                    title:              book.title.substring(0, 60),
                    hasMediaAttachment: true,
                    imageMessage:       imgContent.imageMessage
                },
                body:   { text: bodyText },
                footer: { text: '📚 JUNAID-MD↣³⁰² Book Search' },
                nativeFlowMessage: { buttons: btns }
            });
        } catch { continue; }
    }

    if (!cards.length) throw new Error('No cards built');

    const msg = generateWAMessageFromContent(chatId, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body:            { text: `📚 *Book Search:* ${query}\n📖 ${cards.length} books found` },
                    footer:          { text: 'Swipe ◀️▶️ • Powered by Google Books' },
                    carouselMessage: { cards }
                }
            }
        }
    }, {});

    await sock.relayMessage(chatId, msg.message, { messageId: msg.key.id });
    return cards.length;
}

/* ─── fallback text list ────────────────────────────────────────────────── */
async function sendFallbackList(sock, chatId, books, query, message) {
    const lines = books.slice(0, 6).map((b, i) =>
        `${i + 1}. *${b.title}* (${fmtYear(b.publishedAt)})\n` +
        `   ✍️ ${b.authors}\n` +
        `   ${b.rating ? `⭐${b.rating}/5 · ` : ''}${b.pages ? `📄${b.pages}pp · ` : ''}${b.language}\n` +
        `   ${trimDesc(b.description, 80)}\n` +
        `   🔗 ${b.previewLink}`
    ).join('\n\n');

    await sock.sendMessage(chatId, {
        text: `📚 *Books: "${query}"*\n\n${lines}\n\n_Powered by Google Books_`
    }, { quoted: message });
}

/* ─── command export ────────────────────────────────────────────────────── */
module.exports = {
    command:     'booksearch',
    aliases:     ['book', 'books', 'gbooks', 'readbook'],
    category:    'search',
    description: 'Search books with sliding carousel (Google Books, no API key needed)',
    usage:       '.booksearch <title or author>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const query  = args.join(' ').trim();

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `*📚 BOOK SEARCH v1.0*\n\n` +
                      `Usage: \`.booksearch <title or author>\`\n\n` +
                      `Examples:\n` +
                      `• \`.booksearch Atomic Habits\`\n` +
                      `• \`.booksearch author:Malcolm Gladwell\`\n` +
                      `• \`.booksearch Python programming\`\n` +
                      `• \`.booksearch Harry Potter\`\n\n` +
                      `_No API key needed — powered by Google Books_\n` +
                      `_Optional: Set \`GBOOKS_KEY\` for higher quota_`
            }, { quoted: message });
        }

        const react = (e) => sock.sendMessage(chatId, { react: { text: e, key: message.key } }).catch(() => {});
        await react('📚');

        const waitMsg = await sock.sendMessage(chatId,
            { text: `📚 Searching books for *"${query}"*…` }, { quoted: message });

        try {
            const books = await searchBooks(query);

            if (!books.length) {
                await react('❌');
                await sock.sendMessage(chatId, { delete: waitMsg.key }).catch(() => {});
                return sock.sendMessage(chatId,
                    { text: `❌ No books found for *"${query}"*` }, { quoted: message });
            }

            try {
                await buildBookCarousel(sock, chatId, books, query);
                await react('✅');
            } catch {
                await sendFallbackList(sock, chatId, books, query, message);
                await react('✅');
            }

            await sock.sendMessage(chatId, { delete: waitMsg.key }).catch(() => {});

        } catch (e) {
            await react('❌');
            console.error('[BOOKSEARCH] error:', e.message);
            await sock.sendMessage(chatId, { delete: waitMsg.key }).catch(() => {});
            await sock.sendMessage(chatId,
                { text: `❌ Book search failed: ${e.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading booksearch.js:', e.message); }

/* ===== trends.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const Qasim = require('api-qasim');

module.exports = {
  command: 'trends',
  aliases: ['trend', 'trending'],
  category: 'info',
  description: 'Get trending topics from a country.',
  usage: '.trends <country-name>',
  
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const country = args.join(' ').trim();

      if (!country) {
        await sock.sendMessage(chatId, {
          text: '*Please provide a country name.*\nExample: .trends Pakistan or .trends South-Africa'
        }, { quoted: message });
        return;
      }

      const result = await Qasim.trendtwit(country);

      if (!result) {
        throw new Error('No data received');
      }

      let output = `*Trending topics in ${country}:*\n\n`;

      if (typeof result === 'string') {
        output += result;
      } else if (result.result && Array.isArray(result.result) && result.result.length) {
        result.result.forEach((trend, i) => {
          if (trend.hastag && trend.tweet) {
            output += `${i + 1}. ${trend.hastag} - ${trend.tweet}\n`;
          }
        });
      } else {
        throw new Error('No trending data found');
      }

      await sock.sendMessage(chatId, {
        text: output
      }, { quoted: message });

    } catch (error) {
      console.error('Error in trendsCommand:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to fetch trending topics. Please try again later.'
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading trends.js:', e.message); }

/* ===== medicine.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

module.exports = {
    command: 'medicine',
    aliases: ['drug', 'medinfo', 'druginfo', 'med'],
    category: 'info',
    description: 'Get medicine/drug info: uses, side effects, warnings',
    usage: '.medicine aspirin\n.medicine paracetamol',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const query = args.join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: `💊 *Medicine Info*\n\n` +
                      `*Usage:* \`.medicine <name>\`\n\n` +
                      `*Examples:*\n` +
                      `• \`.medicine aspirin\`\n` +
                      `• \`.medicine paracetamol\`\n` +
                      `• \`.medicine amoxicillin\`\n` +
                      `• \`.medicine ibuprofen\`\n` +
                      `• \`.medicine metformin\`\n\n` +
                      `⚠️ _Information is from FDA database. Always consult a doctor._`,
                ...channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { text: `🔍 Looking up *${query}*...`, ...channelInfo }, { quoted: message });

        try {
            const res = await axios.get(
                `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(query)}&limit=1`,
                { timeout: 15000 }
            );

            const result = res.data.results?.[0];
            if (!result) {
                return await sock.sendMessage(chatId, {
                    text: `❌ No information found for: *${query}*\n\nTry the generic name (e.g. paracetamol instead of Panadol)`,
                    ...channelInfo
                }, { quoted: message });
            }

            const openfda = result.openfda || {};
            const brandName = openfda.brand_name?.[0] || query;
            const genericName = openfda.generic_name?.[0] || 'N/A';
            const manufacturer = openfda.manufacturer_name?.[0] || 'N/A';
            const route = openfda.route?.[0] || 'N/A';
            const substanceName = openfda.substance_name?.[0] || 'N/A';

            const clean = (text, maxLen = 400) => {
                if (!text) return 'N/A';
                const str = Array.isArray(text) ? text[0] : text;
                const cleaned = str.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
                return cleaned.length > maxLen ? cleaned.substring(0, maxLen) + '...' : cleaned;
            };

            const purpose     = clean(result.purpose, 300);
            const indications = clean(result.indications_and_usage, 400);
            const warnings    = clean(result.warnings, 400);
            const sideEffects = clean(result.adverse_reactions, 400);
            const dosage      = clean(result.dosage_and_administration, 300);
            const storage     = clean(result.storage_and_handling, 200);

            let text = `💊 *${brandName}*\n`;
            if (genericName !== 'N/A') text += `_(${genericName})_\n`;
            text += `\n`;
            if (substanceName !== 'N/A') text += `🧪 *Active Substance:* ${substanceName}\n`;
            text += `🏭 *Manufacturer:* ${manufacturer}\n`;
            text += `💉 *Route:* ${route}\n\n`;
            if (purpose !== 'N/A') text += `🎯 *Purpose:*\n${purpose}\n\n`;
            if (indications !== 'N/A') text += `✅ *Uses:*\n${indications}\n\n`;
            if (dosage !== 'N/A') text += `📏 *Dosage:*\n${dosage}\n\n`;
            if (warnings !== 'N/A') text += `⚠️ *Warnings:*\n${warnings}\n\n`;
            if (sideEffects !== 'N/A') text += `🔴 *Side Effects:*\n${sideEffects}\n\n`;
            if (storage !== 'N/A') text += `📦 *Storage:* ${storage}\n\n`;
            text += `⚕️ _Always consult a qualified doctor before taking any medication._`;

            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        } catch (error) {
            if (error.response?.status === 404) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Medicine not found: *${query}*\n\nTry using the generic/scientific name.`,
                    ...channelInfo
                }, { quoted: message });
            }
            await sock.sendMessage(chatId, {
                text: `❌ Failed: ${error.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading medicine.js:', e.message); }

/* ===== quran.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

const BASE = 'https://api.alquran.cloud/v1';

const SURAH_NAMES = {
    1: 'Al-Fatihah', 2: 'Al-Baqarah', 3: 'Ali Imran', 4: 'An-Nisa', 5: 'Al-Maidah',
    6: 'Al-Anam', 7: 'Al-Araf', 8: 'Al-Anfal', 9: 'At-Tawbah', 10: 'Yunus',
    11: 'Hud', 12: 'Yusuf', 13: 'Ar-Rad', 14: 'Ibrahim', 15: 'Al-Hijr',
    16: 'An-Nahl', 17: 'Al-Isra', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Ta-Ha',
    21: 'Al-Anbiya', 22: 'Al-Hajj', 23: 'Al-Muminun', 24: 'An-Nur', 25: 'Al-Furqan',
    26: 'Ash-Shuara', 27: 'An-Naml', 28: 'Al-Qasas', 29: 'Al-Ankabut', 30: 'Ar-Rum',
    31: 'Luqman', 32: 'As-Sajdah', 33: 'Al-Ahzab', 34: 'Saba', 35: 'Fatir',
    36: 'Ya-Sin', 37: 'As-Saffat', 38: 'Sad', 39: 'Az-Zumar', 40: 'Ghafir',
    41: 'Fussilat', 42: 'Ash-Shura', 43: 'Az-Zukhruf', 44: 'Ad-Dukhan', 45: 'Al-Jathiyah',
    46: 'Al-Ahqaf', 47: 'Muhammad', 48: 'Al-Fath', 49: 'Al-Hujurat', 50: 'Qaf',
    51: 'Adh-Dhariyat', 52: 'At-Tur', 53: 'An-Najm', 54: 'Al-Qamar', 55: 'Ar-Rahman',
    56: 'Al-Waqiah', 57: 'Al-Hadid', 58: 'Al-Mujadila', 59: 'Al-Hashr', 60: 'Al-Mumtahanah',
    61: 'As-Saf', 62: 'Al-Jumuah', 63: 'Al-Munafiqun', 64: 'At-Taghabun', 65: 'At-Talaq',
    66: 'At-Tahrim', 67: 'Al-Mulk', 68: 'Al-Qalam', 69: 'Al-Haqqah', 70: 'Al-Maarij',
    71: 'Nuh', 72: 'Al-Jinn', 73: 'Al-Muzzammil', 74: 'Al-Muddaththir', 75: 'Al-Qiyamah',
    76: 'Al-Insan', 77: 'Al-Mursalat', 78: 'An-Naba', 79: 'An-Naziat', 80: 'Abasa',
    81: 'At-Takwir', 82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Inshiqaq', 85: 'Al-Buruj',
    86: 'At-Tariq', 87: 'Al-Ala', 88: 'Al-Ghashiyah', 89: 'Al-Fajr', 90: 'Al-Balad',
    91: 'Ash-Shams', 92: 'Al-Layl', 93: 'Ad-Duha', 94: 'Ash-Sharh', 95: 'At-Tin',
    96: 'Al-Alaq', 97: 'Al-Qadr', 98: 'Al-Bayyinah', 99: 'Az-Zalzalah', 100: 'Al-Adiyat',
    101: 'Al-Qariah', 102: 'At-Takathur', 103: 'Al-Asr', 104: 'Al-Humazah', 105: 'Al-Fil',
    106: 'Quraysh', 107: 'Al-Maun', 108: 'Al-Kawthar', 109: 'Al-Kafirun', 110: 'An-Nasr',
    111: 'Al-Masad', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas'
};

module.exports = {
    command: 'quran',
    aliases: ['quranverse', 'ayah', 'surah'],
    category: 'info',
    description: 'Search Quran verses by surah:ayah or keyword',
    usage: '.quran 1:1\n.quran 2:255\n.quran mercy',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const input = args.join(' ').trim();

        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `📖 *Quran*\n\n` +
                      `*By Surah:Ayah:*\n` +
                      `\`.quran 1:1\` — Al-Fatihah, verse 1\n` +
                      `\`.quran 2:255\` — Ayat Al-Kursi\n` +
                      `\`.quran 36:1\` — Ya-Sin, verse 1\n\n` +
                      `*By keyword:*\n` +
                      `\`.quran mercy\`\n` +
                      `\`.quran patience\`\n` +
                      `\`.quran paradise\`\n\n` +
                      `*Full Surah:*\n` +
                      `\`.surah 1\` — Al-Fatihah\n` +
                      `\`.surah 112\` — Al-Ikhlas`,
                ...channelInfo
            }, { quoted: message });
        }

        try {
            if (/^\d+:\d+$/.test(input)) {
                const [surah, ayah] = input.split(':');
                const [arRes, enRes] = await Promise.all([
                    axios.get(`${BASE}/ayah/${input}/quran-uthmani`),
                    axios.get(`${BASE}/ayah/${input}/en.asad`)
                ]);
                const ar = arRes.data.data;
                const en = enRes.data.data;
                const surahName = SURAH_NAMES[parseInt(surah, 10)] || ar.surah?.englishName;

                await sock.sendMessage(chatId, {
                    text: `📖 *Surah ${surahName} — Ayah ${ayah}*\n\n` +
                          `*Arabic:*\n${ar.text}\n\n` +
                          `*Translation (Asad):*\n_${en.text}_\n\n` +
                          `📍 Surah: ${surah} | Ayah: ${ayah} | Juz: ${ar.juz} | Page: ${ar.page}`,
                    ...channelInfo
                }, { quoted: message });

            } else if (/^\d+$/.test(input) || input.toLowerCase().startsWith('surah')) {
                const num = input.replace(/[^0-9]/g, '') || '1';
                const res = await axios.get(`${BASE}/surah/${num}/en.asad`);
                const data = res.data.data;
                const arRes = await axios.get(`${BASE}/surah/${num}/quran-uthmani`);
                const arData = arRes.data.data;

                const verses = data.ayahs.slice(0, 7).map((a, i) =>
                    `*${i + 1}.* ${arData.ayahs[i]?.text || ''}\n_${a.text}_`
                ).join('\n\n');

                await sock.sendMessage(chatId, {
                    text: `📖 *Surah ${data.englishName} (${data.name})*\n` +
                          `_${data.englishNameTranslation}_ — ${data.numberOfAyahs} verses — ${data.revelationType}\n\n` +
                          `${verses}\n\n` +
                          `_Showing first 7 of ${data.numberOfAyahs} verses_\n` +
                          `Use \`.quran ${num}:8\` for more`,
                    ...channelInfo
                }, { quoted: message });

            } else {
                const res = await axios.get(`${BASE}/search/${encodeURIComponent(input)}/all/en`);
                const matches = res.data.data?.matches || [];

                if (!matches.length) {
                    return await sock.sendMessage(chatId, {
                        text: `❌ No verses found for: *${input}*`,
                        ...channelInfo
                    }, { quoted: message });
                }

                const top = matches.slice(0, 5);
                const results = top.map(m => {
                    const surahName = SURAH_NAMES[m.surah?.number] || m.surah?.englishName;
                    return `📍 *${surahName} ${m.surah?.number}:${m.numberInSurah}*\n_${m.text}_`;
                }).join('\n\n');

                await sock.sendMessage(chatId, {
                    text: `📖 *Quran Search: "${input}"*\n` +
                          `Found ${matches.length} results (showing top 5)\n\n` +
                          results,
                    ...channelInfo
                }, { quoted: message });
            }

        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Failed: ${error.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading quran.js:', e.message); }

/* ===== prayer.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/prayer.js
const axios = require('axios');

module.exports = {
  command: 'jadwalsholat',
  aliases: ['prayer', 'sholat'],
  category: 'info',
  description: 'Get daily prayer times for a city (pakistan)',
  usage: '.jadwalsholat <city> (default: Jakarta)',

  async handler(sock, message, args, context) {
    const { chatId } = context;
    let city = args.join(' ') || 'Jakarta';
    try {
      const url = `https://api.deline.web.id/info/jadwalsholat?kota=${encodeURIComponent(city)}`;
      const { data } = await axios.get(url, { timeout: 10000 });
      if (!data.status) throw new Error(data.error || 'City not found');
      const r = data.result;
      const text = `🕌 *Jadwal Sholat* – ${r.lokasi}\n📅 ${r.tanggal} (${r.hijri})\n\n` +
        `🕋 Imsak : ${r.waktu.Imsak}\n` +
        `🌅 Subuh : ${r.waktu.Fajr}\n` +
        `☀️ Dhuhr : ${r.waktu.Dhuhr}\n` +
        `🌇 Asr   : ${r.waktu.Asr}\n` +
        `🌙 Maghrib: ${r.waktu.Maghrib}\n` +
        `🌃 Isha  : ${r.waktu.Isha}\n`;
      await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch (err) {
      sock.sendMessage(chatId, { text: `❌ Could not fetch prayer times: ${err.message}` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading prayer.js:', e.message); }

/* ===== npm.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // commands/npm.js
const axios = require('axios');

module.exports = {
    command: 'npm',
    aliases: ['npmpkg'],
    category: 'search',
    description: 'Search for NPM packages',
    usage: '.npm <package name>',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const query = args.join(' ').trim();

        if (!query) {
            return sock.sendMessage(chatId, {
                text: '📦 *NPM Package Search*\n\nEnter a package name.\nExample: `.npm axios`',
                ...channelInfo
            }, { quoted: message });
        }

        const statusMsg = await sock.sendMessage(chatId, {
            text: `🔍 Searching NPM for "${query}"...`,
            ...channelInfo
        }, { quoted: message });

        try {
            const apiUrl = `https://api.deline.web.id/search/npm?q=${encodeURIComponent(query)}`;
            const { data } = await axios.get(apiUrl, { timeout: 20000 });

            if (!data.status || !data.result || data.result.length === 0) {
                throw new Error('No packages found');
            }

            let reply = `📦 *NPM Search: "${query}"*\n━━━━━━━━━━━━━━━━━━━\n`;
            data.result.slice(0, 5).forEach((pkg, i) => {
                reply += `\n${i+1}. *${pkg.name}* v${pkg.version}\n`;
                reply += `   📝 ${pkg.description?.substring(0, 100) || 'No description'}\n`;
                if (pkg.links?.npm) reply += `   🔗 ${pkg.links.npm}\n`;
            });
            reply += `\n━━━━━━━━━━━━━━━━━━━\n_Results from npm registry_`;

            await sock.sendMessage(chatId, {
                text: reply,
                ...channelInfo
            }, { quoted: message });

            await sock.sendMessage(chatId, { delete: statusMsg.key });
        } catch (error) {
            console.error('[NPM]', error.message);
            await sock.sendMessage(chatId, {
                text: `❌ Search failed: ${error.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading npm.js:', e.message); }

/* ===== npmstalk.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const Qasim = require('api-qasim');
module.exports = {
  command: 'npmstalk',
  aliases: ['npmstlk'],
  category: 'stalk',
  description: 'Get details about an NPM package',
  usage: '.npmstalk <package-name>',

  async handler(sock, message, args, context = {}) {
    const { chatId, usedPrefix, command } = context;

    if (!args[0]) {
      return await sock.sendMessage(chatId, { 
        text: `✳️ Please provide an NPM package name.\n\nExample:\n.npmstalk axios` 
      }, { quoted: message });
    }

    try {

      let res = await Qasim.npmStalk(args[0]);

      if (!res || !res.result) {
        throw 'Package not found or API error.';
      }

      const data = res.result;
      const authorName = (typeof data.author === 'object') ? data.author.name : (data.author || 'Unknown');
      
      const versionCount = data.versions ? Object.keys(data.versions).length : 0;

      let te = `┌──「 *NPM PACKAGE INFO* 」\n`;
      te += `▢ *🔖Name:* ${data.name}\n`;
      te += `▢ *🔖Creator:* ${authorName}\n`;
      te += `▢ *👥Total Versions:* ${versionCount}\n`;
      te += `▢ *📌Description:* ${data.description || 'No description'}\n`;
      te += `▢ *🧩Repository:* ${data.repository?.url || 'No repository available'}\n`;
      te += `▢ *🌍Homepage:* ${data.homepage || 'No homepage available'}\n`;
      te += `▢ *🏷️Latest:* ${data['dist-tags']?.latest || 'N/A'}\n`;
      te += `▢ *🔗Link:* https://npmjs.com/package/${data.name}\n`;
      te += `└────────────`;

      await sock.sendMessage(chatId, { text: te }, { quoted: message });

    } catch (error) {
      console.error('NPM Stalk Error:', error);
      await sock.sendMessage(chatId, { text: `✳️ Error: Package not found or API issue.` }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading npmstalk.js:', e.message); }

/* ===== pinterest.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *****************************************************************************/

const axios = require('axios');

module.exports = {
  command: 'pinterest',
  aliases: ['pin', 'pindl'],
  category: 'download',
  description: 'Download Pinterest images and videos',
  usage: '.pin <Pinterest link>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args[0]?.trim();

    if (!url) {
      return await sock.sendMessage(chatId, {
        text: '❌ Please provide a Pinterest URL.\nExample: .pin https://pin.it/3xxGZnDEU'
      }, { quoted: message });
    }

    if (!/pinterest\.com|pin\.it/i.test(url)) {
      return await sock.sendMessage(chatId, {
        text: '❌ Invalid Pinterest link. Please send a valid Pinterest URL.'
      }, { quoted: message });
    }

    try {
      await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

      // JawadTech Pinterest API
      const apiUrl = `https://jawad-tech.vercel.app/download/pinterest?url=${encodeURIComponent(url)}`;
      console.log(`Requesting: ${apiUrl}`);
      const { data } = await axios.get(apiUrl, { timeout: 15000 });

      if (!data?.status || !data?.result?.url) {
        throw new Error('No media found. The link may be private or unsupported.');
      }

      const mediaUrl = data.result.url;
      const mediaType = data.result.type || (mediaUrl.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image');
      const title = data.result.title || 'Pinterest Media';

      const caption = `📌 *Pinterest Downloader*
📊 Type: *${mediaType === 'video' ? 'Video' : 'Image'}*
📝 Title: *${title.substring(0, 100)}*

> Downloaded by JUNAID-MD↣³⁰²`;

      // Download the media to buffer
      const mediaResponse = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        timeout: 60000
      });
      const mediaBuffer = Buffer.from(mediaResponse.data);

      if (mediaType === 'video') {
        await sock.sendMessage(chatId, {
          video: mediaBuffer,
          mimetype: 'video/mp4',
          caption
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, {
          image: mediaBuffer,
          caption
        }, { quoted: message });
      }

    } catch (error) {
      console.error('Pinterest download error:', error);
      await sock.sendMessage(chatId, {
        text: `❌ *Error:* ${error.message}\n\nPlease try another link.`
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading pinterest.js:', e.message); }

/* ===== snapchat.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    
const axios = require('axios');

module.exports = {
  command: 'snapchat',
  aliases: ['scspot', 'snapdl'],
  category: 'download',
  description: 'Download media (video or image) from Snapchat Spotlight URL',
  usage: '.snapchat <Snapchat URL>',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo, rawText } = context;
    
    const prefix = context.rawText.match(/^[.!#]/)?.[0] || '.';
    const commandPart = rawText.slice(prefix.length).trim();
    const parts = commandPart.split(/\s+/);
    const url = parts.slice(1).join(' ').trim();

    if (!url) {
      return await sock.sendMessage(chatId, { 
        text: 'Please provide a Snapchat Spotlight URL.\nExample: .snapchat https://www.snapchat.com/spotlight/...',
        ...channelInfo
      }, { quoted: message });
    }

    try {
      await sock.sendMessage(chatId, { 
        text: '⏳ Fetching Snapchat media...',
        ...channelInfo
      }, { quoted: message });

      const apiUrl = `https://discardapi.dpdns.org/api/dl/snapchat?apikey=guru&url=${encodeURIComponent(url)}`;
      
      console.log('Requesting URL:', apiUrl);
      console.log('Original URL:', url);
      
      const { data } = await axios.get(apiUrl, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      console.log('Snapchat API Response:', JSON.stringify(data, null, 2));

      if (!data || data.status !== true || !data.result || !Array.isArray(data.result) || data.result.length === 0) {
        return await sock.sendMessage(chatId, { 
          text: '❌ No media found for this Snapchat Spotlight URL.',
          ...channelInfo
        }, { quoted: message });
      }

      for (let mediaItem of data.result) {
        if (mediaItem.video) {
          await sock.sendMessage(chatId, { 
            video: { url: mediaItem.video }, 
            caption: '📹 Snapchat Spotlight Video',
            ...channelInfo
          }, { quoted: message });
        }
        if (mediaItem.image) {
          await sock.sendMessage(chatId, { 
            image: { url: mediaItem.image }, 
            caption: '🖼 Snapchat Spotlight Image',
            ...channelInfo
          }, { quoted: message });
        }
      }

    } catch (error) {
      console.error('Snapchat plugin error:', error.message);
      
      await sock.sendMessage(chatId, { 
        text: `❌ Failed to fetch Snapchat media.\nError: ${error.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-13-search] Error loading snapchat.js:', e.message); }

// ✅ FIX: remove the OLD MovieDriveBD scraper movie commands (movie/film/
// moviebd/mdbd/movies). The ONE and only movie command is .movie in
// plugins/moviedl.js, powered by the Arslan MD API.
try {
  for (let i = _bundle.length - 1; i >= 0; i--) {
    const p = _bundle[i];
    if (p && (p.command === 'movie' ||
        (Array.isArray(p.aliases) && (p.aliases.includes('moviebd') || p.aliases.includes('mdbd'))))) {
      _bundle.splice(i, 1);
    }
  }
} catch {}

module.exports = _bundle;