'use strict';
// AUTO-GENERATED BUNDLE: cat-15-media
// Contains: audiofx.js, tts.js, tts2.js, toaudio.js, topdf.js, todocument.js, canvas.js, photoeditor.js, hd.js, remini.js, removebg.js, ss.js, screenshot.js, sfile.js, vnote.js, viewonce.js, readmore.js, forwarded.js, handwriting.js, poetry.js, novel.js, sound.js, sound2.js, reverse.js, slider.js

const _bundle = [];


/* ===== audiofx.js ===== */
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

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const effectsMenu =
'🎧 *Audio Effects* 🎧\n\n' +
'• *bass*\n' +
'• *blown*\n' +
'• *deep*\n' +
'• *earrape*\n' +
'• *fast*\n' +
'• *fat*\n' +
'• *nightcore*\n' +
'• *reverse*\n' +
'• *robot*\n' +
'• *slow*\n' +
'• *chipmunk*\n\n' +
'📌 *Usage:*\n' +
'Reply to an audio / voice note with:\n' +
'Example: *.audiofx bass*';

function getFilter(cmd) {
    if (/bass/i.test(cmd)) return 'equalizer=f=94:width_type=o:width=2:g=30';
    if (/blown/i.test(cmd)) return 'acrusher=.1:1:64:0:log';
    if (/deep/i.test(cmd)) return 'atempo=1,asetrate=44500*2/3';
    if (/earrape/i.test(cmd)) return 'volume=12';
    if (/fast/i.test(cmd)) return 'atempo=1.63';
    if (/fat/i.test(cmd)) return 'atempo=1.6';
    if (/nightcore/i.test(cmd)) return 'atempo=1.06';
    if (/reverse/i.test(cmd)) return 'areverse';
    if (/robot/i.test(cmd))
        return "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)'";
    if (/slow/i.test(cmd)) return 'atempo=0.7';
    if (/tupai|squirrel|chipmunk/i.test(cmd)) return 'atempo=0.5';
    return null;
}

async function getAudio(message) {
    const m = message.message || {};
    const quoted = m.extendedTextMessage?.contextInfo?.quotedMessage;
    const audio = m.audioMessage || m.voiceMessage || quoted?.audioMessage || quoted?.voiceMessage;
    if (!audio) return null;

    const stream = await downloadContentFromMessage(audio, 'audio');
    const chunks = [];
    for await (const c of stream) chunks.push(c);
    return Buffer.concat(chunks);
}

