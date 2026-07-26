import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Folder,
  Code2,
  FileText,
  CheckSquare,
  Settings,
  Flame,
  X
} from 'lucide-react';
import { useCurriculumStore, useStreakData } from '../../store';
import { clsx } from 'clsx';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/modules', icon: BookOpen, label: 'Modules' },
  { to: '/projects', icon: Folder, label: 'Projects' },
  { to: '/dsa', icon: Code2, label: 'DSA Log' },
  { to: '/reflections', icon: FileText, label: 'Reflections' },
  { to: '/todos', icon: CheckSquare, label: 'Todos' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const streakData = useStreakData();
  const getTotalProgress = useCurriculumStore(state => state.getTotalProgress);
  const progress = getTotalProgress();

  return (
    <aside className={clsx(
      "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Curriculum Tracker
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            88-Day Journey
          </p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Progress & Streak */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
        {/* Streak */}
        <div className="flex items-center gap-3 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <Flame className={clsx(
            'w-5 h-5',
            streakData.currentStreak > 0
              ? 'text-orange-500 animate-flame'
              : 'text-gray-400'
          )} />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {streakData.currentStreak} day streak
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Best: {streakData.longestStreak} days
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="px-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
