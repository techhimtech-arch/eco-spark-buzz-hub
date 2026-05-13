import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Trophy, Timer, Zap, Target, ChevronRight, CheckCircle2, XCircle, Sparkles, ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { z } from "zod";

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", time: 30, color: "bg-green-500", icon: Target },
  medium: { label: "Medium", time: 20, color: "bg-yellow-500", icon: Zap },
  hard: { label: "Hard", time: 15, color: "bg-red-500", icon: Trophy },
};

const nameSchema = z
  .string()
  .trim()
  .min(1, "Apna naam likho!")
  .max(30, "Naam 30 letters se chhota hona chahiye");

type Stage = "intro" | "playing" | "finished" | "leaderboard";

const GuestQuiz = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("intro");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState("");
  const [answered, setAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [playerName, setPlayerName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [board, setBoard] = useState<any[]>([]);

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from("guest_quiz_scores")
      .select("*")
      .order("score", { ascending: false })
      .order("completed_at", { ascending: false })
      .limit(50);
    setBoard(data || []);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const start = async (d: Difficulty) => {
    setLoading(true);
    setDifficulty(d);
    const { data } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("difficulty", d)
      .limit(20);
    if (!data || data.length === 0) {
      toast.error("Is level ke questions abhi nahi hain!");
      setLoading(false);
      return;
    }
    const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCurrentQ(0);
    setScore(0);
    setSelected("");
    setAnswered(false);
    setShowFeedback(false);
    setSubmitted(false);
    setSubmittedId(null);
    setTimeLeft(DIFFICULTY_CONFIG[d].time);
    setStage("playing");
    setLoading(false);
  };

  const next = useCallback(() => {
    setShowFeedback(false);
    setAnswered(false);
    setSelected("");
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setTimeLeft(DIFFICULTY_CONFIG[difficulty].time);
    } else {
      setStage("finished");
    }
  }, [currentQ, questions.length, difficulty]);

  const submitAnswer = (correctOverride?: boolean) => {
    if (answered) return;
    setAnswered(true);
    const correct =
      correctOverride !== undefined
        ? correctOverride
        : parseInt(selected) === questions[currentQ].correct_answer;
    if (correct) {
      setScore((s) => s + 1);
      toast.success("Sahi jawab! 🎉");
    } else if (correctOverride === false) {
      toast.error("Time up! ⏰");
    } else {
      toast.error("Galat jawab 📚");
    }
    setShowFeedback(true);
    setTimeout(next, 1800);
  };

  // Timer
  useEffect(() => {
    if (stage !== "playing" || showFeedback) return;
    if (timeLeft <= 0) {
      submitAnswer(false);
      return;
    }
    const t = setTimeout(() => setTimeLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, stage, showFeedback]);

  const saveScore = async () => {
    const parsed = nameSchema.safeParse(playerName);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const { data, error } = await supabase
      .from("guest_quiz_scores")
      .insert({
        player_name: parsed.data,
        score,
        total_questions: questions.length,
        difficulty,
      })
      .select()
      .single();
    if (error) {
      toast.error("Score save nahi ho saka. Phir try karo!");
      return;
    }
    setSubmitted(true);
    setSubmittedId(data?.id ?? null);
    toast.success("Aap leaderboard pe aa gaye! 🏆");
    await fetchLeaderboard();
    setStage("leaderboard");
  };

  const q = questions[currentQ];
  const timePct = (timeLeft / DIFFICULTY_CONFIG[difficulty].time) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Home
          </Button>
          <Button variant="outline" onClick={() => { fetchLeaderboard(); setStage("leaderboard"); }}>
            <Trophy className="w-4 h-4 mr-2" /> Leaderboard
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {stage === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-10">
                <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                  <Sparkles className="w-3 h-3 mr-1" /> No Login Needed
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent mb-4">
                  Quick Eco Quiz 🌱
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Naam daalo, quiz khelo, leaderboard pe apna jhanda gaado! 🏆
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => {
                  const cfg = DIFFICULTY_CONFIG[d];
                  const Icon = cfg.icon;
                  return (
                    <Card
                      key={d}
                      className="cursor-pointer transition-all hover:scale-105 hover:shadow-xl border-2 hover:border-primary/50"
                      onClick={() => !loading && start(d)}
                    >
                      <CardHeader className="text-center">
                        <div className={cn("w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center", cfg.color)}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">{cfg.label}</CardTitle>
                        <CardDescription>{cfg.time}s per question · 10 questions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" disabled={loading}>
                          Start <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {stage === "playing" && q && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="max-w-2xl mx-auto shadow-xl overflow-hidden">
                <div className="h-2 bg-muted">
                  <motion.div className="h-full bg-primary" animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
                </div>
                <div className="h-1 bg-muted">
                  <div
                    className={cn("h-full transition-all", timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-yellow-500" : "bg-green-500")}
                    style={{ width: `${timePct}%` }}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">
                      Q {currentQ + 1} / {questions.length}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary"><Trophy className="w-3 h-3 mr-1" /> {score}</Badge>
                      <Badge variant="outline"><Timer className="w-3 h-3 mr-1" /> {timeLeft}s</Badge>
                    </div>
                  </div>
                  <CardDescription className="text-lg font-medium text-foreground">{q.question}</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selected} onValueChange={setSelected} disabled={answered}>
                    <div className="space-y-3">
                      {(q.options as string[]).map((opt, i) => {
                        const isSel = selected === i.toString();
                        const isCorrect = i === q.correct_answer;
                        const showRight = showFeedback && isCorrect;
                        const showWrong = showFeedback && isSel && !isCorrect;
                        return (
                          <div
                            key={i}
                            className={cn(
                              "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all",
                              !answered && "hover:bg-muted/50 cursor-pointer",
                              isSel && !showFeedback && "border-primary bg-primary/10",
                              showRight && "border-green-500 bg-green-50 dark:bg-green-950",
                              showWrong && "border-red-500 bg-red-50 dark:bg-red-950",
                              !isSel && !showRight && !showWrong && "border-border"
                            )}
                          >
                            <RadioGroupItem value={i.toString()} id={`o-${i}`} />
                            <Label htmlFor={`o-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                            {showRight && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                  <Button className="w-full mt-6" size="lg" disabled={!selected || answered} onClick={() => submitAnswer()}>
                    {answered ? "Next..." : "Submit"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {stage === "finished" && (
            <motion.div key="finished" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="max-w-md mx-auto shadow-xl">
                <CardHeader className="text-center">
                  <Trophy className="w-20 h-20 text-primary mx-auto mb-3" />
                  <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
                  <CardDescription className="text-xl">
                    Score: <span className="font-bold text-primary">{score}</span> / {questions.length}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!submitted ? (
                    <>
                      <div>
                        <Label htmlFor="name">Apna naam likho leaderboard ke liye</Label>
                        <Input
                          id="name"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          maxLength={30}
                          placeholder="e.g. Riya, Class 7"
                          className="mt-2"
                          autoFocus
                        />
                      </div>
                      <Button className="w-full" size="lg" onClick={saveScore}>
                        <Trophy className="w-4 h-4 mr-2" /> Submit to Leaderboard
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setStage("intro")}>
                        Skip & Play Again
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" onClick={() => setStage("leaderboard")}>
                      View Leaderboard
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {stage === "leaderboard" && (
            <motion.div key="board" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  🏆 Top Eco Champions
                </h2>
                <p className="text-muted-foreground mt-2 flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" /> {board.length} players
                </p>
              </div>
              <Card className="shadow-xl">
                <CardContent className="p-4">
                  {board.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Abhi koi nahi hai. Pehle banno!</p>
                  ) : (
                    <div className="space-y-2">
                      {board.map((row, i) => {
                        const pct = Math.round((row.score / row.total_questions) * 100);
                        const isMe = submittedId === row.id;
                        return (
                          <div
                            key={row.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                              i === 0 && "bg-gradient-to-r from-yellow-100 to-amber-50 border-yellow-400 dark:from-yellow-950 dark:to-amber-950",
                              i === 1 && "bg-gradient-to-r from-slate-100 to-gray-50 border-slate-400 dark:from-slate-900 dark:to-gray-900",
                              i === 2 && "bg-gradient-to-r from-orange-100 to-amber-50 border-orange-400 dark:from-orange-950 dark:to-amber-950",
                              i > 2 && "border-border",
                              isMe && "ring-2 ring-primary"
                            )}
                          >
                            <div className="text-2xl font-bold w-10 text-center">
                              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">
                                {row.player_name} {isMe && <Badge className="ml-1">You</Badge>}
                              </div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {row.difficulty} · {new Date(row.completed_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{row.score}/{row.total_questions}</div>
                              <div className="text-xs text-muted-foreground">{pct}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="text-center mt-6">
                <Button size="lg" onClick={() => setStage("intro")}>
                  <Sparkles className="w-4 h-4 mr-2" /> Play Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GuestQuiz;