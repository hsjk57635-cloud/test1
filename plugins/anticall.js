/*****************************************************************************
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *****************************************************************************/

const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const ANTICALL_PATH = './data/anticall.json';
const MEDIA_DIR = path.join(process.cwd(), 'data', 'anticall_media');
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

const DEFAULT_RING_DURATION = 0; // 0 seconds = reject immediately
const DEFAULT_TEXT_MESSAGE = "📵 *Don't call me!*\n\nYour boss is busy right now. 🔥\n\nPlease use text messages instead. 🙏";

// Track processed call IDs to avoid duplicate actions
const processedCalls = new Set();
setInterval(() => processedCalls.clear(), 60 * 1000);

// Helper to download media from a quoted message
async function downloadMediaFromReply(message, sock) {
  try {
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) throw new Error('No quoted message found.');
    let mediaMsg, mediaType;
    if (quotedMsg.audioMessage) {
      mediaMsg = quotedMsg.audioMessage;
      mediaType = 'audio';
    } else if (quotedMsg.videoMessage) {
      mediaMsg = quotedMsg.videoMessage;
      mediaType = 'video';
    } else if (quotedMsg.stickerMessage) {
      mediaMsg = quotedMsg.stickerMessage;
      mediaType = 'sticker';
    } else if (quotedMsg.imageMessage) {
      mediaMsg = quotedMsg.imageMessage;
      mediaType = 'image';
    } else if (quotedMsg.documentMessage) {
      mediaMsg = quotedMsg.documentMessage;
      mediaType = 'document';
    } else {
      throw new Error('Unsupported media type.');
    }
    const stream = await downloadContentFromMessage(mediaMsg, mediaType);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const mimetype = mediaMsg.mimetype || (mediaType === 'audio' ? 'audio/mpeg' : 'image/jpeg');
    let ptt = false, gifPlayback = false;
    if (mediaType === 'audio' && quotedMsg.audioMessage?.ptt) ptt = true;
    if (mediaType === 'video' && quotedMsg.videoMessage?.gifPlayback) gifPlayback = true;
    return { buffer, mimetype, mediaType, originalName: mediaMsg.fileName || 'media', ptt, gifPlayback };
  } catch (err) {
    throw new Error(`Failed to download media: ${err.message}`);
  }
}

async function readState() {
  try {
    if (HAS_DB) {
      const settings = await store.getSetting('global', 'anticall');
      return settings || {
        enabled: false,
        ringDuration: DEFAULT_RING_DURATION,
        blockAfterReject: false,
        textMessage: DEFAULT_TEXT_MESSAGE,
        mediaPath: null,
        mediaType: null,
        mediaMimetype: null,
        mediaCaption: '',
        sendMode: 'text',
        whitelist: [],
        blacklist: []
      };
    } else {
      if (!fs.existsSync(ANTICALL_PATH)) {
        return {
          enabled: false,
          ringDuration: DEFAULT_RING_DURATION,
          blockAfterReject: false,
          textMessage: DEFAULT_TEXT_MESSAGE,
          mediaPath: null,
          mediaType: null,
          mediaMimetype: null,
          mediaCaption: '',
          sendMode: 'text',
          whitelist: [],
          blacklist: []
        };
      }
      const raw = fs.readFileSync(ANTICALL_PATH, 'utf8');
      const data = JSON.parse(raw || '{}');
      return {
        enabled: !!data.enabled,
        ringDuration: data.ringDuration ?? DEFAULT_RING_DURATION,
        blockAfterReject: !!data.blockAfterReject,
        textMessage: data.textMessage || DEFAULT_TEXT_MESSAGE,
        mediaPath: data.mediaPath || null,
        mediaType: data.mediaType || null,
        mediaMimetype: data.mediaMimetype || null,
        mediaCaption: data.mediaCaption || '',
        sendMode: data.sendMode || 'text',
        whitelist: Array.isArray(data.whitelist) ? data.whitelist : [],
        blacklist: Array.isArray(data.blacklist) ? data.blacklist : []
      };
    }
  } catch (err) {
    console.error('[anticall] readState error:', err);
    return {
      enabled: false,
      ringDuration: DEFAULT_RING_DURATION,
      blockAfterReject: false,
      textMessage: DEFAULT_TEXT_MESSAGE,
      mediaPath: null,
      mediaType: null,
      mediaMimetype: null,
      mediaCaption: '',
      sendMode: 'text',
      whitelist: [],
      blacklist: []
    };
  }
}

