import { MarketingLayout } from '@/components/landing/layout/MarketingLayout';
import { MarketingPageHeader } from '@/components/landing/layout/MarketingPageHeader';
import { CheckCircle2, Activity } from 'lucide-react';

const services = [
  { name: 'Web Application', status: 'operational', uptime: '99.98%' },
  { name: 'REST API', status: 'operational', uptime: '99.95%' },
  { name: 'Scrape Workers (BullMQ)', status: 'operational', uptime: '99.90%' },
  { name: 'AI Chat & Embeddings', status: 'operational', uptime: '99.85%' },
  { name: 'PostgreSQL Database', status: 'operational', uptime: '99.99%' },
  { name: 'Redis Queue', status: 'operational', uptime: '99.97%' },
];

export default function StatusPage() {
  return (
    <MarketingLayout>
      <MarketingPageHeader
        title="System Status"
        description="Current operational status of WebPulse services."
      />
      <div className="mx-auto mt-16 max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          <div>
            <p className="text-lg font-semibold text-emerald-400">All Systems Operational</p>
            <p className="text-sm text-zinc-400">Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-4"
            >
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-50">{service.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-zinc-500">{service.uptime} uptime</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Operational
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
