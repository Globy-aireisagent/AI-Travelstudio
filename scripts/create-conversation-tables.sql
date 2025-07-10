-- Conversation logs table
CREATE TABLE IF NOT EXISTS conversation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  globy_response TEXT NOT NULL,
  response_time_ms INTEGER,
  cached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Response cache table
CREATE TABLE IF NOT EXISTS response_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT NOT NULL,
  question_hash TEXT NOT NULL,
  cached_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(booking_id, question_hash)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_logs_booking_id ON conversation_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_created_at ON conversation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_response_cache_booking_question ON response_cache(booking_id, question_hash);
CREATE INDEX IF NOT EXISTS idx_response_cache_expires ON response_cache(expires_at);

-- Clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM response_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
