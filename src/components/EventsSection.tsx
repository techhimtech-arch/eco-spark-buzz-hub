import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";

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
    <section id="events" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Upcoming Eco-Events Near You
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with like-minded people and make a difference in your community.
          </p>
        </div>
        
        {events.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg">No events available yet. Check back soon for exciting eco-events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {events.map((event) => (
              <Card 
                key={event.id}
                className="hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1 bg-card border-border"
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription className="text-base">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                    <span className="text-muted-foreground">• {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-5 h-5 text-accent" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Users className="w-5 h-5 text-secondary" />
                    <span>{event.attendee_count} people attending</span>
                  </div>
                  <Button className="w-full mt-4">
                    Register for Event
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
