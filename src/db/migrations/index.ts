import { db } from '../schema';

export interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export const migrations: Migration[] = [
  {
    version: 2,
    name: 'Add order field to candidates',
    up: async () => {
      const candidates = await db.candidates.toArray();
      
      // Add order field based on current stage ordering
      const candidatesByStage = candidates.reduce<Record<string, typeof candidates>>((acc, candidate) => {
        if (!acc[candidate.stage]) {
          acc[candidate.stage] = [];
        }
        acc[candidate.stage].push(candidate);
        return acc;
      }, {});

      // Sort candidates within each stage by applied date
      Object.values(candidatesByStage).forEach(stageCandidates => {
        stageCandidates.sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime());
      });

      // Update candidates with order values
      await Promise.all(
        Object.values(candidatesByStage).flatMap((stageCandidates) =>
          stageCandidates.map((candidate, index) =>
            db.candidates.update(candidate.id, { order: index })
          )
        )
      );
    },
    down: async () => {
      // No need to remove the order field as it's now part of the schema
    },
  },
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
