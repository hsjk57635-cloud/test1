'use strict';
const fs   = require('fs');
const path = require('path');

class Store {
  constructor(file) {
    this.file = file;
    this.data = {};
    this._load();
  }
  _load() {
    try {
      if (fs.existsSync(this.file)) this.data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } catch { this.data = {}; }
  }
  save() {
    try { fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2)); } catch {}
  }
  get(key, def = null) { return this.data[key] ?? def; }
  set(key, val)        { this.data[key] = val; this.save(); }
  del(key)             { delete this.data[key]; this.save(); }
  has(key)             { return key in this.data; }
  all()                { return this.data; }
}

// Singletons
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

module.exports = {
  settings:  new Store(path.join(DATA_DIR, 'settings.json')),
  antilink:  new Store(path.join(DATA_DIR, 'antilink.json')),
  antispam:  new Store(path.join(DATA_DIR, 'antispam.json')),
  antitag:   new Store(path.join(DATA_DIR, 'antitag.json')),
  antidel:   new Store(path.join(DATA_DIR, 'antidelete.json')),
  anticall:  new Store(path.join(DATA_DIR, 'anticall.json')),
  warns:     new Store(path.join(DATA_DIR, 'warns.json')),
  notes:     new Store(path.join(DATA_DIR, 'notes.json')),
  chatbot:   new Store(path.join(DATA_DIR, 'chatbot.json')),
  blocked:   new Store(path.join(DATA_DIR, 'blocked.json')),
  Store,
};
