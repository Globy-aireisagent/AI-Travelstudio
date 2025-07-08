-- Step 3: Create booking and travel tables
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

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Step 3 completed: booking and travel tables created!' as result;
