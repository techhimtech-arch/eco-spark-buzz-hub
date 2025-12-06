import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const ECO_FACTS = [
  { fact: "🌳 1 tree a year me 118 kg CO₂ absorb karta hai!", emoji: "🌳" },
  { fact: "♻️ 1 recycled plastic bottle se 3 hours ki laptop energy bachti hai!", emoji: "♻️" },
  { fact: "🐝 Duniya ka 75% food bees ke pollination pe depend karta hai!", emoji: "🐝" },
  { fact: "🌊 Oceans 50% oxygen produce karte hain jo hum breathe karte hain!", emoji: "🌊" },
  { fact: "🔌 Standby appliances 10% electricity waste karte hain!", emoji: "🔌" },
  { fact: "🚿 1 minute shower me 9 liters paani use hota hai!", emoji: "🚿" },
  { fact: "📱 Ek smartphone banane me 12,000+ liters paani lagta hai!", emoji: "📱" },
  { fact: "🌱 Bamboo world ka fastest growing plant hai - 91cm/day!", emoji: "🌱" },
  { fact: "🦋 Amazon rainforest 20% oxygen produce karta hai!", emoji: "🦋" },
  { fact: "💡 LED bulbs 75% kam energy use karte hain!", emoji: "💡" },
  { fact: "🗑️ Plastic decompose hone me 500 saal lagte hain!", emoji: "🗑️" },
  { fact: "🐘 Elephants trees ke seeds spread karne me help karte hain!", emoji: "🐘" },
];

export const DidYouKnow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ECO_FACTS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % ECO_FACTS.length);
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + ECO_FACTS.length) % ECO_FACTS.length);
  };

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
              {ECO_FACTS[currentIndex].fact}
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
          {ECO_FACTS.map((_, index) => (
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
