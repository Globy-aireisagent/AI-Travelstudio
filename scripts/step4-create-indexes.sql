-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_agency ON users(agency_id);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_votes_feature ON feature_votes(feature_request_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_ideas_agency ON travel_ideas(agency_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);

SELECT 'Step 4 completed: all indexes created!' as result;
