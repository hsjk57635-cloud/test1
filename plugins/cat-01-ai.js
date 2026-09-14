'use strict';
// AUTO-GENERATED BUNDLE: cat-01-ai
// Contains: ai.js, ai2.js, ai-gpt.js, ai-llama.js, ai-mistral.js, aify.js, aistory.js, explain.js, summarize.js, deepseek.js, redxai.js, gpt.js
// NOTE: chatbot.js (duplicate/dead 'chatbot' command + handleChatbotResponse) removed — the single source of truth is plugins/chatbot.js

const _bundle = [];


/* ===== ai.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                          JUNAID-MD↣³⁰² v7.0 ULTRA                            *
 *****************************************************************************/

'use strict';
const axios = require('axios');

// ══════════════════ JUNAID-MD↣³⁰² API POOL ══════════════════
const DELINE_BASE = 'https://api.deline.web.id/ai';
const SAQIB_BASE  = 'https://apisaqib.vercel.app/api/v1';

const AI_APIS = {
    // ── PRIMARY ──
    delineThink: (q) => `${DELINE_BASE}/copilot-think?text=${encodeURIComponent(q)}`,
    deline:      (q) => `${DELINE_BASE}/copilot?text=${encodeURIComponent(q)}`,
    // ── FALLBACK ──
    saqib1:  (q) => `${SAQIB_BASE}/1027?text=${encodeURIComponent(q)}`,
    saqib2:  (q) => `${SAQIB_BASE}/1026?query=${encodeURIComponent(q)}`,
    saqib3:  (q) => `${SAQIB_BASE}/1024?q=${encodeURIComponent(q)}`,
    saqib4:  (q) => `${SAQIB_BASE}/1023?q=${encodeURIComponent(q)}`,
    saqib5:  (q) => `${SAQIB_BASE}/1018?prompt=${encodeURIComponent(q)}`,
    gemini:  (q) => `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(q)}`,
    gpt4:    (q) => `https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent(q)}`,
    llama:   (q) => `https://api.giftedtech.my.id/api/ai/llama3?apikey=gifted&q=${encodeURIComponent(q)}`,
    mistral: (q) => `https://api.giftedtech.my.id/api/ai/mistral?apikey=gifted&q=${encodeURIComponent(q)}`,
    zell:    (q) => `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(q)}`,
};

async function tryApis(apiList, query, timeout = 10000) {
    for (const fn of apiList) {
        try {
            const url = fn(query);
            const { data } = await axios.get(url, { timeout });
            // copilot-think returns result as object { text, citations }
            const ans =
                data?.result?.text || data?.result?.answer || data?.result ||
                data?.answer || data?.response || data?.reply ||
                data?.message || data?.text || data?.data?.reply ||
                data?.data?.result || data?.data?.answer ||
                data?.data?.response ||
                (typeof data === 'string' && data.length > 2 ? data : null);
            if (ans && typeof ans === 'string' && ans.trim().length > 0) return ans.trim();
        } catch { /* try next */ }
    }
    return null;
}

