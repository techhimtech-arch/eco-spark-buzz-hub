import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, RefreshCw } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const ECO_TIPS = [
  "🌱 Aaj plastic bag mat lo — apna cloth bag use karo!",
  "💧 Brush karte waqt tap band rakho — 6 liters paani bachega!",
  "🔌 Charger ko unplug karo jab use na ho — phantom power waste mat karo!",
  "🚶 Short distances ke liye walk karo — health aur planet dono ka fayda!",
  "🍃 Paper napkins ki jagah cloth napkins use karo!",
  "♻️ Aaj ek cheez recycle karo — chhoti shuruat badi change laati hai!",
  "🌿 Indoor plants lagao — air purify hogi aur mood bhi achha rahega!",
  "🚿 5 minute shower lo — 45 liters paani bacha sakte ho!",
  "📦 Online shopping kam karo — packaging waste reduce hoga!",
  "🍱 Khana waste mat karo — leftover ko kal ka lunch banao!",
  "☀️ Din me natural light use karo — bijli bachao!",
  "🥤 Reusable bottle carry karo — plastic bottles se bachao environment!",
  "🌳 Mahine me ek ped lagao — future ke liye gift!",
  "🛍️ Second-hand items try karo — reduce, reuse, recycle!",
  "🚲 Cycle chalao — fitness bhi, nature bhi khush!",
];

export const DailyEcoTip = () => {
  const [tip, setTip] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * ECO_TIPS.length);
    return ECO_TIPS[randomIndex];
  };

  useEffect(() => {
    // Get tip based on date for consistency throughout the day
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("ecoTipDate");
    const storedTip = localStorage.getItem("ecoTip");

    if (storedDate === today && storedTip) {
      setTip(storedTip);
    } else {
      const newTip = getRandomTip();
      setTip(newTip);
      localStorage.setItem("ecoTipDate", today);
      localStorage.setItem("ecoTip", newTip);
    }
  }, []);

  const refreshTip = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newTip = getRandomTip();
      setTip(newTip);
      localStorage.setItem("ecoTip", newTip);
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-r from-eco-green/10 via-eco-teal/10 to-eco-blue/10 border-eco-green/30 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-eco-yellow/20 to-eco-orange/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-eco-yellow to-eco-orange shadow-lg">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-lg text-foreground">
                Aaj Ka Eco Tip 💡
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshTip}
                className="h-8 w-8 hover:bg-eco-green/20"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <motion.p
              key={tip}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-muted-foreground leading-relaxed"
            >
              {tip}
            </motion.p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
