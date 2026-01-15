import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, Mic2, UsersRound, Mail, Settings, ArrowLeft } from 'lucide-react';

interface Stats {
  totalUsers: number;
  registeredUsers: number;
  totalProposals: number;
  acceptedProposals: number;
  totalTeams: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    registeredUsers: 0,
    totalProposals: 0,
    acceptedProposals: 0,
    totalTeams: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

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
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      // Fetch user counts
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: registeredUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('registration_status', 'registered');

      // Fetch proposal counts
      const { count: totalProposals } = await supabase
        .from('talk_proposals')
        .select('*', { count: 'exact', head: true });

      const { count: acceptedProposals } = await supabase
        .from('talk_proposals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted');

      // Fetch team count
      const { count: totalTeams } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        registeredUsers: registeredUsers || 0,
        totalProposals: totalProposals || 0,
        acceptedProposals: acceptedProposals || 0,
        totalTeams: totalTeams || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
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
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">
                  <span className="text-gradient">Admin</span> Dashboard
                </h1>
                <p className="text-muted-foreground">Manage NateCon 2026</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.registeredUsers}</p>
                      <p className="text-sm text-muted-foreground">Registered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Mic2 className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.acceptedProposals}/{stats.totalProposals}
                      </p>
                      <p className="text-sm text-muted-foreground">Talks Accepted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <UsersRound className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalTeams}</p>
                      <p className="text-sm text-muted-foreground">Teams</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Sections */}
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/admin/users">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Interest Signups & Registrations
                    </CardTitle>
                    <CardDescription>
                      View and export user data, manage registrations
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/admin/proposals">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic2 className="w-5 h-5 text-primary" />
                      Talk Proposals
                    </CardTitle>
                    <CardDescription>
                      Review, accept, or reject talk submissions
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/admin/teams">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UsersRound className="w-5 h-5 text-primary" />
                      Teams
                    </CardTitle>
                    <CardDescription>
                      View all hackathon teams and members
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/admin/announcements">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" />
                      Announcements
                    </CardTitle>
                    <CardDescription>
                      Send email announcements to users
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/admin/settings" className="md:col-span-2">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      Site Settings
                    </CardTitle>
                    <CardDescription>
                      Toggle site mode, configure post-event settings, manage hackathon winners
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
