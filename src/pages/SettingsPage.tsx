import { useState, useRef } from 'react';
import { Sun, Moon, Monitor, Download, Upload, RotateCcw } from 'lucide-react';
import { Card, Button, Input } from '../components/ui';
import { useSettings, useCurriculumStore } from '../store';

export default function SettingsPage() {
  const settings = useSettings();
  const updateSettings = useCurriculumStore(state => state.updateSettings);
  const exportData = useCurriculumStore(state => state.exportData);
  const importData = useCurriculumStore(state => state.importData);
  const resetAllData = useCurriculumStore(state => state.resetAllData);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = importData(text);
      setImportStatus(success ? 'success' : 'error');
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Customize your tracker and manage your data
        </p>
      </div>

      {/* Theme Settings */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
        <div className="flex gap-3">
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => updateSettings({ theme: value })}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                settings.theme === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Icon className={`w-6 h-6 ${
                settings.theme === value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
              }`} />
              <span className={`text-sm font-medium ${
                settings.theme === value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Daily Goals */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Goals</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Set your daily targets to stay on track
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Topics per day"
            type="number"
            min="1"
            max="10"
            value={settings.dailyGoal.topics.toString()}
            onChange={(e) => updateSettings({
              dailyGoal: { ...settings.dailyGoal, topics: parseInt(e.target.value) || 1 }
            })}
          />
          <Input
            label="DSA problems"
            type="number"
            min="1"
            max="10"
            value={settings.dailyGoal.problems.toString()}
            onChange={(e) => updateSettings({
              dailyGoal: { ...settings.dailyGoal, problems: parseInt(e.target.value) || 1 }
            })}
          />
          <Input
            label="Study minutes"
            type="number"
            min="30"
            max="480"
            step="30"
            value={settings.dailyGoal.studyMinutes.toString()}
            onChange={(e) => updateSettings({
              dailyGoal: { ...settings.dailyGoal, studyMinutes: parseInt(e.target.value) || 60 }
            })}
          />
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>

        <div className="space-y-4">
          {/* Export */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Export Data</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Download all your data as JSON
              </p>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          {/* Import */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Import Data</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Restore from a previous export
              </p>
              {importStatus === 'success' && (
                <p className="text-sm text-green-500 mt-1">Import successful!</p>
              )}
              {importStatus === 'error' && (
                <p className="text-sm text-red-500 mt-1">Import failed. Check file format.</p>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <Upload className="w-4 h-4" />
                Import
              </Button>
            </div>
          </div>

          {/* Reset */}
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div>
              <h4 className="font-medium text-red-700 dark:text-red-400">Reset All Data</h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                This will permanently delete all your progress
              </p>
            </div>
            {showResetConfirm ? (
              <div className="flex gap-2">
                <Button onClick={handleReset} variant="danger" size="sm">
                  Confirm Reset
                </Button>
                <Button onClick={() => setShowResetConfirm(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowResetConfirm(true)} variant="outline">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* About */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">About</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>
            <strong className="text-gray-900 dark:text-white">Curriculum Tracker</strong> - Your 88-day frontend engineering journey
          </p>
          <p>
            Start Date: July 19, 2026
          </p>
          <p>
            Duration: 12 weeks / 88 days
          </p>
          <p className="pt-2 text-gray-500">
            Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </Card>
    </div>
  );
}