async function writeState(updates) {
  try {
    const current = await readState();
    const newState = { ...current, ...updates };
    if (HAS_DB) {
      await store.saveSetting('global', 'anticall', newState);
    } else {
      if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
      fs.writeFileSync(ANTICALL_PATH, JSON.stringify(newState, null, 2));
    }
  } catch (e) {
    console.error('[anticall] writeState error:', e);
  }
}

async function handleIncomingCall(sock, call) {
  try {
    const state = await readState();
    const callId = call.id;
    const callerJid = call.from;
    if (!callId || !callerJid) return;

    // Skip if already processed
    if (processedCalls.has(callId)) return;
    processedCalls.add(callId);

    // Priority 1: Whitelist (always allow)
    const isWhitelisted = state.whitelist.some(entry =>
      callerJid.includes(entry) || entry.includes(callerJid)
    );
    if (isWhitelisted) {
      console.log(`[anticall] Whitelisted caller ${callerJid}, allowing call.`);
      return; // allow call
    }

    // Priority 2: Blacklist (always reject)
    const isBlacklisted = state.blacklist.some(entry =>
      callerJid.includes(entry) || entry.includes(callerJid)
    );
    if (isBlacklisted) {
      console.log(`[anticall] Blacklisted caller ${callerJid}, rejecting.`);
      try {
        await sock.rejectCall(callId, callerJid);
        await sendRejectMessage(sock, callerJid, state);
        if (state.blockAfterReject) {
          await sock.updateBlockStatus(callerJid, 'block');
          console.log(`[anticall] Blocked ${callerJid}`);
        }
      } catch (err) {
        console.error('[anticall] Error processing blacklisted call:', err.message);
      }
      return;
    }

    // Priority 3: If anticall is not enabled, allow call
    if (!state.enabled) {
      console.log(`[anticall] Anticall off, allowing call from ${callerJid}`);
      return;
    }

    // Anticall is on and caller is not in any list → reject
    try {
      // Set presence to 'unavailable' to appear offline (non‑critical)
      try {
        await sock.sendPresenceUpdate('unavailable', callerJid);
      } catch (presenceErr) {
        console.error('[anticall] Presence update failed:', presenceErr.message);
      }

      // Reject after ring duration
      setTimeout(async () => {
        try {
          await sock.rejectCall(callId, callerJid);
          console.log(`[anticall] Rejected call from ${callerJid} after ${state.ringDuration}ms`);
          await sendRejectMessage(sock, callerJid, state);
          if (state.blockAfterReject) {
            await sock.updateBlockStatus(callerJid, 'block');
            console.log(`[anticall] Blocked ${callerJid}`);
          }
        } catch (rejectErr) {
          console.error('[anticall] Failed to reject call:', rejectErr.message);
        }
      }, state.ringDuration);
    } catch (err) {
      console.error('[anticall] handleIncomingCall error:', err.message);
    }
  } catch (err) {
    console.error('[anticall] handleIncomingCall outer error:', err.message);
  }
}

async function sendRejectMessage(sock, to, state) {
  try {
    const { sendMode, textMessage, mediaPath, mediaType, mediaMimetype, mediaCaption } = state;

    if (sendMode === 'text') {
      const msg = textMessage && textMessage.trim() ? textMessage : DEFAULT_TEXT_MESSAGE;
      await sock.sendMessage(to, { text: msg });
    } else if (sendMode === 'media') {
      if (mediaPath && fs.existsSync(mediaPath)) {
        const mediaBuffer = fs.readFileSync(mediaPath);
        let payload = {};
        switch (mediaType) {
          case 'image':
            payload = { image: mediaBuffer, caption: mediaCaption || undefined };
            break;
          case 'video':
            payload = { video: mediaBuffer, caption: mediaCaption || undefined, gifPlayback: false };
            break;
          case 'audio':
            payload = { audio: mediaBuffer, mimetype: mediaMimetype || 'audio/mpeg', ptt: false };
            break;
          case 'sticker':
            payload = { sticker: mediaBuffer };
            break;
          case 'document':
            payload = { document: mediaBuffer, mimetype: mediaMimetype || 'application/octet-stream', fileName: mediaCaption || 'document' };
            break;
          default:
            return;
        }
        await sock.sendMessage(to, payload);
      } else {
        // Fallback to text if media missing
        const msg = textMessage && textMessage.trim() ? textMessage : DEFAULT_TEXT_MESSAGE;
        await sock.sendMessage(to, { text: msg });
      }
    } else if (sendMode === 'both') {
      if (mediaPath && fs.existsSync(mediaPath)) {
        const mediaBuffer = fs.readFileSync(mediaPath);
        let payload = {};
        switch (mediaType) {
          case 'image':
            payload = { image: mediaBuffer, caption: mediaCaption || (textMessage || undefined) };
            break;
          case 'video':
            payload = { video: mediaBuffer, caption: mediaCaption || (textMessage || undefined), gifPlayback: false };
            break;
          case 'audio':
            payload = { audio: mediaBuffer, mimetype: mediaMimetype || 'audio/mpeg', ptt: false };
            break;
          case 'sticker':
            payload = { sticker: mediaBuffer };
            break;
          case 'document':
            payload = { document: mediaBuffer, mimetype: mediaMimetype || 'application/octet-stream', fileName: mediaCaption || 'document' };
            break;
          default:
            return;
        }
        await sock.sendMessage(to, payload);
      } else {
        // Fallback to text
        const msg = textMessage && textMessage.trim() ? textMessage : DEFAULT_TEXT_MESSAGE;
        await sock.sendMessage(to, { text: msg });
      }
    }
  } catch (err) {
    console.error('[anticall] sendRejectMessage error:', err.message);
  }
}

