import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Calendar, Award, TrendingUp, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementCelebration } from "@/components/AchievementCelebration";
import Navigation from "@/components/Navigation";
import { QuizHistory } from "@/components/QuizHistory";
import { AchievementsGallery } from "@/components/AchievementsGallery";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface TimelineItem {
  id: string;
  type: 'quiz' | 'badge' | 'action';
  title: string;
  description: string;
  date: string;
  icon: any;
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const { celebratingAchievement, closeCelebration } = useAchievements();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    await fetchProfile(user.id);
    await fetchTimeline(user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setBio(data.bio || "");
    }
  };

  const fetchTimeline = async (userId: string) => {
    const items: TimelineItem[] = [];

    // Fetch quiz scores
    const { data: quizzes } = await supabase
      .from("quiz_scores")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (quizzes) {
      quizzes.forEach((quiz) => {
        items.push({
          id: quiz.id,
          type: 'quiz',
          title: 'Quiz Completed',
          description: `Scored ${quiz.score}/${quiz.total_questions} (${Math.round((quiz.score / quiz.total_questions) * 100)}%)`,
          date: quiz.completed_at || '',
          icon: Activity,
        });
      });
    }

    // Fetch badges
    const { data: badges } = await supabase
      .from("user_badges")
      .select("*, badges(*)")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (badges) {
      badges.forEach((badge: any) => {
        items.push({
          id: badge.id,
          type: 'badge',
          title: 'Badge Earned',
          description: badge.badges.name,
          date: badge.earned_at,
          icon: Award,
        });
      });
    }

    // Fetch user actions
    const { data: actions } = await supabase
      .from("user_actions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (actions) {
      actions.forEach((action) => {
        items.push({
          id: action.id,
          type: 'action',
          title: action.action_type,
          description: action.description,
          date: action.created_at,
          icon: TrendingUp,
        });
      });
    }

    // Sort all items by date
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTimeline(items);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;

    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Failed to upload avatar");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', user.id);

    if (updateError) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Avatar updated!");
      await fetchProfile(user.id);
    }

    setUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio: bio,
      })
      .eq('id', user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      setEditing(false);
      await fetchProfile(user.id);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Navigation />
      <AchievementCelebration
        achievement={celebratingAchievement}
        onClose={closeCelebration}
      />
      <div className="min-h-screen bg-background py-12 pt-24">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Uploading..." : "Change Avatar"}
                    </span>
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              <div className="flex-1 space-y-4 w-full">
                {editing ? (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name</label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Bio</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-2xl font-bold">{profile?.full_name || "Anonymous"}</h3>
                      <p className="text-muted-foreground">{profile?.email}</p>
                    </div>
                    {profile?.bio && (
                      <p className="text-foreground">{profile.bio}</p>
                    )}
                    <Button onClick={() => setEditing(true)} variant="outline">
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz History Section */}
        {user && (
          <QuizHistory userId={user.id} />
        )}

        {/* Achievements Gallery */}
        {user && (
          <AchievementsGallery 
            userId={user.id} 
            userName={profile?.full_name || profile?.email?.split('@')[0] || "Eco Warrior"} 
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sustainability Journey Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Start your sustainability journey by taking quizzes and earning badges!
              </p>
            ) : (
              <div className="space-y-4">
                {timeline.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          item.type === 'quiz' ? 'bg-blue-500/10 text-blue-500' :
                          item.type === 'badge' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-green-500/10 text-green-500'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Badge variant="secondary">
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(item.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
