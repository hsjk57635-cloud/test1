'use strict';
/**
 * 🔥 JUNAID-MD↣³⁰² — ANTI-BAN EDITION v9.0
 * ✅ Fixed: forwardingScore spam, browser fingerprint, presence abuse,
 *    aggressive reconnect, newsletter context injection, group auto-join
 * Full plugin system · Antidelete · Stealth Presence · Channel Auto-React
 */

const express  = require('express');
const cors     = require('cors');
const http     = require('http');
const socketIo = require('socket.io');
const path     = require('path');
const fs       = require('fs');
const crypto   = require('crypto');
require('dotenv').config();

// ── LOG NOISE FILTER ─────────────────────────────────────────
// ✅ FIX: libsignal (used by Baileys) spams the log with harmless
// decryption churn on every multi-device/retry message: "Bad MAC",
// "MessageCounterError: Key used already or never filled",
// "Closing session"/"Closing open session in favor of incoming prekey
// bundle", giant "SessionEntry { ... }" buffer dumps, and "Failed to
// decrypt message with any known session". None of these mean the bot
// is broken — WhatsApp resends and the message still arrives — but they
// bury the real logs and make the service look like it's on fire.
// Suppress ONLY these known-noisy lines; everything else passes through.
(() => {
  const NOISE = [
    /Bad MAC/i,
    /MessageCounterError/i,
    /Key used already or never filled/i,
    /Closing (open )?session/i,
    /Closing session in favor/i,
    /incoming prekey bundle/i,
    /Failed to decrypt message with any known session/i,
    /Decrypted message with closed session/i,
    /Session error/i,
    /session_cipher\.js/i,
    /libsignal/i,
    /queue_job\.js/i,
    /_asyncQueueExecutor/i,
    /SessionEntry \{/,
    /Removing old closed session/i,
  ];
  // Track whether we're inside a multi-line SessionEntry {...} dump so the
  // buffer-field lines that follow (registrationId:, currentRatchet:, etc.)
  // are swallowed too instead of leaking hundreds of hex lines.
  let inDump = false;
  const isNoise = (args) => {
    const line = args.map(a => (typeof a === 'string' ? a : '')).join(' ');
    if (inDump) {
      if (/^\s*\}/.test(line) || line.trim() === '}') inDump = false;
      return true;
    }
    if (/SessionEntry \{|currentRatchet: \{|_chains: \{/.test(line)) { inDump = true; return true; }
    return NOISE.some(rx => rx.test(line));
  };
  const origLog = console.log.bind(console);
  const origErr = console.error.bind(console);
  const origWarn = console.warn.bind(console);
  console.log  = (...a) => { if (!isNoise(a)) origLog(...a); };
  console.error = (...a) => { if (!isNoise(a)) origErr(...a); };
  console.warn = (...a) => { if (!isNoise(a)) origWarn(...a); };
})();

const supabaseStore = require('./lib/supabaseStore');
const mongoSessionStore = require('./lib/mongoSessionStore');

const {
  initPresenceManager,
  onOwnerActivity,
  destroyPresenceManager,
} = require('./lib/presenceManager');

let autoUpdate = null;
try { autoUpdate = require('./lib/autoUpdate'); } catch {}

const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
} = require('@whiskeysockets/baileys');
const NodeCache = require('node-cache');
const P = require('pino');
const QRCode = require('qrcode');

// ✅ SPEED FIX: fetchLatestBaileysVersion() is a network request to GitHub.
// It was fired on EVERY initConnection / pair / reconnect. On restore of many
// sessions this serialized dozens of network calls before any bot could come
// online (slow restart), and every reconnect paid the cost again. Cache it for
// 6h and share one in-flight promise so concurrent connects don't duplicate it.
let _cachedWaVersion = null;
let _cachedWaVersionTs = 0;
let _waVersionInflight = null;
const _WA_VERSION_TTL = 6 * 60 * 60 * 1000; // 6h
async function getCachedBaileysVersion() {
  const now = Date.now();
  if (_cachedWaVersion && (now - _cachedWaVersionTs) < _WA_VERSION_TTL) {
    return { version: _cachedWaVersion };
  }
  if (_waVersionInflight) return _waVersionInflight;
  _waVersionInflight = (async () => {
    try {
      const { version } = await fetchLatestBaileysVersion();
      _cachedWaVersion = version;
      _cachedWaVersionTs = Date.now();
      return { version };
    } catch (e) {
      // Fall back to last-known version if we have one, else let Baileys use its bundled default.
      if (_cachedWaVersion) return { version: _cachedWaVersion };
      throw e;
    } finally {
      _waVersionInflight = null;
    }
  })();
  return _waVersionInflight;
}

// ── CHANNEL REACTION POOL ────────────────────────────────────
const CHANNEL_REACTIONS = ['🔥','❤️','👏','💯','🚀','⚡','🎯','😍','🙌','💪'];

// ── RATE LIMITER — prevents message flooding (ban trigger) ───
const _msgTimestamps = new Map(); // jid -> [timestamps]
function canSend(jid, limitPerMin = 20) {
  const now = Date.now();
  const cutoff = now - 60_000;
  const arr = (_msgTimestamps.get(jid) || []).filter(t => t > cutoff);
  if (arr.length >= limitPerMin) return false;
  arr.push(now);
  _msgTimestamps.set(jid, arr);
  return true;
}

// ── SUDO / OWNER HELPERS ─────────────────────────────────────
let _libIndex = null;
function getLibIndex() {
  if (!_libIndex) { try { _libIndex = require('./lib/index'); } catch {} }
  return _libIndex;
}
// ✅ SPEED: cache sudo lookups (they hit disk/DB). 60s TTL.
const _sudoCache = new Map(); // jid -> { val, ts }
async function isSudoUser(jid) {
  try {
    const now = Date.now();
    const c = _sudoCache.get(jid);
    if (c && now - c.ts < 60_000) return c.val;
    const lib = getLibIndex();
    const val = lib ? await lib.isSudo(jid) : false;
    _sudoCache.set(jid, { val, ts: now });
    return val;
  } catch { return false; }
}
function cleanNum(jid) { return (jid||'').split(':')[0].split('@')[0]; }

// ✅ SPEED: cache @lid → isOwner resolution so we do NOT fire a blocking
// conn.onWhatsApp() network round-trip on EVERY message from an @lid sender
// (the #1 cause of slow replies + "high ping" in groups). Owner/co-owner @lid
// numbers are stable, so once resolved we remember them.
const _lidOwnerCache = new Map();   // lidNum -> boolean
const _ownerLidResolved = { done: false, ts: 0 };
try {
  const memoryManager = require('./lib/memoryManager');
  memoryManager.registerExtraCache(_sudoCache, 1000);
  memoryManager.registerExtraCache(_lidOwnerCache, 200);
} catch {}

/**
 * Robust admin status from group metadata — matches by bare number so it works
 * across device-suffix ("92300...:17@s.whatsapp.net") and @lid forms.
 */
function adminStatusFromMeta(meta, senderId, conn) {
  const participants = (meta && meta.participants) || [];
  const botIdNorm    = cleanNum(conn?.user?.id);
  const botLidNorm   = cleanNum(conn?.user?.lid);
  const senderNorm   = cleanNum(senderId);
  let isBotAdmin = false, isSenderAdmin = false;
  for (const p of participants) {
    if (p.admin !== 'admin' && p.admin !== 'superadmin') continue;
    const pIdNorm = cleanNum(p.id);
    const pLidNorm = cleanNum(p.lid);
    const pPnNorm  = cleanNum(p.phoneNumber);
    if (botIdNorm && (botIdNorm === pIdNorm || botIdNorm === pLidNorm || (pPnNorm && botIdNorm === pPnNorm))) isBotAdmin = true;
    if (botLidNorm && (botLidNorm === pIdNorm || botLidNorm === pLidNorm)) isBotAdmin = true;
    if (senderNorm && (senderNorm === pIdNorm || senderNorm === pLidNorm || (pPnNorm && senderNorm === pPnNorm))) isSenderAdmin = true;
  }
  return { isSenderAdmin, isBotAdmin };
}
// ✅ FIX: WhatsApp now addresses many chats (DM + group) by @lid instead of the
// real phone-number JID. Baileys 7 exposes the real phone-number JID on the
// message key as participantAlt / remoteJidAlt / senderPn / participantPn.
// Without checking these, isOwner/isSudo silently fail whenever WhatsApp sends
// the message in @lid form (this was breaking owner-detection in DMs).
function getAltNum(msg) {
  const k = msg?.key || {};
  const alt = k.participantAlt || k.remoteJidAlt || k.senderPn || k.participantPn || '';
  return alt ? cleanNum(alt) : '';
}

// ── SAFE MODULE LOADING ──────────────────────────────────────
let antidelete = { storeMessage: async () => {}, handleMessageRevocation: async () => {} };
let GroupEvents = async () => {};
let handleAutoVV = null;
let anticallPlugin = null;

try {
  const ad = require('./lib/antidelete');
  if (ad && typeof ad === 'object') antidelete = ad;
} catch { console.warn('⚠️ antidelete module not found.'); }

try {
  const ge = require('./lib/groupevents');
  if (ge && typeof ge === 'function') GroupEvents = ge;
} catch { console.warn('⚠️ groupevents module not found.'); }

try {
  const vvPlugin = require('./plugins/advanced-vv');
  handleAutoVV = (Array.isArray(vvPlugin) ? vvPlugin.handleAutoVV : vvPlugin?.handleAutoVV) || null;
  if (!handleAutoVV) {
    const vo = require('./plugins/viewonce');
    handleAutoVV = vo?.handleAutoVV || null;
  }
  if (handleAutoVV) console.log('✅ handleAutoVV (vvset) loaded');
} catch(e) { console.warn('⚠️ vv plugin load error:', e.message); }

try {
  anticallPlugin = require('./plugins/anticall');
  if (anticallPlugin?.handleIncomingCall) console.log('✅ anticall plugin loaded');
} catch(e) { console.warn('⚠️ anticall plugin load error:', e.message); }

// ✅ FIX: ffmpeg was never initialized at boot, so FFMPEG_PATH stayed unset
// and any feature shelling out to ffmpeg (tts, bgm, stickers, video) either
// failed silently or fell back to a slow/unset system lookup on every call.
try { require('./lib/ffmpegSetup').setupFFmpeg(); } catch(e) { console.warn('⚠️ ffmpeg setup error:', e.message); }

// ✅ FIX: .prefix/.setprefix (and .panel setname/.panel setowner) only ever
// wrote to settings._prefixesOverride in memory for the CURRENT process.
// On every restart (Render free tier sleeps/restarts constantly, plus the
// plugin hot-reload watcher), that override was lost and the prefix/name/
// owner silently reverted to the .env default — looking like the commands
// "don't work" even though they succeeded at the time. Restore any saved
// override from the persistent store at boot, before the socket connects.
(async () => {
  try {
    const store = require('./lib/lightweight_store');
    const settings = require('./settings');
    const [savedPrefix, savedBotName, savedOwner] = await Promise.all([
      store.getSetting('global', 'prefix').catch(() => null),
      store.getSetting('global', 'botName').catch(() => null),
      store.getSetting('global', 'ownerNumber').catch(() => null),
    ]);
    if (savedPrefix) settings.prefixes = [savedPrefix];
    if (savedBotName) settings.botName = savedBotName;
    if (savedOwner) settings.ownerNumber = savedOwner;
    if (savedPrefix || savedBotName || savedOwner) {
      console.log(`✅ Restored saved settings (prefix=${settings.prefix}, botName=${settings.botName})`);
    }
  } catch (e) { console.warn('⚠️ settings restore error:', e.message); }
})();

// ✅ FIX: antilink / antibot / antibadword / bgm all export a passive
// "check every message" function, but nothing ever called them — only their
// .command handlers (on/off/config) were reachable. Wire them here so the
// actual moderation/trigger logic runs.
let antilinkCheck  = async () => {};
let antibotCheck   = async () => {};
let antifloodCheck = async () => {};
let antibadwordCheck = async () => false;
let bgmCheckAndPlay = async () => false;
try { antilinkCheck = require('./plugins/antilink').handleLinkDetection || antilinkCheck; } catch(e) { console.warn('⚠️ antilink load error:', e.message); }
try { antibotCheck = require('./plugins/antibot').handleAntibotCheck || antibotCheck; } catch(e) { console.warn('⚠️ antibot load error:', e.message); }
// ✅ FIX: antiflood's checkFlood was exported "for messageHandler hook" but
// nothing ever called it — the feature was completely dead. Wire it here.
try { antifloodCheck = require('./plugins/antiflood').checkFlood || antifloodCheck; } catch(e) { console.warn('⚠️ antiflood load error:', e.message); }
try { antibadwordCheck = require('./plugins/antibadword').checkAntiBadword || antibadwordCheck; } catch(e) { console.warn('⚠️ antibadword load error:', e.message); }
let antibadwordMuteCheck = async () => false;
try { antibadwordMuteCheck = require('./plugins/antibadword').checkMuted || antibadwordMuteCheck; } catch(e) {}
// ✅ NEW: lib/selectionHandler.js was fully wired (plugins already call
// registerHandler on load) but nothing in index.js ever called
// handleSelection — so no plain "1".."9" reply ever reached it. Wiring it
// here is what makes the movie downloader's numbered picker (and anything
// else built on this registry) actually work.
const { handleSelection } = require('./lib/selectionHandler');
try {
  const bgmPlugin = require('./plugins/bgm');
  bgmCheckAndPlay = bgmPlugin.checkAndPlay || bgmCheckAndPlay;
  if (bgmPlugin.loadTriggers) bgmPlugin.loadTriggers().catch(()=>{});
} catch(e) { console.warn('⚠️ bgm load error:', e.message); }

// ✅ FIX: plugins/chatbot.js's handleChatbotResponse (replies when mentioned/
// replied-to in groups, or to any DM once enabled) was only ever called from
// lib/messageHandler.js — a file index.js never requires or invokes for real
// messages (index.js has its OWN handleMessage() below). So `.chatbot on`
// always "succeeded" and the AI backend/keys could be perfectly configured,
// but the reply function was structurally unreachable — zero responses,
// always, regardless of API keys or mention format. Wired in for real here.
let chatbotRespond = async () => {};
try { chatbotRespond = require('./plugins/chatbot').handleChatbotResponse || chatbotRespond; }
catch(e) { console.warn('⚠️ chatbot load error:', e.message); }

// ── APP ─────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const io     = socketIo(server, { cors: { origin: '*' } });
const PORT   = process.env.PORT || 3000;
const START_TIME = Date.now();

app.use(cors({ origin: '*', methods: ['GET','POST','DELETE','PUT','OPTIONS'], allowedHeaders: ['Content-Type','x-admin-token','x-deploy-key'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── CONFIG ──────────────────────────────────────────────────
const BOT_NAME     = process.env.BOT_NAME     || '🔥 JUNAID-MD↣³⁰² 🔥';
const OWNER_NAME   = process.env.OWNER_NAME   || 'JUNAID-MD↣³⁰²';
const OWNER_NUM    = process.env.OWNER_NUMBER || '923252352321';
const CO_OWNER     = process.env.CO_OWNER_NAME || '';
const CO_OWNER_NUM = process.env.CO_OWNER_NUM  || '';
const PREFIX       = process.env.PREFIX       || '.';
// ✅ FIX: this defaulted to an old catbox.moe image, different from the
// image menu.js actually shows (MENU_IMAGE_URL). Pairing welcome message,
// group-events plugin, and the public web panel all read BOT_IMG, so they
// were showing a different/stale picture than the menu. Now defaults to
// the same image, unless MENU_IMAGE env overrides it.
const BOT_IMG      = process.env.MENU_IMAGE   || 'https://i.ibb.co/QFQk0DGy/jawadmd.jpg';
const REPO_LINK    = process.env.REPO_LINK    || 'https://github.com/AbdulRehman19721986/REDXBOT-MD';
const NL_JID       = process.env.NEWSLETTER_JID || '120363408055942569@newsletter';
const NL_NAME      = 'JUNAID-MD↣³⁰²';
const WA_GROUP     = process.env.WA_GROUP || ''; // ⚠️ Set in .env — disabled by default to prevent ban
const TG_GROUP     = 'https://t.me/Hamza302bot';
global.BOT_MODE    = 'public';

// ── COMMAND CHANNEL JOIN CARD ────────────────────────────────
// Adds WhatsApp's native forwarded-newsletter metadata to command replies.
// This is the metadata that makes clients show the channel card /
// "View channel" action like the supplied screenshot. The JID is configurable
// through NEWSLETTER_JID and defaults to the channel requested by the owner.
function buildCommandChannelInfo() {
  return {
    contextInfo: {
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: NL_JID,
        newsletterName: 'JUNAID-MD↣³⁰²',
        serverMessageId: -1
      }
    }
  };
}

function attachCommandChannelCard(conn) {
  if (!conn || conn.__commandChannelCardAttached) return conn;

  const mergeChannelContext = (content = {}) => {
    const channelInfo = buildCommandChannelInfo();
    const existingCtx = content?.contextInfo || {};
    return {
      ...content,
      contextInfo: {
        ...existingCtx,
        ...channelInfo.contextInfo,
      }
    };
  };

  const originalSendMessage = conn.sendMessage.bind(conn);
  conn.sendMessage = async (chatId, content = {}, options = {}) => {
    try { return originalSendMessage(chatId, mergeChannelContext(content), options); }
    catch { return originalSendMessage(chatId, content, options); }
  };

  // Some commands use relayMessage() for carousels / native-flow UIs instead
  // of sendMessage(). Inject the same newsletter context into the actual leaf
  // message so those commands also get the channel card / "View channel" UI.
  if (typeof conn.relayMessage === 'function') {
    const originalRelayMessage = conn.relayMessage.bind(conn);
    const leafKeys = new Set([
      'interactiveMessage','imageMessage','videoMessage','documentMessage',
      'audioMessage','stickerMessage','conversation','extendedTextMessage',
      'buttonsMessage','listMessage','templateMessage','contactMessage',
      'locationMessage'
    ]);
    const injectRelayContext = (node, depth = 0) => {
      if (!node || typeof node !== 'object' || depth > 8) return false;
      for (const key of Object.keys(node)) {
        const value = node[key];
        if (!value || typeof value !== 'object') continue;
        if (leafKeys.has(key)) {
          value.contextInfo = {
            ...(value.contextInfo || {}),
            ...buildCommandChannelInfo().contextInfo
          };
          return true;
        }
        if (injectRelayContext(value, depth + 1)) return true;
      }
      return false;
    };
    conn.relayMessage = async (chatId, message, options = {}) => {
      try { injectRelayContext(message); }
      catch {}
      return originalRelayMessage(chatId, message, options);
    };
  }

  conn.__commandChannelCardAttached = true;
  return conn;
}


// ── ANTI-BAN CONFIG ──────────────────────────────────────────
// Set AUTO_STATUS_REACT=false and AUTO_GROUP_JOIN=false to prevent banning
const AUTO_STATUS_REACT  = process.env.AUTO_STATUS_REACT !== 'false';  // default true
const AUTO_STATUS_SEEN   = process.env.AUTO_STATUS_SEEN  !== 'false';  // default true
const AUTO_GROUP_JOIN    = process.env.AUTO_GROUP_JOIN   === 'true';   // default FALSE (ban risk)
const AUTO_NL_FOLLOW     = process.env.AUTO_NL_FOLLOW    !== 'false';  // default true

let adminUsername = process.env.ADMIN_USERNAME || 'HAMZA458';
let adminPassword = process.env.ADMIN_PASSWORD || 'HAMZA458';
const adminSessions = new Map();

// ── PATHS ────────────────────────────────────────────────────
const SESSIONS_DIR   = path.join(__dirname, 'sessions');
const DATA_FILE      = path.join(__dirname, 'data.json');
const DEPLOYS_FILE   = path.join(__dirname, 'deploys.json');
const SERVERS_FILE   = path.join(__dirname, 'servers.json');
const DEPLOY_ID_FILE = path.join(__dirname, 'deploy_id.txt');

[SESSIONS_DIR, path.join(__dirname,'temp'), path.join(__dirname,'data')].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ── DEPLOY ID ────────────────────────────────────────────────
const DEPLOY_ID = (() => {
  if (fs.existsSync(DEPLOY_ID_FILE)) return fs.readFileSync(DEPLOY_ID_FILE,'utf8').trim();
  const id = process.env.DEPLOY_ID || 'JUNAID321302';
  fs.writeFileSync(DEPLOY_ID_FILE, id);
  return id;
})();

const detectPlatform = () => {
  if (process.env.DYNO)                return 'Heroku';
  if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
  if (process.env.RENDER)              return 'Render';
  return 'Local';
};

// ── PERSISTENT DATA ──────────────────────────────────────────
let statsData = { totalUsers: 0, pairCount: 0 };
const loadStats = () => { try { if (fs.existsSync(DATA_FILE)) statsData = { ...statsData, ...JSON.parse(fs.readFileSync(DATA_FILE,'utf8')) }; } catch {} };
const saveStats = () => { try { fs.writeFileSync(DATA_FILE, JSON.stringify({ ...statsData, lastUpdated: new Date().toISOString() },null,2)); } catch {} };
loadStats(); setInterval(saveStats, 30000);

// ── DEPLOYS REGISTRY ─────────────────────────────────────────
let deploys = {};
const VALID_MODES = ['public', 'private', 'groups', 'inbox', 'self'];
const loadDeploys = () => { try { if (fs.existsSync(DEPLOYS_FILE)) deploys = JSON.parse(fs.readFileSync(DEPLOYS_FILE,'utf8')); } catch {} };
const saveDeploys = () => { try { fs.writeFileSync(DEPLOYS_FILE, JSON.stringify(deploys,null,2)); } catch {} };
loadDeploys();

if (!deploys[DEPLOY_ID]) {
  deploys[DEPLOY_ID] = {
    id: DEPLOY_ID, platform: detectPlatform(),
    createdAt: new Date().toISOString(), numbers: [],
    pairCount: 0, botName: BOT_NAME, ownerName: OWNER_NAME,
    prefix: PREFIX, mode: global.BOT_MODE,
    deployKey: crypto.randomBytes(16).toString('hex'),
  };
}

const envMode = process.env.BOT_MODE?.toLowerCase();
const savedMode = deploys[DEPLOY_ID]?.mode?.toLowerCase();
if (envMode && VALID_MODES.includes(envMode)) {
  global.BOT_MODE = envMode;
} else if (savedMode && VALID_MODES.includes(savedMode)) {
  global.BOT_MODE = savedMode;
} else {
  global.BOT_MODE = 'public';
}
deploys[DEPLOY_ID].mode = global.BOT_MODE;
deploys[DEPLOY_ID].lastSeen = new Date().toISOString();
deploys[DEPLOY_ID].platform = detectPlatform();
saveDeploys();

let servers = [];
const loadServers = () => { try { if (fs.existsSync(SERVERS_FILE)) servers = JSON.parse(fs.readFileSync(SERVERS_FILE,'utf8')); } catch {} };
const saveServers = () => { try { fs.writeFileSync(SERVERS_FILE, JSON.stringify(servers,null,2)); } catch {} };
loadServers();

// ── ACTIVE CONNECTIONS ────────────────────────────────────────
const activeConnections = new Map();
const channelManager = require('./lib/channelManager');
function getActiveSockets() {
  return [...activeConnections.values()].filter(e => e.connected && e.conn).map(e => e.conn);
}
// ✅ FIX: panel.js called global.saveChannelCfg / global.applyChannelToAll —
// neither was ever defined anywhere, hence "global.saveChannelCfg is not a
// function". Wired up for real here, plus multi-channel + post-react support.
global.getChannelCfg      = (legacySingle) => channelManager.getChannelCfg(legacySingle);
global.saveChannelCfg     = (cfg) => channelManager.saveChannelCfg(cfg);
global.applyChannelToAll  = () => channelManager.applyChannelToAll(getActiveSockets);
global.reactPostOnAll     = (postLink, emoji) => channelManager.reactPostOnAll(getActiveSockets, postLink, emoji);
// ✅ FIX: was called by `.panel poststatus`/`poststatusimg` but never defined
// anywhere — always threw "not a function". Wired up now.
global.postStatusToAll    = (payload) => channelManager.postStatusToAll(getActiveSockets, payload);
global.addChannel         = (sock, input) => channelManager.addChannel(sock, input);
global.removeChannel      = (indexOrJid) => channelManager.removeChannel(indexOrJid);
// Used by `.panel sessions` to mark which saved sessions are live right now.
global.__activeConnectionNums = () => [...activeConnections.entries()].filter(([,e]) => e.connected && e.conn).map(([n]) => n);

const broadcastStats = () => {
  const connected = [...activeConnections.values()].filter(c=>c.connected).length;
  io.emit('statsUpdate', { activeSockets: connected, totalUsers: statsData.totalUsers, pairCount: statsData.pairCount });
};

// ── GROUP METADATA CACHE (5-min TTL — avoids repeated API calls) ──
const groupMetaCache = new Map();
const GROUP_CACHE_TTL = 5 * 60 * 1000;
// ✅ RAM management: bound these long-lived caches via memoryManager instead
// of letting them grow for the whole process lifetime (see lib/memoryManager.js).
try {
  const memoryManager = require('./lib/memoryManager');
  memoryManager.registerExtraCache(groupMetaCache, 300);
} catch {}
async function getCachedGroupMeta(conn, jid) {
  const now = Date.now();
  const cached = groupMetaCache.get(jid);
  if (cached && now - cached.ts < GROUP_CACHE_TTL) return cached.meta;
  try {
    const meta = await conn.groupMetadata(jid);
    groupMetaCache.set(jid, { meta, ts: now });
    return meta;
  } catch { return null; }
}

// ======================== PLUGIN LOADER ========================
const commands   = new Map();
const pluginsDir = path.join(__dirname, 'plugins');
let cmdCount     = 0;

const loadPlugins = () => {
  commands.clear(); cmdCount = 0;
  if (!fs.existsSync(pluginsDir)) { fs.mkdirSync(pluginsDir,{recursive:true}); return; }

  // ⚠️ SKIP known spammer/bomber plugins — they cause immediate bans
  const BANNED_PLUGINS = new Set(['smsbomber.js', 'bomber.js', 'boomber.js']);

  const files = fs.readdirSync(pluginsDir)
    .filter(f => f.endsWith('.js') && !f.startsWith('.') && !BANNED_PLUGINS.has(f))
    // The dedicated menu.js must win over legacy bundled menu definitions
    // (cat-18-info.js and other bundles), otherwise .menu silently loads the
    // old text/image-only implementation and the video/sound sequence never runs.
    .sort((a, b) => {
      if (a === 'menu.js') return -1;
      if (b === 'menu.js') return 1;
      return a.localeCompare(b);
    });

  for (const file of files) {
    try {
      const fp = path.join(pluginsDir, file);
      delete require.cache[require.resolve(fp)];
      const mod = require(fp);

      const normalise = (raw) => {
        if (!raw || typeof raw !== 'object') return null;
        if (raw.pattern && raw.execute) return raw;
        if ((raw.command || raw.pattern) && (raw.handler || raw.execute)) {
          const pattern = raw.command || raw.pattern;
          const execute = raw.handler
            ? async (conn, msg, m, opts) => {
                const context = {
                  chatId: opts.from, command: pattern,
                  isOwner: opts.isOwner, isAdmin: opts.isAdmin,
                  senderIsOwnerOrSudo: opts.isOwner, isOwnerOrSudoCheck: opts.isOwner,
                  config: {
                    botName: BOT_NAME, ownerName: OWNER_NAME,
                    ownerNumber: OWNER_NUM, coOwner: CO_OWNER,
                    coOwnerNumber: CO_OWNER_NUM, prefix: PREFIX,
                    mode: global.BOT_MODE, platform: detectPlatform(),
                  },
                  deployId: DEPLOY_ID,
                  ...opts,
                };
                return raw.handler(conn, msg, opts.args || [], context);
              }
            : raw.execute;
          return {
            ...raw, pattern, execute,
            alias: raw.aliases || raw.alias || [],
            category: raw.category || 'other',
            desc: raw.description || raw.desc || '',
            ownerOnly: !!raw.ownerOnly,
          };
        }
        return null;
      };

      const register = (cmd) => {
        const norm = normalise(cmd);
        if (!norm) return;
        const key = String(norm.pattern).toLowerCase();
        // Keep the first implementation when the same command exists in a
        // generated cat-* bundle and a legacy standalone plugin. This avoids
        // silent overwrites that made commands randomly switch implementations
        // depending on filesystem order. Duplicate declarations inside the same
        // bundle are still allowed to use the bundle's final implementation.
        const existing = commands.get(key);
        if (existing && existing.__sourceFile !== file) {
          console.warn(`⚠️ Duplicate command skipped: ${key} (${file}); keeping ${existing.__sourceFile}`);
          return;
        }
        norm.pattern = key;
        norm.__sourceFile = file;
        commands.set(key, norm); cmdCount++;
        const aliases = Array.isArray(norm.alias) ? norm.alias : [];
        aliases.forEach(a => {
          const alias = String(a || '').toLowerCase();
          if (!alias) return;
          const aliasExisting = commands.get(alias);
          if (!aliasExisting || aliasExisting.__sourceFile === file) commands.set(alias, norm);
        });
      };

      if (Array.isArray(mod)) {
        mod.forEach(register);
      } else if (mod && typeof mod === 'object') {
        const norm = normalise(mod);
        if (norm) { register(mod); }
        else { Object.values(mod).forEach(v => { if (v && typeof v === 'object') register(v); }); }
      }
    } catch(e){ console.error(`Plugin ${file}: ${e.message?.slice(0,120)}`); }
  }
  console.log(`🔌 ${cmdCount} commands loaded from ${files.length} plugin files`);
  global.botCommands = commands;
};
loadPlugins();
if (fs.existsSync(pluginsDir)) fs.watch(pluginsDir,(e,f)=>{ if(f&&f.endsWith('.js')){ console.log(`♻️ Reloading ${f}`); loadPlugins(); } });

// ======================== MAKE SOCKET CONFIG ========================
// ✅ ANTI-BAN: Use Ubuntu Chrome — most common fingerprint, lowest detection
function buildSocketConfig(state) {
  return {
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }).child({ level: 'silent' })),
    },
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    // ✅ ANTI-BAN: Ubuntu Chrome is the most common, least suspicious fingerprint
    browser: Browsers.ubuntu('Chrome'),
    // ✅ ANTI-BAN: 30s keepAlive instead of 10s — less WS noise
    keepAliveIntervalMs:      30_000,
    connectTimeoutMs:         30_000,
    defaultQueryTimeoutMs:    30_000,
    // ✅ ANTI-BAN: Slower retry — aggressive reconnect triggers ban
    retryRequestDelayMs:      2_000,
    maxRetries:               3,
    // ✅ ANTI-BAN: Don't appear online on connect
    markOnlineOnConnect:      false,
    syncFullHistory:          false,
    emitOwnEvents:            true,
    fireInitQueries:          true,
  };
}

// ======================== INIT CONNECTION ========================
async function initConnection(number) {
  const sessionDir = path.join(SESSIONS_DIR, number);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version }          = await getCachedBaileysVersion();

  const msgRetryCounterCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
  const _msgStore = new Map();

  const conn = attachCommandChannelCard(makeWASocket({
    version,
    ...buildSocketConfig(state),
    msgRetryCounterCache,
    getMessage: async (key) => {
      try {
        const jid = jidNormalizedUser(key.remoteJid);
        const store = _msgStore.get(jid);
        if (store) { const found = store.get(key.id); if (found) return found.message || undefined; }
      } catch {}
      return undefined;
    },
  }));

  // ✅ SPEED FIX: wrap conn.groupMetadata with the shared 5-min TTL cache so
  // EVERY call site (isAdmin, antilink, antibadword, antitag, welcome, ~50
  // spots across plugins) benefits automatically — previously each of these
  // fired a live WA query per message, a major cause of slow group replies.
  const _origGroupMetadata = conn.groupMetadata.bind(conn);
  // Expose an uncached metadata fetch for participant actions (antilink kick,
  // etc.). The normal groupMetadata() path stays cached for speed.
  conn.groupMetadataFresh = _origGroupMetadata;
  conn.groupMetadata = async (jid, ...rest) => {
    const now = Date.now();
    const cached = groupMetaCache.get(jid);
    if (cached && now - cached.ts < GROUP_CACHE_TTL) return cached.meta;
    const meta = await _origGroupMetadata(jid, ...rest);
    if (meta) groupMetaCache.set(jid, { meta, ts: now });
    return meta;
  };

  // Bind message store (needed for group retry)
  conn.ev.on('messages.upsert', ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue;
      const jid = jidNormalizedUser(msg.key.remoteJid || '');
      if (!_msgStore.has(jid)) _msgStore.set(jid, new Map());
      const chatStore = _msgStore.get(jid);
      chatStore.set(msg.key.id, msg);
      if (chatStore.size > 200) { const firstKey = chatStore.keys().next().value; chatStore.delete(firstKey); }
    }
  });

  // Invalidate group cache on participant change / group settings change
  conn.ev.on('group-participants.update', ({ id }) => { groupMetaCache.delete(id); });
  conn.ev.on('groups.update', (updates) => {
    for (const u of (updates || [])) if (u?.id) groupMetaCache.delete(u.id);
  });

  const prev = activeConnections.get(number) || {};
  activeConnections.set(number, { conn, saveCreds, connected: false, hasWelcomed: prev.hasWelcomed||false, reconnectAttempts: prev.reconnectAttempts||0 });

  setupHandlers(conn, number, saveCreds);
  return conn;
}