module.exports = {
    command: 'audiofx',
    aliases: ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'chipmunk'],
    category: 'menu',
    description: 'Apply audio effects to voice notes',
    usage: '.bass / .nightcore (reply to audio)',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const cmd = message.body || args.join(' ');
        const filter = getFilter(cmd);

        const audioBuffer = await getAudio(message);
        if (!audioBuffer || !filter) {
            return await sock.sendMessage(chatId, { text: effectsMenu }, { quoted: message });
        }

        try {
            const tmp = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

            const input = path.join(tmp, `in_${Date.now()}.ogg`);
            const output = path.join(tmp, `out_${Date.now()}.ogg`);

            fs.writeFileSync(input, audioBuffer);

            exec(
                `ffmpeg -y -i "${input}" -af "${filter},aresample=48000,asetpts=N/SR" -c:a libopus -b:a 64k -ac 1 "${output}"`,
                async (error) => {
                    if (error) {
                        await sock.sendMessage(chatId, { text: '❌ Audio processing failed.' }, { quoted: message });
                        return;
                    }
                    const out = fs.readFileSync(output);
                    await sock.sendMessage(chatId, { audio: out, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: message });
                    try { fs.unlinkSync(input); } catch {}
                    try { fs.unlinkSync(output); } catch {}
                }
            );
        } catch {
            await sock.sendMessage(chatId, { text: '❌ Audio processing failed. Make sure ffmpeg is installed.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading audiofx.js:', e.message); }

/* ===== tts.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const axios = require('axios');

// ✅ FIX: WhatsApp frequently refuses to play a plain audio/mpeg (mp3) message
// inline — clients expect ogg/opus for the audio player to render a working
// waveform. Convert with ffmpeg (path set by lib/ffmpegSetup at boot).
// Works on a Buffer in, Buffer out — no dependency on the caller's tmp path.
async function convertMp3BufferToOggBuffer(mp3Buffer) {
    const tag       = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const tmpDir    = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const inPath  = path.join(tmpDir, `tts_in_${tag}.mp3`);
    const outPath = path.join(tmpDir, `tts_out_${tag}.ogg`);
    fs.writeFileSync(inPath, mp3Buffer);
    try {
        const bin = process.env.FFMPEG_PATH || 'ffmpeg';
        await exec(`"${bin}" -i "${inPath}" -c:a libopus -ar 24000 -b:a 32k -ac 1 -f ogg "${outPath}" -y`);
        return fs.readFileSync(outPath);
    } finally {
        if (fs.existsSync(inPath))  fs.unlinkSync(inPath);
        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    }
}

// ✅ FIX: gtts hits Google Translate's TTS endpoint directly, which many
// cloud hosts (Render/Railway/Heroku shared ranges included) get rate
// limited or blocked on — that's a hosting-IP problem, not something fixable
// in this file alone, so it needs a real fallback provider, not just a
// retry. StreamElements' public TTS API is a separate, independent service
// most WhatsApp bots already rely on for exactly this reason.
function gttsToBuffer(text, language) {
    return new Promise((resolve, reject) => {
        const tts = new gTTS(text, language);
        const stream = tts.stream();
        const chunks = [];
        stream.on('data', (c) => chunks.push(c));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

const STREAMELEMENTS_VOICES = {
    en: 'Brian', es: 'Enrique', fr: 'Celine', de: 'Marlene', it: 'Giorgio',
    pt: 'Ricardo', ru: 'Maxim', ja: 'Takumi', ko: 'Seoyeon', ar: 'Zeina', hi: 'Aditi'
};
async function streamElementsToBuffer(text, language) {
    const voice = STREAMELEMENTS_VOICES[language] || 'Brian';
    const { data } = await axios.get('https://api.streamelements.com/kappa/v2/speech', {
        params: { voice, text }, responseType: 'arraybuffer', timeout: 20000
    });
    if (!data || !data.length) throw new Error('StreamElements returned empty audio');
    return Buffer.from(data);
}

// ✅ Third provider: direct Google Translate REST endpoint (tw-ob client).
// Different network path than the gtts package — works when gtts's own
// HTTP stack is blocked but a plain axios GET isn't.
async function googleRestToBuffer(text, language) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 200))}&tl=${language}&client=tw-ob&ttsspeed=1`;
    const { data } = await axios.get(url, {
        responseType: 'arraybuffer', timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', Referer: 'https://translate.google.com/' }
    });
    if (!data || !data.length) throw new Error('Google REST TTS returned empty audio');
    return Buffer.from(data);
}

module.exports = {
    command: 'tts',
    aliases: ['texttospeech', 'speak'],
    category: 'tools',
    description: 'Convert text to speech and send as an audio message.',
    usage: '.tts <text> [language code]\nExample: .tts Hello world (English)\n.tts Bonjour le monde fr (French)\n.tts سلام دنیا ur (Urdu)',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;

        if (!args.length) {
            return sock.sendMessage(
                chatId,
                { text: '*Please provide text for TTS.*\nExample: `.tts Hello world`\nWith language: `.tts Hola mundo es`', ...channelInfo },
                { quoted: message }
            );
        }

        let language = 'en';
        if (args.length > 1 && /^[a-z]{2}$/.test(args[args.length - 1])) {
            language = args.pop();
        }
        const text = args.join(' ').trim();

        try {
            // Primary: Google Translate TTS (gtts) → StreamElements →
            // Google REST. Any provider that returns audio wins, so .tts
            // keeps working even when one upstream is blocked.
            let mp3Buffer, providerUsed = 'unknown';
            try {
                mp3Buffer = await gttsToBuffer(text, language);
                providerUsed = 'gtts';
            } catch (e1) {
                try {
                    console.warn('[TTS] gtts failed, trying StreamElements:', e1.message);
                    mp3Buffer = await streamElementsToBuffer(text, language);
                    providerUsed = 'streamelements';
                } catch (e2) {
                    console.warn('[TTS] StreamElements failed, trying Google REST:', e2.message);
                    mp3Buffer = await googleRestToBuffer(text, language);
                    providerUsed = 'google-rest';
                }
            }
            if (!mp3Buffer || !mp3Buffer.length) throw new Error('All TTS providers returned empty audio');

            // Convert to ogg/opus for reliable in-app playback; fall back to
            // sending the raw mp3 buffer if ffmpeg isn't available.
            let audioBuffer = mp3Buffer, mimetype = 'audio/mpeg', ptt = false;
            try {
                audioBuffer = await convertMp3BufferToOggBuffer(mp3Buffer);
                mimetype = 'audio/ogg; codecs=opus';
                ptt = true;
            } catch (convErr) {
                console.warn('[TTS] ffmpeg conversion failed, sending mp3 as-is:', convErr.message);
            }

            await sock.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype,
                ptt,
                fileName: ptt ? undefined : 'tts.mp3',
                ...channelInfo
            }, { quoted: message });

        } catch (err) {
            console.error('TTS error:', err.message);
            await sock.sendMessage(
                chatId,
                { text: `❌ Failed to generate TTS audio.\nReason: ${err.message}`, ...channelInfo },
                { quoted: message }
            );
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading tts.js:', e.message); }

/* ===== tts2.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                                                            *
 *                                                                           *
 *****************************************************************************/

const axios = require('axios');
const googleTTS = require('google-tts-api');
const FormData = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const store = require('../lib/lightweight_store');

// Fish Audio API (for voice cloning)
const FISH_API_KEY = '10af77300da14d0fb520eee5f06462aa';
const FISH_API_BASE = 'https://api.fish.audio/v1';

// Google Translate TTS (free, no key)
const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts';

module.exports = {
    command: 'tts2',
    aliases: ['voiceclone', 'fishaudio', 'say'],
    category: 'ai',
    description: 'Text to speech with voice cloning (supports Urdu/Hindi)',
    usage: 
        '.tts2 speak <text>                – Urdu TTS (default)\n' +
        '.tts2 speak-urdu <text>            – Urdu/Hindi TTS\n' +
        '.tts2 clone <name>                  – Clone voice from replied audio\n' +
        '.tts2 list-voices                    – List your cloned voices\n' +
        '.tts2 speak-cloned <name> <text>     – Use cloned voice\n' +
        '.tts2 delete <name>                   – Delete a cloned voice\n' +
        '.tts2 guide                           – Detailed guide',
    ownerOnly: false,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (context.senderId || message.key.participant || message.key.remoteJid).split(':')[0];
        const channelInfo = context.channelInfo || {};

        const logAndReply = async (msg, isError = false) => {
            console.log(`[TTS2] ${msg}`);
            await sock.sendMessage(chatId, { 
                text: isError ? `❌ ${msg}` : `✅ ${msg}`, 
                ...channelInfo 
            }, { quoted: message });
        };

        if (args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `🎤 *TTS2 Voice Commands*

• \`.tts2 speak Hello world\` – English TTS
• \`.tts2 speak-urdu سلام دنیا\` – Urdu/Hindi TTS
• \`.tts2 clone MyVoice\` – Clone from replied audio
• \`.tts2 list-voices\` – Your cloned voices
• \`.tts2 speak-cloned MyVoice Hello\` – Use cloned voice
• \`.tts2 delete MyVoice\` – Delete a voice
• \`.tts2 guide\` – Detailed instructions`,
                ...channelInfo
            }, { quoted: message });
        }

        const subCmd = args[0].toLowerCase();

        // ==================== GUIDE ====================
        if (subCmd === 'guide') {
            return await sock.sendMessage(chatId, {
                text: `🎤 *TTS2 Voice Guide*

1. **Basic TTS (Free)**:
   • English: \`.tts2 speak Hello world\`
   • Urdu/Hindi: \`.tts2 speak-urdu سلام دنیا\`

2. **Voice Cloning**:
   • Send any voice note/audio
   • Reply with \`.tts2 clone VoiceName\`
   • Wait 10-20 seconds for processing

3. **Use Cloned Voice**:
   • \`.tts2 speak-cloned VoiceName Hello\`

4. **List Voices**: \`.tts2 list-voices\`

5. **Delete Voice**: \`.tts2 delete VoiceName\`

*Uses Fish Audio (20k credits/month) + Google TTS (free)*`,
                ...channelInfo
            }, { quoted: message });
        }

        // ==================== ROBUST GOOGLE TTS ====================
        // Uses the installed google-tts-api package instead of calling the
        // translate_tts endpoint directly. It also supports text longer than
        // Google's single-request limit by generating multiple chunks.
        const sendGoogleSpeech = async (text, lang, label) => {
            const cleanText = String(text || '').trim();
            if (!cleanText) return await logAndReply(`Usage: .tts2 ${lang === 'ur' ? 'speak-urdu آپ کیسے ہیں' : 'speak Hello world'}`, true);
            if (cleanText.length > 1500) return await logAndReply('Text is too long. Please keep it under 1500 characters.', true);

            await logAndReply(`Generating ${label} speech...`);
            try {
                const options = { lang, slow: false, host: 'https://translate.google.com', timeout: 20000, splitPunct: ',.?;!،۔؟' };
                const parts = await googleTTS.getAllAudioBase64(cleanText, options);
                if (!Array.isArray(parts) || !parts.length) throw new Error('TTS returned no audio');
                const audioBuffer = Buffer.concat(parts.map(x => Buffer.from(x.base64, 'base64')));
                if (!audioBuffer.length) throw new Error('Generated audio is empty');

                await sock.sendMessage(chatId, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(`[TTS2] ${label} TTS error:`, error);
                // Small direct-URL fallback for regional Google TTS issues.
                try {
                    const url = googleTTS.getAudioUrl(cleanText.slice(0, 200), { lang, slow: false, host: 'https://translate.google.com.cn' });
                    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } });
                    const audioBuffer = Buffer.from(response.data);
                    if (!audioBuffer.length) throw new Error('Fallback returned empty audio');
                    await sock.sendMessage(chatId, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: false, ...channelInfo }, { quoted: message });
                } catch (fallbackError) {
                    await logAndReply(`TTS failed: ${fallbackError.message}`, true);
                }
            }
        };

        if (subCmd === 'speak') {
            return await sendGoogleSpeech(args.slice(1).join(' '), 'ur', 'Urdu');
        }

        if (subCmd === 'speak-urdu') {
            // Urdu is the default; Hindi text is automatically routed to hi.
            const text = args.slice(1).join(' ');
            const lang = /[\u0900-\u097F]/.test(text) ? 'hi' : 'ur';
            return await sendGoogleSpeech(text, lang, lang === 'hi' ? 'Hindi' : 'Urdu');
        }

        // Friendly shortcut: `.tts2 Hello world` also works.
        if (!['guide', 'clone', 'list-voices', 'speak-cloned', 'delete'].includes(subCmd)) {
            return await sendGoogleSpeech(args.join(' '), /[\u0900-\u097F]/.test(args.join(' ')) ? 'hi' : 'ur', /[\u0900-\u097F]/.test(args.join(' ')) ? 'Hindi' : 'Urdu');
        }

        // ==================== VOICE CLONING ====================
        if (subCmd === 'clone') {
            if (args.length < 2) {
                return await logAndReply('Please provide a name for the cloned voice.', true);
            }
            const voiceName = args.slice(1).join(' ').trim();

            // Check if replied to an audio message
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isAudio = quotedMsg?.audioMessage || quotedMsg?.voiceMessage;
            if (!isAudio) {
                return await logAndReply('Please reply to an audio/voice message to clone.', true);
            }

            await logAndReply('Downloading reference audio...');

            try {
                // Download the audio
                const buffer = await downloadMediaMessage(
                    { 
                        key: { 
                            id: message.message.extendedTextMessage.contextInfo.stanzaId,
                            remoteJid: message.key.remoteJid,
                            fromMe: false
                        },
                        message: quotedMsg 
                    },
                    'buffer',
                    {}
                );

                await logAndReply('Uploading to Fish Audio for cloning...');

                // Prepare multipart form
                const form = new FormData();
                form.append('name', voiceName);
                form.append('audio', buffer, 'reference.mp3');
                form.append('visibility', 'private');

                const response = await axios.post(`${FISH_API_BASE}/voices`, form, {
                    headers: {
                        ...form.getHeaders(),
                        'Authorization': `Bearer ${FISH_API_KEY}`,
                    },
                    timeout: 60000,
                });

                const voice = response.data;
                await logAndReply(`✅ Voice cloned!\nName: ${voice.name}\nID: ${voice.voiceId}\n\nUse: .tts2 speak-cloned ${voice.name} <text>`);
                
            } catch (error) {
                console.error('[TTS2] Clone error:', error.response?.data || error.message);
                await logAndReply(`Clone failed: ${error.response?.data?.message || error.message}`, true);
            }
            return;
        }

        // ==================== LIST VOICES ====================
        if (subCmd === 'list-voices') {
            try {
                const response = await axios.get(`${FISH_API_BASE}/voices`, {
                    headers: { 'Authorization': `Bearer ${FISH_API_KEY}` },
                    timeout: 10000
                });
                const voices = response.data;
                
                if (!voices.length) {
                    return await logAndReply('No saved voices. Clone one first with `.tts2 clone <name>`');
                }
                
                let msg = '🗣️ *Your Voices*\n\n';
                voices.forEach(v => {
                    msg += `• ${v.name}\n`;
                });
                await logAndReply(msg);
                
            } catch (error) {
                await logAndReply(`Failed to list voices: ${error.message}`, true);
            }
            return;
        }

        // ==================== SPEAK WITH CLONED VOICE ====================
        if (subCmd === 'speak-cloned') {
            if (args.length < 3) {
                return await logAndReply('Usage: `.tts2 speak-cloned VoiceName Hello world`', true);
            }
            const voiceName = args[1];
            const text = args.slice(2).join(' ');

            await logAndReply(`Generating speech with voice "${voiceName}"...`);

            try {
                // First get voice ID
                const list = await axios.get(`${FISH_API_BASE}/voices`, {
                    headers: { 'Authorization': `Bearer ${FISH_API_KEY}` }
                });
                const voice = list.data.find(v => v.name.toLowerCase() === voiceName.toLowerCase());
                
                if (!voice) {
                    return await logAndReply(`Voice "${voiceName}" not found. Use .tts2 list-voices`, true);
                }

                // Synthesize
                const response = await axios.post(`${FISH_API_BASE}/tts`, {
                    text: text,
                    voiceId: voice.voiceId,
                    format: 'mp3',
                }, {
                    headers: {
                        'Authorization': `Bearer ${FISH_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    responseType: 'arraybuffer',
                    timeout: 30000,
                });

                const audioBuffer = Buffer.from(response.data);

                await sock.sendMessage(chatId, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    caption: `🔊 "${voiceName}" says: ${text}`,
                    ...channelInfo
                }, { quoted: message });

            } catch (error) {
                console.error('[TTS2] Speak cloned error:', error);
                await logAndReply(`Failed: ${error.message}`, true);
            }
            return;
        }

        // ==================== DELETE VOICE ====================
        if (subCmd === 'delete') {
            if (args.length < 2) {
                return await logAndReply('Please specify voice name to delete.', true);
            }
            const voiceName = args.slice(1).join(' ').trim();

            try {
                const list = await axios.get(`${FISH_API_BASE}/voices`, {
                    headers: { 'Authorization': `Bearer ${FISH_API_KEY}` }
                });
                const voice = list.data.find(v => v.name.toLowerCase() === voiceName.toLowerCase());
                
                if (!voice) {
                    return await logAndReply(`Voice "${voiceName}" not found.`, true);
                }
                
                await axios.delete(`${FISH_API_BASE}/voices/${voice.voiceId}`, {
                    headers: { 'Authorization': `Bearer ${FISH_API_KEY}` }
                });
                
                await logAndReply(`Voice "${voiceName}" deleted.`);
                
            } catch (error) {
                await logAndReply(`Delete failed: ${error.message}`, true);
            }
            return;
        }

        await logAndReply('Unknown command. Use `.tts2 guide` for help.', true);
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading tts2.js:', e.message); }

/* ===== toaudio.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');
const { tmpdir } = require('os');
const ffmpeg = require('fluent-ffmpeg');

// Use OS /tmp — avoids broken cwd on Render native runtime
const TMP_DIR = path.join(tmpdir(), 'redxbot-tmp');
if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
}

module.exports = {
    command: 'toaudio',
    aliases: ['vid2mp3', 'video2audio'],
    category: 'converter',
    description: 'Convert a video to audio (MP3). Reply to a video message.',
    usage: '.toaudio (reply to a video)',
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        
        // Check if the message is a reply to a video
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            return sock.sendMessage(chatId, {
                text: '❌ Please reply to a video message.',
                ...channelInfo
            }, { quoted: message });
        }

        // Get video message from quoted
        let videoMessage = quotedMsg.videoMessage;
        if (!videoMessage) {
            return sock.sendMessage(chatId, {
                text: '❌ The replied message is not a video.',
                ...channelInfo
            }, { quoted: message });
        }

        try {
            // Send initial status
            await sock.sendMessage(chatId, {
                text: '⏳ Downloading video...',
                ...channelInfo
            }, { quoted: message });

            // Download the video
            const stream = await downloadContentFromMessage(videoMessage, 'video');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const videoData = Buffer.concat(chunks);

            // Save to temp file
            const ext = videoMessage.mimetype?.split('/')[1] || 'mp4';
            const videoPath = path.join(TMP_DIR, `${randomBytes(4).toString('hex')}.${ext}`);
            fs.writeFileSync(videoPath, videoData);

            await sock.sendMessage(chatId, {
                text: '⏳ Converting to audio...',
                ...channelInfo
            }, { quoted: message });

            // Output audio path
            const audioPath = path.join(TMP_DIR, `${randomBytes(4).toString('hex')}.mp3`);

            // Convert using ffmpeg
            await new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .toFormat('mp3')
                    .audioBitrate(128)
                    .on('end', resolve)
                    .on('error', reject)
                    .save(audioPath);
            });

            // Read the converted audio
            const audioBuffer = fs.readFileSync(audioPath);

            // Send the audio
            await sock.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `audio_${Date.now()}.mp3`,
                caption: '✅ Converted to audio',
                ...channelInfo
            }, { quoted: message });

            // Cleanup temp files
            fs.unlink(videoPath, () => {});
            fs.unlink(audioPath, () => {});

        } catch (err) {
            console.error('ToAudio error:', err);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${err.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading toaudio.js:', e.message); }

/* ===== topdf.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    'use strict';
/*****************************************************************************
 *  .topdf — Convert quoted image/text/document to PDF (REDXBOT302)
 *****************************************************************************/

const fs   = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const TMP_DIR = path.join(process.cwd(), 'temp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

/* ── HTML → PDF using puppeteer (if available) or fallback ──────────────── */
async function htmlToPdf(htmlContent, outPath) {
    // Try puppeteer
    try {
        const puppeteer = require('puppeteer');
        const browser   = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page      = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.pdf({ path: outPath, format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
        await browser.close();
        return true;
    } catch (_) {}

    // Try jsPDF via node canvas (not available) — use PDFKit instead
    try {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(fs.createWriteStream(outPath));
        // Strip HTML tags for plain text fallback
        const text = htmlContent.replace(/<[^>]+>/g, '').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').trim();
        doc.fontSize(12).text(text, { lineGap: 4 });
        doc.end();
        await new Promise((res, rej) => {
            doc.on('end', res);
            doc.on('error', rej);
        });
        return true;
    } catch (_) {}

    return false;
}

/* ── Image → PDF ─────────────────────────────────────────────────────────── */
async function imageToPdf(imgBuffer, outPath, mimeType) {
    try {
        const PDFDocument = require('pdfkit');
        const sharp       = require('sharp'); // optional
        const doc         = new PDFDocument({ autoFirstPage: false });
        doc.pipe(fs.createWriteStream(outPath));

        // Get image dimensions
        let imgBuf = imgBuffer;
        let width = 500, height = 700;
        try {
            const meta = await sharp(imgBuffer).metadata();
            width  = meta.width  || 500;
            height = meta.height || 700;
            // Convert to jpeg for pdfkit compatibility
            imgBuf = await sharp(imgBuffer).jpeg().toBuffer();
        } catch (_) {
            // sharp not available, use as-is
        }

        const pageW = 595.28, pageH = 841.89; // A4
        const ratio = Math.min((pageW - 40) / width, (pageH - 40) / height, 1);
        const w = width * ratio, h = height * ratio;
        const x = (pageW - w) / 2, y = (pageH - h) / 2;

        doc.addPage({ size: 'A4' });
        doc.image(imgBuf, x, y, { width: w, height: h });
        doc.end();

        await new Promise((res, rej) => {
            doc.on('end', res);
            doc.on('error', rej);
        });
        return true;
    } catch (e) {
        console.error('[TOPDF] imageToPdf:', e.message);
        return false;
    }
}

/* ── Text → PDF ─────────────────────────────────────────────────────────── */
async function textToPdf(text, outPath, title = 'Document') {
    try {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 50, info: { Title: title } });
        doc.pipe(fs.createWriteStream(outPath));
        doc.fontSize(16).text(title, { align: 'center' }).moveDown();
        doc.fontSize(11).text(text, { lineGap: 3, align: 'left' });
        doc.end();
        await new Promise((res, rej) => {
            doc.on('end', res);
            doc.on('error', rej);
        });
        return true;
    } catch (e) {
        console.error('[TOPDF] textToPdf:', e.message);
        return false;
    }
}

/* ── Download media from quoted message ──────────────────────────────────── */
async function downloadQuotedMedia(quotedMsg, mtype) {
    const mediaMsg = quotedMsg[`${mtype}Message`] || quotedMsg;
    const mediaKey = mtype === 'image' ? 'image' : mtype === 'document' ? 'document' : 'image';
    const stream   = await downloadContentFromMessage(mediaMsg[`${mtype}Message`] || mediaMsg, mediaKey);
    const chunks   = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

/* ══════════════════════════════════════════════════════════
   PLUGIN EXPORT
══════════════════════════════════════════════════════════ */
module.exports = {
    command    : 'topdf',
    aliases    : ['2pdf', 'makepdf', 'img2pdf'],
    category   : 'converter',
    description: 'Convert a quoted image or text message to a PDF file',
    usage      : '.topdf [title] — reply to an image or type text after .topdf',

    async handler(sock, message, args, context = {}) {
        const chatId    = context.chatId || message.key.remoteJid;
        const inputText = args.join(' ').trim();

        const quotedMsg    = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const hasImage     = !!(quotedMsg?.imageMessage);
        const hasDocument  = !!(quotedMsg?.documentMessage);
        const hasText      = !!inputText;

        if (!quotedMsg && !hasText) {
            return await sock.sendMessage(chatId, {
                text:
                    '📄 *PDF Converter*\n\n' +
                    '*Usage:*\n' +
                    '• Reply to an *image* → `.topdf [optional title]`\n' +
                    '• Type text after command → `.topdf Your text here`\n\n' +
                    '_Converts image or text to a downloadable PDF._'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
        await sock.sendMessage(chatId, { text: '⏳ *Converting to PDF...*' }, { quoted: message });

        const outPath = path.join(TMP_DIR, `${Date.now()}_output.pdf`);
        let success   = false;
        let pdfTitle  = inputText || 'Document';

        try {
            if (hasImage) {
                // Convert image → PDF
                const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const imgBuf = Buffer.concat(chunks);
                pdfTitle     = inputText || 'Image PDF';
                success      = await imageToPdf(imgBuf, outPath, quotedMsg.imageMessage?.mimetype || 'image/jpeg');

            } else if (hasText) {
                // Convert text → PDF
                success = await textToPdf(inputText, outPath, 'Text Document');

            } else if (hasDocument) {
                // If it's an HTML/text document, convert it
                const stream = await downloadContentFromMessage(quotedMsg.documentMessage, 'document');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const docBuf = Buffer.concat(chunks);
                const text   = docBuf.toString('utf8').replace(/<[^>]+>/g, ' ').trim();
                pdfTitle     = quotedMsg.documentMessage?.fileName || 'Document';
                success      = await textToPdf(text, outPath, pdfTitle);
            }

            if (!success || !fs.existsSync(outPath) || fs.statSync(outPath).size === 0) {
                throw new Error('PDF generation failed — pdfkit may not be installed.\nRun: npm install pdfkit');
            }

            const sizeMB = (fs.statSync(outPath).size / 1024).toFixed(0);

            await sock.sendMessage(chatId, {
                document : fs.readFileSync(outPath),
                mimetype : 'application/pdf',
                fileName : `${pdfTitle.replace(/[^a-z0-9]/gi,'_').slice(0,40)}.pdf`,
                caption  : `✅ *PDF Ready!*\n📄 *${pdfTitle}*\n📦 Size: ${sizeMB} KB\n\n> *_Converted by JUNAID-MD↣³⁰²_*`,
            }, { quoted: message });

            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error('[TOPDF]', err.message);
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            await sock.sendMessage(chatId, {
                text: `❌ *PDF conversion failed*\n\n${err.message}\n\n💡 Make sure \`pdfkit\` is installed:\n\`npm install pdfkit\``
            }, { quoted: message });
        } finally {
            try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (_) {}
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading topdf.js:', e.message); }

/* ===== todocument.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    'use strict';
/*****************************************************************************
 *  .todocument — Convert quoted image/text to Word DOCX (REDXBOT302)
 *****************************************************************************/

const fs   = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const TMP_DIR = path.join(process.cwd(), 'temp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

/* ── Build DOCX from text ───────────────────────────────────────────────── */
async function textToDocx(text, title, outPath) {
    const officegen = require('officegen');
    const docx      = officegen('docx');

    return new Promise((resolve, reject) => {
        // Title
        const titlePara = docx.createP();
        titlePara.addText(title, { font_size: 18, bold: true });
        docx.createP(); // spacer

        // Body text — split by lines
        const lines = text.split('\n');
        for (const line of lines) {
            const p = docx.createP();
            p.addText(line || ' ', { font_size: 11 });
        }

        const out = fs.createWriteStream(outPath);
        out.on('close', resolve);
        out.on('error', reject);
        docx.generate(out);
    });
}

/* ── Build DOCX using docx npm package (more reliable) ──────────────────── */
async function textToDocxV2(text, title, outPath) {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

    const lines = text.split('\n').filter(l => l.trim());
    const children = [
        new Paragraph({
            text    : title,
            heading : HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: '' }), // spacer
        ...lines.map(line =>
            new Paragraph({
                children: [new TextRun({ text: line, size: 24 })],
            })
        ),
    ];

    const doc = new Document({
        sections: [{
            properties: {},
            children,
        }],
    });

    const buf = await Packer.toBuffer(doc);
    fs.writeFileSync(outPath, buf);
}

/* ── Image embedded in DOCX ─────────────────────────────────────────────── */
async function imageToDocx(imgBuffer, title, outPath) {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } = require('docx');

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text   : title,
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({ text: '' }),
                new Paragraph({
                    children: [
                        new ImageRun({
                            data       : imgBuffer,
                            transformation: { width: 500, height: 350 },
                        }),
                    ],
                }),
                new Paragraph({ text: '' }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text  : `Generated by JUNAID-MD↣³⁰²`,
                            color : '888888',
                            size  : 18,
                            italics: true,
                        }),
                    ],
                }),
            ],
        }],
    });

    const buf = await Packer.toBuffer(doc);
    fs.writeFileSync(outPath, buf);
}

