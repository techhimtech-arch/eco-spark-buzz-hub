import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizQuestionsManager } from "@/components/admin/QuizQuestionsManager";
import { BlogsManager } from "@/components/admin/BlogsManager";
import { EventsManager } from "@/components/admin/EventsManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

interface AdminPanelProps {
  user: User;
}

export const AdminPanel = ({ user }: AdminPanelProps) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" });

    if (error) {
      console.error("Error checking admin status:", error);
      toast.error("Failed to verify admin status");
      navigate("/");
      return;
    }

    if (!data) {
      toast.error("Access denied: Admin privileges required");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage content and quiz questions</p>
        </div>
      </div>

      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions">Quiz Questions</TabsTrigger>
          <TabsTrigger value="blogs">Blogs & News</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <QuizQuestionsManager />
        </TabsContent>

        <TabsContent value="blogs">
          <BlogsManager />
        </TabsContent>

        <TabsContent value="events">
          <EventsManager />
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
};
