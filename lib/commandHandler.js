/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/ @HAMZA-302-bot                        *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *  🔗  Telegram : https://t.me/Hamza302bot                             *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *    Description: Central command handler – loads plugins, manages          *
 *                 permissions, cooldowns, and execution statistics.         *
 *****************************************************************************/

const fs = require('fs');
const path = require('path');

class CommandHandler {
  constructor() {
    this.commands = new Map();           // command name → plugin object
    this.aliases = new Map();             // alias → main command name
    this.categories = new Map();          // category → array of command names
    this.stats = new Map();                // command → { calls, errors, totalTime, avgMs }
    this.cooldowns = new Map();            // user+cmd → timestamp
    this.disabledCommands = new Set();     // disabled command names
    this.prefixlessCommands = new Map();   // prefixless command name → main command name

    this.loadCommandsRecursive();
    this.watchPlugins();
  }

  /**
   * Recursively load all .js files from the plugins directory and subdirectories.
   * @param {string} dir - Directory to scan (default: ../plugins)
   */
  loadCommandsRecursive(dir = path.join(__dirname, '../plugins')) {
    if (!fs.existsSync(dir)) {
      console.error(`[ERROR] Plugins directory not found: ${dir}`);
      return;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        this.loadCommandsRecursive(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        this.loadPlugin(fullPath);
      }
    }
  }

  /**
   * Load a single plugin file and register it.
   * Supports both single export { command, handler } and array exports [{ command, handler }, ...]
   * Also supports { games: [...] } shape (deline-games style)
   * @param {string} filePath - Absolute path to the plugin file
   */
  loadPlugin(filePath) {
    try {
      delete require.cache[require.resolve(filePath)];
      const plugin = require(filePath);

      if (!plugin || typeof plugin !== 'object') {
        console.warn(`[WARN] Plugin ${filePath} does not export an object. Skipping.`);
        return;
      }

      // Array of plugins
      if (Array.isArray(plugin)) {
        let loaded = 0;
        for (const p of plugin) {
          if (p && p.command && typeof p.handler === 'function') {
            this.registerCommand(p);
            loaded++;
          }
        }
        if (loaded > 0) console.log(`[LOADED] ${loaded} commands from ${path.relative(__dirname, filePath)}`);
        return;
      }

      // Object with nested arrays (e.g. { games: [...] })
      if (!plugin.command && !plugin.handler) {
        let loaded = 0;
        for (const key of Object.keys(plugin)) {
          const val = plugin[key];
          if (Array.isArray(val)) {
            for (const p of val) {
              if (p && p.command && typeof p.handler === 'function') {
                this.registerCommand(p);
                loaded++;
              }
            }
          }
        }
        if (loaded > 0) console.log(`[LOADED] ${loaded} commands from ${path.relative(__dirname, filePath)}`);
        return;
      }

      if (!plugin.command || typeof plugin.handler !== 'function') {
        console.warn(`[WARN] Plugin ${filePath} missing 'command' or 'handler'. Skipping.`);
        return;
      }

      this.registerCommand(plugin);
      console.log(`[LOADED] ${plugin.command} from ${path.relative(__dirname, filePath)}`);
    } catch (error) {
      console.error(`[ERROR] Failed to load plugin ${filePath}:`, error.message);
    }
  }

