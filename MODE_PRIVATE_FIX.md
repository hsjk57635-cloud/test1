# Mode Private Fix

Fixed `.mode private` so the selected mode is persisted through the central store and deploy metadata, and the runtime mode cache is refreshed immediately.

Added helper aliases:
- `.modeprivate`
- `.private-mode`

Private mode means owner + sudo only. Use `.mode public` to return to public mode.
