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
  X,
  PanelLeftClose,
  PanelLeft,
  MessageSquareMore
} from 'lucide-react';
import { useCurriculumStore, useStreakData } from '../../store';
import { clsx } from 'clsx';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/modules', icon: BookOpen, label: 'Modules' },
  { to: '/projects', icon: Folder, label: 'Projects' },
  { to: '/dsa', icon: Code2, label: 'DSA Log' },
  { to: '/interview-prep', icon: MessageSquareMore, label: 'Interview Prep' },
  { to: '/reflections', icon: FileText, label: 'Reflections' },
  { to: '/todos', icon: CheckSquare, label: 'Todos' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const streakData = useStreakData();
  const getTotalProgress = useCurriculumStore(state => state.getTotalProgress);
  const progress = getTotalProgress();

  return (
    <aside className={clsx(
      "fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-all duration-300 ease-in-out lg:transform-none",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      collapsed ? "lg:w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className={clsx(
        "border-b border-gray-200 dark:border-gray-700 flex items-start justify-between",
        collapsed ? "p-3" : "p-6"
      )}>
        <div className={clsx(collapsed && "lg:hidden")}>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Curriculum Tracker
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            105-Day Journey
          </p>
        </div>
        {/* Collapsed logo */}
        {collapsed && (
          <div className="hidden lg:flex items-center justify-center w-full">
            <span className="text-xl font-bold text-gray-900 dark:text-white">CT</span>
          </div>
        )}
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Collapse Toggle - Desktop only */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex items-center justify-center p-2 mx-2 mt-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeft className="w-5 h-5" />
        ) : (
          <PanelLeftClose className="w-5 h-5" />
        )}
      </button>

      {/* Navigation */}
      <nav className={clsx("flex-1 space-y-1", collapsed ? "p-2" : "p-4")}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
                collapsed ? 'px-2 py-2 justify-center' : 'px-3 py-2',
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Progress & Streak */}
      <div className={clsx(
        "border-t border-gray-200 dark:border-gray-700 space-y-4",
        collapsed ? "p-2" : "p-4"
      )}>
        {/* Streak */}
        <div className={clsx(
          "flex items-center bg-orange-50 dark:bg-orange-900/20 rounded-lg",
          collapsed ? "p-2 justify-center" : "gap-3 px-3 py-2"
        )} title={collapsed ? `${streakData.currentStreak} day streak` : undefined}>
          <Flame className={clsx(
            'w-5 h-5 shrink-0',
            streakData.currentStreak > 0
              ? 'text-orange-500 animate-flame'
              : 'text-gray-400'
          )} />
          {!collapsed && (
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {streakData.currentStreak} day streak
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Best: {streakData.longestStreak} days
              </p>
            </div>
          )}
        </div>

        {/* Overall Progress */}
        {!collapsed && (
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
        )}
        {collapsed && (
          <div className="flex justify-center" title={`${progress}% complete`}>
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{progress}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
