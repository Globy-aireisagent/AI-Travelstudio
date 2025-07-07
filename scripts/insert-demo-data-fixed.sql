-- Clear existing demo data first to avoid conflicts
DELETE FROM feature_votes WHERE user_id LIKE '%demo%';
DELETE FROM feature_comments WHERE user_id LIKE '%demo%';
DELETE FROM feature_requests WHERE user_id LIKE '%demo%';
DELETE FROM user_bookings WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%demo%'
);
DELETE FROM bookings WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%demo%'
);
DELETE FROM users WHERE email LIKE '%demo%';
DELETE FROM agencies WHERE code LIKE 'DEMO%' OR code LIKE 'ADV%' OR code LIKE 'CITY%';

-- Insert demo agencies
INSERT INTO agencies (id, name, code, contact_email, contact_phone, active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Demo Travel Agency', 'DEMO001', 'info@demo-travel.com', '+31-20-1234567', true),
('550e8400-e29b-41d4-a716-446655440002', 'Adventure Tours Ltd', 'ADV002', 'contact@adventure-tours.com', '+31-20-7654321', true),
('550e8400-e29b-41d4-a716-446655440003', 'City Break Specialists', 'CITY003', 'hello@citybreaks.com', '+31-20-9876543', true);

-- Insert demo users with correct role values (only using allowed roles)
INSERT INTO users (id, email, first_name, last_name, name, role, status, agency_id, active) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'agent@demo.com', 'Demo', 'Agent', 'Demo Agent', 'agent', 'active', '550e8400-e29b-41d4-a716-446655440001', true),
('550e8400-e29b-41d4-a716-446655440012', 'admin@demo.com', 'Demo', 'Admin', 'Demo Admin', 'admin', 'active', '550e8400-e29b-41d4-a716-446655440001', true),
('550e8400-e29b-41d4-a716-446655440013', 'client@demo.com', 'Demo', 'Client', 'Demo Client', 'client', 'active', '550e8400-e29b-41d4-a716-446655440002', true),
('550e8400-e29b-41d4-a716-446655440014', 'super@demo.com', 'Super', 'Admin', 'Super Admin', 'super_admin', 'active', '550e8400-e29b-41d4-a716-446655440001', true);

-- Insert demo feature requests
INSERT INTO feature_requests (id, title, description, user_id, category, priority, status, votes) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'Advanced Booking Search', 'Add more sophisticated search filters for bookings including date ranges, destinations, and price ranges.', 'agent@demo.com', 'enhancement', 'high', 'in_progress', 15),
('550e8400-e29b-41d4-a716-446655440022', 'Mobile App Integration', 'Develop a mobile application that syncs with the web platform for on-the-go access.', 'admin@demo.com', 'feature', 'medium', 'open', 8),
('550e8400-e29b-41d4-a716-446655440023', 'Real-time Notifications', 'Implement push notifications for booking updates, payment confirmations, and travel alerts.', 'client@demo.com', 'enhancement', 'medium', 'open', 12),
('550e8400-e29b-41d4-a716-446655440024', 'Multi-language Support', 'Add support for multiple languages including Dutch, German, French, and Spanish.', 'agent@demo.com', 'feature', 'low', 'open', 6),
('550e8400-e29b-41d4-a716-446655440025', 'Automated Reporting', 'Generate automated monthly reports for agencies with booking statistics and revenue data.', 'admin@demo.com', 'enhancement', 'high', 'completed', 20),
('550e8400-e29b-41d4-a716-446655440026', 'Calendar Integration', 'Integrate with popular calendar applications like Google Calendar and Outlook.', 'client@demo.com', 'feature', 'medium', 'on_hold', 4),
('550e8400-e29b-41d4-a716-446655440027', 'Dark Mode Theme', 'Add a dark mode option for better user experience during evening hours.', 'agent@demo.com', 'improvement', 'low', 'open', 9),
('550e8400-e29b-41d4-a716-446655440028', 'Export to PDF', 'Allow users to export booking details and itineraries as PDF documents.', 'admin@demo.com', 'enhancement', 'medium', 'in_progress', 11),
('550e8400-e29b-41d4-a716-446655440029', 'Social Media Sharing', 'Enable sharing of travel experiences and bookings on social media platforms.', 'client@demo.com', 'feature', 'low', 'rejected', 2),
('550e8400-e29b-41d4-a716-446655440030', 'Advanced Analytics Dashboard', 'Create comprehensive analytics with charts, trends, and predictive insights.', 'super@demo.com', 'feature', 'critical', 'open', 18);

-- Insert demo feature votes
INSERT INTO feature_votes (feature_id, user_id, vote_type) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'agent@demo.com', 'up'),
('550e8400-e29b-41d4-a716-446655440021', 'admin@demo.com', 'up'),
('550e8400-e29b-41d4-a716-446655440021', 'client@demo.com', 'up'),
('550e8400-e29b-41d4-a716-446655440022', 'agent@demo.com', 'up'),
('550e8400-e29b-41d4-a716-446655440022', 'client@demo.com', 'down'),
('550e8400-e29b-41d4-a716-446655440023', 'admin@demo.com', 'up'),
('550e8400-e29b-41d4-a716-446655440023', 'client@demo.com', 'up'),
('550e8400-e29b-41d4-a716-446655440024', 'agent@demo.com', 'up'),
('550e8400-e29b-41d4-a716-446655440025', 'admin@demo.com', 'up'),
('550e8400-e29b-41d4-a716-446655440025', 'super@demo.com', 'up');