/* ══════════════════════════════════════════════════════════
   PLUGIN EXPORT
══════════════════════════════════════════════════════════ */
module.exports = {
    command    : 'todocument',
    aliases    : ['todoc', 'toword', '2doc', '2docx', 'makedoc'],
    category   : 'converter',
    description: 'Convert quoted image or text to a Word (.docx) document',
    usage      : '.todocument [title] — reply to an image or provide text',

    async handler(sock, message, args, context = {}) {
        const chatId    = context.chatId || message.key.remoteJid;
        const inputText = args.join(' ').trim();

        const quotedMsg   = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const hasImage    = !!(quotedMsg?.imageMessage);
        const hasQuotedTxt = !!(quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text);
        const hasText     = !!inputText;

        if (!quotedMsg && !hasText) {
            return await sock.sendMessage(chatId, {
                text:
                    '📝 *Document Converter*\n\n' +
                    '*Usage:*\n' +
                    '• Reply to an *image* → `.todocument [title]`\n' +
                    '• Reply to a *text message* → `.todocument`\n' +
                    '• Type text → `.todocument Your text here`\n\n' +
                    '_Converts to a Word (.docx) document._'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });
        await sock.sendMessage(chatId, { text: '⏳ *Creating Word document...*' }, { quoted: message });

        const outPath = path.join(TMP_DIR, `${Date.now()}_output.docx`);
        let docTitle  = inputText || 'Document';

        try {
            if (hasImage) {
                // Image → DOCX
                const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const imgBuf = Buffer.concat(chunks);
                docTitle     = inputText || 'Image Document';
                await imageToDocx(imgBuf, docTitle, outPath);

            } else if (hasText) {
                await textToDocxV2(inputText, 'Text Document', outPath);
                docTitle = 'Text Document';

            } else if (hasQuotedTxt) {
                const quotedText = quotedMsg?.conversation ||
                                   quotedMsg?.extendedTextMessage?.text || '';
                docTitle = inputText || 'Quoted Text';
                await textToDocxV2(quotedText, docTitle, outPath);
            }

            if (!fs.existsSync(outPath) || fs.statSync(outPath).size === 0) {
                throw new Error('Document generation failed — run: npm install docx');
            }

            const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(0);

            await sock.sendMessage(chatId, {
                document : fs.readFileSync(outPath),
                mimetype : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                fileName : `${docTitle.replace(/[^a-z0-9]/gi,'_').slice(0,40)}.docx`,
                caption  : `✅ *Document Ready!*\n📝 *${docTitle}*\n📦 Size: ${sizeKB} KB\n\n> *_Created by JUNAID-MD↣³⁰²_*`,
            }, { quoted: message });

            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error('[TODOC]', err.message);
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            await sock.sendMessage(chatId, {
                text: `❌ *Document creation failed*\n\n${err.message}\n\n💡 Install required packages:\n\`npm install docx\``
            }, { quoted: message });
        } finally {
            try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (_) {}
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading todocument.js:', e.message); }

/* ===== canvas.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

async function getQuotedOrOwnImageUrl(sock, message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted?.imageMessage) {
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }
    if (message.message?.imageMessage) {
        const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }
    let targetJid;
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    if (ctx?.mentionedJid?.length > 0) {
        targetJid = ctx.mentionedJid[0];
    } else if (ctx?.participant) {
        targetJid = ctx.participant;
    } else {
        targetJid = message.key.participant || message.key.remoteJid;
    }

    try {
        const url = await sock.profilePictureUrl(targetJid, 'image');
        return url;
    } catch {
        return 'https://i.imgur.com/2wzGhpF.png';
    }
}

async function handleHeart(sock, chatId, message) {
    try {
        const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
        const url = `https://api.some-random-api.com/canvas/misc/heart?avatar=${encodeURIComponent(avatarUrl)}`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        await sock.sendMessage(chatId, { image: Buffer.from(response.data) }, { quoted: message });
    } catch (error) {
        console.error('Error in misc heart:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to create heart image. Try again later.' }, { quoted: message });
    }
}

module.exports = {
    command: 'canvas',
    aliases: ['canvas', 'overlay'],
    category: 'menu',
    description: 'Generate various fun images using avatar',
    usage: '.canvas <type> [args]',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const sub = (args[0] || '').toLowerCase();
        const rest = args.slice(1);

        async function simpleAvatarOnly(endpoint) {
            const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
            const url = `https://api.some-random-api.com/canvas/misc/${endpoint}?avatar=${encodeURIComponent(avatarUrl)}`;
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            await sock.sendMessage(chatId, { image: Buffer.from(response.data) }, { quoted: message });
        }

        try {
            switch (sub) {
                case 'heart':
                    await simpleAvatarOnly('heart');
                    break;
                
                case 'horny':
                    await simpleAvatarOnly('horny');
                    break;
                case 'circle':
                    await simpleAvatarOnly('circle');
                    break;
                case 'lgbt':
                    await simpleAvatarOnly('lgbt');
                    break;
                case 'lolice':
                    await simpleAvatarOnly('lolice');
                    break;
                case 'simpcard':
                    await simpleAvatarOnly('simpcard');
                    break;
                case 'tonikawa':
                    await simpleAvatarOnly('tonikawa');
                    break;

                case 'its-so-stupid': {
                    const dog = rest.join(' ').trim();
                    if (!dog) {
                        await sock.sendMessage(chatId, { text: '❌ *Usage:* `.canvas its-so-stupid <text>`' }, { quoted: message });
                        return;
                    }
                    const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                    const url = `https://api.some-random-api.com/canvas/misc/its-so-stupid?dog=${encodeURIComponent(dog)}&avatar=${encodeURIComponent(avatarUrl)}`;
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    await sock.sendMessage(chatId, { image: Buffer.from(response.data) }, { quoted: message });
                    break;
                }

                case 'namecard': {
                    const joined = rest.join(' ');
                    const [username, birthday, description] = joined.split('|').map(s => (s || '').trim());
                    if (!username || !birthday) {
                        await sock.sendMessage(chatId, { text: '❌ *Usage:* `.canvas namecard username|birthday|description(optional)`' }, { quoted: message });
                        return;
                    }
                    const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                    const params = new URLSearchParams({ username, birthday, avatar: avatarUrl });
                    if (description) params.append('description', description);
                    const url = `https://api.some-random-api.com/canvas/misc/namecard?${params.toString()}`;
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    await sock.sendMessage(chatId, { image: Buffer.from(response.data) }, { quoted: message });
                    break;
                }

                case 'tweet': {
                    const joined = rest.join(' ');
                    const [displayname, username, comment, theme] = joined.split('|').map(s => (s || '').trim());
                    if (!displayname || !username || !comment) {
                        await sock.sendMessage(chatId, { text: '❌ *Usage:* `.canvas tweet displayname|username|comment|theme(optional)`' }, { quoted: message });
                        return;
                    }
                    const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                    const params = new URLSearchParams({ displayname, username, comment, avatar: avatarUrl });
                    if (theme) params.append('theme', theme);
                    const url = `https://api.some-random-api.com/canvas/misc/tweet?${params.toString()}`;
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    await sock.sendMessage(chatId, { image: Buffer.from(response.data) }, { quoted: message });
                    break;
                }

                case 'youtube-comment': {
                    const joined = rest.join(' ');
                    const [username, comment] = joined.split('|').map(s => (s || '').trim());
                    if (!username || !comment) {
                        await sock.sendMessage(chatId, { text: '❌ *Usage:* `.canvas youtube-comment username|comment`' }, { quoted: message });
                        return;
                    }
                    const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                    const params = new URLSearchParams({ username, comment, avatar: avatarUrl });
                    const url = `https://api.some-random-api.com/canvas/misc/youtube-comment?${params.toString()}`;
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    await sock.sendMessage(chatId, { image: Buffer.from(response.data) }, { quoted: message });
                    break;
                }
                case 'comrade':
                case 'gay':
                case 'glass':
                case 'jail':
                case 'passed':
                case 'triggered': {
                    const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                    const overlay = sub;
                    const url = `https://api.some-random-api.com/canvas/overlay/${overlay}?avatar=${encodeURIComponent(avatarUrl)}`;
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    await sock.sendMessage(chatId, { image: Buffer.from(response.data) }, { quoted: message });
                    break;
                }

                default:
                    await sock.sendMessage(chatId, { 
                        text: '*🎨 MISC COMMANDS*\n\n' +
                              '*Simple overlays:*\n' +
                              '• heart\n' +
                              '• horny\n' +
                              '• circle\n' +
                              '• lgbt\n' +
                              '• lolice\n' +
                              '• simpcard\n' +
                              '• tonikawa\n' +
                              '• comrade\n' +
                              '• gay\n' +
                              '• glass\n' +
                              '• jail\n' +
                              '• passed\n' +
                              '• triggered\n\n' +
                              '*With text:*\n\n' +
                              '• its-so-stupid <text>\n' +
                              '• namecard user|birthday|desc\n' +
                              '• tweet name|user|comment|theme\n' +
                              '• youtube-comment user|comment'
                    }, { quoted: message });
                    break;
            }
        } catch (error) {
            console.error('Error in misc command:', error);
            await sock.sendMessage(chatId, { text: '❌ *Failed to generate image*\n\nCheck your parameters and try again.' }, { quoted: message });
        }
    },

    handleHeart
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading canvas.js:', e.message); }

/* ===== photoeditor.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const { writeFile } = require('fs/promises');

const TEMP_DIR = path.join(process.cwd(), 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

/**
 * Helper to download an image from a WhatsApp message
 */
async function downloadImage(sock, message) {
    const msg = message.message?.imageMessage || message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
    if (!msg) throw new Error('No image found. Reply to an image.');

    const stream = await downloadContentFromMessage(msg, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

module.exports = {
    command: 'photoedit',
    aliases: ['pedit', 'img edit'],
    category: 'tools',
    description: 'Edit images – crop, add text, overlay stickers (educational use only)',
    usage: `.photoedit <crop|text|sticker> [params]
  
  Examples:
  • Reply to an image with: .photoedit crop 100 100 300 200   (x y width height)
  • .photoedit text "Hello" 50 100 red   (text x y color)
  • .photoedit sticker https://example.com/sticker.png    (overlay an image at center)`,
    ownerOnly: false, // anyone can use, but you can change

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        if (args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: '🖼️ *Photo Editor*\n\n' +
                      'Reply to an image and use:\n' +
                      '• `.photoedit crop x y width height`\n' +
                      '• `.photoedit text "your text" x y color`\n' +
                      '• `.photoedit sticker <image_url>`\n\n' +
                      'Colors: red, blue, green, yellow, white, black',
                ...channelInfo
            }, { quoted: message });
        }

        try {
            // Download the image
            const imageBuffer = await downloadImage(sock, message);
            const inputPath = path.join(TEMP_DIR, `input_${Date.now()}.jpg`);
            const outputPath = path.join(TEMP_DIR, `output_${Date.now()}.jpg`);
            await writeFile(inputPath, imageBuffer);

            const image = await Jimp.read(inputPath);
            const command = args[0].toLowerCase();

            if (command === 'crop') {
                if (args.length < 5) throw new Error('Usage: .photoedit crop x y width height');
                const x = parseInt(args[1]);
                const y = parseInt(args[2]);
                const w = parseInt(args[3]);
                const h = parseInt(args[4]);
                image.crop(x, y, w, h);
            }
            else if (command === 'text') {
                if (args.length < 4) throw new Error('Usage: .photoedit text "message" x y [color]');
                // Parse quoted text
                const match = args.slice(1).join(' ').match(/"([^"]+)"\s+(\d+)\s+(\d+)(?:\s+(\w+))?/);
                if (!match) throw new Error('Invalid format. Use: .photoedit text "Hello" 50 100 red');
                const text = match[1];
                const x = parseInt(match[2]);
                const y = parseInt(match[3]);
                const colorName = match[4] || 'white';

                const colorMap = {
                    red: 0xFF0000FF,
                    blue: 0x0000FFFF,
                    green: 0x00FF00FF,
                    yellow: 0xFFFF00FF,
                    white: 0xFFFFFFFF,
                    black: 0x000000FF
                };
                const hexColor = colorMap[colorName.toLowerCase()] || 0xFFFFFFFF;

                const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE); // using white font, but we'll apply color
                image.print(font, x, y, { text, alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT }, 0, 0);
                // Jimp doesn't support color directly in print, we could do a workaround by blending, but for simplicity we keep white.
                // Alternatively we could use composite with a text bitmap, but that's complex.
            }
            else if (command === 'sticker') {
                if (args.length < 2) throw new Error('Usage: .photoedit sticker <image_url>');
                const stickerUrl = args[1];
                const response = await axios.get(stickerUrl, { responseType: 'arraybuffer' });
                const stickerBuffer = Buffer.from(response.data);
                const sticker = await Jimp.read(stickerBuffer);
                // Resize sticker to fit (e.g., 200x200)
                sticker.resize(200, 200);
                // Position at center
                const x = (image.bitmap.width - 200) / 2;
                const y = (image.bitmap.height - 200) / 2;
                image.composite(sticker, x, y);
            }
            else {
                throw new Error('Unknown command. Use crop, text, or sticker.');
            }

            // Save edited image
            await image.writeAsync(outputPath);

            // Send back the edited image
            await sock.sendMessage(chatId, {
                image: { url: outputPath },
                caption: '✅ Image edited (educational demo)',
                ...channelInfo
            }, { quoted: message });

            // Cleanup temp files
            fs.unlink(inputPath, () => {});
            fs.unlink(outputPath, () => {});
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading photoeditor.js:', e.message); }

/* ===== hd.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // hd.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { fromBuffer } = require('file-type');

module.exports = {
    command: 'hd',
    aliases: ['enhance', 'upscale'],
    category: 'tools',
    description: 'Enhance image to high resolution',
    usage: '.hd <image URL> or reply to an image with .hd',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        let imageUrl = null;

        // 1. Try to get image URL from arguments
        if (args.length > 0) {
            imageUrl = args[0];
        } 
        // 2. If no args, check if message is a reply with an image
        else if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            if (quotedMsg.url) {
                imageUrl = quotedMsg.url;
            }
        }
        // 3. If the message itself contains an image (not a quoted reply)
        else if (message.message?.imageMessage?.url) {
            imageUrl = message.message.imageMessage.url;
        }

        if (!imageUrl) {
            await sock.sendMessage(chatId, {
                text: '📸 *HD Image Enhancer*\n\n' +
                      'Please provide an image URL or reply to an image with `.hd`.\n' +
                      'Example: `.hd https://example.com/image.jpg`'
            }, { quoted: message });
            return;
        }

        // Send status message
        const statusMsg = await sock.sendMessage(chatId, {
            text: '🖼️ Enhancing image to HD... Please wait.'
        }, { quoted: message });

        try {
            const apiUrl = `https://api.deline.web.id/tools/hd?url=${encodeURIComponent(imageUrl)}`;
            const response = await axios.get(apiUrl, {
                timeout: 60000,
                responseType: 'arraybuffer'
            });

            // Check if response is an image
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error('API did not return a valid image');
            }

            const imageBuffer = Buffer.from(response.data);
            const type = await fromBuffer(imageBuffer);
            if (!type || !type.mime.startsWith('image/')) {
                throw new Error('Received data is not an image');
            }

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: '✨ *Enhanced HD Image*'
            }, { quoted: message });

            await sock.sendMessage(chatId, { delete: statusMsg.key });
        } catch (error) {
            console.error('[HD] Error:', error.message);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to enhance image.\nReason: ${error.message}`
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading hd.js:', e.message); }

/* ===== remini.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

async function getQuotedOrOwnImageUrl(sock, message) {
  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (quoted?.imageMessage) {
    const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    return await uploadImage(buffer);
  }
  if (message.message?.imageMessage) {
    const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    return await uploadImage(buffer);
  }
  return null;
}

// Helper function to validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  command: 'remini',
  aliases: ['enhance', 'upscale'],
  category: 'tools',
  description: 'Enhance an image using Remini AI',
  usage: '.remini <image_url> or reply to an image with .remini',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      let imageUrl = null;

      if (args.length > 0) {
        const url = args.join(' ');
        if (isValidUrl(url)) {
          imageUrl = url;
        } else {
          return sock.sendMessage(chatId, {
            text: '❌ Invalid URL provided.\n\nUsage: `.remini https://example.com/image.jpg`'
          }, { quoted: message });
        }
      } else {
        imageUrl = await getQuotedOrOwnImageUrl(sock, message);
        if (!imageUrl) {
          return sock.sendMessage(chatId, {
            text: '📸 *Remini AI Enhancement Command*\n\nUsage:\n• `.remini <image_url>`\n• Reply to an image with `.remini`\n• Send image with `.remini`\n\nExample: `.remini https://example.com/image.jpg`'
          }, { quoted: message });
        }
      }

      const apiUrl = `https://api.princetechn.com/api/tools/remini?apikey=prince_tech_api_azfsbshfb&url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl, {
        timeout: 60000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (response.data && response.data.success && response.data.result?.image_url) {
        const imageResponse = await axios.get(response.data.result.image_url, {
          responseType: 'arraybuffer',
          timeout: 30000
        });

        if (imageResponse.status === 200 && imageResponse.data) {
          await sock.sendMessage(chatId, {
            image: imageResponse.data,
            caption: '✨ *Image enhanced successfully!*\n\n𝗘𝗡𝗛𝗔𝗡𝗖𝗘𝗗 𝗕𝗬 𝗠𝗘𝗚𝗔 𝗔𝗜'
          }, { quoted: message });
        } else throw new Error('Failed to download enhanced image');
      } else throw new Error(response.data.result?.message || 'Failed to enhance image');

    } catch (error) {
      console.error('Remini Error:', error.message);
      let errorMessage = '❌ Failed to enhance image.';

      if (error.response?.status === 429) errorMessage = '⏰ Rate limit exceeded. Please try again later.';
      else if (error.response?.status === 400) errorMessage = '❌ Invalid image URL or format.';
      else if (error.response?.status === 500) errorMessage = '🔧 Server error. Please try again later.';
      else if (error.code === 'ECONNABORTED') errorMessage = '⏰ Request timeout. Please try again.';
      else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) errorMessage = '🌐 Network error. Please check your connection.';
      else if (error.message.includes('Failed to enhance image')) errorMessage = '❌ Image processing failed. Please try with a different image.';

      await sock.sendMessage(chatId, { text: errorMessage }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading remini.js:', e.message); }

/* ===== removebg.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
const googleTTS = require('google-tts-api');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function getImageBuffer(message) {
  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  let imageMessage = quoted?.imageMessage || message.message?.imageMessage;
  if (!imageMessage) return null;

  const stream = await downloadContentFromMessage(imageMessage, 'image');
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

module.exports = {
  command: 'removebg',
  aliases: ['rmbg', 'bgremove'],
  category: 'tools',
  description: 'Remove background from an image',
  usage: '.removebg (reply to image or send image with caption)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const imageBuffer = await getImageBuffer(message);

      if (!imageBuffer) {
        return await sock.sendMessage(chatId, {
          text:
            '📸 *Remove Background*\n\nUsage:\n' +
            '• Reply to an image with `.removebg`\n' +
            '• Send image with caption `.removebg`'
        }, { quoted: message });
      }

      const apiKey = process.env.REMOVEBG_KEY;
      if (!apiKey) {
        return await sock.sendMessage(chatId, {
          text: '❌ RemoveBG API key not configured.'
        }, { quoted: message });
      }

      const form = new FormData();
      form.append('size', 'auto');
      form.append('image_file', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });

      const response = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
        headers: { ...form.getHeaders(), 'X-Api-Key': apiKey },
        responseType: 'arraybuffer',
        timeout: 60000
      });

      await sock.sendMessage(chatId, {
        image: response.data,
        caption: '✨ *Background removed successfully*\n\n𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 JUNAID-MD↣³⁰²'
      }, { quoted: message });

    } catch (err) {
      console.error('RemoveBG Error:', err?.response?.data || err.message);

      let msg = '❌ Failed to remove background.';
      if (err.response?.status === 402) msg = '💳 API quota exceeded.';
      else if (err.response?.status === 401) msg = '🔑 Invalid API key.';
      else if (err.code === 'ECONNABORTED') msg = '⏰ Request timeout. Try again.';

      await sock.sendMessage(chatId, { text: msg }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading removebg.js:', e.message); }

/* ===== ss.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'screenshot',
  aliases: ['ss', 'ssweb'],
  category: 'tools',
  description: 'Get a screenshot of a website',
  usage: '.screenshot <url>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let url = args?.[0]?.trim();

    if (!url) {
      return await sock.sendMessage(chatId, { text: '*Provide a URL.*\nExample: .screenshot https://github.com' }, { quoted: message });
    }

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    try {
      new URL(url);
    } catch {
      return await sock.sendMessage(chatId, { text: '❌ Invalid URL provided.' }, { quoted: message });
    }

    try {
      const apiUrl = `https://discardapi.dpdns.org/api/tools/ssweb?apikey=guru&url=${encodeURIComponent(url)}`;

      const { data } = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      const caption = `🌐 Screenshot of:\n${url}`;
      await sock.sendMessage(chatId, { image: { buffer: data }, caption }, { quoted: message });

    } catch (error) {
      console.error('Screenshot plugin error:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { text: '❌ Request timed out. The site may be slow or unreachable.' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch screenshot. Make sure the URL is correct.' }, { quoted: message });
      }
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading ss.js:', e.message); }

/* ===== screenshot.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
module.exports = [{
  pattern: "ss",
  alias: ["screenshot", "webss"],
  desc: "Take website screenshot",
  category: "utility",
  react: "📸",
  filename: __filename,
  use: ".ss <url>",
  execute: async (conn, mek, m, { from, args, q, reply }) => {
    try {
      if (!args.length) return reply("❌ Please provide URL.\nExample: .ss https://example.com");
      
      let url = args[0];
      if (!url.startsWith('http')) url = 'https://' + url;
      
      await reply("⏳ Taking screenshot...");
      
      const screenshotUrl = `https://api.apiflash.com/v1/urltoimage?access_key=0551b436bf0642ac8a0a072acb76ed7a&url=${encodeURIComponent(url)}&format=png&width=1280&height=800`;
      
      await conn.sendMessage(from, {
        image: { url: screenshotUrl },
        caption: `📸 Screenshot of: ${url}`
      }, { quoted: mek });
      
    } catch (e) {
      await reply(`❌ Failed to take screenshot.`);
    }
  }
}];

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading screenshot.js:', e.message); }

/* ===== sfile.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'sfile',
  aliases: ['sfl', 'sfileapk'],
  category: 'apks',
  description: 'Search APKs/files from SFile',
  usage: '.sfile <query>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: '*Please provide a search query.*\nExample: .sfile telegram'
      }, { quoted: message });
    }
    const query = args.join(' ');
    try {
      const { data } = await axios.get(`https://discardapi.dpdns.org/api/apk/search/sfile`, {
        params: {
          apikey: 'guru',
          query: query
        }
      });

      if (!data?.result?.length) {
        return await sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: message });
      }

      let menuText = '';
      data.result.forEach((item, i) => {
        menuText += `*${i + 1}.* ${item.nama}\n💾 Size: ${item.size}\n🔗 Link: ${item.link}\n\n`;
      });

      await sock.sendMessage(chatId, { text: menuText }, { quoted: message });

    } catch (err) {
      console.error('SFile plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to fetch files.' }, { quoted: message });
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading sfile.js:', e.message); }

/* ===== vnote.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@AbdulRehman19721986                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *                                                                           *
 *    © 2026 AbdulRehman19721986. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the REDXBOT302 Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/


const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    command: 'vnote',
    aliases: ['voicenote', 'vn'],
    category: 'tools',
    description: 'Convert any audio message into a live-looking voice note',
    usage: 'Reply to an audio file with .vnote',

    async handler(sock, message, args, context = {}) {
        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || chatId;

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || !quoted.audioMessage) {
            return sock.sendMessage(chatId, { text: "Please reply to an *audio file* to convert it to a PTT." }, { quoted: message });
        }

        try {
            const stream = await downloadContentFromMessage(quoted.audioMessage, 'audio');
            
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            await sock.sendMessage(chatId, { 
                audio: buffer, 
                ptt: true, 
                mimetype: 'audio/ogg; codecs=opus' 
            }, { quoted: message });

        } catch (error) {
            console.error('PTT Conversion Error:', error);
            await sock.sendMessage(chatId, { text: "❌ Failed to convert audio to voice note." });
        }
    }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@AbdulRehman19721986                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *                                                                           *
 *    © 2026 AbdulRehman19721986. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the REDXBOT302 Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading vnote.js:', e.message); }

/* ===== viewonce.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *  ADVANCED VIEW-ONCE RETRIEVER — REDXBOT302 v7.2 ULTRA                    *
 *                                                                           *
 *  FIXED v7.2:                                                              *
 *   • @lid linked device permission check (fromMe flag + sock.user.id)     *
 *   • .vv inbox now correctly delivers to sock.user.id (linked device DM)  *
 *   • .vv2 uses downloadContentFromMessage (more reliable)                  *
 *   • isSudoOrOwner respects context.isOwnerOrSudoCheck from messageHandler*
 *   • .vv2 now sends media to the current chat (group or private) by default*
 *****************************************************************************/

'use strict';

const fs   = require('fs');
const path = require('path');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');

/* ── Config ────────────────────────────────────────────────────────────────── */
const VV_CONFIG = {
    successEmoji   : '👁️',
    processingEmoji: '⏳',
    errorEmoji     : '❌',
    dmEmoji        : '📥',

    dmSentMsg   : '📥 *View-once sent to your DM silently.*\n_No trace left in this chat._ 🤫',
    retrievedMsg: '👁️ *View-Once Retrieved!*\n\n_Powered by lJUNAID-MD↣³⁰² v7.2 ULTRA_ 🔥',
    autoCaption : '🤫 *Auto-intercepted view-once*\n\n_Someone sent this in a monitored chat_ 👁️',

    noMediaMsg    : '⚠️ *Please reply to a view-once image, video, audio, or voice note.*',
    noReplyMsg    : '❌ *Reply to a view-once message first, then use this command.*',
    notVVMsg      : '❌ *That quoted message is not a view-once.*',
    errorMsg      : '❌ *Failed to retrieve the view-once media. Please try again later.*',
    invalidOptMsg : '❌ *Invalid option.*\nUse `.vv`, `.vv inbox`, or `.vv group`',
    notAllowedMsg : '❌ *This command is for the owner and sudo users only.*',
};

/* ── Trigger storage ───────────────────────────────────────────────────────── */
const TRIGGERS_FILE = path.join(__dirname, '../data/vv_triggers.json');

function loadTriggers() {
    try { return JSON.parse(fs.readFileSync(TRIGGERS_FILE, 'utf8')); }
    catch (e) { if (e.code !== 'ENOENT') console.error('[VV] loadTriggers:', e.message); return []; }
}

function saveTriggers(list) {
    try {
        fs.mkdirSync(path.dirname(TRIGGERS_FILE), { recursive: true });
        fs.writeFileSync(TRIGGERS_FILE, JSON.stringify(list, null, 2));
        return true;
    } catch (e) { console.error('[VV] saveTriggers:', e.message); return false; }
}

/* ══════════════════════════════════════════════════════════════════
   PERMISSION HELPERS — @lid aware
   Linked devices send @lid JIDs. We must use fromMe flag and
   sock.user.id to identify them as the owner.
══════════════════════════════════════════════════════════════════ */
const SUDO_FILE = path.join(__dirname, '../data/sudo.json');

function loadSudoList() {
    try { return JSON.parse(fs.readFileSync(SUDO_FILE, 'utf8')); }
    catch { return []; }
}

function normaliseNum(jid = '') {
    return String(jid).replace(/^\+/, '').split(':')[0].split('@')[0].trim();
}

function isLidJid(jid) {
    return typeof jid === 'string' && jid.endsWith('@lid');
}

function loadSettings() {
    try {
        const s = require('../settings');
        return { ownerNumber: normaliseNum(String(s.ownerNumber || '')) };
    } catch { return { ownerNumber: '' }; }
}

function getSender(message, context = {}) {
    if (context.senderId) return context.senderId;
    const remoteJid = message.key?.remoteJid || '';
    if (remoteJid.endsWith('@g.us')) return message.key?.participant || '';
    return remoteJid;
}

/**
 * Get the correct DM JID to send the view-once to.
 *
 * IMPORTANT: When a linked device sends a command, their senderId is a @lid
 * like "79268218458117@lid". You CANNOT send a DM to a @lid JID — it will fail.
 *
 * The correct inbox for the owner/linked device is always sock.user.id
 * (the real phone number the bot is running as, e.g. @s.whatsapp.net).
 *
 * So:
 *  - If sender is a @lid   → send to sock.user.id (the owner's real number)
 *  - If sender is owner    → send to sock.user.id (same inbox)
 *  - If sender is sudo     → send to their real number
 */
function resolveInboxJid(senderJid, sock) {
    // @lid or owner → always use bot's own number (the linked device's inbox)
    if (isLidJid(senderJid)) {
        const num = normaliseNum(sock.user?.id || '');
        return num ? `${num}@s.whatsapp.net` : null;
    }
    const { ownerNumber } = loadSettings();
    const senderNum = normaliseNum(senderJid);
    // Owner → their inbox = sock.user.id number
    if (senderNum && ownerNumber && senderNum === ownerNumber) {
        const num = normaliseNum(sock.user?.id || '') || ownerNumber;
        return `${num}@s.whatsapp.net`;
    }
    // Sudo or other — use their own number
    if (senderNum) return `${senderNum}@s.whatsapp.net`;
    // Fallback
    const botNum = normaliseNum(sock.user?.id || '');
    return botNum ? `${botNum}@s.whatsapp.net` : null;
}

/**
 * isSudoOrOwner — respects:
 *  1. context.isOwnerOrSudoCheck / context.senderIsOwnerOrSudo  (from messageHandler)
 *  2. message.key.fromMe  (linked device always has this true)
 *  3. settings.ownerNumber digit match
 *  4. sock.user.id digit match
 *  5. sudo list
 */
function isSudoOrOwner(sock, senderJid, context = {}, message = null) {
    // messageHandler already computed this — trust it
    if (context?.isOwnerOrSudoCheck === true) return true;
    if (context?.senderIsOwnerOrSudo === true) return true;

    // fromMe = linked device / owner sent this
    if (message?.key?.fromMe === true) return true;

    // @lid in DM = owner's linked device
    if (isLidJid(senderJid)) {
        const botNum     = normaliseNum(sock.user?.id || '');
        const ownerNum   = loadSettings().ownerNumber;
        if (botNum && ownerNum && botNum === ownerNum) return true;
        // Even if numbers don't match perfectly — any @lid DM is owner's device
        if (botNum) return true;
    }

    const senderNum  = normaliseNum(senderJid);
    const { ownerNumber } = loadSettings();

    if (senderNum && ownerNumber && senderNum === ownerNumber) return true;

    const botNum = normaliseNum(sock.user?.id || '');
    if (botNum && senderNum === botNum) return true;

    // Sudo list
    const diskSudo = loadSudoList();
    if (diskSudo.map(s => normaliseNum(String(s))).includes(senderNum)) return true;

    if (Array.isArray(context?.sudo)) {
        if (context.sudo.map(s => normaliseNum(String(s))).includes(senderNum)) return true;
    }

    return false;
}

function safeArgs(args) {
    if (Array.isArray(args)) return args;
    if (typeof args === 'string') return args.split(' ');
    return [];
}

/* ── View-once detection ──────────────────────────────────────────────────── */
function detectViewOnce(quotedMsg) {
    if (!quotedMsg) return null;

    function extractMedia(inner) {
        if (!inner) return null;
        if (inner.imageMessage) return { mtype: 'image', msgObj: inner.imageMessage, inner };
        if (inner.videoMessage) return { mtype: 'video', msgObj: inner.videoMessage, inner };
        if (inner.audioMessage) return { mtype: 'audio', msgObj: inner.audioMessage, inner };
        return null;
    }

    const r1 = extractMedia(quotedMsg.viewOnceMessage?.message);           if (r1) return r1;
    const r2 = extractMedia(quotedMsg.viewOnceMessageV2?.message);         if (r2) return r2;
    const r3 = extractMedia(quotedMsg.viewOnceMessageV2Extension?.message); if (r3) return r3;

    if (quotedMsg.imageMessage?.viewOnce)
        return { mtype: 'image', msgObj: quotedMsg.imageMessage, inner: quotedMsg };
    if (quotedMsg.videoMessage?.viewOnce)
        return { mtype: 'video', msgObj: quotedMsg.videoMessage, inner: quotedMsg };
    if (quotedMsg.audioMessage?.viewOnce)
        return { mtype: 'audio', msgObj: quotedMsg.audioMessage, inner: quotedMsg };

    return null;
}

/* ── Download via downloadMediaMessage ────────────────────────────────────── */
async function downloadBuffer(sock, msg, inner) {
    const fakeMsg = { key: msg.key, message: inner };
    return await downloadMediaMessage(fakeMsg, 'buffer', {}, {
        logger: {
            level: 'silent',
            info: () => {}, warn: () => {}, error: () => {},
            debug: () => {}, trace: () => {},
            child: () => ({ level: 'silent', info: () => {}, warn: () => {},
                error: () => {}, debug: () => {}, trace: () => {}, child: () => ({}) }),
        },
        reuploadRequest: sock.updateMediaMessage,
    });
}

/* ── Download via downloadContentFromMessage (more reliable for recent msgs) */
async function downloadContentBuffer(msgObj, mediaType) {
    const stream = await downloadContentFromMessage(msgObj, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
}

/* ── Build content for sending ────────────────────────────────────────────── */
function buildContent(mtype, buf, msgObj, caption) {
    if (mtype === 'image') {
        return { image: buf, caption: caption || msgObj.caption || VV_CONFIG.retrievedMsg };
    }
    if (mtype === 'video') {
        return { video: buf, mimetype: 'video/mp4', caption: caption || msgObj.caption || VV_CONFIG.retrievedMsg };
    }
    if (mtype === 'audio') {
        const isPtt = msgObj?.ptt === true;
        return {
            audio   : buf,
            mimetype: msgObj?.mimetype || (isPtt ? 'audio/ogg; codecs=opus' : 'audio/mp4'),
            ptt     : isPtt,
            fileName: isPtt ? 'voice.ogg' : 'audio.mp3',
        };
    }
    return null;
}

/* ── Auto-intercept ───────────────────────────────────────────────────────── */
async function handleAutoVV(sock, msg) {
    try {
        const triggers = loadTriggers();
        if (!triggers.length) return;

        const chatId = msg.key?.remoteJid;
        if (!chatId) return;

        const body = (
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption || ''
        ).trim().toLowerCase();

        if (!triggers.some(t => body === t.toLowerCase() || body.includes(t.toLowerCase()))) return;

        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        if (!contextInfo?.quotedMessage) return;

        const detected = detectViewOnce(contextInfo.quotedMessage);
        if (!detected) return;

        const { mtype, msgObj, inner } = detected;
        const fakeMsg = { key: { remoteJid: chatId }, message: contextInfo.quotedMessage };
        const buf     = await downloadBuffer(sock, fakeMsg, inner);

        const botNum   = normaliseNum(sock.user?.id || '');
        const ownerJid = botNum ? `${botNum}@s.whatsapp.net` : null;
        if (ownerJid) {
            const content = buildContent(mtype, buf, msgObj, VV_CONFIG.autoCaption);
            if (content) await sock.sendMessage(ownerJid, content);
        }
    } catch (e) { console.error('[VV-AUTO]', e.message); }
}

/* ══════════════════════════════════════════════════════════════════
   COMMAND: .vv / .viewonce
   • .vv          → sends media to the INBOX of whoever used it
   • .vv inbox    → same (explicit)
   • .vv group    → re-sends in current group
   ⚠️  Inbox delivery uses resolveInboxJid() which correctly maps
       @lid senders → sock.user.id (the linked device's real inbox)
══════════════════════════════════════════════════════════════════ */
const vvCommand = {
    command    : 'viewonce',
    aliases    : ['vv', 'viewmedia', 'vvget'],
    category   : 'general',
    description: 'Re-send a view-once image, video, audio, or voice note.',
    usage      : '.vv [inbox|group]',

    async handler(sock, message, args, context = {}) {
        const chatId    = context.chatId || message.key.remoteJid;
        const isGroup   = chatId.endsWith('@g.us');
        const senderJid = getSender(message, context);

        const sub = (safeArgs(args)[0] || '').toLowerCase().trim();
        let targetChat, destination;

        if (sub === 'group') {
            if (!isGroup) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ *You are not in a group.*\nSending to your inbox instead.'
                }, { quoted: message });
                targetChat  = resolveInboxJid(senderJid, sock);
                destination = 'inbox';
            } else {
                targetChat  = chatId;
                destination = 'group';
            }
        } else if (sub === 'inbox' || sub === '') {
            targetChat  = resolveInboxJid(senderJid, sock);
            destination = 'inbox';
        } else {
            return await sock.sendMessage(chatId, { text: VV_CONFIG.invalidOptMsg }, { quoted: message });
        }

        if (!targetChat) {
            return await sock.sendMessage(chatId, { text: '❌ Could not resolve inbox target.' }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: VV_CONFIG.processingEmoji, key: message.key } });

        try {
            const contextInfo = message.message?.extendedTextMessage?.contextInfo;
            const quotedMsg   = contextInfo?.quotedMessage;

            if (!quotedMsg) {
                await sock.sendMessage(chatId, { react: { text: VV_CONFIG.errorEmoji, key: message.key } });
                return await sock.sendMessage(chatId, { text: VV_CONFIG.noReplyMsg }, { quoted: message });
            }

            const detected = detectViewOnce(quotedMsg);
            if (!detected) {
                await sock.sendMessage(chatId, { react: { text: VV_CONFIG.errorEmoji, key: message.key } });
                return await sock.sendMessage(chatId, { text: VV_CONFIG.noMediaMsg }, { quoted: message });
            }

            const { mtype, msgObj, inner } = detected;

            // Try downloadContentFromMessage first (newer, more reliable)
            let buffer;
            try {
                buffer = await downloadContentBuffer(msgObj, mtype);
            } catch {
                // Fallback to downloadMediaMessage
                buffer = await downloadBuffer(sock, message, inner);
            }

            const content = buildContent(mtype, buffer, msgObj);
            if (content) await sock.sendMessage(targetChat, content, { quoted: message });

            await sock.sendMessage(chatId, { react: { text: VV_CONFIG.successEmoji, key: message.key } });

        } catch (err) {
            console.error('[VIEWONCE ERROR]', err.message);
            await sock.sendMessage(chatId, { react: { text: VV_CONFIG.errorEmoji, key: message.key } });
            await sock.sendMessage(chatId, { text: VV_CONFIG.errorMsg }, { quoted: message });
        }
    }
};

/* ══════════════════════════════════════════════════════════════════
   COMMAND: .vv2
   Retrieve view-once media and send it directly to the current chat
   (whether it's a group, private DM, or any other conversation).
   Owner + sudo + linked devices (@lid) allowed.
══════════════════════════════════════════════════════════════════ */
const vv2Command = {
    command    : 'vv2',
    aliases    : ['vvdm', 'vvinbox'],   // kept for compatibility
    category   : 'owner',
    description: 'Retrieve view-once media and send it to the current chat (group or private)',
    usage      : '.vv2 — reply to a view-once',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const sender = getSender(message, context);

        if (!isSudoOrOwner(sock, sender, context, message)) {
            return await sock.sendMessage(chatId, { text: VV_CONFIG.notAllowedMsg }, { quoted: message });
        }

        const contextInfo = message.message?.extendedTextMessage?.contextInfo;
        if (!contextInfo?.quotedMessage) {
            return await sock.sendMessage(chatId, { text: '*🍁 Please reply to a view once message!*' }, { quoted: message });
        }

        const detected = detectViewOnce(contextInfo.quotedMessage);
        if (!detected) {
            return await sock.sendMessage(chatId, { text: VV_CONFIG.notVVMsg }, { quoted: message });
        }

        const { mtype, msgObj, inner } = detected;

        let buffer, mimetype = '', caption = '', isPtt = false;
        try {
            try {
                buffer = await downloadContentBuffer(msgObj, mtype);
            } catch {
                buffer = await downloadBuffer(sock, message, inner);
            }
            mimetype = mtype === 'audio' ? 'audio/mp4' : (msgObj.mimetype || (mtype === 'image' ? 'image/jpeg' : 'video/mp4'));
            caption  = msgObj.caption || '';
            isPtt    = msgObj.ptt || false;
        } catch (e) {
            console.error('[VV2 DOWNLOAD ERROR]', e.message);
            return await sock.sendMessage(chatId, { text: VV_CONFIG.errorMsg }, { quoted: message });
        }

        let messageContent = {};
        if (mtype === 'image')      messageContent = { image: buffer, caption, mimetype };
        else if (mtype === 'video') messageContent = { video: buffer, caption, mimetype };
        else if (mtype === 'audio') messageContent = { audio: buffer, mimetype, ptt: isPtt };

        // Send directly to the current chat (where the command was used)
        try {
            await sock.sendMessage(chatId, messageContent, { quoted: message });
        } catch (e) {
            console.error('[VV2 SEND ERROR]', e.message);
            return await sock.sendMessage(chatId, { text: VV_CONFIG.errorMsg }, { quoted: message });
        }
        // No deletion or confirmation message – the media appears in the chat.
    }
};

