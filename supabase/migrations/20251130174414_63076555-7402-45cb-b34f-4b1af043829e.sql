-- Create a function to get leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard_data()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  total_quizzes bigint,
  average_score numeric,
  total_badges bigint,
  total_impact numeric,
  overall_rank bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_stats AS (
    SELECT 
      p.id as user_id,
      p.full_name,
      p.avatar_url,
      COALESCE(COUNT(DISTINCT qs.id), 0) as total_quizzes,
      COALESCE(
        ROUND(
          AVG(CASE WHEN qs.total_questions > 0 
            THEN (qs.score::numeric / qs.total_questions::numeric) * 100 
            ELSE 0 
          END)
        , 2), 
        0
      ) as average_score,
      COALESCE(COUNT(DISTINCT ub.id), 0) as total_badges,
      COALESCE(SUM(ua.impact_value), 0) as total_impact
    FROM profiles p
    LEFT JOIN quiz_scores qs ON p.id = qs.user_id
    LEFT JOIN user_badges ub ON p.id = ub.user_id
    LEFT JOIN user_actions ua ON p.id = ua.user_id
    GROUP BY p.id, p.full_name, p.avatar_url
    HAVING COUNT(DISTINCT qs.id) > 0 
        OR COUNT(DISTINCT ub.id) > 0 
        OR COALESCE(SUM(ua.impact_value), 0) > 0
  )
  SELECT 
    *,
    ROW_NUMBER() OVER (
      ORDER BY 
        (total_quizzes * 10 + average_score + total_badges * 50 + total_impact) DESC
    ) as overall_rank
  FROM user_stats
  ORDER BY overall_rank
  LIMIT 100;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_leaderboard_data() TO authenticated;