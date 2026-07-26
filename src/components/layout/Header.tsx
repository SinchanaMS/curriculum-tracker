import { useLocation } from 'react-router-dom';
import { Sun, Moon, Download, Menu } from 'lucide-react';
import { useCurriculumStore, useSettings } from '../../store';
import UserMenu from '../auth/UserMenu';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/modules': 'Modules',
  '/projects': 'Projects',
  '/dsa': 'DSA Problem Log',
  '/reflections': 'Weekly Reflections',
  '/todos': 'Daily Todos',
  '/settings': 'Settings',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const settings = useSettings();
  const updateSettings = useCurriculumStore(state => state.updateSettings);
  const exportData = useCurriculumStore(state => state.exportData);
  const getCurrentDay = useCurriculumStore(state => state.getCurrentDay);
  const getCurrentWeek = useCurriculumStore(state => state.getCurrentWeek);

  const currentDay = getCurrentDay();
  const currentWeek = getCurrentWeek();

  // Get page title based on route
  const getTitle = () => {
    const basePath = '/' + location.pathname.split('/')[1];
    return routeTitles[basePath] || 'Curriculum Tracker';
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curriculum-tracker-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-14 md:h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Day Counter - hidden on small screens */}
        <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-blue-600 dark:text-blue-400">Day {currentDay}</span>
          <span className="mx-1">of 88</span>
          <span className="text-gray-400 dark:text-gray-500">|</span>
          <span className="ml-1">Week {currentWeek}</span>
        </div>

        {/* Export Button - hidden on mobile */}
        <button
          onClick={handleExport}
          className="hidden md:block p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Export Data"
        >
          <Download className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* User Menu / Sign In */}
        <UserMenu />
      </div>
    </header>
  );
}
