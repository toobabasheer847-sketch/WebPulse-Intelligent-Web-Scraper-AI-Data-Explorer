import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { useProjectStore } from '@/stores/projectStore';
import { formatDate } from '@/lib/utils';

export default function ChangeHistory() {
  const { projects, changes, fetchProjects, fetchChanges } = useProjectStore();
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProject) {
      setLoading(true);
      setError(null);
      fetchChanges(selectedProject)
        .catch(() => setError('Failed to load change history'))
        .finally(() => setLoading(false));
    }
  }, [selectedProject, fetchChanges]);

  const columns = [
    {
      accessorKey: 'change_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.change_type === 'added'
              ? 'success'
              : row.original.change_type === 'removed'
                ? 'destructive'
                : 'secondary'
          }
        >
          {row.original.change_type}
        </Badge>
      ),
    },
    { accessorKey: 'field_name', header: 'Field' },
    {
      accessorKey: 'old_value',
      header: 'Old Value',
      cell: ({ row }) => (
        <span className="max-w-xs truncate block text-muted-foreground">
          {row.original.old_value || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'new_value',
      header: 'New Value',
      cell: ({ row }) => (
        <span className="max-w-xs truncate block">{row.original.new_value || '—'}</span>
      ),
    },
    {
      accessorKey: 'detected_at',
      header: 'Detected At',
      cell: ({ row }) => formatDate(row.original.detected_at),
    },
  ];

  return (
    <div className="space-y-6">
      <Select value={selectedProject} onValueChange={setSelectedProject}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!selectedProject ? (
        <EmptyState title="Select a project" description="Choose a project to view its change history" />
      ) : (
        <DataTable
          columns={columns}
          data={changes}
          loading={loading}
          error={error}
          searchPlaceholder="Filter by field name..."
          emptyTitle="No changes detected"
          emptyDescription="Changes will appear after multiple scrape runs are compared"
        />
      )}
    </div>
  );
}
