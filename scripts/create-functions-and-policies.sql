-- Enable Row Level Security on all tables
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all to read feature requests" ON feature_requests;
DROP POLICY IF EXISTS "Allow service role to manage feature requests" ON feature_requests;
DROP POLICY IF EXISTS "Allow all to read votes" ON feature_votes;
DROP POLICY IF EXISTS "Allow service role to manage votes" ON feature_votes;
DROP POLICY IF EXISTS "Allow all to read comments" ON feature_comments;
DROP POLICY IF EXISTS "Allow service role to manage comments" ON feature_comments;
DROP POLICY IF EXISTS "Allow authenticated users to read bookings" ON bookings;
DROP POLICY IF EXISTS "Allow service role to manage bookings" ON bookings;
DROP POLICY IF EXISTS "Allow authenticated users to read booking services" ON booking_services;
DROP POLICY IF EXISTS "Allow service role to manage booking services" ON booking_services;
DROP POLICY IF EXISTS "Allow authenticated users to read booking clients" ON booking_clients;
DROP POLICY IF EXISTS "Allow service role to manage booking clients" ON booking_clients;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Authenticated users can read agencies" ON agencies;
DROP POLICY IF EXISTS "Service role can manage agencies" ON agencies;
DROP POLICY IF EXISTS "Service role can manage sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can read their booking relationships" ON user_bookings;
DROP POLICY IF EXISTS "Service role can manage user bookings" ON user_bookings;
DROP POLICY IF EXISTS "Allow authenticated users to read travel ideas" ON travel_ideas;
DROP POLICY IF EXISTS "Allow service role to manage travel ideas" ON travel_ideas;
DROP POLICY IF EXISTS "Allow authenticated users to read holiday packages" ON holiday_packages;
DROP POLICY IF EXISTS "Allow service role to manage holiday packages" ON holiday_packages;
DROP POLICY IF EXISTS "Allow service role to manage webhook events" ON webhook_events;
DROP POLICY IF EXISTS "Allow service role to manage webhook subscriptions" ON webhook_subscriptions;
DROP POLICY IF EXISTS "Allow service role to manage webhook logs" ON webhook_logs;

-- Create policies for feature_requests
CREATE POLICY "Allow all to read feature requests" ON feature_requests FOR SELECT USING (true);
CREATE POLICY "Allow service role to manage feature requests" ON feature_requests FOR ALL USING (auth.role() = 'service_role');

-- Create policies for feature_votes
CREATE POLICY "Allow all to read votes" ON feature_votes FOR SELECT USING (true);
CREATE POLICY "Allow service role to manage votes" ON feature_votes FOR ALL USING (auth.role() = 'service_role');

-- Create policies for feature_comments
CREATE POLICY "Allow all to read comments" ON feature_comments FOR SELECT USING (true);
CREATE POLICY "Allow service role to manage comments" ON feature_comments FOR ALL USING (auth.role() = 'service_role');

-- Create policies for bookings
CREATE POLICY "Allow authenticated users to read bookings" ON bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow service role to manage bookings" ON bookings FOR ALL USING (auth.role() = 'service_role');

-- Create policies for booking_services
CREATE POLICY "Allow authenticated users to read booking services" ON booking_services FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow service role to manage booking services" ON booking_services FOR ALL USING (auth.role() = 'service_role');

-- Create policies for booking_clients
CREATE POLICY "Allow authenticated users to read booking clients" ON booking_clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow service role to manage booking clients" ON booking_clients FOR ALL USING (auth.role() = 'service_role');

-- Create policies for users
CREATE POLICY "Users can read their own data" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Service role can manage users" ON users FOR ALL USING (auth.role() = 'service_role');

-- Create policies for agencies
CREATE POLICY "Authenticated users can read agencies" ON agencies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Service role can manage agencies" ON agencies FOR ALL USING (auth.role() = 'service_role');

-- Create policies for user_sessions
CREATE POLICY "Service role can manage sessions" ON user_sessions FOR ALL USING (auth.role() = 'service_role');

-- Create policies for user_bookings
CREATE POLICY "Users can read their booking relationships" ON user_bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Service role can manage user bookings" ON user_bookings FOR ALL USING (auth.role() = 'service_role');

-- Create policies for travel_ideas
CREATE POLICY "Allow authenticated users to read travel ideas" ON travel_ideas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow service role to manage travel ideas" ON travel_ideas FOR ALL USING (auth.role() = 'service_role');

-- Create policies for holiday_packages
CREATE POLICY "Allow authenticated users to read holiday packages" ON holiday_packages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow service role to manage holiday packages" ON holiday_packages FOR ALL USING (auth.role() = 'service_role');

-- Create policies for webhook_events
CREATE POLICY "Allow service role to manage webhook events" ON webhook_events FOR ALL USING (auth.role() = 'service_role');

-- Create policies for webhook_subscriptions
CREATE POLICY "Allow service role to manage webhook subscriptions" ON webhook_subscriptions FOR ALL USING (auth.role() = 'service_role');

-- Create policies for webhook_logs
CREATE POLICY "Allow service role to manage webhook logs" ON webhook_logs FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_agencies_updated_at ON agencies;
DROP TRIGGER IF EXISTS update_feature_requests_updated_at ON feature_requests;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
DROP TRIGGER IF EXISTS update_travel_ideas_updated_at ON travel_ideas;
DROP TRIGGER IF EXISTS update_holiday_packages_updated_at ON holiday_packages;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_webhook_subscriptions_updated_at ON webhook_subscriptions;

-- Create triggers for updated_at
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_requests_updated_at BEFORE UPDATE ON feature_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_travel_ideas_updated_at BEFORE UPDATE ON travel_ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holiday_packages_updated_at BEFORE UPDATE ON holiday_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_subscriptions_updated_at BEFORE UPDATE ON webhook_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update vote count
CREATE OR REPLACE FUNCTION update_feature_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE feature_requests 
        SET votes = votes + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END,
            updated_at = NOW()
        WHERE id = NEW.feature_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE feature_requests 
        SET votes = votes - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END,
            updated_at = NOW()
        WHERE id = OLD.feature_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE feature_requests 
        SET votes = votes + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END 
                          - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END,
            updated_at = NOW()
        WHERE id = NEW.feature_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote counting
DROP TRIGGER IF EXISTS trigger_update_feature_vote_count ON feature_votes;
CREATE TRIGGER trigger_update_feature_vote_count
    AFTER INSERT OR UPDATE OR DELETE ON feature_votes
    FOR EACH ROW EXECUTE FUNCTION update_feature_vote_count();
