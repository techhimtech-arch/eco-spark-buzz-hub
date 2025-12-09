import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { X, Sparkles, Trophy, Star, PartyPopper, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { CelebrationData } from "@/hooks/useCelebration";
import { ShareableAchievementCard } from "./ShareableAchievementCard";

interface CelebrationOverlayProps {
  celebration: CelebrationData | null;
  onClose: () => void;
  userName?: string;
}

const CONFETTI_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--warning))",
  "#22c55e",
  "#ec4899",
  "#8b5cf6",
  "#f97316",
  "#06b6d4",
];

const CONFETTI_SHAPES = ["circle", "square", "triangle", "star"] as const;

interface ConfettiParticle {
  id: number;
  x: number;
  delay: number;
  color: string;
  shape: typeof CONFETTI_SHAPES[number];
  size: number;
  rotation: number;
  velocity: number;
}

export const CelebrationOverlay = ({
  celebration,
  onClose,
  userName,
}: CelebrationOverlayProps) => {
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [showShareCard, setShowShareCard] = useState(false);

  const particles = useMemo(() => {
    if (!celebration) return [];
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      velocity: Math.random() * 0.5 + 0.5,
    }));
  }, [celebration]);

  useEffect(() => {
    if (celebration) {
      setConfetti(particles);
      const timer = setTimeout(onClose, 6000);
      return () => clearTimeout(timer);
    }
  }, [celebration, onClose, particles]);

  const getIcon = () => {
    switch (celebration?.type) {
      case "challenge":
        return <Trophy className="w-8 h-8 text-warning" />;
      case "badge":
        return <Star className="w-8 h-8 text-primary" />;
      default:
        return <Sparkles className="w-8 h-8 text-accent" />;
    }
  };

  const getTitle = () => {
    switch (celebration?.type) {
      case "challenge":
        return "Challenge Complete!";
      case "badge":
        return "Badge Earned!";
      default:
        return "Achievement Unlocked!";
    }
  };

  const renderConfettiShape = (particle: ConfettiParticle) => {
    const baseStyle = {
      backgroundColor: particle.shape !== "triangle" ? particle.color : "transparent",
      borderColor: particle.color,
    };

    switch (particle.shape) {
      case "circle":
        return (
          <div
            className="rounded-full"
            style={{
              ...baseStyle,
              width: particle.size,
              height: particle.size,
            }}
          />
        );
      case "square":
        return (
          <div
            className="rounded-sm"
            style={{
              ...baseStyle,
              width: particle.size,
              height: particle.size,
              transform: `rotate(${particle.rotation}deg)`,
            }}
          />
        );
      case "triangle":
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${particle.size / 2}px solid transparent`,
              borderRight: `${particle.size / 2}px solid transparent`,
              borderBottom: `${particle.size}px solid ${particle.color}`,
              transform: `rotate(${particle.rotation}deg)`,
            }}
          />
        );
      case "star":
        return (
          <div
            style={{
              fontSize: particle.size,
              color: particle.color,
              lineHeight: 1,
            }}
          >
            ★
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Confetti particles */}
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute pointer-events-none"
              initial={{
                top: "110%",
                left: `${particle.x}%`,
                opacity: 1,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                top: ["-10%"],
                opacity: [1, 1, 0],
                scale: [0, 1, 1],
                rotate: [0, particle.rotation * 2],
                x: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: 3 * particle.velocity,
                delay: particle.delay,
                ease: "easeOut",
              }}
            >
              {renderConfettiShape(particle)}
            </motion.div>
          ))}

          {/* Burst effect from center */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`burst-${i}`}
              className="absolute w-3 h-3 rounded-full pointer-events-none"
              style={{
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              }}
              initial={{
                top: "50%",
                left: "50%",
                scale: 0,
                opacity: 1,
              }}
              animate={{
                top: `${50 + Math.sin((i / 20) * Math.PI * 2) * 40}%`,
                left: `${50 + Math.cos((i / 20) * Math.PI * 2) * 40}%`,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: 0.2,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Main celebration card */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/50 via-accent/50 to-warning/50 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <Card className="p-8 max-w-md mx-4 shadow-2xl border-2 border-primary/50 relative overflow-hidden bg-card/95 backdrop-blur-sm">
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Sparkle effects */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${10 + Math.random() * 80}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.3,
                    repeat: Infinity,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-warning" />
                </motion.div>
              ))}

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 hover:bg-primary/10"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Content */}
              <div className="relative z-10 text-center space-y-4">
                {/* Animated icon */}
                <motion.div
                  className="relative"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 hsl(var(--primary) / 0.4)",
                        "0 0 0 20px hsl(var(--primary) / 0)",
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    <PartyPopper className="w-10 h-10 text-primary" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-2"
                >
                  {getIcon()}
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    {getTitle()}
                  </h2>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-6xl my-4"
                >
                  {celebration.icon}
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <h3 className="text-xl font-semibold text-foreground">
                    {celebration.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {celebration.description}
                  </p>
                  {celebration.points && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/20 text-warning font-bold"
                    >
                      <Trophy className="w-5 h-5" />
                      +{celebration.points} points!
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3 justify-center"
                >
                  <Button onClick={onClose} className="mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Awesome!
                  </Button>
                  <Button 
                    onClick={() => setShowShareCard(true)} 
                    variant="outline" 
                    className="mt-4"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Shareable Achievement Card */}
      <AnimatePresence>
        {showShareCard && celebration && (
          <ShareableAchievementCard
            achievement={{
              name: celebration.title,
              description: celebration.description,
              icon: celebration.icon,
              type: celebration.type,
              points: celebration.points,
            }}
            userName={userName}
            onClose={() => {
              setShowShareCard(false);
              onClose();
            }}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
