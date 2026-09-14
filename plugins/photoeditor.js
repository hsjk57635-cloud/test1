/*****************************************************************************
 *  plugins/photoeditor.js — JUNAID-MD↣³⁰² ULTRA
 *  Developed By JUNAID-MD↣³⁰² & Muzamil Khan
 *
 *  Bugs fixed vs original:
 *  - axios was used but never required → added require
 *  - Jimp v4 API: writeAsync → write, loadFont → Jimp.loadFont
 *  - FONT_SANS_32_WHITE not available in all Jimp versions → safe fallback
 *  - sticker command used missing axios
 *  - No try/catch on individual Jimp ops
 *  - No cleanup on error path
 *
 *  New commands: brightness, contrast, grayscale, blur, rotate, flip, resize, watermark
 *****************************************************************************/

'use strict';
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs   = require('fs');
const path = require('path');
const axios = require('axios');
const { writeFile } = require('fs/promises');

const TEMP_DIR = path.join(process.cwd(), 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

/* ─── Jimp safe loader ─────────────────────────────────────────────────── */
let Jimp;
function getJimp() {
    if (Jimp) return Jimp;
    try { Jimp = require('jimp'); }
    catch (e) { throw new Error('jimp not installed. Run: npm install jimp'); }
    return Jimp;
}

/* ─── Download image from message or quoted message ──────────────────── */
async function downloadImage(message) {
    const msg =
        message.message?.imageMessage ||
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
    if (!msg) throw new Error('No image found. Reply to an image with the command.');
    const stream = await downloadContentFromMessage(msg, 'image');
    let buf = Buffer.alloc(0);
    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
    return buf;
}

/* ─── Colors map ─────────────────────────────────────────────────────── */
const COLOR_MAP = {
    red:    0xFF0000FF,
    blue:   0x0000FFFF,
    green:  0x00FF00FF,
    yellow: 0xFFFF00FF,
    white:  0xFFFFFFFF,
    black:  0x000000FF,
    pink:   0xFF69B4FF,
    orange: 0xFF8C00FF,
    purple: 0x800080FF,
    cyan:   0x00FFFFFF,
};

/* ─── Safe write helper (Jimp v3 vs v4) ──────────────────────────────── */
async function saveImage(image, outputPath) {
    if (typeof image.writeAsync === 'function') {
        await image.writeAsync(outputPath);
    } else if (typeof image.write === 'function') {
        await new Promise((res, rej) => image.write(outputPath, (e) => e ? rej(e) : res()));
    } else {
        throw new Error('Jimp write method not found — upgrade jimp package');
    }
}

/* ─── Usage text ─────────────────────────────────────────────────────── */
const HELP_TEXT = `🖼️ *Photo Editor ULTRA*

*Reply to an image and use:*

📐 *Crop:*        \`.photoedit crop x y width height\`
✏️ *Text:*        \`.photoedit text "Hello" x y [color]\`
🖼️ *Overlay:*     \`.photoedit sticker <image_url>\`
☀️ *Brightness:*  \`.photoedit brightness <-100 to 100>\`
🎨 *Contrast:*    \`.photoedit contrast <-100 to 100>\`
⬛ *Grayscale:*   \`.photoedit grayscale\`
🌀 *Blur:*        \`.photoedit blur <1–10>\`
🔄 *Rotate:*      \`.photoedit rotate <degrees>\`
🔁 *Flip:*        \`.photoedit flip <h|v>\`
📏 *Resize:*      \`.photoedit resize <width> <height>\`
💧 *Watermark:*   \`.photoedit watermark <text>\`
🔲 *Invert:*      \`.photoedit invert\`
🔆 *Pixelate:*    \`.photoedit pixelate <size>\`

*Colors:* red, blue, green, yellow, white, black, pink, orange, purple, cyan`;

/* ─── Main plugin ────────────────────────────────────────────────────── */
module.exports = {
    command: 'photoedit',
    aliases: ['pedit', 'imgedit', 'editphoto'],
    category: 'tools',
    description: 'Edit images — 14 effects: crop, text, brightness, blur, rotate, watermark & more',
    usage: '.photoedit <command> [params]',
    ownerOnly: false,

    async handler(sock, message, args, context = {}) {
        const chatId      = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const reply       = (text) => sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });

        if (!args.length) return reply(HELP_TEXT);

        const J          = getJimp();
        const command    = args[0].toLowerCase();
        const inputPath  = path.join(TEMP_DIR, `pe_in_${Date.now()}.jpg`);
        const outputPath = path.join(TEMP_DIR, `pe_out_${Date.now()}.jpg`);

        try {
            const imgBuf = await downloadImage(message);
            await writeFile(inputPath, imgBuf);
            const image = await J.read(inputPath);

            switch (command) {

                case 'crop': {
                    if (args.length < 5) return reply('❌ Usage: `.photoedit crop x y width height`');
                    const [x, y, w, h] = args.slice(1, 5).map(Number);
                    if ([x,y,w,h].some(isNaN)) return reply('❌ All values must be numbers.');
                    image.crop(x, y, w, h);
                    break;
                }

                case 'text': {
                    const joined = args.slice(1).join(' ');
                    const match  = joined.match(/"([^"]+)"\s+(\d+)\s+(\d+)(?:\s+(\w+))?/);
                    if (!match) return reply('❌ Format: `.photoedit text "your text" x y [color]`\nExample: `.photoedit text "Hello" 50 100 red`');
                    const text      = match[1];
                    const x         = parseInt(match[2]);
                    const y         = parseInt(match[3]);
                    const colorKey  = (match[4] || 'white').toLowerCase();
                    const hexColor  = COLOR_MAP[colorKey] || 0xFFFFFFFF;
                    try {
                        const font = await J.loadFont(J.FONT_SANS_32_WHITE || J.FONT_SANS_16_WHITE);
                        image.print(font, x, y, text);
                    } catch {
                        // Jimp FONT not available — draw colored rectangle as placeholder
                        image.scan(x, y, Math.min(text.length * 16, image.bitmap.width - x), 32, function(px, py, idx) {
                            this.bitmap.data[idx]   = (hexColor >> 24) & 0xFF;
                            this.bitmap.data[idx+1] = (hexColor >> 16) & 0xFF;
                            this.bitmap.data[idx+2] = (hexColor >> 8)  & 0xFF;
                            this.bitmap.data[idx+3] = hexColor & 0xFF;
                        });
                    }
                    break;
                }

                case 'sticker':
                case 'overlay': {
                    const stickerUrl = args[1];
                    if (!stickerUrl) return reply('❌ Usage: `.photoedit sticker <image_url>`');
                    const res     = await axios.get(stickerUrl, { responseType: 'arraybuffer', timeout: 15000 });
                    const sticker = await J.read(Buffer.from(res.data));
                    sticker.resize(200, 200);
                    const ox = Math.max(0, Math.floor((image.bitmap.width - 200) / 2));
                    const oy = Math.max(0, Math.floor((image.bitmap.height - 200) / 2));
                    image.composite(sticker, ox, oy, { mode: J.BLEND_SOURCE_OVER, opacitySource: 0.9 });
                    break;
                }

                case 'brightness': {
                    const val = parseFloat(args[1]);
                    if (isNaN(val) || val < -100 || val > 100) return reply('❌ Value must be -100 to 100.');
                    image.brightness(val / 100);
                    break;
                }

                case 'contrast': {
                    const val = parseFloat(args[1]);
                    if (isNaN(val) || val < -100 || val > 100) return reply('❌ Value must be -100 to 100.');
                    image.contrast(val / 100);
                    break;
                }

                case 'grayscale':
                case 'greyscale':
                case 'bw': {
                    image.grayscale();
                    break;
                }

                case 'blur': {
                    const val = parseInt(args[1]);
                    if (isNaN(val) || val < 1 || val > 20) return reply('❌ Blur value must be 1–20.');
                    image.blur(val);
                    break;
                }

                case 'rotate': {
                    const deg = parseFloat(args[1]);
                    if (isNaN(deg)) return reply('❌ Usage: `.photoedit rotate <degrees>`');
                    image.rotate(deg);
                    break;
                }

                case 'flip': {
                    const dir = (args[1] || 'h').toLowerCase();
                    if (!['h','v','horizontal','vertical'].includes(dir)) return reply('❌ Use: `h` (horizontal) or `v` (vertical)');
                    image.flip(dir.startsWith('h'), dir.startsWith('v'));
                    break;
                }

                case 'resize': {
                    if (args.length < 3) return reply('❌ Usage: `.photoedit resize <width> <height>`');
                    const [w, h] = [parseInt(args[1]), parseInt(args[2])];
                    if (isNaN(w) || isNaN(h)) return reply('❌ Width and height must be numbers.');
                    image.resize(w, h);
                    break;
                }

                case 'watermark': {
                    const text = args.slice(1).join(' ').trim() || 'REDXBOT302';
                    try {
                        const font = await J.loadFont(J.FONT_SANS_16_WHITE || J.FONT_SANS_32_WHITE);
                        const tw   = J.measureText(font, text);
                        const th   = J.measureTextHeight(font, text, image.bitmap.width);
                        image.print(
                            font,
                            image.bitmap.width - tw - 10,
                            image.bitmap.height - th - 10,
                            text
                        );
                    } catch {
                        // Draw semi-transparent rectangle at bottom-right as watermark placeholder
                        const x = Math.max(0, image.bitmap.width - 160);
                        const y = Math.max(0, image.bitmap.height - 30);
                        image.scan(x, y, 150, 25, function(px, py, idx) {
                            this.bitmap.data[idx]   = 0;
                            this.bitmap.data[idx+1] = 0;
                            this.bitmap.data[idx+2] = 0;
                            this.bitmap.data[idx+3] = 180;
                        });
                    }
                    break;
                }

                case 'invert':
                case 'negative': {
                    image.invert();
                    break;
                }

                case 'pixelate': {
                    const size = parseInt(args[1]) || 10;
                    if (size < 2 || size > 100) return reply('❌ Pixelate size: 2–100');
                    // Manual pixelate (Jimp has pixelate in older versions)
                    if (typeof image.pixelate === 'function') {
                        image.pixelate(size);
                    } else {
                        const { width, height } = image.bitmap;
                        for (let y = 0; y < height; y += size) {
                            for (let x = 0; x < width; x += size) {
                                const color = image.getPixelColor(x, y);
                                for (let dy = 0; dy < size && y+dy < height; dy++) {
                                    for (let dx = 0; dx < size && x+dx < width; dx++) {
                                        image.setPixelColor(color, x+dx, y+dy);
                                    }
                                }
                            }
                        }
                    }
                    break;
                }

                default:
                    return reply(HELP_TEXT);
            }

            await saveImage(image, outputPath);

            await sock.sendMessage(chatId, {
                image: { url: outputPath },
                caption: `✅ *${command}* applied\n> REDXBOT302 Photo Editor`,
                ...channelInfo
            }, { quoted: message });

        } catch (error) {
            await reply(`❌ Error: ${error.message}`);
        } finally {
            try { if (fs.existsSync(inputPath))  fs.unlinkSync(inputPath);  } catch {}
            try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
        }
    }
};
