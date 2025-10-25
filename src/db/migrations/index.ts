import { db } from '../schema';

export interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export const migrations: Migration[] = [
  // future migrations will be added here
];

export const runMigrations = async (): Promise<void> => {
  try {
    const currentVersion = db.verno;
    console.log(`Current database version: ${currentVersion}`);
    
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        console.log(`Running migration: ${migration.name}`);
        await migration.up();
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};
