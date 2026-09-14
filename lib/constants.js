// lib/constants.js — JUNAID-MD↣³⁰² Global Constants — JUNAID-MD↣³⁰²
// ⚠️  All JIDs/links pulled from settings.js — edit there only
'use strict';
const settings = require('../settings');

module.exports = {
  /* ── Owner JIDs ──────────────────────────────────────────── */
  get CHANNEL_JID()    { return settings.channelJid; },
  get HOME_GROUP_JID() { return settings.whatsappGroup.replace('https://chat.whatsapp.com/', '') + '@g.us'; },
  OWNER_NUMBER: '923252352321',
  get OWNER_JID() { return `${this.OWNER_NUMBER}@s.whatsapp.net`; },

  /* ── Bot Info ─────────────────────────────────────────────── */
  BOT_NAME:   'JUNAID-MD↣³⁰²',
  BOT_VERSION: '9.0.0 ULTRA',
  get GITHUB_URL()    { return settings.githubRepo; },
  get PAIR_URL()      { return settings.pairSite; },
  get VPS_URL()       { return settings.vpsLink; },
  get CHANNEL_URL()   { return settings.channelLink; },
  get GROUP_URL()     { return settings.whatsappGroup; },
  OWNER_NAME: 'JUNAID-MD↣³⁰²',

  /* ── Newsletter contextInfo (ready-to-spread) ────────────── */
  get channelInfo() { return settings.channelInfo; },

  /* ── Helpers ──────────────────────────────────────────────── */
  async notifyChannel(sock, text, image) {
    try {
      const msg = image
        ? { image: { url: image }, caption: text }
        : { text };
      await sock.sendMessage(settings.channelJid, msg);
    } catch {}
  },
  async notifyGroup(sock, text, image) {
    try {
      const msg = image
        ? { image: { url: image }, caption: text }
        : { text };
      await sock.sendMessage(settings.whatsappGroup.includes('@g.us')
        ? settings.whatsappGroup
        : null, msg);
    } catch {}
  },
  async notifyOwner(sock, text) {
    try { await sock.sendMessage(`@s.whatsapp.net`, { text }); } catch {}
  },
};
