import { Button } from "@/components/ui/button";
import { Leaf, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-sustainability.jpg";

const Hero = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6 animate-bounce">
          <Leaf className="w-16 h-16 text-primary" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Build a Greener Future
          <br />
          <span className="text-primary">Together</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
          Discover practical ways to live sustainably, stay inspired with positive environmental news, 
          and connect with your community through eco-friendly events.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => scrollToSection("learn")}
            className="text-lg"
          >
            Start Learning
            <ArrowRight className="ml-2" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => scrollToSection("quiz")}
            className="text-lg bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
          >
            Take a Quiz
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
