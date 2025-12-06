import { useState, useCallback } from "react";

export interface CelebrationData {
  type: "achievement" | "challenge" | "badge";
  title: string;
  description: string;
  icon: string;
  points?: number;
}

export const useCelebration = () => {
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);

  const triggerCelebration = useCallback((data: CelebrationData) => {
    setCelebration(data);
  }, []);

  const closeCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  return {
    celebration,
    triggerCelebration,
    closeCelebration,
  };
};
