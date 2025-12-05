import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Trophy, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "weekly" | "monthly";
  target_quizzes: number;
  reward_points: number;
  reward_badge_id: string | null;
  start_date: string;
  end_date: string;
}

export const ChallengesManager = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "weekly" as "weekly" | "monthly",
    target_quizzes: 5,
    reward_points: 100,
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) {
      toast.error("Failed to fetch challenges");
    } else {
      setChallenges((data as Challenge[]) || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "weekly",
      target_quizzes: 5,
      reward_points: 100,
      start_date: "",
      end_date: "",
    });
    setEditingChallenge(null);
  };

  const handleOpenDialog = (challenge?: Challenge) => {
    if (challenge) {
      setEditingChallenge(challenge);
      setFormData({
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        target_quizzes: challenge.target_quizzes,
        reward_points: challenge.reward_points,
        start_date: challenge.start_date,
        end_date: challenge.end_date,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.start_date || !formData.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingChallenge) {
      const { error } = await supabase
        .from("challenges")
        .update(formData)
        .eq("id", editingChallenge.id);

      if (error) {
        toast.error("Failed to update challenge");
      } else {
        toast.success("Challenge updated!");
        fetchChallenges();
        setIsDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase.from("challenges").insert(formData);

      if (error) {
        toast.error("Failed to create challenge");
      } else {
        toast.success("Challenge created!");
        fetchChallenges();
        setIsDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    const { error } = await supabase.from("challenges").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete challenge");
    } else {
      toast.success("Challenge deleted!");
      fetchChallenges();
    }
  };

  const isActive = (challenge: Challenge) => {
    const today = new Date().toISOString().split("T")[0];
    return challenge.start_date <= today && challenge.end_date >= today;
  };

  if (loading) {
    return <div className="text-center py-8">Loading challenges...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quiz Challenges</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" /> Add Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingChallenge ? "Edit Challenge" : "Create Challenge"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Weekly Quiz Marathon"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Complete 5 quizzes this week to earn bonus points!"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "weekly" | "monthly") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target">Target Quizzes</Label>
                  <Input
                    id="target"
                    type="number"
                    min={1}
                    value={formData.target_quizzes}
                    onChange={(e) =>
                      setFormData({ ...formData, target_quizzes: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reward">Reward Points</Label>
                <Input
                  id="reward"
                  type="number"
                  min={1}
                  value={formData.reward_points}
                  onChange={(e) =>
                    setFormData({ ...formData, reward_points: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingChallenge ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {challenges.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No challenges yet. Create your first challenge!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={challenge.type === "weekly" ? "default" : "secondary"}>
                      {challenge.type}
                    </Badge>
                    {isActive(challenge) && (
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>Target: {challenge.target_quizzes} quizzes</span>
                    <span>Reward: {challenge.reward_points} pts</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(challenge.start_date).toLocaleDateString()} -{" "}
                      {new Date(challenge.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(challenge)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(challenge.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
