import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  MessageSquare,
  Settings,
  Activity,
  History,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/changes', icon: History, label: 'Change History' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar({ collapsed, onToggle, className }) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-purple-500/20 bg-brand-card transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-64',
        className
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-purple-500/20 px-4">
        <div className={cn('flex items-center gap-2 overflow-hidden', collapsed && 'justify-center w-full')}>
          <Activity className="h-6 w-6 shrink-0 text-brand-orange" />
          {!collapsed && <span className="text-lg font-bold tracking-tight truncate text-white">WebPulse</span>}
        </div>
        {!collapsed && (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 lg:hidden text-zinc-300 hover:bg-purple-500/20" onClick={onToggle}>
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-brand-orange/20 text-brand-orange'
                  : 'text-zinc-400 hover:bg-purple-500/20 hover:text-white'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <Separator className="mb-3 bg-purple-500/20" />
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          className={cn('w-full text-zinc-300 hover:bg-purple-500/20', collapsed && 'h-9 w-9')}
          onClick={onToggle}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4 mr-2" /> Collapse</>}
        </Button>
        {!collapsed && (
          <p className="mt-3 text-xs text-zinc-400">
            Intelligent Web Scraper &amp; AI Data Explorer
          </p>
        )}
      </div>
    </aside>
  );
}
