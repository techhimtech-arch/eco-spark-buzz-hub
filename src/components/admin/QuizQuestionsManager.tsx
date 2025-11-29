import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";

export const QuizQuestionsManager = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_answer: 0,
    category: "general",
    difficulty: "medium",
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch questions");
      return;
    }

    setQuestions(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const options = [
      formData.option1,
      formData.option2,
      formData.option3,
      formData.option4,
    ];

    const questionData = {
      question: formData.question,
      options: options,
      correct_answer: formData.correct_answer,
      category: formData.category,
      difficulty: formData.difficulty,
    };

    if (editingId) {
      const { error } = await supabase
        .from("quiz_questions")
        .update(questionData)
        .eq("id", editingId);

      if (error) {
        toast.error("Failed to update question");
        return;
      }
      toast.success("Question updated successfully");
    } else {
      const { error } = await supabase
        .from("quiz_questions")
        .insert([questionData]);

      if (error) {
        toast.error("Failed to add question");
        return;
      }
      toast.success("Question added successfully");
    }

    resetForm();
    fetchQuestions();
  };

  const handleEdit = (question: any) => {
    setEditingId(question.id);
    setFormData({
      question: question.question,
      option1: question.options[0] || "",
      option2: question.options[1] || "",
      option3: question.options[2] || "",
      option4: question.options[3] || "",
      correct_answer: question.correct_answer,
      category: question.category,
      difficulty: question.difficulty,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    const { error } = await supabase
      .from("quiz_questions")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete question");
      return;
    }

    toast.success("Question deleted successfully");
    fetchQuestions();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correct_answer: 0,
      category: "general",
      difficulty: "medium",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Question" : "Add New Question"}</CardTitle>
          <CardDescription>Create and manage quiz questions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num}>
                  <Label htmlFor={`option${num}`}>Option {num}</Label>
                  <Input
                    id={`option${num}`}
                    value={formData[`option${num}` as keyof typeof formData]}
                    onChange={(e) =>
                      setFormData({ ...formData, [`option${num}`]: e.target.value })
                    }
                    required
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="correct">Correct Answer</Label>
                <Select
                  value={formData.correct_answer.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, correct_answer: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Option 1</SelectItem>
                    <SelectItem value="1">Option 2</SelectItem>
                    <SelectItem value="2">Option 3</SelectItem>
                    <SelectItem value="3">Option 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                {editingId ? "Update Question" : "Add Question"}
              </Button>
              {editingId && (
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
          <CardTitle>Existing Questions ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium mb-2">{q.question}</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {q.options.map((opt: string, idx: number) => (
                        <p
                          key={idx}
                          className={`text-sm ${
                            idx === q.correct_answer
                              ? "text-primary font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {idx + 1}. {opt}
                        </p>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                        {q.category}
                      </span>
                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleEdit(q)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(q.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
