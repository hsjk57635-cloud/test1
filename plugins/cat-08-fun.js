'use strict';
// AUTO-GENERATED BUNDLE: cat-08-fun
const _bundle = [];


/* ===== joke.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

const gtts = require('gtts');
const fs = require('fs');
const path = require('path');

const JOKES = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "एक आदमी डॉक्टर के पास गया और बोला – डॉक्टर साहब, मुझे हर रात सपना आता है कि मैं एक कप चाय हूँ। डॉक्टर बोले – अरे यार, तू तो छोड़, चाय की पत्तियाँ कैसी हैं?",
    "What do you call a fake noodle? An impasta!",
    "टीचर: 'तुम्हें पढ़ाई क्यों नहीं करनी?' स्टूडेंट: 'सर, मैं तो किताबें पढ़ता हूँ, पर वो मुझे नहीं पढ़तीं।'",
    "I told my wife she should embrace her mistakes. She gave me a hug."
];

module.exports = {
    command: 'joke',
    aliases: ['humour', 'chutkula'],
    category: 'fun',
    description: '😂 Listen to a random joke in TTS',
    usage: '.joke [language code]',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        let language = args.length && /^[a-z]{2}$/.test(args[args.length - 1]) ? args.pop() : 'en';
        const text = JOKES[Math.floor(Math.random() * JOKES.length)];

        const filePath = path.join(process.cwd(), 'tmp', `joke-${Date.now()}.mp3`);
        if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });

        try {
            await sock.sendMessage(chatId, { react: { text: '😂', key: message.key } });
            const tts = new gtts(text, language);
            await new Promise((resolve, reject) => tts.save(filePath, (err) => err ? reject(err) : resolve()));
            await sock.sendMessage(chatId, { audio: { url: filePath }, mimetype: 'audio/mpeg', ptt: true, ...channelInfo }, { quoted: message });
        } catch (err) {
            console.error('Joke error:', err);
            await sock.sendMessage(chatId, { text: `❌ Joke failed: ${err.message}`, ...channelInfo }, { quoted: message });
        } finally {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] joke.js:', e.message); }

/* ===== joke2.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'joke2',
  aliases: ['funny2', 'jokes2'],
  category: 'fun',
  description: 'Get a random general joke',
  usage: '.joke2',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const res = await axios.get('https://raw.githubusercontent.com/AbdulRehman19721986/Database/main/text/random_jokes.txt');

      if (!res.data) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to fetch joke.' }, { quoted: message });
      }

      const jokes = res.data.split('\n').filter(line => line.trim() !== '');
      
      if (jokes.length === 0) {
        return await sock.sendMessage(chatId, { text: '❌ No jokes available.' }, { quoted: message });
      }

      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

      await sock.sendMessage(chatId, { text: `😂 *Joke*\n\n${randomJoke}` }, { quoted: message });

    } catch (err) {
      console.error('Joke plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Error while fetching joke.' }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] joke2.js:', e.message); }

/* ===== fact.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const axios=require('axios');
module.exports={command:'fact',aliases:['randomfact','uselessfact'],category:'fun',description:'Get a random interesting fact',usage:'.fact',async handler(sock,message,args,context={}){
const chatId=context.chatId||message.key.remoteJid;
try{
const r=await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
await sock.sendMessage(chatId,{text:r.data.text},{quoted:message});
}catch(e){
console.error('Error fetching fact:',e);
await sock.sendMessage(chatId,{text:'Sorry, I could not fetch a fact right now.'},{quoted:message});
}}};


    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] fact.js:', e.message); }

/* ===== dare.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
  command: 'dare',
  aliases: ['truthordare', 'challenge'],
  category: 'games',
  description: 'Get a random dare',
  usage: '.dare',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const shizokeys = 'shizo';
      const res = await fetch(
        `https://shizoapi.onrender.com/api/texts/dare?apikey=${shizokeys}`
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const json = await res.json();
      const dareMessage = json.result;

      await sock.sendMessage(chatId, {
        text: dareMessage
      }, { quoted: message });

    } catch (error) {
      console.error('Error in dare command:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to get dare. Please try again later!'
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] dare.js:', e.message); }

/* ===== truth.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
  command: 'truth',
  aliases: ['truthdare'],
  category: 'games',
  description: 'Get a random truth from the Shizo API.',
  usage: '.truth',
  
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const shizokeys = 'shizo';
      const res = await fetch(`https://shizoapi.onrender.com/api/texts/truth?apikey=${shizokeys}`);
      if (!res.ok) {
        throw await res.text();
      }
      const json = await res.json();
      const truthMessage = json.result;
      
      await sock.sendMessage(chatId, { 
        text: truthMessage 
      }, { quoted: message });
    } catch (error) {
      console.error('Error in truth command:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ Failed to get truth. Please try again later!' 
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] truth.js:', e.message); }

/* ===== wyr.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const axios = require('axios');

module.exports = {
  command: 'wyr',
  aliases: ['wouldyourather'],
  category: 'quotes',
  description: 'Get a Would You Rather question',
  usage: '.wyr',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const res = await axios.get('https://discardapi.dpdns.org/api/quote/wyr?apikey=guru');

      if (!res.data || res.data.status !== true) {
        return await sock.sendMessage(chatId, { text: '❌ Failed to fetch question.' }, { quoted: message });
      }

      const opt1 = res.data.question?.option1 || 'Option 1 not found';
      const opt2 = res.data.question?.option2 || 'Option 2 not found';
      const creator = res.data.creator || 'Unknown';

      const replyText = `🤔 *Would You Rather*\n\n◍ ${opt1}\n◍ ${opt2}`;

      await sock.sendMessage(chatId, { text: replyText }, { quoted: message });

    } catch (err) {
      console.error('WYR plugin error:', err);
      await sock.sendMessage(chatId, { text: '❌ Error while fetching question.' }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] wyr.js:', e.message); }

/* ===== eightball.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    module.exports = {
  command: '8ball',
  aliases: ['eightball', 'magic8ball'],
  category: 'fun',
  description: 'Ask the magic 8-ball a question',
  usage: '.8ball Will I be rich?',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const question = args.join(' ');

      if (!question) {
        await sock.sendMessage(chatId, {
          text: '🎱 Please ask a question!'
        }, { quoted: message });
        return;
      }

      const eightBallResponses = [
        "Yes, definitely!",
        "No way!",
        "Ask again later.",
        "It is certain.",
        "Very doubtful.",
        "Without a doubt.",
        "My reply is no.",
        "Signs point to yes."
      ];

      const randomResponse =
        eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];

      await sock.sendMessage(chatId, {
        text: `🎱 *Question:* ${question}\n\n*Answer:* ${randomResponse}`
      }, { quoted: message });

    } catch (error) {
      console.error('Error in 8ball command:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Something went wrong with the magic 8-ball!'
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] eightball.js:', e.message); }

/* ===== simp.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
    command: 'simp',
    aliases: ['simpcard'],
    category: 'group',
    description: 'Generate a simp card for a user',
    usage: '.simp (reply to user or mention someone)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;

        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        let who = quotedMsg 
            ? quotedMsg.sender 
            : mentionedJid && mentionedJid[0] 
                ? mentionedJid[0] 
                : sender;

        try {
            let avatarUrl;
            try {
                avatarUrl = await sock.profilePictureUrl(who, 'image');
            } catch (error) {
                console.error('Error fetching profile picture:', error);
                avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'; // Default avatar
            }

            const apiUrl = `https://some-random-api.com/canvas/misc/simpcard?avatar=${encodeURIComponent(avatarUrl)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }

            const imageBuffer = await response.buffer();

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: '*your religion is simping*',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363408055942569@newsletter',
                        newsletterName: 'JUNAID-MD↣³⁰²',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });

        } catch (error) {
            console.error('Simp Command Error:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ Sorry, I couldn\'t generate the simp card. Please try again later!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363408055942569@newsletter',
                        newsletterName: 'JUNAID-MD↣³⁰²',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
    }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] simp.js:', e.message); }

/* ===== ship.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    module.exports = {
  command: 'ship',
  aliases: ['couple'],
  category: 'group',
  description: 'Randomly ship two members in the group',
  usage: '.ship',
  groupOnly: true,
  
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    
    try {
      const participants = await sock.groupMetadata(chatId);
      const ps = participants.participants.map(v => v.id);
      
      let firstUser, secondUser;

      firstUser = ps[Math.floor(Math.random() * ps.length)];
      do {
        secondUser = ps[Math.floor(Math.random() * ps.length)];
      } while (secondUser === firstUser);

      const formatMention = id => '@' + id.split('@')[0];

      await sock.sendMessage(chatId, {
        text: `${formatMention(firstUser)} ❤️ ${formatMention(secondUser)}\nCongratulations 💖🍻`,
        mentions: [firstUser, secondUser],
        ...channelInfo
      });

    } catch (error) {
      console.error('Error in ship command:', error);
      await sock.sendMessage(chatId, { 
        text: '❌ Failed to ship! Make sure this is a group.',
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] ship.js:', e.message); }

/* ===== pair.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    // plugins/pair.js — uses bot's OWN /api/pair endpoint (global.doPairNumber)

// Simple in‑memory rate limiting map (outside handler to persist)
const rateLimit = new Map();

module.exports = {
  command: 'pair',
  aliases: ['getcode', 'paircode'],
  category: 'general',
  description: 'Get WhatsApp pairing code directly from this bot',
  usage: '.pair <phone_number>  e.g.  .pair ',
  ownerOnly: false,

  async handler(sock, message, args, context) {
    const { chatId } = context;
    const number = (args[0] || '').trim().replace(/\D/g, '');

    if (!number) {
      return sock.sendMessage(chatId, {
        text: '❌ Please provide your phone number with country code.\n' +
              'Example: *.pair *'
      }, { quoted: message });
    }

    if (number.length < 7 || number.length > 15) {
      return sock.sendMessage(chatId, {
        text: '❌ Invalid number length. Include country code, digits only.\n' +
              'Example: *.pair *'
      }, { quoted: message });
    }

    // Rate limit: 90 seconds per number
    const now = Date.now();
    const lastUsed = rateLimit.get(number);
    if (lastUsed && now - lastUsed < 90_000) {
      const wait = Math.ceil((90_000 - (now - lastUsed)) / 1000);
      return sock.sendMessage(chatId, {
        text: `⏳ Please wait *${wait}s* before requesting another code for this number.`
      }, { quoted: message });
    }
    rateLimit.set(number, now);
    setTimeout(() => rateLimit.delete(number), 90_000);

    await sock.sendMessage(chatId, {
      text: `⏳ Getting pairing code for *+${number}*...\nPlease open WhatsApp → Linked Devices → Link with Phone Number and enter the code.`
    }, { quoted: message });

    try {
      // ✅ Use the bot's own pairing function (no external API dependency)
      if (typeof global.doPairNumber !== 'function') {
        throw new Error('Pairing service not ready. Please try again in a few seconds.');
      }

      // ✅ FIX: forward the optional "force" flag (`.pair <num> force`) —
      // previously it was ignored, so re-pairing an existing session failed.
      const isForce = (args[1] || '').toLowerCase() === 'force';
      const result = await global.doPairNumber(number, isForce);

      if (result.alreadyConnected) {
        await sock.sendMessage(chatId, {
          text: `ℹ️ *+${number}* is already connected to this bot.\nUse *.pair ${number} force* to force re-pair.`
        }, { quoted: message });
        return;
      }

      const code = result.pairingCode;
      if (!code) throw new Error('Empty pairing code received. Please try again.');

      // Message 1: instructions + code
      await sock.sendMessage(chatId, {
        text: `╭─── 🔗 *PAIRING CODE* ───╮\n│\n│  📱 *Number:* +${number}\n│  🔑 *Code:* ${code}\n│\n├─ *Steps:*\n│  1. Open WhatsApp Settings\n│  2. Linked Devices → Link Device\n│  3. Tap "Link with phone number"\n│  4. Enter the code above\n│\n╰─────────────────────────╯\n\n> 🔥 JUNAID-MD↣³⁰² — Pair your number now!`
      }, { quoted: message });

      // Message 2: just the code (easy to copy)
      await sock.sendMessage(chatId, { text: code }, { quoted: message });

    } catch (error) {
      console.error('[.pair] error:', error.message);
      let msg = '❌ *Failed to get pairing code.*\n';
      if (error.message.includes('wait')) {
        msg += error.message;
      } else if (error.message.includes('closed') || error.message.includes('WebSocket')) {
        msg += 'Connection issue. Please try again in 30 seconds.';
      } else if (error.message.includes('Empty')) {
        msg += 'Received empty code. Try again in a moment.';
      } else {
        msg += error.message;
      }
      await sock.sendMessage(chatId, { text: msg }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] pair.js:', e.message); }

/* ===== compliment.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const compliments = [
    "You're amazing just the way you are!",
    "You have a great sense of humor!",
    "You're incredibly thoughtful and kind.",
    "You are more powerful than you know.",
    "You light up the room!",
    "You're a true friend.",
    "You inspire me!",
    "Your creativity knows no bounds!",
    "You have a heart of gold.",
    "You make a difference in the world.",
    "Your positivity is contagious!",
    "You have an incredible work ethic.",
    "You bring out the best in people.",
    "Your smile brightens everyone's day.",
    "You're so talented in everything you do.",
    "Your kindness makes the world a better place.",
    "You have a unique and wonderful perspective.",
    "Your enthusiasm is truly inspiring!",
    "You are capable of achieving great things.",
    "You always know how to make someone feel special.",
    "Your confidence is admirable.",
    "You have a beautiful soul.",
    "Your generosity knows no limits.",
    "You have a great eye for detail.",
    "Your passion is truly motivating!",
    "You are an amazing listener.",
    "You're stronger than you think!",
    "Your laughter is infectious.",
    "You have a natural gift for making others feel valued.",
    "You make the world a better place just by being in it."
];

module.exports = {
  command: 'compliment',
  aliases: ['praise', 'nice'],
  category: 'group',
  description: 'Send a random compliment to a user',
  usage: '.compliment @user',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      if (!message || !chatId) {
        console.log('Invalid message or chatId:', { message, chatId });
        return;
      }

      let userToCompliment;
      if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToCompliment =
          message.message.extendedTextMessage.contextInfo.mentionedJid[0];
      }
      else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToCompliment =
          message.message.extendedTextMessage.contextInfo.participant;
      }

      if (!userToCompliment) {
        await sock.sendMessage(chatId, {
          text: 'Please mention someone or reply to their message to compliment them!'
        }, { quoted: message });
        return;
      }

      const compliment =
        compliments[Math.floor(Math.random() * compliments.length)];

      await new Promise(resolve => setTimeout(resolve, 1000));

      await sock.sendMessage(chatId, {
        text: `Hey @${userToCompliment.split('@')[0]}, ${compliment}`,
        mentions: [userToCompliment]
      }, { quoted: message });

    } catch (error) {
      console.error('Error in compliment command:', error);

      if (error?.data === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          await sock.sendMessage(chatId, {
            text: 'Please try again in a few seconds.'
          }, { quoted: message });
        } catch (retryError) {
          console.error('Error sending retry message:', retryError);
        }
      } else {
        try {
          await sock.sendMessage(chatId, {
            text: 'An error occurred while sending the compliment.'
          }, { quoted: message });
        } catch (sendError) {
          console.error('Error sending error message:', sendError);
        }
      }
    }
  }
};


    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] compliment.js:', e.message); }

/* ===== insult.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const insults = [
    "You're like a cloud. When you disappear, it's a beautiful day!",
    "You bring everyone so much joy when you leave the room!",
    "I'd agree with you, but then we'd both be wrong.",
    "You're not stupid; you just have bad luck thinking.",
    "Your secrets are always safe with me. I never even listen to them.",
    "You're proof that even evolution takes a break sometimes.",
    "You have something on your chin... no, the third one down.",
    "You're like a software update. Whenever I see you, I think, 'Do I really need this right now?'",
    "You bring everyone happiness... you know, when you leave.",
    "You're like a penny—two-faced and not worth much.",
    "You have something on your mind... oh wait, never mind.",
    "You're the reason they put directions on shampoo bottles.",
    "You're like a cloud. Always floating around with no real purpose.",
    "Your jokes are like expired milk—sour and hard to digest.",
    "You're like a candle in the wind... useless when things get tough.",
    "You have something unique—your ability to annoy everyone equally.",
    "You're like a Wi-Fi signal—always weak when needed most.",
    "You're proof that not everyone needs a filter to be unappealing.",
    "Your energy is like a black hole—it just sucks the life out of the room.",
    "You have the perfect face for radio.",
    "You're like a traffic jam—nobody wants you, but here you are.",
    "You're like a broken pencil—pointless.",
    "Your ideas are so original, I'm sure I've heard them all before.",
    "You're living proof that even mistakes can be productive.",
    "You're not lazy; you're just highly motivated to do nothing.",
    "Your brain's running Windows 95—slow and outdated.",
    "You're like a speed bump—nobody likes you, but everyone has to deal with you.",
    "You're like a cloud of mosquitoes—just irritating.",
    "You bring people together... to talk about how annoying you are."
];

module.exports = {
  command: 'insult',
  aliases: ['roast', 'mock'],
  category: 'group',
  description: 'Send a playful insult to someone by mentioning them or replying to their message',
  usage: '.insult @username or reply to their message with .insult',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      let userToInsult;

      if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToInsult = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToInsult = message.message.extendedTextMessage.contextInfo.participant;
      }
      if (!userToInsult) {
        await sock.sendMessage(chatId, { 
          text: '❌ Please mention someone or reply to their message to insult them!',
          quoted: message
        });
        return;
      }
      const insult = insults[Math.floor(Math.random() * insults.length)];
      await new Promise(resolve => setTimeout(resolve, 1000));

      await sock.sendMessage(chatId, { 
        text: `Hey @${userToInsult.split('@')[0]}, ${insult}`,
        mentions: [userToInsult],
        quoted: message
      });
    } catch (error) {
      console.error('Error in insult command:', error);

      if (error.data === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          await sock.sendMessage(chatId, { 
            text: '⚠️ Too many requests. Please try again in a few seconds.',
            quoted: message
          });
        } catch (retryError) {
          console.error('Error sending retry message:', retryError);
        }
      } else {
        try {
          await sock.sendMessage(chatId, { 
            text: '❌ An error occurred while sending the insult.',
            quoted: message
          });
        } catch (sendError) {
          console.error('Error sending error message:', sendError);
        }
      }
    }
  }
};


    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] insult.js:', e.message); }

/* ===== flirt.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const fetch = require('node-fetch');
module.exports = {
  command: 'flirt',
  aliases: ['flirty', 'pickuplines'],
  category: 'fun',
  description: 'Get a random flirt message',
  usage: '.flirt',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const shizokeys = 'shizo';
      const res = await fetch(`https://shizoapi.onrender.com/api/texts/flirt?apikey=${shizokeys}`);
      if (!res.ok) throw await res.text();
      const r = await res.json();
      await sock.sendMessage(chatId, { text: r.result }, { quoted: message });
    } catch (e) {
      console.error('Error in flirt command:', e);
      await sock.sendMessage(chatId, { text: '❌ Failed to get flirt message. Please try again later!' }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] flirt.js:', e.message); }

/* ===== hug.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    module.exports = {
  command: 'hug',
  aliases: ['embrace'],
  category: 'fun',
  description: 'Give a warm hug',
  usage: '.hug @user',

  async handler(sock, message, args) {
    const chatId = message.key.remoteJid;
    const from = message.pushName || 'Someone';
    let target = 'themself';
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      target = '@' + message.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
    } else if (args[0]) {
      target = args[0];
    }

    const hugGifs = [
      'https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif',
      'https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif',
      'https://media.giphy.com/media/11f7zMNWcD6w08/giphy.gif',
      'https://media.giphy.com/media/3o7TKqhAQxX5bXr0zW/giphy.gif',
    ];
    const randomGif = hugGifs[Math.floor(Math.random() * hugGifs.length)];

    await sock.sendMessage(chatId, {
      video: { url: randomGif },
      caption: `🤗 *${from}* gave a big hug to *${target}*`,
      gifPlayback: true
    }, { quoted: message });
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] hug.js:', e.message); }

/* ===== kiss.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    module.exports = {
  command: 'kiss',
  aliases: ['smooch'],
  category: 'fun',
  description: 'Send a kiss to someone',
  usage: '.kiss @user',

  async handler(sock, message, args) {
    const chatId = message.key.remoteJid;
    const from = message.pushName || 'Someone';
    let target = 'themself';
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      target = '@' + message.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
    } else if (args[0]) {
      target = args[0];
    }

    const kissGifs = [
      'https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif',
      'https://media.giphy.com/media/bm2O3nXTcKJeU/giphy.gif',
      'https://media.giphy.com/media/11f7zMNWcD6w08/giphy.gif',
      'https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif',
    ];
    const randomGif = kissGifs[Math.floor(Math.random() * kissGifs.length)];

    await sock.sendMessage(chatId, {
      video: { url: randomGif },
      caption: `😘 *${from}* gave a kiss to *${target}*`,
      gifPlayback: true
    }, { quoted: message });
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] kiss.js:', e.message); }

/* ===== slap.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    module.exports = {
  command: 'slap',
  aliases: ['hit'],
  category: 'fun',
  description: 'Slap someone playfully',
  usage: '.slap @user',

  async handler(sock, message, args) {
    const chatId = message.key.remoteJid;
    const from = message.pushName || 'Someone';
    let target = 'themself';
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      target = '@' + message.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
    } else if (args[0]) {
      target = args[0];
    }

    const slapGifs = [
      'https://media.giphy.com/media/Zd3N1G6iXU4Oc/giphy.gif',
      'https://media.giphy.com/media/lXzCzS5Wf5W7G/giphy.gif',
      'https://media.giphy.com/media/j3iGKfXRKlLqw/giphy.gif',
      'https://media.giphy.com/media/10PzYxAwC6nHKo/giphy.gif',
    ];
    const randomGif = slapGifs[Math.floor(Math.random() * slapGifs.length)];

    await sock.sendMessage(chatId, {
      video: { url: randomGif },
      caption: `👋 *${from}* slapped *${target}*! Ouch!`,
      gifPlayback: true
    }, { quoted: message });
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] slap.js:', e.message); }

/* ===== bruh.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    // plugins/bruh.js
const { playSound } = require('./sound2');

module.exports = {
  command: 'bruh',
  category: 'fun',
  description: '😐 Play the classic Bruh sound',
  usage: '.bruh',

  async handler(sock, message, args, context) {
    await playSound(sock, context.chatId, message, 'bruh', context);
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] bruh.js:', e.message); }

/* ===== howgay.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    // plugins/howgay.js
module.exports = {
  command: 'howgay',
  aliases: ['gayrate'],
  category: 'fun',
  description: 'Check how gay you are',
  usage: '.howgay [@user]',
  
  async handler(sock, message, args, context) {
    const { chatId, isGroup } = context;
    let target = 'you';
    let mentions = [];

    if (isGroup && message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      target = '@' + message.message.extendedTextMessage.contextInfo.mentionedJid[0].split('@')[0];
      mentions = [message.message.extendedTextMessage.contextInfo.mentionedJid[0]];
    } else if (args.length) {
      target = args.join(' ');
    }

    const percent = Math.floor(Math.random() * 101);
    const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));

    await sock.sendMessage(chatId, {
      text: `🏳️‍🌈 **Gay Meter**\n${target} is **${percent}%** gay!\n[${bar}]`,
      mentions
    }, { quoted: message });
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] howgay.js:', e.message); }

/* ===== rate.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    // plugins/rate.js
module.exports = {
  command: 'rate',
  aliases: [],
  category: 'fun',
  description: 'Rate something out of 100%',
  usage: '.rate <thing>',
  
  async handler(sock, message, args, context) {
    const { chatId } = context;
    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: '❌ What should I rate?'
      }, { quoted: message });
    }

    const rating = Math.floor(Math.random() * 101);
    const thing = args.join(' ');
    await sock.sendMessage(chatId, {
      text: `I rate **${thing}** a **${rating}%**!`
    }, { quoted: message });
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] rate.js:', e.message); }

/* ===== roseday.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
  command: 'roseday',
  aliases: ['rose', 'rosequote'],
  category: 'quotes',
  description: 'Get a random Rose Day message/quote',
  usage: '.roseday',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const res = await fetch(`https://api.princetechn.com/api/fun/roseday?apikey=prince`);
      if (!res.ok) {
        throw await res.text();
      }
      const json = await res.json();
      const rosedayMessage = json.result;
      await sock.sendMessage(chatId, { text: rosedayMessage }, { quoted: message });
    } catch (error) {
      console.error('RoseDay Command Error:', error);
      await sock.sendMessage(chatId, { text: '❌ Failed to get Rose Day quote. Please try again later!' }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] roseday.js:', e.message); }

/* ===== teddy.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    let teddyUsers = {};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    command: 'teddy',
    aliases: [],
    category: 'fun',
    description: 'Send an animated teddy with cute emojis',
    usage: '.teddy',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;

        if (teddyUsers[sender]) return;
        teddyUsers[sender] = true;

        const teddyEmojis = [
            '❤','💕','😻','🧡','💛','💚','💙','💜','🖤','❣',
            '💞','💓','💗','💖','💘','💝','💟','♥','💌','🙂',
            '🤗','😌','😉','🤗','😊','🎊','🎉','🎁','🎈'
        ];

        try {
            const pingMsg = await sock.sendMessage(chatId, { text: `(\\_/)\n( •.•)\n/>🤍` }, { quoted: message });

            for (let i = 0; i < teddyEmojis.length; i++) {
                await sleep(500);

                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: pingMsg.key,
                            type: 14,
                            editedMessage: {
                                conversation: `(\\_/)\n( •.•)\n/>${teddyEmojis[i]}`
                            }
                        }
                    },
                    {}
                );
            }
        } catch (err) {
            console.error('Error in teddy command:', err);
            try {
                await sock.sendMessage(chatId, { text: '❌ Something went wrong while sending teddy emojis.' }, { quoted: message });
            } catch {}
        } finally {
            delete teddyUsers[sender];
        }
    }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] teddy.js:', e.message); }

/* ===== shayari.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

const gtts = require('gtts');
const fs = require('fs');
const path = require('path');

// 50+ Shayari in Hindi, Urdu, and English
const SHAYARI = [
    // Hindi (1-20)
    "मोहब्बत में हमने तुम्हें दिल दिया, तुमने क्या दिया? एक धोखा दिया, एक सज़ा दिया।",
    "हर किसी को मुकम्मल जहाँ नहीं मिलता, किसी को ख़ुशी तो किसी को जहर का प्याला मिलता है।",
    "उनकी आँखों में बसा कर देखा, तो पता चला कि वो किसी और के लिए धड़कती हैं।",
    "दिल टूटा तो एहसास हुआ, कि हर मोहब्बत का अंजाम अलग होता है।",
    "हम उनसे मिलने को तरस गए, और वो हमसे मिलकर भी खो गए।",
    "तेरी यादों ने ऐसा जादू किया, हर घड़ी तेरा ही ख्याल आया।",
    "बहुत खूबसूरत थी वो शाम, जब तुम मिले थे हमसे, अब तो हर शाम तुम्हारी याद लाती है।",
    "कभी हँसते हैं तो कभी रोते हैं, तेरे बिना हम क्या करते हैं?",
    "दिल की बात जुबां पर नहीं लाते, तुम्हें देखकर मुस्कुरा देते हैं।",
    "तेरी आँखों में खो जाने का दिल करता है, तेरे बिना जीने का मन नहीं करता।",
    "इश्क़ में हम तुम्हें क्या बताएँ, दिल का हाल जुबां पर नहीं आता।",
    "तेरे बिना हर लम्हा अधूरा है, तू ही मेरी ज़िन्दगी का सहारा है।",
    "दिल की धड़कन तुम हो, साँसों में बसी खुशबू तुम हो।",
    "तेरे इश्क़ में हम दीवाने हो गए, तेरे लिए हम पागल हो गए।",
    "हम तो तुम्हारे हो गए, अब और किसी के नहीं।",
    "तेरे बिना जीना सीखा है, तू न हो तो क्या होगा?",
    "तेरी यादों का सहारा लिए बैठे हैं, तू आए तो जिएं वरना मर जाएँ।",
    "तेरे इश्क़ ने हमें क्या बना दिया, दुनिया से बेगाना कर दिया।",
    "हम तुम्हें भूल जाएँ ऐसा हो न सके, तुम्हारे बिना हम कहाँ टिक सके?",
    "तेरी बातों में वो मिठास है, जैसे गुलाब में खुशबू का एहसास।",

    // Urdu (21-35)
    "उनकी यादों ने हमें तरसाया, रात भर जागकर हमने गुज़ारा।",
    "दिल में बसा लिया तुमको, अब निकालना मुश्किल है।",
    "तेरे प्यार में हमने दुनिया भुला दी, तू ही मेरी ज़िन्दगी बन गया।",
    "हम तो तेरे दीवाने हैं, तू समझे न समझे, हम तो तेरे दीवाने हैं।",
    "तेरी एक मुस्कान पे हम वारे जाएँ, तेरे लिए हम जान भी दे दें।",
    "दिल की बात छुपाई नहीं जाती, तुझसे मिलने की तमन्ना सताती है।",
    "तेरे इश्क़ ने हमें पागल कर दिया, हर घड़ी तेरा ही ख़याल रहता है।",
    "तेरी आँखों में डूबने का दिल करता है, तेरे बिना अब जीने का मन नहीं करता।",
    "तेरे बिना हर लम्हा सून है, तू ही मेरी दुनिया का रौशन चाँद है।",
    "तेरी हँसी मेरी दवा है, तेरा दर्द मेरा इलाज़ है।",
    "तेरे ख़त में लिखा था कि तुम आओगे, हमने राहें तक लीं, तुम न आए।",
    "बिछड़कर भी तेरे पास रहते हैं, ये दिल क्या जाने कैसे कहते हैं।",
    "तेरी याद ने जगाया रात भर, हम सोचते रहे तू क्यों नहीं मिला।",
    "तेरा दर्द बहुत है सीने में, फिर भी हम मुस्कुरा रहे हैं।",
    "तेरी बेरुखी ने मार डाला, हम तो तेरे लिए ही थे।",

    // English (36-50)
    "You are the sunshine of my life, without you everything is grey.",
    "In your eyes I found my home, in your arms I'll never roam.",
    "Every moment with you is a treasure, your love is my only pleasure.",
    "You are the poetry my heart writes, the melody that fills my nights.",
    "When you smile, the world smiles with me, your love sets my spirit free.",
    "I never knew love until you came, now I'll never be the same.",
    "You are the dream I never want to wake, the love my soul will always take.",
    "Your voice is music to my ears, your touch erases all my fears.",
    "With you, every day is spring, your love makes my heart sing.",
    "You are the star that guides my way, with you, I want to stay.",
    "My heart beats only for you, everything I am, I give to you.",
    "You are the reason I believe in love, a gift sent from above.",
    "In your eyes I see forever, in your heart we'll be together.",
    "Your love is like a gentle rain, washing away all my pain.",
    "You are the one I've waited for, my heart's open door."
];

module.exports = {
    command: 'shayari',
    aliases: ['sher', 'poetry', 'kavita'],
    category: 'fun',
    description: '🎤 Hear a beautiful shayari/poem in TTS (reply with number to select)',
    usage: '.shayari [number]',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo, senderId } = context;
        const input = args[0]?.toLowerCase();

        // If no args or not a number, show list
        if (!args.length || isNaN(parseInt(input))) {
            // Show numbered list (first 20)
            const list = SHAYARI.map((s, i) => `${i+1}. ${s.substring(0, 30)}...`).slice(0, 20).join('\n');
            const caption = `🎤 *SHAYARI LIST (1-${SHAYARI.length})*\n\n${list}\n\n_Reply with a number to hear that shayari._`;
            
            if (!global.shayariSessions) global.shayariSessions = {};
            global.shayariSessions[chatId] = {
                userId: senderId,
                list: SHAYARI,
                timestamp: Date.now()
            };

            return await sock.sendMessage(chatId, {
                text: caption,
                ...channelInfo
            }, { quoted: message });
        }

        // Handle number selection
        const num = parseInt(input);
        if (isNaN(num) || num < 1 || num > SHAYARI.length) {
            return await sock.sendMessage(chatId, {
                text: `❌ Invalid number. Please enter a number between 1 and ${SHAYARI.length}.`,
                ...channelInfo
            }, { quoted: message });
        }

        const text = SHAYARI[num - 1];
        // Detect language: if text contains Devanagari, use hi; if contains Arabic script, use ur; else en
        let language = 'hi';
        if (/[a-zA-Z]/.test(text) && !/[ऀ-ॿ]/.test(text)) {
            language = 'en';
        } else if (/[\u0600-\u06FF]/.test(text)) {
            language = 'ur';
        }

        const filePath = path.join(process.cwd(), 'tmp', `shayari-${Date.now()}.mp3`);
        if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });

        try {
            await sock.sendMessage(chatId, { react: { text: '🎤', key: message.key } });
            const tts = new gtts(text, language);
            await new Promise((resolve, reject) => tts.save(filePath, (err) => err ? reject(err) : resolve()));
            await sock.sendMessage(chatId, {
                audio: { url: filePath },
                mimetype: 'audio/mpeg',
                ptt: true,
                ...channelInfo
            }, { quoted: message });
        } catch (err) {
            console.error('Shayari error:', err);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to generate audio: ${err.message}`,
                ...channelInfo
            }, { quoted: message });
        } finally {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] shayari.js:', e.message); }

/* ===== hot.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
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
 *    Description: Displays a dynamic edit message with emojis for fun.     *
 *****************************************************************************/

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    command: 'hot',
    aliases: ['spicy', '🔥'],
    category: 'fun',
    description: 'Displays a dynamic edit message with emojis for fun.',
    usage: '.hot',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        try {
            // Send initial message
            const initialMsg = await sock.sendMessage(chatId, {
                text: '💋',
                ...channelInfo
            });

            const emojiMessages = [
                "🥵", "❤️", "💋", "😫", "🤤",
                "😋", "🥵", "🥶", "🙊", "😻",
                "🙈", "💋", "🫂", "🫀", "👅",
                "👄", "💋"
            ];

            for (const line of emojiMessages) {
                await delay(1000);
                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: initialMsg.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }
        } catch (error) {
            console.error('Hot command error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] hot.js:', e.message); }

