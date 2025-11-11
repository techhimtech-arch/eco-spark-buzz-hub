import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Trophy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const quizQuestions = [
  {
    question: "What percentage of the Earth's surface is covered by water?",
    options: ["50%", "60%", "71%", "80%"],
    correctAnswer: 2,
  },
  {
    question: "Which renewable energy source is the most widely used globally?",
    options: ["Solar", "Wind", "Hydroelectric", "Geothermal"],
    correctAnswer: 2,
  },
  {
    question: "How long does it take for a plastic bottle to decompose?",
    options: ["50 years", "100 years", "450 years", "1000 years"],
    correctAnswer: 2,
  },
];

const QuizSection = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    const isCorrect = parseInt(selectedAnswer) === quizQuestions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      toast({
        title: "Correct! 🎉",
        description: "Great job! Keep going!",
      });
    } else {
      toast({
        title: "Not quite!",
        description: "Don't worry, learning is a journey!",
        variant: "destructive",
      });
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setShowResult(false);
  };

  return (
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
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </CardTitle>
                <CardDescription className="text-lg">
                  {quizQuestions[currentQuestion].question}
                </CardDescription>
              </>
            ) : (
              <div className="text-center">
                <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-3xl mb-2">Quiz Complete!</CardTitle>
                <CardDescription className="text-xl">
                  You scored {score} out of {quizQuestions.length}
                </CardDescription>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!showResult ? (
              <>
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  <div className="space-y-4">
                    {quizQuestions[currentQuestion].options.map((option, index) => (
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
                  {score === quizQuestions.length 
                    ? "Perfect score! You're a sustainability champion! 🌟" 
                    : score >= quizQuestions.length / 2
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
  );
};

export default QuizSection;
