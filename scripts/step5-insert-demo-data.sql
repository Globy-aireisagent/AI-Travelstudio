-- Step 5: Insert demo data
INSERT INTO agencies (id, name, code, contact_email, contact_phone, address, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'RBS Travel', 'RBS001', 'info@rbstravel.com', '+31-20-1234567', 'Amsterdam, Netherlands', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Dream Destinations', 'DD002', 'hello@dreamdest.com', '+31-70-9876543', 'Den Haag, Netherlands', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Global Adventures', 'GA003', 'contact@globaladv.com', '+31-20-9876543', 'Rotterdam, Netherlands', 'active')
ON CONFLICT (code) DO NOTHING;

INSERT INTO users (id, email, name, first_name, last_name, role, status, agency_id, phone) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'admin@rbstravel.com', 'Admin User', 'Admin', 'User', 'admin', 'active', '550e8400-e29b-41d4-a716-446655440001', '+31-6-12345678'),
('550e8400-e29b-41d4-a716-446655440012', 'agent@rbstravel.com', 'Travel Agent', 'Travel', 'Agent', 'agent', 'active', '550e8400-e29b-41d4-a716-446655440001', '+31-6-87654321'),
('550e8400-e29b-41d4-a716-446655440013', 'client@example.com', 'John Doe', 'John', 'Doe', 'client', 'active', '550e8400-e29b-41d4-a716-446655440001', '+31-6-11111111')
ON CONFLICT (email) DO NOTHING;

INSERT INTO feature_requests (id, title, description, category, priority, status, user_id, votes_count) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'Mobile App for Clients', 'We need a mobile app so clients can view their bookings on the go', 'mobile', 'high', 'open', '550e8400-e29b-41d4-a716-446655440011', 5),
('550e8400-e29b-41d4-a716-446655440022', 'Real-time Flight Updates', 'Automatic notifications when flight times change', 'notifications', 'high', 'in_progress', '550e8400-e29b-41d4-a716-446655440013', 8),
('550e8400-e29b-41d4-a716-446655440023', 'Multi-language Support', 'Support for Dutch, English, German, and French', 'localization', 'medium', 'open', '550e8400-e29b-41d4-a716-446655440012', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (id, booking_reference, user_id, agency_id, destination, departure_date, return_date, total_price, currency, status) VALUES
('550e8400-e29b-41d4-a716-446655440031', 'RBS-2024-001', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Paris, France', '2024-03-15', '2024-03-22', 1250.00, 'EUR', 'confirmed'),
('550e8400-e29b-41d4-a716-446655440032', 'DD-2024-002', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'Barcelona, Spain', '2024-04-10', '2024-04-17', 980.50, 'EUR', 'pending')
ON CONFLICT (booking_reference) DO NOTHING;

INSERT INTO travel_ideas (id, title, description, destination, duration_days, price_from, price_to, currency, category, agency_id, status) VALUES
('550e8400-e29b-41d4-a716-446655440041', 'Romantic Paris Weekend', 'Perfect getaway for couples with Seine cruise and Eiffel Tower dinner', 'Paris, France', 3, 599.00, 899.00, 'EUR', 'romance', '550e8400-e29b-41d4-a716-446655440001', 'active'),
('550e8400-e29b-41d4-a716-446655440042', 'Barcelona Beach & Culture', 'Combine beach relaxation with Gaudí architecture and tapas tours', 'Barcelona, Spain', 5, 750.00, 1200.00, 'EUR', 'culture', '550e8400-e29b-41d4-a716-446655440002', 'active')
ON CONFLICT (id) DO NOTHING;

SELECT 'Step 5 completed: demo data inserted!' as result,
       (SELECT COUNT(*) FROM agencies) as agencies_count,
       (SELECT COUNT(*) FROM users) as users_count,
       (SELECT COUNT(*) FROM feature_requests) as feature_requests_count,
       (SELECT COUNT(*) FROM bookings) as bookings_count,
       (SELECT COUNT(*) FROM travel_ideas) as travel_ideas_count;