/* ===== leg.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  command: 'leg',
  aliases: ['thigh', 'legwork'],
  category: 'fun',
  description: '🦵 Leg and thigh action sequence',
  usage: '.leg',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;

    try {
      const initialMsg = await sock.sendMessage(chatId, {
        text: '🦵',
        ...channelInfo
      }, { quoted: message });

      const sequence = [
        "🦵", "🍑🦵", "💦🦵", "🔥🦵", "🦵🍆",
        "🦵💦", "🍑💦🦵", "🥵🦵", "😫🦵", "💢🦵",
        "🦵🍑💦", "🦵🔥", "😵🦵", "💦💦🦵", "🦵🍆💦"
      ];

      for (const line of sequence) {
        await delay(600);
        await sock.relayMessage(
          chatId,
          {
            protocolMessage: {
              key: initialMsg.key,
              type: 14,
              editedMessage: { conversation: line }
            }
          },
          {}
        );
      }
    } catch (error) {
      console.error('Leg command error:', error);
      await sock.sendMessage(chatId, {
        text: `❌ Error: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] leg.js:', e.message); }

/* ===== mouth.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  command: 'mouth',
  aliases: ['oral', 'blowjob', 'bj'],
  category: 'fun',
  description: '👄 Mouth action with wet emojis',
  usage: '.mouth',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;

    try {
      const initialMsg = await sock.sendMessage(chatId, {
        text: '👄',
        ...channelInfo
      }, { quoted: message });

      const sequence = [
        "👄", "👅", "🍆👄", "💦👅", "😮",
        "👄💦", "🍆💦👄", "😝", "🥵👄", "💦💦👅",
        "🍆👅💦", "😫👄", "🔥👄", "💢👅", "👄🍑"
      ];

      for (const line of sequence) {
        await delay(600);
        await sock.relayMessage(
          chatId,
          {
            protocolMessage: {
              key: initialMsg.key,
              type: 14,
              editedMessage: { conversation: line }
            }
          },
          {}
        );
      }
    } catch (error) {
      console.error('Mouth command error:', error);
      await sock.sendMessage(chatId, {
        text: `❌ Error: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] mouth.js:', e.message); }

/* ===== finger.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    command: 'finger',
    aliases: ['fing', 'digits'],
    category: 'fun',
    description: '🖕 Dirty finger animation',
    usage: '.finger',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        try {
            const initialMsg = await sock.sendMessage(chatId, {
                text: '👉',
                ...channelInfo
            });

            const sequence = [
                "👉",
                "👉👇",
                "👉👌",
                "👈👌",
                "🍆👉🍑",
                "💦👉",
                "👉💦🍑",
                "👉🍑💦",
                "😩👉💦",
                "🥵👉🍆💦",
                "👉 Fuck yeah!",
                "👉🍑💦💦",
                "👉💢 Fingered!",
                "🔥👉🍑💦"
            ];

            for (const line of sequence) {
                await delay(800);
                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: initialMsg.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }
        } catch (error) {
            console.error('Finger command error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] finger.js:', e.message); }

/* ===== son.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    // plugins/son.js
module.exports = {
  command: 'son',
  aliases: ['beta'],
  category: 'fun',
  description: 'Pick a random group member as your son',
  usage: '.son',
  
  async handler(sock, message, args, context) {
    const { chatId, isGroup } = context;
    
    if (!isGroup) {
      return await sock.sendMessage(chatId, {
        text: '❌ This command can only be used in groups!'
      }, { quoted: message });
    }
    
    try {
      // Get group metadata to fetch participants
      const groupMetadata = await sock.groupMetadata(chatId);
      const participants = groupMetadata.participants;
      
      // Filter out the bot itself (optional)
      const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const eligible = participants.filter(p => p.id !== botNumber);
      
      if (eligible.length === 0) {
        return await sock.sendMessage(chatId, {
          text: '❌ No eligible members found.'
        }, { quoted: message });
      }
      
      // Pick random member
      const randomMember = eligible[Math.floor(Math.random() * eligible.length)];
      const mention = randomMember.id;
      
      // Get member name (optional)
      let name = randomMember.notify || randomMember.id.split('@')[0];
      
      // Send with mention and animation
      await sock.sendMessage(chatId, {
        text: `👨‍👦 *Congratulations!*\n\nYour son is: @${mention.split('@')[0]}\n\n🎉 Take good care of him!`,
        mentions: [mention]
      }, { quoted: message });
      
    } catch (error) {
      console.error('Son command error:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to pick a son. Try again later.'
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] son.js:', e.message); }

/* ===== wife.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    // plugins/wife.js
module.exports = {
  command: 'wife',
  aliases: ['biwi'],
  category: 'fun',
  description: 'Pick a random group member as your wife',
  usage: '.wife',
  
  async handler(sock, message, args, context) {
    const { chatId, isGroup } = context;
    
    if (!isGroup) {
      return await sock.sendMessage(chatId, {
        text: '❌ This command can only be used in groups!'
      }, { quoted: message });
    }
    
    try {
      const groupMetadata = await sock.groupMetadata(chatId);
      const participants = groupMetadata.participants;
      const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const eligible = participants.filter(p => p.id !== botNumber);
      
      if (eligible.length === 0) {
        return await sock.sendMessage(chatId, {
          text: '❌ No eligible members found.'
        }, { quoted: message });
      }
      
      const randomMember = eligible[Math.floor(Math.random() * eligible.length)];
      const mention = randomMember.id;
      
      await sock.sendMessage(chatId, {
        text: `💖 *Congratulations!*\n\nYour wife is: @${mention.split('@')[0]}\n\n🤵 May your marriage be blessed!`,
        mentions: [mention]
      }, { quoted: message });
      
    } catch (error) {
      console.error('Wife command error:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to pick a wife. Try again later.'
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] wife.js:', e.message); }

/* ===== husband.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    // plugins/husband.js
module.exports = {
  command: 'husband',
  aliases: ['shohar'],
  category: 'fun',
  description: 'Pick a random group member as your husband',
  usage: '.husband',
  
  async handler(sock, message, args, context) {
    const { chatId, isGroup } = context;
    
    if (!isGroup) {
      return await sock.sendMessage(chatId, {
        text: '❌ This command can only be used in groups!'
      }, { quoted: message });
    }
    
    try {
      const groupMetadata = await sock.groupMetadata(chatId);
      const participants = groupMetadata.participants;
      const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const eligible = participants.filter(p => p.id !== botNumber);
      
      if (eligible.length === 0) {
        return await sock.sendMessage(chatId, {
          text: '❌ No eligible members found.'
        }, { quoted: message });
      }
      
      const randomMember = eligible[Math.floor(Math.random() * eligible.length)];
      const mention = randomMember.id;
      
      await sock.sendMessage(chatId, {
        text: `💍 *Congratulations!*\n\nYour husband is: @${mention.split('@')[0]}\n\n👰‍♀️ May you have a happy life together!`,
        mentions: [mention]
      }, { quoted: message });
      
    } catch (error) {
      console.error('Husband command error:', error);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to pick a husband. Try again later.'
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] husband.js:', e.message); }

/* ===== goodnight.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
  command: 'goodnight',
  aliases: ['gn', 'night'],
  category: 'quotes',
  description: 'Send a random good night message',
  usage: '.goodnight',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const shizokeys = 'shizo';
      const res = await fetch(
        `https://shizoapi.onrender.com/api/texts/lovenight?apikey=${shizokeys}`
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const json = await res.json();
      const goodnightMessage = json.result;

      await sock.sendMessage(chatId, { text: goodnightMessage }, { quoted: message });

    } catch (error) {
      console.error('Goodnight plugin error:', error);
      await sock.sendMessage(chatId, { text: '❌ Failed to get goodnight message. Please try again later!' }, { quoted: message });
    }}
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] goodnight.js:', e.message); }

/* ===== dado.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    module.exports = {
  command: 'dado',
  aliases: ['dados', 'dice'],
  category: 'games',
  description: 'Roll a random dice sticker',
  usage: '.dado',

  async handler(sock, message, args, context = {}) {
    const chatId = message.key.remoteJid;

    const diceLinks = [
      'https://tinyurl.com/gdd01',
      'https://tinyurl.com/gdd02',
      'https://tinyurl.com/gdd003',
      'https://tinyurl.com/gdd004',
      'https://tinyurl.com/gdd05',
      'https://tinyurl.com/gdd006'
    ];

    const randomDice = diceLinks[Math.floor(Math.random() * diceLinks.length)];

    try {
      await sock.sendMessage(chatId, { 
        sticker: { url: randomDice } 
      }, { quoted: message });

    } catch (e) {
      console.error('Dice Plugin Error:', e);
      await sock.sendMessage(chatId, { 
        image: { url: randomDice }, 
        caption: '🎲 The dice rolled!' 
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] dado.js:', e.message); }

/* ===== null.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    // KI

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] null.js:', e.message); }

/* ===== null2.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    // fu

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] null2.js:', e.message); }

/* ===== random.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    // plugins/random.js
const axios = require('axios');

async function sendMedia(sock, chatId, message, url, type = 'image', caption = '') {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
  const buffer = Buffer.from(res.data);
  if (type === 'video') {
    await sock.sendMessage(chatId, { video: buffer, mimetype: 'video/mp4', caption }, { quoted: message });
  } else {
    await sock.sendMessage(chatId, { image: buffer, caption }, { quoted: message });
  }
}

module.exports = [
  {
    command: 'asupan',
    category: 'random',
    description: 'Random asupan video/picture',
    usage: '.asupan',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      try {
        const { data } = await axios.get('https://api.deline.web.id/random/asupan', { timeout: 10000 });
        if (!data.status) throw new Error(data.error);
        // result may be a URL
        const url = data.result;
        if (!url) throw new Error('No media');
        const isVideo = url.includes('.mp4') || url.includes('/video/');
        await sendMedia(sock, chatId, message, url, isVideo ? 'video' : 'image', '✨ Random Asupan');
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed: ${err.message}` }, { quoted: message });
      }
    }
  },
  {
    command: 'ba',
    category: 'random',
    description: 'Random Blue Archive image',
    usage: '.ba',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      try {
        const { data } = await axios.get('https://api.deline.web.id/random/ba', { timeout: 10000 });
        if (!data.status) throw new Error(data.error);
        await sendMedia(sock, chatId, message, data.result, 'image', '🎮 Blue Archive');
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed: ${err.message}` }, { quoted: message });
      }
    }
  },
  {
    command: 'loli',
    category: 'random',
    description: 'Random loli image',
    usage: '.loli',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      try {
        const { data } = await axios.get('https://api.deline.web.id/random/loli', { timeout: 10000 });
        if (!data.status) throw new Error(data.error);
        await sendMedia(sock, chatId, message, data.result, 'image', '🌸 Loli');
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed: ${err.message}` }, { quoted: message });
      }
    }
  },
  {
    command: 'nsfw',
    category: 'nsfw',
    description: 'Random NSFW image (categories 0-69)',
    usage: '.nsfw [category]',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      let cat = args[0] || '0';
      try {
        const url = `https://api.deline.web.id/nsfw?cat=${encodeURIComponent(cat)}`;
        const { data } = await axios.get(url, { timeout: 10000 });
        if (!data.status) throw new Error(data.error);
        await sendMedia(sock, chatId, message, data.result, 'image', `🔞 NSFW (cat ${cat})`);
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed: ${err.message}` }, { quoted: message });
      }
    }
  },
  {
    command: 'ppcouple',
    category: 'random',
    description: 'Random couple profile pictures',
    usage: '.ppcouple',

    async handler(sock, message, args, context) {
      const { chatId } = context;
      try {
        const { data } = await axios.get('https://api.deline.web.id/random/ppcouple', { timeout: 10000 });
        if (!data.status) throw new Error(data.error);
        const { cowo, cewe } = data.result;
        await sendMedia(sock, chatId, message, cowo, 'image', '👫 Couple (Male)');
        await new Promise(r => setTimeout(r, 1000));
        await sendMedia(sock, chatId, message, cewe, 'image', '👫 Couple (Female)');
      } catch (err) {
        sock.sendMessage(chatId, { text: `❌ Failed: ${err.message}` }, { quoted: message });
      }
    }
  }
];

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] random.js:', e.message); }

/* ===== fakereact.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    /*****************************************************************************
 *  FAKE REACT — Unlimited Auto-Reaction System
 *  React to every message in a group with random/custom emojis
 *  Commands: .fakereact on/off, .fakereact set 🎉😂🔥, .fakereact react 😍
 *****************************************************************************/

