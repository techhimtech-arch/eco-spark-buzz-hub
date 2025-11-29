-- Create quiz_questions table for admin to manage questions
CREATE TABLE public.quiz_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  options jsonb NOT NULL, -- Array of answer options
  correct_answer integer NOT NULL,
  category text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'medium',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create blogs table for admin-created content
CREATE TABLE public.blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  image_url text,
  category text NOT NULL DEFAULT 'news',
  published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create badges table for predefined achievements
CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL,
  requirement text NOT NULL, -- Description of how to earn
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_badges junction table
CREATE TABLE public.user_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create user_actions table for tracking real-world actions
CREATE TABLE public.user_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL, -- e.g., 'recycle', 'plant_tree', 'reduce_plastic'
  description text NOT NULL,
  impact_value numeric NOT NULL DEFAULT 0, -- CO2 saved or similar metric
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_questions
CREATE POLICY "Anyone can view published quiz questions"
  ON public.quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage quiz questions"
  ON public.quiz_questions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for blogs
CREATE POLICY "Anyone can view published blogs"
  ON public.blogs FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage blogs"
  ON public.blogs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for badges
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage badges"
  ON public.badges FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' badge counts"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage user badges"
  ON public.user_badges FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_actions
CREATE POLICY "Users can view their own actions"
  ON public.user_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions"
  ON public.user_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all actions"
  ON public.user_actions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert predefined badges
INSERT INTO public.badges (name, description, icon, requirement) VALUES
  ('First Steps', 'Complete your first quiz', 'Award', 'Complete 1 quiz'),
  ('Knowledge Seeker', 'Complete 5 quizzes', 'BookOpen', 'Complete 5 quizzes'),
  ('Eco Warrior', 'Complete 10 quizzes', 'Trophy', 'Complete 10 quizzes'),
  ('Perfect Score', 'Get 100% on any quiz', 'Star', 'Score 100% on a quiz'),
  ('Action Taker', 'Log your first real-world action', 'Leaf', 'Log 1 action'),
  ('Change Maker', 'Log 10 real-world actions', 'Sparkles', 'Log 10 actions');