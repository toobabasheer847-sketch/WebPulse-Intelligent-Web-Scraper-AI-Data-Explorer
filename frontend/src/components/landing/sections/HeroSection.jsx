import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0B051D] to-[#1E0F3D]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-purple-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <Badge className="mb-6 border-purple-500/20 bg-brand-card/80 text-brand-purple-light hover:bg-brand-card">
            <Sparkles className="mr-1 h-3 w-3" />
            Intelligent Web Scraper &amp; AI Data Explorer
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            Turn Any Website into a Structured Database &amp;{' '}
            <span className="bg-gradient-to-r from-brand-orange to-orange-400 bg-clip-text text-transparent">
              Chat with Your Data
            </span>{' '}
            using AI
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
            WebPulse automatically scrapes any site, monitors changes in real time, and lets your team
            search, analyze, and ask questions with semantic AI — no code required.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 bg-brand-orange px-8 text-base shadow-lg shadow-purple-950/40 hover:bg-brand-orange-hover hover:shadow-purple-950/50"
            >
              <Link to="/register">
                Start Scraping for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
