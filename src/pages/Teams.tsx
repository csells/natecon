import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Team {
  id: string;
  name: string;
  idea_title: string;
  idea_description: string;
  creator_id: string;
}

interface TeamMember {
  user_id: string;
  profile: {
    name: string | null;
    photo_url: string | null;
  } | null;
}

interface TeamWithMembers extends Team {
  members: TeamMember[];
}

export default function Teams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userTeamId, setUserTeamId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
    if (user) {
      checkUserTeam();
    }
  }, [user]);

  const checkUserTeam = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .maybeSingle();

    setUserTeamId(data?.team_id || null);
  };

  const fetchTeams = async () => {
    try {
      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;

      // Fetch all team members
      const teamIds = teamsData?.map(t => t.id) || [];
      const { data: membersData } = await supabase
        .from('team_members')
        .select('team_id, user_id')
        .in('team_id', teamIds);

      // Fetch profiles for all members
      const memberUserIds = membersData?.map(m => m.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name, photo_url')
        .in('user_id', memberUserIds);

      // Combine data
      const teamsWithMembers = teamsData?.map(team => ({
        ...team,
        members: membersData
          ?.filter(m => m.team_id === team.id)
          .map(m => ({
            user_id: m.user_id,
            profile: profilesData?.find(p => p.user_id === m.user_id) || null,
          })) || [],
      })) || [];

      setTeams(teamsWithMembers);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(
    team =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.idea_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.idea_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTeam = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/teams/new');
  };

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

            {/* User's Team Status */}
            {userTeamId && (
              <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-primary">
                    You're already on a team!
                  </p>
                  <Link to={`/teams/${userTeamId}`}>
                    <Button variant="outline" size="sm">
                      View My Team
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Search and Create */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
              <Button onClick={handleCreateTeam} className="glow-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredTeams.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                    <Users className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {searchQuery ? 'No Teams Found' : 'No Teams Yet'}
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Be the first to create a hackathon team! Share your idea and recruit teammates before the event.'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleCreateTeam} className="glow-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Create the First Team
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredTeams.map((team) => (
                  <Card key={team.id} className="bg-card border-border card-glow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-foreground mb-1">{team.name}</h2>
                          <h3 className="text-primary font-medium mb-2">{team.idea_title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {team.idea_description}
                          </p>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Members:</span>
                            <div className="flex -space-x-2">
                              {team.members.slice(0, 5).map((member, i) => (
                                <Avatar key={i} className="w-8 h-8 border-2 border-card">
                                  <AvatarImage src={member.profile?.photo_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {member.profile?.name?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {team.members.length > 5 && (
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-2 border-card">
                                  <span className="text-xs text-muted-foreground">
                                    +{team.members.length - 5}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Badge variant="secondary">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</Badge>
                          </div>
                        </div>

                        <Link to={`/teams/${team.id}`}>
                          <Button variant="outline" className="hover:border-primary hover:text-primary">
                            View Team
                          </Button>
                        </Link>
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
