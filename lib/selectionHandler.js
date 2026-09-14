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

// Registry for selection handlers (e.g., number replies)
const handlers = [];

/**
 * Register a selection handler.
 * Handler should be an object with:
 * - name: string (for debugging)
 * - check: function(sock, message, context) that returns true if it handled the message
 */
function registerHandler(handler) {
    handlers.push(handler);
}

/**
 * Remove a handler by name.
 */
function unregisterHandler(name) {
    const index = handlers.findIndex(h => h.name === name);
    if (index !== -1) handlers.splice(index, 1);
}

/**
 * Called from messageHandler when a potential selection message (number 1-9) is received.
 * It will iterate through registered handlers in order and stop at the first that returns true.
 */
async function handleSelection(sock, message, context, number) {
    for (const handler of handlers) {
        try {
            const handled = await handler.check(sock, message, context, number);
            if (handled) return true;
        } catch (e) {
            console.error(`Selection handler ${handler.name} error:`, e);
        }
    }
    return false;
}

module.exports = {
    registerHandler,
    unregisterHandler,
    handleSelection
};
