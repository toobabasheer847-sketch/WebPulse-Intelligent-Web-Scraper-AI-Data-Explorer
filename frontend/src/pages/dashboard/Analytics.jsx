import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChartWrapper, BarChartWrapper, LineChartWrapper } from '@/components/shared';
import { EmptyState } from '@/components/shared/EmptyState';
import { useProjectStore } from '@/stores/projectStore';
import { AlertCircle } from 'lucide-react';

const PRICE_TOOLTIP_STYLE = {
  background: '#180E31',
  border: '1px solid rgba(168, 85, 247, 0.35)',
  borderRadius: '0.75rem',
  color: '#E9D5FF',
  fontSize: '12px',
  boxShadow: '0 4px 24px rgba(88, 28, 135, 0.4)',
};

function PriceTrendChart({ data, hasPrice, loading, error }) {
  if (loading) {
    return (
      <div className="flex h-[320px] items-center justify-center text-purple-300/60 text-sm">
        Loading price history…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[320px] items-center justify-center gap-2 text-red-400 text-sm">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No history yet"
        description="Run a few scrapes on this project to see price or content trends over time"
        className="py-12"
      />
    );
  }

  const lines = hasPrice
    ? [{ dataKey: 'price', name: 'Price', color: '#FFA052', strokeWidth: 3 }]
    : [
        { dataKey: 'textCount', name: 'Text Blocks', color: '#FFA052', strokeWidth: 3 },
        { dataKey: 'linkCount', name: 'Links', color: '#C084FC', strokeWidth: 2 },
        { dataKey: 'imageCount', name: 'Images', color: '#A78BFA', strokeWidth: 2 },
      ];

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <filter id="priceGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FFA052" floodOpacity="0.55" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.15)" />
          <XAxis
            dataKey="date"
            stroke="#D8B4FE"
            tick={{ fill: '#D8B4FE', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(168, 85, 247, 0.3)' }}
            tickLine={{ stroke: 'rgba(168, 85, 247, 0.3)' }}
          />
          <YAxis
            stroke="#D8B4FE"
            tick={{ fill: '#D8B4FE', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(168, 85, 247, 0.3)' }}
            tickLine={{ stroke: 'rgba(168, 85, 247, 0.3)' }}
            domain={hasPrice ? ['auto', 'auto'] : [0, 'auto']}
          />
          <Tooltip
            contentStyle={PRICE_TOOLTIP_STYLE}
            labelStyle={{ color: '#D8B4FE', marginBottom: 4 }}
            itemStyle={{ color: '#FFA052' }}
            formatter={(value, name) => {
              if (name === 'Price' && value != null) return [Number(value).toFixed(2), name];
              return [value, name];
            }}
          />
          {!hasPrice && <Legend wrapperStyle={{ color: '#D8B4FE', fontSize: 12 }} />}
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              dot={{ fill: line.color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: line.color, stroke: '#180E31', strokeWidth: 2 }}
              filter={line.dataKey === 'price' || line.dataKey === 'textCount' ? 'url(#priceGlow)' : undefined}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Analytics() {
  const { projects, analytics, priceHistory, fetchProjects, fetchAnalytics, fetchPriceHistory } = useProjectStore();
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!selectedProject) return;

    setLoading(true);
    setHistoryLoading(true);
    setHistoryError(null);

    Promise.all([
      fetchAnalytics(selectedProject).finally(() => setLoading(false)),
      fetchPriceHistory(selectedProject).catch((err) => {
        setHistoryError(err.response?.data?.error?.message || 'Failed to load price history');
        return null;
      }).finally(() => setHistoryLoading(false)),
    ]);
  }, [selectedProject, fetchAnalytics, fetchPriceHistory]);

  const pieData = Object.entries(analytics?.statusCounts || {}).map(([name, value]) => ({ name, value }));
  const barData = Object.entries(analytics?.changeByType || {}).map(([name, value]) => ({ name, value }));

  const chartTitle = useMemo(() => {
    if (priceHistory?.hasPrice) return 'Price Trend Over Time';
    return 'Content Metrics Over Time';
  }, [priceHistory?.hasPrice]);

  const chartDescription = useMemo(() => {
    if (priceHistory?.hasPrice) return 'First scraped item price across completed runs';
    return 'Text, link, and image counts from each completed scrape run';
  }, [priceHistory?.hasPrice]);

  return (
    <div className="space-y-6">
      <Select value={selectedProject} onValueChange={setSelectedProject}>
        <SelectTrigger className="w-64 border-purple-500/30 bg-[#180E31]/60 text-purple-100">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!selectedProject ? (
        <Card>
          <CardContent>
            <EmptyState title="Select a project" description="Choose a project to view scrape and change analytics" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border border-purple-500/20 bg-[#180E31]/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base text-purple-100">{chartTitle}</CardTitle>
              <p className="text-xs text-purple-300/70">{chartDescription}</p>
            </CardHeader>
            <CardContent>
              <PriceTrendChart
                data={priceHistory?.history || []}
                hasPrice={priceHistory?.hasPrice}
                loading={historyLoading}
                error={historyError}
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Scrape Run Status</CardTitle></CardHeader>
              <CardContent>
                <PieChartWrapper data={pieData} loading={loading} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Changes by Type</CardTitle></CardHeader>
              <CardContent>
                <BarChartWrapper data={barData} loading={loading} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Changes Over Time</CardTitle></CardHeader>
              <CardContent>
                <LineChartWrapper
                  data={analytics?.changesOverTime || []}
                  lines={[
                    { dataKey: 'added', name: 'Added', color: '#10b981' },
                    { dataKey: 'updated', name: 'Updated', color: '#3b82f6' },
                    { dataKey: 'removed', name: 'Removed', color: '#ef4444' },
                  ]}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
