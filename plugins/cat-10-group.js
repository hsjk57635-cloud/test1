'use strict';
// AUTO-GENERATED BUNDLE: cat-10-group
// Contains: welcome.js, goodbye.js, notes.js, poll.js, archivechat.js, broadcast.js, broadcastdm.js, schedule.js, schedulelist.js, schedulecancel.js, forward.js, autoForward.js, areact.js, autoreply.js, autostatus.js, autoread.js, autotyping.js, cmdreact.js, addreply.js, delreply.js, listreplies.js

const _bundle = [];


/* ===== welcome.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/welcome.js – Simplified & professional with poetry
const { isWelcomeOn, getWelcome, addWelcome, delWelcome } = require('../lib/index');
const settings = require('../settings');

// Default values
const DEFAULT_BOT_NAME = settings.botName || 'JUNAID-MD↣³⁰²';
const DEFAULT_OWNER = settings.botOwner || 'JUNAID-MD↣³⁰²';

// ✅ FIX: welcome image = the bot's DP from settings (botDp / MENU_IMAGE).
// The old some-random-api image generator is removed.

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

      // Get display name
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

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading welcome.js:', e.message); }

/* ===== goodbye.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
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
        newsletterJid: settings.channelJid || '120363319098372999@newsletter',
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

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading goodbye.js:', e.message); }

/* ===== notes.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

let notesDB = {};

async function getUserNotes(userId) {
  if (HAS_DB) {
    const notes = await store.getSetting(userId, 'notes');
    return notes || [];
  } else {
    return notesDB[userId] || [];
  }
}

async function saveUserNotes(userId, notes) {
  if (HAS_DB) {
    await store.saveSetting(userId, 'notes', notes);
  } else {
    notesDB[userId] = notes;
  }
}

module.exports = {
  command: 'notes',
  aliases: ['note'],
  category: 'menu',
  description: 'Store, view, and delete your personal notes',
  usage: '.notes <add|all|del|delall> [text|ID]',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;
    try {
      const action = args[0] ? args[0].toLowerCase() : null;
      const content = args.slice(1).join(" ").trim();

      const menuText = `
╭───── *『 NOTES 』* ───◆
┃ Store notes for later use
┃ Storage: ${HAS_DB ? 'Database 🗄️' : 'Memory 📁'}
┃
┃ ● Add Note
┃    .notes add your text here
┃
┃ ● Get All Notes
┃    .notes all
┃
┃ ● Delete Note
┃    .notes del noteID
┃
┃ ● Delete All Notes
┃    .notes delall
╰━━━━━━━━━━━━━━━━━──⊷`;

      if (!action) {
        return await sock.sendMessage(chatId, { text: menuText }, { quoted: message });
      }
      if (action === 'add') {
        if (!content) {
          return await sock.sendMessage(chatId, {
            text: "*Please write a note to save.*\nExample: .notes add buy milk"
          }, { quoted: message });
        }
        
        const userNotes = await getUserNotes(sender);
        const newID = userNotes.length + 1;
        userNotes.push({ id: newID, text: content, createdAt: Date.now() });
        await saveUserNotes(sender, userNotes);

        return await sock.sendMessage(chatId, {
          text: `✅ Note saved.\nID: ${newID}\nStorage: ${HAS_DB ? 'Database' : 'Memory'}`
        }, { quoted: message });
      }
      if (action === 'all') {
        const userNotes = await getUserNotes(sender);
        if (userNotes.length === 0) {
          return await sock.sendMessage(chatId, { text: "*You have no notes saved.*" }, { quoted: message });
        }

        const list = userNotes.map(n => `${n.id}. ${n.text}`).join("\n");
        return await sock.sendMessage(chatId, { 
          text: `*📝 Your Notes:*\n\n${list}\n\n_Total: ${userNotes.length} notes_` 
        }, { quoted: message });
      }
      if (action === 'del') {
        const id = parseInt(args[1]);
        const userNotes = await getUserNotes(sender);
        
        if (!id || !userNotes.find(n => n.id === id)) {
          return await sock.sendMessage(chatId, {
            text: "Invalid note ID.\nExample: .notes del 1"
          }, { quoted: message });
        }
        
        const filteredNotes = userNotes.filter(n => n.id !== id);
        await saveUserNotes(sender, filteredNotes);
        
        return await sock.sendMessage(chatId, { text: `*✅ Note ID ${id} deleted.*` }, { quoted: message });
      }
      if (action === 'delall') {
        const userNotes = await getUserNotes(sender);
        if (userNotes.length === 0) {
          return await sock.sendMessage(chatId, { text: "*You have no notes to delete.*" }, { quoted: message });
        }
        
        await saveUserNotes(sender, []);
        return await sock.sendMessage(chatId, { text: "*✅ All notes deleted successfully.*" }, { quoted: message });
      }
      return await sock.sendMessage(chatId, { text: menuText }, { quoted: message });

    } catch (err) {
      console.error("Notes Command Error:", err);
      await sock.sendMessage(chatId, { text: "❌ Error in notes module." }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading notes.js:', e.message); }

/* ===== poll.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

module.exports = {
    command: 'poll',
    aliases: ['createpoll', 'newpoll'],
    category: 'group',
    description: 'Create a native WhatsApp poll in the group',
    usage: '.poll <Question> | <Option1> | <Option2> | ...',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        const fullText = args.join(' ');
        const parts = fullText.split('|').map(p => p.trim()).filter(Boolean);

        if (parts.length < 3) {
            return await sock.sendMessage(chatId, {
                text: `*📊 CREATE A POLL*\n\n` +
                      `*Usage:*\n\`.poll <Question> | <Option1> | <Option2> | ...\`\n\n` +
                      `*Example:*\n\`.poll Favourite color? | Red | Blue | Green | Yellow\`\n\n` +
                      `_Minimum 2 options. Maximum 12 options._`,
                ...channelInfo
            }, { quoted: message });
        }

        const question = parts[0];
        const options = parts.slice(1);

        if (options.length > 12) {
            return await sock.sendMessage(chatId, {
                text: '❌ Maximum 12 options allowed.',
                ...channelInfo
            }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, {
                poll: {
                    name: question,
                    values: options,
                    selectableCount: 1
                }
            });
        } catch (e) {
            console.error('[POLL] Error sending poll:', e.message);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to create poll. Please try again.',
                ...channelInfo
            }, { quoted: message });
        }
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading poll.js:', e.message); }

/* ===== archivechat.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

module.exports = {
    command: 'archivechat',
    aliases: ['archive', 'unarchive', 'unarchivechat'],
    category: 'owner',
    description: 'Archive or unarchive the current chat',
    usage: '.archivechat <archive|unarchive>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const rawText = context.rawText || '';

        const isUnarchive = rawText.toLowerCase().startsWith('.unarchive');
        const action = args[0]?.toLowerCase() || (isUnarchive ? 'unarchive' : 'archive');

        if (!['archive', 'unarchive'].includes(action)) {
            return await sock.sendMessage(chatId, {
                text: `*📦 ARCHIVE CHAT*\n\n*Usage:*\n• \`.archivechat archive\` — Archive this chat\n• \`.archivechat unarchive\` — Unarchive this chat\n\n_Or use aliases: \`.archive\` / \`.unarchive\`_`,
                ...channelInfo
            }, { quoted: message });
        }

        const shouldArchive = action === 'archive';

        try {
            const lastMsg = message;
            await sock.chatModify(
                {
                    archive: shouldArchive,
                    lastMessages: [
                        {
                            key: lastMsg.key,
                            messageTimestamp: lastMsg.messageTimestamp
                        }
                    ]
                },
                chatId
            );

            await sock.sendMessage(chatId, {
                text: shouldArchive ? `📦 *Chat archived!*` : `📂 *Chat unarchived!*`,
                ...channelInfo
            }, { quoted: message });

        } catch (e) {
            console.error('[ARCHIVECHAT] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to ${action} chat: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading archivechat.js:', e.message); }

/* ===== broadcast.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

module.exports = {
    command: 'broadcast',
    aliases: ['bc', 'announce'],
    category: 'owner',
    description: 'Broadcast a message to all groups the bot is in',
    usage: '.broadcast <message>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        const text = args.join(' ').trim();

        if (!text) {
            return await sock.sendMessage(chatId, {
                text: `*📢 BROADCAST*\n\n*Usage:* .broadcast <message>\n\n*Example:*\n.broadcast Hello everyone! Bot will be down for maintenance at 10 PM.\n\n_Sends to all groups the bot is in. Has a 1 second delay between each group to avoid ban._`,
                ...channelInfo
            }, { quoted: message });
        }

        let groups = [];
        try {
            const allChats = Object.keys(sock.store?.chats || {});
            groups = allChats.filter(jid => jid.endsWith('@g.us'));
        } catch (e) {
            console.error('[BROADCAST] Error getting groups:', e.message);
        }

        if (groups.length === 0) {
            return await sock.sendMessage(chatId, {
                text: '❌ No groups found. Make sure the bot is in at least one group.',
                ...channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: `📢 *Broadcasting to ${groups.length} group(s)...*\n\nThis may take a moment.`,
            ...channelInfo
        }, { quoted: message });

        const broadcastText = `📢 *BROADCAST MESSAGE*\n\n${text}`;
        let sent = 0;
        let failed = 0;

        for (const groupJid of groups) {
            try {
                await sock.sendMessage(groupJid, {
                    text: broadcastText,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363408055942569@newsletter',
                            newsletterName: 'JUNAID-MD↣³⁰²',
                            serverMessageId: -1
                        }
                    }
                });
                sent++;
            } catch (e) {
                console.error(`[BROADCAST] Failed to send to ${groupJid}: ${e.message}`);
                failed++;
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        await sock.sendMessage(chatId, {
            text: `✅ *Broadcast Complete!*\n\n📤 Sent: ${sent}\n❌ Failed: ${failed}\n📊 Total: ${groups.length}`,
            ...channelInfo
        }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading broadcast.js:', e.message); }

/* ===== broadcastdm.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

module.exports = {
    command: 'broadcastdm',
    aliases: ['bcdm', 'announcedm', 'dmall'],
    category: 'owner',
    description: 'Broadcast a message to all saved DM contacts',
    usage: '.broadcastdm <message>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        const text = args.join(' ').trim();

        if (!text) {
            return await sock.sendMessage(chatId, {
                text: `*📩 BROADCAST DM*\n\n*Usage:* .broadcastdm <message>\n\n*Example:*\n.broadcastdm Hey! Check out our new features!\n\n_Sends to all contacts in the bot's contact list. Has a 1.5s delay between each to avoid ban._`,
                ...channelInfo
            }, { quoted: message });
        }

        let contacts = [];
        try {
            const allContacts = Object.keys(sock.store?.contacts || {});
            contacts = allContacts.filter(jid =>
                jid.endsWith('@s.whatsapp.net') &&
                jid !== sock.user?.id
            );
        } catch (e) {
            console.error('[BROADCASTDM] Error getting contacts:', e.message);
        }

        if (contacts.length === 0) {
            return await sock.sendMessage(chatId, {
                text: '❌ No contacts found in the bot\'s contact list.',
                ...channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: `📩 *Broadcasting to ${contacts.length} contact(s)...*\n\nThis may take a moment.`,
            ...channelInfo
        }, { quoted: message });

        const broadcastText = `📩 *MESSAGE*\n\n${text}`;
        let sent = 0;
        let failed = 0;

        for (const contactJid of contacts) {
            try {
                await sock.sendMessage(contactJid, {
                    text: broadcastText,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363408055942569@newsletter',
                            newsletterName: 'JUNAID-MD↣³⁰²',
                            serverMessageId: -1
                        }
                    }
                });
                sent++;
            } catch (e) {
                console.error(`[BROADCASTDM] Failed to send to ${contactJid}: ${e.message}`);
                failed++;
            }
            await new Promise(r => setTimeout(r, 1500));
        }

        await sock.sendMessage(chatId, {
            text: `✅ *DM Broadcast Complete!*\n\n📤 Sent: ${sent}\n❌ Failed: ${failed}\n📊 Total: ${contacts.length}`,
            ...channelInfo
        }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading broadcastdm.js:', e.message); }

/* ===== schedule.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const fs = require('fs');
const path = require('path');
const { dataFile } = require('../lib/paths.js');
const store = require('../lib/lightweight_store.js');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const configPath = dataFile('schedules.json');

async function loadSchedules() {
    try {
        if (HAS_DB) {
            const data = await store.getSetting('global', 'schedules');
            return data || [];
        } else {
            if (!fs.existsSync(configPath)) {
                const dataDir = path.dirname(configPath);
                if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
                fs.writeFileSync(configPath, JSON.stringify([], null, 2));
            }
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }
    } catch {
        return [];
    }
}

async function saveSchedules(data) {
    if (HAS_DB) {
        await store.saveSetting('global', 'schedules', data);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
    }
}

function generateId() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function parseTime(input) {
    const now = new Date();

    const relativeMatch = input.match(/^(?:(\d+)h)?(?:(\d+)m)?$/i);
    if (relativeMatch && (relativeMatch[1] || relativeMatch[2])) {
        const hours = parseInt(relativeMatch[1] || '0', 10);
        const minutes = parseInt(relativeMatch[2] || '0', 10);
        if (hours === 0 && minutes === 0) return null;
        return new Date(now.getTime() + (hours * 60 + minutes) * 60 * 1000);
    }

    const clockMatch = input.match(/^(\d{1,2}):(\d{2})(am|pm)?$/i);
    if (clockMatch) {
        let hour = parseInt(clockMatch[1], 10);
        const minute = parseInt(clockMatch[2], 10);
        const meridiem = clockMatch[3]?.toLowerCase();

        if (meridiem === 'pm' && hour < 12) hour += 12;
        if (meridiem === 'am' && hour === 12) hour = 0;

        const target = new Date(now);
        target.setHours(hour, minute, 0, 0);

        if (target.getTime() <= now.getTime()) {
            target.setDate(target.getDate() + 1);
        }
        return target;
    }

    return null;
}

function formatTimeLeft(ms) {
    if (ms <= 0) return 'now';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (s || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
}

let _engineStarted = false;

function startSchedulerEngine(sock) {
    if (_engineStarted) return;
    _engineStarted = true;

    setInterval(async () => {
        try {
            const now = Date.now();
            const schedules = await loadSchedules();
            const remaining = [];
            let changed = false;

            for (const item of schedules) {
                if (now >= item.sendAt) {
                    try {
                        await sock.sendMessage(item.chatId, {
                            text: item.message,
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363408055942569@newsletter',
                                    newsletterName: 'JUNAID-MD↣³⁰²',
                                    serverMessageId: -1
                                }
                            }
                        });
                        console.log(`[SCHEDULE] ✅ Sent message ID:${item.id} to ${item.chatId}`);
                    } catch (e) {
                        console.error(`[SCHEDULE] ❌ Failed to send ID:${item.id}: ${e.message}`);
                    }
                    changed = true;
                } else {
                    remaining.push(item);
                }
            }

            if (changed) await saveSchedules(remaining);
        } catch (e) {
            console.error('[SCHEDULE] Engine error:', e.message);
        }
    }, 10_000);
}

module.exports = {
    command: 'schedule',
    aliases: ['sched', 'remind', 'remindme'],
    category: 'utility',
    description: 'Schedule a message to be sent later in this chat',
    usage: '.schedule <time> <message>\nTime: 10m | 2h | 1h30m | 14:30 | 10:30am',

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = context.senderId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        startSchedulerEngine(sock);

        if (!args || args.length < 2) {
            return await sock.sendMessage(chatId, {
                text: `*⏰ SCHEDULE A MESSAGE*\n\n` +
                      `*Usage:*\n\`.schedule <time> <message>\`\n\n` +
                      `*Time formats:*\n` +
                      `• \`10m\` → in 10 minutes\n` +
                      `• \`2h\` → in 2 hours\n` +
                      `• \`1h30m\` → in 1 hour 30 minutes\n` +
                      `• \`14:30\` → today at 2:30 PM\n` +
                      `• \`10:30am\` → today at 10:30 AM\n\n` +
                      `*Examples:*\n` +
                      `\`.schedule 10m Good morning everyone!\`\n` +
                      `\`.schedule 2h Team meeting starting now!\`\n` +
                      `\`.schedule 14:30 Don't forget the call!\``,
                ...channelInfo
            }, { quoted: message });
        }

        const timeInput = args[0];
        const msgText = args.slice(1).join(' ').trim();

        if (!msgText) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please provide a message after the time.\n\nExample: `.schedule 10m Hello!`',
                ...channelInfo
            }, { quoted: message });
        }

        const targetDate = parseTime(timeInput);
        if (!targetDate) {
            return await sock.sendMessage(chatId, {
                text: `❌ Invalid time format: *${timeInput}*\n\nValid: \`10m\` \`2h\` \`1h30m\` \`14:30\` \`10:30am\``,
                ...channelInfo
            }, { quoted: message });
        }

        const schedules = await loadSchedules();
        const newItem = {
            id: generateId(),
            chatId,
            senderId,
            message: msgText,
            sendAt: targetDate.getTime(),
            createdAt: Date.now()
        };

        schedules.push(newItem);
        await saveSchedules(schedules);

        const timeLeft = formatTimeLeft(targetDate.getTime() - Date.now());
        const timeStr = targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        await sock.sendMessage(chatId, {
            text: `✅ *Message Scheduled!*\n\n` +
                  `📌 *ID:* ${newItem.id}\n` +
                  `⏳ *Sends in:* ${timeLeft} (at ${timeStr})\n` +
                  `💬 *Message:* ${msgText}\n\n` +
                  `_Use .schedulecancel ${newItem.id} to cancel_`,
            ...channelInfo
        }, { quoted: message });
    }
};

// Export helper functions for other modules
module.exports.loadSchedules = loadSchedules;
module.exports.saveSchedules = saveSchedules;
module.exports.generateId = generateId;
module.exports.parseTime = parseTime;
module.exports.formatTimeLeft = formatTimeLeft;
module.exports.startSchedulerEngine = startSchedulerEngine;

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading schedule.js:', e.message); }

/* ===== schedulelist.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const { loadSchedules, formatTimeLeft } = require('./schedule.js');

module.exports = {
    command: 'schedulelist',
    aliases: ['schedlist', 'schedules', 'reminders'],
    category: 'utility',
    description: 'View all scheduled messages for this chat',
    usage: '.schedulelist',

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = context.senderId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        const schedules = await loadSchedules();

        const mine = schedules.filter(s => s.chatId === chatId || s.senderId === senderId);

        if (mine.length === 0) {
            return await sock.sendMessage(chatId, {
                text: '📭 *No scheduled messages found*\n\nUse `.schedule <time> <message>` to schedule one!',
                ...channelInfo
            }, { quoted: message });
        }

        const now = Date.now();
        const lines = mine.map((s, i) => {
            const timeLeft = formatTimeLeft(s.sendAt - now);
            const preview = s.message.length > 40
                ? s.message.substring(0, 40) + '...'
                : s.message;
            return `${i + 1}. 📌 *ID:* ${s.id} | ⏳ ${timeLeft}\n    💬 ${preview}`;
        }).join('\n\n');

        await sock.sendMessage(chatId, {
            text: `*⏰ SCHEDULED MESSAGES (${mine.length})*\n\n${lines}\n\n_Use .schedulecancel <ID> to cancel_`,
            ...channelInfo
        }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading schedulelist.js:', e.message); }

/* ===== schedulecancel.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const { loadSchedules, saveSchedules } = require('./schedule.js');

module.exports = {
    command: 'schedulecancel',
    aliases: ['schedcancel', 'cancelschedule', 'unschedule'],
    category: 'utility',
    description: 'Cancel a scheduled message by its ID',
    usage: '.schedulecancel <ID>',

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = context.senderId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        if (!args || args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please provide the schedule ID.\n\nUsage: `.schedulecancel <ID>`\nGet IDs: `.schedulelist`',
                ...channelInfo
            }, { quoted: message });
        }

        const targetId = args[0].toUpperCase();
        const schedules = await loadSchedules();

        const index = schedules.findIndex(s =>
            s.id === targetId && (s.chatId === chatId || s.senderId === senderId)
        );

        if (index === -1) {
            return await sock.sendMessage(chatId, {
                text: `❌ No scheduled message found with ID *${targetId}*\n\nUse \`.schedulelist\` to see your scheduled messages.`,
                ...channelInfo
            }, { quoted: message });
        }

        const cancelled = schedules.splice(index, 1)[0];
        await saveSchedules(schedules);

        await sock.sendMessage(chatId, {
            text: `🗑️ *Schedule Cancelled!*\n\n📌 *ID:* ${cancelled.id}\n💬 *Message:* ${cancelled.message}`,
            ...channelInfo
        }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading schedulecancel.js:', e.message); }

/* ===== forward.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const config = require('../settings'); // or wherever newsletter info is stored

module.exports = {
  command: 'forward',
  aliases: ['fwd', 'f'],
  category: 'tools',
  description: 'Forward a replied message to multiple JIDs (private, group, newsletter)',
  usage: '.forward <jid1, jid2, ...>',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;

    // 1. Get quoted message
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) {
      return await sock.sendMessage(chatId, {
        text: '❌ Please reply to a message you want to forward.',
        ...channelInfo
      }, { quoted: message });
    }

    // 2. Unwrap view‑once messages
    let quoted = quotedMsg;
    if (quoted.viewOnceMessageV2) {
      quoted = quoted.viewOnceMessageV2.message;
    } else if (quoted.viewOnceMessage) {
      quoted = quoted.viewOnceMessage.message;
    }

    // 3. Parse targets
    const inputArgs = args.join(' ');
    if (!inputArgs) {
      const usage = `❌ *Invalid Usage*\n\n` +
        `Provide JIDs separated by commas.\n` +
        `Example: \`.forward 123@s.whatsapp.net, 456@g.us, 120363@newsletter\``;
      return await sock.sendMessage(chatId, { text: usage, ...channelInfo }, { quoted: message });
    }

    const targetJids = inputArgs.split(',').map(j => j.trim()).filter(j => j.length > 0);
    if (targetJids.length === 0) {
      return await sock.sendMessage(chatId, { text: '❌ No valid JIDs found.', ...channelInfo }, { quoted: message });
    }

    // 4. Prepare forwarding context with newsletter info (from settings)
    const forwardContextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: config.channelJid || '120363408055942569@newsletter',
        newsletterName: 'JUNAID-MD↣³⁰²',
        serverMessageId: -1
      }
    };

    // Inject contextInfo into the quoted message
    const mType = Object.keys(quoted).find(k =>
      k.endsWith('Message') || k === 'conversation' || k === 'stickerMessage'
    );
    if (mType && quoted[mType] && typeof quoted[mType] === 'object') {
      quoted[mType].contextInfo = {
        ...(quoted[mType].contextInfo || {}),
        ...forwardContextInfo
      };
    }

    // 5. Relay loop
    let successCount = 0;
    let failCount = 0;
    const failedJids = [];

    for (let jid of targetJids) {
      // Ensure JID format
      if (!jid.includes('@')) {
        jid = jid + '@s.whatsapp.net';
      }

      try {
        await sock.relayMessage(jid, quoted, {
          messageId: sock.generateMessageTag?.() || undefined
        });
        successCount++;
        await new Promise(r => setTimeout(r, 800)); // slight delay to avoid rate limits
      } catch (error) {
        console.error(`Relay failed for ${jid}:`, error.message);
        failCount++;
        failedJids.push(jid);
      }
    }

    // 6. Report only if there were failures
    if (failCount > 0) {
      let report = `⚠️ *Some JIDs failed to receive the message*\n\n`;
      report += `❌ *Failed:* ${failCount}\n`;
      report += `✨ *Mode:* Native Relay\n`;
      report += `\n*Failed List:*\n${failedJids.map(j => `> ${j}`).join('\n')}`;

      await sock.sendMessage(chatId, {
        text: report,
        ...channelInfo
      }, { quoted: message });
    } else {
      // Optional: silent success, or you can send a small notification
      await sock.sendMessage(chatId, {
        text: `✅ Message forwarded to ${successCount} JID(s).`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading forward.js:', e.message); }

/* ===== autoForward.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

const store = require('../lib/lightweight_store');
const { printLog } = require('../lib/print');

const AUTO_FORWARD_KEY = 'auto_forward_config';
const IGNORED_BOTS_KEY = 'ignored_bots';

async function getConfig() {
    try {
        const data = await store.getSetting('global', AUTO_FORWARD_KEY);
        return Array.isArray(data) ? data : [];
    } catch (e) {
        printLog('error', `[AUTO-FWD-CMD] Failed to load config: ${e.message}`);
        return [];
    }
}

async function saveConfig(rules) {
    await store.saveSetting('global', AUTO_FORWARD_KEY, rules);
}

async function getIgnoredBots() {
    try {
        const bots = await store.getSetting('global', IGNORED_BOTS_KEY);
        return Array.isArray(bots) ? bots : [];
    } catch {
        return [];
    }
}

async function saveIgnoredBots(bots) {
    await store.saveSetting('global', IGNORED_BOTS_KEY, bots);
}

function formatRule(index, rule) {
    const status = rule.enabled ? '✅' : '❌';
    return `${index}. ${status} Source: ${rule.sourceJid}\n   Target: ${rule.targetJid}\n   Mode: ${rule.mode || 'all'}`;
}

module.exports = {
    command: 'autoforward',
    aliases: ['af'],
    category: 'owner',
    description: 'Manage multiple auto‑forwarding rules',
    usage:
        '.autoforward                               – show all rules\n' +
        '.autoforward list                           – list all rules\n' +
        '.autoforward <index>                        – show details of one rule\n' +
        '.autoforward add <source> <target> [mode]   – add new rule (mode: all|owner|others|admin, default all)\n' +
        '.autoforward remove <index>                  – remove a rule\n' +
        '.autoforward edit <index> <field> <value>    – edit source, target, mode, or enabled (true/false)\n' +
        '.autoforward enable <index>                   – enable a rule\n' +
        '.autoforward disable <index>                  – disable a rule\n' +
        '.autoforward botignore add <jid>              – ignore another bot\n' +
        '.autoforward botignore remove <jid>           – stop ignoring\n' +
        '.autoforward botignore list                   – list ignored bots',
    ownerOnly: true,

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;

        if (args.length === 0) {
            const rules = await getConfig();
            const ignored = await getIgnoredBots();
            const ignoreList = ignored.length ? ignored.map(j => `• ${j}`).join('\n') : 'None';

            if (rules.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `*Auto‑forward Rules*\n\nNo rules configured.\nUse \`.autoforward add <source> <target>\` to create one.\n\n*Ignored Bots:*\n${ignoreList}`,
                    ...channelInfo
                }, { quoted: message });
            }

            let ruleText = rules.map((r, i) => formatRule(i + 1, r)).join('\n\n');
            await sock.sendMessage(chatId, {
                text: `*Auto‑forward Rules*\n\n${ruleText}\n\n*Ignored Bots:*\n${ignoreList}`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const subCmd = args[0].toLowerCase();

        // botignore subcommands
        if (subCmd === 'botignore') {
            const action = args[1]?.toLowerCase();
            if (!action) return usageError(sock, chatId, channelInfo, message);
            const ignored = await getIgnoredBots();

            if (action === 'list') {
                const list = ignored.length ? ignored.map(j => `• ${j}`).join('\n') : 'None';
                return await sock.sendMessage(chatId, { text: `*Ignored Bots:*\n${list}`, ...channelInfo }, { quoted: message });
            }

            if (args.length < 3) return usageError(sock, chatId, channelInfo, message);
            const jid = args[2].trim();

            if (action === 'add') {
                if (!ignored.includes(jid)) {
                    ignored.push(jid);
                    await saveIgnoredBots(ignored);
                    await sock.sendMessage(chatId, { text: `✅ Added ${jid} to ignore list.`, ...channelInfo }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, { text: `⚠️ ${jid} already ignored.`, ...channelInfo }, { quoted: message });
                }
            } else if (action === 'remove') {
                const index = ignored.indexOf(jid);
                if (index !== -1) {
                    ignored.splice(index, 1);
                    await saveIgnoredBots(ignored);
                    await sock.sendMessage(chatId, { text: `✅ Removed ${jid} from ignore list.`, ...channelInfo }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, { text: `❌ ${jid} not in ignore list.`, ...channelInfo }, { quoted: message });
                }
            } else {
                usageError(sock, chatId, channelInfo, message);
            }
            return;
        }

        const rules = await getConfig();

        // list
        if (subCmd === 'list') {
            if (rules.length === 0) {
                return await sock.sendMessage(chatId, { text: 'No rules configured.', ...channelInfo }, { quoted: message });
            }
            let ruleText = rules.map((r, i) => formatRule(i + 1, r)).join('\n\n');
            await sock.sendMessage(chatId, { text: `*Auto‑forward Rules*\n\n${ruleText}`, ...channelInfo }, { quoted: message });
            return;
        }

        // show single rule by index
        if (!isNaN(parseInt(subCmd)) && args.length === 1) {
            const idx = parseInt(subCmd) - 1;
            if (idx < 0 || idx >= rules.length) {
                return await sock.sendMessage(chatId, { text: `❌ Rule #${subCmd} does not exist.`, ...channelInfo }, { quoted: message });
            }
            await sock.sendMessage(chatId, { text: `*Rule #${subCmd}*\n\n${formatRule(subCmd, rules[idx])}`, ...channelInfo }, { quoted: message });
            return;
        }

        // add <source> <target> [mode]
        if (subCmd === 'add') {
            if (args.length < 3) {
                return await sock.sendMessage(chatId, { text: '❌ Usage: .autoforward add <sourceJid> <targetJid> [mode]', ...channelInfo }, { quoted: message });
            }
            const source = args[1].trim();
            const target = args[2].trim();
            let mode = 'all';
            if (args.length >= 4) {
                mode = args[3].toLowerCase();
                if (!['all', 'owner', 'others', 'admin'].includes(mode)) {
                    return await sock.sendMessage(chatId, { text: '❌ Mode must be all, owner, others, or admin.', ...channelInfo }, { quoted: message });
                }
            }
            const newRule = { sourceJid: source, targetJid: target, enabled: true, mode };
            rules.push(newRule);
            await saveConfig(rules);
            await sock.sendMessage(chatId, { text: `✅ Rule added (index #${rules.length})\n${formatRule(rules.length, newRule)}`, ...channelInfo }, { quoted: message });
            return;
        }

        // remove <index>
        if (subCmd === 'remove') {
            if (args.length < 2) return usageError(sock, chatId, channelInfo, message);
            const idx = parseInt(args[1]) - 1;
            if (isNaN(idx) || idx < 0 || idx >= rules.length) {
                return await sock.sendMessage(chatId, { text: `❌ Invalid rule index.`, ...channelInfo }, { quoted: message });
            }
            const removed = rules.splice(idx, 1)[0];
            await saveConfig(rules);
            await sock.sendMessage(chatId, { text: `✅ Removed rule #${args[1]}\n${formatRule(args[1], removed)}`, ...channelInfo }, { quoted: message });
            return;
        }

        // edit <index> <field> <value>
        if (subCmd === 'edit') {
            if (args.length < 4) return usageError(sock, chatId, channelInfo, message);
            const idx = parseInt(args[1]) - 1;
            if (isNaN(idx) || idx < 0 || idx >= rules.length) {
                return await sock.sendMessage(chatId, { text: `❌ Invalid rule index.`, ...channelInfo }, { quoted: message });
            }
            const field = args[2].toLowerCase();
            const value = args.slice(3).join(' ');

            if (field === 'source') {
                rules[idx].sourceJid = value;
            } else if (field === 'target') {
                rules[idx].targetJid = value;
            } else if (field === 'mode') {
                if (!['all', 'owner', 'others', 'admin'].includes(value.toLowerCase())) {
                    return await sock.sendMessage(chatId, { text: '❌ Mode must be all, owner, others, or admin.', ...channelInfo }, { quoted: message });
                }
                rules[idx].mode = value.toLowerCase();
            } else if (field === 'enabled') {
                const bool = value.toLowerCase() === 'true' ? true : (value.toLowerCase() === 'false' ? false : null);
                if (bool === null) {
                    return await sock.sendMessage(chatId, { text: '❌ enabled must be true or false.', ...channelInfo }, { quoted: message });
                }
                rules[idx].enabled = bool;
            } else {
                return await sock.sendMessage(chatId, { text: '❌ Field must be source, target, mode, or enabled.', ...channelInfo }, { quoted: message });
            }

            await saveConfig(rules);
            await sock.sendMessage(chatId, { text: `✅ Rule #${args[1]} updated.\n${formatRule(args[1], rules[idx])}`, ...channelInfo }, { quoted: message });
            return;
        }

        // enable <index>
        if (subCmd === 'enable') {
            if (args.length < 2) return usageError(sock, chatId, channelInfo, message);
            const idx = parseInt(args[1]) - 1;
            if (isNaN(idx) || idx < 0 || idx >= rules.length) {
                return await sock.sendMessage(chatId, { text: `❌ Invalid rule index.`, ...channelInfo }, { quoted: message });
            }
            rules[idx].enabled = true;
            await saveConfig(rules);
            await sock.sendMessage(chatId, { text: `✅ Rule #${args[1]} enabled.\n${formatRule(args[1], rules[idx])}`, ...channelInfo }, { quoted: message });
            return;
        }

        // disable <index>
        if (subCmd === 'disable') {
            if (args.length < 2) return usageError(sock, chatId, channelInfo, message);
            const idx = parseInt(args[1]) - 1;
            if (isNaN(idx) || idx < 0 || idx >= rules.length) {
                return await sock.sendMessage(chatId, { text: `❌ Invalid rule index.`, ...channelInfo }, { quoted: message });
            }
            rules[idx].enabled = false;
            await saveConfig(rules);
            await sock.sendMessage(chatId, { text: `❌ Rule #${args[1]} disabled.\n${formatRule(args[1], rules[idx])}`, ...channelInfo }, { quoted: message });
            return;
        }

        usageError(sock, chatId, channelInfo, message);
    }
};

async function usageError(sock, chatId, channelInfo, message) {
    await sock.sendMessage(chatId, {
        text: '❌ Invalid subcommand. Use `.autoforward` to see available commands.',
        ...channelInfo
    }, { quoted: message });
}

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading autoForward.js:', e.message); }

/* ===== areact.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/areact.js — REDXBOT302 v9.0 — Advanced Auto-React
// Modes: all | others | bot | self
// .autoreact on         — react to ALL messages
// .autoreact on others  — react only to OTHER people's messages
// .autoreact on bot     — react only to BOT's own messages
// .autoreact on self    — react only to messages FROM YOU (owner/fromMe)
// .autoreact off        — disable
// .autoreact status     — show config
'use strict';
const fs   = require('fs');
const path = require('path');
const settings = require('../settings');

const CFG_FILE = path.join(process.cwd(), 'data', 'autoreact.json');

function readCfg() {
  try {
    if (!fs.existsSync(CFG_FILE)) return { enabled: false, mode: 'all', emojis: null };
    return JSON.parse(fs.readFileSync(CFG_FILE, 'utf8'));
  } catch { return { enabled: false, mode: 'all', emojis: null }; }
}
function writeCfg(c) {
  try {
    fs.mkdirSync(path.dirname(CFG_FILE), { recursive: true });
    fs.writeFileSync(CFG_FILE, JSON.stringify(c, null, 2));
  } catch {}
}

const DEFAULT_EMOJIS = [
  '💘','💝','💖','💗','💓','💞','💕','💟','❣️','❤️',
  '🧡','💛','💚','💙','💜','🤎','🖤','🤍','♥️',
  '🎈','🎁','💌','💐','😘','🤗','🌸','🌹','🥀','🌺',
  '🌼','🌷','🍁','⭐️','🌟','😊','🥰','😍','🤩','☺️',
  '🔥','✨','💫','🎯','👑','🤙','💯','🚀','⚡','🎉','🥂','💎','🫶','😎','🏆','🕶️','🪩','🌟','💠','🔱'
];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

let _attached = false;
let lastReact = 0;

function attachListener(sock) {
  if (_attached) return;
  _attached = true;

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const cfg = readCfg();
    if (!cfg.enabled) return;

    const emojis = (cfg.emojis && cfg.emojis.length) ? cfg.emojis : DEFAULT_EMOJIS;
    const botJid = sock.user?.id || '';

    for (const m of messages) {
      if (!m?.message) continue;
      if (m.message.reactionMessage) continue;
      if (m.message.protocolMessage) continue;

      const fromMe = m.key.fromMe;
      const sender = m.key.participant || m.key.remoteJid || '';
      const isBotMsg = fromMe || sender === botJid || sender.split(':')[0] + '@s.whatsapp.net' === botJid;

      // Mode filter
      const mode = cfg.mode || 'all';
      if (mode === 'others' && isBotMsg) continue;       // skip bot/own msgs
      if (mode === 'bot'    && !isBotMsg) continue;      // skip others
      if (mode === 'self'   && !fromMe) continue;        // skip non-fromMe

      // Skip commands
      const text =
        m.message.conversation ||
        m.message.extendedTextMessage?.text || '';
      if (text && /^[!#.$%^&*+=?<>]/.test(text)) continue;

      // Rate limit 2s
      const now = Date.now();
      if (now - lastReact < 2000) continue;
      lastReact = now;

      try {
        await sock.sendMessage(m.key.remoteJid, {
          react: { text: rnd(emojis), key: m.key }
        });
      } catch {}
    }
  });
}

module.exports = {
  command: 'autoreact',
  aliases: ['areact'],
  category: 'owner',
  description: 'VIP auto-react — random VIP reactions on new messages',
  usage: [
    '.autoreact on          — React to ALL messages',
    '.autoreact on others   — React only to OTHER people',
    '.autoreact on bot      — React only to BOT messages',
    '.autoreact on self     — React only to YOUR messages',
    '.autoreact off         — Disable',
    '.autoreact emoji 😍 🔥 — Set custom emoji pool',
    '.autoreact reset       — Reset to default emojis',
    '.autoreact status      — Show current config',
  ].join('\n'),
  ownerOnly: true,

  async handler(sock, message, args, context) {
    const { chatId } = context;
    const ci = settings.channelInfo;
    const reply = (text) => sock.sendMessage(chatId, { text, ...ci }, { quoted: message });
    const cfg = readCfg();

    const sub = (args[0] || '').toLowerCase();

    /* status */
    if (!sub || sub === 'status') {
      return reply(
        `╔══════════════════════════╗\n` +
        `║  ⚡ AUTO-REACT CONFIG    ║\n` +
        `╚══════════════════════════╝\n\n` +
        `🔄 Status : ${cfg.enabled ? '✅ ON' : '❌ OFF'}\n` +
        `🎯 Mode   : *${cfg.mode || 'all'}*\n` +
        `😀 Emojis : ${cfg.emojis ? cfg.emojis.join(' ') : 'Default pool (50 emojis)'}\n\n` +
        `*Modes:*\n` +
        `• \`all\`    — every message\n` +
        `• \`others\` — only other people\n` +
        `• \`bot\`    — only bot messages\n` +
        `• \`self\`   — only your own messages\n\n` +
        `> ©️ JUNAID-MD↣³⁰² | JUNAID-MD↣³⁰²`
      );
    }

    /* off */
    if (sub === 'off') {
      cfg.enabled = false;
      writeCfg(cfg);
      attachListener(sock);
      return reply('❌ Auto-react *DISABLED*.\n\n> ©️ JUNAID-MD↣³⁰² | JUNAID-MD↣³⁰²');
    }

    /* emoji pool */
    if (sub === 'emoji') {
      const pool = args.slice(1).join(' ').trim().split(/\s+/).filter(Boolean);
      if (!pool.length) return reply('❌ Provide emojis: `.autoreact emoji 😍 🔥 💯`');
      cfg.emojis = pool;
      writeCfg(cfg);
      return reply(`✅ Emoji pool updated: ${pool.join(' ')}\n\n> ©️ JUNAID-MD↣³⁰² | JUNAID-MD↣³⁰²`);
    }

    /* reset */
    if (sub === 'reset') {
      cfg.emojis = null;
      writeCfg(cfg);
      return reply(`✅ Emoji pool reset to defaults (${DEFAULT_EMOJIS.length} emojis).\n\n> ©️ JUNAID-MD↣³⁰² | JUNAID-MD↣³⁰²`);
    }

    /* on [mode] */
    if (sub === 'on') {
      const modeArg = (args[1] || 'all').toLowerCase();
      const validModes = ['all', 'others', 'bot', 'self'];
      if (!validModes.includes(modeArg)) {
        return reply(`❌ Invalid mode. Use: ${validModes.join(' | ')}`);
      }
      cfg.enabled = true;
      cfg.mode    = modeArg;
      writeCfg(cfg);
      attachListener(sock);

      const modeDesc = {
        all:    'ALL messages (everyone)',
        others: 'only OTHER people\'s messages',
        bot:    'only BOT\'s own messages',
        self:   'only YOUR (fromMe) messages',
      };

      return reply(
        `✅ Auto-react *ENABLED*\n` +
        `🎯 Mode: *${modeArg}* — ${modeDesc[modeArg]}\n\n` +
        `> ©️ JUNAID-MD↣³⁰² | JUNAID-MD↣³⁰²`
      );
    }

    return reply(
      `*Usage:*\n${module.exports.usage}\n\n> ©️ JUNAID-MD↣³⁰² | JUNAID-MD↣³⁰²`
    );
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading areact.js:', e.message); }

