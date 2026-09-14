# 🔧 JUNAID-MD↣³⁰² — Bug Fixes & Permission System Overhaul

## Summary of Changes

### 🔐 Permission System (Complete Overhaul)

**File: `lib/isOwner.js`** (rewritten)
- Added proper 4-tier permission system:
  - **Real Owner** → OWNER_NUMBER in .env
  - **Co-Owner** → CO_OWNER_NUM in .env  
  - **Sudo User** → added via `.sudo add` (stored in userGroupData.json)
  - **Paired User** → anyone who pairs their WhatsApp = gets co-owner level
- `fromMe=true` from any paired session = full owner-level command access
- `isOwnerOnly()` still restricts strictOwnerOnly commands to real owner + co-owner only

**File: `index.js`** (handleMessage fixed)
- Paired users (any session with `fromMe=true`) now get full owner command access
- Added `isRealOwner` variable for `strictOwnerOnly` commands
- Plugin dispatch now checks `plugin.strictOwnerOnly` separately from `plugin.ownerOnly`
- Plugin context now includes `isRealOwner` and `sessionId`

**File: `lib/messageHandler.js`** (rentbot path fixed)
- Fixed `isOwnerOrSudo()` call to pass `fromMe` and `sessionId`
- Fixed `strictOwnerOnly` check to use `isOwnerOnly()` not raw `fromMe`
- Fixed `ownerOnly` check to not double-require `fromMe`
- Added `isRealOwner` and `sessionId` to command context

---

### 👁️ .vv / viewonce Command Fixed

**File: `plugins/viewonce.js`**
- Fixed duplicate `const contextInfo` declaration (was causing SyntaxError crash)
- `isOwner()` now reads `context.senderIsOwnerOrSudo` passed from messageHandler
- `loadSudoList()` now reads from `userGroupData.json` (same file as lib/index.js uses)
- View-once media correctly sent to owner's real DM (uses OWNER_NUMBER from settings)

---

### 🗑️ .antidelete Command Fixed

**File: `plugins/antidelete.js`**
- Changed `ownerOnly: false` → `ownerOnly: true` (any user could toggle it before!)
- Deleted messages now use real OWNER_NUMBER from settings (not just session number)
- View-once auto-intercept uses real owner JID for delivery
- Bot self-deletion check fixed to compare clean numbers properly

---

### ⌨️ .autotyping & Other ownerOnly Commands Fixed

- All `ownerOnly: true` commands now work for paired users (any connected session)
- Fixed via messageHandler's new `isOwnerOrSudo()` that respects `fromMe` + `sessionId`

---

### 📁 New Files
- `data/sudo.json` — fallback sudo list (primary is still userGroupData.json)
- `data/vv_triggers.json` — persistent viewonce auto-intercept triggers

---

## How Permissions Work Now

| User Type | ownerOnly | strictOwnerOnly | Regular Commands |
|-----------|-----------|-----------------|-----------------|
| Real Owner (OWNER_NUMBER) | ✅ | ✅ | ✅ |
| Co-Owner (CO_OWNER_NUM) | ✅ | ✅ | ✅ |
| Paired User (any session) | ✅ | ❌ | ✅ |
| Sudo User (.sudo add) | ✅ | ❌ | ✅ |
| Regular User | ❌ | ❌ | ✅ (public mode) |

## Linked Device (Bot's own account in a group)
- When bot is in a group and a message comes from the bot's linked device (@lid)
- System resolves the real number and checks permissions correctly
- Paired session's linked device messages treated as co-owner

