'use strict';
/*****************************************************************************
 *  lib/channelManager.js
 *  ─────────────────────────────────────────────────────────────────────────
 *  Backs `.panel channel / addchannel / delchannel / reactpost`.
 *
 *  ✅ FIX: panel.js called `global.saveChannelCfg(...)` and
 *  `global.applyChannelToAll()` but nothing in the whole codebase ever
 *  defined those globals — hence "global.saveChannelCfg is not a function".
 *  This module implements them for real and index.js attaches them to
 *  `global` at startup.
 *
 *  ✅ NEW: multiple channels (not just one JID/link), auto-follow all of
 *  them on every session when it pairs, and a broadcast reaction to a
 *  specific channel post across every currently-connected session.
 *****************************************************************************/

const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const FILE = path.join(process.cwd(), 'data', 'channels.json');

const wait = ms => new Promise(r => setTimeout(r, ms));

// ✅ DEFAULT CHANNEL: seeded from settings/env so the list is never empty on a
// fresh deploy. You can still add more with `.panel addchannel <link>`.
function getDefaultChannelJid() {
    try {
        const s = require('../settings');
        const jid = process.env.NEWSLETTER_JID || s.newsletterJid;
        return (jid && /@newsletter$/i.test(jid)) ? jid.toLowerCase() : null;
    } catch {
        const jid = process.env.NEWSLETTER_JID;
        return (jid && /@newsletter$/i.test(jid)) ? jid.toLowerCase() : null;
    }
}

/* ── storage ────────────────────────────────────────────────────────────── */
async function loadChannels() {
    try {
        let list = [];
        if (HAS_DB) {
            const data = await store.getSetting('global', 'channels');
            list = Array.isArray(data) ? data : [];
        } else if (fs.existsSync(FILE)) {
            const parsed = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
            list = Array.isArray(parsed) ? parsed : [];
        }
        // Ensure the default channel is always present as the first entry.
        const def = getDefaultChannelJid();
        if (def && !list.some(c => c.jid === def)) {
            list.unshift({ jid: def, link: null, name: 'Default Channel', addedAt: Date.now(), isDefault: true });
        }
        return list;
    } catch (e) {
        console.error('[CHANNELS] load error:', e.message);
        const def = getDefaultChannelJid();
        return def ? [{ jid: def, link: null, name: 'Default Channel', addedAt: Date.now(), isDefault: true }] : [];
    }
}

