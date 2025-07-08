-- Create users table (requires agencies table first)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'agent',
    agency_id UUID REFERENCES agencies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO users (name, email, role, agency_id) 
SELECT 'John Doe', 'john@rbstravel.com', 'agent', a.id
FROM agencies a WHERE a.code = 'RBS001'
ON CONFLICT (email) DO NOTHING;

SELECT u.*, a.name as agency_name 
FROM users u LEFT JOIN agencies a ON u.agency_id = a.id;
