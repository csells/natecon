import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Speaker {
  id: string;
  name: string | null;
  photo_url: string | null;
  bio: string | null;
  substack_handle: string | null;
  talkTitle: string;
  talkDescription: string;
  talkLength: string;
}

export default function Speakers() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
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
        .select('user_id, name, photo_url, bio, substack_handle')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const speakersData: Speaker[] = proposals.map(p => {
        const profile = profileMap.get(p.user_id);
        return {
          id: p.id,
          name: profile?.name || null,
          photo_url: profile?.photo_url || null,
          bio: profile?.bio || null,
          substack_handle: profile?.substack_handle || null,
          talkTitle: p.title,
          talkDescription: p.description,
          talkLength: p.length,
        };
      });

      setSpeakers(speakersData);
    } catch (error) {
      console.error('Error fetching speakers:', error);
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
                Speakers
              </h1>
              <p className="text-xl text-muted-foreground">
                Community members sharing their knowledge and experiences
              </p>
              {speakers.length > 0 && (
                <Badge variant="secondary" className="mt-4">
                  {speakers.length} confirmed speaker{speakers.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : speakers.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                    <Users className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Speakers Coming Soon
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    We're reviewing talk proposals now. Submit your own talk and be featured here!
                  </p>
                  <Link to="/proposals/new">
                    <Button size="lg" className="glow-button mb-6">
                      Submit Your Talk!
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Accepted speakers will be announced as proposals are reviewed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {speakers.map((speaker) => (
                  <Card key={speaker.id} className="bg-card border-border card-glow overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-shrink-0 p-6 flex items-center justify-center md:justify-start">
                          <Avatar className="w-32 h-32">
                            <AvatarImage src={speaker.photo_url || undefined} />
                            <AvatarFallback className="text-3xl">
                              {speaker.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 p-6 pt-0 md:pt-6 md:pl-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h2 className="text-xl font-bold text-foreground">
                              {speaker.name || 'Speaker TBA'}
                            </h2>
                            <Badge variant={speaker.talkLength === 'lightning' ? 'secondary' : 'default'}>
                              {speaker.talkLength === 'lightning' ? '15 min' : '45 min'}
                            </Badge>
                          </div>
                          
                          {speaker.substack_handle && (
                            <a
                              href={`https://${speaker.substack_handle}.substack.com`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-3"
                            >
                              {speaker.substack_handle}.substack.com
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          
                          {speaker.bio && (
                            <p className="text-muted-foreground text-sm mb-4">{speaker.bio}</p>
                          )}
                          
                          <div className="border-t border-border pt-4">
                            <h3 className="font-semibold text-primary mb-1">{speaker.talkTitle}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-3">{speaker.talkDescription}</p>
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
