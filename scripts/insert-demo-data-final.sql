-- Insert demo data with correct constraints
INSERT INTO users (
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    status, 
    agency_id, 
    is_verified, 
    is_active, 
    display_name, 
    preferences, 
    can_manage_users,
    created_at,
    updated_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'admin@demo.com',
    'Demo',
    'Admin',
    'admin',
    'active',
    '550e8400-e29b-41d4-a716-446655440002',
    true,
    true,
    'Demo Admin',
    '{}',
    true,
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440011',
    'agent@demo.com',
    'Demo',
    'Agent',
    'agent',
    'active',
    '550e8400-e29b-41d4-a716-446655440002',
    true,
    true,
    'Demo Agent',
    '{}',
    false,
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440013',
    'client@demo.com',
    'Demo',
    'Client',
    'client',
    'active',
    '550e8400-e29b-41d4-a716-446655440002',
    true,
    true,
    'Demo Client',
    '{}',
    false,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert demo feature requests
INSERT INTO feature_requests (
    id,
    title,
    description,
    category,
    priority,
    status,
    user_id,
    votes,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    'Mobile App Support',
    'Add support for mobile applications to access the travel booking system',
    'feature',
    'high',
    'pending',
    '550e8400-e29b-41d4-a716-446655440011',
    15,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Advanced Search Filters',
    'Implement more sophisticated search and filtering options for bookings',
    'enhancement',
    'medium',
    'in_progress',
    '550e8400-e29b-41d4-a716-446655440013',
    8,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Real-time Notifications',
    'Add push notifications for booking updates and travel alerts',
    'feature',
    'medium',
    'completed',
    '550e8400-e29b-41d4-a716-446655440011',
    22,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;
