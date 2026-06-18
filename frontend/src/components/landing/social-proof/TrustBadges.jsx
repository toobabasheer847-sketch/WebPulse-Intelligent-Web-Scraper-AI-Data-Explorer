import { motion } from 'framer-motion';
import { brandLogos, BrandLogo } from './BrandLogos';

export function TrustBadges() {
  return (
    <section className="border-y border-zinc-800 bg-zinc-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-zinc-500"
        >
          Trusted by data teams at modern companies
        </motion.p>

        <div className="grid grid-cols-2 items-center justify-items-center gap-8 md:flex md:flex-wrap md:justify-center md:gap-12 lg:gap-16">
          {brandLogos.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-center px-2"
            >
              <BrandLogo name={brand.name} src={brand.src} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