/* ══════════════════════════════════════════════════════════════════
   COMMAND: .vvset / .vvadd
══════════════════════════════════════════════════════════════════ */
const vvSetCommand = {
    command: 'vvset', aliases: ['vvadd', 'vvtrigger'],
    category: 'owner', description: 'Add a trigger word/emoji for auto-intercept',
    usage: '.vvset <word or emoji>',

    async handler(sock, message, args, context = {}) {
        const chatId  = context.chatId || message.key.remoteJid;
        const sender  = getSender(message, context);
        if (!isSudoOrOwner(sock, sender, context, message)) {
            return await sock.sendMessage(chatId, { text: VV_CONFIG.notAllowedMsg }, { quoted: message });
        }

        const trigger = safeArgs(args).join(' ').trim();
        if (!trigger) {
            return await sock.sendMessage(chatId, {
                text: `╔══════════════════════════╗\n║   📌 *VV Trigger Setup*  ║\n╚══════════════════════════╝\n\n` +
                      `*Usage:* \`.vvset <word or emoji>\`\n\n*Examples:*\n• \`.vvset 👀\`\n• \`.vvset save\`\n• \`.vvset 🔥\`\n\n` +
                      `_When anyone replies to a view-once with your trigger word, it silently lands in the owner's DM._ 📥`
            }, { quoted: message });
        }

        const triggers = loadTriggers();
        if (triggers.some(t => t.toLowerCase() === trigger.toLowerCase())) {
            return await sock.sendMessage(chatId, { text: `✅ Trigger *"${trigger}"* is already set.` }, { quoted: message });
        }
        triggers.push(trigger);
        if (!saveTriggers(triggers)) {
            return await sock.sendMessage(chatId, { text: '❌ *Failed to save trigger.*' }, { quoted: message });
        }
        await sock.sendMessage(chatId, {
            text: `✅ *Trigger Added!*\n\n🔑 *Word/Emoji:* \`${trigger}\`\n📊 *Total:* ${triggers.length}\n\n_Reply to a view-once with this word to auto-save it to owner DM._ 🤫`
        }, { quoted: message });
    }
};

