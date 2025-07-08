-- Clear existing demo data first
DELETE FROM feature_comments WHERE user_id LIKE 'demo-user-%';
DELETE FROM feature_votes WHERE user_id LIKE 'demo-user-%';
DELETE FROM feature_requests WHERE user_id LIKE 'demo-user-%';
DELETE FROM bookings WHERE booking_reference LIKE 'DEMO-%';
DELETE FROM users WHERE email LIKE '%@demo.com';

-- Insert demo agencies
INSERT INTO agencies (id, name, code, contact_email, contact_phone, active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Travel Pro Agency', 'TPA', 'info@travelpro.com', '+31-20-1234567', true),
('550e8400-e29b-41d4-a716-446655440002', 'Global Adventures', 'GA', 'contact@globaladventures.com', '+31-20-7654321', true),
('550e8400-e29b-41d4-a716-446655440003', 'City Break Specialists', 'CBS', 'hello@citybreaks.com', '+31-20-9876543', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    active = EXCLUDED.active;

-- Insert demo users with proper constraints
INSERT INTO users (id, email, first_name, last_name, name, role, status, agency_id, active) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'admin@demo.com', 'Admin', 'User', 'Admin User', 'super_admin', 'active', '550e8400-e29b-41d4-a716-446655440001', true),
('550e8400-e29b-41d4-a716-446655440012', 'agent1@demo.com', 'Sarah', 'Johnson', 'Sarah Johnson', 'agent', 'active', '550e8400-e29b-41d4-a716-446655440001', true),
('550e8400-e29b-41d4-a716-446655440013', 'agent2@demo.com', 'Mike', 'Chen', 'Mike Chen', 'agent', 'active', '550e8400-e29b-41d4-a716-446655440002', true),
('550e8400-e29b-41d4-a716-446655440014', 'client1@demo.com', 'Emma', 'Wilson', 'Emma Wilson', 'client', 'active', NULL, true)
ON CONFLICT (email) DO UPDATE SET 
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    agency_id = EXCLUDED.agency_id,
    active = EXCLUDED.active;

-- Insert comprehensive feature requests
INSERT INTO feature_requests (id, title, description, user_id, category, priority, status, votes) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'AI-Powered Trip Planning', 'Automatically generate personalized travel itineraries using AI based on user preferences, budget, and travel dates. This would save agents hours of manual planning time and provide better customer experiences.', 'demo-user-1', 'ai', 'high', 'in_progress', 42),
('550e8400-e29b-41d4-a716-446655440022', 'Mobile App for Agents', 'Native mobile application for travel agents to manage bookings and communicate with clients on the go. Should include offline capabilities for areas with poor connectivity and push notifications for urgent updates.', 'demo-user-2', 'mobile', 'medium', 'planned', 28),
('550e8400-e29b-41d4-a716-446655440023', 'Real-time Analytics Dashboard', 'Comprehensive analytics dashboard showing booking trends, revenue metrics, and customer insights in real-time. Include customizable widgets, export functionality, and automated reporting.', 'demo-user-3', 'analytics', 'medium', 'open', 35),
('550e8400-e29b-41d4-a716-446655440024', 'Enhanced UI/UX Design', 'Modern, intuitive interface redesign with improved user experience and accessibility features. Focus on reducing clicks needed for common tasks and improving mobile responsiveness.', 'demo-user-4', 'ui', 'low', 'completed', 19),
('550e8400-e29b-41d4-a716-446655440025', 'Integration with Payment Gateways', 'Seamless integration with popular payment processors like Stripe, PayPal, and local payment methods for different countries. Include support for installment payments and currency conversion.', 'demo-user-5', 'integration', 'high', 'open', 31),
('550e8400-e29b-41d4-a716-446655440026', 'Automated Email Marketing', 'Built-in email marketing system with templates for follow-ups, promotions, and customer retention campaigns. Include A/B testing and analytics tracking.', 'demo-user-6', 'feature', 'medium', 'planned', 24),
('550e8400-e29b-41d4-a716-446655440027', 'Multi-language Support', 'Complete internationalization with support for multiple languages and currencies. Include right-to-left language support and cultural customizations.', 'demo-user-7', 'feature', 'medium', 'open', 18),
('550e8400-e29b-41d4-a716-446655440028', 'Advanced Search Filters', 'Enhanced search functionality with filters for price range, duration, activities, accommodation type, and more. Include saved searches and smart recommendations.', 'demo-user-8', 'feature', 'low', 'open', 22)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    priority = EXCLUDED.priority,
    status = EXCLUDED.status,
    votes = EXCLUDED.votes;

-- Insert feature votes
INSERT INTO feature_votes (feature_id, user_id, vote_type) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'demo-user-1', 'up'),
('550e8400-e29b-41d4-a716-446655440021', 'demo-user-2', 'up'),
('550e8400-e29b-41d4-a716-446655440021', 'demo-user-3', 'up'),
('550e8400-e29b-41d4-a716-446655440021', 'demo-user-4', 'up'),
('550e8400-e29b-41d4-a716-446655440022', 'demo-user-1', 'up'),
('550e8400-e29b-41d4-a716-446655440022', 'demo-user-4', 'down'),
('550e8400-e29b-41d4-a716-446655440023', 'demo-user-2', 'up'),
('550e8400-e29b-41d4-a716-446655440023', 'demo-user-5', 'up'),
('550e8400-e29b-41d4-a716-446655440025', 'demo-user-3', 'up'),
('550e8400-e29b-41d4-a716-446655440025', 'demo-user-6', 'up')
ON CONFLICT (feature_id, user_id) DO UPDATE SET vote_type = EXCLUDED.vote_type;

