-- Create feature_requests table with all constraints
CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('feature', 'enhancement', 'bug', 'improvement')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'in_progress', 'completed', 'rejected', 'on_hold')),
    votes INTEGER NOT NULL DEFAULT 0,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    created_by VARCHAR(255),
    user_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feature_votes table
CREATE TABLE IF NOT EXISTS feature_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_id UUID NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feature_id, user_id)
);

-- Create feature_comments table
CREATE TABLE IF NOT EXISTS feature_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_id UUID NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_category ON feature_requests(category);
CREATE INDEX IF NOT EXISTS idx_feature_requests_priority ON feature_requests(priority);
CREATE INDEX IF NOT EXISTS idx_feature_requests_created_at ON feature_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_feature_votes_feature_id ON feature_votes(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_votes_user_id ON feature_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_comments_feature_id ON feature_comments(feature_id);

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_feature_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the feature_requests table with new vote counts
    UPDATE feature_requests 
    SET 
        upvotes = (
            SELECT COUNT(*) 
            FROM feature_votes 
            WHERE feature_id = COALESCE(NEW.feature_id, OLD.feature_id) 
            AND vote_type = 'up'
        ),
        downvotes = (
            SELECT COUNT(*) 
            FROM feature_votes 
            WHERE feature_id = COALESCE(NEW.feature_id, OLD.feature_id) 
            AND vote_type = 'down'
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.feature_id, OLD.feature_id);
    
    -- Update net votes
    UPDATE feature_requests 
    SET votes = upvotes - downvotes
    WHERE id = COALESCE(NEW.feature_id, OLD.feature_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update vote counts
DROP TRIGGER IF EXISTS trigger_update_vote_counts_insert ON feature_votes;
DROP TRIGGER IF EXISTS trigger_update_vote_counts_update ON feature_votes;
DROP TRIGGER IF EXISTS trigger_update_vote_counts_delete ON feature_votes;

CREATE TRIGGER trigger_update_vote_counts_insert
    AFTER INSERT ON feature_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_vote_counts();

CREATE TRIGGER trigger_update_vote_counts_update
    AFTER UPDATE ON feature_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_vote_counts();

CREATE TRIGGER trigger_update_vote_counts_delete
    AFTER DELETE ON feature_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_vote_counts();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_feature_requests_updated_at ON feature_requests;
CREATE TRIGGER trigger_update_feature_requests_updated_at
    BEFORE UPDATE ON feature_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on feature_requests" ON feature_requests
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on feature_votes" ON feature_votes
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on feature_comments" ON feature_comments
    FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update
CREATE POLICY "Allow authenticated users to insert feature_requests" ON feature_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update feature_requests" ON feature_requests
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users to delete feature_requests" ON feature_requests
    FOR DELETE USING (true);

CREATE POLICY "Allow authenticated users to insert feature_votes" ON feature_votes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update feature_votes" ON feature_votes
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users to delete feature_votes" ON feature_votes
    FOR DELETE USING (true);

CREATE POLICY "Allow authenticated users to insert feature_comments" ON feature_comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update feature_comments" ON feature_comments
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users to delete feature_comments" ON feature_comments
    FOR DELETE USING (true);
