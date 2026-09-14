const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');
const warningsPath = path.join(__dirname, '../data/warnings.json');
const hasDb = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || process.env.DB_URL);
async function load() {
  if (hasDb) return (await store.getSetting('global', 'warnings')) || {};
  if (!fs.existsSync(warningsPath)) return {};
  try { return JSON.parse(fs.readFileSync(warningsPath, 'utf8')) || {}; } catch { return {}; }
}
module.exports = {
  command: 'warnings', aliases: ['checkwarn', 'warncount'], category: 'admin',
  description: 'Check a member warning count', usage: '.warnings @user', groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const ci = message.message?.extendedTextMessage?.contextInfo || {};
    const target = ci.mentionedJid?.[0] || ci.participant;
    if (!target) return sock.sendMessage(chatId, { text: '❌ Mention or reply to a user.\n\nUsage: `.warnings @user`' }, { quoted: message });
    const data = await load();
    const count = Number(data?.[chatId]?.[target] || 0);
    return sock.sendMessage(chatId, { text: `⚠️ *Warning Count*\n\n👤 @${String(target).split('@')[0]}\n⚠️ Warnings: *${count}/3*`, mentions: [target] }, { quoted: message });
  }
};
