/*****************************************************************************
 *  plugins/panel.js — JUNAID-MD↣³⁰² ULTRA V5
 *  Developed By JUNAID-MD↣³⁰²
 *
 *  v5 UPGRADES:
 *  - Everything from V4 +
 *  - .panel plugins  — live plugin list + reload
 *  - .panel reload   — hot-reload a plugin without restart
 *  - .panel update   — git pull + auto restart
 *  - .panel gc       — detailed memory report + force GC
 *  - .panel setbio   — change bot bio
 *  - .panel setppic  — change bot profile pic (reply to image)
 *  - .panel mutegroup/unmutegroup — silence bot in a group
 *  - .panel ping     — latency check
 *  - .panel whitelist add/remove/list — per-chat whitelist
 *  - .panel resetwarn <num> — clear user warnings
 *  - .panel antilink/antispam/antidelete quick toggles
 *  - .panel cmdstats — top-10 most used commands
 *  - .panel blacklist add/remove/list <word> — global word blacklist
 *****************************************************************************/

'use strict';
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');
const os      = require('os');
const { exec } = require('child_process');
const store   = require('../lib/lightweight_store');

const PANEL_CONFIG_PATH = path.join(__dirname, '../data/panel.json');
const PANEL_LOG_PATH    = path.join(__dirname, '../data/panel_log.json');
const HAS_DB = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.DB_URL);

const sessions  = new Map();
const SESSION_TTL = 15 * 60 * 1000;
const MAX_FAILS   = 5;
const LOCKOUT_TTL = 30 * 60 * 1000;

/* ─── Secure helpers ──────────────────────────────────────────────────────── */
function hashPass(raw) {
    return crypto.createHash('sha256').update(raw + 'redxsalt2026').digest('hex');
}
const DEFAULT_PASS_HASH = hashPass('redx2008');

async function deleteMsg(sock, chatId, message) {
    try { await sock.sendMessage(chatId, { delete: message.key }); } catch {}
}

async function loadPanelConfig() {
    try {
        if (HAS_DB) {
            const cfg = await store.getSetting('global', 'panel_ultra');
            return cfg || { password: DEFAULT_PASS_HASH, locked: false, failCounts: {}, whitelist: [], mutedGroups: [], blacklist: [] };
        }
        if (!fs.existsSync(PANEL_CONFIG_PATH)) {
            return { password: DEFAULT_PASS_HASH, locked: false, failCounts: {}, whitelist: [], mutedGroups: [], blacklist: [] };
        }
        const data = JSON.parse(fs.readFileSync(PANEL_CONFIG_PATH, 'utf8'));
        if (!data.password) data.password = DEFAULT_PASS_HASH;
        if (!data.whitelist) data.whitelist = [];
        if (!data.mutedGroups) data.mutedGroups = [];
        if (!data.blacklist) data.blacklist = [];
        return data;
    } catch { return { password: DEFAULT_PASS_HASH, locked: false, failCounts: {}, whitelist: [], mutedGroups: [], blacklist: [] }; }
}

