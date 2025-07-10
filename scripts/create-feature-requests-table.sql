-- Create feature_requests table
CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'enhancement',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  votes INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feature_votes table
CREATE TABLE IF NOT EXISTS feature_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  vote_type TEXT NOT NULL DEFAULT 'up',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feature_id, user_id)
);

-- Create feature_comments table
CREATE TABLE IF NOT EXISTS feature_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_category ON feature_requests(category);
CREATE INDEX IF NOT EXISTS idx_feature_requests_priority ON feature_requests(priority);
CREATE INDEX IF NOT EXISTS idx_feature_requests_votes ON feature_requests(votes DESC);
CREATE INDEX IF NOT EXISTS idx_feature_votes_feature_id ON feature_votes(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_comments_feature_id ON feature_comments(feature_id);

-- Create function to update vote count
CREATE OR REPLACE FUNCTION update_feature_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feature_requests 
    SET votes = votes + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END,
        updated_at = NOW()
    WHERE id = NEW.feature_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feature_requests 
    SET votes = votes - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END,
        updated_at = NOW()
    WHERE id = OLD.feature_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE feature_requests 
    SET votes = votes + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END 
                      - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END,
        updated_at = NOW()
    WHERE id = NEW.feature_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_feature_vote_count ON feature_votes;
CREATE TRIGGER trigger_update_feature_vote_count
  AFTER INSERT OR UPDATE OR DELETE ON feature_votes
  FOR EACH ROW EXECUTE FUNCTION update_feature_vote_count();

-- Insert demo data
INSERT INTO feature_requests (title, description, category, priority, status, votes) VALUES
('AI-Powered Itinerary Generator', 'Automatically generate personalized travel itineraries based on user preferences, budget, and travel dates using AI.', 'feature', 'high', 'in-progress', 15),
('Real-time Flight Price Tracking', 'Monitor flight prices in real-time and send notifications when prices drop for saved routes.', 'feature', 'high', 'open', 12),
('Multi-language Support', 'Add support for multiple languages including Dutch, German, French, and Spanish.', 'enhancement', 'medium', 'open', 8),
('Mobile App Development', 'Develop native mobile applications for iOS and Android platforms.', 'feature', 'high', 'planned', 22),
('Advanced Booking Analytics', 'Provide detailed analytics and insights for travel agents about their bookings and client preferences.', 'feature', 'medium', 'open', 6),
('Integration with More Suppliers', 'Expand supplier network to include more hotels, airlines, and activity providers.', 'enhancement', 'high', 'in-progress', 18),
('Automated Email Marketing', 'Create automated email campaigns for follow-ups, promotions, and travel reminders.', 'feature', 'medium', 'open', 4),
('Voice Assistant Integration', 'Enable voice commands for searching and booking travel through smart speakers.', 'feature', 'low', 'open', 2)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all to read feature requests" ON feature_requests FOR SELECT USING (true);
CREATE POLICY "Allow service role to manage feature requests" ON feature_requests FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow all to read votes" ON feature_votes FOR SELECT USING (true);
CREATE POLICY "Allow service role to manage votes" ON feature_votes FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow all to read comments" ON feature_comments FOR SELECT USING (true);
CREATE POLICY "Allow service role to manage comments" ON feature_comments FOR ALL USING (auth.role() = 'service_role');