module.exports = {
    command: 'ai',
    aliases: ['gpt', 'llama', 'mistral', 'gemini', 'ask', 'chat'],
    category: 'AI',
    description: '🤖 Ask JUNAID-MD↣³⁰² AI — supports all languages',
    usage: '.ai <question>\n.gpt <question>\n.gemini <question>\n.llama <question>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const cmd    = context.command || 'ai';
        const query  = args.join(' ').trim();

        if (!query) return sock.sendMessage(chatId, {
            text: `🤖 *JUNAID-MD↣³⁰² AI*\n\nUsage: \`.${cmd} <your question>\`\n\nExample:\n• \`.ai What is Islam?\`\n• \`.gpt Write a poem in Urdu\`\n• \`.gemini Explain quantum physics\``
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });

        // Pick API pool based on command
        let pool;
        if (['gemini'].includes(cmd))
            pool = [AI_APIS.delineThink, AI_APIS.deline, AI_APIS.gemini, AI_APIS.saqib1, AI_APIS.saqib3, AI_APIS.zell];
        else if (['llama'].includes(cmd))
            pool = [AI_APIS.delineThink, AI_APIS.deline, AI_APIS.llama, AI_APIS.saqib2, AI_APIS.saqib4, AI_APIS.gemini];
        else if (['mistral'].includes(cmd))
            pool = [AI_APIS.delineThink, AI_APIS.deline, AI_APIS.mistral, AI_APIS.saqib5, AI_APIS.saqib1, AI_APIS.gpt4];
        else
            pool = [AI_APIS.delineThink, AI_APIS.deline, AI_APIS.saqib1, AI_APIS.saqib2, AI_APIS.saqib3, AI_APIS.saqib4, AI_APIS.saqib5, AI_APIS.gpt4, AI_APIS.gemini, AI_APIS.zell];

        const answer = await tryApis(pool, query);

        if (!answer) {
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return sock.sendMessage(chatId, {
                text: '❌ *AI unavailable right now.* All APIs are down. Please try again in a moment.'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
        await sock.sendMessage(chatId, {
            text: `🤖 *JUNAID-MD↣³⁰² AI*\n\n${answer}\n\n_Powered by JUNAID-MD↣³⁰²_`
        }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-01-ai] Error loading ai.js:', e.message); }

/* ===== ai2.js ===== */
// Moved to standalone plugins/ai2.js for reliable board registration.

/* ===== ai-gpt.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

module.exports = {
    command: 'gpt',
    aliases: ['chat', 'ai'],
    category: 'ai',
    description: '🤖 Ask a question to GPT AI (primary: Deline Copilot)',
    usage: '.gpt <question>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please provide a query.\n\nExample: .gpt Write a basic HTML page'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });

        // ─── PRIMARY: Deline Copilot API (most reliable) ───────────────────
        const delineUrl = `https://api.deline.web.id/ai/copilot?text=${encodeURIComponent(query)}`;
        
        // ─── FALLBACKS (if Deline fails) ───────────────────────────────────
        const fallbackAPIs = [
            `https://api.agatz.xyz/api/gpt?message=${encodeURIComponent(query)}`,
            `https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent(query)}`,
            `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`,
            `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`,
            `https://api.ryzendesu.vip/api/ai/gpt?text=${encodeURIComponent(query)}`
        ];

        let answer = null;

        // Try primary
        try {
            const { data } = await axios.get(delineUrl, { timeout: 15000 });
            // Deline response format: { result: { text: "..." } } or { reply: "..." }
            const possibleAnswer = data?.result?.text || data?.result?.answer || data?.result ||
                                   data?.reply || data?.answer || data?.response || data?.text;
            if (possibleAnswer && typeof possibleAnswer === 'string' && possibleAnswer.trim()) {
                answer = possibleAnswer.trim();
            }
        } catch (err) {
            console.debug(`Deline API failed: ${err.message}`);
        }

        // If primary failed, try fallbacks
        if (!answer) {
            for (const apiUrl of fallbackAPIs) {
                try {
                    const { data } = await axios.get(apiUrl, { timeout: 15000 });
                    const possibleAnswer = data?.result || data?.message || data?.reply ||
                                           data?.data?.reply || data?.data?.result ||
                                           data?.answer || data?.response || data?.text;
                    if (possibleAnswer && typeof possibleAnswer === 'string' && possibleAnswer.trim()) {
                        answer = possibleAnswer.trim();
                        break;
                    }
                    if (typeof data === 'string' && data.length > 10) {
                        answer = data.trim();
                        break;
                    }
                } catch (err) {
                    console.debug(`Fallback API failed: ${apiUrl} - ${err.message}`);
                }
            }
        }

        if (!answer) {
            return await sock.sendMessage(chatId, {
                text: '❌ All AI APIs are currently down. Please try again later.'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { text: answer }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-01-ai] Error loading ai-gpt.js:', e.message); }

/* ===== ai-llama.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

module.exports = {
    command: 'llama',
    aliases: [],
    category: 'ai',
    description: 'Ask a question to Llama AI',
    usage: '.llama <question>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please provide a query.\n\nExample: .llama Explain quantum physics'
            }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '🦙', key: message.key } });

            const llamaAPIs = [
                `https://llama.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(query)}`,
                `https://api.giftedtech.my.id/api/ai/llama3?apikey=gifted&q=${encodeURIComponent(query)}`,
                `https://api.agatz.xyz/api/llama?message=${encodeURIComponent(query)}`
            ];

            let answer = '';
            for (const api of llamaAPIs) {
                try {
                    const { data } = await axios.get(api, { timeout: 10000 });
                    answer = data.data?.response || data.result || data.message || data.answer || data.response;
                    if (answer) break;
                } catch (e) { /* continue */ }
            }

            if (!answer) throw new Error('All Llama APIs failed');

            await sock.sendMessage(chatId, { text: answer }, { quoted: message });

        } catch (error) {
            console.error('Llama Command Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to get Llama response. Please try again later.'
            }, { quoted: message });
        }
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-01-ai] Error loading ai-llama.js:', e.message); }

