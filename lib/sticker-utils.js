'use strict';
const axios  = require('axios');
const fs     = require('fs');
const path   = require('path');
const { tmpdir } = require('os');
const crypto = require('crypto');

let ffmpeg, ffmpegPath;
try {
  ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  ffmpeg     = require('fluent-ffmpeg');
  ffmpeg.setFfmpegPath(ffmpegPath);
} catch { ffmpegPath = 'ffmpeg'; }

async function fetchImage(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
  return response.data;
}

async function fetchGif(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
  return response.data;
}

async function gifToSticker(gifBuffer) {
  const outputPath = path.join(tmpdir(), crypto.randomBytes(6).toString('hex') + '.webp');
  const inputPath  = path.join(tmpdir(), crypto.randomBytes(6).toString('hex') + '.gif');
  fs.writeFileSync(inputPath, gifBuffer);
  if (!ffmpeg) throw new Error('fluent-ffmpeg not available');
  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .on('error', reject)
      .on('end', resolve)
      .addOutputOptions(['-vcodec','libwebp','-vf',"scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split [a][b];[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];[b][p] paletteuse",'-loop','0','-preset','default','-an','-vsync','0'])
      .toFormat('webp')
      .save(outputPath);
  });
  const webpBuffer = fs.readFileSync(outputPath);
  try { fs.unlinkSync(outputPath); fs.unlinkSync(inputPath); } catch {}
  return webpBuffer;
}

module.exports = { fetchImage, fetchGif, gifToSticker };
