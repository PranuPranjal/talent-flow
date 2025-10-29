import { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { candidateService } from '../db/services';
import type { ReactNode } from 'react';

type Role = 'admin' | 'candidate';

type User = {
  id: string;
  role: Role;
  name?: string;
};

type AuthContextValue = {
  user: User | null;
  login: (username: string, password: string) => Promise<User | void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'tf_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as User : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = async (username: string, password: string) => {
    // admin login
    if (username === 'admin' && password === 'admin') {
      const u: User = { id: 'admin', role: 'admin', name: 'Admin' };
      setUser(u);
      return u;
    }

    // candidate login: username is candidate id, password must be 'candidate'
    if (password !== 'candidate') throw new Error('Invalid credentials');

    const candidate = await candidateService.getCandidateById(username);
    if (!candidate) throw new Error('Candidate not found');

    const u: User = { id: candidate.id, role: 'candidate', name: candidate.name };
    setUser(u);
    return u;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const RequireAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const RequireAdmin: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Guard that restricts candidate users to only allowed routes (their profile and assessment take)
export const CandidateRouteGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // If not logged in, let RequireAuth handle redirect
  if (!user) return <>{children}</>;

  // Admins can access everything
  if (user.role === 'admin') return <>{children}</>;

  // Candidate: only allow access to their profile and assessment take route
  const pathname = location.pathname;
  const profilePath = `/candidates/${user.id}`;
  const assessmentTakeMatch = /^\/assessments\/[^/]+\/take\/?$/;

  if (pathname === profilePath || assessmentTakeMatch.test(pathname)) {
    return <>{children}</>;
  }

  // Redirect candidate to their profile
  return <Navigate to={profilePath} replace />;
};

export default AuthContext;