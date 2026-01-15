import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Upload, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileData {
  id: string;
  name: string | null;
  photo_url: string | null;
  bio: string | null;
  substack_handle: string | null;
  dietary_vegetarian: boolean;
  dietary_vegan: boolean;
  dietary_gluten_free: boolean;
  dietary_kosher: boolean;
  dietary_halal: boolean;
  dietary_allergies: string | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [substackHandle, setSubstackHandle] = useState('');
  const [dietaryVegetarian, setDietaryVegetarian] = useState(false);
  const [dietaryVegan, setDietaryVegan] = useState(false);
  const [dietaryGlutenFree, setDietaryGlutenFree] = useState(false);
  const [dietaryKosher, setDietaryKosher] = useState(false);
  const [dietaryHalal, setDietaryHalal] = useState(false);
  const [dietaryAllergies, setDietaryAllergies] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setName(data.name || '');
        setBio(data.bio || '');
        setSubstackHandle(data.substack_handle || '');
        setDietaryVegetarian(data.dietary_vegetarian || false);
        setDietaryVegan(data.dietary_vegan || false);
        setDietaryGlutenFree(data.dietary_gluten_free || false);
        setDietaryKosher(data.dietary_kosher || false);
        setDietaryHalal(data.dietary_halal || false);
        setDietaryAllergies(data.dietary_allergies || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, photo_url: publicUrl } : null);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          bio,
          substack_handle: substackHandle,
          dietary_vegetarian: dietaryVegetarian,
          dietary_vegan: dietaryVegan,
          dietary_gluten_free: dietaryGlutenFree,
          dietary_kosher: dietaryKosher,
          dietary_halal: dietaryHalal,
          dietary_allergies: dietaryAllergies,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile) {
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
          <div className="max-w-2xl mx-auto">
            {/* Back Button */}
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Photo Upload */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile?.photo_url || ''} alt={name} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span className="text-sm">Upload Photo</span>
                    </div>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                    />
                  </Label>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="substack">Substack Handle</Label>
                    <Input
                      id="substack"
                      value={substackHandle}
                      onChange={(e) => setSubstackHandle(e.target.value)}
                      placeholder="yourhandle"
                    />
                    <p className="text-xs text-muted-foreground">
                      So other attendees can connect with you on Substack
                    </p>
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div className="space-y-4">
                  <Label className="text-base">Dietary Restrictions</Label>
                  <p className="text-sm text-muted-foreground">
                    Only visible to organizers for catering purposes
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vegetarian"
                        checked={dietaryVegetarian}
                        onCheckedChange={(checked) => setDietaryVegetarian(checked as boolean)}
                      />
                      <Label htmlFor="vegetarian" className="text-sm font-normal">
                        Vegetarian
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vegan"
                        checked={dietaryVegan}
                        onCheckedChange={(checked) => setDietaryVegan(checked as boolean)}
                      />
                      <Label htmlFor="vegan" className="text-sm font-normal">
                        Vegan
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="gluten-free"
                        checked={dietaryGlutenFree}
                        onCheckedChange={(checked) => setDietaryGlutenFree(checked as boolean)}
                      />
                      <Label htmlFor="gluten-free" className="text-sm font-normal">
                        Gluten-free
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="kosher"
                        checked={dietaryKosher}
                        onCheckedChange={(checked) => setDietaryKosher(checked as boolean)}
                      />
                      <Label htmlFor="kosher" className="text-sm font-normal">
                        Kosher
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="halal"
                        checked={dietaryHalal}
                        onCheckedChange={(checked) => setDietaryHalal(checked as boolean)}
                      />
                      <Label htmlFor="halal" className="text-sm font-normal">
                        Halal
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies / Other</Label>
                    <Input
                      id="allergies"
                      value={dietaryAllergies}
                      onChange={(e) => setDietaryAllergies(e.target.value)}
                      placeholder="Please list any food allergies..."
                    />
                  </div>
                </div>

                {/* Save Button */}
                <Button onClick={handleSave} disabled={saving} className="w-full glow-button">
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
