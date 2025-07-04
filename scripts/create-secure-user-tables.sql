-- Users table met Travel Compositor koppeling
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  
  -- Authentication
  email_verified BOOLEAN DEFAULT FALSE,
  password_reset_required BOOLEAN DEFAULT TRUE,
  
  -- Import info
  import_source VARCHAR(50) DEFAULT 'manual',
  import_date TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Imported bookings (metadata only)
CREATE TABLE IF NOT EXISTS imported_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Travel Compositor data
  tc_booking_id VARCHAR(100) NOT NULL,
  tc_microsite_id VARCHAR(10) NOT NULL,
  
  -- Booking metadata
  booking_reference VARCHAR(100),
  title VARCHAR(255),
  destination VARCHAR(255),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50),
  total_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Client info (alleen van eigen bookings)
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  
  -- Import info
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Full data (JSON voor flexibiliteit)
  full_data JSONB,
  
  UNIQUE(tc_booking_id, tc_microsite_id)
);

-- Imported travel ideas
CREATE TABLE IF NOT EXISTS imported_travel_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Travel Compositor data
  tc_idea_id VARCHAR(100) NOT NULL,
  tc_microsite_id VARCHAR(10) NOT NULL,
  
  -- Idea metadata
  title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  destination VARCHAR(255),
  departure_date DATE,
  price_per_person DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Import info
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Full data (JSON)
  full_data JSONB,
  
  UNIQUE(tc_idea_id, tc_microsite_id)
);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes voor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tc_id ON users(travel_compositor_id);
CREATE INDEX IF NOT EXISTS idx_users_microsite ON users(microsite_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON imported_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tc_id ON imported_bookings(tc_booking_id, tc_microsite_id);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON imported_travel_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_tc_id ON imported_travel_ideas(tc_idea_id, tc_microsite_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_travel_ideas ENABLE ROW LEVEL SECURITY;

-- Users kunnen alleen hun eigen data zien
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Bookings: users zien alleen hun eigen bookings
CREATE POLICY "Users can view own bookings" ON imported_bookings
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Ideas: users zien alleen hun eigen ideas  
CREATE POLICY "Users can view own ideas" ON imported_travel_ideas
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Admins kunnen alles zien (via service role)
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access bookings" ON imported_bookings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access ideas" ON imported_travel_ideas
  FOR ALL USING (auth.role() = 'service_role');