/* ── .vvremove ─────────────────────────────────────────────────────────────── */
const vvRemoveCommand = {
    command: 'vvremove', aliases: ['vvdel', 'vvunset'],
    category: 'owner', description: 'Remove a view-once trigger word',
    usage: '.vvremove <word>',

    async handler(sock, message, args, context = {}) {
        const chatId  = context.chatId || message.key.remoteJid;
        const sender  = getSender(message, context);
        if (!isSudoOrOwner(sock, sender, context, message)) {
            return await sock.sendMessage(chatId, { text: VV_CONFIG.notAllowedMsg }, { quoted: message });
        }
        const trigger = safeArgs(args).join(' ').trim();
        if (!trigger) return await sock.sendMessage(chatId, { text: '*Usage:* `.vvremove <trigger>`' }, { quoted: message });

        let triggers = loadTriggers();
        const idx = triggers.findIndex(t => t.toLowerCase() === trigger.toLowerCase());
        if (idx === -1) return await sock.sendMessage(chatId, { text: `❌ Trigger *"${trigger}"* not found.` }, { quoted: message });

        triggers.splice(idx, 1);
        saveTriggers(triggers);
        await sock.sendMessage(chatId, { text: `🗑️ Trigger *"${trigger}"* removed.\n📊 *Remaining:* ${triggers.length}` }, { quoted: message });
    }
};

