import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Chrome, CheckCircle2, XCircle } from 'lucide-react';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/emailService';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const PASSWORD_REQUIREMENTS = 'Minimum 6 characters';

// Email validation helper with inline feedback
function useEmailValidation(email: string) {
  return useMemo(() => {
    if (!email) return { isValid: null, message: '' };
    const result = emailSchema.safeParse(email);
    if (result.success) {
      return { isValid: true, message: 'Valid email' };
    }
    return { isValid: false, message: result.error.errors[0].message };
  }, [email]);
}

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'signup';
  const { user, loading, signInWithGoogle, signInWithMagicLink, signUp, signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');

  // Inline email validation
  const loginEmailValidation = useEmailValidation(loginEmail);
  const signupEmailValidation = useEmailValidation(signupEmail);
  const magicLinkEmailValidation = useEmailValidation(magicLinkEmail);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
    }
    setIsSubmitting(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(magicLinkEmail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);
    const { error } = await signInWithMagicLink(magicLinkEmail);
    if (error) {
      toast.error(error.message);
    } else {
      setMagicLinkSent(true);
      toast.success('Check your email for the magic link!');
    }
    setIsSubmitting(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(error.message);
      }
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Account created! Redirecting to dashboard...');
      // Send welcome email (fire and forget)
      sendWelcomeEmail(signupEmail, signupName).catch(console.error);
    }
    setIsSubmitting(false);
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

  return (
    <Layout>
      <section className="section-padding min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Welcome to <span className="text-gradient">NateCon</span>
              </CardTitle>
              <CardDescription>
                Create an account or sign in to register for the event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OAuth Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  variant="outline"
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Chrome className="w-4 h-4 mr-2" />
                  )}
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Magic Link */}
              {!magicLinkSent ? (
                <form onSubmit={handleMagicLink} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Magic Link (passwordless)</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          id="magic-email"
                          type="email"
                          placeholder="you@example.com"
                          value={magicLinkEmail}
                          onChange={(e) => setMagicLinkEmail(e.target.value)}
                          className={magicLinkEmail && magicLinkEmailValidation.isValid === false ? 'border-destructive' : magicLinkEmail && magicLinkEmailValidation.isValid ? 'border-green-500' : ''}
                          required
                        />
                        {magicLinkEmail && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {magicLinkEmailValidation.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                        )}
                      </div>
                      <Button type="submit" disabled={isSubmitting || magicLinkEmailValidation.isValid === false} size="icon" aria-label="Send magic link">
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {magicLinkEmail && magicLinkEmailValidation.isValid === false && (
                      <p className="text-xs text-destructive">{magicLinkEmailValidation.message}</p>
                    )}
                  </div>
                </form>
              ) : (
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <Mail className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-foreground">
                    Check your email for the magic link!
                  </p>
                  <button
                    onClick={() => setMagicLinkSent(false)}
                    className="text-xs text-primary hover:underline mt-2"
                  >
                    Send another link
                  </button>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or use email/password</span>
                </div>
              </div>

              {/* Email/Password Tabs */}
              <Tabs defaultValue={initialMode} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className={loginEmail && loginEmailValidation.isValid === false ? 'border-destructive pr-10' : loginEmail && loginEmailValidation.isValid ? 'border-green-500 pr-10' : ''}
                          required
                        />
                        {loginEmail && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {loginEmailValidation.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                        )}
                      </div>
                      {loginEmail && loginEmailValidation.isValid === false && (
                        <p className="text-xs text-destructive">{loginEmailValidation.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting || loginEmailValidation.isValid === false} className="w-full glow-button">
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className={signupEmail && signupEmailValidation.isValid === false ? 'border-destructive pr-10' : signupEmail && signupEmailValidation.isValid ? 'border-green-500 pr-10' : ''}
                          required
                        />
                        {signupEmail && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {signupEmailValidation.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                        )}
                      </div>
                      {signupEmail && signupEmailValidation.isValid === false && (
                        <p className="text-xs text-destructive">{signupEmailValidation.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        aria-describedby="password-requirements"
                      />
                      <p id="password-requirements" className="text-xs text-muted-foreground">
                        {PASSWORD_REQUIREMENTS}
                      </p>
                    </div>
                    <Button type="submit" disabled={isSubmitting || signupEmailValidation.isValid === false} className="w-full glow-button">
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
