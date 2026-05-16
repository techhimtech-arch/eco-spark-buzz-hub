import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameLayout } from "@/components/games/GameLayout";

export default function TreePlanter() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [trees, setTrees] = useState<{ id: string; x: number; y: number; scale: number; type: string }[]>([]);
  const [oxygen, setOxygen] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<{ id: string; x: number; y: number }[]>([]);

  const treeTypes = ["🌳", "🌲", "🌴", "🌱"];

  useEffect(() => {
    // Auto generate oxygen based on trees
    const interval = setInterval(() => {
      setOxygen((prev) => prev + trees.length * 0.5);
    }, 1000);
    return () => clearInterval(interval);
  }, [trees.length]);

  useEffect(() => {
    // Check level up
    if (oxygen > level * 100) {
      setLevel((prev) => prev + 1);
      setScore((prev) => prev + 50);
    }
  }, [oxygen, level]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    setClicks((c) => c + 1);
    
    // Show floating text
    const textId = Math.random().toString();
    setFloatingTexts(prev => [...prev, { id: textId, x: clientX, y: clientY }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== textId));
    }, 1000);

    // Plant a tree every 5 clicks
    if (clicks % 5 === 0) {
      const newTree = {
        id: Math.random().toString(),
        x: 10 + Math.random() * 80, // %
        y: 20 + Math.random() * 60, // %
        scale: 0.5 + Math.random() * 1,
        type: treeTypes[Math.floor(Math.random() * treeTypes.length)],
      };
      setTrees((prev) => [...prev, newTree]);
      setScore((prev) => prev + 10);
    }
  };

  const getBackgroundColors = () => {
    if (level < 2) return "from-amber-100 to-orange-100"; // Barren
    if (level < 4) return "from-green-100 to-amber-100"; // Greening
    if (level < 6) return "from-green-300 to-emerald-200"; // Forest
    return "from-emerald-400 to-green-600"; // Lush
  };

  return (
    <GameLayout
      gameName="Tree Planter"
      score={score}
      level={level}
      xpEarned={Math.floor(score / 2)}
      isGameOver={false} // Never really over
      onRestart={() => {
        setScore(0);
        setLevel(1);
        setTrees([]);
        setOxygen(0);
        setClicks(0);
      }}
      theme="green"
    >
      <div 
        className={`relative w-full h-full overflow-hidden transition-colors duration-1000 bg-gradient-to-b ${getBackgroundColors()}`}
        onClick={handleTap}
        onTouchStart={handleTap}
      >
        {/* Sun / Environment */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300 rounded-full blur-2xl opacity-60"
        />

        {/* HUD */}
        <div className="absolute top-4 left-4 right-4 bg-white/40 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50 flex flex-col gap-2 z-10 pointer-events-none">
          <div>
            <div className="text-xs font-black uppercase text-emerald-800 mb-1">Oxygen Production</div>
            <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-400"
                style={{ width: `${Math.min(100, (oxygen / (level * 100)) * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs font-bold text-emerald-900">
            <span>{Math.floor(oxygen)} O₂</span>
            <span>{trees.length} Trees</span>
          </div>
        </div>

        {/* Trees */}
        <AnimatePresence>
          {trees.map(tree => (
            <motion.div
              key={tree.id}
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: tree.scale, opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="absolute text-6xl drop-shadow-xl pointer-events-none"
              style={{
                left: `${tree.x}%`,
                top: `${tree.y}%`,
                zIndex: Math.floor(tree.y), // Sort by Y
              }}
            >
              {tree.type}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Floating Texts */}
        <AnimatePresence>
          {floatingTexts.map(text => (
            <motion.div
              key={text.id}
              initial={{ opacity: 1, y: text.y, x: text.x }}
              animate={{ opacity: 0, y: text.y - 50 }}
              exit={{ opacity: 0 }}
              className="absolute text-emerald-600 font-black text-xl pointer-events-none z-50 drop-shadow-md"
              style={{ left: 0, top: 0 }}
            >
              +1
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-emerald-800/50 font-bold uppercase tracking-widest pointer-events-none">
          Tap anywhere to plant
        </div>
      </div>
    </GameLayout>
  );
}
