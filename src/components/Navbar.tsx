import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import beanieIcon from '@/assets/beanie-icon.webp';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/speakers', label: 'Speakers' },
  { href: '/teams', label: 'Teams' },
  { href: '/faq', label: 'FAQ' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [siteMode, setSiteMode] = useState<string>('pre-registration');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const fetchSiteMode = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'site_mode')
          .single();

        if (!error && data) {
          const mode = JSON.parse(JSON.stringify(data.value));
          setSiteMode(mode);
        }
      } catch (error) {
        console.error('Error fetching site mode:', error);
      }
    };

    fetchSiteMode();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={beanieIcon}
              alt="NateCon beanie logo"
              className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-110"
            />
            <span className="font-bold text-lg md:text-xl text-foreground">
              NateCon <span className="text-primary">2026</span>
            </span>
          </Link>

          {siteMode !== 'delayed' && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {siteMode !== 'delayed' && (
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Button variant="outline" size="icon" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth?mode=login">
                    <Button variant="ghost">Log In</Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="glow-button">Create Account</Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {siteMode !== 'delayed' && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>

        {isOpen && siteMode !== 'delayed' && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-4 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-secondary/50 rounded-lg ${
                    location.pathname === link.href
                      ? 'text-primary bg-secondary/30'
                      : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-4 pt-4">
                {user ? (
                  <div className="flex gap-2">
                    <Link to="/dashboard" className="flex-1">
                      <Button className="w-full" variant="outline">Dashboard</Button>
                    </Link>
                    <Button variant="outline" size="icon" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/auth?mode=login">
                      <Button className="w-full" variant="outline">Log In</Button>
                    </Link>
                    <Link to="/auth">
                      <Button className="w-full glow-button">Create Account</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
