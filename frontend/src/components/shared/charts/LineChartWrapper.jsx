import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer, CHART_COLORS, TOOLTIP_STYLE, GRID_STROKE, AXIS_STROKE } from './ChartContainer';

export function LineChartWrapper({
  data = [],
  lines = [],
  xKey = 'date',
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
      emptyMessage="No trend data yet"
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis dataKey={xKey} stroke={AXIS_STROKE} fontSize={12} />
          <YAxis stroke={AXIS_STROKE} fontSize={12} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend />
          {lines.map((line, i) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.color || CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
