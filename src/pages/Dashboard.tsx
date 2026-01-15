import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mic2, Users, FileEdit, Plus, Settings, Shield } from 'lucide-react';

interface Profile {
  id: string;
  name: string | null;
  photo_url: string | null;
  bio: string | null;
  substack_handle: string | null;
  registration_status: string;
}

interface TalkProposal {
  id: string;
  title: string;
  status: string;
  length: string;
}

interface Team {
  id: string;
  name: string;
  idea_title: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [proposals, setProposals] = useState<TalkProposal[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch talk proposals
      const { data: proposalsData } = await supabase
        .from('talk_proposals')
        .select('id, title, status, length')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (proposalsData) {
        setProposals(proposalsData);
      }

      // Fetch team membership
      const { data: teamMemberData } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (teamMemberData) {
        const { data: teamData } = await supabase
          .from('teams')
          .select('id, name, idea_title')
          .eq('id', teamMemberData.team_id)
          .single();

        if (teamData) {
          setTeam(teamData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getRegistrationStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'waitlisted':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
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

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold">
                  Welcome, <span className="text-gradient">{profile?.name || 'Attendee'}</span>
                </h1>
                <p className="text-muted-foreground">
                  Manage your NateCon 2026 experience
                </p>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" className="gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Registration Status */}
            <Card className="bg-card border-border mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Registration Status</h3>
                    <p className="text-sm text-muted-foreground">March 14-15, 2026 • San Francisco</p>
                  </div>
                  <Badge className={getRegistrationStatusColor(profile?.registration_status || 'interested')}>
                    {profile?.registration_status === 'interested' ? 'Interested' : 
                     profile?.registration_status === 'registered' ? 'Registered' : 'Waitlisted'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <Link to="/proposals/new">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Submit Talk</h3>
                    <p className="text-sm text-muted-foreground">Share your expertise</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/teams/new">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Create Team</h3>
                    <p className="text-sm text-muted-foreground">Start a hackathon team</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/teams">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Browse Teams</h3>
                    <p className="text-sm text-muted-foreground">Find a team to join</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* My Talk Proposals */}
            <Card className="bg-card border-border mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mic2 className="w-5 h-5 text-primary" />
                      My Talk Proposals
                    </CardTitle>
                    <CardDescription>
                      {proposals.length === 0
                        ? 'You haven\'t submitted any talk proposals yet'
                        : `${proposals.length} proposal${proposals.length === 1 ? '' : 's'}`}
                    </CardDescription>
                  </div>
                  <Link to="/proposals/new">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Plus className="w-4 h-4" />
                      New
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              {proposals.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {proposals.map((proposal) => (
                      <Link key={proposal.id} to={`/proposals/${proposal.id}`}>
                        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                          <div>
                            <h4 className="font-medium text-foreground">{proposal.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {proposal.length === 'lightning' ? '15 min lightning talk' : '45 min full talk'}
                            </p>
                          </div>
                          <Badge className={getStatusColor(proposal.status)}>
                            {proposal.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* My Team */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      My Team
                    </CardTitle>
                    <CardDescription>
                      {team ? 'You\'re part of a hackathon team' : 'You haven\'t joined a team yet'}
                    </CardDescription>
                  </div>
                  {!team && (
                    <Link to="/teams/new">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Plus className="w-4 h-4" />
                        Create
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              {team && (
                <CardContent className="pt-0">
                  <Link to={`/teams/${team.id}`}>
                    <div className="p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                      <h4 className="font-medium text-foreground">{team.name}</h4>
                      <p className="text-sm text-muted-foreground">{team.idea_title}</p>
                    </div>
                  </Link>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
