import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Placeholder teams - will be populated from database
const teams: Array<{
  id: string;
  name: string;
  ideaTitle: string;
  ideaDescription: string;
  members: Array<{ name: string; photo: string }>;
}> = [];

export default function Teams() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Hackathon Teams
              </h1>
              <p className="text-xl text-muted-foreground">
                Join a team or create your own for the Nateathon
              </p>
            </div>

            {/* Search and Create */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams..."
                  className="pl-10 bg-card border-border"
                />
              </div>
              <Button className="glow-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>

            {teams.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                    <Users className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    No Teams Yet
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Be the first to create a hackathon team! Share your idea and recruit teammates before the event.
                  </p>
                  <Button className="glow-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Create the First Team
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {teams.map((team) => (
                  <Card key={team.id} className="bg-card border-border card-glow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-foreground mb-1">{team.name}</h2>
                          <h3 className="text-primary font-medium mb-2">{team.ideaTitle}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{team.ideaDescription}</p>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Members:</span>
                            <div className="flex -space-x-2">
                              {team.members.map((member, i) => (
                                <img
                                  key={i}
                                  src={member.photo}
                                  alt={member.name}
                                  className="w-8 h-8 rounded-full border-2 border-card"
                                  title={member.name}
                                />
                              ))}
                            </div>
                            <Badge variant="secondary">{team.members.length} members</Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                          <Button size="sm">Join Team</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
