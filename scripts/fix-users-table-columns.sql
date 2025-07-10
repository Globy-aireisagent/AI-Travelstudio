-- Add missing columns to agencies table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'description') THEN
        ALTER TABLE agencies ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'status') THEN
        ALTER TABLE agencies ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
    END IF;
END $$;

-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users ADD COLUMN first_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users ADD COLUMN last_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_verification', 'suspended'));
    END IF;
END $$;

-- Add missing columns to feature_requests table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'user_id') THEN
        ALTER TABLE feature_requests ADD COLUMN user_id TEXT NOT NULL DEFAULT 'system';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'category') THEN
        ALTER TABLE feature_requests ADD COLUMN category TEXT NOT NULL DEFAULT 'enhancement' CHECK (category IN ('enhancement', 'bug', 'feature', 'improvement'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'priority') THEN
        ALTER TABLE feature_requests ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'status') THEN
        ALTER TABLE feature_requests ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'on_hold'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_requests' AND column_name = 'votes') THEN
        ALTER TABLE feature_requests ADD COLUMN votes INTEGER DEFAULT 0;
    END IF;
END $$;
