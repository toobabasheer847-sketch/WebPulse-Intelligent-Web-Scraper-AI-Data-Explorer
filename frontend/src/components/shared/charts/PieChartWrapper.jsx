import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, CHART_COLORS, TOOLTIP_STYLE } from './ChartContainer';

export function PieChartWrapper({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  loading = false,
  error = null,
  title,
  description,
  height = 280,
  className,
  showLabels = true,
}) {
  const isEmpty = !data.length;

  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      error={error}
      empty={isEmpty}
      emptyMessage="No distribution data"
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={showLabels}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
