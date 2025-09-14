import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  username: string;
  role: string;
}

interface AdminContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Admin credentials (in a real app, this would be handled by a backend)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Check if admin is already logged in (from localStorage)
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const adminUser = { username, role: 'admin' };
      setUser(adminUser);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminUser');
  };

  return (
    <AdminContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};