/* ===== ai-mistral.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰² All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

module.exports = {
    command: 'mistral',
    aliases: [],
    category: 'ai',
    description: 'Ask a question to Mistral AI',
    usage: '.mistral <question>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please provide a query.\n\nExample: .mistral Explain neural networks'
            }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '🌀', key: message.key } });

            const mistralAPIs = [
                `https://mistral.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(query)}`,
                `https://api.giftedtech.my.id/api/ai/mistral?apikey=gifted&q=${encodeURIComponent(query)}`,
                `https://api.agatz.xyz/api/mistral?message=${encodeURIComponent(query)}`
            ];

            let answer = '';
            for (const api of mistralAPIs) {
                try {
                    const { data } = await axios.get(api, { timeout: 10000 });
                    answer = data.data?.response || data.result || data.message || data.answer || data.response;
                    if (answer) break;
                } catch (e) { /* continue */ }
            }

            if (!answer) throw new Error('All Mistral APIs failed');

            await sock.sendMessage(chatId, { text: answer }, { quoted: message });

        } catch (error) {
            console.error('Mistral Command Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to get Mistral response. Please try again later.'
            }, { quoted: message });
        }
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-01-ai] Error loading ai-mistral.js:', e.message); }

/* ===== aify.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCMUDuLikgGEPWQZN3u     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

module.exports = {
    command: 'aify',
    aliases: ['polish', 'rewrite', 'grammar'],
    category: 'ai',
    description: 'Improve or rewrite text using AI',
    usage: '.aify <text>',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const input = args.join(' ') || quotedText;

        if (!input) {
            await sock.sendMessage(chatId, {
                text: `✍️ *AI TEXT POLISHER*\n\n` +
                      `*Usage:* \`.aify <text>\` or reply to a message\n` +
                      `*Example:* \`.aify i am a student who want to improve my writing\``,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        try {
            await sock.sendMessage(chatId, {
                react: { text: '✍️', key: message.key }
            });

            const apis = [
                `https://api.agatz.xyz/api/gpt?message=Improve%20this%20text%20(make%20it%20better%2C%20fix%20grammar%2C%20and%20more%20professional)%3A%20${encodeURIComponent(input)}`,
                `https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=Polish%20this%20text%20(grammar%20and%20style)%3A%20${encodeURIComponent(input)}`
            ];

            let result = '';
            for (const api of apis) {
                try {
                    const { data } = await axios.get(api, { timeout: 15000 });
                    result = data.result || data.message || data.data || data.answer || data.response;
                    if (result) break;
                } catch (e) { /* ignore */ }
            }

            if (!result) throw new Error('No API response');

            await sock.sendMessage(chatId, {
                text: `*📝 Polished Text:*\n\n${result}`,
                ...channelInfo
            }, { quoted: message });

        } catch (error) {
            console.error('[AIFY] Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to polish text. Try again later.',
                ...channelInfo
            }, { quoted: message });
        }
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-01-ai] Error loading aify.js:', e.message); }