function setupHandlers(conn, number, saveCreds) {
  const entry = activeConnections.get(number);

  // ✅ FIX ("Creds backup error: Unexpected end of JSON input"): creds.update
  // can fire several times in quick succession (esp. during pairing), and
  // Baileys' own creds.json write isn't guaranteed flushed to disk the
  // instant saveCreds() resolves. Back-to-back events were racing: one
  // handler's read landed mid-write from another, catching a truncated/
  // empty file → JSON.parse threw. Fixed with (1) a lock so only one
  // backup runs at a time per session, and (2) skip silently on
  // empty/partial content instead of logging a scary parse error — the
  // next creds.update (there's always another one soon) picks it up.
  let credsBackupInFlight = false;
  const readCredsSafe = () => {
    const sessionDir = path.join(SESSIONS_DIR, number);
    const credsPath  = path.join(sessionDir, 'creds.json');
    if (!fs.existsSync(credsPath)) return null;
    const raw = fs.readFileSync(credsPath, 'utf8');
    if (!raw || !raw.trim()) return null; // mid-write, try again next event
    return JSON.parse(raw);
  };

  conn.ev.on('creds.update', async () => {
    try {
      await saveCreds();
      if (credsBackupInFlight) return; // another creds.update is already backing up
      credsBackupInFlight = true;
      try {
        if (supabaseStore.isEnabled()) {
          try {
            const creds = readCredsSafe();
            if (creds) await supabaseStore.saveSession(number, creds);
          } catch (e) { console.error('[SUPABASE] Creds backup error:', e.message); }
        }
        // ✅ FIX: MONGO_URL never backed up creds before — see lib/mongoSessionStore.js
        if (mongoSessionStore.isEnabled()) {
          try {
            const creds = readCredsSafe();
            if (creds) await mongoSessionStore.saveSession(number, creds);
          } catch (e) { console.error('[MONGO-SESSION] Creds backup error:', e.message); }
        }
      } finally {
        credsBackupInFlight = false;
      }
    } catch {}
  });

  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection) console.log(`[${number}] ${connection}`);

    // ✅ NEW: QR pairing support (Baileys 7rc14 emits `update.qr`; previously
    // dropped on the floor — only pairing-code login worked). Turn it into a
    // scannable PNG data URL and broadcast it live over socket.io, plus
    // stash it so /api/qr/:number can hand it to a polling client too.
    if (qr) {
      try {
        const dataUrl = await QRCode.toDataURL(qr, { errorCorrectionLevel: 'M', margin: 1, scale: 8 });
        entry.lastQr = dataUrl;
        entry.lastQrAt = Date.now();
        io.emit('qr', { sessionId: number, number, qr: dataUrl });
        console.log(`[${number}] 📷 QR generated — scan within ~20s`);
      } catch (e) {
        console.error(`[${number}] QR generation failed:`, e.message);
      }
    }

    if (connection === 'open') {
      entry.connected = true;
      entry.reconnectAttempts = 0;
      stopPairWaitLog(number); // pairing window done — real connection confirmed
      statsData.pairCount++;
      statsData.totalUsers++;
      saveStats();

      const dep = deploys[DEPLOY_ID];
      if (!dep.numbers.includes(number)) dep.numbers.push(number);
      dep.pairCount = (dep.pairCount||0)+1;
      dep.lastPaired = new Date().toISOString();
      saveDeploys();

      broadcastStats();
      io.emit('linked',    { sessionId: number, number });
      io.emit('botStatus', { connected: true, number, deployId: DEPLOY_ID, platform: detectPlatform() });
      console.log(`✅ [${number}] CONNECTED — ${BOT_NAME}`);

      initPresenceManager(conn, number);

      // ✅ FIX ("channel auto-unfollows after 5-10s"): this used to fire TWO
      // separate newsletterFollow calls for the same channel (a raw one at
      // 8s + the full followAllOn sweep at 9s) on EVERY `connection===open`
      // event, with no guard against reconnect flapping. On an unstable host
      // the socket flaps (open→close→reopen) inside that same 5-10s window,
      // re-arming both timers again — so the channel got hit with a burst of
      // back-to-back follow calls, which is what was toggling it back to
      // unfollowed. Now: (1) the raw NL_JID call is gone — followAllOn
      // already covers it via the saved channel list, and (2) the whole
      // thing only runs ONCE per session lifetime (guarded by
      // entry.channelsFollowed, same pattern as entry.hasWelcomed below),
      // not on every reconnect.
      if (AUTO_NL_FOLLOW && NL_JID) {
        channelManager.addChannel(conn, NL_JID).catch(() => {});
      }
      if (!entry.channelsFollowed) {
        entry.channelsFollowed = true;
        setTimeout(async () => {
          try {
            const r = await channelManager.followAllOn(conn);
            if (r.total) console.log(`[${number}] 📡 Auto-followed ${r.ok}/${r.total} saved channel(s)`);
          } catch (e) { console.log(`[${number}] ⚠️ Channel auto-follow: ${e.message}`); }
        }, 9_000);
      }

      // ✅ ANTI-BAN: Auto-join group DISABLED by default — set AUTO_GROUP_JOIN=true in .env to enable
      if (AUTO_GROUP_JOIN && WA_GROUP && WA_GROUP.startsWith('https://chat.whatsapp.com/')) {
        setTimeout(async () => {
          try {
            const inviteCode = WA_GROUP.split('chat.whatsapp.com/')[1].trim();
            await conn.groupAcceptInvite(inviteCode);
            console.log(`[${number}] ✅ Auto-joined group`);
          } catch (e) { console.log(`[${number}] ⚠️ Group join: ${e.message}`); }
        }, 15_000);
      }

      if (!entry.hasWelcomed) {
        entry.hasWelcomed = true;
        setTimeout(() => sendWelcome(conn, number).catch(()=>{}), 5000);
      }
    }

    if (connection === 'close') {
      entry.connected = false;
      destroyPresenceManager(number);
      stopPairWaitLog(number);
      broadcastStats();
      io.emit('botStatus', { connected: false, number });

      const code        = lastDisconnect?.error?.output?.statusCode;
      const isLoggedOut = code === DisconnectReason.loggedOut || code === 401 || code === 405;
      console.log(`❌ [${number}] closed code=${code}`);

      if (isLoggedOut) {
        console.log(`🗑️  [${number}] logout — deleting session`);
        try { fs.rmSync(path.join(SESSIONS_DIR,number),{recursive:true,force:true}); } catch {}
        activeConnections.delete(number);
        io.emit('unlinked', { sessionId: number, number });
        return;
      }

      // ✅ ANTI-BAN: Exponential backoff with jitter — aggressive reconnect = ban
      if (entry.reconnectAttempts < 5) {
        entry.reconnectAttempts++;
        const base = 5000 * entry.reconnectAttempts;
        const jitter = Math.floor(Math.random() * 3000);
        const wait = Math.min(base + jitter, 60_000);
        console.log(`🔄 [${number}] reconnect in ${(wait/1000).toFixed(1)}s (${entry.reconnectAttempts}/5)`);
        setTimeout(async () => {
          try { conn.ev.removeAllListeners(); try{conn.ws?.terminate();}catch{}; await initConnection(number); }
          catch(e){ console.error(`Reconnect ${number}: ${e.message}`); }
        }, wait);
      } else {
        console.log(`🛑 [${number}] max reconnects reached — manual re-pair needed`);
        activeConnections.delete(number);
        io.emit('unlinked', { sessionId: number, number });
      }
    }
  });

  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      const from = msg.key?.remoteJid || '';

      // ✅ ANTI-BAN: Rate-limit channel reactions (no reaction spam)
      if (from.endsWith('@newsletter')) {
        if (canSend(from, 5)) {
          try {
            const emoji = CHANNEL_REACTIONS[Math.floor(Math.random() * CHANNEL_REACTIONS.length)];
            try { await conn.sendMessage(from, { react: { text: emoji, key: msg.key } }); }
            catch { await conn.newsletterSendReaction?.(from, msg.key.id, emoji); }
          } catch {}
        }
        continue;
      }

      // ✅ FIX: on Baileys 7.x, "delete for everyone" arrives as a normal
      // message in messages.upsert with message.protocolMessage.type REVOKE —
      // it does NOT reliably fire messages.update on every host. The old code
      // only listened on messages.update, so real-time deletions were missed.
      const pmType = msg.message?.protocolMessage?.type;
      if (pmType === 0 || pmType === 5) {
        if (antidelete && typeof antidelete.handleMessageRevocation === 'function') {
          try { await antidelete.handleMessageRevocation(conn, msg); } catch(e) { console.error('[antidelete upsert]', e.message); }
        }
        continue;
      }

      if (antidelete && typeof antidelete.storeMessage === 'function')
        await antidelete.storeMessage(conn, msg);
      // Auto-VV intercept (vvset triggers)
      if (handleAutoVV) {
        try { await handleAutoVV(conn, msg); } catch(e) { console.error('[vv auto]', e.message); }
      }
      try { await handleMessage(conn, msg, number); } catch(e){ console.error(`msg: ${e.message}`); }
    }
    // ✅ ANTI-BAN: Don't call goOffline after EVERY message batch — presence spam triggers ban
    // Presence is managed by presenceManager on its own 5-min timer
  });

  conn.ev.on('messages.update', async (updates) => {
    for (const update of updates) {
      // REVOKE = type 0 in Baileys proto (was wrongly 1)
      const pType = update.update?.protocolMessage?.type ?? update.update?.message?.protocolMessage?.type;
      if (pType === 0 || pType === 5) {
        if (antidelete && typeof antidelete.handleMessageRevocation === 'function') {
          // Build synthetic msg so plugin message?.protocolMessage path resolves
          const synMsg = {
            key: update.key,
            message: update.update?.message || update.update,
            participant: update.key?.participant,
            update: update.update,
          };
          await antidelete.handleMessageRevocation(conn, synMsg);
        }
      }
    }
  });

  conn.ev.on('group-participants.update', async (update) => {
    try {
      await GroupEvents(conn, update, { botName: BOT_NAME, ownerName: OWNER_NAME, menuImage: BOT_IMG, newsletterJid: NL_JID });
    } catch(e){ console.error('GroupEvents:', e.message); }
  });

  // ── ANTICALL: reject incoming calls ──────────────────────────
  conn.ev.on('call', async (calls) => {
    for (const call of calls) {
      try {
        if (anticallPlugin && typeof anticallPlugin.handleIncomingCall === 'function') {
          await anticallPlugin.handleIncomingCall(conn, call);
        }
      } catch(e) { console.error('[anticall] event error:', e.message); }
    }
  });
}