'use strict';

// Store active reaction groups: groupJid -> { enabled: bool, emojis: array }
const activeGroups = new Map();

// Default reaction emojis (unlimited combinations)
const DEFAULT_EMOJIS = ['😂', '🔥', '👍', '❤️', '🎉', '😍', '🤣', '💀', '🥴', '👏', '🙌', '🍿', '⚡', '🤯', '💯', '✅', '⭐', '🎯', '🔁', '💪'];

module.exports = {
    command: 'fakereact',
    aliases: ['freaction'],
    category: 'fun',
    description: '🤖 Unlimited fake reactions – auto‑reacts to all messages in group',
    usage: `.fakereact on         – Enable auto‑reaction in this group
.fakereact off        – Disable auto‑reaction
.fakereact set 🎉🔥😂 – Set custom reaction emojis (space separated)
.fakereact list       – Show current emoji list
.fakereact react 😍   – React to the replied message with 😍
.fakereact help       – Show this menu`,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = (message.key.participant || message.key.remoteJid).split(':')[0];
        const isGroup = chatId.endsWith('@g.us');
        const channelInfo = context.channelInfo || {};

        const reply = (text) =>
            sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        // Only allow in groups
        if (!isGroup && args[0] !== 'react') {
            return reply('⚠️ This command only works in groups (or use `.fakereact react` to reply to a message).');
        }

        const sub = args[0]?.toLowerCase();

        // Get group settings
        let group = activeGroups.get(chatId);
        if (!group) {
            group = { enabled: false, emojis: [...DEFAULT_EMOJIS] };
            activeGroups.set(chatId, group);
        }

        // ─── HELP ───────────────────────────────────────────────
        if (!sub || sub === 'help') {
            return reply(`🤖 *FAKE REACTION SYSTEM – Unlimited!*

*Commands in this group:*
\`.fakereact on\`     – Start auto‑reacting to every message
\`.fakereact off\`    – Stop auto‑reacting
\`.fakereact set 😂🔥👍\` – Custom emojis (max 20)
\`.fakereact list\`   – Show active emojis
\`.fakereact react ❤️\` – React to the message you reply to

*Current status:* ${group.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}
*Emojis:* ${group.emojis.join(' ')}`);
        }

        // ─── ON / OFF ───────────────────────────────────────────
        if (sub === 'on') {
            group.enabled = true;
            activeGroups.set(chatId, group);
            return reply(`✅ *Auto‑reaction ENABLED* in this group.\nI will react to every new message with: ${group.emojis.join(' ')}`);
        }

        if (sub === 'off') {
            group.enabled = false;
            activeGroups.set(chatId, group);
            return reply(`❌ *Auto‑reaction DISABLED* in this group.`);
        }

        // ─── SET CUSTOM EMOJIS ───────────────────────────────────
        if (sub === 'set') {
            const newEmojis = args.slice(1).filter(e => e && e.length <= 2);
            if (newEmojis.length === 0) {
                return reply(`❌ Please provide at least one emoji.\nExample: \`.fakereact set 🎉🔥😂\``);
            }
            if (newEmojis.length > 20) {
                return reply(`⚠️ Max 20 emojis. Using first 20.`);
            }
            group.emojis = newEmojis.slice(0, 20);
            activeGroups.set(chatId, group);
            return reply(`✅ Custom reaction emojis set to: ${group.emojis.join(' ')}`);
        }

        // ─── LIST EMOJIS ────────────────────────────────────────
        if (sub === 'list') {
            return reply(`🎭 *Current reaction emojis* (${group.emojis.length}):\n${group.emojis.join(' ')}`);
        }

        // ─── REACT TO SPECIFIC MESSAGE ───────────────────────────
        if (sub === 'react') {
            const emoji = args[1];
            if (!emoji || emoji.length > 2) {
                return reply(`❌ Usage: \`.fakereact react 😍\` (reply to the target message)`);
            }
            // Check if user replied to a message
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                return reply(`❌ You must reply to a message to react with ${emoji}`);
            }
            const targetKey = {
                remoteJid: message.key.remoteJid,
                id: message.message.extendedTextMessage.contextInfo.stanzaId,
                participant: message.message.extendedTextMessage.contextInfo.participant
            };
            try {
                await sock.sendMessage(chatId, { react: { text: emoji, key: targetKey } });
                return reply(`✅ Reacted with ${emoji}`);
            } catch (err) {
                return reply(`❌ Failed to react: ${err.message}`);
            }
        }

        return reply(`❓ Unknown subcommand. Use \`.fakereact help\``);
    },

    // ─── AUTO‑REACTION ON EVERY INCOMING MESSAGE (plugin event) ───
    // This function will be called by the bot's message handler if the plugin supports it.
    // Alternatively, you must add this hook in your main bot logic.
    // I'll provide a simple way: export an onMessage hook.
    async onMessage(sock, message, context = {}) {
        const chatId = message.key.remoteJid;
        if (!chatId || !chatId.endsWith('@g.us')) return;

        const group = activeGroups.get(chatId);
        if (!group || !group.enabled) return;

        // Don't react to bot's own messages
        const senderId = message.key.participant || message.key.remoteJid;
        if (senderId === sock.user.id.split(':')[0] + '@s.whatsapp.net') return;

        // Pick a random emoji from the list
        const emojis = group.emojis;
        if (emojis.length === 0) return;
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        try {
            await sock.sendMessage(chatId, { react: { text: randomEmoji, key: message.key } });
        } catch (err) {
            console.error('[FAKEREACT] Auto-react error:', err.message);
        }
    }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] fakereact.js:', e.message); }

