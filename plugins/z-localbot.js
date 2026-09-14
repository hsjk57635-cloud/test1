const fs = require('fs');
const path = require('path');

const states = new Map();
const REPLIES_FILE = path.join(process.cwd(), 'data', 'autoreplies.json');

const pick = a => a[Math.floor(Math.random() * a.length)];
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const has = (t, words) => words.some(w => t.includes(w));

async function customReply(text, name) {
  try {
    if (!fs.existsSync(REPLIES_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(REPLIES_FILE, 'utf8'));
    for (const r of (data.replies || [])) {
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
    if (typeof result !== 'number' || !Number.isFinite(result)) return null;
    return `🔢 *${expr} = ${Number.isInteger(result) ? result : Number(result.toFixed(8))}*`;
  } catch { return null; }
}

const rules = [
  {p:['hello','hi','hey','salam','assalamualaikum','aoa','اسلام علیکم','ہیلو'], r:['👋 Hello {name}! Kaise ho?','🤖 Assalamualaikum {name}! Main Local Bot hoon.','✨ Hey {name}! Batao kya help chahiye?']},
  {p:['good morning','subah bakhair'], r:['🌅 Good morning {name}! Have a great day!']},
  {p:['good night','shab bakhair','شب بخیر'], r:['🌙 Good night {name}! Sweet dreams 😴']},
  {p:['how are you','kaise ho','kaisay ho','kya haal','کیسے ہو'], r:['😊 Main bilkul theek hoon, {name}! Tum sunao?','🤖 Ready and running locally!']},
  {p:['your name','tumhara naam','aap ka naam','نام کیا'], r:['🤖 Mera naam *JUNAID Local Bot* hai.']},
  {p:['who are you','tum kon ho','aap kon','کون ہو'], r:['🤖 Main JUNAID-MD ka offline Local Bot hoon — internet/API ke baghair basic replies deta hoon.']},
  {p:['owner','maalik','developer','kisne banaya','کس نے بنایا'], r:['👑 Developer: *JUNAID-MD*']},
  {p:['thank you','thanks','shukriya','شکریہ'], r:['❤️ You are welcome!','😊 Khushi hui help karke!']},
  {p:['bye','goodbye','allah hafiz','خدا حافظ'], r:['👋 Allah Hafiz {name}! Phir milte hain.']},
  {p:['joke','jokes','mazak','لطیفہ'], r:['😂 Teacher: Homework kahan hai? Student: Sir, Wi‑Fi ke saath upload kar diya!','🤣 Ek programmer ne chai banayi… bug aa gaya, chai compile nahi hui!']},
  {p:['motivate','motivation','himmat','udaas','sad','depressed','مایوس'], r:['💪 Chhote steps bhi progress hain. Aaj bas ek kaam complete karo.','🌟 Keep going — slow progress is still progress!']},
  {p:['love you','i love you','mohabbat'], r:['😄 Main bot hoon, lekin tumhari respect zaroor karta hoon! ❤️']},
  {p:['weather','mausam','موسم'], r:['🌤️ Main offline hoon, is liye live weather nahi dekh sakta. `.weather <city>` use karo agar bot mein weather command enabled hai.']},
  {p:['time','waqt','kitne baje'], r:['🕐 Current server time: ' + new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true})]},
  {p:['date','today','aaj ki date','آج کی تاریخ'], r:['📅 Today: ' + new Date().toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'long',year:'numeric'})]},
  {p:['help','madad','kya kar sakte','commands'], r:['🛠️ Main greetings, jokes, motivation, time/date, math, basic FAQ aur custom replies handle karta hoon. AI-level answers ke liye `.ai` ya `.chatbot` use karo.']},
  {p:['localbot kya','local bot kya','localbot kaise'], r:['🤖 `.localbot on` = chat ke normal messages ka auto-reply\n`.localbot off` = band\n`.localbot status` = status\n`.localbot <text>` = direct reply']},
  {p:['railway'], r:['🚂 Railway deployment ke liye environment variables aur start command sahi honi chahiye. Main offline mode mein hoon, live deployment status nahi dekh sakta.']},
  {p:['whatsapp'], r:['📱 WhatsApp ek messaging platform hai. Bot ke commands `.menu` se check karo.']},
  {p:['group','group rules','گروپ'], r:['👥 Group management ke liye `.menu` mein admin/security commands dekho.']},
  {p:['admin'], r:['🛡️ Admin actions ke liye bot ko group admin permissions dena zaroori hota hai.']},
  {p:['antilink','link'], r:['🔗 AntiLink feature enabled ho to `.antilink on` se links par action liya ja sakta hai.']},
  {p:['good bot','nice bot','smart bot'], r:['😎 Thanks {name}! Main hamesha ready hoon.']},
  {p:['ping'], r:['🏓 Pong! Local response — no API required.']},
  {p:['version','ver'], r:['🤖 JUNAID-MD Local Bot — expanded offline edition.']},
  {p:['yes','haan','ji haan','جی'], r:['👍 Theek hai!']},
  {p:['no','nahi','nahin','نہیں'], r:['👌 Theek hai.']},
  {p:['ok','okay','theek','thik'], r:['👍 Done!']},
  {p:['what can you do','capabilities','features'], r:['🧠 Offline: chat, FAQ, jokes, motivation, greetings, time/date, calculator, custom replies, bot status/help.']},
  {p:['who is junaid','junaid kaun'], r:['👑 JUNAID-MD bot project ka developer/owner label hai.']},
  {p:['youtube'], r:['▶️ YouTube videos dekhne ke liye `.play <song>` try karo.']},
  {p:['music','song','gana'], r:['🎵 Music ke liye `.play <song name>` use karo.']},
  {p:['sticker','stiker'], r:['🎨 Sticker ke liye image/video par `.sticker` command try karo.']},
  {p:['translate','translation','tarjuma'], r:['🌐 Translation ke liye `.translate <text>` use karo agar command available hai.']},
  {p:['image','tasveer','photo'], r:['🖼️ AI image ke liye `.imagine <prompt>` try karo.']},
  {p:['video','video banao'], r:['🎬 AI video ke liye `.sora <prompt>` try karo.']},
];

async function getResponse(text, name) {
  const c = await customReply(text, name);
  if (c) return c;
  const m = math(text); if (m) return m;
  const t = norm(text);
  for (const x of rules) if (has(t, x.p)) return pick(x.r).replace(/\{name\}/g, name);
  return pick([
    `🤔 ${name}, is baat ka offline answer mere paas nahi hai.`,
    `🧠 Main offline mode mein hoon. Simple sawal, joke, math, time/date ya FAQ poochho.`,
    `💡 Iska detailed AI jawab chahiye to \.ai ${String(text).slice(0,180)}`,
    `📚 Mujhe samajh nahi aaya. Thora simple likho, {name}.`
  ]).replace(/\{name\}/g, name);
}

async function send(sock, chatId, text, quoted, channelInfo={}) {
  await sock.presenceSubscribe?.(chatId).catch(()=>{});
  await sock.sendPresenceUpdate?.('composing', chatId).catch(()=>{});
  await new Promise(r=>setTimeout(r, 250 + Math.random()*450));
  await sock.sendPresenceUpdate?.('paused', chatId).catch(()=>{});
  return sock.sendMessage(chatId,{text,...channelInfo},{quoted});
}

async function handleLocalBotMessage(sock,message,chatId,text,senderId,channelInfo={}) {
  const state=states.get(chatId); if(!state?.enabled) return false;
  if(!text || /^[.!/]/.test(String(text).trim())) return false;
  if(Date.now()-state.lastActivity>24*60*60*1000){states.delete(chatId);return false;}
  state.lastActivity=Date.now();
  const name=(message.pushName || String(senderId||'').split('@')[0] || 'there').split(' ')[0];
  try { await send(sock,chatId,await getResponse(text,name),message,channelInfo); } catch(e) { console.warn('[LOCALBOT]',e.message); }
  return true;
}

module.exports={
 command:'localbot',
 aliases:['lbot','offlinebot','localai','lb'],
 category:'ai',
 description:'Expanded offline local chatbot with auto-reply, FAQ, jokes, calculator and bilingual replies.',
 usage:'.localbot on/off/status | .localbot <message>',
 async handler(sock,message,args,context={}){
  const chatId=context.chatId||message.key.remoteJid, channelInfo=context.channelInfo||{};
  const senderId=context.senderId||message.key.participant||message.key.remoteJid;
  const name=(message.pushName||String(senderId).split('@')[0]||'there').split(' ')[0];
  const sub=String(args[0]||'').toLowerCase();
  if(sub==='on'){
   states.set(chatId,{enabled:true,lastActivity:Date.now()});
   return send(sock,chatId,'🤖 *Local Bot Activated!*\n\nAb normal messages ka offline reply milega.\n\n`.localbot off` — stop\n`.localbot status` — status\n`.localbot <text>` — direct reply\n\n⚡ No API • No internet • Fast',{...message},channelInfo);
  }
  if(sub==='off'){
   states.delete(chatId);
   return send(sock,chatId,'🤖 *Local Bot Deactivated!*\nAuto-reply band kar diya gaya hai.',message,channelInfo);
  }
  if(sub==='status'){
   const s=states.get(chatId);
   return send(sock,chatId,`🤖 Local Bot: ${s?.enabled?'🟢 *ACTIVE*':'🔴 *INACTIVE*'}`,message,channelInfo);
  }
  const userText=args.join(' ').trim();
  if(!userText) return send(sock,chatId,'🤖 *Expanded Local Bot*\n\n`.localbot hello`\n`.localbot joke`\n`.localbot motivate me`\n`.localbot 25 * 4`\n`.localbot what time is it`\n`.localbot help`\n\n*Auto mode:* `.localbot on` / `.localbot off`\n*Status:* `.localbot status`',message,channelInfo);
  return send(sock,chatId,await getResponse(userText,name),message,channelInfo);
 }
};
module.exports.handleLocalBotMessage=handleLocalBotMessage;
