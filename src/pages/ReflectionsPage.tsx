import { Link } from 'react-router-dom';
import { FileText, Star } from 'lucide-react';
import { Card, Badge } from '../components/ui';
import { useWeeklyReflections, useCurriculumStore } from '../store';
import { TOTAL_WEEKS } from '../data/initialData';

export default function ReflectionsPage() {
  const reflections = useWeeklyReflections();
  const getCurrentWeek = useCurriculumStore(state => state.getCurrentWeek);
  const currentWeek = getCurrentWeek();

  // Create array of all weeks
  const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  const getReflection = (weekNumber: number) => {
    return reflections.find(r => r.weekNumber === weekNumber);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Reflections</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Answer 4 questions every Sunday to track your learning journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weeks.map((weekNumber) => {
          const reflection = getReflection(weekNumber);
          const isCurrent = weekNumber === currentWeek;
          const isFuture = weekNumber > currentWeek;

          return (
            <Link key={weekNumber} to={`/reflections/${weekNumber}`}>
              <Card hoverable className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      reflection ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        reflection ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Week {weekNumber}
                      </h3>
                      {reflection && (
                        <p className="text-xs text-gray-500">
                          Updated {new Date(reflection.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && <Badge variant="info">Current</Badge>}
                    {reflection && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {reflection.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {reflection ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">What I learned:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {reflection.questions.learned || 'No entry'}
                      </p>
                    </div>
                    {reflection.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {reflection.highlights.slice(0, 3).map((h, i) => (
                          <Badge key={i} variant="purple" size="sm">{h}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isFuture ? 'Upcoming' : 'No reflection yet'}
                  </p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
