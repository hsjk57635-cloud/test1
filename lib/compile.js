/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@HAMZA-302-Bot                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7dmVQ6rsQt3kJY131f     *
 *  🔗  Telegram : https://t.me/Hamza302bot                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

const LIB_DIR = path.join(process.cwd(), 'lib');
const BIN_DIR = path.join(LIB_DIR, 'bin');

const SOURCES = [
    { src: 'dna.cpp',    bin: 'dna'    },
    { src: 'cipher.cpp', bin: 'cipher' },
    { src: 'rle.cpp',    bin: 'rle'    },
    { src: 'analyze.cpp', bin: 'analyze' },
];

async function compileAll() {
    if (!fs.existsSync(BIN_DIR)) {
        fs.mkdirSync(BIN_DIR, { recursive: true });
    }
    for (const { src, bin } of SOURCES) {
        const srcPath = path.join(LIB_DIR, src);
        const binPath = path.join(BIN_DIR, bin);
        if (!fs.existsSync(srcPath)) {
            console.warn(`[compile] Source not found: ${srcPath}`);
            continue;
        }
        if (fs.existsSync(binPath)) {
            const srcMtime = fs.statSync(srcPath).mtimeMs;
            const binMtime = fs.statSync(binPath).mtimeMs;
            if (binMtime >= srcMtime) {
                console.log(`[compile] ${bin} up to date`);
                continue;
            }
        }
        try {
            console.log(`[compile] Compiling ${src}...`);
            await execAsync(`g++ -O2 -std=c++17 -o "${binPath}" "${srcPath}"`, { timeout: 30000 });
            fs.chmodSync(binPath, 0o755);
            console.log(`[compile] ✓ ${bin} compiled`);
        } catch (err) {
            console.error(`[compile] ✗ Failed to compile ${src}: ${err.stderr || err.message}`);
        }
    }
}

function getBin(name) {
    return path.join(BIN_DIR, name);
}

module.exports = { compileAll, getBin };