/* ===== autoreply.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *    AUTOREPLY v3.0 ULTRA — Multi-match · Priority · Cooldown · Stats       *
 *                                                                           *
 *****************************************************************************/

'use strict';

const fs   = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');
const { sendSafeMessage } = require('../lib/sendSafeMessage');

/* ─────────────────────────────── constants ─────────────────────────────── */
const HAS_DB      = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || process.env.DB_URL);
const CONFIG_PATH = path.join(process.cwd(), 'data', 'autoreplies.json');
const MATCH_TYPES = ['contains', 'exact', 'regex', 'startsWith', 'endsWith'];

/* ─── in-memory cooldown map: key = `${senderJid}::${triggerId}` ────────── */
const cooldownMap = new Map();

/* ─────────────────────────────── config I/O ─────────────────────────────── */
async function initConfig() {
    try {
        if (HAS_DB) {
            const cfg = await store.getSetting('global', 'autoreplies');
            return _mergeDefaults(cfg);
        }
        if (!fs.existsSync(CONFIG_PATH)) {
            fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
            const def = _defaultConfig();
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(def, null, 2));
            return def;
        }
        return _mergeDefaults(JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')));
    } catch {
        return _defaultConfig();
    }
}

async function saveConfig(config) {
    try {
        if (HAS_DB) {
            await store.saveSetting('global', 'autoreplies', config);
        } else {
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        }
    } catch (e) {
        console.error('[AUTOREPLY] saveConfig error:', e.message);
    }
}

