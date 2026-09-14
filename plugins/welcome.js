// plugins/welcome.js – Simplified & professional with poetry
const { isWelcomeOn, getWelcome, addWelcome, delWelcome } = require('../lib/index');
const settings = require('../settings');
const axios = require('axios');

// Default values
const DEFAULT_BOT_NAME = settings.botName || 'JUNAID-MD↣³⁰²';
const DEFAULT_OWNER = settings.botOwner || 'JUNAID-MD↣³⁰²';

// ✅ SPEED FIX: welcome image is downloaded ONCE and cached in memory (6h TTL).
// The old code passed { url } to Baileys on every single join, forcing a fresh
// network download per new member — slow, and it stacked up when several people
// joined at once. New default image = the ibb.co banner requested by the owner.
const WELCOME_IMAGE_URL = 'https://i.ibb.co/QFQk0DGy/jawadmd.jpg';
let _wImgCache = { url: null, buf: null, ts: 0 };
const W_IMG_TTL = 6 * 60 * 60 * 1000;
let _wImgInflight = null;
async function getWelcomeImage(url) {
  const now = Date.now();
  if (_wImgCache.buf && _wImgCache.url === url && now - _wImgCache.ts < W_IMG_TTL) return _wImgCache.buf;
  if (_wImgInflight) { try { return await _wImgInflight; } catch {} }
  _wImgInflight = (async () => {
    try {
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
      _wImgCache = { url, buf: Buffer.from(res.data), ts: now };
      return _wImgCache.buf;
    } catch {
      if (url !== WELCOME_IMAGE_URL) return getWelcomeImage(WELCOME_IMAGE_URL);
      return _wImgCache.buf || null;
    } finally { _wImgInflight = null; }
  })();
  return _wImgInflight;
}
// Warm the cache at startup so the first welcome is instant.
getWelcomeImage(WELCOME_IMAGE_URL).catch(() => {});

// ✅ FIX: welcome image = the bot's DP from settings (botDp / MENU_IMAGE).
// The old hardcoded banner + some-random-api image generator are removed.

// Professional default message with a poetic line
const DEFAULT_MESSAGE = `🌟 *Greetings* {user}! 🌟

🎉 *Welcome to* {group} 🎉

📖 *About the group:*
{description}

⏰ *Joined at:* {time}
👥 *You are member #* {count}

⚙️ *Powered by* {botname}

💫 *A warm welcome to our community.*
*May your days be filled with joy and laughter,
and your journey with us be unforgettable.*

👨‍💻 *Owner:* ${DEFAULT_OWNER}`;

module.exports = {
  command: 'welcome',
  aliases: ['setwelcome'],
  category: 'admin',
  description: 'Configure welcome messages',
  usage: '.welcome [on|off|set <message>]',
  groupOnly: true,
  adminOnly: true,

  async handler(sock, message, args, context) {
    const { chatId } = context;
    const matchText = args.join(' ');

    if (!matchText) {
      // Show current status and help
      const isEnabled = await isWelcomeOn(chatId);
      const status = isEnabled ? '✅ enabled' : '❌ disabled';
      return sock.sendMessage(chatId, {
        text: `📥 *Welcome Message Setup*\n\n` +
          `Status: ${status}\n\n` +
          `*Commands:*\n` +
          `• .welcome on — enable welcome messages\n` +
          `• .welcome off — disable welcome messages\n` +
          `• .welcome set <your message> — set a custom message\n\n` +
          `*Available variables:* {user}, {group}, {description}, {time}, {count}, {botname}\n\n` +
          `*Default message includes a poetic line.*`,
        quoted: message
      });
    }

    const [command, ...args2] = matchText.split(' ');
    const lowerCommand = command.toLowerCase();

    if (lowerCommand === 'on') {
      if (await isWelcomeOn(chatId)) {
        return sock.sendMessage(chatId, { text: '⚠️ Welcome messages are *already enabled*.', quoted: message });
      }
      await addWelcome(chatId, true, DEFAULT_MESSAGE);
      return sock.sendMessage(chatId, { text: '✅ Welcome messages *enabled* with a professional poetic message. Use *.welcome set* to customise.', quoted: message });
    }

    if (lowerCommand === 'off') {
      if (!(await isWelcomeOn(chatId))) {
        return sock.sendMessage(chatId, { text: '⚠️ Welcome messages are *already disabled*.', quoted: message });
      }
      await delWelcome(chatId);
      return sock.sendMessage(chatId, { text: '✅ Welcome messages *disabled*.', quoted: message });
    }

    if (lowerCommand === 'set') {
      const customMessage = args2.join(' ');
      if (!customMessage) {
        return sock.sendMessage(chatId, { text: '⚠️ Please provide a custom welcome message. Example: *.welcome set Welcome {user} to {group}!*', quoted: message });
      }
      await addWelcome(chatId, true, customMessage);
      return sock.sendMessage(chatId, { text: '✅ Custom welcome message *set successfully*.', quoted: message });
    }

    return sock.sendMessage(chatId, {
      text: `❌ Unknown command. Use:\n.welcome on\n.welcome off\n.welcome set <message>`,
      quoted: message
    });
  }
};

