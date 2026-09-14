/*****************************************************************************
 *                                                                           *
 *                     Developed By JUNAID-MD↣³⁰²                     *
 *                     & Muzamil Khan                                        *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *  ▶️  YouTube  : https://youtube.com/@rootmindtech                         *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029VbCPnYf96H4SNehkev10     *
 *  🔗  Telegram : https://t.me/TeamRedxhacker2                              *
 *                                                                           *
 *    © 2026 JUNAID-MD↣³⁰². All rights reserved.                      *
 *                                                                           *
 *****************************************************************************/

const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const ASSETS_DIR = path.join(process.cwd(), 'assets');
const TEMP_DIR = path.join(process.cwd(), 'temp');
const SESSION_DIR = path.join(process.cwd(), 'session');

const dataFile = (filename) => path.join(DATA_DIR, filename);

module.exports = {
    DATA_DIR,
    ASSETS_DIR,
    TEMP_DIR,
    SESSION_DIR,
    dataFile
};
