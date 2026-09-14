/**
 * JUNAID-MD↣³⁰² — Lightweight JSON Database
 * No external DB needed — perfect for Heroku free tier
 * Owner: JUNAID-MD↣³⁰²
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

class JsonDB {
  constructor(name) {
    this.file = path.join(DB_DIR, `${name}.json`);
    this._data = this._load();
  }

  _load() {
    try { return JSON.parse(fs.readFileSync(this.file, 'utf8')); }
    catch { return {}; }
  }

  _save() {
    try { fs.writeFileSync(this.file, JSON.stringify(this._data, null, 2)); }
    catch (e) { console.error(`[DB] Save error:`, e.message); }
  }

  get(key) { return this._data[key]; }

  set(key, value) {
    this._data[key] = value;
    this._save();
    return value;
  }

  has(key) { return key in this._data; }

  delete(key) {
    delete this._data[key];
    this._save();
  }

  all() { return { ...this._data }; }

  keys() { return Object.keys(this._data); }

  clear() { this._data = {}; this._save(); }

  // Increment a numeric counter
  incr(key, by = 1) {
    this._data[key] = (this._data[key] || 0) + by;
    this._save();
    return this._data[key];
  }

  // Push to array
  push(key, value) {
    if (!Array.isArray(this._data[key])) this._data[key] = [];
    this._data[key].push(value);
    this._save();
    return this._data[key];
  }

  // Remove from array
  pull(key, value) {
    if (!Array.isArray(this._data[key])) return;
    this._data[key] = this._data[key].filter(v => v !== value);
    this._save();
  }
}

// Pre-initialized databases
const db = {
  users:    new JsonDB('users'),
  groups:   new JsonDB('groups'),
  banned:   new JsonDB('banned'),
  premium:  new JsonDB('premium'),
  notes:    new JsonDB('notes'),
  warnings: new JsonDB('warnings'),
  settings: new JsonDB('settings'),
  stats:    new JsonDB('stats'),
};

module.exports = { JsonDB, db };