async function savePanelConfig(cfg) {
    try {
        if (HAS_DB) return await store.saveSetting('global', 'panel_ultra', cfg);
        const dir = path.dirname(PANEL_CONFIG_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(PANEL_CONFIG_PATH, JSON.stringify(cfg, null, 2));
    } catch (e) { console.error('[PANEL] save error:', e.message); }
}

function addLog(senderId, action) {
    try {
        let logs = [];
        if (fs.existsSync(PANEL_LOG_PATH)) logs = JSON.parse(fs.readFileSync(PANEL_LOG_PATH, 'utf8') || '[]');
        logs.unshift({ ts: new Date().toISOString(), user: senderId.split('@')[0], action });
        if (logs.length > 200) logs = logs.slice(0, 200);
        fs.writeFileSync(PANEL_LOG_PATH, JSON.stringify(logs, null, 2));
    } catch {}
}
function getLogs() {
    try {
        if (!fs.existsSync(PANEL_LOG_PATH)) return [];
        return JSON.parse(fs.readFileSync(PANEL_LOG_PATH, 'utf8') || '[]');
    } catch { return []; }
}

function isUnlocked(senderId) {
    const s = sessions.get(senderId);
    if (!s) return false;
    if (Date.now() > s.expires) { sessions.delete(senderId); return false; }
    return s.unlocked;
}
function unlock(senderId) { sessions.set(senderId, { unlocked: true, expires: Date.now() + SESSION_TTL }); }
function refreshSession(senderId) { const s = sessions.get(senderId); if (s) s.expires = Date.now() + SESSION_TTL; }

/* ─── System stats ────────────────────────────────────────────────────────── */
function getStats(sock) {
    const uptime = process.uptime();
    const mem    = process.memoryUsage();
    const free   = os.freemem();
    const total  = os.totalmem();
    const uh = Math.floor(uptime / 3600), um = Math.floor((uptime % 3600) / 60), us = Math.floor(uptime % 60);
    const cmdHandler = (() => { try { return require('../lib/commandHandler'); } catch { return null; }})();
    const cmdCount = cmdHandler?.getCommandCount?.() || '?';
    const waNum = sock?.user?.id?.split(':')[0] || '?';
    return (
        `╔══════════════════════════════╗\n` +
        `║  📊  JUNAID-MD↣³⁰² BOT STATUS  📊    ║\n` +
        `╚══════════════════════════════╝\n\n` +
        `*⏱ Uptime:*    ${uh}h ${um}m ${us}s\n` +
        `*🧠 Heap:*     ${Math.round(mem.heapUsed/1048576)}MB / ${Math.round(mem.heapTotal/1048576)}MB\n` +
        `*📦 RSS:*      ${Math.round(mem.rss/1048576)}MB\n` +
        `*💾 Free RAM:* ${Math.round(free/1048576)}MB / ${Math.round(total/1048576)}MB\n` +
        `*🖥️ CPU:*      ${os.cpus().length} cores | Load: ${os.loadavg().map(l=>l.toFixed(2)).join(', ')}\n` +
        `*📱 Platform:* ${os.platform()} ${os.arch()}\n` +
        `*🔢 Node:*     ${process.version} | PID: ${process.pid}\n` +
        `*📞 WA Num:*   +${waNum}\n` +
        `*⚡ Commands:* ${cmdCount} loaded\n` +
        `*🌐 Mode:*     ${global.MODE || 'public'}`
    );
}

/* ─── Menu ────────────────────────────────────────────────────────────────── */
function panelMenu() {
    return `╔══════════════════════════════╗
║  ⚡  JUNAID-MD↣³⁰²  ⚡  ║
║          ULTRA V5              ║
╚══════════════════════════════╝

*⚙️ BOT CONTROLS*
├ \`.panel status\` – Full stats
├ \`.panel ping\` – Latency check
├ \`.panel restart\` – Restart bot
├ \`.panel stop\` – Shutdown
├ \`.panel update\` – Git pull + restart
├ \`.panel cleartmp\` – Clear temp files
├ \`.panel gc\` – Force GC + memory report
├ \`.panel broadcast <msg>\` – Send to all chats

*🔌 PLUGINS*
├ \`.panel plugins\` – List all plugins
├ \`.panel reload <name>\` – Hot-reload plugin
├ \`.panel cmdstats\` – Top 10 commands

*👤 PROFILE*
├ \`.panel setname <name>\`
├ \`.panel setbio <text>\`
├ \`.panel setppic\` (reply to image)
├ \`.panel setprefix <symbol>\`
├ \`.panel setowner <number>\`
├ \`.panel mode <public|private|groups|inbox|self>\`

*👥 USER MANAGEMENT*
├ \`.panel ban/unban <num>\`
├ \`.panel listbanned\`
├ \`.panel sudo add/remove/list <num>\`
├ \`.panel resetwarn <num>\`

*🔇 GROUP CONTROLS*
├ \`.panel mutegroup\` – Silence bot here
├ \`.panel unmutegroup\` – Restore bot here
├ \`.panel whitelist add/remove/list\`

*🔤 WORD FILTER*
├ \`.panel blacklist add/remove/list <word>\`

*🛡️ PROTECTION TOGGLES*
├ \`.panel antilink on|off\` – Quick toggle
├ \`.panel antispam on|off\`
├ \`.panel antidelete on|off\`

*📡 CHANNEL (auto-join + auto-react)*
├ \`.panel channel\` – Show current channel
├ \`.panel channel\` – List saved channels (auto-followed on every pair)
├ \`.panel addchannel <link/jid>\` – Add a channel to the auto-join list
├ \`.panel delchannel <number>\` – Remove a channel from the list
├ \`.panel reactpost <post link> [emoji]\` – React to a channel POST from every paired session
├ \`.panel setchannel <jid/link>\` – Legacy alias for addchannel
├ \`.panel followchannel\` – Re-follow all saved channels on all sessions

*📤 STATUS BROADCAST (all paired sessions)*
├ \`.panel poststatus <text>\` – Post text status everywhere
├ \`.panel poststatusimg\` – Reply to an image → status everywhere

*🔐 SECURITY*
├ \`.panel changepass <new>\`
├ \`.panel lock\` – Lock session
├ \`.panel sessions\` – List saved WhatsApp numbers (local+Supabase+Mongo)
├ \`.panel authsessions\` – Active panel logins
├ \`.panel killall\` – Kill all panel logins
├ \`.panel emergency\` – Global lockdown
├ \`.panel backup\` – Export config
├ \`.panel log\` – Activity log

└ _Session auto-lock: 15 min_`;
}

/* ─── Broadcast ───────────────────────────────────────────────────────────── */
async function broadcastToAll(sock, text) {
    const chats = sock.chats || new Map();
    let sent = 0;
    for (const [jid] of chats) {
        if (jid.endsWith('@g.us') || jid.endsWith('@s.whatsapp.net')) {
            try { await sock.sendMessage(jid, { text: `📢 *BROADCAST*\n\n${text}` }); sent++; await new Promise(r => setTimeout(r, 600)); } catch {}
        }
    }
    return sent;
}

/* ─── Download image from message ────────────────────────────────────────── */
async function downloadImageBuffer(message) {
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const imgMsg = message.message?.imageMessage ||
                   message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
    if (!imgMsg) throw new Error('Reply to an image first.');
    const stream = await downloadContentFromMessage(imgMsg, 'image');
    let buf = Buffer.alloc(0);
    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
    return buf;
}

/* ─── Main handler ────────────────────────────────────────────────────────── */
module.exports = {
    command: 'panel',
    aliases: ['admin-panel', 'cp', 'control'],
    category: 'owner',
    description: 'ULTRA secure admin panel V5 — 30+ commands',
    usage: '.panel <password>  or  .panel <command>',
    ownerOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId   = context.chatId || message.key.remoteJid;
        const senderId = (message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};
        const settings = require('../settings');
        const isGroup  = chatId.endsWith('@g.us');

        const reply = (text) => sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        let cfg = await loadPanelConfig();

        // Emergency lock
        if (cfg.emergencyLock && !isUnlocked(senderId)) {
            return reply(`🚨 *PANEL EMERGENCY LOCKED*\nUse \`.panel <password> emergency-unlock\``);
        }

        // Lockout check
        const failInfo = cfg.failCounts?.[senderId];
        if (failInfo && failInfo.count >= MAX_FAILS && (Date.now() - failInfo.lastFail) < LOCKOUT_TTL) {
            const remaining = Math.ceil((LOCKOUT_TTL - (Date.now() - failInfo.lastFail)) / 60000);
            return reply(`🔒 Too many failures – locked for ${remaining} min.`);
        }

        if (!args.length) {
            if (isUnlocked(senderId)) { refreshSession(senderId); return reply(panelMenu()); }
            return reply(`🔐 *JUNAID-MD↣³⁰² V5*\n\nSend \`.panel <password>\` to access.\n_${MAX_FAILS} wrong attempts = 30 min lockout_`);
        }

        const sub = args[0].toLowerCase();

        // ── UNLOCK ──────────────────────────────────────────────────────────
        if (!isUnlocked(senderId)) {
            const attempt = args[0];
            const correct = cfg.password === hashPass(attempt);
            await deleteMsg(sock, chatId, message);
            if (correct) {
                if (cfg.failCounts?.[senderId]) delete cfg.failCounts[senderId];
                await savePanelConfig(cfg);
                unlock(senderId); addLog(senderId, 'UNLOCKED');
                await reply(`✅ *Panel V5 unlocked* — session 15 min.\n\n` + panelMenu());
                if (args[1] === 'emergency-unlock') { cfg.emergencyLock = false; await savePanelConfig(cfg); await reply('🔓 Emergency lock cleared.'); }
                return;
            } else {
                if (!cfg.failCounts) cfg.failCounts = {};
                cfg.failCounts[senderId] = { count: (cfg.failCounts[senderId]?.count || 0) + 1, lastFail: Date.now() };
                await savePanelConfig(cfg);
                const left = MAX_FAILS - cfg.failCounts[senderId].count;
                return reply(`❌ Wrong password.\n${left > 0 ? `${left} attempt(s) left` : 'Locked out 30 min.'}`);
            }
        }

        // ── ALREADY UNLOCKED ─────────────────────────────────────────────
        refreshSession(senderId);
        addLog(senderId, sub + (args[1] ? ' ' + args[1] : ''));

        if (sub === 'help') return reply(panelMenu());

        // STATUS
        if (sub === 'status') return reply(getStats(sock));

        // PING
        if (sub === 'ping') {
            const t = Date.now();
            const m = await sock.sendMessage(chatId, { text: '🏓 Pinging...' });
            const lat = Date.now() - t;
            await sock.sendMessage(chatId, { text: `🏓 *Pong!*\n⚡ Latency: *${lat}ms*`, edit: m.key });
            return;
        }

        // GC / MEMORY
        if (sub === 'gc' || sub === 'clearmem') {
            const before = process.memoryUsage();
            if (global.gc) global.gc();
            await new Promise(r => setTimeout(r, 200));
            const after = process.memoryUsage();
            const freed = Math.round((before.heapUsed - after.heapUsed) / 1048576);
            return reply(
                `🧹 *Garbage Collection*\n\n` +
                `Before: ${Math.round(before.heapUsed/1048576)}MB heap\n` +
                `After:  ${Math.round(after.heapUsed/1048576)}MB heap\n` +
                `Freed:  ~${freed}MB\n` +
                `RSS:    ${Math.round(after.rss/1048576)}MB\n` +
                `${global.gc ? '✅ GC ran' : '⚠️ GC not available — use --expose-gc flag'}`
            );
        }

        // CLEARTMP
        if (sub === 'cleartmp') {
            const dirs = ['temp', 'tmp', 'media'].map(d => path.join(process.cwd(), d));
            let total = 0;
            for (const d of dirs) {
                if (!fs.existsSync(d)) continue;
                for (const f of fs.readdirSync(d)) { try { fs.unlinkSync(path.join(d, f)); total++; } catch {} }
            }
            return reply(`🗑️ Deleted ${total} temp file(s) from temp/tmp/media.`);
        }

        // RESTART / STOP / UPDATE
        if (sub === 'restart') { await reply('🔄 Restarting...'); setTimeout(() => process.exit(0), 1000); return; }
        if (sub === 'stop')    { await reply('🛑 Shutting down.'); setTimeout(() => process.exit(0), 1000); return; }
        if (sub === 'update') {
            await reply('⏳ Running git pull...');
            exec('git pull origin main', async (err, stdout, stderr) => {
                const out = (stdout || '') + (stderr || '');
                if (err) { await reply(`❌ Git error:\n${out.slice(0,800)}`); return; }
                await reply(`✅ Git pull done:\n${out.slice(0,600)}\n\n🔄 Restarting...`);
                setTimeout(() => process.exit(0), 2000);
            });
            return;
        }

        // PLUGINS
        if (sub === 'plugins') {
            const pluginDir = path.join(__dirname);
            const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js') && !f.startsWith('cat-'));
            const bundles = fs.readdirSync(pluginDir).filter(f => f.startsWith('cat-') && f.endsWith('.js'));
            return reply(
                `🔌 *Plugin Files (${files.length + bundles.length} total)*\n\n` +
                `*Standalone (${files.length}):*\n${files.map(f => `• ${f}`).join('\n')}\n\n` +
                `*Bundles (${bundles.length}):*\n${bundles.map(f => `• ${f}`).join('\n')}`
            );
        }

        // RELOAD
        if (sub === 'reload') {
            const name = args[1];
            if (!name) return reply('❌ Usage: `.panel reload <plugin-filename>`');
            const pluginPath = path.join(__dirname, name.endsWith('.js') ? name : name + '.js');
            if (!fs.existsSync(pluginPath)) return reply(`❌ Not found: ${name}.js`);
            try {
                delete require.cache[require.resolve(pluginPath)];
                const plugin = require(pluginPath);
                const ch = require('../lib/commandHandler');
                const plugins = Array.isArray(plugin) ? plugin : (Array.isArray(plugin?.commands) ? plugin.commands : [plugin]);
                let loaded = 0;
                for (const p of plugins) { if (p?.command) { ch.registerCommand(p.command, p); loaded++; } }
                return reply(`✅ Reloaded *${name}* — ${loaded} command(s) registered`);
            } catch (e) {
                return reply(`❌ Reload failed: ${e.message}`);
            }
        }

        // CMDSTATS
        if (sub === 'cmdstats') {
            try {
                const ch = require('../lib/commandHandler');
                const stats = ch.getCommandStats?.() || {};
                const sorted = Object.entries(stats).sort((a,b) => b[1]-a[1]).slice(0,10);
                if (!sorted.length) return reply('📭 No command stats yet.');
                return reply(
                    `📊 *Top 10 Commands*\n\n` +
                    sorted.map(([cmd, count], i) => `${i+1}. \`.${cmd}\` — *${count}* uses`).join('\n')
                );
            } catch { return reply('⚠️ Command stats not available.'); }
        }

        // LOG
        if (sub === 'log') {
            const logs = getLogs();
            if (!logs.length) return reply('📭 No log entries.');
            const lines = logs.slice(0, 20).map(l => `[${l.ts.slice(0,19).replace('T',' ')}] *${l.user}* → ${l.action}`).join('\n');
            return reply(`📋 *Activity Log (last 20)*\n\n${lines}`);
        }

        // SETNAME / SETBIO / SETPPIC / SETPREFIX / SETOWNER
        if (sub === 'setname') {
            const name = args.slice(1).join(' ').trim();
            if (!name) return reply('❌ Usage: `.panel setname <name>`');
            try { await sock.updateProfileName(name); return reply(`✅ Bot name → *${name}*`); }
            catch (e) { return reply(`❌ ${e.message}`); }
        }
        if (sub === 'setbio') {
            const bio = args.slice(1).join(' ').trim();
            if (!bio) return reply('❌ Usage: `.panel setbio <text>`');
            try { await sock.updateProfileStatus(bio); return reply(`✅ Bio updated.`); }
            catch (e) { return reply(`❌ ${e.message}`); }
        }
        if (sub === 'setppic') {
            try {
                const buf = await downloadImageBuffer(message);
                await sock.updateProfilePicture(sock.user.id, buf);
                return reply('✅ Profile picture updated.');
            } catch (e) { return reply(`❌ ${e.message}`); }
        }
        if (sub === 'setprefix') {
            const prefix = args[1];
            if (!prefix) return reply('❌ Usage: `.panel setprefix <symbol>`');
            settings.prefixes = [prefix]; return reply(`✅ Prefix → \`${prefix}\``);
        }
        if (sub === 'setowner') {
            const num = (args[1] || '').replace(/[^0-9]/g, '');
            if (!num) return reply('❌ Usage: `.panel setowner <number>`');
            settings.ownerNumber = num; return reply(`✅ Owner → +${num}`);
        }

        // MODE
        if (sub === 'mode') {
            const newMode = args[1]?.toLowerCase();
            const valid = ['public', 'private', 'groups', 'inbox', 'self'];
            if (!valid.includes(newMode)) return reply(`❌ Modes: ${valid.join(', ')}`);
            try { const cfg2 = require('../config'); cfg2.saveMode?.(newMode); } catch {}
            // ✅ FIX: .panel mode now updates BOTH globals (index.js reads BOT_MODE)
            global.BOT_MODE = newMode;
            global.MODE     = newMode;
            return reply(`✅ Mode → *${newMode.toUpperCase()}*`);
        }

        // BROADCAST
        if (sub === 'broadcast') {
            const msg = args.slice(1).join(' ');
            if (!msg) return reply('❌ Usage: `.panel broadcast <message>`');
            await reply('⏳ Broadcasting...');
            const sent = await broadcastToAll(sock, msg);
            return reply(`📢 Broadcast sent to *${sent}* chat(s).`);
        }

        // BACKUP
        if (sub === 'backup') {
            const backup = { timestamp: new Date().toISOString(), config: cfg, settings: { owner: settings.ownerNumber, prefixes: settings.prefixes, mode: global.MODE } };
            const bp = path.join(__dirname, '../data/backup_panel.json');
            fs.writeFileSync(bp, JSON.stringify(backup, null, 2));
            await sock.sendMessage(chatId, { document: { url: bp }, fileName: 'JUNAIDbot_backup.json', mimetype: 'application/json', caption: '💾 Panel backup' }, { quoted: message });
            return;
        }

        // BAN / UNBAN / LISTBANNED
        if (sub === 'ban')   { const num=(args[1]||'').replace(/[^0-9]/g,''); if(!num) return reply('❌ `.panel ban <number>`'); try{const b=require('../lib/isBanned');await b.banUser?.(`${num}@s.whatsapp.net`);}catch{} return reply(`🚫 Banned: +${num}`); }
        if (sub === 'unban') { const num=(args[1]||'').replace(/[^0-9]/g,''); if(!num) return reply('❌ `.panel unban <number>`'); try{const b=require('../lib/isBanned');await b.unbanUser?.(`${num}@s.whatsapp.net`);}catch{} return reply(`✅ Unbanned: +${num}`); }
        if (sub === 'listbanned') { try{const b=require('../lib/isBanned');const l=await b.getBannedList?.()||[];return reply(l.length?`🚫 *Banned (${l.length})*\n${l.map(j=>`+${j.split('@')[0]}`).join('\n')}` : '📭 No banned users.');}catch{return reply('⚠️ Ban store error.');} }

        // RESETWARN
        if (sub === 'resetwarn') {
            const num = (args[1] || '').replace(/[^0-9]/g, '');
            if (!num) return reply('❌ Usage: `.panel resetwarn <number>`');
            try {
                const warnPath = path.join(__dirname, '../data/warnings.json');
                if (fs.existsSync(warnPath)) {
                    const warns = JSON.parse(fs.readFileSync(warnPath, 'utf8') || '{}');
                    delete warns[`${num}@s.whatsapp.net`];
                    fs.writeFileSync(warnPath, JSON.stringify(warns, null, 2));
                }
                return reply(`✅ Warnings cleared for +${num}`);
            } catch (e) { return reply(`❌ ${e.message}`); }
        }

        // SUDO
        if (sub === 'sudo') {
            const action = args[1]?.toLowerCase(), num = (args[2]||'').replace(/[^0-9]/g,'');
            const s = require('../settings');
            if (action === 'add')    { if(!num) return reply('❌ `.panel sudo add <number>`'); if(!s.sudoNumbers) s.sudoNumbers=[]; const jid=`${num}@s.whatsapp.net`; if(!s.sudoNumbers.includes(jid)) s.sudoNumbers.push(jid); return reply(`✅ Sudo added: +${num}`); }
            if (action === 'remove') { if(!num) return reply('❌ `.panel sudo remove <number>`'); s.sudoNumbers=(s.sudoNumbers||[]).filter(j=>!j.includes(num)); return reply(`✅ Sudo removed: +${num}`); }
            if (action === 'list')   { const l=require('../settings').sudoNumbers||[]; return reply(l.length?`🔑 *Sudo*\n${l.map(j=>`+${j.split('@')[0]}`).join('\n')}`:'📭 No sudo users.'); }
            return reply('❌ `.panel sudo add/remove/list <number>`');
        }

        // MUTE/UNMUTE GROUP
        if (sub === 'mutegroup') {
            if (!isGroup) return reply('❌ Use inside a group.');
            if (!cfg.mutedGroups.includes(chatId)) cfg.mutedGroups.push(chatId);
            await savePanelConfig(cfg);
            if (global.MUTED_GROUPS) global.MUTED_GROUPS.add(chatId); else global.MUTED_GROUPS = new Set([chatId]);
            return reply('🔇 Bot muted in this group.');
        }
        if (sub === 'unmutegroup') {
            if (!isGroup) return reply('❌ Use inside a group.');
            cfg.mutedGroups = cfg.mutedGroups.filter(g => g !== chatId);
            await savePanelConfig(cfg);
            global.MUTED_GROUPS?.delete(chatId);
            return reply('🔊 Bot unmuted in this group.');
        }

        // WHITELIST
        if (sub === 'whitelist') {
            const action = args[1]?.toLowerCase(), val = args[2];
            if (!cfg.whitelist) cfg.whitelist = [];
            if (action === 'add')    { if(val&&!cfg.whitelist.includes(val)) cfg.whitelist.push(val); await savePanelConfig(cfg); return reply(`✅ Whitelisted: ${val}`); }
            if (action === 'remove') { cfg.whitelist=cfg.whitelist.filter(v=>v!==val); await savePanelConfig(cfg); return reply(`✅ Removed: ${val}`); }
            if (action === 'list')   { return reply(cfg.whitelist.length?`📋 *Whitelist*\n${cfg.whitelist.join('\n')}`:'📭 Whitelist empty.'); }
        }

        // BLACKLIST
        if (sub === 'blacklist') {
            const action = args[1]?.toLowerCase(), word = args.slice(2).join(' ').toLowerCase();
            if (!cfg.blacklist) cfg.blacklist = [];
            if (action === 'add'&&word)    { if(!cfg.blacklist.includes(word)) cfg.blacklist.push(word); await savePanelConfig(cfg); global.BLACKLIST = cfg.blacklist; return reply(`✅ Blacklisted: "${word}"`); }
            if (action === 'remove'&&word) { cfg.blacklist=cfg.blacklist.filter(w=>w!==word); await savePanelConfig(cfg); global.BLACKLIST=cfg.blacklist; return reply(`✅ Removed: "${word}"`); }
            if (action === 'list')         { return reply(cfg.blacklist.length?`🚫 *Blacklist (${cfg.blacklist.length})*\n${cfg.blacklist.map((w,i)=>`${i+1}. ${w}`).join('\n')}`:'📭 Blacklist empty.'); }
        }

        // PROTECTION QUICK TOGGLES
        if (sub === 'antilink' || sub === 'antispam' || sub === 'antidelete') {
            if (!isGroup && sub !== 'antidelete') return reply('❌ Use inside a group.');
            const onOff = args[1]?.toLowerCase();
            if (!['on','off'].includes(onOff)) return reply(`❌ Usage: \`.panel ${sub} on|off\``);
            try {
                const plugin = require(`./${sub}`);
                const fakeMessage = { ...message, _panelOverride: true };
                await plugin.handler(sock, fakeMessage, [onOff], { ...context, chatId });
                return reply(`✅ ${sub} → *${onOff.toUpperCase()}*`);
            } catch (e) { return reply(`❌ Toggle failed: ${e.message}`); }
        }

        // EMERGENCY / SESSIONS / KILLALL / LOCK / CHANGEPASS
        if (sub === 'emergency') { cfg.emergencyLock = true; await savePanelConfig(cfg); sessions.clear(); return reply('🚨 *EMERGENCY LOCK* – all sessions revoked.'); }
        // ✅ FIX: this used to show *panel login* sessions (password auth,
        // 15-min TTL) under the name "sessions" — completely different thing
        // from a paired WhatsApp number, and it never looked at Supabase or
        // Mongo. `.panel session(s)` now lists the real paired WhatsApp
        // numbers from every source (local disk + Supabase + Mongo), each
        // marked with whether it's live right now. The old password-session
        // list moved to `.panel authsessions`.
        if (sub === 'session' || sub === 'sessions') {
            try {
                const SESSIONS_DIR = path.join(process.cwd(), 'sessions');
                const local = new Set();
                if (fs.existsSync(SESSIONS_DIR)) {
                    for (const d of fs.readdirSync(SESSIONS_DIR)) {
                        try {
                            if (fs.existsSync(path.join(SESSIONS_DIR, d, 'creds.json'))) local.add(d);
                        } catch {}
                    }
                }

                let supa = [], mongo = [];
                try { const s = require('../lib/supabaseStore'); if (s.isEnabled()) supa = await s.listSessions(); } catch {}
                try { const m = require('../lib/mongoSessionStore'); if (m.isEnabled()) mongo = await m.listSessions(); } catch {}

                const all = new Set([...local, ...supa, ...mongo]);
                if (!all.size) return reply('📭 No saved WhatsApp sessions (local, Supabase, or Mongo).');

                const live = (typeof global.getActiveSockets === 'function') ? new Set() : null; // filled below
                const activeNums = (typeof global.__activeConnectionNums === 'function') ? global.__activeConnectionNums() : [];
                const activeSet = new Set(activeNums);

                const lines = [...all].sort().map(num => {
                    const tags = [];
                    if (local.has(num)) tags.push('💾local');
                    if (supa.includes(num)) tags.push('☁️supabase');
                    if (mongo.includes(num)) tags.push('🍃mongo');
                    const status = activeSet.has(num) ? '🟢 connected' : '⚪ saved (not connected right now)';
                    return `📱 +${num} — ${status}\n   sources: ${tags.join(', ') || 'unknown'}`;
                });
                return reply(`*📂 Saved WhatsApp Sessions (${all.size})*\n\n${lines.join('\n\n')}`);
            } catch (e) { return reply(`❌ ${e.message}`); }
        }
        if (sub === 'authsessions') {
            const active = [...sessions.entries()].filter(([,s]) => Date.now() < s.expires);
            if (!active.length) return reply('📭 No active panel-login sessions.');
            return reply(`*Active panel logins:*\n${active.map(([id,s])=>`👤 ${id.split('@')[0]}  (${Math.floor((s.expires-Date.now())/1000)}s left)`).join('\n')}`);
        }
        if (sub === 'killall') { sessions.clear(); return reply('🔒 All sessions terminated.'); }
        if (sub === 'lock' || sub === 'logout') { sessions.delete(senderId); return reply('🔒 Locked. Use `.panel <password>` to re-enter.'); }
        if (sub === 'changepass' || sub === 'setpass') {
            const newPass = args[1];
            if (!newPass || newPass.length < 6) return reply('❌ Password must be ≥6 characters.');
            cfg.password = hashPass(newPass); await savePanelConfig(cfg);
            await deleteMsg(sock, chatId, message);
            const masked = newPass[0] + '*'.repeat(Math.max(0, newPass.length-2)) + newPass[newPass.length-1];
            return reply(`✅ Password changed. New: ${masked}`);
        }

        // ── CHANNEL (multi-channel auto-join + auto-react-to-post) ────────
        if (sub === 'channel') {
            try {
                const list = (typeof global.getChannelCfg === 'function') ? await global.getChannelCfg(false) : [];
                if (!list.length) {
                    return reply(`📡 *No channels saved yet.*\n\n➕ Add one:\n\`.panel addchannel <link or jid>\`\n\ne.g. \`.panel addchannel https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f\``);
                }
                const lines = list.map((c, i) => `${i + 1}. ${c.name || c.jid}\n   🆔 \`${c.jid}\`${c.link ? `\n   🔗 ${c.link}` : ''}`).join('\n\n');
                return reply(`📡 *Saved Channels (${list.length})* — auto-followed on every new pair\n\n${lines}\n\n➕ \`.panel addchannel <link>\`\n➖ \`.panel delchannel <number>\`\n😍 \`.panel reactpost <post link> [emoji]\``);
            } catch (e) { return reply(`❌ ${e.message}`); }
        }
        if (sub === 'addchannel') {
            const input = args.slice(1).join(' ').trim();
            if (!input) return reply('❌ Usage:\n`.panel addchannel 120363408055942569@newsletter`\n`.panel addchannel https://whatsapp.com/channel/CODE`');
            if (typeof global.addChannel !== 'function') return reply('❌ Channel service not ready.');
            try {
                const res = await global.addChannel(sock, input);
                let applied = null;
                if (typeof global.applyChannelToAll === 'function') applied = await global.applyChannelToAll();
                return reply(`✅ Channel added! (${res.total} total)\n\n🆔 \`${res.jid}\`${res.name ? `\n📛 ${res.name}` : ''}\n\n${applied ? `📡 Followed on ${applied.ok} session(s)${applied.failed ? ` (${applied.failed} failed)` : ''}` : 'Will follow on next connect.'}`);
            } catch (e) { return reply(`❌ ${e.message}`); }
        }
        if (sub === 'delchannel' || sub === 'removechannel') {
            const target = args[1];
            if (!target) return reply('❌ Usage: `.panel delchannel <number>` (see `.panel channel` for the list) or `.panel delchannel <jid>`');
            if (typeof global.removeChannel !== 'function') return reply('❌ Channel service not ready.');
            const res = await global.removeChannel(target);
            return reply(res.removed ? `✅ Channel removed. ${res.total} remaining.` : '❌ Not found in the channel list.');
        }
        // Legacy single-channel setter — kept working, now just adds to the list.
        if (sub === 'setchannel') {
            const input = args.slice(1).join(' ').trim();
            if (!input) return reply('❌ Usage:\n`.panel setchannel 120363408055942569@newsletter`\n`.panel setchannel https://whatsapp.com/channel/CODE`');
            if (typeof global.addChannel !== 'function') return reply('❌ Channel service not ready.');
            try {
                const res = await global.addChannel(sock, input);
                let applied = null;
                if (typeof global.applyChannelToAll === 'function') applied = await global.applyChannelToAll();
                return reply(`✅ Channel updated!\n\n🆔 \`${res.jid}\`\n\n${applied ? `📡 Followed on ${applied.ok} session(s)${applied.failed ? ` (${applied.failed} failed)` : ''}` : 'Will follow on next connect.'}`);
            } catch (e) { return reply(`❌ ${e.message}`); }
        }
        if (sub === 'followchannel') {
            try {
                if (typeof global.applyChannelToAll !== 'function') return reply('❌ Channel service not ready.');
                const res = await global.applyChannelToAll();
                if (res.reason === 'no_channels') return reply('❌ No channels saved yet. Add one first:\n`.panel addchannel <link>`');
                if (res.reason === 'no_sessions') return reply('❌ No connected sessions right now — nothing to follow with. Wait for sessions to reconnect (check `.panel sessions`) then retry.');
                return reply(`📡 Channel(s) re-followed on *${res.ok}* session(s)${res.failed ? `, *${res.failed}* failed` : ''}.`);
            } catch (e) { return reply(`❌ ${e.message}`); }
        }
        // ── REACT ON CHANNEL POST — every paired session reacts at once ───
        if (sub === 'reactpost' || sub === 'reactchannel') {
            const rest = args.slice(1);
            // Everything that isn't the link is treated as an emoji list —
            // e.g. `.panel reactpost <link> ❤️ 🔥 😂` makes different
            // sessions react with different emojis (cycled across sessions).
            // A single trailing emoji still works exactly like before.
            const linkParts = [];
            let emojiText = '';
            for (const tok of rest) {
                if (/^https?:\/\//i.test(tok) || /whatsapp\.com/i.test(tok)) linkParts.push(tok);
                else emojiText += tok;
            }
            const postLink = linkParts.join(' ').trim();
            // Split on grapheme boundaries so multi-emoji reactions work whether
            // the user typed "🔥 ❤️ 😂" (spaced) or "🔥❤️😂" (pasted together) —
            // splitting on whitespace/chars alone breaks multi-codepoint emoji
            // (e.g. ❤️ = heart + variation selector) into unusable reactions.
            let emojis = [];
            if (emojiText) {
                if (typeof Intl !== 'undefined' && Intl.Segmenter) {
                    const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
                    emojis = Array.from(seg.segment(emojiText), s => s.segment).filter(Boolean);
                } else {
                    emojis = Array.from(emojiText).filter(Boolean);
                }
            }
            if (!emojis.length) emojis = ['❤️'];
            if (!postLink) return reply('❌ Usage: `.panel reactpost <channel post link> [emoji1] [emoji2] ...`\n\ne.g. `.panel reactpost https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f/103 🔥 ❤️ 😂`\n\nGive one emoji and every session reacts the same; give several and sessions cycle through them so reactions look mixed/natural.');
            if (typeof global.reactPostOnAll !== 'function') return reply('❌ Channel service not ready.');
            try {
                await reply(`⏳ Reacting ${emojis.join(' ')} on that post from every paired session...`);
                const res = await global.reactPostOnAll(postLink, emojis);
                return reply(`✅ Reacted on *${res.ok}* session(s)${res.failed ? `, *${res.failed}* failed` : ''}.${res.errors.length ? `\n\n⚠️ ${[...new Set(res.errors)].slice(0,3).join('\n')}` : ''}`);
            } catch (e) { return reply(`❌ ${e.message}`); }
        }

        // ── STATUS BROADCAST (one status → ALL paired sessions) ───────────
        if (sub === 'poststatus' || sub === 'poststatusimg') {
            if (sub === 'poststatus') {
                const text = args.slice(1).join(' ').trim();
                if (!text) return reply('❌ Usage: `.panel poststatus <text>`');
                if (typeof global.postStatusToAll !== 'function') return reply('❌ Status broadcast service not ready.');
                await reply('📤 Posting status on all paired sessions...');
                const res = await global.postStatusToAll({ text });
                return reply(`✅ Status posted on *${res.ok}* session(s)${res.failed ? `, *${res.failed}* failed` : ''}.${res.errors.length ? `\n\n⚠️ ${res.errors.slice(0,3).join('\n')}` : ''}`);
            } else {
                try {
                    const buf = await downloadImageBuffer(message);
                    if (typeof global.postStatusToAll !== 'function') return reply('❌ Status broadcast service not ready.');
                    await reply('📤 Posting status image on all paired sessions...');
                    const caption = args.slice(1).join(' ').trim() || undefined;
                    const res = await global.postStatusToAll(caption ? { image: buf, caption } : { image: buf });
                    return reply(`✅ Status image posted on *${res.ok}* session(s)${res.failed ? `, *${res.failed}* failed` : ''}.`);
                } catch (e) { return reply(`❌ ${e.message}`); }
            }
        }

        return reply(panelMenu());
    }
};
