import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sprout, TreeDeciduous, Trees, Crown } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserLevelProps {
  user: User | null;
}

const LEVELS = [
  { name: "Seed", icon: Sprout, minPoints: 0, maxPoints: 100, color: "from-eco-yellow to-eco-orange" },
  { name: "Sapling", icon: Sprout, minPoints: 100, maxPoints: 300, color: "from-eco-green to-eco-teal" },
  { name: "Plant", icon: TreeDeciduous, minPoints: 300, maxPoints: 600, color: "from-eco-teal to-eco-blue" },
  { name: "Tree", icon: Trees, minPoints: 600, maxPoints: 1000, color: "from-eco-blue to-eco-green" },
  { name: "Forest", icon: Crown, minPoints: 1000, maxPoints: 2000, color: "from-eco-orange to-eco-yellow" },
];

export const UserLevel = ({ user }: UserLevelProps) => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPoints();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserPoints = async () => {
    if (!user) return;

    // Calculate points from quiz scores
    const { data: quizData } = await supabase
      .from("quiz_scores")
      .select("score")
      .eq("user_id", user.id);

    // Calculate points from tasks
    const { data: taskData } = await supabase
      .from("daily_tasks")
      .select("points_earned")
      .eq("user_id", user.id);

    const quizPoints = quizData?.reduce((acc, q) => acc + (q.score * 10), 0) || 0;
    const taskPoints = taskData?.reduce((acc, t) => acc + t.points_earned, 0) || 0;
    
    setTotalPoints(quizPoints + taskPoints);
    setLoading(false);
  };

  const getCurrentLevel = () => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalPoints >= LEVELS[i].minPoints) {
        return { level: LEVELS[i], index: i };
      }
    }
    return { level: LEVELS[0], index: 0 };
  };

  const { level: currentLevel, index: levelIndex } = getCurrentLevel();
  const nextLevel = LEVELS[levelIndex + 1];
  const Icon = currentLevel.icon;

  const progressInLevel = totalPoints - currentLevel.minPoints;
  const pointsNeededForNext = (nextLevel?.minPoints || currentLevel.maxPoints) - currentLevel.minPoints;
  const progressPercent = Math.min((progressInLevel / pointsNeededForNext) * 100, 100);

  if (!user) {
    return (
      <Card className="p-4 bg-gradient-to-br from-eco-yellow/10 to-eco-orange/10 border-eco-yellow/20">
        <div className="text-center">
          <Sprout className="h-8 w-8 mx-auto text-eco-yellow mb-2" />
          <p className="text-sm text-muted-foreground">
            Login karo apna level dekhne ke liye!
          </p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-gradient-to-br from-background to-muted/30 border-border/50 overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${currentLevel.color} opacity-5`} />
      
      <div className="relative">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className={`p-3 rounded-xl bg-gradient-to-br ${currentLevel.color} shadow-lg`}
          >
            <Icon className="h-8 w-8 text-white" />
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Level</p>
                <h3 className="font-display font-bold text-xl">{currentLevel.name}</h3>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-eco-green">{totalPoints}</p>
                <p className="text-xs text-muted-foreground">Total Points</p>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                {nextLevel && (
                  <span>Next: {nextLevel.name} ({nextLevel.minPoints} pts)</span>
                )}
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>
        </div>

        {levelIndex === LEVELS.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 p-2 rounded-lg bg-gradient-to-r from-eco-yellow/20 to-eco-orange/20 text-center"
          >
            <p className="text-sm font-bold text-eco-orange">👑 Maximum Level Achieved!</p>
          </motion.div>
        )}
      </div>
    </Card>
  );
};
