import { MarketingLayout } from '@/components/landing/layout/MarketingLayout';
import { MarketingPageHeader } from '@/components/landing/layout/MarketingPageHeader';
import { Badge } from '@/components/ui/badge';

const endpoints = [
  { method: 'POST', path: '/api/auth/register', description: 'Create a new user account' },
  { method: 'POST', path: '/api/auth/login', description: 'Authenticate and receive JWT token' },
  { method: 'GET', path: '/api/projects', description: 'List all projects for the authenticated user' },
  { method: 'POST', path: '/api/projects', description: 'Create a new scraping project' },
  { method: 'POST', path: '/api/projects/:id/scrape', description: 'Queue a manual scrape job' },
  { method: 'GET', path: '/api/projects/:id/data', description: 'Retrieve scraped data records' },
  { method: 'GET', path: '/api/projects/:id/changes', description: 'Get change detection logs' },
  { method: 'POST', path: '/api/projects/:id/chat', description: 'Stream AI chat response (SSE)' },
  { method: 'GET', path: '/api/dashboard/stats', description: 'Dashboard statistics and notifications' },
];

const methodColor = {
  GET: 'bg-emerald-500/20 text-emerald-400',
  POST: 'bg-indigo-500/20 text-indigo-400',
  PUT: 'bg-amber-500/20 text-amber-400',
  DELETE: 'bg-red-500/20 text-red-400',
};

export default function ApiDocsPage() {
  return (
    <MarketingLayout>
      <MarketingPageHeader
        title="API Reference"
        description="REST API for WebPulse. Base URL: http://localhost:3001/api"
      />
      <div className="mx-auto mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="font-semibold text-zinc-50">Authentication</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Include your JWT token in the Authorization header for protected endpoints:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-400">
            Authorization: Bearer &lt;your_jwt_token&gt;
          </pre>
        </div>
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <div
              key={ep.path + ep.method}
              className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <Badge className={`w-fit shrink-0 font-mono ${methodColor[ep.method]}`}>
                {ep.method}
              </Badge>
              <code className="text-sm text-indigo-300">{ep.path}</code>
              <span className="text-sm text-zinc-400 sm:ml-auto">{ep.description}</span>
            </div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
