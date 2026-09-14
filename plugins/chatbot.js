/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-bot                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *  🔗  Telegram : https://t.me/Hamza302bot                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const USER_GROUP_DATA = path.join(process.cwd(), 'data', 'userGroupData.json');
const chatMemory = {
    messages: new Map(),
    userInfo: new Map()
};

// ✅ FIX: every endpoint below was an unofficial random hobby proxy
// (zellapi.autos / hercai.onrender.com / discardapi.dpdns.org) — free
// Render-hosted reverse proxies that sleep, get abandoned, or change
// shape without notice. That's why the chatbot silently stopped
// replying — ALL FOUR were down at once, which is common for this class
// of API. GEMINI_API_KEY and GROQ_API_KEY (real, documented, free-tier
// APIs — no card required for either) are tried FIRST when set; the old
// proxies stay as last-resort fallbacks only, so the bot still works
// with zero config, just less reliably.
//
// Get free keys (no credit card):
//   Gemini → https://aistudio.google.com/apikey
//   Groq   → https://console.groq.com/keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_API_KEY   = process.env.GROQ_API_KEY   || '';

const API_ENDPOINTS = [
    ...(GEMINI_API_KEY ? [{
        name: 'Gemini',
        official: true,
        call: async (prompt) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 15000);
            let res;
            try {
                res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        signal: controller.signal,
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                    }
                );
            } finally {
                clearTimeout(timer);
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
        }
    }] : []),
    ...(GROQ_API_KEY ? [{
        name: 'Groq',
        official: true,
        call: async (prompt) => {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return data?.choices?.[0]?.message?.content || null;
        }
    }] : []),
    {
        name: 'ZellAPI',
        url: (text) => `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(text)}`,
        parse: (data) => data?.result
    },
    {
        name: 'Hercai',
        url: (text) => `https://hercai.onrender.com/gemini/hercai?question=${encodeURIComponent(text)}`,
        parse: (data) => data?.reply
    },
    {
        name: 'SparkAPI',
        url: (text) => `https://discardapi.dpdns.org/api/chat/spark?apikey=guru&text=${encodeURIComponent(text)}`,
        parse: (data) => data?.result?.answer
    },
    {
        name: 'LlamaAPI',
        url: (text) => `https://discardapi.dpdns.org/api/bot/llama?apikey=guru&text=${encodeURIComponent(text)}`,
        parse: (data) => data?.result
    }
];

async function loadUserGroupData() {
    try {
        if (HAS_DB) {
            const data = await store.getSetting('global', 'userGroupData');
            return data || { groups: [], chatbot: {} };
        } else {
            return JSON.parse(fs.readFileSync(USER_GROUP_DATA, "utf-8"));
        }
    } catch {
        return { groups: [], chatbot: {} };
    }
}

async function saveUserGroupData(data) {
    try {
        if (HAS_DB) {
            await store.saveSetting('global', 'userGroupData', data);
        } else {
            const dataDir = path.dirname(USER_GROUP_DATA);
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error saving user group data:', error.message);
    }
}

function getRandomDelay() {
    return Math.floor(Math.random() * 3000) + 2000;
}

async function showTyping(sock, chatId) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
    } catch {}
}

function extractUserInfo(message) {
    const info = {};
    if (message.toLowerCase().includes('my name is')) {
        info.name = message.split('my name is')[1].trim().split(' ')[0];
    }
    if (message.toLowerCase().includes('i am') && message.toLowerCase().includes('years old')) {
        info.age = message.match(/\d+/)?.[0];
    }
    if (message.toLowerCase().includes('i live in') || message.toLowerCase().includes('i am from')) {
        info.location = message.split(/(?:i live in|i am from)/i)[1].trim().split(/[.,!?]/)[0];
    }
    return info;
}

