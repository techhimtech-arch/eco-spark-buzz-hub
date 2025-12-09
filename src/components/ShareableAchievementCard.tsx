import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Share2, X, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface ShareableAchievementCardProps {
  achievement: {
    name: string;
    description: string;
    icon: string;
    type?: "achievement" | "challenge" | "badge";
    points?: number;
  };
  userName?: string;
  onClose: () => void;
}

export const ShareableAchievementCard = ({
  achievement,
  userName = "Eco Warrior",
  onClose,
}: ShareableAchievementCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    if (!cardRef.current) return null;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const imageUrl = await generateImage();
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.download = `ecolearn-${achievement.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = imageUrl;
    link.click();
    toast.success("Achievement card downloaded!");
  };

  const handleShare = async () => {
    const imageUrl = await generateImage();
    if (!imageUrl) return;

    // Convert base64 to blob for sharing
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], "ecolearn-achievement.png", { type: "image/png" });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `I unlocked "${achievement.name}" on EcoLearn!`,
          text: `🌱 I just earned the "${achievement.name}" achievement on EcoLearn! Join me in learning about sustainability.`,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          // Fallback to copying link
          copyToClipboard();
        }
      }
    } else {
      // Fallback for browsers that don't support file sharing
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const shareText = `🌱 I just earned the "${achievement.name}" achievement on EcoLearn! ${achievement.description}`;
    navigator.clipboard.writeText(shareText);
    toast.success("Share text copied to clipboard!");
  };

  const getTypeLabel = () => {
    switch (achievement.type) {
      case "challenge":
        return "Challenge Complete";
      case "badge":
        return "Badge Earned";
      default:
        return "Achievement Unlocked";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center gap-4 max-w-sm w-full"
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-background/50 hover:bg-background/80"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* The shareable card */}
        <div
          ref={cardRef}
          className="w-full aspect-square rounded-2xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #0f4c3a 0%, #1a6b4d 50%, #22c55e 100%)",
          }}
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-white">
            {/* Logo */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="font-bold text-lg">EcoLearn</span>
            </div>

            {/* Type label */}
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              {getTypeLabel()}
            </div>

            {/* Main content */}
            <div className="text-center space-y-4 mt-8">
              {/* Icon */}
              <div className="text-8xl drop-shadow-lg">{achievement.icon}</div>

              {/* Achievement name */}
              <h2 className="text-2xl font-bold drop-shadow-md">
                {achievement.name}
              </h2>

              {/* Description */}
              <p className="text-white/90 text-sm max-w-[80%] mx-auto">
                {achievement.description}
              </p>

              {/* Points */}
              {achievement.points && (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-xl">🏆</span>
                  <span className="font-bold">+{achievement.points} points</span>
                </div>
              )}
            </div>

            {/* User name */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white/80 text-sm">Unlocked by</p>
              <p className="font-semibold text-lg">{userName}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download
          </Button>
          <Button
            onClick={handleShare}
            disabled={isGenerating}
            variant="outline"
            className="flex-1"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4 mr-2" />
            )}
            Share
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};