/* ===== aistory.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                         JUNAID-MD↣³⁰² v7.0 ULTRA                             *
 *          AI STORY GENERATOR — Stories in All Languages with TTS           *
 *****************************************************************************/
'use strict';
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
const gtts  = require('gtts');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

let ffmpegPath = 'ffmpeg';
try { ffmpegPath = require('ffmpeg-static') || 'ffmpeg'; } catch {}
try { if (!ffmpegPath || !fs.existsSync(ffmpegPath)) ffmpegPath = require('@ffmpeg-installer/ffmpeg').path; } catch {}

const SAQIB = 'https://apisaqib.vercel.app/api/v1';

const LANG_NAMES = {
    en: 'English', hi: 'Hindi', ur: 'Urdu', ar: 'Arabic',
    fr: 'French', es: 'Spanish', de: 'German'
};

async function generateStory(topic, lang) {
    const langName = LANG_NAMES[lang] || lang;
    const prompt = `Write a short, interesting story (150-200 words) in ${langName} about: "${topic}". 
Make it engaging and suitable for all ages. Use simple ${langName} language.`;

    const apis = [
        `${SAQIB}/1027?text=${encodeURIComponent(prompt)}`,
        `${SAQIB}/1026?query=${encodeURIComponent(prompt)}`,
        `${SAQIB}/1018?prompt=${encodeURIComponent(prompt)}`,
        `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(prompt)}`,
    ];

    for (const url of apis) {
        try {
            const { data } = await axios.get(url, { timeout: 20000 });
            const ans = data?.result?.answer || data?.result || data?.answer || data?.response || data?.reply;
            if (ans && typeof ans === 'string' && ans.length > 50) return ans.trim();
        } catch { /* next */ }
    }
    return null;
}

module.exports = {
    command: 'story',
    aliases: ['aistory', 'genStory', 'tale'],
    category: 'AI',
    description: '📖 Generate AI stories in any language with TTS option',
    usage: '.story <topic> [lang] [voice]\n.story a lost puppy hi voice\n.story space adventure en',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        if (!args.length) return sock.sendMessage(chatId, {
            text: `📖 *AI Story Generator*\n\nUsage:\n• \`.story <topic>\` — text story\n• \`.story <topic> hi\` — Hindi story\n• \`.story <topic> ur voice\` — Urdu story + voice\n\nExamples:\n• \`.story a brave lion\`\n• \`.story ek larke ki kahani ur voice\``
        }, { quoted: message });

        let lang = 'en', voice = false;
        const cleanArgs = [...args];

        if (cleanArgs.includes('voice')) { voice = true; cleanArgs.splice(cleanArgs.indexOf('voice'), 1); }
        const last = cleanArgs[cleanArgs.length - 1]?.toLowerCase();
        if (LANG_NAMES[last]) { lang = last; cleanArgs.pop(); }

        const topic = cleanArgs.join(' ').trim() || 'adventure';

        await sock.sendMessage(chatId, { react: { text: '📖', key: message.key } });
        await sock.sendMessage(chatId, {
            text: `📖 *Writing story about:* _${topic}_\n_Language: ${LANG_NAMES[lang] || lang}_...`
        }, { quoted: message });

        const story = await generateStory(topic, lang);
        if (!story) return sock.sendMessage(chatId, { text: '❌ Story generation failed.' }, { quoted: message });

        await sock.sendMessage(chatId, {
            text: `📖 *AI Story*\n\n${story}\n\n_— JUNAID-MD↣³⁰²_`
        }, { quoted: message });

        if (voice) {
            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
            const mp3  = path.join(tmpDir, `story-${Date.now()}.mp3`);
            const opus = mp3.replace('.mp3', '.ogg');
            try {
                await new Promise((res, rej) => new gtts(story.slice(0, 300), lang).save(mp3, e => e ? rej(e) : res()));
                const cmd = `"${ffmpegPath}" -y -i "${mp3}" -c:a libopus -b:a 64k -ar 48000 "${opus}" 2>/dev/null`;
                await execAsync(cmd).catch(() => {});
                const sendFile = fs.existsSync(opus) ? opus : mp3;
                const mime     = fs.existsSync(opus) ? 'audio/ogg; codecs=opus' : 'audio/mpeg';
                await sock.sendMessage(chatId, {
                    audio: { url: sendFile }, mimetype: mime, ptt: true
                }, { quoted: message });
            } catch (e) {
                await sock.sendMessage(chatId, { text: `❌ Voice generation failed: ${e.message}` });
            } finally {
                [mp3, opus].forEach(f => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {} });
            }
        }

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-01-ai] Error loading aistory.js:', e.message); }

