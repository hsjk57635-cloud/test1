const path = require('path');
const fs = require('fs');
const { File } = require('megajs');

// Helper to check if a string is valid base64
function isBase64(str) {
    // Remove whitespace first
    const clean = str.replace(/\s/g, '');
    // Check length and characters
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(clean) && clean.length % 4 === 0;
}

// Add missing base64 padding if needed
function fixBase64Padding(str) {
    const pad = str.length % 4;
    if (pad) {
        if (pad === 1) return str + '===';
        if (pad === 2) return str + '==';
        if (pad === 3) return str + '=';
    }
    return str;
}

async function SaveCreds(sessionInput) {
    const __dirname = path.dirname(__filename);
    const sessionDir = path.join(__dirname, '..', 'session');
    const credsPath = path.join(sessionDir, 'creds.json');

    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }

    console.log('⬇️ Loading session...');

    // Clean input: remove all whitespace (spaces, newlines, tabs)
    const cleanInput = sessionInput.replace(/\s/g, '');

    // Step 1: Try base64 decoding if it looks like base64
    let dataBuffer = null;
    let decodedVia = null;

    if (isBase64(cleanInput)) {
        console.log('🔤 Input looks like base64, attempting decode...');
        try {
            const fixed = fixBase64Padding(cleanInput);
            dataBuffer = Buffer.from(fixed, 'base64');
            decodedVia = 'base64';
            console.log('✅ Base64 decode successful.');
        } catch (err) {
            console.log('⚠️ Base64 decode failed, will try Mega...');
        }
    }

    // Step 2: If base64 didn't work, try Mega link
    if (!dataBuffer) {
        console.log('🔗 Attempting Mega download...');
        let megaUrl;
        if (cleanInput.startsWith('http')) {
            megaUrl = cleanInput;
        } else {
            // It's a file ID (possibly with #key)
            // Ensure it has a hash; if not, maybe it's just the ID without key?
            if (!cleanInput.includes('#')) {
                console.warn('⚠️ Mega file ID missing hash – this may not work.');
            }
            megaUrl = `https://mega.nz/file/${cleanInput}`;
        }

        try {
            const file = File.fromURL(megaUrl);
            dataBuffer = await new Promise((resolve, reject) => {
                file.download((err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            });
            decodedVia = 'mega';
            console.log('✅ Mega download complete.');
        } catch (err) {
            console.error('❌ Mega download failed:', err.message);
            throw new Error(`Failed to load session: ${err.message}`);
        }
    }

    // Now we have a buffer – try to parse as JSON
    const text = dataBuffer.toString('utf8').trim();
    let creds;
    try {
        creds = JSON.parse(text);
    } catch (e) {
        console.error('❌ Decoded data is not valid JSON:', e.message);
        // Show first 200 chars for debugging
        console.error('Preview:', text.substring(0, 200));
        throw new Error('Session file is not valid JSON.');
    }

    // Validate required fields
    const required = ['noiseKey', 'signedIdentityKey', 'signedPreKey', 'registrationId', 'advSecretKey', 'me'];
    const missing = required.filter(f => !creds[f]);
    if (missing.length > 0) {
        console.error('❌ Session missing required fields:', missing.join(', '));
        throw new Error('Session file is incomplete (missing required keys).');
    }

    if (creds.registered !== true) {
        console.warn('⚠️ Session is not registered. It may not work.');
    }

    // Write to file
    fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
    console.log('✅ Session saved to disk.');
    return creds;
}

module.exports = SaveCreds;
