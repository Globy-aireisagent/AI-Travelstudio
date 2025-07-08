-- Step 2: Create feature request tables
CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    user_id UUID REFERENCES users(id),
    votes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_request_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    vote_type VARCHAR(10) DEFAULT 'up',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feature_request_id, user_id)
);

CREATE TABLE IF NOT EXISTS feature_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_request_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Step 2 completed: feature tables created!' as result;
