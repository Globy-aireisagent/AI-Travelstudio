-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_reference TEXT NOT NULL,
  title TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  destination TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status TEXT DEFAULT 'CONFIRMED',
  total_price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  accommodations JSONB DEFAULT '[]',
  activities JSONB DEFAULT '[]',
  transports JSONB DEFAULT '[]',
  vouchers JSONB DEFAULT '[]',
  raw_data JSONB,
  webhook_received_at TIMESTAMP DEFAULT NOW(),
  microsite_source TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create travel ideas table
CREATE TABLE IF NOT EXISTS travel_ideas (
  id TEXT PRIMARY KEY,
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
  webhook_received_at TIMESTAMP DEFAULT NOW(),
  microsite_source TEXT,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create holiday packages table
CREATE TABLE IF NOT EXISTS holiday_packages (
  id TEXT PRIMARY KEY,
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
  webhook_received_at TIMESTAMP DEFAULT NOW(),
  microsite_source TEXT,
  status TEXT DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_webhook_received_at ON bookings(webhook_received_at);

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
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_packages ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read bookings" ON bookings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage bookings" ON bookings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated users to read travel ideas" ON travel_ideas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage travel ideas" ON travel_ideas
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated users to read holiday packages" ON holiday_packages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage holiday packages" ON holiday_packages
  FOR ALL USING (auth.role() = 'service_role');
