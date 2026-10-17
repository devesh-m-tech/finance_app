import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient } from '@shared/api-client/client';
import { evaluatePermissions } from '@shared/permissions/usePermissions';

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  mobile: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'SALESPERSON';
  branch?: { _id: string; name: string; code: string };
  permissionsVersion: number;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  permissions: string[];
  restrictions: any | null;
  isLoading: boolean;
  login: (username: string, password?: string, pin?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (key: string) => boolean;
  hasAnyPermission: (keys: string[]) => boolean;
  isModuleBlocked: (module: string) => boolean;
  api: ApiClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const api = React.useMemo(() => {
    return new ApiClient({
      baseUrl: API_BASE_URL,
      getAccessToken: () => token,
      getRefreshToken: () => refreshToken,
      onTokenRefreshed: (newToken) => setToken(newToken),
      onUnauthorized: () => logout(),
    });
  }, [token, refreshToken]);

  const login = async (username: string, password?: string, pin?: string) => {
    setIsLoading(true);
    try {
      const endpoint = pin ? '/auth/pin-login' : '/auth/login';
      const body = pin ? { username, pin } : { username, password };

      const res = await api.post<any>(endpoint, body);

      if (res.success && res.data) {
        setToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setUser(res.data.user);
        setPermissions(res.data.permissions || []);
        setRestrictions(res.data.restrictions || null);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: res.error?.message || 'Login failed' };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setPermissions([]);
    setRestrictions(null);
  };

  const permEvaluator = evaluatePermissions({
    role: user?.role || 'SALESPERSON',
    permissions,
    restrictions,
    permissionsVersion: user?.permissionsVersion || 1,
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        restrictions,
        isLoading,
        login,
        logout,
        hasPermission: permEvaluator.hasPermission,
        hasAnyPermission: permEvaluator.hasAnyPermission,
        isModuleBlocked: permEvaluator.isModuleBlocked,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
