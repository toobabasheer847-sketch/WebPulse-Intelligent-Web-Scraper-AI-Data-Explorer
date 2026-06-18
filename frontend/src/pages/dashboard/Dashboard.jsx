import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Database, History, Bell } from 'lucide-react';
import { DashboardWidgetCard } from '@/components/shared/DashboardWidgetCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardApi } from '@/lib/api';
import { formatRelative } from '@/lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardApi
      .stats()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardWidgetCard title="Total Projects" value={stats?.totalProjects ?? 0} icon={FolderKanban} loading={loading} />
        <DashboardWidgetCard title="Total Records" value={stats?.totalRecords ?? 0} icon={Database} loading={loading} />
        <DashboardWidgetCard title="Changes Detected" value={stats?.changeCount ?? 0} icon={History} loading={loading} />
        <DashboardWidgetCard title="Unread Notifications" value={stats?.unreadCount ?? 0} icon={Bell} loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest Scrapes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : (
              stats?.recentScrapes?.length ? (
                stats.recentScrapes.map((run) => (
                  <div key={run.id} className="flex items-center justify-between rounded-md border border-border p-3">
                    <div>
                      <p className="font-medium text-sm">{run.project_name}</p>
                      <p className="text-xs text-muted-foreground">{formatRelative(run.created_at)}</p>
                    </div>
                    <Badge variant={run.status === 'completed' ? 'success' : run.status === 'failed' ? 'destructive' : 'warning'}>
                      {run.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No scrapes yet. Create a project to get started.</p>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : (
              stats?.notifications?.length ? (
                stats.notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className={`rounded-md border border-border p-3 ${!n.read ? 'bg-primary/5' : ''}`}>
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              )
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {stats?.projects?.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="rounded-md border border-border p-4 hover:bg-accent/50 transition-colors"
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">{p.website_url}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{p.scraper_type}</Badge>
                    {p.schedule !== 'none' && <Badge variant="outline">{p.schedule}</Badge>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
