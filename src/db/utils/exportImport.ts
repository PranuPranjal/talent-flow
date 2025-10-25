import { db } from '../schema';
import type { Job, Candidate, Assessment, AssessmentResponse, CandidateTimelineEvent, Note } from '../../types';

export interface DatabaseExport {
  jobs: Job[];
  candidates: Candidate[];
  assessments: Assessment[];
  assessmentResponses: AssessmentResponse[];
  candidateTimeline: CandidateTimelineEvent[];
  notes: Note[];
  exportDate: string;
  version: string;
}

export const exportDatabase = async (): Promise<DatabaseExport> => {
  try {
    const [jobs, candidates, assessments, assessmentResponses, candidateTimeline, notes] = await Promise.all([
      db.jobs.toArray(),
      db.candidates.toArray(),
      db.assessments.toArray(),
      db.assessmentResponses.toArray(),
      db.candidateTimeline.toArray(),
      db.notes.toArray()
    ]);

    return {
      jobs,
      candidates,
      assessments,
      assessmentResponses,
      candidateTimeline,
      notes,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

export const importDatabase = async (data: DatabaseExport): Promise<void> => {
  try {
    await db.transaction('rw', [
      db.jobs,
      db.candidates,
      db.assessments,
      db.assessmentResponses,
      db.candidateTimeline,
      db.notes
    ], async () => {
      // Clear existing data
      await Promise.all([
        db.jobs.clear(),
        db.candidates.clear(),
        db.assessments.clear(),
        db.assessmentResponses.clear(),
        db.candidateTimeline.clear(),
        db.notes.clear()
      ]);

      // Import new data
      await Promise.all([
        db.jobs.bulkAdd(data.jobs),
        db.candidates.bulkAdd(data.candidates),
        db.assessments.bulkAdd(data.assessments),
        db.assessmentResponses.bulkAdd(data.assessmentResponses),
        db.candidateTimeline.bulkAdd(data.candidateTimeline),
        db.notes.bulkAdd(data.notes)
      ]);
    });

    console.log('Database import completed successfully');
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};

export const downloadDatabase = async (): Promise<void> => {
  try {
    const data = await exportDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `talentflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

export const uploadDatabase = async (file: File): Promise<void> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as DatabaseExport;
    
    // Validate data structure
    if (!data.jobs || !data.candidates || !data.assessments) {
      throw new Error('Invalid database file format');
    }
    
    await importDatabase(data);
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
