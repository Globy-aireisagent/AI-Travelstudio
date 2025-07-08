-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO agencies (name, code) VALUES 
('RBS Travel', 'RBS001'),
('Dream Destinations', 'DD002')
ON CONFLICT (code) DO NOTHING;

SELECT * FROM agencies;
