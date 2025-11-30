import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, Award, Leaf, TrendingUp, BookOpen, Target } from "lucide-react";
import { toast } from "sonner";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementCelebration } from "@/components/AchievementCelebration";

interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps) => {
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [userActions, setUserActions] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalActions: 0,
    co2Impact: 0,
  });
  const { celebratingAchievement, closeCelebration, checkAndAwardAchievements } = useAchievements();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      // Check for new achievements on page load
      checkAndAwardAchievements(user.id);
    }
  }, [user, checkAndAwardAchievements]);

  const fetchDashboardData = async () => {
    // Fetch quiz history
    const { data: quizData } = await supabase
      .from("quiz_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    setQuizHistory(quizData || []);

    // Calculate stats
    if (quizData && quizData.length > 0) {
      const total = quizData.length;
      const avgScore = Math.round(
        quizData.reduce((acc, score) => acc + (score.score / score.total_questions) * 100, 0) / total
      );
      setStats(prev => ({ ...prev, totalQuizzes: total, averageScore: avgScore }));
    }

    // Fetch user badges
    const { data: badgesData } = await supabase
      .from("user_badges")
      .select("*, badges(*)")
      .eq("user_id", user.id);

    setUserBadges(badgesData || []);

    // Fetch all badges
    const { data: allBadgesData } = await supabase
      .from("badges")
      .select("*");

    setAllBadges(allBadgesData || []);

    // Fetch user actions
    const { data: actionsData } = await supabase
      .from("user_actions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setUserActions(actionsData || []);

    if (actionsData) {
      const totalImpact = actionsData.reduce((acc, action) => acc + Number(action.impact_value), 0);
      setStats(prev => ({
        ...prev,
        totalActions: actionsData.length,
        co2Impact: Math.round(totalImpact * 10) / 10,
      }));
    }
  };

  const knowledgeGrowth = stats.totalQuizzes > 0 
    ? Math.min(100, (stats.totalQuizzes / 20) * 100) 
    : 0;

  return (
    <>
      <AchievementCelebration
        achievement={celebratingAchievement}
        onClose={closeCelebration}
      />
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Your Sustainability Journey</h1>

      {/* Impact Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">Average Score: {stats.averageScore}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(knowledgeGrowth)}%</div>
            <Progress value={knowledgeGrowth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO₂ Awareness</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.co2Impact} kg</div>
            <p className="text-xs text-muted-foreground">Impact from actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Real Actions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActions}</div>
            <p className="text-xs text-muted-foreground">Commitments made</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="history">Quiz History</TabsTrigger>
          <TabsTrigger value="actions">My Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                {userBadges.length} of {allBadges.length} badges earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allBadges.map((badge) => {
                  const earned = userBadges.find((ub) => ub.badge_id === badge.id);
                  const IconComponent = earned ? Trophy : Award;
                  
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 border rounded-lg ${
                        earned ? "bg-primary/5 border-primary" : "bg-muted/30 border-muted"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent
                          className={`h-8 w-8 ${
                            earned ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                          {earned && (
                            <p className="text-xs text-primary mt-1">
                              Earned {new Date(earned.earned_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz History</CardTitle>
              <CardDescription>Your recent quiz attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {quizHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No quiz history yet. Take your first quiz!
                </p>
              ) : (
                <div className="space-y-3">
                  {quizHistory.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          Score: {quiz.score}/{quiz.total_questions}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quiz.completed_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          quiz.score === quiz.total_questions
                            ? "default"
                            : quiz.score / quiz.total_questions >= 0.7
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {Math.round((quiz.score / quiz.total_questions) * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sustainability Actions</CardTitle>
              <CardDescription>Track your real-world impact</CardDescription>
            </CardHeader>
            <CardContent>
              {userActions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No actions logged yet. Start making a difference!
                </p>
              ) : (
                <div className="space-y-3">
                  {userActions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <Leaf className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <p className="font-medium">{action.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {action.action_type.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {action.impact_value} kg CO₂ saved
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(action.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
};
