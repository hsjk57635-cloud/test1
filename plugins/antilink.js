/*****************************************************************************
 *  plugins/antilink.js — JUNAID-MD↣³⁰² ULTRA v6
 *  Developed by JUNAID-MD↣³⁰²
 *
 *  v6 BUG FIXES (over v5):
 *  ✅ safeDelete: tries message.key as-is FIRST (preserves @lid participant
 *     format), then falls back to normSender as participant. Fixes
 *     "sometimes doesn't delete" caused by WhatsApp rejecting constructed keys.
 *  ✅ normParticipant removed: kick/ban/remove now use normSender (resolved
 *     by resolveSender to real @s.whatsapp.net). Fixes @lid → wrong short
 *     JID like 18@s.whatsapp.net causing "internal error" on groupParticipantsUpdate.
 *  ✅ Action order fixed: delete FIRST, then react, then warn. Previously
 *     reaction + warning fired before delete → user saw "handled" but message
 *     stayed.
 *  ✅ _notAdminWarned rate limit: 30 min → 5 min. Prevents 30-min silent
 *     gap where antilink detects but shows nothing.
 *  ✅ Delete failed path: sends brief alert so group knows message wasn't
 *     actually removed (instead of silent fail).
 *  ✅ Kick/ban error messages: cleaned up, won't appear as "internal error".
 *  ✅ Bot admin check: if isAdmin throws, do a direct groupMetadata fallback
 *     before giving up.
 *****************************************************************************/

'use strict';
const store         = require('../lib/lightweight_store');
const isOwnerOrSudo = require('../lib/isOwner');
const isAdmin       = require('../lib/isAdmin');
const { resolveLidNum, cleanJid, resolveSender } = require('../lib/senderResolver');

/* ─── JID helpers ─────────────────────────────────────────────────────────── */
function phoneNum(jid) {
    if (!jid) return '';
    return String(jid).split(':')[0].split('@')[0].replace(/\D/g, '');
}
function toSWJid(jid) {
    const n = phoneNum(jid);
    // Only convert if result looks like a real phone number (≥7 digits)
    return (n && n.length >= 7) ? `${n}@s.whatsapp.net` : null;
}
function samePhone(a, b) {
    const na = phoneNum(a), nb = phoneNum(b);
    return !!(na && nb && (na === nb || na.slice(-9) === nb.slice(-9)));
}

/* Resolve the exact participant JID WhatsApp currently has in group metadata.
 * This is the important part for RC12+/RC13+ LID groups: a message can carry
 * @lid while groupParticipantsUpdate() must receive the participant's real
 * JID from metadata. Never manufacture a phone JID from a LID number.
 */
async function resolveRemovalJid(sock, chatId, message, senderId) {
    const raw = message?.key?.participant || senderId || '';
    const rawNum = cleanJid(raw);

    // If the message already has a normal phone JID, prefer it.
    if (String(raw).includes('@s.whatsapp.net')) return raw;

    // First use the shared LID resolver/cache.
    if (rawNum) {
        try {
            const resolved = await resolveLidNum(rawNum, sock, chatId);
            if (resolved && String(resolved).includes('@s.whatsapp.net')) return resolved;
        } catch {}
    }

    // Final authoritative fallback: exact participant from live group metadata.
    try {
        const meta = await (sock.groupMetadataFresh || sock.groupMetadata)(chatId);
        const part = (meta?.participants || []).find(p => {
            const id = String(p?.id || '');
            const lid = String(p?.lid || '');
            const phone = String(p?.phoneNumber || p?.pn || '');
            return (rawNum && (cleanJid(id) === rawNum || cleanJid(lid) === rawNum || cleanJid(phone) === rawNum)) ||
                   id === raw || lid === raw || phone === raw;
        });
        // In LID-addressed groups Baileys may expose participant.id as @lid
        // while the real removable JID is in participant.phoneNumber.
        if (part?.phoneNumber && String(part.phoneNumber).includes('@s.whatsapp.net')) return part.phoneNumber;
        if (part?.pn && String(part.pn).includes('@s.whatsapp.net')) return part.pn;
        if (part?.id && String(part.id).includes('@s.whatsapp.net')) return part.id;
    } catch (e) {
        console.error('[ANTILINK] participant metadata resolve failed:', e.message);
    }

    return null;
}

