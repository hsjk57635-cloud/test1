const axios = require('axios');

function quotedText(message) {
  const q = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!q) return '';
  return q.conversation || q.extendedTextMessage?.text || q.imageMessage?.caption || q.videoMessage?.caption || '';
}

function extractVideoUrl(data) {
  if (!data) return '';
  if (typeof data === 'string' && /^https?:\/\//i.test(data)) return data;
  if (Array.isArray(data)) { for (const x of data) { const u=extractVideoUrl(x); if(u) return u; } return ''; }
  for (const k of ['videoUrl','video_url','downloadUrl','download_url','url','video','result','data','output','link']) {
    const v=data?.[k];
    if (typeof v === 'string' && /^https?:\/\//i.test(v)) return v;
    if (v && typeof v === 'object') { const u=extractVideoUrl(v); if(u) return u; }
  }
  return '';
}

async function fetchVideo(url, params={}) {
  const r=await axios.get(url,{params,timeout:90000,responseType:'arraybuffer',headers:{'User-Agent':'Mozilla/5.0'}});
  const ct=String(r.headers?.['content-type']||'');
  if (ct.includes('video/')) return Buffer.from(r.data);
  let data; try { data=JSON.parse(Buffer.from(r.data).toString('utf8')); } catch { return null; }
  const u=extractVideoUrl(data); if(!u) return null;
  const vr=await axios.get(u,{responseType:'arraybuffer',timeout:90000,headers:{'User-Agent':'Mozilla/5.0'}});
  return Buffer.from(vr.data);
}

module.exports={
  command:'sora',
  aliases:['txt2video','aivideo','text2video'],
  category:'ai',
  description:'Generate an AI video from a text prompt',
  usage:'.sora <prompt>',
  async handler(sock,message,args,context){
    const {chatId,channelInfo}=context;
    const prompt=(args.join(' ').trim() || quotedText(message).trim());
    if(!prompt){
      return sock.sendMessage(chatId,{text:'🎬 *SORA AI VIDEO*\n\nUse: `.sora <prompt>`\nExample: `.sora A cinematic sunset over the ocean`',...channelInfo},{quoted:message});
    }
    try {
      await sock.sendMessage(chatId,{react:{text:'🎬',key:message.key}});
      let buffer=null, last='';
      const apis=[
        ['https://okatsu-rolezapiiz.vercel.app/ai/txt2video',{text:prompt}],
        ['https://api.agaxt.dev/ai/text2video',{text:prompt}],
        ['https://api.ryzendesu.vip/api/ai/text2video',{text:prompt}],
        ['https://api.giftedtech.my.id/api/ai/text2video',{q:prompt,apikey:'gifted'}]
      ];
      for(const [url,params] of apis){
        try { buffer=await fetchVideo(url,params); if(buffer?.length) break; } catch(e){ last=e.message; }
      }
      if(!buffer) throw new Error(last || 'No video generator is available');
      await sock.sendMessage(chatId,{video:buffer,mimetype:'video/mp4',caption:`🎬 *SORA AI VIDEO*\n\n${prompt}`,...channelInfo},{quoted:message});
      await sock.sendMessage(chatId,{react:{text:'✅',key:message.key}});
    } catch(e){
      console.error('[SORA]',e);
      await sock.sendMessage(chatId,{text:`❌ Sora video generation failed.\n\n${e.message}\n\nIf your API provider requires a key, add it in Railway Variables.`,...channelInfo},{quoted:message});
      try{await sock.sendMessage(chatId,{react:{text:'❌',key:message.key}});}catch{}
    }
  }
};
