import { Link } from 'react-router-dom';
import { Calendar, AlertCircle, BookOpen } from 'lucide-react';
import { Card, ProgressRing, Badge } from '../components/ui';
import { useModules, useCurriculumStore } from '../store';
import { TopicStatus } from '../types';
import { hasModuleContent } from '../content';

const getModuleDueDateInfo = (dueDate: string | undefined, progress: number) => {
  if (!dueDate || progress === 100) return null;
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

export default function ModulesPage() {
  const modules = useModules();
  const getCurrentWeek = useCurriculumStore(state => state.getCurrentWeek);
  const currentWeek = getCurrentWeek();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modules</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your progress through the curriculum modules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const completedTopics = module.topics.filter(t => t.status === TopicStatus.COMPLETED).length;
          const inProgress = module.topics.filter(t => t.status === TopicStatus.IN_PROGRESS).length;

          // Calculate progress based on subtopics for more granular tracking
          const totalSubtopics = module.topics.reduce((acc, t) => acc + (t.subtopics?.length || 0), 0);
          const completedSubtopics = module.topics.reduce((acc, t) => acc + (t.subtopics?.filter(s => s.completed).length || 0), 0);
          const progress = totalSubtopics > 0
            ? Math.round((completedSubtopics / totalSubtopics) * 100)
            : Math.round((completedTopics / module.topics.length) * 100);
          const isCurrent = currentWeek >= module.weekStart && currentWeek <= module.weekEnd;
          const isPast = currentWeek > module.weekEnd;
          // Get the due date from the first topic (all topics in a module share the same due date)
          const moduleDueDate = module.topics[0]?.dueDate;
          const dueDateInfo = getModuleDueDateInfo(moduleDueDate, progress);

          return (
            <Link key={module.id} to={`/modules/${module.id}`}>
              <Card hoverable className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: module.color }}
                  />
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-2">
                      {isCurrent && <Badge variant="info">Current</Badge>}
                      {isPast && progress === 100 && <Badge variant="success">Complete</Badge>}
                      {isPast && progress < 100 && <Badge variant="warning">Review</Badge>}
                    </div>
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

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {module.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Week {module.weekStart}{module.weekEnd !== module.weekStart ? `-${module.weekEnd}` : ''}
                </p>

                <div className="flex items-center gap-4">
                  <ProgressRing
                    value={progress}
                    size={60}
                    strokeWidth={6}
                    color={module.color}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">{completedSubtopics}</span>
                      /{totalSubtopics} subtopics
                    </div>
                    {inProgress > 0 && (
                      <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        {inProgress} topics in progress
                      </div>
                    )}
                  </div>
                </div>

                {/* Learning Content Indicator */}
                {hasModuleContent(module.id) && (
                  <Link
                    to={`/modules/${module.id}/learn`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                  >
                    <BookOpen className="w-4 h-4" />
                    Learning content available
                  </Link>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
