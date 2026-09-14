/**
 * lib/mongoSessionStore.js — Mongo-backed WhatsApp session (creds.json) store.
 *
 * ✅ FIX: MONGO_URL was already used everywhere for bot settings/chat data
 * (lib/lightweight_store.js) but NEVER for the actual WhatsApp auth creds —
 * only Supabase (lib/supabaseStore.js) persisted those. Anyone running with
 * only MONGO_URL configured (no Supabase) lost every paired session on every
 * Render free-tier restart/redeploy, which also made `.panel followchannel`
 * and `.panel sessions` look broken — there was nothing left to reconnect.
 * This mirrors supabaseStore.js's exact API so index.js can treat both the
 * same way.
 */

'use strict';

const mongoose = require('mongoose');

let MONGO_URL = process.env.MONGO_URL;
try { if (!MONGO_URL) MONGO_URL = require('../settings.js').mongoUrl; } catch {}

const isEnabled = () => !!MONGO_URL;

let SessionModel = null;
let connectPromise = null;

function getModel() {
    if (!isEnabled()) return null;
    if (SessionModel) return SessionModel;

    // Reuse the default mongoose connection — lightweight_store.js already
    // calls mongoose.connect(MONGO_URL) when MONGO_URL is set, and mongoose
    // only ever needs one active connection per URL. Calling connect() again
    // here is a harmless no-op if it's already connecting/connected.
    if (!connectPromise) {
        connectPromise = mongoose.connect(MONGO_URL, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 10000,
        }).catch(err => {
            console.error('[MONGO-SESSION] Connection error:', err?.message || err);
        });
    }

    const sessionSchema = new mongoose.Schema({
        number: { type: String, unique: true, required: true },
        creds:  { type: mongoose.Schema.Types.Mixed, required: true },
        updatedAt: { type: Date, default: Date.now },
    });

    SessionModel = mongoose.models.BotSession || mongoose.model('BotSession', sessionSchema);
    return SessionModel;
}

async function ready() {
    if (!isEnabled()) return false;
    getModel();
    if (connectPromise) await connectPromise.catch(() => {});
    return mongoose.connection.readyState === 1;
}

/** Save/replace one session's creds. */
async function saveSession(number, creds) {
    if (!(await ready())) return false;
    try {
        const Session = getModel();
        await Session.updateOne(
            { number },
            { number, creds, updatedAt: new Date() },
            { upsert: true }
        );
        return true;
    } catch (e) {
        console.error('[MONGO-SESSION] saveSession error:', e.message);
        return false;
    }
}

/** Load one session's creds, or null. */
async function loadSession(number) {
    if (!(await ready())) return null;
    try {
        const Session = getModel();
        const doc = await Session.findOne({ number }).lean();
        return doc?.creds || null;
    } catch (e) {
        console.error('[MONGO-SESSION] loadSession error:', e.message);
        return null;
    }
}

/** List every saved session's phone number. */
async function listSessions() {
    if (!(await ready())) return [];
    try {
        const Session = getModel();
        const docs = await Session.find({}, { number: 1 }).lean();
        return docs.map(d => d.number);
    } catch (e) {
        console.error('[MONGO-SESSION] listSessions error:', e.message);
        return [];
    }
}

/** Delete one saved session (used on logout/unpair). */
async function deleteSession(number) {
    if (!(await ready())) return false;
    try {
        const Session = getModel();
        await Session.deleteOne({ number });
        return true;
    } catch (e) {
        console.error('[MONGO-SESSION] deleteSession error:', e.message);
        return false;
    }
}

module.exports = { isEnabled, saveSession, loadSession, listSessions, deleteSession };
