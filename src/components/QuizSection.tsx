import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Trophy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementCelebration } from "./AchievementCelebration";

const QuizSection = () => {
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const { celebratingAchievement, closeCelebration, checkAndAwardAchievements } = useAchievements();

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

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("quiz_questions")
      .select("*")
      .limit(10);

    if (data && data.length > 0) {
      setQuestions(data);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      toast.error("Please select an answer");
      return;
    }

    const isCorrect = parseInt(selectedAnswer) === questions[currentQuestion].correct_answer;
    
    if (isCorrect) {
      setScore(score + 1);
      toast.success("Correct! 🎉");
    } else {
      toast.error("Not quite right. Keep learning! 📚");
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    } else {
      setShowResult(true);
      
      if (user) {
        await supabase.from("quiz_scores").insert({
          user_id: user.id,
          score: score + (isCorrect ? 1 : 0),
          total_questions: questions.length,
        });
        
        // Check for achievements
        setTimeout(() => {
          checkAndAwardAchievements(user.id);
        }, 1000);
        
        toast.success("Quiz score saved!");
      }
    }
  };


  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setShowResult(false);
    fetchQuestions();
  };

  if (loading) {
    return (
      <section id="quiz" className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section id="quiz" className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">No quiz questions available yet. Check back soon!</p>
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
      <section id="quiz" className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Test Your Eco-Knowledge
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Challenge yourself with our interactive sustainability quiz!
          </p>
        </div>
        
        <Card className="max-w-2xl mx-auto shadow-[var(--shadow-hover)] bg-card border-border">
          <CardHeader>
            {!showResult ? (
              <>
                <CardTitle className="text-2xl">
                  Question {currentQuestion + 1} of {questions.length}
                </CardTitle>
                <CardDescription className="text-lg">
                  {questions[currentQuestion].question}
                </CardDescription>
              </>
            ) : (
              <div className="text-center">
                <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-3xl mb-2">Quiz Complete!</CardTitle>
                <CardDescription className="text-xl">
                  You scored {score} out of {questions.length}
                </CardDescription>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!showResult ? (
              <>
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  <div className="space-y-4">
                    {questions[currentQuestion].options.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className="flex-1 cursor-pointer text-base"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                >
                  Submit Answer
                </Button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-lg text-foreground">
                  {score === questions.length 
                    ? "Perfect score! You're a sustainability champion! 🌟" 
                    : score >= questions.length / 2
                    ? "Great effort! Keep learning about our planet! 🌍"
                    : "Every step towards learning helps! Keep going! 🌱"}
                </p>
                <Button onClick={resetQuiz} size="lg" variant="hero">
                  <RefreshCw className="mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
    </>
  );
};

export { QuizSection };
export default QuizSection;
