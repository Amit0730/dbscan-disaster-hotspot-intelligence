import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  logoutFirebase,
  isFirebaseConfigured,
  getStoredFirebaseConfig,
  saveFirebaseConfig,
} from '../config/firebase';

const AuthContext = createContext();

const PRESET_USERS = {
  commander: {
    id: 'usr-001',
    name: 'Cmdr. Sarah Vance',
    email: 'sarah.vance@disaster-response.org',
    callsign: 'COMMANDER',
    role: 'Search & Rescue Lead',
    clearance: 'Level-5 USAR Operations',
    sector: 'Sector Alpha - Urban Collapse',
  },
  operator: {
    id: 'usr-002',
    name: 'Lt. Marcus Drake',
    email: 'marcus.drake@drone-recon.org',
    callsign: 'UAV-PILOT',
    role: 'UAV RECON PILOT',
    clearance: 'Level-4 Flight Operations',
    sector: 'Sector Bravo - Industrial Hazard',
  },
  analyst: {
    id: 'usr-003',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@geospatial-ai.org',
    callsign: 'GIS-ANALYST',
    role: 'THERMAL & GIS ANALYST',
    clearance: 'Level-4 Data Intelligence',
    sector: 'Sector Charlie - Flood Recon',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('disaster_intel_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('disaster_intel_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('disaster_intel_auth_user');
    }
  }, [user]);

  // 1. Google Sign-In via Firebase
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const authResult = await signInWithGoogle();
      setUser(authResult);
      return authResult;
    } finally {
      setLoading(false);
    }
  };

  // 2. Email & Password Sign-In
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const authResult = await signInWithEmail(email, password);
      setUser(authResult);
      return authResult;
    } finally {
      setLoading(false);
    }
  };

  // 3. Email & Password Registration (Create Account)
  const registerUser = async (name, email, password, role) => {
    setLoading(true);
    try {
      const authResult = await registerWithEmail(name, email, password, role);
      setUser(authResult);
      return authResult;
    } finally {
      setLoading(false);
    }
  };

  // 4. Quick Demo Preset Roles (for fast hackathon review / testing)
  const loginWithPreset = async (presetKey) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const selected = PRESET_USERS[presetKey] || PRESET_USERS.commander;
    const authResult = {
      ...selected,
      provider: 'preset',
      token: `demo_token_${Date.now()}`,
      authenticatedAt: new Date().toISOString(),
    };
    setUser(authResult);
    setLoading(false);
    return authResult;
  };

  // 5. Logout
  const logout = async () => {
    await logoutFirebase();
    setUser(null);
    localStorage.removeItem('disaster_intel_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerUser,
        loginWithPreset,
        logout,
        presetUsers: PRESET_USERS,
        isFirebaseConfigured,
        getStoredFirebaseConfig,
        saveFirebaseConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

