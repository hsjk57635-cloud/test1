const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const states = new Map();
const REPLIES_FILE = path.join(process.cwd(), 'data', 'autoreplies.json');
const HAS_DB = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || process.env.DB_URL);
const pick = a => a[Math.floor(Math.random() * a.length)];
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

async function customReply(text, name) {
  try {
    let replies = [];
    if (HAS_DB) replies = (await store.getSetting('global', 'autoreplies'))?.replies || [];
    else if (fs.existsSync(REPLIES_FILE)) replies = JSON.parse(fs.readFileSync(REPLIES_FILE, 'utf8')).replies || [];
    for (const r of replies) {
      const trigger = norm(r.trigger);
      const ok = r.exactMatch ? norm(text) === trigger : norm(text).includes(trigger);
      if (ok) return String(r.response || '').replace(/\{name\}/gi, name);
    }
  } catch {}
  return null;
}

function math(text) {
  const m = String(text).match(/^\s*(?:calculate|calc|solve|what is)?\s*([0-9()+\-*/%.\s]+)\s*\??\s*$/i);
  if (!m || !/[+\-*/%]/.test(m[1])) return null;
  const expr = m[1].trim();
  if (!expr || expr.length > 100 || !/^[0-9()+\-*/%.\s]+$/.test(expr)) return null;
  try {
    const result = Function('"use strict"; return (' + expr + ')')();
    if (!Number.isFinite(result)) return null;
    return `🔢 *${expr} = ${Number.isInteger(result) ? result : Number(result.toFixed(8))}*`;
  } catch { return null; }
}

const rules = [
  [['hello','hi','hey','salam','assalam','aoa','اسلام علیکم','ہیلو'], ['👋 Hello {name}! Kaise ho?','🤖 Assalamualaikum {name}! Main Local Bot 2 hoon.']],
  [['how are you','kaise ho','kya haal'], ['😊 Main bilkul theek hoon, {name}! Tum sunao?','⚡ Fully offline and ready!']],
  [['your name','tumhara naam','naam kya','what are you','who are you'], ['🤖 Main *JUNAID Local Bot 2* hoon — offline assistant.']],
  [['thanks','thank you','shukriya','شکریہ'], ['❤️ You are welcome!','😊 Khushi hui help karke!']],
  [['bye','goodbye','allah hafiz','khuda hafiz'], ['👋 Allah Hafiz {name}!']],
  [['joke','jokes','mazak','لطیفہ'], ['😂 Programmer ki chai compile nahi hui… bug aa gaya!','🤣 Teacher: Homework? Student: Sir, cloud mein upload hai!']],
  [['motivate','motivation','himmat','sad','udaas','مایوس'], ['💪 Chhote steps bhi progress hain. Keep going!','🌟 You have got this!']],
  [['fact','random fact','did you know'], ['🧠 Honey can remain edible for thousands of years when properly sealed.','🐙 Octopuses have three hearts.']],
  [['riddle','puzzle'], ['🧩 What has hands but cannot clap? *A clock.*']],
  [['help','madad','commands'], ['🛠️ Try `.localbot2 on`, `.localbot2 off`, `.localbot2 status`, or `.localbot2 <text>`. I handle FAQ, jokes, motivation, time/date and math offline.']],
  [['ping','online','active'], ['🏓 Pong! Local Bot 2 is online.']],
  [['music','song','gana'], ['🎵 Music ke liye `.play <song>` use karo.']],
  [['image','tasveer','photo'], ['🖼️ AI image ke liye `.imagine <prompt>` use karo.']],
  [['video','video banao'], ['🎬 AI video ke liye `.sora <prompt>` use karo.']],
  [['antilink','link'], ['🔗 AntiLink ke liye `.antilink on` / `.antilink off` use karo.']],
  [['railway'], ['🚂 Railway par bot chalane ke liye correct environment variables aur start command zaroori hain.']],
];

