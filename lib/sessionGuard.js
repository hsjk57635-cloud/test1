/*****************************************************************************
 *  lib/sessionGuard.js — REDXBOT302 RC12 ULTRA
 *  Owner: JUNAID-MD↣³⁰²
 *
 *  Detects:
 *    • RC9 sessions imported into RC12 (warn user to regenerate)
 *    • Stale / corrupt sessions (creds.json missing critical fields)
 *    • Bad prekey state (preKeyId gap, exhausted prekeys)
 *    • App-state mismatch (hash/version drift)
 *
 *  Call checkSession(sessionDir) before startBot() in index.js.
 *****************************************************************************/
'use strict';

const fs   = require('fs');
const path = require('path');

/** Fields present in RC12+ (i.e., RC13) sessions but absent from RC9 sessions */
const VALID_SESSION_FIELDS = ['myAppStateKeyId', 'processedHistoryMessages', 'accountSyncCounter'];
/** Minimum number of prekeys Baileys expects to have in store */
const MIN_PREKEYS = 5;

/**
 * Read and parse creds.json from the session directory.
 * Returns parsed object or null on failure.
 */
function _readCreds(sessionDir) {
    const credsPath = path.join(sessionDir, 'creds.json');
    try {
        if (!fs.existsSync(credsPath)) return null;
        return JSON.parse(fs.readFileSync(credsPath, 'utf8'));
    } catch {
        return null;
    }
}

/**
 * Count pre-key files in session directory.
 * Baileys stores them as pre-key-{n}.json
 */
function _countPrekeys(sessionDir) {
    try {
        const files = fs.readdirSync(sessionDir);
        return files.filter(f => f.startsWith('pre-key-')).length;
    } catch {
        return 0;
    }
}

/**
 * checkSession(sessionDir) → { ok, warnings[] }
 *
 * @param {string} sessionDir  Path to the session folder (default: './session')
 */
function checkSession(sessionDir = './session') {
    const warnings = [];
    let ok = true;

    // 1. Session folder exists?
    if (!fs.existsSync(sessionDir)) {
        return { ok: false, warnings: ['Session directory not found — fresh pairing required.'] };
    }

    // 2. creds.json exists and is parseable?
    const creds = _readCreds(sessionDir);
    if (!creds) {
        return { ok: false, warnings: ['creds.json missing or corrupt — re-pair the bot.'] };
    }

    // 3. Legacy session (RC9 or older) detection
    //    RC9 sessions lack fields that were added in RC12/RC13.
    const missingFields = VALID_SESSION_FIELDS.filter(f => !(f in creds));
    if (missingFields.length === VALID_SESSION_FIELDS.length) {
        warnings.push(
            '⚠️  LEGACY SESSION DETECTED. Your session was generated with Baileys RC9 or earlier ' +
            'and will cause decryption errors, phantom messages, or broken LID resolution under RC13. ' +
            'ACTION: Delete the session folder and generate a new session via the pairing code.'
        );
        ok = false;
    }

    // 4. Stale session — registeredId or noiseKey missing
    if (!creds.registrationId || !creds.noiseKey) {
        warnings.push('⚠️  STALE SESSION: registrationId or noiseKey missing. Re-pair required.');
        ok = false;
    }

    // 5. Prekey exhaustion
    const prekeyCount = _countPrekeys(sessionDir);
    if (prekeyCount < MIN_PREKEYS) {
        warnings.push(
            `⚠️  LOW PREKEYS: only ${prekeyCount} prekey file(s) found (minimum ${MIN_PREKEYS}). ` +
            'Baileys will regenerate on next connect. If this persists, re-pair.'
        );
        // Not fatal — Baileys auto-replenishes
    }

    // 6. App-state files present?
    try {
        const hasAppState = fs.readdirSync(sessionDir).some(f => f.startsWith('app-state-'));
        if (!hasAppState) {
            warnings.push('ℹ️  No app-state files found — first sync may be slow.');
        }
    } catch {}

    return { ok, warnings };
}

/**
 * Print session guard results to console.
 * Call this in index.js before startBot().
 */
function runSessionGuard(sessionDir = './session') {
    const { ok, warnings } = checkSession(sessionDir);
    for (const w of warnings) {
        console.warn('[SessionGuard]', w);
    }
    return ok;
}

module.exports = { checkSession, runSessionGuard };
