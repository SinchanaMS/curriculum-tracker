import { Link } from 'react-router-dom';
import {
  FileCode, Code, Atom, Sparkles, Wrench, Paintbrush,
  Globe, Zap, Server, Database, Layout, Shield, Users,
  ChevronRight, BookOpen, Target
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { interviewCategories, getTotalQuestionCount } from '../data/interviewQuestions';
import { useCurriculumStore } from '../store';

const iconMap: Record<string, React.ElementType> = {
  FileCode, Code, Atom, Sparkles, Wrench, Paintbrush,
  Globe, Zap, Server, Database, Layout, Shield, Users
};

export default function InterviewPrepPage() {
  const interviewProgress = useCurriculumStore(state => state.interviewProgress) || {};

  const totalQuestions = getTotalQuestionCount();

  const getCategoryProgress = (categoryId: string) => {
    const category = interviewCategories.find(c => c.id === categoryId);
    if (!category) return 0;

    const confidentCount = category.questions.filter(
      q => interviewProgress[q.id]?.status === 'confident'
    ).length;
    return Math.round((confidentCount / category.questions.length) * 100) || 0;
  };

  const getOverallProgress = () => {
    const confident = Object.values(interviewProgress).filter(p => p.status === 'confident').length;
    return Math.round((confident / totalQuestions) * 100) || 0;
  };

  const getStatusCounts = () => {
    const counts = { confident: 0, needs_practice: 0, not_reviewed: 0 };
    Object.values(interviewProgress).forEach(p => {
      if (p.status === 'confident') counts.confident++;
      else if (p.status === 'needs_practice') counts.needs_practice++;
    });
    counts.not_reviewed = totalQuestions - counts.confident - counts.needs_practice;
    return counts;
  };

  const statusCounts = getStatusCounts();
  const overallProgress = getOverallProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Interview Prep
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {totalQuestions} questions across {interviewCategories.length} categories for SDE2 Frontend
        </p>
      </div>

      {/* Overall Progress Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Overall Progress
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track your interview readiness
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {overallProgress}%
            </span>
          </div>
        </div>

        <ProgressBar value={overallProgress} className="mb-4" color='#2563eb'/>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {statusCounts.confident}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Confident</p>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {statusCounts.needs_practice}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Needs Practice</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {statusCounts.not_reviewed}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Not Reviewed</p>
          </div>
        </div>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {interviewCategories.map(category => {
          const Icon = iconMap[category.icon] || BookOpen;
          const progress = getCategoryProgress(category.id);

          return (
            <Link
              key={category.id}
              to={`/interview-prep/${category.id}`}
              className="group"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-full hover:shadow-md transition-shadow cursor-pointer border-l-4"
                style={{ borderLeftColor: category.color }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: category.color }}
                    />
                  </div>
                  <Badge variant={progress === 100 ? 'success' : progress > 0 ? 'warning' : 'default'}>
                    {category.questions.length} Q
                  </Badge>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {category.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-3">
                    <ProgressBar value={progress} size="sm" color={category.color} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {progress}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
