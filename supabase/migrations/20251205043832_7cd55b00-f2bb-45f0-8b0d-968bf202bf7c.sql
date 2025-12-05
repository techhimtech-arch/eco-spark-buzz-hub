-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly')),
  target_quizzes INTEGER NOT NULL DEFAULT 5,
  reward_points INTEGER NOT NULL DEFAULT 100,
  reward_badge_id UUID REFERENCES public.badges(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user challenge progress table
CREATE TABLE public.user_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  quizzes_completed INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Challenges policies
CREATE POLICY "Anyone can view challenges"
ON public.challenges FOR SELECT
USING (true);

CREATE POLICY "Admins can manage challenges"
ON public.challenges FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- User challenge progress policies
CREATE POLICY "Users can view their own progress"
ON public.user_challenge_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_challenge_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_challenge_progress FOR UPDATE
USING (auth.uid() = user_id);