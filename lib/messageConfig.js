'use strict';

// Shared WhatsApp newsletter/channel context used by commands that build
// their own messages. The channel JID is configurable through .env.
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: process.env.NEWSLETTER_JID || '120363408055942569@newsletter',
            newsletterName: 'JUNAID-MD↣³⁰²',
            serverMessageId: -1
        }
    }
};

module.exports = { channelInfo };
