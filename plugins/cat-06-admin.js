'use strict';
// AUTO-GENERATED BUNDLE: cat-06-admin
// Contains: promote.js, demote.js, kick.js, kickall.js, kickadmins.js, ban.js, unban.js, mute.js, unmute.js, gcadd.js, gcsettings.js, hidetag.js, tag.js, tagall.js, tagnotadmin.js, joinrequests.js, approve.js, invitelink.js, resetlink.js, joingroup.js, groupdata.js, groupinfo.js, gcstatus.js, pinchat.js, manage.js, disappear.js, mention.js, clear.js, clearsession.js, cleartmp.js, character.js, delete.js
// NOTE: the old "clearchat.js" slot here had been overwritten with a duplicate dead 'chatbot' command (no real .clearchat handler was left) — removed. The single working chatbot lives in plugins/chatbot.js. .clearchat itself does not currently exist anywhere in the plugin set — add it back separately if you need it.

const _bundle = [];


/* ===== promote.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { isAdmin } = require('../lib/isAdmin');

async function handlePromotionEvent(sock, groupId, participants, author) {
  try {
    if (!Array.isArray(participants) || participants.length === 0) {
      return;
    }
    
    const promotedUsernames = await Promise.all(participants.map(async jid => {
      const jidString = typeof jid === 'string' ? jid : (jid.id || jid.toString());
      return `@${jidString.split('@')[0]} `;
    }));

    let promotedBy;
    let mentionList = participants.map(jid => {
      return typeof jid === 'string' ? jid : (jid.id || jid.toString());
    });

    if (author && author.length > 0) {
      const authorJid = typeof author === 'string' ? author : (author.id || author.toString());
      promotedBy = `@${authorJid.split('@')[0]}`;
      mentionList.push(authorJid);
    } else {
      promotedBy = 'System';
    }

    const promotionMessage = `*『 GROUP PROMOTION 』*\n\n` +
      `👥 *Promoted User${participants.length > 1 ? 's' : ''}:*\n` +
      `${promotedUsernames.map(name => `• ${name}`).join('\n')}\n\n` +
      `👑 *Promoted By:* ${promotedBy}\n\n` +
      `📅 *Date:* ${new Date().toLocaleString()}`;
    
    await sock.sendMessage(groupId, {
      text: promotionMessage,
      mentions: mentionList
    });
  } catch (error) {
    console.error('Error handling promotion event:', error);
  }
}

module.exports = {
  command: 'promote',
  aliases: ['admin'],
  category: 'admin',
  description: 'Promote user(s) to admin',
  usage: '.promote [@user] or reply to message',
  groupOnly: true,
  adminOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    let userToPromote = [];
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    
    if (mentionedJids && mentionedJids.length > 0) {
      userToPromote = mentionedJids;
    }
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
      userToPromote = [message.message.extendedTextMessage.contextInfo.participant];
    }
    
    if (userToPromote.length === 0) {
      await sock.sendMessage(chatId, { 
        text: 'Please mention the user or reply to their message to promote!',
        ...channelInfo
      }, { quoted: message });
      return;
    }

    try {
      await sock.groupParticipantsUpdate(chatId, userToPromote, "promote");

      const usernames = await Promise.all(userToPromote.map(async jid => {
        return `@${jid.split('@')[0]}`;
      }));
      
      const promoterJid = sock.user.id;
      
      const promotionMessage = `*『 GROUP PROMOTION 』*\n\n` +
        `👥 *Promoted User${userToPromote.length > 1 ? 's' : ''}:*\n` +
        `${usernames.map(name => `• ${name}`).join('\n')}\n\n` +
        `👑 *Promoted By:* @${promoterJid.split('@')[0]}\n\n` +
        `📅 *Date:* ${new Date().toLocaleString()}`;
        
      await sock.sendMessage(chatId, { 
        text: promotionMessage,
        mentions: [...userToPromote, promoterJid],
        ...channelInfo
      });
    } catch (error) {
      console.error('Error in promote command:', error);
      await sock.sendMessage(chatId, { 
        text: 'Failed to promote user(s)!',
        ...channelInfo
      }, { quoted: message });
    }
  },
  
  handlePromotionEvent
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading promote.js:', e.message); }

/* ===== demote.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    async function handleDemotionEvent(sock, groupId, participants, author) {
    try {
        if (!Array.isArray(participants) || participants.length === 0) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demotedUsernames = await Promise.all(participants.map(async jid => {
            const jidString = typeof jid === 'string' ? jid : (jid.id || jid.toString());
            return `@${jidString.split('@')[0]}`;
        }));

        let demotedBy;
        let mentionList = participants.map(jid => {
            return typeof jid === 'string' ? jid : (jid.id || jid.toString());
        });

        if (author && author.length > 0) {
            const authorJid = typeof author === 'string' ? author : (author.id || author.toString());
            demotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            demotedBy = 'System';
        }
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demotionMessage = `*『 GROUP DEMOTION 』*\n\n` +
            `👤 *Demoted User${participants.length > 1 ? 's' : ''}:*\n` +
            `${demotedUsernames.map(name => `• ${name}`).join('\n')}\n\n` +
            `👑 *Demoted By:* ${demotedBy}\n\n` +
            `📅 *Date:* ${new Date().toLocaleString()}`;
        
        await sock.sendMessage(groupId, {
            text: demotionMessage,
            mentions: mentionList
        });
    } catch (error) {
        console.error('Error handling demotion event:', error);
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

module.exports = {
    command: 'demote',
    aliases: ['dmt', 'removeadmin'],
    category: 'admin',
    description: 'Demote user(s) from admin to member',
    usage: '.demote @user or reply to message',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const isBotAdmin = context.isBotAdmin;

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Please make the bot an admin first*'
            }, { quoted: message });
            return;
        }

        let userToDemote = [];
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (mentionedJids && mentionedJids.length > 0) {
            userToDemote = mentionedJids;
        }
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToDemote = [message.message.extendedTextMessage.contextInfo.participant];
        }
        
        if (userToDemote.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Please mention a user or reply to their message*\n\nUsage: `.demote @user` or reply with `.demote`'
            }, { quoted: message });
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sock.groupParticipantsUpdate(chatId, userToDemote, "demote");
            
            const usernames = await Promise.all(userToDemote.map(async jid => {
                return `@${jid.split('@')[0]}`;
            }));
            
            await new Promise(resolve => setTimeout(resolve, 1000));

            const demotionMessage = `*『 GROUP DEMOTION 』*\n\n` +
                `👤 *Demoted User${userToDemote.length > 1 ? 's' : ''}:*\n` +
                `${usernames.map(name => `• ${name}`).join('\n')}\n\n` +
                `👑 *Demoted By:* @${message.key.participant ? message.key.participant.split('@')[0] : message.key.remoteJid.split('@')[0]}\n\n` +
                `📅 *Date:* ${new Date().toLocaleString()}`;
            
            await sock.sendMessage(chatId, { 
                text: demotionMessage,
                mentions: [...userToDemote, message.key.participant || message.key.remoteJid]
            }, { quoted: message });
        } catch (error) {
            console.error('Error in demote command:', error);
            if (error.data === 429) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    await sock.sendMessage(chatId, { 
                        text: '❌ *Rate limit reached*\n\nPlease try again in a few seconds.'
                    }, { quoted: message });
                } catch (retryError) {
                    console.error('Error sending retry message:', retryError);
                }
            } else {
                try {
                    await sock.sendMessage(chatId, { 
                        text: '❌ *Failed to demote user(s)*\n\nMake sure the bot has sufficient permissions.'
                    }, { quoted: message });
                } catch (sendError) {
                    console.error('Error sending error message:', sendError);
                }
            }
        }
    },

    handleDemotionEvent
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading demote.js:', e.message); }

/* ===== kick.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
    command: 'kick',
    aliases: ['remove', 'fire'],
    category: 'admin',
    description: 'Remove user(s) from the group',
    usage: '.kick @user or reply to message',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const isBotAdmin = context.isBotAdmin;

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Please make the bot an admin first*' 
            }, { quoted: message });
            return;
        }

        let usersToKick = [];
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (mentionedJids && mentionedJids.length > 0) {
            usersToKick = mentionedJids;
        }
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            usersToKick = [message.message.extendedTextMessage.contextInfo.participant];
        }
        
        if (usersToKick.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Please mention a user or reply to their message*\n\nUsage: `.kick @user` or reply with `.kick`'
            }, { quoted: message });
            return;
        }

        const botId = sock.user?.id || '';
        const botLid = sock.user?.lid || '';
        const botPhoneNumber = botId.includes(':') ? botId.split(':')[0] : (botId.includes('@') ? botId.split('@')[0] : botId);
        const botIdFormatted = botPhoneNumber + '@s.whatsapp.net';
        
        const botLidNumeric = botLid.includes(':') ? botLid.split(':')[0] : (botLid.includes('@') ? botLid.split('@')[0] : botLid);
        const botLidWithoutSuffix = botLid.includes('@') ? botLid.split('@')[0] : botLid;

        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants || [];

        const isTryingToKickBot = usersToKick.some(userId => {
            const userPhoneNumber = userId.includes(':') ? userId.split(':')[0] : (userId.includes('@') ? userId.split('@')[0] : userId);
            const userLidNumeric = userId.includes('@lid') ? userId.split('@')[0].split(':')[0] : '';
            
            const directMatch = (
                userId === botId ||
                userId === botLid ||
                userId === botIdFormatted ||
                userPhoneNumber === botPhoneNumber ||
                (userLidNumeric && botLidNumeric && userLidNumeric === botLidNumeric)
            );
            
            if (directMatch) {
                return true;
            }
            
            const participantMatch = participants.some(p => {
                const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
                const pId = p.id ? p.id.split('@')[0] : '';
                const pLid = p.lid ? p.lid.split('@')[0] : '';
                const pFullId = p.id || '';
                const pFullLid = p.lid || '';
                
                const pLidNumeric = pLid.includes(':') ? pLid.split(':')[0] : pLid;
                
                const isThisParticipantBot = (
                    pFullId === botId ||
                    pFullLid === botLid ||
                    pLidNumeric === botLidNumeric ||
                    pPhoneNumber === botPhoneNumber ||
                    pId === botPhoneNumber ||
                    p.phoneNumber === botIdFormatted ||
                    (botLid && pLid && botLidWithoutSuffix === pLid)
                );
                
                if (isThisParticipantBot) {
                    return (
                        userId === pFullId ||
                        userId === pFullLid ||
                        userPhoneNumber === pPhoneNumber ||
                        userPhoneNumber === pId ||
                        userId === p.phoneNumber ||
                        (pLid && userLidNumeric && userLidNumeric === pLidNumeric) ||
                        (userLidNumeric && pLidNumeric && userLidNumeric === pLidNumeric)
                    );
                }
                return false;
            });
            
            return participantMatch;
        });

        if (isTryingToKickBot) {
            await sock.sendMessage(chatId, { 
                text: "❌ *I can't kick myself* 🤖"
            }, { quoted: message });
            return;
        }

        try {
            // WhatsApp may supply @lid for mentions/replies. Resolve it to the
            // participant's real JID before calling groupParticipantsUpdate.
            const resolvedUsersToKick = usersToKick.map(target => {
                const t = String(target || '');
                const tNum = t.split('@')[0].split(':')[0];
                const match = participants.find(p => {
                    const id = String(p.id || '');
                    const lid = String(p.lid || '');
                    const phone = String(p.phoneNumber || '');
                    return t === id || t === lid ||
                           tNum === id.split('@')[0].split(':')[0] ||
                           tNum === lid.split('@')[0].split(':')[0] ||
                           tNum === phone.split('@')[0].split(':')[0];
                });
                return match?.id || target;
            });

            await sock.groupParticipantsUpdate(chatId, resolvedUsersToKick, "remove");
            
            const usernames = await Promise.all(resolvedUsersToKick.map(async jid => {
                return `@${jid.split('@')[0]}`;
            }));
            
            await sock.sendMessage(chatId, { 
                text: `🚫 *User${resolvedUsersToKick.length > 1 ? 's' : ''} Removed*\n\n${usernames.join(', ')} has been kicked from the group!`,
                mentions: resolvedUsersToKick
            }, { quoted: message });
        } catch (error) {
            console.error('Error in kick command:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ *Failed to kick user(s)*\n\nMake sure the bot has sufficient permissions.'
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading kick.js:', e.message); }

/* ===== kickall.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
    command: 'kickall',
    aliases: ['removeall'],
    category: 'owner',
    description: 'Kick all non‑admin participants from the group (except bot and owner)',
    usage: '.kickall',
    groupOnly: true,
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const isBotAdmin = context.isBotAdmin;
        const senderId = context.senderId;

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Please make the bot an admin first*' 
            }, { quoted: message });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];
        const admins = participants.filter(p => p.admin).map(p => p.id);
        const botId = sock.user.id;
        const botNumber = botId.split(':')[0];

        // Users to kick: participants who are NOT admins AND not bot AND not sender
        const toKick = participants
            .map(p => p.id)
            .filter(jid => {
                if (admins.includes(jid)) return false; // skip admins
                if (jid.includes(botNumber) || jid === botId) return false; // skip bot
                if (senderId && (jid === senderId || jid.split('@')[0] === senderId.split('@')[0])) return false; // skip owner
                return true;
            });

        if (toKick.length === 0) {
            await sock.sendMessage(chatId, { text: 'No non‑admins to kick.' }, { quoted: message });
            return;
        }

        const BATCH_SIZE = 500;
        let kicked = 0, errors = 0;

        for (let i = 0; i < toKick.length; i += BATCH_SIZE) {
            const batch = toKick.slice(i, i + BATCH_SIZE);
            try {
                await sock.groupParticipantsUpdate(chatId, batch, "remove");
                kicked += batch.length;
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
                console.error('Error kicking batch:', err);
                errors += batch.length;
            }
        }

        await sock.sendMessage(chatId, { 
            text: `🚪 *Kickall completed*\n\n` +
                  `Total non‑admins: ${toKick.length}\n` +
                  `Kicked: ${kicked}\n` +
                  `Errors: ${errors}`
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading kickall.js:', e.message); }

/* ===== kickadmins.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
    command: 'kickadmins',
    aliases: ['removeadmins', 'fireadmins'],
    category: 'owner',
    description: 'Kick all admin participants from the group (except bot and owner)',
    usage: '.kickadmins',
    groupOnly: true,
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const isBotAdmin = context.isBotAdmin;
        const senderId = context.senderId;

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Please make the bot an admin first*' 
            }, { quoted: message });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];
        const botId = sock.user.id;
        const botNumber = botId.split(':')[0];

        // Admins to kick: participants who are admins, not bot, not owner
        const toKick = participants
            .filter(p => p.admin)
            .map(p => p.id)
            .filter(jid => {
                if (jid.includes(botNumber) || jid === botId) return false;
                if (senderId && (jid === senderId || jid.split('@')[0] === senderId.split('@')[0])) return false;
                return true;
            });

        if (toKick.length === 0) {
            await sock.sendMessage(chatId, { text: 'No admins to kick (only bot and owner).' }, { quoted: message });
            return;
        }

        const BATCH_SIZE = 500;
        let kicked = 0, errors = 0;

        for (let i = 0; i < toKick.length; i += BATCH_SIZE) {
            const batch = toKick.slice(i, i + BATCH_SIZE);
            try {
                await sock.groupParticipantsUpdate(chatId, batch, "remove");
                kicked += batch.length;
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
                console.error('Error kicking admin batch:', err);
                errors += batch.length;
            }
        }

        await sock.sendMessage(chatId, { 
            text: `👑 *Kickadmins completed*\n\n` +
                  `Admins kicked: ${kicked}\n` +
                  `Errors: ${errors}`
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading kickadmins.js:', e.message); }

/* ===== ban.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fs = require('fs');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);


const bannedFilePath = './data/banned.json';

async function getBannedUsers() {
    if (HAS_DB) {
        const banned = await store.getSetting('global', 'banned');
        return banned || [];
    } else {
        if (fs.existsSync(bannedFilePath)) {
            return JSON.parse(fs.readFileSync(bannedFilePath));
        }
        return [];
    }
}

async function saveBannedUsers(bannedUsers) {
    if (HAS_DB) {
        await store.saveSetting('global', 'banned', bannedUsers);
    } else {
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data', { recursive: true });
        }
        fs.writeFileSync(bannedFilePath, JSON.stringify(bannedUsers, null, 2));
    }
}

async function isUserBanned(userId) {
    const bannedUsers = await getBannedUsers();
    return bannedUsers.includes(userId);
}

module.exports = {
    command: 'ban',
    aliases: ['block', 'banuser'],
    category: 'group',
    description: 'Ban a user from using the bot',
    usage: '.ban @user or reply to message',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const isGroup = context.isGroup;

        let userToBan;
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToBan = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToBan = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToBan) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Please mention a user or reply to their message*\n\nUsage: `.ban @user` or reply with `.ban`',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        try {
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            if (userToBan === botId || userToBan === botId.replace('@s.whatsapp.net', '@lid')) {
                await sock.sendMessage(chatId, { 
                    text: '❌ *Cannot ban the bot account*',
                    ...channelInfo 
                }, { quoted: message });
                return;
            }
        } catch (e) {}

        try {
            let bannedUsers = await getBannedUsers();
            
            if (!bannedUsers.includes(userToBan)) {
                bannedUsers.push(userToBan);
                await saveBannedUsers(bannedUsers);
                
                await sock.sendMessage(chatId, { 
                    text: `🚫 *User Banned Successfully!*\n\n@${userToBan.split('@')[0]} has been banned from using the bot.\n\n` +
                          `*Storage:* ${HAS_DB ? 'Database' : 'File System'}`,
                    mentions: [userToBan],
                    ...channelInfo 
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *Already Banned*\n\n@${userToBan.split('@')[0]} is already banned!`,
                    mentions: [userToBan],
                    ...channelInfo 
                }, { quoted: message });
            }
        } catch (error) {
            console.error('Error in ban command:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ *Failed to ban user!*\n\nPlease try again.',
                ...channelInfo 
            }, { quoted: message });
        }
    }
};

module.exports.getBannedUsers = getBannedUsers;
module.exports.saveBannedUsers = saveBannedUsers;
module.exports.isUserBanned = isUserBanned;

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading ban.js:', e.message); }

/* ===== unban.js ===== */
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

