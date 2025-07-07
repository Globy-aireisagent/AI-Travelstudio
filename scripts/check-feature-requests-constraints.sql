-- Check if feature_requests table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'feature_requests' 
ORDER BY ordinal_position;

-- Check constraints on feature_requests table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'feature_requests';

-- Check if feature_votes table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'feature_votes'
);

-- Check if feature_comments table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'feature_comments'
);
