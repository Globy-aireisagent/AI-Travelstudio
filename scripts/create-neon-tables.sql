-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address JSONB,
    settings JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(200),
    role VARCHAR(20) CHECK (role IN ('admin', 'agent', 'client', 'super_admin')) DEFAULT 'client',
    status VARCHAR(30) CHECK (status IN ('active', 'inactive', 'pending_verification', 'suspended')) DEFAULT 'active',
    travel_compositor_id VARCHAR(100),
    agency_name VARCHAR(255),
    agency_id UUID REFERENCES agencies(id),
    microsite_id VARCHAR(100),
    email_verified BOOLEAN DEFAULT false,
    password_reset_required BOOLEAN DEFAULT false,
    import_source VARCHAR(100),
    import_date TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    profile_data JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feature_requests table
CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    user_id VARCHAR(100) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('ai', 'mobile', 'feature', 'ui', 'analytics', 'technical', 'integration', 'general', 'enhancement', 'bug', 'improvement')) DEFAULT 'feature',
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status VARCHAR(30) CHECK (status IN ('open', 'in_progress', 'completed', 'rejected', 'on_hold', 'planned')) DEFAULT 'open',
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feature_votes table
CREATE TABLE IF NOT EXISTS feature_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feature_id, user_id)
);

-- Create feature_comments table
CREATE TABLE IF NOT EXISTS feature_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(200),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(100),
    user_id UUID REFERENCES users(id),
    agency_id UUID REFERENCES agencies(id),
    status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'completed', 'pending')) DEFAULT 'pending',
    destination VARCHAR(255),
    microsite_source VARCHAR(100),
    start_date DATE,
    end_date DATE,
    total_price DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    accommodations JSONB,
    activities JSONB,
    transports JSONB,
    vouchers JSONB,
    raw_data JSONB,
    webhook_received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create travel_ideas table
CREATE TABLE IF NOT EXISTS travel_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    destination VARCHAR(255),
    duration_days INTEGER,
    price_from DECIMAL(10,2) DEFAULT 0,
    price_to DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    category VARCHAR(100),
    tags JSONB,
    images JSONB,
    highlights JSONB,
    included_services JSONB,
    raw_data JSONB,
    webhook_received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    microsite_source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_agency_id ON users(agency_id);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_category ON feature_requests(category);
CREATE INDEX IF NOT EXISTS idx_feature_votes_feature_id ON feature_votes(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_comments_feature_id ON feature_comments(feature_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_agency_id ON bookings(agency_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_status ON travel_ideas(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
