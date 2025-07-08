-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
    -- Add travel_compositor_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'travel_compositor_id') THEN
        ALTER TABLE users ADD COLUMN travel_compositor_id VARCHAR(100);
    END IF;
    
    -- Add agency_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'agency_name') THEN
        ALTER TABLE users ADD COLUMN agency_name VARCHAR(255);
    END IF;
    
    -- Add microsite_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'microsite_id') THEN
        ALTER TABLE users ADD COLUMN microsite_id VARCHAR(100);
    END IF;
    
    -- Add email_verified if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
    
    -- Add password_reset_required if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_reset_required') THEN
        ALTER TABLE users ADD COLUMN password_reset_required BOOLEAN DEFAULT false;
    END IF;
    
    -- Add import_source if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'import_source') THEN
        ALTER TABLE users ADD COLUMN import_source VARCHAR(100);
    END IF;
    
    -- Add import_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'import_date') THEN
        ALTER TABLE users ADD COLUMN import_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add last_login if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add profile_data if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_data') THEN
        ALTER TABLE users ADD COLUMN profile_data JSONB;
    END IF;
    
    -- Add active if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'active') THEN
        ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update existing constraints to include all valid values
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'agent', 'client', 'super_admin'));

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check 
CHECK (status IN ('active', 'inactive', 'pending_verification', 'suspended'));

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
