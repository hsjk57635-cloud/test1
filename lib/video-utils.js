'use strict';
const { exec } = require('child_process');
const fs   = require('fs');
const os   = require('os');
const path = require('path');

// Use @ffmpeg-installer path as fallback if system ffmpeg not found
let ffmpegPath = 'ffmpeg';
try {
  ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
} catch { /* system ffmpeg */ }

function videoToWebp(buffer) {
  return new Promise((resolve, reject) => {
    const inputPath  = path.join(os.tmpdir(), `rvid_${Date.now()}.mp4`);
    const outputPath = path.join(os.tmpdir(), `rvid_${Date.now()}.webp`);
    fs.writeFileSync(inputPath, buffer);
    exec(`"${ffmpegPath}" -i "${inputPath}" -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -ss 00:00:00 -t 00:00:05 -preset default -an -vsync 0 -y "${outputPath}"`, (err) => {
      try { fs.unlinkSync(inputPath); } catch {}
      if (err) return reject(err);
      const webpBuffer = fs.readFileSync(outputPath);
      try { fs.unlinkSync(outputPath); } catch {}
      resolve(webpBuffer);
    });
  });
}

function imageToWebp(buffer) {
  return new Promise((resolve, reject) => {
    const inputPath  = path.join(os.tmpdir(), `rimg_${Date.now()}.png`);
    const outputPath = path.join(os.tmpdir(), `rimg_${Date.now()}.webp`);
    fs.writeFileSync(inputPath, buffer);
    exec(`"${ffmpegPath}" -i "${inputPath}" -vcodec libwebp -lossless 1 -qscale 75 -y "${outputPath}"`, (err) => {
      try { fs.unlinkSync(inputPath); } catch {}
      if (err) return reject(err);
      const webpBuffer = fs.readFileSync(outputPath);
      try { fs.unlinkSync(outputPath); } catch {}
      resolve(webpBuffer);
    });
  });
}

module.exports = { videoToWebp, imageToWebp };
