import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const TARGET_DATE = new Date("2026-06-05T00:00:00");

function getTimeLeft() {
  const diff = TARGET_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
  };
}

export const EnvironmentDayBanner = () => {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center bg-background/20 backdrop-blur-sm rounded-xl px-3 py-2 min-w-[64px] border border-primary-foreground/20">
      <span className="text-2xl md:text-3xl font-display font-bold text-primary-foreground tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-primary-foreground/80">{label}</span>
    </div>
  );

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-6 md:p-10 shadow-xl"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary-foreground/10 blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-6 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/15 text-primary-foreground text-xs font-medium mb-3">
                <Sparkles className="h-3 w-3" /> Special Campaign
              </span>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-primary-foreground mb-2">
                World Environment Day Quiz Championship
              </h2>
              <p className="text-primary-foreground/90 text-sm md:text-base mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Grand Finale: 5 June 2026
              </p>
              <p className="text-primary-foreground/80 text-sm mb-5">
                Roz quiz khelo, points kamao aur top scorers banke 5 June ko featured ho jao! 🌍
              </p>
              <Link to="/environment-day">
                <Button size="lg" variant="secondary" className="font-semibold">
                  <Trophy className="h-4 w-4 mr-2" /> View Championship Leaderboard
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-end">
              <Box value={time.days} label="Days" />
              <Box value={time.hours} label="Hrs" />
              <Box value={time.minutes} label="Min" />
              <Box value={time.seconds} label="Sec" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EnvironmentDayBanner;