/*****************************************************************************
 *  lib/senderResolver.js — REDXBOT302 v7.1 DM-FIX
 *  Owner: JUNAID-MD↣³⁰²
 *
 *  DM FIX: When a DM arrives with @lid remoteJid (Baileys RC12+),
 *    we now KEEP the @lid as chatId if we can't resolve it.
 *    sendSafeMessage will send directly to @lid — WA routes it correctly.
 *
 *  LID Cache: bidirectional, event-driven, persisted in memory.
 *  Resolution priority: cache → contacts → groups → decodeJid → onWhatsApp
 *****************************************************************************/
'use strict';

const settings = require('../settings');

/* ── JID utilities ──────────────────────────────────────────────────────── */

function cleanJid(jid) {
    if (!jid) return '';
    return String(jid).split(':')[0].split('@')[0].replace(/\D/g, '');
}

function toPhoneJid(jid) {
    const num = cleanJid(jid);
    return num ? `${num}@s.whatsapp.net` : null;
}

function samePhone(a, b) {
    if (!a || !b) return false;
    const tail = (s) => {
        const d = String(s).replace(/\D/g, '');
        return d.length > 10 ? d.slice(-10) : d;
    };
    return tail(a) === tail(b);
}

function isLidJid(jid) {
    if (!jid) return false;
    if (String(jid).includes('@lid')) return true;
    const num = cleanJid(jid);
    return num.length > 13 && !String(jid).includes('@s.whatsapp.net');
}

/* ── Bidirectional LID cache ────────────────────────────────────────────── */
const lidToPhone = new Map();  // lidNum  → phone@s.whatsapp.net
const phoneToLid = new Map();  // phoneNum → lidNum

function cacheLidMapping(lid, phone) {
    const lidNum   = cleanJid(lid);
    const phoneNum = cleanJid(phone);
    if (!lidNum || !phoneNum) return;
    const phoneJid = `${phoneNum}@s.whatsapp.net`;
    if (!lidToPhone.has(lidNum)) lidToPhone.set(lidNum, phoneJid);
    if (!phoneToLid.has(phoneNum)) phoneToLid.set(phoneNum, lidNum);
}

async function resolveLidNum(lidNum, sock, chatId) {
    if (lidToPhone.has(lidNum)) return lidToPhone.get(lidNum);

    // sock.store.contacts
    if (sock?.store?.contacts) {
        for (const [jid, c] of Object.entries(sock.store.contacts)) {
            if (!jid.includes('@s.whatsapp.net')) continue;
            const cl = cleanJid(c?.lid || '');
            if (cl === lidNum) {
                const phoneJid = toPhoneJid(jid);
                if (phoneJid) { cacheLidMapping(lidNum, phoneJid); return phoneJid; }
            }
        }
    }

    // Group metadata (groups only)
    if (chatId?.endsWith('@g.us') && sock?.groupMetadata) {
        try {
            const meta = await sock.groupMetadata(chatId);
            for (const p of (meta?.participants || [])) {
                const cl = cleanJid(p?.lid || '');
                if (cl === lidNum) {
                    const phoneJid = toPhoneJid(p?.id || '');
                    if (phoneJid) { cacheLidMapping(lidNum, phoneJid); return phoneJid; }
                }
            }
        } catch {}
    }

    // decodeJid
    if (sock?.decodeJid) {
        try {
            const decoded = sock.decodeJid(`${lidNum}@lid`);
            if (decoded && decoded !== `${lidNum}@lid`) {
                const phoneJid = toPhoneJid(decoded);
                if (phoneJid) { cacheLidMapping(lidNum, phoneJid); return phoneJid; }
            }
        } catch {}
    }

    // onWhatsApp (network call, last resort)
    if (sock?.onWhatsApp) {
        try {
            const result = await sock.onWhatsApp(`${lidNum}@s.whatsapp.net`);
            if (result?.[0]?.jid) {
                const phoneJid = toPhoneJid(result[0].jid);
                if (phoneJid) { cacheLidMapping(lidNum, phoneJid); return phoneJid; }
            }
        } catch {}
    }

    return null;
}

/* ── Contact discovery ──────────────────────────────────────────────────── */
function learnContact(sock, rawJid, resolvedPhoneJid, pushName) {
    if (!sock?.store?.contacts) return;
    const target = resolvedPhoneJid || rawJid;
    if (!target) return;
    const existing = sock.store.contacts[target] || {};
    sock.store.contacts[target] = {
        ...existing,
        id: target,
        ...(pushName ? { notify: pushName, name: pushName } : {}),
    };
    if (rawJid && rawJid !== target && rawJid.includes('@lid')) {
        const lidNum = cleanJid(rawJid);
        if (lidNum) cacheLidMapping(lidNum, target);
    }
}

