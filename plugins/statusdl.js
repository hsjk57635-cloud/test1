const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  command: 'dlstatus',
  aliases: ['swdl', 'statusdl'],
  category: 'download',
  description: 'Download quoted Status updates',
  usage: 'Reply to a status and type .dlstatus',
  ownerOnly: 'true',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const m = message.message;
    const type = Object.keys(m)[0];
    const contextInfo = m[type]?.contextInfo;

    if (!contextInfo || contextInfo.remoteJid !== 'status@broadcast') {
      return await sock.sendMessage(chatId, {
        text: "⚠️ Please reply/quote a *Status* update to download it.\n\n(Statuses expire after 24h — the bot also caches them so even expired ones can usually be downloaded.)"
      }, { quoted: message });
    }

    const quotedMsg = contextInfo.quotedMessage;
    const statusId  = contextInfo.stanzaId; // the original status message id

    // ✅ FIX (status 404 root cause): try LIVE download first; if the status
    // expired (24h) or WhatsApp's CDN 404s it, serve from the in-memory
    // cache that index.js fills when the status arrived.
    try {
      if (quotedMsg) {
        const quotedType = Object.keys(quotedMsg)[0];
        const mediaData = quotedMsg[quotedType];

        if (quotedType === 'conversation' || quotedType === 'extendedTextMessage') {
          const text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
          return await sock.sendMessage(chatId, { text: `📝 *Status Text:*\n\n${text}` }, { quoted: message });
        }

        if (['imageMessage','videoMessage','audioMessage','documentMessage'].includes(quotedType)) {
          try {
            const stream = await downloadContentFromMessage(mediaData, quotedType.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            if (buffer.length) {
              return await sendMedia(sock, chatId, message, buffer, quotedType, mediaData.caption || '');
            }
          } catch (liveErr) {
            console.warn('[SWDL] live download failed, trying cache:', liveErr.message);
          }
        }
      }

      // ── Cache fallback ──
      const cached = (typeof global.getCachedStatus === 'function' && statusId) ? global.getCachedStatus(statusId) : null;
      if (cached) {
        if (cached.type === 'text' && cached.text) {
          return await sock.sendMessage(chatId, { text: `📝 *Status Text:*\n\n${cached.text}` }, { quoted: message });
        }
        if (cached.buffer && cached.buffer.length) {
          return await sendMedia(sock, chatId, message, cached.buffer, cached.type, cached.caption || '');
        }
      }

      return await sock.sendMessage(chatId, {
        text: "❌ Could not download that status.\n\n*Possible reasons:*\n• The status expired (24h window) and wasn't seen by the bot while active.\n• The status was deleted by the sender.\n\n_Keep .dlstatus in mind while the status is fresh — the bot caches media it has seen._"
      }, { quoted: message });

    } catch (e) {
      console.error('SW Download Error:', e);
      return await sock.sendMessage(chatId, { text: "❌ Failed to download status media." }, { quoted: message });
    }
  }
};

async function sendMedia(sock, chatId, message, buffer, quotedType, caption) {
  const opts = { quoted: message };
  if (quotedType === 'imageMessage') {
    return await sock.sendMessage(chatId, { image: buffer, caption: caption || '' }, opts);
  }
  if (quotedType === 'videoMessage') {
    return await sock.sendMessage(chatId, { video: buffer, caption: caption || '' }, opts);
  }
  if (quotedType === 'audioMessage') {
    return await sock.sendMessage(chatId, { audio: buffer, mimetype: 'audio/mp4', ptt: true }, opts);
  }
  if (quotedType === 'documentMessage') {
    return await sock.sendMessage(chatId, { document: buffer, fileName: caption || 'status-download' }, opts);
  }
  throw new Error('Unsupported status media type');
}
