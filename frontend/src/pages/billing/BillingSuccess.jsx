import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/landing/layout/MarketingLayout';
import { useAuthStore } from '@/stores/authStore';
import { billingApi } from '@/lib/api';

export default function BillingSuccess() {
  const navigate = useNavigate();
  const { fetchMe, user } = useAuthStore();

  useEffect(() => {
    const checkAndRedirect = async () => {
      await fetchMe();
      
      // If user is now active and doesn't have 2FA enabled, redirect to setup 2FA
      if (user?.subscription_status === 'active' && !user?.is_two_factor_enabled) {
        navigate('/onboarding/setup-2fa');
      } else if (user?.subscription_status === 'active' && user?.is_two_factor_enabled) {
        navigate('/dashboard');
      }
    };

    checkAndRedirect();

    // Webhook may take a moment — refresh subscription status a few times
    const interval = setInterval(async () => {
      await fetchMe();
      try {
        await billingApi.getSubscription();
        checkAndRedirect();
      } catch {
        /* ignore */
      }
    }, 2000);

    const timeout = setTimeout(() => clearInterval(interval), 12000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [fetchMe, user, navigate]);

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-lg px-4 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
        <h1 className="mt-6 text-3xl font-bold text-zinc-50">Welcome to Pro!</h1>
        <p className="mt-4 text-zinc-400">
          Your subscription is being activated. You now have unlimited projects and
          50,000 records per month. It may take a few seconds for your account to update.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-500">
            <Link to="/onboarding/setup-2fa">Continue to Account Setup</Link>
          </Button>
          <Button asChild variant="outline" className="border-zinc-700">
            <Link to="/settings">Manage Subscription</Link>
          </Button>
        </div>
      </div>
    </MarketingLayout>
  );
}
