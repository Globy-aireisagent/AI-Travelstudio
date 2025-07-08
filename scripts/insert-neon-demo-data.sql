-- Insert demo users
INSERT INTO users (email, first_name, last_name, name, role, status, agency_name, microsite_id) VALUES
('demo@agent.com', 'Demo', 'Agent', 'Demo Agent', 'agent', 'active', 'Demo Travel Agency', '1'),
('admin@travelstudio.com', 'Admin', 'User', 'Admin User', 'admin', 'active', 'Travel Studio', '1'),
('agent1@example.com', 'Sarah', 'Johnson', 'Sarah Johnson', 'agent', 'active', 'Global Travel', '2'),
('agent2@example.com', 'Mike', 'Chen', 'Mike Chen', 'agent', 'active', 'Adventure Tours', '3')
ON CONFLICT (email) DO NOTHING;

-- Insert demo agencies
INSERT INTO agencies (name, code, contact_email, active) VALUES
('Demo Travel Agency', 'DEMO', 'info@demo-travel.com', true),
('Global Travel', 'GLOBAL', 'contact@global-travel.com', true),
('Adventure Tours', 'ADVENT', 'hello@adventure-tours.com', true)
ON CONFLICT DO NOTHING;

-- Insert demo bookings
INSERT INTO bookings (booking_reference, status, destination, start_date, end_date, total_price, currency, microsite_source) VALUES
('TC-2025-001', 'active', 'Seoul, Zuid-Korea', '2025-03-15', '2025-03-25', 3450.00, 'EUR', '1'),
('TC-2025-002', 'completed', 'Tokyo, Japan', '2025-02-10', '2025-02-20', 2800.00, 'EUR', '2'),
('TC-2025-003', 'pending', 'Barcelona, Spanje', '2025-04-05', '2025-04-15', 1850.00, 'EUR', '1'),
('TC-2025-004', 'active', 'Bali, Indonesië', '2025-05-20', '2025-06-05', 2950.00, 'EUR', '3')
ON CONFLICT DO NOTHING;

-- Insert demo travel ideas
INSERT INTO travel_ideas (title, description, destination, duration_days, price_from, price_to, currency, category, status) VALUES
('Authentiek Japan Avontuur', 'Ontdek de verborgen schatten van Japan met lokale gidsen', 'Tokyo, Kyoto, Osaka', 10, 2500, 3500, 'EUR', 'cultuur', 'ACTIVE'),
('Safari Avontuur Kenya', 'Wilde dieren in hun natuurlijke habitat observeren', 'Masai Mara, Amboseli', 8, 3800, 4500, 'EUR', 'natuur', 'ACTIVE'),
('Romantisch Parijs Weekend', 'Perfect voor koppels die van cultuur en gastronomie houden', 'Parijs, Frankrijk', 3, 800, 1200, 'EUR', 'romantiek', 'ACTIVE'),
('Avontuurlijke Alpen Trek', 'Wandelen door de prachtige Zwitserse Alpen', 'Zwitserland', 7, 1500, 2200, 'EUR', 'avontuur', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Insert demo feature requests
INSERT INTO feature_requests (title, description, category, priority, status, votes) VALUES
('AI Content Generator Verbetering', 'Voeg meer templates toe voor verschillende bestemmingen', 'enhancement', 'high', 'in_progress', 15),
('Mobile App Ondersteuning', 'Ontwikkel een mobiele app voor agents onderweg', 'feature', 'medium', 'open', 8),
('Betere PDF Export', 'Verbeter de kwaliteit van geëxporteerde roadbooks', 'improvement', 'medium', 'open', 12),
('Real-time Chat met Klanten', 'Integreer chat functionaliteit in roadbooks', 'feature', 'high', 'open', 22)
ON CONFLICT DO NOTHING;