/* ===== flip.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
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
  command: 'flip',
  aliases: ['mirror', 'upside'],
  category: 'tools',
  description: 'Flip text upside down (supports Uppercase)',
  usage: '.flip <text> OR reply to a message',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    
    let txt = args?.join(' ') || "";
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted) {
      txt = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || txt;
    }
    txt = txt.replace(/^\.\w+\s*/, '').trim();

    if (!txt) return await sock.sendMessage(chatId, { text: '*What should I flip?*' });

    const charMap = {
      'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ',
      'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ',
      'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
      'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'p', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': 'פ', 'H': 'H', 'I': 'I', 'J': 'ſ',
      'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Ό', 'R': 'ᴚ', 'S': 'S', 'T': '⊥',
      'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
      '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0',
      '.': '˙', ',': '\'', '\'': ',', '"': '„', '!': '¡', '?': '¿', '(': ')', ')': '(', '[': ']', ']': '[',
      '{': '}', '}': '{', '<': '>', '>': '<', '_': '‾', '&': '⅋'
    };

    const flipped = txt.split('').map(char => charMap[char] || char).reverse().join('');
    
    await sock.sendMessage(chatId, { text: flipped }, { quoted: message });
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
        

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] flip.js:', e.message); }

/* ===== gaali.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    /*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *****************************************************************************/

