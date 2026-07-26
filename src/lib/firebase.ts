import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAIIZlOyvhL_Fs4yYVHQkZyBuVmtDxK3AY",
  authDomain: "curriculum-tracker-c1e82.firebaseapp.com",
  projectId: "curriculum-tracker-c1e82",
  storageBucket: "curriculum-tracker-c1e82.firebasestorage.app",
  messagingSenderId: "212563085450",
  appId: "1:212563085450:web:7ded091691d69b1c3a0573"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return null;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions for progress
export const saveProgressToFirestore = async (userId: string, data: any): Promise<boolean> => {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'progress');
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    console.log('Progress saved to Firebase');
    return true;
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    return false;
  }
};

export const loadProgressFromFirestore = async (userId: string): Promise<any | null> => {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'progress');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log('Progress loaded from Firebase');
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error loading from Firestore:', error);
    return null;
  }
};
