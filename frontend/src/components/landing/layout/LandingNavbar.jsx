import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Integrations', href: '#integrations' },
  { label: 'Docs', href: '/docs', route: true },
];

export function LandingNavbar({ className }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'fixed top-0 z-50 w-full border-b border-purple-500/20 bg-brand-bg/80 backdrop-blur-md',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20 ring-1 ring-purple-500/30">
            <Activity className="h-5 w-5 text-brand-purple-light" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">WebPulse</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) =>
            link.route ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            asChild
            className="text-zinc-400 hover:bg-brand-card hover:text-white"
          >
            <Link to="/login">Login</Link>
          </Button>
          <Button
            asChild
            className="bg-brand-orange text-white shadow-lg shadow-purple-950/40 hover:bg-brand-orange-hover"
          >
            <Link to="/register">Start Free</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
