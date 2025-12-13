import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Droplet, Recycle, Sun, Wind, TreePine, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  leaf: Leaf,
  droplet: Droplet,
  recycle: Recycle,
  sun: Sun,
  wind: Wind,
  "tree-pine": TreePine,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const EducationSection = () => {
  const { language } = useLanguage();

  const { data: topics, isLoading } = useQuery({
    queryKey: ["education-topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education_topics")
        .select("*")
        .eq("published", true)
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="learn" className="py-24 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            {language === "hi" ? "टॉपिक्स एक्सप्लोर करो" : "Explore Topics"}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">
            {language === "hi" ? "सस्टेनेबिलिटी" : "Sustainability"} <span className="gradient-text">{language === "hi" ? "सीखो" : "Seekho"}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === "hi" 
              ? "ज्ञान से खुद को सशक्त बनाओ और पृथ्वी पर सकारात्मक प्रभाव डालो 🌍"
              : "Knowledge se khud ko empower karo aur planet pe positive impact daalo 🌍"}
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {topics?.map((topic) => {
              const Icon = iconMap[topic.icon] || Leaf;
              return (
                <motion.div key={topic.id} variants={item}>
                  <Link to={`/learn/${topic.id}`}>
                    <Card 
                      className={`group relative overflow-hidden border-0 bg-gradient-to-br ${topic.bg_gradient} hover:shadow-[var(--shadow-hover)] transition-all duration-500 hover:-translate-y-2 cursor-pointer h-full`}
                    >
                      {/* Hover gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                      
                      <CardHeader className="relative">
                        <div className={`mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-display group-hover:text-primary transition-colors">
                          {language === "hi" && topic.title_hindi ? topic.title_hindi : topic.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {language === "hi" ? topic.title : topic.title_hindi}
                        </p>
                      </CardHeader>
                      <CardContent className="relative">
                        <CardDescription className="text-base mb-4">
                          {topic.description}
                        </CardDescription>
                        <Button variant="ghost" className="p-0 h-auto text-primary font-medium group/btn">
                          {language === "hi" ? "और जानो" : "Aur Jaano"}
                          <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default EducationSection;
