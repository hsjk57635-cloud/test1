'use strict';
const fs   = require('fs');
const path = require('path');

class PluginLoader {
  constructor() {
    this.commands = new Map();   // pattern → plugin
    this.plugins  = [];          // all plugin objects (for menu)
    this.count    = 0;
  }

  load(pluginsDir) {
    this.commands.clear();
    this.plugins  = [];
    this.count    = 0;

    if (!fs.existsSync(pluginsDir)) {
      fs.mkdirSync(pluginsDir, { recursive: true });
      return;
    }

    const files = fs.readdirSync(pluginsDir)
      .filter(f => f.endsWith('.js') && !f.startsWith('.') && !f.startsWith('_'));

    for (const file of files) {
      const fp = path.join(pluginsDir, file);
      try {
        delete require.cache[require.resolve(fp)];
        const mod = require(fp);
        this._register(mod, file);
      } catch (e) {
        console.error(`❌ Plugin ${file}: ${e.message?.slice(0, 80)}`);
      }
    }
    console.log(`🔌 ${this.count} commands loaded from ${files.length} plugin files`);
  }

  _register(mod, file) {
    const reg = (cmd) => {
      if (!cmd?.pattern || typeof cmd.execute !== 'function') return;
      this.commands.set(cmd.pattern.toLowerCase(), cmd);
      this.plugins.push(cmd);
      this.count++;
      (cmd.alias || []).forEach(a => this.commands.set(a.toLowerCase(), cmd));
    };

    if (mod?.pattern) reg(mod);
    else if (Array.isArray(mod)) mod.forEach(c => reg(c));
    else if (typeof mod === 'object') Object.values(mod).forEach(v => { if (v?.pattern) reg(v); });
  }

  get(cmd) { return this.commands.get(cmd.toLowerCase()); }
  has(cmd) { return this.commands.has(cmd.toLowerCase()); }
  getAll()  { return [...new Set(this.plugins)]; }
}

module.exports = new PluginLoader();