-- Insert feature comments
INSERT INTO feature_comments (feature_id, user_id, user_name, comment) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'demo-user-1', 'Sarah Johnson', 'This would be a game-changer for our agency! We spend so much time manually creating itineraries. AI could really help us scale our operations.'),
('550e8400-e29b-41d4-a716-446655440021', 'demo-user-2', 'Mike Chen', 'Love the idea! Could it also suggest alternative activities based on weather conditions? That would be incredibly useful for outdoor destinations.'),
('550e8400-e29b-41d4-a716-446655440021', 'demo-user-3', 'Emma Wilson', 'As a client, I would love to see AI-generated suggestions. It would make the planning process so much more exciting and personalized.'),
('550e8400-e29b-41d4-a716-446655440022', 'demo-user-3', 'Emma Wilson', 'A mobile app would be perfect for when I''m traveling with clients. Being able to make changes on the go would be amazing!'),
('550e8400-e29b-41d4-a716-446655440022', 'demo-user-4', 'Admin User', 'We need to ensure the mobile app has proper security measures for handling sensitive client data.'),
('550e8400-e29b-41d4-a716-446655440023', 'demo-user-4', 'Admin User', 'We''re already working on this! The analytics dashboard should be available in Q2 2024. Looking forward to your feedback on the beta version.'),
('550e8400-e29b-41d4-a716-446655440025', 'demo-user-5', 'Travel Agent Pro', 'Payment integration is crucial for our business. We lose customers when the payment process is complicated. This would definitely help with conversions.')
ON CONFLICT DO NOTHING;

-- Insert demo bookings
INSERT INTO bookings (id, booking_reference, user_id, agency_id, status, destination, start_date, end_date, total_price, currency) VALUES
('550e8400-e29b-41d4-a716-446655440031', 'DEMO-2024-001', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'active', 'Amsterdam, Netherlands', '2024-03-15', '2024-03-20', 1250.00, 'EUR'),
('550e8400-e29b-41d4-a716-446655440032', 'DEMO-2024-002', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 'completed', 'Paris, France', '2024-02-10', '2024-02-15', 980.50, 'EUR'),
('550e8400-e29b-41d4-a716-446655440033', 'DEMO-2024-003', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'pending', 'Tokyo, Japan', '2024-05-01', '2024-05-10', 2850.00, 'EUR')
ON CONFLICT (id) DO UPDATE SET 
    booking_reference = EXCLUDED.booking_reference,
    status = EXCLUDED.status,
    destination = EXCLUDED.destination,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    total_price = EXCLUDED.total_price;

-- Insert demo travel ideas
INSERT INTO travel_ideas (id, title, description, destination, duration_days, price_from, price_to, currency, category) VALUES
('550e8400-e29b-41d4-a716-446655440041', 'Romantic Weekend in Paris', 'Experience the city of love with your partner. Includes luxury hotel, romantic dinners, and Seine river cruise. Perfect for anniversaries and special occasions.', 'Paris, France', 3, 450.00, 850.00, 'EUR', 'Romance'),
('550e8400-e29b-41d4-a716-446655440042', 'Adventure in the Alps', 'Thrilling mountain adventure with hiking, skiing, and breathtaking views of the Swiss Alps. Includes professional guides and all equipment.', 'Swiss Alps, Switzerland', 7, 1200.00, 2500.00, 'EUR', 'Adventure'),
('550e8400-e29b-41d4-a716-446655440043', 'Cultural Tour of Italy', 'Discover the rich history and culture of Italy visiting Rome, Florence, and Venice. Includes guided tours of major attractions and authentic Italian cuisine experiences.', 'Italy', 10, 1800.00, 3200.00, 'EUR', 'Culture'),
('550e8400-e29b-41d4-a716-446655440044', 'Tropical Paradise in Bali', 'Relax in beautiful Bali with pristine beaches, luxury resorts, and traditional spa treatments. Perfect for honeymoons and relaxation getaways.', 'Bali, Indonesia', 8, 900.00, 1800.00, 'EUR', 'Beach'),
('550e8400-e29b-41d4-a716-446655440045', 'Northern Lights in Iceland', 'Witness the magical Northern Lights in Iceland. Includes glacier tours, hot springs, and cozy accommodations in Reykjavik.', 'Iceland', 5, 800.00, 1500.00, 'EUR', 'Nature')
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    destination = EXCLUDED.destination,
    duration_days = EXCLUDED.duration_days,
    price_from = EXCLUDED.price_from,
    price_to = EXCLUDED.price_to,
    category = EXCLUDED.category;

-- Verify the data was inserted correctly
SELECT 'Users' as table_name, COUNT(*) as count FROM users WHERE email LIKE '%@demo.com'
UNION ALL
SELECT 'Agencies' as table_name, COUNT(*) as count FROM agencies
UNION ALL
SELECT 'Feature Requests' as table_name, COUNT(*) as count FROM feature_requests WHERE user_id LIKE 'demo-user-%'
UNION ALL
SELECT 'Feature Votes' as table_name, COUNT(*) as count FROM feature_votes WHERE user_id LIKE 'demo-user-%'
UNION ALL
SELECT 'Feature Comments' as table_name, COUNT(*) as count FROM feature_comments WHERE user_id LIKE 'demo-user-%'
UNION ALL
SELECT 'Bookings' as table_name, COUNT(*) as count FROM bookings WHERE booking_reference LIKE 'DEMO-%'
UNION ALL
SELECT 'Travel Ideas' as table_name, COUNT(*) as count FROM travel_ideas;
