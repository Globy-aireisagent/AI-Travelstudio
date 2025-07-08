-- Verify all tables exist and have correct structure
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check table row counts
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 
    'agencies' as table_name, COUNT(*) as row_count FROM agencies
UNION ALL
SELECT 
    'bookings' as table_name, COUNT(*) as row_count FROM bookings
UNION ALL
SELECT 
    'travel_ideas' as table_name, COUNT(*) as row_count FROM travel_ideas
UNION ALL
SELECT 
    'feature_requests' as table_name, COUNT(*) as row_count FROM feature_requests
UNION ALL
SELECT 
    'feature_votes' as table_name, COUNT(*) as row_count FROM feature_votes
UNION ALL
SELECT 
    'feature_comments' as table_name, COUNT(*) as row_count FROM feature_comments
UNION ALL
SELECT 
    'webhook_events' as table_name, COUNT(*) as row_count FROM webhook_events;

-- Test a sample query to verify relationships work
SELECT 
    u.name as user_name,
    u.role,
    a.name as agency_name,
    COUNT(fr.id) as feature_requests_created
FROM users u
LEFT JOIN agencies a ON u.agency_id = a.id
LEFT JOIN feature_requests fr ON u.id = fr.user_id
GROUP BY u.id, u.name, u.role, a.name
ORDER BY u.name;

-- Verify foreign key relationships
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
