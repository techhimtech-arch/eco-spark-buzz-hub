import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Leaf, LayoutDashboard, Shield, UserCircle, Trophy, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "./UserProfile";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">EcoLearn</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
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
            {user && (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="ghost" size="sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    Leaderboard
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <UserCircle className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm">
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
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-4 mt-8">
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => scrollToSection("learn")}
                  >
                    Learn
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => scrollToSection("news")}
                  >
                    News
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => scrollToSection("events")}
                  >
                    Events
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => scrollToSection("quiz")}
                  >
                    Quiz
                  </Button>
                  
                  {user && (
                    <>
                      <div className="border-t border-border my-2" />
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Trophy className="h-4 w-4 mr-2" />
                          Leaderboard
                        </Button>
                      </Link>
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <UserCircle className="h-4 w-4 mr-2" />
                          Profile
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
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
