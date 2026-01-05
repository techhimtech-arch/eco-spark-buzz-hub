import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Sparkles } from "lucide-react";

interface EcoFact {
  id: string;
  fact: string;
  emoji: string;
  active: boolean;
  created_at: string;
}

export const EcoFactsManager = () => {
  const [facts, setFacts] = useState<EcoFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFact, setEditingFact] = useState<EcoFact | null>(null);
  const [formData, setFormData] = useState({ fact: "", emoji: "💡", active: true });

  useEffect(() => {
    fetchFacts();
  }, []);

  const fetchFacts = async () => {
    const { data, error } = await supabase
      .from("eco_facts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch facts");
      return;
    }
    setFacts(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFact) {
      const { error } = await supabase
        .from("eco_facts")
        .update({ fact: formData.fact, emoji: formData.emoji, active: formData.active })
        .eq("id", editingFact.id);

      if (error) {
        toast.error("Failed to update fact");
        return;
      }
      toast.success("Fact updated!");
    } else {
      const { error } = await supabase
        .from("eco_facts")
        .insert([formData]);

      if (error) {
        toast.error("Failed to add fact");
        return;
      }
      toast.success("Fact added!");
    }

    resetForm();
    fetchFacts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fact?")) return;

    const { error } = await supabase
      .from("eco_facts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete fact");
      return;
    }
    toast.success("Fact deleted!");
    fetchFacts();
  };

  const handleEdit = (fact: EcoFact) => {
    setEditingFact(fact);
    setFormData({ fact: fact.fact, emoji: fact.emoji, active: fact.active });
  };

  const resetForm = () => {
    setEditingFact(null);
    setFormData({ fact: "", emoji: "💡", active: true });
  };

  const toggleActive = async (fact: EcoFact) => {
    const { error } = await supabase
      .from("eco_facts")
      .update({ active: !fact.active })
      .eq("id", fact.id);

    if (error) {
      toast.error("Failed to update fact");
      return;
    }
    fetchFacts();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {editingFact ? "Edit Did You Know Fact" : "Add New Fact"}
          </CardTitle>
          <CardDescription>
            Interesting eco facts for "Did You Know?" section
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
                placeholder="💡"
                className="w-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fact">Fact</Label>
              <Textarea
                id="fact"
                value={formData.fact}
                onChange={(e) => setFormData({ ...formData, fact: e.target.value })}
                placeholder="🌳 1 tree a year me 118 kg CO₂ absorb karta hai!"
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
                {editingFact ? "Update Fact" : <><Plus className="h-4 w-4 mr-2" /> Add Fact</>}
              </Button>
              {editingFact && (
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
          <CardTitle>All Eco Facts ({facts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {facts.map((fact) => (
              <div
                key={fact.id}
                className={`flex items-start justify-between p-4 rounded-lg border ${
                  fact.active ? "bg-background" : "bg-muted/50 opacity-60"
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm">{fact.fact}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fact.active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={fact.active}
                    onCheckedChange={() => toggleActive(fact)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(fact)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(fact.id)}
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
