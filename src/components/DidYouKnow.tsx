import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

interface EcoFact {
  id: string;
  fact: string;
  emoji: string;
}

export const DidYouKnow = () => {
  const [facts, setFacts] = useState<EcoFact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacts();
  }, []);

  const fetchFacts = async () => {
    const { data, error } = await supabase
      .from("eco_facts")
      .select("id, fact, emoji")
      .eq("active", true);

    if (error) {
      console.error("Error fetching facts:", error);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      setFacts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isAutoPlaying || facts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, facts.length]);

  const goToNext = () => {
    if (facts.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % facts.length);
  };

  const goToPrev = () => {
    if (facts.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + facts.length) % facts.length);
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-eco-blue/10 via-eco-teal/10 to-eco-green/10 border-eco-teal/30">
        <div className="animate-pulse h-24"></div>
      </Card>
    );
  }

  if (facts.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-eco-blue/10 via-eco-teal/10 to-eco-green/10 border-eco-teal/30 overflow-hidden relative">
      <div className="absolute top-2 right-2">
        <Sparkles className="h-5 w-5 text-eco-yellow animate-pulse" />
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💡</span>
        <h3 className="font-display font-bold text-lg">Did You Know?</h3>
      </div>

      <div className="relative min-h-[60px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p className="text-lg leading-relaxed">
              {facts[currentIndex]?.fact}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrev}
          className="h-8 w-8 hover:bg-eco-teal/20"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-1">
          {facts.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? "bg-eco-teal w-4" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="h-8 w-8 hover:bg-eco-teal/20"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
