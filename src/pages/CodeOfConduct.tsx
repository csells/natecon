import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Users } from 'lucide-react';

export default function CodeOfConduct() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Code of Conduct
              </h1>
              <p className="text-xl text-muted-foreground">
                Be excellent to each other
              </p>
            </div>

            <Card className="bg-card border-border mb-8">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">The Golden Rule</h2>
                </div>
                
                <p className="text-lg text-foreground mb-6">
                  NateCon is a community event. We're here to learn, build, and connect. 
                  Treat everyone with respect and kindness.
                </p>

                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
                  <p className="text-foreground font-medium">
                    Harassment, discrimination, or being a jerk won't be tolerated.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border mb-8">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Reporting Issues</h2>
                </div>
                
                <p className="text-muted-foreground">
                  If you experience or witness any issues, contact the organizers immediately. 
                  We take all reports seriously and will handle them with discretion.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Users className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold text-foreground">Let's make this awesome together.</span>
                </div>
                <p className="text-muted-foreground">
                  This community is built on mutual respect and shared enthusiasm. 
                  Thank you for being part of it.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