function _defaultConfig() {
    return {
        enabled: true,
        replies: [],
        perGroup: {}          // groupJid → { enabled: bool }
    };
}

function _mergeDefaults(raw) {
    if (!raw) return _defaultConfig();
    return {
        enabled:  raw.enabled  ?? true,
        replies:  Array.isArray(raw.replies) ? raw.replies : [],
        perGroup: raw.perGroup || {}
    };
}

/* ─────────────────────────────── matching ──────────────────────────────── */
function _matches(rule, lowerMsg, rawMsg) {
    const t  = rule.caseSensitive ? rule.trigger : rule.trigger.toLowerCase();
    const m  = rule.caseSensitive ? rawMsg       : lowerMsg;
    switch (rule.matchType || 'contains') {
        case 'exact':      return m === t;
        case 'startsWith': return m.startsWith(t);
        case 'endsWith':   return m.endsWith(t);
        case 'regex':
            try { return new RegExp(rule.trigger, rule.caseSensitive ? '' : 'i').test(rawMsg); }
            catch { return false; }
        default:           return m.includes(t);           // 'contains'
    }
}

/* ─────────────────────────────── variable injection ────────────────────── */
function _inject(template, { name, number, group, time, date }) {
    return template
        .replace(/\{name\}/gi,   name)
        .replace(/\{number\}/gi, number)
        .replace(/\{group\}/gi,  group)
        .replace(/\{time\}/gi,   time)
        .replace(/\{date\}/gi,   date);
}

