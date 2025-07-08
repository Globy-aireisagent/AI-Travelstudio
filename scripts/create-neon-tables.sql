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
    agency_name VARCHAR(200),
    agency_id VARCHAR(100),
    microsite_id VARCHAR(100),
    email_verified BOOLEAN DEFAULT false,
    password_reset_required BOOLEAN DEFAULT false,
    import_source VARCHAR(100),
    import_date TIMESTAMP,
    last_login TIMESTAMP,
    profile_data JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(100),
    user_id UUID REFERENCES users(id),
    agency_id VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'completed', 'pending')) DEFAULT 'active',
    destination VARCHAR(200),
    microsite_source VARCHAR(100),
    start_date DATE,
    end_date DATE,
    total_price DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    accommodations JSONB DEFAULT '[]',
    activities JSONB DEFAULT '[]',
    transports JSONB DEFAULT '[]',
    vouchers JSONB DEFAULT '[]',
    raw_data JSONB DEFAULT '{}',
    webhook_received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create travel_ideas table
CREATE TABLE IF NOT EXISTS travel_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    destination VARCHAR(200),
    duration_days INTEGER,
    price_from DECIMAL(10,2) DEFAULT 0,
    price_to DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    highlights JSONB DEFAULT '[]',
    included_services JSONB DEFAULT '[]',
    raw_data JSONB DEFAULT '{}',
    webhook_received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    microsite_source VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create feature_requests table
CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id),
    category VARCHAR(20) CHECK (category IN ('enhancement', 'bug', 'feature', 'improvement')) DEFAULT 'feature',
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status VARCHAR(20) CHECK (status IN ('open', 'in_progress', 'completed', 'rejected', 'on_hold')) DEFAULT 'open',
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_destination ON travel_ideas(destination);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_status ON travel_ideas(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_user_id ON feature_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
