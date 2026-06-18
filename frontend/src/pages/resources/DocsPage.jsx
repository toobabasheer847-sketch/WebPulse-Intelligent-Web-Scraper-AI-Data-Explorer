import { Link } from 'react-router-dom';
import { MarketingLayout } from '@/components/landing/layout/MarketingLayout';
import { MarketingPageHeader } from '@/components/landing/layout/MarketingPageHeader';
import { BookOpen, Rocket, Database, Bot } from 'lucide-react';

const sections = [
  {
    icon: Rocket,
    title: 'Quick Start',
    description: 'Create an account, add your first project, and run a scrape in under 5 minutes.',
    href: '/register',
  },
  {
    icon: Database,
    title: 'Scraping Guide',
    description: 'Learn Cheerio vs Puppeteer, CSS selectors, schedules, and export options.',
    href: '/docs',
  },
  {
    icon: Bot,
    title: 'AI Data Chat',
    description: 'Ask questions about scraped data using RAG and pgvector semantic search.',
    href: '/docs',
  },
  {
    icon: BookOpen,
    title: 'API Reference',
    description: 'Full REST API documentation for projects, scrapes, and webhooks.',
    href: '/api-docs',
  },
];

export default function DocsPage() {
  return (
    <MarketingLayout>
      <MarketingPageHeader
        title="Documentation"
        description="Everything you need to scrape, monitor, and explore web data with WebPulse."
      />
      <div className="mx-auto mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {sections.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              to={href}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition-colors hover:border-indigo-500/40 hover:bg-zinc-900/60"
            >
              <Icon className="mb-3 h-6 w-6 text-indigo-400" />
              <h3 className="font-semibold text-zinc-50 group-hover:text-indigo-400 transition-colors">
                {title}
              </h3>
              <p className="mt-2 text-sm text-zinc-400">{description}</p>
            </Link>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
          <h3 className="text-lg font-semibold text-zinc-50">Installation</h3>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-400">
{`# Clone and start locally
git clone https://github.com/webpulse/webpulse.git
cd webpulse
docker compose up -d
npm run install:all
npm run migrate
npm run dev:backend   # API on :3001
npm run dev:frontend  # UI on :5173`}
          </pre>
        </div>
      </div>
    </MarketingLayout>
  );
}
