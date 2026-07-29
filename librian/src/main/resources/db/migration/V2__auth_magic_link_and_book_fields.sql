-- Auth: password + email verification; drop Google
ALTER TABLE users DROP COLUMN IF EXISTS google_id;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE magic_link_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_magic_link_tokens_user_id ON magic_link_tokens(user_id);
CREATE INDEX idx_magic_link_tokens_expires_at ON magic_link_tokens(expires_at);

-- Book fields the frontend already collects/displays
ALTER TABLE books ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE books ADD COLUMN IF NOT EXISTS pages INTEGER;
ALTER TABLE books ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS genre VARCHAR(120);
ALTER TABLE books ADD COLUMN IF NOT EXISTS language VARCHAR(80);
ALTER TABLE books ADD COLUMN IF NOT EXISTS read_date DATE;