-- Insert demo feature comments
INSERT INTO feature_comments (feature_id, user_id, user_name, comment) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'agent@demo.com', 'Demo Agent', 'This would really help with finding specific bookings quickly. Currently it takes too long to locate older bookings.'),
('550e8400-e29b-41d4-a716-446655440021', 'admin@demo.com', 'Demo Admin', 'Agreed! We should also include filters for booking status and agency.'),
('550e8400-e29b-41d4-a716-446655440022', 'client@demo.com', 'Demo Client', 'A mobile app would be fantastic for checking bookings while traveling.'),
('550e8400-e29b-41d4-a716-446655440023', 'admin@demo.com', 'Demo Admin', 'Real-time notifications are essential for keeping clients informed about their travel plans.'),
('550e8400-e29b-41d4-a716-446655440024', 'agent@demo.com', 'Demo Agent', 'Multi-language support would help us serve international clients better.'),
('550e8400-e29b-41d4-a716-446655440025', 'super@demo.com', 'Super Admin', 'The automated reporting feature has been completed and is working great!'),
('550e8400-e29b-41d4-a716-446655440027', 'client@demo.com', 'Demo Client', 'Dark mode would be much easier on the eyes during late-night planning sessions.'),
('550e8400-e29b-41d4-a716-446655440030', 'admin@demo.com', 'Demo Admin', 'Advanced analytics would provide valuable insights for business decisions.');

-- Insert demo bookings
INSERT INTO bookings (id, booking_reference, user_id, agency_id, status, destination, start_date, end_date, total_price, currency) VALUES
('550e8400-e29b-41d4-a716-446655440041', 'DEMO-2025-001', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'active', 'Amsterdam, Netherlands', '2025-08-15 10:00:00+00', '2025-08-20 18:00:00+00', 1250.00, 'EUR'),
('550e8400-e29b-41d4-a716-446655440042', 'DEMO-2025-002', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'completed', 'Paris, France', '2025-07-01 09:00:00+00', '2025-07-05 20:00:00+00', 890.50, 'EUR'),
('550e8400-e29b-41d4-a716-446655440043', 'DEMO-2025-003', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'pending', 'Barcelona, Spain', '2025-09-10 12:00:00+00', '2025-09-17 16:00:00+00', 1680.75, 'EUR');

-- Insert demo user_bookings relationships
INSERT INTO user_bookings (user_id, booking_id, relationship) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440041', 'owner'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440042', 'owner'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440043', 'owner'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440041', 'collaborator');

-- Insert demo travel ideas
INSERT INTO travel_ideas (id, title, description, destination, active) VALUES
('550e8400-e29b-41d4-a716-446655440051', 'Romantic Weekend in Venice', 'A perfect romantic getaway with gondola rides, fine dining, and historic sightseeing.', 'Venice, Italy', true),
('550e8400-e29b-41d4-a716-446655440052', 'Adventure Hiking in Swiss Alps', 'Experience breathtaking mountain views and challenging hiking trails in Switzerland.', 'Swiss Alps, Switzerland', true),
('550e8400-e29b-41d4-a716-446655440053', 'Cultural Tour of Prague', 'Discover the rich history and stunning architecture of the Czech Republic capital.', 'Prague, Czech Republic', true),
('550e8400-e29b-41d4-a716-446655440054', 'Beach Relaxation in Santorini', 'Unwind on beautiful beaches with crystal clear waters and stunning sunsets.', 'Santorini, Greece', true);

-- Insert demo holiday packages
INSERT INTO holiday_packages (id, name, description, destination, duration_days, price, currency, active) VALUES
('550e8400-e29b-41d4-a716-446655440061', 'Mediterranean Cruise', 'A luxurious 7-day cruise visiting multiple Mediterranean ports.', 'Mediterranean Sea', 7, 1299.00, 'EUR', true),
('550e8400-e29b-41d4-a716-446655440062', 'Northern Lights Adventure', 'Experience the magical Northern Lights in Iceland with guided tours.', 'Reykjavik, Iceland', 5, 899.00, 'EUR', true),
('550e8400-e29b-41d4-a716-446655440063', 'City Break London', 'Explore London''s iconic landmarks, museums, and theaters.', 'London, UK', 4, 650.00, 'EUR', true);

-- Update the vote counts to match the actual votes
UPDATE feature_requests SET votes = (
  SELECT COALESCE(
    (SELECT COUNT(*) FROM feature_votes WHERE feature_votes.feature_id = feature_requests.id AND vote_type = 'up') -
    (SELECT COUNT(*) FROM feature_votes WHERE feature_votes.feature_id = feature_requests.id AND vote_type = 'down'),
    0
  )
);
