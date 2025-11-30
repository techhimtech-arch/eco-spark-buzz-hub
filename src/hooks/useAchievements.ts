import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Achievement {
  name: string;
  description: string;
  icon: string;
}

export const useAchievements = () => {
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);

  const checkAndAwardAchievements = useCallback(async (userId: string) => {
    try {
      // Fetch user stats
      const [quizScores, userBadges, userActions, leaderboardData] = await Promise.all([
        supabase.from("quiz_scores").select("*").eq("user_id", userId),
        supabase.from("user_badges").select("*, badges(*)").eq("user_id", userId),
        supabase.from("user_actions").select("*").eq("user_id", userId),
        supabase.rpc("get_leaderboard_data"),
      ]);

      const totalQuizzes = quizScores.data?.length || 0;
      const totalBadges = userBadges.data?.length || 0;
      const totalImpact = userActions.data?.reduce((sum, action) => sum + Number(action.impact_value), 0) || 0;
      const hasPerfectScore = quizScores.data?.some(
        (quiz) => quiz.score === quiz.total_questions
      ) || false;

      // Get user rank
      const userRank = leaderboardData.data?.findIndex(
        (user: any) => user.user_id === userId
      );
      const rank = userRank !== undefined && userRank !== -1 ? userRank + 1 : null;

      // Fetch all badges to check requirements
      const { data: allBadges } = await supabase.from("badges").select("*");
      
      // Get already earned badge IDs
      const earnedBadgeIds = new Set(userBadges.data?.map((ub: any) => ub.badge_id) || []);

      // Check each achievement condition
      const achievementsToAward: any[] = [];

      allBadges?.forEach((badge) => {
        if (earnedBadgeIds.has(badge.id)) return; // Already has this badge

        let shouldAward = false;

        switch (badge.requirement) {
          case "complete_1_quiz":
            shouldAward = totalQuizzes >= 1;
            break;
          case "complete_5_quizzes":
            shouldAward = totalQuizzes >= 5;
            break;
          case "complete_10_quizzes":
            shouldAward = totalQuizzes >= 10;
            break;
          case "perfect_score":
            shouldAward = hasPerfectScore;
            break;
          case "earn_5_badges":
            shouldAward = totalBadges >= 5;
            break;
          case "earn_10_badges":
            shouldAward = totalBadges >= 10;
            break;
          case "top_50_rank":
            shouldAward = rank !== null && rank <= 50;
            break;
          case "top_10_rank":
            shouldAward = rank !== null && rank <= 10;
            break;
          case "top_3_rank":
            shouldAward = rank !== null && rank <= 3;
            break;
          case "impact_100":
            shouldAward = totalImpact >= 100;
            break;
          case "impact_500":
            shouldAward = totalImpact >= 500;
            break;
        }

        if (shouldAward) {
          achievementsToAward.push(badge);
        }
      });

      // Award new badges
      for (const badge of achievementsToAward) {
        const { error } = await supabase.from("user_badges").insert({
          user_id: userId,
          badge_id: badge.id,
        });

        if (!error) {
          // Show celebration for the first achievement
          if (achievementsToAward.indexOf(badge) === 0) {
            setCelebratingAchievement({
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
            });
          } else {
            toast.success(`Achievement unlocked: ${badge.name}!`);
          }
        }
      }

      return achievementsToAward.length > 0;
    } catch (error) {
      console.error("Error checking achievements:", error);
      return false;
    }
  }, []);

  const closeCelebration = useCallback(() => {
    setCelebratingAchievement(null);
  }, []);

  return {
    celebratingAchievement,
    closeCelebration,
    checkAndAwardAchievements,
  };
};
