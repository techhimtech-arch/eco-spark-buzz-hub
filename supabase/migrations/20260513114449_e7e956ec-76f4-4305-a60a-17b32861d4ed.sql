CREATE TABLE public.guest_quiz_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_quiz_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guest scores"
ON public.guest_quiz_scores
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert guest scores"
ON public.guest_quiz_scores
FOR INSERT
WITH CHECK (
  char_length(trim(player_name)) BETWEEN 1 AND 30
  AND score >= 0
  AND total_questions > 0
  AND score <= total_questions
);

CREATE INDEX idx_guest_scores_leaderboard ON public.guest_quiz_scores (score DESC, completed_at DESC);