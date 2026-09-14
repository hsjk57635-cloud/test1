/*****************************************************************************
 *  REDXBOT302 — advanced-vv.js
 *
 *  This file is the entry point that index.js requires as './plugins/advanced-vv'.
 *  It simply re-exports everything from viewonce.js so that:
 *   1. All vv commands (vv, vv2, vvset, vvremove, vvlist) are registered
 *   2. handleAutoVV is accessible as module.exports.handleAutoVV
 *      (which index.js reads to set up the auto-intercept listener)
 *
 *  WHY THIS FILE EXISTS:
 *  index.js requires './plugins/advanced-vv' for the handleAutoVV function.
 *  viewonce.js exports the same commands + handleAutoVV but under a different
 *  filename. This shim bridges the two without duplicating any code.
 *****************************************************************************/

'use strict';

const vvPlugin = require('./viewonce');

// vvPlugin is an array of command objects with handleAutoVV attached to it.
// Re-export exactly as-is so commandHandler + index.js both work correctly.
module.exports = vvPlugin;
module.exports.handleAutoVV = vvPlugin.handleAutoVV;
