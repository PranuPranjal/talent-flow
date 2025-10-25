export { db } from '../schema';
export { jobService } from './jobService';
export { candidateService } from './candidateService';
export { assessmentService } from './assessmentService';
import { db } from '../schema';

export const initializeDatabase = async (): Promise<void> => {
  try {
    await db.open();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const cleanupDatabase = async (): Promise<void> => {
  try {
    await db.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Failed to close database:', error);
  }
};

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await db.jobs.count();
    await db.candidates.count();
    await db.assessments.count();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};
