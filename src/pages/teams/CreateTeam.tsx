import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Users } from 'lucide-react';
import { z } from 'zod';

const teamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters').max(50, 'Team name must be less than 50 characters'),
  idea_title: z.string().min(5, 'Idea title must be at least 5 characters').max(200, 'Idea title must be less than 200 characters'),
  idea_description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
});

export default function CreateTeam() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    idea_title: '',
    idea_description: '',
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = teamSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      // Check if user is already on a team
      const { data: existingMembership } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMembership) {
        toast.error('You are already on a team. Leave your current team first.');
        setSubmitting(false);
        return;
      }

      // Create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: formData.name.trim(),
          idea_title: formData.idea_title.trim(),
          idea_description: formData.idea_description.trim(),
          creator_id: user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      toast.success('Team created! You are now the team leader.');
      navigate(`/teams/${team.id}`);
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate('/teams')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Create a Hackathon Team</CardTitle>
                    <CardDescription>
                      Start a team for the Nateathon and recruit teammates
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Team Name</Label>
                    <Input
                      id="name"
                      placeholder="Give your team a memorable name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-secondary/30 border-border"
                      maxLength={50}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idea_title">Project Idea Title</Label>
                    <Input
                      id="idea_title"
                      placeholder="What are you building?"
                      value={formData.idea_title}
                      onChange={(e) => setFormData({ ...formData, idea_title: e.target.value })}
                      className="bg-secondary/30 border-border"
                      maxLength={200}
                    />
                    {errors.idea_title && (
                      <p className="text-sm text-destructive">{errors.idea_title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idea_description">Project Description</Label>
                    <Textarea
                      id="idea_description"
                      placeholder="Describe your project idea. What problem does it solve? What AI agents will you build?"
                      value={formData.idea_description}
                      onChange={(e) => setFormData({ ...formData, idea_description: e.target.value })}
                      className="bg-secondary/30 border-border min-h-[120px]"
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.idea_description.length}/1000 characters
                    </p>
                    {errors.idea_description && (
                      <p className="text-sm text-destructive">{errors.idea_description}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/teams')}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Team'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
