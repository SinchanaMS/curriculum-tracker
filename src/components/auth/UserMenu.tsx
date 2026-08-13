import { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, User, Cloud, CloudDownload, CloudUpload, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserMenu() {
  const { user, loading, syncing, signIn, signOut, syncToCloud, syncFromCloud } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <LogIn className="w-4 h-4" />
        <span>Sign in</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        {syncing && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <Loader2 className="w-3 h-3 animate-spin text-white" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                syncFromCloud();
                setIsOpen(false);
              }}
              disabled={syncing}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CloudDownload className="w-4 h-4" />
              )}
              <span>Pull from cloud</span>
            </button>

            <button
              onClick={() => {
                syncToCloud();
                setIsOpen(false);
              }}
              disabled={syncing}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4" />
              )}
              <span>Push to cloud</span>
            </button>

            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>

          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {syncing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Syncing to cloud...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3 h-3 text-green-500" />
                  <span>Auto-sync enabled</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