// ======================== WELCOME MESSAGE ========================
// ✅ ANTI-BAN: No forwardingScore, no isForwarded, no newsletterContext — plain messages don't get flagged
async function sendWelcome(conn, number) {
  const userJid = `${number}@s.whatsapp.net`;
  let name = 'User';
  try { name = conn.user?.name || conn.user?.notify || 'User'; } catch {}
  const dep = deploys[DEPLOY_ID];
  const now = new Date().toLocaleString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' });

  // ✅ FIX: raw REPO_LINK/GitHub source was printed directly in the welcome
  // message — hidden now. Also sends BOT_IMG as an actual image (was
  // text-only before) and reformats as a proper session card.
  const caption = `╭───「 🔥 *${BOT_NAME}* 🔥 」
│
│  ✅ *Session Linked Successfully!*
│
├─ 👤 *User:* ${name}
├─ 📱 *Number:* +${number}
├─ 🕒 *Linked:* ${now}
├─ 👑 *Owner:* ${OWNER_NAME}
├─ 🌍 *Mode:* ${global.BOT_MODE.toUpperCase()}
├─ 📌 *Prefix:* \`${dep.prefix||PREFIX}\`
├─ 📦 *Commands:* ${cmdCount+8}+
├─ 🪪 *Deploy Name:* \`JUNAID321302\`
├─ 🆔 *Deploy ID:* \`${DEPLOY_ID}\`
├─ 🔑 *Deploy Key:* \`${dep.deployKey}\`
│
╰───────────────⊷

🔒 *Keep your Deploy Key private — it controls this session.*
💡 Send *${dep.prefix||PREFIX}menu* anytime to see every command.

> 🔥 ${BOT_NAME} — by ${OWNER_NAME}`;

  try {
    await conn.sendMessage(userJid, { image: { url: BOT_IMG }, caption });
  } catch (e) {
    // Fallback to plain text if the image fails to send (bad URL, offline host, etc.)
    console.warn('[welcome] image send failed, falling back to text:', e.message);
    await conn.sendMessage(userJid, { text: caption });
  }
}

