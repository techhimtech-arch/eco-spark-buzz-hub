
CREATE OR REPLACE FUNCTION public.get_campaign_leaderboard(_start_date timestamptz, _end_date timestamptz)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  avatar_url text,
  total_quizzes bigint,
  total_score bigint,
  total_questions bigint,
  average_percent numeric,
  rank bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH stats AS (
    SELECT
      p.id AS user_id,
      p.full_name,
      p.avatar_url,
      COUNT(qs.id) AS total_quizzes,
      COALESCE(SUM(qs.score), 0) AS total_score,
      COALESCE(SUM(qs.total_questions), 0) AS total_questions,
      CASE WHEN COALESCE(SUM(qs.total_questions), 0) > 0
        THEN ROUND((SUM(qs.score)::numeric / SUM(qs.total_questions)::numeric) * 100, 2)
        ELSE 0
      END AS average_percent
    FROM profiles p
    JOIN quiz_scores qs ON qs.user_id = p.id
    WHERE qs.completed_at >= _start_date
      AND qs.completed_at <= _end_date
    GROUP BY p.id, p.full_name, p.avatar_url
  )
  SELECT
    *,
    ROW_NUMBER() OVER (ORDER BY total_score DESC, average_percent DESC, total_quizzes DESC) AS rank
  FROM stats
  ORDER BY rank
  LIMIT 100;
$$;
