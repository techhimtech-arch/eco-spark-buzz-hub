import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Droplet, Recycle, Sun, Wind, TreePine, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const educationTopics = [
  {
    icon: Recycle,
    title: "Reduce, Reuse, Recycle",
    titleHindi: "कम करो, दोबारा इस्तेमाल करो",
    description: "Waste kam karo aur items ko naya life do creative recycling ke through.",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    icon: Droplet,
    title: "Water Conservation",
    titleHindi: "पानी बचाओ",
    description: "Ghar pe paani bachane ke simple tarike seekho aur hamari sabse precious resource ko protect karo.",
    gradient: "from-cyan-500 to-blue-500",
    bgGradient: "from-cyan-500/10 to-blue-500/10",
  },
  {
    icon: Sun,
    title: "Renewable Energy",
    titleHindi: "नवीकरणीय ऊर्जा",
    description: "Solar, wind aur doosri clean energy solutions explore karo sustainable future ke liye.",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    icon: Leaf,
    title: "Sustainable Living",
    titleHindi: "टिकाऊ जीवन",
    description: "Daily life mein eco-friendly choices banao - food se fashion aur transportation tak.",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-500/10 to-emerald-500/10",
  },
  {
    icon: TreePine,
    title: "Biodiversity Protection",
    titleHindi: "जैव विविधता",
    description: "Ecosystems aur endangered species ko protect karna kitna important hai, ye samjho.",
    gradient: "from-lime-500 to-green-500",
    bgGradient: "from-lime-500/10 to-green-500/10",
  },
  {
    icon: Wind,
    title: "Clean Air Initiatives",
    titleHindi: "स्वच्छ हवा",
    description: "Air quality ke baare mein seekho aur apna carbon footprint kaise kam karo effectively.",
    gradient: "from-sky-500 to-indigo-500",
    bgGradient: "from-sky-500/10 to-indigo-500/10",
  },
];

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
            Topics Explore Karo
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">
            Sustainability <span className="gradient-text">Seekho</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Knowledge se khud ko empower karo aur planet pe positive impact daalo 🌍
          </p>
        </motion.div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {educationTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <motion.div key={index} variants={item}>
                <Card 
                  className={`group relative overflow-hidden border-0 bg-gradient-to-br ${topic.bgGradient} hover:shadow-[var(--shadow-hover)] transition-all duration-500 hover:-translate-y-2 cursor-pointer h-full`}
                >
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <CardHeader className="relative">
                    <div className={`mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-display group-hover:text-primary transition-colors">
                      {topic.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{topic.titleHindi}</p>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-base mb-4">
                      {topic.description}
                    </CardDescription>
                    <Button variant="ghost" className="p-0 h-auto text-primary font-medium group/btn">
                      Aur Jaano
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default EducationSection;
