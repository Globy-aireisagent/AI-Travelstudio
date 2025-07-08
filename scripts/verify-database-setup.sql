-- Verify all tables exist and have correct structure
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'agencies', 'bookings', 'travel_ideas', 'feature_requests', 'feature_votes', 'feature_comments', 'webhook_events')
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

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN ('users', 'agencies', 'bookings', 'travel_ideas', 'feature_requests', 'feature_votes', 'feature_comments')
ORDER BY tablename, indexname;