const bannedFilePath = './data/banned.json';

async function getBannedUsers() {
    if (HAS_DB) {
        const banned = await store.getSetting('global', 'banned');
        return banned || [];
    } else {
        if (fs.existsSync(bannedFilePath)) {
            return JSON.parse(fs.readFileSync(bannedFilePath));
        }
        return [];
    }
}

async function saveBannedUsers(bannedUsers) {
    if (HAS_DB) {
        await store.saveSetting('global', 'banned', bannedUsers);
    } else {
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data', { recursive: true });
        }
        fs.writeFileSync(bannedFilePath, JSON.stringify(bannedUsers, null, 2));
    }
}

module.exports = {
  command: 'unban',
  aliases: ['pardon'],
  category: 'admin',
  description: 'Unban a user from using the bot',
  usage: '.unban [@user] or reply to message',
  ownerOnly: false,
  
  async handler(sock, message, args, context) {
    const { chatId, senderId, isGroup, channelInfo, senderIsOwnerOrSudo, isSenderAdmin, isBotAdmin } = context;
    
    if (isGroup) {
      if (!isBotAdmin) {
        await sock.sendMessage(chatId, { 
          text: 'Please make the bot an admin to use .unban', 
          ...channelInfo 
        }, { quoted: message });
        return;
      }
      if (!isSenderAdmin && !message.key.fromMe && !senderIsOwnerOrSudo) {
        await sock.sendMessage(chatId, { 
          text: 'Only group admins can use .unban', 
          ...channelInfo 
        }, { quoted: message });
        return;
      }
    } else {
      if (!message.key.fromMe && !senderIsOwnerOrSudo) {
        await sock.sendMessage(chatId, { 
          text: 'Only owner/sudo can use .unban in private chat', 
          ...channelInfo 
        }, { quoted: message });
        return;
      }
    }
    
    let userToUnban;
    
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
      userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
      userToUnban = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToUnban) {
      await sock.sendMessage(chatId, { 
        text: 'Please mention the user or reply to their message to unban!', 
        ...channelInfo 
      }, { quoted: message });
      return;
    }

    try {
      const bannedUsers = await getBannedUsers();
      const index = bannedUsers.indexOf(userToUnban);
      
      if (index > -1) {
        bannedUsers.splice(index, 1);
        await saveBannedUsers(bannedUsers);
        
        await sock.sendMessage(chatId, { 
          text: `✅ Successfully unbanned @${userToUnban.split('@')[0]}!\n\nStorage: ${HAS_DB ? 'Database' : 'File System'}`,
          mentions: [userToUnban],
          ...channelInfo 
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { 
          text: `@${userToUnban.split('@')[0]} is not banned!`,
          mentions: [userToUnban],
          ...channelInfo 
        }, { quoted: message });
      }
    } catch (error) {
      console.error('Error in unban command:', error);
      await sock.sendMessage(chatId, { 
        text: 'Failed to unban user!', 
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading unban.js:', e.message); }

/* ===== mute.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'mute',
  aliases: ['silence'],
  category: 'admin',
  description: 'Mute the group for a specified duration',
  usage: '.mute [duration in minutes]',
  groupOnly: true,
  adminOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, isBotAdmin } = context;
    const durationInMinutes = args[0] ? parseInt(args[0]) : undefined;

    if (!isBotAdmin) {
      return sock.sendMessage(chatId, {
        text: '❌ I need to be a *group admin* to mute this group.'
      }, { quoted: message });
    }

    try {
      await sock.groupSettingUpdate(chatId, 'announcement');
      
      if (durationInMinutes !== undefined && durationInMinutes > 0) {
        await sock.sendMessage(chatId, { 
          text: `🔇 Group muted for ${durationInMinutes} minutes.`
        }, { quoted: message });
        
        setTimeout(async () => {
          try {
            await sock.groupSettingUpdate(chatId, 'not_announcement');
            await sock.sendMessage(chatId, { 
              text: '🔊 Group unmuted.'
            });
          } catch (unmuteError) {
            console.error('Error unmuting group:', unmuteError);
          }
        }, durationInMinutes * 60 * 1000);
      } else {
        await sock.sendMessage(chatId, { 
          text: '🔇 Group muted.'
        }, { quoted: message });
      }
    } catch (error) {
      console.error('Error muting group:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ An error occurred while muting the group. Please try again.'
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading mute.js:', e.message); }

/* ===== unmute.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'unmute',
  aliases: ['unsilence'],
  category: 'admin',
  description: 'Unmute the group',
  usage: '.unmute',
  groupOnly: true,
  adminOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo, isBotAdmin } = context;

    if (!isBotAdmin) {
      return sock.sendMessage(chatId, {
        text: '❌ I need to be a *group admin* to unmute this group.',
        ...channelInfo
      }, { quoted: message });
    }

    try {
      await sock.groupSettingUpdate(chatId, 'not_announcement');
      await sock.sendMessage(chatId, { 
        text: 'The group has been unmuted.',
        ...channelInfo
      }, { quoted: message });
    } catch (error) {
      console.error('Error unmuting group:', error);
      await sock.sendMessage(chatId, { 
        text: 'Failed to unmute the group.',
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading unmute.js:', e.message); }

/* ===== gcadd.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@AbdulRehman19721986                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *                                                                           *
 *    © 2026 AbdulRehman19721986. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the REDXBOT302 Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/


module.exports = {
    command: 'add',
    aliases: ['invite', 'gcadd', 'addgc'],
    category: 'group',
    description: 'Add a user to the group',
    usage: '.add <number> or reply to vcard/message',
    groupOnly: 'true',
    adminOnly: 'true',

    async handler(sock, message, args, context = {}) {
        const { chatId, channelInfo } = context;

        let targetNumber = null;

        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
            const quotedParticipant = message.message.extendedTextMessage.contextInfo.participant;

            if (quotedMsg.contactMessage) {
                const vcard = quotedMsg.contactMessage.vcard;
                const phoneMatch = vcard.match(/waid=(\d+)/);
                if (phoneMatch) {
                    targetNumber = phoneMatch[1];
                } else {
                    const telMatch = vcard.match(/TEL.*?:(\+?\d+)/);
                    if (telMatch) {
                        targetNumber = telMatch[1].replace(/\D/g, '');
                    }
                }
            }
            else if (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text) {
                const text = quotedMsg.conversation || quotedMsg.extendedTextMessage.text;
                const numberMatch = text.match(/(\+?\d{10,15})/);
                if (numberMatch) {
                    targetNumber = numberMatch[1].replace(/\D/g, '');
                }
            }
            else if (quotedParticipant) {
                targetNumber = quotedParticipant.split('@')[0];
            }
        }

        if (!targetNumber && args.length > 0) {
            const input = args.join(' ');
            const cleaned = input.replace(/[^\d+]/g, '');
            targetNumber = cleaned.replace(/^\+/, '');
        }

        if (!targetNumber) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Please provide a number to add!*

*Usage:*
• \`.add 923051234567\`
• \`.add 3051234567\`
• \`.add 92 305 1234567\`
• Reply to a vcard with \`.add\`
• Reply to a message with \`.add\``,
                ...channelInfo
            }, { quoted: message });
        }

        if (!targetNumber.startsWith('1') && !targetNumber.startsWith('2') && !targetNumber.startsWith('3') && 
            !targetNumber.startsWith('4') && !targetNumber.startsWith('5') && !targetNumber.startsWith('6') && 
            !targetNumber.startsWith('7') && !targetNumber.startsWith('8') && !targetNumber.startsWith('9')) {
            return await sock.sendMessage(chatId, {
                text: '❌ *Invalid number format!*\n\nPlease include the country code.\nExample: 923051234567',
                ...channelInfo
            }, { quoted: message });
        }

        const targetJid = `${targetNumber}@s.whatsapp.net`;

        // Normalize the phone JID and validate a real WhatsApp-style number.
        // Baileys groupParticipantsUpdate('add') expects the phone JID here.
        if (!/^\d{8,15}@s\.whatsapp\.net$/.test(targetJid)) {
            return await sock.sendMessage(chatId, {
                text: '❌ *Invalid WhatsApp number!*\n\nUse country code, e.g. `.add 923001234567`',
                ...channelInfo
            }, { quoted: message });
        }

        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants.map(p => p.id);
            const participantJids = participants.map(j => String(j).split(':')[0]);
            
            if (participants.includes(targetJid) || participantJids.includes(targetJid)) {
                return await sock.sendMessage(chatId, {
                    text: `⚠️ *User is already in the group!*\n\n${targetNumber}`,
                    ...channelInfo
                }, { quoted: message });
            }

            const result = await sock.groupParticipantsUpdate(
                chatId,
                [targetJid],
                'add'
            );
            const addResult = Array.isArray(result) ? (result[0] || {}) : (result || {});
            const status = String(addResult.status || addResult.code || '');

            if (status === '200' || status === '201') {
                await sock.sendMessage(chatId, {
                    text: `✅ *Successfully added!*\n\n@${targetNumber}`,
                    mentions: [targetJid],
                    ...channelInfo
                }, { quoted: message });
            } else if (status === '403') {
                await sock.sendMessage(chatId, {
                    text: `❌ *Failed to add user!*\n\n*Reason:* User has privacy settings that prevent being added to groups.\n\n*Solution:* Send them the group invite link.`,
                    ...channelInfo
                }, { quoted: message });
            } else if (status === '408') {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *Invite sent!*\n\nUser needs to accept the invitation to join.`,
                    ...channelInfo
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ *Failed to add user!*\n\n*Status:* ${status || 'unknown'}\n\nThe user may have blocked the bot or changed their privacy settings.`,
                    ...channelInfo
                }, { quoted: message });
            }

        } catch (error) {
            console.error('Add command error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ *Error adding user!*\n\n${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@AbdulRehman19721986                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *                                                                           *
 *    © 2026 AbdulRehman19721986. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the REDXBOT302 Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/



    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading gcadd.js:', e.message); }

/* ===== gcsettings.js ===== */
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
    command: 'gcset',
    aliases: ['gsetting', 'groupset', 'gpset'],
    category: 'admin',
    description: 'Change group settings (lock/unlock messages or settings)',
    usage: '.gcset <setting>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const isBotAdmin = context.isBotAdmin || false;

        if (!isBotAdmin) {
            return await sock.sendMessage(chatId, {
                text: `❌ Bot needs to be an admin to change group settings.`,
                ...channelInfo
            }, { quoted: message });
        }

        const setting = args[0]?.toLowerCase();

        if (!setting) {
            return await sock.sendMessage(chatId, {
                text:
                    `╔════════════════╗\n` +
                    `║⚙️ *GROUP SETTINGS*   ║\n` +
                    `╚════════════════╝\n\n` +
                    `📌 *Usage:* \`.gcset <option>\`\n\n` +
                    `────────────────────\n` +
                    `*💬 MESSAGE PERMISSIONS*\n` +
                    `🔒 *lock* — Only admins can send messages\n\n` +
                    `🔓 *unlock* — Everyone can send messages\n\n` +
                    `*🛠️ SETTINGS PERMISSIONS*\n` +
                    `🔒 *lockset* — Only admins can edit group info\n\n` +
                    `🔓 *unlockset* — Everyone can edit group info\n` +
                    `────────────────────`,
                ...channelInfo
            }, { quoted: message });
        }

        const settingsMap = {
            lock:      { value: 'announcement',     label: '🔒 Only admins can send messages' },
            unlock:    { value: 'not_announcement', label: '🔓 Everyone can send messages' },
            lockset:   { value: 'locked',           label: '🔒 Only admins can edit group info' },
            unlockset: { value: 'unlocked',         label: '🔓 Everyone can edit group info' },
        };

        const config = settingsMap[setting];
        if (!config) {
            return await sock.sendMessage(chatId, {
                text: `❌ Unknown setting: *${setting}*\n\nUse \`.groupsettings\` to see options.`,
                ...channelInfo
            }, { quoted: message });
        }

        try {
            await sock.groupSettingUpdate(chatId, config.value);
            return await sock.sendMessage(chatId, {
                text: `✅ ${config.label}`,
                ...channelInfo
            }, { quoted: message });
        } catch (e) {
            console.error('[GROUPSETTINGS] Error:', e.message);
            return await sock.sendMessage(chatId, {
                text: `❌ Failed to update setting: ${e.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading gcsettings.js:', e.message); }

/* ===== hidetag.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

async function downloadMediaMessage(message, mediaType) {
    const stream = await downloadContentFromMessage(message, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    const filePath = path.join(__dirname, '../temp/', `${Date.now()}.${mediaType}`);
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

module.exports = {
    command: 'hidetag',
    aliases: ['ht', 'htag'],
    category: 'admin',
    description: 'Tag all non-admin members without showing their names',
    usage: '.hidetag <message> or reply to message',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const isBotAdmin = context.isBotAdmin;
        const rawText = context.rawText || '';
        const messageText = rawText.slice(8).trim();

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Please make the bot an admin first*' 
            }, { quoted: message });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];
        const nonAdmins = participants.filter(p => !p.admin).map(p => p.id);

        const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (replyMessage) {
            let content = {};
            
            if (replyMessage.imageMessage) {
                const filePath = await downloadMediaMessage(replyMessage.imageMessage, 'image');
                content = { 
                    image: { url: filePath }, 
                    caption: messageText || replyMessage.imageMessage.caption || '', 
                    mentions: nonAdmins 
                };
            } else if (replyMessage.videoMessage) {
                const filePath = await downloadMediaMessage(replyMessage.videoMessage, 'video');
                content = { 
                    video: { url: filePath }, 
                    caption: messageText || replyMessage.videoMessage.caption || '', 
                    mentions: nonAdmins 
                };
            } else if (replyMessage.conversation || replyMessage.extendedTextMessage) {
                content = { 
                    text: replyMessage.conversation || replyMessage.extendedTextMessage.text, 
                    mentions: nonAdmins 
                };
            } else if (replyMessage.documentMessage) {
                const filePath = await downloadMediaMessage(replyMessage.documentMessage, 'document');
                content = { 
                    document: { url: filePath }, 
                    fileName: replyMessage.documentMessage.fileName, 
                    caption: messageText || '', 
                    mentions: nonAdmins 
                };
            }

            if (Object.keys(content).length > 0) {
                await sock.sendMessage(chatId, content);
            }
        } else {
            await sock.sendMessage(chatId, { 
                text: messageText || '📢 *Announcement for all members*', 
                mentions: nonAdmins 
            });
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading hidetag.js:', e.message); }

/* ===== tag.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const isAdmin = require('../lib/isAdmin');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

async function downloadMediaMessage(message, mediaType) {
  const stream = await downloadContentFromMessage(message, mediaType);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  const filePath = path.join(__dirname, '../temp/', `${Date.now()}.${mediaType}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

module.exports = {
  command: 'tag',
  aliases: ['tagall', 'hidetag'],
  category: 'admin',
  description: 'Tag all group members',
  usage: '.tag [message] or reply to a message',
  groupOnly: true,
  adminOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, senderId, channelInfo, messageText } = context;
    
    const groupMetadata = await sock.groupMetadata(chatId);
    const participants = groupMetadata.participants;
    const mentionedJidList = participants.map(p => p.id);

    const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const tagText = args.join(' ');

    if (replyMessage) {
      let messageContent = {};

      if (replyMessage.imageMessage) {
        const filePath = await downloadMediaMessage(replyMessage.imageMessage, 'image');
        messageContent = {
          image: { url: filePath },
          caption: tagText || replyMessage.imageMessage.caption || '',
          mentions: mentionedJidList,
          ...channelInfo
        };
      }
      else if (replyMessage.videoMessage) {
        const filePath = await downloadMediaMessage(replyMessage.videoMessage, 'video');
        messageContent = {
          video: { url: filePath },
          caption: tagText || replyMessage.videoMessage.caption || '',
          mentions: mentionedJidList,
          ...channelInfo
        };
      }
      else if (replyMessage.conversation || replyMessage.extendedTextMessage) {
        messageContent = {
          text: replyMessage.conversation || replyMessage.extendedTextMessage.text,
          mentions: mentionedJidList,
          ...channelInfo
        };
      }
      else if (replyMessage.documentMessage) {
        const filePath = await downloadMediaMessage(replyMessage.documentMessage, 'document');
        messageContent = {
          document: { url: filePath },
          fileName: replyMessage.documentMessage.fileName,
          caption: tagText || '',
          mentions: mentionedJidList,
          ...channelInfo
        };
      }

      if (Object.keys(messageContent).length > 0) {
        await sock.sendMessage(chatId, messageContent);
      }
    } else {
      await sock.sendMessage(chatId, {
        text: tagText || "Tagged message",
        mentions: mentionedJidList,
        ...channelInfo
      });
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading tag.js:', e.message); }

/* ===== tagall.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'tagall',
  aliases: ['everyone', 'all'],
  category: 'admin',
  description: 'Tag all group members with their usernames',
  usage: '.tagall',
  groupOnly: true,
  adminOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const groupMetadata = await sock.groupMetadata(chatId);
      const participants = groupMetadata.participants;

      if (!participants || participants.length === 0) {
        await sock.sendMessage(chatId, { 
          text: 'No participants found in the group.',
          ...channelInfo
        }, { quoted: message });
        return;
      }
      
      let messageText = '🔊 *Hello Everyone:*\n\n';
      participants.forEach(participant => {
        messageText += `@${participant.id.split('@')[0]}\n`;
      });
      
      await sock.sendMessage(chatId, {
        text: messageText,
        mentions: participants.map(p => p.id),
        ...channelInfo
      });

    } catch (error) {
      console.error('Error in tagall command:', error);
      await sock.sendMessage(chatId, { 
        text: 'Failed to tag all members.',
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading tagall.js:', e.message); }

/* ===== tagnotadmin.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'tagnotadmin',
  aliases: ['tagmembers', 'tagnon'],
  category: 'admin',
  description: 'Tag all non-admin members in the group',
  usage: '.tagnotadmin',
  groupOnly: true,
  adminOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const groupMetadata = await sock.groupMetadata(chatId);
      const participants = groupMetadata.participants || [];

      const nonAdmins = participants.filter(p => !p.admin).map(p => p.id);
      
      if (nonAdmins.length === 0) {
        await sock.sendMessage(chatId, { 
          text: 'No non-admin members to tag.',
          ...channelInfo
        }, { quoted: message });
        return;
      }

      let text = '🔊 *Hello Everyone:*\n\n';
      nonAdmins.forEach(jid => {
        text += `@${jid.split('@')[0]}\n`;
      });

      await sock.sendMessage(chatId, { 
        text, 
        mentions: nonAdmins,
        ...channelInfo
      }, { quoted: message });
      
    } catch (error) {
      console.error('Error in tagnotadmin command:', error);
      await sock.sendMessage(chatId, { 
        text: 'Failed to tag non-admin members.',
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading tagnotadmin.js:', e.message); }

/* ===== joinrequests.js ===== */
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
    command: 'joinrequests',
    aliases: ['gcreqs', 'groupreqs', 'pendingjoins', 'approvejoin', 'rejectjoin'],
    category: 'group',
    description: 'View, approve or reject group join requests',
    usage: '.joinrequests — list pending\n.approvejoin <number|all>\n.rejectjoin <number|all>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const rawText = (context.rawText || '').toLowerCase();

        const isApprove = rawText.startsWith('.approvejoin');
        const isReject = rawText.startsWith('.rejectjoin');

        if (!isApprove && !isReject) {
            try {
                const requests = await sock.groupRequestParticipantsList(chatId);
                if (!requests || requests.length === 0) {
                    return await sock.sendMessage(chatId, {
                        text: `📋 *Join Requests*\n\n_No pending join requests._`,
                        ...channelInfo
                    }, { quoted: message });
                }

                const list = requests.map((r, i) =>
                    `${i + 1}. +${r.jid.split('@')[0]}`
                ).join('\n');

                return await sock.sendMessage(chatId, {
                    text: `╔═══════════════════════╗\n` +
                          `║   📋 *JOIN REQUESTS*    ║\n` +
                          `╚═══════════════════════╝\n\n` +
                          `${list}\n\n` +
                          `──────────────────────────\n` +
                          `*Total:* ${requests.length} pending\n\n` +
                          `• \`.approvejoin all\` — approve all\n` +
                          `• \`.rejectjoin all\` — reject all\n` +
                          `• \`.approvejoin \` — approve one`,
                    ...channelInfo
                }, { quoted: message });
            } catch (e) {
                return await sock.sendMessage(chatId, {
                    text: `❌ Failed to fetch requests: ${e.message}`,
                    ...channelInfo
                }, { quoted: message });
            }
        }

        const action = isApprove ? 'approve' : 'reject';
        const input = args[0]?.toLowerCase();

        try {
            let targets = [];

            if (input === 'all') {
                const requests = await sock.groupRequestParticipantsList(chatId);
                if (!requests || requests.length === 0) {
                    return await sock.sendMessage(chatId, {
                        text: `⚠️ No pending join requests.`,
                        ...channelInfo
                    }, { quoted: message });
                }
                targets = requests.map(r => r.jid);
            } else if (input) {
                const num = input.replace(/[^0-9]/g, '');
                targets = [`${num}@s.whatsapp.net`];
            } else {
                return await sock.sendMessage(chatId, {
                    text: `❌ Provide a number or \`all\`.\n\nExample: \`.${isApprove ? 'approvejoin' : 'rejectjoin'} all\``,
                    ...channelInfo
                }, { quoted: message });
            }

            await sock.groupRequestParticipantsUpdate(chatId, targets, action);
            const icon = isApprove ? '✅' : '❌';
            const verb = isApprove ? 'Approved' : 'Rejected';

            await sock.sendMessage(chatId, {
                text: `${icon} *${verb}* ${targets.length === 1 ? `+${targets[0].split('@')[0]}` : `${targets.length} request(s)`}`,
                ...channelInfo
            }, { quoted: message });

        } catch (e) {
            console.error('[JOINREQUESTS] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to ${action}: ${e.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading joinrequests.js:', e.message); }

/* ===== approve.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // Aliases for .approve and .reject — delegate to requests plugin
const reqPlugin = require('./deline-requests');
module.exports = [
  {
    command: 'approve',
    aliases: ['acceptreq'],
    category: 'group',
    description: 'Approve group join request(s)',
    usage: '.approve all / .approve <number>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context = {}) {
      context.rawText = '.approve ' + args.join(' ');
      return reqPlugin.handler(sock, message, args, context);
    }
  },
  {
    command: 'reject',
    aliases: ['denyreq'],
    category: 'group',
    description: 'Reject group join request(s)',
    usage: '.reject all / .reject <number>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context = {}) {
      context.rawText = '.reject ' + args.join(' ');
      return reqPlugin.handler(sock, message, args, context);
    }
  }
];

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading approve.js:', e.message); }

/* ===== invitelink.js ===== */
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
    command: 'invitelink',
    aliases: ['invite', 'grouplink', 'gclink', 'revokeinvite', 'resetlink'],
    category: 'group',
    description: 'Get or revoke the group invite link',
    usage: '.invitelink — get link\n.revokeinvite — reset link',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const rawText = (context.rawText || '').toLowerCase();
        const isBotAdmin = context.isBotAdmin || false;

        const isRevoke = rawText.startsWith('.revokeinvite') || rawText.startsWith('.resetlink') || args[0]?.toLowerCase() === 'revoke';

        if (isRevoke && !isBotAdmin) {
            return await sock.sendMessage(chatId, {
                text: `❌ Bot needs to be an admin to revoke the invite link.`,
                ...channelInfo
            }, { quoted: message });
        }

        try {
            if (isRevoke) {
                const newCode = await sock.groupRevokeInvite(chatId);
                return await sock.sendMessage(chatId, {
                    text: `🔄 *Invite link reset!*\n\n*New Link:*\nhttps://chat.whatsapp.com/${newCode}`,
                    ...channelInfo
                }, { quoted: message });
            } else {
                const code = await sock.groupInviteCode(chatId);
                return await sock.sendMessage(chatId, {
                    text: `🔗 *Group Invite Link*\n\nhttps://chat.whatsapp.com/${code}\n\n_Use \`.revokeinvite\` to reset this link._`,
                    ...channelInfo
                }, { quoted: message });
            }
        } catch (e) {
            console.error('[INVITELINK] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `❌ Failed: ${e.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading invitelink.js:', e.message); }

/* ===== resetlink.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'resetlink',
  aliases: ['revoke', 'newlink'],
  category: 'admin',
  description: 'Reset group invite link',
  usage: '.resetlink',
  groupOnly: true,
  adminOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const newCode = await sock.groupRevokeInvite(chatId);
      
      await sock.sendMessage(chatId, { 
        text: `✅ Group link has been successfully reset\n\n🔗 New link:\nhttps://chat.whatsapp.com/${newCode}`,
        ...channelInfo
      }, { quoted: message });

    } catch (error) {
      console.error('Error in resetlink command:', error);
      await sock.sendMessage(chatId, { 
        text: 'Failed to reset group link!',
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading resetlink.js:', e.message); }

/* ===== joingroup.js ===== */
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
    command: 'joingroup',
    aliases: ['join', 'gcjoin', 'groupinfo'],
    category: 'owner',
    description: 'Join a group via invite link or get group info from link',
    usage: '.joingroup <link or code>\n.groupinfo <link or code>',
    ownerOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const rawText = (context.rawText || '').toLowerCase();
        const isInfo = rawText.startsWith('.groupinfo');

        const input = args[0];
        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `*${isInfo ? '🔍 GROUP INFO' : '🚪 JOIN GROUP'}*\n\n` +
                      `*Usage:*\n` +
                      `• \`.joingroup https://chat.whatsapp.com/XXXX\`\n` +
                      `• \`.joingroup XXXX\` (code only)\n` +
                      `• \`.groupinfo https://chat.whatsapp.com/XXXX\` — get info without joining`,
                ...channelInfo
            }, { quoted: message });
        }

        const code = input.replace('https://chat.whatsapp.com/', '').trim();

        try {
            if (isInfo) {
                const info = await sock.groupGetInviteInfo(code);
                const members = info.participants?.length || 0;
                return await sock.sendMessage(chatId, {
                    text: `╔═══════════════════════╗\n` +
                          `║    🔍 *GROUP INFO*       ║\n` +
                          `╚═══════════════════════╝\n\n` +
                          `*Name:* ${info.subject || 'Unknown'}\n` +
                          `*Description:* ${info.desc || 'None'}\n` +
                          `*Members:* ${members}\n` +
                          `*Created:* ${info.creation ? new Date(info.creation * 1000).toLocaleDateString() : 'Unknown'}\n` +
                          `*JID:* \`${info.id}\``,
                    ...channelInfo
                }, { quoted: message });
            } else {
                const response = await sock.groupAcceptInvite(code);
                return await sock.sendMessage(chatId, {
                    text: `✅ *Joined group successfully!*\n\nJID: \`${response}\``,
                    ...channelInfo
                }, { quoted: message });
            }
        } catch (e) {
            console.error('[JOINGROUP] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `❌ Failed: ${e.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading joingroup.js:', e.message); }

/* ===== groupdata.js ===== */
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
    command: 'gcmtdata',
    aliases: ['gcinfo', 'groupinfo', 'gcmetadata', 'groupdata'],
    category: 'group',
    description: 'Get detailed info about the current group',
    usage: '.gcinfo',
    groupOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        try {
            const meta = await sock.groupMetadata(chatId);

            const admins = meta.participants.filter(p => p.admin).map(p =>
                `  • @${p.id.split('@')[0]}`
            ).join('\n');

            const created = meta.creation
                ? new Date(meta.creation * 1000).toLocaleDateString()
                : 'Unknown';

            const memberCount = meta.participants.length;
            const adminCount = meta.participants.filter(p => p.admin).length;

            await sock.sendMessage(chatId, {
                text: `╔═══════════════════════╗\n` +
                      `║    📊 *GROUP INFO*       ║\n` +
                      `╚═══════════════════════╝\n\n` +
                      `*📛 Name:* ${meta.subject}\n` +
                      `*📝 Description:*\n${meta.desc || '_No description_'}\n\n` +
                      `*👥 Members:* ${memberCount}\n` +
                      `*👑 Admins:* ${adminCount}\n` +
                      `*📅 Created:* ${created}\n` +
                      `*🆔 JID:* \`${meta.id}\`\n\n` +
                      `*👑 Admin List:*\n${admins || '_None_'}`,
                mentions: meta.participants.filter(p => p.admin).map(p => p.id),
                ...channelInfo
            }, { quoted: message });

        } catch (e) {
            console.error('[GROUPMETADATA] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to fetch group info: ${e.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading groupdata.js:', e.message); }

/* ===== groupinfo.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'groupinfo',
  aliases: ['ginfo', 'gcinfo', 'infogroup'],
  category: 'group',
  description: 'Display detailed group information',
  usage: '.groupinfo',
  groupOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const groupMetadata = await sock.groupMetadata(chatId);
      
      let pp;
      try {
        pp = await sock.profilePictureUrl(chatId, 'image');
      } catch {
        pp = 'https://i.imgur.com/2wzGhpF.jpeg';
      }
      
      const participants = groupMetadata.participants;
      const groupAdmins = participants.filter(p => p.admin);
      const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
      
      const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';
      
      const text = `
┌──「 *INFO GROUP* 」
▢ *♻️ID:*
   • ${groupMetadata.id}
▢ *🔖NAME* : 
• ${groupMetadata.subject}
▢ *👥Members* :
• ${participants.length}
▢ *🤿Group Owner:*
• @${owner.split('@')[0]}
▢ *🕵🏻‍♂️Admins:*
${listAdmin}

▢ *📌Description* :
   • ${groupMetadata.desc?.toString() || 'No description'}
`.trim();

      await sock.sendMessage(chatId, {
        image: { url: pp },
        caption: text,
        mentions: [...groupAdmins.map(v => v.id), owner],
        ...channelInfo
      });

    } catch (error) {
      console.error('Error in groupinfo command:', error);
      await sock.sendMessage(chatId, { 
        text: 'Failed to get group info!',
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading groupinfo.js:', e.message); }

/* ===== gcstatus.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                     Group Status – Mentions all members
 *                     Developed By JUNAID-MD↣³⁰²
 *****************************************************************************/

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    command: 'gcstatus',
    aliases: ['statusgc', 'groupstatus', 'swgc'],
    category: 'group',
    description: 'Post an announcement in the group (mentions all members)',
    usage: '.gcstatus <text>  or  reply to an image/video/audio with .gcstatus',
    // Only group owner can use it (you can change to isOwner if you want)
    ownerOnly: true,   // uses isOwner from context (bot owner only)
    // If you want to allow group admins, you'd need to check group metadata inside handler.

    async handler(sock, message, args, context) {
        const { chatId, isGroup, isOwner, senderId } = context;

        // Must be used in a group
        if (!isGroup) {
            return await sock.sendMessage(chatId, {
                text: '❌ This command can only be used in groups!'
            }, { quoted: message });
        }

        // Optional: also allow group admins, not just bot owner
        // if (!isOwner) { ... }  – keep as ownerOnly true for simplicity

        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const text = args.join(' ');

        // If no quoted media and no text, show usage
        if (!quotedMsg && !text) {
            return await sock.sendMessage(chatId, {
                text: `⚠️ *Group Status* – Announce to everyone\n\n` +
                      `Reply to an image/video/audio with:\n` +
                      `.gcstatus [caption]\n\n` +
                      `Or send text:\n` +
                      `.gcstatus Hello everyone!`,
                ...context.channelInfo
            }, { quoted: message });
        }

        try {
            // Show loading reaction
            await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

            // Get all group members for mention
            const groupMeta = await sock.groupMetadata(chatId);
            const participants = groupMeta.participants;
            const mentionedJid = participants.map(p => p.id);

            let messageContent = {};

            // Handle quoted media
            if (quotedMsg) {
                // Determine media type
                let mediaType = null;
                let mediaMsg = null;
                if (quotedMsg.imageMessage) {
                    mediaType = 'image';
                    mediaMsg = quotedMsg.imageMessage;
                } else if (quotedMsg.videoMessage) {
                    mediaType = 'video';
                    mediaMsg = quotedMsg.videoMessage;
                } else if (quotedMsg.audioMessage) {
                    mediaType = 'audio';
                    mediaMsg = quotedMsg.audioMessage;
                } else {
                    return await sock.sendMessage(chatId, {
                        text: '❌ Unsupported media type. Reply to an image, video, or audio file.'
                    }, { quoted: message });
                }

                // Download media
                const stream = await downloadContentFromMessage(mediaMsg, mediaType);
                const buffer = [];
                for await (const chunk of stream) buffer.push(chunk);
                const mediaBuffer = Buffer.concat(buffer);

                // Build the media object
                if (mediaType === 'image') {
                    messageContent = {
                        image: mediaBuffer,
                        caption: text || '',
                        contextInfo: {
                            isGroupStatus: true,
                            mentionedJid
                        }
                    };
                } else if (mediaType === 'video') {
                    messageContent = {
                        video: mediaBuffer,
                        caption: text || '',
                        contextInfo: {
                            isGroupStatus: true,
                            mentionedJid
                        }
                    };
                } else if (mediaType === 'audio') {
                    const isPTT = mediaMsg.ptt || false;
                    messageContent = {
                        audio: mediaBuffer,
                        mimetype: isPTT ? 'audio/ogg; codecs=opus' : 'audio/mpeg',
                        ptt: isPTT,
                        contextInfo: {
                            isGroupStatus: true,
                            mentionedJid
                        }
                    };
                }
            }
            // Text‑only message
            else {
                messageContent = {
                    text: text,
                    contextInfo: {
                        isGroupStatus: true,
                        mentionedJid
                    }
                };
            }

            // Send the status announcement
            await sock.sendMessage(chatId, messageContent, { quoted: message });

            // Success reaction
            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (error) {
            console.error('Group Status Error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to post group status: ${error.message}`
            }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading gcstatus.js:', e.message); }

/* ===== pinchat.js ===== */
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
    command: 'pinchat',
    aliases: ['pin', 'unpin', 'unpinchat'],
    category: 'owner',
    description: 'Pin or unpin the current chat',
    usage: '.pinchat pin | .pinchat unpin',
    ownerOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const rawText = (context.rawText || '').toLowerCase();

        const shouldPin = !rawText.startsWith('.unpin');

        try {
            await sock.chatModify({ pin: shouldPin }, chatId);
            await sock.sendMessage(chatId, {
                text: shouldPin ? `📌 *Chat pinned!*` : `📌 *Chat unpinned!*`,
                ...channelInfo
            }, { quoted: message });
        } catch (e) {
            console.error('[PINCHAT] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to ${shouldPin ? 'pin' : 'unpin'} chat: ${e.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading pinchat.js:', e.message); }

/* ===== manage.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const CommandHandler = require('../lib/commandHandler');
const settings = require("../settings");

module.exports = {
  command: 'manage',
  aliases: ['ctrl', 'control'],
  category: 'owner',
  description: 'Manage bot commands and aliases',
  usage: '.manage [toggle/alias] [command_name] [new_alias]',
  ownerOnly: 'true',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    const action = args[0]?.toLowerCase();
    const targetCmd = args[1]?.toLowerCase();

    try {
      if (action === 'toggle') {
        if (!CommandHandler.commands.has(targetCmd)) {
          return await sock.sendMessage(chatId, { text: `❌ Command *${targetCmd}* not found.` }, { quoted: message });
        }
        const state = CommandHandler.toggleCommand(targetCmd);
        return await sock.sendMessage(chatId, { text: `✅ Command *${targetCmd}* has been *${state}*.` }, { quoted: message });
      }

      if (action === 'alias') {
        const newAlias = args[2]?.toLowerCase();
        if (!targetCmd || !newAlias) {
          return await sock.sendMessage(chatId, { text: '❌ Usage: .manage alias [command] [new_alias]' }, { quoted: message });
        }
        
        if (!CommandHandler.commands.has(targetCmd)) {
          return await sock.sendMessage(chatId, { text: `❌ Source command *${targetCmd}* not found.` }, { quoted: message });
        }

        CommandHandler.aliases.set(newAlias, targetCmd);
        return await sock.sendMessage(chatId, { text: `✅ Added alias *${newAlias}* for command *${targetCmd}*.` }, { quoted: message });
      }

      const helpText = `🛠️ *COMMAND MANAGER*\n\n` +
                       `*⁠• Toggle:* .manage toggle [name]\n` +
                       `*• Alias:* .manage alias [name] [new_alias]\n` +
                       `*• Reload:* Run your reload command to reset changes.`;
      
      await sock.sendMessage(chatId, { text: helpText }, { quoted: message });

    } catch (error) {
      console.error('Error in manage plugin:', error);
      await sock.sendMessage(chatId, { text: '❌ Management action failed.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading manage.js:', e.message); }

/* ===== disappear.js ===== */
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

const isAdmin = require('../lib/isAdmin.js');

module.exports = {
    command: 'disappear',
    aliases: ['ephemeral', 'disappearing', 'vanish'],
    category: 'admin',
    description: 'Enable or disable disappearing messages in chat',
    usage: '.disappear off | .disappear 24h | .disappear 7d | .disappear 90d',

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const isGroup = chatId.endsWith('@g.us');
        const senderId = context.senderId || message.key.participant || message.key.remoteJid;
        const senderIsOwnerOrSudo = context.senderIsOwnerOrSudo || false;

        if (isGroup && !senderIsOwnerOrSudo) {
            const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
            if (!isSenderAdmin) {
                return await sock.sendMessage(chatId, {
                    text: '❌ Only group admins or bot owner can change disappearing messages.',
                    ...channelInfo
                }, { quoted: message });
            }
        }

        if (!isGroup && !senderIsOwnerOrSudo && !message.key.fromMe) {
            return await sock.sendMessage(chatId, {
                text: '❌ Only the bot owner can change disappearing messages in DMs.',
                ...channelInfo
            }, { quoted: message });
        }

        const input = args[0]?.toLowerCase();

        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `*⏳ DISAPPEARING MESSAGES*\n\n` +
                      `*Usage:*\n` +
                      `• \`.disappear off\` — Disable\n` +
                      `• \`.disappear 24h\` — 24 hours\n` +
                      `• \`.disappear 7d\` — 7 days (default)\n` +
                      `• \`.disappear 90d\` — 90 days`,
                ...channelInfo
            }, { quoted: message });
        }

        const durations = {
            'off': false,
            '0':   false,
            '24h': 86400,
            '1d':  86400,
            '7d':  604800,
            '1w':  604800,
            '90d': 7776000,
            '3m':  7776000,
        };

        if (!(input in durations)) {
            return await sock.sendMessage(chatId, {
                text: `❌ Invalid option: *${input}*\n\nChoose: \`off\`, \`24h\`, \`7d\`, \`90d\``,
                ...channelInfo
            }, { quoted: message });
        }

        const seconds = durations[input];

        try {
            await sock.sendMessage(chatId, {
                disappearingMessagesInChat: seconds === false ? false : seconds
            });

            const labels = {
                'off': '❌ Disappearing messages *disabled*',
                '0':   '❌ Disappearing messages *disabled*',
                '24h': '⏳ Disappearing messages set to *24 hours*',
                '1d':  '⏳ Disappearing messages set to *24 hours*',
                '7d':  '⏳ Disappearing messages set to *7 days*',
                '1w':  '⏳ Disappearing messages set to *7 days*',
                '90d': '⏳ Disappearing messages set to *90 days*',
                '3m':  '⏳ Disappearing messages set to *90 days*',
            };

            await sock.sendMessage(chatId, {
                text: labels[input],
                ...channelInfo
            }, { quoted: message });

        } catch (e) {
            console.error('[DISAPPEAR] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to change disappearing messages: ${e.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading disappear.js:', e.message); }

/* ===== mention.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /**
 * Mention Plugin – Per‑User Mention Replies (Enhanced UI)
 *
 * Each user can set their own mention reply (text or media).
 * Triggers:
 *   - 🤖 Mention (@, number, name) → mentionEnabled
 *   - 💬 Reply to your message → replyEnabled
 * Both triggers are OFF by default and can be toggled independently.
 */

const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const store = require('../lib/lightweight_store');

const CONFIG_KEY = 'mention_configs';
const MEDIA_DIR = path.join(process.cwd(), 'data', 'mention_media');
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

const DEFAULT_CONFIG = {
    mentionEnabled: false,
    replyEnabled: false,
    type: 'text',
    text: '⚠️ Don’t mention me, I’m busy.',
    mediaPath: null,
    mimetype: null,
    ptt: false,
    gifPlayback: false,
    displayName: null,
};

// ----------------------------------------------------------------------
// Config helpers (unchanged)
// ----------------------------------------------------------------------
async function getAllConfigs() {
    try {
        const cfg = await store.getSetting('global', CONFIG_KEY);
        return cfg || {};
    } catch {
        return {};
    }
}

async function getUserConfig(jid) {
    const all = await getAllConfigs();
    let cfg = all[jid];
    if (cfg && cfg.enabled !== undefined && cfg.mentionEnabled === undefined) {
        cfg.mentionEnabled = cfg.enabled;
        cfg.replyEnabled = cfg.enabled;
        delete cfg.enabled;
        await saveUserConfig(jid, cfg);
    }
    return cfg ? { ...DEFAULT_CONFIG, ...cfg } : { ...DEFAULT_CONFIG };
}

async function saveUserConfig(jid, config) {
    const all = await getAllConfigs();
    all[jid] = config;
    await store.saveSetting('global', CONFIG_KEY, all);
}

// ----------------------------------------------------------------------
// Download media from a quoted message (unchanged)
// ----------------------------------------------------------------------
async function downloadMediaFromReply(message, sock) {
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
}

// ----------------------------------------------------------------------
// Detection logic (unchanged)
// ----------------------------------------------------------------------
async function detectTriggers(message, userJid, userConfig) {
    const msg = message.message || {};
    if (!msg) return { mention: false, reply: false };

    const userNumber = userJid.split('@')[0].replace(/[^0-9]/g, '');
    const userNumberShort = userNumber.length > 10 ? userNumber.slice(-10) : userNumber;
    const displayName = (userConfig.displayName || '').toLowerCase();

    // ----- 1. Check for mentions (@, number, name) -----
    let mention = false;

    // 1a. mentionedJid arrays
    const allMentionedJids = [];
    const contexts = [
        msg.extendedTextMessage?.contextInfo,
        msg.imageMessage?.contextInfo,
        msg.videoMessage?.contextInfo,
        msg.documentMessage?.contextInfo,
        msg.stickerMessage?.contextInfo,
        msg.buttonsResponseMessage?.contextInfo,
        msg.listResponseMessage?.contextInfo,
        msg.templateButtonReplyMessage?.contextInfo
    ].filter(Boolean);
    for (const ctx of contexts) {
        if (ctx?.mentionedJid && Array.isArray(ctx.mentionedJid)) allMentionedJids.push(...ctx.mentionedJid);
    }
    if (msg.extendedTextMessage?.mentionedJid) allMentionedJids.push(...msg.extendedTextMessage.mentionedJid);
    if (msg.mentionedJid) allMentionedJids.push(...msg.mentionedJid);
    if (allMentionedJids.includes(userJid)) mention = true;

    // 1b. Check raw text for user number or name
    const rawText = msg.conversation ||
        msg.extendedTextMessage?.text ||
        msg.imageMessage?.caption ||
        msg.videoMessage?.caption ||
        msg.documentMessage?.caption ||
        msg.stickerMessage?.caption ||
        '';
    if (rawText) {
        const cleanNumbers = rawText.replace(/[^0-9]/g, '');
        if (cleanNumbers.includes(userNumber) || cleanNumbers.includes(userNumberShort)) mention = true;
        const regexNumber = new RegExp(`@?\\+?${userNumber}\\b`, 'i');
        if (regexNumber.test(rawText)) mention = true;
        const regexNumberShort = new RegExp(`@?\\+?${userNumberShort}\\b`, 'i');
        if (regexNumberShort.test(rawText)) mention = true;

        if (displayName) {
            const normalizedName = displayName.replace(/\s/g, '');
            if (rawText.toLowerCase().includes(normalizedName)) mention = true;
            const regexName = new RegExp(`@?${displayName.replace(/\s+/g, '\\s+')}`, 'i');
            if (regexName.test(rawText)) mention = true;
        }
    }

    // 1c. Special case for channels
    if (msg.newsletterMessage) {
        const inner = msg.newsletterMessage;
        const innerText = inner.conversation || inner.extendedTextMessage?.text || inner.imageMessage?.caption || '';
        if (innerText) {
            const clean = innerText.replace(/[^0-9]/g, '');
            if (clean.includes(userNumber) || clean.includes(userNumberShort)) mention = true;
            if (new RegExp(`@?\\+?${userNumber}\\b`, 'i').test(innerText)) mention = true;
            if (displayName && innerText.toLowerCase().includes(displayName.replace(/\s/g, ''))) mention = true;
        }
    }

    // ----- 2. Check if this message is a reply to a message from the user -----
    let reply = false;
    const contextInfo = msg.extendedTextMessage?.contextInfo ||
                       msg.imageMessage?.contextInfo ||
                       msg.videoMessage?.contextInfo ||
                       msg.stickerMessage?.contextInfo ||
                       msg.documentMessage?.contextInfo;
    if (contextInfo?.quotedMessage) {
        let quotedSender = contextInfo.participant;
        if (!quotedSender && contextInfo.quotedMessage?.key) {
            quotedSender = contextInfo.quotedMessage.key.participant || contextInfo.quotedMessage.key.remoteJid;
        }
        if (quotedSender === userJid) reply = true;
    }

    return { mention, reply };
}

// ----------------------------------------------------------------------
// Main detection handler – called for every message
// ----------------------------------------------------------------------
async function handleMention(sock, message) {
    try {
        if (message.key?.fromMe) return;
        const allConfigs = await getAllConfigs();
        for (const [userJid, config] of Object.entries(allConfigs)) {
            const triggers = await detectTriggers(message, userJid, config);
            let shouldReply = false;
            if (triggers.mention && config.mentionEnabled) shouldReply = true;
            if (triggers.reply && config.replyEnabled) shouldReply = true;
            if (!shouldReply) continue;

            const chatId = message.key.remoteJid;
            if (config.type === 'text') {
                await sock.sendMessage(chatId, { text: config.text }, { quoted: message });
                return;
            }

            if (!config.mediaPath || !fs.existsSync(config.mediaPath)) {
                await sock.sendMessage(chatId, { text: config.text }, { quoted: message });
                return;
            }

            const mediaBuffer = fs.readFileSync(config.mediaPath);
            let payload = {};
            switch (config.type) {
                case 'sticker': payload = { sticker: mediaBuffer }; break;
                case 'image': payload = { image: mediaBuffer }; break;
                case 'video':
                    payload = { video: mediaBuffer };
                    if (config.gifPlayback) payload.gifPlayback = true;
                    break;
                case 'audio':
                    payload = {
                        audio: mediaBuffer,
                        mimetype: config.mimetype || 'audio/mpeg',
                        ptt: config.ptt || false
                    };
                    break;
                default: continue;
            }
            await sock.sendMessage(chatId, payload, { quoted: message });
            return;
        }
    } catch (err) {
        console.error('[Mention] handleMention error:', err);
    }
}

// ----------------------------------------------------------------------
// Command handler with enhanced UI (clean guide)
// ----------------------------------------------------------------------
const shortGuide = (config) => {
    const status = config.mentionEnabled || config.replyEnabled ? '✅ ON' : '❌ OFF';
    return `*🤖 MENTION SETUP*\n\n` +
           `Current Status: ${status}\n` +
           `Storage: ${require('../lib/lightweight_store').HAS_DB ? 'Database' : 'File System'}\n\n` +
           `Commands:\n` +
           `• .mention on - Enable both triggers\n` +
           `• .mention off - Disable both triggers\n` +
           `• .mention status - View current settings\n` +
           `• .mention guide - Full help\n\n` +
           `Features:\n` +
           `• 🤖 Mention detection (@, number, name)\n` +
           `• 💬 Reply detection (replies to your messages)\n` +
           `• 📝 Text or 🎨 Media replies\n` +
           `• 🏷️ Custom display name detection`;
};

const fullGuide = `
*🤖 MENTION COMMANDS*

*BASIC*
• .mention on          – Enable both triggers
• .mention off         – Disable both triggers
• .mention status      – View current settings

*TRIGGER TOGGLES*
• .mention mention on|off – 🤖 Mentions only
• .mention reply on|off   – 💬 Replies only

*SETUP*
• .mention set text       – Set text reply (reply to a text)
• .mention set media      – Set media reply (sticker/image/video/audio)
• .mention setname "Name" – Set custom display name for mentions
• .mention reset          – Reset to default settings

*HELP*
• .mention guide          – Show this guide

*EXAMPLES*
• .mention mention on
• .mention set text (reply to a message)
• .mention status

_⚠️ Note: All commands require owner/sudo privileges._
`;

async function commandHandler(sock, message, args, context = {}) {
    try {
        const chatId = context.chatId || message.key?.remoteJid;
        const senderId = (context.senderId || message.key?.participant || message.key?.remoteJid || '').split(':')[0];
        const channelInfo = context.channelInfo || {};

        if (!chatId || !senderId) return;

        const reply = (text, mentions = []) =>
            sock.sendMessage(chatId, { text, mentions, ...channelInfo }, { quoted: message });

        if (args.length === 0) {
            const config = await getUserConfig(senderId);
            return reply(shortGuide(config));
        }

        const config = await getUserConfig(senderId);
        const sub = args[0].toLowerCase();

        // --- Guide command ---
        if (sub === 'guide' || sub === 'help') {
            return reply(fullGuide);
        }

        // --- On / Off (both) ---
        if (sub === 'on') {
            config.mentionEnabled = true;
            config.replyEnabled = true;
            await saveUserConfig(senderId, config);
            return reply(`✅ *Both triggers enabled*\n🤖 Mentions: ON\n💬 Replies: ON`);
        }

        if (sub === 'off') {
            config.mentionEnabled = false;
            config.replyEnabled = false;
            await saveUserConfig(senderId, config);
            return reply(`❌ *Both triggers disabled*\nNo automatic replies will be sent.`);
        }

        // --- Mention trigger toggle ---
        if (sub === 'mention') {
            if (args.length < 2) return reply('❌ *Usage:* `.mention mention on|off`');
            const action = args[1].toLowerCase();
            if (action === 'on') {
                config.mentionEnabled = true;
                await saveUserConfig(senderId, config);
                return reply(`✅ *🤖 Mention trigger enabled*\nNow the bot will reply when someone mentions you (by @, number, or name).`);
            } else if (action === 'off') {
                config.mentionEnabled = false;
                await saveUserConfig(senderId, config);
                return reply(`❌ *🤖 Mention trigger disabled*\nMentions will no longer trigger a reply.`);
            } else {
                return reply('❌ *Invalid action.* Use `on` or `off`.');
            }
        }

        // --- Reply trigger toggle ---
        if (sub === 'reply') {
            if (args.length < 2) return reply('❌ *Usage:* `.mention reply on|off`');
            const action = args[1].toLowerCase();
            if (action === 'on') {
                config.replyEnabled = true;
                await saveUserConfig(senderId, config);
                return reply(`✅ *💬 Reply trigger enabled*\nNow the bot will reply when someone replies to your messages.`);
            } else if (action === 'off') {
                config.replyEnabled = false;
                await saveUserConfig(senderId, config);
                return reply(`❌ *💬 Reply trigger disabled*\nReplies to your messages will no longer trigger a reply.`);
            } else {
                return reply('❌ *Invalid action.* Use `on` or `off`.');
            }
        }

        // --- Status ---
        if (sub === 'status') {
            let info = `*📊 MENTION STATUS*\n\n`;
            info += `🤖 *Mention trigger:* ${config.mentionEnabled ? '✅ ON' : '❌ OFF'}\n`;
            info += `💬 *Reply trigger:*   ${config.replyEnabled ? '✅ ON' : '❌ OFF'}\n`;
            info += `📦 *Reply type:* ${config.type === 'text' ? '📝 Text' : '🎨 Media'}\n`;
            if (config.type === 'text') {
                info += `📄 *Text:*\n   ${config.text}\n`;
            } else {
                info += `🖼️ *Media:* ${config.mediaPath ? '✅ Set' : '❌ Not set'}\n`;
            }
            if (config.displayName) {
                info += `🏷️ *Display name:* ${config.displayName}\n`;
            }
            return reply(info);
        }

        // --- Reset ---
        if (sub === 'reset') {
            config.mentionEnabled = false;
            config.replyEnabled = false;
            config.type = 'text';
            config.text = DEFAULT_CONFIG.text;
            config.mediaPath = null;
            config.mimetype = null;
            config.ptt = false;
            config.gifPlayback = false;
            config.displayName = null;
            await saveUserConfig(senderId, config);
            return reply(`🔄 *Reset to default*\nBoth triggers are now OFF.\nDefault text: "${config.text}"`);
        }

        // --- Set Display Name ---
        if (sub === 'setname') {
            if (args.length < 2) return reply('❌ *Usage:* `.mention setname "Your Name"`');
            const name = args.slice(1).join(' ').trim();
            if (!name) return reply('❌ *Name cannot be empty.*');
            config.displayName = name;
            await saveUserConfig(senderId, config);
            return reply(`✅ *Display name set*\nNow mentions of *"${name}"* will trigger your reply.`);
        }

        // --- Set text / media ---
        if (sub === 'set') {
            if (args.length < 2) return reply('❌ *Usage:* `.mention set text` or `.mention set media`');
            const setType = args[1].toLowerCase();
            if (setType === 'text') {
                const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                let text = '';
                if (quotedMsg?.conversation) text = quotedMsg.conversation;
                else if (quotedMsg?.extendedTextMessage?.text) text = quotedMsg.extendedTextMessage.text;
                else return reply('❌ *Please reply to a text message.*');
                if (!text.trim()) return reply('❌ *Empty text.*');
                config.type = 'text';
                config.text = text.trim();
                config.mediaPath = null;
                await saveUserConfig(senderId, config);
                return reply(`✅ *Text reply set*\n📝 *Text:* ${config.text}`);
            } else if (setType === 'media') {
                try {
                    const media = await downloadMediaFromReply(message, sock);
                    const ext = media.mediaType === 'sticker' ? 'webp' :
                                media.mediaType === 'image' ? 'jpg' :
                                media.mediaType === 'video' ? 'mp4' :
                                media.mediaType === 'audio' ? (media.mimetype.includes('ogg') ? 'ogg' : 'mp3') : 'bin';
                    const fileName = `mention_${senderId}_${Date.now()}.${ext}`;
                    const filePath = path.join(MEDIA_DIR, fileName);
                    fs.writeFileSync(filePath, media.buffer);
                    config.type = media.mediaType;
                    config.mediaPath = filePath;
                    config.mimetype = media.mimetype;
                    config.ptt = media.ptt;
                    config.gifPlayback = media.gifPlayback;
                    config.text = DEFAULT_CONFIG.text;
                    await saveUserConfig(senderId, config);
                    return reply(`✅ *Media reply set*\n🎨 Type: ${media.mediaType}\n📦 Size: ${(media.buffer.length / 1024).toFixed(2)} KB`);
                } catch (err) {
                    return reply(`❌ *Error:* ${err.message}`);
                }
            } else {
                return reply('❌ *Usage:* `.mention set text` or `.mention set media`');
            }
        }

        // Unknown command – show short guide
        return reply(shortGuide(config));
    } catch (err) {
        console.error('[Mention] commandHandler error:', err);
        const chatId = context.chatId || message.key?.remoteJid;
        if (chatId) {
            await sock.sendMessage(chatId, { text: '❌ *An error occurred while processing your command.*' }, { quoted: message });
        }
    }
}

// ----------------------------------------------------------------------
// Export
// ----------------------------------------------------------------------
module.exports = {
    command: 'mention',
    aliases: ['setmention'],
    category: 'owner',
    description: 'Configure your own mention reply with separate toggles for mentions and replies',
    ownerOnly: true,
    handler: commandHandler,
    handleMention
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading mention.js:', e.message); }

/* ===== clear.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    module.exports = {
  command: 'clear',
  aliases: ['clr', 'clean'],
  category: 'owner',
  description: 'Clear bot messages from chat',
  usage: '.clear',
  ownerOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const sent = await sock.sendMessage(chatId, { 
        text: 'Clearing bot messages...',
        ...channelInfo
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sock.sendMessage(chatId, { delete: sent.key });
      
    } catch (error) {
      console.error('Error clearing messages:', error);
      await sock.sendMessage(chatId, { 
        text: 'An error occurred while clearing messages.',
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading clear.js:', e.message); }

/* ===== clearsession.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const channelInfo = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363408055942569@newsletter',
      newsletterName: 'JUNAID-MD↣³⁰²',
      serverMessageId: -1
    }
  }
};

module.exports = {
  command: 'clearsession',
  aliases: ['clearses', 'csession'],
  category: 'owner',
  description: 'Clear session files',
  usage: '.clearsession',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const senderId = message.key.participant || message.key.remoteJid;
      const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

      if (!message.key.fromMe && !isOwner) {
        return await sock.sendMessage(chatId, { text: '*This command can only be used by the owner!*', ...channelInfo });
      }

      const sessionDir = path.join(__dirname, '../session');
      if (!fs.existsSync(sessionDir)) {
        return await sock.sendMessage(chatId, { text: '*Session directory not found!*', ...channelInfo });
      }

      let filesCleared = 0;
      let errors = 0;
      let errorDetails = [];

      await sock.sendMessage(chatId, { text: '🔍 Optimizing session files for better performance...', ...channelInfo });

      const files = fs.readdirSync(sessionDir);
      let appStateSyncCount = 0;
      let preKeyCount = 0;

      for (const file of files) {
        if (file.startsWith('app-state-sync-')) appStateSyncCount++;
        if (file.startsWith('pre-key-')) preKeyCount++;
      }

      for (const file of files) {
        if (file === 'creds.json') continue;
        try {
          fs.unlinkSync(path.join(sessionDir, file));
          filesCleared++;
        } catch (err) {
          errors++;
          errorDetails.push(`Failed to delete ${file}: ${err.message}`);
        }
      }

      const msgText = `✅ Session files cleared successfully!\n\n` +
                      `📊 Statistics:\n` +
                      `• Total files cleared: ${filesCleared}\n` +
                      `• App state sync files: ${appStateSyncCount}\n` +
                      `• Pre-key files: ${preKeyCount}\n` +
                      (errors > 0 ? `\n⚠️ Errors encountered: ${errors}\n${errorDetails.join('\n')}` : '');

      await sock.sendMessage(chatId, { text: msgText, ...channelInfo });

    } catch {
      await sock.sendMessage(chatId, { text: '❌ Failed to clear session files!', ...channelInfo });
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading clearsession.js:', e.message); }

/* ===== cleartmp.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

function clearDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      return { success: false, message: `Directory not found: ${path.basename(dirPath)}` };
    }

    const files = fs.readdirSync(dirPath);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.lstatSync(filePath);

      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
      deletedCount++;
    }

    return {
      success: true,
      message: `Cleared ${deletedCount} items in ${path.basename(dirPath)}`,
      count: deletedCount
    };
  } catch (err) {
    console.error('clearDirectory error:', err);
    return {
      success: false,
      message: `Failed clearing ${path.basename(dirPath)}`
    };
  }
}

async function clearTmpDirectory() {
  const tmpDir = path.join(process.cwd(), 'tmp');
  const tempDir = path.join(process.cwd(), 'temp');

  const results = [
    clearDirectory(tmpDir),
    clearDirectory(tempDir)
  ];

  const success = results.every(r => r.success);
  const totalDeleted = results.reduce((a, b) => a + (b.count || 0), 0);
  const message = results.map(r => r.message).join(' | ');

  return { success, message, totalDeleted };
}

module.exports = {
  command: 'cleartmp',
  aliases: ['cleartemp', 'tmpclear'],
  category: 'owner',
  description: 'Clear tmp and temp directories',
  usage: '.cleartmp',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderId = message.key.participant || message.key.remoteJid;

    try {
      const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

      if (!message.key.fromMe && !isOwner) {
        await sock.sendMessage(chatId, {
          text: '*This command is only for the owner!*'
        }, { quoted: message });
        return;
      }

      const result = await clearTmpDirectory();

      const text = result.success
        ? `✅ *Temporary Files Cleared!*\n\n${result.message}`
        : `❌ *Clear Failed!*\n\n${result.message}`;

      await sock.sendMessage(chatId, {
        text
      }, { quoted: message });

    } catch (error) {
      console.error('Error in cleartmp command:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to clear temporary files!'
      }, { quoted: message });
    }
  }
};

function startAutoClear() {
  clearTmpDirectory();
  setInterval(clearTmpDirectory, 1 * 60 * 60 * 1000);
}

startAutoClear();

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading cleartmp.js:', e.message); }

/* ===== character.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { channelInfo } = require('../lib/messageConfig');

module.exports = {
  command: 'character',
  aliases: ['personality', 'traits'],
  category: 'group',
  description: 'Analyze someone\'s character traits',
  usage: '.character @user',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let userToAnalyze;

    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      userToAnalyze = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
      userToAnalyze = message.message.extendedTextMessage.contextInfo.participant;
    }

    if (!userToAnalyze) {
      return await sock.sendMessage(chatId, { 
        text: '❌ Please mention someone or reply to their message to analyze their character!', 
        ...channelInfo 
      }, { quoted: message });
    }

    try {
      let profilePic;
      try {
        profilePic = await sock.profilePictureUrl(userToAnalyze, 'image');
      } catch {
        profilePic = 'https://i.imgur.com/2wzGhpF.jpeg';
      }

      const traits = [
        "Intelligent","Creative","Determined","Ambitious","Caring",
        "Charismatic","Confident","Empathetic","Energetic","Friendly",
        "Generous","Honest","Humorous","Imaginative","Independent",
        "Intuitive","Kind","Logical","Loyal","Optimistic",
        "Passionate","Patient","Persistent","Reliable","Resourceful",
        "Sincere","Thoughtful","Understanding","Versatile","Wise"
      ];

      const numTraits = Math.floor(Math.random() * 3) + 3;
      const selectedTraits = [];
      while (selectedTraits.length < numTraits) {
        const randomTrait = traits[Math.floor(Math.random() * traits.length)];
        if (!selectedTraits.includes(randomTrait)) selectedTraits.push(randomTrait);
      }

      const traitPercentages = selectedTraits.map(trait => `${trait}: ${Math.floor(Math.random() * 41) + 60}%`);
      const analysis = `🔮 *Character Analysis* 🔮\n\n` +
        `👤 *User:* ${userToAnalyze.split('@')[0]}\n\n` +
        `✨ *Key Traits:*\n${traitPercentages.join('\n')}\n\n` +
        `🎯 *Overall Rating:* ${Math.floor(Math.random() * 21) + 80}%\n\n` +
        `Note: This is a fun analysis and should not be taken seriously!`;

      await sock.sendMessage(chatId, {
        image: { url: profilePic },
        caption: analysis,
        mentions: [userToAnalyze],
        ...channelInfo
      }, { quoted: message });

    } catch {
      await sock.sendMessage(chatId, { 
        text: '❌ Failed to analyze character! Try again later.',
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading character.js:', e.message); }

/* ===== delete.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const store = require('../lib/lightweight_store');

module.exports = {
    command: 'delete',
    aliases: ['del', 'remove'],
    category: 'admin',
    description: 'Delete recent messages from group or specific user',
    usage: '.delete <count> [@user] or reply with .delete',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = context.senderId || message.key.participant || message.key.remoteJid;
        const isBotAdmin = context.isBotAdmin;

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ *I need to be an admin to delete messages*' 
            }, { quoted: message });
            return;
        }

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const parts = text.trim().split(/\s+/);
        let countArg = null;
        
        if (parts.length > 1) {
            const maybeNum = parseInt(parts[1], 10);
            if (!isNaN(maybeNum) && maybeNum > 0) {
                countArg = Math.min(maybeNum, 50);
            }
        }
        
        const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
        const repliedParticipant = ctxInfo.participant || null;
        const mentioned = Array.isArray(ctxInfo.mentionedJid) && ctxInfo.mentionedJid.length > 0 ? ctxInfo.mentionedJid[0] : null;
        
        if (countArg === null && repliedParticipant) {
            countArg = 1;
        }
        else if (countArg === null && !repliedParticipant && !mentioned) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Please specify the number of messages to delete*\n\n' +
                      '*Usage:*\n' +
                      '• `.del 5` - Delete last 5 messages from group\n' +
                      '• `.del 3 @user` - Delete last 3 messages from @user\n' +
                      '• `.del 2` (reply to message) - Delete last 2 messages from replied user'
            }, { quoted: message });
            return;
        }
        else if (countArg === null && mentioned) {
            countArg = 1;
        }
        let targetUser = null;
        let repliedMsgId = null;
        let deleteGroupMessages = false;
        
        if (repliedParticipant && ctxInfo.stanzaId) {
            targetUser = repliedParticipant;
            repliedMsgId = ctxInfo.stanzaId;
        } else if (mentioned) {
            targetUser = mentioned;
        } else {
            deleteGroupMessages = true;
        }
        const chatMessages = Array.isArray(store.messages[chatId]) ? store.messages[chatId] : [];
        const toDelete = [];
        const seenIds = new Set();

        if (deleteGroupMessages) {
            for (let i = chatMessages.length - 1; i >= 0 && toDelete.length < countArg; i--) {
                const m = chatMessages[i];
                if (!seenIds.has(m.key.id)) {
                    if (!m.message?.protocolMessage && 
                        !m.key.fromMe && 
                        m.key.id !== message.key.id) {
                        toDelete.push(m);
                        seenIds.add(m.key.id);
                    }
                }
            }
        } else {
            if (repliedMsgId) {
                const repliedInStore = chatMessages.find(m => m.key.id === repliedMsgId && (m.key.participant || m.key.remoteJid) === targetUser);
                if (repliedInStore) {
                    toDelete.push(repliedInStore);
                    seenIds.add(repliedInStore.key.id);
                } else {
                    try {
                        await sock.sendMessage(chatId, {
                            delete: {
                                remoteJid: chatId,
                                fromMe: false,
                                id: repliedMsgId,
                                participant: repliedParticipant
                            }
                        });
                        countArg = Math.max(0, countArg - 1);
                    } catch (e) {}
                }
            }
            for (let i = chatMessages.length - 1; i >= 0 && toDelete.length < countArg; i--) {
                const m = chatMessages[i];
                const participant = m.key.participant || m.key.remoteJid;
                if (participant === targetUser && !seenIds.has(m.key.id)) {
                    if (!m.message?.protocolMessage) {
                        toDelete.push(m);
                        seenIds.add(m.key.id);
                    }
                }
            }
        }

        if (toDelete.length === 0) {
            const errorMsg = deleteGroupMessages 
                ? '❌ *No recent messages found in the group to delete*' 
                : '❌ *No recent messages found for the target user*';
            await sock.sendMessage(chatId, { text: errorMsg }, { quoted: message });
            return;
        }
        for (const m of toDelete) {
            try {
                const msgParticipant = deleteGroupMessages 
                    ? (m.key.participant || m.key.remoteJid) 
                    : (m.key.participant || targetUser);
                await sock.sendMessage(chatId, {
                    delete: {
                        remoteJid: chatId,
                        fromMe: false,
                        id: m.key.id,
                        participant: msgParticipant
                    }
                });
                await new Promise(r => setTimeout(r, 300));
            } catch (e) {
                console.error('Error deleting message:', e);
            }
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
} catch(e) { console.warn('[BUNDLE:cat-06-admin] Error loading delete.js:', e.message); }

module.exports = _bundle;