import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfileProps {
  user: User | null;
}

export const UserProfile = ({ user }: UserProfileProps) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [quizScores, setQuizScores] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchQuizScores();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(data);
  };

  const fetchQuizScores = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("quiz_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(5);
    setQuizScores(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  if (!user) {
    return (
      <Button onClick={() => navigate("/auth")} variant="hero">
        Get Started
      </Button>
    );
  }

  const totalQuizzes = quizScores.length;
  const averageScore = totalQuizzes > 0
    ? Math.round(quizScores.reduce((acc, score) => acc + (score.score / score.total_questions) * 100, 0) / totalQuizzes)
    : 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <UserIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-2 text-xs text-muted-foreground">
          <p>Quizzes completed: {totalQuizzes}</p>
          {totalQuizzes > 0 && <p>Average score: {averageScore}%</p>}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
