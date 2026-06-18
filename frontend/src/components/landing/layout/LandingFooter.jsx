import { Link } from 'react-router-dom';
import { Activity, Github, Twitter, Linkedin } from 'lucide-react';

const linkClass =
  'text-sm text-zinc-400 transition-colors duration-200 hover:text-brand-purple-light';

const footerLinks = {
  Product: [
    { label: 'Features', to: '/#features', external: false, hash: true },
    { label: 'Integrations', to: '/#integrations', external: false, hash: true },
    { label: 'Changelog', to: '/blog', external: false },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Careers', to: '/careers' },
    { label: 'Contact', to: '/contact' },
  ],
  Resources: [
    { label: 'Documentation', to: '/docs' },
    { label: 'API Reference', to: '/api-docs' },
    { label: 'Status', to: '/status' },
    { label: 'Privacy Policy', to: '/privacy' },
  ],
};

const social = [
  { icon: Twitter, href: 'https://x.com/webpulse', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/webpulse', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/webpulse', label: 'LinkedIn' },
];

function FooterLink({ link }) {
  if (link.hash) {
    return (
      <a href={link.to} className={linkClass}>
        {link.label}
      </a>
    );
  }

  return (
    <Link to={link.to} className={linkClass}>
      {link.label}
    </Link>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-purple-500/20 bg-brand-bg pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-brand-purple-light" />
              <span className="text-lg font-bold text-white">WebPulse</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-zinc-400">
              Intelligent web scraping, change detection, and AI-powered data exploration for modern teams.
            </p>
            <div className="mt-6 flex gap-4">
              {social.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-zinc-500 transition-colors duration-200 hover:text-brand-purple-light"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-zinc-50">{category}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-zinc-800 pt-8 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} WebPulse. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