/* ===== explain.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & JUNAID-MD↣³⁰²                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

module.exports = {
    command: 'explain_legacy',
    aliases: [],
    category: 'ai',
    description: 'Explain a piece of code or a concept',
    usage: '.explain <code or concept>',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const input = args.join(' ') || quotedText;

        if (!input) {
            await sock.sendMessage(chatId, {
                text: `🔍 *AI EXPLAINER*\n\n` +
                      `*Usage:* \`.explain <code or concept>\` or reply to a message\n` +
                      `*Example:* \`.explain async/await in JavaScript\``,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        try {
            await sock.sendMessage(chatId, {
                react: { text: '🔍', key: message.key }
            });

            const apis = [
                `https://api.agatz.xyz/api/gpt?message=Explain%20this%20in%20simple%20terms%3A%20${encodeURIComponent(input)}`,
                `https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=Explain%20this%20clearly%3A%20${encodeURIComponent(input)}`
            ];

            let explanation = '';
            for (const api of apis) {
                try {
                    const { data } = await axios.get(api, { timeout: 15000 });
                    explanation = data.result || data.message || data.data || data.answer || data.response;
                    if (explanation) break;
                } catch (e) { /* ignore */ }
            }

            if (!explanation) throw new Error('No API response');

            await sock.sendMessage(chatId, {
                text: `*🔍 Explanation:*\n\n${explanation}`,
                ...channelInfo
            }, { quoted: message });

        } catch (error) {
            console.error('[EXPLAIN] Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to explain. Try again later.',
                ...channelInfo
            }, { quoted: message });
        }
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-01-ai] Error loading explain.js:', e.message); }

/* ===== summarize.js ===== */
// Standalone plugins/summarize.js provides the working summarize command.
/* ===== deepseek.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 Abdul Rehman JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

// Free DeepSeek API endpoints (multiple fallbacks)
const API_ENDPOINTS = [
  'https://api.yanzbotz.live/api/ai/deepseek',
  'https://api.guruapi.tech/api/deepseek',
  'https://api.nexoracle.com/ai/deepseek'
];

module.exports = {
  command: 'deepseek',
  aliases: ['ds', 'deep', 'seek'],
  category: 'misc',
  description: '🧠 Chat with DeepSeek AI – free, intelligent responses',
  usage: '.deepseek <question>\nExample: .deepseek what is the meaning of life?',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;

    try {
      // Get prompt from quoted message or arguments
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
      const prompt = args.join(' ') || quotedText;

      if (!prompt) {
        return await sock.sendMessage(chatId, {
          text: '🧠 *DEEPSEEK AI*\n\n' +
                '*Usage:* `.deepseek <question>`\n' +
                '*Example:* `.deepseek tell me a joke`\n\n' +
                'You can also reply to a message containing the question.',
          ...channelInfo
        }, { quoted: message });
      }

      // Send typing indicator
      await sock.sendPresenceUpdate('composing', chatId);

      let responseText = null;
      let lastError = null;

      // Try each endpoint until success
      for (const endpoint of API_ENDPOINTS) {
        try {
          const url = `${endpoint}?${endpoint.includes('nexoracle') ? 'q' : 'query'}=${encodeURIComponent(prompt)}`;
          const res = await axios.get(url, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          // Extract response from various structures
          const data = res.data;
          responseText = data?.result || data?.response || data?.message || data?.text || data?.data?.result;

          if (responseText) break;
        } catch (e) {
          lastError = e;
        }
      }

      if (!responseText) {
        throw new Error(lastError?.message || 'All DeepSeek APIs failed');
      }

      await sock.sendMessage(chatId, {
        text: `🧠 *DeepSeek AI*\n\n${responseText}`,
        ...channelInfo
      }, { quoted: message });

    } catch (error) {
      console.error('[DEEPSEEK] Error:', error.message);
      await sock.sendMessage(chatId, {
        text: `❌ DeepSeek AI error: ${error.message}\n\nPlease try again later.`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-01-ai] Error loading deepseek.js:', e.message); }

/* ===== redxai.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                         JUNAID-MD↣³⁰² v7.0 ULTRA                             *
 *            REDX AI — Multi-Model Smart AI with Context Memory             *
 *****************************************************************************/
