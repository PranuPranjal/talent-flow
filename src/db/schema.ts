import Dexie, { type Table } from 'dexie';
import type { Job, Candidate, Assessment, AssessmentResponse, CandidateTimelineEvent, Note, User } from '../types';

export class TalentFlowDB extends Dexie {
  // tables
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment>;
  assessmentResponses!: Table<AssessmentResponse>;
  candidateTimeline!: Table<CandidateTimelineEvent>;
  notes!: Table<Note>;
  users!: Table<User>;

  constructor() {
    super('TalentFlowDB');
    
    this.version(1).stores({
      jobs: 'id, title, slug, status, order, createdAt, updatedAt',
      candidates: 'id, name, email, stage, jobId, appliedAt, updatedAt',
      assessments: 'id, jobId, title, createdAt, updatedAt',
      assessmentResponses: 'id, candidateId, assessmentId, completedAt',
      candidateTimeline: 'id, candidateId, type, timestamp',
      notes: 'id, candidateId, createdAt, createdBy',
      users: 'id, name, email, role'
    });

    // hooks for automatic timestamps
    this.jobs.hook('creating', function (_, obj) {
      (obj as Job).createdAt = new Date().toISOString();
      (obj as Job).updatedAt = new Date().toISOString();
    });

    this.jobs.hook('updating', function (modifications) {
      (modifications as Partial<Job>).updatedAt = new Date().toISOString();
    });

    this.candidates.hook('creating', function (_, obj) {
      (obj as Candidate).appliedAt = new Date().toISOString();
      (obj as Candidate).updatedAt = new Date().toISOString();
    });

    this.candidates.hook('updating', function (modifications) {
      (modifications as Partial<Candidate>).updatedAt = new Date().toISOString();
    });

    this.assessments.hook('creating', function (_, obj) {
      (obj as Assessment).createdAt = new Date().toISOString();
      (obj as Assessment).updatedAt = new Date().toISOString();
    });

    this.assessments.hook('updating', function (modifications) {
      (modifications as Partial<Assessment>).updatedAt = new Date().toISOString();
    });

    this.candidateTimeline.hook('creating', function (_, obj) {
      (obj as CandidateTimelineEvent).timestamp = new Date().toISOString();
    });

    this.notes.hook('creating', function (_, obj) {
      (obj as Note).createdAt = new Date().toISOString();
    });
  }
}

export const db = new TalentFlowDB();