// ======================== MESSAGE HANDLER ========================
async function handleMessage(conn, msg, sessionId) {
  const from    = msg.key.remoteJid;
  const sender  = msg.key.participant || msg.key.remoteJid;
  const sNum    = sender.split('@')[0].split(':')[0];

  const sNumClean       = cleanNum(sender);
  const altNumClean     = getAltNum(msg); // real PN when sender/remoteJid is @lid
  const sessionNumClean = cleanNum(sessionId);
  const ownerClean      = cleanNum(OWNER_NUM);
  const coOwnerClean    = CO_OWNER_NUM ? cleanNum(CO_OWNER_NUM) : '';

  const isRealOwner = sNumClean === ownerClean || altNumClean === ownerClean
    || (coOwnerClean && (sNumClean === coOwnerClean || altNumClean === coOwnerClean));

  let isOwner = isRealOwner;

  if (!isOwner && msg.key.fromMe) isOwner = true;

  // ✅ FIX + SPEED: @lid resolution runs for DMs and groups, but is now
  // CACHED. Previously this fired a blocking conn.onWhatsApp() network call
  // on EVERY message from an @lid sender — which on modern WhatsApp is most
  // messages — adding hundreds of ms of latency per message (the main cause
  // of slow DM/group replies and "high ping"). We now:
  //   1. check a per-lid cache first (instant), and
  //   2. only ever query the owner's lid ONCE (cached 6h), then compare locally.
  if (!isOwner && (sNumClean.length > 15 || sender.includes('@lid'))) {
    if (_lidOwnerCache.has(sNumClean)) {
      if (_lidOwnerCache.get(sNumClean)) isOwner = true;
    } else {
      try {
        const now = Date.now();
        if (!_ownerLidResolved.done || now - _ownerLidResolved.ts > 6 * 60 * 60 * 1000) {
          const results = await conn.onWhatsApp?.(OWNER_NUM, ...(coOwnerClean ? [CO_OWNER_NUM] : []));
          if (Array.isArray(results)) {
            for (const r of results) {
              if (r?.lid) _lidOwnerCache.set(cleanNum(r.lid), true);
            }
          }
          _ownerLidResolved.done = true;
          _ownerLidResolved.ts = now;
        }
        const match = _lidOwnerCache.get(sNumClean) === true;
        // remember negatives too so repeat senders never trigger another lookup
        if (!_lidOwnerCache.has(sNumClean)) _lidOwnerCache.set(sNumClean, match);
        if (match) isOwner = true;
      } catch {}
    }
  }

  if (!isOwner && from?.endsWith('@g.us')) {
    try {
      const meta = await getCachedGroupMeta(conn, from);
      if (meta) {
        const participant = meta.participants.find(p => p.lid === sender || p.id === sender);
        if (participant) {
          const realNum = cleanNum(participant.id);
          if (realNum === ownerClean || (coOwnerClean && realNum === coOwnerClean)) isOwner = true;
        }
      }
    } catch {}
  }

  const isSudo = !isOwner ? (await isSudoUser(sender) || (altNumClean && await isSudoUser(altNumClean + '@s.whatsapp.net'))) : false;
  const isSudoLinked = (!isOwner && !isSudo && sender.includes(':'))
    ? await isSudoUser(sender.split(':')[0] + '@s.whatsapp.net') : false;
  if (!isOwner) isOwner = isSudo || isSudoLinked;

  if (isOwner && msg.key.fromMe) onOwnerActivity(conn, sessionId);

  // Status messages — ✅ ANTI-BAN: rate-limited, no spam
  if (from === 'status@broadcast') {
    if (AUTO_STATUS_SEEN) await conn.readMessages([msg.key]).catch(()=>{});
    if (AUTO_STATUS_REACT && canSend('status@broadcast', 30)) {
      const e=['🔥','⚡','💯','👑','🚀','💎','❤️','💜','✨','🌟'][Math.floor(Math.random()*10)];
      await conn.sendMessage(from,{react:{text:e,key:msg.key}},{statusJidList:[sender,conn.user.id]}).catch(()=>{});
    }
    return;
  }
  if (from?.endsWith('@newsletter')) return;
  if (!msg.message) return;

  const isGroupChat = from?.endsWith('@g.us');
  if (!isOwner) {
    switch (global.BOT_MODE) {
      case 'public':               break;
      case 'private': case 'self': return;
      case 'groups':  if (!isGroupChat) return; break;
      case 'inbox':   if (isGroupChat)  return; break;
      default:                     break;
    }
  }

  const body = msg.message?.conversation
    || msg.message?.extendedTextMessage?.text
    || msg.message?.imageMessage?.caption
    || msg.message?.videoMessage?.caption
    || msg.message?.documentMessage?.caption
    || msg.message?.buttonsResponseMessage?.selectedButtonId
    || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId
    || msg.message?.templateButtonReplyMessage?.selectedId
    || msg.message?.ephemeralMessage?.message?.conversation
    || msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text
    || msg.message?.viewOnceMessage?.message?.imageMessage?.caption
    || msg.message?.viewOnceMessage?.message?.videoMessage?.caption
    || '';

  const dep = deploys[DEPLOY_ID];
  const pfx = dep?.prefix || PREFIX;

  // ✅ AUTO-SALAM: reply to a person's greeting in DMs and groups.
  // Enabled by default; owner can toggle it with .autosalam on/off.
  // Keep this before command-prefix handling so it works on plain messages.
  if (!msg.key.fromMe && body && !from?.endsWith('@newsletter')) {
    try {
      const salamFile = path.join(__dirname, 'data', 'autosalam.json');
      let salamEnabled = true;
      try {
        if (fs.existsSync(salamFile)) {
          const saved = JSON.parse(fs.readFileSync(salamFile, 'utf8'));
          salamEnabled = saved?.enabled !== false;
        }
      } catch {}
      const normalized = body.trim().replace(/[\u200e\u200f]/g, '').replace(/[.!?،؛]+$/g, '').trim().toLowerCase();
      const salamRegex = /^(?:السلام\s*علیکم|السلام\s*عليكم|assalam(?:u|o)?\s*alaikum|as[- ]?salam[- ]?o[- ]?alaikum|salam\s*alaikum)$/i;
      if (salamEnabled && salamRegex.test(normalized) && canSend(`salam:${from}`, 3)) {
        await conn.sendMessage(from, { text: 'وعلیکم السلام ورحمة الله وبرکاته 🌸' }, { quoted: msg });
        return;
      }
    } catch (e) { console.error('[autosalam]', e.message); }
  }

  // ✅ FIX: antilink / antibot / antibadword / bgm all watch PLAIN messages
  // (no command prefix). The old code returned above this point whenever a
  // message didn't start with the prefix, so none of these ever ran on real
  // group chatter or on bgm trigger words. Run them first.
  if (!msg.key.fromMe && isGroupChat) {
    // ✅ FIX (speed): fetch group metadata ONCE (5-min cache) and share it with
    // antibot / antiflood — they used to call groupMetadata() per message.
    const gMetaFast = await getCachedGroupMeta(conn, from).catch(() => null);
    try { if (await antibadwordMuteCheck(conn, msg)) return; } catch(e) { console.error('[antibadword-mute]', e.message); }
    try { if (await antibadwordCheck(conn, msg)) return; } catch(e) { console.error('[antibadword]', e.message); }
    try { await antibotCheck(conn, msg, from, sender, gMetaFast); } catch(e) { console.error('[antibot]', e.message); }
    try { await antilinkCheck(conn, from, msg, body, sender); } catch(e) { console.error('[antilink]', e.message); }
    // ✅ FIX: antiflood was never invoked — wire it in so .antiflood on works.
    try { await antifloodCheck(conn, msg, from, sender, gMetaFast); } catch(e) { console.error('[antiflood]', e.message); }
  }
  // ✅ NEW: a bare "1".."9" reply is how numbered pickers (movie search,
  // etc.) resolve — check that before bgm/prefix handling so it doesn't
  // get swallowed as an unmatched trigger word or ignored entirely.
  // ✅ FIX: also allow fromMe (owner/paired-number replies) — the owner who
  // searched the movie replies from the SAME linked account, and their reply
  // arrives with fromMe=true, which previously skipped the selector entirely.
  if (/^[1-9]$/.test(body.trim())) {
    try {
      const handled = await handleSelection(conn, msg, { chatId: from }, parseInt(body.trim(), 10));
      if (handled) return;
    } catch (e) { console.error('[selection]', e.message); }
  }

  // ✅ FIX: bgm.js is explicitly built to also fire on the owner's own
  // outgoing messages (self-bot use case) — gating it behind `!fromMe` (like
  // the moderation plugins above) silently killed every trigger sent from
  // the linked/owner number, which is how most people were testing it.
  try { if (await bgmCheckAndPlay(conn, msg, body, from, {})) return; } catch(e) { console.error('[bgm]', e.message); }

  if (!body.startsWith(pfx)) {
    // ✅ FIX: chatbot reply logic was never reachable at all (see require
    // above) — this is the actual call site. Runs on non-command text only,
    // skips the bot's own messages, mirrors the intended enable/mode gating
    // that plugins/chatbot.js already implements internally (per-chat on/off
    // via `.chatbot on`, and it self-detects DM vs mention-in-group).
    if (!msg.key.fromMe && body) {
      try { await chatbotRespond(conn, from, msg, body, sender); } catch(e) { console.error('[chatbot]', e.message); }
    }
    return;
  }

  const args = body.slice(pfx.length).trim().split(/ +/);
  const cmd  = args.shift().toLowerCase();
  const q    = body.slice(pfx.length + cmd.length).trim();

  console.log(`[${new Date().toLocaleTimeString()}] ${pfx}${cmd} | ${sNum}`);

  if (await runBuiltIn(conn, msg, cmd, args, q, from, sender, isOwner, pfx)) return;

  if (commands.has(cmd)) {
    const plugin = commands.get(cmd);
    if (plugin.strictOwnerOnly && !isRealOwner) {
      await conn.sendMessage(from, { text: '❌ This command is restricted to the real owner only.' }, { quoted: msg });
      return;
    }
    if (plugin.ownerOnly && !isOwner) {
      await conn.sendMessage(from, { text: '❌ This command is for the bot owner/co-owner only.' }, { quoted: msg });
      return;
    }
    try {
      const reply   = (text, opts={}) => conn.sendMessage(from,{text},{quoted:msg,...opts});
      const isGroup = from.endsWith('@g.us');
      let gMeta = null;
      if (isGroup) { gMeta = await getCachedGroupMeta(conn, from); }
      // ✅ FIX: previously only the SENDER was checked (and only by exact JID
      // match — broken for device suffixes / @lid). Now compute BOTH sender
      // and bot admin status with normalized matching, and expose them to the
      // plugin context. Bundled admin commands (kick, demote, mute, …) read
      // context.isBotAdmin and wrongly replied "make the bot an admin first"
      // because it was always undefined here.
      let isAdmin = false, isBotAdmin = false, isSenderAdmin = false;
      if (isGroup && gMeta) {
        const a = adminStatusFromMeta(gMeta, sender, conn);
        isAdmin = a.isSenderAdmin; isBotAdmin = a.isBotAdmin; isSenderAdmin = a.isSenderAdmin;
      }
      const quoted = getQuoted(msg);
      const pluginOpts = {
        args, q, reply, channelInfo: buildCommandChannelInfo(), from, isGroup, groupMetadata: gMeta,
        sender, isAdmin, isOwner, isRealOwner, botName: BOT_NAME, ownerName: OWNER_NAME,
        prefix: pfx, senderNumber: sNum, chatId: from, deployId: DEPLOY_ID,
        senderIsOwnerOrSudo: isOwner, isOwnerOrSudoCheck: isOwner,
        isSenderAdmin, isBotAdmin,
        sessionId: sessionNumClean,
      };
      await plugin.execute(conn, msg, {
        mentionedJid: msg.message?.extendedTextMessage?.contextInfo?.mentionedJid||[],
        quoted, sender, key: msg.key, message: msg.message,
      }, pluginOpts);
    } catch(e){ console.error(`cmd[${cmd}]: ${e.message}`); }
  }
}

