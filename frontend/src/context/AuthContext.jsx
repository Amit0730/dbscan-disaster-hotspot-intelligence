import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const PRESET_USERS = {
  commander: {
    id: 'usr-001',
    name: 'Cmdr. Sarah Vance',
    callsign: 'AEGIS-LEAD-01',
    role: 'RESCUE COMMANDER',
    clearance: 'LEVEL-5 USAR TOP SECRET',
    sector: 'Sector Alpha - Urban Collapse',
    avatar: '🛡️',
  },
  operator: {
    id: 'usr-002',
    name: 'Lt. Marcus Drake',
    callsign: 'RECON-PILOT-04',
    role: 'UAV DRONE OPERATOR',
    clearance: 'LEVEL-4 FLIGHT OPERATIONS',
    sector: 'Sector Bravo - Industrial Hazard',
    avatar: '🛰️',
  },
  analyst: {
    id: 'usr-003',
    name: 'Dr. Elena Rostova',
    callsign: 'GEO-ANALYST-09',
    role: 'THERMAL & GIS ANALYST',
    clearance: 'LEVEL-4 SCIENTIFIC ADVISOR',
    sector: 'Sector Charlie - Flood Recon',
    avatar: '📊',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aegis_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aegis_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aegis_auth_user');
    }
  }, [user]);

  const loginWithPreset = async (presetKey) => {
    setLoading(true);
    // Simulate brief tactical network handshake
    await new Promise((r) => setTimeout(r, 600));
    const selected = PRESET_USERS[presetKey] || PRESET_USERS.commander;
    setUser({
      ...selected,
      token: `jwt_aegis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      authenticatedAt: new Date().toISOString(),
    });
    setLoading(false);
    return true;
  };

  const loginWithCredentials = async (callsign, password, sector = 'Sector Alpha - Urban Collapse') => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    
    // Accept any valid callsign or password in demo mode
    const authenticatedUser = {
      id: `usr-${Math.floor(Math.random() * 900 + 100)}`,
      name: callsign.toUpperCase(),
      callsign: callsign.toUpperCase().includes('AEGIS') ? callsign.toUpperCase() : `TAC-${callsign.toUpperCase()}`,
      role: 'DISASTER FIELD OPERATOR',
      clearance: 'LEVEL-4 TACTICAL FIELD UNIT',
      sector: sector || 'Sector Alpha - Urban Collapse',
      avatar: '🎖️',
      token: `jwt_aegis_${Date.now()}`,
      authenticatedAt: new Date().toISOString(),
    };

    setUser(authenticatedUser);
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aegis_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginWithPreset,
        loginWithCredentials,
        logout,
        presetUsers: PRESET_USERS,
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
