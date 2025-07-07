-- First ensure agencies exist with only existing columns
INSERT INTO agencies (id, name, created_at, updated_at) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440002', 'Demo Travel Agency', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- Update agencies with additional columns if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'description') THEN
        UPDATE agencies SET description = 'Main demo agency for testing' WHERE id = '550e8400-e29b-41d4-a716-446655440002';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'status') THEN
        UPDATE agencies SET status = 'active' WHERE id = '550e8400-e29b-41d4-a716-446655440002';
    END IF;
END $$;

-- Insert demo users with only guaranteed existing columns
INSERT INTO users (
    id, 
    email, 
    name,
    role, 
    agency_id,
    created_at,
    updated_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'admin@demo.com',
    'Demo Admin',
    'admin',
    '550e8400-e29b-41d4-a716-446655440002',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440011',
    'agent@demo.com',
    'Demo Agent',
    'agent',
    '550e8400-e29b-41d4-a716-446655440002',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440013',
    'client@demo.com',
    'Demo Client',
    'client',
    '550e8400-e29b-41d4-a716-446655440002',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440014',
    'superadmin@demo.com',
    'Super Admin',
    'super_admin',
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Update users with additional columns if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN
        UPDATE users SET first_name = 'Demo' WHERE email = 'admin@demo.com';
        UPDATE users SET first_name = 'Demo' WHERE email = 'agent@demo.com';
        UPDATE users SET first_name = 'Demo' WHERE email = 'client@demo.com';
        UPDATE users SET first_name = 'Super' WHERE email = 'superadmin@demo.com';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name') THEN
        UPDATE users SET last_name = 'Admin' WHERE email = 'admin@demo.com';
        UPDATE users SET last_name = 'Agent' WHERE email = 'agent@demo.com';
        UPDATE users SET last_name = 'Client' WHERE email = 'client@demo.com';
        UPDATE users SET last_name = 'Admin' WHERE email = 'superadmin@demo.com';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        UPDATE users SET status = 'active' WHERE email IN ('admin@demo.com', 'agent@demo.com', 'client@demo.com', 'superadmin@demo.com');
    END IF;
END $$;

-- Insert demo feature requests with only guaranteed existing columns
INSERT INTO feature_requests (
    title,
    description,
    created_at,
    updated_at
) VALUES 
(
    'Mobile App Support',
    'Add support for mobile applications to access the travel booking system',
    NOW(),
    NOW()
),
(
    'Advanced Search Filters',
    'Implement more sophisticated search and filtering options for bookings',
    NOW(),
    NOW()
),
(
    'Real-time Notifications',
    'Add push notifications for booking updates and travel alerts',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '1 day'
),
(
    'Dark Mode Theme',
    'Implement dark mode theme for better user experience during night hours',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
),
(
    'Export to PDF',
    'Allow users to export travel itineraries and bookings to PDF format',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '2 days'
);

-- Update feature requests with additional columns if they exist
DO $$
DECLARE
    feature_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'category') THEN
        UPDATE feature_requests SET category = 'feature' WHERE title = 'Mobile App Support';
        UPDATE feature_requests SET category = 'enhancement' WHERE title = 'Advanced Search Filters';
        UPDATE feature_requests SET category = 'feature' WHERE title = 'Real-time Notifications';
        UPDATE feature_requests SET category = 'enhancement' WHERE title = 'Dark Mode Theme';
        UPDATE feature_requests SET category = 'feature' WHERE title = 'Export to PDF';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'priority') THEN
        UPDATE feature_requests SET priority = 'high' WHERE title = 'Mobile App Support';
        UPDATE feature_requests SET priority = 'medium' WHERE title = 'Advanced Search Filters';
        UPDATE feature_requests SET priority = 'medium' WHERE title = 'Real-time Notifications';
        UPDATE feature_requests SET priority = 'low' WHERE title = 'Dark Mode Theme';
        UPDATE feature_requests SET priority = 'high' WHERE title = 'Export to PDF';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'status') THEN
        UPDATE feature_requests SET status = 'pending' WHERE title = 'Mobile App Support';
        UPDATE feature_requests SET status = 'in_progress' WHERE title = 'Advanced Search Filters';
        UPDATE feature_requests SET status = 'completed' WHERE title = 'Real-time Notifications';
        UPDATE feature_requests SET status = 'pending' WHERE title = 'Dark Mode Theme';
        UPDATE feature_requests SET status = 'in_progress' WHERE title = 'Export to PDF';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'votes') THEN
        UPDATE feature_requests SET votes = 15 WHERE title = 'Mobile App Support';
        UPDATE feature_requests SET votes = 8 WHERE title = 'Advanced Search Filters';
        UPDATE feature_requests SET votes = 22 WHERE title = 'Real-time Notifications';
        UPDATE feature_requests SET votes = 5 WHERE title = 'Dark Mode Theme';
        UPDATE feature_requests SET votes = 18 WHERE title = 'Export to PDF';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'user_id') THEN
        UPDATE feature_requests SET user_id = '550e8400-e29b-41d4-a716-446655440011' WHERE title IN ('Mobile App Support', 'Real-time Notifications', 'Export to PDF');
        UPDATE feature_requests SET user_id = '550e8400-e29b-41d4-a716-446655440013' WHERE title IN ('Advanced Search Filters', 'Dark Mode Theme');
    END IF;
END $$;

-- Verify the data was inserted
SELECT 'Users count:' as info, COUNT(*) as count FROM users;
SELECT 'Agencies count:' as info, COUNT(*) as count FROM agencies;
SELECT 'Feature requests count:' as info, COUNT(*) as count FROM feature_requests;

-- Show sample data
SELECT 'Sample users:' as info;
SELECT email, role, name FROM users LIMIT 5;

SELECT 'Sample feature requests:' as info;
SELECT title, description FROM feature_requests LIMIT 5;
