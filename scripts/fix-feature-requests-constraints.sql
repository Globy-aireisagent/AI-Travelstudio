-- Drop existing constraints if they exist (ignore errors if they don't exist)
ALTER TABLE feature_requests DROP CONSTRAINT IF EXISTS feature_requests_category_check;
ALTER TABLE feature_requests DROP CONSTRAINT IF EXISTS feature_requests_priority_check;
ALTER TABLE feature_requests DROP CONSTRAINT IF EXISTS feature_requests_status_check;

-- Add proper check constraints for enum values
ALTER TABLE feature_requests 
ADD CONSTRAINT feature_requests_category_check 
CHECK (category IN ('feature', 'enhancement', 'bug', 'improvement'));

ALTER TABLE feature_requests 
ADD CONSTRAINT feature_requests_priority_check 
CHECK (priority IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE feature_requests 
ADD CONSTRAINT feature_requests_status_check 
CHECK (status IN ('pending', 'submitted', 'in_progress', 'completed', 'rejected', 'on_hold'));

-- Ensure votes columns have default values
ALTER TABLE feature_requests ALTER COLUMN votes SET DEFAULT 0;
ALTER TABLE feature_requests ALTER COLUMN upvotes SET DEFAULT 0;
ALTER TABLE feature_requests ALTER COLUMN downvotes SET DEFAULT 0;

-- Update any existing NULL values
UPDATE feature_requests SET votes = 0 WHERE votes IS NULL;
UPDATE feature_requests SET upvotes = 0 WHERE upvotes IS NULL;
UPDATE feature_requests SET downvotes = 0 WHERE downvotes IS NULL;

-- Make vote columns NOT NULL
ALTER TABLE feature_requests ALTER COLUMN votes SET NOT NULL;
ALTER TABLE feature_requests ALTER COLUMN upvotes SET NOT NULL;
ALTER TABLE feature_requests ALTER COLUMN downvotes SET NOT NULL;
