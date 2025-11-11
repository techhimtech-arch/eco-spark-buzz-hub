import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Droplet, Recycle, Sun, Wind, TreePine } from "lucide-react";

const educationTopics = [
  {
    icon: Recycle,
    title: "Reduce, Reuse, Recycle",
    description: "Learn how to minimize waste and give items a second life through creative recycling.",
    color: "text-primary",
  },
  {
    icon: Droplet,
    title: "Water Conservation",
    description: "Discover simple ways to save water at home and protect our most precious resource.",
    color: "text-accent",
  },
  {
    icon: Sun,
    title: "Renewable Energy",
    description: "Explore solar, wind, and other clean energy solutions for a sustainable future.",
    color: "text-secondary",
  },
  {
    icon: Leaf,
    title: "Sustainable Living",
    description: "Make eco-friendly choices in daily life, from food to fashion to transportation.",
    color: "text-primary",
  },
  {
    icon: TreePine,
    title: "Biodiversity Protection",
    description: "Understand the importance of protecting ecosystems and endangered species.",
    color: "text-accent",
  },
  {
    icon: Wind,
    title: "Clean Air Initiatives",
    description: "Learn about air quality and how to reduce your carbon footprint effectively.",
    color: "text-secondary",
  },
];

const EducationSection = () => {
  return (
    <section id="learn" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Learn About Sustainability
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empower yourself with knowledge to make a positive impact on our planet.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {educationTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <Card 
                key={index}
                className="hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-card border-border"
              >
                <CardHeader>
                  <div className="mb-4">
                    <Icon className={`w-12 h-12 ${topic.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{topic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {topic.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
