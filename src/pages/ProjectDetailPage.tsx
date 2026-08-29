import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Clock, Github, ExternalLink, Calendar, AlertCircle, BookOpen } from 'lucide-react';
import { Card, Badge, Button, ProgressBar, Input, Textarea } from '../components/ui';
import { useProjects, useCurriculumStore } from '../store';
import { MilestoneStatus } from '../types';
import { useState } from 'react';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const projects = useProjects();
  const updateMilestoneStatus = useCurriculumStore(state => state.updateMilestoneStatus);
  const updateMilestoneLearnings = useCurriculumStore(state => state.updateMilestoneLearnings);
  const updateProjectLinks = useCurriculumStore(state => state.updateProjectLinks);
  const updateProjectNotes = useCurriculumStore(state => state.updateProjectNotes);

  const project = projects.find(p => p.id === projectId);
  const [editingLearnings, setEditingLearnings] = useState<string | null>(null);
  const [editingLinks, setEditingLinks] = useState(false);
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl || '');
  const [demoUrl, setDemoUrl] = useState(project?.demoUrl || '');

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Link to="/projects" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  const completed = project.milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
  const progress = Math.round((completed / project.milestones.length) * 100);

  const formatDueDate = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDueDateStatus = () => {
    if (!project.dueDate || project.completedAt) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(project.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'overdue', days: Math.abs(diffDays) };
    if (diffDays === 0) return { status: 'today', days: 0 };
    if (diffDays <= 7) return { status: 'soon', days: diffDays };
    return { status: 'normal', days: diffDays };
  };

  const dueDateInfo = getDueDateStatus();

  const getNextStatus = (current: MilestoneStatus): MilestoneStatus => {
    if (current === MilestoneStatus.NOT_STARTED) return MilestoneStatus.IN_PROGRESS;
    if (current === MilestoneStatus.IN_PROGRESS) return MilestoneStatus.COMPLETED;
    return MilestoneStatus.NOT_STARTED;
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    if (status === MilestoneStatus.COMPLETED) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    if (status === MilestoneStatus.IN_PROGRESS) {
      return <Clock className="w-5 h-5 text-blue-500" />;
    }
    return <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />;
  };

  const handleSaveLinks = () => {
    updateProjectLinks(project.id, githubUrl, demoUrl);
    setEditingLinks(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          to="/projects"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {project.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {project.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="purple" size="sm">{tech}</Badge>
            ))}
            {project.weekStart && (
              <Badge variant="default" size="sm">
                Week {project.weekStart}{project.weekEnd !== project.weekStart ? `-${project.weekEnd}` : ''}
              </Badge>
            )}
          </div>
          {project.dueDate && !project.completedAt && (
            <div className={`flex items-center gap-2 mt-3 text-sm ${
              dueDateInfo?.status === 'overdue' ? 'text-red-500 font-medium' :
              dueDateInfo?.status === 'today' ? 'text-orange-500 font-medium' :
              dueDateInfo?.status === 'soon' ? 'text-yellow-600 dark:text-yellow-500' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {dueDateInfo?.status === 'overdue' && <AlertCircle className="w-4 h-4" />}
              <Calendar className="w-4 h-4" />
              <span>
                Due: {formatDueDate(project.dueDate)}
                {dueDateInfo?.status === 'overdue' && ` (${dueDateInfo.days} days overdue)`}
                {dueDateInfo?.status === 'today' && ' (Today!)'}
                {dueDateInfo?.status === 'soon' && ` (${dueDateInfo.days} days left)`}
                {dueDateInfo?.status === 'normal' && ` (${dueDateInfo.days} days left)`}
              </span>
            </div>
          )}
          {project.completedAt && (
            <div className="flex items-center gap-2 mt-3 text-sm text-green-600 dark:text-green-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed: {formatDueDate(project.completedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress & Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Progress</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {completed}/{project.milestones.length} milestones
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {progress}%
            </span>
          </div>
          <ProgressBar value={progress} size="lg" />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Links</h3>
            <Button size="sm" variant="ghost" onClick={() => setEditingLinks(!editingLinks)}>
              {editingLinks ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          {editingLinks ? (
            <div className="space-y-3">
              <Input
                label="GitHub URL"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
              <Input
                label="Demo URL"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
              />
              <Button size="sm" onClick={handleSaveLinks}>Save</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <Github className="w-4 h-4" />
                  {project.githubUrl}
                </a>
              ) : (
                <p className="text-sm text-gray-500">No GitHub link</p>
              )}
              {project.demoUrl ? (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {project.demoUrl}
                </a>
              ) : (
                <p className="text-sm text-gray-500">No demo link</p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Milestones</h3>
        <div className="space-y-4">
          {project.milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
            >
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => updateMilestoneStatus(project.id, milestone.id, getNextStatus(milestone.status))}
                  className="hover:scale-110 transition-transform"
                  title="Click to change status"
                >
                  {getStatusIcon(milestone.status)}
                </button>
                {index < project.milestones.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {milestone.name}
                  </h4>
                  {milestone.completedAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(milestone.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {milestone.description}
                </p>

                {/* Prerequisites */}
                {milestone.prerequisites && milestone.prerequisites.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <BookOpen className="w-3 h-3" />
                      Topics:
                    </span>
                    {milestone.prerequisites.map((prereq: string) => (
                      <span
                        key={prereq}
                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded"
                      >
                        {prereq}
                      </span>
                    ))}
                  </div>
                )}

                {/* Learnings */}
                {editingLearnings === milestone.id ? (
                  <div className="mt-3">
                    <Textarea
                      value={milestone.learnings}
                      onChange={(e) => updateMilestoneLearnings(project.id, milestone.id, e.target.value)}
                      placeholder="What did you learn from this milestone?"
                      rows={3}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2"
                      onClick={() => setEditingLearnings(null)}
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingLearnings(milestone.id)}
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {milestone.learnings
                      ? milestone.learnings.substring(0, 100) + (milestone.learnings.length > 100 ? '...' : '')
                      : '+ Add learnings'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Project Notes */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
        <Textarea
          value={project.notes}
          onChange={(e) => updateProjectNotes(project.id, e.target.value)}
          placeholder="Add general notes about this project..."
          rows={4}
        />
      </Card>
    </div>
  );
}
