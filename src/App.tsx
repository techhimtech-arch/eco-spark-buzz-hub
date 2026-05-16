import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Dashboard } from "./pages/Dashboard";
import { AdminPanel } from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import TopicDetail from "./pages/TopicDetail";
import EnvironmentDayLeaderboard from "./pages/EnvironmentDayLeaderboard";
import GuestQuiz from "./pages/GuestQuiz";
import GridLock from "./pages/GridLock";
import GamesHub from "./pages/GamesHub";
import GarbageSorting from "./pages/games/GarbageSorting";
import TreePlanter from "./pages/games/TreePlanter";
import WaterSaver from "./pages/games/WaterSaver";
import EcoRunner from "./pages/games/EcoRunner";
import AnimalRescue from "./pages/games/AnimalRescue";
import EcoMemory from "./pages/games/EcoMemory";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Auth />} />
              <Route path="/admin" element={user ? <AdminPanel user={user} /> : <Auth />} />
              <Route path="/profile" element={user ? <Profile /> : <Auth />} />
              <Route path="/leaderboard" element={user ? <Leaderboard /> : <Auth />} />
              <Route path="/environment-day" element={<EnvironmentDayLeaderboard />} />
              <Route path="/play" element={<GuestQuiz />} />
              <Route path="/games/gridlock" element={<GridLock />} />
              <Route path="/games" element={<GamesHub />} />
              <Route path="/games/garbage-sorting" element={<GarbageSorting />} />
              <Route path="/games/tree-planter" element={<TreePlanter />} />
              <Route path="/games/water-saver" element={<WaterSaver />} />
              <Route path="/games/eco-runner" element={<EcoRunner />} />
              <Route path="/games/animal-rescue" element={<AnimalRescue />} />
              <Route path="/games/eco-memory" element={<EcoMemory />} />
              <Route path="/learn/:id" element={<TopicDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
