const axios = require('axios');

function pick(data) {
  if (!data) return '';
  if (typeof data === 'string') return data.trim();
  for (const k of ['answer','response','content','text','result','message','output']) {
    const v = data?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  if (data?.choices?.[0]?.message?.content) return String(data.choices[0].message.content).trim();
  if (data?.choices?.[0]?.text) return String(data.choices[0].text).trim();
  if (data?.data) return pick(data.data);
  return '';
}

async function official(query) {
  if (process.env.GROQ_API_KEY) {
    const r = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: query }],
      temperature: 0.7,
      max_tokens: 1200
    }, { timeout: 30000, headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } });
    return pick(r.data);
  }
  if (process.env.GEMINI_API_KEY) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
    const r = await axios.post(url, { contents: [{ parts: [{ text: query }] }] }, { timeout: 30000 });
    return r.data?.candidates?.[0]?.content?.parts?.map(x => x.text || '').join('').trim() || '';
  }
  return '';
}

async function fallback(query) {
  const urls = [
    `https://api.deline.web.id/ai/openai?text=${encodeURIComponent(query)}&prompt=${encodeURIComponent('You are a helpful AI assistant. Answer clearly in the user language.')}`,
    `https://api.giftedtech.my.id/api/ai/gpt4?query=${encodeURIComponent(query)}&apikey=gifted`
  ];
  for (const url of urls) {
    try {
      const r = await axios.get(url, { timeout: 20000 });
      const a = pick(r.data);
      if (a) return a;
    } catch (_) {}
  }
  return '';
}

module.exports = {
  command: 'ai2',
  aliases: ['ask2', 'chat2'],
  category: 'ai',
  description: 'AI Assistant 2 — fast chat with Groq/Gemini fallback',
  usage: '.ai2 <question>',
  async handler(sock, message, args, context) {
    const { chatId } = context;
    const query = args.join(' ').trim();
    if (!query) {
      return sock.sendMessage(chatId, { text: '🤖 *AI2 Assistant*\n\nExample: .ai2 Explain quantum computing in simple words.' }, { quoted: message });
    }
    await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } }).catch(() => {});
    try {
      let answer = await official(query);
      if (!answer) answer = await fallback(query);
      if (!answer) throw new Error('No AI provider responded. Add GROQ_API_KEY or GEMINI_API_KEY in Railway Variables.');
      await sock.sendMessage(chatId, { text: `🤖 *AI2*\n\n${answer}` }, { quoted: message });
      await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } }).catch(() => {});
    } catch (err) {
      console.error('[ai2]', err);
      await sock.sendMessage(chatId, { text: `❌ AI2 failed: ${err.message}` }, { quoted: message });
    }
  }
};
