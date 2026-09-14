const fs = require('fs');
const path = require('path');
const store = require('./lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const dataPath = path.join(__dirname, '../data/userGroupData.json');

// ✅ SPEED FIX: loadUserGroupData() used to re-read the ENTIRE JSON file from
// disk (or hit the DB) on EVERY single call — and it is called many times per
// message (isSudo, getAntilink, getChatbot, getAntiBadword, warnings, ...).
// On a busy group this meant dozens of blocking fs.readFileSync / DB round
// trips per incoming message = the #1 cause of slow DM/group replies.
// We now keep a single in-memory copy, refresh it lazily on a short TTL, and
// write-through-invalidate on every save so data stays correct.
const _defaultData = () => ({
    antibadword: {},
    antilink: {},
    welcome: {},
    goodbye: {},
    chatbot: {},
    warnings: {},
    sudo: [],
    antitag: {}
});

let _ugCache = null;      // last loaded object
let _ugCacheTs = 0;       // when it was loaded
const _UG_TTL = 10_000;   // 10s — plenty fresh, avoids per-message disk/DB churn
let _ugDirty = false;     // pending unsaved writes (debounced flush)
let _ugFlushTimer = null;

async function _readRaw() {
    try {
        if (HAS_DB) {
            const data = await store.getSetting('global', 'userGroupData');
            return data || _defaultData();
        }
        if (!fs.existsSync(dataPath)) {
            const d = _defaultData();
            try {
                const dir = path.dirname(dataPath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(dataPath, JSON.stringify(d, null, 2));
            } catch {}
            return d;
        }
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
        console.error('Error loading user group data:', error);
        return _defaultData();
    }
}

async function loadUserGroupData() {
    const now = Date.now();
    if (_ugCache && (now - _ugCacheTs) < _UG_TTL) return _ugCache;
    _ugCache = await _readRaw();
    _ugCacheTs = now;
    return _ugCache;
}

async function _flush() {
    _ugFlushTimer = null;
    if (!_ugDirty || !_ugCache) return;
    _ugDirty = false;
    const data = _ugCache;
    try {
        if (HAS_DB) {
            await store.saveSetting('global', 'userGroupData', data);
        } else {
            const dir = path.dirname(dataPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error saving user group data:', error);
        _ugDirty = true; // retry on next flush
    }
}

async function saveUserGroupData(data) {
    // Update the cache immediately (so subsequent reads see the new value
    // without a disk hit) and debounce the actual persistence to ~400ms so a
    // burst of edits collapses into a single write.
    _ugCache = data;
    _ugCacheTs = Date.now();
    _ugDirty = true;
    if (!_ugFlushTimer) _ugFlushTimer = setTimeout(() => { _flush().catch(() => {}); }, 400);
    return true;
}

// Make sure pending writes are not lost on shutdown.
const _flushSync = () => {
    if (!_ugDirty || !_ugCache || HAS_DB) return;
    try {
        const dir = path.dirname(dataPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(dataPath, JSON.stringify(_ugCache, null, 2));
        _ugDirty = false;
    } catch {}
};
process.on('SIGINT', _flushSync);
process.on('SIGTERM', _flushSync);
process.on('beforeExit', _flushSync);

async function setAntilink(groupId, type, action) {
    try {
        const data = await loadUserGroupData();
        if (!data.antilink) data.antilink = {};
        if (!data.antilink[groupId]) data.antilink[groupId] = {};
        
        data.antilink[groupId] = {
            enabled: type === 'on',
            action: action || 'delete'
        };
        
        await saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error setting antilink:', error);
        return false;
    }
}

async function getAntilink(groupId, type) {
    try {
        const data = await loadUserGroupData();
        if (!data.antilink || !data.antilink[groupId]) return null;
        
        return type === 'on' ? data.antilink[groupId] : null;
    } catch (error) {
        console.error('Error getting antilink:', error);
        return null;
    }
}

async function removeAntilink(groupId, type) {
    try {
        const data = await loadUserGroupData();
        if (data.antilink && data.antilink[groupId]) {
            delete data.antilink[groupId];
            await saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing antilink:', error);
        return false;
    }
}

async function setAntitag(groupId, type, action) {
    try {
        const data = await loadUserGroupData();
        if (!data.antitag) data.antitag = {};
        if (!data.antitag[groupId]) data.antitag[groupId] = {};
        
        data.antitag[groupId] = {
            enabled: type === 'on',
            action: action || 'delete'
        };
        
        await saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error setting antitag:', error);
        return false;
    }
}

async function getAntitag(groupId, type) {
    try {
        const data = await loadUserGroupData();
        if (!data.antitag || !data.antitag[groupId]) return null;
        
        return type === 'on' ? data.antitag[groupId] : null;
    } catch (error) {
        console.error('Error getting antitag:', error);
        return null;
    }
}

async function removeAntitag(groupId, type) {
    try {
        const data = await loadUserGroupData();
        if (data.antitag && data.antitag[groupId]) {
            delete data.antitag[groupId];
            await saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing antitag:', error);
        return false;
    }
}

async function incrementWarningCount(groupId, userId) {
    try {
        const data = await loadUserGroupData();
        if (!data.warnings) data.warnings = {};
        if (!data.warnings[groupId]) data.warnings[groupId] = {};
        if (!data.warnings[groupId][userId]) data.warnings[groupId][userId] = 0;
        
        data.warnings[groupId][userId]++;
        await saveUserGroupData(data);
        return data.warnings[groupId][userId];
    } catch (error) {
        console.error('Error incrementing warning count:', error);
        return 0;
    }
}

async function resetWarningCount(groupId, userId) {
    try {
        const data = await loadUserGroupData();
        if (data.warnings && data.warnings[groupId] && data.warnings[groupId][userId]) {
            data.warnings[groupId][userId] = 0;
            await saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error resetting warning count:', error);
        return false;
    }
}

async function isSudo(userId) {
    try {
        const data = await loadUserGroupData();
        return data.sudo && data.sudo.includes(userId);
    } catch (error) {
        console.error('Error checking sudo:', error);
        return false;
    }
}

async function addSudo(userJid) {
    try {
        const data = await loadUserGroupData();
        if (!data.sudo) data.sudo = [];
        if (!data.sudo.includes(userJid)) {
            data.sudo.push(userJid);
            await saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error adding sudo:', error);
        return false;
    }
}

async function removeSudo(userJid) {
    try {
        const data = await loadUserGroupData();
        if (!data.sudo) data.sudo = [];
        const idx = data.sudo.indexOf(userJid);
        if (idx !== -1) {
            data.sudo.splice(idx, 1);
            await saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing sudo:', error);
        return false;
    }
}

async function getSudoList() {
    try {
        const data = await loadUserGroupData();
        return Array.isArray(data.sudo) ? data.sudo : [];
    } catch (error) {
        console.error('Error getting sudo list:', error);
        return [];
    }
}

async function addWelcome(jid, enabled, message) {
    try {
        const data = await loadUserGroupData();
        if (!data.welcome) data.welcome = {};
        
        data.welcome[jid] = {
            enabled: enabled,
            message: message || '╔═⚔️ WELCOME ⚔️═╗\n║ 🛡️ User: {user}\n║ 🏰 Kingdom: {group}\n╠═══════════════╣\n║ 📜 Message:\n║ {description}\n╚═══════════════╝',
            channelId: '120363408055942569@newsletter'
        };
        
        await saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error in addWelcome:', error);
        return false;
    }
}

async function delWelcome(jid) {
    try {
        const data = await loadUserGroupData();
        if (data.welcome && data.welcome[jid]) {
            delete data.welcome[jid];
            await saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error in delWelcome:', error);
        return false;
    }
}

async function isWelcomeOn(jid) {
    try {
        const data = await loadUserGroupData();
        return data.welcome && data.welcome[jid] && data.welcome[jid].enabled;
    } catch (error) {
        console.error('Error in isWelcomeOn:', error);
        return false;
    }
}

async function addGoodbye(jid, enabled, message) {
    try {
        const data = await loadUserGroupData();
        if (!data.goodbye) data.goodbye = {};
        
        data.goodbye[jid] = {
            enabled: enabled,
            message: message || '╔═⚔️ GOODBYE ⚔️═╗\n║ 🛡️ User: {user}\n║ 🏰 Kingdom: {group}\n╠═══════════════╣\n║ ⚰️ We will never miss you!\n╚═══════════════╝',
            channelId: '120363408055942569@newsletter'
        };
        
        await saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error in addGoodbye:', error);
        return false;
    }
}

async function delGoodBye(jid) {
    try {
        const data = await loadUserGroupData();
        if (data.goodbye && data.goodbye[jid]) {
            delete data.goodbye[jid];
            await saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error in delGoodBye:', error);
        return false;
    }
}

async function isGoodByeOn(jid) {
    try {
        const data = await loadUserGroupData();
        return data.goodbye && data.goodbye[jid] && data.goodbye[jid].enabled;
    } catch (error) {
        console.error('Error in isGoodByeOn:', error);
        return false;
    }
}

async function getWelcome(jid) {
    try {
        const data = await loadUserGroupData();
        return data.welcome && data.welcome[jid] ? data.welcome[jid].message : null;
    } catch (error) {
        console.error('Error in getWelcome:', error);
        return null;
    }
}

async function getGoodbye(jid) {
    try {
        const data = await loadUserGroupData();
        return data.goodbye && data.goodbye[jid] ? data.goodbye[jid].message : null;
    } catch (error) {
        console.error('Error in getGoodbye:', error);
        return null;
    }
}

async function setAntiBadword(groupId, type, action) {
    try {
        const data = await loadUserGroupData();
        if (!data.antibadword) data.antibadword = {};
        if (!data.antibadword[groupId]) data.antibadword[groupId] = {};
        
        data.antibadword[groupId] = {
            enabled: type === 'on',
            action: action || 'delete'
        };
        
        await saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error setting antibadword:', error);
        return false;
    }
}

async function getAntiBadword(groupId, type) {
    try {
        const data = await loadUserGroupData();
        
        if (!data.antibadword || !data.antibadword[groupId]) {
            return null;
        }
        
        const config = data.antibadword[groupId];
        
        return type === 'on' ? config : null;
    } catch (error) {
        console.error('Error getting antibadword:', error);
        return null;
    }
}

async function removeAntiBadword(groupId, type) {
    try {
        const data = await loadUserGroupData();
        if (data.antibadword && data.antibadword[groupId]) {
            delete data.antibadword[groupId];
            await saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing antibadword:', error);
        return false;
    }
}

async function setChatbot(groupId, enabled) {
    try {
        const data = await loadUserGroupData();
        if (!data.chatbot) data.chatbot = {};
        
        data.chatbot[groupId] = {
            enabled: enabled
        };
        
        await saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error setting chatbot:', error);
        return false;
    }
}

async function getChatbot(groupId) {
    try {
        const data = await loadUserGroupData();
        return data.chatbot?.[groupId] || null;
    } catch (error) {
        console.error('Error getting chatbot:', error);
        return null;
    }
}

async function removeChatbot(groupId) {
    try {
        const data = await loadUserGroupData();
        if (data.chatbot && data.chatbot[groupId]) {
            delete data.chatbot[groupId];
            await saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing chatbot:', error);
        return false;
    }
}

module.exports = {
    setAntilink,
    getAntilink,
    removeAntilink,
    setAntitag,
    getAntitag,
    removeAntitag,
    incrementWarningCount,
    resetWarningCount,
    isSudo,
    addSudo,
    removeSudo,
    getSudoList,
    addWelcome,
    delWelcome,
    isWelcomeOn,
    getWelcome,
    addGoodbye,
    delGoodBye,
    isGoodByeOn,
    getGoodbye,
    setAntiBadword,
    getAntiBadword,
    removeAntiBadword,
    setChatbot,
    getChatbot,
    removeChatbot,
    loadUserGroupData,
    saveUserGroupData
};