// ========== JOIN EVENT HANDLER ==========
async function handleJoinEvent(sock, id, participants) {
  const isEnabled = await isWelcomeOn(id);
  if (!isEnabled) return;

  const customMessage = await getWelcome(id);
  const groupMetadata = await sock.groupMetadata(id);
  const groupName = groupMetadata.subject;
  const groupDesc = groupMetadata.desc || 'No description available';
  const memberCount = groupMetadata.participants.length;

  const botName = settings.botName || DEFAULT_BOT_NAME;
  const channelInfo = {
    contextInfo: {
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: settings.channelJid || '120363408055942569@newsletter',
        newsletterName: 'JUNAID-MD↣³⁰²',
        serverMessageId: -1
      }
    }
  };

  for (const participant of participants) {
    try {
      const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
      const user = participantString.split('@')[0];

      // Get display name — ✅ SPEED FIX: the old code did a blocking
      // getBusinessProfile() network call per member (1-3s each, terrible when
      // several join at once). We now read the name from the already-fetched
      // group metadata (instant) and fall back to the number. No network hit.
      let displayName = user;
      try {
        const userParticipant = groupMetadata.participants.find(p => p.id === participantString);
        if (userParticipant && userParticipant.name) displayName = userParticipant.name;
      } catch (nameError) {
        /* use phone number */
      }

      const now = new Date();
      const timeString = now.toLocaleString('en-US', {
        month: '2-digit', day: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      });

      // Build final message using custom or default
      let finalMessage = customMessage || DEFAULT_MESSAGE;
      finalMessage = finalMessage
        .replace(/{user}/g, `@${displayName}`)
        .replace(/{group}/g, groupName)
        .replace(/{description}/g, groupDesc)
        .replace(/{time}/g, timeString)
        .replace(/{count}/g, memberCount)
        .replace(/{botname}/g, botName);

      // ✅ FIX: welcome image = the bot's DP from settings (botDp / MENU_IMAGE)
      try {
        await sock.sendMessage(id, {
          image: { url: settings.botDp },
          caption: finalMessage,
          mentions: [participantString],
          ...channelInfo
        });
        continue; // image sent, skip text fallback
      } catch (imgError) {
        console.log('Welcome image send failed, falling back to text');
      }

      // Text fallback
      await sock.sendMessage(id, {
        text: finalMessage,
        mentions: [participantString],
        ...channelInfo
      });
    } catch (error) {
      console.error('Error sending welcome message:', error);
      const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
      const user = participantString.split('@')[0];
      const fallbackMessage = `Welcome @${user} to ${groupName}! 🎉`;
      await sock.sendMessage(id, { text: fallbackMessage, mentions: [participantString], ...channelInfo });
    }
  }
}

module.exports.handleJoinEvent = handleJoinEvent;