// Short guide (shown when user types .anticall alone)
const shortGuide = (state) => {
  const status = state.enabled ? '✅ ENABLED' : '❌ DISABLED';
  const storage = HAS_DB ? 'Database' : 'File System';
  return `*📵 ANTICALL SETUP*\n\n` +
         `Current Status: ${status}\n` +
         `Storage: ${storage}\n\n` +
         `Commands:\n` +
         `• .anticall on - Enable\n` +
         `• .anticall off - Disable\n` +
         `• .anticall status - Show settings\n` +
         `• .anticall guide - Full help\n\n` +
         `Features:\n` +
         `• Auto‑reject calls\n` +
         `• Whitelist / Blacklist\n` +
         `• Custom text/media replies\n` +
         `• Optional caller blocking`;
};

// Full usage (shown when user types .anticall guide)
const fullGuide = `
*📵 ANTICALL COMMANDS*

*BASIC*
• .anticall on        – Enable anticall (blocks all except whitelist)
• .anticall off       – Disable anticall (allows all except blacklist)
• .anticall status    – Show current settings

*RING & BLOCK*
• .anticall ring <seconds> – Set ring duration (0 = immediate)
• .anticall block on|off   – Enable/disable auto‑block after reject
• .anticall blockstatus    – Show block setting

*MESSAGING*
• .anticall text <text>    – Set text message (use 'off' to disable)
• .anticall media          – Set media (reply to image/video/audio/sticker/doc)
• .anticall mode text|media|both – Choose what to send
• .anticall reset          – Clear text and media

*LISTS*
• .anticall whitelist add <number>   – Always allow this number
• .anticall whitelist remove <number>– Remove from whitelist
• .anticall whitelist remove all     – Clear entire whitelist
• .anticall whitelist list           – List whitelisted numbers
• .anticall blacklist add <number>   – Always block this number
• .anticall blacklist remove <number>– Remove from blacklist
• .anticall blacklist remove all     – Clear entire blacklist
• .anticall blacklist list           – List blacklisted numbers

*EXAMPLES*
• .anticall whitelist add 1234567890
• .anticall blacklist add 9876543210
• .anticall text "Don't call me, I'm busy!"
• .anticall mode both
`;

