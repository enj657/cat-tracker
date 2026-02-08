/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  household_id: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, household_id: number) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('http://localhost:3000/users/current', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch('http://localhost:3000/users/sign_in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user: { email, password } }),
    });

    if (!res.ok) {
      throw new Error('Login failed');
    }

    const data = await res.json();
    setUser(data.user);
  };

  const signup = async (email: string, password: string, name: string, household_id: number) => {
    const res = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        user: { email, password, password_confirmation: password, name, household_id } 
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.errors?.join(', ') || 'Signup failed');
    }

    const data = await res.json();
    setUser(data.user);
  };

  const logout = async () => {
    await fetch('http://localhost:3000/users/sign_out', {
      method: 'DELETE',
      credentials: 'include',
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}