/* ── .vvlist ───────────────────────────────────────────────────────────────── */
const vvListCommand = {
    command: 'vvlist', aliases: ['vvtriggers'],
    category: 'owner', description: 'List all active view-once triggers',
    usage: '.vvlist',

    async handler(sock, message, args, context = {}) {
        const chatId  = context.chatId || message.key.remoteJid;
        const sender  = getSender(message, context);
        if (!isSudoOrOwner(sock, sender, context, message)) {
            return await sock.sendMessage(chatId, { text: VV_CONFIG.notAllowedMsg }, { quoted: message });
        }
        const triggers = loadTriggers();
        if (!triggers.length) {
            return await sock.sendMessage(chatId, {
                text: `📋 *VV Triggers*\n\n_No triggers set yet._\nUse \`.vvset <word>\` to add one.`
            }, { quoted: message });
        }
        const list = triggers.map((t, i) => `  ${i + 1}. ${t}`).join('\n');
        await sock.sendMessage(chatId, {
            text: `╔════════════════════════════╗\n║  📋 *Active VV Triggers*   ║\n╚════════════════════════════╝\n\n${list}\n\n*Total:* ${triggers.length}\n\n_Reply to any view-once with these words to auto-save to owner DM._ 👁️`
        }, { quoted: message });
    }
};

/* ── Exports ──────────────────────────────────────────────────────────────── */
module.exports = [vvCommand, vv2Command, vvSetCommand, vvRemoveCommand, vvListCommand];
module.exports.handleAutoVV = handleAutoVV;

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading viewonce.js:', e.message); }

/* ===== readmore.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

module.exports = {
  command: 'readmore',
  aliases: ['rmadd', 'readadd'],
  category: 'tools',
  description: 'Hide text using read more',
  usage: '.readmore text\n.readmore text1|text2',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(' ').trim();
    if (!text) {
      return await sock.sendMessage(
        chatId,
        { text: 'Usage:\n.readmore text\n.readmore text1|text2' },
        { quoted: message }
      );
    }
    let output;
    if (text.includes('|')) {
      const parts = text.split('|');
      const firstPart = parts.shift();
      const rest = parts.join('|');
      output = firstPart + readMore + rest;
    } else {
      output = text + readMore;
    }
    await sock.sendMessage(chatId, { text: output }, { quoted: message });
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading readmore.js:', e.message); }

/* ===== forwarded.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@AbdulRehman19721986                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *                                                                           *
 *    © 2026 AbdulRehman19721986. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the REDXBOT302 Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/


module.exports = {
  command: 'forwarded',
  aliases: ['viral', 'fakeforward'],
  category: 'tools',
  description: 'Send text with a fake "Frequently Forwarded" tag',
  usage: '.viral <text> OR reply to a message',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    
    try {
      let txt = "";
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (quoted) {
        txt = quoted.conversation || 
              quoted.extendedTextMessage?.text || 
              quoted.imageMessage?.caption || 
              quoted.videoMessage?.caption || 
              "";
      } 
      
      if (!txt || txt.trim() === "") {
        txt = args?.join(' ') || "";
      }

      if (!txt || txt.trim() === "") {
        return await sock.sendMessage(chatId, { 
          text: 'Please provide text or reply to a message to forward.' 
        }, { quoted: message });
      }

      await sock.sendMessage(chatId, { 
        text: txt,
        contextInfo: { 
          isForwarded: true, 
          forwardingScore: 999 
        } 
      });

    } catch (err) {
      console.error('Forwarding Spoof Error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to spoof forwarding.' });
    }
  }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰² & Muzamil Khan                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986                         *
 *  ▶️  YouTube  : https://youtube.com/@AbdulRehman19721986                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *                                                                           *
 *    © 2026 AbdulRehman19721986. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the REDXBOT302 Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/


    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading forwarded.js:', e.message); }

/* ===== handwriting.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'handwrite',
  aliases: ['hw', 'writehand'],
  category: 'tools',
  description: 'Convert text to handwritten-style image',
  usage: '.handwrite <text>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const textInput = args?.join(' ')?.trim();

    if (!textInput) {
      return await sock.sendMessage(chatId, { text: '*Provide some text to handwrite.*\nExample: .handwrite Hello World' }, { quoted: message });
    }

    try {
      const apiUrl = `https://discardapi.onrender.com/api/tools/handwrite?apikey=guru&text=${encodeURIComponent(textInput)}`;

      const { data } = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
      });

      const caption = `✍️ Handwritten Text:\n${textInput}`;
      await sock.sendMessage(chatId, { image: { buffer: data }, caption }, { quoted: message });

    } catch (error) {
      console.error('Handwrite plugin error:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { text: '❌ Request timed out. The API may be slow or unreachable.' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: '❌ Failed to generate handwritten image.' }, { quoted: message });
      }
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading handwriting.js:', e.message); }

/* ===== poetry.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/poetry.js
module.exports = {
  command: 'poetry',
  aliases: ['poem', 'shayari'],
  category: 'fun',
  description: 'Get a random poetry line in your chosen language',
  usage: '.poetry [language] (reply to a message for context)',
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const language = args[0]?.toLowerCase() || 'english';

    // Poetry database by language
    const poetryDB = {
      english: [
        "The woods are lovely, dark and deep, But I have promises to keep.",
        "Two roads diverged in a wood, and I— I took the one less traveled by.",
        "Hope is the thing with feathers that perches in the soul.",
        "I wandered lonely as a cloud that floats on high o'er vales and hills.",
        "Shall I compare thee to a summer's day? Thou art more lovely and more temperate.",
        "Because I could not stop for Death – He kindly stopped for me.",
        "Do not go gentle into that good night, Old age should burn and rave at close of day.",
        "The best laid schemes o' mice an' men gang aft agley.",
        "How do I love thee? Let me count the ways.",
        "To be, or not to be, that is the question."
      ],
      urdu: [
        "ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے",
        "دل ہی تو ہے نہ سنگ و خشت، درد سے بھر نہ آئے کیوں",
        "محبت میں نہیں ہے فرق جینے اور مرنے کا",
        "تمہارے نام سے پہلے مرا لکھا تھا جو کبھی",
        "اب کے ہم بچھڑے تو شاید کبھی خوابوں میں ملیں",
        "وہ جس نے دل کو ہنسنا سکھایا، اسے کیا ہوا؟",
        "یہ دنیا اگر مل بھی جائے تو کیا ہے",
        "دل سے جو بات نکلتی ہے، اثر رکھتی ہے",
        "کچھ اس ادا سے گزرے وہ کہ گزرے دنوں کی طرح",
        "اب اس کے بعد تو آنے لگے ہیں منظر سب"
      ],
      hindi: [
        "कभी कभी यूं भी हमने दिल को बहलाया है",
        "चाँद तारे तोड़ लाऊँ, आसमां से तुम पे लुटाऊँ",
        "तेरे बिना भी क्या होता, ये तो बताओ",
        "दिल की बातों को हम क्या समझाएं",
        "राहों में खड़े हैं तेरे हम, कब तलक यूं ही रहेंगे",
        "ये दिल तुझ पे आया है, तू माने या न माने",
        "मैं तेरा दीवाना हूँ, तू मेरी दीवानी है",
        "चाँद सितारों का महल बनाएँ, तुमको दिल में बसाएँ",
        "बहुत खूबसूरत हो तुम, ये बात तो सच है",
        "दिल से दिल मिले तो ये, मौसम भी हंस दे"
      ],
      punjabi: [
        "ਸੱਜਣਾ ਵੇ ਸੱਜਣਾ, ਦਿਲ ਵਿੱਚ ਰੱਖਾਂ ਤੈਨੂੰ",
        "ਚੰਨ ਵਾਂਗੂੰ ਚਮਕਦਾ, ਤੂੰ ਮੇਰਾ ਹੀ ਰਹਿੰਦਾ",
        "ਬੋਲੀਆਂ ਪਾ ਦੇ, ਗਿੱਧਾ ਪਾ ਦੇ",
        "ਦਿਲ ਤੋਂ ਨਿਕਲੀ ਹਰ ਗੱਲ, ਦਿਲ ਨੂੰ ਛੂਹ ਜਾਂਦੀ",
        "ਮਿੱਤਰਾਂ ਦਾ ਰੰਗ, ਨਿਹੁੰ ਦਾ ਰੰਗ ਨਿਰਾਲਾ",
        "ਜਿੰਦ ਮੇਰੀ ਨੂੰ ਤੂੰ ਹੀ ਪਤਾ, ਕਿਵੇਂ ਜਿਊਂਦੀ ਹਾਂ",
        "ਠੰਡੀ ਠੰਡੀ ਛਾਂ, ਤੇਰੇ ਨਾਲ ਬਹਿ ਕੇ",
        "ਨਜ਼ਰਾਂ ਨਾਲ ਨਜ਼ਰਾਂ ਮਿਲਾ, ਦਿਲ ਦਾ ਹਾਲ ਸੁਣਾ",
        "ਵੇ ਤੈਨੂੰ ਚੰਨ ਆਖਾਂ, ਜਾਂ ਚੰਨ ਨੂੰ ਤੈਂ ਆਖਾਂ",
        "ਰੂਪ ਤੇਰਾ ਐਸਾ, ਜਿਵੇਂ ਬਹਾਰਾਂ ਦਾ ਮੌਸਮ"
      ]
    };

    // Fallback if language not found
    if (!poetryDB[language]) {
      return await sock.sendMessage(chatId, {
        text: `❌ Language not supported. Choose from: ${Object.keys(poetryDB).join(', ')}`,
        ...channelInfo
      }, { quoted: message });
    }

    // Get random poetry line
    const lines = poetryDB[language];
    const randomLine = lines[Math.floor(Math.random() * lines.length)];

    // Determine quoted message (if replying)
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ? message
      : null;

    // Send the poetry
    await sock.sendMessage(chatId, {
      text: `📜 *Poetry (${language})*\n\n${randomLine}`,
      ...channelInfo
    }, { quoted: quotedMsg || message });
  }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading poetry.js:', e.message); }

/* ===== novel.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
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
const fs = require('fs');
const path = require('path');
const { fromBuffer } = require('file-type');

// RapidAPI configuration - users need to sign up at https://rapidapi.com/tribestick-tribestick-default/api/annas-archive-api
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'YOUR_RAPIDAPI_KEY_HERE';
const RAPIDAPI_HOST = 'annas-archive-api.p.rapidapi.com';

/**
 * Search for novels using Anna's Archive API
 * @param {string} query - Search term (title, author, ISBN)
 * @param {number} limit - Number of results (max 20)
 */
async function searchNovels(query, limit = 10) {
    try {
        const options = {
            method: 'GET',
            url: 'https://annas-archive-api.p.rapidapi.com/findBook',
            params: {
                q: query,
                limit: limit,
                ext: 'pdf', // Prioritize PDF results
                lang: 'en'   // English results
            },
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        };

        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error('[NOVEL] Search error:', error.message);
        throw new Error('Failed to search novels. API might be unavailable.');
    }
}

/**
 * Get download links for a specific book by MD5 hash
 * @param {string} md5 - MD5 hash from search results
 */
