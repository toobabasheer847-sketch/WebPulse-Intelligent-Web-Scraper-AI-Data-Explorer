import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer, CHART_COLORS, TOOLTIP_STYLE, GRID_STROKE, AXIS_STROKE } from './ChartContainer';

export function BarChartWrapper({
  data = [],
  bars = [{ dataKey: 'value', name: 'Value' }],
  xKey = 'name',
  loading = false,
  error = null,
  title,
  description,
  height = 280,
  className,
}) {
  const isEmpty = !data.length;

  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      error={error}
      empty={isEmpty}
      emptyMessage="No bar chart data"
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis dataKey={xKey} stroke={AXIS_STROKE} fontSize={12} />
          <YAxis stroke={AXIS_STROKE} fontSize={12} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend />
          {bars.map((bar, i) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.color || CHART_COLORS[i % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
