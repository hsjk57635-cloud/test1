const axios = require('axios');

function extract(data) {
  if (!data) return '';
  if (typeof data === 'string') return data.trim();
  const keys = ['result','response','answer','message','content','text','data','output'];
  for (const k of keys) {
    const v = data?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (v && typeof v === 'object') {
      const nested = extract(v);
      if (nested) return nested;
    }
  }
  if (Array.isArray(data)) {
    for (const v of data) { const x = extract(v); if (x) return x; }
  }
  return '';
}

function quotedText(message) {
  const q = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!q) return '';
  return q.conversation || q.extendedTextMessage?.text || q.imageMessage?.caption ||
         q.videoMessage?.caption || q.documentMessage?.caption || q.documentWithCaptionMessage?.message?.documentMessage?.caption || '';
}

async function groq(input) {
  if (!process.env.GROQ_API_KEY) return '';
  const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role:'system', content:'You are a helpful explainer. Explain code or concepts clearly, simply, accurately, and with examples when useful. Preserve code in code blocks.' }, { role:'user', content: input }],
    temperature: 0.2,
    max_tokens: 1800
  }, { timeout: 30000, headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type':'application/json' } });
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function gemini(input) {
  if (!process.env.GEMINI_API_KEY) return '';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const { data } = await axios.post(url, { contents:[{ parts:[{ text:'Explain this code or concept clearly and simply, with examples when useful. Preserve code formatting.\n\n'+input }] }] }, { timeout:30000 });
  return data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('').trim() || '';
}

module.exports = {
  command: 'explain',
  aliases: ['codeexplain', 'whatis'],
  category: 'ai',
  description: 'Explain code or concepts with AI',
  usage: '.explain <code/concept> or reply to a message',
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const input = args.join(' ').trim() || quotedText(message).trim();
    if (!input) {
      return sock.sendMessage(chatId, { text:'🔍 *AI EXPLAINER*\n\nUse: `.explain <code or concept>`\nOr reply to a message with `.explain`\n\nExample: `.explain async/await in JavaScript`', ...channelInfo }, { quoted: message });
    }
    try {
      await sock.sendMessage(chatId, { react:{ text:'🔍', key:message.key } });
      const prompt = `Explain the following in simple terms. If it is code, explain what it does, the important parts, and any obvious issue. If it is a concept, give a clear definition and a small example.\n\n${input}`;
      let answer = '';
      for (const fn of [groq, gemini]) {
        try { answer = await fn(prompt); if (answer) break; } catch(e) { console.warn('[EXPLAIN]', e.message); }
      }
      if (!answer) {
        const urls = [
          `https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent(prompt)}`,
          `https://api.agatz.xyz/api/gpt?message=${encodeURIComponent(prompt)}`
        ];
        for (const url of urls) {
          try { const r=await axios.get(url,{timeout:20000}); answer=extract(r.data); if(answer) break; } catch(e) {}
        }
      }
      if (!answer) throw new Error('No AI response. Set GROQ_API_KEY or GEMINI_API_KEY.');
      await sock.sendMessage(chatId, { text:`*🔍 Explanation*\n\n${answer}`, ...channelInfo }, { quoted: message });
      await sock.sendMessage(chatId, { react:{ text:'✅', key:message.key } });
    } catch (error) {
      console.error('[EXPLAIN]', error);
      await sock.sendMessage(chatId, { text:'❌ Explain service is unavailable right now. Please set `GROQ_API_KEY` or `GEMINI_API_KEY` in Railway Variables and try again.', ...channelInfo }, { quoted: message });
      try { await sock.sendMessage(chatId, { react:{ text:'❌', key:message.key } }); } catch {}
    }
  }
};
