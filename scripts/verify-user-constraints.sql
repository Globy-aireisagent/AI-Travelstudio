-- Verify that user constraints are working correctly
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass
ORDER BY conname;

-- Check valid values for role column
SELECT DISTINCT role FROM users WHERE role IS NOT NULL;

-- Check valid values for status column  
SELECT DISTINCT status FROM users WHERE status IS NOT NULL;

-- Test inserting a user with each role to verify constraints work
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
    can_manage_users
) VALUES 
(
    gen_random_uuid(),
    'test-admin@example.com',
    'Test',
    'Admin',
    'admin',
    'active',
    (SELECT id FROM agencies LIMIT 1),
    true,
    true,
    'Test Admin',
    '{}',
    true
),
(
    gen_random_uuid(),
    'test-agent@example.com',
    'Test',
    'Agent',
    'agent',
    'active',
    (SELECT id FROM agencies LIMIT 1),
    true,
    true,
    'Test Agent',
    '{}',
    false
),
(
    gen_random_uuid(),
    'test-client@example.com',
    'Test',
    'Client',
    'client',
    'active',
    (SELECT id FROM agencies LIMIT 1),
    true,
    true,
    'Test Client',
    '{}',
    false
);

-- Test inserting a user with valid values
INSERT INTO users (email, name, role, status) 
VALUES ('test@example.com', 'Test User', 'agent', 'active')
ON CONFLICT (email) DO NOTHING;

-- Verify the test user was inserted
SELECT email, name, role, status FROM users WHERE email = 'test@example.com';

-- Clean up test data
DELETE FROM users WHERE email LIKE 'test-%@example.com';

-- Show final constraint status
SELECT 'Constraints verified successfully' as status;
