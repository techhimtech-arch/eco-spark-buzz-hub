import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Share2, Loader2, X, Copy, MessageCircle } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { buildRefLink } from "@/lib/referral";

interface ShareScoreCardProps {
  playerName: string;
  score: number;
  total: number;
  label: string; // e.g. "Quick Eco Quiz" or "GridLock"
  emoji?: string;
  subline?: string; // e.g. difficulty
  rankText?: string; // e.g. "Top 5%" or "#3 in India"
  onClose: () => void;
  sharePath?: string; // defaults to /play
}

export const ShareScoreCard = ({
  playerName,
  score,
  total,
  label,
  emoji = "🌱",
  subline,
  rankText,
  onClose,
  sharePath = "/play",
}: ShareScoreCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const link = buildRefLink(playerName || "Friend", sharePath);
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const shareText = `🌱 Maine EcoLearn pe ${label} mein ${score}/${total} (${pct}%) score kiya! 🏆\nKya tum mujhe beat kar sakte ho? 👉 ${link}`;

  const generate = async () => {
    if (!cardRef.current) return null;
    setBusy(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      return canvas.toDataURL("image/png");
    } catch (e) {
      console.error(e);
      toast.error("Image generate nahi hui");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    const url = await generate();
    if (!url) return;
    const a = document.createElement("a");
    a.download = `ecolearn-${playerName.toLowerCase().replace(/\s+/g, "-")}-score.png`;
    a.href = url;
    a.click();
    toast.success("Card downloaded!");
  };

  const shareNative = async () => {
    const dataUrl = await generate();
    if (!dataUrl) return;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "ecolearn-score.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText, title: "EcoLearn" });
        toast.success("Shared!");
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    // fallback
    navigator.clipboard.writeText(shareText);
    toast.success("Share text copy ho gaya!");
  };

  const whatsapp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast.success("Link copy ho gaya!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 overflow-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center gap-4 max-w-sm w-full my-8"
      >
        <div className="self-end">
          <Button variant="ghost" size="icon" className="bg-background/50" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* The shareable card */}
        <div
          ref={cardRef}
          className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-2xl"
          style={{ background: "linear-gradient(135deg, #064e3b 0%, #047857 40%, #10b981 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 60%, #fff 1px, transparent 1px)`,
              backgroundSize: "40px 40px, 60px 60px",
            }}
          />

          <div className="relative z-10 h-full flex flex-col p-6 text-white">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌱</span>
                <span className="font-bold">EcoLearn</span>
              </div>
              <span className="text-xs bg-white/20 backdrop-blur px-3 py-1 rounded-full font-medium">
                {label}
              </span>
            </div>

            {/* Center */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-7xl mb-2 drop-shadow-lg">{emoji}</div>
              <div className="text-sm text-white/80 uppercase tracking-wider">Score</div>
              <div className="text-6xl font-black drop-shadow-md">
                {score}<span className="text-3xl text-white/70">/{total}</span>
              </div>
              <div className="text-2xl font-bold mt-1">{pct}%</div>
              {rankText && (
                <div className="mt-3 bg-yellow-400 text-yellow-950 font-bold px-4 py-1 rounded-full text-sm">
                  🏆 {rankText}
                </div>
              )}
              {subline && <div className="text-white/80 text-xs mt-2 capitalize">{subline}</div>}
            </div>

            {/* Bottom */}
            <div className="text-center">
              <div className="text-white/80 text-xs">Played by</div>
              <div className="font-bold text-xl truncate">{playerName}</div>
              <div className="mt-3 text-xs text-white/90 bg-white/10 backdrop-blur rounded-lg py-2 px-3">
                Beat my score 👉 <span className="font-mono">learn.himsols.com/play</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            onClick={whatsapp}
            disabled={busy}
            className="bg-[#25D366] hover:bg-[#1ebe57] text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
          </Button>
          <Button onClick={shareNative} disabled={busy} variant="secondary">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
            Share
          </Button>
          <Button onClick={download} disabled={busy} variant="outline">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Download
          </Button>
          <Button onClick={copyLink} variant="outline">
            <Copy className="w-4 h-4 mr-2" /> Copy Link
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Jab tumhare friend is link se khelenge, tumhe credit milega 🌟
        </p>
      </motion.div>
    </motion.div>
  );
};