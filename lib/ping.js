// ping.js – Simple one‑time ping command
module.exports = {
  command: 'ping',
  aliases: ['pong'],
  category: 'general',
  description: 'Check the bot\'s response time (latency)',
  usage: '.ping',
  ownerOnly: false,

  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;

    try {
      const start = Date.now();
      const sentMsg = await sock.sendMessage(chatId, {
        text: '📡 Pinging...',
        ...channelInfo
      }, { quoted: message });

      const latency = Date.now() - start;

      await sock.sendMessage(chatId, {
        text: `🏓 Pong!\n📶 Response time: ${latency}ms`,
        edit: sentMsg.key // edits the previous message
      }, { quoted: message });

    } catch (err) {
      console.error('Ping error:', err);
      await sock.sendMessage(chatId, {
        text: `❌ Ping failed: ${String(err.message || err)}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
