import { useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  analytics: 'Analytics',
  changes: 'Change History',
  chat: 'AI Chat',
  settings: 'Settings',
};

function buildBreadcrumbs(pathname, params) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Home', href: '/dashboard' }];

  if (segments[0] === 'projects') {
    crumbs.push({ label: 'Projects', href: '/projects' });
    if (params.id) {
      crumbs.push({ label: 'Project Details' });
    }
  } else if (segments[0]) {
    crumbs.push({ label: PAGE_TITLES[segments[0]] || segments[0] });
  }

  return crumbs;
}

export function DashboardLayout() {
  const location = useLocation();
  const params = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const segment = location.pathname.split('/')[1];
  const title = PAGE_TITLES[segment] || (params.id ? 'Project Details' : 'WebPulse');
  const breadcrumbs = buildBreadcrumbs(location.pathname, params);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      {/* Desktop sidebar */}
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        className="hidden lg:flex"
      />

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-brand-card border-purple-500/20">
          <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title={title}
          breadcrumbs={breadcrumbs}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className={cn('flex-1 overflow-auto p-4 sm:p-6')}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
