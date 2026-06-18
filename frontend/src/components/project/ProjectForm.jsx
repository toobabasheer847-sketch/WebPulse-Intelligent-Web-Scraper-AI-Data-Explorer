import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModalWrapper } from '@/components/shared/ModalWrapper';

export function ProjectForm({ open, onOpenChange, onSubmit, initialData, title = 'Create Project' }) {
  const [form, setForm] = useState({
    name: '',
    websiteUrl: '',
    scraperType: 'auto',
    schedule: 'none',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || '',
        websiteUrl: initialData?.website_url || '',
        scraperType: initialData?.scraper_type || 'auto',
        schedule: initialData?.schedule || 'none',
      });
      setError(null);
    }
  }, [open, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to save project';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Configure your scraping project settings."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website-url">Website URL</Label>
          <Input
            id="website-url"
            type="url"
            placeholder="https://example.com"
            value={form.websiteUrl}
            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Scraper Type</Label>
          <Select value={form.scraperType} onValueChange={(v) => setForm({ ...form, scraperType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="cheerio">Cheerio (Static HTML)</SelectItem>
              <SelectItem value="puppeteer">Puppeteer (JS-rendered)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Schedule</Label>
          <Select value={form.schedule} onValueChange={(v) => setForm({ ...form, schedule: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Manual only</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
            {error.includes('upgrade') && (
              <p className="mt-1">
                <a href="/#pricing" className="underline font-medium">
                  View Pro plans
                </a>
              </p>
            )}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Project
          </Button>
        </DialogFooter>
      </form>
    </ModalWrapper>
  );
}
