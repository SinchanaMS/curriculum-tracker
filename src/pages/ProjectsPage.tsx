import { Link } from 'react-router-dom';
import { ExternalLink, Github, Calendar, AlertCircle } from 'lucide-react';
import { Card, ProgressRing, Badge } from '../components/ui';
import { useProjects } from '../store';
import { MilestoneStatus } from '../types';

const getDueDateInfo = (dueDate: string | undefined, completedAt: string | null) => {
  if (!dueDate || completedAt) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'overdue', text: `${Math.abs(diffDays)}d overdue` };
  if (diffDays === 0) return { status: 'today', text: 'Due today' };
  if (diffDays <= 7) return { status: 'soon', text: `${diffDays}d left` };
  return { status: 'normal', text: `${diffDays}d left` };
};

export default function ProjectsPage() {
  const projects = useProjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Build real projects to demonstrate your skills
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => {
          const completed = project.milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
          const inProgress = project.milestones.filter(m => m.status === MilestoneStatus.IN_PROGRESS).length;
          const progress = Math.round((completed / project.milestones.length) * 100);
          const isComplete = progress === 100;
          const hasStarted = project.startedAt !== null;
          const dueDateInfo = getDueDateInfo(project.dueDate, project.completedAt);

          return (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card hoverable className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {project.description}
                    </p>
                    {project.weekStart && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Week {project.weekStart}{project.weekEnd !== project.weekStart ? `-${project.weekEnd}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    {isComplete && <Badge variant="success">Complete</Badge>}
                    {!isComplete && hasStarted && <Badge variant="info">In Progress</Badge>}
                    {!hasStarted && <Badge variant="default">Not Started</Badge>}
                    {dueDateInfo && (
                      <div className={`flex items-center gap-1 text-xs ${
                        dueDateInfo.status === 'overdue' ? 'text-red-500' :
                        dueDateInfo.status === 'today' ? 'text-orange-500' :
                        dueDateInfo.status === 'soon' ? 'text-yellow-600 dark:text-yellow-500' :
                        'text-gray-500'
                      }`}>
                        {dueDateInfo.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                        <Calendar className="w-3 h-3" />
                        <span>{dueDateInfo.text}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <ProgressRing value={progress} size={50} strokeWidth={5} />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">{completed}</span>
                      /{project.milestones.length} milestones
                    </div>
                    {inProgress > 0 && (
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {inProgress} in progress
                      </div>
                    )}
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                {(project.githubUrl || project.demoUrl) && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Demo
                      </a>
                    )}
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
