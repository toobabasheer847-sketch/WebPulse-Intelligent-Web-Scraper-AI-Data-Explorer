import { cn } from '@/lib/utils';

const LOGO_COLOR = '71717a';

export const brandLogos = [
  { id: 'shopify', name: 'Shopify', src: `https://cdn.simpleicons.org/shopify/${LOGO_COLOR}` },
  { id: 'stripe', name: 'Stripe', src: `https://cdn.simpleicons.org/stripe/${LOGO_COLOR}` },
  { id: 'notion', name: 'Notion', src: `https://cdn.simpleicons.org/notion/${LOGO_COLOR}` },
  { id: 'airtable', name: 'Airtable', src: `https://cdn.simpleicons.org/airtable/${LOGO_COLOR}` },
  { id: 'hubspot', name: 'HubSpot', src: `https://cdn.simpleicons.org/hubspot/${LOGO_COLOR}` },
  { id: 'zapier', name: 'Zapier', src: `https://cdn.simpleicons.org/zapier/${LOGO_COLOR}` },
];

export function BrandLogo({ name, src, className }) {
  return (
    <img
      src={src}
      alt={`${name} logo`}
      loading="lazy"
      decoding="async"
      className={cn(
        'h-8 w-auto object-contain opacity-60 brightness-125 filter grayscale transition-opacity duration-300 hover:opacity-100',
        className
      )}
    />
  );
}
