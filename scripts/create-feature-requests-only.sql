-- Create feature requests table (requires users table first)
CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(50) DEFAULT 'feature',
    votes INTEGER DEFAULT 0,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample feature request
INSERT INTO feature_requests (title, description, user_id)
SELECT 
    'Better booking search',
    'Need faster booking search functionality',
    u.id
FROM users u 
WHERE u.email = 'john@rbstravel.com'
ON CONFLICT DO NOTHING;

-- Insert additional feature request
INSERT INTO feature_requests (title, description, user_id)
SELECT 'Better Dashboard', 'Need a more intuitive dashboard', u.id
FROM users u WHERE u.email = 'john@rbstravel.com'
ON CONFLICT DO NOTHING;

-- Show results
SELECT fr.*, u.name as user_name 
FROM feature_requests fr 
LEFT JOIN users u ON fr.user_id = u.id;
