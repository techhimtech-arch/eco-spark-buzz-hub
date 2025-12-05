import { Button } from "@/components/ui/button";
import { Leaf, ArrowRight, Sparkles, TreePine, Sun, Droplet } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-sustainability.jpg";

const FloatingIcon = ({ children, delay, className }: { children: React.ReactNode; delay: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    className={className}
  >
    <motion.div
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  </motion.div>
);

const Hero = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-primary/70 via-primary/40 to-accent/50" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
        <FloatingIcon delay={0} className="absolute top-[15%] left-[10%]">
          <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
        </FloatingIcon>
        <FloatingIcon delay={0.5} className="absolute top-[25%] right-[15%]">
          <div className="w-14 h-14 rounded-full bg-secondary/30 backdrop-blur-sm flex items-center justify-center">
            <Sun className="w-7 h-7 text-secondary-foreground" />
          </div>
        </FloatingIcon>
        <FloatingIcon delay={1} className="absolute bottom-[30%] left-[8%]">
          <div className="w-12 h-12 rounded-full bg-accent/30 backdrop-blur-sm flex items-center justify-center">
            <Droplet className="w-6 h-6 text-accent-foreground" />
          </div>
        </FloatingIcon>
        <FloatingIcon delay={1.5} className="absolute bottom-[40%] right-[10%]">
          <div className="w-20 h-20 rounded-full bg-primary/15 backdrop-blur-sm flex items-center justify-center">
            <TreePine className="w-10 h-10 text-primary-foreground" />
          </div>
        </FloatingIcon>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-primary/50 rounded-full scale-150" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl pulse-glow">
              <Leaf className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-primary-foreground mb-6 leading-tight tracking-tight">
            Seekho, Khelo,
            <br />
            <span className="relative">
              <span className="gradient-text-warm">Planet Bachao</span>
              <Sparkles className="absolute -right-8 -top-4 w-8 h-8 text-secondary animate-wiggle" />
            </span>
          </h1>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl md:text-2xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto font-medium"
        >
          🌿 Sustainability ke baare mein seekho, quizzes khelo, badges earn karo 
          aur apne community ke saath ek better future banao!
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            size="lg"
            onClick={() => scrollToSection("learn")}
            className="text-lg px-8 py-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-full font-semibold"
          >
            <Sparkles className="mr-2 w-5 h-5" />
            Seekhna Shuru Karo
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => scrollToSection("quiz")}
            className="text-lg px-8 py-6 bg-primary-foreground/10 backdrop-blur-md text-primary-foreground border-2 border-primary-foreground/30 hover:bg-primary-foreground/20 hover:border-primary-foreground/50 rounded-full font-semibold transition-all duration-300 hover:scale-105"
          >
            🎮 Quiz Khelo
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          {[
            { value: "1000+", label: "Learners" },
            { value: "50+", label: "Quizzes" },
            { value: "100+", label: "Badges" },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-4">
              <div className="text-2xl md:text-3xl font-bold text-primary-foreground">{stat.value}</div>
              <div className="text-sm text-primary-foreground/70">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
