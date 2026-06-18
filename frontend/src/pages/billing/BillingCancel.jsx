import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/landing/layout/MarketingLayout';

export default function BillingCancel() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-lg px-4 text-center">
        <XCircle className="mx-auto h-16 w-16 text-zinc-500" />
        <h1 className="mt-6 text-3xl font-bold text-zinc-50">Checkout canceled</h1>
        <p className="mt-4 text-zinc-400">
          No charges were made. You can upgrade to Pro anytime from the pricing page
          or your account settings.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-500">
            <Link to="/#pricing">View Pricing</Link>
          </Button>
          <Button asChild variant="outline" className="border-zinc-700">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </MarketingLayout>
  );
}
