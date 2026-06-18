import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Play, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectForm } from '@/components/project/ProjectForm';
import { ConfirmModal } from '@/components/shared/ModalWrapper';
import { useProjectStore } from '@/stores/projectStore';
import { formatRelative } from '@/lib/utils';

export default function Projects() {
  const { projects, loading, fetchProjects, createProject, deleteProject, triggerScrape } = useProjectStore();
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeScrapes, setActiveScrapes] = useState({});
  const [scrapeSuccess, setScrapeSuccess] = useState(null);
  const pollingIntervalsRef = useRef({});

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollingIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  const handleScrape = async (projectId) => {
    // Get and store original project state before scrape starts
    const originalProject = projects.find(p => p.id === projectId);
    const originalLastScrapeAt = originalProject?.last_scrape_at;
    const originalRunCount = originalProject?.run_count || 0;
    
    setActiveScrapes(prev => ({ ...prev, [projectId]: true }));
    
    try {
      await triggerScrape(projectId);

      // Start polling every 3 seconds
      pollingIntervalsRef.current[projectId] = setInterval(async () => {
        // Fetch the latest projects from the API
        await fetchProjects();
        
        // Get the FRESH projects from the store using Zustand's getState() (fixes closure issue!)
        const freshProjects = useProjectStore.getState().projects;
        const updatedProject = freshProjects.find(p => p.id === projectId);
        
        // Check for completion using both last_scrape_at and run_count
        if (updatedProject && (
            (updatedProject.last_scrape_at !== originalLastScrapeAt) || 
            ((updatedProject.run_count || 0) > originalRunCount)
        )) {
          // Clear interval
          clearInterval(pollingIntervalsRef.current[projectId]);
          delete pollingIntervalsRef.current[projectId];
          
          // Mark scrape as inactive
          setActiveScrapes(prev => ({ ...prev, [projectId]: false }));
          
          // Show success notification for 3 seconds
          setScrapeSuccess(updatedProject.name);
          setTimeout(() => setScrapeSuccess(null), 3000);
        }
      }, 3000);
    } catch (error) {
      console.error('Scrape failed:', error);
      setActiveScrapes(prev => ({ ...prev, [projectId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast Notification */}
      {scrapeSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">✓</div>
          <div>
            <p className="font-medium">Scrape completed successfully!</p>
            <p className="text-xs opacity-90">{scrapeSuccess} was updated</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{projects.length} project(s)</p>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Project
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading projects...</p>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">No projects yet. Create your first scraping project.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link to={`/projects/${project.id}`} className="font-semibold hover:text-primary">
                      {project.name}
                    </Link>
                    <a
                      href={project.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground mt-1 truncate hover:text-primary"
                    >
                      {project.website_url} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">{project.scraper_type}</Badge>
                  {project.schedule !== 'none' && <Badge variant="outline">{project.schedule}</Badge>}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{project.record_count || 0} records</span>
                  <span>{project.run_count || 0} runs</span>
                  {project.last_scrape_at && <span>Last: {formatRelative(project.last_scrape_at)}</span>}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => handleScrape(project.id)} disabled={activeScrapes[project.id]}>
                    {activeScrapes[project.id] ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Scraping...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Scrape
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget(project)}
                    disabled={activeScrapes[project.id]}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProjectForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={createProject}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={async () => {
          setDeleting(true);
          try {
            await deleteProject(deleteTarget.id);
          } finally {
            setDeleting(false);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
