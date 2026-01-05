import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Lightbulb } from "lucide-react";

interface EcoTip {
  id: string;
  tip: string;
  emoji: string;
  active: boolean;
  created_at: string;
}

export const EcoTipsManager = () => {
  const [tips, setTips] = useState<EcoTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTip, setEditingTip] = useState<EcoTip | null>(null);
  const [formData, setFormData] = useState({ tip: "", emoji: "🌱", active: true });

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    const { data, error } = await supabase
      .from("eco_tips")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch tips");
      return;
    }
    setTips(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTip) {
      const { error } = await supabase
        .from("eco_tips")
        .update({ tip: formData.tip, emoji: formData.emoji, active: formData.active })
        .eq("id", editingTip.id);

      if (error) {
        toast.error("Failed to update tip");
        return;
      }
      toast.success("Tip updated!");
    } else {
      const { error } = await supabase
        .from("eco_tips")
        .insert([formData]);

      if (error) {
        toast.error("Failed to add tip");
        return;
      }
      toast.success("Tip added!");
    }

    resetForm();
    fetchTips();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tip?")) return;

    const { error } = await supabase
      .from("eco_tips")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete tip");
      return;
    }
    toast.success("Tip deleted!");
    fetchTips();
  };

  const handleEdit = (tip: EcoTip) => {
    setEditingTip(tip);
    setFormData({ tip: tip.tip, emoji: tip.emoji, active: tip.active });
  };

  const resetForm = () => {
    setEditingTip(null);
    setFormData({ tip: "", emoji: "🌱", active: true });
  };

  const toggleActive = async (tip: EcoTip) => {
    const { error } = await supabase
      .from("eco_tips")
      .update({ active: !tip.active })
      .eq("id", tip.id);

    if (error) {
      toast.error("Failed to update tip");
      return;
    }
    fetchTips();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {editingTip ? "Edit Eco Tip" : "Add New Eco Tip"}
          </CardTitle>
          <CardDescription>
            Daily eco tips jo users ko motivate karein
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emoji">Emoji</Label>
              <Input
                id="emoji"
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                placeholder="🌱"
                className="w-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tip">Tip Message</Label>
              <Textarea
                id="tip"
                value={formData.tip}
                onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
                placeholder="🌱 Aaj plastic bag mat lo — apna cloth bag use karo!"
                required
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingTip ? "Update Tip" : <><Plus className="h-4 w-4 mr-2" /> Add Tip</>}
              </Button>
              {editingTip && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Eco Tips ({tips.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className={`flex items-start justify-between p-4 rounded-lg border ${
                  tip.active ? "bg-background" : "bg-muted/50 opacity-60"
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm">{tip.tip}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tip.active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={tip.active}
                    onCheckedChange={() => toggleActive(tip)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(tip)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(tip.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
