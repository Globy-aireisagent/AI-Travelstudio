-- Fix user role constraint to allow all necessary roles
BEGIN;

-- Drop existing constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with all required roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role = ANY (ARRAY['admin'::text, 'agent'::text, 'client'::text, 'super_admin'::text, 'viewer'::text, 'collaborator'::text]));

-- Drop existing status constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;

-- Add new status constraint with all required statuses
ALTER TABLE users ADD CONSTRAINT users_status_check 
CHECK (status = ANY (ARRAY['pending_verification'::text, 'active'::text, 'inactive'::text, 'suspended'::text, 'deleted'::text]));

COMMIT;

-- Verify constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as check_clause
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND contype = 'c';
