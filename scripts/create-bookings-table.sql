-- Create bookings table with all necessary columns
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE,
  title TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  destination TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'CONFIRMED',
  total_price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  accommodations JSONB DEFAULT '[]',
  activities JSONB DEFAULT '[]',
  transports JSONB DEFAULT '[]',
  vouchers JSONB DEFAULT '[]',
  raw_data JSONB,
  webhook_received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  microsite_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_services table for normalized service data
CREATE TABLE IF NOT EXISTS booking_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_description TEXT,
  service_date TIMESTAMP WITH TIME ZONE,
  service_location TEXT,
  service_price DECIMAL(10,2) DEFAULT 0,
  service_currency TEXT DEFAULT 'EUR',
  service_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_clients table
CREATE TABLE IF NOT EXISTS booking_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_type TEXT DEFAULT 'primary',
  client_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_destination ON bookings(destination);
CREATE INDEX IF NOT EXISTS idx_bookings_webhook_received_at ON bookings(webhook_received_at);
CREATE INDEX IF NOT EXISTS idx_bookings_microsite_source ON bookings(microsite_source);

-- Create indexes for booking_services
CREATE INDEX IF NOT EXISTS idx_booking_services_booking_id ON booking_services(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_services_type ON booking_services(service_type);
CREATE INDEX IF NOT EXISTS idx_booking_services_date ON booking_services(service_date);

-- Create indexes for booking_clients
CREATE INDEX IF NOT EXISTS idx_booking_clients_booking_id ON booking_clients(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_clients_email ON booking_clients(client_email);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_clients ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings
CREATE POLICY "Allow authenticated users to read bookings" ON bookings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage bookings" ON bookings
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for booking_services
CREATE POLICY "Allow authenticated users to read booking services" ON booking_services
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage booking services" ON booking_services
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for booking_clients
CREATE POLICY "Allow authenticated users to read booking clients" ON booking_clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage booking clients" ON booking_clients
  FOR ALL USING (auth.role() = 'service_role');