/* ─── Default config ─────────────────────────────────────────────────────── */
const DEFAULT_CONFIG = {
    enabled:     false,
    mode:        'warn',
    maxWarnings: 3,
    whitelist:   [],
    types: {
        waGroup:    true,
        waChannel:  true,
        telegram:   true,
        discord:    true,
        allLinks:   true,
        shortLinks: true,
    }
};

/* ─── Store helpers ──────────────────────────────────────────────────────── */
async function readConfig(chatId) {
    try {
        const c = await store.getSetting(chatId, 'antilink_v2');
        if (c) return { ...DEFAULT_CONFIG, ...c, types: { ...DEFAULT_CONFIG.types, ...(c.types || {}) } };
        return { ...DEFAULT_CONFIG, types: { ...DEFAULT_CONFIG.types } };
    } catch (e) {
        console.error('[ANTILINK] readConfig error:', e.message);
        return { ...DEFAULT_CONFIG, types: { ...DEFAULT_CONFIG.types } };
    }
}
async function writeConfig(chatId, config) {
    try { await store.saveSetting(chatId, 'antilink_v2', config); }
    catch (e) { console.error('[ANTILINK] writeConfig error:', e.message); }
}

/* ─── In-memory state ────────────────────────────────────────────────────── */
const warningCount      = new Map();
const shadowBanned      = new Set();
const _notAdminWarned   = new Map();  // chatId → timestamp

