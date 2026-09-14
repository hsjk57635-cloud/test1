'use strict';
/*****************************************************************************
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *  🔗  Telegram : https://t.me/Hamza302bot                              *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *****************************************************************************/

require('dotenv').config();

module.exports = {
  // ── BOT IDENTITY ─────────────────────────────────────────────
  // ✅ FIX: these four were getter-only. Several commands do
  // `settings.botName = value` etc. after saving to the DB — under
  // 'use strict' (which most plugin bundles declare) that THROWS
  // "Cannot set property X of #<Object> which has only a getter",
  // crashing .botname / .setprefix / .panel setprefix / .panel setowner
  // before they could send their success reply. Real get+set now, so
  // runtime overrides actually take effect instead of throwing.
  _prefixesOverride: null,
  get prefixes()      { return this._prefixesOverride || [process.env.PREFIX || '.']; },
  set prefixes(v)     { this._prefixesOverride = v; },
  _botNameOverride: null,
  get botName()       { return this._botNameOverride || process.env.BOT_NAME || '🔥 JUNAID-MD↣³⁰² 🔥'; },
  set botName(v)      { this._botNameOverride = v; },
  get botOwner()     { return process.env.OWNER_NAME     || 'JUNAID-MD↣³⁰²'; },
  _ownerNumberOverride: null,
  get ownerNumber()   { return this._ownerNumberOverride || process.env.OWNER_NUMBER || '923252352321'; },
  set ownerNumber(v)  { this._ownerNumberOverride = v; },
  get botDesc()      { return process.env.BOT_DESC       || 'Powered by JUNAID-MD↣³⁰² 🔥'; },
  get version()      { return process.env.BOT_VERSION    || 'v9.0 ULTRA'; },

  // ── BOT SETTINGS ──────────────────────────────────────────────
  get prefix()       { return this.prefixes[0]; },
  get mode()         { return process.env.BOT_MODE       || 'public'; },
  // ✅ FIX: was hardcoded to 'heroku' regardless of where the bot actually
  // runs — menu/smenu always showed "Platform: HEROKU" even on Render or
  // Railway. Auto-detects from the same env vars each host sets, same logic
  // index.js's detectPlatform() already used elsewhere — now consistent.
  get platform() {
    if (process.env.PLATFORM)            return process.env.PLATFORM;
    if (process.env.RENDER)              return 'Render';
    if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
    if (process.env.DYNO)                return 'Heroku';
    return 'Local';
  },
  // ✅ FIX: menu/smenu referenced settings.timeZone but it was never
  // defined here — always undefined, silently falling back to a hardcoded
  // 'Asia/Karachi' with no way to change it. Now configurable via env.
  get timeZone()     { return process.env.TIMEZONE       || process.env.TZ || 'Asia/Karachi'; },

  // ── MEDIA ─────────────────────────────────────────────────────
  get botDp()         { return this._botDpOverride || process.env.MENU_IMAGE || 'https://i.ibb.co/QFQk0DGy/jawadmd.jpg'; },
  set botDp(v)        { this._botDpOverride = v; },
  _botDpOverride: null,
  get menuImage()    { return process.env.MENU_IMAGE     || 'https://i.ibb.co/QFQk0DGy/jawadmd.jpg'; },

  // ── LINKS ─────────────────────────────────────────────────────
  get whatsappGroup(){ return process.env.WA_GROUP       || 'https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f'; },
  get telegramGroup(){ return process.env.TG_GROUP       || 'https://t.me/Hamza302bot'; },
  get repoLink()     { return process.env.REPO_LINK      || 'https://github.com/AbdulRehman19721986/REDXBOT-MD'; },
  get newsletterJid(){ return process.env.NEWSLETTER_JID || '120363408055942569@newsletter'; },
  get newsletterName(){ return 'JUNAID-MD↣³⁰²'; },
  get channelInfo(){
    return {
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: this.newsletterJid,
          newsletterName: 'JUNAID-MD↣³⁰²',
          serverMessageId: -1
        }
      }
    };
  },

  // ── PAIRING (no SESSION_ID – pair only) ───────────────────────
  get pairingNumber(){ return process.env.PAIRING_NUMBER || process.env.OWNER_NUMBER || '923252352321'; },

  // ── DATABASE ──────────────────────────────────────────────────
  get mongoUrl()     { return process.env.MONGO_URL      || ''; },
  get postgresUrl()  { return process.env.POSTGRES_URL   || ''; },
  get mysqlUrl()     { return process.env.MYSQL_URL      || ''; },
  get sqliteUrl()    { return process.env.DB_URL         || ''; },

  // ── ADMIN PANEL ───────────────────────────────────────────────
  get adminUser()    { return process.env.ADMIN_USERNAME || 'redx'; },
  get adminPass()    { return process.env.ADMIN_PASSWORD || 'redx'; },

  // ── APIS (from verbose-fishstick config) ──────────────────────
  APIs: {
    xteam:    'https://api.xteam.xyz',
    dzx:      'https://api.dhamzxploit.my.id',
    lol:      'https://api.lolhuman.xyz',
    violetics:'https://violetics.pw',
    neoxr:    'https://api.neoxr.my.id',
    zenzapis: 'https://zenzapis.xyz',
    akuari:   'https://api.akuari.my.id',
    akuari2:  'https://apimu.my.id',
    nrtm:     'https://fg-nrtm.ddns.net',
    bg:       'http://bochil.ddns.net',
    fgmods:   'https://api-fgmods.ddns.net'
  },
  APIKeys: {
    'https://api.xteam.xyz':       'd90a9e986e18778b',
    'https://api.lolhuman.xyz':    '85faf717d0545d14074659ad',
    'https://api.neoxr.my.id':     'yourkey',
    'https://violetics.pw':        'beta',
    'https://zenzapis.xyz':        'yourkey',
    'https://api-fgmods.ddns.net': 'fg-dylux'
  },

  // ── WARN SETTINGS ─────────────────────────────────────────────
  WARN_COUNT: 3,

  // ── MISC ──────────────────────────────────────────────────────
  get maxStoreMessages() { return parseInt(process.env.MAX_STORE_MESSAGES) || 50; },
};
