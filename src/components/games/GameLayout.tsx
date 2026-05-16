import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pause, Play, Volume2, VolumeX, Star, RotateCcw, ChevronRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface GameLayoutProps {
  children: React.ReactNode;
  gameName: string;
  score: number;
  timer?: number;
  level: number;
  xpEarned: number;
  isGameOver: boolean;
  onRestart: () => void;
  onNextLevel?: () => void;
  starsEarned?: number;
  ecoMessage?: string;
  theme?: 'green' | 'blue' | 'yellow' | 'earth';
}

export const GameLayout: React.FC<GameLayoutProps> = ({
  children,
  gameName,
  score,
  timer,
  level,
  xpEarned,
  isGameOver,
  onRestart,
  onNextLevel,
  starsEarned = 0,
  ecoMessage = "Great job saving the planet!",
  theme = 'green',
}) => {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const themeColors = {
    green: 'from-emerald-400 to-green-600',
    blue: 'from-cyan-400 to-blue-600',
    yellow: 'from-amber-300 to-orange-500',
    earth: 'from-amber-600 to-orange-800',
  };

  return (
    <div className={`fixed inset-0 w-full h-full bg-slate-900 flex flex-col overflow-hidden`}>
      {/* Top Bar */}
      <div className={`relative z-50 bg-gradient-to-r ${themeColors[theme]} p-4 flex items-center justify-between shadow-lg text-white rounded-b-3xl`}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/games')} className="text-white hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="font-bold text-lg leading-tight">{gameName}</h1>
            <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full inline-block font-medium">
              Level {level}
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase font-bold text-white/80 tracking-wider">Score</span>
            <span className="font-black text-xl leading-tight">{score}</span>
          </div>
          
          {timer !== undefined && (
            <div className="flex flex-col items-center bg-black/20 px-3 py-1 rounded-xl">
              <span className="text-xs uppercase font-bold text-white/80 tracking-wider">Time</span>
              <span className="font-black text-xl leading-tight">{timer}s</span>
            </div>
          )}

          <div className="flex gap-1 ml-2">
            <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} className="text-white hover:bg-white/20 rounded-full w-10 h-10">
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} className="text-white hover:bg-white/20 rounded-full w-10 h-10">
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Game Content Area */}
      <div className="flex-1 relative bg-slate-100 dark:bg-slate-900">
        {children}

        {/* Pause Overlay */}
        <AnimatePresence>
          {isPaused && !isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4 border-4 border-t-[12px] border-emerald-500">
                <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Paused</h2>
                <Button 
                  onClick={() => setIsPaused(false)} 
                  className="w-full py-6 text-xl font-bold bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-[0_8px_0_0_#047857] hover:shadow-[0_4px_0_0_#047857] hover:translate-y-1 transition-all mb-4"
                >
                  Resume
                </Button>
                <Button 
                  onClick={() => { setIsPaused(false); onRestart(); }} 
                  variant="outline"
                  className="w-full py-6 text-xl font-bold rounded-2xl"
                >
                  Restart
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Screen */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
              >
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-yellow-400 to-amber-500 -z-10" />
                <div className="absolute top-8 left-1/2 -translate-x-1/2 -z-10 w-full h-full opacity-30">
                  <div className="w-64 h-64 border-[40px] border-white/20 rounded-full animate-spin-slow" />
                </div>

                <div className="text-center mb-8 mt-4">
                  <h2 className="text-4xl font-black text-white mb-2 uppercase drop-shadow-md">Level Complete!</h2>
                  
                  {/* Stars */}
                  <div className="flex justify-center gap-2 my-6">
                    {[1, 2, 3].map((star) => (
                      <motion.div
                        key={star}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: star * 0.2, type: 'spring' }}
                      >
                        <Star 
                          className={`w-14 h-14 ${star <= starsEarned ? 'fill-yellow-400 text-yellow-500' : 'fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600'}`} 
                          strokeWidth={1.5}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-700/50 rounded-3xl p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-bold text-slate-500 uppercase">Score</div>
                        <div className="text-3xl font-black text-emerald-500">{score}</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-500 uppercase">XP Earned</div>
                        <div className="text-3xl font-black text-blue-500">+{xpEarned}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 p-4 rounded-2xl font-medium flex items-center gap-3">
                    <span className="text-2xl">🌱</span>
                    <p className="text-left text-sm leading-tight">{ecoMessage}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {onNextLevel && (
                    <Button 
                      onClick={onNextLevel} 
                      className="w-full py-7 text-xl font-bold bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-[0_8px_0_0_#1d4ed8] hover:shadow-[0_4px_0_0_#1d4ed8] hover:translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                      Next Level <ChevronRight className="w-6 h-6" />
                    </Button>
                  )}
                  <div className="flex gap-3">
                    <Button 
                      onClick={onRestart} 
                      variant="outline"
                      className="flex-1 py-6 text-lg font-bold rounded-2xl border-4 border-slate-200 hover:bg-slate-100"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" /> Retry
                    </Button>
                    <Button 
                      onClick={() => navigate('/leaderboard')} 
                      variant="outline"
                      className="flex-1 py-6 text-lg font-bold rounded-2xl border-4 border-yellow-200 hover:bg-yellow-50 text-yellow-600"
                    >
                      <Trophy className="w-5 h-5 mr-2" /> Rank
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