  watchPlugins() {
    const pluginsPath = path.join(__dirname, '../plugins');
    if (!fs.existsSync(pluginsPath)) return;

    fs.watch(pluginsPath, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.js')) {
        const filePath = path.join(pluginsPath, filename);
        setTimeout(() => {
          try {
            if (fs.existsSync(filePath)) {
              this.loadPlugin(filePath);
              console.log(`[WATCHER] Hot-reloaded: ${filename}`);
            }
          } catch (error) {
            console.error(`[WATCHER] Error reloading ${filename}:`, error.message);
          }
        }, 100);
      }
    });
  }

  registerCommand(plugin) {
    const { command, aliases = [], category = 'misc', handler, cooldown = 3000, isPrefixless = false } = plugin;
    const cmdKey = command.toLowerCase();

    // Warn on duplicate
    if (this.commands.has(cmdKey)) {
      console.warn(`[WARN] Command "${cmdKey}" is being overwritten by ${command}`);
    }

    // Initialize stats
    this.stats.set(cmdKey, {
      calls: 0,
      errors: 0,
      totalTime: 0,
      avgMs: 0
    });

    // Create a wrapper that handles cooldown and disabled check (stats are updated externally)
    const monitoredHandler = async (sock, message, ...args) => {
      if (this.disabledCommands.has(cmdKey)) {
        await sock.sendMessage(message.key.remoteJid, {
          text: `🚫 The command *${cmdKey}* is currently disabled.`
        }, { quoted: message });
        return;
      }

      const userId = message.key.participant || message.key.remoteJid;
      const now = Date.now();
      const cooldownKey = `${userId}_${cmdKey}`;

      if (this.cooldowns.has(cooldownKey)) {
        const expirationTime = this.cooldowns.get(cooldownKey) + cooldown;
        if (now < expirationTime) return; // silent cooldown
      }

      this.cooldowns.set(cooldownKey, now);

      try {
        return await handler(sock, message, ...args);
      } catch (err) {
        // Update error count
        const stat = this.stats.get(cmdKey);
        if (stat) stat.errors++;
        throw err;
      }
    };

    // Store command
    this.commands.set(cmdKey, {
      ...plugin,
      command,
      handler: monitoredHandler,
      category: category.toLowerCase(),
      aliases,
      cooldown
    });

    // Register aliases
    for (const alias of aliases) {
      this.aliases.set(alias.toLowerCase(), cmdKey);
    }

    // Add to category list
    const cat = category.toLowerCase();
    if (!this.categories.has(cat)) {
      this.categories.set(cat, []);
    }
    if (!this.categories.get(cat).includes(command)) {
      this.categories.get(cat).push(command);
    }

    // Register prefixless if enabled
    if (isPrefixless) {
      this.prefixlessCommands.set(cmdKey, cmdKey);
      for (const alias of aliases) {
        this.prefixlessCommands.set(alias.toLowerCase(), cmdKey);
      }
    }
  }

  /**
   * Record the execution time of a command (called by messageHandler after successful execution).
   * @param {string} commandName - The main command name (lowercase)
   * @param {number} duration - Execution time in milliseconds
   */
  recordCommandSpeed(commandName, duration) {
    const stat = this.stats.get(commandName);
    if (stat) {
      stat.calls++;
      stat.totalTime += duration;
      stat.avgMs = stat.totalTime / stat.calls;
    }
  }

  /**
   * Toggle a command's enabled/disabled state.
   * @param {string} name - Command name or alias
   * @returns {string} 'enabled' or 'disabled'
   */
  toggleCommand(name) {
    const cmd = name.toLowerCase();
    if (this.disabledCommands.has(cmd)) {
      this.disabledCommands.delete(cmd);
      return 'enabled';
    } else {
      this.disabledCommands.add(cmd);
      return 'disabled';
    }
  }

  // Levenshtein distance for suggestions
  _levenshtein(a, b) {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) tmp[i] = [i];
    for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1,
          tmp[i][j - 1] + 1,
          tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return tmp[a.length][b.length];
  }

  findSuggestion(cmd) {
    const allNames = [...this.commands.keys(), ...this.aliases.keys()];
    let bestMatch = null;
    let minDistance = 3;

    for (const name of allNames) {
      const distance = this._levenshtein(cmd, name);
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = name;
      }
    }
    return bestMatch;
  }

  /**
   * Get diagnostic statistics for all commands.
   * @returns {Array} Sorted by usage descending
   */
  getDiagnostics() {
    return Array.from(this.stats.entries()).map(([name, data]) => ({
      command: name,
      usage: data.calls,
      errors: data.errors,
      average_speed: data.avgMs.toFixed(2),
      status: this.disabledCommands.has(name) ? 'OFF' : 'ON'
    })).sort((a, b) => b.usage - a.usage);
  }

  resetStats() {
    this.stats.clear();
    this.cooldowns.clear();
    for (const cmd of this.commands.keys()) {
      this.stats.set(cmd, { calls: 0, errors: 0, totalTime: 0, avgMs: 0 });
    }
  }

  reloadCommands() {
    this.commands.clear();
    this.aliases.clear();
    this.categories.clear();
    this.stats.clear();
    this.cooldowns.clear();
    this.disabledCommands.clear();
    this.prefixlessCommands.clear();
    this.loadCommandsRecursive();
  }

  getCommand(text, prefixes) {
    const usedPrefix = prefixes.find(p => text.startsWith(p));
    const firstWord = text.trim().split(' ')[0].toLowerCase();

    if (!usedPrefix) {
      if (this.prefixlessCommands.has(firstWord)) {
        const targetCmd = this.prefixlessCommands.get(firstWord);
        return this.commands.get(targetCmd);
      }
      return null;
    }

    const fullCommand = text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();

    if (this.commands.has(fullCommand)) {
      return this.commands.get(fullCommand);
    }
    if (this.aliases.has(fullCommand)) {
      const mainCommand = this.aliases.get(fullCommand);
      return this.commands.get(mainCommand);
    }

    const suggestion = this.findSuggestion(fullCommand);
    if (suggestion) {
      return {
        command: suggestion,
        handler: async (sock, message) => {
          const chatId = message.key.remoteJid;
          await sock.sendMessage(chatId, {
            text: `❓ Did you mean *${usedPrefix}${suggestion}*?`
          }, { quoted: message });
        }
      };
    }

    return null;
  }

  getCommandsByCategory(category) {
    return this.categories.get(category.toLowerCase()) || [];
  }

  // Alias for backward compatibility
  loadCommands() {
    this.loadCommandsRecursive();
  }
}

module.exports = new CommandHandler();
