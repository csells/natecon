import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coffee, Utensils, Clock, Loader2, Mic, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AcceptedTalk {
  id: string;
  title: string;
  description: string;
  length: string;
  speaker: {
    name: string | null;
    photo_url: string | null;
  } | null;
}

interface ScheduleEvent {
  time: string;
  title: string;
  description?: string;
  type: 'meal' | 'talk' | 'activity' | 'break' | 'lightning' | 'full-talk';
  talks?: AcceptedTalk[];
}

function getEventIcon(type: ScheduleEvent['type']) {
  switch (type) {
    case 'meal':
      return <Utensils className="w-4 h-4" />;
    case 'talk':
    case 'lightning':
    case 'full-talk':
      return <Mic className="w-4 h-4" />;
    case 'break':
      return <Coffee className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getEventBadgeVariant(type: ScheduleEvent['type']) {
  switch (type) {
    case 'meal':
      return 'secondary';
    case 'talk':
    case 'lightning':
    case 'full-talk':
      return 'default';
    default:
      return 'outline';
  }
}

function TalkCard({ talk }: { talk: AcceptedTalk }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
      <Avatar className="w-10 h-10">
        <AvatarImage src={talk.speaker?.photo_url || undefined} />
        <AvatarFallback>{talk.speaker?.name?.charAt(0) || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm">{talk.title}</p>
        <p className="text-xs text-muted-foreground">
          {talk.speaker?.name || 'Speaker TBA'} • {talk.length === 'lightning' ? '15 min' : '45 min'}
        </p>
      </div>
    </div>
  );
}

function ScheduleDay({ 
  title, 
  date, 
  schedule, 
  lightningTalks = [], 
  fullTalks = [] 
}: { 
  title: string; 
  date: string; 
  schedule: ScheduleEvent[];
  lightningTalks?: AcceptedTalk[];
  fullTalks?: AcceptedTalk[];
}) {
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
          {schedule.map((event, index) => {
            const isLightningSlot = event.type === 'lightning';
            const isFullTalkSlot = event.type === 'full-talk';
            const talksToShow = isLightningSlot ? lightningTalks : isFullTalkSlot ? fullTalks : [];
            
            return (
              <div key={index} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex gap-4">
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
                
                {talksToShow.length > 0 && (
                  <div className="mt-4 ml-24 grid gap-2">
                    {talksToShow.map((talk) => (
                      <TalkCard key={talk.id} talk={talk} />
                    ))}
                  </div>
                )}
                
                {(isLightningSlot || isFullTalkSlot) && talksToShow.length === 0 && (
                  <div className="mt-4 ml-24">
                    <p className="text-sm text-muted-foreground italic">Speakers to be announced</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

const dayOneSchedule: ScheduleEvent[] = [
  { time: '9:00 AM', title: 'Breakfast & Networking', description: 'Fuel up and meet fellow attendees', type: 'meal' },
  { time: '10:00 AM', title: "Nate's Keynote", description: 'Opening remarks and the future of AI newsletters', type: 'talk' },
  { time: '11:00 AM', title: 'Lightning Talks', description: '15-minute community presentations', type: 'lightning' },
  { time: '12:00 PM', title: 'Lunch', description: 'Catered lunch with networking time', type: 'meal' },
  { time: '1:00 PM', title: 'Full Talks', description: '45-minute deep-dive presentations', type: 'full-talk' },
  { time: '2:30 PM', title: 'Afternoon Snacks', description: 'Coffee, tea, and treats', type: 'meal' },
  { time: '3:00 PM', title: 'Lightning Talks', description: 'More community presentations', type: 'lightning' },
  { time: '4:00 PM', title: 'Speaker Panel', description: 'Q&A with speakers and Nate', type: 'talk' },
  { time: '5:00 PM', title: 'Day 1 Wrap-up', description: 'Dinner on your own — explore SF\'s foodie scene!', type: 'activity' },
];

const dayTwoSchedule: ScheduleEvent[] = [
  { time: '9:00 AM', title: 'Breakfast & Team Formation', description: 'Final chance to join a team', type: 'meal' },
  { time: '10:00 AM', title: 'Hackathon Kickoff', description: 'Rules (there are none!), prizes, and let the building begin', type: 'activity' },
  { time: '12:00 PM', title: 'Lunch', description: 'Keep building while you eat', type: 'meal' },
  { time: '2:30 PM', title: 'Afternoon Snacks', description: 'Sugar boost for the final stretch', type: 'meal' },
  { time: '3:30 PM', title: 'Demos Begin', description: '3-minute presentations from each team', type: 'talk' },
  { time: '5:00 PM', title: 'Judging & Awards', description: 'Applause-o-meter + Nate pick the winners', type: 'activity' },
  { time: '5:30 PM', title: 'Closing Remarks', description: "Celebrate with dinner on your own — see you at NateCon 2027!", type: 'activity' },
];

export default function Schedule() {
  const [lightningTalks, setLightningTalks] = useState<AcceptedTalk[]>([]);
  const [fullTalks, setFullTalks] = useState<AcceptedTalk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcceptedTalks();
  }, []);

  const fetchAcceptedTalks = async () => {
    try {
      // Fetch accepted talk proposals
      const { data: proposals, error } = await supabase
        .from('talk_proposals')
        .select('id, title, description, length, user_id')
        .eq('status', 'accepted')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!proposals || proposals.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch speaker profiles using the public view
      const userIds = proposals.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('user_id, name, photo_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const talksWithSpeakers: AcceptedTalk[] = proposals.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        length: p.length,
        speaker: profileMap.get(p.user_id) || null,
      }));

      setLightningTalks(talksWithSpeakers.filter(t => t.length === 'lightning'));
      setFullTalks(talksWithSpeakers.filter(t => t.length === 'full'));
    } catch (error) {
      console.error('Error fetching accepted talks:', error);
    } finally {
      setLoading(false);
    }
  };

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
              {(lightningTalks.length > 0 || fullTalks.length > 0) && (
                <Badge variant="secondary" className="mt-4">
                  {lightningTalks.length + fullTalks.length} confirmed speaker{lightningTalks.length + fullTalks.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="day1" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="day1" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Day 1 — Talks
                  </TabsTrigger>
                  <TabsTrigger value="day2" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Day 2 — Hackathon
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="day1">
                  <ScheduleDay 
                    title="Day 1 — Talks & Panels" 
                    date="March 14, 2026" 
                    schedule={dayOneSchedule}
                    lightningTalks={lightningTalks}
                    fullTalks={fullTalks}
                  />
                </TabsContent>
                
                <TabsContent value="day2">
                  <ScheduleDay 
                    title="Day 2 — Nateathon Hackathon" 
                    date="March 15, 2026" 
                    schedule={dayTwoSchedule}
                  />
                </TabsContent>
              </Tabs>
            )}

            <div className="mt-12 text-center space-y-4">
              <Card className="bg-secondary/30 border-border inline-block">
                <CardContent className="p-6 flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">
                    Breakfast, lunch, snacks, and drinks included both days
                  </span>
                </CardContent>
              </Card>
              <p className="text-sm text-muted-foreground">
                Dinner is on your own — enjoy SF's amazing restaurants, grab a burger, whatever you like!
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