module.exports = {
  command: 'anticall',
  aliases: ['acall', 'callblock'],
  category: 'owner',
  description: 'Auto‑block incoming calls with silent ring, custom message/media, whitelist/blacklist.',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const state = await readState();
    const sub = args.join(' ').trim().toLowerCase();

    // If no arguments, show short guide
    if (!sub) {
      return await sock.sendMessage(chatId, { text: shortGuide(state), ...channelInfo }, { quoted: message });
    }

    // Guide command
    if (sub === 'guide' || sub === 'help') {
      return await sock.sendMessage(chatId, { text: fullGuide, ...channelInfo }, { quoted: message });
    }

    // Ring duration
    if (sub.startsWith('ring ')) {
      const seconds = parseInt(sub.split(' ')[1], 10);
      if (isNaN(seconds) || seconds < 0) {
        return await sock.sendMessage(
          chatId,
          { text: '❌ Please provide a valid number of seconds (0 = immediate).', ...channelInfo },
          { quoted: message }
        );
      }
      await writeState({ ringDuration: seconds * 1000 });
      return await sock.sendMessage(
        chatId,
        { text: `🔔 Ring duration set to *${seconds} second${seconds !== 1 ? 's' : ''}*.`, ...channelInfo },
        { quoted: message }
      );
    }

    // Text message
    if (sub.startsWith('text ')) {
      const msgText = sub.slice(5).trim();
      if (msgText === '' || msgText === 'off') {
        await writeState({ textMessage: DEFAULT_TEXT_MESSAGE });
        return await sock.sendMessage(
          chatId,
          { text: '📵 Custom text message disabled. Using default message.', ...channelInfo },
          { quoted: message }
        );
      } else {
        await writeState({ textMessage: msgText });
        return await sock.sendMessage(
          chatId,
          { text: `📝 Custom text message set to:\n\n“${msgText}”`, ...channelInfo },
          { quoted: message }
        );
      }
    }

    // Set media (reply to media message)
    if (sub === 'media') {
      try {
        const media = await downloadMediaFromReply(message, sock);
        const ext = media.mediaType === 'sticker' ? 'webp' :
                    media.mediaType === 'image' ? 'jpg' :
                    media.mediaType === 'video' ? 'mp4' :
                    media.mediaType === 'audio' ? (media.mimetype.includes('ogg') ? 'ogg' : 'mp3') :
                    media.mediaType === 'document' ? (media.originalName?.split('.').pop() || 'bin') : 'bin';
        const fileName = `anticall_${Date.now()}.${ext}`;
        const filePath = path.join(MEDIA_DIR, fileName);
        fs.writeFileSync(filePath, media.buffer);
        await writeState({
          mediaPath: filePath,
          mediaType: media.mediaType,
          mediaMimetype: media.mimetype,
          mediaCaption: ''
        });
        return await sock.sendMessage(
          chatId,
          { text: `✅ Media reply set.\nType: ${media.mediaType}\nSize: ${(media.buffer.length / 1024).toFixed(2)} KB`, ...channelInfo },
          { quoted: message }
        );
      } catch (err) {
        return await sock.sendMessage(
          chatId,
          { text: `❌ Failed to set media: ${err.message}`, ...channelInfo },
          { quoted: message }
        );
      }
    }

    // Mode
    if (sub === 'mode text') {
      await writeState({ sendMode: 'text' });
      return await sock.sendMessage(chatId, { text: '📝 Send mode set to *text only*.', ...channelInfo }, { quoted: message });
    }
    if (sub === 'mode media') {
      if (!state.mediaPath) {
        return await sock.sendMessage(chatId, { text: '❌ No media set. Use `.anticall media` first.', ...channelInfo }, { quoted: message });
      }
      await writeState({ sendMode: 'media' });
      return await sock.sendMessage(chatId, { text: '🎨 Send mode set to *media only*.', ...channelInfo }, { quoted: message });
    }
    if (sub === 'mode both') {
      if (!state.mediaPath) {
        return await sock.sendMessage(chatId, { text: '❌ No media set. Use `.anticall media` first.', ...channelInfo }, { quoted: message });
      }
      await writeState({ sendMode: 'both' });
      return await sock.sendMessage(chatId, { text: '🔁 Send mode set to *both* (media + text caption).', ...channelInfo }, { quoted: message });
    }

    // Reset
    if (sub === 'reset') {
      await writeState({
        textMessage: DEFAULT_TEXT_MESSAGE,
        mediaPath: null,
        mediaType: null,
        mediaMimetype: null,
        mediaCaption: '',
        sendMode: 'text'
      });
      return await sock.sendMessage(chatId, { text: '🔄 Reset text and media to defaults. Send mode set to text.', ...channelInfo }, { quoted: message });
    }

    // Whitelist commands
    if (sub.startsWith('whitelist ')) {
      const parts = sub.split(' ');
      const action = parts[1];
      const number = parts[2];
      if (action === 'add' && number) {
        const normalized = number.replace(/[^0-9]/g, '');
        if (!normalized) return await sock.sendMessage(chatId, { text: '❌ Invalid number.', ...channelInfo }, { quoted: message });
        const whitelist = [...state.whitelist];
        if (!whitelist.includes(normalized)) whitelist.push(normalized);
        await writeState({ whitelist });
        return await sock.sendMessage(chatId, { text: `✅ Added *${normalized}* to whitelist.`, ...channelInfo }, { quoted: message });
      }
      if (action === 'remove' && number) {
        const normalized = number.replace(/[^0-9]/g, '');
        const whitelist = state.whitelist.filter(n => n !== normalized);
        await writeState({ whitelist });
        return await sock.sendMessage(chatId, { text: `❌ Removed *${normalized}* from whitelist.`, ...channelInfo }, { quoted: message });
      }
      if (action === 'remove' && number === 'all') {
        await writeState({ whitelist: [] });
        return await sock.sendMessage(chatId, { text: '🗑️ Cleared entire whitelist.', ...channelInfo }, { quoted: message });
      }
      if (action === 'list') {
        const list = state.whitelist.length ? state.whitelist.join(', ') : '(none)';
        return await sock.sendMessage(chatId, { text: `📋 *Whitelist:*\n${list}`, ...channelInfo }, { quoted: message });
      }
      return await sock.sendMessage(chatId, { text: '❌ Usage: .anticall whitelist add|remove|list <number> or remove all', ...channelInfo }, { quoted: message });
    }

    // Blacklist commands
    if (sub.startsWith('blacklist ')) {
      const parts = sub.split(' ');
      const action = parts[1];
      const number = parts[2];
      if (action === 'add' && number) {
        const normalized = number.replace(/[^0-9]/g, '');
        if (!normalized) return await sock.sendMessage(chatId, { text: '❌ Invalid number.', ...channelInfo }, { quoted: message });
        const blacklist = [...state.blacklist];
        if (!blacklist.includes(normalized)) blacklist.push(normalized);
        await writeState({ blacklist });
        return await sock.sendMessage(chatId, { text: `✅ Added *${normalized}* to blacklist.`, ...channelInfo }, { quoted: message });
      }
      if (action === 'remove' && number) {
        const normalized = number.replace(/[^0-9]/g, '');
        const blacklist = state.blacklist.filter(n => n !== normalized);
        await writeState({ blacklist });
        return await sock.sendMessage(chatId, { text: `❌ Removed *${normalized}* from blacklist.`, ...channelInfo }, { quoted: message });
      }
      if (action === 'remove' && number === 'all') {
        await writeState({ blacklist: [] });
        return await sock.sendMessage(chatId, { text: '🗑️ Cleared entire blacklist.', ...channelInfo }, { quoted: message });
      }
      if (action === 'list') {
        const list = state.blacklist.length ? state.blacklist.join(', ') : '(none)';
        return await sock.sendMessage(chatId, { text: `📋 *Blacklist:*\n${list}`, ...channelInfo }, { quoted: message });
      }
      return await sock.sendMessage(chatId, { text: '❌ Usage: .anticall blacklist add|remove|list <number> or remove all', ...channelInfo }, { quoted: message });
    }

    // Block after reject
    if (sub === 'block on') {
      await writeState({ blockAfterReject: true });
      return await sock.sendMessage(chatId, { text: '🔒 Callers will now be *blocked* after rejection.', ...channelInfo }, { quoted: message });
    }
    if (sub === 'block off') {
      await writeState({ blockAfterReject: false });
      return await sock.sendMessage(chatId, { text: '🔓 Callers will *not* be blocked after rejection.', ...channelInfo }, { quoted: message });
    }
    if (sub === 'blockstatus') {
      return await sock.sendMessage(chatId, { text: `🔒 *Block after reject:* ${state.blockAfterReject ? '✅ Enabled' : '❌ Disabled'}`, ...channelInfo }, { quoted: message });
    }

    // Status
    if (sub === 'status') {
      let msg = `*📵 ANTICALL STATUS*\n\n`;
      msg += `Status: ${state.enabled ? '✅ ENABLED' : '❌ DISABLED'}\n`;
      msg += `Ring Duration: ${state.ringDuration / 1000} seconds\n`;
      msg += `Block after reject: ${state.blockAfterReject ? '✅ Yes' : '❌ No'}\n`;
      msg += `Send mode: ${state.sendMode.toUpperCase()}\n`;
      msg += `Text message: ${state.textMessage ? (state.textMessage === DEFAULT_TEXT_MESSAGE ? 'Default' : 'Custom') : 'None'}\n`;
      msg += `Media: ${state.mediaPath ? '✅ Set' : '❌ None'}\n`;
      msg += `Whitelist: ${state.whitelist.length} numbers\n`;
      msg += `Blacklist: ${state.blacklist.length} numbers\n`;
      msg += `Storage: ${HAS_DB ? 'Database' : 'File System'}\n`;
      return await sock.sendMessage(chatId, { text: msg, ...channelInfo }, { quoted: message });
    }

    // Enable/Disable
    if (sub === 'on') {
      await writeState({ enabled: true });
      return await sock.sendMessage(chatId, { text: '✅ *Anticall ENABLED*', ...channelInfo }, { quoted: message });
    }
    if (sub === 'off') {
      await writeState({ enabled: false });
      return await sock.sendMessage(chatId, { text: '❌ *Anticall DISABLED*', ...channelInfo }, { quoted: message });
    }

    // Unknown command – show short guide
    return await sock.sendMessage(chatId, { text: shortGuide(state), ...channelInfo }, { quoted: message });
  },

  handleIncomingCall,
  readState,
  writeState
};
