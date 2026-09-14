/*****************************************************************************
 *  plugins/antibot.js — thin loader
 *  The full ULTRA v3 engine (scoring, sensitivity, known-bot registry,
 *  whitelist, warn/kick/delete/mute) lives in lib/antibot.js.
 *  Re-exporting keeps the plugin loader and messageHandler wiring working
 *  with a single source of truth.
 *****************************************************************************/

'use strict';
module.exports = require('../lib/antibot');