'use strict';
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

const DELINE = 'https://api.deline.web.id/ai';
const SAQIB  = 'https://apisaqib.vercel.app/api/v1';

const MEM = path.join(process.cwd(), 'data', 'redxai_memory.json');
const APIS = [
    // ── PRIMARY ── Deline Copilot Think (reasoning mode)
    { url: (q) => `${DELINE}/copilot-think?text=${encodeURIComponent(q)}`,
      extract: (d) => d?.result?.text },
    // ── SECONDARY ── Deline Copilot
    { url: (q) => `${DELINE}/copilot?text=${encodeURIComponent(q)}`,
      extract: (d) => d?.result },
    // ── FALLBACK ── Saqib endpoints
    { url: (q) => `${SAQIB}/1027?text=${encodeURIComponent(q)}`,  extract: null },
    { url: (q) => `${SAQIB}/1026?query=${encodeURIComponent(q)}`, extract: null },
    { url: (q) => `${SAQIB}/1024?q=${encodeURIComponent(q)}`,     extract: null },
    { url: (q) => `${SAQIB}/1023?q=${encodeURIComponent(q)}`,     extract: null },
    { url: (q) => `${SAQIB}/1018?prompt=${encodeURIComponent(q)}`, extract: null },
    { url: (q) => `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(q)}`,
      extract: null },
];

function loadMemory() {
    try { return JSON.parse(fs.readFileSync(MEM, 'utf8')); } catch { return {}; }
}
function saveMemory(data) {
    const dir = path.dirname(MEM);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MEM, JSON.stringify(data, null, 2));
}

async function askAI(question) {
    for (const api of APIS) {
        try {
            const { data } = await axios.get(api.url(question), { timeout: 15000 });
            // Use custom extractor if provided, else fall back to generic field scan
            let ans = api.extract
                ? api.extract(data)
                : (data?.result?.answer || data?.result?.text || data?.result ||
                   data?.answer || data?.response || data?.reply || data?.message ||
                   data?.data?.reply || data?.data?.result);
            if (ans && typeof ans === 'string' && ans.trim().length > 2) return ans.trim();
        } catch { /* try next */ }
    }
    return null;
}

const SYSTEM_PROMPT = `You are REDXBOT302, an advanced AI assistant created by JUNAID-MD↣³⁰². 
You are helpful, smart, and speak in the user's language. 
You represent the brand redxbot302. Always be professional and helpful.`;

