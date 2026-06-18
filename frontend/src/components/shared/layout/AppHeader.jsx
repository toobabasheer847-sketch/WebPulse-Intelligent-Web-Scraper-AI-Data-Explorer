import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Settings, User, Menu, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { NotificationPopover } from '../NotificationPopover';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { billingApi } from '@/lib/api';

export function AppHeader({ title, breadcrumbs = [], onMenuClick, className }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead } =
    useNotificationStore();
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const handleManageSubscription = async () => {
    if (!user?.stripe_customer_id) {
      navigate('/settings');
      return;
    }
    setPortalLoading(true);
    try {
      const { data } = await billingApi.createPortalSession();
      window.location.href = data.url;
    } catch {
      navigate('/settings');
      setPortalLoading(false);
    }
  };

  const isPro =
    user?.subscription_plan === 'pro' && ['active', 'trialing'].includes(user?.subscription_status);

  return (
    <header className={cn('flex h-16 items-center justify-between border-b border-purple-500/20 bg-brand-card/70 px-4 backdrop-blur sm:px-6 text-white', className)}>
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="icon" className="lg:hidden shrink-0 text-zinc-300 hover:bg-purple-500/20" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold truncate sm:text-xl text-white">{title}</h1>
          {breadcrumbs.length > 0 && (
            <Breadcrumb className="hidden sm:block mt-0.5">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="contents">
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.href} className="text-zinc-400 hover:text-white">{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="text-zinc-400">{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </span>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <NotificationPopover
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2 text-zinc-300 hover:bg-purple-500/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange/20">
                <User className="h-4 w-4 text-brand-orange" />
              </div>
              <span className="hidden text-sm sm:inline">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-brand-card border-purple-500/20">
            <DropdownMenuLabel>
              <div className="flex flex-col text-white">
                <span>{user?.name}</span>
                <span className="text-xs font-normal text-zinc-400">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-purple-500/20" />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="text-zinc-300 hover:text-white hover:bg-purple-500/20">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            {(isPro || user?.stripe_customer_id) && (
              <DropdownMenuItem onClick={handleManageSubscription} disabled={portalLoading} className="text-zinc-300 hover:text-white hover:bg-purple-500/20">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </DropdownMenuItem>
            )}
            {!isPro && (
              <DropdownMenuItem asChild>
                <Link to="/#pricing" className="text-zinc-300 hover:text-white hover:bg-purple-500/20">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-purple-500/20" />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
