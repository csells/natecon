import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { Loader2, ArrowLeft, Save } from 'lucide-react';

type SiteMode = 'pre-registration' | 'registration-open' | 'waitlist' | 'post-event' | 'delayed';

interface SiteSettings {
  site_mode: SiteMode;
  wrap_up_message: string;
  winner_best_agent: string;
  winner_best_tool: string;
  winner_best_overall: string;
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>({
    site_mode: 'pre-registration',
    wrap_up_message: '',
    winner_best_agent: '',
    winner_best_tool: '',
    winner_best_overall: '',
  });
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

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
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((s) => {
        settingsMap[s.key] = JSON.parse(JSON.stringify(s.value));
      });

      setSettings({
        site_mode: (settingsMap.site_mode || 'pre-registration') as SiteMode,
        wrap_up_message: settingsMap.wrap_up_message || '',
        winner_best_agent: settingsMap.winner_best_agent || '',
        winner_best_tool: settingsMap.winner_best_tool || '',
        winner_best_overall: settingsMap.winner_best_overall || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('site_settings')
      .update({ value: JSON.stringify(value) })
      .eq('key', key);

    if (error) throw error;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting('site_mode', settings.site_mode),
        saveSetting('wrap_up_message', settings.wrap_up_message),
        saveSetting('winner_best_agent', settings.winner_best_agent),
        saveSetting('winner_best_tool', settings.winner_best_tool),
        saveSetting('winner_best_overall', settings.winner_best_overall),
      ]);

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
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
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link to="/admin" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Site Settings</h1>
                <p className="text-muted-foreground">Configure site behavior</p>
              </div>
            </div>

            {/* Site Mode */}
            <Card className="bg-card border-border mb-6">
              <CardHeader>
                <CardTitle>Site Mode</CardTitle>
                <CardDescription>Control the current state of registration</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={settings.site_mode}
                  onValueChange={(value) =>
                    setSettings({ ...settings, site_mode: value as SiteMode })
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30">
                    <RadioGroupItem value="pre-registration" id="pre-registration" />
                    <Label htmlFor="pre-registration" className="flex-1 cursor-pointer">
                      <div className="font-medium">Pre-registration</div>
                      <div className="text-sm text-muted-foreground">
                        Interest signups only, no payments
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30">
                    <RadioGroupItem value="registration-open" id="registration-open" />
                    <Label htmlFor="registration-open" className="flex-1 cursor-pointer">
                      <div className="font-medium">Registration Open</div>
                      <div className="text-sm text-muted-foreground">
                        Payments enabled via Stripe
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30">
                    <RadioGroupItem value="waitlist" id="waitlist" />
                    <Label htmlFor="waitlist" className="flex-1 cursor-pointer">
                      <div className="font-medium">Waitlist</div>
                      <div className="text-sm text-muted-foreground">
                        Registration full, collect waitlist signups
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30">
                    <RadioGroupItem value="post-event" id="post-event" />
                    <Label htmlFor="post-event" className="flex-1 cursor-pointer">
                      <div className="font-medium">Post-Event</div>
                      <div className="text-sm text-muted-foreground">
                        Show wrap-up message and winners
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30">
                    <RadioGroupItem value="delayed" id="delayed" />
                    <Label htmlFor="delayed" className="flex-1 cursor-pointer">
                      <div className="font-medium">Delayed</div>
                      <div className="text-sm text-muted-foreground">
                        Show delay message, hide all other content
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Post-Event Settings */}
            {settings.site_mode === 'post-event' && (
              <Card className="bg-card border-border mb-6">
                <CardHeader>
                  <CardTitle>Post-Event Settings</CardTitle>
                  <CardDescription>Configure the post-event display</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wrap-up">Wrap-up Message</Label>
                    <Textarea
                      id="wrap-up"
                      value={settings.wrap_up_message}
                      onChange={(e) =>
                        setSettings({ ...settings, wrap_up_message: e.target.value })
                      }
                      placeholder="Thanks for joining us at NateCon 2026..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="best-agent">Best AI Agent Winner</Label>
                    <Input
                      id="best-agent"
                      value={settings.winner_best_agent}
                      onChange={(e) =>
                        setSettings({ ...settings, winner_best_agent: e.target.value })
                      }
                      placeholder="Team name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="best-tool">Best AI Tool Winner</Label>
                    <Input
                      id="best-tool"
                      value={settings.winner_best_tool}
                      onChange={(e) =>
                        setSettings({ ...settings, winner_best_tool: e.target.value })
                      }
                      placeholder="Team name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="best-overall">Best Overall Winner</Label>
                    <Input
                      id="best-overall"
                      value={settings.winner_best_overall}
                      onChange={(e) =>
                        setSettings({ ...settings, winner_best_overall: e.target.value })
                      }
                      placeholder="Team name"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <Button onClick={handleSave} disabled={saving} className="w-full glow-button">
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
