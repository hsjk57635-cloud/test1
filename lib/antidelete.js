/*****************************************************************************
 *  JUNAID-MD↣³⁰² — lib/antidelete.js
 *  Bridge + permission wrapper for plugins/antidelete.js.
 *
 *  ✅ ownerOnly forced to FALSE — all users can check status
 *  ✅ on/off/delpath require bot owner OR group admin
 *  ✅ storeMessage / handleMessageRevocation passed through unchanged
 *****************************************************************************/

'use strict';

const plugin = require('../plugins/antidelete');

const _originalHandler = plugin.handler.bind(plugin);

// Write-only actions that require elevated permission
const WRITE_ACTIONS = new Set(['on', 'off', 'delpath']);

async function permissionAwareHandler(sock, message, args, context = {}) {
  const action  = (args[0] || '').toLowerCase().trim();
  const isOwner = context.isOwner || context.senderIsOwnerOrSudo || false;
  const isAdmin = context.isAdmin || false;

  // Read-only (status / no sub-command): anyone can use
  if (!WRITE_ACTIONS.has(action)) {
    return _originalHandler(sock, message, args, context);
  }

  // Write commands: owner or group admin only
  if (!isOwner && !isAdmin) {
    const chatId = context.chatId || message.key.remoteJid;
    return sock.sendMessage(chatId, {
      text: '❌ Only the bot owner or a group admin can change antidelete settings.'
    }, { quoted: message });
  }

  return _originalHandler(sock, message, args, context);
}

module.exports = {
  ...plugin,
  ownerOnly: false,   // must be false so command reaches the handler
  handler  : permissionAwareHandler,
};
