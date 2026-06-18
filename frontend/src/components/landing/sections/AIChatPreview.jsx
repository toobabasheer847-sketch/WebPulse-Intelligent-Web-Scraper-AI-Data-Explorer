import { motion } from 'framer-motion';
import { Bot, User, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const tableData = [
  { product: 'Aurora Pro 15"', price: '$849', change: '-15%' },
  { product: 'SlimBook Air', price: '$699', change: '-8%' },
  { product: 'NovaTab 11"', price: '$449', change: '-12%' },
  { product: 'PixelPhone X', price: '$999', change: '0%' },
];

export function AIChatPreview() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge className="mb-4 border-brand-orange/30 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/10">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Data Chat
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Ask questions. Get answers from your scraped data.
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            RAG-powered chat with pgvector semantic search. No SQL, no spreadsheets — just natural language.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-16 overflow-hidden rounded-2xl border border-purple-500/20 bg-brand-card/50 shadow-2xl transition-all duration-300 hover:border-purple-500/40"
        >
          <div className="grid lg:grid-cols-2">
            <div className="border-b border-purple-500/20 p-6 lg:border-b-0 lg:border-r">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500">Scraped Products</p>
              <div className="overflow-hidden rounded-xl border border-purple-500/20">
                <table className="w-full text-sm">
                  <thead className="bg-brand-bg text-left text-xs text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/20">
                    {tableData.map((row) => (
                      <tr key={row.product} className="bg-brand-card/30">
                        <td className="px-4 py-3 text-zinc-50">{row.product}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.price}</td>
                        <td className={`px-4 py-3 font-medium ${row.change.startsWith('-') ? 'text-brand-green' : 'text-zinc-500'}`}>
                          {row.change}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col bg-brand-bg p-6">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500">WebPulse AI</p>
              <div className="flex flex-1 flex-col gap-4">
                <div className="flex justify-end gap-3">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-orange px-4 py-3 text-sm text-white">
                    What was the average price change today?
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-card">
                    <User className="h-4 w-4 text-zinc-400" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/20">
                    <Bot className="h-4 w-4 text-brand-orange" />
                  </div>
                  <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-purple-500/20 bg-brand-card px-4 py-3 text-sm text-zinc-300">
                    <p className="mb-2 text-zinc-50">Here&apos;s today&apos;s price summary across 4 tracked products:</p>
                    <ul className="list-inside list-disc space-y-1 text-zinc-400">
                      <li>
                        <span className="text-brand-green">Average decline: 11.7%</span> across 3 products
                      </li>
                      <li>Largest drop: Aurora Pro 15&quot; at <span className="text-brand-green">-15%</span> ($999 → $849)</li>
                      <li>SlimBook Air down <span className="text-brand-green">8%</span>, NovaTab 11&quot; down <span className="text-brand-green">12%</span></li>
                      <li>PixelPhone X unchanged at $999</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
