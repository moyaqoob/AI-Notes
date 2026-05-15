CREATE OR REPLACE FUNCTION generate_note_id()
RETURNS VARCHAR(20) AS $$
DECLARE
  id VARCHAR(20);
  num INT;
BEGIN
  num := floor(random() * 900000)::int + 100000;
  id := 'NOTE_' || num::text;
  RETURN id;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS notes (
  note_id VARCHAR(20) PRIMARY KEY DEFAULT generate_note_id(),
  user_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL DEFAULT 'Untitled',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  category VARCHAR(100),
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
