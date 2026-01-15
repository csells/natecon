import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, Users } from 'lucide-react';

interface TeamMember {
  user_id: string;
  profiles: {
    name: string | null;
    photo_url: string | null;
  } | null;
}

interface Team {
  id: string;
  name: string;
  idea_title: string;
  idea_description: string;
  created_at: string;
  creator: {
    name: string | null;
  } | null;
  team_members: TeamMember[];
}

export default function AdminTeams() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (!loading && !isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchTeams();
    }
  }, [isAdmin]);

  const fetchTeams = async () => {
    try {
      const { data: teamsData, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch team members and profiles
      const teamIds = teamsData?.map(t => t.id) || [];
      const { data: membersData } = await supabase
        .from('team_members')
        .select('*')
        .in('team_id', teamIds);

      const userIds = [...new Set([
        ...(teamsData?.map(t => t.creator_id).filter(Boolean) || []),
        ...(membersData?.map(m => m.user_id) || [])
      ])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, photo_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const teamsWithData = (teamsData || []).map(team => ({
        ...team,
        creator: team.creator_id ? { name: profileMap.get(team.creator_id)?.name || null } : null,
        team_members: (membersData || [])
          .filter(m => m.team_id === team.id)
          .map(m => ({
            user_id: m.user_id,
            profiles: profileMap.get(m.user_id) || null
          }))
      }));

      setTeams(teamsWithData as Team[]);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link to="/admin" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Teams</h1>
                <p className="text-muted-foreground">{teams.length} teams</p>
              </div>
            </div>

            {/* Teams Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {teams.map((team) => (
                <Card key={team.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Created by {team.creator?.name || 'Unknown'}
                        </p>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        {team.team_members.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-medium text-foreground">{team.idea_title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {team.idea_description}
                      </p>
                    </div>

                    {/* Members */}
                    <div className="flex flex-wrap gap-2">
                      {team.team_members.map((member) => (
                        <div
                          key={member.user_id}
                          className="flex items-center gap-2 bg-secondary/30 rounded-full px-3 py-1"
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={member.profiles?.photo_url || ''} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {member.profiles?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{member.profiles?.name || 'Unknown'}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                      Created {new Date(team.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {teams.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No teams created yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
