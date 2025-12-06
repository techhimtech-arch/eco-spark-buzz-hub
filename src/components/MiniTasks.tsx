import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Droplets, Trash2, Leaf, Sun } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface MiniTasksProps {
  user: User | null;
}

const DAILY_TASKS = [
  { id: "lights", icon: Sun, label: "Extra lights band karo", points: 10, co2: 0.3 },
  { id: "bottle", icon: Droplets, label: "Reusable bottle refill karo", points: 10, co2: 0.2 },
  { id: "waste", icon: Trash2, label: "Waste segregate karo", points: 15, co2: 0.5 },
  { id: "plant", icon: Leaf, label: "Plants ko paani do", points: 10, co2: 0.1 },
];

export const MiniTasks = ({ user }: MiniTasksProps) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTodaysTasks();
    } else {
      // Load from localStorage for non-logged users
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
    
    // Store in localStorage as backup
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

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-eco-green/5 border-eco-green/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-eco-green to-eco-teal">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-display font-bold text-lg">Aaj Ke Mini Tasks</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today's Impact</p>
          <p className="font-bold text-eco-green">+{totalPointsToday} pts | {totalCO2Today.toFixed(1)}kg CO₂</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence>
          {DAILY_TASKS.map((task, index) => {
            const isCompleted = completedTasks.includes(task.id);
            const Icon = task.icon;
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={isCompleted ? "default" : "outline"}
                  className={`w-full h-auto py-4 px-3 flex flex-col items-center gap-2 transition-all duration-300 ${
                    isCompleted 
                      ? "bg-gradient-to-br from-eco-green to-eco-teal text-white shadow-glow-green" 
                      : "hover:border-eco-green/50 hover:bg-eco-green/10"
                  }`}
                  onClick={() => completeTask(task.id, task.points, task.co2)}
                  disabled={isCompleted || loading}
                >
                  <div className={`p-2 rounded-full ${isCompleted ? "bg-white/20" : "bg-eco-green/10"}`}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs text-center leading-tight">{task.label}</span>
                  <span className={`text-xs font-bold ${isCompleted ? "text-white/80" : "text-eco-green"}`}>
                    +{task.points} pts
                  </span>
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {completedTasks.length === DAILY_TASKS.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-gradient-to-r from-eco-yellow/20 to-eco-orange/20 text-center"
        >
          <p className="font-bold text-eco-orange">🎉 All tasks complete! Champion ho tum!</p>
        </motion.div>
      )}

      {!user && (
        <p className="mt-4 text-xs text-center text-muted-foreground">
          Login karo apna progress save karne ke liye!
        </p>
      )}
    </Card>
  );
};
