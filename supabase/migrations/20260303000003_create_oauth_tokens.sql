-- Create oauth_tokens table for storing integration credentials
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'nate', -- For now, single-user app
  integration TEXT NOT NULL CHECK (integration IN ('google', 'slack')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scope TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one token per user per integration
  UNIQUE(user_id, integration)
);

-- Index for fast lookups
CREATE INDEX idx_oauth_tokens_user_integration ON oauth_tokens(user_id, integration);

-- RLS policies (for future multi-user support)
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage tokens
CREATE POLICY "Service role can manage all tokens"
  ON oauth_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_oauth_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER oauth_tokens_updated_at
  BEFORE UPDATE ON oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_oauth_tokens_updated_at();

-- Function to check if integration is connected
CREATE OR REPLACE FUNCTION is_integration_connected(p_user_id TEXT, p_integration TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM oauth_tokens
    WHERE user_id = p_user_id
    AND integration = p_integration
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql;
