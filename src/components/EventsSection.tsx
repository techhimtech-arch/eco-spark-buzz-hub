import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendee_count: number;
}

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });
    
    if (data) {
      setEvents(data);
    }
  };

  return (
    <section id="events" className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <Calendar className="w-4 h-4" />
            Events
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">
            Aapke Paas <span className="gradient-text-warm">Eco-Events</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Like-minded logon se milo aur community mein change lao! 🌍
          </p>
        </motion.div>
        
        {events.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center py-16 px-8 rounded-3xl bg-muted/30 max-w-xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground">Abhi koi events nahi hain.</p>
            <p className="text-sm text-muted-foreground mt-1">Jaldi exciting eco-events aayenge! 🎉</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl font-display group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="font-medium">{new Date(event.date).toLocaleDateString("hi-IN")}</span>
                      <span className="text-muted-foreground">• {event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground">
                      <Users className="w-5 h-5 text-secondary" />
                      <span>{event.attendee_count} log aa rahe hain</span>
                    </div>
                    <Button className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:scale-[1.02] transition-transform">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Register Karo
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
