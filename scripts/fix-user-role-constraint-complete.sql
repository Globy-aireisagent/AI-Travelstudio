-- Drop existing constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add updated constraint with all valid roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'agent', 'client', 'super_admin'));

-- Drop existing status constraint if it exists  
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;

-- Add updated constraint with all valid statuses
ALTER TABLE users ADD CONSTRAINT users_status_check 
CHECK (status IN ('active', 'inactive', 'pending_verification', 'suspended'));

-- Verify the constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
    AND contype = 'c'
ORDER BY conname;
