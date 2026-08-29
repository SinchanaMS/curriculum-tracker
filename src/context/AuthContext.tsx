import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOutUser, loadProgressFromFirestore, saveProgressToFirestore } from '../lib/firebase';
import { useCurriculumStore } from '../store';
import { INITIAL_MODULES, INITIAL_PROJECTS } from '../data/initialData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  syncing: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      // If user just signed in, load their data from Firestore
      if (firebaseUser) {
        setSyncing(true);
        try {
          const cloudData = await loadProgressFromFirestore(firebaseUser.uid);
          if (cloudData) {
            // Merge cloud data with local state
            const store = useCurriculumStore.getState();

            // Check if cloud data is newer
            const cloudUpdatedAt = cloudData.updatedAt ? new Date(cloudData.updatedAt).getTime() : 0;
            const localUpdatedAt = store.settings?.lastSyncedAt
              ? new Date(store.settings.lastSyncedAt).getTime()
              : 0;

            if (cloudUpdatedAt > localUpdatedAt) {
              // Cloud data is newer, import it
              // But first, merge any new modules from initial data (like DSA Practice)
              let mergedModules = cloudData.modules || store.modules;

              // Add DSA Practice module if it doesn't exist in cloud data
              const dsaModule = INITIAL_MODULES.find(m => m.id === 'mod-dsa-practice');
              if (dsaModule && !mergedModules.find((m: any) => m.id === 'mod-dsa-practice')) {
                mergedModules = [...mergedModules, dsaModule];
              }

              // Update due dates for existing modules (revised timeline from Aug 29)
              const revisedDueDates: Record<string, string> = {
                'mod-js-foundations': '2026-09-06',      // 8 days (3 in progress)
                'mod-browser-internals': '2026-09-15',   // 9 days
                'mod-react': '2026-09-27',               // 12 days
                'mod-nextjs': '2026-10-05',              // 8 days
                'mod-frontend-architecture': '2026-10-12', // 7 days
                'mod-system-design': '2026-10-22',       // 10 days
                'mod-engineering-breadth': '2026-10-31', // 9 days (buffer)
              };

              mergedModules = mergedModules.map((module: any) => {
                const newDueDate = revisedDueDates[module.id];
                if (newDueDate) {
                  return {
                    ...module,
                    topics: module.topics.map((topic: any) => ({
                      ...topic,
                      dueDate: newDueDate
                    }))
                  };
                }
                return module;
              });

              // Update project due dates and merge prerequisites (revised timeline from Aug 29)
              const projectDueDates: Record<string, string> = {
                'proj-data-table': '2026-09-06',
                'proj-command-palette': '2026-09-15',
                'proj-infinite-feed': '2026-09-27',
                'proj-component-library': '2026-10-05',
                'proj-file-upload': '2026-10-12',
                'proj-realtime-dashboard': '2026-10-22',
                'proj-notion-editor': '2026-10-31',
              };

              const mergedProjects = (cloudData.projects || store.projects).map((project: any) => {
                const initialProject = INITIAL_PROJECTS.find(p => p.id === project.id);
                const newDueDate = projectDueDates[project.id];

                // Merge milestones with prerequisites from initial data
                const mergedMilestones = project.milestones.map((milestone: any, idx: number) => {
                  const initialMilestone = initialProject?.milestones[idx];
                  return {
                    ...milestone,
                    prerequisites: milestone.prerequisites ?? initialMilestone?.prerequisites
                  };
                });

                return {
                  ...project,
                  dueDate: newDueDate || project.dueDate,
                  milestones: mergedMilestones
                };
              });

              useCurriculumStore.setState({
                modules: mergedModules,
                projects: mergedProjects,
                dsaProblems: cloudData.dsaProblems || store.dsaProblems,
                weeklyReflections: cloudData.weeklyReflections || store.weeklyReflections,
                dailyTodos: cloudData.dailyTodos || store.dailyTodos,
                streakData: cloudData.streakData || store.streakData,
                settings: {
                  ...store.settings,
                  lastSyncedAt: new Date().toISOString()
                }
              });
              console.log('Loaded data from cloud (with merged updates)');
            } else {
              // Local data is newer, sync to cloud
              await syncDataToCloud(firebaseUser.uid);
            }
          } else {
            // No cloud data, sync local data to cloud
            await syncDataToCloud(firebaseUser.uid);
          }
        } catch (error) {
          console.error('Error syncing data:', error);
        }
        setSyncing(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync local data to cloud
  const syncDataToCloud = async (userId: string) => {
    const store = useCurriculumStore.getState();
    const dataToSync = {
      modules: store.modules,
      projects: store.projects,
      dsaProblems: store.dsaProblems,
      weeklyReflections: store.weeklyReflections,
      dailyTodos: store.dailyTodos,
      streakData: store.streakData,
      settings: store.settings
    };

    const success = await saveProgressToFirestore(userId, dataToSync);
    if (success) {
      useCurriculumStore.setState({
        settings: {
          ...store.settings,
          lastSyncedAt: new Date().toISOString()
        }
      });
    }
    return success;
  };

  const signIn = async () => {
    const firebaseUser = await signInWithGoogle();
    if (firebaseUser) {
      setUser(firebaseUser);
    }
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
  };

  const syncToCloud = async () => {
    if (!user) return;
    setSyncing(true);
    await syncDataToCloud(user.uid);
    setSyncing(false);
  };

  const syncFromCloud = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const cloudData = await loadProgressFromFirestore(user.uid);
      if (cloudData) {
        const store = useCurriculumStore.getState();

        // Merge any new modules from initial data (like DSA Practice)
        let mergedModules = cloudData.modules || store.modules;

        const dsaModule = INITIAL_MODULES.find(m => m.id === 'mod-dsa-practice');
        if (dsaModule && !mergedModules.find((m: any) => m.id === 'mod-dsa-practice')) {
          mergedModules = [...mergedModules, dsaModule];
        }

        // Update due dates for existing modules (revised timeline from Aug 29)
        const revisedDueDates: Record<string, string> = {
          'mod-js-foundations': '2026-09-06',      // 8 days (3 in progress)
          'mod-browser-internals': '2026-09-15',   // 9 days
          'mod-react': '2026-09-27',               // 12 days
          'mod-nextjs': '2026-10-05',              // 8 days
          'mod-frontend-architecture': '2026-10-12', // 7 days
          'mod-system-design': '2026-10-22',       // 10 days
          'mod-engineering-breadth': '2026-10-31', // 9 days (buffer)
        };

        mergedModules = mergedModules.map((module: any) => {
          const newDueDate = revisedDueDates[module.id];
          if (newDueDate) {
            return {
              ...module,
              topics: module.topics.map((topic: any) => ({
                ...topic,
                dueDate: newDueDate
              }))
            };
          }
          return module;
        });

        // Update project due dates and merge prerequisites (revised timeline from Aug 29)
        const projectDueDates: Record<string, string> = {
          'proj-data-table': '2026-09-06',
          'proj-command-palette': '2026-09-15',
          'proj-infinite-feed': '2026-09-27',
          'proj-component-library': '2026-10-05',
          'proj-file-upload': '2026-10-12',
          'proj-realtime-dashboard': '2026-10-22',
          'proj-notion-editor': '2026-10-31',
        };

        const mergedProjects = (cloudData.projects || store.projects).map((project: any) => {
          const initialProject = INITIAL_PROJECTS.find(p => p.id === project.id);
          const newDueDate = projectDueDates[project.id];

          // Merge milestones with prerequisites from initial data
          const mergedMilestones = project.milestones.map((milestone: any, idx: number) => {
            const initialMilestone = initialProject?.milestones[idx];
            return {
              ...milestone,
              prerequisites: milestone.prerequisites ?? initialMilestone?.prerequisites
            };
          });

          return {
            ...project,
            dueDate: newDueDate || project.dueDate,
            milestones: mergedMilestones
          };
        });

        useCurriculumStore.setState({
          modules: mergedModules,
          projects: mergedProjects,
          dsaProblems: cloudData.dsaProblems || store.dsaProblems,
          weeklyReflections: cloudData.weeklyReflections || store.weeklyReflections,
          dailyTodos: cloudData.dailyTodos || store.dailyTodos,
          streakData: cloudData.streakData || store.streakData,
          settings: {
            ...store.settings,
            lastSyncedAt: new Date().toISOString()
          }
        });
        console.log('Loaded data from cloud (with merged updates)');
      }
    } catch (error) {
      console.error('Error loading from cloud:', error);
    }
    setSyncing(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, syncing, signIn, signOut, syncToCloud, syncFromCloud }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
