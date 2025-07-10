-- Create bookings table in Supabase
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_webhook_received_at ON bookings(webhook_received_at);

-- Enable Row Level Security (optional)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (adjust as needed)
CREATE POLICY "Allow authenticated users to read bookings" ON bookings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage bookings" ON bookings
  FOR ALL USING (auth.role() = 'service_role');
