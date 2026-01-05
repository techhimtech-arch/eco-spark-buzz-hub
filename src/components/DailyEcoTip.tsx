import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, RefreshCw } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

interface EcoTip {
  id: string;
  tip: string;
  emoji: string;
}

export const DailyEcoTip = () => {
  const [tips, setTips] = useState<EcoTip[]>([]);
  const [tip, setTip] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    const { data, error } = await supabase
      .from("eco_tips")
      .select("id, tip, emoji")
      .eq("active", true);

    if (error) {
      console.error("Error fetching tips:", error);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      setTips(data);
      // Get tip based on date for consistency throughout the day
      const today = new Date().toDateString();
      const storedDate = localStorage.getItem("ecoTipDate");
      const storedTipId = localStorage.getItem("ecoTipId");

      if (storedDate === today && storedTipId) {
        const savedTip = data.find(t => t.id === storedTipId);
        if (savedTip) {
          setTip(savedTip.tip);
        } else {
          selectRandomTip(data);
        }
      } else {
        selectRandomTip(data);
      }
    }
    setLoading(false);
  };

  const selectRandomTip = (tipsArray: EcoTip[]) => {
    const randomIndex = Math.floor(Math.random() * tipsArray.length);
    const selectedTip = tipsArray[randomIndex];
    setTip(selectedTip.tip);
    localStorage.setItem("ecoTipDate", new Date().toDateString());
    localStorage.setItem("ecoTipId", selectedTip.id);
  };

  const refreshTip = () => {
    if (tips.length === 0) return;
    setIsRefreshing(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * tips.length);
      const newTip = tips[randomIndex];
      setTip(newTip.tip);
      localStorage.setItem("ecoTipId", newTip.id);
      setIsRefreshing(false);
    }, 300);
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-r from-eco-green/10 via-eco-teal/10 to-eco-blue/10 border-eco-green/30">
        <div className="animate-pulse h-20"></div>
      </Card>
    );
  }

  if (tips.length === 0) {
    return null;
  }

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