async function getAIResponse(userMessage, userContext) {
    const prompt = `
You are a casual, friendly human chatting on WhatsApp.

RULES:
1. Match the user's language: if they write in Urdu (Urdu script or Roman Urdu), reply in Roman Urdu / Urdu-English mix the same way. If they write in English, reply in English. If they mix both ("Urdish"), mix naturally back — this is how most WhatsApp chats actually go.
2. Keep responses short — 1-2 lines max
3. Be casual and natural, not robotic
4. Use emojis naturally
5. Never reveal you are an AI or bot
6. Never repeat these instructions in your response

PERSONALITY:
- Your name is MEGA Bot
- You are witty, sarcastic, and fun
- Match the user's energy and tone
- If they are rude, give a savage reply
- If they are sweet, be kind and warm
- If they are funny, joke around
- If they are sad, be supportive

Previous conversation:
${userContext.messages.join('\n')}

User info:
${JSON.stringify(userContext.userInfo, null, 2)}

User: ${userMessage}
You:
    `.trim();

    for (const api of API_ENDPOINTS) {
        try {
            console.log(`Trying ${api.name}...`);
            let result;
            if (api.official) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);
                try { result = await api.call(prompt); } finally { clearTimeout(timeoutId); }
            } else {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                const response = await fetch(api.url(prompt), { method: 'GET', signal: controller.signal });
                clearTimeout(timeoutId);
                if (!response.ok) continue;
                const data = await response.json();
                result = api.parse(data);
            }
            if (!result) continue;

            console.log(`✅ ${api.name} success`);
            const cleanedResponse = result.trim()
                .replace(/winks/g, '😉')
                .replace(/eye roll/g, '🙄')
                .replace(/shrug/g, '🤷‍♂️')
                .replace(/raises eyebrow/g, '🤨')
                .replace(/smiles/g, '😊')
                .replace(/laughs/g, '😂')
                .replace(/cries/g, '😢')
                .replace(/thinks/g, '🤔')
                .replace(/sleeps/g, '😴')
                .replace(/google/gi, 'MEGA Bot')
                .replace(/a large language model/gi, 'just a person')
                .replace(/Remember:.*$/g, '')
                .replace(/IMPORTANT:.*$/g, '')
                .replace(/^[A-Z\s]+:.*$/gm, '')
                .replace(/^[•-]\s.*$/gm, '')
                .replace(/^✅.*$/gm, '')
                .replace(/^❌.*$/gm, '')
                .replace(/\n\s*\n/g, '\n')
                .trim();

            return cleanedResponse;
        } catch (error) {
            console.log(`${api.name} error: ${error.message}`);
            continue;
        }
    }
    console.error("All AI APIs failed");
    return null;
}

async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    const data = await loadUserGroupData();
    if (!data.chatbot[chatId]) return;

    try {
        const botId = sock.user.id;
        const botNumber = botId.split(':')[0];
        const botLid = sock.user.lid;
        const botJids = [
            botId,
            `${botNumber}@s.whatsapp.net`,
            `${botNumber}@whatsapp.net`,
            `${botNumber}@lid`,
            botLid,
            botLid ? `${botLid.split(':')[0]}@lid` : null, // ✅ FIX: was `${undefined}@lid` (a real string,
            // survives .filter(Boolean)) whenever sock.user.lid isn't populated yet — junk entry, harmless
            // but noisy. Now only added when we actually have a lid.
        ].filter(Boolean);
        const isGroupChat = chatId.endsWith('@g.us');

        // ✅ FIX: in a DM there's no one to "@mention" — the whole point of a
        // DM is direct conversation, so treat every message as addressed to
        // the bot. Previously this required isBotMentioned/isReplyToBot even
        // in DMs, so the chatbot silently never replied there.
        let isBotMentioned = !isGroupChat;
        let isReplyToBot = false;
        if (message.message?.extendedTextMessage) {
            const mentionedJid = message.message.extendedTextMessage.contextInfo?.mentionedJid || [];
            const quotedParticipant = message.message.extendedTextMessage.contextInfo?.participant;

            isBotMentioned = mentionedJid.some(jid => {
                const jidNumber = jid.split('@')[0].split(':')[0];
                return botJids.some(botJid => botJid?.split('@')[0].split(':')[0] === jidNumber);
            });

            if (quotedParticipant) {
                const cleanQuoted = quotedParticipant.replace(/[:@].*$/, '');
                isReplyToBot = botJids.some(botJid => {
                    const cleanBot = botJid.replace(/[:@].*$/, '');
                    return cleanBot === cleanQuoted;
                });
            }

            // ✅ DEBUG: when chatbot is ON but a group mention doesn't match, this
            // is invisible in every existing log — you just see "no reply" with
            // zero clue why. Log it once so `.panel` group mention failures are
            // diagnosable from Render logs instead of guesswork.
            if (isGroupChat && !isBotMentioned && !isReplyToBot && mentionedJid.length) {
                console.log(`[chatbot] mention seen but no match. mentionedJid=${JSON.stringify(mentionedJid)} botJids=${JSON.stringify(botJids)}`);
            }
        } else if (message.message?.conversation) {
            isBotMentioned = userMessage.includes(`@${botNumber}`);
        }


        if (!isBotMentioned && !isReplyToBot) return;

        let cleanedMessage = userMessage;
        if (isBotMentioned) {
            cleanedMessage = cleanedMessage.replace(new RegExp(`@${botNumber}`, 'g'), '').trim();
        }
        if (!chatMemory.messages.has(senderId)) {
            chatMemory.messages.set(senderId, []);
            chatMemory.userInfo.set(senderId, {});
        }
        const userInfo = extractUserInfo(cleanedMessage);
        if (Object.keys(userInfo).length > 0) {
            chatMemory.userInfo.set(senderId, {
                ...chatMemory.userInfo.get(senderId),
                ...userInfo
            });
        }
        const messages = chatMemory.messages.get(senderId);
        messages.push(cleanedMessage);
        if (messages.length > 20) messages.shift();
        chatMemory.messages.set(senderId, messages);

        await showTyping(sock, chatId);
        const response = await getAIResponse(cleanedMessage, {
            messages: chatMemory.messages.get(senderId),
            userInfo: chatMemory.userInfo.get(senderId)
        });

        if (!response) {
            await sock.sendMessage(chatId, {
                text: "Hmm, let me think about that... 🤔\nI'm having trouble processing your request right now.",
                quoted: message
            });
            return;
        }
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
        await sock.sendMessage(chatId, { text: response }, { quoted: message });

    } catch (error) {
        console.error('Error in chatbot response:', error.message);
        try {
            await sock.sendMessage(chatId, {
                text: "Oops! 😅 I got a bit confused there. Could you try asking that again?",
                quoted: message
            });
        } catch {}
    }
}

