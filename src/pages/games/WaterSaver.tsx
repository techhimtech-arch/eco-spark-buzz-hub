import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameLayout } from "@/components/games/GameLayout";

interface Tap {
  id: string;
  x: number;
  y: number;
  isLeaking: boolean;
  leakSeverity: number; // 1 to 3
}

export default function WaterSaver() {
  const [score, setScore] = useState(0);
  const [waterLevel, setWaterLevel] = useState(100); // Max 100
  const [taps, setTaps] = useState<Tap[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [timeSurvived, setTimeSurvived] = useState(0);

  const initGame = () => {
    setScore(0);
    setWaterLevel(100);
    setIsGameOver(false);
    setLevel(1);
    setTimeSurvived(0);
    
    // Initial taps layout
    setTaps([
      { id: '1', x: 20, y: 30, isLeaking: false, leakSeverity: 0 },
      { id: '2', x: 80, y: 40, isLeaking: false, leakSeverity: 0 },
      { id: '3', x: 50, y: 60, isLeaking: false, leakSeverity: 0 },
      { id: '4', x: 25, y: 75, isLeaking: false, leakSeverity: 0 },
      { id: '5', x: 75, y: 80, isLeaking: false, leakSeverity: 0 },
    ]);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Main game loop
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setTimeSurvived(t => {
        const newTime = t + 1;
        if (newTime % 15 === 0) setLevel(l => l + 1); // Level up every 15s
        return newTime;
      });

      setTaps(currentTaps => {
        const newTaps = [...currentTaps];
        
        // Randomly start leaking based on level
        const leakChance = 0.05 + (level * 0.02);
        if (Math.random() < leakChance) {
          const nonLeaking = newTaps.filter(t => !t.isLeaking);
          if (nonLeaking.length > 0) {
            const target = nonLeaking[Math.floor(Math.random() * nonLeaking.length)];
            target.isLeaking = true;
            target.leakSeverity = 1;
          }
        }

        // Increase severity of existing leaks
        newTaps.forEach(t => {
          if (t.isLeaking && Math.random() < 0.1) {
            t.leakSeverity = Math.min(3, t.leakSeverity + 1);
          }
        });

        return newTaps;
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, level]);

  // Water drain loop
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      const activeLeaks = taps.filter(t => t.isLeaking).reduce((acc, t) => acc + t.leakSeverity, 0);
      
      if (activeLeaks > 0) {
        setWaterLevel(w => {
          const newLevel = Math.max(0, w - (activeLeaks * 0.5)); // Drain speed
          if (newLevel <= 0) setIsGameOver(true);
          return newLevel;
        });
      } else {
        // Slowly recover water if no leaks
        setWaterLevel(w => Math.min(100, w + 0.2));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [taps, isGameOver]);

  const fixTap = (id: string) => {
    if (isGameOver) return;

    setTaps(currentTaps => 
      currentTaps.map(t => {
        if (t.id === id && t.isLeaking) {
          setScore(s => s + (t.leakSeverity * 10));
          return { ...t, isLeaking: false, leakSeverity: 0 };
        }
        return t;
      })
    );
  };

  return (
    <GameLayout
      gameName="Water Saver"
      score={score}
      timer={timeSurvived}
      level={level}
      xpEarned={Math.floor(score / 3)}
      isGameOver={isGameOver}
      onRestart={initGame}
      theme="blue"
      starsEarned={timeSurvived > 60 ? 3 : timeSurvived > 30 ? 2 : timeSurvived > 10 ? 1 : 0}
      ecoMessage="Fixing leaks saves thousands of liters of water every year!"
    >
      <div className={`relative w-full h-full overflow-hidden transition-colors duration-1000 ${waterLevel < 30 ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-cyan-50 dark:bg-slate-900'}`}>
        
        {/* Background Scenery */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          {/* Simple village shapes */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-amber-600 rounded-t-[100%] scale-150 translate-y-1/2"></div>
          <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-2xl"></div>
        </div>

        {/* Central Water Tank UI */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-64 h-8 bg-slate-200 dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-700 shadow-lg overflow-hidden z-20">
          <motion.div 
            className={`h-full ${waterLevel < 30 ? 'bg-red-500' : 'bg-blue-500'}`}
            animate={{ width: `${waterLevel}%` }}
            transition={{ type: "tween", ease: "linear", duration: 0.2 }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white mix-blend-difference drop-shadow-md">
            WATER SUPPLY: {Math.floor(waterLevel)}%
          </div>
        </div>

        {/* Warning Overlay */}
        <AnimatePresence>
          {waterLevel < 20 && !isGameOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute inset-0 bg-red-500 pointer-events-none z-10"
            />
          )}
        </AnimatePresence>

        {/* Taps & Pipes */}
        <div className="absolute inset-0 z-20">
          {/* Faux pipes connecting taps */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-400 dark:stroke-slate-600 stroke-[8px] fill-none stroke-linecap-round" style={{ opacity: 0.5 }}>
             <path d="M 50% 10% L 50% 90%" />
             <path d="M 20% 30% L 50% 30%" />
             <path d="M 80% 40% L 50% 40%" />
             <path d="M 25% 75% L 50% 75%" />
             <path d="M 75% 80% L 50% 80%" />
          </svg>

          {taps.map(tap => (
            <div 
              key={tap.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${tap.x}%`, top: `${tap.y}%` }}
            >
              {/* Tap Icon Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => fixTap(tap.id)}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg text-3xl border-4 transition-colors ${
                  tap.isLeaking 
                    ? 'bg-red-100 border-red-500 animate-pulse' 
                    : 'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600'
                }`}
              >
                🚰
              </motion.button>

              {/* Leak Animation */}
              <AnimatePresence>
                {tap.isLeaking && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-14 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                  >
                    {[...Array(tap.leakSeverity)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: -10, opacity: 0, scale: 0.5 }}
                        animate={{ y: 50 + (i * 20), opacity: [0, 1, 0], scale: 1 }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 0.6, 
                          delay: i * 0.2,
                          ease: "easeIn" 
                        }}
                        className="text-blue-500 text-2xl absolute"
                      >
                        💧
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </GameLayout>
  );
}
