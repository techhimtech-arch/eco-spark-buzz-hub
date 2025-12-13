import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Leaf, Droplet, Recycle, Sun, Wind, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  leaf: Leaf,
  droplet: Droplet,
  recycle: Recycle,
  sun: Sun,
  wind: Wind,
  "tree-pine": TreePine,
};

const TopicDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language, translateTexts } = useLanguage();

  const { data: topic, isLoading } = useQuery({
    queryKey: ["education-topic", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education_topics")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: translatedContent } = useQuery({
    queryKey: ["translated-topic", id, language],
    queryFn: async () => {
      if (!topic || language === "en") return null;
      const translated = await translateTexts([topic.content]);
      return translated[0];
    },
    enabled: !!topic && language === "hi",
  });

  const Icon = topic?.icon ? iconMap[topic.icon] || Leaf : Leaf;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Topic Not Found</h1>
          <Link to="/#learn">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Topics
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayContent = language === "hi" && translatedContent ? translatedContent : topic.content;

  // Simple markdown to HTML converter
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-2 mb-4 text-muted-foreground">
            {listItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("####")) {
        flushList();
        elements.push(
          <h4 key={index} className="text-lg font-semibold mt-6 mb-2 text-foreground">
            {trimmedLine.replace(/^####\s*/, "")}
          </h4>
        );
      } else if (trimmedLine.startsWith("###")) {
        flushList();
        elements.push(
          <h3 key={index} className="text-xl font-semibold mt-8 mb-3 text-foreground">
            {trimmedLine.replace(/^###\s*/, "")}
          </h3>
        );
      } else if (trimmedLine.startsWith("##")) {
        flushList();
        elements.push(
          <h2 key={index} className="text-2xl font-bold mt-10 mb-4 text-foreground">
            {trimmedLine.replace(/^##\s*/, "")}
          </h2>
        );
      } else if (trimmedLine.startsWith("#")) {
        flushList();
        // Skip main heading as we show it separately
      } else if (trimmedLine.startsWith("-")) {
        listItems.push(trimmedLine.replace(/^-\s*/, ""));
      } else if (trimmedLine) {
        flushList();
        elements.push(
          <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
            {trimmedLine}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/#learn">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === "hi" ? "वापस जाएं" : "Back to Topics"}
            </Button>
          </Link>

          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  {language === "hi" && topic.title_hindi ? topic.title_hindi : topic.title}
                </h1>
                <p className="text-muted-foreground mt-1">{topic.description}</p>
              </div>
            </div>

            {/* Content */}
            <div className={`p-8 rounded-2xl bg-gradient-to-br ${topic.bg_gradient} border border-border/50`}>
              <article className="prose prose-lg max-w-none">
                {renderContent(displayContent)}
              </article>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TopicDetail;
