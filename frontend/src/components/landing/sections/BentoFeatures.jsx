import { motion } from 'framer-motion';
import {
  MousePointerClick,
  CalendarClock,
  Search,
  FileJson,
  FileSpreadsheet,
  Webhook,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const schedules = ['Hourly', 'Daily', 'Weekly'];

const searchResults = [
  { query: 'cheap laptop', match: 'Budget Notebook Pro 14"' },
  { query: 'affordable ultrabook', match: 'SlimBook Air — $699' },
];

export function BentoFeatures() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-brand-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to own your web data
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            From visual scraping to AI-powered insights — WebPulse is the complete data extraction stack.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Visual Scraper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group rounded-2xl border border-purple-500/20 bg-brand-card/80 p-6 transition-all duration-300 hover:scale-[1.01] hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-950/40 lg:col-span-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <MousePointerClick className="h-5 w-5 text-brand-purple-light" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">Visual Web Scraper</h3>
            <p className="mt-2 text-zinc-400">
              Point-and-click CSS selector detection with auto-render mode. Cheerio for static sites,
              Puppeteer for JavaScript-heavy SPAs — chosen automatically.
            </p>
            <div className="mt-6 rounded-xl border border-purple-500/20 bg-brand-card p-4 font-mono text-xs text-zinc-400">
              <span className="text-brand-purple-light">.product-card</span> → title, price, image, link
            </div>
          </motion.div>

          {/* Scheduler */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group rounded-2xl border border-purple-500/20 bg-brand-card/80 p-6 transition-all duration-300 hover:scale-[1.01] hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-950/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <CalendarClock className="h-5 w-5 text-brand-purple-light" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">Smart Scheduler</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Set it once. WebPulse runs on your cadence via BullMQ job queues.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {schedules.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300',
                    i === 1
                      ? 'border-brand-orange/50 bg-brand-orange/20 text-brand-orange'
                      : 'border-purple-500/20 bg-brand-card text-zinc-400 hover:border-purple-400/30'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Semantic Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="group rounded-2xl border border-purple-500/20 bg-brand-card/80 p-6 transition-all duration-300 hover:scale-[1.01] hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-950/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Search className="h-5 w-5 text-brand-purple-light" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">pgvector Semantic Search</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Embeddings find meaning, not just keywords. Ask naturally — get relevant rows instantly.
            </p>
            <div className="mt-6 space-y-2">
              {searchResults.map((r) => (
                <div key={r.query} className="rounded-lg border border-purple-500/20 bg-brand-card p-3">
                  <p className="text-xs text-zinc-500">&quot;{r.query}&quot;</p>
                  <p className="mt-1 text-sm text-brand-purple-light">→ {r.match}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Export */}
          <motion.div
            id="integrations"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group rounded-2xl border border-purple-500/20 bg-brand-card/80 p-6 transition-all duration-300 hover:scale-[1.01] hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-950/40 lg:col-span-2"
          >
            <h3 className="text-xl font-semibold text-white">Export &amp; Integrations</h3>
            <p className="mt-2 text-zinc-400">
              Ship scraped data anywhere your stack lives. One-click exports or automated webhook delivery
              on every scrape run.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge className="gap-1.5 border-purple-500/20 bg-brand-card px-4 py-2 text-white hover:bg-brand-card">
                <FileJson className="h-4 w-4 text-brand-purple-light" />
                JSON
              </Badge>
              <Badge className="gap-1.5 border-purple-500/20 bg-brand-card px-4 py-2 text-white hover:bg-brand-card">
                <FileSpreadsheet className="h-4 w-4 text-brand-purple-light" />
                CSV
              </Badge>
              <Badge className="gap-1.5 border-purple-500/20 bg-brand-card px-4 py-2 text-white hover:bg-brand-card">
                <Webhook className="h-4 w-4 text-brand-purple-light" />
                Webhooks
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
