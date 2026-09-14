/*****************************************************************************
 *                     Developed By Abdul JUNAID-MD↣³⁰²                     *
 *  🌐  GitHub   : https://github.com/AbdulRehman19721986/redxbot302          *
 *    © 2026 JUNAID-MD↣³⁰² All rights reserved.                      *
 *****************************************************************************/

require('dotenv').config();

// Session pairing config (NO session_id — pair-only bot)
global.SESSION_ID     = '';
global.PAIRING_NUMBER = process.env.PAIRING_NUMBER || process.env.OWNER_NUMBER || '923252352321';

// Newsletter JID
global.NEWSLETTER_JID = process.env.NEWSLETTER_JID || '120363408055942569@newsletter';

// External APIs used by plugins
global.APIs = {
  xteam:    'https://api.xteam.xyz',
  dzx:      'https://api.dhamzxploit.my.id',
  lol:      'https://api.lolhuman.xyz',
  violetics:'https://violetics.pw',
  neoxr:    'https://api.neoxr.my.id',
  zenzapis: 'https://zenzapis.xyz',
  akuari:   'https://api.akuari.my.id',
  akuari2:  'https://apimu.my.id',
  nrtm:     'https://fg-nrtm.ddns.net',
  bg:       'http://bochil.ddns.net',
  fgmods:   'https://api-fgmods.ddns.net'
};

global.APIKeys = {
  'https://api.xteam.xyz':       'd90a9e986e18778b',
  'https://api.lolhuman.xyz':    '85faf717d0545d14074659ad',
  'https://api.neoxr.my.id':     'yourkey',
  'https://violetics.pw':        'beta',
  'https://zenzapis.xyz':        'yourkey',
  'https://api-fgmods.ddns.net': 'fg-dylux'
};

module.exports = {
  WARN_COUNT:     3,
  NEWSLETTER_JID: global.NEWSLETTER_JID,
  PAIRING_NUMBER: global.PAIRING_NUMBER,
  APIs:           global.APIs,
  APIKeys:        global.APIKeys
};
