import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Download, ArrowLeft, Pencil, Trash2, Send, Loader2, Webhook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectForm } from '@/components/project/ProjectForm';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { useProjectStore } from '@/stores/projectStore';
import { projectsApi, webhooksApi, downloadBlob } from '@/lib/api';
import { formatDate } from '@/lib/utils';

// ─── Toast (inline, no extra dep) ────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
}

function Toast({ toast }) {
  if (!toast) return null;
  const color = toast.type === 'error' ? 'bg-red-500/90' : 'bg-green-600/90';
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl backdrop-blur ${color}`}>
      {toast.message}
    </div>
  );
}

// ─── Integrations Tab ─────────────────────────────────────────────────────────
function IntegrationsTab({ projectId }) {
  const [webhooks, setWebhooks]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [platform, setPlatform]         = useState('slack');
  const [url, setUrl]                   = useState('');
  const [adding, setAdding]             = useState(false);
  const [addError, setAddError]         = useState(null);
  const [deletingId, setDeletingId]     = useState(null);
  const [testingId, setTestingId]       = useState(null);
  const { toast, show: showToast }      = useToast();

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await webhooksApi.list(projectId);
      setWebhooks(data.webhooks || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError(null);
    setAdding(true);
    try {
      await webhooksApi.create(projectId, { platform, url: url.trim() });
      setUrl('');
      setPlatform('slack');
      await fetchWebhooks();
      showToast('Webhook added successfully!');
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to add webhook.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (webhookId) => {
    setDeletingId(webhookId);
    try {
      await webhooksApi.remove(projectId, webhookId);
      setWebhooks((prev) => prev.filter((w) => w.id !== webhookId));
      showToast('Webhook removed.');
    } catch {
      showToast('Failed to remove webhook.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTest = async (webhookId) => {
    setTestingId(webhookId);
    try {
      await webhooksApi.test(projectId, webhookId);
      showToast('Test webhook sent successfully!');
    } catch (err) {
      showToast(
        err.response?.data?.error || 'Test delivery failed. Check your webhook URL.',
        'error'
      );
    } finally {
      setTestingId(null);
    }
  };

  const columns = [
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={
            row.original.platform === 'slack'
              ? 'bg-[#4A154B]/30 text-[#E01E5A] border-[#4A154B]/40'
              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
          }
        >
          {row.original.platform === 'slack' ? '💬 Slack' : '🎮 Discord'}
        </Badge>
      ),
    },
    {
      accessorKey: 'url',
      header: 'Webhook URL',
      cell: ({ row }) => {
        const u = row.original.url;
        // Truncate to keep the URL safe from leaking full tokens in the UI
        const display = u.length > 52 ? `${u.slice(0, 28)}…${u.slice(-12)}` : u;
        return (
          <code className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-300">
            {display}
          </code>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Added',
      cell: ({ row }) => (
        <span className="text-zinc-400 text-sm">{formatDate(row.original.created_at)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-zinc-400 hover:text-white hover:bg-purple-500/10"
            disabled={testingId === row.original.id}
            onClick={() => handleTest(row.original.id)}
            aria-label="Send test notification"
          >
            {testingId === row.original.id
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Send className="h-3.5 w-3.5" />}
            Test
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
            disabled={deletingId === row.original.id}
            onClick={() => handleDelete(row.original.id)}
            aria-label="Delete webhook"
          >
            {deletingId === row.original.id
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Toast toast={toast} />
      <div className="space-y-6">
        {/* Add webhook form */}
        <Card className="bg-brand-card/60 border border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Webhook className="h-4 w-4 text-brand-orange" />
              Add Webhook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="space-y-1.5 w-full sm:w-36 shrink-0">
                <Label className="text-zinc-300">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="border-purple-500/20 bg-brand-bg text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slack">💬 Slack</SelectItem>
                    <SelectItem value="discord">🎮 Discord</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-1.5">
                <Label htmlFor="webhookUrl" className="text-zinc-300">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={
                    platform === 'slack'
                      ? 'https://hooks.slack.com/services/...'
                      : 'https://discord.com/api/webhooks/...'
                  }
                  required
                  disabled={adding}
                  className="border-purple-500/20 bg-brand-bg text-white placeholder:text-zinc-600"
                />
              </div>

              <Button
                type="submit"
                disabled={adding || !url.trim()}
                className="bg-brand-orange hover:bg-brand-orange-hover shrink-0"
              >
                {adding
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Webhook className="mr-2 h-4 w-4" />}
                Add Webhook
              </Button>
            </form>

            {addError && (
              <p className="mt-3 text-sm text-destructive">{addError}</p>
            )}
          </CardContent>
        </Card>

        {/* Active webhooks table */}
        <DataTable
          columns={columns}
          data={webhooks}
          loading={loading}
          searchKey={false}
          emptyTitle="No webhooks configured"
          emptyDescription="Add a Slack or Discord webhook above to get notified when this project detects changes."
          pageSize={10}
        />
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { id } = useParams();
  const {
    currentProject, runs, scrapedData, changes,
    fetchProject, fetchRuns, fetchData, fetchChanges,
    updateProject, triggerScrape,
  } = useProjectStore();
  const [showEdit, setShowEdit]   = useState(false);
  const [scraping, setScraping]   = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id);
      fetchRuns(id);
      fetchData(id);
      fetchChanges(id);
    }
  }, [id, fetchProject, fetchRuns, fetchData, fetchChanges]);

  const handleScrape = async () => {
    setScraping(true);
    try {
      await triggerScrape(id);
      setTimeout(() => fetchRuns(id), 2000);
    } finally {
      setScraping(false);
    }
  };

  const handleExport = async (format) => {
    const { data } = await projectsApi.export(id, format);
    downloadBlob(data, `webpulse-${id}.${format}`);
  };

  // ── Table column definitions ──────────────────────────────────────────────
  const runColumns = [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={
          row.original.status === 'completed' ? 'success'
          : row.original.status === 'failed'  ? 'destructive'
          : 'warning'
        }>
          {row.original.status}
        </Badge>
      ),
    },
    { accessorKey: 'started_at',   header: 'Started',   cell: ({ row }) => formatDate(row.original.started_at) },
    { accessorKey: 'completed_at', header: 'Completed', cell: ({ row }) => formatDate(row.original.completed_at) },
  ];

  const changeColumns = [
    {
      accessorKey: 'change_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant={
          row.original.change_type === 'added'   ? 'success'
          : row.original.change_type === 'removed' ? 'destructive'
          : 'secondary'
        }>
          {row.original.change_type}
        </Badge>
      ),
    },
    { accessorKey: 'field_name', header: 'Field' },
    {
      accessorKey: 'old_value',
      header: 'Old Value',
      cell: ({ row }) => <span className="truncate max-w-[200px] block">{row.original.old_value || '—'}</span>,
    },
    {
      accessorKey: 'new_value',
      header: 'New Value',
      cell: ({ row }) => <span className="truncate max-w-[200px] block">{row.original.new_value || '—'}</span>,
    },
    { accessorKey: 'detected_at', header: 'Detected', cell: ({ row }) => formatDate(row.original.detected_at) },
  ];

  const scrapedColumns = [
    {
      accessorKey: 'image_url',
      header: 'Image',
      cell: ({ row }) => {
        let imgUrl = row.original.image_url;
        if (imgUrl?.includes('books.toscrape.com') && !imgUrl.includes('/media/')) {
          imgUrl = imgUrl.replace('books.toscrape.com/cache/', 'books.toscrape.com/media/cache/');
        }
        return imgUrl ? (
          <img
            src={imgUrl}
            alt={row.original.title || 'Product image'}
            className="h-10 w-auto rounded-md object-contain border border-zinc-800"
          />
        ) : null;
      },
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => <span className="font-medium text-zinc-200">{row.original.title || '—'}</span>,
    },
    { accessorKey: 'price', header: 'Price' },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => <span className="text-zinc-400 font-medium">{row.original.rating || 'N/A'} Stars</span>,
    },
  ];

  const unifiedColumns = [
    { accessorKey: 'index', header: '#' },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) =>
        row.original.type === 'Text'
          ? <span className="text-zinc-400 font-medium">Text</span>
          : <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Link</Badge>,
    },
    { accessorKey: 'content', header: 'Content' },
    {
      accessorKey: 'url',
      header: 'Link URL',
      cell: ({ row }) => {
        if (row.original.type === 'Text') return '—';
        let href = row.original.url;
        if (!href.startsWith('http')) {
          href = `${currentProject.website_url}${href.startsWith('/') ? '' : '/'}${href}`;
        }
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 hover:underline transition-colors truncate max-w-md"
          >
            {href}
          </a>
        );
      },
    },
  ];

  if (!currentProject) {
    return <p className="text-muted-foreground">Loading project...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/projects">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{currentProject.name}</h2>
          <p className="text-sm text-muted-foreground">{currentProject.website_url}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
            <Download className="h-4 w-4 mr-1" /> JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button size="sm" onClick={handleScrape} disabled={scraping}>
            <Play className="h-4 w-4 mr-1" /> {scraping ? 'Queuing...' : 'Scrape Now'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Scraper: {currentProject.scraper_type}</Badge>
        <Badge variant="outline">Schedule: {currentProject.schedule}</Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="data">
        <TabsList>
          <TabsTrigger value="data">Scraped Data</TabsTrigger>
          <TabsTrigger value="runs">Scrape Runs</TabsTrigger>
          <TabsTrigger value="changes">Changes</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* ── Scraped Data ── */}
        <TabsContent value="data" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Latest Scraped Content</CardTitle></CardHeader>
            <CardContent>
              {scrapedData.length && scrapedData[0]?.content_json ? (
                (() => {
                  const content = scrapedData[0].content_json;
                  let items = [];
                  if (Array.isArray(content)) {
                    items = content;
                  } else if (Array.isArray(content.items)) {
                    items = content.items;
                  }

                  if (items.length > 0) {
                    return (
                      <DataTable
                        columns={scrapedColumns}
                        data={items}
                        searchKey="title"
                        searchPlaceholder="Search items..."
                        emptyTitle="No items found"
                        emptyDescription="No scraped items available for this run."
                      />
                    );
                  }

                  let textArray = [];
                  if (Array.isArray(content.text)) {
                    textArray = content.text.map((t, i) => ({
                      index: i + 1,
                      type: 'Text',
                      content: t.text || t.content || t,
                      url: '—',
                    }));
                  }

                  let linksArray = [];
                  if (Array.isArray(content.links)) {
                    linksArray = content.links.map((l, i) => ({
                      index: textArray.length + i + 1,
                      type: 'Link',
                      content: l.text || l.anchor || '—',
                      url: l.url || l.href || l.link || l,
                    }));
                  }

                  const unifiedData = [...textArray, ...linksArray];
                  if (unifiedData.length > 0) {
                    return (
                      <DataTable
                        columns={unifiedColumns}
                        data={unifiedData}
                        searchKey="content"
                        searchPlaceholder="Search content..."
                        emptyTitle="No data found"
                      />
                    );
                  }

                  return (
                    <EmptyState
                      title="No data available"
                      description="This scrape run didn't return any structured data."
                    />
                  );
                })()
              ) : (
                <EmptyState title="No scraped data" description="Run a scrape to see results." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Scrape Runs ── */}
        <TabsContent value="runs" className="mt-4">
          <DataTable columns={runColumns} data={runs} />
        </TabsContent>

        {/* ── Changes ── */}
        <TabsContent value="changes" className="mt-4">
          <DataTable
            columns={changeColumns}
            data={changes}
            searchKey="field_name"
            searchPlaceholder="Search changes..."
          />
        </TabsContent>

        {/* ── Integrations ── */}
        <TabsContent value="integrations" className="mt-4">
          <IntegrationsTab projectId={id} />
        </TabsContent>
      </Tabs>

      <ProjectForm
        open={showEdit}
        onOpenChange={setShowEdit}
        initialData={currentProject}
        title="Edit Project"
        onSubmit={(data) => updateProject(id, data)}
      />
    </div>
  );
}
