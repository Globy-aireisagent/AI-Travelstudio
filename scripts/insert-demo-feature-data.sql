-- Insert demo feature requests
INSERT INTO feature_requests (
    title, 
    description, 
    category, 
    priority, 
    status, 
    created_by, 
    user_id,
    votes,
    upvotes,
    downvotes
) VALUES 
(
    'AI-Powered Itinerary Generator',
    'Automatically generate personalized travel itineraries based on user preferences, budget, and travel dates using advanced AI algorithms. This feature would analyze user behavior, past trips, and preferences to create optimal travel plans.',
    'feature',
    'high',
    'in_progress',
    'admin',
    'system',
    15,
    18,
    3
),
(
    'Real-time Flight Price Tracking',
    'Monitor flight prices in real-time and send notifications when prices drop for saved routes. Users can set price alerts and get notified via email or push notifications when their desired price threshold is met.',
    'feature',
    'high',
    'pending',
    'admin',
    'system',
    12,
    14,
    2
),
(
    'Multi-language Support',
    'Add comprehensive support for multiple languages including Dutch, German, French, Spanish, and Italian. This includes UI translation, content localization, and currency conversion.',
    'enhancement',
    'medium',
    'pending',
    'admin',
    'system',
    8,
    10,
    2
),
(
    'Mobile App Performance Optimization',
    'Improve mobile app loading times and reduce memory usage. Focus on optimizing image loading, caching strategies, and reducing bundle size for better user experience on mobile devices.',
    'improvement',
    'medium',
    'in_progress',
    'admin',
    'system',
    6,
    8,
    2
),
(
    'Fix Booking Confirmation Email Bug',
    'Resolve issue where booking confirmation emails are not being sent to users after successful payment. This affects user experience and creates confusion about booking status.',
    'bug',
    'critical',
    'submitted',
    'admin',
    'system',
    20,
    22,
    2
),
(
    'Advanced Search Filters',
    'Implement more sophisticated search and filtering options for accommodations including amenities, accessibility features, pet-friendly options, and custom price ranges.',
    'enhancement',
    'medium',
    'pending',
    'admin',
    'system',
    5,
    7,
    2
),
(
    'Social Media Integration',
    'Allow users to share their travel experiences and itineraries on social media platforms. Include features for photo sharing, trip reviews, and travel recommendations.',
    'feature',
    'low',
    'on_hold',
    'admin',
    'system',
    3,
    5,
    2
),
(
    'Offline Mode Support',
    'Enable core app functionality to work offline, including viewing saved itineraries, maps, and booking details when internet connection is unavailable.',
    'feature',
    'medium',
    'pending',
    'admin',
    'system',
    9,
    11,
    2
),
(
    'Enhanced Security Features',
    'Implement two-factor authentication, biometric login options, and enhanced data encryption to improve user account security and data protection.',
    'improvement',
    'high',
    'completed',
    'admin',
    'system',
    14,
    16,
    2
),
(
    'Travel Insurance Integration',
    'Partner with insurance providers to offer travel insurance options during the booking process. Include coverage comparison and automatic policy generation.',
    'feature',
    'low',
    'rejected',
    'admin',
    'system',
    -2,
    3,
    5
);

-- Insert demo votes for the features
INSERT INTO feature_votes (feature_id, user_id, vote_type) 
SELECT 
    fr.id,
    'demo_user_' || generate_series(1, fr.upvotes),
    'up'
FROM feature_requests fr;

INSERT INTO feature_votes (feature_id, user_id, vote_type) 
SELECT 
    fr.id,
    'demo_user_down_' || generate_series(1, fr.downvotes),
    'down'
FROM feature_requests fr;

-- Insert demo comments
INSERT INTO feature_comments (feature_id, user_id, comment) VALUES
(
    (SELECT id FROM feature_requests WHERE title = 'AI-Powered Itinerary Generator' LIMIT 1),
    'demo_user_1',
    'This would be incredibly useful for our travel agents! The AI could save hours of manual planning.'
),
(
    (SELECT id FROM feature_requests WHERE title = 'AI-Powered Itinerary Generator' LIMIT 1),
    'demo_user_2',
    'Great idea! Could we also include budget optimization in the AI recommendations?'
),
(
    (SELECT id FROM feature_requests WHERE title = 'Real-time Flight Price Tracking' LIMIT 1),
    'demo_user_3',
    'This feature would give us a competitive advantage. When can we expect implementation?'
),
(
    (SELECT id FROM feature_requests WHERE title = 'Multi-language Support' LIMIT 1),
    'demo_user_4',
    'Essential for our European expansion. Dutch and German should be the priority languages.'
),
(
    (SELECT id FROM feature_requests WHERE title = 'Fix Booking Confirmation Email Bug' LIMIT 1),
    'demo_user_5',
    'This is causing customer service issues. We need this fixed ASAP!'
),
(
    (SELECT id FROM feature_requests WHERE title = 'Enhanced Security Features' LIMIT 1),
    'demo_user_6',
    'Excellent work on implementing this! The 2FA feature works perfectly.'
),
(
    (SELECT id FROM feature_requests WHERE title = 'Travel Insurance Integration' LIMIT 1),
    'demo_user_7',
    'I understand the rejection - the insurance market is complex and margins are low.'
);

-- Update the vote counts to match the inserted votes
UPDATE feature_requests 
SET 
    upvotes = (SELECT COUNT(*) FROM feature_votes WHERE feature_id = feature_requests.id AND vote_type = 'up'),
    downvotes = (SELECT COUNT(*) FROM feature_votes WHERE feature_id = feature_requests.id AND vote_type = 'down');

UPDATE feature_requests 
SET votes = upvotes - downvotes;
