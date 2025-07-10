-- Feature requests table
CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(50) DEFAULT 'pipeline' CHECK (status IN ('pipeline', 'in-development', 'completed', 'rejected')),
  
  -- Submitter info
  submitted_by_email VARCHAR(255),
  submitted_by_name VARCHAR(255),
  
  -- Voting
  vote_count INTEGER DEFAULT 0,
  
  -- Development info
  eta VARCHAR(100),
  assigned_to VARCHAR(255),
  development_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Votes table (to track who voted for what)
CREATE TABLE IF NOT EXISTS feature_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_request_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
  voter_email VARCHAR(255) NOT NULL,
  voter_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate votes
  UNIQUE(feature_request_id, voter_email)
);

-- Comments table for feature requests
CREATE TABLE IF NOT EXISTS feature_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_request_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
  commenter_email VARCHAR(255) NOT NULL,
  commenter_name VARCHAR(255),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_priority ON feature_requests(priority);
CREATE INDEX IF NOT EXISTS idx_feature_requests_created ON feature_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_feature_votes_feature ON feature_votes(feature_request_id);
CREATE INDEX IF NOT EXISTS idx_feature_votes_email ON feature_votes(voter_email);

-- Function to update vote count
CREATE OR REPLACE FUNCTION update_feature_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feature_requests 
    SET vote_count = vote_count + 1 
    WHERE id = NEW.feature_request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feature_requests 
    SET vote_count = vote_count - 1 
    WHERE id = OLD.feature_request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update vote count
CREATE TRIGGER feature_vote_count_trigger
  AFTER INSERT OR DELETE ON feature_votes
  FOR EACH ROW EXECUTE FUNCTION update_feature_vote_count();

-- Insert some initial feature requests
INSERT INTO feature_requests (title, description, category, priority, status, eta, vote_count) VALUES
('AI Video Generator', 'Automatisch reisvideos genereren uit foto''s en tekst', 'ai-tools', 'high', 'in-development', 'Q2 2025', 47),
('Multi-language Support', 'Volledige ondersteuning voor 15+ talen', 'platform', 'medium', 'completed', 'Completed', 32),
('Mobile App', 'Native iOS en Android app voor agents', 'platform', 'high', 'pipeline', 'Q3 2025', 89),
('Advanced Analytics', 'Uitgebreide rapportage en business intelligence', 'analytics', 'medium', 'in-development', 'Q2 2025', 23),
('API Marketplace', 'Marketplace voor third-party integraties', 'platform', 'low', 'pipeline', 'Q4 2025', 15),
('Voice Assistant Integration', 'Spraakgestuurde AI assistent voor hands-free gebruik', 'ai-tools', 'medium', 'pipeline', 'Q3 2025', 34),
('Real-time Collaboration', 'Samen werken aan projecten met collega''s', 'collaboration', 'high', 'pipeline', 'Q2 2025', 56),
('Custom Branding', 'Volledig white-label oplossing met eigen branding', 'platform', 'medium', 'in-development', 'Q2 2025', 28);
