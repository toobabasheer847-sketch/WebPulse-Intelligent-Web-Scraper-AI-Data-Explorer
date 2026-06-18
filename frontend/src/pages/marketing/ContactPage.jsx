import { useState } from 'react';
import { MarketingLayout } from '@/components/landing/layout/MarketingLayout';
import { MarketingPageHeader } from '@/components/landing/layout/MarketingPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <MarketingLayout>
      <MarketingPageHeader
        title="Contact Us"
        description="Questions about WebPulse, enterprise plans, or partnerships? We're here to help."
      />
      <div className="mx-auto mt-16 grid max-w-5xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <Mail className="mb-3 h-6 w-6 text-indigo-400" />
            <h3 className="font-semibold text-zinc-50">Email</h3>
            <p className="mt-1 text-sm text-zinc-400">hello@webpulse.app</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <MessageSquare className="mb-3 h-6 w-6 text-indigo-400" />
            <h3 className="font-semibold text-zinc-50">Sales & Enterprise</h3>
            <p className="mt-1 text-sm text-zinc-400">sales@webpulse.app</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-400" />
              <h3 className="text-lg font-semibold text-zinc-50">Message sent!</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Thanks for reaching out. We'll get back to you within 1–2 business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-zinc-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-zinc-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-zinc-300">Subject</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-zinc-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-zinc-300">Message</Label>
                <textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="flex w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </MarketingLayout>
  );
}
