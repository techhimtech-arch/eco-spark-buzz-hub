import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sprout, TreeDeciduous, Trees, Crown, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserLevelProps {
  user: User | null;
}

const LEVELS = [
  { name: "Seed", icon: Sprout, minPoints: 0, maxPoints: 100, gradient: "from-amber-400 to-yellow-500", bgGlow: "from-amber-400/20" },
  { name: "Sapling", icon: Sprout, minPoints: 100, maxPoints: 300, gradient: "from-lime-400 to-green-500", bgGlow: "from-lime-400/20" },
  { name: "Plant", icon: TreeDeciduous, minPoints: 300, maxPoints: 600, gradient: "from-emerald-400 to-teal-500", bgGlow: "from-emerald-400/20" },
  { name: "Tree", icon: Trees, minPoints: 600, maxPoints: 1000, gradient: "from-teal-400 to-cyan-500", bgGlow: "from-teal-400/20" },
  { name: "Forest", icon: Crown, minPoints: 1000, maxPoints: 2000, gradient: "from-violet-400 to-purple-600", bgGlow: "from-violet-400/20" },
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

    const { data: quizData } = await supabase
      .from("quiz_scores")
      .select("score")
      .eq("user_id", user.id);

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
  const isMaxLevel = levelIndex === LEVELS.length - 1;

  if (!user) {
    return (
      <Card className="p-5 bg-gradient-to-br from-background to-amber-500/5 border-0 shadow-xl h-full flex flex-col justify-center">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 mb-3 shadow-lg shadow-amber-500/30">
            <Sprout className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-display font-bold text-base mb-1">Apna Level Dekho</h3>
          <p className="text-xs text-muted-foreground">
            🔐 Login karo level unlock karne ke liye!
          </p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-5 h-full">
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-muted rounded-xl" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-2 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-gradient-to-br from-background via-background to-transparent border-0 shadow-xl overflow-hidden relative h-full">
      {/* Dynamic background glow based on level */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentLevel.bgGlow} to-transparent opacity-50`} />
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${currentLevel.gradient} opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
      
      <div className="relative flex flex-col h-full">
        {/* Level Badge */}
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="relative"
          >
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentLevel.gradient} shadow-lg`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
            {isMaxLevel && (
              <motion.div 
                className="absolute -top-1 -right-1"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
              </motion.div>
            )}
          </motion.div>
          
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Current Level</p>
            <h3 className={`font-display font-bold text-xl bg-gradient-to-r ${currentLevel.gradient} bg-clip-text text-transparent`}>
              {currentLevel.name}
            </h3>
          </div>
          
          <div className="text-right">
            <motion.p 
              key={totalPoints}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="font-bold text-xl text-foreground"
            >
              {totalPoints}
            </motion.p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Points</p>
          </div>
        </div>
        
        {/* Progress Section */}
        <div className="flex-1 flex flex-col justify-center">
          {!isMaxLevel && nextLevel && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Progress
                </span>
                <span className="font-medium text-muted-foreground">
                  Next: <span className={`bg-gradient-to-r ${nextLevel.gradient} bg-clip-text text-transparent font-bold`}>{nextLevel.name}</span>
                </span>
              </div>
              
              <div className="relative">
                <Progress value={progressPercent} className="h-3" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${nextLevel.gradient} flex items-center justify-center shadow-md`}>
                    {(() => { const NextIcon = nextLevel.icon; return <NextIcon className="h-3 w-3 text-white" />; })()}
                  </div>
                </div>
              </div>
              
              <p className="text-[11px] text-muted-foreground text-center">
                <span className="font-semibold text-foreground">{nextLevel.minPoints - totalPoints}</span> points more needed
              </p>
            </div>
          )}

          {isMaxLevel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/10 text-center border border-violet-500/20"
            >
              <p className="text-sm font-bold text-violet-400 flex items-center justify-center gap-1">
                <Crown className="h-4 w-4" /> Maximum Level! Legend ho tum!
              </p>
            </motion.div>
          )}
        </div>

        {/* Level Indicators */}
        <div className="flex justify-between mt-4 pt-3 border-t border-border/50">
          {LEVELS.map((lvl, i) => {
            const LvlIcon = lvl.icon;
            const isActive = i <= levelIndex;
            return (
              <motion.div
                key={lvl.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-1"
              >
                <div className={`p-1.5 rounded-lg ${isActive ? `bg-gradient-to-br ${lvl.gradient}` : 'bg-muted'}`}>
                  <LvlIcon className={`h-3 w-3 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-[9px] ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {lvl.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