// ======================== BUILT-IN COMMANDS ========================
// ✅ ANTI-BAN: All built-in replies are plain messages — no forwardingScore/newsletter injection
async function runBuiltIn(conn, msg, cmd, args, q, from, sender, isOwner, pfx) {
  const dep = deploys[DEPLOY_ID];

  // Plain sender — no newsletter/forward context (ban risk removed)
  const s = text => conn.sendMessage(from, { text, ...buildCommandChannelInfo() }, { quoted: msg });

  switch(cmd) {
    case 'autosalam': {
      if (!isOwner) { await s('❌ Only the bot owner can change Auto-Salam.'); return true; }
      const value = (args[0] || '').toLowerCase();
      if (!['on','off'].includes(value)) {
        await s(`🌸 Auto-Salam is currently enabled by default.\nUse ${pfx}autosalam on or ${pfx}autosalam off`);
        return true;
      }
      try {
        const file = path.join(__dirname, 'data', 'autosalam.json');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify({ enabled: value === 'on' }, null, 2));
      } catch {}
      await s(value === 'on' ? '✅ Auto-Salam enabled.\nNow “السلام علیکم” will get an automatic “وعلیکم السلام” reply in DMs and groups.' : '✅ Auto-Salam disabled.');
      return true;
    }
    case 'ping': {
      // ✅ Real round-trip: time how long an actual message send takes, which
      // reflects the true WhatsApp latency (not a near-zero local diff).
      const t = Date.now();
      const sent = await conn.sendMessage(from, { text: '🏓 Pinging...' }, { quoted: msg });
      const lat = Date.now() - t;
      const tag = lat < 400 ? '🟢 Excellent' : lat < 900 ? '🟡 Good' : lat < 1800 ? '🟠 Okay' : '🔴 Slow';
      try {
        await conn.sendMessage(from, { text: `⚡ *ᴘɪɴɢ:* \`${lat}ms\` ${tag}\n\n> 🔥 ${BOT_NAME}`, edit: sent.key });
      } catch {
        await s(`⚡ *ᴘɪɴɢ:* \`${lat}ms\` ${tag}\n\n> 🔥 ${BOT_NAME}`);
      }
      return true;
    }
    case 'owner':
      await conn.sendMessage(from, {
        contacts: { displayName: OWNER_NAME, contacts: [{ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${OWNER_NAME}\nTEL;type=CELL;waid=${OWNER_NUM}:+${OWNER_NUM}\nEND:VCARD` }] }
      }, { quoted: msg });
      await s(`👑 *ᴏᴡɴᴇʀ:* ${OWNER_NAME}\n📱 *ɴᴜᴍ:* +${OWNER_NUM}\n\n> 🔥 ${BOT_NAME}`);
      return true;

    case 'mode':
    case 'setmode':
    case 'botmode': {
      if (!isOwner) { await s('❌ Owner only.'); return true; }
      const m = args[0]?.toLowerCase();
      const modeDescMap = {
        public:  '🌍 Everyone can use bot in groups and DMs.',
        private: '🔒 Owner and sudo users only.',
        groups:  '👥 Only works in group chats for everyone.',
        inbox:   '💬 Only works in private DMs for everyone.',
        self:    '👤 Owner and sudo users only.'
      };
      if (m && VALID_MODES.includes(m)) {
        // FIX: persist mode through the central store as well as deploy metadata.
        // This prevents `.mode private` from appearing to work and then reverting
        // after a restart, and keeps the message-handler gate in sync immediately.
        try {
          const modeStore = require('./lib/lightweight_store');
          await modeStore.setBotMode(m);
        } catch (e) {
          console.warn('[MODE] store persistence failed:', e.message);
          global.BOT_MODE = m;
        }
        global.BOT_MODE = m;
        if (dep) dep.mode = m;
        saveDeploys();
        if (typeof global._bustSpeedCache === 'function') global._bustSpeedCache();
        await s(`✅ *ᴍᴏᴅᴇ ᴄʜᴀɴɢᴇᴅ:* \`${m.toUpperCase()}\`\n\n${modeDescMap[m]}\n\n> 🔥 ${BOT_NAME}`);
      } else {
        const mList = VALID_MODES.map(md => `• \`${pfx}mode ${md}\` — ${modeDescMap[md]}`).join('\n');
        await s(`📌 *ᴄᴜʀʀᴇɴᴛ ᴍᴏᴅᴇ:* \`${global.BOT_MODE.toUpperCase()}\`\n\n*Available Modes:*\n${mList}\n\n> 🔥 ${BOT_NAME}`);
      }
      return true;
    }
    case 'deployid':
    case 'myid':
      await s(`🆔 *ᴅᴇᴘʟᴏʏ ɪᴅ:* \`${DEPLOY_ID}\`\n🔑 *ᴋᴇʏ:* \`${dep?.deployKey||'—'}\`\n🌐 *ᴘʟᴀᴛᴇ:* ${detectPlatform()}\n\n> 🔥 ${BOT_NAME}`);
      return true;

    case 'runtime':
    case 'uptime': {
      const up = Math.floor((Date.now()-START_TIME)/1000);
      const h=Math.floor(up/3600), m2=Math.floor((up%3600)/60), s2=up%60;
      await s(`⏱️ *ʀᴜɴᴛɪᴍᴇ:* \`${h}h ${m2}m ${s2}s\`\n📦 *ᴄᴍᴅs:* ${cmdCount+8}+\n🌍 *ᴍᴏᴅᴇ:* ${global.BOT_MODE.toUpperCase()}\n\n> 🔥 ${BOT_NAME}`);
      return true;
    }
    case 'restart':
    case 'shutdown':
      if (!isOwner) { await s('❌ Owner only.'); return true; }
      await s('🔄 *Restarting...*\n\n> 🔥 '+BOT_NAME);
      setTimeout(()=>process.exit(0),2000);
      return true;

    default: return false;
  }
}

function getQuoted(msg) {
  const ctx=msg.message?.extendedTextMessage?.contextInfo;
  if(!ctx?.quotedMessage)return null;
  return{message:{key:{remoteJid:ctx.participant||ctx.stanzaId,id:ctx.stanzaId,fromMe:false},message:ctx.quotedMessage},sender:ctx.participant};
}

// ======================== EXPRESS ROUTES ========================
app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.get('/api/status', (req,res)=>res.json(getStats()));
// ── SESSION VISIBILITY: list saved sessions ──────────────────────────────
app.get('/api/sessions', (req,res)=>{
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_DIR)) {
      for (const d of fs.readdirSync(SESSIONS_DIR)) {
        const hasCreds = fs.existsSync(path.join(SESSIONS_DIR, d, 'creds.json'));
        const conn = activeConnections.get(d);
        sessions.push({ number: d, hasCreds, connected: !!conn?.connected });
      }
    }
    const supabaseEnabled = supabaseStore.isEnabled();
    res.json({
      totalSaved: sessions.length,
      sessions,
      supabaseEnabled,
      note: supabaseEnabled ? 'Sessions backed up to Supabase ✅' : '⚠️ Supabase not configured — sessions will be lost on Render restart! Set SUPABASE_URL and SUPABASE_KEY.'
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.get('/status', (req, res) => res.json({ status: 'ok', uptime: process.uptime(), bot: getStats() }));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: Math.floor((Date.now()-START_TIME)/1000), connected: [...activeConnections.values()].some(e=>e.connected), platform: detectPlatform(), deployId: DEPLOY_ID }));
app.get('/api/config', (req,res)=>res.json({
  botName: BOT_NAME, ownerName: OWNER_NAME, coOwner: CO_OWNER,
  prefix: PREFIX, menuImage: BOT_IMG, repoLink: REPO_LINK,
  waGroup: WA_GROUP, tgGroup: TG_GROUP,
  hasSession: (()=>{ try{ return fs.readdirSync(SESSIONS_DIR).some(d=>fs.existsSync(path.join(SESSIONS_DIR,d,'creds.json'))); }catch{return false;} })(),
  deployId: DEPLOY_ID, platform: detectPlatform(),
}));

