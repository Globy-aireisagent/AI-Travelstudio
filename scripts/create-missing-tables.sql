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

-- Create users table with proper role constraint
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  name TEXT,
  role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'client', 'super_admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_verification', 'suspended')),
  travel_compositor_id TEXT,
  agency_name TEXT,
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  microsite_id TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  password_reset_required BOOLEAN DEFAULT FALSE,
  import_source TEXT,
  import_date TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  profile_data JSONB DEFAULT '{}',
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

-- Create feature_requests table
CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  user_id TEXT NOT NULL DEFAULT 'system',
  category TEXT NOT NULL DEFAULT 'enhancement' CHECK (category IN ('enhancement', 'bug', 'feature', 'improvement')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'rejected', 'on_hold')),
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feature_votes table
CREATE TABLE IF NOT EXISTS feature_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feature_id, user_id)
);

-- Create feature_comments table
CREATE TABLE IF NOT EXISTS feature_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Anonymous',
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_reference TEXT UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'pending')),
  destination TEXT,
  microsite_source TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  total_price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  accommodations JSONB DEFAULT '[]',
  activities JSONB DEFAULT '[]',
  transports JSONB DEFAULT '[]',
  vouchers JSONB DEFAULT '[]',
  raw_data JSONB,
  webhook_received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_bookings table (linking users to their bookings)
CREATE TABLE IF NOT EXISTS user_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'owner' CHECK (relationship IN ('owner', 'collaborator', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, booking_id)
);

-- Create booking_services table
CREATE TABLE IF NOT EXISTS booking_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('accommodation', 'transport', 'activity', 'voucher')),
  service_name TEXT NOT NULL,
  service_data JSONB DEFAULT '{}',
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_clients table
CREATE TABLE IF NOT EXISTS booking_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_data JSONB DEFAULT '{}',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create travel_ideas table
CREATE TABLE IF NOT EXISTS travel_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled',
  description TEXT,
  destination TEXT,
  microsite_source TEXT,
  idea_data JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  webhook_received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create holiday_packages table
CREATE TABLE IF NOT EXISTS holiday_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  destination TEXT,
  duration_days INTEGER,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  package_data JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_subscriptions table
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint_url TEXT NOT NULL,
  event_types TEXT[] NOT NULL,
  secret_key TEXT,
  active BOOLEAN DEFAULT TRUE,
  last_delivery TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_id UUID REFERENCES webhook_events(id) ON DELETE CASCADE,
  status_code INTEGER,
  response_body TEXT,
  delivery_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_verification_tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for agencies
CREATE INDEX IF NOT EXISTS idx_agencies_code ON agencies(code);
CREATE INDEX IF NOT EXISTS idx_agencies_active ON agencies(active);

-- Create indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_agency_id ON users(agency_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Create indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Create indexes for user_bookings
CREATE INDEX IF NOT EXISTS idx_user_bookings_user_id ON user_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookings_booking_id ON user_bookings(booking_id);

-- Create indexes for feature requests
CREATE INDEX IF NOT EXISTS idx_feature_requests_votes ON feature_requests(votes DESC);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_category ON feature_requests(category);
CREATE INDEX IF NOT EXISTS idx_feature_requests_priority ON feature_requests(priority);
CREATE INDEX IF NOT EXISTS idx_feature_requests_created_at ON feature_requests(created_at DESC);

-- Create indexes for feature votes
CREATE INDEX IF NOT EXISTS idx_feature_votes_feature_id ON feature_votes(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_votes_user_id ON feature_votes(user_id);

-- Create indexes for feature comments
CREATE INDEX IF NOT EXISTS idx_feature_comments_feature_id ON feature_comments(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_comments_created_at ON feature_comments(created_at DESC);

-- Create indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_webhook_received_at ON bookings(webhook_received_at);
CREATE INDEX IF NOT EXISTS idx_bookings_destination ON bookings(destination);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_agency_id ON bookings(agency_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);

-- Create indexes for booking services
CREATE INDEX IF NOT EXISTS idx_booking_services_booking_id ON booking_services(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_services_type ON booking_services(service_type);
CREATE INDEX IF NOT EXISTS idx_booking_services_status ON booking_services(status);

-- Create indexes for booking clients
CREATE INDEX IF NOT EXISTS idx_booking_clients_booking_id ON booking_clients(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_clients_email ON booking_clients(client_email);

-- Create indexes for travel ideas
CREATE INDEX IF NOT EXISTS idx_travel_ideas_webhook_received_at ON travel_ideas(webhook_received_at);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_destination ON travel_ideas(destination);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_active ON travel_ideas(active);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_created_at ON travel_ideas(created_at DESC);

-- Create indexes for holiday packages
CREATE INDEX IF NOT EXISTS idx_holiday_packages_destination ON holiday_packages(destination);
CREATE INDEX IF NOT EXISTS idx_holiday_packages_active ON holiday_packages(active);
CREATE INDEX IF NOT EXISTS idx_holiday_packages_price ON holiday_packages(price);

-- Create indexes for webhook events
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- Create indexes for webhook subscriptions
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_active ON webhook_subscriptions(active);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