async function getResponse(text, name) {
  const c = await customReply(text, name); if (c) return c;
  const t = norm(text);
  if (/what.?time|current time|time batao|time kya|time is it|time now|kitne baje/.test(t)) {
    const n = new Date();
    return `🕐 *Time:* ${n.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})}\n📅 *Date:* ${n.toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}`;
  }
  if (/what.?date|today.?date|current date|aaj ki date|what day/.test(t)) {
    return `📅 *Today:* ${new Date().toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}`;
  }
  const born = t.match(/born in (\d{4})|birth year.?\s*(\d{4})/);
  if (born) { const y=+(born[1]||born[2]), age=new Date().getFullYear()-y; if(age>0&&age<150) return `🎂 Born in *${y}* = *${age} years old* in ${new Date().getFullYear()}.`; }
  const m = math(t); if (m) return m;
  for (const [patterns,responses] of rules) if (patterns.some(p=>t.includes(p))) return pick(responses).replace(/\{name\}/g,name);
  return pick([`🤔 ${name}, mujhe iska offline answer nahi mila.`,`🧠 Simple sawal, joke, math, time/date ya FAQ poochho.`,`💡 Detailed AI answer ke liye .ai use karo.`]);
}

async function send(sock, chatId, text, message, channelInfo={}) {
  await sock.presenceSubscribe?.(chatId).catch(()=>{});
  await sock.sendPresenceUpdate?.('composing', chatId).catch(()=>{});
  await new Promise(r=>setTimeout(r,250+Math.random()*450));
  await sock.sendPresenceUpdate?.('paused', chatId).catch(()=>{});
  return sock.sendMessage(chatId,{text,...channelInfo},{quoted:message});
}

async function handleLocalBotMessage(sock,message,chatId,text,senderId,channelInfo={}) {
  const state=states.get(chatId); if(!state?.enabled || !text || /^[.!/]/.test(String(text).trim())) return false;
  if(Date.now()-state.lastActivity>86400000){states.delete(chatId);return false;}
  state.lastActivity=Date.now();
  const name=(message.pushName||String(senderId||'').split('@')[0]||'there').split(' ')[0];
  try { await send(sock,chatId,await getResponse(text,name),message,channelInfo); } catch(e){ console.warn('[LOCALBOT2]',e.message); }
  return true;
}

module.exports = {
  command:'localbot2', aliases:['lbot2','offlinebot2','localai2','lb2'], category:'ai',
  description:'Expanded offline Local Bot 2 with auto-reply, FAQ, jokes, calculator and bilingual replies.',
  usage:'.localbot2 on/off/status | .localbot2 <message>',
  async handler(sock,message,args,context={}){
    const chatId=context.chatId||message.key.remoteJid, channelInfo=context.channelInfo||{};
    const senderId=context.senderId||message.key.participant||message.key.remoteJid;
    const name=(message.pushName||String(senderId).split('@')[0]||'there').split(' ')[0];
    const sub=String(args[0]||'').toLowerCase();
    if(sub==='on'){states.set(chatId,{enabled:true,lastActivity:Date.now()});return send(sock,chatId,'🤖 *Local Bot 2 Activated!*\n\nAb normal messages ka offline auto-reply milega.\n\n`.localbot2 off` — stop\n`.localbot2 status` — status\n\n⚡ No API • No internet • Fast',message,channelInfo);}
    if(sub==='off'){states.delete(chatId);return send(sock,chatId,'🤖 *Local Bot 2 Deactivated!*\nAuto-reply band kar diya gaya hai.',message,channelInfo);}
    if(sub==='status'){return send(sock,chatId,`🤖 Local Bot 2: ${states.get(chatId)?.enabled?'🟢 *ACTIVE*':'🔴 *INACTIVE*'}`,message,channelInfo);}
    const text=args.join(' ').trim();
    if(!text)return send(sock,chatId,'🤖 *Expanded Local Bot 2*\n\n`.localbot2 hello`\n`.localbot2 joke`\n`.localbot2 motivate me`\n`.localbot2 25 * 4`\n`.localbot2 what time is it`\n`.localbot2 help`\n\n*Auto:* `.localbot2 on` / `.localbot2 off`\n*Status:* `.localbot2 status`',message,channelInfo);
    return send(sock,chatId,await getResponse(text,name),message,channelInfo);
  },
  handleLocalBotMessage
};
