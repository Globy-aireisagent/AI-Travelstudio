-- First, let's check what the current constraint allows
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND contype = 'c' 
AND conname LIKE '%role%';

-- Drop the existing role check constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the correct role check constraint
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'agent', 'client', 'super_admin'));

-- Also check if there are any existing users with invalid roles
SELECT id, email, role FROM users WHERE role NOT IN ('admin', 'agent', 'client', 'super_admin');

-- Update any existing users with invalid roles to 'agent' as default
UPDATE users SET role = 'agent' WHERE role NOT IN ('admin', 'agent', 'client', 'super_admin');
