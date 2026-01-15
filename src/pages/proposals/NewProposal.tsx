import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mic2 } from 'lucide-react';
import { z } from 'zod';

const proposalSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000, 'Description must be less than 2000 characters'),
  length: z.enum(['lightning', 'full'], { required_error: 'Please select a talk length' }),
});

export default function NewProposal() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    length: 'lightning' as 'lightning' | 'full',
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
      const { error } = await supabase.from('talk_proposals').insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        length: formData.length,
        status: 'submitted',
      });

      if (error) throw error;

      toast.success('Talk proposal submitted!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast.error('Failed to submit proposal. Please try again.');
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
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mic2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Submit a Talk Proposal</CardTitle>
                    <CardDescription>
                      Share your knowledge with the NateCon community
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your talk in detail. What will attendees learn? What topics will you cover?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-secondary/30 border-border min-h-[150px]"
                      maxLength={2000}
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
                    >
                      <label
                        htmlFor="lightning"
                        className="flex items-start gap-3 p-4 rounded-lg border border-border bg-secondary/30 cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <RadioGroupItem value="lightning" id="lightning" className="mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Lightning Talk (15 min)</p>
                          <p className="text-sm text-muted-foreground">
                            Quick, focused presentation on a specific topic
                          </p>
                        </div>
                      </label>
                      <label
                        htmlFor="full"
                        className="flex items-start gap-3 p-4 rounded-lg border border-border bg-secondary/30 cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <RadioGroupItem value="full" id="full" className="mt-0.5" />
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Proposal'
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
