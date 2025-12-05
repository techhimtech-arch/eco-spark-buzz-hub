import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Leaf, LayoutDashboard, Shield, UserCircle, Trophy, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "./UserProfile";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? (currentScrollY / documentHeight) * 100 : 0;
      
      setScrollProgress(progress);
      setIsScrolled(currentScrollY > 10);
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .rpc("has_role", { _user_id: userId, _role: "admin" });
    setIsAdmin(data || false);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        !isVisible && "-translate-y-full",
        isScrolled ? "bg-card/95 backdrop-blur-xl shadow-lg border-b border-border/50" : "bg-transparent"
      )}
    >
      {/* Scroll Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />
      
      <div className="container mx-auto px-4">
        <div className={cn(
          "flex items-center justify-between transition-all duration-300",
          isScrolled ? "h-14" : "h-16"
        )}>
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className={cn(
              "rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md",
              isScrolled ? "w-8 h-8" : "w-10 h-10"
            )}>
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className={cn(
              "font-display font-bold text-foreground transition-all duration-300",
              isScrolled ? "text-lg" : "text-xl",
              !isScrolled && "text-primary-foreground drop-shadow-lg"
            )}>EcoLearn</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {["Learn", "News", "Events", "Quiz"].map((item) => (
              <Button 
                key={item}
                variant="ghost" 
                onClick={() => scrollToSection(item.toLowerCase())}
                className={cn(
                  "font-medium transition-all duration-300",
                  !isScrolled && "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20"
                )}
              >
                {item}
              </Button>
            ))}
            
            {user && (
              <>
                <div className="w-px h-6 bg-border/50 mx-1" />
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className={cn(!isScrolled && "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20")}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="ghost" size="sm" className={cn(!isScrolled && "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20")}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Leaderboard
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className={cn(!isScrolled && "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20")}>
                    <UserCircle className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className={cn("text-warning", !isScrolled && "text-warning hover:bg-warning/20")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <UserProfile user={user} />
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <UserProfile user={user} />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(!isScrolled && "text-primary-foreground hover:bg-primary-foreground/20")}>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-card">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-display font-bold text-xl">EcoLearn</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  {["Learn", "News", "Events", "Quiz"].map((item) => (
                    <Button 
                      key={item}
                      variant="ghost" 
                      className="justify-start text-lg font-medium" 
                      onClick={() => scrollToSection(item.toLowerCase())}
                    >
                      {item}
                    </Button>
                  ))}
                  
                  {user && (
                    <>
                      <div className="border-t border-border my-4" />
                      <p className="text-sm text-muted-foreground px-4 mb-2">Your Space</p>
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg">
                          <LayoutDashboard className="h-5 w-5 mr-3" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg">
                          <Trophy className="h-5 w-5 mr-3" />
                          Leaderboard
                        </Button>
                      </Link>
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg">
                          <UserCircle className="h-5 w-5 mr-3" />
                          Profile
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  {isAdmin && (
                    <>
                      <div className="border-t border-border my-4" />
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg text-warning">
                          <Shield className="h-5 w-5 mr-3" />
                          Admin Panel
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