const gtts = require('gtts');
const fs = require('fs');
const path = require('path');

// Expanded gaali list – 50+ lines in Hindi/Urdu/English
const GAALIS = [
    // Hindi/Urdu
    "Madarchod! Teri maa ka bhosda!",
    "Bhen ke lode!",
    "Tatti chod! Randi ke!",
    "Gaand mara! Chutiye!",
    "Bhan ka taka!",
    "Teri ma ko lun!",
    "Mia Khalifa ki aulad!",
    "Johny Sins ki aulaad!",
    "Ladle! Maderchod!",
    "Mewo! Madarjaat!",
    "Teri ammi ka joota!",
    "Haramzade!",
    "Kamine! Suar ki aulad!",
    "Teri behen ki choot!",
    "Tera baap chakka!",
    "Bhadwe!",
    "Teri naani ka tatta!",
    "Gandu!",
    "Randibaaz!",
    "Chakke ke pille!",
    "Kutte ki dum!",
    "Teri mummy ka lund!",
    "Teri didi ka bhosda!",
    "Teri family ka bharosa nahi!",
    "Maa chudane wale!",
    "Bhen ke takke!",
    "Lund le!",
    "Teri gaand mein danda!",
    "Chup chaap mar!",
    "Suar ki aulaad!",
    "Kutte ki nasal!",
    "Teri ammi ka number do!",
    "Tera baap nahi teri maa bhi nahi!",
    "Hijde!",
    "Launda!",
    "Teri aukaat kya hai?",
    "Jhat ke!",
    "Fattu!",
    "Namak haram!",
    "Beghairat!",
    // English
    "Fuck you!",
    "Motherfucker!",
    "Dickhead!",
    "Asshole!",
    "Prick!",
    "Wanker!",
    "Bastard!",
    "Cocksucker!",
    "Son of a bitch!",
    "Shithead!",
    "Twat!",
    "Bollocks!",
    "Arsehole!",
    "Piss off!",
    "Bugger off!",
    "Sod off!",
    "Bloody hell!",
    "You piece of shit!",
    "You fucking idiot!",
    "You absolute wanker!"
];

