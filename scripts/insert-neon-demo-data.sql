-- Insert demo agencies
INSERT INTO agencies (id, name, code, contact_email, contact_phone, active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Travel Pro Agency', 'TPA', 'info@travelpro.com', '+31-20-1234567', true),
('550e8400-e29b-41d4-a716-446655440002', 'Global Adventures', 'GA', 'contact@globaladventures.com', '+31-20-7654321', true),
('550e8400-e29b-41d4-a716-446655440003', 'City Break Specialists', 'CBS', 'hello@citybreaks.com', '+31-20-9876543', true)
ON CONFLICT (id) DO NOTHING;

-- Insert demo users
INSERT INTO users (id, email, first_name, last_name, name, role, status, agency_id, active) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'admin@travelstudio.com', 'Admin', 'User', 'Admin User', 'admin', 'active', '550e8400-e29b-41d4-a716-446655440001', true),
('550e8400-e29b-41d4-a716-446655440012', 'agent1@travelpro.com', 'Sarah', 'Johnson', 'Sarah Johnson', 'agent', 'active', '550e8400-e29b-41d4-a716-446655440001', true),
('550e8400-e29b-41d4-a716-446655440013', 'agent2@globaladventures.com', 'Mike', 'Chen', 'Mike Chen', 'agent', 'active', '550e8400-e29b-41d4-a716-446655440002', true),
('550e8400-e29b-41d4-a716-446655440014', 'client1@example.com', 'Emma', 'Wilson', 'Emma Wilson', 'client', 'active', NULL, true)
ON CONFLICT (email) DO NOTHING;

-- Insert demo feature requests
INSERT INTO feature_requests (id, title, description, user_id, category, priority, status, votes) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'AI-Powered Trip Planning', 'Automatically generate personalized travel itineraries using AI based on user preferences, budget, and travel dates. This would save agents hours of manual planning time.', 'demo-user-1', 'ai', 'high', 'in_progress', 42),
('550e8400-e29b-41d4-a716-446655440022', 'Mobile App for Agents', 'Native mobile application for travel agents to manage bookings and communicate with clients on the go. Should include offline capabilities for areas with poor connectivity.', 'demo-user-2', 'mobile', 'medium', 'planned', 28),
('550e8400-e29b-41d4-a716-446655440023', 'Real-time Analytics Dashboard', 'Comprehensive analytics dashboard showing booking trends, revenue metrics, and customer insights in real-time. Include customizable widgets and export functionality.', 'demo-user-3', 'analytics', 'medium', 'open', 35),
('550e8400-e29b-41d4-a716-446655440024', 'Enhanced UI/UX Design', 'Modern, intuitive interface redesign with improved user experience and accessibility features. Focus on reducing clicks needed for common tasks.', 'demo-user-4', 'ui', 'low', 'completed', 19),
('550e8400-e29b-41d4-a716-446655440025', 'Integration with Payment Gateways', 'Seamless integration with popular payment processors like Stripe, PayPal, and local payment methods for different countries.', 'demo-user-5', 'integration', 'high', 'open', 31),
('550e8400-e29b-41d4-a716-446655440026', 'Automated Email Marketing', 'Built-in email marketing system with templates for follow-ups, promotions, and customer retention campaigns.', 'demo-user-6', 'feature', 'medium', 'planned', 24)
ON CONFLICT (id) DO NOTHING;

-- Insert demo feature votes
INSERT INTO feature_votes (feature_id, user_id, vote_type) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'demo-user-1', 'up'),
('550e8400-e29b-41d4-a716-446655440021', 'demo-user-2', 'up'),
('550e8400-e29b-41d4-a716-446655440021', 'demo-user-3', 'up'),
('550e8400-e29b-41d4-a716-446655440022', 'demo-user-1', 'up'),
('550e8400-e29b-41d4-a716-446655440022', 'demo-user-4', 'down'),
('550e8400-e29b-41d4-a716-446655440023', 'demo-user-2', 'up'),
('550e8400-e29b-41d4-a716-446655440023', 'demo-user-5', 'up')
ON CONFLICT (feature_id, user_id) DO NOTHING;

-- Insert demo feature comments
INSERT INTO feature_comments (feature_id, user_id, user_name, comment) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'demo-user-1', 'Sarah Johnson', 'This would be a game-changer for our agency! We spend so much time manually creating itineraries.'),
('550e8400-e29b-41d4-a716-446655440021', 'demo-user-2', 'Mike Chen', 'Love the idea! Could it also suggest alternative activities based on weather conditions?'),
('550e8400-e29b-41d4-a716-446655440022', 'demo-user-3', 'Emma Wilson', 'A mobile app would be perfect for when I''m traveling with clients. Great suggestion!'),
('550e8400-e29b-41d4-a716-446655440023', 'demo-user-4', 'Admin User', 'We''re already working on this! Should be available in Q2 2024.')
ON CONFLICT DO NOTHING;

-- Insert demo bookings
INSERT INTO bookings (id, booking_reference, user_id, agency_id, status, destination, start_date, end_date, total_price, currency) VALUES
('550e8400-e29b-41d4-a716-446655440031', 'BK-2024-001', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'active', 'Amsterdam, Netherlands', '2024-03-15', '2024-03-20', 1250.00, 'EUR'),
('550e8400-e29b-41d4-a716-446655440032', 'BK-2024-002', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 'completed', 'Paris, France', '2024-02-10', '2024-02-15', 980.50, 'EUR'),
('550e8400-e29b-41d4-a716-446655440033', 'BK-2024-003', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'pending', 'Tokyo, Japan', '2024-05-01', '2024-05-10', 2850.00, 'EUR')
ON CONFLICT (id) DO NOTHING;

-- Insert demo travel ideas
INSERT INTO travel_ideas (id, title, description, destination, duration_days, price_from, price_to, currency, category) VALUES
('550e8400-e29b-41d4-a716-446655440041', 'Romantic Weekend in Paris', 'Experience the city of love with your partner. Includes luxury hotel, romantic dinners, and Seine river cruise.', 'Paris, France', 3, 450.00, 850.00, 'EUR', 'Romance'),
('550e8400-e29b-41d4-a716-446655440042', 'Adventure in the Alps', 'Thrilling mountain adventure with hiking, skiing, and breathtaking views of the Swiss Alps.', 'Swiss Alps, Switzerland', 7, 1200.00, 2500.00, 'EUR', 'Adventure'),
('550e8400-e29b-41d4-a716-446655440043', 'Cultural Tour of Italy', 'Discover the rich history and culture of Italy visiting Rome, Florence, and Venice.', 'Italy', 10, 1800.00, 3200.00, 'EUR', 'Culture')
ON CONFLICT (id) DO NOTHING;
