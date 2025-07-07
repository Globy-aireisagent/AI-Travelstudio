-- Fix feature_requests table - add missing votes column if it doesn't exist
DO $$ 
BEGIN
    -- First check if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_requests') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'votes') THEN
            ALTER TABLE feature_requests ADD COLUMN votes INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'user_id') THEN
            ALTER TABLE feature_requests ADD COLUMN user_id TEXT NOT NULL DEFAULT 'system';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'category') THEN
            ALTER TABLE feature_requests ADD COLUMN category TEXT NOT NULL DEFAULT 'enhancement';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'priority') THEN
            ALTER TABLE feature_requests ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'status') THEN
            ALTER TABLE feature_requests ADD COLUMN status TEXT NOT NULL DEFAULT 'open';
        END IF;
    END IF;
END $$;

-- Fix bookings table - add missing columns if they don't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'webhook_received_at') THEN
            ALTER TABLE bookings ADD COLUMN webhook_received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'destination') THEN
            ALTER TABLE bookings ADD COLUMN destination TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'microsite_source') THEN
            ALTER TABLE bookings ADD COLUMN microsite_source TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'raw_data') THEN
            ALTER TABLE bookings ADD COLUMN raw_data JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'accommodations') THEN
            ALTER TABLE bookings ADD COLUMN accommodations JSONB DEFAULT '[]';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'activities') THEN
            ALTER TABLE bookings ADD COLUMN activities JSONB DEFAULT '[]';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'transports') THEN
            ALTER TABLE bookings ADD COLUMN transports JSONB DEFAULT '[]';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'vouchers') THEN
            ALTER TABLE bookings ADD COLUMN vouchers JSONB DEFAULT '[]';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_reference') THEN
            ALTER TABLE bookings ADD COLUMN booking_reference TEXT UNIQUE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'user_id') THEN
            ALTER TABLE bookings ADD COLUMN user_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'agency_id') THEN
            ALTER TABLE bookings ADD COLUMN agency_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'status') THEN
            ALTER TABLE bookings ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'start_date') THEN
            ALTER TABLE bookings ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'end_date') THEN
            ALTER TABLE bookings ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'total_price') THEN
            ALTER TABLE bookings ADD COLUMN total_price DECIMAL(10,2) DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'currency') THEN
            ALTER TABLE bookings ADD COLUMN currency TEXT DEFAULT 'EUR';
        END IF;
    END IF;
END $$;

-- Fix travel_ideas table - add missing columns if they don't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'travel_ideas') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_ideas' AND column_name = 'webhook_received_at') THEN
            ALTER TABLE travel_ideas ADD COLUMN webhook_received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_ideas' AND column_name = 'destination') THEN
            ALTER TABLE travel_ideas ADD COLUMN destination TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_ideas' AND column_name = 'microsite_source') THEN
            ALTER TABLE travel_ideas ADD COLUMN microsite_source TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_ideas' AND column_name = 'title') THEN
            ALTER TABLE travel_ideas ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_ideas' AND column_name = 'description') THEN
            ALTER TABLE travel_ideas ADD COLUMN description TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_ideas' AND column_name = 'idea_data') THEN
            ALTER TABLE travel_ideas ADD COLUMN idea_data JSONB DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_ideas' AND column_name = 'images') THEN
            ALTER TABLE travel_ideas ADD COLUMN images JSONB DEFAULT '[]';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_ideas' AND column_name = 'tags') THEN
            ALTER TABLE travel_ideas ADD COLUMN tags TEXT[] DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_ideas' AND column_name = 'active') THEN
            ALTER TABLE travel_ideas ADD COLUMN active BOOLEAN DEFAULT TRUE;
        END IF;
    END IF;
END $$;

-- Fix users table agency_id type mismatch
DO $$ 
BEGIN
    -- Check if users table exists and agency_id column exists and is of type text
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'agency_id' 
            AND data_type = 'text'
        ) THEN
            -- Drop the foreign key constraint if it exists
            ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_agency;
            
            -- Change the column type to UUID (only if data is UUID-compatible)
            -- First, let's make it nullable if it isn't
            ALTER TABLE users ALTER COLUMN agency_id DROP NOT NULL;
            
            -- Try to convert to UUID, set to NULL if conversion fails
            UPDATE users SET agency_id = NULL WHERE agency_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
            
            -- Now change the column type
            ALTER TABLE users ALTER COLUMN agency_id TYPE UUID USING 
                CASE 
                    WHEN agency_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                    THEN agency_id::UUID 
                    ELSE NULL 
                END;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'agency_id') THEN
            ALTER TABLE users ADD COLUMN agency_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
            ALTER TABLE users ADD COLUMN email TEXT UNIQUE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
            ALTER TABLE users ADD COLUMN name TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
            ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'authenticated';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_data') THEN
            ALTER TABLE users ADD COLUMN profile_data JSONB DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'active') THEN
            ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT TRUE;
        END IF;
    END IF;
END $$;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_feature_requests_votes ON feature_requests(votes DESC);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_category ON feature_requests(category);
CREATE INDEX IF NOT EXISTS idx_bookings_webhook_received_at ON bookings(webhook_received_at);
CREATE INDEX IF NOT EXISTS idx_bookings_destination ON bookings(destination);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_webhook_received_at ON travel_ideas(webhook_received_at);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_destination ON travel_ideas(destination);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_active ON travel_ideas(active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_agency_id ON users(agency_id);
