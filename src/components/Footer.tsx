import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import beanieIcon from '@/assets/beanie-icon.webp';

const footerLinks = {
  event: [
    { href: '/schedule', label: 'Schedule' },
    { href: '/speakers', label: 'Speakers' },
    { href: '/teams', label: 'Teams' },
    { href: '/faq', label: 'FAQ' },
  ],
  legal: [
    { href: '/code-of-conduct', label: 'Code of Conduct' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
  connect: [
    { href: '/contact', label: 'Contact Us' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src={beanieIcon}
                alt="NateCon beanie logo"
                className="w-8 h-8"
              />
              <span className="font-bold text-lg text-foreground">
                NateCon <span className="text-primary">2026</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              A community conference for Nate's Substack readers.
              <br />
              March 14-15, 2026 • San Francisco
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/natebentleyjone"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Follow Nate on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/natebentleyjones/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Connect with Nate on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:csells@sellsbrothers.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Send email to organizers"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Event Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Event</h3>
            <ul className="space-y-2">
              {footerLinks.event.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
            <ul className="space-y-2">
              {footerLinks.connect.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://natesnewsletter.substack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Nate's Newsletter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Venue Credit & Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Venue generously provided by{' '}
              <a
                href="https://newrelic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                New Relic
              </a>
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-primary" /> for the Nate community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
