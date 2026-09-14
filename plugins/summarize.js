const axios = require('axios');

function extract(data) {
  if (!data) return '';
  if (typeof data === 'string') return data.trim();
  if (Array.isArray(data)) {
    for (const v of data) { const x = extract(v); if (x) return x; }
    return '';
  }
  for (const k of ['result','response','answer','message','content','text','output','data']) {
    const v = data?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (v && typeof v === 'object') { const x = extract(v); if (x) return x; }
  }
  return '';
}

function quotedText(message) {
  const q = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!q) return '';
  return q.conversation || q.extendedTextMessage?.text || q.imageMessage?.caption ||
    q.videoMessage?.caption || q.documentMessage?.caption ||
    q.documentWithCaptionMessage?.message?.documentMessage?.caption || '';
}

async function groq(input) {
  if (!process.env.GROQ_API_KEY) return '';
  const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are an expert summarizer. Summarize accurately and concisely. Keep the main points, important facts, names, dates, and conclusions. Use clear language and bullets when useful.' },
      { role: 'user', content: input }
    ],
    temperature: 0.2,
    max_tokens: 1600
  }, { timeout: 30000, headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } });
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function gemini(input) {
  if (!process.env.GEMINI_API_KEY) return '';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const { data } = await axios.post(url, {
    contents: [{ parts: [{ text: 'Summarize the following accurately and concisely. Keep the key points, facts, names, dates and conclusion. Use bullets when useful.\n\n' + input }] }]
  }, { timeout: 30000 });
  return data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim() || '';
}

module.exports = {
  command: 'summarize',
  aliases: ['summary', 'summarise', 'tl;dr'],
  category: 'ai',
  description: 'Summarize text or a replied message with AI',
  usage: '.summarize <text> or reply to a message',
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const input = args.join(' ').trim() || quotedText(message).trim();
    if (!input) {
      return sock.sendMessage(chatId, {
        text: '📝 *AI SUMMARIZER*\n\nUse: `.summarize <text>`\nOr reply to a message with `.summarize`\n\nExample: `.summarize This is a long article...`',
        ...channelInfo
      }, { quoted: message });
    }
    try {
      await sock.sendMessage(chatId, { react: { text: '📝', key: message.key } });
      const prompt = `Create a useful summary of this text. Do not invent information.\n\n${input}`;
      let summary = '';
      for (const fn of [groq, gemini]) {
        try { summary = await fn(prompt); if (summary) break; } catch (e) { console.warn('[SUMMARIZE]', e.message); }
      }
      if (!summary) {
        const urls = [
          `https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent('Summarize this accurately and concisely:\n\n' + input)}`,
          `https://api.agatz.xyz/api/gpt?message=${encodeURIComponent('Summarize this accurately and concisely:\n\n' + input)}`
        ];
        for (const url of urls) {
          try { const r = await axios.get(url, { timeout: 20000 }); summary = extract(r.data); if (summary) break; } catch (e) {}
        }
      }
      if (!summary) throw new Error('No AI response');
      await sock.sendMessage(chatId, { text: `*📝 Summary*\n\n${summary}`, ...channelInfo }, { quoted: message });
      await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
    } catch (error) {
      console.error('[SUMMARIZE]', error);
      await sock.sendMessage(chatId, { text: '❌ Summarize service is unavailable. Please set `GROQ_API_KEY` or `GEMINI_API_KEY` in Railway Variables.', ...channelInfo }, { quoted: message });
      try { await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } }); } catch {}
    }
  }
};
