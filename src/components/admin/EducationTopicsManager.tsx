import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EducationTopic {
  id: string;
  title: string;
  title_hindi: string | null;
  description: string;
  content: string;
  icon: string;
  gradient: string;
  bg_gradient: string;
  order_index: number;
  published: boolean;
}

const iconOptions = [
  { value: "leaf", label: "Leaf" },
  { value: "droplet", label: "Droplet" },
  { value: "recycle", label: "Recycle" },
  { value: "sun", label: "Sun" },
  { value: "wind", label: "Wind" },
  { value: "tree-pine", label: "Tree" },
];

const gradientOptions = [
  { value: "from-emerald-500 to-teal-500", label: "Emerald → Teal" },
  { value: "from-cyan-500 to-blue-500", label: "Cyan → Blue" },
  { value: "from-amber-500 to-orange-500", label: "Amber → Orange" },
  { value: "from-green-500 to-emerald-500", label: "Green → Emerald" },
  { value: "from-lime-500 to-green-500", label: "Lime → Green" },
  { value: "from-sky-500 to-indigo-500", label: "Sky → Indigo" },
];

const EducationTopicsManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<EducationTopic | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    title_hindi: "",
    description: "",
    content: "",
    icon: "leaf",
    gradient: "from-emerald-500 to-teal-500",
    order_index: 0,
    published: true,
  });

  const { data: topics, isLoading } = useQuery({
    queryKey: ["admin-education-topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education_topics")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as EducationTopic[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const bgGradient = data.gradient.replace(/from-(\w+)-500 to-(\w+)-500/, "from-$1-500/10 to-$2-500/10");
      const { error } = await supabase.from("education_topics").insert({
        ...data,
        bg_gradient: bgGradient,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-education-topics"] });
      toast.success("Topic created!");
      resetForm();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const bgGradient = data.gradient.replace(/from-(\w+)-500 to-(\w+)-500/, "from-$1-500/10 to-$2-500/10");
      const { error } = await supabase
        .from("education_topics")
        .update({ ...data, bg_gradient: bgGradient })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-education-topics"] });
      toast.success("Topic updated!");
      resetForm();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("education_topics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-education-topics"] });
      toast.success("Topic deleted!");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      title_hindi: "",
      description: "",
      content: "",
      icon: "leaf",
      gradient: "from-emerald-500 to-teal-500",
      order_index: 0,
      published: true,
    });
    setEditingTopic(null);
    setIsOpen(false);
  };

  const handleEdit = (topic: EducationTopic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      title_hindi: topic.title_hindi || "",
      description: topic.description,
      content: topic.content,
      icon: topic.icon,
      gradient: topic.gradient,
      order_index: topic.order_index,
      published: topic.published,
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (editingTopic) {
      updateMutation.mutate({ id: editingTopic.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Education Topics</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTopic ? "Edit Topic" : "Add New Topic"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title (English)</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Water Conservation"
                  />
                </div>
                <div>
                  <Label>Title (Hindi)</Label>
                  <Input
                    value={formData.title_hindi}
                    onChange={(e) => setFormData({ ...formData, title_hindi: e.target.value })}
                    placeholder="पानी बचाओ"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Content (Markdown supported)</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="# Topic Title&#10;&#10;## Section&#10;- Point 1&#10;- Point 2"
                  rows={10}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Icon</Label>
                  <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Color Theme</Label>
                  <Select value={formData.gradient} onValueChange={(v) => setFormData({ ...formData, gradient: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.published}
                  onCheckedChange={(v) => setFormData({ ...formData, published: v })}
                />
                <Label>Published</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingTopic ? "Update Topic" : "Create Topic"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-2">
            {topics?.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${topic.gradient} flex items-center justify-center`}>
                  <span className="text-white text-xs">{topic.order_index}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{topic.title}</h4>
                  <p className="text-sm text-muted-foreground">{topic.title_hindi}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${topic.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {topic.published ? "Published" : "Draft"}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(topic)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(topic.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationTopicsManager;
