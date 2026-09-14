'use strict';
// AUTO-GENERATED BUNDLE: cat-14-social
// Contains: gstalk.js, pstalk.js, tstalk.js, tgstalk.js, xstalk.js, ttstalk.js, igstalk.js, gitinfo.js, github.js, getpp.js, wa.js, jid.js, channelid.js, simdatabase.js, status.js

const _bundle = [];


/* ===== gstalk.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'github',
  aliases: ['ghprofile', 'gh'],
  category: 'stalk',
  description: 'Lookup GitHub user profile',
  usage: '.github <username>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: '*Please provide a GitHub username.*\nExample: .github AbdulRehman19721986'
      }, { quoted: message });
    }

    const username = args[0];

    try {
      const apiUrl = `https://discardapi.onrender.com/api/stalk/github?apikey=guru&url=${username}`;
      const { data } = await axios.get(apiUrl, { 
        timeout: 45000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!data?.result) {
        return await sock.sendMessage(chatId, { text: '❌ GitHub user not found.' }, { quoted: message });
      }

      const result = data.result;

      const caption = `🐙 *GitHub Profile Info*\n\n` +
                      `👤 Name: ${result.nickname || 'N/A'}\n` +
                      `🆔 Username: ${result.username || 'N/A'}\n` +
                      `🏢 Company: ${result.company || 'N/A'}\n` +
                      `📍 Location: ${result.location || 'N/A'}\n` +
                      `💬 Bio: ${result.bio || 'N/A'}\n` +
                      `📦 Public Repos: ${result.public_repo || 0}\n` +
                      `📜 Public Gists: ${result.public_gists || 0}\n` +
                      `👥 Followers: ${result.followers || 0}\n` +
                      `➡ Following: ${result.following || 0}\n` +
                      `🔗 Profile URL: ${result.url || 'N/A'}\n` +
                      `📅 Created At: ${new Date(result.created_at).toDateString()}\n` +
                      `🕒 Last Updated: ${new Date(result.updated_at).toDateString()}`;

      await sock.sendMessage(chatId, { image: { url: result.profile_pic }, caption: caption }, { quoted: message });

    } catch (err) {
      console.error('GitHub plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch GitHub profile.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading gstalk.js:', e.message); }

/* ===== pstalk.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'pinstalk',
  aliases: ['pstalk', 'pinprofile'],
  category: 'stalk',
  description: 'Lookup Pinterest user profile',
  usage: '.pinstalk <username>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: '*Please provide a Pinterest username.*\nExample: .pinstalk anti_establishment'
      }, { quoted: message });
    }

    const username = args[0];

    try {
      const { data } = await axios.get(`https://discardapi.dpdns.org/api/stalk/pinterest`, {
        params: { apikey: 'guru', username: username }
      });

      if (!data?.result) {
        return await sock.sendMessage(chatId, { text: '❌ Pinterest user not found.' }, { quoted: message });
      }

      const result = data.result;
      const profileImage = result.image?.large || result.image?.original || null;

      const caption = `📌 *Pinterest Profile Info*\n\n` +
                      `👤 Full Name: ${result.full_name || 'N/A'}\n` +
                      `🆔 Username: ${result.username || 'N/A'}\n` +
                      `📝 Bio: ${result.bio || 'N/A'}\n` +
                      `📌 Boards: ${result.stats?.boards || 0}\n` +
                      `👥 Followers: ${result.stats?.followers || 0}\n` +
                      `➡ Following: ${result.stats?.following || 0}\n` +
                      `❤️ Likes: ${result.stats?.likes || 0}\n` +
                      `📌 Pins: ${result.stats?.pins || 0}\n` +
                      `💾 Saves: ${result.stats?.saves || 0}\n` +
                      `🔗 Profile URL: ${result.profile_url || 'N/A'}\n` +
                      `🌐 Website: ${result.website || 'N/A'}`;

      if (profileImage) {
        await sock.sendMessage(chatId, { image: { url: profileImage }, caption: caption }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
      }

    } catch (err) {
      console.error('Pinterest plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch Pinterest profile.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading pstalk.js:', e.message); }

/* ===== tstalk.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'thrstalk',
  aliases: ['threadsprofile', 'threadsuser'],
  category: 'stalk',
  description: 'Lookup Threads user profile',
  usage: '.thrstalk <username>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: '*Please provide a Threads username.*\nExample: .thrstalk google'
      }, { quoted: message });
    }

    const username = args[0];

    try {
      const apiUrl = `https://discardapi.onrender.com/api/stalk/threads?apikey=guru&url=${username}`;
      const { data } = await axios.get(apiUrl, { 
        timeout: 45000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!data?.result) {
        return await sock.sendMessage(chatId, { text: '❌ Threads user not found.' }, { quoted: message });
      }

      const result = data.result;
      const profileImage = result.hd_profile_picture || result.profile_picture || null;
      const verifiedMark = result.is_verified ? '✅ Verified' : '';

      const caption = `🧵 *Threads Profile Info*\n\n` +
                      `👤 Name: ${result.name || 'N/A'} ${verifiedMark}\n` +
                      `🆔 Username: ${result.username || 'N/A'}\n` +
                      `📎 Links: ${result.links?.length ? result.links.join('\n') : 'N/A'}\n` +
                      `👥 Followers: ${result.followers || 0}\n` +
                      `📝 Bio: ${result.bio || 'N/A'}\n` +
                      `🔗 Profile URL: https://threads.net/@${result.username || username}`;

      if (profileImage) {
        await sock.sendMessage(chatId, { image: { url: profileImage }, caption: caption }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
      }

    } catch (err) {
      console.error('Threads plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch Threads profile.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading tstalk.js:', e.message); }

/* ===== tgstalk.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'tgstalk',
  aliases: ['tguser', 'tginfo'],
  category: 'stalk',
  description: 'Lookup Telegram channel or user',
  usage: '.tgstalk <username>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: '*Please provide a Telegram username.*\nExample: .tginfo TeamRedxhacker2'
      }, { quoted: message });
    }

    const username = args[0];

    try {
      const apiUrl = `https://discardapi.onrender.com/api/stalk/telegram?apikey=guru&url=${username}`;
      const { data } = await axios.get(apiUrl, { 
        timeout: 45000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!data?.result) {
        return await sock.sendMessage(chatId, { text: '❌ Telegram user/channel not found.' }, { quoted: message });
      }

      const result = data.result;
      const profileImage = result.image_url || null;

      const caption = `📱 *Telegram Info*\n\n` +
                      `👤 Title: ${result.title || 'N/A'}\n` +
                      `📝 Description: ${result.description || 'N/A'}\n` +
                      `🔗 Link: ${result.url || `https://t.me/${username}`}`;

      if (profileImage) {
        await sock.sendMessage(chatId, { image: { url: profileImage }, caption: caption }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
      }

    } catch (err) {
      console.error('Telegram plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch Telegram info.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading tgstalk.js:', e.message); }

/* ===== xstalk.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'xstalk',
  aliases: ['twstalk', 'xprofile'],
  category: 'stalk',
  description: 'Lookup Twitter user profile',
  usage: '.xstalk <username>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: '*Please provide a Twitter username.*\nExample: .xstalk HarmeetSinghPk'
      }, { quoted: message });
    }

    const username = args[0];

    try {
      const { data } = await axios.get(`https://discardapi.dpdns.org/api/stalk/twitter`, {
        params: { apikey: 'guru', username: username }
      });

      if (!data?.result) {
        return await sock.sendMessage(chatId, { text: '❌ Twitter user not found.' }, { quoted: message });
      }

      const result = data.result;
      const profileImage = result.profile?.image || null;
      const bannerImage = result.profile?.banner || null;
      const verifiedMark = result.verified ? '✅ Verified' : '';

      const caption = `🐦 *Twitter Profile Info*\n\n` +
                      `👤 Name: ${result.name || 'N/A'} ${verifiedMark}\n` +
                      `🆔 Username: @${result.username || 'N/A'}\n` +
                      `📝 Bio: ${result.description || 'N/A'}\n` +
                      `📍 Location: ${result.location || 'N/A'}\n` +
                      `📅 Joined: ${new Date(result.created_at).toDateString()}\n\n` +
                      `👥 Followers: ${result.stats?.followers || 0}\n` +
                      `➡ Following: ${result.stats?.following || 0}\n` +
                      `❤️ Likes: ${result.stats?.likes || 0}\n` +
                      `🖼 Media: ${result.stats?.media || 0}\n` +
                      `🐦 Tweets: ${result.stats?.tweets || 0}\n` +
                      `🔗 Profile URL: https://twitter.com/${result.username}`;

      if (profileImage) {
        await sock.sendMessage(chatId, { image: { url: profileImage }, caption: caption }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
      }

      if (bannerImage) {
        await sock.sendMessage(chatId, { image: { url: bannerImage }, caption: `📌 Banner of @${username}` });
      }

    } catch (err) {
      console.error('Twitter plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch Twitter profile.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading xstalk.js:', e.message); }

/* ===== ttstalk.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'ttstalk',
  aliases: ['tikstalk', 'ttprofile'],
  category: 'stalk',
  description: 'Lookup TikTok user profile',
  usage: '.ttstalk <username>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: '*Please provide a TikTok username.*\nExample: .ttstalk truepakistanofficial'
      }, { quoted: message });
    }

    const username = args[0];

    try {
      const { data } = await axios.get('https://discardapi.dpdns.org/api/stalk/tiktok', {
        params: { apikey: 'guru', username: username }
      });

      if (!data?.result?.user) {
        return await sock.sendMessage(chatId, { text: '❌ TikTok user not found.' }, { quoted: message });
      }

      const user = data.result.user;
      const stats = data.result.statsV2 || data.result.stats;
      const profileImage = user.avatarLarger || user.avatarMedium || user.avatarThumb;
      const verifiedMark = user.verified ? '✅ Verified' : '';

      const caption = `🎵 *TikTok Profile Info*\n\n` +
                      `👤 Nickname: ${user.nickname || 'N/A'} ${verifiedMark}\n` +
                      `🆔 Username: @${user.uniqueId || 'N/A'}\n` +
                      `📝 Bio: ${user.signature || 'N/A'}\n` +
                      `🔒 Private Account: ${user.privateAccount ? 'Yes' : 'No'}\n\n` +
                      `👥 Followers: ${stats?.followerCount || 0}\n` +
                      `➡ Following: ${stats?.followingCount || 0}\n` +
                      `❤️ Likes: ${stats?.heartCount || 0}\n` +
                      `🎥 Videos: ${stats?.videoCount || 0}\n\n` +
                      `🔗 Profile URL: https://www.tiktok.com/@${user.uniqueId}`;

      if (profileImage) {
        await sock.sendMessage(chatId, { image: { url: profileImage }, caption: caption }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
      }

    } catch (err) {
      console.error('TikTok plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch TikTok profile.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading ttstalk.js:', e.message); }

/* ===== igstalk.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // commands/igstalk.js
const axios = require('axios');

module.exports = {
    command: 'igstalk',
    aliases: ['ig'],
    category: 'stalker',
    description: 'Get Instagram profile information (daily limit may apply)',
    usage: '.igstalk <username>',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const username = args.join(' ').trim();

        if (!username) {
            return sock.sendMessage(chatId, {
                text: '📸 *Instagram Stalker*\n\nProvide an Instagram username.\nExample: `.igstalk juicee90y`',
                ...channelInfo
            }, { quoted: message });
        }

        const statusMsg = await sock.sendMessage(chatId, {
            text: `⏳ Fetching @${username}...`,
            ...channelInfo
        }, { quoted: message });

        try {
            const apiUrl = `https://api.deline.web.id/stalker/igstalk?username=${encodeURIComponent(username)}`;
            const { data } = await axios.get(apiUrl, { timeout: 20000 });

            if (!data.status) {
                throw new Error(data.error || data.detail || 'Profile not found or limit reached');
            }

            const profile = data.result;
            const caption = `
📸 *Instagram Profile: @${profile.username || username}*
━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${profile.full_name || 'N/A'}
📝 *Bio:* ${profile.biography || 'No bio'}
🔗 *External URL:* ${profile.external_url || 'None'}
📊 *Followers:* ${profile.followers_count || 0}
👣 *Following:* ${profile.follows_count || 0}
📸 *Posts:* ${profile.media_count || 0}
🏢 *Business:* ${profile.is_business_account ? 'Yes' : 'No'}
✅ *Verified:* ${profile.is_verified ? 'Yes' : 'No'}
━━━━━━━━━━━━━━━━━━━
            `.trim();

            // If there's a profile picture, send it
            if (profile.profile_pic_url) {
                await sock.sendMessage(chatId, {
                    image: { url: profile.profile_pic_url },
                    caption,
                    ...channelInfo
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { text: caption, ...channelInfo }, { quoted: message });
            }

            await sock.sendMessage(chatId, { delete: statusMsg.key });
        } catch (error) {
            console.error('[IGSTALK]', error.message);
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading igstalk.js:', e.message); }

/* ===== gitinfo.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const simpleGit = require('simple-git');

module.exports = {
  command: 'gitinfo',
  aliases: ['infogit'],
  category: 'owner',
  description: 'Show detailed git repository information',
  usage: '.gitinfo',
  ownerOnly: true,

  async handler(sock, message) {
    const chatId = message.key.remoteJid;
    const git = simpleGit();

    try {
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        return sock.sendMessage(chatId, { text: '❌ This project is not a git repository.' });
      }

      const status = await git.status();
      const branch = status.current || 'unknown';
      const dirty = status.files.length > 0;

      const commitHash = (await git.revparse(['--short', 'HEAD'])).trim();

      const ahead = status.ahead;
      const behind = status.behind;

      const modifiedCount = status.files.length;
      
      const remotes = await git.getRemotes(true);
      const remoteText = remotes.length
        ? remotes.map(r => `• ${r.name}: ${r.refs.fetch}`).join('\n')
        : 'None';

      const warning = dirty ? '⚠️ Warning: Working tree has uncommitted changes!' : '';

      const text =
        `📦 *Git Repository Info*\n\n` +
        `🌿 Branch: ${branch}\n` +
        `🔖 Commit: ${commitHash}\n` +
        `🧼 Working tree: ${dirty ? 'Dirty' : 'Clean'}\n` +
        `${dirty ? warning + '\n\n' : ''}` +
        `📊 Ahead: ${ahead}, Behind: ${behind}\n` +
        `📁 Modified/Untracked files: ${modifiedCount}\n\n` +
        `🔗 Remotes:\n${remoteText}`;

      await sock.sendMessage(chatId, { text });

    } catch (err) {
      await sock.sendMessage(chatId, { text: `❌ Git error: ${err.message}` });
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading gitinfo.js:', e.message); }

/* ===== github.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'script',
  aliases: ['repo', 'sc'],
  category: 'info',
  description: 'Get information about the lJUNAID-MD↣³⁰² GitHub repository',
  usage: '.script',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const res = await fetch('https://api.github.com/repos/AbdulRehman19721986/REDXBOT302');
      if (!res.ok) throw new Error('Error fetching repository data');
      const json = await res.json();

      let txt = `*乂  lJUNAID-MD↣³⁰²  乂*\n\n`;
      txt += `✩  *Name* : ${json.name}\n`;
      txt += `✩  *Watchers* : ${json.watchers_count}\n`;
      txt += `✩  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
      txt += `✩  *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
      txt += `✩  *URL* : ${json.html_url}\n`;
      txt += `✩  *Forks* : ${json.forks_count}\n`;
      txt += `✩  *Stars* : ${json.stargazers_count}\n\n`;
      txt += `💥 *JUNAID-MD↣³⁰²*`;

      const imgPath = path.join(__dirname, '../assets/bot_image.jpg');
      const imgBuffer = fs.readFileSync(imgPath);

      await sock.sendMessage(chatId, { image: imgBuffer, caption: txt }, { quoted: message });
    } catch (error) {
      console.error('Error in github command:', error);
      await sock.sendMessage(chatId, { text: '❌ Error fetching repository information.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading github.js:', e.message); }

/* ===== getpp.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'getpp',
  aliases: ['dlpp', 'profilepic', 'getdp', 'dp', 'pp'],
  category: 'general',
  description: 'Get user profile picture',
  usage: '.getpp @user or reply or number',

  async handler(sock, message, args, context = {}) {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');

    let target;
    let displayName = 'Unknown';
    let displayNumber = '';

    const quoted = message.message?.extendedTextMessage?.contextInfo;
    
    if (quoted?.mentionedJid?.[0]) {
      target = quoted.mentionedJid[0];
    } else if (quoted?.participant) {
      target = quoted.participant;
      if (quoted.pushName) displayName = quoted.pushName;
    } else if (args[0]) {
      const input = args[0].replace(/[^0-9]/g, '');
      if (input.length >= 10) {
        target = input + '@s.whatsapp.net';
      } else {
        return await sock.sendMessage(chatId, { 
          text: '❌ Invalid number. Use format: 923051234567 or 3051234567' 
        }, { quoted: message });
      }
    } else {
      target = message.key.participant || message.key.remoteJid;
    }

    try {
      let realJid = target;

      if (target.endsWith('@lid') && isGroup) {
        const metadata = await sock.groupMetadata(chatId);
        const participant = metadata.participants.find(p => p.lid === target || p.id === target);
        if (participant?.id) {
           realJid = participant.id;
        }
      }

      const cleanNumber = realJid.replace(/@s\.whatsapp\.net|@lid/g, '').split(':')[0];
      displayNumber = `+${cleanNumber}`;

      if (displayName === 'Unknown') {
        try {
          const name = await sock.getName(realJid);
          if (name && !name.startsWith('+')) displayName = name;
        } catch (e) {}
      }

      let ppUrl = null;
      try {
        ppUrl = await sock.profilePictureUrl(realJid, 'image');
      } catch (e) {
        return await sock.sendMessage(chatId, { 
          text: `❌ No profile picture found for *${displayName}* (${displayNumber})` 
        }, { quoted: message });
      }

      if (ppUrl) {
        await sock.sendMessage(chatId, { 
          image: { url: ppUrl },
          caption: `📸 *Profile Picture*\n\n👤 *Name:* ${displayName}\n📱 *Number:* ${displayNumber}`
        }, { quoted: message });
      }

    } catch (error) {
      console.error('GetPP Error:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ Failed to fetch profile picture.' 
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading getpp.js:', e.message); }

/* ===== wa.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'walink',
  aliases: ['wa', 'waid'],
  category: 'tools',
  description: 'Generate a WhatsApp link from a phone number.',
  usage: '.walink <number> or reply to a user with .wa',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      let waNumber = '';
      if (args.length > 0) {
        waNumber = args.join('').replace(/[^0-9]/g, '');
      } else {
        const ctx = message.message?.extendedTextMessage?.contextInfo;
        
        if (ctx?.participant) {
          waNumber = ctx.participant.replace(/[^0-9]/g, '');
        } else if (ctx?.mentionedJid?.[0]) {
          waNumber = ctx.mentionedJid[0].replace(/[^0-9]/g, '');
        } else {
          return await sock.sendMessage(
            chatId,
            { text: 'Please provide a number, reply to a user, or mention a user.' },
            { quoted: message }
          );
        }
      }
      if (!waNumber) {
        return await sock.sendMessage(
          chatId,
          { text: '❌ Invalid WhatsApp number.' },
          { quoted: message }
        );
      }
      const waLink = `https://wa.me/${waNumber}`;
      await sock.sendMessage(
        chatId,
        { text: `*WhatsApp Link:*\n${waLink}` },
        { quoted: message }
      );
    } catch (error) {
      console.error('WA COMMAND ERROR:', error);
      await sock.sendMessage(
        chatId,
        { text: '❌ Failed to generate WhatsApp link.' },
        { quoted: message }
      );
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading wa.js:', e.message); }

/* ===== jid.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'jid',
  aliases: ['getjid', 'channelid'],
  category: 'tools',
  description: 'Get JID of a group, channel, or user',
  usage: '.jid [url]',
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    let target = args[0] || message.key.remoteJid;
    if (target.includes('whatsapp.com/channel/')) {
      const code = target.split('/').pop();
      try {
        const metadata = await sock.newsletterMetadata('invite', code);
        return await sock.sendMessage(chatId, { text: `Channel JID: ${metadata.id}` }, { quoted: message });
      } catch (e) {
        return await sock.sendMessage(chatId, { text: '❌ Invalid channel link.' }, { quoted: message });
      }
    }
    if (target.includes('chat.whatsapp.com/')) {
      const code = target.split('/').pop();
      try {
        const metadata = await sock.groupInviteInfo(code);
        return await sock.sendMessage(chatId, { text: `Group JID: ${metadata.id}` }, { quoted: message });
      } catch (e) {
        return await sock.sendMessage(chatId, { text: '❌ Invalid group link.' }, { quoted: message });
      }
    }
    if (!target.includes('@')) target = target + '@s.whatsapp.net';
    await sock.sendMessage(chatId, { text: `JID: ${target}` }, { quoted: message });
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading jid.js:', e.message); }

/* ===== channelid.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    
module.exports = {
  command: 'channelid',
  aliases: ['newsletterid'],
  category: 'general',
  description: 'Get the internal JID of a WhatsApp Channel',
  usage: '.channelid <url>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    
    let url = args[0] || "";
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted) {
      url = quoted.conversation || quoted.extendedTextMessage?.text || url;
    }

    if (!url || !url.includes('whatsapp.com/channel/')) {
      return await sock.sendMessage(chatId, { 
        text: 'Please provide a valid WhatsApp Channel URL.\n\n*Example:* .channelid https://whatsapp.com/channel/xxxxx' 
      }, { quoted: message });
    }

    const code = url.split('/').pop();

    try {

      const metadata = await sock.newsletterMetadata("invite", code);

      const response = `
🆔 *JID:* ${metadata.id}
      `.trim();

      await sock.sendMessage(chatId, { text: response }, { quoted: message });

    } catch (err) {
      console.error('Channel ID Error:', err);
      await sock.sendMessage(chatId, { 
        text: '❌ *Failed to resolve:* This channel might be private, deleted, or the link is invalid.' 
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading channelid.js:', e.message); }

/* ===== simdatabase.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const https = require('https');

// List of user agents to rotate
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
];

// Optional: proxy list (if you have access to proxies)
const PROXIES = []; // leave empty if no proxies

module.exports = {
    command: 'simdatabase',
    aliases: ['simdb', 'cnicinfo'],
    category: 'tools',
    description: 'Get SIM owner info (Pakistan) – provide phone number',
    usage: '.simdatabase 3009842133',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const number = args[0];
        if (!number || number.length < 10) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Please provide a valid phone number.\nExample: .simdatabase 3009842133' 
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { text: '⏳ Fetching SIM database info...' }, { quoted: message });

        // Try multiple APIs in case one is blocked
        const apis = [
            { url: `https://fam-official.serv00.net/api/database.php?number=${number}`, name: 'Primary' },
            { url: `https://api.pakdata.com/v1/sim?number=${number}`, name: 'Secondary' },
            { url: `https://sim-info-api.wasif-ali.workers.dev/?search=${number}`, name: 'Tertiary' } // ✅ FIXED: was `cleanNumber` (undefined variable)
        ];

        for (const api of apis) {
            try {
                const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
                const axiosConfig = {
                    timeout: 15000,
                    headers: {
                        'User-Agent': randomUserAgent,
                        'Accept': 'application/json, text/html, */*',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Referer': 'https://www.google.com/',
                        'Origin': 'https://www.google.com',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    },
                    httpsAgent: new https.Agent({ rejectUnauthorized: false })
                };

                // If proxies are available, pick one randomly
                if (PROXIES.length > 0) {
                    const proxy = PROXIES[Math.floor(Math.random() * PROXIES.length)];
                    axiosConfig.proxy = proxy;
                }

                const response = await axios.get(api.url, axiosConfig);
                
                const contentType = response.headers['content-type'] || '';
                if (contentType.includes('application/json')) {
                    const data = response.data;
                    if (data && (data.status === 'success' || data.number || data.cnic)) {
                        let reply = `📱 *SIM Database Result (${api.name})*\n\n`;
                        reply += `📞 *Number:* ${data.number || number}\n`;
                        reply += `🆔 *CNIC:* ${data.cnic || data.cnic_no || data.id || 'N/A'}\n`;
                        reply += `👤 *Name:* ${data.name || data.owner || 'N/A'}\n`;
                        reply += `📍 *Address:* ${data.address || data.addr || 'N/A'}\n`;
                        reply += `📡 *Network:* ${data.network || data.operator || 'N/A'}`;
                        return await sock.sendMessage(chatId, { text: reply }, { quoted: message });
                    }
                } else {
                    const html = response.data;
                    if (html.includes('captcha') || html.includes('bot')) {
                        console.log(`API ${api.name} returned bot page, trying next...`);
                        continue;
                    }
                }
            } catch (err) {
                console.log(`API ${api.name} failed:`, err.message);
            }
        }

        // If all APIs failed
        await sock.sendMessage(chatId, { 
            text: '❌ All SIM database services are currently unavailable or protected.\nPlease try again later or use a different service.'
        }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading simdatabase.js:', e.message); }

/* ===== status.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                     Personal Status – Visible to All Contacts
 *                     Developed By JUNAID-MD↣³⁰²
 *****************************************************************************/

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    command: 'status',
    aliases: ['updatestatus'],
    category: 'owner',
    description: 'Post a personal WhatsApp status (visible to all your contacts)',
    usage: '.status <text>  or  reply to an image/video/audio with .status',
    ownerOnly: true,

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const text = args.join(' ');

        // Show usage if no content
        if (!quotedMsg && !text) {
            return await sock.sendMessage(chatId, {
                text: `⚠️ *Personal Status* – Post an update visible to all your contacts\n\n` +
                      `Reply to an image/video/audio with:\n` +
                      `.status [caption]\n\n` +
                      `Or send text:\n` +
                      `.status Hello everyone!`,
                ...channelInfo
            }, { quoted: message });
        }

        try {
            // Show loading reaction
            await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

            let statusContent = {};

            // Handle quoted media
            if (quotedMsg) {
                let mediaType = null;
                let mediaMsg = null;

                if (quotedMsg.imageMessage) {
                    mediaType = 'image';
                    mediaMsg = quotedMsg.imageMessage;
                } else if (quotedMsg.videoMessage) {
                    mediaType = 'video';
                    mediaMsg = quotedMsg.videoMessage;
                } else if (quotedMsg.audioMessage) {
                    mediaType = 'audio';
                    mediaMsg = quotedMsg.audioMessage;
                } else {
                    return await sock.sendMessage(chatId, {
                        text: '❌ Unsupported media type. Reply to an image, video, or audio file.',
                        ...channelInfo
                    }, { quoted: message });
                }

                // Download media
                const stream = await downloadContentFromMessage(mediaMsg, mediaType);
                const buffer = [];
                for await (const chunk of stream) buffer.push(chunk);
                const mediaBuffer = Buffer.concat(buffer);

                // Build status content
                if (mediaType === 'image') {
                    statusContent = {
                        image: mediaBuffer,
                        caption: text || '',
                        status: true   // explicit status flag
                    };
                } else if (mediaType === 'video') {
                    statusContent = {
                        video: mediaBuffer,
                        caption: text || '',
                        status: true
                    };
                } else if (mediaType === 'audio') {
                    const isPTT = mediaMsg.ptt || false;
                    statusContent = {
                        audio: mediaBuffer,
                        mimetype: isPTT ? 'audio/ogg; codecs=opus' : 'audio/mpeg',
                        ptt: isPTT,
                        status: true
                    };
                }
            }
            // Text‑only status
            else {
                statusContent = {
                    text: text,
                    status: true
                };
            }

            // Post to status@broadcast – visible to all contacts
            await sock.sendMessage('status@broadcast', statusContent);

            // Success reaction and message
            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
            await sock.sendMessage(chatId, {
                text: '✅ Status posted! All your contacts will see it.',
                ...channelInfo
            }, { quoted: message });

        } catch (error) {
            console.error('[STATUS] Error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to post status: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
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
} catch(e) { console.warn('[BUNDLE:cat-14-social] Error loading status.js:', e.message); }

module.exports = _bundle;