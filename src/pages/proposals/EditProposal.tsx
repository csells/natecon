import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mic2, Trash2 } from 'lucide-react';
import { z } from 'zod';
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

const proposalSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000, 'Description must be less than 2000 characters'),
  length: z.enum(['lightning', 'full'], { required_error: 'Please select a talk length' }),
});

interface Proposal {
  id: string;
  title: string;
  description: string;
  length: string;
  status: string;
  user_id: string;
}

export default function EditProposal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    length: 'lightning' as 'lightning' | 'full',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchProposal();
    }
  }, [user, id]);

  const fetchProposal = async () => {
    try {
      const { data, error } = await supabase
        .from('talk_proposals')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Proposal not found');
        navigate('/dashboard');
        return;
      }

      if (data.user_id !== user?.id) {
        toast.error('You can only edit your own proposals');
        navigate('/dashboard');
        return;
      }

      setProposal(data);
      setFormData({
        title: data.title,
        description: data.description,
        length: data.length as 'lightning' | 'full',
      });
    } catch (error) {
      console.error('Error fetching proposal:', error);
      toast.error('Failed to load proposal');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = proposalSchema.safeParse(formData);
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
      const { error } = await supabase
        .from('talk_proposals')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          length: formData.length,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Proposal updated!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast.error('Failed to update proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('talk_proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Proposal deleted');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast.error('Failed to delete proposal');
    } finally {
      setDeleting(false);
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

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!proposal) {
    return null;
  }

  const isEditable = proposal.status === 'submitted';

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Edit Proposal</CardTitle>
                      <CardDescription>
                        {isEditable ? 'Make changes to your talk proposal' : 'View your talk proposal'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(proposal.status)}>
                    {proposal.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!isEditable && (
                  <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <p className="text-sm text-yellow-400">
                      This proposal has been {proposal.status} and can no longer be edited.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Talk Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter your talk title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-secondary/30 border-border"
                      maxLength={200}
                      disabled={!isEditable}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your talk in detail"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-secondary/30 border-border min-h-[150px]"
                      maxLength={2000}
                      disabled={!isEditable}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.description.length}/2000 characters
                    </p>
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Talk Length</Label>
                    <RadioGroup
                      value={formData.length}
                      onValueChange={(value) => setFormData({ ...formData, length: value as 'lightning' | 'full' })}
                      className="flex flex-col gap-3"
                      disabled={!isEditable}
                    >
                      <label
                        htmlFor="lightning"
                        className={`flex items-start gap-3 p-4 rounded-lg border border-border bg-secondary/30 ${isEditable ? 'cursor-pointer hover:border-primary/50' : 'opacity-70'} transition-colors`}
                      >
                        <RadioGroupItem value="lightning" id="lightning" className="mt-0.5" disabled={!isEditable} />
                        <div>
                          <p className="font-medium text-foreground">Lightning Talk (15 min)</p>
                          <p className="text-sm text-muted-foreground">
                            Quick, focused presentation on a specific topic
                          </p>
                        </div>
                      </label>
                      <label
                        htmlFor="full"
                        className={`flex items-start gap-3 p-4 rounded-lg border border-border bg-secondary/30 ${isEditable ? 'cursor-pointer hover:border-primary/50' : 'opacity-70'} transition-colors`}
                      >
                        <RadioGroupItem value="full" id="full" className="mt-0.5" disabled={!isEditable} />
                        <div>
                          <p className="font-medium text-foreground">Full Talk (45 min)</p>
                          <p className="text-sm text-muted-foreground">
                            In-depth exploration with demos and Q&A time
                          </p>
                        </div>
                      </label>
                    </RadioGroup>
                    {errors.length && (
                      <p className="text-sm text-destructive">{errors.length}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    {isEditable && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="destructive" disabled={deleting}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this proposal? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                              {deleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="flex-1"
                    >
                      {isEditable ? 'Cancel' : 'Back'}
                    </Button>
                    {isEditable && (
                      <Button type="submit" disabled={submitting} className="flex-1">
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    )}
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
