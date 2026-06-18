import { MarketingLayout } from '@/components/landing/layout/MarketingLayout';
import { MarketingPageHeader } from '@/components/landing/layout/MarketingPageHeader';

const sections = [
  {
    title: 'Information We Collect',
    content:
      'We collect account information (name, email), usage data (scrape runs, project configurations), and technical logs necessary to operate the service. Scraped data is stored on your behalf and isolated per account.',
  },
  {
    title: 'How We Use Your Data',
    content:
      'Your data is used to provide scraping, change detection, and AI chat features. We do not sell personal information. AI features may send scraped content to third-party LLM providers (e.g., OpenAI) solely to answer your queries.',
  },
  {
    title: 'Data Security',
    content:
      'We use JWT authentication, tenant-based data isolation, encrypted connections, and industry-standard password hashing (bcrypt). Each user can only access their own projects and scraped data.',
  },
  {
    title: 'Data Retention',
    content:
      'Account data is retained while your account is active. You may delete projects and associated scrape data at any time. Upon account deletion, all associated data is permanently removed.',
  },
  {
    title: 'Your Rights',
    content:
      'You may request access, correction, or deletion of your personal data by contacting privacy@webpulse.app. EU and UK residents have additional rights under GDPR.',
  },
  {
    title: 'Contact',
    content:
      'For privacy-related inquiries, email privacy@webpulse.app or write to WebPulse, Privacy Team.',
  },
];

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <MarketingPageHeader
        title="Privacy Policy"
        description={`Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
      />
      <div className="mx-auto mt-16 max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-zinc-400">
          WebPulse (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
          This policy describes how we collect, use, and safeguard your information.
        </p>
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-zinc-50">{section.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{section.content}</p>
          </section>
        ))}
      </div>
    </MarketingLayout>
  );
}
