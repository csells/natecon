import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import beanieIcon from '@/assets/beanie-icon.webp';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="section-padding min-h-[60vh] flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="mb-8 animate-float">
              <img
                src={beanieIcon}
                alt="NateCon beanie"
                className="w-24 h-24 mx-auto opacity-50"
              />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              This page wandered off.
            </h2>
            <p className="text-muted-foreground mb-8">
              Maybe it's preparing for the hackathon? Let's get you back on track.
            </p>
            
            <Link to="/">
              <Button className="glow-button">
                Let's get you home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
