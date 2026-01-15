import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Eye, Share2, Mail, HelpCircle } from 'lucide-react';

export default function Privacy() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground">
                How we handle your information
              </p>
            </div>

            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    What We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Name, email, photo, bio, Substack handle, and dietary restrictions when you create an account. 
                    Payment info is handled by Stripe — we never see your card number.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    How We Use It
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    To run NateCon 2026 — registration, team formation, talk proposals, and event communications.
                  </p>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-sm text-foreground">
                      <strong>Public:</strong> Your profile (name, photo, bio, Substack handle) is visible to other attendees.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Private:</strong> Your email and dietary info are only visible to organizers.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-primary" />
                    Who Else Sees It
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Stripe processes payments. Google handles authentication if you sign in that way. That's it.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Emails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We'll email you about registration opening, talk proposal status, team activity, and event updates. 
                    No spam, no selling your info.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Contact us through the site's{' '}
                    <a href="/contact" className="text-primary hover:underline">
                      contact form
                    </a>
                    .
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
