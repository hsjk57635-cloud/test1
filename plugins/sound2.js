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