module.exports = {
    command: 'redxai',
    aliases: ['rxai', 'botai', 'smartai'],
    category: 'AI',
    description: '🧠 REDXBOT302 Smart AI with memory & context',
    usage: '.redxai <question>\n.redxai clear — clear memory',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const sender = (message.key.participant || message.key.remoteJid);
        const sub    = args[0]?.toLowerCase();

        if (sub === 'clear') {
            const mem = loadMemory();
            delete mem[sender];
            saveMemory(mem);
            return sock.sendMessage(chatId, { text: '🧠 Memory cleared!' }, { quoted: message });
        }

        const query = args.join(' ').trim();
        if (!query) return sock.sendMessage(chatId, {
            text: `🧠 *JUNAID-MD↣³⁰² Smart AI*\n\nUsage: \`.redxai <question>\`\n\nFeatures:\n• Remembers context from last 5 messages\n• Speaks all languages\n• Smart, fast responses\n\n\`.redxai clear\` — reset memory`
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '🧠', key: message.key } });

        // Load memory
        const mem = loadMemory();
        if (!mem[sender]) mem[sender] = [];
        const history = mem[sender].slice(-5);

        // Build context prompt
        let contextPrompt = SYSTEM_PROMPT + '\n\nPrevious conversation:\n';
        history.forEach(h => { contextPrompt += `User: ${h.q}\nAssistant: ${h.a}\n`; });
        contextPrompt += `\nUser: ${query}\nAssistant:`;

        const answer = await askAI(contextPrompt);

        if (!answer) {
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return sock.sendMessage(chatId, { text: '❌ AI unavailable right now.' }, { quoted: message });
        }

        // Save to memory
        mem[sender].push({ q: query, a: answer, ts: Date.now() });
        if (mem[sender].length > 10) mem[sender] = mem[sender].slice(-10);
        saveMemory(mem);

        await sock.sendMessage(chatId, {
            text: `🧠 *JUNAID-MD↣³⁰² AI*\n\n${answer}`
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-01-ai] Error loading redxai.js:', e.message); }

/* ===== gpt.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');

module.exports = {
    command: 'gpt',
    aliases: ['chat'],
    category: 'ai',
    description: '🤖 Ask a question to GPT AI (primary: Deline Copilot)',
    usage: '.gpt <question>',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please provide a query.\n\nExample: .gpt Write a basic HTML page'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });

        // ─── PRIMARY: Deline Copilot API (most reliable) ───────────────────
        const delineUrl = `https://api.deline.web.id/ai/copilot?text=${encodeURIComponent(query)}`;
        
        // ─── FALLBACKS (if Deline fails) ───────────────────────────────────
        const fallbackAPIs = [
            `https://api.agatz.xyz/api/gpt?message=${encodeURIComponent(query)}`,
            `https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent(query)}`,
            `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`,
            `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`,
            `https://api.ryzendesu.vip/api/ai/gpt?text=${encodeURIComponent(query)}`
        ];

        let answer = null;

        // Try primary
        try {
            const { data } = await axios.get(delineUrl, { timeout: 15000 });
            // Deline response format: { result: { text: "..." } } or { reply: "..." }
            const possibleAnswer = data?.result?.text || data?.result?.answer || data?.result ||
                                   data?.reply || data?.answer || data?.response || data?.text;
            if (possibleAnswer && typeof possibleAnswer === 'string' && possibleAnswer.trim()) {
                answer = possibleAnswer.trim();
            }
        } catch (err) {
            console.debug(`Deline API failed: ${err.message}`);
        }

        // If primary failed, try fallbacks
        if (!answer) {
            for (const apiUrl of fallbackAPIs) {
                try {
                    const { data } = await axios.get(apiUrl, { timeout: 15000 });
                    const possibleAnswer = data?.result || data?.message || data?.reply ||
                                           data?.data?.reply || data?.data?.result ||
                                           data?.answer || data?.response || data?.text;
                    if (possibleAnswer && typeof possibleAnswer === 'string' && possibleAnswer.trim()) {
                        answer = possibleAnswer.trim();
                        break;
                    }
                    if (typeof data === 'string' && data.length > 10) {
                        answer = data.trim();
                        break;
                    }
                } catch (err) {
                    console.debug(`Fallback API failed: ${apiUrl} - ${err.message}`);
                }
            }
        }

        if (!answer) {
            return await sock.sendMessage(chatId, {
                text: '❌ All AI APIs are currently down. Please try again later.'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { text: answer }, { quoted: message });
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-01-ai] Error loading gpt.js:', e.message); }

module.exports = _bundle;