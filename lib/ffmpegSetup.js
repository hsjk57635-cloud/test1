/**
 * JUNAID-MD↣³⁰² v7.0 ULTRA — Auto FFmpeg Setup
 * Fixes ffmpeg errors across all platforms (Heroku, Railway, Render, local)
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function setupFFmpeg() {
    // 1. Try ffmpeg-static package
    try {
        const ffmpegStatic = require('ffmpeg-static');
        if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
            process.env.FFMPEG_PATH = ffmpegStatic;
            process.env.FFPROBE_PATH = ffmpegStatic.replace('ffmpeg', 'ffprobe');
            try { require('fluent-ffmpeg').setFfmpegPath(ffmpegStatic); } catch {}
            console.log('✅ ffmpeg ready (ffmpeg-static):', ffmpegStatic);
            return true;
        }
    } catch {}

    // 2. Try @ffmpeg-installer/ffmpeg
    try {
        const inst = require('@ffmpeg-installer/ffmpeg');
        if (inst && inst.path && fs.existsSync(inst.path)) {
            process.env.FFMPEG_PATH = inst.path;
            try { require('fluent-ffmpeg').setFfmpegPath(inst.path); } catch {}
            console.log('✅ ffmpeg ready (@ffmpeg-installer):', inst.path);
            return true;
        }
    } catch {}

    // 3. System ffmpeg (Linux/Heroku/Railway)
    try {
        const sysPath = execSync('which ffmpeg 2>/dev/null').toString().trim();
        if (sysPath && fs.existsSync(sysPath)) {
            process.env.FFMPEG_PATH = sysPath;
            try { require('fluent-ffmpeg').setFfmpegPath(sysPath); } catch {}
            console.log('✅ ffmpeg ready (system):', sysPath);
            return true;
        }
    } catch {}

    // 4. Common paths
    const candidates = [
        '/usr/bin/ffmpeg',
        '/usr/local/bin/ffmpeg',
        '/opt/homebrew/bin/ffmpeg',
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            process.env.FFMPEG_PATH = p;
            try { require('fluent-ffmpeg').setFfmpegPath(p); } catch {}
            console.log('✅ ffmpeg ready (path scan):', p);
            return true;
        }
    }

    console.warn('⚠️  ffmpeg NOT found. Media commands may fail.');
    console.warn('    Install: sudo apt-get install ffmpeg   OR   npm install ffmpeg-static');
    return false;
}

module.exports = { setupFFmpeg };
