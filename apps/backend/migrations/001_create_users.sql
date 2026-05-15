CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS VARCHAR(20) AS $$
DECLARE
  id VARCHAR(20);
  num INT;
BEGIN
  num := floor(random() * 900000)::int + 100000;
  id := 'USR_' || num::text;
  RETURN id;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(20) PRIMARY KEY DEFAULT generate_user_id(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
