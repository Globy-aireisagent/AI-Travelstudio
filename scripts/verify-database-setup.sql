-- Verify all tables exist and have data
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename) as column_count
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check demo data counts
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'agencies', COUNT(*) FROM agencies
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'feature_requests', COUNT(*) FROM feature_requests
UNION ALL
SELECT 'feature_votes', COUNT(*) FROM feature_votes
UNION ALL
SELECT 'feature_comments', COUNT(*) FROM feature_comments
UNION ALL
SELECT 'travel_ideas', COUNT(*) FROM travel_ideas
UNION ALL
SELECT 'holiday_packages', COUNT(*) FROM holiday_packages;

-- Verify role constraint is working
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND contype = 'c' 
AND conname = 'users_role_check';

-- Test a sample query to make sure everything works
SELECT 
    u.name as user_name,
    u.role,
    a.name as agency_name,
    COUNT(b.id) as booking_count
FROM users u
LEFT JOIN agencies a ON u.agency_id = a.id
LEFT JOIN bookings b ON u.id = b.user_id
WHERE u.email LIKE '%demo%'
GROUP BY u.id, u.name, u.role, a.name
ORDER BY u.role;