// ── PER-NUMBER SESSION STATUS (used by the frontend to verify the real
//    connection state instead of the global /api/status "any session" flag) ──
app.get('/api/session/:number', (req, res) => {
  try {
    const num = String(req.params.number || '').replace(/\D/g, '');
    const e = activeConnections.get(num);
    let hasCreds = false;
    try { hasCreds = fs.existsSync(path.join(SESSIONS_DIR, num, 'creds.json')); } catch {}
    res.json({
      number: num,
      exists: !!e,
      connected: !!(e && e.connected),
      hasCreds,
      status: (e && e.connected) ? 'connected' : (e ? 'pairing' : 'unknown')
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── PAIRING WINDOW LOGGING ────────────────────────────────────────────────
// Logs the waiting state every 60s so Render logs clearly show whether the
// user has actually linked the device (5-minute window), and when it opened.
const PAIR_WINDOW_MS = 5 * 60 * 1000;
const pairWaitTimers = new Map(); // number -> interval
function startPairWaitLog(num) {
  stopPairWaitLog(num);
  const started = Date.now();
  console.log(`⏳ [${num}] PAIRING CODE SENT — waiting for the user to enter it in WhatsApp (max 5 min)`);
  const timer = setInterval(() => {
    const entry = activeConnections.get(num);
    if (!entry || entry.connected) { stopPairWaitLog(num); return; }
    const elapsed = Math.round((Date.now() - started) / 1000);
    console.log(`⏳ [${num}] still waiting for code entry... ${Math.floor(elapsed / 60)}m ${elapsed % 60}s elapsed`);
    if (elapsed >= PAIR_WINDOW_MS / 1000) {
      stopPairWaitLog(num);
      console.log(`⚠️ [${num}] 5-minute pairing window expired — bot NOT connected. Ask for a new code.`);
    }
  }, 60000);
  pairWaitTimers.set(num, timer);
}
function stopPairWaitLog(num) {
  const t = pairWaitTimers.get(num);
  if (t) { clearInterval(t); pairWaitTimers.delete(num); }
}

app.post('/api/pair', async (req, res) => {
  let conn;
  try {
    const { number, force } = req.body;
    const requestedNumber = number || process.env.PAIRING_NUMBER || process.env.OWNER_NUMBER || '923252352321';
    const num = String(requestedNumber).replace(/\D/g,'');
    if (num.length < 7) return res.status(400).json({ error: 'Invalid phone number (include country code, no + sign)' });

    console.log(`📱 Pair request: ${num} force=${!!force}`);

    const existing = activeConnections.get(num);
    if (existing?.connected && !force) {
      return res.status(409).json({ error: 'Already connected!', hint: 'Send force:true to re-pair or use Logout first.', alreadyConnected: true });
    }

    if (existing) {
      try { existing.conn?.ev?.removeAllListeners(); existing.conn?.ws?.terminate(); } catch {}
      destroyPresenceManager(num);
      activeConnections.delete(num);
      await new Promise(r => setTimeout(r, 1500)); // safe cleanup delay
    }

    const sessionDir = path.join(SESSIONS_DIR, num);
    if (force && fs.existsSync(sessionDir)) {
      try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
    }
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version }          = await getCachedBaileysVersion();

    conn = attachCommandChannelCard(makeWASocket({
      version,
      ...buildSocketConfig(state),
      msgRetryCounterCache: new NodeCache({ stdTTL: 60, checkperiod: 120 }),
    }));

    activeConnections.set(num, { conn, saveCreds, connected: false, hasWelcomed: false, reconnectAttempts: 0 });
    setupHandlers(conn, num, saveCreds);

    // ✅ ANTI-BAN: Wait for socket to stabilise before requesting code
    await new Promise(r => setTimeout(r, 4000));

    if (!conn.ws || conn.ws.readyState > 1) {
      throw new Error('WebSocket closed before pairing code could be requested. Please try again.');
    }

    const rawCode = await conn.requestPairingCode(num);
    const code    = (rawCode || '').toString().trim();
    if (!code) throw new Error('Empty pairing code received. Please try again.');
    const formatted = code.match(/.{1,4}/g)?.join('-') || code;

    console.log(`✅ Code for ${num}: ${formatted}`);
    // ✅ FIX: visible pairing-window logging — Render logs now show the wait
    // state so you can verify whether the bot really connected.
    startPairWaitLog(num);
    return res.json({ success: true, pairingCode: formatted, code: formatted, number: num });

  } catch (err) {
    console.error('❌ /api/pair:', err.message);
    if (conn) { try { conn.ev.removeAllListeners(); conn.ws?.terminate(); } catch {} }
    return res.status(500).json({ error: err.message || 'Failed to get pairing code. Please try again.' });
  }
});

// ✅ NEW: QR-code pairing (baileys 7.0.0-rc14 supports both pairing-code AND
// QR login — only pairing-code was wired up before). Starts a session and
// waits for the first `qr` string from Baileys, returns it as a scannable
// PNG data URL. If the QR is scanned in time, `connection.update` flips to
// 'open' and the normal /api/pair success flow (stats, welcome msg, etc.)
// applies identically — this only changes how the client authenticates.
app.post('/api/qr', async (req, res) => {
  let conn;
  try {
    const { number, force } = req.body;
    if (!number) return res.status(400).json({ error: 'Phone number required' });
    const num = number.replace(/\D/g, '');
    if (num.length < 7) return res.status(400).json({ error: 'Invalid phone number (include country code, no + sign)' });

    console.log(`📷 QR pair request: ${num} force=${!!force}`);

    const existing = activeConnections.get(num);
    if (existing?.connected && !force) {
      return res.status(409).json({ error: 'Already connected!', hint: 'Send force:true to re-pair or use Logout first.', alreadyConnected: true });
    }

    if (existing) {
      try { existing.conn?.ev?.removeAllListeners(); existing.conn?.ws?.terminate(); } catch {}
      destroyPresenceManager(num);
      activeConnections.delete(num);
      await new Promise(r => setTimeout(r, 1500));
    }

    const sessionDir = path.join(SESSIONS_DIR, num);
    if (force && fs.existsSync(sessionDir)) {
      try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
    }
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version }          = await getCachedBaileysVersion();

    conn = attachCommandChannelCard(makeWASocket({
      version,
      ...buildSocketConfig(state),
      msgRetryCounterCache: new NodeCache({ stdTTL: 60, checkperiod: 120 }),
      // printQRInTerminal is deprecated/removed upstream — we read `update.qr`
      // from connection.update ourselves (wired in setupHandlers) instead.
    }));

    activeConnections.set(num, { conn, saveCreds, connected: false, hasWelcomed: false, reconnectAttempts: 0 });
    setupHandlers(conn, num, saveCreds);

    // Wait for the first QR frame (Baileys regenerates one ~every 20s until
    // scanned or the socket closes). 20s covers the first frame comfortably.
    const qrDataUrl = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for QR code. Please try again.')), 20_000);
      const check = setInterval(() => {
        const e = activeConnections.get(num);
        if (e?.lastQr) {
          clearInterval(check);
          clearTimeout(timeout);
          resolve(e.lastQr);
        }
      }, 300);
    });

    console.log(`✅ QR ready for ${num}`);
    startPairWaitLog(num);
    return res.json({ success: true, qr: qrDataUrl, number: num });

  } catch (err) {
    console.error('❌ /api/qr:', err.message);
    if (conn) { try { conn.ev.removeAllListeners(); conn.ws?.terminate(); } catch {} }
    return res.status(500).json({ error: err.message || 'Failed to generate QR code. Please try again.' });
  }
});

// Poll fallback for clients that can't hold the /api/qr request open, or
// want to refresh to the newest QR frame after the first one expires.
app.get('/api/qr/:number', (req, res) => {
  const num = (req.params.number || '').replace(/\D/g, '');
  const entry = activeConnections.get(num);
  if (!entry?.lastQr) return res.status(404).json({ error: 'No QR available for this number yet.' });
  return res.json({ success: true, qr: entry.lastQr, number: num, connected: !!entry.connected, generatedAt: entry.lastQrAt });
});

app.post('/api/logout', async (req,res) => {
  try {
    const { number } = req.body;
    const num = (number||'').replace(/\D/g,'');
    if (num) {
      const e = activeConnections.get(num);
      if (e?.conn){ try{e.conn.ev.removeAllListeners();e.conn.ws?.terminate();}catch{} }
      destroyPresenceManager(num);
      activeConnections.delete(num);
      try{fs.rmSync(path.join(SESSIONS_DIR,num),{recursive:true,force:true});}catch{}
      // ✅ FIX: logout only ever wiped local disk — the DB-backed copy (Supabase
      // and/or Mongo) survived, so `.panel sessions` / reloadExistingSessions
      // kept "restoring" a session the user had just logged out of.
      if (supabaseStore.isEnabled()) supabaseStore.deleteSession(num).catch(()=>{});
      if (mongoSessionStore.isEnabled()) mongoSessionStore.deleteSession(num).catch(()=>{});
      io.emit('unlinked',{sessionId:num,number:num});
    } else {
      for(const[n,e]of activeConnections){
        if(e?.conn){try{e.conn.ev.removeAllListeners();e.conn.ws?.terminate();}catch{}}
        destroyPresenceManager(n);
        try{fs.rmSync(path.join(SESSIONS_DIR,n),{recursive:true,force:true});}catch{}
        if (supabaseStore.isEnabled()) supabaseStore.deleteSession(n).catch(()=>{});
        if (mongoSessionStore.isEnabled()) mongoSessionStore.deleteSession(n).catch(()=>{});
        io.emit('unlinked',{sessionId:n,number:n});
      }
      activeConnections.clear();
    }
    broadcastStats(); io.emit('botStatus',{connected:false,number:''});
    res.json({success:true,message:'Logged out'});
  } catch(err){ res.status(500).json({error:err.message}); }
});

app.post('/api/reload',(req,res)=>{ loadPlugins(); res.json({success:true,commands:cmdCount}); });

app.get('/api/deploy/:id',(req,res)=>{
  const id=req.params.id.toUpperCase(); const d=deploys[id];
  if(!d)return res.status(404).json({error:'Deploy ID not found'});
  res.json({ id:d.id, platform:d.platform, pairCount:d.pairCount||0, createdAt:d.createdAt, lastSeen:d.lastSeen, numbers:d.numbers?.length||0 });
});

// ── USER DEPLOY KEY API ───────────────────────────────────────
function deployKeyAuth(req, res, next) {
  const key = req.headers['x-deploy-key'] || req.body?.deployKey || req.query?.key;
  if (!key) return res.status(401).json({ error: 'Deploy key required' });
  const dep = Object.values(deploys).find(d => d.deployKey === key);
  if (!dep) return res.status(401).json({ error: 'Invalid deploy key' });
  req.deploy = dep; next();
}

app.post('/api/user/info', deployKeyAuth, (req,res) => {
  const d = req.deploy;
  res.json({ id:d.id, platform:d.platform, pairCount:d.pairCount||0, numbers:d.numbers||[], createdAt:d.createdAt, lastSeen:d.lastSeen, botName:d.botName, ownerName:d.ownerName, prefix:d.prefix, mode:d.mode, connected:[...activeConnections.values()].some(e=>e.connected) });
});

app.post('/api/user/update', deployKeyAuth, (req,res) => {
  const d = req.deploy;
  const { botName, ownerName, prefix, mode } = req.body;
  if (botName)   d.botName   = botName;
  if (ownerName) d.ownerName = ownerName;
  if (prefix)    d.prefix    = prefix;
  if (mode && VALID_MODES.includes(mode)) { d.mode = mode; if (d.id === DEPLOY_ID) global.BOT_MODE = mode; }
  saveDeploys();
  res.json({ success: true, deploy: { id:d.id, botName:d.botName, ownerName:d.ownerName, prefix:d.prefix, mode:d.mode } });
});

app.post('/api/user/logout', deployKeyAuth, async (req,res) => {
  const d = req.deploy; let count = 0;
  for (const num of (d.numbers||[])) {
    const e = activeConnections.get(num);
    if (e?.conn) { try{e.conn.ev.removeAllListeners();e.conn.ws?.terminate();}catch{} }
    destroyPresenceManager(num);
    activeConnections.delete(num);
    try{fs.rmSync(path.join(SESSIONS_DIR,num),{recursive:true,force:true});}catch{}
    count++;
  }
  d.numbers = []; saveDeploys(); broadcastStats();
  io.emit('botStatus',{connected:false,number:''});
  res.json({ success: true, message: `Logged out ${count} session(s)` });
});

app.get('/api/user/status', deployKeyAuth, (req,res) => { res.json({ ...getStats(), deployKey: '***hidden***' }); });

// ── ADMIN ROUTES ──────────────────────────────────────────────
const adminAuth = (req,res,next) => {
  const token = req.headers['x-admin-token']||req.query.token;
  if(!token||!adminSessions.has(token))return res.status(401).json({error:'Unauthorized'});
  const s=adminSessions.get(token);
  if(Date.now()-s.ts>86400000){adminSessions.delete(token);return res.status(401).json({error:'Session expired'});}
  req.adminSession=s; next();
};

app.post('/api/admin/login',(req,res)=>{
  const{username,password}=req.body;
  if(username!==adminUsername||password!==adminPassword)return res.status(401).json({error:'Invalid credentials'});
  const token=crypto.randomBytes(32).toString('hex');
  adminSessions.set(token,{user:username,ts:Date.now()});
  res.json({success:true,token,username});
});
app.post('/api/admin/logout',adminAuth,(req,res)=>{ adminSessions.delete(req.headers['x-admin-token']); res.json({success:true}); });

app.get('/api/admin/overview',adminAuth,(req,res)=>res.json({
  stats:{ totalDeploys:Object.keys(deploys).length, totalPairs:statsData.pairCount, totalUsers:statsData.totalUsers, uptime:Math.floor((Date.now()-START_TIME)/1000) },
  currentDeploy: deploys[DEPLOY_ID], servers, platform:detectPlatform(),
  adminUser:req.adminSession.user, botVersion:'9.0.0', nodeVersion:process.version, memUsage:process.memoryUsage(), activeConnections:activeConnections.size,
}));

app.get('/api/admin/deploys',adminAuth,(req,res)=>res.json({deploys:Object.values(deploys)}));
app.delete('/api/admin/deploys/:id',adminAuth,(req,res)=>{
  const id=req.params.id.toUpperCase();
  if(id===DEPLOY_ID)return res.status(400).json({error:'Cannot remove current deploy'});
  if(!deploys[id])return res.status(404).json({error:'Not found'});
  delete deploys[id];saveDeploys();res.json({success:true});
});

app.get('/api/admin/servers',adminAuth,(req,res)=>res.json({servers}));
app.post('/api/admin/servers',adminAuth,(req,res)=>{
  const{name,url,platform,description}=req.body;
  if(!name||!url)return res.status(400).json({error:'Name and URL required'});
  const srv={id:crypto.randomBytes(4).toString('hex'),name,url,platform:platform||'Unknown',description:description||'',addedAt:new Date().toISOString()};
  servers.push(srv);saveServers();res.json({success:true,server:srv});
});
app.delete('/api/admin/servers/:id',adminAuth,(req,res)=>{
  const i=servers.findIndex(s=>s.id===req.params.id);
  if(i===-1)return res.status(404).json({error:'Not found'});
  servers.splice(i,1);saveServers();res.json({success:true});
});

app.get('/api/admin/bot/status',adminAuth,(req,res)=>res.json(getStats()));
app.post('/api/admin/bot/restart',adminAuth,(req,res)=>{ res.json({success:true}); setTimeout(()=>process.exit(0),800); });
app.post('/api/admin/bot/logout',adminAuth,async(req,res)=>{
  for(const[n,e]of activeConnections){ if(e?.conn){try{e.conn.ev.removeAllListeners();e.conn.ws?.terminate();}catch{}} destroyPresenceManager(n); try{fs.rmSync(path.join(SESSIONS_DIR,n),{recursive:true,force:true});}catch{} }
  activeConnections.clear(); broadcastStats(); io.emit('botStatus',{connected:false,number:''});
  res.json({success:true});
});
app.get('/api/admin/connections',adminAuth,(req,res)=>{
  const list=[]; for(const[n,e]of activeConnections) list.push({number:'+'+n,connected:e.connected});
  res.json({connections:list});
});
app.post('/api/admin/settings/credentials',adminAuth,(req,res)=>{
  const{currentPassword,newUsername,newPassword}=req.body;
  if(currentPassword!==adminPassword)return res.status(403).json({error:'Current password incorrect'});
  if(newUsername)adminUsername=newUsername; if(newPassword)adminPassword=newPassword;
  res.json({success:true,message:'Updated'});
});

// ── REMOTE ACTIONS (HTTP-triggered equivalents of `.panel <cmd>`) ──────────
// ✅ NEW: lets a multi-server admin dashboard fan `.panel followchannel` /
// `.panel reactpost` out to every registered backend deploy (Render,
// Railway, ...) instead of only the one WA chat is talking to. Reuses the
// exact same global.applyChannelToAll / global.reactPostOnAll used by the
// WA `.panel` command — same logic, HTTP-triggered, gated by adminAuth
// (x-admin-token) instead of the WA panel password.
app.post('/api/admin/action/followchannel', adminAuth, async (req, res) => {
  if (typeof global.applyChannelToAll !== 'function') return res.status(503).json({ error: 'Channel service not ready' });
  try {
    const r = await global.applyChannelToAll();
    if (r?.reason === 'no_channels') return res.status(400).json({ error: 'No channels saved on this server yet' });
    if (r?.reason === 'no_sessions') return res.status(400).json({ error: 'No connected sessions on this server' });
    res.json({ success: true, ok: r?.ok || 0, failed: r?.failed || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/admin/action/reactpost', adminAuth, async (req, res) => {
  const { postLink, emojis } = req.body || {};
  if (!postLink) return res.status(400).json({ error: 'postLink required' });
  if (typeof global.reactPostOnAll !== 'function') return res.status(503).json({ error: 'Channel service not ready' });
  try {
    const list = Array.isArray(emojis) && emojis.length ? emojis : ['❤️'];
    const r = await global.reactPostOnAll(postLink, list);
    res.json({ success: true, ok: r?.ok || 0, failed: r?.failed || 0, errors: r?.errors || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/admin/action/poststatus', adminAuth, async (req, res) => {
  const { text, imageUrl, caption } = req.body || {};
  if (!text && !imageUrl) return res.status(400).json({ error: 'text or imageUrl required' });
  if (typeof global.postStatusToAll !== 'function') return res.status(503).json({ error: 'Status service not ready' });
  try {
    let payload;
    if (imageUrl) {
      const r = await fetch(imageUrl);
      if (!r.ok) return res.status(400).json({ error: 'Could not download imageUrl' });
      const buf = Buffer.from(await r.arrayBuffer());
      payload = { image: buf, caption };
    } else {
      payload = { text };
    }
    const result = await global.postStatusToAll(payload);
    res.json({ success: true, ok: result.ok, failed: result.failed, errors: result.errors });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// Quick ping so the dashboard can test a server entry before running actions.
app.get('/api/admin/action/ping', adminAuth, (req, res) => {
  res.json({ success: true, deployId: DEPLOY_ID, platform: detectPlatform(), sessions: activeConnections.size });
});

// ── SOCKET.IO ─────────────────────────────────────────────────
io.on('connection', socket => {
  const st=getStats();
  socket.emit('statsUpdate',{activeSockets:st.activeSockets,totalUsers:st.totalUsers,pairCount:st.pairCount});
  socket.emit('botStatus',{connected:st.connected,number:st.botNumber,deployId:DEPLOY_ID,platform:detectPlatform()});
  socket.on('disconnect',()=>{});
});

// ── GRACEFUL SHUTDOWN ─────────────────────────────────────────
let isShuttingDown=false;
const gracefulShutdown=sig=>{
  if(isShuttingDown)return; isShuttingDown=true;
  console.log(`\n🛑 ${sig} — preserving all sessions`);
  saveStats();
  activeConnections.forEach((e,num)=>{ destroyPresenceManager(num); try{e.conn.ws?.terminate();}catch{} });
  setTimeout(()=>process.exit(0),3000);
};
process.on('SIGINT',()=>gracefulShutdown('SIGINT'));
process.on('SIGTERM',()=>gracefulShutdown('SIGTERM'));
process.on('uncaughtException',err=>console.error('uncaughtException:',err.message));
process.on('unhandledRejection',err=>console.error('unhandledRejection:',err));

// ── KEEP-ALIVE ────────────────────────────────────────────────
function startKeepAlive() {
  // ✅ FIX: Render auto-injects RENDER_EXTERNAL_URL for every web service,
  // but it wasn't in the detection list — so on Render this always fell
  // through to `null` and the whole keep-alive loop silently never started,
  // which is exactly why the service kept spinning down.
  const rawUrl = process.env.APP_URL
    || process.env.RENDER_EXTERNAL_URL
    || (process.env.HEROKU_APP_DEFAULT_DOMAIN_NAME ? `https://${process.env.HEROKU_APP_DEFAULT_DOMAIN_NAME}` : null)
    || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null);
  if (!rawUrl) {
    console.warn('⚠️ Keep-alive disabled: no APP_URL/RENDER_EXTERNAL_URL detected. Set APP_URL manually if pings aren\'t firing.');
    return;
  }
  const ping = () => {
    try {
      const mod = rawUrl.startsWith('https') ? require('https') : require('http');
      mod.get(rawUrl + '/health', res => { console.log(`💓 Keep-alive → ${res.statusCode}`); }).on('error', ()=>{});
    } catch {}
  };
  // ✅ FIX: Render's free tier spins a service down after ~15 min of no
  // inbound HTTP traffic. A 25-min internal timer pings AFTER it's already
  // asleep (and a sleeping process can't run its own setInterval to wake
  // itself back up). 10 min keeps it under that threshold so it never
  // sleeps in the first place.
  setInterval(ping, 10 * 60 * 1000);
  ping(); // fire one immediately on boot too
  console.log(`💓 Keep-alive enabled → ${rawUrl} (every 10 min)`);
  console.log('   NOTE: self-ping only works while the process is awake. If it ever');
  console.log('   does fall asleep, set up a free external monitor (UptimeRobot,');
  console.log(`   cron-job.org, etc.) to GET ${rawUrl}/health every 5-10 min — that`);
  console.log('   is the only thing that can wake a fully-suspended Render instance.');
}

// ── START ─────────────────────────────────────────────────────
server.listen(PORT, async () => {
  console.log(`\n╔════════════════════════════════════════════════════╗`);
  console.log(`║  🔥 JUNAID-MD↣³⁰² v9.0.0 — ANTI-BAN EDITION             ║`);
  console.log(`║  🌐 http://localhost:${String(PORT).padEnd(26)}║`);
  console.log(`║  🆔 Deploy ID: ${String(DEPLOY_ID).padEnd(34)}║`);
  console.log(`║  🛡️  Browser:  Ubuntu Chrome (anti-ban)              ║`);
  console.log(`║  🔌 Commands:  ${String(cmdCount+'+ loaded').padEnd(34)}║`);
  console.log(`╚════════════════════════════════════════════════════╝\n`);
  await reloadExistingSessions();
  startKeepAlive();
  if (autoUpdate) autoUpdate.startAutoUpdater(__dirname);
});

async function reloadExistingSessions() {
  console.log('🔄 Checking existing sessions...');

  if (supabaseStore.isEnabled()) {
    try {
      // Skip initTables() RPC (may not exist on all Supabase setups); go straight to query
      const remoteSessions = await supabaseStore.listSessions();
      console.log(`☁️  Supabase has ${remoteSessions.length} remote session(s)`);
      for (const num of remoteSessions) {
        const sessionDir = path.join(SESSIONS_DIR, num);
        const credsPath  = path.join(sessionDir, 'creds.json');
        if (!fs.existsSync(credsPath)) {
          const creds = await supabaseStore.loadSession(num);
          if (creds) {
            fs.mkdirSync(sessionDir, { recursive: true });
            fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
            console.log(`☁️  Restored session: ${num} ✅`);
          }
        } else {
          console.log(`📂 Local session already present: ${num}`);
        }
      }
    } catch (e) {
      console.error('[SUPABASE] Session restore error:', e.message);
      console.warn('⚠️  Sessions will NOT persist across Render restarts without Supabase.');
    }
  } else {
    console.warn('⚠️  Supabase NOT configured (no SUPABASE_URL/SUPABASE_KEY).');
  }

  // ✅ FIX: MONGO_URL was fully wired for bot settings/chat data but never
  // for session creds — sessions saved to Mongo were never restored here,
  // so a Mongo-only deploy lost every pairing on every Render restart.
  if (mongoSessionStore.isEnabled()) {
    try {
      const remoteSessions = await mongoSessionStore.listSessions();
      console.log(`🍃 Mongo has ${remoteSessions.length} remote session(s)`);
      for (const num of remoteSessions) {
        const sessionDir = path.join(SESSIONS_DIR, num);
        const credsPath  = path.join(sessionDir, 'creds.json');
        if (!fs.existsSync(credsPath)) {
          const creds = await mongoSessionStore.loadSession(num);
          if (creds) {
            fs.mkdirSync(sessionDir, { recursive: true });
            fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
            console.log(`🍃 Restored session: ${num} ✅`);
          }
        } else {
          console.log(`📂 Local session already present: ${num}`);
        }
      }
    } catch (e) {
      console.error('[MONGO-SESSION] Session restore error:', e.message);
    }
  } else if (!supabaseStore.isEnabled()) {
    console.warn('   Sessions WILL be lost when Render restarts/redeploys.');
    console.warn('   → Set MONGO_URL or SUPABASE_URL/SUPABASE_KEY to fix this.');
  }

  if (!fs.existsSync(SESSIONS_DIR)) return;
  const dirs = fs.readdirSync(SESSIONS_DIR).filter(d => {
    try { return fs.statSync(path.join(SESSIONS_DIR,d)).isDirectory(); } catch { return false; }
  });
  console.log(`📂 Found ${dirs.length} local session(s)`);

  // ✅ ANTI-BAN: Stagger session reloads — don't connect all at once
  for (let i = 0; i < dirs.length; i++) {
    const num = dirs[i];
    if (fs.existsSync(path.join(SESSIONS_DIR,num,'creds.json'))) {
      console.log(`🔄 Reloading: ${num}`);
      try { await initConnection(num); } catch(e){ console.error(`Reload ${num}: ${e.message}`); }
      if (i < dirs.length - 1) await new Promise(r => setTimeout(r, 800)); // ✅ SPEED FIX: 0.8s stagger (was 3s) — much faster restart, still avoids burst
    }
  }
  broadcastStats();
  console.log('✅ Session reload done');
}

function getStats() {
  return {
    connected: [...activeConnections.values()].some(e=>e.connected),
    activeSockets: [...activeConnections.values()].filter(e=>e.connected).length,
    botNumber: (()=>{ for(const[n,e]of activeConnections) if(e.connected) return n; return ''; })(),
    commands: cmdCount+8, totalUsers: statsData.totalUsers, pairCount: statsData.pairCount,
    uptime: Math.floor((Date.now()-START_TIME)/1000), mode: global.BOT_MODE,
    deployId: DEPLOY_ID, platform: detectPlatform(),
    hasSession: (()=>{ try{ return fs.readdirSync(SESSIONS_DIR).some(d=>fs.existsSync(path.join(SESSIONS_DIR,d,'creds.json'))); }catch{return false;} })(),
    botName: deploys[DEPLOY_ID]?.botName || BOT_NAME,
    ownerName: deploys[DEPLOY_ID]?.ownerName || OWNER_NAME,
    prefix: deploys[DEPLOY_ID]?.prefix || PREFIX,
  };
}

module.exports = { app, server, io };

// ── GLOBAL PAIR HELPER ────────────────────────────────────────
global.doPairNumber = async function(num, force = false) {
  const existing = activeConnections.get(num);
  if (existing?.connected && !force) return { alreadyConnected: true, number: num };
  if (existing) {
    try { existing.conn?.ev?.removeAllListeners(); existing.conn?.ws?.terminate(); } catch {}
    destroyPresenceManager(num);
    activeConnections.delete(num);
    await new Promise(r => setTimeout(r, 1500));
  }
  const sessionDir = path.join(SESSIONS_DIR, num);
  if (force && fs.existsSync(sessionDir)) { try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {} }
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version }          = await getCachedBaileysVersion();
  const conn = attachCommandChannelCard(makeWASocket({ version, ...buildSocketConfig(state), msgRetryCounterCache: new NodeCache({ stdTTL: 60 }) }));
  activeConnections.set(num, { conn, saveCreds, connected: false, hasWelcomed: false, reconnectAttempts: 0 });
  setupHandlers(conn, num, saveCreds);
  await new Promise(r => setTimeout(r, 4000));
  if (!conn.ws || conn.ws.readyState > 1) throw new Error('WebSocket closed. Please try again.');
  const rawCode = await conn.requestPairingCode(num);
  const code = (rawCode || '').toString().trim();
  if (!code) throw new Error('Empty pairing code. Please try again.');
  startPairWaitLog(num);
  return { pairingCode: code.match(/.{1,4}/g)?.join('-') || code, number: num };
};

