-- Insert demo agencies
INSERT INTO agencies (id, name, code, contact_email, contact_phone, address, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'RBS Travel', 'RBS001', 'info@rbstravel.com', '+31-20-1234567', 'Amsterdam, Netherlands', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Dream Destinations', 'DD002', 'hello@dreamdest.com', '+31-70-9876543', 'Den Haag, Netherlands', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Global Adventures', 'GA', 'contact@globaladv.com', '+31-20-9876543', 'Rotterdam, Netherlands', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'Adventure Tours', 'AT003', 'contact@adventure.com', '+31-30-5555555', 'Utrecht, Netherlands', 'active')
ON CONFLICT (code) DO NOTHING;

-- Insert demo users
INSERT INTO users (id, email, name, first_name, last_name, role, status, agency_id, phone) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'admin@rbstravel.com', 'Admin User', 'Admin', 'User', 'admin', 'active', '550e8400-e29b-41d4-a716-446655440001', '+31-6-12345678'),
('550e8400-e29b-41d4-a716-446655440012', 'agent@rbstravel.com', 'Travel Agent', 'Travel', 'Agent', 'agent', 'active', '550e8400-e29b-41d4-a716-446655440001', '+31-6-87654321'),
('550e8400-e29b-41d4-a716-446655440013', 'client@example.com', 'John Doe', 'John', 'Doe', 'client', 'active', '550e8400-e29b-41d4-a716-446655440001', '+31-6-11111111'),
('550e8400-e29b-41d4-a716-446655440014', 'sarah@dreamdest.com', 'Sarah Wilson', 'Sarah', 'Wilson', 'agent', 'active', '550e8400-e29b-41d4-a716-446655440002', '+31-6-22222222'),
('550e8400-e29b-41d4-a716-446655440015', 'mike@adventure.com', 'Mike Johnson', 'Mike', 'Johnson', 'admin', 'active', '550e8400-e29b-41d4-a716-446655440004', '+31-6-33333333')
ON CONFLICT (email) DO NOTHING;

-- Insert demo feature requests
INSERT INTO feature_requests (id, title, description, category, priority, status, user_id, votes_count) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'Mobile App for Clients', 'We need a mobile app so clients can view their bookings on the go', 'mobile', 'high', 'open', '550e8400-e29b-41d4-a716-446655440011', 5),
('550e8400-e29b-41d4-a716-446655440022', 'Real-time Flight Updates', 'Automatic notifications when flight times change', 'notifications', 'high', 'in_progress', '550e8400-e29b-41d4-a716-446655440013', 8),
('550e8400-e29b-41d4-a716-446655440023', 'Multi-language Support', 'Support for Dutch, English, German, and French', 'localization', 'medium', 'open', '550e8400-e29b-41d4-a716-446655440014', 3),
('550e8400-e29b-41d4-a716-446655440024', 'Advanced Reporting Dashboard', 'Better analytics and reporting for agencies', 'analytics', 'medium', 'open', '550e8400-e29b-41d4-a716-446655440011', 2),
('550e8400-e29b-41d4-a716-446655440025', 'Integration with WhatsApp', 'Send booking confirmations via WhatsApp', 'integration', 'low', 'open', '550e8400-e29b-41d4-a716-446655440012', 4),
('550e8400-e29b-41d4-a716-446655440026', 'Dark Mode Theme', 'Add dark mode option for better user experience', 'ui', 'low', 'completed', '550e8400-e29b-41d4-a716-446655440013', 6),
('550e8400-e29b-41d4-a716-446655440027', 'AI-Powered Trip Planning', 'Implement AI assistant to help create personalized travel itineraries based on user preferences and budget.', 'ai', 'high', 'in_progress', '550e8400-e29b-41d4-a716-446655440011', 15),
('550e8400-e29b-41d4-a716-446655440028', 'Mobile App Development', 'Create native mobile apps for iOS and Android to allow travelers to access their bookings on the go.', 'mobile', 'high', 'planned', '550e8400-e29b-41d4-a716-446655440012', 12),
('550e8400-e29b-41d4-a716-446655440029', 'Enhanced Booking Analytics', 'Add detailed analytics dashboard for travel agents to track booking patterns and revenue.', 'analytics', 'medium', 'open', '550e8400-e29b-41d4-a716-446655440014', 6)
ON CONFLICT (id) DO NOTHING;

