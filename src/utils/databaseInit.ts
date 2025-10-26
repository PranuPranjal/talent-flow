import { db } from '../db/schema';
import { seedDatabase } from '../data/seedData';

const SEED_KEY = 'talentflow_seeded';
const SEED_VERSION = '1.0.0';

export async function initializeDatabase(): Promise<void> {
  try {
    await db.open();
    console.log('Database opened successfully');

    const seeded = localStorage.getItem(SEED_KEY);
    const seedVersion = localStorage.getItem(`${SEED_KEY}_version`);

    if (!seeded || seedVersion !== SEED_VERSION) {
      console.log('Seeding database...');
      const result = await seedDatabase();
      localStorage.setItem(SEED_KEY, 'true');
      localStorage.setItem(`${SEED_KEY}_version`, SEED_VERSION);
      console.log('Database seeded:', result);
    } else {
      console.log('Database already seeded');
      
      const jobCount = await db.jobs.count();
      if (jobCount === 0) {
        console.log('Database is empty, seeding...');
        const result = await seedDatabase();
        console.log('Database seeded:', result);
      }
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function resetDatabase(): Promise<void> {
  try {
    await db.transaction('rw', [db.jobs, db.candidates, db.assessments, db.assessmentResponses, db.candidateTimeline, db.notes], async () => {
      await Promise.all([
        db.jobs.clear(),
        db.candidates.clear(),
        db.assessments.clear(),
        db.assessmentResponses.clear(),
        db.candidateTimeline.clear(),
        db.notes.clear()
      ]);
    });

    localStorage.removeItem(SEED_KEY);
    localStorage.removeItem(`${SEED_KEY}_version`);
    
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
}
