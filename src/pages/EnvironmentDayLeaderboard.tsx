import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Calendar, Sparkles, Activity } from "lucide-react";

interface Row {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_quizzes: number;
  total_score: number;
  total_questions: number;
  average_percent: number;
  rank: number;
}

const CAMPAIGN_START = new Date("2026-01-01T00:00:00").toISOString();
const CAMPAIGN_END = new Date("2026-06-05T23:59:59").toISOString();
const TARGET = new Date("2026-06-05T00:00:00").getTime();

function diff() {
  const d = TARGET - Date.now();
  if (d <= 0) return null;
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d / 3600000) % 24),
    minutes: Math.floor((d / 60000) % 60),
  };
}

export default function EnvironmentDayLeaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);
  const [time, setTime] = useState(diff());

  useEffect(() => {
    const id = setInterval(() => setTime(diff()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user?.id ?? null);
      const { data, error } = await supabase.rpc("get_campaign_leaderboard", {
        _start_date: CAMPAIGN_START,
        _end_date: CAMPAIGN_END,
      });
      if (!error && data) setRows(data as Row[]);
      setLoading(false);
    })();
  }, []);

  const myRow = useMemo(() => rows.find(r => r.user_id === me), [rows, me]);

  const rankIcon = (r: number) => {
    if (r === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (r === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (r === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-semibold">#{r}</span>;
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background py-12 pt-24">
        <div className="container max-w-5xl mx-auto px-4">
          {/* Hero */}
          <Card className="mb-6 overflow-hidden border-0 shadow-xl">
            <div className="bg-gradient-to-br from-primary via-accent to-primary p-8 text-primary-foreground">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/15 text-xs font-medium mb-3">
                <Sparkles className="h-3 w-3" /> Quiz Championship
              </span>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                🌍 World Environment Day Leaderboard
              </h1>
              <p className="opacity-90 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" /> Grand Finale: 5 June 2026
              </p>
              {time && (
                <div className="flex gap-3 mt-5">
                  {[
                    { v: time.days, l: "Days" },
                    { v: time.hours, l: "Hours" },
                    { v: time.minutes, l: "Mins" },
                  ].map(b => (
                    <div key={b.l} className="bg-background/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-primary-foreground/20">
                      <div className="text-2xl font-bold tabular-nums">{String(b.v).padStart(2, "0")}</div>
                      <div className="text-[10px] uppercase tracking-wider opacity-80">{b.l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {myRow && (
            <Card className="mb-6 border-primary/40">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 flex justify-center">{rankIcon(myRow.rank)}</div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={myRow.avatar_url || undefined} />
                  <AvatarFallback>{myRow.full_name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{myRow.full_name || "You"}</p>
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {myRow.total_score} pts · {myRow.total_quizzes} quizzes · {myRow.average_percent}% avg
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Top Eco Champions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : rows.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-1">Abhi koi scorer nahi hai</p>
                  <p className="text-sm text-muted-foreground">Pehla quiz khelke #1 ban jao! 🚀</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rows.map(r => {
                    const isMe = r.user_id === me;
                    return (
                      <div
                        key={r.user_id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                          isMe ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"
                        }`}
                      >
                        <div className="w-12 flex justify-center">{rankIcon(r.rank)}</div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={r.avatar_url || undefined} />
                          <AvatarFallback>{r.full_name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{r.full_name || "Anonymous"}</p>
                            {isMe && <Badge variant="secondary" className="text-xs">You</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Trophy className="h-3 w-3" />{r.total_score} pts</span>
                            <span className="flex items-center gap-1"><Activity className="h-3 w-3" />{r.total_quizzes} quizzes</span>
                            <span>{r.average_percent}% avg</span>
                          </div>
                        </div>
                        {r.rank <= 3 && (
                          <div className="text-2xl">
                            {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : "🥉"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}