'use strict';
/**
 * deline-requests.js
 * Group join-request approve/reject helper
 * Required by approve.js — JUNAID-MD↣³⁰² v7
 */

async function approveRequests(sock, chatId, message, args, context) {
    const { channelInfo } = context;
    try {
        const pending = await sock.groupRequestParticipantsList(chatId);
        if (!pending || pending.length === 0) {
            return sock.sendMessage(chatId, { text: '📭 No pending join requests.', ...channelInfo }, { quoted: message });
        }

        const target = args[0]?.toLowerCase();

        // .approve all
        if (target === 'all') {
            const jids = pending.map(p => p.jid);
            await sock.groupRequestParticipantsUpdate(chatId, jids, 'approve');
            return sock.sendMessage(chatId, {
                text: `✅ Approved *${jids.length}* pending request(s).`,
                ...channelInfo
            }, { quoted: message });
        }

        // .approve <number>
        const idx = parseInt(target) - 1;
        if (!isNaN(idx) && pending[idx]) {
            await sock.groupRequestParticipantsUpdate(chatId, [pending[idx].jid], 'approve');
            return sock.sendMessage(chatId, {
                text: `✅ Approved request from *${pending[idx].jid.split('@')[0]}*.`,
                ...channelInfo
            }, { quoted: message });
        }

        // No arg — list pending
        let list = `📋 *Pending Join Requests* (${pending.length})\n\n`;
        pending.forEach((p, i) => {
            list += `${i + 1}. +${p.jid.split('@')[0]}\n`;
        });
        list += `\n_Use .approve all OR .approve <number>_`;
        return sock.sendMessage(chatId, { text: list, ...channelInfo }, { quoted: message });
    } catch (err) {
        console.error('[deline-requests] approve error:', err.message);
        return sock.sendMessage(chatId, {
            text: `❌ Error: ${err.message}`,
            ...channelInfo
        }, { quoted: message });
    }
}

async function rejectRequests(sock, chatId, message, args, context) {
    const { channelInfo } = context;
    try {
        const pending = await sock.groupRequestParticipantsList(chatId);
        if (!pending || pending.length === 0) {
            return sock.sendMessage(chatId, { text: '📭 No pending join requests.', ...channelInfo }, { quoted: message });
        }

        const target = args[0]?.toLowerCase();

        if (target === 'all') {
            const jids = pending.map(p => p.jid);
            await sock.groupRequestParticipantsUpdate(chatId, jids, 'reject');
            return sock.sendMessage(chatId, {
                text: `🚫 Rejected *${jids.length}* pending request(s).`,
                ...channelInfo
            }, { quoted: message });
        }

        const idx = parseInt(target) - 1;
        if (!isNaN(idx) && pending[idx]) {
            await sock.groupRequestParticipantsUpdate(chatId, [pending[idx].jid], 'reject');
            return sock.sendMessage(chatId, {
                text: `🚫 Rejected request from *${pending[idx].jid.split('@')[0]}*.`,
                ...channelInfo
            }, { quoted: message });
        }

        let list = `📋 *Pending Join Requests* (${pending.length})\n\n`;
        pending.forEach((p, i) => { list += `${i + 1}. +${p.jid.split('@')[0]}\n`; });
        list += `\n_Use .reject all OR .reject <number>_`;
        return sock.sendMessage(chatId, { text: list, ...channelInfo }, { quoted: message });
    } catch (err) {
        console.error('[deline-requests] reject error:', err.message);
        return sock.sendMessage(chatId, { text: `❌ Error: ${err.message}`, ...channelInfo }, { quoted: message });
    }
}

module.exports = { approveRequests, rejectRequests };
