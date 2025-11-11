import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">EcoLearn</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Button variant="ghost" onClick={() => scrollToSection("learn")}>
              Learn
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection("news")}>
              News
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection("events")}>
              Events
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection("quiz")}>
              Quiz
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
