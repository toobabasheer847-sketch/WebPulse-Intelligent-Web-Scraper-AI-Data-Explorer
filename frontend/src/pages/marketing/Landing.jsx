import { LandingNavbar } from '@/components/landing/layout/LandingNavbar';
import { HeroSection } from '@/components/landing/sections/HeroSection';
import { TrustBadges } from '@/components/landing/social-proof/TrustBadges';
import { BentoFeatures } from '@/components/landing/sections/BentoFeatures';
import { ChangeDetectionSection } from '@/components/landing/sections/ChangeDetectionSection';
import { AIChatPreview } from '@/components/landing/sections/AIChatPreview';
import { CTABanner } from '@/components/landing/sections/CTABanner';
import { LandingFooter } from '@/components/landing/layout/LandingFooter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-brand-bg text-zinc-50 antialiased">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustBadges />
        <BentoFeatures />
        <ChangeDetectionSection />
        <AIChatPreview />
        <CTABanner />
      </main>
      <LandingFooter />
    </div>
  );
}
