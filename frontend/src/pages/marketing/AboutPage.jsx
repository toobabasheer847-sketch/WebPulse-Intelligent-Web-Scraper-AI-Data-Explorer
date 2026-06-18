import { MarketingLayout } from '@/components/landing/layout/MarketingLayout';
import { MarketingPageHeader } from '@/components/landing/layout/MarketingPageHeader';
import { Target, Users, Zap } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Precision at scale',
    description: 'We help teams extract structured data from any website with reliability and accuracy.',
  },
  {
    icon: Zap,
    title: 'Automation first',
    description: 'Schedules, queues, and change detection — so your data pipeline runs without manual effort.',
  },
  {
    icon: Users,
    title: 'Built for teams',
    description: 'From solo founders to enterprise data teams, WebPulse adapts to how you work.',
  },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      <MarketingPageHeader
        title="About WebPulse"
        description="We're building the intelligent layer between the web and your data — scraping, monitoring, and AI exploration in one platform."
      />
      <div className="mx-auto mt-16 max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <p className="text-zinc-300 leading-relaxed">
            WebPulse was founded on a simple belief: the web is the world's largest database,
            but most teams still copy-paste data by hand. We combine visual scraping, scheduled
            monitoring, pgvector semantic search, and RAG-powered AI chat so you can turn any
            website into actionable intelligence.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {values.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
              <Icon className="mb-3 h-6 w-6 text-indigo-400" />
              <h3 className="font-semibold text-zinc-50">{title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
