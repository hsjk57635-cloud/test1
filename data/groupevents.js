/**
 * REDXBOT302 — Group Events (Welcome / Goodbye)
 * Owner: JUNAID-MD↣³⁰²
 */

'use strict';

module.exports = async function GroupEvents(conn, update, config = {}) {
  try {
    const {
      botName     = '🔥 JUNAID-MD↣³⁰² 🔥',
      ownerName   = 'JUNAID-MD↣³⁰²',
      menuImage   = 'https://i.ibb.co/QFQk0DGy/jawadmd.jpg',
      newsletterJid = '120363408055942569@newsletter',
    } = config;

    const { id, participants, action } = update;

    // Get group info
    let groupName = id;
    let groupDesc = '';
    let groupSize = 0;
    try {
      const meta  = await conn.groupMetadata(id);
      groupName   = meta.subject || id;
      groupDesc   = meta.desc    || '';
      groupSize   = meta.participants.length;
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

    for (const jid of participants) {
      const num = jid.split('@')[0];

      if (action === 'add' || action === 'invite') {
        // Welcome message
        await conn.sendMessage(id, {
          image: { url: menuImage },
          caption:
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
> By ${ownerName}`,
          mentions: [jid],
          contextInfo: ctxInfo,
        });

      } else if (action === 'remove' || action === 'leave') {
        // Goodbye message
        await conn.sendMessage(id, {
          text:
`╔══════════════════════════╗
║  👋 *GOODBYE!*             ║
╚══════════════════════════╝

@${num} has left the group. 😢

📌 *Group:* ${groupName}
👥 *Members now:* ${Math.max(0, groupSize - 1)}

We will miss you! Come back anytime. 🙏

> 🔥 Powered by ${botName}`,
          mentions: [jid],
          contextInfo: ctxInfo,
        });

      } else if (action === 'promote') {
        await conn.sendMessage(id, {
          text:
`🎊 *ADMIN PROMOTED!*

@${num} is now an admin! 👑

Congratulations! 🎉

> 🔥 ${botName}`,
          mentions: [jid],
          contextInfo: ctxInfo,
        });

      } else if (action === 'demote') {
        await conn.sendMessage(id, {
          text:
`📢 *ADMIN DEMOTED*

@${num} is no longer an admin.

> 🔥 ${botName}`,
          mentions: [jid],
          contextInfo: ctxInfo,
        });
      }
    }
  } catch (e) {
    console.error('GroupEvents error:', e.message);
  }
};
