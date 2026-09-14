/**
 * JUNAID-MD↣³⁰² — Group Events (Welcome / Goodbye / Admin Audit)
 * Shows who performed admin promotions/demotions.
 */

'use strict';

const { loadUserGroupData, isWelcomeOn, isGoodByeOn } = require('./index');
let getWelcomeMsg = null;
let getGoodbyeMsg = null;
try {
  const idx = require('./index');
  getWelcomeMsg = idx.getWelcome || idx.getWelcomeMessage || null;
  getGoodbyeMsg = idx.getGoodBye || idx.getGoodbye || idx.getGoodbyeMessage || null;
} catch {}

module.exports = async function GroupEvents(conn, update, config = {}) {
  try {
    const {
      botName       = '🔥 JUNAID-MD↣³⁰² 🔥',
      ownerName     = 'JUNAID-MD↣³⁰²',
      menuImage     = 'https://i.ibb.co/n8kzCwBx/jawadmd.jpg',
      newsletterJid = '120363408055942569@newsletter',
    } = config;

    const { id, participants, action, author } = update || {};
    if (!id || !Array.isArray(participants) || !action) return;

    // Check if welcome/goodbye is enabled for this group.
    let welcomeEnabled = false;
    let goodbyeEnabled = false;
    try {
      welcomeEnabled = await isWelcomeOn(id);
      goodbyeEnabled = await isGoodByeOn(id);
    } catch {
      welcomeEnabled = false;
      goodbyeEnabled = false;
    }

    const needsWelcome = (action === 'add' || action === 'invite') && welcomeEnabled;
    const needsGoodbye = (action === 'remove' || action === 'leave') && goodbyeEnabled;
    const needsPromote = action === 'promote';
    const needsDemote  = action === 'demote';

    if (!needsWelcome && !needsGoodbye && !needsPromote && !needsDemote) return;

    let groupName = id;
    let groupSize = 0;
    try {
      const meta = await conn.groupMetadata(id);
      groupName = meta.subject || id;
      groupSize = Array.isArray(meta.participants) ? meta.participants.length : 0;
    } catch {}

    const ctxInfo = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid,
        newsletterName: 'JUNAID-MD↣³⁰²',
        serverMessageId: 200,
      },
    };

    // Baileys group-participants.update normally provides `author` as
    // the JID of the admin who performed the change.
    const normalizeJid = (value) => {
      if (!value) return null;
      if (typeof value === 'string') return value;
      if (typeof value === 'object') return value.id || value.jid || null;
      return String(value);
    };

    const authorJid = normalizeJid(author);
    const actorNumber = authorJid ? authorJid.split('@')[0].split(':')[0] : null;
    const actorMention = authorJid ? `@${actorNumber}` : 'WhatsApp/System';
    const actorMentions = authorJid ? [authorJid] : [];

    for (const rawJid of participants) {
      const jid = normalizeJid(rawJid);
      if (!jid) {
        console.error(`[GroupEvents] Skipping ${action}: unresolved participant`, rawJid);
        continue;
      }

      try {
        const num = jid.split('@')[0].split(':')[0];

        if (needsWelcome) {
          let caption =
`╔══════════════════════════╗
║  👋 *WELCOME TO THE GROUP* ║
╚══════════════════════════╝

Welcome @${num}! 🎉

📌 *Group:* ${groupName}
👥 *Members:* ${groupSize}

📖 *Group Rules:*
• Be respectful to everyone
• No spam or flooding
• No bad words or NSFW content
• Follow admin instructions

💡 Type *${process.env.PREFIX || '.'}menu* to see bot commands.

> 🔥 Powered by ${botName}
> By ${ownerName}`;
          try {
            if (typeof getWelcomeMsg === 'function') {
              const custom = await getWelcomeMsg(id);
              if (custom && typeof custom === 'string' && custom.trim()) {
                caption = custom
                  .replace(/\{user\}/gi, `@${num}`)
                  .replace(/\{group\}/gi, groupName)
                  .replace(/\{description\}/gi, '')
                  .replace(/\{botname\}/gi, botName)
                  .replace(/\{count\}/gi, String(groupSize))
                  .replace(/\{time\}/gi, new Date().toLocaleString());
              } else if (custom && custom.message) {
                caption = String(custom.message)
                  .replace(/\{user\}/gi, `@${num}`)
                  .replace(/\{group\}/gi, groupName)
                  .replace(/\{description\}/gi, '')
                  .replace(/\{botname\}/gi, botName)
                  .replace(/\{count\}/gi, String(groupSize))
                  .replace(/\{time\}/gi, new Date().toLocaleString());
              }
            }
          } catch (e) {
            console.warn('[GroupEvents] custom welcome msg failed:', e.message);
          }
          try {
            await conn.sendMessage(id, {
              image: { url: menuImage },
              caption,
              mentions: [jid],
              contextInfo: ctxInfo,
            });
          } catch (imgErr) {
            console.warn('[GroupEvents] welcome image failed, text only:', imgErr.message);
            await conn.sendMessage(id, {
              text: caption,
              mentions: [jid],
              contextInfo: ctxInfo,
            });
          }

        } else if (needsGoodbye) {
          await conn.sendMessage(id, {
            text:
`╔══════════════════════════╗
║  😢 *GOODBYE!*             ║
╚══════════════════════════╝

@${num} has left the group.

📌 *Group:* ${groupName}
👥 *Members now:* ${Math.max(0, groupSize - 1)}

We will miss you! Come back anytime. 🙏

> 🔥 Powered by ${botName}`,
            mentions: [jid],
            contextInfo: ctxInfo,
          });

        } else if (needsPromote) {
          await conn.sendMessage(id, {
            text:
`🎊 *ADMIN PROMOTED!*

👤 *Admin:* @${num}
👑 *Promoted By:* ${actorMention}

${actorMention === 'WhatsApp/System'
  ? '⚠️ The actor was not included in WhatsApp event data.'
  : '✅ The person who gave admin is shown above.'}

> 🔥 ${botName}`,
            mentions: [jid, ...actorMentions],
            contextInfo: ctxInfo,
          });

        } else if (needsDemote) {
          await conn.sendMessage(id, {
            text:
`📢 *ADMIN DEMOTED!*

👤 *Removed Admin:* @${num}
👑 *Demoted By:* ${actorMention}

${actorMention === 'WhatsApp/System'
  ? '⚠️ The actor was not included in WhatsApp event data.'
  : '✅ The person who removed admin is shown above.'}

> 🔥 ${botName}`,
            mentions: [jid, ...actorMentions],
            contextInfo: ctxInfo,
          });
        }
      } catch (e) {
        console.error(`[GroupEvents] Error handling ${action} for ${jid}:`, e.message);
      }
    }
  } catch (e) {
    console.error('[GroupEvents] Fatal error:', e.message);
  }
};
