import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, TreePine, Droplets, Wind, Globe, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface ImpactCounterProps {
  user: User | null;
}

interface ImpactStats {
  totalQuizzes: number;
  totalTasks: number;
  totalCO2: number;
  treesEquivalent: number;
  waterSaved: number;
}

export const ImpactCounter = ({ user }: ImpactCounterProps) => {
  const [stats, setStats] = useState<ImpactStats>({
    totalQuizzes: 0,
    totalTasks: 0,
    totalCO2: 0,
    treesEquivalent: 0,
    waterSaved: 0,
  });

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    const { data: quizData } = await supabase
      .from("quiz_scores")
      .select("id")
      .eq("user_id", user.id);

    const { data: taskData } = await supabase
      .from("daily_tasks")
      .select("points_earned")
      .eq("user_id", user.id);

    const totalQuizzes = quizData?.length || 0;
    const totalTasks = taskData?.length || 0;
    
    const totalCO2 = (totalQuizzes * 0.5) + (totalTasks * 0.3);
    const treesEquivalent = totalCO2 / 21;
    const waterSaved = totalTasks * 5;

    setStats({
      totalQuizzes,
      totalTasks,
      totalCO2: parseFloat(totalCO2.toFixed(1)),
      treesEquivalent: parseFloat(treesEquivalent.toFixed(2)),
      waterSaved,
    });
  };

  const impactItems = [
    { icon: Wind, value: stats.totalCO2, unit: "kg", label: "CO₂ Saved", gradient: "from-sky-400 to-blue-500", bg: "from-sky-400/10" },
    { icon: TreePine, value: stats.treesEquivalent, unit: "", label: "Trees Equivalent", gradient: "from-emerald-400 to-green-600", bg: "from-emerald-400/10" },
    { icon: Droplets, value: stats.waterSaved, unit: "L", label: "Water Saved", gradient: "from-cyan-400 to-teal-500", bg: "from-cyan-400/10" },
    { icon: Sparkles, value: stats.totalQuizzes + stats.totalTasks, unit: "", label: "Actions Taken", gradient: "from-amber-400 to-orange-500", bg: "from-amber-400/10" },
  ];

  if (!user) {
    return (
      <Card className="p-5 bg-gradient-to-br from-background to-teal-500/5 border-0 shadow-xl h-full flex flex-col justify-center">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 mb-3 shadow-lg shadow-teal-500/30">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-display font-bold text-base mb-1">Tumhara Eco Impact</h3>
          <p className="text-xs text-muted-foreground">
            🔐 Login karo apna impact dekhne ke liye!
          </p>
        </div>
      </Card>
    );
  }

  const hasImpact = stats.totalCO2 > 0;

  return (
    <Card className="p-5 bg-gradient-to-br from-background via-background to-teal-500/5 border-0 shadow-xl overflow-hidden relative h-full">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-cyan-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400/15 to-green-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 mb-2">
            <Globe className="h-4 w-4 text-teal-500" />
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">Tumhara Eco Impact</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 flex-1">
          {impactItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`relative p-3 rounded-xl bg-gradient-to-br ${item.bg} to-transparent border border-border/30 text-center overflow-hidden group hover:border-border/60 transition-all`}
              >
                <div className={`inline-flex p-1.5 rounded-lg bg-gradient-to-br ${item.gradient} mb-1.5 shadow-sm`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <motion.p 
                  key={item.value}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-bold text-lg leading-none"
                >
                  {item.value}{item.unit}
                </motion.p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Impact Message */}
        {hasImpact && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 text-center border border-teal-500/20"
          >
            <p className="text-xs">
              🌱 <span className="font-semibold text-teal-600 dark:text-teal-400">{stats.totalCO2}kg CO₂</span> save kar chuke ho!
            </p>
          </motion.div>
        )}

        {!hasImpact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-2.5 rounded-xl bg-muted/50 text-center"
          >
            <p className="text-xs text-muted-foreground">
              🎯 Quizzes lo aur tasks complete karo!
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
};