/* ─────────────────────────────── time restrict ─────────────────────────── */
function _inTimeWindow(rule, tz) {
    if (!rule.timeRestrict) return true;
    const { startHour, endHour } = rule.timeRestrict;
    if (startHour == null || endHour == null) return true;
    const now  = new Date(new Date().toLocaleString('en-US', { timeZone: tz || 'UTC' }));
    const hour = now.getHours();
    return startHour <= endHour
        ? hour >= startHour && hour < endHour
        : hour >= startHour || hour < endHour;   // overnight window
}

/* ─────────────────────────────── core handler ──────────────────────────── */
async function handleAutoReply(sock, chatId, message, userMessage) {
    try {
        const config = await initConfig();
        if (!config.replies.length) return false;

        /* global toggle */
        if (!config.enabled) return false;

        /* per-group toggle */
        const isGroup  = chatId.endsWith('@g.us');
        const grpCfg   = config.perGroup?.[chatId];
        if (isGroup && grpCfg?.enabled === false) return false;

        const sender   = message.key?.participant || message.key?.remoteJid;
        const rawMsg   = userMessage.trim();
        const lowerMsg = rawMsg.toLowerCase();

        /* sort by priority (lower = first) */
        const sorted = [...config.replies].sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5));

        for (const rule of sorted) {
            /* scope guards */
            if (rule.groupOnly && !isGroup) continue;
            if (rule.dmOnly   &&  isGroup) continue;

            if (!_matches(rule, lowerMsg, rawMsg)) continue;

            /* time-window check */
            const tz = process.env.TIMEZONE || 'Asia/Karachi';
            if (!_inTimeWindow(rule, tz)) continue;

            /* cooldown check */
            const cdKey  = `${sender}::${rule.id}`;
            const lastAt = cooldownMap.get(cdKey) || 0;
            const cdMs   = rule.cooldownMs ?? 0;
            if (cdMs > 0 && Date.now() - lastAt < cdMs) continue;
            cooldownMap.set(cdKey, Date.now());

            /* build vars */
            const senderName = message.pushName || sender?.split('@')[0] || 'there';
            const now        = new Date();
            const tz2        = process.env.TIMEZONE || 'Asia/Karachi';
            const timeStr    = now.toLocaleTimeString('en-US', { timeZone: tz2, hour12: true });
            const dateStr    = now.toLocaleDateString('en-US', { timeZone: tz2 });
            const groupName  = isGroup
                ? (await sock.groupMetadata(chatId).catch(() => ({ subject: 'Group' }))).subject
                : 'DM';

            /* pick response (supports arrays for random) */
            const responses = Array.isArray(rule.response) ? rule.response : [rule.response];
            const rawResp   = responses[Math.floor(Math.random() * responses.length)];
            const responseText = _inject(rawResp, {
                name:   senderName,
                number: sender?.split('@')[0] || '',
                group:  groupName,
                time:   timeStr,
                date:   dateStr
            });

            /* react to trigger if configured */
            if (rule.reactEmoji) {
                await sock.sendMessage(chatId, { react: { text: rule.reactEmoji, key: message.key } }).catch(() => {});
            }

            /* send response */
            if (rule.responseType === 'image' && rule.mediaUrl) {
                await sendSafeMessage(sock, chatId, {
                    image:   { url: rule.mediaUrl },
                    caption: responseText
                }, { quoted: message });
            } else {
                await sendSafeMessage(sock, chatId, {
                    text: responseText,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded:     true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid:     '120363408055942569@newsletter',
                            newsletterName:    'JUNAID-MD↣³⁰²',
                            serverMessageId:   -1
                        }
                    }
                }, { quoted: message });
            }

            /* update hit stats in config */
            rule.hitCount    = (rule.hitCount || 0) + 1;
            rule.lastHit     = Date.now();
            saveConfig(config).catch(() => {});   // async, non-blocking

            return true;   // stop at first match
        }
    } catch (e) {
        console.error('[AUTOREPLY] handleAutoReply error:', e.message);
    }
    return false;
}

