import { db } from '../schema';
import type { Candidate, CandidateTimelineEvent, Note, PaginatedResponse } from '../../types';

export class CandidateService {
  // candidates with pagination and filtering
  async getCandidates(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    stage?: string;
    jobId?: string;
    sort?: string;
  }): Promise<PaginatedResponse<Candidate>> {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      stage,
      jobId,
      sort = 'appliedAt'
    } = params;

    let collection = db.candidates.orderBy(sort);

    // filters
    if (stage) {
      collection = collection.filter(candidate => candidate.stage === stage);
    }

    if (jobId) {
      collection = collection.filter(candidate => candidate.jobId === jobId);
    }

    if (search) {
      collection = collection.filter(candidate => 
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // total count
    const total = await collection.count();

    // apply pagination
    const offset = (page - 1) * pageSize;
    const data = await collection.offset(offset).limit(pageSize).toArray();
    
    // Sort by order within each stage
    const sortedData = data.sort((a, b) => {
      if (a.stage !== b.stage) return 0; // Don't sort across stages
      return (a.order || 0) - (b.order || 0);
    });

    return {
      data: sortedData,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  // single candidate by ID
  async getCandidateById(id: string): Promise<Candidate | undefined> {
    return await db.candidates.get(id);
  }

  // create new candidate
  async createCandidate(candidateData: Omit<Candidate, 'id' | 'appliedAt' | 'updatedAt'>): Promise<Candidate> {
    const id = this.generateId();
    const candidate: Candidate = {
      ...candidateData,
      id,
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.candidates.add(candidate);
    
    // add timeline event
    await this.addTimelineEvent(candidate.id, {
      type: 'stage_change',
      description: `Applied for position`,
      userId: 'system'
    });

    return candidate;
  }

  // update candidate
  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | undefined> {
    const candidate = await db.candidates.get(id);
    if (!candidate) return undefined;

    const updatedCandidate = {
      ...candidate,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await db.candidates.put(updatedCandidate);
    return updatedCandidate;
  }

  // reorder candidates within a stage
  async reorderCandidatesInStage(_stage: string, candidateIds: string[]): Promise<void> {
    await db.transaction('rw', db.candidates, async () => {
      const updates = candidateIds.map((id, index) => ({
        id,
        order: index
      }));

      for (const update of updates) {
        await db.candidates.update(update.id, { order: update.order });
      }
    });
  }

  // update candidate stage
  async updateCandidateStage(id: string, newStage: Candidate['stage']): Promise<Candidate | undefined> {
    const candidate = await db.candidates.get(id);
    if (!candidate) return undefined;

    const oldStage = candidate.stage;
    const updatedCandidate = await this.updateCandidate(id, { stage: newStage });

    if (updatedCandidate) {
      await this.addTimelineEvent(id, {
        type: 'stage_change',
        description: `Moved from ${oldStage} to ${newStage}`,
        userId: 'system'
      });
    }

    return updatedCandidate;
  }

  // get candidate timeline
  async getCandidateTimeline(candidateId: string): Promise<CandidateTimelineEvent[]> {
    return await db.candidateTimeline
      .where('candidateId')
      .equals(candidateId)
      .sortBy('timestamp')
      .then(events => events.reverse());
  }

  // add timeline event
  async addTimelineEvent(candidateId: string, event: Omit<CandidateTimelineEvent, 'id' | 'candidateId' | 'timestamp'>): Promise<CandidateTimelineEvent> {
    const id = this.generateId();
    const timelineEvent: CandidateTimelineEvent = {
      ...event,
      id,
      candidateId,
      timestamp: new Date().toISOString()
    };

    await db.candidateTimeline.add(timelineEvent);
    return timelineEvent;
  }

  // candidate notes
  async getCandidateNotes(candidateId: string): Promise<Note[]> {
    return await db.notes
      .where('candidateId')
      .equals(candidateId)
      .sortBy('createdAt')
      .then(notes => notes.reverse());
  }

  // add note
  async addNote(candidateId: string, noteData: Omit<Note, 'id' | 'candidateId' | 'createdAt'>): Promise<Note> {
    const id = this.generateId();
    const note: Note = {
      ...noteData,
      id,
      candidateId,
      createdAt: new Date().toISOString()
    };

    await db.notes.add(note);

    await this.addTimelineEvent(candidateId, {
      type: 'note_added',
      description: 'Note added',
      userId: note.createdBy
    });

    return note;
  }

  // get candidates by stage
  async getCandidatesByStage(stage: Candidate['stage']): Promise<Candidate[]> {
    return await db.candidates.where('stage').equals(stage).toArray();
  }

  // get candidate statistics
  async getCandidateStats(): Promise<{
    total: number;
    byStage: Record<Candidate['stage'], number>;
  }> {
    const total = await db.candidates.count();
    const byStage = {
      applied: await db.candidates.where('stage').equals('applied').count(),
      screen: await db.candidates.where('stage').equals('screen').count(),
      tech: await db.candidates.where('stage').equals('tech').count(),
      offer: await db.candidates.where('stage').equals('offer').count(),
      hired: await db.candidates.where('stage').equals('hired').count(),
      rejected: await db.candidates.where('stage').equals('rejected').count()
    };

    return { total, byStage };
  }

  // delete candidate
  async deleteCandidate(id: string): Promise<boolean> {
    await db.transaction('rw', [db.candidates, db.candidateTimeline, db.notes], async () => {
      await db.candidateTimeline.where('candidateId').equals(id).delete();
      await db.notes.where('candidateId').equals(id).delete();
      
      await db.candidates.delete(id);
    });

    return true;
  }

  // generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const candidateService = new CandidateService();
