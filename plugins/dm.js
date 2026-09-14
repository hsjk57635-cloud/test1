/*****************************************************************************
 *  plugins/dm.js — JUNAID-MD↣³⁰²
 *  Developed By JUNAID-MD↣³⁰²
 *
 *  .dm — Send a direct message to any number from the bot
 *  .dms — Broadcast DM to multiple numbers
 *  .dmgroup — DM all members of a group
 *
 *  Sequence: registered as a normal command, runs at Step 26 of
 *  messageHandler.js exactly like all other commands — no sequence changed.
 *****************************************************************************/

'use strict';

const DELAY = ms => new Promise(r => setTimeout(r, ms));

function toJid(num) {
    const clean = String(num).replace(/[^0-9]/g, '');
    return clean.endsWith('@s.whatsapp.net') ? clean : `${clean}@s.whatsapp.net`;
}

async function sendDM(sock, jid, payload, quoted = null) {
    try {
        await sock.sendMessage(jid, payload, quoted ? { quoted } : undefined);
        return true;
    } catch (e) {
        console.error(`[DM] Failed → ${jid}: ${e.message}`);
        return false;
    }
}

const dmMain = {
    command: 'dm',
    aliases: ['directmessage', 'privatemsg', 'pmsg'],
    category: 'owner',
    description: 'Send a direct message to any WhatsApp number',
    usage: '.dm <number> <message>\n.dm <number> [reply to media]',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId     = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        const reply = (text) => sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (!args.length) {
            return reply(
                `📨 *DM Command*\n\n` +
                `Usage:\n` +
                `• \`.dm <number> <message>\`\n` +
                `• \`.dm <number>\` (reply to media)\n` +
                `• \`.dms <num1,num2,...> <message>\` (bulk)\n` +
                `• \`.dmgroup\` (in group — DM all members)\n\n` +
                `Example: \`.dm  Hello there!\``
            );
        }

        const targetNum = args[0];
        const targetJid = toJid(targetNum);
        const text      = args.slice(1).join(' ').trim();

        // Check if replying to media
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let payload;

        if (!text && !quotedMsg) return reply('❌ Provide a message or reply to media.');

        if (quotedMsg) {
            // Forward the quoted media as DM
            const m = quotedMsg;
            if (m.imageMessage)   payload = { image:    { url: m.imageMessage.url },    mimetype: m.imageMessage.mimetype,    caption: text || m.imageMessage.caption || '' };
            else if (m.videoMessage)   payload = { video:    { url: m.videoMessage.url },    mimetype: m.videoMessage.mimetype,    caption: text || m.videoMessage.caption || '' };
            else if (m.audioMessage)   payload = { audio:    { url: m.audioMessage.url },    mimetype: m.audioMessage.mimetype,    ptt: m.audioMessage.ptt || false };
            else if (m.stickerMessage) payload = { sticker:  { url: m.stickerMessage.url } };
            else if (m.documentMessage) payload = { document: { url: m.documentMessage.url }, mimetype: m.documentMessage.mimetype, fileName: m.documentMessage.fileName || 'file' };
            else payload = { text: text || m.conversation || m.extendedTextMessage?.text || '(message)' };
        } else {
            payload = { text };
        }

        const ok = await sendDM(sock, targetJid, payload);
        return reply(ok
            ? `✅ DM sent to *+${targetNum}*`
            : `❌ Failed to send DM to *+${targetNum}*`
        );
    },
};

/* ── .dms — bulk DM ────────────────────────────────────────────────────── */
const dmsBulk = {
    command: 'dms',
    aliases: ['bulkdm', 'massdm'],
    category: 'owner',
    description: 'Send DM to multiple numbers at once',
    usage: '.dms <num1,num2,...> <message>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId     = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const reply = (text) => sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (args.length < 2) return reply('❌ Usage: `.dms <num1,num2,...> <message>`');

        const numbers = args[0].split(',').map(n => n.trim()).filter(Boolean);
        const text    = args.slice(1).join(' ').trim();
        if (!text) return reply('❌ Provide a message.');

        let sent = 0, failed = 0;
        const waiting = reply(`⏳ Sending to ${numbers.length} contacts...`);

        for (const num of numbers) {
            const ok = await sendDM(sock, toJid(num), { text });
            if (ok) sent++; else failed++;
            await DELAY(1500); // anti-spam delay
        }

        return reply(`📨 *Bulk DM Done*\n✅ Sent: ${sent}\n❌ Failed: ${failed}`);
    },
};

/* ── .dmgroup — DM all group members ──────────────────────────────────── */
const dmGroup = {
    command: 'dmgroup',
    aliases: ['dmall', 'groupdm'],
    category: 'owner',
    description: 'DM all members of current group',
    usage: '.dmgroup <message>',
    ownerOnly: true,
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId     = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const reply = (text) => sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        const text = args.join(' ').trim();
        if (!text) return reply('❌ Usage: `.dmgroup <message>` (run inside a group)');

        let members;
        try {
            const meta = await sock.groupMetadata(chatId);
            members = meta.participants.map(p => p.id).filter(id => !id.includes(sock.user?.id?.split(':')[0]));
        } catch (e) {
            return reply(`❌ Could not fetch group members: ${e.message}`);
        }

        await reply(`⏳ Sending DM to ${members.length} members...`);
        let sent = 0, failed = 0;

        for (const jid of members) {
            const ok = await sendDM(sock, jid, { text });
            if (ok) sent++; else failed++;
            await DELAY(2000);
        }

        return reply(`📨 *Group DM Done*\n✅ Sent: ${sent}\n❌ Failed: ${failed}`);
    },
};

// Array export — commandHandler.loadPlugin loops the array and registers ALL commands.
// Previously dmsBulk and dmGroup were extra object properties that loadPlugin ignored.
module.exports = [dmMain, dmsBulk, dmGroup];
