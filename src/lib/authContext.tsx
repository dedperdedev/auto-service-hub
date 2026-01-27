import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, AuthContextType, Permission, rolePermissions } from './types';
import { users } from './mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock credentials
const MOCK_CREDENTIALS = {
  'owner@autoservice.ru': { password: 'owner123', userId: 'user-1' },
  'manager@autoservice.ru': { password: 'manager123', userId: 'user-2' },
  'staff@autoservice.ru': { password: 'staff123', userId: 'user-3' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage for persisted session
    const savedUserId = localStorage.getItem('crm_user_id');
    if (savedUserId) {
      return users.find(u => u.id === savedUserId) || null;
    }
    return null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const creds = MOCK_CREDENTIALS[email as keyof typeof MOCK_CREDENTIALS];
    if (creds && creds.password === password) {
      const foundUser = users.find(u => u.id === creds.userId);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('crm_user_id', foundUser.id);
        return true;
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('crm_user_id');
  }, []);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return rolePermissions[user.role].includes(permission);
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
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
