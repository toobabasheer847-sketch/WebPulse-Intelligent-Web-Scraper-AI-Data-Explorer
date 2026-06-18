import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTABanner() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-brand-bg via-brand-card to-brand-bg px-8 py-16 text-center sm:px-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-orange/10 to-transparent" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              Ready to automate your data extraction?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
              Join teams who scrape smarter, detect changes faster, and chat with their data using AI.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 h-12 bg-brand-orange px-8 text-base shadow-lg shadow-brand-orange/30 transition-all duration-300 hover:scale-[1.02] hover:bg-brand-orange-hover"
            >
              <Link to="/register">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
