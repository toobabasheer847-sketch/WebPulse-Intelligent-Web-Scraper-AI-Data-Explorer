import { LandingNavbar } from './LandingNavbar';
import { LandingFooter } from './LandingFooter';

export function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen bg-brand-bg text-zinc-50 antialiased">
      <LandingNavbar />
      <main className="pt-24 pb-16">{children}</main>
      <LandingFooter />
    </div>
  );
}
