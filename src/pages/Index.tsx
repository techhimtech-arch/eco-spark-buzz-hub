import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import EducationSection from "@/components/EducationSection";
import NewsSection from "@/components/NewsSection";
import { BlogsSection } from "@/components/BlogsSection";
import EventsSection from "@/components/EventsSection";
import QuizSection from "@/components/QuizSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <Hero />
        <EducationSection />
        <NewsSection />
        <BlogsSection />
        <EventsSection />
        <QuizSection />
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
