import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameLayout } from "@/components/games/GameLayout";

interface HabitatTile {
  id: number;
  isRestored: boolean;
  type: 'forest' | 'water' | 'mountain';
}

interface Animal {
  id: string;
  emoji: string;
  x: number;
  y: number;
  type: 'forest' | 'water' | 'mountain';
}

export default function AnimalRescue() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const [tiles, setTiles] = useState<HabitatTile[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);

  const gridSize = 4; // 4x4 grid

  const initGame = () => {
    setIsGameOver(false);
    
    // Generate board
    const newTiles: HabitatTile[] = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const types: ('forest' | 'water' | 'mountain')[] = ['forest', 'water', 'mountain'];
      newTiles.push({
        id: i,
        isRestored: false,
        type: types[Math.floor(Math.random() * types.length)]
      });
    }
    setTiles(newTiles);
    setAnimals([]);
  };

  useEffect(() => {
    initGame();
  }, [level]);

  useEffect(() => {
    if (tiles.length > 0 && tiles.every(t => t.isRestored)) {
      // Level complete
      setTimeout(() => {
        setIsGameOver(true);
      }, 1500);
    }
  }, [tiles]);

  const tileColors = {
    forest: { dirty: 'bg-stone-600', clean: 'bg-emerald-500' },
    water: { dirty: 'bg-stone-700', clean: 'bg-blue-400' },
    mountain: { dirty: 'bg-stone-500', clean: 'bg-slate-400' }
  };

  const animalEmojis = {
    forest: ['🦌', '🦊', '🐿️', '🐇'],
    water: ['🦆', '🐢', '🐸', '🦢'],
    mountain: ['🦅', '🐐', '🐻', '🦉']
  };

  const restoreTile = (id: number) => {
    if (isGameOver) return;

    setTiles(prev => {
      const newTiles = [...prev];
      const tile = newTiles.find(t => t.id === id);
      
      if (tile && !tile.isRestored) {
        tile.isRestored = true;
        setScore(s => s + 10);

        // Spawn an animal for this habitat type
        if (Math.random() > 0.3) {
          const emojis = animalEmojis[tile.type];
          const emoji = emojis[Math.floor(Math.random() * emojis.length)];
          
          setAnimals(a => [...a, {
            id: Math.random().toString(),
            emoji,
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 80,
            type: tile.type
          }]);
        }
      }
      return newTiles;
    });
  };

  return (
    <GameLayout
      gameName="Habitat Rescue"
      score={score}
      level={level}
      xpEarned={score}
      isGameOver={isGameOver}
      onRestart={() => { setScore(0); setLevel(1); initGame(); }}
      onNextLevel={() => { setLevel(l => l + 1); }}
      theme="earth"
      starsEarned={3}
      ecoMessage="Restoring ecosystems helps bring wildlife back to their natural homes!"
    >
      <div className={`relative w-full h-full p-4 flex flex-col items-center justify-center transition-colors duration-2000 ${
        tiles.filter(t => t.isRestored).length > (gridSize * gridSize) / 2 
          ? 'bg-emerald-100 dark:bg-emerald-900' 
          : 'bg-stone-300 dark:bg-stone-800'
      }`}>

        <div className="max-w-md w-full bg-white/50 dark:bg-black/20 p-4 rounded-3xl backdrop-blur-sm shadow-xl relative z-10">
          <div className="mb-4 text-center">
            <h3 className="text-stone-800 dark:text-stone-200 font-bold">
              Tap tiles to clean pollution!
            </h3>
            <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${(tiles.filter(t => t.isRestored).length / (gridSize * gridSize)) * 100}%` }}
              />
            </div>
          </div>

          <div 
            className="grid gap-2 relative" 
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              aspectRatio: '1/1'
            }}
          >
            {tiles.map(tile => (
              <motion.div
                key={tile.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => restoreTile(tile.id)}
                className={`rounded-2xl cursor-pointer relative overflow-hidden transition-colors duration-1000 ${
                  tile.isRestored ? tileColors[tile.type].clean : tileColors[tile.type].dirty
                }`}
              >
                {!tile.isRestored && (
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-50" />
                )}
                
                <AnimatePresence>
                  {tile.isRestored && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center text-3xl opacity-50"
                    >
                      {tile.type === 'forest' ? '🌲' : tile.type === 'water' ? '💧' : '⛰️'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Animals floating over the board */}
            <AnimatePresence>
              {animals.map(animal => (
                <motion.div
                  key={animal.id}
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    y: [0, -10, 0],
                    x: [0, (Math.random() - 0.5) * 20, 0]
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  className="absolute text-4xl drop-shadow-lg pointer-events-none z-20"
                  style={{
                    left: `${animal.x}%`,
                    top: `${animal.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {animal.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating background particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {tiles.filter(t => t.isRestored).length > 5 && (
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               className="absolute inset-0"
             >
               {[...Array(10)].map((_, i) => (
                 <motion.div
                   key={i}
                   animate={{
                     y: [1000, -100],
                     x: Math.sin(i) * 100,
                     rotate: 360
                   }}
                   transition={{
                     duration: 10 + Math.random() * 10,
                     repeat: Infinity,
                     ease: "linear",
                     delay: Math.random() * 5
                   }}
                   className="absolute text-xl opacity-30"
                   style={{ left: `${Math.random() * 100}%`, bottom: '-50px' }}
                 >
                   ✨
                 </motion.div>
               ))}
             </motion.div>
          )}
        </div>

      </div>
    </GameLayout>
  );
}
