import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Users, Crown, UserMinus, UserPlus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { sendTeamJoinedEmail, sendTeamMemberLeftEmail } from '@/lib/emailService';

interface Team {
  id: string;
  name: string;
  idea_title: string;
  idea_description: string;
  creator_id: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  joined_at: string;
  profile: {
    name: string | null;
    photo_url: string | null;
  } | null;
}

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [userMembership, setUserMembership] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTeamData();
    }
  }, [id, user]);

  const fetchTeamData = async () => {
    try {
      // Fetch team details
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (teamError) throw teamError;

      if (!teamData) {
        toast.error('Team not found');
        navigate('/teams');
        return;
      }

      setTeam(teamData);

      // Fetch team members
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('id, user_id, joined_at')
        .eq('team_id', id);

      if (membersError) throw membersError;

      // Fetch profiles for each member (use public view for non-sensitive data)
      const memberIds = membersData?.map(m => m.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles_public')
        .select('user_id, name, photo_url')
        .in('user_id', memberIds);

      const membersWithProfiles = membersData?.map(member => ({
        ...member,
        profile: profilesData?.find(p => p.user_id === member.user_id) || null,
      })) || [];

      setMembers(membersWithProfiles);

      // Check if current user is a member
      if (user) {
        const userMember = membersData?.find(m => m.user_id === user.id);
        setUserMembership(userMember?.id || null);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setActionLoading(true);

    try {
      // Check if user is already on a team
      const { data: existingMembership } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMembership) {
        toast.error('You are already on a team. Leave your current team first.');
        return;
      }

      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: id,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success('You have joined the team!');
      
      // Get current user's profile for the notification
      const { data: joinerProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Notify team creator about new member
      if (team?.creator_id && team.creator_id !== user.id) {
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('email, name')
          .eq('user_id', team.creator_id)
          .maybeSingle();
        
        if (creatorProfile?.email) {
          sendTeamJoinedEmail(
            creatorProfile.email,
            creatorProfile.name || 'there',
            team.name,
            joinerProfile?.name || 'Someone'
          ).catch(console.error);
        }
      }
      
      fetchTeamData();
    } catch (error) {
      console.error('Error joining team:', error);
      toast.error('Failed to join team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!user || !userMembership) return;

    setActionLoading(true);

    try {
      // Get current user's profile for notification
      const { data: leaverProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .maybeSingle();

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', userMembership);

      if (error) throw error;

      toast.success('You have left the team');
      
      // Notify team creator about member leaving
      if (team?.creator_id && team.creator_id !== user.id) {
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('email, name')
          .eq('user_id', team.creator_id)
          .maybeSingle();
        
        if (creatorProfile?.email) {
          sendTeamMemberLeftEmail(
            creatorProfile.email,
            creatorProfile.name || 'there',
            team.name,
            leaverProfile?.name || 'A member'
          ).catch(console.error);
        }
      }
      
      setUserMembership(null);
      fetchTeamData();
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error('Failed to leave team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!user || !team || team.creator_id !== user.id) return;

    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Team deleted');
      navigate('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!team) {
    return null;
  }

  const isCreator = user?.id === team.creator_id;
  const isMember = !!userMembership;

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate('/teams')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>

            <Card className="bg-card border-border mb-6">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{team.name}</CardTitle>
                      <CardDescription>{team.idea_title}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="self-start">
                    {members.length} member{members.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Project Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{team.idea_description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {!isMember && user && (
                      <Button onClick={handleJoinTeam} disabled={actionLoading}>
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4 mr-2" />
                        )}
                        Join Team
                      </Button>
                    )}

                    {isMember && !isCreator && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" disabled={actionLoading}>
                            <UserMinus className="w-4 h-4 mr-2" />
                            Leave Team
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Leave Team</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to leave this team?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLeaveTeam}>Leave</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {isCreator && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" disabled={actionLoading}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Team
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Team</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this team? All members will be removed. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteTeam}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {!user && (
                      <Button onClick={() => navigate('/auth')}>
                        Sign in to Join
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                    >
                      <Avatar>
                        <AvatarImage src={member.profile?.photo_url || undefined} />
                        <AvatarFallback>
                          {member.profile?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {member.profile?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                      {member.user_id === team.creator_id && (
                        <Badge variant="outline" className="gap-1">
                          <Crown className="w-3 h-3" />
                          Creator
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
