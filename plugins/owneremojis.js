'use strict';
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const { isOwnerOnly, cleanJid } = require('../lib/isOwner');

const CFG_FILE = path.join(process.cwd(), 'data', 'owneremojis.json');
const DEFAULT_EMOJIS = ['❤️','🔥','😍','🥰','💯','👑','✨','💖','🤩','😎','💫','🤝'];
let attachedSock = null;
let lastReact = 0;

function readCfg() {
  try { if (fs.existsSync(CFG_FILE)) return JSON.parse(fs.readFileSync(CFG_FILE, 'utf8')); } catch {}
  return { enabled: false, emojis: DEFAULT_EMOJIS };
}
function writeCfg(cfg) {
  try { fs.mkdirSync(path.dirname(CFG_FILE), {recursive:true}); fs.writeFileSync(CFG_FILE, JSON.stringify(cfg, null, 2)); } catch {}
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getSender(m) { return m?.key?.participant || m?.key?.remoteJid || ''; }

function connectedOwner(sock) {
  return cleanJid(sock?.user?.id || '');
}

function attachListener(sock) {
  if (attachedSock === sock) return;
  attachedSock = sock;
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const cfg = readCfg();
    if (!cfg.enabled) return;
    const emojis = Array.isArray(cfg.emojis) && cfg.emojis.length ? cfg.emojis : DEFAULT_EMOJIS;
    for (const m of messages || []) {
      if (!m?.message || m.message.reactionMessage || m.message.protocolMessage || m.key?.remoteJid === 'status@broadcast') continue;
      const sender = getSender(m);
      // In group chats, outgoing owner messages have participant/remoteJid values
      // that can be the group JID. Treat fromMe as the connected owner account.
      const owner = m.key?.fromMe
        ? true
        : isOwnerOnly(cleanJid(sender));
      if (!owner) continue;
      // Ignore our own reaction/update messages; react to normal owner messages.
      if (m.message.reactionMessage || m.message.protocolMessage) continue;
      if (Date.now() - lastReact < 1500) continue;
      lastReact = Date.now();
      try { await sock.sendMessage(m.key.remoteJid, { react: { text: pick(emojis), key: m.key } }); } catch {}
    }
  });
}

module.exports = {
  command: 'owneremojis',
  aliases: ['owneremoji', 'oemoji'],
  category: 'owner',
  description: 'Automatically react to the real owner/co-owner messages.',
  usage: '.owneremojis on | off | status | emoji ❤️ 🔥 😍',
  strictOwner: true,
  async handler(sock, message, args, context) {
    const { chatId } = context;
    const reply = (text) => sock.sendMessage(chatId, { text, ...(settings.channelInfo || {}) }, { quoted: message });
    const cfg = readCfg();
    const sub = (args[0] || 'status').toLowerCase();
    attachListener(sock);
    if (sub === 'on') { cfg.enabled = true; writeCfg(cfg); return reply('✅ Owner Auto-Reaction *ON*\n\nअब Owner के messages पर automatic emoji reaction आएगा.'); }
    if (sub === 'off') { cfg.enabled = false; writeCfg(cfg); return reply('❌ Owner Auto-Reaction *OFF*'); }
    if (sub === 'emoji') {
      const pool = args.slice(1).join(' ').trim().split(/\s+/).filter(Boolean);
      if (!pool.length) return reply('❌ Example: `.owneremojis emoji ❤️ 🔥 😍 💯`');
      cfg.emojis = pool; writeCfg(cfg); return reply(`✅ Owner emoji pool updated:\n${pool.join(' ')}`);
    }
    return reply(`👑 *OWNER EMOJIS*\n\nStatus: ${cfg.enabled ? '✅ ON' : '❌ OFF'}\nEmojis: ${(cfg.emojis || DEFAULT_EMOJIS).join(' ')}\n\n.owneremojis on\n.owneremojis off\n.owneremojis emoji ❤️ 🔥 😍`);
  }
};