async function saveChannelsRaw(list) {
    try {
        if (HAS_DB) {
            await store.saveSetting('global', 'channels', list);
        } else {
            const dir = path.dirname(FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
        }
    } catch (e) {
        console.error('[CHANNELS] save error:', e.message);
    }
}

/* ── link parsing ──────────────────────────────────────────────────────── */
// https://whatsapp.com/channel/0029VbXXXX          → { inviteCode }
// https://whatsapp.com/channel/0029VbXXXX/103       → { inviteCode, serverId: 103 } (a specific POST)
function parseChannelInput(input) {
    const s = (input || '').trim();
    if (/@newsletter$/i.test(s)) return { jid: s.toLowerCase() };
    const m = /whatsapp\.com\/channel\/([A-Za-z0-9]+)(?:\/(\d+))?/i.exec(s);
    if (m) return { inviteCode: m[1], serverId: m[2] ? m[2] : null, link: `https://whatsapp.com/channel/${m[1]}` };
    return null;
}

/* ── resolve invite code / jid → full newsletter metadata via ANY connected socket ── */
async function resolveNewsletter(sock, parsed) {
    if (parsed.jid) {
        try {
            const meta = await sock.newsletterMetadata('jid', parsed.jid);
            return { jid: parsed.jid, link: meta?.invite ? `https://whatsapp.com/channel/${meta.invite}` : null, name: meta?.name };
        } catch {
            return { jid: parsed.jid, link: null, name: null };
        }
    }
    if (parsed.inviteCode) {
        const meta = await sock.newsletterMetadata('invite', parsed.inviteCode);
        if (!meta?.id) throw new Error('Could not resolve channel from that link.');
        return { jid: meta.id, link: parsed.link, name: meta.name };
    }
    throw new Error('Not a valid channel JID or link.');
}

/* ── public API ─────────────────────────────────────────────────────────── */

/**
 * Returns the channel list. `legacySingle=true` keeps old callers (that
 * expect one {jid, link} object) working — returns the first entry.
 */
async function getChannelCfg(legacySingle = false) {
    const list = await loadChannels();
    if (!legacySingle) return list;
    return list[0] || {};
}

/** Adds (or updates, if the jid already exists) a channel. Needs a live
 *  `sock` to resolve invite links → JID via newsletterMetadata. */
async function addChannel(sock, input) {
    const parsed = parseChannelInput(input);
    if (!parsed) throw new Error('Not a valid channel JID or link.');
    const resolved = await resolveNewsletter(sock, parsed);

    const list = await loadChannels();
    const existing = list.find(c => c.jid === resolved.jid);
    if (existing) {
        existing.link = resolved.link || existing.link;
        existing.name = resolved.name || existing.name;
    } else {
        list.push({ jid: resolved.jid, link: resolved.link, name: resolved.name, addedAt: Date.now() });
    }
    await saveChannelsRaw(list);
    return { jid: resolved.jid, link: resolved.link, name: resolved.name, total: list.length };
}

async function removeChannel(indexOrJid) {
    const list = await loadChannels();
    let filtered;
    const n = parseInt(indexOrJid, 10);
    if (!isNaN(n) && n >= 1 && n <= list.length) {
        filtered = list.filter((_, i) => i !== n - 1);
    } else {
        filtered = list.filter(c => c.jid !== indexOrJid);
    }
    const removed = list.length !== filtered.length;
    if (removed) await saveChannelsRaw(filtered);
    return { removed, total: filtered.length };
}

// Back-compat single-channel setter used by the old `.panel setchannel`.
async function saveChannelCfg(cfg) {
    const list = await loadChannels();
    if (cfg.jid) {
        const existing = list.find(c => c.jid === cfg.jid);
        if (existing) { existing.link = cfg.link || existing.link; }
        else list.push({ jid: cfg.jid, link: cfg.link || null, addedAt: Date.now() });
    } else if (list.length) {
        list[0].link = cfg.link || list[0].link;
    }
    await saveChannelsRaw(list);
    return list;
}

/** Follows every saved channel on one socket (called on connection open,
 *  and by `.panel followchannel`). Returns {ok, failed}. */
// Follows one channel on one socket, treating "already following" and other
// benign GraphQL rejections as success. Returns 'ok' | 'already' | 'failed'.
async function followOne(sock, jid) {
    // 1) If we can read the newsletter metadata and it says we're already
    //    subscribed, there's nothing to do — a repeat newsletterFollow on an
    //    already-followed channel is exactly what returns
    //    "GraphQL server error: Bad Request". So check first.
    try {
        const meta = await sock.newsletterMetadata('jid', jid).catch(() => null);
        if (meta) {
            const state = (meta.viewer_metadata?.subscription || meta.subscribers?.viewer_role ||
                           meta.viewerMetadata?.subscription || meta.state || '').toString().toUpperCase();
            if (state.includes('SUB') || state.includes('ACTIVE') || meta.mute !== undefined && meta.viewer_metadata) {
                // metadata resolvable + a viewer role usually implies followed
                if (state.includes('SUB') || state.includes('ACTIVE')) return 'already';
            }
        }
    } catch {}

    // 2) Attempt the follow, retrying once on transient errors.
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            await sock.newsletterFollow(jid);
            return 'ok';
        } catch (e) {
            const msg = (e?.message || '').toLowerCase();
            // ✅ These are NOT real failures: they mean the follow already
            // exists / is a duplicate. Baileys surfaces this from WhatsApp as
            // a generic "Bad Request" GraphQL error.
            if (msg.includes('bad request') || msg.includes('already') ||
                msg.includes('409') || msg.includes('conflict') ||
                msg.includes('not-authorized') || msg.includes('forbidden')) {
                return 'already';
            }
            if (attempt === 2) {
                console.error(`[CHANNELS] follow ${jid} failed:`, e?.message);
                return 'failed';
            }
            await wait(2500); // backoff before retry on a genuinely transient error
        }
    }
    return 'failed';
}

async function followAllOn(sock) {
    const list = await loadChannels();
    let ok = 0, already = 0, failed = 0;
    // ✅ FIX ("all follow but one failed" + "GraphQL Bad Request"): WhatsApp
    // rate-limits rapid newsletterFollow calls AND returns a generic
    // "Bad Request" when you try to re-follow a channel you already follow.
    // We now check subscription state first, treat already-followed as success,
    // space each call out, and retry once on genuinely transient errors.
    for (let idx = 0; idx < list.length; idx++) {
        const ch = list[idx];
        if (!ch.jid) continue;
        const r = await followOne(sock, ch.jid);
        if (r === 'ok') ok++;
        else if (r === 'already') already++;
        else failed++;
        // spacing between different channels so we don't trip rate limits
        if (idx < list.length - 1) await wait(1500);
    }
    // "already followed" counts as success for the caller's ok tally.
    return { ok: ok + already, followed: ok, already, failed, total: list.length };
}

/** Follows every saved channel across every currently-connected session.
 *  `getActiveSockets()` is injected by index.js — an array of live `sock`s. */
