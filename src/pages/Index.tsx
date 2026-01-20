import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CountdownTimer } from '@/components/CountdownTimer';
import { SocialProofCounter } from '@/components/SocialProofCounter';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { TalkDeadlineCountdown } from '@/components/TalkDeadlineCountdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Mic2, 
  Code2, 
  Coffee, 
  Users,
  Lightbulb,
  Trophy,
  Laptop,
  Wifi,
  Plug,
  BellRing,
  MessageSquarePlus,
  UsersRound,
  Search,
  ChevronRight,
  Scale,
  FileCode,
  Award
} from 'lucide-react';
import natePhoto from '@/assets/nate-photo.webp';

const eventHighlights = [
  {
    icon: Calendar,
    title: 'March 14-15, 2026',
    description: 'Saturday & Sunday, two full days of learning and building',
  },
  {
    icon: MapPin,
    title: 'San Francisco',
    description: 'New Relic offices — venue details coming soon',
  },
  {
    icon: DollarSign,
    title: '$100 for both days',
    description: 'Includes all meals, snacks, and drinks',
  },
];

const dayOneHighlights = [
  { icon: Mic2, text: 'Community lightning & full talks' },
  { icon: Users, text: "Nate's keynote address" },
  { icon: MessageSquarePlus, text: 'Speaker panel discussion' },
];

const dayTwoHighlights = [
  { icon: Code2, text: 'Nateathon hackathon' },
  { icon: Trophy, text: 'Prizes for best projects' },
  { icon: Lightbulb, text: '3-minute demos' },
];

const scheduleOverview = [
  { time: '9:00 AM', event: 'Breakfast & networking' },
  { time: '10:00 AM', event: 'Keynote (Day 1) / Hackathon kickoff (Day 2)' },
  { time: '12:00 PM', event: 'Lunch' },
  { time: '2:30 PM', event: 'Afternoon snacks' },
];

const accountBenefits = [
  { icon: BellRing, text: 'Get notified when registration opens' },
  { icon: MessageSquarePlus, text: 'Submit a lightning talk (15 min) or full talk (45 min)' },
  { icon: UsersRound, text: 'Create a hackathon team with your idea' },
  { icon: Search, text: 'Browse and join existing teams' },
];

const hackathonPrizes = [
  { category: 'Best AI Agent', emoji: '🤖' },
  { category: 'Best AI Tool', emoji: '🛠️' },
  { category: 'Best Overall', emoji: '🏆' },
];

const hackathonRules = [
  { 
    icon: Users, 
    title: 'Team Size', 
    description: 'No limits! Solo, duo, or bring an army — your call.' 
  },
  { 
    icon: FileCode, 
    title: 'Pre-built Code', 
    description: 'Totally allowed. Just mention what you started with during your demo.' 
  },
  { 
    icon: Award, 
    title: 'Judging Criteria', 
    description: 'Audience vibes via the applause-o-meter, plus the whims of Nate himself.' 
  },
];

