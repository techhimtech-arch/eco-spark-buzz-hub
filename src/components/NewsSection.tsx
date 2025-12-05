import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Sparkles, Newspaper } from "lucide-react";
import { motion } from "framer-motion";

const positiveNews = [
  {
    title: "Renewable Energy Ka Record High! 🌞",
    description: "2024 mein solar aur wind power installations ne sabki expectations ko beat kiya, globally 15% carbon emissions kam ho gayi.",
    date: "2 din pehle",
    category: "Energy",
    trend: "+15%",
    gradient: "from-amber-500/20 to-orange-500/10",
    iconBg: "from-amber-500 to-orange-500",
  },
  {
    title: "Ocean Cleanup: 100,000 Tons Plastic Hataya! 🌊",
    description: "Innovative technology ne Great Pacific Garbage Patch ko successfully clean kiya, marine life protect ho rahi hai.",
    date: "1 hafte pehle",
    category: "Oceans",
    trend: "Big Win",
    gradient: "from-cyan-500/20 to-blue-500/10",
    iconBg: "from-cyan-500 to-blue-500",
  },
  {
    title: "10 Million Ped Lagaye Worldwide! 🌳",
    description: "Global initiative ke through massive urban reforestation hui, air quality aur biodiversity better ho rahi hai.",
    date: "2 hafte pehle",
    category: "Forests",
    trend: "+10M Trees",
    gradient: "from-emerald-500/20 to-green-500/10",
    iconBg: "from-emerald-500 to-green-500",
  },
  {
    title: "Electric Vehicles Ki Sales Top! ⚡",
    description: "Pehli baar EV sales ne traditional vehicles ko major markets mein overtake kar liya hai.",
    date: "3 hafte pehle",
    category: "Transport",
    trend: "+50%",
    gradient: "from-violet-500/20 to-purple-500/10",
    iconBg: "from-violet-500 to-purple-500",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const NewsSection = () => {
  return (
    <section id="news" className="py-24 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Good News
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">
            Positive <span className="gradient-text">Environmental</span> News
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dekho humne saath milke kitni progress ki hai! 🎉
          </p>
        </motion.div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
        >
          {positiveNews.map((news, index) => (
            <motion.div key={index} variants={item}>
              <Card 
                className={`group relative overflow-hidden border-0 bg-gradient-to-br ${news.gradient} hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer h-full`}
              >
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`bg-gradient-to-r ${news.iconBg} text-white border-0 shadow-md`}>
                      {news.category}
                    </Badge>
                    <motion.div 
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success font-bold text-sm"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>{news.trend}</span>
                    </motion.div>
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-display group-hover:text-primary transition-colors">
                    {news.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base mb-4 leading-relaxed">
                    {news.description}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{news.date}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* View More CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            <Newspaper className="w-5 h-5" />
            Aur news padho
            <span className="text-xl">→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
