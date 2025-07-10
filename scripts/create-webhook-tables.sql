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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_logs table with matching UUID type
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_event_id UUID REFERENCES webhook_events(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  response_data JSONB,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create travel ideas table with all necessary columns
CREATE TABLE IF NOT EXISTS travel_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT,
  duration_days INTEGER DEFAULT 7,
  price_from DECIMAL(10,2) DEFAULT 0,
  price_to DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  category TEXT,
  tags JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  highlights JSONB DEFAULT '[]',
  included_services JSONB DEFAULT '[]',
  raw_data JSONB,
  webhook_received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  microsite_source TEXT,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create holiday packages table with all necessary columns
CREATE TABLE IF NOT EXISTS holiday_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT,
  duration_days INTEGER DEFAULT 7,
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  availability JSONB DEFAULT '{}',
  inclusions JSONB DEFAULT '[]',
  exclusions JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  raw_data JSONB,
  webhook_received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  microsite_source TEXT,
  status TEXT DEFAULT 'AVAILABLE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON webhook_events(source);

-- Create indexes for webhook_subscriptions
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_active ON webhook_subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_endpoint ON webhook_subscriptions(endpoint_url);

-- Create indexes for webhook_logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id ON webhook_logs(webhook_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

-- Create indexes for travel ideas
CREATE INDEX IF NOT EXISTS idx_travel_ideas_destination ON travel_ideas(destination);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_category ON travel_ideas(category);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_status ON travel_ideas(status);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_webhook_received_at ON travel_ideas(webhook_received_at);

-- Create indexes for holiday packages
CREATE INDEX IF NOT EXISTS idx_holiday_packages_destination ON holiday_packages(destination);
CREATE INDEX IF NOT EXISTS idx_holiday_packages_status ON holiday_packages(status);
CREATE INDEX IF NOT EXISTS idx_holiday_packages_webhook_received_at ON holiday_packages(webhook_received_at);

-- Enable Row Level Security
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_packages ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook_events
CREATE POLICY "Allow service role to manage webhook events" ON webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for webhook_subscriptions
CREATE POLICY "Allow service role to manage webhook subscriptions" ON webhook_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for webhook_logs
CREATE POLICY "Allow service role to manage webhook logs" ON webhook_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for travel ideas
CREATE POLICY "Allow authenticated users to read travel ideas" ON travel_ideas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage travel ideas" ON travel_ideas
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for holiday packages
CREATE POLICY "Allow authenticated users to read holiday packages" ON holiday_packages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage holiday packages" ON holiday_packages
  FOR ALL USING (auth.role() = 'service_role');