module.exports = {
    command: 'gaali',
    aliases: ['gali', 'abuse'],
    category: 'fun',
    description: '🤬 Hear a funny gaali in TTS (reply with number to select)',
    usage: '.gaali [number] or .gaali [language code]',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo, senderId } = context;
        const input = args[0]?.toLowerCase();

        // Language override if last arg is two-letter code
        let language = 'hi'; // default Hindi for gaali
        if (args.length && /^[a-z]{2}$/.test(args[args.length - 1])) {
            language = args.pop().toLowerCase();
        }

        // If no args or args is not a number, show list
        if (!args.length || isNaN(parseInt(input))) {
            // Show numbered list of first 20 gaalis (or all if less)
            const list = GAALIS.map((g, i) => `${i+1}. ${g}`).slice(0, 20).join('\n');
            const caption = `🤬 *GAALI LIST (1-${Math.min(20, GAALIS.length)})*\n\n${list}\n\n_Reply with a number to hear that gaali._`;
            
            // Store the list in a temporary session
            if (!global.gaaliSessions) global.gaaliSessions = {};
            global.gaaliSessions[chatId] = {
                userId: senderId,
                list: GAALIS,
                language: language,
                timestamp: Date.now()
            };

            return await sock.sendMessage(chatId, {
                text: caption,
                ...channelInfo
            }, { quoted: message });
        }

        // Handle number selection
        const num = parseInt(input);
        if (isNaN(num) || num < 1 || num > GAALIS.length) {
            return await sock.sendMessage(chatId, {
                text: `❌ Invalid number. Please enter a number between 1 and ${GAALIS.length}.`,
                ...channelInfo
            }, { quoted: message });
        }

        // Generate TTS for selected gaali
        const text = GAALIS[num - 1];
        const filePath = path.join(process.cwd(), 'tmp', `gaali-${Date.now()}.mp3`);
        if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });

        try {
            await sock.sendMessage(chatId, { react: { text: '🤬', key: message.key } });
            const tts = new gtts(text, language);
            await new Promise((resolve, reject) => tts.save(filePath, (err) => err ? reject(err) : resolve()));
            await sock.sendMessage(chatId, {
                audio: { url: filePath },
                mimetype: 'audio/mpeg',
                ptt: true,
                ...channelInfo
            }, { quoted: message });
        } catch (err) {
            console.error('Gaali error:', err);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to generate audio: ${err.message}`,
                ...channelInfo
            }, { quoted: message });
        } finally {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] gaali.js:', e.message); }

/* ===== fuck.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    command: 'fuck',
    aliases: ['sex', 'fck'],
    category: 'fun',
    description: '🔥 Explicit fun – dynamic emoji sequence',
    usage: '.fuck',

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};

        try {
            const initialMsg = await sock.sendMessage(chatId, {
                text: '💢',
                ...channelInfo
            });

            const sequence = [
                "💢", "🍑", "🍆", "💦", "😩",
                "🍑💦", "🍆💦", "💦💦", "😫", "🥵",
                "🍆🍑", "💦💦💦", "😵", "💢💢", "🔥"
            ];

            for (const line of sequence) {
                await delay(800);
                await sock.relayMessage(
                    chatId,
                    {
                        protocolMessage: {
                            key: initialMsg.key,
                            type: 14,
                            editedMessage: {
                                conversation: line,
                            },
                        },
                    },
                    {}
                );
            }
        } catch (error) {
            console.error('Fuck command error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] fuck.js:', e.message); }

/* ===== fuckall.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  command: 'fuckall',
  aliases: ['fa', 'sabko'],
  category: 'fun',
  description: '💥 Abuse everyone in the chat with style',
  usage: '.fuckall',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;

    try {
      const initialMsg = await sock.sendMessage(chatId, {
        text: '💥',
        ...channelInfo
      }, { quoted: message });

      const sequence = [
        "💥 FUCK ALL OF YOU 💥",
        "SAB KE SAB MADERCHOD 🖕",
        "BHAN KE CHOD 👊",
        "TERI MA KA BHOSDA 🔥",
        "GAND MARAO SAB NE 🍑",
        "*CHUTIYA SAPNA* 💢",
        "RANDI KE PILLE 🚬",
        "FUCK YOUR GENERATION 👪🖕",
        "*CH*T CH*T* 💦",
        "BHAN CHOD DUNGA SABKO 😈",
        "TERI MA KA LUND 🍆",
        "JOHNY SINS KA CHODA 🥵",
        "*GROUP CHOD DIYA* 🔊",
       
      ];

      for (const line of sequence) {
        await delay(700);
        await sock.relayMessage(
          chatId,
          {
            protocolMessage: {
              key: initialMsg.key,
              type: 14,
              editedMessage: { conversation: line }
            }
          },
          {}
        );
      }
    } catch (error) {
      console.error('Fuckall command error:', error);
      await sock.sendMessage(chatId, {
        text: `❌ Error: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] fuckall.js:', e.message); }

