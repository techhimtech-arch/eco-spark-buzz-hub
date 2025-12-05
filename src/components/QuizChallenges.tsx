import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Target, Clock, Flame, Star, Sparkles, Zap } from "lucide-react";
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
      <Card className="border-0 bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5OTkiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <CardContent className="p-8 text-center relative">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">Koi active challenge nahi hai</p>
          <p className="text-sm text-muted-foreground mt-1">Jaldi naye challenges aayenge! 🎯</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold">Active Challenges</h3>
          <p className="text-sm text-muted-foreground">Complete karo aur rewards jeeto!</p>
        </div>
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
                className={`relative overflow-hidden border-0 transition-all duration-300 hover:shadow-xl ${
                  completed
                    ? "bg-gradient-to-br from-emerald-500/20 to-green-500/10"
                    : "bg-gradient-to-br from-card to-muted/30 hover:-translate-y-1"
                }`}
              >
                {/* Decorative corner */}
                <div className={`absolute top-0 right-0 w-24 h-24 ${completed ? "bg-emerald-500/10" : "bg-primary/5"} rounded-bl-full`} />
                
                {completed && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3"
                  >
                    <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" /> Complete!
                    </Badge>
                  </motion.div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={
                        challenge.type === "weekly"
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                          : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                      }
                    >
                      {challenge.type === "weekly" ? (
                        <Calendar className="w-3 h-3 mr-1" />
                      ) : (
                        <Trophy className="w-3 h-3 mr-1" />
                      )}
                      {challenge.type === "weekly" ? "Weekly" : "Monthly"}
                    </Badge>
                    {!completed && daysRemaining <= 3 && (
                      <Badge variant="destructive" className="animate-pulse">
                        <Clock className="w-3 h-3 mr-1" />
                        {daysRemaining} din baaki!
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3 font-display">{challenge.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Target className="w-4 h-4" />
                        Progress
                      </span>
                      <span className="font-semibold">
                        {userProgress?.quizzes_completed || 0} / {challenge.target_quizzes}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={progressPercent}
                        className={`h-3 ${completed ? "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-500" : "[&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent"}`}
                      />
                      {progressPercent > 0 && progressPercent < 100 && (
                        <motion.div
                          className="absolute top-0 right-0 -translate-y-1/2"
                          style={{ left: `${progressPercent}%` }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Zap className="w-4 h-4 text-primary fill-primary" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2 bg-warning/10 px-3 py-1.5 rounded-full">
                      <Trophy className="w-4 h-4 text-warning" />
                      <span className="text-sm font-bold text-warning">
                        +{challenge.reward_points} points
                      </span>
                    </div>
                    {!completed && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(challenge.end_date).toLocaleDateString("hi-IN")} tak
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-4 rounded-xl bg-primary/5 border border-primary/20"
        >
          <p className="text-sm text-muted-foreground">
            🔐 Sign in karo apna progress track karne ke liye!
          </p>
        </motion.div>
      )}
    </div>
  );
};
