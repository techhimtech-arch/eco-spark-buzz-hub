import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Trophy, Sparkles, Star, Leaf, Droplets, Rabbit } from "lucide-react";
import { Button } from "@/components/ui/button";

const GAMES = [
  {
    id: "garbage-sorting",
    title: "Garbage Sorting Rush",
    description: "Drag falling trash into the correct bins before time runs out!",
    color: "bg-gradient-to-br from-green-400 to-emerald-600",
    icon: <Leaf className="w-8 h-8 text-white" />,
    path: "/games/garbage-sorting",
    tags: ["Action", "Sorting"],
  },
  {
    id: "tree-planter",
    title: "Tree Planter Clicker",
    description: "Tap to plant trees and grow a beautiful forest.",
    color: "bg-gradient-to-br from-emerald-500 to-green-700",
    icon: <Sparkles className="w-8 h-8 text-white" />,
    path: "/games/tree-planter",
    tags: ["Clicker", "Relaxing"],
  },
  {
    id: "water-saver",
    title: "Water Saver Challenge",
    description: "Fix leaking taps and manage the village water supply.",
    color: "bg-gradient-to-br from-cyan-400 to-blue-600",
    icon: <Droplets className="w-8 h-8 text-white" />,
    path: "/games/water-saver",
    tags: ["Strategy", "Puzzle"],
  },
  {
    id: "eco-runner",
    title: "Eco Runner India",
    description: "Endless runner! Collect saplings and dodge pollution.",
    color: "bg-gradient-to-br from-yellow-400 to-orange-500",
    icon: <Play className="w-8 h-8 text-white" />,
    path: "/games/eco-runner",
    tags: ["Endless", "Arcade"],
  },
  {
    id: "animal-rescue",
    title: "Animal Habitat Rescue",
    description: "Restore the ecosystem and help animals return home.",
    color: "bg-gradient-to-br from-amber-600 to-orange-800",
    icon: <Rabbit className="w-8 h-8 text-white" />,
    path: "/games/animal-rescue",
    tags: ["Puzzle", "Nature"],
  },
];

export default function GamesHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-b-[3rem] p-8 pt-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <Leaf
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: 0.5 + Math.random() * 0.5,
              }}
              size={20 + Math.random() * 20}
            />
          ))}
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm mb-4 inline-block shadow-inner">
            <Trophy className="w-10 h-10 text-yellow-300" fill="currentColor" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight drop-shadow-md">
            Learn Himsols <span className="text-yellow-300">Arcade</span>
          </h1>
          <p className="text-emerald-50 font-medium max-w-md text-lg">
            Play games, earn XP, and learn how to save the planet!
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-xl border border-slate-100 dark:border-slate-700 flex justify-around items-center">
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total XP</p>
            <p className="text-2xl font-black text-blue-500">2,450</p>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stars</p>
            <p className="text-2xl font-black text-yellow-500 flex items-center justify-center gap-1">
              12 <Star className="w-5 h-5 fill-yellow-500" />
            </p>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</p>
            <p className="text-2xl font-black text-emerald-500">#4</p>
          </div>
        </div>
      </div>

      {/* Game List */}
      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {GAMES.map((game, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={game.id}
          >
            <div 
              onClick={() => navigate(game.path)}
              className="group cursor-pointer bg-white dark:bg-slate-800 rounded-[2rem] p-4 shadow-md hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center"
            >
              <div className={`${game.color} w-24 h-24 rounded-[1.5rem] flex flex-shrink-0 items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300`}>
                {game.icon}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap gap-2 mb-1 justify-center md:justify-start">
                  {game.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 group-hover:text-emerald-500 transition-colors">
                  {game.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {game.description}
                </p>
              </div>

              <div className="hidden md:flex flex-shrink-0 pr-4">
                <Button className="rounded-full w-14 h-14 shadow-lg shadow-emerald-500/30 bg-emerald-500 hover:bg-emerald-600 group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-white" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
