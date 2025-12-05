import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Target, Clock, Flame, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "weekly" | "monthly";
  target_quizzes: number;
  reward_points: number;
  reward_badge_id: string | null;
  start_date: string;
  end_date: string;
}

interface ChallengeProgress {
  challenge_id: string;
  quizzes_completed: number;
  completed_at: string | null;
}

interface QuizChallengesProps {
  user: User | null;
}

export const QuizChallenges = ({ user }: QuizChallengesProps) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Record<string, ChallengeProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, [user]);

  const fetchChallenges = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { data: challengesData, error: challengesError } = await supabase
        .from("challenges")
        .select("*")
        .lte("start_date", today)
        .gte("end_date", today)
        .order("type", { ascending: true });

      if (challengesError) throw challengesError;
      setChallenges((challengesData as Challenge[]) || []);

      if (user && challengesData?.length) {
        const { data: progressData, error: progressError } = await supabase
          .from("user_challenge_progress")
          .select("*")
          .eq("user_id", user.id)
          .in("challenge_id", challengesData.map((c) => c.id));

        if (!progressError && progressData) {
          const progressMap: Record<string, ChallengeProgress> = {};
          progressData.forEach((p: any) => {
            progressMap[p.challenge_id] = p;
          });
          setProgress(progressMap);
        }
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getProgressPercent = (challenge: Challenge) => {
    const userProgress = progress[challenge.id];
    if (!userProgress) return 0;
    return Math.min((userProgress.quizzes_completed / challenge.target_quizzes) * 100, 100);
  };

  const isCompleted = (challenge: Challenge) => {
    const userProgress = progress[challenge.id];
    return userProgress?.completed_at !== null;
  };

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No active challenges right now</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon for new challenges!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-6 h-6 text-orange-500" />
        <h3 className="text-xl font-bold">Active Challenges</h3>
      </div>

      <AnimatePresence>
        {challenges.map((challenge, index) => {
          const progressPercent = getProgressPercent(challenge);
          const completed = isCompleted(challenge);
          const daysRemaining = getDaysRemaining(challenge.end_date);
          const userProgress = progress[challenge.id];

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative overflow-hidden transition-all duration-300 ${
                  completed
                    ? "border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/5"
                    : "border-primary/20 hover:border-primary/40 bg-gradient-to-br from-primary/5 to-secondary/5"
                }`}
              >
                {completed && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500 text-white">
                      <Star className="w-3 h-3 mr-1" /> Completed!
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={challenge.type === "weekly" ? "default" : "secondary"}
                        className={
                          challenge.type === "weekly"
                            ? "bg-blue-500/20 text-blue-500 border-blue-500/30"
                            : "bg-purple-500/20 text-purple-500 border-purple-500/30"
                        }
                      >
                        {challenge.type === "weekly" ? (
                          <Calendar className="w-3 h-3 mr-1" />
                        ) : (
                          <Trophy className="w-3 h-3 mr-1" />
                        )}
                        {challenge.type}
                      </Badge>
                      {!completed && daysRemaining <= 3 && (
                        <Badge variant="destructive" className="animate-pulse">
                          <Clock className="w-3 h-3 mr-1" />
                          {daysRemaining}d left
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{challenge.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Target className="w-4 h-4" />
                        Progress
                      </span>
                      <span className="font-medium">
                        {userProgress?.quizzes_completed || 0} / {challenge.target_quizzes} quizzes
                      </span>
                    </div>
                    <Progress
                      value={progressPercent}
                      className={`h-3 ${completed ? "[&>div]:bg-green-500" : ""}`}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        +{challenge.reward_points} points
                      </span>
                    </div>
                    {!completed && (
                      <span className="text-xs text-muted-foreground">
                        Ends {new Date(challenge.end_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {!user && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Sign in to track your challenge progress!
        </p>
      )}
    </div>
  );
};