/* ─── Link detection ─────────────────────────────────────────────────────── */
function detectLinks(text, enabledTypes) {
    if (!text) return null;

    const normalized = text
        .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
        .replace(/(\w)\s+\./g, '$1.')
        .replace(/\.\s+(\w)/g, '.$1');

    const patterns = {
        waGroup:    /chat\.whatsapp\.com\/[A-Za-z0-9+_/=-]{10,}/i,
        waChannel:  /(?:wa\.me\/channel|whatsapp\.com\/channel)\/[A-Za-z0-9+_/=-]{10,}/i,
        telegram:   /(?:t\.me|telegram\.me|telegram\.dog)\/(?:\+|joinchat\/)?[A-Za-z0-9_-]+/i,
        discord:    /(?:discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[A-Za-z0-9-]+/i,
        shortLinks: /(?:bit\.ly|tinyurl\.com|goo\.gl|ow\.ly|buff\.ly|rebrand\.ly|t\.co|is\.gd|cutt\.ly)\/[A-Za-z0-9_-]+/i,
        allLinks:   /(?:https?:\/\/|ftp:\/\/|www\.)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b[-a-zA-Z0-9()@:%_+.~#?&/=]*/i,
    };

    const priority = ['waGroup','waChannel','telegram','discord','shortLinks','allLinks'];
    for (const type of priority) {
        if (enabledTypes[type] === false) continue;
        const pat = patterns[type];
        if (!pat) continue;
        const m = pat.exec(normalized) || pat.exec(text);
        if (m) return { type, match: m[0] };
    }
    return null;
}

function isWhitelisted(match, whitelist) {
    if (!whitelist?.length) return false;
    const lower = String(match).toLowerCase();
    return whitelist.some(w => lower.includes(w.toLowerCase()));
}

function extractTexts(message) {
    const m = message.message || {};
    return [
        m.conversation,
        m.extendedTextMessage?.text,
        m.imageMessage?.caption,
        m.videoMessage?.caption,
        m.documentMessage?.caption,
        m.audioMessage?.caption,
        m.buttonsMessage?.contentText,
        m.listMessage?.description,
        m.extendedTextMessage?.contextInfo?.quotedMessage?.conversation,
        m.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text,
    ].filter(Boolean);
}

/* ─── safeDelete v6 ─────────────────────────────────────────────────────────
 *  FIX: Try message.key AS-IS first. WhatsApp may require exact participant
 *  JID format (@lid or @s.whatsapp.net) that was stored server-side.
 *  Fallback: rebuild key with normSender as participant.
 * ─────────────────────────────────────────────────────────────────────────── */
async function safeDelete(sock, chatId, message, normSender) {
    // Attempt 1: use original message.key (exact format WhatsApp stored)
    try {
        await sock.sendMessage(chatId, { delete: message.key });
        return true;
    } catch (e1) {
        // Attempt 2: fallback with resolved @s.whatsapp.net participant
        try {
            const fallbackKey = {
                remoteJid:   chatId,
                fromMe:      false,
                id:          message.key.id,
                participant: normSender,  // already resolved by resolveSender()
            };
            await sock.sendMessage(chatId, { delete: fallbackKey });
            return true;
        } catch (e2) {
            console.error('[ANTILINK] delete failed (both attempts):', e2.message);
            return false;
        }
    }
}

async function safeSend(sock, chatId, payload) {
    try { await sock.sendMessage(chatId, payload); }
    catch (e) { console.error('[ANTILINK] send failed:', e.message); }
}

/* ─── Bot admin check with fallback ─────────────────────────────────────── */
async function checkAdmin(sock, chatId, normSender) {
    try {
        return await isAdmin(sock, chatId, normSender);
    } catch (e) {
        console.error('[ANTILINK] isAdmin error, fallback direct fetch:', e.message);
        // Direct fallback: fetch metadata ourselves
        try {
            const meta = await sock.groupMetadata(chatId);
            const botNum = phoneNum(sock.user?.id);
            const senderNum = phoneNum(normSender);
            let isBotAdmin = false, isSenderAdmin = false;
            for (const p of (meta.participants || [])) {
                const pNum = phoneNum(p.id);
                const isAdm = p.admin === 'admin' || p.admin === 'superadmin';
                if (isAdm && botNum && (pNum === botNum || pNum.slice(-9) === botNum.slice(-9))) isBotAdmin = true;
                if (isAdm && senderNum && (pNum === senderNum || pNum.slice(-9) === senderNum.slice(-9))) isSenderAdmin = true;
            }
            return { isBotAdmin, isSenderAdmin };
        } catch {
            return { isBotAdmin: false, isSenderAdmin: false };
        }
    }
}

/* ─── Main detection handler ─────────────────────────────────────────────── */
async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    try {
        if (!chatId.endsWith('@g.us')) return;

        const config = await readConfig(chatId);
        if (!config?.enabled) return;

        const m = message.message || {};
        if (m.protocolMessage || m.contactMessage || m.locationMessage) return;

        // Collect and scan texts
        const texts = extractTexts(message);
        if (userMessage && !texts.includes(userMessage)) texts.unshift(userMessage);

        let detected = null;
        for (const t of texts) {
            detected = detectLinks(t, config.types || DEFAULT_CONFIG.types);
            if (detected) break;
        }
        if (!detected) return;
        if (isWhitelisted(detected.match, config.whitelist)) return;

        // normSender: already resolved by resolveSender() in messageHandler
        // Use it directly — don't try to re-derive from message.key.participant
        // (message.key.participant may be @lid which toSWJid converts to a wrong short JID)
        // Resolve the sender using the shared LID/phone resolver. Do not
        // manufacture a phone JID from an @lid value: WhatsApp may reject
        // groupParticipantsUpdate() when given a fake JID.
        let normSender = senderId;
        try {
            const resolved = await resolveSender(message, sock, chatId);
            if (resolved) normSender = resolved;
        } catch (e) {
            console.error('[ANTILINK] sender resolve failed:', e.message);
        }
        const botPhone    = phoneNum(sock.user?.id);

        if (botPhone && samePhone(normSender, botPhone)) return;

        const isOwnerSudo = await isOwnerOrSudo(normSender, sock, chatId).catch(() => false);
        if (isOwnerSudo) return;

        // ── Admin check (with fallback on error) ───────────────────────────
        let isBotAdmin = false;
        try {
            const { isSenderAdmin, isBotAdmin: ba } = await checkAdmin(sock, chatId, normSender);
            if (isSenderAdmin) return;  // admins exempted
            isBotAdmin = ba;
        } catch (e) {
            console.error('[ANTILINK] admin check error:', e.message);
        }

        const senderShort = phoneNum(normSender) || normSender.split('@')[0];
        const typeLabel   = detected.type.replace(/([A-Z])/g, ' $1').trim();
        const warningKey  = `${chatId}:${normSender}`;

        // ── STEP 1: Delete (BEFORE react/warn — so action is real first) ───
        let deleted = false;
        if (isBotAdmin) {
            deleted = await safeDelete(sock, chatId, message, normSender);
        } else {
            // Not admin — rate-limited warning (5 min, was 30)
            const last = _notAdminWarned.get(chatId) || 0;
            if (Date.now() - last > 5 * 60_000) {
                _notAdminWarned.set(chatId, Date.now());
                await safeSend(sock, chatId, {
                    text: `⚠️ *Antilink:* Detected a *${typeLabel}* link — make me admin so I can delete it.`
                });
            }
        }

        // ── STEP 2: Report the sender ID AFTER the link is deleted ────────
        // Required action order: DELETE -> SHOW ID -> KICK/REMOVE.
        if (isBotAdmin && deleted) {
            try {
                await sock.sendMessage(chatId, {
                    text: `🆔 *Link Sender ID:*\n\`${normSender}\``,
                    mentions: [normSender]
                });
            } catch (e) {
                console.error('[ANTILINK] ID report failed:', e.message);
            }
        }

        // ── STEP 3: React (after delete + ID report) ──────────────────────
        try { await sock.sendMessage(chatId, { react: { text: '🚫', key: message.key } }); } catch {}

        // ── STEP 4: If delete failed (bot is admin but delete errored), warn
        if (isBotAdmin && !deleted) {
            await safeSend(sock, chatId, {
                text: `⚠️ @${senderShort} — ${typeLabel} link detected but couldn't delete it. Check my permissions.`,
                mentions: [normSender]
            });
            return;
        }

        // ── STEP 5: Mode-based follow-up action ────────────────────────────
        if (config.mode === 'delete') return;  // delete only, no extra action

        if (config.mode === 'shadowban') {
            shadowBanned.add(`${chatId}:${normSender}`);
            await safeSend(sock, chatId, {
                text: `🚫 @${senderShort} — Link detected. You are now restricted.`,
                mentions: [normSender]
            });
            return;
        }

        // Resolve the exact group participant JID before any remove/ban call.
        // IMPORTANT: senderId can be @lid; passing a fabricated @s.whatsapp.net
        // JID causes WhatsApp to reject the removal even though deletion works.
        const removalJid = await resolveRemovalJid(sock, chatId, message, normSender) || toSWJid(normSender);

        if (config.mode === 'ban') {
            if (isBotAdmin && removalJid) {
                try {
                    await sock.groupParticipantsUpdate(chatId, [removalJid], 'remove');
                    await sock.updateBlockStatus(removalJid, 'block').catch(() => {});
                    await safeSend(sock, chatId, {
                        text: `🚫 @${senderShort} banned for *${typeLabel}* link.`,
                        mentions: [normSender]
                    });
                } catch (e) {
                    console.error('[ANTILINK] ban failed:', e.message);
                    await safeSend(sock, chatId, {
                        text: `⚠️ @${senderShort} — Could not complete ban. Check my admin permissions.`,
                        mentions: [normSender]
                    });
                }
            } else if (isBotAdmin && !removalJid) {
                await safeSend(sock, chatId, {
                    text: `⚠️ @${senderShort} — I couldn't resolve the participant ID for removal. Please try the link again.`,
                    mentions: [normSender]
                });
            } else {
                await safeSend(sock, chatId, {
                    text: `🚫 @${senderShort} shared *${typeLabel}* — make me admin to ban.`,
                    mentions: [normSender]
                });
            }
            return;
        }

        if (config.mode === 'kick') {
            if (isBotAdmin && removalJid) {
                try {
                    await sock.groupParticipantsUpdate(chatId, [removalJid], 'remove');
                    await safeSend(sock, chatId, {
                        text: `🚫 @${senderShort} removed for *${typeLabel}* link.`,
                        mentions: [normSender]
                    });
                } catch (e) {
                    console.error('[ANTILINK] kick failed:', e.message);
                    await safeSend(sock, chatId, {
                        text: `⚠️ @${senderShort} — Could not remove. Check my admin permissions.`,
                        mentions: [normSender]
                    });
                }
            } else if (isBotAdmin && !removalJid) {
                await safeSend(sock, chatId, {
                    text: `⚠️ @${senderShort} — I couldn't resolve the participant ID for removal. Please try the link again.`,
                    mentions: [normSender]
                });
            } else {
                await safeSend(sock, chatId, {
                    text: `🚫 @${senderShort} shared *${typeLabel}* — make me admin to kick.`,
                    mentions: [normSender]
                });
            }
            return;
        }

        // ── MODE: warn (default) ───────────────────────────────────────────
        let warns = (warningCount.get(warningKey) || 0) + 1;
        warningCount.set(warningKey, warns);
        const max = config.maxWarnings || 3;

        if (warns < max) {
            await safeSend(sock, chatId, {
                text: `⚠️ *Antilink Warning ${warns}/${max}*\n\n@${senderShort}, *${typeLabel}* links are not allowed!\n_${max - warns} more warning(s) before removal._`,
                mentions: [normSender]
            });
        } else {
            warningCount.set(warningKey, 0);
            if (isBotAdmin) {
                try {
                    if (!removalJid) throw new Error('participant JID could not be resolved');
                    await sock.groupParticipantsUpdate(chatId, [removalJid], 'remove');
                    await safeSend(sock, chatId, {
                        text: `🚫 @${senderShort} removed — reached max warnings for *${typeLabel}* links.`,
                        mentions: [normSender]
                    });
                } catch (e) {
                    console.error('[ANTILINK] warn-kick failed:', e.message);
                    await safeSend(sock, chatId, {
                        text: `⚠️ @${senderShort} hit warn limit — could not remove. Check my permissions.`,
                        mentions: [normSender]
                    });
                }
            } else {
                await safeSend(sock, chatId, {
                    text: `⚠️ @${senderShort} hit warn limit — make me admin to remove.`,
                    mentions: [normSender]
                });
            }
        }
    } catch (e) {
        console.error('[ANTILINK] handleLinkDetection error:', e.message);
    }
}

function isShadowBanned(chatId, senderId) {
    const norm = toSWJid(senderId) || senderId;
    return shadowBanned.has(`${chatId}:${norm}`);
}

/* ─── Command handler ────────────────────────────────────────────────────── */
module.exports = {
    command:     'antilink',
    aliases:     ['alink', 'linkblock', 'linkprotect'],
    category:    'admin',
    description: 'Ultra link protection v6 — @lid fix, reliable delete, all modes',
    usage:       '.antilink on | off | status [on|off] | statue [on|off] | mode <warn|kick|delete|shadowban|ban> | max <n> | whitelist add|remove|list <domain> | toggle <type> | reset',
    groupOnly:   true,
    adminOnly:   true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const config = await readConfig(chatId);
        const action = args[0]?.toLowerCase();
        const reply  = (text) => sock.sendMessage(chatId, { text }, { quoted: message });

        // Support both `.antilink status on/off` and the user's common typo
        // `.antilink statue on/off`. With `on`, enable AntiLink in KICK mode.
        if (action === 'status' || action === 'statue') {
            const subAction = args[1]?.toLowerCase();
            if (subAction === 'on') {
                config.enabled = true;
                config.mode = 'kick';
                await writeConfig(chatId, config);
                return reply('✅ *Antilink ENABLED*\nMode: KICK — link will be deleted, sender ID reported, then sender removed from the group.');
            }
            if (subAction === 'off') {
                config.enabled = false;
                await writeConfig(chatId, config);
                return reply('❌ *Antilink disabled.*');
            }
            const types = config.types || DEFAULT_CONFIG.types;
            const activeTypes = Object.entries(types).filter(([,v])=>v).map(([k])=>k);
            return reply(
                `🔗 *ANTILINK ULTRA v6 — Status*\n\n` +
                `Status:      ${config.enabled ? '✅ ON' : '❌ OFF'}\n` +
                `Mode:        ${(config.mode||'warn').toUpperCase()}\n` +
                `Max Warns:   ${config.mode==='kick'||config.mode==='ban' ? 'Instant' : config.maxWarnings}\n` +
                `Whitelist:   ${config.whitelist?.length||0} domain(s)\n` +
                `Active:      ${activeTypes.join(', ')}\n\n` +
                `*Commands:*\n` +
                `• \`.antilink on/off\`\n` +
                `• \`.antilink mode warn|kick|delete|shadowban|ban\`\n` +
                `• \`.antilink max <n>\`\n` +
                `• \`.antilink whitelist add|remove|list <domain>\`\n` +
                `• \`.antilink toggle <type>\`\n` +
                `• \`.antilink types\`\n` +
                `• \`.antilink reset\``
            );
        }

        if (action === 'on')  { config.enabled = true; config.mode = 'kick'; await writeConfig(chatId, config); return reply(`✅ *Antilink ENABLED*
Mode: kick — link sender will be removed. | Max warns: ${config.maxWarnings}`); }
        if (action === 'off') { config.enabled = false; await writeConfig(chatId, config); return reply('❌ Antilink disabled.'); }

        if (action === 'mode') {
            const modes = ['warn','kick','delete','shadowban','ban'];
            const md = args[1]?.toLowerCase();
            if (!modes.includes(md)) return reply(`❌ Modes: ${modes.join(' | ')}`);
            config.mode = md; await writeConfig(chatId, config); return reply(`✅ Mode → *${md.toUpperCase()}*`);
        }

        if (action === 'max') {
            const n = parseInt(args[1]);
            if (isNaN(n)||n<1) return reply('❌ Usage: `.antilink max <number>`');
            config.maxWarnings = n; await writeConfig(chatId, config); return reply(`✅ Max warnings: *${n}*`);
        }

        if (action === 'whitelist') {
            const sub = args[1]?.toLowerCase(), dom = args[2]?.toLowerCase();
            if (!config.whitelist) config.whitelist = [];
            if (sub==='add'&&dom)    { if(!config.whitelist.includes(dom)) config.whitelist.push(dom); await writeConfig(chatId,config); return reply(`✅ Added: \`${dom}\``); }
            if (sub==='remove'&&dom) { config.whitelist=config.whitelist.filter(d=>d!==dom); await writeConfig(chatId,config); return reply(`✅ Removed: \`${dom}\``); }
            if (sub==='list')        { return reply(config.whitelist.length ? `✅ Whitelist:\n${config.whitelist.map((d,i)=>`${i+1}. \`${d}\``).join('\n')}` : '📭 Whitelist empty.'); }
            return reply('❌ Usage: `.antilink whitelist add|remove|list <domain>`');
        }

        if (action === 'types') {
            const t = { ...DEFAULT_CONFIG.types, ...(config.types||{}) };
            return reply(`🔘 *Types:*\n\n${Object.entries(t).map(([k,v])=>`${v?'✅':'❌'} ${k}`).join('\n')}\n\nToggle: \`.antilink toggle <type>\``);
        }

        if (action === 'toggle') {
            const type = args[1];
            const all  = { ...DEFAULT_CONFIG.types, ...(config.types||{}) };
            if (!type||!(type in all)) return reply(`❌ Types: ${Object.keys(all).join(', ')}`);
            config.types = all; config.types[type] = !config.types[type];
            await writeConfig(chatId, config);
            return reply(`✅ \`${type}\`: ${config.types[type] ? 'ON ✅' : 'OFF ❌'}`);
        }

        if (action === 'reset') {
            await writeConfig(chatId, { ...DEFAULT_CONFIG, types: { ...DEFAULT_CONFIG.types } });
            for (const k of warningCount.keys()) { if (k.startsWith(chatId)) warningCount.delete(k); }
            shadowBanned.forEach(k => { if (k.startsWith(chatId)) shadowBanned.delete(k); });
            return reply('🔄 Antilink reset to defaults.');
        }

        return reply('❌ Unknown. Use `.antilink status`');
    },

    handleLinkDetection,
    isShadowBanned,
    detectLinks,
};