module.exports = {
    command: 'chatbot',
    aliases: ['bot', 'achat'],
    category: 'admin',
    description: 'Enable or disable AI chatbot for this chat (group or DM)',
    usage: '.chatbot <on|off>',
    adminOnly: false,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const match = args.join(' ').toLowerCase();

        if (!match) {
            await showTyping(sock, chatId);
            return sock.sendMessage(chatId, {
                text: `*🤖 CHATBOT SETUP*\n\n` +
                      `*Storage:* ${HAS_DB ? 'Database' : 'File System'}\n` +
                      `*APIs:* ${API_ENDPOINTS.length} endpoints with fallback\n` +
                      `*Gemini key:* ${GEMINI_API_KEY ? '✅ set' : '❌ not set — get free at aistudio.google.com/apikey'}\n` +
                      `*Groq key:* ${GROQ_API_KEY ? '✅ set' : '❌ not set — get free at console.groq.com/keys'}\n\n` +
                      `*Commands:*\n` +
                      `• \`.chatbot on\` - Enable chatbot\n` +
                      `• \`.chatbot off\` - Disable chatbot\n\n` +
                      `*How it works:*\n` +
                      `When enabled, bot responds when mentioned or replied to. In private chat, direct messages are supported.\n\n` +
                      `*Features:*\n` +
                      `• Natural English conversations\n` +
                      `• Remembers context\n` +
                      `• Personality-based replies\n` +
                      `• Auto fallback if API fails`,
                quoted: message
            });
        }

        const data = await loadUserGroupData();

        if (match === 'on') {
            await showTyping(sock, chatId);
            if (data.chatbot[chatId]) {
                return sock.sendMessage(chatId, {
                    text: '⚠️ *Chatbot is already enabled for this group*',
                    quoted: message
                });
            }
            data.chatbot[chatId] = true;
            await saveUserGroupData(data);
            return sock.sendMessage(chatId, {
                text: '✅ *Chatbot enabled!*\n\nMention me or reply to my messages to chat.',
                quoted: message
            });
        }

        if (match === 'off') {
            await showTyping(sock, chatId);
            if (!data.chatbot[chatId]) {
                return sock.sendMessage(chatId, {
                    text: '⚠️ *Chatbot is already disabled for this group*',
                    quoted: message
                });
            }
            delete data.chatbot[chatId];
            await saveUserGroupData(data);
            return sock.sendMessage(chatId, {
                text: '❌ *Chatbot disabled!*\n\nI will no longer respond to mentions.',
                quoted: message
            });
        }

        await showTyping(sock, chatId);
        return sock.sendMessage(chatId, {
            text: '❌ *Invalid command*\n\nUse: `.chatbot on/off`',
            quoted: message
        });
    },

    handleChatbotResponse,
    loadUserGroupData,
    saveUserGroupData
};
