import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameLayout } from "@/components/games/GameLayout";
import { Button } from "@/components/ui/button";

const ALL_EMOJIS = [
  '🌳', '🌊', '🏔️', '🦌', '♻️', '☀️', '🌧️', '🚲', 
  '🌻', '🌲', '🌍', '💧', '🐝', '🐢', '🍃', '🍎', 
  '🍄', '🌱', '🦜', '🦉', '🦋', '🐟', '🍓', '🥕', 
  '🏕️', '🌋', '🌈', '⚡', '🌬️', '🌾', '🐾', '🕊️'
];

type Difficulty = 'easy' | 'medium' | 'hard';

interface Card {
  id: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const getGridConfig = (diff: Difficulty) => {
  switch (diff) {
    case 'easy': return { rows: 4, cols: 4, pairs: 8, time: 60 };
    case 'medium': return { rows: 6, cols: 6, pairs: 18, time: 120 };
    case 'hard': return { rows: 8, cols: 8, pairs: 32, time: 240 };
  }
};

export default function EcoMemory() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  
  const [particles, setParticles] = useState<{id: string, x: number, y: number, text: string}[]>([]);
  const [shakeIndices, setShakeIndices] = useState<number[]>([]);

  // Initialize Game
  const startGame = (diff: Difficulty) => {
    const config = getGridConfig(diff);
    setDifficulty(diff);
    setScore(0);
    setTimer(config.time);
    setIsGameOver(false);
    setStreak(0);
    setFlippedIndices([]);
    setShakeIndices([]);

    // Select emojis
    const selectedEmojis = ALL_EMOJIS.slice(0, config.pairs);
    
    // Create pairs and shuffle
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji) => ({
        id: Math.random().toString(36).substr(2, 9),
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(deck);
  };

  // Timer loop
  useEffect(() => {
    if (!difficulty || isGameOver) return;
    
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsGameOver(true);
    }
  }, [timer, difficulty, isGameOver]);

  // Check for win
  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched)) {
      setTimeout(() => setIsGameOver(true), 1000); // Small delay for final animation
    }
  }, [cards]);

  const handleCardClick = (index: number, event: React.MouseEvent) => {
    if (isGameOver || flippedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Flip the card visually
    setCards(prev => prev.map((c, i) => i === index ? { ...c, isFlipped: true } : c));

    // Check match if 2 cards flipped
    if (newFlipped.length === 2) {
      const idx1 = newFlipped[0];
      const idx2 = newFlipped[1];
      
      if (cards[idx1].emoji === cards[idx2].emoji) {
        // MATCH
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            (i === idx1 || i === idx2) ? { ...c, isMatched: true } : c
          ));
          setFlippedIndices([]);
          
          setStreak(s => s + 1);
          const points = 10 + (streak * 5);
          setScore(s => s + points);

          // Add floaty text particle
          const rect = (event.target as HTMLElement).getBoundingClientRect();
          const newParticle = {
            id: Math.random().toString(),
            x: rect.left + rect.width / 2,
            y: rect.top,
            text: `+${points}`
          };
          setParticles(p => [...p, newParticle]);
          setTimeout(() => {
            setParticles(p => p.filter(item => item.id !== newParticle.id));
          }, 1500);

        }, 500);
      } else {
        // NO MATCH
        setShakeIndices([idx1, idx2]);
        setStreak(0);
        
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            (i === idx1 || i === idx2) ? { ...c, isFlipped: false } : c
          ));
          setFlippedIndices([]);
          setShakeIndices([]);
        }, 1000);
      }
    }
  };

  if (!difficulty) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-700 text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
            Eco Memory Quest
          </h1>
          <p className="text-slate-400 mb-8">Match all eco-pairs before time runs out!</p>
          
          <div className="space-y-4">
            <Button onClick={() => startGame('easy')} className="w-full py-6 text-xl bg-emerald-500 hover:bg-emerald-600 rounded-2xl">
              Easy (4x4)
            </Button>
            <Button onClick={() => startGame('medium')} className="w-full py-6 text-xl bg-amber-500 hover:bg-amber-600 rounded-2xl">
              Medium (6x6)
            </Button>
            <Button onClick={() => startGame('hard')} className="w-full py-6 text-xl bg-red-500 hover:bg-red-600 rounded-2xl">
              Hard (8x8)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const config = getGridConfig(difficulty);
  const isWin = cards.length > 0 && cards.every(c => c.isMatched);

  return (
    <GameLayout
      gameName="Eco Memory Quest"
      score={score}
      timer={timer}
      level={difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1}
      xpEarned={score}
      isGameOver={isGameOver}
      onRestart={() => startGame(difficulty)}
      theme="blue"
      starsEarned={isWin ? (timer > config.time / 2 ? 3 : timer > config.time / 4 ? 2 : 1) : 0}
      ecoMessage="Every small eco action helps the planet! 🌍"
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900 overflow-hidden p-4">
        
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -right-1/4 w-full h-full bg-[radial-gradient(circle,rgba(52,211,153,0.3)_0%,transparent_60%)] blur-3xl"
          />
          <motion.div 
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/4 -left-1/4 w-full h-full bg-[radial-gradient(circle,rgba(56,189,248,0.3)_0%,transparent_60%)] blur-3xl"
          />
        </div>

        {/* Streak & Feedback */}
        <AnimatePresence>
          {streak > 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-4 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white px-4 py-1 rounded-full font-black text-sm shadow-lg z-20"
            >
              {streak}x Combo! 🔥
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Particles */}
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: p.y, x: p.x, scale: 0.5 }}
              animate={{ opacity: 0, y: p.y - 100, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="fixed z-50 text-emerald-400 font-black text-2xl drop-shadow-md pointer-events-none"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Game Grid */}
        <div className="relative z-10 w-full max-w-2xl aspect-square flex items-center justify-center">
          <div 
            className="grid gap-1.5 sm:gap-2 w-full"
            style={{ 
              gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${config.rows}, minmax(0, 1fr))`
            }}
          >
            {cards.map((card, index) => {
              const isShaking = shakeIndices.includes(index);
              
              return (
                <motion.div
                  key={card.id}
                  className="relative w-full aspect-square"
                  style={{ perspective: '1000px' }}
                  animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  onClick={(e) => handleCardClick(index, e)}
                >
                  <motion.div
                    className="w-full h-full relative preserve-3d cursor-pointer"
                    initial={false}
                    animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Card Front (Face down) */}
                    <div 
                      className="absolute inset-0 backface-hidden bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl sm:rounded-2xl shadow-md border-b-4 border-teal-800 flex items-center justify-center hover:brightness-110 transition-all"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="text-white/30 text-2xl sm:text-4xl font-black">?</div>
                    </div>

                    {/* Card Back (Face up) */}
                    <div 
                      className={`absolute inset-0 backface-hidden rounded-xl sm:rounded-2xl shadow-inner border-2 flex items-center justify-center text-3xl sm:text-5xl lg:text-6xl ${
                        card.isMatched 
                          ? 'bg-emerald-100 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' 
                          : 'bg-white border-slate-200'
                      }`}
                      style={{ 
                        backfaceVisibility: 'hidden', 
                        transform: 'rotateY(180deg)' 
                      }}
                    >
                      {card.isMatched && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: [1.2, 1] }}
                          className="absolute inset-0 bg-emerald-400/20 rounded-xl sm:rounded-2xl"
                        />
                      )}
                      <span className="drop-shadow-md relative z-10">{card.emoji}</span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </GameLayout>
  );
}
