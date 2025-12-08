import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Droplets, Trash2, Leaf, Sun, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Progress } from "./ui/progress";

interface MiniTasksProps {
  user: User | null;
}

const DAILY_TASKS = [
  { id: "lights", icon: Sun, label: "Extra lights band karo", points: 10, co2: 0.3, gradient: "from-amber-400 to-orange-500" },
  { id: "bottle", icon: Droplets, label: "Reusable bottle refill karo", points: 10, co2: 0.2, gradient: "from-cyan-400 to-blue-500" },
  { id: "waste", icon: Trash2, label: "Waste segregate karo", points: 15, co2: 0.5, gradient: "from-emerald-400 to-green-600" },
  { id: "plant", icon: Leaf, label: "Plants ko paani do", points: 10, co2: 0.1, gradient: "from-lime-400 to-green-500" },
];

export const MiniTasks = ({ user }: MiniTasksProps) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTodaysTasks();
    } else {
      const today = new Date().toDateString();
      const stored = localStorage.getItem(`miniTasks_${today}`);
      if (stored) {
        setCompletedTasks(JSON.parse(stored));
      }
    }
  }, [user]);

  const fetchTodaysTasks = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from("daily_tasks")
      .select("task_type")
      .eq("user_id", user.id)
      .eq("date_completed", today);
    
    if (data) {
      setCompletedTasks(data.map(t => t.task_type));
    }
  };

  const completeTask = async (taskId: string, points: number, co2: number) => {
    if (completedTasks.includes(taskId)) return;
    
    setLoading(true);
    
    if (user) {
      const task = DAILY_TASKS.find(t => t.id === taskId);
      const { error } = await supabase
        .from("daily_tasks")
        .insert({
          user_id: user.id,
          task_type: taskId,
          task_description: task?.label || taskId,
          points_earned: points,
        });
      
      if (error) {
        toast.error("Task save nahi ho payi");
        setLoading(false);
        return;
      }
    }
    
    const newCompleted = [...completedTasks, taskId];
    setCompletedTasks(newCompleted);
    
    const today = new Date().toDateString();
    localStorage.setItem(`miniTasks_${today}`, JSON.stringify(newCompleted));
    
    toast.success(`+${points} points! 🌱 ${co2}kg CO₂ saved!`, {
      description: "Bahut badhiya! Keep going! 💚",
    });
    
    setLoading(false);
  };

  const totalPointsToday = completedTasks.reduce((acc, taskId) => {
    const task = DAILY_TASKS.find(t => t.id === taskId);
    return acc + (task?.points || 0);
  }, 0);

  const totalCO2Today = completedTasks.reduce((acc, taskId) => {
    const task = DAILY_TASKS.find(t => t.id === taskId);
    return acc + (task?.co2 || 0);
  }, 0);

  const progressPercent = (completedTasks.length / DAILY_TASKS.length) * 100;
  const allComplete = completedTasks.length === DAILY_TASKS.length;

  return (
    <Card className="p-5 bg-gradient-to-br from-background via-background to-eco-green/10 border-0 shadow-xl shadow-eco-green/5 overflow-hidden relative h-full">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-eco-green/20 to-eco-teal/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-eco-yellow/20 to-eco-orange/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: allComplete ? 360 : 0 }}
              transition={{ duration: 0.5 }}
              className="p-2.5 rounded-xl bg-gradient-to-br from-eco-green via-eco-teal to-eco-blue shadow-lg shadow-eco-green/30"
            >
              {allComplete ? (
                <Sparkles className="h-5 w-5 text-white" />
              ) : (
                <Zap className="h-5 w-5 text-white" />
              )}
            </motion.div>
            <div>
              <h3 className="font-display font-bold text-base">Aaj Ke Tasks</h3>
              <p className="text-xs text-muted-foreground">{completedTasks.length}/{DAILY_TASKS.length} complete</p>
            </div>
          </div>
          
          <div className="text-right bg-gradient-to-r from-eco-green/10 to-eco-teal/10 px-3 py-1.5 rounded-lg">
            <p className="font-bold text-eco-green text-sm">+{totalPointsToday} pts</p>
            <p className="text-xs text-muted-foreground">{totalCO2Today.toFixed(1)}kg CO₂</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <AnimatePresence>
            {DAILY_TASKS.map((task, index) => {
              const isCompleted = completedTasks.includes(task.id);
              const Icon = task.icon;
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: isCompleted ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    className={`w-full h-auto py-3 px-3 flex flex-col items-center gap-1.5 transition-all duration-300 rounded-xl border-2 ${
                      isCompleted 
                        ? `bg-gradient-to-br ${task.gradient} text-white border-transparent shadow-lg` 
                        : "bg-background/80 hover:bg-muted/50 border-border/50 hover:border-eco-green/30"
                    }`}
                    onClick={() => completeTask(task.id, task.points, task.co2)}
                    disabled={isCompleted || loading}
                  >
                    <motion.div 
                      className={`p-2 rounded-full ${isCompleted ? "bg-white/20" : "bg-muted"}`}
                      animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className={`h-4 w-4 bg-gradient-to-br ${task.gradient} bg-clip-text`} style={{ color: 'transparent', background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text' }} />
                      )}
                    </motion.div>
                    <span className="text-[11px] text-center leading-tight font-medium">{task.label}</span>
                    <span className={`text-[10px] font-bold ${isCompleted ? "text-white/90" : "text-eco-green"}`}>
                      +{task.points} pts
                    </span>
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* All complete celebration */}
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-gradient-to-r from-eco-yellow/20 via-eco-orange/20 to-eco-yellow/20 text-center border border-eco-orange/20"
          >
            <p className="font-bold text-eco-orange text-sm">🎉 Champion ho tum! All tasks done!</p>
          </motion.div>
        )}

        {!user && (
          <p className="mt-3 text-[11px] text-center text-muted-foreground bg-muted/50 py-2 rounded-lg">
            🔐 Login karo progress save karne ke liye
          </p>
        )}
      </div>
    </Card>
  );
};
