// plugins/goodbye.js – Simplified & professional with poetry
const { isGoodByeOn, getGoodbye, addGoodbye, delGoodBye } = require('../lib/index');
const fetch = require('node-fetch');
const settings = require('../settings');

// Default values
const DEFAULT_BOT_NAME = settings.botName || 'JUNAID-MD↣³⁰²';

// Fixed image settings (no customisation)
const IMAGE_API = 'https://api.some-random-api.com/welcome/img/2/';
const IMAGE_STYLE = 'gaming1';   // gaming1 often used for leaves
const IMAGE_COLOR = 'red';
const USE_AVATAR = true;

// Professional default message with a poetic line
const DEFAULT_MESSAGE = `👋 *Farewell* {user} 👋

🌙 *You have left* {group}

⏰ *Left at:* {time}
👥 *Remaining members:* #{count}

⚙️ *Powered by* {botname}

✨ *Though you are gone, your presence lingers.*
*May your journey ahead be bright and full of wonders.*
*You will always be remembered here.*`;

module.exports = {
  command: 'goodbye',
  aliases: ['bye', 'leave'],
  category: 'admin',
  description: 'Configure goodbye messages',
  usage: '.goodbye [on|off|set <message>]',
  groupOnly: true,
  adminOnly: true,

  async handler(sock, message, args, context) {
    const { chatId } = context;
    const matchText = args.join(' ');

    if (!matchText) {
      const isEnabled = await isGoodByeOn(chatId);
      const status = isEnabled ? '✅ enabled' : '❌ disabled';
      return sock.sendMessage(chatId, {
        text: `📤 *Goodbye Message Setup*\n\n` +
          `Status: ${status}\n\n` +
          `*Commands:*\n` +
          `• .goodbye on — enable goodbye messages\n` +
          `• .goodbye off — disable goodbye messages\n` +
          `• .goodbye set <your message> — set a custom message\n\n` +
          `*Available variables:* {user}, {group}, {time}, {count}, {botname}\n\n` +
          `*Default message includes a poetic line.*`,
        quoted: message
      });
    }

    const [command, ...args2] = matchText.split(' ');
    const lowerCommand = command.toLowerCase();

    if (lowerCommand === 'on') {
      if (await isGoodByeOn(chatId)) {
        return sock.sendMessage(chatId, { text: '⚠️ Goodbye messages are *already enabled*.', quoted: message });
      }
      await addGoodbye(chatId, true, DEFAULT_MESSAGE);
      return sock.sendMessage(chatId, { text: '✅ Goodbye messages *enabled* with a professional poetic message. Use *.goodbye set* to customise.', quoted: message });
    }

    if (lowerCommand === 'off') {
      if (!(await isGoodByeOn(chatId))) {
        return sock.sendMessage(chatId, { text: '⚠️ Goodbye messages are *already disabled*.', quoted: message });
      }
      await delGoodBye(chatId);
      return sock.sendMessage(chatId, { text: '✅ Goodbye messages *disabled*.', quoted: message });
    }

    if (lowerCommand === 'set') {
      const customMessage = args2.join(' ');
      if (!customMessage) {
        return sock.sendMessage(chatId, { text: '⚠️ Please provide a custom goodbye message. Example: *.goodbye set Goodbye {user}, we will miss you!*', quoted: message });
      }
      await addGoodbye(chatId, true, customMessage);
      return sock.sendMessage(chatId, { text: '✅ Custom goodbye message *set successfully*.', quoted: message });
    }

    return sock.sendMessage(chatId, {
      text: `❌ Unknown command. Use:\n.goodbye on\n.goodbye off\n.goodbye set <message>`,
      quoted: message
    });
  }
};

// ========== LEAVE EVENT HANDLER ==========
async function handleLeaveEvent(sock, id, participants) {
  const isEnabled = await isGoodByeOn(id);
  if (!isEnabled) return;

  const customMessage = await getGoodbye(id);
  const groupMetadata = await sock.groupMetadata(id);
  const groupName = groupMetadata.subject;
  const memberCount = groupMetadata.participants.length; // after removal

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

      // Try to get display name (may fail after leave)
      let displayName = user;
      try {
        const contact = await sock.getBusinessProfile(participantString);
        if (contact && contact.name) displayName = contact.name;
        else {
          const userParticipant = groupMetadata.participants.find(p => p.id === participantString);
          if (userParticipant && userParticipant.name) displayName = userParticipant.name;
        }
      } catch (nameError) {
        console.log('Could not fetch display name, using phone number');
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
        .replace(/{time}/g, timeString)
        .replace(/{count}/g, memberCount)
        .replace(/{botname}/g, botName);

      // Try to generate a goodbye image
      try {
        let profilePicUrl = '';
        if (USE_AVATAR) {
          try {
            const profilePic = await sock.profilePictureUrl(participantString, 'image');
            if (profilePic) profilePicUrl = profilePic;
          } catch (profileError) {
            console.log('Could not fetch profile picture');
          }
        }
        if (!profilePicUrl) {
          profilePicUrl = `https://img.pyrocdn.com/dbKUgahg.png`;
        }

        const apiUrl = `${IMAGE_API}${IMAGE_STYLE}?type=leave&textcolor=${IMAGE_COLOR}&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${memberCount}&avatar=${encodeURIComponent(profilePicUrl)}`;

        const response = await fetch(apiUrl);
        if (response.ok) {
          const imageBuffer = await response.buffer();
          await sock.sendMessage(id, {
            image: imageBuffer,
            caption: finalMessage,
            mentions: [participantString],
            ...channelInfo
          });
          continue; // image sent, skip text fallback
        }
      } catch (imageError) {
        console.log('Goodbye image generation failed, falling back to text');
      }

      // Text fallback
      await sock.sendMessage(id, {
        text: finalMessage,
        mentions: [participantString],
        ...channelInfo
      });
    } catch (error) {
      console.error('Error sending goodbye message:', error);
      const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
      const user = participantString.split('@')[0];
      const fallbackMessage = `Goodbye @${user}! 👋`;
      await sock.sendMessage(id, { text: fallbackMessage, mentions: [participantString], ...channelInfo });
    }
  }
}

module.exports.handleLeaveEvent = handleLeaveEvent;
