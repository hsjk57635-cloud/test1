/*****************************************************************************
 *  pmblocker.js — FIX v7.1                                                  *
 *  DEFAULT: disabled. Commands always work in DMs (public mode).            *
 *  Owner: JUNAID-MD↣³⁰²                                              *
 *****************************************************************************/
'use strict';

const fs   = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const STATE_FILE = path.join(__dirname, '../data/pmblocker.json');

// ── Default state ─────────────────────────────────────────────────────────
// enabled: false → DMs open for everyone (PUBLIC MODE default)
// blockCommands: false → commands always work even if enabled
const DEFAULT_STATE = {
  enabled: false,
  blockCommands: false,           // ← KEY FIX: commands bypass blocker by default
  message: '🚫 Private messages are restricted. Please use groups to contact me.'
};

async function readState() {
  try {
    // Try DB first
    const dbState = await store.getSetting('global', 'pmblocker').catch(() => null);
    if (dbState && typeof dbState === 'object') return { ...DEFAULT_STATE, ...dbState };

    // Fallback to file
    if (fs.existsSync(STATE_FILE)) {
      const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      return { ...DEFAULT_STATE, ...raw };
    }
  } catch {}
  return { ...DEFAULT_STATE };
}

async function writeState(state) {
  try {
    await store.saveSetting('global', 'pmblocker', state).catch(() => {});
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {}
}

// ── Plugin command ─────────────────────────────────────────────────────────
module.exports = {
  command: 'pmblocker',
  aliases: ['pmblock', 'blockpm', 'antipm', 'dmblocker'],
  description: 'Block/allow private messages from strangers',
  category: 'owner',
  ownerOnly: true,

  readState,
  writeState,

  async handler(sock, message, args, context) {
    const { chatId } = context;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const sub = (args[0] || '').toLowerCase();

    const state = await readState();

    if (sub === 'on') {
      state.enabled = true;
      await writeState(state);
      return reply(
        `✅ *PM Blocker ENABLED*\n\n` +
        `🔒 Strangers cannot DM the bot.\n` +
        `⚠️ Note: Bot commands in DMs still work (use *.pmblocker blockall* to block commands too).`
      );
    }

    if (sub === 'off') {
      state.enabled = false;
      await writeState(state);
      return reply('✅ *PM Blocker DISABLED*\nAnyone can DM the bot now.');
    }

    if (sub === 'blockall') {
      state.enabled = true;
      state.blockCommands = true;
      await writeState(state);
      return reply('🔒 *Full DM Block enabled* — even commands are blocked in DMs for non-sudo users.');
    }

    if (sub === 'commandsonly') {
      state.enabled = true;
      state.blockCommands = false;
      await writeState(state);
      return reply('✅ *PM Blocker: Commands allowed* — DM text blocked but bot commands work.');
    }

    if (sub === 'status') {
      return reply(
        `*PM Blocker Status*\n\n` +
        `🔒 Enabled: ${state.enabled ? 'Yes' : 'No'}\n` +
        `⚡ Block commands too: ${state.blockCommands ? 'Yes' : 'No'}\n` +
        `💬 Message: ${state.message}`
      );
    }

    if (sub === 'setmsg') {
      const msg = args.slice(1).join(' ');
      if (!msg) return reply('Usage: .pmblocker setmsg <your message>');
      state.message = msg;
      await writeState(state);
      return reply(`✅ PM blocker message updated.`);
    }

    return reply(
      `*PM Blocker Commands*\n\n` +
      `*.pmblocker on* — Enable (commands still work in DM)\n` +
      `*.pmblocker off* — Disable (default)\n` +
      `*.pmblocker blockall* — Block everything in DMs\n` +
      `*.pmblocker commandsonly* — Allow commands, block text\n` +
      `*.pmblocker status* — Show current status\n` +
      `*.pmblocker setmsg <text>* — Set custom block message`
    );
  }
};
