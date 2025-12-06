import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, RefreshCw, Timer, Zap, Target, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementCelebration } from "./AchievementCelebration";
import { CelebrationOverlay } from "./CelebrationOverlay";
import { useCelebration } from "@/hooks/useCelebration";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", time: 30, color: "bg-green-500", points: 1 },
  medium: { label: "Medium", time: 20, color: "bg-yellow-500", points: 2 },
  hard: { label: "Hard", time: 15, color: "bg-red-500", points: 3 },
};

const QuizSection = () => {
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [timeLeft, setTimeLeft] = useState(20);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answered, setAnswered] = useState(false);
  const { celebratingAchievement, closeCelebration, checkAndAwardAchievements } = useAchievements();
  const { celebration, triggerCelebration, closeCelebration: closeChallengeCelebration } = useCelebration();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchQuestions();

    return () => subscription.unsubscribe();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || showResult || showFeedback || !questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return DIFFICULTY_CONFIG[difficulty].time;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, showResult, showFeedback, currentQuestion, difficulty, questions.length]);

  const handleTimeUp = useCallback(() => {
    if (answered) return;
    setAnswered(true);
    setIsCorrect(false);
    setShowFeedback(true);
    setStreak(0);
    toast.error("Time's up! ⏰");
    
    setTimeout(() => {
      moveToNextQuestion();
    }, 2000);
  }, [answered, currentQuestion, questions.length]);

  const fetchQuestions = async (selectedDifficulty?: Difficulty) => {
    setLoading(true);
    let query = supabase.from("quiz_questions").select("*");
    
    if (selectedDifficulty) {
      query = query.eq("difficulty", selectedDifficulty);
    }
    
    const { data } = await query.limit(10);

    if (data && data.length > 0) {
      // Shuffle questions
      const shuffled = data.sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
    }
    setLoading(false);
  };

  const startQuiz = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setTimeLeft(DIFFICULTY_CONFIG[selectedDifficulty].time);
    fetchQuestions(selectedDifficulty);
    setQuizStarted(true);
  };

  const moveToNextQuestion = () => {
    setShowFeedback(false);
    setAnswered(false);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setTimeLeft(DIFFICULTY_CONFIG[difficulty].time);
    } else {
      finishQuiz();
    }
  };

  const updateChallengeProgress = async (userId: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Get active challenges
      const { data: challenges } = await supabase
        .from("challenges")
        .select("*")
        .lte("start_date", today)
        .gte("end_date", today);

      if (!challenges?.length) return;

      for (const challenge of challenges) {
        // Check if user has progress for this challenge
        const { data: existingProgress } = await supabase
          .from("user_challenge_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("challenge_id", challenge.id)
          .single();

        if (existingProgress) {
          // Update existing progress if not completed
          if (!existingProgress.completed_at) {
            const newCount = existingProgress.quizzes_completed + 1;
            const completed = newCount >= challenge.target_quizzes;
            
            await supabase
              .from("user_challenge_progress")
              .update({
                quizzes_completed: newCount,
                completed_at: completed ? new Date().toISOString() : null,
              })
              .eq("id", existingProgress.id);

            if (completed) {
              triggerCelebration({
                type: "challenge",
                title: challenge.title,
                description: "Aapne yeh challenge successfully complete kar liya!",
                icon: "🏆",
                points: challenge.reward_points,
              });
            }
          }
        } else {
          // Create new progress entry
          const completed = 1 >= challenge.target_quizzes;
          await supabase.from("user_challenge_progress").insert({
            user_id: userId,
            challenge_id: challenge.id,
            quizzes_completed: 1,
            completed_at: completed ? new Date().toISOString() : null,
          });

          if (completed) {
            triggerCelebration({
              type: "challenge",
              title: challenge.title,
              description: "Aapne yeh challenge successfully complete kar liya!",
              icon: "🏆",
              points: challenge.reward_points,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating challenge progress:", error);
    }
  };

  const finishQuiz = async () => {
    setShowResult(true);
    
    if (user) {
      await supabase.from("quiz_scores").insert({
        user_id: user.id,
        score: score,
        total_questions: questions.length,
      });
      
      // Update challenge progress
      await updateChallengeProgress(user.id);
      
      setTimeout(() => {
        checkAndAwardAchievements(user.id);
      }, 1000);
      
      toast.success("Quiz score saved!");
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || answered) return;

    setAnswered(true);
    const correct = parseInt(selectedAnswer) === questions[currentQuestion].correct_answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      const points = DIFFICULTY_CONFIG[difficulty].points * (streak >= 3 ? 2 : 1);
      setScore(score + points);
      setStreak(streak + 1);
      toast.success(streak >= 2 ? `🔥 ${streak + 1} streak! +${points} points!` : "Correct! 🎉");
    } else {
      setStreak(0);
      toast.error("Not quite right! 📚");
    }

    setTimeout(() => {
      moveToNextQuestion();
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setShowResult(false);
    setQuizStarted(false);
    setStreak(0);
    setShowFeedback(false);
    setAnswered(false);
    fetchQuestions();
  };

  const progressPercent = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const timePercent = (timeLeft / DIFFICULTY_CONFIG[difficulty].time) * 100;

  if (loading && quizStarted) {
    return (
      <section id="quiz" className="py-12">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"
          />
          <p className="text-muted-foreground mt-4">Loading quiz...</p>
        </div>
      </section>
    );
  }

  // Difficulty Selection Screen
  if (!quizStarted) {
    return (
      <section id="quiz" className="py-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Test Your Eco-Knowledge
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your difficulty level and challenge yourself!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((level, index) => (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2",
                    "hover:border-primary/50"
                  )}
                  onClick={() => startQuiz(level)}
                >
                  <CardHeader className="text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                      DIFFICULTY_CONFIG[level].color
                    )}>
                      {level === "easy" && <Target className="w-8 h-8 text-white" />}
                      {level === "medium" && <Zap className="w-8 h-8 text-white" />}
                      {level === "hard" && <Trophy className="w-8 h-8 text-white" />}
                    </div>
                    <CardTitle className="text-2xl">{DIFFICULTY_CONFIG[level].label}</CardTitle>
                    <CardDescription className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Timer className="w-4 h-4" />
                        <span>{DIFFICULTY_CONFIG[level].time}s per question</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span>{DIFFICULTY_CONFIG[level].points}x points</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Start Quiz <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section id="quiz" className="py-12">
        <div className="text-center">
          <p className="text-muted-foreground">No quiz questions available for this difficulty. Try another level!</p>
          <Button onClick={resetQuiz} className="mt-4">Choose Different Level</Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <AchievementCelebration
        achievement={celebratingAchievement}
        onClose={closeCelebration}
      />
      <CelebrationOverlay
        celebration={celebration}
        onClose={closeChallengeCelebration}
      />
      <section id="quiz" className="py-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Test Your Eco-Knowledge
            </h2>
            
            {/* Stats Bar */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                <Trophy className="w-4 h-4 mr-1" /> Score: {score}
              </Badge>
              {streak >= 2 && (
                <Badge variant="default" className="text-sm bg-orange-500">
                  🔥 {streak} Streak!
                </Badge>
              )}
              <Badge variant="outline" className={cn("text-sm", DIFFICULTY_CONFIG[difficulty].color, "text-white")}>
                {DIFFICULTY_CONFIG[difficulty].label}
              </Badge>
            </div>
          </motion.div>
          
          <Card className="max-w-2xl mx-auto shadow-xl bg-card border-border overflow-hidden">
            {/* Progress Bar */}
            <div className="h-2 bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {/* Timer Bar */}
            {!showResult && (
              <div className="h-1 bg-muted">
                <motion.div
                  className={cn(
                    "h-full transition-colors duration-300",
                    timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-yellow-500" : "bg-green-500"
                  )}
                  style={{ width: `${timePercent}%` }}
                />
              </div>
            )}

            <CardHeader>
              <AnimatePresence mode="wait">
                {!showResult ? (
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">
                        Question {currentQuestion + 1} of {questions.length}
                      </CardTitle>
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                        timeLeft <= 5 ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"
                      )}>
                        <Timer className="w-4 h-4" />
                        {timeLeft}s
                      </div>
                    </div>
                    <CardDescription className="text-lg font-medium text-foreground">
                      {questions[currentQuestion].question}
                    </CardDescription>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <Trophy className="w-20 h-20 text-primary mx-auto mb-4" />
                    <CardTitle className="text-3xl mb-2">Quiz Complete!</CardTitle>
                    <CardDescription className="text-xl">
                      You scored <span className="text-primary font-bold">{score}</span> points!
                    </CardDescription>
                    <div className="mt-4">
                      <Progress value={(score / (questions.length * DIFFICULTY_CONFIG[difficulty].points)) * 100} className="h-3" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardHeader>
            
            <CardContent>
              <AnimatePresence mode="wait">
                {!showResult ? (
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={answered}>
                      <div className="space-y-3">
                        {questions[currentQuestion].options.map((option: string, index: number) => {
                          const isSelected = selectedAnswer === index.toString();
                          const isCorrectAnswer = index === questions[currentQuestion].correct_answer;
                          const showCorrect = showFeedback && isCorrectAnswer;
                          const showWrong = showFeedback && isSelected && !isCorrectAnswer;
                          
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-300",
                                !answered && "hover:bg-muted/50 cursor-pointer",
                                isSelected && !showFeedback && "border-primary bg-primary/10",
                                showCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                                showWrong && "border-red-500 bg-red-50 dark:bg-red-950",
                                !isSelected && !showCorrect && !showWrong && "border-border"
                              )}
                            >
                              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                              <Label 
                                htmlFor={`option-${index}`} 
                                className={cn(
                                  "flex-1 cursor-pointer text-base",
                                  answered && "cursor-default"
                                )}
                              >
                                {option}
                              </Label>
                              {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                              {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
                            </motion.div>
                          );
                        })}
                      </div>
                    </RadioGroup>
                    <Button 
                      className="w-full mt-6" 
                      size="lg"
                      onClick={handleSubmit}
                      disabled={!selectedAnswer || answered}
                    >
                      {answered ? "Next Question..." : "Submit Answer"}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                  >
                    <p className="text-lg text-foreground">
                      {score >= questions.length * DIFFICULTY_CONFIG[difficulty].points * 0.8
                        ? "Outstanding performance! You're an eco-champion! 🌟" 
                        : score >= questions.length * DIFFICULTY_CONFIG[difficulty].points * 0.5
                        ? "Great effort! Keep learning about our planet! 🌍"
                        : "Every step towards learning helps! Keep going! 🌱"}
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <Button onClick={resetQuiz} size="lg" variant="hero">
                        <RefreshCw className="mr-2" />
                        Play Again
                      </Button>
                      <Button onClick={() => { resetQuiz(); }} size="lg" variant="outline">
                        Change Difficulty
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
};

export { QuizSection };
export default QuizSection;
