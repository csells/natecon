import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Send, Mail } from 'lucide-react';

export default function AdminAnnouncements() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'interested' | 'registered'>('interested');
  const [sending, setSending] = useState(false);

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

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);

    // TODO: Implement email sending via edge function
    // For now, simulate the action
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success(`Announcement sent to ${audience} users`);
    setMessage('');
    setSending(false);
  };

  if (loading) {
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
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link to="/admin" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Announcements</h1>
                <p className="text-muted-foreground">Send email announcements to users</p>
              </div>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Send Announcement
                </CardTitle>
                <CardDescription>
                  Compose and send an email to your attendees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Audience Selection */}
                <div className="space-y-3">
                  <Label>Send to</Label>
                  <RadioGroup
                    value={audience}
                    onValueChange={(value) => setAudience(value as 'interested' | 'registered')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="interested" id="interested" />
                      <Label htmlFor="interested" className="cursor-pointer">
                        All interested users
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="registered" id="registered" />
                      <Label htmlFor="registered" className="cursor-pointer">
                        Registered users only
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your announcement here..."
                    rows={8}
                  />
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className="w-full glow-button"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Announcement
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Note: Email sending will be implemented when you connect Resend
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