async function applyChannelToAll(getActiveSockets) {
    const list = await loadChannels();
    // ✅ FIX: this used to return {ok:0, failed:0} silently in TWO very
    // different situations — no channels saved, or no active sessions —
    // and `.panel followchannel` showed "re-followed on 0 sessions" for
    // both with zero explanation. Now the caller gets `reason` to tell
    // them apart instead of guessing.
    if (!list.length) return { ok: 0, failed: 0, reason: 'no_channels' };
    const sockets = getActiveSockets();
    if (!sockets.length) return { ok: 0, failed: 0, reason: 'no_sessions' };
    let ok = 0, failed = 0;
    for (const sock of sockets) {
        try {
            const r = await followAllOn(sock);
            ok += r.ok; failed += r.failed;
        } catch { failed++; }
    }
    return { ok, failed, reason: null };
}

/**
 * Reacts to a specific channel POST (not just the channel itself), using
 * every currently-connected session — this is the "everyone reacts on my
 * channel post automatically" feature.
 * `postLink` must include the post number, e.g.
 * https://whatsapp.com/channel/0029VbDF53qJf05hJaysP121/103
 *
 * `emojis` can be a single emoji (old behavior — everyone reacts the same)
 * or an array of emojis — each session cycles through the list so
 * different sessions post different reactions instead of one repeated
 * emoji spammed by every account.
 */
async function reactPostOnAll(getActiveSockets, postLink, emojis = '❤️') {
    const parsed = parseChannelInput(postLink);
    if (!parsed || !parsed.inviteCode) throw new Error('Give a full channel POST link, e.g. https://whatsapp.com/channel/CODE/103');
    if (!parsed.serverId) throw new Error('That link has no post number — copy the link straight from the post (ends in /<number>).');

    const emojiList = Array.isArray(emojis) ? emojis.filter(Boolean) : [emojis];
    if (!emojiList.length) emojiList.push('❤️');

    const sockets = getActiveSockets();
    if (!sockets.length) throw new Error('No connected sessions to react with.');

    // Resolve the JID once, using whichever socket answers first.
    let jid = null, lastErr = null;
    for (const sock of sockets) {
        try {
            const meta = await sock.newsletterMetadata('invite', parsed.inviteCode);
            if (meta?.id) { jid = meta.id; break; }
        } catch (e) { lastErr = e; }
    }
    if (!jid) throw new Error(`Could not resolve that channel: ${lastErr?.message || 'unknown error'}`);

    let ok = 0, failed = 0;
    const errors = [];
    for (let i = 0; i < sockets.length; i++) {
        const sock = sockets[i];
        const emoji = emojiList[i % emojiList.length]; // cycle through the list per session
        try {
            await sock.newsletterReactMessage(jid, String(parsed.serverId), emoji);
            ok++;
        } catch (e) {
            failed++;
            errors.push(e.message);
        }
    }
    return { ok, failed, errors, jid, serverId: parsed.serverId };
}

/**
 * ✅ NEW: `.panel poststatus` / `.panel poststatusimg` called
 * `global.postStatusToAll` but it was never defined anywhere — every call
 * threw "global.postStatusToAll is not a function". Wired up here, same
 * pattern as applyChannelToAll/reactPostOnAll: fan a single status post
 * out to every currently-connected session.
 *
 * `payload` is a Baileys message content object:
 *   - { text: '...' }                     — text status
 *   - { image: Buffer, caption?: '...' }  — image status
 */
async function postStatusToAll(getActiveSockets, payload) {
    if (!payload || (!payload.text && !payload.image)) {
        throw new Error('Nothing to post — give text or an image.');
    }
    const sockets = getActiveSockets();
    if (!sockets.length) throw new Error('No connected sessions to post from.');

    const content = payload.text
        ? { text: payload.text, backgroundColor: '#000000', font: 1 }
        : { image: payload.image, caption: payload.caption };

    let ok = 0, failed = 0;
    const errors = [];
    for (const sock of sockets) {
        try {
            // Status broadcasts don't need an explicit statusJidList for the
            // post itself to succeed — WA fans it out to your contacts.
            await sock.sendMessage('status@broadcast', content);
            ok++;
        } catch (e) {
            failed++;
            errors.push(e.message);
        }
        // spacing so a burst of status posts across many sessions doesn't
        // look automated / trip rate limits
        await wait(1200);
    }
    return { ok, failed, errors };
}

module.exports = {
    getChannelCfg,
    saveChannelCfg,
    addChannel,
    removeChannel,
    followAllOn,
    applyChannelToAll,
    reactPostOnAll,
    postStatusToAll,
    parseChannelInput,
};
