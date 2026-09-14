-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This creates the tables needed for REDXBOT302 session persistence

-- Sessions table: stores WhatsApp auth credentials per paired number
CREATE TABLE IF NOT EXISTS bot_sessions (
  session_id TEXT PRIMARY KEY,
  data       TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table: stores bot config (antidelete, autoreplies, etc.)
CREATE TABLE IF NOT EXISTS bot_settings (
  namespace  TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (namespace, key)
);

-- Optional: auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_bot_sessions_updated_at ON bot_sessions;
CREATE TRIGGER update_bot_sessions_updated_at
  BEFORE UPDATE ON bot_sessions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_bot_settings_updated_at ON bot_settings;
CREATE TRIGGER update_bot_settings_updated_at
  BEFORE UPDATE ON bot_settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Disable RLS so the bot can read/write without auth headers
ALTER TABLE bot_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bot_settings DISABLE ROW LEVEL SECURITY;

SELECT 'Tables created successfully ✅' AS status;
