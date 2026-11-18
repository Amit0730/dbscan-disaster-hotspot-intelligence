import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const getStoredFirebaseConfig = () => {
  try {
    const stored = localStorage.getItem('disaster_intel_firebase_config');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading stored firebase config', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
};

export const saveFirebaseConfig = (config) => {
  try {
    localStorage.setItem('disaster_intel_firebase_config', JSON.stringify(config));
    window.location.reload();
  } catch (e) {
    console.error('Error saving firebase config', e);
  }
};

export const isFirebaseConfigured = () => {
  const cfg = getStoredFirebaseConfig();
  return Boolean(cfg.apiKey && cfg.apiKey.length > 5 && cfg.projectId);
};

let app = null;
let auth = null;
let googleProvider = null;

try {
  const config = getStoredFirebaseConfig();
  if (config.apiKey && config.projectId) {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  }
} catch (err) {
  console.warn('Firebase initialization note:', err.message);
}

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  const config = getStoredFirebaseConfig();
  
  if (auth && googleProvider && isFirebaseConfigured()) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      return {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Google User',
        email: user.email,
        role: 'FIELD FIRST RESPONDER',
        avatar: user.photoURL || null,
        provider: 'google',
        token: await user.getIdToken(),
        authenticatedAt: new Date().toISOString(),
      };
    } catch (firebaseErr) {
      console.warn('Firebase Google popup issue:', firebaseErr);
      if (firebaseErr.code === 'auth/popup-closed-by-user') {
        throw new Error('Google sign-in popup was closed before completing.');
      }
    }
  }

  // Instant clean fallback for demo/offline testing
  await new Promise((r) => setTimeout(r, 600));
  return {
    id: `usr-google-${Date.now()}`,
    name: 'Disaster Recon Specialist',
    email: 'specialist@disaster-response.org',
    role: 'INCIDENT COMMANDER',
    avatar: null,
    provider: 'google',
    token: `google_token_${Date.now()}`,
    authenticatedAt: new Date().toISOString(),
  };
};

/**
 * Sign in with Email and Password
 */
export const signInWithEmail = async (email, password) => {
  if (auth && isFirebaseConfigured()) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      return {
        id: user.uid,
        name: user.displayName || email.split('@')[0],
        email: user.email,
        role: 'DISASTER FIELD OPERATOR',
        avatar: null,
        provider: 'firebase-email',
        token: await user.getIdToken(),
        authenticatedAt: new Date().toISOString(),
      };
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password.');
      }
      if (err.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      throw new Error(err.message || 'Authentication failed');
    }
  }

  // Local / Demo Mode Sign In
  await new Promise((r) => setTimeout(r, 500));
  const username = email.split('@')[0];
  return {
    id: `usr-${Date.now().toString().slice(-4)}`,
    name: username.charAt(0).toUpperCase() + username.slice(1),
    email: email,
    role: 'DISASTER FIELD OPERATOR',
    avatar: null,
    provider: 'email',
    token: `local_token_${Date.now()}`,
    authenticatedAt: new Date().toISOString(),
  };
};

/**
 * Create a new account with Name, Email, Password, and Role
 */
export const registerWithEmail = async (name, email, password, role = 'INCIDENT COMMANDER') => {
  if (auth && isFirebaseConfigured()) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      if (name) {
        await updateProfile(user, { displayName: name });
      }
      return {
        id: user.uid,
        name: name || email.split('@')[0],
        email: user.email,
        role: role,
        avatar: null,
        provider: 'firebase-email',
        token: await user.getIdToken(),
        authenticatedAt: new Date().toISOString(),
      };
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      if (err.code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters.');
      }
      throw new Error(err.message || 'Account registration failed.');
    }
  }

  // Local / Demo Mode Registration
  await new Promise((r) => setTimeout(r, 600));
  return {
    id: `usr-${Date.now().toString().slice(-4)}`,
    name: name || email.split('@')[0],
    email: email,
    role: role,
    avatar: null,
    provider: 'email',
    token: `local_token_${Date.now()}`,
    authenticatedAt: new Date().toISOString(),
  };
};

/**
 * Sign out
 */
export const logoutFirebase = async () => {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout error', e);
    }
  }
};
