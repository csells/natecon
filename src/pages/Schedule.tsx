import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coffee, Utensils, Cookie, Clock } from 'lucide-react';

interface ScheduleEvent {
  time: string;
  title: string;
  description?: string;
  type: 'meal' | 'talk' | 'activity' | 'break';
}

const dayOneSchedule: ScheduleEvent[] = [
  { time: '9:00 AM', title: 'Breakfast & Networking', description: 'Fuel up and meet fellow attendees', type: 'meal' },
  { time: '10:00 AM', title: "Nate's Keynote", description: 'Opening remarks and the future of AI newsletters', type: 'talk' },
  { time: '11:00 AM', title: 'Lightning Talks Session 1', description: '15-minute community presentations', type: 'talk' },
  { time: '12:00 PM', title: 'Lunch', description: 'Catered lunch with networking time', type: 'meal' },
  { time: '1:00 PM', title: 'Full Talk Session', description: '45-minute deep-dive presentations', type: 'talk' },
  { time: '2:30 PM', title: 'Afternoon Snacks', description: 'Coffee, tea, and treats', type: 'meal' },
  { time: '3:00 PM', title: 'Lightning Talks Session 2', description: 'More community presentations', type: 'talk' },
  { time: '4:00 PM', title: 'Speaker Panel', description: 'Q&A with speakers and Nate', type: 'talk' },
  { time: '5:00 PM', title: 'Day 1 Wrap-up', description: 'See you tomorrow for the hackathon!', type: 'activity' },
];

const dayTwoSchedule: ScheduleEvent[] = [
  { time: '9:00 AM', title: 'Breakfast & Team Formation', description: 'Final chance to join a team', type: 'meal' },
  { time: '10:00 AM', title: 'Hackathon Kickoff', description: 'Rules (there are none!), prizes, and let the building begin', type: 'activity' },
  { time: '12:00 PM', title: 'Lunch', description: 'Keep building while you eat', type: 'meal' },
  { time: '2:30 PM', title: 'Afternoon Snacks', description: 'Sugar boost for the final stretch', type: 'meal' },
  { time: '3:30 PM', title: 'Demos Begin', description: '3-minute presentations from each team', type: 'talk' },
  { time: '5:00 PM', title: 'Judging & Awards', description: 'Applause-o-meter + Nate pick the winners', type: 'activity' },
  { time: '5:30 PM', title: 'Closing Remarks', description: "See you at NateCon 2027!", type: 'activity' },
];

function getEventIcon(type: ScheduleEvent['type']) {
  switch (type) {
    case 'meal':
      return <Utensils className="w-4 h-4" />;
    case 'talk':
      return <Clock className="w-4 h-4" />;
    case 'break':
      return <Coffee className="w-4 h-4" />;
    default:
      return <Cookie className="w-4 h-4" />;
  }
}

function getEventBadgeVariant(type: ScheduleEvent['type']) {
  switch (type) {
    case 'meal':
      return 'secondary';
    case 'talk':
      return 'default';
    default:
      return 'outline';
  }
}

function ScheduleDay({ title, date, schedule }: { title: string; date: string; schedule: ScheduleEvent[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="bg-primary/10 border-b border-border">
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline" className="text-primary border-primary">
            {date}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {schedule.map((event, index) => (
            <div key={index} className="flex gap-4 p-4 hover:bg-secondary/30 transition-colors">
              <div className="flex-shrink-0 w-20">
                <span className="text-primary font-semibold text-sm">{event.time}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground">{event.title}</h3>
                  <Badge variant={getEventBadgeVariant(event.type)} className="text-xs">
                    {getEventIcon(event.type)}
                  </Badge>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Schedule() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Event Schedule
              </h1>
              <p className="text-xl text-muted-foreground">
                Two days packed with talks, networking, and building
              </p>
            </div>

            <div className="space-y-8">
              <ScheduleDay 
                title="Day 1 — Talks & Panels" 
                date="March 14, 2026" 
                schedule={dayOneSchedule} 
              />
              <ScheduleDay 
                title="Day 2 — Nateathon Hackathon" 
                date="March 15, 2026" 
                schedule={dayTwoSchedule} 
              />
            </div>

            <div className="mt-12 text-center">
              <Card className="bg-secondary/30 border-border inline-block">
                <CardContent className="p-6 flex items-center gap-3">
                  <Coffee className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">
                    Water, sodas, and snacks available all day, both days
                  </span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
