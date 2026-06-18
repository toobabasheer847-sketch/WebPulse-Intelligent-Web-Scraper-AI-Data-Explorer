import { Link } from 'react-router-dom';
import { MarketingLayout } from '@/components/landing/layout/MarketingLayout';
import { MarketingPageHeader } from '@/components/landing/layout/MarketingPageHeader';
import { Badge } from '@/components/ui/badge';

const posts = [
  {
    title: 'Introducing WebPulse: Scrape, Monitor, and Chat with Your Data',
    excerpt: 'How we built an end-to-end pipeline from Cheerio and Puppeteer to pgvector RAG.',
    date: 'Mar 15, 2026',
    tag: 'Product',
  },
  {
    title: 'Change Detection 101: Never Miss a Price Drop Again',
    excerpt: 'A deep dive into diffing scrape runs and alerting your team in real time.',
    date: 'Mar 8, 2026',
    tag: 'Guides',
  },
  {
    title: 'Static vs. JavaScript-Rendered Sites: Choosing the Right Scraper',
    excerpt: 'When to use Cheerio, when to reach for Puppeteer, and how auto-detect helps.',
    date: 'Feb 28, 2026',
    tag: 'Engineering',
  },
];

export default function BlogPage() {
  return (
    <MarketingLayout>
      <MarketingPageHeader
        title="Blog"
        description="Product updates, engineering insights, and guides for modern data extraction."
      />
      <div className="mx-auto mt-16 max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
        {posts.map((post) => (
          <article
            key={post.title}
            className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition-colors hover:border-zinc-700"
          >
            <div className="flex items-center gap-3">
              <Badge className="border-zinc-700 bg-zinc-800 text-indigo-400 hover:bg-zinc-800">
                {post.tag}
              </Badge>
              <span className="text-xs text-zinc-500">{post.date}</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-zinc-50 group-hover:text-indigo-400 transition-colors">
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">{post.excerpt}</p>
          </article>
        ))}
        <p className="text-center text-sm text-zinc-500">
          More articles coming soon.{' '}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Get started with WebPulse
          </Link>
        </p>
      </div>
    </MarketingLayout>
  );
}
