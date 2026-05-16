import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import EducationSection from "@/components/EducationSection";
import NewsSection from "@/components/NewsSection";
import { BlogsSection } from "@/components/BlogsSection";
import EventsSection from "@/components/EventsSection";
import QuizSection from "@/components/QuizSection";
import { QuizChallenges } from "@/components/QuizChallenges";
import { DailyEcoTip } from "@/components/DailyEcoTip";
import { MiniTasks } from "@/components/MiniTasks";
import { ImpactCounter } from "@/components/ImpactCounter";
import { UserLevel } from "@/components/UserLevel";
import { DidYouKnow } from "@/components/DidYouKnow";
import { EnvironmentDayBanner } from "@/components/EnvironmentDayBanner";
import { motion } from "framer-motion";
import { Leaf, Heart, Github, Twitter, Instagram, Trophy, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <Hero />
        <EnvironmentDayBanner />

        {/* Guest Quick Quiz CTA */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full mb-2">
                  <Sparkles className="w-3 h-3" /> No Login Needed
                </span>
                <h3 className="text-2xl md:text-3xl font-bold">Quick Quiz · Public Leaderboard 🏆</h3>
                <p className="text-white/90 mt-1">Bachhe naam daalo, quiz khelo, leaderboard pe chamko!</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/play">
                  <Button size="lg" variant="secondary" className="font-semibold">
                    <Trophy className="w-4 h-4 mr-2" /> Quick Quiz
                  </Button>
                </Link>
                <Link to="/games/gridlock">
                  <Button size="lg" variant="secondary" className="font-semibold">
                    🌱 GridLock Puzzle
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Daily Engagement Section */}
        <section className="py-12 relative overflow-hidden bg-gradient-to-br from-muted/50 to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-eco-green/10 text-eco-green text-sm font-medium mb-4">
                🌱 Daily Dose of Sustainability
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Aaj Ka <span className="gradient-text">Eco Action</span>
              </h2>
            </motion.div>
            
            {/* Daily Tip + Did You Know */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <DailyEcoTip />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <DidYouKnow />
              </motion.div>
            </div>
            
            {/* Mini Tasks + Level + Impact */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <MiniTasks user={user} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <UserLevel user={user} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <ImpactCounter user={user} />
              </motion.div>
            </div>
          </div>
        </section>

        <EducationSection />
        <NewsSection />
        <BlogsSection />
        <EventsSection />
        
        {/* Quiz Section with Challenges */}
        <section className="py-20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-accent/10 to-transparent rounded-full blur-3xl translate-y-1/2" />
          
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                🎮 Challenge Yourself
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Quiz <span className="gradient-text-warm">Zone</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Apna eco-knowledge test karo aur exciting rewards jeeto! 🏆
              </p>
            </motion.div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-2"
              >
                <QuizSection />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-1"
              >
                <QuizChallenges user={user} />
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-card border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold text-foreground">EcoLearn</span>
              </div>
              <p className="text-muted-foreground">
                Sustainability seekho, planet bachao. Ek step at a time! 🌱
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {["Learn", "Quiz", "Events", "Leaderboard"].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Social */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Connect With Us</h4>
              <div className="flex gap-3">
                {[Twitter, Instagram, Github].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> for our Planet
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              © 2025 EcoLearn. Building a sustainable future together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
