const axios = require('axios');

function extractImage(data, headers = {}) {
  const ct = String(headers['content-type'] || '').toLowerCase();
  if (ct.startsWith('image/')) return Buffer.from(data);
  let j = data;
  if (Buffer.isBuffer(j)) { try { j = JSON.parse(j.toString()); } catch { return null; } }
  if (typeof j === 'string') { try { j = JSON.parse(j); } catch { return null; } }
  const candidates = [j?.url,j?.image,j?.imageUrl,j?.download,j?.result,j?.data?.url,j?.data?.imageUrl,j?.data?.image,j?.output,j?.data?.output];
  for (const x of candidates) {
    if (typeof x === 'string' && x.startsWith('data:image/')) return Buffer.from(x.split(',')[1], 'base64');
    if (typeof x === 'string' && /^https?:\/\//i.test(x)) return x;
  }
  return null;
}

async function fetchImage(url) {
  const r = await axios.get(url, { responseType:'arraybuffer', timeout:60000, maxContentLength:15*1024*1024, headers:{'User-Agent':'Mozilla/5.0'} });
  const ct = String(r.headers['content-type'] || '').toLowerCase();
  if (!ct.startsWith('image/')) throw new Error('API did not return an image');
  return Buffer.from(r.data);
}

module.exports = {
  command: 'imagine',
  aliases: ['aiimage','draw','genimage'],
  category: 'ai',
  description: 'Generate an AI image from a text prompt',
  usage: '.imagine <prompt>',
  cooldown: 10000,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const prompt = args.join(' ').trim();
    if (!prompt) {
      return sock.sendMessage(chatId,{text:'🎨 *IMAGINE*\n\nUse: `.imagine <prompt>`\nExample: `.imagine a cinematic sunset over mountains`'},{quoted:message});
    }
    const status = await sock.sendMessage(chatId,{text:`🎨 Creating your image…\n\n📝 ${prompt}\n⏳ Please wait.`},{quoted:message});
    const encoded = encodeURIComponent(prompt);
    const apis = [
      `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true`,
      `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&nologo=true`,
      `https://shizoapi.onrender.com/api/ai/imagine?query=${encoded}&apikey=shizo`,
      `https://api.agaxt.dev/ai/text2img?text=${encoded}`,
      `https://api.giftedtech.my.id/api/ai/text2img?q=${encoded}&apikey=gifted`
    ];
    let image = null, last = null;
    try {
      for (const url of apis) {
        try {
          const r = await axios.get(url,{responseType:'arraybuffer',timeout:65000,maxContentLength:15*1024*1024,headers:{'User-Agent':'Mozilla/5.0'}});
          const out = extractImage(r.data,r.headers);
          if (Buffer.isBuffer(out)) { image=out; break; }
          if (typeof out === 'string') { image=await fetchImage(out); break; }
        } catch(e) { last=e; console.log('[IMAGINE] fallback failed:',e.message); }
      }
      if (!image) throw new Error(last?.message || 'No image service is available right now');
      await sock.sendMessage(chatId,{image,caption:`🎨 *AI Generated Image*\n\n📝 ${prompt}`},{quoted:message});
      try { await sock.sendMessage(chatId,{delete:status.key}); } catch {}
    } catch(e) {
      await sock.sendMessage(chatId,{text:`❌ *Imagine failed*\n${e.message}\n\nPlease try again with a shorter/different prompt.`},{quoted:message});
    }
  }
};