async function getDownloadLinks(md5) {
    try {
        const options = {
            method: 'GET',
            url: 'https://annas-archive-api.p.rapidapi.com/downloadBook',
            params: { md5: md5 },
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        };

        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error('[NOVEL] Download links error:', error.message);
        throw new Error('Failed to get download links.');
    }
}

/**
 * Format file size nicely
 */
function formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Check if a novel has an audiobook/YouTube version (simulated - you can expand this)
 * This could integrate with YouTube search or a dedicated audiobook API
 */
async function findAudiobook(novelTitle, author) {
    // You can implement actual YouTube search here using your existing ytdown infrastructure
    // For now, return null (no audio) - you can expand this later
    return null;
    
    /* Example implementation using your play command's search:
    const yts = require('yt-search');
    const query = `${novelTitle} ${author} audiobook`;
    const results = await yts(query);
    if (results.videos.length > 0) {
        return {
            title: results.videos[0].title,
            url: results.videos[0].url,
            duration: results.videos[0].timestamp
        };
    }
    return null;
    */
}

module.exports = {
    command: 'novel',
    aliases: ['book', 'noveldl', 'ebook'],
    category: 'media',
    description: 'Search and download novels as PDF, with optional audiobook links',
    usage: '.novel <search term>',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const query = args.join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: `📚 *NOVEL DOWNLOADER*\n\n` +
                      `*Usage:* \`.novel <book title or author>\`\n\n` +
                      `*Example:*\n` +
                      `• \`.novel Harry Potter\`\n` +
                      `• \`.novel The Hobbit\`\n` +
                      `• \`.novel Stephen King\`\n\n` +
                      `_Searches Anna's Archive and provides PDF downloads_`,
                ...channelInfo
            }, { quoted: message });
        }

        // Initial reaction
        await sock.sendMessage(chatId, { react: { text: '📚', key: message.key } });

        try {
            // 1. Search for novels
            await sock.sendMessage(chatId, {
                text: `🔍 Searching for "*${query}*"...`,
                ...channelInfo
            }, { quoted: message });

            const searchResults = await searchNovels(query, 8);

            if (!searchResults || !searchResults.data || searchResults.data.length === 0) {
                await sock.sendMessage(chatId, {
                    text: '❌ No novels found. Try a different search term.',
                    ...channelInfo
                }, { quoted: message });
                return;
            }

            // 2. Store results temporarily for selection
            const novels = searchResults.data.slice(0, 8); // Show max 8 results
            const sessionId = Date.now().toString();
            
            // Build selection message with cover images
            let selectionText = `📚 *Found ${novels.length} novels for "${query}"*\n\n`;
            
            for (let i = 0; i < novels.length; i++) {
                const book = novels[i];
                const title = book.title || 'Unknown Title';
                const author = book.author || 'Unknown Author';
                const year = book.year || 'N/A';
                const pages = book.pages || 'N/A';
                const size = formatFileSize(book.filesize);
                
                selectionText += `*${i + 1}.* ${title}\n`;
                selectionText += `   👤 *Author:* ${author}\n`;
                selectionText += `   📅 *Year:* ${year} | 📄 *Pages:* ${pages} | 💾 *Size:* ${size}\n\n`;
            }
            
            selectionText += `_Reply with the number (1-${novels.length}) to download the PDF._\n`;
            selectionText += `_Or type \`cancel\` to abort._`;

            // Store novels in memory temporarily (you could use a global variable or store)
            if (!global.novelSessions) global.novelSessions = {};
            global.novelSessions[chatId] = {
                novels: novels,
                timestamp: Date.now()
            };

            // Send first book's cover as preview (optional)
            if (novels[0].coverUrl) {
                await sock.sendMessage(chatId, {
                    image: { url: novels[0].coverUrl },
                    caption: selectionText,
                    ...channelInfo
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: selectionText,
                    ...channelInfo
                }, { quoted: message });
            }

            // 3. Wait for user selection (handled in message handler)
            // This would need integration with your main message handler
            // For now, we'll implement a simple listener in the next section

        } catch (error) {
            console.error('[NOVEL] Error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    },

    // Handle selection replies - this should be called from your main message handler
    async handleSelection(sock, message, context) {
        const { chatId, channelInfo } = context;
        const text = context.messageText || '';
        
        // Check if this is a number reply (1-8)
        const num = parseInt(text);
        if (isNaN(num) || num < 1 || num > 8) return false;

        // Check if there's an active session
        if (!global.novelSessions || !global.novelSessions[chatId]) return false;
        
        const session = global.novelSessions[chatId];
        const novels = session.novels;
        
        if (num > novels.length) return false;

        const selected = novels[num - 1];
        
        // React to indicate processing
        await sock.sendMessage(chatId, { react: { text: '⬇️', key: message.key } });

        try {
            // Get download links
            await sock.sendMessage(chatId, {
                text: `📥 Getting download links for "${selected.title}"...`,
                ...channelInfo
            }, { quoted: message });

            const downloadData = await getDownloadLinks(selected.md5);
            
            if (!downloadData || !downloadData.downloads || downloadData.downloads.length === 0) {
                throw new Error('No download links available');
            }

            // Get first PDF download link
            const downloadLink = downloadData.downloads[0].url;
            
            // Download the PDF
            await sock.sendMessage(chatId, {
                text: `⬇️ Downloading PDF (${formatFileSize(selected.filesize)})...`,
                ...channelInfo
            }, { quoted: message });

            const pdfResponse = await axios.get(downloadLink, { 
                responseType: 'arraybuffer',
                timeout: 120000 // 2 minute timeout for large files
            });
            
            const pdfBuffer = Buffer.from(pdfResponse.data);

            // Send as document
            await sock.sendMessage(chatId, {
                document: pdfBuffer,
                mimetype: 'application/pdf',
                fileName: `${selected.title.replace(/[^\w\s]/gi, '')}.pdf`,
                caption: `✅ *${selected.title}*\n👤 *Author:* ${selected.author || 'Unknown'}`,
                ...channelInfo
            }, { quoted: message });

            // Check for audiobook (optional)
            const audioBook = await findAudiobook(selected.title, selected.author);
            if (audioBook) {
                await sock.sendMessage(chatId, {
                    text: `🎧 *Audiobook Available:*\n${audioBook.title}\n${audioBook.url}\nDuration: ${audioBook.duration}`,
                    ...channelInfo
                }, { quoted: message });
            }

            // Clean up session
            delete global.novelSessions[chatId];

        } catch (error) {
            console.error('[NOVEL] Download error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Download failed: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }

        return true;
    }
};

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading novel.js:', e.message); }

/* ===== sound.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');
    const fs = require('fs');
    const path = require('path');
    const { promisify } = require('util');
    const exec = promisify(require('child_process').exec);

    const soundEffects = {
      gaalis: [
        { text: 'Madarchod! Bhenchod!', emotion: 'angry', emoji: '🤬' },
        { text: 'Teri maa ka bhosda!', emotion: 'angry', emoji: '😡' },
        { text: 'Bhen ke lode!', emotion: 'aggressive', emoji: '🖕' },
        { text: 'Tatti chod! Randi ke!', emotion: 'disgust', emoji: '💩' },
        { text: 'Gaand mara! Chutiye!', emotion: 'aggressive', emoji: '🍑' },
        { text: 'Mia Khalifa ki aulad!', emotion: 'aggressive', emoji: '🔥' },
        { text: 'Johny Sins ki aulaad!', emotion: 'funny', emoji: '😈' },
        { text: 'Bhan ka taka!', emotion: 'funny', emoji: '🍆' },
        { text: 'Teri ma ko lun!', emotion: 'aggressive', emoji: '💦' },
        { text: 'Fuck your whole family!', emotion: 'screaming', emoji: '👪' }
      ],
      // These are real hosted MP3 endpoints. The old version used example.com,
      // which can never provide the requested audio.
      soundFiles: {
        slap: 'https://www.myinstants.com/media/sounds/punch.mp3',
        thappad: 'https://www.myinstants.com/media/sounds/punch.mp3',
        chudai: 'https://www.myinstants.com/media/sounds/fart-with-reverb.mp3',
        moan: 'https://www.myinstants.com/media/sounds/ha-gayyy.mp3',
        spit: 'https://www.myinstants.com/media/sounds/nope-sound-effect.mp3',
        punch: 'https://www.myinstants.com/media/sounds/punch.mp3',
        kiss: 'https://www.myinstants.com/media/sounds/kiss.mp3',
        laugh: 'https://www.myinstants.com/media/sounds/ha-gayyy.mp3',
        scream: 'https://www.myinstants.com/media/sounds/wilhelm-scream.mp3',
        fart: 'https://www.myinstants.com/media/sounds/fart-with-reverb.mp3'
      }
    };

    const VOICES = {
      angry: 'Brian', aggressive: 'Brian', default: 'Aditi',
      funny: 'Matthew', sarcastic: 'Kimberly', screaming: 'Ivy', disgust: 'Aditi'
    };

    async function streamElementsToBuffer(text, emotion='default') {
      const voice = VOICES[emotion] || VOICES.default;
      const r = await axios.get('https://api.streamelements.com/kappa/v2/speech', {
        params: { voice, text: text.slice(0, 500) },
        responseType: 'arraybuffer', timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const b = Buffer.from(r.data);
      if (!b.length) throw new Error('TTS returned empty audio');
      return b;
    }

    async function googleTTSBuffer(text, lang='hi') {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0,200))}&tl=${lang}&client=tw-ob&ttsspeed=1`;
      const r = await axios.get(url, {
        responseType: 'arraybuffer', timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://translate.google.com/' }
      });
      const b = Buffer.from(r.data);
      if (!b.length) throw new Error('Google TTS returned empty audio');
      return b;
    }

    async function ttsBuffer(text, emotion) {
      try { return await streamElementsToBuffer(text, emotion); }
      catch (e1) {
        console.warn('[SOUND] StreamElements TTS failed:', e1.message);
        return await googleTTSBuffer(text, 'hi');
      }
    }

    async function downloadAudio(url) {
      const r = await axios.get(url, {
        responseType: 'arraybuffer', timeout: 20000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
        maxContentLength: 15 * 1024 * 1024
      });
      const b = Buffer.from(r.data);
      if (!b.length) throw new Error('Sound URL returned empty audio');
      return b;
    }

    async function toOggOpus(buffer) {
      const tmp = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, {recursive:true});
      const tag = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      const input = path.join(tmp, `sound_${tag}.mp3`);
      const output = path.join(tmp, `sound_${tag}.ogg`);
      fs.writeFileSync(input, buffer);
      try {
        const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
        await exec(`"${ffmpeg}" -y -i "${input}" -c:a libopus -ar 24000 -b:a 32k -ac 1 -f ogg "${output}"`);
        return fs.readFileSync(output);
      } finally {
        try { if (fs.existsSync(input)) fs.unlinkSync(input); } catch {}
        try { if (fs.existsSync(output)) fs.unlinkSync(output); } catch {}
      }
    }

    function listText() {
      return [
        '🎵 *Available Sound Effects:*','',
        '🎤 *Gaali Generator (TTS):*',
        ...soundEffects.gaalis.map((g,i)=>`${i+1}. .sound gaali${i+1} - ${g.emoji} ${g.text}`),'',
        '🔊 *Pre-recorded Sounds:*',
        ...Object.keys(soundEffects.soundFiles).map(s=>`• .sound ${s} - ${s}`),'',
        '📝 *Examples:*',
        '.sound gaali1',
        '.sound slap',
        '.sound custom hello everyone'
      ].join('\n');
    }

    module.exports = {
      command: 'sound',
      aliases: ['audio', 'gaalisound', 'bol'],
      category: 'fun',
      description: 'Play TTS gaalis and sound effects',
      usage: '.sound <gaali1-10|sound|custom text>',
      async handler(sock, message, args, context = {}) {
        const { chatId, channelInfo } = context;
        try {
          if (!args || !args.length) {
            return await sock.sendMessage(chatId, { text: listText(), ...channelInfo }, {quoted: message});
          }
          const command = String(args[0]).toLowerCase();
          let buffer;
          let fileName = 'sound.mp3';

          if (soundEffects.soundFiles[command]) {
            buffer = await downloadAudio(soundEffects.soundFiles[command]);
            fileName = `${command}.mp3`;
          } else if (/^gaali\d+$/.test(command)) {
            const n = Number(command.slice(5));
            if (n < 1 || n > soundEffects.gaalis.length) throw new Error('Gaali number must be 1-10');
            buffer = await ttsBuffer(soundEffects.gaalis[n-1].text, soundEffects.gaalis[n-1].emotion);
            fileName = `${command}.mp3`;
          } else if (command === 'custom' && args.length > 1) {
            buffer = await ttsBuffer(args.slice(1).join(' '), 'default');
            fileName = 'custom.mp3';
          } else {
            return await sock.sendMessage(chatId, { text: `❌ Sound *${command}* not found.\n\nUse *.sound* to see the list.`, ...channelInfo }, {quoted: message});
          }

          let audio = buffer, mimetype = 'audio/mpeg', ptt = false;
          try {
            audio = await toOggOpus(buffer);
            mimetype = 'audio/ogg; codecs=opus';
            ptt = true;
          } catch (e) {
            console.warn('[SOUND] ffmpeg conversion skipped:', e.message);
          }

          await sock.sendMessage(chatId, {
            audio, mimetype, ptt,
            fileName: ptt ? undefined : fileName,
            ...channelInfo
          }, {quoted: message});
        } catch (error) {
          console.error('[SOUND] Error:', error.message);
          await sock.sendMessage(chatId, { text: `❌ Sound failed: ${error.message}`, ...channelInfo }, {quoted: message});
        }
      }
    };
    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m);
    else for (const k of Object.keys(_m)) { const v=_m[k]; if(Array.isArray(v)) _bundle.push(...v.filter(p=>p&&p.command&&typeof p.handler==='function')); }
  }
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading sound.js:', e.message); }

/* ===== sound2.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    // plugins/sound2.js
const axios = require('axios');

// Use reliable CDN URLs (ensure they end with .mp3 and return correct mime)
const SOUNDS = {
  // Classic memes
  taptap:     { url: 'https://www.myinstants.com/media/sounds/vine-boom.mp3', label: '💥 Vine Boom' },
  boom:       { url: 'https://www.myinstants.com/media/sounds/vine-boom.mp3', label: '💥 Boom' },
  bruh:       { url: 'https://www.myinstants.com/media/sounds/bruh.mp3', label: '😐 Bruh' },
  airhorn:    { url: 'https://www.myinstants.com/media/sounds/air-horn-club-sample.mp3', label: '📯 Air Horn' },
  oof:        { url: 'https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3', label: '😣 Oof' },
  fart:       { url: 'https://www.myinstants.com/media/sounds/fart-with-reverb.mp3', label: '💨 Fart' },
  nope:       { url: 'https://www.myinstants.com/media/sounds/nope-sound-effect.mp3', label: '🚫 Nope' },
  sus:        { url: 'https://www.myinstants.com/media/sounds/among-us-role-reveal-sound.mp3', label: '🔴 Sus' },
  sad:        { url: 'https://www.myinstants.com/media/sounds/sad-violin.mp3', label: '🎻 Sad Violin' },
  windows:    { url: 'https://www.myinstants.com/media/sounds/windows-xp-error.mp3', label: '💻 Windows Error' },
  laugh:      { url: 'https://www.myinstants.com/media/sounds/ha-gayyy.mp3', label: '😂 Ha Gay' },
  nyan:       { url: 'https://www.myinstants.com/media/sounds/nyan-cat_1.mp3', label: '🌈 Nyan Cat' },
  wow:        { url: 'https://www.myinstants.com/media/sounds/wow.mp3', label: '😮 Wow' },
  crickets:   { url: 'https://www.myinstants.com/media/sounds/crickets.mp3', label: '🦗 Crickets' },
  clap:       { url: 'https://www.myinstants.com/media/sounds/clap.mp3', label: '👏 Clap' },
  mlg:        { url: 'https://www.myinstants.com/media/sounds/mlg-airhorn.mp3', label: '🎯 MLG Airhorn' },
  ohno:       { url: 'https://www.myinstants.com/media/sounds/oh-no-oh-no-oh-no-no-no-no-no.mp3', label: '😱 Oh No' },
  rizz:       { url: 'https://www.myinstants.com/media/sounds/rizz-sound-effect.mp3', label: '😎 Rizz' },
  ohio:       { url: 'https://www.myinstants.com/media/sounds/ohio-meme-sound.mp3', label: '🌀 Ohio' },
  sigma:      { url: 'https://www.myinstants.com/media/sounds/sigma-male-grindset.mp3', label: '💪 Sigma' },
  skibidi:    { url: 'https://www.myinstants.com/media/sounds/skibidi-toilet-song.mp3', label: '🚽 Skibidi' },
  tutorial:   { url: 'https://www.myinstants.com/media/sounds/tutorial-complete.mp3', label: '✅ Tutorial Complete' },
  emotional:  { url: 'https://www.myinstants.com/media/sounds/emotional-damage.mp3', label: '💀 Emotional Damage' },
  money:      { url: 'https://www.myinstants.com/media/sounds/cash-register.mp3', label: '💵 Cash Register' },
  wrong:      { url: 'https://www.myinstants.com/media/sounds/wrong-answer-sound-effect.mp3', label: '❌ Wrong Answer' },
  correct:    { url: 'https://www.myinstants.com/media/sounds/correct-sound-effect.mp3', label: '✅ Correct' },
  among:      { url: 'https://www.myinstants.com/media/sounds/among-us-soundboard.mp3', label: '🔴 Among Us' },
  inception:  { url: 'https://www.myinstants.com/media/sounds/inception-bwaaah.mp3', label: '🌀 Inception' },
  dramatic:   { url: 'https://www.myinstants.com/media/sounds/dramatic-chipmunk.mp3', label: '🐿️ Dramatic' },
  quandale:   { url: 'https://www.myinstants.com/media/sounds/quandale-dingle.mp3', label: '😭 Quandale' },
  // Aggressive / viral
  beatbox:    { url: 'https://www.myinstants.com/media/sounds/beatbox-fail.mp3', label: '🎤 Beatbox Fail' },
  explosion:  { url: 'https://www.myinstants.com/media/sounds/explosion.mp3', label: '💥 Explosion' },
  glass:      { url: 'https://www.myinstants.com/media/sounds/glass-break.mp3', label: '🔨 Glass Break' },
  scream:     { url: 'https://www.myinstants.com/media/sounds/wilhelm-scream.mp3', label: '😱 Wilhelm Scream' },
  dab:        { url: 'https://www.myinstants.com/media/sounds/dab.mp3', label: '🕺 Dab' },
  illuminati: { url: 'https://www.myinstants.com/media/sounds/illuminati.mp3', label: '👁️ Illuminati' },
  metal:      { url: 'https://www.myinstants.com/media/sounds/metal-pipe.mp3', label: '🎸 Metal Pipe' },
  what:       { url: 'https://www.myinstants.com/media/sounds/what.mp3', label: '❓ What?' },
  mario:      { url: 'https://www.myinstants.com/media/sounds/mario-coin.mp3', label: '🍄 Mario Coin' },
  zelda:      { url: 'https://www.myinstants.com/media/sounds/zelda-secret.mp3', label: '🗡️ Zelda Secret' },
  pokemon:    { url: 'https://www.myinstants.com/media/sounds/pokemon-heal.mp3', label: '⚡ Pokémon Heal' },
  sonic:      { url: 'https://www.myinstants.com/media/sounds/sonic-ring.mp3', label: '💨 Sonic Ring' },
  minecraft:  { url: 'https://www.myinstants.com/media/sounds/minecraft-damage.mp3', label: '⛏️ Minecraft Damage' },
  roblox:     { url: 'https://www.myinstants.com/media/sounds/roblox-oof.mp3', label: '🕹️ Roblox Oof' },
  fortnite:   { url: 'https://www.myinstants.com/media/sounds/fortnite-default-dance.mp3', label: '🎮 Fortnite Dance' },
  // Indian/Hindi
  ladla:      { url: 'https://www.myinstants.com/media/sounds/ladla-meme.mp3', label: '👑 Ladla' },
  bhai:       { url: 'https://www.myinstants.com/media/sounds/bhai-kya-kar-raha-hai.mp3', label: '👬 Bhai' },
  mamu:       { url: 'https://www.myinstants.com/media/sounds/mamu-meme.mp3', label: '😆 Mamu' },
  pagal:      { url: 'https://www.myinstants.com/media/sounds/pagal-ho-gaya.mp3', label: '🤪 Pagal' },
  yaar:       { url: 'https://www.myinstants.com/media/sounds/yaar-kya-kar-diya.mp3', label: '😩 Yaar' },
  teri_maa:   { url: 'https://www.myinstants.com/media/sounds/teri-maa-ki.mp3', label: '😂 Teri Maa Ki' },
  waah:       { url: 'https://www.myinstants.com/media/sounds/waah-waah.mp3', label: '👏 Waah' },
  haaye:      { url: 'https://www.myinstants.com/media/sounds/haaye-haaye.mp3', label: '😭 Haaye' },
  allah:      { url: 'https://www.myinstants.com/media/sounds/allah-tobah.mp3', label: '🤲 Allah Tobah' },
  khatarnak:  { url: 'https://www.myinstants.com/media/sounds/khatarnak.mp3', label: '💀 Khatarnak' },
  bakwaas:    { url: 'https://www.myinstants.com/media/sounds/bakwaas-band-karo.mp3', label: '🗣️ Bakwaas' },
  zyada:      { url: 'https://www.myinstants.com/media/sounds/zyada-bol-raha-hai.mp3', label: '🤫 Zyada' },
  wah_usta:   { url: 'https://www.myinstants.com/media/sounds/wah-usta.mp3', label: '🏆 Wah Usta' },
  chup:       { url: 'https://www.myinstants.com/media/sounds/chup-chup.mp3', label: '🤐 Chup' },
  nikal:      { url: 'https://www.myinstants.com/media/sounds/nikal-yahan-se.mp3', label: '🚶 Nikal' },
  ladka:      { url: 'https://www.myinstants.com/media/sounds/ladka-kitna-ganda.mp3', label: '👦 Ladka' },
  mast:       { url: 'https://www.myinstants.com/media/sounds/mast-hai-bhai.mp3', label: '😎 Mast' },
  jindgi:     { url: 'https://www.myinstants.com/media/sounds/jindgi-kya-jindgi.mp3', label: '💔 Jindgi' },
  pakistan:   { url: 'https://www.myinstants.com/media/sounds/pakistan-zindabad.mp3', label: '🇵🇰 Pakistan' },
  india:      { url: 'https://www.myinstants.com/media/sounds/india-india.mp3', label: '🇮🇳 India' },
  gali:       { url: 'https://www.myinstants.com/media/sounds/madarchod-sound.mp3', label: '🤬 Gali' },
  cute:       { url: 'https://www.myinstants.com/media/sounds/aww-kitna-cute.mp3', label: '🥺 Cute' },
  amazing:    { url: 'https://www.myinstants.com/media/sounds/amazing-zabardast.mp3', label: '🎉 Amazing' },
  randi:      { url: 'https://www.myinstants.com/media/sounds/randi-ki-aulad.mp3', label: '💢 Randi' },
};

function buildSoundList() {
  let list = '🎵 *Sound2 – Aggressive Meme Sounds*\n\n';
  const keys = Object.keys(SOUNDS).sort();
  keys.forEach((k, i) => {
    list += `${i+1}. \`.sound2 ${k}\` — ${SOUNDS[k].label}\n`;
  });
  list += `\n_Use .sound2 list to see this menu._\n_Over 50+ hosted sounds – no TTS required._`;
  return list;
}

// Download audio with retry and content-type check
async function downloadAudio(url, maxRetries = 2) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const buffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'];
      if (!buffer.length) throw new Error('Empty buffer');
      if (contentType && !contentType.includes('audio/')) {
        console.warn(`Unexpected content-type: ${contentType}`);
      }
      return buffer;
    } catch (err) {
      lastError = err;
      console.log(`Attempt ${attempt} failed for ${url}: ${err.message}`);
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw lastError;
}

module.exports = {
  command: 'sound2',
  aliases: ['sfx2', 'meme2'],
  category: 'fun',
  description: 'Play aggressive/funny meme sounds (hosted, no TTS)',
  usage: '.sound2 <name>  |  .sound2 list',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const name = args[0]?.toLowerCase();

    if (!name || name === 'list') {
      return sock.sendMessage(chatId, { text: buildSoundList(), ...channelInfo }, { quoted: message });
    }

    const sound = SOUNDS[name];
    if (!sound) {
      return sock.sendMessage(chatId, {
        text: `❌ Sound *${name}* not found.\n\nUse *.sound2 list* to see all available sounds.`,
        ...channelInfo
      }, { quoted: message });
    }

    try {
      await sock.sendMessage(chatId, { react: { text: '🎵', key: message.key } });
      const audioBuffer = await downloadAudio(sound.url);
      await sock.sendMessage(chatId, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: true,
        ...channelInfo
      }, { quoted: message });
    } catch (e) {
      console.error('[SOUND2]', e.message);
      await sock.sendMessage(chatId, {
        text: `❌ Failed to play sound: ${e.message}`,
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading sound2.js:', e.message); }

/* ===== reverse.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'reverse',
  aliases: ['revt', 'reversetext'],
  category: 'tools',
  description: 'Reverse any text',
  usage: '.reverse <text>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const textToReverse = args?.join(' ')?.trim();

    if (!textToReverse) {
      return await sock.sendMessage(chatId, { text: 'Please provide text to reverse.\nExample: .reverse Hello World' }, { quoted: message });
    }

    try {
      const apiUrl = `https://discardapi.dpdns.org/api/tools/reverse?apikey=guru&text=${encodeURIComponent(textToReverse)}`;
      const { data } = await axios.get(apiUrl, { timeout: 10000 });

      if (!data?.status || !data.result) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to reverse the text.' }, { quoted: message });
      }

      const reply = `*Reversed:* ${data.result}`;

      await sock.sendMessage(chatId, { text: reply }, { quoted: message });

    } catch (error) {
      console.error('Reverse plugin error:', error);

      if (error.code === 'ECONNABORTED') {
        await sock.sendMessage(chatId, { text: '❌ Request timed out. Please try again.' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: '❌ Failed to reverse the text.' }, { quoted: message });
      }
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
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading reverse.js:', e.message); }

/* ===== slider.js ===== */
try {
  const _m = (function() {
    const module = {exports: {}}; const exports = module.exports;
    'use strict';

/*
 * Sliding-logic pager. Send one result; requester reacts ◀️ / ▶️ on the
 * bot's own message to step through the list — message edits in place,
 * no spam. Same engine for ttsearch + any list-based plugin (movie/anime/
 * lyrics/image search, etc).
 *
 * WIRING — register ONE shared reaction listener in index.js:
 *   const { handleReaction } = require('./lib/slider');
 *   sock.ev.on('messages.reaction', rs => rs.forEach(r => handleReaction(sock, r)));
 *
 * USAGE inside a plugin:
 *   const { startSlider } = require('../lib/slider');
 *   await startSlider(sock, { chatId, quoted: message, ownerId: senderJid,
 *       items: results, render: (item, i, total) => `...` });
 */

const sessions = new Map(); // msgId -> session

async function startSlider(sock, { chatId, quoted, ownerId, items, render, timeoutMs = 120000 }) {
    if (!items?.length) return sock.sendMessage(chatId, { text: '❌ No results.' }, { quoted });

    const sent = await sock.sendMessage(chatId, { text: render(items[0], 0, items.length) }, { quoted });
    await sock.sendMessage(chatId, { react: { text: '◀️', key: sent.key } });
    await sock.sendMessage(chatId, { react: { text: '▶️', key: sent.key } });

    const session = { items, index: 0, render, ownerId, chatId, key: sent.key };
    sessions.set(sent.key.id, session);
    session.timeout = setTimeout(() => sessions.delete(sent.key.id), timeoutMs);
    return sent;
}

async function handleReaction(sock, reaction) {
    const id = reaction.key?.id;
    const session = sessions.get(id);
    if (!session) return;

    const fromOwner = reaction.key?.participant === session.ownerId ||
                       reaction.key?.remoteJid === session.ownerId;
    if (!fromOwner) return;

    const emoji = reaction.reaction?.text;
    if (emoji === '▶️') session.index = (session.index + 1) % session.items.length;
    else if (emoji === '◀️') session.index = (session.index - 1 + session.items.length) % session.items.length;
    else return;

    await sock.sendMessage(session.chatId, {
        text: session.render(session.items[session.index], session.index, session.items.length),
        edit: session.key
    });

    clearTimeout(session.timeout);
    session.timeout = setTimeout(() => sessions.delete(id), 120000);
}

module.exports = { startSlider, handleReaction };

    return module.exports;
  })();
  if (_m) {
    if (Array.isArray(_m)) { _bundle.push(..._m.filter(p => p && p.command && typeof p.handler === 'function')); }
    else if (_m.command && typeof _m.handler === 'function') { _bundle.push(_m); }
    else { for (const k of Object.keys(_m)) { const v = _m[k]; if (Array.isArray(v)) _bundle.push(...v.filter(p => p && p.command && typeof p.handler === 'function')); } }
  }
} catch(e) { console.warn('[BUNDLE:cat-15-media] Error loading slider.js:', e.message); }

module.exports = _bundle;