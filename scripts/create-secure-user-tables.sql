-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'agent' CHECK (role IN ('agent', 'admin', 'super_admin')),
  status VARCHAR(50) DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'active', 'inactive', 'suspended')),
  
  -- Travel Compositor koppeling
  travel_compositor_id VARCHAR(100),
  agency_name VARCHAR(255),
  agency_id VARCHAR(100),
  microsite_id VARCHAR(10),
  
  -- Security
  email_verified BOOLEAN DEFAULT FALSE,
  password_reset_required BOOLEAN DEFAULT TRUE,
  
  -- Import tracking
  import_source VARCHAR(50) DEFAULT 'travel_compositor',
  import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Travel Compositor data
  tc_booking_id VARCHAR(100) NOT NULL,
  booking_reference VARCHAR(100),
  microsite_id VARCHAR(10),
  
  -- Booking details
  title VARCHAR(500),
  destination VARCHAR(255),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'confirmed',
  
  -- Client info (encrypted/hashed for privacy)
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  
  -- Financial
  total_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- JSON data for complex structures
  accommodations JSONB DEFAULT '[]',
  activities JSONB DEFAULT '[]',
  transports JSONB DEFAULT '[]',
  vouchers JSONB DEFAULT '[]',
  
  -- Import tracking
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  original_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tc_booking_id, microsite_id)
);

-- Travel Ideas table
CREATE TABLE IF NOT EXISTS travel_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Travel Compositor data
  tc_idea_id VARCHAR(100) NOT NULL,
  microsite_id VARCHAR(10),
  
  -- Idea details
  title VARCHAR(500),
  description TEXT,
  image_url VARCHAR(1000),
  creation_date DATE,
  departure_date DATE,
  
  -- Pricing
  price_per_person JSONB DEFAULT '{"amount": 0, "currency": "EUR"}',
  total_price JSONB DEFAULT '{"amount": 0, "currency": "EUR"}',
  
  -- JSON data
  themes JSONB DEFAULT '[]',
  destinations JSONB DEFAULT '[]',
  customer JSONB DEFAULT '{}',
  counters JSONB DEFAULT '{}',
  
  -- Import tracking
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  original_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tc_idea_id, microsite_id)
);

-- Email verification tokens (voor later)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens (voor later)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes voor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tc_id ON users(travel_compositor_id);
CREATE INDEX IF NOT EXISTS idx_users_microsite ON users(microsite_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tc_id ON bookings(tc_booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_microsite ON bookings(microsite_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON travel_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_tc_id ON travel_ideas(tc_idea_id);
CREATE INDEX IF NOT EXISTS idx_ideas_microsite ON travel_ideas(microsite_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_ideas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users kunnen alleen hun eigen data zien
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Admins kunnen alles zien van hun microsite
CREATE POLICY "Admins can view microsite data" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id::text = auth.uid()::text 
      AND admin_user.role IN ('admin', 'super_admin')
      AND (admin_user.role = 'super_admin' OR admin_user.microsite_id = users.microsite_id)
    )
  );

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (
    user_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id::text = auth.uid()::text 
      AND admin_user.role IN ('admin', 'super_admin')
      AND (admin_user.role = 'super_admin' OR admin_user.microsite_id = bookings.microsite_id)
    )
  );

-- Travel Ideas policies
CREATE POLICY "Users can view own ideas" ON travel_ideas
  FOR SELECT USING (
    user_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users admin_user 
      WHERE admin_user.id::text = auth.uid()::text 
      AND admin_user.role IN ('admin', 'super_admin')
      AND (admin_user.role = 'super_admin' OR admin_user.microsite_id = travel_ideas.microsite_id)
    )
  );

-- Functions voor updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers voor updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_ideas_updated_at BEFORE UPDATE ON travel_ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
