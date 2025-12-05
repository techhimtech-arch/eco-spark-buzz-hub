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
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <Hero />
        <EducationSection />
        <NewsSection />
        <BlogsSection />
        <EventsSection />
        
        {/* Quiz Section with Challenges */}
        <div className="py-8 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <QuizSection />
              </div>
              <div className="lg:col-span-1">
                <QuizChallenges user={user} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 EcoLearn. Building a sustainable future together.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;