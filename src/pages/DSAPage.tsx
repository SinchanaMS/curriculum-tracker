import { Link } from 'react-router-dom';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';
import { useDSAProblems, useCurriculumStore } from '../store';
import { TopicStatus, Difficulty } from '../types';
import { useState } from 'react';

export default function DSAPage() {
  const dsaProblems = useDSAProblems();
  const deleteDSAProblem = useCurriculumStore(state => state.deleteDSAProblem);

  const [filterDifficulty, setFilterDifficulty] = useState<'all' | Difficulty>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | TopicStatus>('all');
  const [filterPattern, setFilterPattern] = useState<string>('all');

  // Get unique patterns
  const patterns = [...new Set(dsaProblems.map(p => p.pattern))].sort();

  // Filter problems
  const filteredProblems = dsaProblems.filter(p => {
    if (filterDifficulty !== 'all' && p.difficulty !== filterDifficulty) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterPattern !== 'all' && p.pattern !== filterPattern) return false;
    return true;
  });

  // Stats
  const solved = dsaProblems.filter(p => p.status === TopicStatus.COMPLETED).length;
  const easy = dsaProblems.filter(p => p.difficulty === Difficulty.EASY && p.status === TopicStatus.COMPLETED).length;
  const medium = dsaProblems.filter(p => p.difficulty === Difficulty.MEDIUM && p.status === TopicStatus.COMPLETED).length;
  const hard = dsaProblems.filter(p => p.difficulty === Difficulty.HARD && p.status === TopicStatus.COMPLETED).length;

  const getDifficultyBadge = (difficulty: Difficulty) => {
    const variants = {
      [Difficulty.EASY]: 'success',
      [Difficulty.MEDIUM]: 'warning',
      [Difficulty.HARD]: 'danger',
    } as const;
    return <Badge variant={variants[difficulty]}>{difficulty}</Badge>;
  };

  const getStatusBadge = (status: TopicStatus) => {
    const variants = {
      [TopicStatus.COMPLETED]: 'success',
      [TopicStatus.IN_PROGRESS]: 'info',
      [TopicStatus.PENDING]: 'default',
    } as const;
    const labels = {
      [TopicStatus.COMPLETED]: 'Solved',
      [TopicStatus.IN_PROGRESS]: 'Attempting',
      [TopicStatus.PENDING]: 'Todo',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DSA Problem Log</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your algorithm and data structure practice
          </p>
        </div>
        <Link to="/dsa/new">
          <Button>
            <Plus className="w-4 h-4" />
            Add Problem
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{solved}</p>
          <p className="text-sm text-gray-500">Total Solved</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-green-600">{easy}</p>
          <p className="text-sm text-gray-500">Easy</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-yellow-600">{medium}</p>
          <p className="text-sm text-gray-500">Medium</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-red-600">{hard}</p>
          <p className="text-sm text-gray-500">Hard</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty
            </label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as 'all' | Difficulty)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All</option>
              <option value={Difficulty.EASY}>Easy</option>
              <option value={Difficulty.MEDIUM}>Medium</option>
              <option value={Difficulty.HARD}>Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | TopicStatus)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All</option>
              <option value={TopicStatus.COMPLETED}>Solved</option>
              <option value={TopicStatus.IN_PROGRESS}>Attempting</option>
              <option value={TopicStatus.PENDING}>Todo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pattern
            </label>
            <select
              value={filterPattern}
              onChange={(e) => setFilterPattern(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All</option>
              {patterns.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Problems Table */}
      {filteredProblems.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {dsaProblems.length === 0 ? 'No problems logged yet' : 'No problems match your filters'}
          </p>
          <Link to="/dsa/new">
            <Button>
              <Plus className="w-4 h-4" />
              Add Your First Problem
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pattern
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProblems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {problem.name}
                        </span>
                        {problem.url && (
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getDifficultyBadge(problem.difficulty)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {problem.pattern}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(problem.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {problem.platform}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/dsa/${problem.id}`}>
                          <Button size="sm" variant="ghost">Edit</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Delete this problem?')) {
                              deleteDSAProblem(problem.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
