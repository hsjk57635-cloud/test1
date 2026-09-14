/*****************************************************************************
 *  cleanup.js — Run manually: node cleanup.js
 *****************************************************************************/
const fs = require('fs');
const path = require('path');

const DIRS = [
    { dir: path.join(process.cwd(), 'temp'), maxAgeHours: 0 },       // delete ALL
    { dir: path.join(process.cwd(), 'tmp'), maxAgeHours: 0 },        // delete ALL
    { dir: path.join(process.cwd(), 'data/anticall_media'), maxAgeHours: 24 },
];

function clean(folder, maxAgeMs) {
    if (!fs.existsSync(folder)) return 0;
    let n = 0;
    for (const f of fs.readdirSync(folder)) {
        const fp = path.join(folder, f);
        try {
            const stat = fs.statSync(fp);
            if (stat.isFile() && (maxAgeMs === 0 || Date.now() - stat.mtimeMs > maxAgeMs)) {
                fs.unlinkSync(fp); n++;
            }
        } catch {}
    }
    return n;
}

console.log('🧹 Cleaning...');
let total = 0;
for (const { dir, maxAgeHours } of DIRS) {
    const n = clean(dir, maxAgeHours * 60 * 60 * 1000);
    if (n > 0) console.log(`  ✅ ${n} files from ${path.basename(dir)}`);
    total += n;
}
console.log(`✅ Done. Total deleted: ${total}`);
process.exit(0);