const whatToBring = [
  { icon: Laptop, text: 'Laptop and charger' },
  { icon: Wifi, text: 'Wifi provided' },
  { icon: Plug, text: 'Power strips available' },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center hero-pattern overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto fade-in">
            {/* Social Proof */}
            <div className="mb-8">
              <SocialProofCounter />
            </div>

            {/* Nate's Photo */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-110 animate-glow-pulse"></div>
              <img
                src={natePhoto}
                alt="Nate Jones"
                className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-primary/30 shadow-2xl"
              />
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4">
              <span className="text-gradient">NateCon</span>{' '}
              <span className="text-foreground">2026</span>
            </h1>

            {/* Quote */}
            <blockquote className="text-lg sm:text-xl md:text-2xl text-muted-foreground italic mb-8">
              "this will be fun" <span className="text-primary">—N. B. Jones</span>
            </blockquote>

            {/* Countdown Timer */}
            <div className="mb-10">
              <CountdownTimer />
            </div>

            {/* CTA Button */}
            <Link to="/auth">
              <Button size="lg" className="glow-button text-lg px-8 py-6 mb-6">
                Create Account
              </Button>
            </Link>

            {/* Social Share */}
            <SocialShareButtons />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-muted-foreground rotate-90" />
        </div>
      </section>

      {/* Event Overview */}
      <section className="section-padding bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            The Event
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {eventHighlights.map((item) => (
              <Card key={item.title} className="bg-card border-border card-glow">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Two Days Section */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Day 1 */}
            <Card className="bg-card border-border card-glow overflow-hidden">
              <div className="bg-primary/10 border-b border-border px-6 py-4">
                <h3 className="text-xl font-bold text-foreground">Day 1 — Saturday</h3>
                <p className="text-sm text-muted-foreground">March 14, 2026</p>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {dayOneHighlights.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Day 2 */}
            <Card className="bg-card border-border card-glow overflow-hidden">
              <div className="bg-primary/10 border-b border-border px-6 py-4">
                <h3 className="text-xl font-bold text-foreground">Day 2 — Sunday</h3>
                <p className="text-sm text-muted-foreground">March 15, 2026</p>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {dayTwoHighlights.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Account Benefits */}
      <section className="section-padding bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What You Get With an Account
            </h2>
            <p className="text-muted-foreground mb-10">
              Create a free account now — you'll only pay when registration opens
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {accountBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 text-left"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">{benefit.text}</span>
                </div>
              ))}
            </div>

            <Link to="/auth">
              <Button size="lg" className="glow-button">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Schedule Overview */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Daily Schedule
            </h2>
            
            <div className="space-y-4">
              {scheduleOverview.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex-shrink-0 w-20 text-center">
                    <span className="text-primary font-semibold">{item.time}</span>
                  </div>
                  <div className="flex-1 border-l border-border pl-4">
                    <span className="text-foreground">{item.event}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
              <Coffee className="w-4 h-4" />
              <span className="text-sm">Water, sodas, and snacks available all day</span>
            </div>

            <div className="mt-6 text-center">
              <Link to="/schedule">
                <Button variant="outline" className="hover:border-primary hover:text-primary">
                  View Full Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Talk Submission Deadline */}
      <section className="section-padding bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              Want to Speak?
            </h2>
            <TalkDeadlineCountdown />
          </div>
        </div>
      </section>

      {/* Hackathon Section */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient">Nateathon</span> Hackathon
            </h2>
            <p className="text-xl text-muted-foreground mb-8">Day 2 — Sunday, March 15</p>
            
            {/* Prizes */}
            <Card className="bg-card border-border mb-8">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Prizes</h3>
                
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  {hackathonPrizes.map((prize) => (
                    <div
                      key={prize.category}
                      className="bg-secondary/50 border border-border rounded-xl p-4"
                    >
                      <span className="text-3xl mb-2 block">{prize.emoji}</span>
                      <span className="text-sm font-medium text-foreground">{prize.category}</span>
                    </div>
                  ))}
                </div>

                <p className="text-muted-foreground text-sm">
                  3-minute demos in the afternoon
                </p>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card className="bg-card border-border mb-8">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  "The Rules" <span className="text-muted-foreground font-normal">(there aren't many)</span>
                </h3>
                
                <div className="grid sm:grid-cols-3 gap-6 text-left">
                  {hackathonRules.map((rule) => (
                    <div key={rule.title} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <rule.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{rule.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Link to="/teams">
              <Button variant="outline" className="hover:border-primary hover:text-primary">
                Browse Teams
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What to Bring */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-10">
              What to Bring
            </h2>
            
            <div className="inline-flex flex-wrap justify-center gap-4">
              {whatToBring.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-card border border-border rounded-full px-5 py-3"
                >
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-foreground text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-gradient-radial from-primary/10 via-transparent to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Join Us?
            </h2>
            <p className="text-muted-foreground mb-8">
              Create your account now to get notified when registration opens, submit talk proposals, and form your hackathon team.
            </p>
            
            <Link to="/auth">
              <Button size="lg" className="glow-button text-lg px-8 py-6 mb-6">
                Create Account
              </Button>
            </Link>

            <div className="mt-4">
              <SocialShareButtons />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
