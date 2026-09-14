'use strict';
/**
 * deline-games.js
 * Game reply handler — checks global.games map for pending answers
 * Required by lib/messageHandler.js — JUNAID-MD↣³⁰² v7
 */

/**
 * Called on every incoming message.
 * Returns true if the message was a game answer and was handled.
 */
async function handleGameReply(sock, message, chatId, userMessage) {
    try {
        if (!global.games || !global.games[chatId]) return false;

        const game = global.games[chatId];
        const guess = userMessage.trim().toLowerCase();

        // Only handle plain text guesses (not commands)
        if (!guess || guess.startsWith('.') || guess.startsWith('!')) return false;

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

        const isCorrect = guess === game.answer;

        if (isCorrect) {
            delete global.games[chatId];
            await sock.sendMessage(chatId, {
                text: `✅ *Correct!*\n\nThe answer was: *${game.answer}*\n\n🎉 Well done!`,
                ...channelInfo
            }, { quoted: message });
            return true;
        }

        // Wrong answer — give a hint or just say wrong
        await sock.sendMessage(chatId, {
            text: `❌ Wrong guess!\n\nHint: *${game.answer.charAt(0)}${'_'.repeat(Math.max(0, game.answer.length - 1))}*\n\n_Try again!_`,
            ...channelInfo
        }, { quoted: message });
        return true;
    } catch (err) {
        console.error('[deline-games] handleGameReply error:', err.message);
        return false;
    }
}

module.exports = { handleGameReply };
