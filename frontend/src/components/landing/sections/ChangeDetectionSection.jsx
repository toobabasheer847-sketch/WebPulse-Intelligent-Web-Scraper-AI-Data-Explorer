import { motion } from 'framer-motion';
import { TrendingDown, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ChangeDetectionSection() {
  return (
    <section className="border-y border-zinc-800 bg-zinc-900/20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
              <Bell className="mr-1 h-3 w-3" />
              Change Detection
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              Never miss a price drop, stock change, or content update
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              WebPulse diffs every scrape run automatically. Additions, removals, and field-level updates
              are logged with timestamps — and you get notified the moment something changes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition-all duration-300 hover:scale-[1.01] hover:border-zinc-700">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Previous Scrape · 2h ago</p>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between border-b border-zinc-800 pb-3">
                  <span className="text-zinc-400">Aurora Pro Laptop</span>
                  <span className="text-red-400 line-through">$999</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-3">
                  <span className="text-zinc-400">Stock Status</span>
                  <span className="text-zinc-500">Limited</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Warranty</span>
                  <span className="text-zinc-500">1 Year</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">Latest Scrape · Just now</p>
                <Badge className="border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  15% Price Drop Detected!
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between border-b border-zinc-800 pb-3">
                  <span className="text-zinc-50">Aurora Pro Laptop</span>
                  <span className="text-xl font-bold text-emerald-400">$849</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-3">
                  <span className="text-zinc-50">Stock Status</span>
                  <span className="font-medium text-emerald-400">In Stock</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-50">Warranty</span>
                  <span className="font-medium text-emerald-400">2 Years</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
