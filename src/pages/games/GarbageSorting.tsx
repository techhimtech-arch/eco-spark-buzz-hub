import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameLayout } from "@/components/games/GameLayout";

type TrashType = "plastic" | "paper" | "organic" | "ewaste";

interface TrashItem {
  id: string;
  type: TrashType;
  emoji: string;
  x: number;
  y: number;
  isDragging: boolean;
}

const TRASH_DATA: Record<TrashType, string[]> = {
  plastic: ["🧴", "🥤", "🛍️", "🍼"],
  paper: ["📰", "📦", "📄", "🧻"],
  organic: ["🍎", "🍌", "🥦", "🍂"],
  ewaste: ["📱", "💻", "🔋", "🖱️"],
};

const BINS: { type: TrashType; color: string; label: string; icon: string }[] = [
  { type: "plastic", color: "bg-blue-500 border-blue-600", label: "Plastic", icon: "♻️" },
  { type: "paper", color: "bg-yellow-500 border-yellow-600", label: "Paper", icon: "📰" },
  { type: "organic", color: "bg-green-500 border-green-600", label: "Organic", icon: "🍎" },
  { type: "ewaste", color: "bg-red-500 border-red-600", label: "E-Waste", icon: "🔋" },
];

export default function GarbageSorting() {
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [particles, setParticles] = useState<{id: string, x: number, y: number, color: string}[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  const startGame = () => {
    setScore(0);
    setTimer(60);
    setLevel(1);
    setIsGameOver(false);
    setTrashItems([]);
    setStreak(0);
  };

  const spawnTrash = () => {
    if (isGameOver) return;
    
    const types: TrashType[] = ["plastic", "paper", "organic", "ewaste"];
    const type = types[Math.floor(Math.random() * types.length)];
    const emojis = TRASH_DATA[type];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const newItem: TrashItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      emoji,
      x: 10 + Math.random() * 80, // Random X %
      y: -10, // Start above screen
      isDragging: false,
    };
    
    setTrashItems(prev => [...prev, newItem]);
  };

  const updateGame = () => {
    if (isGameOver) return;
    
    const now = Date.now();
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;
    
    // Move trash down
    setTrashItems(prev => {
      const active = prev.filter(item => item.y < 110);
      return active.map(item => {
        if (item.isDragging) return item;
        return {
          ...item,
          y: item.y + (20 + level * 5) * (deltaTime / 1000) // Fall speed
        };
      });
    });
    
    requestRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isGameOver, level]);

  useEffect(() => {
    if (isGameOver) return;
    
    const spawnRate = Math.max(800, 2500 - level * 300);
    const interval = setInterval(spawnTrash, spawnRate);
    return () => clearInterval(interval);
  }, [isGameOver, level]);

  useEffect(() => {
    if (timer > 0 && !isGameOver) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !isGameOver) {
      setIsGameOver(true);
    }
  }, [timer, isGameOver]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (event: any, info: any, item: TrashItem) => {
    // Simple collision detection based on horizontal position
    const screenWidth = window.innerWidth;
    const binWidth = screenWidth / 4;
    
    // Estimate dropped bin based on pointer x
    const dropX = info.point.x;
    let binIndex = Math.floor(dropX / binWidth);
    
    // Clamp to valid bins
    binIndex = Math.max(0, Math.min(3, binIndex));
    const targetBin = BINS[binIndex];

    const isCorrect = item.type === targetBin.type;
    
    if (isCorrect) {
      // Success
      setStreak(s => s + 1);
      const points = 10 + Math.min(streak * 2, 20);
      setScore(s => s + points);
      
      // Level up every 150 points
      if (score + points > level * 150) {
        setLevel(l => l + 1);
        setTimer(t => t + 15); // Bonus time
      }
      
      // Spawn particles
      const newParticles = Array.from({length: 5}).map((_, i) => ({
        id: Math.random().toString(),
        x: info.point.x,
        y: info.point.y,
        color: targetBin.color.split(' ')[0].replace('bg-', '')
      }));
      setParticles(p => [...p, ...newParticles]);
      setTimeout(() => setParticles(p => p.filter(x => !newParticles.find(n => n.id === x.id))), 1000);
    } else {
      // Fail
      setStreak(0);
      setTimer(t => Math.max(0, t - 3)); // Penalty
    }

    setTrashItems(prev => prev.filter(t => t.id !== item.id));
  };

  return (
    <GameLayout
      gameName="Sorting Rush"
      score={score}
      timer={timer}
      level={level}
      xpEarned={Math.floor(score / 5)}
      isGameOver={isGameOver}
      onRestart={startGame}
      theme="blue"
      starsEarned={score > 500 ? 3 : score > 200 ? 2 : score > 50 ? 1 : 0}
      ecoMessage="Proper sorting helps recycle materials and save resources!"
    >
      <div className="relative w-full h-full overflow-hidden flex flex-col" ref={containerRef}>
        
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-10 w-32 h-32 bg-white rounded-full blur-3xl mix-blend-overlay"></div>
          <div className="absolute top-1/2 right-10 w-48 h-48 bg-blue-200 rounded-full blur-3xl mix-blend-overlay"></div>
        </div>

        {/* Streak indicator */}
        <AnimatePresence>
          {streak > 2 && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-red-500 text-white font-black px-4 py-1 rounded-full shadow-lg z-10"
            >
              🔥 {streak}x Combo!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play Area */}
        <div className="flex-1 relative z-20">
          <AnimatePresence>
            {trashItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{
                  position: 'absolute',
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                drag
                dragMomentum={false}
                onDragStart={() => setTrashItems(prev => prev.map(t => t.id === item.id ? {...t, isDragging: true} : t))}
                onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                whileDrag={{ scale: 1.5, zIndex: 50 }}
                className="text-5xl cursor-grab active:cursor-grabbing touch-none drop-shadow-lg"
              >
                {item.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Particles */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
              animate={{ 
                x: p.x + (Math.random() - 0.5) * 100, 
                y: p.y - 100 - Math.random() * 50,
                opacity: 0,
                scale: 0
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`absolute w-3 h-3 rounded-full bg-${p.color}-500 z-30`}
            />
          ))}
        </div>

        {/* Bins Area */}
        <div className="h-40 flex w-full relative z-10 border-t-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
          {BINS.map((bin, index) => (
            <div key={index} className="flex-1 flex flex-col items-center justify-end pb-4 border-r border-slate-100 dark:border-slate-800 last:border-0 relative overflow-hidden group">
              <div className={`w-20 h-28 ${bin.color} border-b-[8px] rounded-t-xl shadow-inner relative flex flex-col items-center justify-center transition-transform group-hover:scale-105`}>
                <div className="absolute top-2 w-16 h-2 bg-black/10 rounded-full"></div>
                <span className="text-3xl drop-shadow-md">{bin.icon}</span>
              </div>
              <div className="font-black text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 mt-2">
                {bin.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </GameLayout>
  );
}
