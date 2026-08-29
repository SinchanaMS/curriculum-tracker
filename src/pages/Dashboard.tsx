import { Link } from 'react-router-dom';
import {
  BookOpen,
  Folder,
  Code2,
  CheckCircle2,
  Flame,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, ProgressRing, ProgressBar, Badge } from '../components/ui';
import { useCurriculumStore, useModules, useProjects, useStreakData, useDailyTodos } from '../store';
import { TopicStatus, MilestoneStatus } from '../types';
import { format } from 'date-fns';

export default function Dashboard() {
  const modules = useModules();
  const projects = useProjects();
  const streakData = useStreakData();
  const dailyTodos = useDailyTodos();
  const dsaProblems = useCurriculumStore(state => state.dsaProblems);
  const getTotalProgress = useCurriculumStore(state => state.getTotalProgress);
  const getCurrentDay = useCurriculumStore(state => state.getCurrentDay);
  const getCurrentWeek = useCurriculumStore(state => state.getCurrentWeek);

  const currentDay = getCurrentDay();
  const currentWeek = getCurrentWeek();
  const totalProgress = getTotalProgress();

  // Calculate stats
  const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);
  const completedTopics = modules.reduce(
    (acc, m) => acc + m.topics.filter(t => t.status === TopicStatus.COMPLETED).length,
    0
  );

  const totalMilestones = projects.reduce((acc, p) => acc + p.milestones.length, 0);
  const completedMilestones = projects.reduce(
    (acc, p) => acc + p.milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length,
    0
  );

  const solvedProblems = dsaProblems.filter(p => p.status === TopicStatus.COMPLETED).length;

  // Get today's todos
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysTodos = dailyTodos.find(d => d.date === today)?.items || [];
  const completedTodosToday = todaysTodos.filter(t => t.completed).length;

  // Get current module based on week
  const currentModule = modules.find(
    m => currentWeek >= m.weekStart && currentWeek <= m.weekEnd
  );

  return (
    <div className="space-y-6">
      {/* Welcome & Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Progress Card */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-8">
            <ProgressRing value={totalProgress} size={120} strokeWidth={10} />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Day {currentDay} of 105
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Week {currentWeek} - {currentModule?.name || 'Getting Started'}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{completedTopics}</p>
                  <p className="text-sm text-gray-500">Topics Done</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{solvedProblems}</p>
                  <p className="text-sm text-gray-500">DSA Solved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{completedMilestones}</p>
                  <p className="text-sm text-gray-500">Milestones</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Streak Card */}
        <Card>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
              <Flame className={`w-8 h-8 ${streakData.currentStreak > 0 ? 'text-orange-500 animate-flame' : 'text-gray-400'}`} />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
              {streakData.currentStreak}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Day Streak</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{streakData.longestStreak}</p>
                <p className="text-gray-500">Best</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{streakData.totalActiveDays}</p>
                <p className="text-gray-500">Total Days</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedTopics}/{totalTopics}
              </p>
              <p className="text-sm text-gray-500">Topics Completed</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Folder className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedMilestones}/{totalMilestones}
              </p>
              <p className="text-sm text-gray-500">Milestones Done</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Code2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {solvedProblems}
              </p>
              <p className="text-sm text-gray-500">DSA Problems</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedTodosToday}/{todaysTodos.length}
              </p>
              <p className="text-sm text-gray-500">Today's Tasks</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Module Progress & Today's Todos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Progress */}
        <Card>
          <CardHeader
            title="Module Progress"
            action={
              <Link to="/modules" className="text-sm text-blue-600 hover:underline">
                View All
              </Link>
            }
          />
          <div className="space-y-4">
            {modules.map((module) => {
              const completedTopics = module.topics.filter(t => t.status === TopicStatus.COMPLETED).length;
              // Calculate progress based on subtopics
              const totalSubtopics = module.topics.reduce((acc, t) => acc + (t.subtopics?.length || 0), 0);
              const completedSubtopics = module.topics.reduce((acc, t) => acc + (t.subtopics?.filter(s => s.completed).length || 0), 0);
              const progress = totalSubtopics > 0
                ? Math.round((completedSubtopics / totalSubtopics) * 100)
                : Math.round((completedTopics / module.topics.length) * 100);
              const isCurrent = currentWeek >= module.weekStart && currentWeek <= module.weekEnd;

              return (
                <Link
                  key={module.id}
                  to={`/modules/${module.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: module.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {module.name}
                      </span>
                      {isCurrent && (
                        <Badge variant="info" size="sm">Current</Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {completedSubtopics}/{totalSubtopics}
                    </span>
                  </div>
                  <ProgressBar
                    value={progress}
                    color={`bg-[${module.color}]`}
                    size="sm"
                  />
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Today's Todos */}
        <Card>
          <CardHeader
            title="Today's Tasks"
            subtitle={format(new Date(), 'EEEE, MMMM d')}
            action={
              <Link to="/todos" className="text-sm text-blue-600 hover:underline">
                View All
              </Link>
            }
          />
          {todaysTodos.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No tasks for today</p>
              <Link
                to="/todos"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                Add a task
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysTodos.slice(0, 5).map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      todo.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {todo.completed && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      todo.completed
                        ? 'text-gray-400 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>
              ))}
              {todaysTodos.length > 5 && (
                <Link
                  to="/todos"
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  +{todaysTodos.length - 5} more tasks
                </Link>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Projects Overview */}
      <Card>
        <CardHeader
          title="Project Progress"
          action={
            <Link to="/projects" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => {
            const completed = project.milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
            const progress = Math.round((completed / project.milestones.length) * 100);

            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <ProgressRing value={progress} size={40} strokeWidth={4} showLabel={false} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {project.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {completed}/{project.milestones.length} milestones
                    </p>
                  </div>
                </div>
                <ProgressBar value={progress} size="sm" />
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