-- Insert demo feature votes
INSERT INTO feature_votes (feature_request_id, user_id, vote_type) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 'up'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440013', 'up'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', 'up'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440014', 'up'),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440011', 'up'),
('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440012', 'up'),
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440012', 'up'),
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440013', 'up'),
('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440011', 'up'),
('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440014', 'up'),
('550e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440015', 'up')
ON CONFLICT (feature_request_id, user_id) DO NOTHING;

-- Insert demo feature comments
INSERT INTO feature_comments (feature_request_id, user_id, content) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 'This would be a game changer for our clients!'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440013', 'I missed my connection last week because of a delayed flight. This feature would have helped!'),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440014', 'German support would help us serve more international clients'),
('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440012', 'Dark mode is essential for working late hours'),
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440012', 'This would be a game-changer for our agency. Clients are always asking for personalized recommendations.'),
('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440013', 'I would love to have all my travel documents accessible on my phone during trips.'),
('550e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440014', 'Our clients frequently ask about flight delays. This would save us a lot of manual work.')
ON CONFLICT DO NOTHING;

-- Insert demo bookings
INSERT INTO bookings (id, booking_reference, user_id, agency_id, destination, departure_date, return_date, total_price, currency, status, booking_data) VALUES
('550e8400-e29b-41d4-a716-446655440031', 'RBS-2024-001', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Paris, France', '2024-03-15', '2024-03-22', 1250.00, 'EUR', 'confirmed', '{"hotel": "Hotel Louvre", "flight": "KL1234", "activities": ["Eiffel Tower", "Louvre Museum"]}'),
('550e8400-e29b-41d4-a716-446655440032', 'DD-2024-002', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'Barcelona, Spain', '2024-04-10', '2024-04-17', 980.50, 'EUR', 'pending', '{"hotel": "Hotel Barcelona Center", "flight": "VY8765", "activities": ["Sagrada Familia", "Park Güell"]}'),
('550e8400-e29b-41d4-a716-446655440033', 'GA-2024-003', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Rome, Italy', '2024-05-20', '2024-05-27', 1450.75, 'EUR', 'confirmed', '{"hotel": "Tokyo Grand Hotel", "flight": "KL861", "activities": ["Mount Fuji", "Tokyo Disneyland", "Senso-ji Temple"]}'),
('550e8400-e29b-41d4-a716-446655440034', 'BK2025001', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Paris, France', '2025-03-15', '2025-03-22', 1250.00, 'EUR', 'confirmed', '{"hotel": "Hotel Louvre", "flight": "KL1234", "activities": ["Eiffel Tower", "Louvre Museum"]}'),
('550e8400-e29b-41d4-a716-446655440035', 'BK2025002', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Barcelona, Spain', '2025-05-10', '2025-05-17', 980.00, 'EUR', 'pending', '{"hotel": "Hotel Barcelona Center", "flight": "VY8765", "activities": ["Sagrada Familia", "Park Güell"]}'),
('550e8400-e29b-41d4-a716-446655440036', 'BK2025003', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 'Tokyo, Japan', '2025-04-01', '2025-04-14', 2800.00, 'EUR', 'confirmed', '{"hotel": "Tokyo Grand Hotel", "flight": "KL861", "activities": ["Mount Fuji", "Tokyo Disneyland", "Senso-ji Temple"]}')
ON CONFLICT (booking_reference) DO NOTHING;

-- Insert demo travel ideas
INSERT INTO travel_ideas (id, title, description, destination, duration_days, price_from, price_to, currency, category, agency_id, status, image_url, features) VALUES
('550e8400-e29b-41d4-a716-446655440041', 'Romantic Paris Weekend', 'Perfect getaway for couples with Seine cruise and Eiffel Tower dinner', 'Paris, France', 3, 599.00, 899.00, 'EUR', 'romance', '550e8400-e29b-41d4-a716-446655440001', 'active', '/placeholder.svg?height=300&width=400&text=Paris+Romance', '["Luxury accommodation", "Romantic dinners", "Seine river cruise", "Eiffel Tower visit"]'),
('550e8400-e29b-41d4-a716-446655440042', 'Barcelona Beach & Culture', 'Combine beach relaxation with Gaudí architecture and tapas tours', 'Barcelona, Spain', 5, 750.00, 1200.00, 'EUR', 'culture', '550e8400-e29b-41d4-a716-446655440002', 'active', '/placeholder.svg?height=300&width=400&text=Barcelona+Culture', '["Beach relaxation", "Gaudí architecture", "Tapas tours"]'),
('550e8400-e29b-41d4-a716-446655440043', 'Ancient Rome Explorer', 'Discover the eternal city with guided tours of Colosseum and Vatican', 'Rome, Italy', 7, 950.00, 1500.00, 'EUR', 'history', '550e8400-e29b-41d4-a716-446655440003', 'active', '/placeholder.svg?height=300&width=400&text=Rome+History', '["Guided tours", "Colosseum", "Vatican"]'),
('550e8400-e29b-41d4-a716-446655440044', 'Adventure in the Alps', 'Thrilling mountain adventure with hiking, skiing, and breathtaking views of the Swiss Alps.', 'Swiss Alps, Switzerland', 7, 1200.00, 2000.00, 'EUR', 'adventure', '550e8400-e29b-41d4-a716-446655440004', 'active', '/placeholder.svg?height=300&width=400&text=Swiss+Alps', '["Mountain hiking", "Ski passes", "Cable car rides", "Alpine cuisine"]'),
('550e8400-e29b-41d4-a716-446655440045', 'Cultural Japan Experience', 'Immerse yourself in Japanese culture with temple visits, traditional cuisine, and cultural workshops.', 'Tokyo & Kyoto, Japan', 10, 2000.00, 3500.00, 'EUR', 'culture', '550e8400-e29b-41d4-a716-446655440002', 'active', '/placeholder.svg?height=300&width=400&text=Japan+Culture', '["Temple visits", "Tea ceremony", "Sushi making class", "Traditional ryokan stay"]'),
('550e8400-e29b-41d4-a716-446655440046', 'Mediterranean Cruise', 'Relaxing cruise through the Mediterranean with stops at beautiful coastal cities.', 'Mediterranean Sea', 12, 1500.00, 2800.00, 'EUR', 'cruise', '550e8400-e29b-41d4-a716-446655440001', 'active', '/placeholder.svg?height=300&width=400&text=Mediterranean+Cruise', '["All-inclusive meals", "Multiple destinations", "Onboard entertainment", "Shore excursions"]'),
('550e8400-e29b-41d4-a716-446655440047', 'Safari Adventure Kenya', 'Wildlife safari in Kenya with game drives, luxury tented camps, and cultural experiences.', 'Kenya, Africa', 8, 2500.00, 4000.00, 'EUR', 'safari', '550e8400-e29b-41d4-a716-446655440004', 'active', '/placeholder.svg?height=300&width=400&text=Kenya+Safari', '["Game drives", "Luxury tented camps", "Masai village visit", "Hot air balloon ride"]')
ON CONFLICT (id) DO NOTHING;

-- Insert demo webhook events
INSERT INTO webhook_events (event_type, source, payload, processed) VALUES
('booking_created', 'travel_compositor', '{"booking_id": "BK2025001", "status": "confirmed", "amount": 1250.00}', true),
('booking_updated', 'travel_compositor', '{"booking_id": "BK2025002", "status": "pending", "amount": 980.00}', true),
('idea_created', 'content_management', '{"idea_id": "romantic-paris", "title": "Romantic Paris Getaway", "status": "active"}', true)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Demo data inserted successfully!' as result,
       (SELECT COUNT(*) FROM agencies) as agencies_count,
       (SELECT COUNT(*) FROM users) as users_count,
       (SELECT COUNT(*) FROM feature_requests) as feature_requests_count,
       (SELECT COUNT(*) FROM bookings) as bookings_count,
       (SELECT COUNT(*) FROM travel_ideas) as travel_ideas_count;
