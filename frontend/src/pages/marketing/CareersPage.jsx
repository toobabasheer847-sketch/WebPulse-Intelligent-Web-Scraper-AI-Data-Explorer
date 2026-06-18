import { MarketingLayout } from '@/components/landing/layout/MarketingLayout';
import { MarketingPageHeader } from '@/components/landing/layout/MarketingPageHeader';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase } from 'lucide-react';

const openings = [
  { role: 'Senior Full-Stack Engineer', team: 'Engineering', location: 'Remote' },
  { role: 'Developer Advocate', team: 'Developer Relations', location: 'Remote / SF' },
  { role: 'Product Designer', team: 'Design', location: 'Remote' },
];

export default function CareersPage() {
  return (
    <MarketingLayout>
      <MarketingPageHeader
        title="Careers"
        description="Join us in making web data accessible, intelligent, and actionable for every team."
      />
      <div className="mx-auto mt-16 max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
          <p className="text-zinc-300">
            We're a small, ambitious team solving hard problems at the intersection of
            scraping, data engineering, and AI. If that excites you, we'd love to hear from you.
          </p>
        </div>
        <div className="space-y-4">
          {openings.map((job) => (
            <div
              key={job.role}
              className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold text-zinc-50">{job.role}</h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.team}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                </div>
              </div>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-500 shrink-0">
                <a href="mailto:careers@webpulse.app?subject=Application">Apply</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
