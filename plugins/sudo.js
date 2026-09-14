'use strict';

const { addSudo, removeSudo, getSudoList } = require('../lib');

function normaliseNumber(value = '') {
  return String(value).replace(/[^0-9]/g, '');
}

function senderJid(message, context = {}) {
  return context.senderId || message.key?.participant || message.key?.remoteJid || '';
}

function quotedParticipant(message) {
  const q = message.message?.extendedTextMessage?.contextInfo?.participant ||
            message.message?.imageMessage?.contextInfo?.participant ||
            message.message?.videoMessage?.contextInfo?.participant ||
            message.message?.documentMessage?.contextInfo?.participant || '';
  return q;
}

function mentionedParticipant(message) {
  const m = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  return Array.isArray(m) && m.length ? m[0] : '';
}

function targetJid(message, args = []) {
  const mentioned = mentionedParticipant(message);
  if (mentioned) return mentioned;

  const quoted = quotedParticipant(message);
  if (quoted) return quoted;

  const raw = String(args[0] || '').trim();
  if (!raw) return '';
  if (raw.includes('@')) return raw;
  const num = normaliseNumber(raw);
  return num ? `${num}@s.whatsapp.net` : '';
}

function displayJid(jid) {
  return String(jid || '').replace(/@s\.whatsapp\.net$/i, '');
}

module.exports = [{
  command: 'sudo',
  aliases: ['addsudo', 'setsudo'],
  category: 'owner',
  description: 'Add, remove, or list sudo users',
  usage: '.sudo <number/@mention/reply> | .sudo del <number/@mention/reply> | .sudo list',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key?.remoteJid;
    const sub = String(args[0] || '').toLowerCase();

    if (['list', 'ls', 'all'].includes(sub)) {
      const list = await getSudoList();
      if (!list.length) return sock.sendMessage(chatId, { text: '📋 *Sudo List*\n\nNo sudo users added yet.' }, { quoted: message });
      return sock.sendMessage(chatId, {
        text: `📋 *Sudo List*\n\n${list.map((j, i) => `${i + 1}. ${displayJid(j)}`).join('\n')}`
      }, { quoted: message });
    }

    const isRemove = ['del', 'delete', 'remove', 'rm', 'off'].includes(sub);
    const targetArgs = isRemove ? args.slice(1) : args;
    const jid = targetJid(message, targetArgs);

    if (!jid) {
      return sock.sendMessage(chatId, {
        text: '🛡️ *Sudo Command*\n\n• `.sudo 923xxxxxxxxx` — add sudo\n• `.sudo del 923xxxxxxxxx` — remove sudo\n• `.sudo list` — show sudo list\n• You can also mention or reply to a user.'
      }, { quoted: message });
    }

    if (isRemove) {
      await removeSudo(jid);
      return sock.sendMessage(chatId, { text: `✅ Sudo removed from *${displayJid(jid)}*.` }, { quoted: message });
    }

    await addSudo(jid);
    return sock.sendMessage(chatId, { text: `✅ *${displayJid(jid)}* is now a sudo user.` }, { quoted: message });
  }
}];
