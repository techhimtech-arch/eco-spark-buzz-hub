import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";

const upcomingEvents = [
  {
    title: "Community Tree Planting Day",
    description: "Join us in planting 500 trees at the local park. All ages welcome!",
    date: "Nov 15, 2025",
    time: "9:00 AM - 2:00 PM",
    location: "Central Park, Downtown",
    attendees: 124,
  },
  {
    title: "Zero Waste Workshop",
    description: "Learn practical tips to reduce household waste and create eco-friendly alternatives.",
    date: "Nov 18, 2025",
    time: "6:00 PM - 8:00 PM",
    location: "Community Center",
    attendees: 45,
  },
  {
    title: "Beach Cleanup Drive",
    description: "Help us keep our beaches clean and protect marine wildlife from plastic pollution.",
    date: "Nov 22, 2025",
    time: "7:00 AM - 11:00 AM",
    location: "Sunset Beach",
    attendees: 89,
  },
  {
    title: "Sustainable Food Fair",
    description: "Discover local organic farms, try plant-based foods, and support eco-friendly vendors.",
    date: "Nov 25, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Farmers Market Square",
    attendees: 200,
  },
];

const EventsSection = () => {
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {upcomingEvents.map((event, index) => (
            <Card 
              key={index}
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
                  <span className="font-medium">{event.date}</span>
                  <span className="text-muted-foreground">• {event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Users className="w-5 h-5 text-secondary" />
                  <span>{event.attendees} people attending</span>
                </div>
                <Button className="w-full mt-4">
                  Register for Event
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