/* ─────────────────────────────── command handler ───────────────────────── */
module.exports = {
    command:     'autoreply',
    aliases:     ['ar', 'autorespond'],
    category:    'owner',
    description: 'Manage the auto-reply system (v3.0 Ultra)',
    usage:       '.autoreply <on|off|status|group|stats>',
    ownerOnly:   true,

    async handler(sock, message, args, context = {}) {
        const chatId     = context.chatId     || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        try {
            const config = await initConfig();
            const action = args[0]?.toLowerCase();
            const isGroup = chatId.endsWith('@g.us');

            /* ── no args → status panel ── */
            if (!action) {
                const grpCfg = config.perGroup?.[chatId];
                const grpStatus = isGroup
                    ? `\n*🏘 This Group:* ${grpCfg?.enabled === false ? '❌ Disabled' : '✅ Enabled (inherits global)'}`
                    : '';

                return await sendSafeMessage(sock, chatId, {
                    text: `╔═══════════════════════╗\n` +
                          `║   🤖 AUTO-REPLY v3.0  ║\n` +
                          `╚═══════════════════════╝\n\n` +
                          `*🌐 Global:* ${config.enabled ? '✅ ON' : '❌ OFF'}${grpStatus}\n` +
                          `*📦 Rules:* ${config.replies.length}\n` +
                          `*💾 Storage:* ${HAS_DB ? 'Database' : 'File System'}\n\n` +
                          `*📋 Commands:*\n` +
                          `• \`.autoreply on/off\` — global toggle\n` +
                          `• \`.autoreply group on/off\` — this group toggle\n` +
                          `• \`.autoreply stats\` — hit statistics\n` +
                          `• \`.addreply\` — add trigger\n` +
                          `• \`.delreply\` — remove trigger\n` +
                          `• \`.listreplies\` — view all triggers`,
                    ...channelInfo
                }, { quoted: message });
            }

            /* ── on/off global ── */
            if (action === 'on'  || action === 'enable') {
                if (config.enabled) return await sendSafeMessage(sock, chatId,
                    { text: '⚠️ *Auto-reply is already ON*', ...channelInfo }, { quoted: message });
                config.enabled = true;
                await saveConfig(config);
                return await sendSafeMessage(sock, chatId,
                    { text: '✅ *Auto-reply ENABLED globally*', ...channelInfo }, { quoted: message });
            }

            if (action === 'off' || action === 'disable') {
                if (!config.enabled) return await sendSafeMessage(sock, chatId,
                    { text: '⚠️ *Auto-reply is already OFF*', ...channelInfo }, { quoted: message });
                config.enabled = false;
                await saveConfig(config);
                return await sendSafeMessage(sock, chatId,
                    { text: '❌ *Auto-reply DISABLED globally*', ...channelInfo }, { quoted: message });
            }

            /* ── group sub-command ── */
            if (action === 'group') {
                if (!isGroup) return await sendSafeMessage(sock, chatId,
                    { text: '❌ This sub-command only works inside a group.', ...channelInfo }, { quoted: message });
                const sub = args[1]?.toLowerCase();
                if (!sub) {
                    const cur = config.perGroup?.[chatId]?.enabled;
                    return await sendSafeMessage(sock, chatId,
                        { text: `*This group auto-reply:* ${cur === false ? '❌ OFF' : '✅ ON (inherits global)'}\n\n` +
                                `Use \`.autoreply group on/off\` to override.`, ...channelInfo }, { quoted: message });
                }
                if (!config.perGroup) config.perGroup = {};
                if (!config.perGroup[chatId]) config.perGroup[chatId] = {};
                if (sub === 'on') {
                    config.perGroup[chatId].enabled = true;
                    await saveConfig(config);
                    return await sendSafeMessage(sock, chatId,
                        { text: '✅ *Auto-reply enabled for this group*', ...channelInfo }, { quoted: message });
                }
                if (sub === 'off') {
                    config.perGroup[chatId].enabled = false;
                    await saveConfig(config);
                    return await sendSafeMessage(sock, chatId,
                        { text: '❌ *Auto-reply disabled for this group*', ...channelInfo }, { quoted: message });
                }
            }

            /* ── stats ── */
            if (action === 'stats') {
                if (!config.replies.length)
                    return await sendSafeMessage(sock, chatId,
                        { text: '📊 No triggers configured yet.', ...channelInfo }, { quoted: message });

                const sorted = [...config.replies].sort((a, b) => (b.hitCount || 0) - (a.hitCount || 0));
                const top    = sorted.slice(0, 10);
                const lines  = top.map((r, i) => {
                    const last = r.lastHit ? `🕒 ${new Date(r.lastHit).toLocaleDateString()}` : 'never';
                    return `${i + 1}. *${r.trigger}* — ${r.hitCount || 0} hits · ${last}`;
                }).join('\n');
                const total  = config.replies.reduce((s, r) => s + (r.hitCount || 0), 0);

                return await sendSafeMessage(sock, chatId, {
                    text: `*📊 AUTO-REPLY STATS*\n\n` +
                          `*Total hits:* ${total}\n*Rules:* ${config.replies.length}\n\n` +
                          `*🏆 Top Triggers:*\n${lines}`,
                    ...channelInfo
                }, { quoted: message });
            }

            return await sendSafeMessage(sock, chatId, {
                text: '❌ Unknown action. Use: `.autoreply on/off/group/stats`',
                ...channelInfo
            }, { quoted: message });

        } catch (e) {
            console.error('[AUTOREPLY] handler error:', e.message);
            await sendSafeMessage(sock, chatId,
                { text: '❌ Error processing command.' }, { quoted: message });
        }
    },

    /* exports for sub-plugins (addreply / delreply / listreplies) */
    handleAutoReply,
    initConfig,
    saveConfig,
    MATCH_TYPES
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading autoreply.js:', e.message); }

/* ===== autostatus.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const configPath = path.join(process.cwd(), 'data', 'autoStatus.json');

// Cache to avoid processing the same status multiple times
const processedStatusIds = new Set();
setInterval(() => processedStatusIds.clear(), 60 * 60 * 1000);

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363408055942569@newsletter',
            newsletterName: 'JUNAID-MD↣³⁰²',
            serverMessageId: -1
        }
    }
};

async function readConfig() {
    try {
        if (HAS_DB) {
            const config = await store.getSetting('global', 'autoStatus');
            return config || {
                enabled: false,
                reactOn: false,
                reactEmoji: '💚',
                reactText: ''
            };
        } else {
            if (!fs.existsSync(configPath)) {
                fs.mkdirSync(path.dirname(configPath), { recursive: true });
                fs.writeFileSync(configPath, JSON.stringify({
                    enabled: false,
                    reactOn: false,
                    reactEmoji: '💚',
                    reactText: ''
                }, null, 2));
            }
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch {
        return {
            enabled: false,
            reactOn: false,
            reactEmoji: '💚',
            reactText: ''
        };
    }
}

async function writeConfig(config) {
    try {
        if (HAS_DB) {
            await store.saveSetting('global', 'autoStatus', config);
        } else {
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
    } catch (error) {
        console.error('Error writing auto status config:', error);
    }
}

async function isAutoStatusEnabled() {
    const config = await readConfig();
    return config.enabled;
}

async function isStatusReactionEnabled() {
    const config = await readConfig();
    return config.reactOn;
}

async function reactToStatus(sock, statusKey) {
    try {
        const config = await readConfig();
        if (!config.reactOn) return;

        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: config.reactEmoji
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
        console.log(`✅ Reacted to status with ${config.reactEmoji}`);
    } catch (error) {
        console.error('❌ Error reacting to status:', error.message);
    }
}

async function handleStatusUpdate(sock, status) {
    try {
        const config = await readConfig();
        if (!config.enabled) return;

        await new Promise(resolve => setTimeout(resolve, 1000));

        let key = null;
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                key = msg.key;
            }
        } else if (status.key && status.key.remoteJid === 'status@broadcast') {
            key = status.key;
        } else if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            key = status.reaction.key;
        }

        if (!key) return;

        if (processedStatusIds.has(key.id)) {
            console.log('⏭️ Status already processed, skipping');
            return;
        }
        processedStatusIds.add(key.id);

        try {
            await sock.readMessages([key]);
            console.log('✅ Viewed status');
            if (config.reactText) {
                // Optionally send a text reaction (comment) – WhatsApp doesn't support text comments on status, but we can send a DM?
                // For now, just react with emoji.
            }
            await reactToStatus(sock, key);
        } catch (err) {
            if (err.message?.includes('rate-overlimit')) {
                console.log('⚠️ Rate limit hit, waiting...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                await sock.readMessages([key]);
                await reactToStatus(sock, key);
            } else throw err;
        }
    } catch (error) {
        console.error('❌ Error in auto status view:', error.message);
    }
}

module.exports = {
    command: 'autostatus',
    aliases: ['autoview', 'statusview'],
    category: 'owner',
    description: 'Automatically view and react to WhatsApp statuses',
    usage: `
        .autostatus on|off                      – Enable/disable auto view
        .autostatus react on|off                 – Enable/disable reactions
        .autostatus emoji <emoji>                 – Set reaction emoji (default 💚)
        .autostatus text <text>                    – Set custom text (not used yet)
        .autostatus status                         – Show current settings
    `,
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            const config = await readConfig();

            if (args.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `🔄 *Auto Status – JUNAID-MD↣³⁰²*\n\n` +
                          `Auto View: ${config.enabled ? '✅' : '❌'}\n` +
                          `Reactions: ${config.reactOn ? '✅' : '❌'}\n` +
                          `Reaction Emoji: ${config.reactEmoji}\n` +
                          `Custom Text: ${config.reactText || '(none)'}\n\n` +
                          `Commands:\n` +
                          `• \`.autostatus on/off\`\n` +
                          `• \`.autostatus react on/off\`\n` +
                          `• \`.autostatus emoji <emoji>\`\n` +
                          `• \`.autostatus text <text>\`\n` +
                          `• \`.autostatus status\``,
                    ...channelInfo
                }, { quoted: message });
            }

            const subCmd = args[0].toLowerCase();

            if (subCmd === 'status') {
                return await sock.sendMessage(chatId, {
                    text: `🔄 *Auto Status*\n\n` +
                          `Enabled: ${config.enabled ? '✅' : '❌'}\n` +
                          `Reactions: ${config.reactOn ? '✅' : '❌'}\n` +
                          `Emoji: ${config.reactEmoji}\n` +
                          `Text: ${config.reactText || '(none)'}\n` +
                          `Storage: ${HAS_DB ? 'Database' : 'File'}`,
                    ...channelInfo
                }, { quoted: message });
            }

            if (subCmd === 'on') {
                config.enabled = true;
                await writeConfig(config);
                return await sock.sendMessage(chatId, { text: '✅ Auto status view enabled.', ...channelInfo }, { quoted: message });
            }

            if (subCmd === 'off') {
                config.enabled = false;
                await writeConfig(config);
                return await sock.sendMessage(chatId, { text: '❌ Auto status view disabled.', ...channelInfo }, { quoted: message });
            }

            if (subCmd === 'react') {
                if (args.length < 2) return await sock.sendMessage(chatId, { text: '❌ Usage: .autostatus react on/off', ...channelInfo }, { quoted: message });
                const reactSub = args[1].toLowerCase();
                if (reactSub === 'on') {
                    config.reactOn = true;
                    await writeConfig(config);
                    return await sock.sendMessage(chatId, { text: '💫 Reactions enabled.', ...channelInfo }, { quoted: message });
                } else if (reactSub === 'off') {
                    config.reactOn = false;
                    await writeConfig(config);
                    return await sock.sendMessage(chatId, { text: '❌ Reactions disabled.', ...channelInfo }, { quoted: message });
                } else {
                    return await sock.sendMessage(chatId, { text: '❌ Use on/off.', ...channelInfo }, { quoted: message });
                }
            }

            if (subCmd === 'emoji') {
                if (args.length < 2) return await sock.sendMessage(chatId, { text: '❌ Usage: .autostatus emoji <emoji>', ...channelInfo }, { quoted: message });
                const emoji = args[1];
                config.reactEmoji = emoji;
                await writeConfig(config);
                return await sock.sendMessage(chatId, { text: `✅ Reaction emoji set to ${emoji}.`, ...channelInfo }, { quoted: message });
            }

            if (subCmd === 'text') {
                if (args.length < 2) return await sock.sendMessage(chatId, { text: '❌ Usage: .autostatus text <text>', ...channelInfo }, { quoted: message });
                const text = args.slice(1).join(' ');
                config.reactText = text;
                await writeConfig(config);
                return await sock.sendMessage(chatId, { text: `✅ Custom text set. (Currently not used, reserved for future)`, ...channelInfo }, { quoted: message });
            }

            return await sock.sendMessage(chatId, {
                text: '❌ Unknown subcommand. Use `.autostatus` for help.',
                ...channelInfo
            }, { quoted: message });

        } catch (error) {
            console.error('Error in autostatus command:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *Error occurred while managing auto status!*\n\nError: ' + error.message,
                ...channelInfo
            }, { quoted: message });
        }
    },

    handleStatusUpdate,
    isAutoStatusEnabled,
    isStatusReactionEnabled,
    reactToStatus,
    readConfig,
    writeConfig
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading autostatus.js:', e.message); }

/* ===== autoread.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);


const configPath = path.join(__dirname, '..', 'data', 'autoread.json');

async function initConfig() {
    if (HAS_DB) {
        const config = await store.getSetting('global', 'autoread');
        return config || { enabled: false };
    } else {
        if (!fs.existsSync(configPath)) {
            const dataDir = path.dirname(configPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath));
    }
}

async function saveConfig(config) {
    if (HAS_DB) {
        await store.saveSetting('global', 'autoread', config);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
}

async function isAutoreadEnabled() {
    try {
        const config = await initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autoread status:', error);
        return false;
    }
}

function isBotMentionedInMessage(message, botNumber) {
    if (!message.message) return false;
    
    const messageTypes = [
        'extendedTextMessage', 'imageMessage', 'videoMessage', 'stickerMessage',
        'documentMessage', 'audioMessage', 'contactMessage', 'locationMessage'
    ];
    
    for (const type of messageTypes) {
        if (message.message[type]?.contextInfo?.mentionedJid) {
            const mentionedJid = message.message[type].contextInfo.mentionedJid;
            if (mentionedJid.some(jid => jid === botNumber)) {
                return true;
            }
        }
    }
    
    const textContent = 
        message.message.conversation || 
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption || '';
    
    if (textContent) {
        const botUsername = botNumber.split('@')[0];
        if (textContent.includes(`@${botUsername}`)) {
            return true;
        }
        
        const botNames = [global.botname?.toLowerCase(), 'bot', 'mega', 'mega bot'];
        const words = textContent.toLowerCase().split(/\s+/);
        if (botNames.some(name => words.includes(name))) {
            return true;
        }
    }
    
    return false;
}

async function handleAutoread(sock, message) {
    try {
        const ghostMode = await store.getSetting('global', 'stealthMode');
        if (ghostMode && ghostMode.enabled) {
            console.log('👻 Stealth mode active - skipping read receipt');
            return false;
        }
    } catch (err) {
    }

    const enabled = await isAutoreadEnabled();
    if (enabled) {
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        const isBotMentioned = isBotMentionedInMessage(message, botNumber);
        if (isBotMentioned) {
            return false;
        } else {
            try {
                const key = { 
                    remoteJid: message.key.remoteJid, 
                    id: message.key.id, 
                    participant: message.key.participant 
                };
                await sock.readMessages([key]);
                return true;
            } catch (error) {
                console.error('Error marking message as read:', error);
                return false;
            }
        }
    }
    return false;
}

module.exports = {
    command: 'autoread',
    aliases: ['read', 'autoreadmsg'],
    category: 'owner',
    description: 'Toggle automatic message reading (blue ticks)',
    usage: '.autoread <on|off>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        
        try {
            const config = await initConfig();
            const action = args[0]?.toLowerCase();
            
            if (!action) {
                const ghostMode = await store.getSetting('global', 'stealthMode');
                const ghostActive = ghostMode && ghostMode.enabled;
                
                await sock.sendMessage(chatId, {
                    text: `*📖 AUTOREAD STATUS*\n\n` +
                          `*Current Status:* ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                          `*Stealth Mode:* ${ghostActive ? '👻 Active (overrides autoread)' : '❌ Inactive'}\n` +
                          `*Storage:* ${HAS_DB ? 'Database' : 'File System'}\n\n` +
                          `*Commands:*\n` +
                          `• \`.autoread on\` - Enable auto-read\n` +
                          `• \`.autoread off\` - Disable auto-read\n\n` +
                          `*What it does:*\n` +
                          `When enabled, the bot automatically marks all messages as read (blue ticks).\n\n` +
                          `*Note:* Ghost mode takes priority over autoread. If ghost mode is active, no read receipts will be sent.`,
                    ...channelInfo
                }, { quoted: message });
                return;
            }

            if (action === 'on' || action === 'enable') {
                if (config.enabled) {
                    await sock.sendMessage(chatId, {
                        text: '⚠️ *Autoread is already enabled*',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                config.enabled = true;
                await saveConfig(config);
                
                const ghostMode = await store.getSetting('global', 'stealthMode');
                const ghostActive = ghostMode && ghostMode.enabled;
                
                await sock.sendMessage(chatId, {
                    text: `✅ *Auto-read enabled!*\n\nAll messages will now be automatically marked as read.${ghostActive ? '\n\n⚠️ *Note:* Ghost mode is currently active and will override autoread.' : ''}`,
                    ...channelInfo
                }, { quoted: message });
                
            } else if (action === 'off' || action === 'disable') {
                if (!config.enabled) {
                    await sock.sendMessage(chatId, {
                        text: '⚠️ *Autoread is already disabled*',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                config.enabled = false;
                await saveConfig(config);
                
                await sock.sendMessage(chatId, {
                    text: '❌ *Auto-read disabled!*\n\nMessages will no longer be automatically marked as read.',
                    ...channelInfo
                }, { quoted: message });
                
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ *Invalid option!*\n\nUse: `.autoread on/off`',
                    ...channelInfo
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('Error in autoread command:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *Error processing command!*',
                ...channelInfo
            }, { quoted: message });
        }
    },

    isAutoreadEnabled,
    isBotMentionedInMessage,
    handleAutoread
};



    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading autoread.js:', e.message); }

/* ===== autotyping.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);


const configPath = path.join(__dirname, '..', 'data', 'autotyping.json');

async function initConfig() {
    if (HAS_DB) {
        const config = await store.getSetting('global', 'autotyping');
        return config || { enabled: false };
    } else {
        if (!fs.existsSync(configPath)) {
            const dataDir = path.dirname(configPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath));
    }
}

async function saveConfig(config) {
    if (HAS_DB) {
        await store.saveSetting('global', 'autotyping', config);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
}

async function isAutotypingEnabled() {
    try {
        const config = await initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autotyping status:', error);
        return false;
    }
}

async function isGhostModeActive() {
    try {
        const ghostMode = await store.getSetting('global', 'stealthMode');
        return ghostMode && ghostMode.enabled;
    } catch (error) {
        return false;
    }
}

async function handleAutotypingForMessage(sock, chatId, userMessage) {
    const ghostActive = await isGhostModeActive();
    if (ghostActive) {
        return false;
    }

    const enabled = await isAutotypingEnabled();
    if (enabled) {
        try {
            await sock.presenceSubscribe(chatId);
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await sock.sendPresenceUpdate('composing', chatId);
            const typingDelay = Math.max(3000, Math.min(8000, userMessage.length * 150));
            await new Promise(resolve => setTimeout(resolve, typingDelay));
            
            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true;
        } catch (error) {
            console.error('Error sending typing indicator:', error);
            return false;
        }
    }
    return false;
}

async function handleAutotypingForCommand(sock, chatId) {
    const ghostActive = await isGhostModeActive();
    if (ghostActive) {
        return false;
    }

    const enabled = await isAutotypingEnabled();
    if (enabled) {
        try {
            await sock.presenceSubscribe(chatId);
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await sock.sendPresenceUpdate('composing', chatId);
            const commandTypingDelay = 3000;
            await new Promise(resolve => setTimeout(resolve, commandTypingDelay));
            
            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true;
        } catch (error) {
            console.error('Error sending command typing indicator:', error);
            return false;
        }
    }
    return false;
}

async function showTypingAfterCommand(sock, chatId) {
    const ghostActive = await isGhostModeActive();
    if (ghostActive) {
        return false;
    }

    const enabled = await isAutotypingEnabled();
    if (enabled) {
        try {
            await sock.presenceSubscribe(chatId);
            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sock.sendPresenceUpdate('paused', chatId);
            return true;
        } catch (error) {
            console.error('Error sending post-command typing indicator:', error);
            return false;
        }
    }
    return false;
}

module.exports = {
    command: 'autotyping',
    aliases: ['typing', 'autotype'],
    category: 'owner',
    description: 'Toggle auto-typing indicator when bot is processing messages',
    usage: '.autotyping <on|off>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        
        try {
            const config = await initConfig();
            const action = args[0]?.toLowerCase();
            
            if (!action) {
                const ghostActive = await isGhostModeActive();
                await sock.sendMessage(chatId, {
                    text: `*⌨️ AUTOTYPING STATUS*\n\n` +
                          `*Current Status:* ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                          `*Ghost Mode:* ${ghostActive ? '👻 Active (blocks typing)' : '❌ Inactive'}\n` +
                          `*Storage:* ${HAS_DB ? 'Database' : 'File System'}\n\n` +
                          `*Commands:*\n` +
                          `• \`.autotyping on\` - Enable auto-typing\n` +
                          `• \`.autotyping off\` - Disable auto-typing\n\n` +
                          `*What it does:*\n` +
                          `When enabled, the bot will show "typing..." indicator while processing messages and commands.\n\n` +
                          `*Note:* Ghost mode overrides autotyping to maintain stealth.`,
                    ...channelInfo
                }, { quoted: message });
                return;
            }

            if (action === 'on' || action === 'enable') {
                if (config.enabled) {
                    await sock.sendMessage(chatId, {
                        text: '⚠️ *Autotyping is already enabled*',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                config.enabled = true;
                await saveConfig(config);
                
                const ghostActive = await isGhostModeActive();
                await sock.sendMessage(chatId, {
                    text: `✅ *Auto-typing enabled!*\n\nThe bot will now show typing indicator while processing.${ghostActive ? '\n\n⚠️ *Ghost mode is active* - typing indicators are currently blocked.' : ''}`,
                    ...channelInfo
                }, { quoted: message });
                
            } else if (action === 'off' || action === 'disable') {
                if (!config.enabled) {
                    await sock.sendMessage(chatId, {
                        text: '⚠️ *Autotyping is already disabled*',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                config.enabled = false;
                await saveConfig(config);
                
                await sock.sendMessage(chatId, {
                    text: '❌ *Auto-typing disabled!*\n\nThe bot will no longer show typing indicator.',
                    ...channelInfo
                }, { quoted: message });
                
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ *Invalid option!*\n\nUse: `.autotyping on/off`',
                    ...channelInfo
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('Error in autotyping command:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *Error processing command!*',
                ...channelInfo
            }, { quoted: message });
        }
    },

    isAutotypingEnabled,
    handleAutotypingForMessage,
    handleAutotypingForCommand,
    showTypingAfterCommand
};


    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading autotyping.js:', e.message); }

/* ===== cmdreact.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    
const { setCommandReactState } = require('../lib/reactions');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);


module.exports = {
  command: 'creact',
  aliases: ['cmdreact'],
  category: 'owner',
  description: 'Toggle command reactions',
  usage: '.creact on/off',
  ownerOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    if (!args[0] || !['on', 'off'].includes(args[0])) {
      await sock.sendMessage(chatId, { 
        text: `*Usage:*\n.creact on/off\n\nStorage: ${HAS_DB ? 'Database' : 'File System'}`,
        ...channelInfo
      }, { quoted: message });
      return;
    }

    if (args[0] === 'on') {
      await setCommandReactState(true);
      await sock.sendMessage(chatId, { 
        text: `*✅ Command reactions enabled*\n\nStorage: ${HAS_DB ? 'Database' : 'File System'}`,
        ...channelInfo
      }, { quoted: message });
    } else if (args[0] === 'off') {
      await setCommandReactState(false);
      await sock.sendMessage(chatId, { 
        text: `*❌ Command reactions disabled*\n\nStorage: ${HAS_DB ? 'Database' : 'File System'}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};

  

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading cmdreact.js:', e.message); }

/* ===== addreply.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *    ADDREPLY v3.0 — Multi-match · Priority · Cooldown · Media              *
 *                                                                           *
 *****************************************************************************/

'use strict';

const crypto = require('crypto');
const { initConfig, saveConfig, MATCH_TYPES } = require('./autoreply.js');

const HELP_TEXT =
`╔══════════════════════════════╗
║    ➕ ADD AUTO-REPLY v3.0   ║
╚══════════════════════════════╝

*Basic:*
\`.addreply <trigger> | <response>\`

*Match type prefix (optional):*
• \`exact:<trigger>\` — full message match
• \`starts:<trigger>\` — message starts with
• \`ends:<trigger>\` — message ends with
• \`regex:<pattern>\` — regex pattern

*Options (append after response with \`;\`):*
• \`priority=1\` — 1 (highest) to 10 (lowest), default 5
• \`cooldown=30\` — seconds between triggers per user
• \`case=yes\` — case-sensitive match
• \`react=🔥\` — react emoji on trigger
• \`image=<url>\` — send image instead of text
• \`grouponly\` — only trigger in groups
• \`dmonly\` — only trigger in DMs
• \`startHour=8\` + \`endHour=22\` — time window

*Variables in response:*
{name} {number} {group} {time} {date}

*Examples:*
\`.addreply hello | Hi {name}! 👋\`
\`.addreply exact:good morning | Good morning ☀️ ; cooldown=60\`
\`.addreply regex:^(hi|hey|hola)$ | Hey {name}! ; react=👋\`
\`.addreply starts:help | Use .menu for commands ; priority=1\``;

module.exports = {
    command:     'addreply',
    aliases:     ['newtrigger', 'setreply', 'ar+'],
    category:    'owner',
    description: 'Add an auto-reply trigger (v3.0)',
    usage:       '.addreply <trigger> | <response> [; options]',
    ownerOnly:   true,

    async handler(sock, message, args, context = {}) {
        const chatId    = context.chatId     || message.key.remoteJid;
        const senderId  = context.senderId   || message.key.participant || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        const fullText  = args.join(' ');
        const pipeIdx   = fullText.indexOf('|');

        if (!fullText || pipeIdx === -1) {
            return await sock.sendMessage(chatId, { text: HELP_TEXT, ...channelInfo }, { quoted: message });
        }

        /* ── parse trigger ── */
        let rawTrigger = fullText.substring(0, pipeIdx).trim();
        let matchType  = 'contains';

        const prefixMap = { 'exact:': 'exact', 'starts:': 'startsWith', 'ends:': 'endsWith', 'regex:': 'regex' };
        for (const [pfx, mt] of Object.entries(prefixMap)) {
            if (rawTrigger.toLowerCase().startsWith(pfx)) {
                matchType  = mt;
                rawTrigger = rawTrigger.slice(pfx.length).trim();
                break;
            }
            /* legacy: exactMatch colon form */
            if (rawTrigger.toLowerCase().startsWith('exact:') && pfx === 'exact:') {
                matchType  = 'exact';
                rawTrigger = rawTrigger.slice(6).trim();
                break;
            }
        }

        /* ── parse response + options ── */
        const afterPipe   = fullText.substring(pipeIdx + 1).trim();
        const semiIdx     = afterPipe.lastIndexOf(';');
        const rawResponse = semiIdx === -1 ? afterPipe : afterPipe.substring(0, semiIdx).trim();
        const optStr      = semiIdx === -1 ? ''         : afterPipe.substring(semiIdx + 1).trim();

        if (!rawTrigger || !rawResponse) {
            return await sock.sendMessage(chatId,
                { text: '❌ Trigger and response are both required.', ...channelInfo }, { quoted: message });
        }

        /* ── parse options ── */
        const opts = {};
        if (optStr) {
            for (const part of optStr.split(',')) {
                const [k, v] = part.trim().split('=');
                if (k && v !== undefined) opts[k.trim().toLowerCase()] = v.trim();
                else if (k?.trim().toLowerCase() === 'grouponly') opts.grouponly = true;
                else if (k?.trim().toLowerCase() === 'dmonly')    opts.dmonly    = true;
            }
        }

        const priority      = parseInt(opts.priority)   || 5;
        const cooldownMs    = (parseInt(opts.cooldown)  || 0) * 1000;
        const caseSensitive = opts.case === 'yes';
        const reactEmoji    = opts.react  || null;
        const mediaUrl      = opts.image  || null;
        const responseType  = mediaUrl ? 'image' : 'text';
        const groupOnly     = !!opts.grouponly;
        const dmOnly        = !!opts.dmonly;
        const startHour     = opts.starthour != null ? parseInt(opts.starthour) : null;
        const endHour       = opts.endhour   != null ? parseInt(opts.endhour)   : null;
        const timeRestrict  = startHour != null && endHour != null ? { startHour, endHour } : null;

        /* ── load config and check duplicate ── */
        const config = await initConfig();
        const trigger = rawTrigger.toLowerCase();
        const dupe    = config.replies.find(r =>
            r.trigger === trigger && r.matchType === matchType);

        if (dupe) {
            return await sock.sendMessage(chatId, {
                text: `⚠️ A *${matchType}* rule for "*${trigger}*" already exists!\n` +
                      `Use \`.delreply ${trigger}\` first.`,
                ...channelInfo
            }, { quoted: message });
        }

        /* ── create rule ── */
        const rule = {
            id:           crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
            trigger,
            matchType,
            response:     rawResponse,
            responseType,
            mediaUrl,
            priority,
            caseSensitive,
            cooldownMs,
            reactEmoji,
            groupOnly,
            dmOnly,
            timeRestrict,
            addedBy:      senderId,
            createdAt:    Date.now(),
            hitCount:     0,
            lastHit:      null
        };

        config.replies.push(rule);
        await saveConfig(config);

        const matchIcon = { contains: '🔍', exact: '🎯', startsWith: '▶️', endsWith: '◀️', regex: '🔣' };
        const optLines  = [
            priority !== 5                  && `Priority: ${priority}`,
            cooldownMs > 0                  && `Cooldown: ${cooldownMs / 1000}s`,
            caseSensitive                   && `Case-sensitive`,
            reactEmoji                      && `React: ${reactEmoji}`,
            responseType === 'image'        && `Image response`,
            groupOnly                       && `Group only`,
            dmOnly                          && `DM only`,
            timeRestrict                    && `Time: ${startHour}:00–${endHour}:00`
        ].filter(Boolean);

        await sock.sendMessage(chatId, {
            text: `✅ *Auto-Reply Added!*\n\n` +
                  `${matchIcon[matchType] || '🔍'} *Trigger:* ${rawTrigger}\n` +
                  `📐 *Match:* ${matchType}\n` +
                  `💬 *Response:* ${rawResponse.substring(0, 60)}${rawResponse.length > 60 ? '…' : ''}\n` +
                  (optLines.length ? `⚙️ *Options:* ${optLines.join(' · ')}\n` : '') +
                  `\n_Rule #${config.replies.length} · Total: ${config.replies.length}_`,
            ...channelInfo
        }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading addreply.js:', e.message); }

/* ===== delreply.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const { initConfig, saveConfig } = require('./autoreply.js');

module.exports = {
    command: 'delreply',
    aliases: ['removereply', 'rmreply'],
    category: 'owner',
    description: 'Delete an auto-reply trigger',
    usage: '.delreply <trigger>',
    ownerOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        if (!args || args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please provide the trigger to delete.\n\nUsage: `.delreply hello`\nSee all triggers: `.listreplies`',
                ...channelInfo
            }, { quoted: message });
        }

        const trigger = args.join(' ').toLowerCase().trim();
        const config = await initConfig();
        const before = config.replies.length;

        config.replies = config.replies.filter(r => r.trigger !== trigger);

        if (config.replies.length === before) {
            return await sock.sendMessage(chatId, {
                text: `❌ No auto-reply found for *"${trigger}"*\n\nUse \`.listreplies\` to see all triggers.`,
                ...channelInfo
            }, { quoted: message });
        }

        await saveConfig(config);

        await sock.sendMessage(chatId, {
            text: `🗑️ *Auto-reply deleted!*\n\nTrigger *"${trigger}"* has been removed.`,
            ...channelInfo
        }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading delreply.js:', e.message); }

/* ===== listreplies.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const { initConfig } = require('./autoreply.js');

module.exports = {
    command: 'listreplies',
    aliases: ['autoreplies', 'replylist', 'replies'],
    category: 'owner',
    description: 'List all configured auto-reply triggers',
    usage: '.listreplies',
    ownerOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        const config = await initConfig();

        if (config.replies.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `📭 *No auto-replies configured yet*\n\nStatus: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n\nUse \`.addreply <trigger> | <response>\` to add one!`,
                ...channelInfo
            }, { quoted: message });
        }

        const lines = config.replies.map((r, i) => {
            const preview = r.response.length > 40
                ? r.response.substring(0, 40) + '...'
                : r.response;
            const matchIcon = r.exactMatch ? '🎯' : '🔍';
            return `${i + 1}. ${matchIcon} *${r.trigger}*\n    ↳ ${preview}`;
        }).join('\n\n');

        await sock.sendMessage(chatId, {
            text: `*🤖 AUTO-REPLIES (${config.replies.length})*\n` +
                  `*Status:* ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n\n` +
                  `${lines}\n\n` +
                  `🎯 = exact match | 🔍 = contains\n` +
                  `_Use .delreply <trigger> to remove one_`,
            ...channelInfo
        }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-10-group] Error loading listreplies.js:', e.message); }

module.exports = _bundle;