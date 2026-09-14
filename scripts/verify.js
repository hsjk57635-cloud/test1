'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const plugins = path.join(root, 'plugins');
const files = fs.readdirSync(plugins).filter(f => f.endsWith('.js')).sort();
let failures = [];
for (const f of files) {
  try { execFileSync(process.execPath, ['--check', path.join(plugins, f)], { stdio: 'ignore' }); }
  catch { failures.push(f); }
}
const sounds = path.join(root, 'data', 'me_sounds_ogg');
const missing = [];
for (let i=1;i<=20;i++) if (!fs.existsSync(path.join(sounds, `me-${i}.ogg`))) missing.push(i);
const pkg = require(path.join(root, 'package.json'));
console.log(`Plugin syntax: ${files.length - failures.length}/${files.length} OK`);
console.log(`.me voice files: ${20 - missing.length}/20 present`);
console.log(`Baileys: ${pkg.dependencies?.['@whiskeysockets/baileys'] || 'missing'}`);
if (failures.length || missing.length) {
  if (failures.length) console.error('Syntax failures:', failures.join(', '));
  if (missing.length) console.error('Missing .me files:', missing.join(', '));
  process.exit(1);
}
console.log('Verification passed.');
