import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp } from "lucide-react";

const positiveNews = [
  {
    title: "Global Renewable Energy Hits Record High",
    description: "Solar and wind power installations exceeded all expectations in 2024, reducing carbon emissions by 15% globally.",
    date: "2 days ago",
    category: "Energy",
    trend: "+15%",
  },
  {
    title: "Ocean Cleanup Project Removes 100,000 Tons of Plastic",
    description: "Innovative technology successfully cleaned up the Great Pacific Garbage Patch, protecting marine life.",
    date: "1 week ago",
    category: "Oceans",
    trend: "Major Win",
  },
  {
    title: "Cities Worldwide Plant 10 Million Trees",
    description: "A global initiative has led to massive urban reforestation, improving air quality and biodiversity.",
    date: "2 weeks ago",
    category: "Forests",
    trend: "+10M Trees",
  },
  {
    title: "Electric Vehicle Sales Surpass Gas Cars",
    description: "For the first time, EV sales have overtaken traditional vehicles in major markets worldwide.",
    date: "3 weeks ago",
    category: "Transport",
    trend: "+50%",
  },
];

const NewsSection = () => {
  return (
    <section id="news" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Positive Environmental News
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Celebrate the progress we're making together for a sustainable future.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {positiveNews.map((news, index) => (
            <Card 
              key={index}
              className="hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-card border-border"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-primary text-primary-foreground">{news.category}</Badge>
                  <div className="flex items-center gap-2 text-accent font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">{news.trend}</span>
                  </div>
                </div>
                <CardTitle className="text-2xl">{news.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {news.description}
                </CardDescription>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{news.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
