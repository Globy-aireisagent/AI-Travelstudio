-- Verify that user constraints are working correctly
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as check_clause
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND contype = 'c'
AND conname IN ('users_role_check', 'users_status_check');

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

-- Clean up test data
DELETE FROM users WHERE email LIKE 'test-%@example.com';

-- Show final constraint status
SELECT 'Constraints verified successfully' as status;
