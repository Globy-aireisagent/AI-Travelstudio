-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(200),
    role VARCHAR(20) DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'client', 'super_admin')),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_verification', 'suspended')),
    travel_compositor_id VARCHAR(100),
    agency_name VARCHAR(200),
    agency_id VARCHAR(100),
    microsite_id VARCHAR(50),
    email_verified BOOLEAN DEFAULT false,
    password_reset_required BOOLEAN DEFAULT false,
    import_source VARCHAR(50),
    import_date TIMESTAMP,
    last_login TIMESTAMP,
    profile_data JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(100),
    user_id UUID REFERENCES users(id),
    agency_id UUID REFERENCES agencies(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'cancelled', 'completed', 'pending')),
    destination VARCHAR(200),
    microsite_source VARCHAR(50),
    start_date DATE,
    end_date DATE,
    total_price DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    accommodations JSONB DEFAULT '[]',
    activities JSONB DEFAULT '[]',
    transports JSONB DEFAULT '[]',
    vouchers JSONB DEFAULT '[]',
    raw_data JSONB DEFAULT '{}',
    webhook_received_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create travel_ideas table
CREATE TABLE IF NOT EXISTS travel_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    destination VARCHAR(200),
    duration_days INTEGER,
    price_from DECIMAL(10,2) DEFAULT 0,
    price_to DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    category VARCHAR(50),
    tags JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    highlights JSONB DEFAULT '[]',
    included_services JSONB DEFAULT '[]',
    raw_data JSONB DEFAULT '{}',
    webhook_received_at TIMESTAMP DEFAULT NOW(),
    microsite_source VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create feature_requests table
CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id),
    category VARCHAR(20) DEFAULT 'feature' CHECK (category IN ('enhancement', 'bug', 'feature', 'improvement')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'rejected', 'on_hold')),
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create feature_votes table
CREATE TABLE IF NOT EXISTS feature_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(feature_id, user_id)
);

-- Create feature_comments table
CREATE TABLE IF NOT EXISTS feature_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(100) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_microsite_id ON users(microsite_id);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);

CREATE INDEX IF NOT EXISTS idx_travel_ideas_status ON travel_ideas(status);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_destination ON travel_ideas(destination);

CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_user_id ON feature_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);
