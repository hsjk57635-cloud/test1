'use strict';
// AUTO-GENERATED BUNDLE: cat-20-apk
// Contains: android1.js, apkmirror.js, apkpure.js, playstore.js, pstore.js

const _bundle = [];


/* ===== android1.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const Qasim = require('api-qasim');
const axios = require('axios');

module.exports = {
  command: 'android',
  aliases: ['an1', 'an1apk'],
  category: 'apks',
  description: 'Search APKs and download by reply',
  usage: '.android <apk_name>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(' ').trim();

    try {
      if (!query) {
        return await sock.sendMessage(chatId, { text: '*Please provide an APK name.*\nExample: .android Telegram' }, { quoted: message });
      }

      await sock.sendMessage(chatId, { text: '🔎 Searching for APKs...' }, { quoted: message });

      const res = await Qasim.apksearch(query);

      if (!res?.data || !Array.isArray(res.data) || res.data.length === 0) {
        return await sock.sendMessage(chatId, { text: '❌ No APKs found.' }, { quoted: message });
      }

      const results = res.data;
      const first = results[0];

      let caption = `📱 *APK Search Results for:* *${query}*\n\n`;
      caption += `↩️ *Reply with a number to download*\n\n`;

      results.forEach((item, i) => {
        caption +=
          `*${i + 1}.* ${item.judul}\n` +
          `👨‍💻 Developer: ${item.dev}\n` +
          `⭐ Rating: ${item.rating}\n` +
          `🔗 ${item.link}\n\n`;
      });

      const sentMsg = await sock.sendMessage(chatId, { image: { url: first.thumb }, caption }, { quoted: message });

      const timeout = setTimeout(async () => {
        sock.ev.off('messages.upsert', listener);
        await sock.sendMessage(chatId, { text: '⏱ APK selection expired. Please search again.' }, { quoted: sentMsg });
      }, 5 * 60 * 1000);

      const listener = async ({ messages }) => {
        const m = messages[0];
        if (!m?.message || m.key.remoteJid !== chatId) return;

        const ctx = m.message?.extendedTextMessage?.contextInfo;
        if (!ctx?.stanzaId || ctx.stanzaId !== sentMsg.key.id) return;

        const replyText =
          m.message.conversation ||
          m.message.extendedTextMessage?.text ||
          '';

        const choice = parseInt(replyText.trim());
        if (isNaN(choice) || choice < 1 || choice > results.length) {
          return await sock.sendMessage(chatId, { text: `❌ Invalid choice. Pick 1-${results.length}.` }, { quoted: m });
        }

        clearTimeout(timeout);
        sock.ev.off('messages.upsert', listener);

        const selected = results[choice - 1];
        
        await sock.sendMessage(chatId, { text: `⬇️ Downloading *${selected.judul}*...\n⏱ Please wait...` }, { quoted: m });
        const apiUrl =
          `https://discardapi.dpdns.org/api/apk/dl/android1?apikey=guru&url=` +
          encodeURIComponent(selected.link);

        const dlRes = await axios.get(apiUrl);

        const apk = dlRes.data?.result;
        if (!apk?.url) {
          return await sock.sendMessage(chatId, { text: '❌ Failed to get APK download link.' }, { quoted: m });
        }
        const safeName = apk.name.replace(/[^\w.-]/g, '_');

        const apkCaption =
          `📦 *APK Downloaded*\n\n` +
          `📛 Name: ${apk.name}\n` +
          `⭐ Rating: ${apk.rating}\n` +
          `📦 Size: ${apk.size}\n` +
          `📱 Android: ${apk.requirement}\n` +
          `🧒 Age: ${apk.rated}\n` +
          `📅 Published: ${apk.published}\n\n` +
          `📝 Description:\n${apk.description}`;

        await sock.sendMessage(chatId, { document: { url: apk.url }, fileName: `${safeName}.apk`, mimetype: 'application/vnd.android.package-archive', caption: apkCaption }, { quoted: m });
      };

      sock.ev.on('messages.upsert', listener);

    } catch (err) {
      console.error('❌ Android Plugin Error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to process APK request.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-20-apk] Error loading android1.js:', e.message); }

/* ===== apkmirror.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'apkmirror',
  aliases: ['apkmi', 'mirrorapk'],
  category: 'apks',
  description: 'Search APKs from APKMirror and download by reply',
  usage: '.apkmirror <apk_name>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(' ').trim();

    try {
      if (!query) return await sock.sendMessage(chatId, { text: '*Please provide an app name.*\nExample: .apkmirror Telegram' }, { quoted: message });

      await sock.sendMessage(chatId, { text: '🔎 Searching APKMirror...' }, { quoted: message });

      const searchUrl = `https://discardapi.dpdns.org/api/apk/search/apkmirror?apikey=guru&query=${encodeURIComponent(query)}`;
      const searchRes = await axios.get(searchUrl);

      const results = searchRes.data?.result;
      if (!Array.isArray(results) || results.length === 0)
        return await sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: message });

      let caption = `📦 *APKMirror Results for:* *${query}*\n\n↩️ *Reply with a number to download*\n\n`;
      results.forEach((v, i) => {
        caption += `*${i + 1}.* ${v.title}\n👨‍💻 ${v.developer}\n📦 ${v.size}\n🕒 ${v.updated}\n🔗 ${v.url}\n\n`;
      });

      const sentMsg = await sock.sendMessage(chatId, { text: caption }, { quoted: message });

      const timeout = setTimeout(async () => {
        sock.ev.off('messages.upsert', listener);
        await sock.sendMessage(chatId, { text: '⌛ Selection expired. Please search again.' }, { quoted: sentMsg });
      }, 3 * 60 * 1000);

      const listener = async ({ messages }) => {
        const m = messages[0];
        if (!m?.message || m.key.remoteJid !== chatId) return;

        const ctx = m.message?.extendedTextMessage?.contextInfo;
        if (!ctx?.stanzaId || ctx.stanzaId !== sentMsg.key.id) return;

        const replyText = m.message.conversation || m.message.extendedTextMessage?.text || '';
        const choice = parseInt(replyText.trim());
        if (isNaN(choice) || choice < 1 || choice > results.length)
          return await sock.sendMessage(chatId, { text: `❌ Invalid choice. Pick 1-${results.length}.` }, { quoted: m });

        clearTimeout(timeout);
        sock.ev.off('messages.upsert', listener);

        const selected = results[choice - 1];
        await sock.sendMessage(chatId, { text: `⬇️ Downloading *${selected.title}*...\n⏳ Please wait...` }, { quoted: m });

        const dlUrl = `https://discardapi.dpdns.org/api/apk/dl/apkmirror?apikey=guru&url=${encodeURIComponent(selected.url)}`;
        const dlRes = await axios.get(dlUrl);

        const apk = dlRes.data?.result;
        if (!apk) return await sock.sendMessage(chatId, { text: '❌ Failed to fetch APK details.' }, { quoted: m });

        const info =
          `📦 *APK Download Info*\n\n` +
          `📛 Name: ${apk.name}\n` +
          `📦 Size: ${apk.size}\n` +
          `📥 Downloads: ${apk.downloads}\n` +
          `📦 Package: ${apk.package}\n` +
          `📅 Uploaded: ${apk.uploaded}\n` +
          `🔢 Version: ${apk.version}`;

        await sock.sendMessage(chatId, { image: { url: apk.icon }, caption: info }, { quoted: m });
      };

      sock.ev.on('messages.upsert', listener);

    } catch (err) {
      console.error('❌ APKMirror Plugin Error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to process request.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-20-apk] Error loading apkmirror.js:', e.message); }

/* ===== apkpure.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'apkpure',
  aliases: ['apkpur', 'pureapk'],
  category: 'apks',
  description: 'Search APKs from APKPure and get download link',
  usage: '.apkpure <apk_name>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(' ').trim();

    try {
      if (!query) return await sock.sendMessage(chatId, { text: '*Please provide an app name.*\nExample: .apkpure Instagram' }, { quoted: message });

      await sock.sendMessage(chatId, { text: '🔎 Searching APKPure...' }, { quoted: message });

      /* 🔍 SEARCH */
      const searchUrl = `https://discardapi.dpdns.org/api/apk/search/apkpure?apikey=guru&query=${encodeURIComponent(query)}`;
      const searchRes = await axios.get(searchUrl);

      const results = searchRes.data?.result;
      if (!Array.isArray(results) || results.length === 0)
        return await sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: message });

      let caption = `📦 *APKPure Results for:* *${query}*\n\n↩️ *Reply with a number to get download link*\n\n`;
      results.forEach((v, i) => caption += `*${i + 1}.* ${v.name}\n👨‍💻 ${v.developer}\n🔗 ${v.url}\n\n`);

      const sentMsg = await sock.sendMessage(chatId, { text: caption }, { quoted: message });

      /* ⏱ AUTO EXPIRE */
      const timeout = setTimeout(async () => {
        sock.ev.off('messages.upsert', listener);
        await sock.sendMessage(chatId, { text: '⌛ Selection expired. Please search again.' }, { quoted: sentMsg });
      }, 3 * 60 * 1000);

      /* 📥 REPLY HANDLER */
      const listener = async ({ messages }) => {
        const m = messages[0];
        if (!m?.message || m.key.remoteJid !== chatId) return;

        const ctx = m.message?.extendedTextMessage?.contextInfo;
        if (!ctx?.stanzaId || ctx.stanzaId !== sentMsg.key.id) return;

        const replyText = m.message.conversation || m.message.extendedTextMessage?.text || '';
        const choice = parseInt(replyText.trim());
        if (isNaN(choice) || choice < 1 || choice > results.length)
          return await sock.sendMessage(chatId, { text: `❌ Invalid choice. Pick 1-${results.length}.` }, { quoted: m });

        clearTimeout(timeout);
        sock.ev.off('messages.upsert', listener);

        const selected = results[choice - 1];
        await sock.sendMessage(chatId, { text: `⬇️ Fetching download info for *${selected.name}*...` }, { quoted: m });

        /* 📦 DOWNLOAD INFO */
        const dlUrl = `https://discardapi.dpdns.org/api/apk/dl/apkpure?apikey=guru&url=${encodeURIComponent(selected.url)}`;
        const dlRes = await axios.get(dlUrl);

        const apk = dlRes.data?.result;
        if (!apk?.file?.url)
          return await sock.sendMessage(chatId, { text: '❌ Failed to fetch download link.' }, { quoted: m });

        const info =
          `📦 *APK Download Info*\n\n` +
          `📛 Name: ${apk.name}\n` +
          `👨‍💻 Developer: ${apk.developer}\n` +
          `📦 Size: ${apk.size}\n` +
          `📦 Package: ${apk.id}\n` +
          `🔢 Version: ${apk.version}\n\n` +
          `⬇️ *Download Link:*\n${apk.file.url}\n\n` +
          `⚠️ *Note:* APKPure blocks bot downloads. Please open link in browser.`;

        await sock.sendMessage(chatId, { text: info }, { quoted: m });
      };

      sock.ev.on('messages.upsert', listener);

    } catch (err) {
      console.error('❌ APKPure Plugin Error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to process request.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-20-apk] Error loading apkpure.js:', e.message); }

