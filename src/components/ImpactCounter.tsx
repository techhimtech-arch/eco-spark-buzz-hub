import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, TreePine, Droplets, Wind } from "lucide-react";
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

    // Fetch quiz scores count
    const { data: quizData } = await supabase
      .from("quiz_scores")
      .select("id")
      .eq("user_id", user.id);

    // Fetch tasks count
    const { data: taskData } = await supabase
      .from("daily_tasks")
      .select("points_earned")
      .eq("user_id", user.id);

    const totalQuizzes = quizData?.length || 0;
    const totalTasks = taskData?.length || 0;
    
    // Calculate impact (simplified formula)
    // Each quiz = 0.5kg CO2 awareness, each task = 0.3kg CO2 saved
    const totalCO2 = (totalQuizzes * 0.5) + (totalTasks * 0.3);
    const treesEquivalent = totalCO2 / 21; // 1 tree absorbs ~21kg CO2/year
    const waterSaved = totalTasks * 5; // Each task saves ~5L water on average

    setStats({
      totalQuizzes,
      totalTasks,
      totalCO2: parseFloat(totalCO2.toFixed(1)),
      treesEquivalent: parseFloat(treesEquivalent.toFixed(2)),
      waterSaved,
    });
  };

  const impactItems = [
    { icon: Wind, value: `${stats.totalCO2}kg`, label: "CO₂ Saved", color: "from-eco-blue to-eco-teal" },
    { icon: TreePine, value: `${stats.treesEquivalent}`, label: "Trees Equivalent", color: "from-eco-green to-eco-teal" },
    { icon: Droplets, value: `${stats.waterSaved}L`, label: "Water Saved", color: "from-eco-teal to-eco-blue" },
    { icon: Leaf, value: `${stats.totalQuizzes + stats.totalTasks}`, label: "Actions Taken", color: "from-eco-yellow to-eco-orange" },
  ];

  if (!user) {
    return (
      <Card className="p-6 bg-gradient-to-br from-eco-green/10 to-eco-blue/10 border-eco-green/20">
        <div className="text-center">
          <h3 className="font-display font-bold text-lg mb-2">🌍 Tumhara Impact</h3>
          <p className="text-muted-foreground text-sm">
            Login karo apna eco impact dekhne ke liye!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-eco-teal/5 border-eco-teal/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-eco-green/10 to-eco-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative">
        <h3 className="font-display font-bold text-lg mb-4 text-center">
          🌍 Tumhara Eco Impact
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {impactItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-3 rounded-xl bg-background/50 border border-border/50"
              >
                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${item.color} mb-2`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="font-bold text-lg">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </motion.div>
            );
          })}
        </div>

        {stats.totalCO2 > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-3 rounded-lg bg-gradient-to-r from-eco-green/20 to-eco-teal/20 text-center"
          >
            <p className="text-sm">
              🌱 Tum <span className="font-bold text-eco-green">{stats.totalCO2}kg CO₂</span> save kar chuke ho!
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
};
