import { StateStorage } from 'zustand/middleware';

// Uses Vite dev server's built-in API endpoint (via vite-plugin-progress)
const API_URL = '/api/progress';

let migrationDone = false;

// Custom storage that saves to JSON file via Vite plugin
export const fileStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();

      // If file has data, use it
      if (data && data.modules) {
        console.log('✓ Loaded progress from data/progress.json');
        return JSON.stringify({ state: data, version: data._version || 0 });
      }

      // File is empty - check if we should migrate from localStorage
      const localData = localStorage.getItem(name);
      if (localData && !migrationDone) {
        console.log('Migrating localStorage to file...');
        migrationDone = true;
        // Save localStorage data to file
        await fileStorage.setItem(name, localData);
        console.log('✓ Migrated localStorage to data/progress.json');
        return localData;
      }

      return localData;
    } catch (error) {
      console.warn('File storage unavailable, using localStorage');
      return localStorage.getItem(name);
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    // Always save to localStorage as backup
    localStorage.setItem(name, value);

    try {
      const parsed = JSON.parse(value);
      const dataToSave = {
        ...parsed.state,
        _version: parsed.version,
        _savedAt: new Date().toISOString()
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      if (!response.ok) throw new Error('Failed to save');
    } catch (error) {
      console.warn('File storage unavailable, saved to localStorage only');
    }
  },

  removeItem: async (name: string): Promise<void> => {
    localStorage.removeItem(name);
  }
};
