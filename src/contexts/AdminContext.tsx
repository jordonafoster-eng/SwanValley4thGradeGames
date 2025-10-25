import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'he4g_admin_session';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'fosteradmin';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    return saved === 'true';
  });

  useEffect(() => {
    if (isAdmin) {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, [isAdmin]);

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