/* ── Core resolver ──────────────────────────────────────────────────────── */
async function resolveSender(message, sock, chatId) {
    const _fromMe = message?.key?.fromMe === true;

    if (_fromMe) {
        const ownerNum = (settings.ownerNumber || '').replace(/\D/g, '');
        const jid = ownerNum
            ? `${ownerNum}@s.whatsapp.net`
            : (sock?.user?.id || message?.key?.remoteJid || '');
        return jid;
    }

    const rawJid =
        message?.key?.participant ||
        message?.participant      ||
        message?.sender           ||
        message?.key?.remoteJid   ||
        '';

    if (!rawJid) return '';

    const rawNum = cleanJid(rawJid);

    // Cache hit
    if (lidToPhone.has(rawNum)) {
        const resolved = lidToPhone.get(rawNum);
        if (message?.pushName && sock) learnContact(sock, rawJid, resolved, message.pushName);
        return resolved;
    }

    // Normal phone JID
    if (!isLidJid(rawJid)) {
        const phoneJid = toPhoneJid(rawJid) || rawJid;
        if (message?.pushName && sock) learnContact(sock, rawJid, phoneJid, message.pushName);
        return phoneJid;
    }

    // LID — try to resolve
    const resolved = await resolveLidNum(rawNum, sock, chatId || message?.key?.remoteJid);

    // FIX: If LID still unresolved, keep as @lid JID (not a fake @s.whatsapp.net).
    // sendSafeMessage will send directly to @lid — WA can route it.
    const finalJid = resolved || `${rawNum}@lid`;
    if (message?.pushName && sock) learnContact(sock, rawJid, finalJid, message.pushName);
    return finalJid;
}

/* ── Event handlers ─────────────────────────────────────────────────────── */

function onContactsUpdate(contacts) {
    if (!Array.isArray(contacts)) return;
    for (const c of contacts) {
        const phone = c?.id;
        const lid   = c?.lid;
        if (phone && lid) {
            cacheLidMapping(cleanJid(lid), phone);
        }
    }
}

const onContactsUpsert = onContactsUpdate;

function onGroupsUpdate(groups) {
    if (!Array.isArray(groups)) return;
    for (const g of groups) {
        for (const p of (g?.participants || [])) {
            if (p?.id && p?.lid) cacheLidMapping(cleanJid(p.lid), p.id);
        }
    }
}

function onPresenceUpdate(update) {
    const jid = update?.id;
    if (jid && isLidJid(jid)) {
        const num = cleanJid(jid);
        if (lidToPhone.has(num)) return;
    }
}

/**
 * warmLidCache — called 3s after connection.open
 * Also registers own JID→LID if sock.user.lid exists (RC13+ feature)
 */
async function warmLidCache(sock) {
    if (!sock) return;
    const ownerPhone = (settings.ownerNumber || '').replace(/\D/g, '');
    let ownerFound = false;

    // Warm from contacts store
    if (sock.store?.contacts) {
        for (const [jid, c] of Object.entries(sock.store.contacts)) {
            const lid = c?.lid;
            if (!lid) continue;
            cacheLidMapping(cleanJid(lid), jid);
            if (ownerPhone && samePhone(cleanJid(jid), ownerPhone)) {
                console.log(`[senderResolver] ✅ Owner LID cached: ${cleanJid(lid)} → ${cleanJid(jid)}`);
                ownerFound = true;
            }
        }
    }

    // RC13+: sock.user may have .lid property for the bot itself
    if (sock?.user?.lid && sock?.user?.id) {
        cacheLidMapping(cleanJid(sock.user.lid), sock.user.id);
        console.log(`[senderResolver] ✅ Bot self LID cached: ${cleanJid(sock.user.lid)} → ${cleanJid(sock.user.id)}`);
    }

    if (!ownerFound && ownerPhone) {
        console.log('[senderResolver] ⚠️  Owner LID not in contacts yet — DMs will use @lid passthrough');
    }
}

/* ── Exports ────────────────────────────────────────────────────────────── */
module.exports = {
    resolveSender,
    cacheLidMapping,
    lidToPhone,
    phoneToLid,
    isLidJid,
    warmLidCache,
    resolveLidNum,
    cleanJid,
    toPhoneJid,
    samePhone,
    onContactsUpdate,
    onContactsUpsert,
    onGroupsUpdate,
    onPresenceUpdate,
};
