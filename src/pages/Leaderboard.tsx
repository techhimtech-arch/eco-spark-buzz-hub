import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, TrendingUp, Activity, Medal, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

interface LeaderboardUser {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_quizzes: number;
  average_score: number;
  total_badges: number;
  total_impact: number;
  overall_rank: number;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUserId(user.id);
    await fetchLeaderboard();
    setLoading(false);
  };

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase.rpc("get_leaderboard_data");
    
    if (error) {
      console.error("Error fetching leaderboard:", error);
      return;
    }
    
    setLeaderboardData(data || []);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-semibold">#{rank}</span>;
  };

  const sortedByQuizzes = [...leaderboardData].sort((a, b) => b.total_quizzes - a.total_quizzes);
  const sortedByScore = [...leaderboardData].sort((a, b) => b.average_score - a.average_score);
  const sortedByBadges = [...leaderboardData].sort((a, b) => b.total_badges - a.total_badges);
  const sortedByImpact = [...leaderboardData].sort((a, b) => b.total_impact - a.total_impact);

  const renderLeaderboardList = (users: LeaderboardUser[], metric: 'overall' | 'quizzes' | 'score' | 'badges' | 'impact') => (
    <div className="space-y-3">
      {users.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No data available yet. Be the first to participate!</p>
      ) : (
        users.map((user, index) => {
          const rank = metric === 'overall' ? user.overall_rank : index + 1;
          const isCurrentUser = user.user_id === currentUserId;
          
          return (
            <div
              key={user.user_id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                isCurrentUser 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:bg-accent/50'
              }`}
            >
              <div className="flex items-center justify-center w-12">
                {getRankIcon(rank)}
              </div>
              
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>
                  {user.full_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">
                    {user.full_name || "Anonymous User"}
                  </p>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
                
                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                  {metric === 'overall' && (
                    <>
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {user.total_quizzes} quizzes
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {user.total_badges} badges
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {user.total_impact} impact
                      </span>
                    </>
                  )}
                  {metric === 'quizzes' && (
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {user.total_quizzes} quizzes completed
                    </span>
                  )}
                  {metric === 'score' && (
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {user.average_score}% average score
                    </span>
                  )}
                  {metric === 'badges' && (
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {user.total_badges} badges earned
                    </span>
                  )}
                  {metric === 'impact' && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {user.total_impact} total impact points
                    </span>
                  )}
                </div>
              </div>
              
              {metric === 'overall' && rank <= 3 && (
                <div className={`text-2xl font-bold ${
                  rank === 1 ? 'text-yellow-500' :
                  rank === 2 ? 'text-gray-400' :
                  'text-amber-600'
                }`}>
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background py-12 pt-24">
      <div className="container max-w-5xl mx-auto px-4">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Community Leaderboard</CardTitle>
                <p className="text-muted-foreground mt-1">
                  See how you rank among sustainability champions
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overall">
              <Trophy className="h-4 w-4 mr-2" />
              Overall
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              <Activity className="h-4 w-4 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="score">
              <TrendingUp className="h-4 w-4 mr-2" />
              Score
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="h-4 w-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="impact">
              <TrendingUp className="h-4 w-4 mr-2" />
              Impact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overall">
            <Card>
              <CardHeader>
                <CardTitle>Top Overall Contributors</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLeaderboardList(leaderboardData, 'overall')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle>Most Quizzes Completed</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLeaderboardList(sortedByQuizzes, 'quizzes')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="score">
            <Card>
              <CardHeader>
                <CardTitle>Highest Average Scores</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLeaderboardList(sortedByScore, 'score')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges">
            <Card>
              <CardHeader>
                <CardTitle>Most Badges Earned</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLeaderboardList(sortedByBadges, 'badges')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact">
            <Card>
              <CardHeader>
                <CardTitle>Highest Sustainability Impact</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLeaderboardList(sortedByImpact, 'impact')}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
