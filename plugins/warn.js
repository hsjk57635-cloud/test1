const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const warningsPath = path.join(__dirname, '../data/warnings.json');
const hasDb = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || process.env.DB_URL);

function ensureFile() {
  const dir = path.dirname(warningsPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(warningsPath)) fs.writeFileSync(warningsPath, '{}');
}
async function loadWarnings() {
  if (hasDb) return (await store.getSetting('global', 'warnings')) || {};
  ensureFile();
  try { return JSON.parse(fs.readFileSync(warningsPath, 'utf8')) || {}; } catch { return {}; }
}
async function saveWarnings(data) {
  if (hasDb) return store.saveSetting('global', 'warnings', data);
  ensureFile();
  fs.writeFileSync(warningsPath, JSON.stringify(data, null, 2));
}
function cleanJid(jid) {
  return String(jid || '').trim().split(':')[0].replace(/[^0-9]/g, '');
}
async function resolveTarget(sock, chatId, message) {
  const ci = message.message?.extendedTextMessage?.contextInfo || {};
  const mentioned = ci.mentionedJid?.[0];
  const replied = ci.participant;
  const raw = mentioned || replied;
  if (!raw) return null;
  if (String(raw).endsWith('@s.whatsapp.net')) return raw;
  try {
    const meta = await sock.groupMetadata(chatId);
    const rawNum = cleanJid(raw);
    const p = (meta?.participants || []).find(x => {
      const vals = [x?.id, x?.lid, x?.phoneNumber, x?.pn];
      return vals.some(v => String(v || '') === String(raw)) ||
        (rawNum && vals.some(v => cleanJid(v) === rawNum));
    });
    if (p?.phoneNumber && String(p.phoneNumber).includes('@s.whatsapp.net')) return p.phoneNumber;
    if (p?.pn && String(p.pn).includes('@s.whatsapp.net')) return p.pn;
    if (p?.id && String(p.id).includes('@s.whatsapp.net')) return p.id;
  } catch (e) { console.warn('[WARN] target resolve:', e.message); }
  return raw;
}

module.exports = {
  command: 'warn',
  aliases: ['warning'],
  category: 'admin',
  description: 'Warn a group member; auto-remove after 3 warnings',
  usage: '.warn @user or reply to a message',
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderId = context.senderId || message.key.participant || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const target = await resolveTarget(sock, chatId, message);
    if (!target) {
      return sock.sendMessage(chatId, { text: '❌ Mention a user or reply to their message.\n\nUsage: `.warn @user`', ...channelInfo }, { quoted: message });
    }
    const warnings = await loadWarnings();
    if (!warnings[chatId]) warnings[chatId] = {};
    const key = target;
    const count = (warnings[chatId][key] || 0) + 1;
    warnings[chatId][key] = count;
    const tag = `@${String(target).split('@')[0]}`;
    if (count >= 3) {
      try {
        await sock.groupParticipantsUpdate(chatId, [target], 'remove');
        delete warnings[chatId][key];
        await saveWarnings(warnings);
        return sock.sendMessage(chatId, { text: `🚫 *AUTO KICK*\n\n${tag} has been removed after *3/3 warnings*.`, mentions: [target], ...channelInfo }, { quoted: message });
      } catch (e) {
        await saveWarnings(warnings);
        return sock.sendMessage(chatId, { text: `⚠️ ${tag} reached *3/3 warnings*, but I could not remove them.\n\nError: ${e.message}`, mentions: [target], ...channelInfo }, { quoted: message });
      }
    }
    await saveWarnings(warnings);
    return sock.sendMessage(chatId, { text: `⚠️ *WARNING*\n\n👤 ${tag}\n⚠️ Warnings: *${count}/3*\n👮 Warned by: @${String(senderId).split('@')[0]}\n\n${3-count} warning(s) remaining before removal.`, mentions: [target, senderId], ...channelInfo }, { quoted: message });
  }
};
