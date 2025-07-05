-- Enable RLS
ALTER TABLE IF EXISTS public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feature_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feature_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.feature_comments;
DROP TABLE IF EXISTS public.feature_votes;
DROP TABLE IF EXISTS public.feature_requests;

-- Create feature_requests table
CREATE TABLE public.feature_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'submitted',
    vote_count INTEGER DEFAULT 0,
    submitter_email TEXT,
    submitter_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feature_votes table
CREATE TABLE public.feature_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_id UUID REFERENCES public.feature_requests(id) ON DELETE CASCADE,
    voter_email TEXT NOT NULL,
    voter_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feature_id, voter_email)
);

-- Create feature_comments table
CREATE TABLE public.feature_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_id UUID REFERENCES public.feature_requests(id) ON DELETE CASCADE,
    commenter_email TEXT NOT NULL,
    commenter_name TEXT,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update vote count
CREATE OR REPLACE FUNCTION update_feature_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.feature_requests 
        SET vote_count = vote_count + 1,
            updated_at = NOW()
        WHERE id = NEW.feature_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.feature_requests 
        SET vote_count = vote_count - 1,
            updated_at = NOW()
        WHERE id = OLD.feature_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote count updates
DROP TRIGGER IF EXISTS feature_vote_count_trigger ON public.feature_votes;
CREATE TRIGGER feature_vote_count_trigger
    AFTER INSERT OR DELETE ON public.feature_votes
    FOR EACH ROW EXECUTE FUNCTION update_feature_vote_count();

-- Create RLS policies
CREATE POLICY "Anyone can view feature requests" ON public.feature_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert feature requests" ON public.feature_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update feature requests" ON public.feature_requests FOR UPDATE USING (true);

CREATE POLICY "Anyone can view votes" ON public.feature_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can vote" ON public.feature_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove their vote" ON public.feature_votes FOR DELETE USING (true);

CREATE POLICY "Anyone can view comments" ON public.feature_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can add comments" ON public.feature_comments FOR INSERT WITH CHECK (true);

-- Insert some sample data
INSERT INTO public.feature_requests (title, description, category, priority, status, submitter_name, submitter_email) VALUES
('AI Hotel Recommendations', 'Intelligente hotel aanbevelingen op basis van klantvoorkeuren en reisgeschiedenis', 'ai', 'high', 'in-development', 'System', 'system@aitravelstudio.nl'),
('Mobile App', 'Native mobile app voor iOS en Android met offline functionaliteit', 'mobile', 'high', 'planned', 'Agent Team', 'agents@aitravelstudio.nl'),
('Multi-language Support', 'Ondersteuning voor meerdere talen in de interface', 'feature', 'medium', 'submitted', 'International Team', 'international@aitravelstudio.nl'),
('Advanced Analytics', 'Uitgebreide analytics dashboard met booking trends en revenue insights', 'analytics', 'medium', 'planned', 'Analytics Team', 'analytics@aitravelstudio.nl'),
('API Rate Limiting', 'Betere rate limiting voor Travel Compositor API calls', 'technical', 'high', 'completed', 'Dev Team', 'dev@aitravelstudio.nl'),
('Dark Mode', 'Dark mode ondersteuning voor alle interfaces', 'ui', 'low', 'submitted', 'UI Team', 'ui@aitravelstudio.nl');

-- Add some sample votes
INSERT INTO public.feature_votes (feature_id, voter_email, voter_name) 
SELECT id, 'user1@example.com', 'Test User 1' FROM public.feature_requests WHERE title = 'AI Hotel Recommendations';

INSERT INTO public.feature_votes (feature_id, voter_email, voter_name) 
SELECT id, 'user2@example.com', 'Test User 2' FROM public.feature_requests WHERE title = 'AI Hotel Recommendations';

INSERT INTO public.feature_votes (feature_id, voter_email, voter_name) 
SELECT id, 'user1@example.com', 'Test User 1' FROM public.feature_requests WHERE title = 'Mobile App';

INSERT INTO public.feature_votes (feature_id, voter_email, voter_name) 
SELECT id, 'user3@example.com', 'Test User 3' FROM public.feature_requests WHERE title = 'Multi-language Support';
