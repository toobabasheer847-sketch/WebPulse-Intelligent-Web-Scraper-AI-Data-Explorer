import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '../EmptyState';

const TOOLTIP_STYLE = {
  background: 'hsl(222 47% 9%)',
  border: '1px solid hsl(217 33% 17%)',
  borderRadius: '0.5rem',
  fontSize: '12px',
};

const GRID_STROKE = '#334155';
const AXIS_STROKE = '#94a3b8';

export const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function ChartContainer({
  title,
  description,
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'No data available',
  height = 280,
  className,
  children,
}) {
  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {title && <Skeleton className="h-5 w-40" />}
        <Skeleton className="w-full rounded-md" style={{ height }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center gap-2 text-destructive', className)} style={{ height }}>
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className={className}>
        {title && <h4 className="mb-2 text-sm font-medium">{title}</h4>}
        <EmptyState title={emptyMessage} className="py-8" />
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h4 className="text-sm font-medium">{title}</h4>}
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      )}
      <div style={{ height }}>{children}</div>
    </div>
  );
}

export { TOOLTIP_STYLE, GRID_STROKE, AXIS_STROKE };
