-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'client',
    status VARCHAR(20) DEFAULT 'active',
    agency_id UUID REFERENCES agencies(id),
    phone VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feature_requests table
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

-- Create feature_votes table
CREATE TABLE IF NOT EXISTS feature_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_request_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    vote_type VARCHAR(10) DEFAULT 'up',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feature_request_id, user_id)
);

-- Create feature_comments table
CREATE TABLE IF NOT EXISTS feature_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_request_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    agency_id UUID REFERENCES agencies(id),
    destination VARCHAR(255),
    departure_date DATE,
    return_date DATE,
    total_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) DEFAULT 'pending',
    booking_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create travel_ideas table
CREATE TABLE IF NOT EXISTS travel_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    destination VARCHAR(255),
    duration_days INTEGER,
    price_from DECIMAL(10,2),
    price_to DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    category VARCHAR(100),
    agency_id UUID REFERENCES agencies(id),
    status VARCHAR(20) DEFAULT 'active',
    image_url TEXT,
    features JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_agency ON users(agency_id);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_votes_feature ON feature_votes(feature_request_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_agency ON travel_ideas(agency_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);

-- Success message
SELECT 'All tables and indexes created successfully!' as result;
