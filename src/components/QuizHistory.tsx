import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Trophy, TrendingUp, Target, Zap, Calendar, Award, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuizScore {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

interface QuizHistoryProps {
  userId: string;
}

export function QuizHistory({ userId }: QuizHistoryProps) {
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, [userId]);

  const fetchScores = async () => {
    const { data } = await supabase
      .from("quiz_scores")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: true });

    if (data) {
      setScores(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading quiz history...
        </CardContent>
      </Card>
    );
  }

  if (scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Quiz History
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No quiz history yet. Take your first quiz to see your progress!
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const totalQuizzes = scores.length;
  const totalScore = scores.reduce((acc, s) => acc + s.score, 0);
  const totalQuestions = scores.reduce((acc, s) => acc + s.total_questions, 0);
  const averagePercent = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const bestScore = Math.max(...scores.map(s => Math.round((s.score / s.total_questions) * 100)));
  const latestScores = scores.slice(-5);
  const recentAvg = latestScores.length > 0 
    ? Math.round(latestScores.reduce((acc, s) => acc + (s.score / s.total_questions) * 100, 0) / latestScores.length)
    : 0;
  
  // Trend calculation
  const olderScores = scores.slice(0, Math.max(1, scores.length - 5));
  const olderAvg = olderScores.length > 0
    ? Math.round(olderScores.reduce((acc, s) => acc + (s.score / s.total_questions) * 100, 0) / olderScores.length)
    : 0;
  const trend = recentAvg - olderAvg;

  // Chart data
  const chartData = scores.map((s, index) => ({
    name: `Quiz ${index + 1}`,
    date: new Date(s.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: Math.round((s.score / s.total_questions) * 100),
    raw: s.score,
    total: s.total_questions,
  }));

  // Recent history (last 10)
  const recentHistory = [...scores].reverse().slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Quiz History & Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
              >
                <StatCard
                  icon={Target}
                  label="Total Quizzes"
                  value={totalQuizzes.toString()}
                  color="text-blue-500"
                  bgColor="bg-blue-500/10"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <StatCard
                  icon={Zap}
                  label="Average Score"
                  value={`${averagePercent}%`}
                  color="text-yellow-500"
                  bgColor="bg-yellow-500/10"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <StatCard
                  icon={Award}
                  label="Best Score"
                  value={`${bestScore}%`}
                  color="text-green-500"
                  bgColor="bg-green-500/10"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StatCard
                  icon={TrendingUp}
                  label="Trend"
                  value={trend > 0 ? `+${trend}%` : `${trend}%`}
                  color={trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"}
                  bgColor={trend > 0 ? "bg-green-500/10" : trend < 0 ? "bg-red-500/10" : "bg-muted"}
                  trendIcon={trend > 0 ? ArrowUp : trend < 0 ? ArrowDown : Minus}
                />
              </motion.div>
            </div>

            {/* Mini Chart */}
            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.slice(-10)}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis domain={[0, 100]} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Score']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorScore)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis domain={[0, 100]} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${props.payload.raw}/${props.payload.total} (${value}%)`,
                      'Score'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Insights */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance Insights
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {trend > 5 && (
                  <li className="flex items-center gap-2 text-green-600">
                    <ArrowUp className="h-4 w-4" />
                    Great progress! Your recent scores are improving significantly.
                  </li>
                )}
                {trend < -5 && (
                  <li className="flex items-center gap-2 text-yellow-600">
                    <ArrowDown className="h-4 w-4" />
                    Keep practicing! Try reviewing topics where you scored lower.
                  </li>
                )}
                {bestScore === 100 && (
                  <li className="flex items-center gap-2 text-primary">
                    <Award className="h-4 w-4" />
                    You've achieved a perfect score! Amazing work!
                  </li>
                )}
                <li>
                  You've answered {totalScore} out of {totalQuestions} questions correctly.
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {recentHistory.map((score, index) => {
                const percent = Math.round((score.score / score.total_questions) * 100);
                const prevScore = recentHistory[index + 1];
                const prevPercent = prevScore 
                  ? Math.round((prevScore.score / prevScore.total_questions) * 100)
                  : null;
                const change = prevPercent !== null ? percent - prevPercent : null;

                return (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        percent >= 80 ? "bg-green-500/10 text-green-500" :
                        percent >= 60 ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-red-500/10 text-red-500"
                      )}>
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {score.score}/{score.total_questions} correct
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(score.completed_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {change !== null && change !== 0 && (
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            change > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          )}
                        >
                          {change > 0 ? "+" : ""}{change}%
                        </Badge>
                      )}
                      <Badge 
                        variant={percent >= 80 ? "default" : percent >= 60 ? "secondary" : "destructive"}
                        className="min-w-[50px] justify-center"
                      >
                        {percent}%
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bgColor: string;
  trendIcon?: React.ElementType;
}

function StatCard({ icon: Icon, label, value, color, bgColor, trendIcon: TrendIcon }: StatCardProps) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center mb-3", bgColor)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1">
        <p className={cn("text-xl font-bold", color)}>{value}</p>
        {TrendIcon && <TrendIcon className={cn("h-4 w-4", color)} />}
      </div>
    </div>
  );
}

export default QuizHistory;
