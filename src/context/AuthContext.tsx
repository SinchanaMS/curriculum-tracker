import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOutUser, loadProgressFromFirestore, saveProgressToFirestore } from '../lib/firebase';
import { useCurriculumStore } from '../store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  syncing: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  syncToCloud: () => Promise<void>;
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
              useCurriculumStore.setState({
                modules: cloudData.modules || store.modules,
                projects: cloudData.projects || store.projects,
                dsaProblems: cloudData.dsaProblems || store.dsaProblems,
                weeklyReflections: cloudData.weeklyReflections || store.weeklyReflections,
                dailyTodos: cloudData.dailyTodos || store.dailyTodos,
                streakData: cloudData.streakData || store.streakData,
                settings: {
                  ...store.settings,
                  lastSyncedAt: new Date().toISOString()
                }
              });
              console.log('Loaded data from cloud');
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

  return (
    <AuthContext.Provider value={{ user, loading, syncing, signIn, signOut, syncToCloud }}>
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
