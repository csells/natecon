import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

// Placeholder for when speakers are announced
const speakers: Array<{
  name: string;
  photo: string;
  bio: string;
  talkTitle: string;
  talkDescription: string;
  talkLength: 'lightning' | 'full';
}> = [];

export default function Speakers() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Speakers
              </h1>
              <p className="text-xl text-muted-foreground">
                Community members sharing their knowledge and experiences
              </p>
            </div>

            {speakers.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                    <Users className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Speakers Coming Soon
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    We're reviewing talk proposals now. Create an account to submit your own talk and be featured here!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Accepted speakers will be announced as proposals are reviewed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {speakers.map((speaker, index) => (
                  <Card key={index} className="bg-card border-border card-glow overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-shrink-0">
                          <img
                            src={speaker.photo}
                            alt={speaker.name}
                            className="w-full md:w-48 h-48 object-cover"
                          />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-xl font-bold text-foreground">{speaker.name}</h2>
                            <Badge variant={speaker.talkLength === 'lightning' ? 'secondary' : 'default'}>
                              {speaker.talkLength === 'lightning' ? '15 min' : '45 min'}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-4">{speaker.bio}</p>
                          <div className="border-t border-border pt-4">
                            <h3 className="font-semibold text-primary mb-1">{speaker.talkTitle}</h3>
                            <p className="text-sm text-muted-foreground">{speaker.talkDescription}</p>
                          </div>
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
