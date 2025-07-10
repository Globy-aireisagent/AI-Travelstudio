-- Create agencies table first (no dependencies)
CREATE TABLE IF NOT EXISTS agencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  contact_email TEXT,
  contact_phone TEXT,
  address JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table with UUID agency_id to match agencies.id
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'agent', -- 'admin', 'agent', 'client'
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  microsite_access TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_bookings table (linking users to their bookings)
CREATE TABLE IF NOT EXISTS user_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'owner', -- 'owner', 'collaborator', 'viewer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, booking_id)
);

-- Create indexes for agencies
CREATE INDEX IF NOT EXISTS idx_agencies_code ON agencies(code);
CREATE INDEX IF NOT EXISTS idx_agencies_active ON agencies(active);

-- Create indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_agency_id ON users(agency_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- Create indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Create indexes for user_bookings
CREATE INDEX IF NOT EXISTS idx_user_bookings_user_id ON user_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookings_booking_id ON user_bookings(booking_id);

-- Enable Row Level Security
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for agencies
CREATE POLICY "Authenticated users can read agencies" ON agencies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage agencies" ON agencies
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for users
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for user_sessions
CREATE POLICY "Service role can manage sessions" ON user_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for user_bookings
CREATE POLICY "Users can read their booking relationships" ON user_bookings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage user bookings" ON user_bookings
  FOR ALL USING (auth.role() = 'service_role');
