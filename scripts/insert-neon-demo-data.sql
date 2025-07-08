-- Insert demo users
INSERT INTO users (email, first_name, last_name, name, role, status, agency_name, microsite_id) VALUES
('admin@travelstudio.com', 'Admin', 'User', 'Admin User', 'super_admin', 'active', 'Travel Studio HQ', 'main'),
('agent@example.com', 'Travel', 'Agent', 'Travel Agent', 'agent', 'active', 'Dream Destinations', 'agent001'),
('client@example.com', 'John', 'Doe', 'John Doe', 'client', 'active', NULL, NULL)
ON CONFLICT (email) DO NOTHING;

-- Insert demo bookings
INSERT INTO bookings (booking_reference, user_id, destination, status, start_date, end_date, total_price, currency, accommodations, activities) VALUES
('BK001', (SELECT id FROM users WHERE email = 'client@example.com' LIMIT 1), 'Amsterdam', 'active', '2024-06-01', '2024-06-07', 1250.00, 'EUR', 
 '[{"name": "Hotel Amsterdam", "type": "hotel", "nights": 6}]', 
 '[{"name": "Canal Tour", "type": "sightseeing"}]'),
('BK002', (SELECT id FROM users WHERE email = 'client@example.com' LIMIT 1), 'Barcelona', 'completed', '2024-03-15', '2024-03-22', 980.50, 'EUR',
 '[{"name": "Barcelona City Hotel", "type": "hotel", "nights": 7}]',
 '[{"name": "Sagrada Familia Tour", "type": "cultural"}]');

-- Insert demo travel ideas
INSERT INTO travel_ideas (title, description, destination, duration_days, price_from, price_to, currency, category, highlights) VALUES
('Romantic Paris Weekend', 'Perfect getaway for couples with Seine cruise and Eiffel Tower dinner', 'Paris', 3, 450, 850, 'EUR', 'romantic',
 '["Seine River Cruise", "Eiffel Tower Dinner", "Louvre Museum"]'),
('Adventure in Swiss Alps', 'Hiking and mountain adventures in beautiful Switzerland', 'Switzerland', 7, 1200, 2500, 'EUR', 'adventure',
 '["Mountain Hiking", "Cable Car Rides", "Alpine Lakes"]'),
('Cultural Rome Experience', 'Discover ancient history and Italian culture', 'Rome', 5, 600, 1200, 'EUR', 'cultural',
 '["Colosseum Tour", "Vatican Museums", "Roman Forum"]');

-- Insert demo feature requests
INSERT INTO feature_requests (title, description, user_id, category, priority, status, votes) VALUES
('Mobile App Support', 'Create a mobile app for better user experience', (SELECT id FROM users WHERE email = 'agent@example.com' LIMIT 1), 'feature', 'high', 'open', 15),
('Dark Mode Theme', 'Add dark mode option for better usability', (SELECT id FROM users WHERE email = 'client@example.com' LIMIT 1), 'enhancement', 'medium', 'in_progress', 8),
('Export to PDF', 'Allow users to export bookings and itineraries to PDF', (SELECT id FROM users WHERE email = 'admin@travelstudio.com' LIMIT 1), 'feature', 'medium', 'open', 12);
