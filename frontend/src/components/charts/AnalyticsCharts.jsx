/** @deprecated Import from `@/components/shared/charts/*` */
import { PieChartWrapper, BarChartWrapper, LineChartWrapper } from '@/components/shared';

export function StatusPieChart({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value }));
  return <PieChartWrapper data={chartData} />;
}

export function ChangesBarChart({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value }));
  return <BarChartWrapper data={chartData} />;
}

export function ChangesLineChart({ data }) {
  return (
    <LineChartWrapper
      data={data || []}
      lines={[
        { dataKey: 'added', color: '#10b981' },
        { dataKey: 'updated', color: '#3b82f6' },
        { dataKey: 'removed', color: '#ef4444' },
      ]}
    />
  );
}
