<div align="center">

# 🔥 REDXBOT302 ULTRA v7.0

**Advanced WhatsApp Bot — 400+ Commands · Pair-Only (No Session ID)**

[![GitHub](https://img.shields.io/badge/GitHub-AbdulRehman19721986-blue?logo=github)](https://github.com/AbdulRehman19721986/redxbot302)
[![YouTube](https://img.shields.io/badge/YouTube-rootmindtech-red?logo=youtube)](https://youtube.com/@rootmindtech)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Channel-25D366?logo=whatsapp)](https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10)
[![Telegram](https://img.shields.io/badge/Telegram-TeamRedxhacker2-2CA5E0?logo=telegram)](https://t.me/TeamRedxhacker2)

*Developed by JUNAID-MD↣³⁰² & Muzamil Khan*

</div>

---

## ✨ Features

- 🔗 **Pair-Only** — No SESSION_ID needed; just pair with your number
- 🤖 **400+ Commands** across 15+ categories
- 🧠 **Multi-DB Support** — SQLite / MongoDB / PostgreSQL / MySQL / File-based
- 📥 **Downloaders** — TikTok, YouTube, Spotify, Facebook, Instagram, SoundCloud
- 🎮 **Games** — TicTacToe, Wordle, Trivia, Sudoku, RPG, Blackjack and more
- 🛡️ **Auto-Mod** — Anti-link, Anti-spam, Anti-bad-word, Anti-delete, Anti-call
- 🖼️ **Stickers** — Create, crop, pack, Telegram import
- 🤖 **AI** — GPT, LLaMA, Mistral, DeepSeek, Image analysis
- 🔊 **Audio FX** — TTS, voice effects, song finder (Shazam)
- 📋 **Interactive Menu** — Numbered category selector

---

## 🚀 Quick Deploy

### Local
```bash
git clone https://github.com/AbdulRehman19721986/redxbot302
cd redxbot302
cp .env.example .env
# Edit .env with your details
npm install
npm start
```

### Heroku
```bash
heroku create your-app-name
heroku config:set OWNER_NUMBER=923xxxxxxxxx PAIRING_NUMBER=923xxxxxxxxx
git push heroku main
```

### Railway / Render
Set env vars in dashboard, connect repo and deploy.

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and fill in your details:

| Variable | Description | Required |
|---|---|---|
| `PAIRING_NUMBER` | Your WhatsApp number (no +) | ✅ |
| `OWNER_NUMBER` | Owner number | ✅ |
| `OWNER_NAME` | Your name | ✅ |
| `BOT_NAME` | Bot display name | ❌ |
| `PREFIX` | Command prefix (default `.`) | ❌ |
| `BOT_MODE` | `public` or `private` | ❌ |
| `MONGO_URL` | MongoDB URL (optional) | ❌ |
| `ADMIN_USERNAME` | Web panel username | ⚠️ Change! |
| `ADMIN_PASSWORD` | Web panel password | ⚠️ Change! |

---

## 📦 Plugin Categories

| # | Category | Emoji | Commands |
|---|---|---|---|
| 1 | Main | 🏠 | menu, allmenu, catmenu |
| 2 | AI | 🤖 | gpt, llama, mistral, deepseek, analyze |
| 3 | Owner | 👑 | panel, broadcast, ban, sudo |
| 4 | Group | 👥 | promote, demote, kick, warn, welcome |
| 5 | Downloader | 📥 | yt, tiktok, spotify, facebook, instagram |
| 6 | Audio | 🎵 | play, song, tts, shazam, audiofx |
| 7 | Sticker | 🖼️ | sticker, sticker2, crop, pack |
| 8 | Fun | 🎯 | ship, simp, rate, random |
| 9 | Games | 🎮 | tictactoe, wordle, trivia, sudoku, rpg |
| 10 | Tools | 🔧 | qr, translate, ocr, resize, convert |
| 11 | Search | 🔍 | bing, pinterest, anime, define |
| 12 | Utility | ⚙️ | ping, speedtest, uptime, stats |
| 13 | Reaction | 💫 | slap, hug, kiss, pat |
| 14 | Setting | 🛠️ | setbio, setdp, setpp, prefix |
| 15 | General | 📋 | pair, alive, help |

---

## 📁 Project Structure

```
redxbot302-ultra/
├── index.js              ← Main bot entry (pair-only)
├── settings.js           ← Centralised config (reads .env)
├── config.js             ← Global APIs & pairing config
├── package.json          ← All dependencies
├── .env.example          ← Copy to .env
├── lib/                  ← Core libraries
│   ├── commandHandler.js ← Plugin loader & command registry
│   ├── lightweight_store.js ← Multi-DB storage (SQLite/Mongo/PG/File)
│   ├── messageHandler.js ← Incoming message processor
│   ├── isAdmin.js        ← Group admin checks
│   ├── isOwner.js        ← Owner permission checks
│   ├── isBanned.js       ← Ban list checks
│   ├── antilink.js       ← Anti-link core
│   ├── sticker.js        ← Sticker creation
│   ├── ytdl.js           ← YouTube downloader
│   ├── welcome.js        ← Welcome/goodbye messages
│   └── ...               ← 40+ more library files
├── plugins/              ← 400+ command plugins
│   ├── menu.js           ← Interactive menu (upgraded)
│   ├── pair.js           ← Pairing command
│   ├── ai.js             ← AI commands
│   └── ...               ← All plugins from verbose-fishstick
└── data/                 ← Persistent JSON data
    ├── store.json
    ├── banned.json
    ├── warnings.json
    └── ...
```

---

## 🔗 Connect

- **WhatsApp:** [Join Group](https://chat.whatsapp.com/LhSmx2SeXX75r8I2bxsNDo)
- **Telegram:** [TeamRedxhacker2](https://t.me/TeamRedxhacker2)
- **YouTube:** [@rootmindtech](https://youtube.com/@rootmindtech)
- **GitHub:** [AbdulRehman19721986](https://github.com/AbdulRehman19721986)

---

> © 2026 JUNAID-MD↣³⁰². All rights reserved.
