import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { checkDatabaseHealth } from '../db/services';
import { initializeDatabase as initDb } from '../utils/databaseInit';

interface DatabaseContextType {
  isInitialized: boolean;
  isHealthy: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider = ({ children }: DatabaseProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHealthy, setIsHealthy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        setError(null);
        await initDb();
        setIsInitialized(true);
        
        // Check database health
        const healthy = await checkDatabaseHealth();
        setIsHealthy(healthy);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize database';
        setError(errorMessage);
        console.error('Database initialization failed:', err);
      }
    };

    initDatabase();
  }, []);

  const value: DatabaseContextType = {
    isInitialized,
    isHealthy,
    error
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
