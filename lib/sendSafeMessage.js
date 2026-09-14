/*****************************************************************************
 *  lib/sendSafeMessage.js — REDXBOT302 v7.1 DM-FIX
 *  Owner: JUNAID-MD↣³⁰²
 *
 *  KEY FIX: @lid JIDs are NO LONGER DROPPED.
 *    WhatsApp servers can route replies to @lid JIDs — that's how the
 *    message arrived. Dropping them silently was the root cause of all
 *    "bot not responding in DMs" issues.
 *
 *    Resolution priority:
 *      1. Check LID cache (instant)
 *      2. Try sock.onWhatsApp (async, rare)
 *      3. SEND DIRECTLY TO @lid AS FALLBACK — WhatsApp routes it
 *
 *  Features:
 *    • Auto JID normalisation  (strips device suffix, resolves LID)
 *    • Retry queue             (up to 3 retries, exponential back-off)
 *    • Rate limit protection   (100 msg/min bucket per destination JID)
 *    • Delivery verification   (warn on ack failure, no crash)
 *****************************************************************************/
'use strict';

const { cleanJid, samePhone, lidToPhone, toPhoneJid, resolveLidNum } = require('./senderResolver');

/* ── Rate limit bucket: max 100 messages/min per destination ── */
const _rateMap   = new Map();
const RATE_LIMIT = 100;
const RATE_WIN   = 60_000;

function _checkRate(jid) {
    const now = Date.now();
    const bucket = _rateMap.get(jid) || { count: 0, windowStart: now };
    if (now - bucket.windowStart > RATE_WIN) { bucket.count = 0; bucket.windowStart = now; }
    bucket.count++;
    _rateMap.set(jid, bucket);
    return bucket.count <= RATE_LIMIT;
}

/**
 * Normalise JID for sending.
 * FIXED: @lid JIDs are returned as-is (not null) so WhatsApp can route them.
 */
function _normaliseJid(jid) {
    if (!jid) return null;
    if (jid.includes('@g.us')) {
        // Strip any device suffix (":N") that appears BEFORE the @g.us part,
        // without re-adding @g.us if it's already present. Group JIDs look
        // like "1234-5678@g.us" or occasionally "1234-5678:5@g.us" — never
        // assume a colon exists.
        const atIdx = jid.indexOf('@g.us');
        const base  = jid.slice(0, atIdx).split(':')[0];
        return `${base}@g.us`;
    }
    if (jid.includes('@newsletter'))     return jid;
    if (jid === 'status@broadcast')      return jid;
    if (jid.includes('@s.whatsapp.net')) return toPhoneJid(jid) || jid;
    // FIX: Return @lid as-is — Baileys/WA servers can route it
    if (jid.includes('@lid'))            return jid;
    return toPhoneJid(jid) || jid;
}

const _sleep = (ms) => new Promise(r => setTimeout(r, ms));
const MAX_RETRIES = 3;
const BASE_DELAY  = 1500;

async function _sendWithRetry(sock, normJid, content, options, attempt = 0) {
    try {
        await sock.sendMessage(normJid, content, options || {});
    } catch (err) {
        const isRateLimit =
            err?.message?.includes('rate-overlimit') ||
            err?.data === 429 || err?.output?.statusCode === 429;

        const isRetryable = isRateLimit ||
            err?.message?.includes('Connection Closed') ||
            err?.message?.includes('timed out')         ||
            err?.output?.statusCode === 428;

        if (isRetryable && attempt < MAX_RETRIES) {
            // 🩹 FIX: rate-overlimit (429) was NOT in the retryable list before,
            // so any send hitting WA's rate limiter failed instantly with 0
            // retries (seen in logs: "Failed after 0 retries... rate-overlimit").
            // It needs a longer cool-down than a dropped connection, not the
            // same fast exponential curve.
            const wait = isRateLimit
                ? 4000 * (attempt + 1)
                : BASE_DELAY * Math.pow(2, attempt);
            console.warn(`[sendSafeMessage] Retry ${attempt + 1}/${MAX_RETRIES} in ${wait}ms for ${normJid} (${isRateLimit ? 'rate-overlimit' : 'transient'})`);
            await _sleep(wait);
            return _sendWithRetry(sock, normJid, content, options, attempt + 1);
        }

        // If @lid send failed, it means the JID truly can't be reached — log only
        if (normJid.includes('@lid')) {
            console.warn(`[sendSafeMessage] @lid send failed for ${normJid} — contact may be offline or JID stale`);
            return;
        }

        console.error(`[sendSafeMessage] Failed after ${attempt} retries to ${normJid}: ${err.message}`);
    }
}

/**
 * sendSafeMessage(sock, jid, content, options?)
 */
async function sendSafeMessage(sock, jid, content, options = null) {
    if (!sock || !jid || !content) return;

    let workingJid = jid;

    /* ── Async LID resolution ─────────────────────────────────────────────
       Priority:
         1. Cache hit (instant)
         2. Full async resolve (sock.onWhatsApp etc.)
         3. FALLBACK: send directly to @lid — DO NOT DROP
    ────────────────────────────────────────────────────────────────────── */
    if (jid.includes('@lid')) {
        const lidNum = cleanJid(jid);
        if (lidToPhone.has(lidNum)) {
            workingJid = lidToPhone.get(lidNum);
            console.log(`[sendSafeMessage] ✅ Cache-resolved @lid ${jid} → ${workingJid}`);
        } else {
            const resolved = await resolveLidNum(lidNum, sock, null);
            if (resolved) {
                workingJid = resolved;
                console.log(`[sendSafeMessage] ✅ Late-resolved @lid ${jid} → ${resolved}`);
            } else {
                // FIX: Do NOT drop — send directly to @lid
                // WA routes messages to @lid the same way it sent them to us
                console.log(`[sendSafeMessage] 📨 Sending directly to @lid ${jid} (unresolved — WA will route)`);
                workingJid = jid; // keep as @lid
            }
        }
    }

    const normJid = _normaliseJid(workingJid);
    if (!normJid) {
        console.error('[sendSafeMessage] Cannot normalise JID:', workingJid, '(original:', jid, ')');
        return;
    }

    if (!_checkRate(normJid)) {
        console.warn(`[sendSafeMessage] Rate limit hit for ${normJid} — dropping`);
        return;
    }

    await _sendWithRetry(sock, normJid, content, options);
}

module.exports = { sendSafeMessage };