/* ===== playstore.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
    command: 'playstore',
    aliases: ['app'],
    category: 'search',
    description: 'Search Google Play Store',
    usage: '.playstore <app name>',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const query = args.join(' ');
        if (!query) return sock.sendMessage(chatId, { text: 'Provide app name.' }, { quoted: message });
        const statusMsg = await sock.sendMessage(chatId, { text: '⏳ Searching Play Store...' }, { quoted: message });
        try {
            const { data } = await axios.get(`https://api.deline.web.id/search/playstore?q=${encodeURIComponent(query)}`, { timeout: 20000 });
            if (!data.status || !data.result.length) throw new Error('No apps found');
            let reply = `📱 *Play Store: "${query}"*\n━━━━━━━━━━━━━━━━━━━\n`;
            data.result.slice(0, 5).forEach((app, i) => {
                reply += `\n${i+1}. *${app.nama}*\n👤 ${app.developer}\n⭐ ${app.rate}\n🔗 ${app.link}\n`;
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
} catch(e) { console.warn('[BUNDLE:cat-20-apk] Error loading playstore.js:', e.message); }

/* ===== pstore.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'pstore',
  aliases: ['playstore'],
  category: 'apks',
  description: 'Search apps on Play Store and get app details',
  usage: '.pstore <app_name>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(' ').trim();

    try {
      if (!query) return await sock.sendMessage(chatId, { text: '*Please provide an app name.*\nExample: .playstore Instagram' }, { quoted: message });

      await sock.sendMessage(chatId, { text: '🔎 Searching Play Store...' }, { quoted: message });

      /* 🔍 SEARCH */
      const searchUrl = `https://discardapi.dpdns.org/api/apk/search/playstore?apikey=guru&query=${encodeURIComponent(query)}`;
      const searchRes = await axios.get(searchUrl);
      console.log('🔍 PlayStore Search Response:', searchRes.data);

      const results = searchRes.data?.result;
      if (!Array.isArray(results) || results.length === 0)
        return await sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: message });

      const firstImg = results[0].img;

      let caption = `📱 *Play Store Results for:* *${query}*\n\n↩️ *Reply with a number to view details*\n\n`;
      results.forEach((v, i) => caption += `*${i + 1}.* ${v.name}\n👨‍💻 ${v.developer}\n⭐ ${v.rating_Num}\n🔗 ${v.link}\n\n`);

      const sentMsg = await sock.sendMessage(chatId, { image: { url: firstImg }, caption }, { quoted: message });

      /* ⏱ AUTO EXPIRE */
      const timeout = setTimeout(async () => {
        sock.ev.off('messages.upsert', listener);
        await sock.sendMessage(chatId, { text: '⌛ Selection expired. Please search again.' }, { quoted: sentMsg });
      }, 5 * 60 * 1000);

      /* 📥 REPLY HANDLER */
      const listener = async ({ messages }) => {
        const m = messages[0];
        if (!m?.message || m.key.remoteJid !== chatId) return;

        const ctx = m.message?.extendedTextMessage?.contextInfo;
        if (!ctx?.stanzaId || ctx.stanzaId !== sentMsg.key.id) return;

        const replyText = m.message.conversation || m.message.extendedTextMessage?.text || '';
        const choice = parseInt(replyText.trim());
        if (isNaN(choice) || choice < 1 || choice > results.length)
          return await sock.sendMessage(chatId, { text: `❌ Invalid choice. Pick 1-${results.length}.` }, { quoted: m });

        clearTimeout(timeout);
        sock.ev.off('messages.upsert', listener);

        const selected = results[choice - 1];
        await sock.sendMessage(chatId, { text: `ℹ️ Fetching app details for *${selected.name}*...` }, { quoted: m });

        /* 📦 DETAILS */
        const dlUrl = `https://discardapi.dpdns.org/api/apk/dl/playstore?apikey=guru&url=${encodeURIComponent(selected.link)}`;
        const dlRes = await axios.get(dlUrl);
        console.log('📥 PlayStore Detail Response:', dlRes.data);

        const app = dlRes.data?.result;
        if (!app)
          return await sock.sendMessage(chatId, { text: '❌ Failed to fetch app details.' }, { quoted: m });

        const info =
          `📱 *App Details*\n\n` +
          `📛 Name: ${app.name}\n` +
          `👨‍💻 ${app.developer}\n` +
          `🆕 ${app.publish}\n` +
          `🔢 Version: ${app.version}\n\n` +
          `🔗 Play Store Link:\n${selected.link}`;

        await sock.sendMessage(chatId, { image: { url: app.icon }, caption: info }, { quoted: m });
      };

      sock.ev.on('messages.upsert', listener);

    } catch (err) {
      console.error('❌ PlayStore Plugin Error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to process request.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-20-apk] Error loading pstore.js:', e.message); }

module.exports = _bundle;