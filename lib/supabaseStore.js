/**
 * REDXBOT302 — Supabase Session & Settings Store
 * Persists sessions and bot config across restarts
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');

// ✅ FIX: the project's .env.example set SUPABASE_ANON_KEY / SUPABASE_SERVICE_KEY
// but this file only read SUPABASE_KEY → isEnabled() was always false and
// sessions were never backed up. Accept every common key name now.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY
  || process.env.SUPABASE_ANON_KEY
  || process.env.SUPABASE_SERVICE_KEY
  || process.env.SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || '';

let supabase = null;

function getClient() {
    if (!supabase && SUPABASE_URL && SUPABASE_KEY) {
        try {
            // ✅ FIX: "[SUPABASE] Init error: Node.js 20 detected without
            // native WebSocket support" spammed the log on every single
            // realtime call because supabase-js's realtime client had no
            // WebSocket implementation to use on Node < 22. We don't
            // actually use realtime subscriptions here (just REST calls),
            // but the client still initializes the realtime sub-client
            // eagerly, so it always warned. Passing the `ws` package as
            // the transport (as the error itself suggests) fixes it.
            let wsTransport;
            try { wsTransport = require('ws'); } catch { /* not installed */ }
            supabase = createClient(SUPABASE_URL, SUPABASE_KEY, wsTransport ? {
                realtime: { transport: wsTransport }
            } : undefined);
            console.log('[SUPABASE] Client initialized');
        } catch (e) {
            console.error('[SUPABASE] Init error:', e.message);
        }
    }
    return supabase;
}

const isEnabled = () => !!(SUPABASE_URL && SUPABASE_KEY);

/**
 * Save a session (key-value as JSON)
 */
async function saveSession(sessionId, data) {
    const db = getClient();
    if (!db) return false;
    try {
        const { error } = await db.from('bot_sessions').upsert({
            session_id: sessionId,
            data: JSON.stringify(data),
            updated_at: new Date().toISOString()
        }, { onConflict: 'session_id' });
        if (error) { console.error('[SUPABASE] saveSession error:', error.message); return false; }
        return true;
    } catch (e) {
        console.error('[SUPABASE] saveSession exception:', e.message);
        return false;
    }
}

/**
 * Load a session by ID
 */
async function loadSession(sessionId) {
    const db = getClient();
    if (!db) return null;
    try {
        const { data, error } = await db.from('bot_sessions')
            .select('data').eq('session_id', sessionId).single();
        if (error || !data) return null;
        return JSON.parse(data.data);
    } catch (e) {
        console.error('[SUPABASE] loadSession exception:', e.message);
        return null;
    }
}

/**
 * List all session IDs
 */
async function listSessions() {
    const db = getClient();
    if (!db) return [];
    try {
        const { data, error } = await db.from('bot_sessions').select('session_id');
        if (error || !data) return [];
        return data.map(r => r.session_id);
    } catch (e) {
        return [];
    }
}

/**
 * Delete a session
 */
async function deleteSession(sessionId) {
    const db = getClient();
    if (!db) return false;
    try {
        const { error } = await db.from('bot_sessions').delete().eq('session_id', sessionId);
        return !error;
    } catch (e) {
        return false;
    }
}

/**
 * Save a bot setting (namespace + key)
 */
async function saveSetting(namespace, key, value) {
    const db = getClient();
    if (!db) return false;
    try {
        const { error } = await db.from('bot_settings').upsert({
            namespace,
            key,
            value: JSON.stringify(value),
            updated_at: new Date().toISOString()
        }, { onConflict: 'namespace,key' });
        if (error) { console.error('[SUPABASE] saveSetting error:', error.message); return false; }
        return true;
    } catch (e) {
        console.error('[SUPABASE] saveSetting exception:', e.message);
        return false;
    }
}

/**
 * Load a bot setting
 */
async function getSetting(namespace, key) {
    const db = getClient();
    if (!db) return null;
    try {
        const { data, error } = await db.from('bot_settings')
            .select('value').eq('namespace', namespace).eq('key', key).single();
        if (error || !data) return null;
        return JSON.parse(data.value);
    } catch (e) {
        return null;
    }
}

/**
 * Initialize Supabase tables (idempotent)
 * Call once on startup
 */
async function initTables() {
    const db = getClient();
    if (!db) return;
    // ✅ FIX: supabase-js query/rpc builders are "thenable" (implement .then)
    // but are NOT real Promise instances, so calling .catch(...) directly on
    // them throws "db.rpc(...).catch is not a function". Each call now
    // resolves to a {data,error} result (never throws) and errors are
    // checked explicitly instead of chaining .catch().
    try {
        // bot_sessions table
        const r1 = await db.rpc('create_table_if_not_exists', {
            table_name: 'bot_sessions',
            columns: `
                session_id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            `
        });
        if (r1?.error) console.warn('[SUPABASE] create bot_sessions:', r1.error.message);

        // bot_settings table
        const r2 = await db.rpc('create_table_if_not_exists', {
            table_name: 'bot_settings',
            columns: `
                namespace TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                PRIMARY KEY (namespace, key)
            `
        });
        if (r2?.error) console.warn('[SUPABASE] create bot_settings:', r2.error.message);

        // Try direct upsert to verify connection
        const r3 = await db.from('bot_sessions').select('session_id').limit(1);
        if (r3?.error) throw new Error(r3.error.message);
        console.log('[SUPABASE] Tables verified/connected ✅');
    } catch (e) {
        console.error('[SUPABASE] initTables error:', e.message);
    }
}

module.exports = {
    isEnabled,
    saveSession,
    loadSession,
    listSessions,
    deleteSession,
    saveSetting,
    getSetting,
    initTables,
};
