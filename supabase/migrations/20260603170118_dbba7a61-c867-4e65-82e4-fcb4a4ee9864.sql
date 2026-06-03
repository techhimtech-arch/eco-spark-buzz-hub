ALTER TABLE public.guest_quiz_scores ADD COLUMN IF NOT EXISTS referred_by text;
CREATE INDEX IF NOT EXISTS idx_guest_quiz_scores_referred_by ON public.guest_quiz_scores(referred_by);