/* ===== fuckoff.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  command: 'fuckoff',
  aliases: ['fo', 'gtfo'],
  category: 'fun',
  description: '🖕 Tell someone to fuck off with style',
  usage: '.fuckoff',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;

    try {
      const initialMsg = await sock.sendMessage(chatId, {
        text: '🖕',
        ...channelInfo
      }, { quoted: message });

      const sequence = [
        "🖕", "🚫", "😤", "🖕🖕", "🤬",
        "FUCK OFF", "🖕 OFF", "🚫🚫", "💢🖕", "🔥🖕",
        "🖕 YOU", "BYE FELICIA", "👋🖕", "💥🖕", "🤡🖕"
      ];

      for (const line of sequence) {
        await delay(600);
        await sock.relayMessage(
          chatId,
          {
            protocolMessage: {
              key: initialMsg.key,
              type: 14,
              editedMessage: { conversation: line }
            }
          },
          {}
        );
      }
    } catch (error) {
      console.error('Fuckoff command error:', error);
      await sock.sendMessage(chatId, {
        text: `❌ Error: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] fuckoff.js:', e.message); }

/* ===== fuckyou.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  command: 'fuckyou',
  aliases: ['fu', 'fucku', 'fuckoff'],
  category: 'abuse',
  description: '🖕 Ultimate abuse sequence – Hindi + English',
  usage: '.fuckyou',

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;

    try {
      const initialMsg = await sock.sendMessage(chatId, {
        text: '🖕',
        ...channelInfo
      }, { quoted: message });

      const sequence = [
        "🖕 FUCK YOU 🖕",
        "💥 FUCK YOUR WHOLE FAMILY 💥",
        "🤬 MADER CHOD 🤬",
        "👊 BHAN CHOR 👊",
        "🔥 THERI BHAN KO CHODU 🔥",
        "💢 MA KA LORA 💢",
        "👿 BHAN KA TAKA 👿",
        "🍆 TERI MA KO LUN 🍆",
        "😡 MADERCHOR 😡",
        "🔊 MIA KHALIFA KI AULAD 🔊",
        "🎬 JONY SINS KI AULAD 🎬",
        "💥 BHAN KA TAKA 💥",
        "🐷 RANDI KE BACHE 🐷",
        "🐕 KUTTA 🐕",
        "🐗 SUAR KI AULAD 🐗",
        "🤪 CHUTIYA 🤪",
        "💢 BHOSDIKE 💢",
        "🖕 GANDU 🖕",
        "🔥 TERI MA KA BHOSDA 🔥",
        "💥 BHAN CHOAD 💥",
        "👊 MADARCHOD 👊",
        "🔞 NOW FUCK OFF! 🔞"
      ];

      for (const line of sequence) {
        await delay(700); // Slightly slower for impact
        await sock.relayMessage(
          chatId,
          {
            protocolMessage: {
              key: initialMsg.key,
              type: 14,
              editedMessage: { conversation: line }
            }
          },
          {}
        );
      }
    } catch (error) {
      console.error('Fuckyou command error:', error);
      await sock.sendMessage(chatId, {
        text: `❌ Error: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] fuckyou.js:', e.message); }

/* ===== why.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const axios = require('axios');

async function fetchWithRetries(url, retries = 3, delay = 2000) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const { data } = await axios.get(url);
      return data;
    } catch (err) {
      attempt++;
      console.error(`[WHY] Attempt ${attempt} failed:`, err.message);
      if (attempt >= retries) throw new Error('Max retries reached');
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

module.exports = {
  command: 'why',
  aliases: ['whyme', 'question'],
  category: 'fun',
  description: 'Get a random “why” question from the API',
  usage: '.why',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      const data = await fetchWithRetries('https://nekos.life/api/v2/why');

      if (!data?.why?.trim()) {
        return await sock.sendMessage(
          chatId,
          { text: '❌ Invalid response from API. Try again.' },
          { quoted: message }
        );
      }

      await sock.sendMessage(
        chatId,
        { text: `🤔 *Why?*\n\n${data.why}` },
        { quoted: message }
      );

    } catch (error) {
      console.error('Why plugin error:', error);
      await sock.sendMessage(
        chatId,
        { text: '❌ Failed to fetch question. Try again later.' },
        { quoted: message }
      );
    }
  }
};


    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] why.js:', e.message); }

/* ===== stupid.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const fetch = require('node-fetch');

module.exports = {
    command: 'stupid',
    aliases: ['stupidcard', 'dumb'],
    category: 'group',
    description: 'Generate a stupid card for a user',
    usage: '.stupid (reply to user, mention someone, or add text)',
    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;

        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

        let who = quotedMsg 
            ? quotedMsg.sender 
            : mentionedJid && mentionedJid[0] 
                ? mentionedJid[0] 
                : sender;

        let text = args && args.length > 0 ? args.join(' ') : 'im+stupid';

        try {
            let avatarUrl;
            try {
                avatarUrl = await sock.profilePictureUrl(who, 'image');
            } catch (error) {
                console.error('Error fetching profile picture:', error);
                avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'; // Default avatar
            }

            const apiUrl = `https://some-random-api.com/canvas/misc/its-so-stupid?avatar=${encodeURIComponent(avatarUrl)}&dog=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error(`API responded with status: ${response.status}`);

            const imageBuffer = await response.buffer();

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: `*@${who.split('@')[0]}*`,
                mentions: [who]
            }, { quoted: message });

        } catch (error) {
            console.error('Stupid Command Error:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ Sorry, I couldn\'t generate the stupid card. Please try again later!'
            }, { quoted: message });
        }
    }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] stupid.js:', e.message); }

/* ===== taptap.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    // plugins/taptap.js
const { playSound } = require('./sound2');

module.exports = {
  command: 'taptap',
  aliases: ['boom', 'vineboom'],
  category: 'fun',
  description: '💥 Play the viral Vine Boom sound',
  usage: '.taptap',

  async handler(sock, message, args, context) {
    await playSound(sock, context.chatId, message, 'taptap', context);
  }
};

    return module.exports; })();
  if (_m) { if (Array.isArray(_m)) _bundle.push(..._m.filter(p=>p&&p.command&&typeof p.handler==='function'));
    else if (_m.command && typeof _m.handler==='function') _bundle.push(_m); }
} catch(e) { console.warn('[BUNDLE:cat-08-fun] taptap.js:', e.message); }

/* ===== sex.js ===== */
try {
  const _m = (function() { const module = {exports:{}}; const exports = module.exports;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  command: 'sex',
  aliases: ['makeout', 'romance'],
  category: 'fun',
  description: 'Simulate a romantic encounter (just for laughs)',
  usage: '.sex [partner]',

  async handler(sock, message, args) {
    const chatId = message.key.remoteJid;
    const partner = args[0] || 'someone';
    const user = message.pushName || 'You';

    const initialMsg = await sock.sendMessage(chatId, {
      text: `*💕 ${user} is feeling romantic with ${partner}...*`
    }, { quoted: message });
    const key = initialMsg.key;
    const edit = text => sock.sendMessage(chatId, { text, edit: key });

    await delay(1000);
    await edit(`*😊 Setting the mood...*`);
    await delay(1500);
    await edit(`*🕯️ Lighting candles...*`);
    await delay(1500);
    await edit(`*🎶 Playing romantic music...*`);
    await delay(1500);
    await edit(`*💋 Sharing a sweet kiss...*`);
    await delay(2000);
    await edit(`*❤️ A wonderful time was had by all!*`);
    await delay(1000);
    await edit(`*🥰 ${user} and ${partner} are now closer than ever.*`);
  }
};

    return module.exports; })();
  if (_m && _m.command && typeof _m.handler === 'function') _bundle.push(_m);
} catch(e) { console.warn('[BUNDLE:cat-08-fun] sex.js:', e.message); }

module.exports = _bundle;