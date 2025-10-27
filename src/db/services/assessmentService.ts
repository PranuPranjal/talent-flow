import { db } from '../schema';
import type { Assessment, AssessmentResponse, PaginatedResponse } from '../../types';

export class AssessmentService {
  // assessments
  async getAssessments(params: {
    page?: number;
    pageSize?: number;
    jobId?: string;
    search?: string;
  }): Promise<PaginatedResponse<Assessment>> {
    const {
      page = 1,
      pageSize = 10,
      jobId,
      search = ''
    } = params;

    let collection = db.assessments.orderBy('createdAt');

    // filters
    if (jobId) {
      collection = collection.filter(assessment => assessment.jobId === jobId);
    }

    if (search) {
      collection = collection.filter(assessment => 
        assessment.title.toLowerCase().includes(search.toLowerCase()) ||
        (assessment.description ? assessment.description.toLowerCase().includes(search.toLowerCase()) : false)
      );
    }

    // total count
    const total = await collection.count();

    // apply pagination
    const offset = (page - 1) * pageSize;
    const data = await collection.offset(offset).limit(pageSize).toArray();

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  // single assessment by ID
  async getAssessmentById(id: string): Promise<Assessment | undefined> {
    return await db.assessments.get(id);
  }

  // assessment by job ID
  async getAssessmentByJobId(jobId: string): Promise<Assessment | undefined> {
    return await db.assessments.where('jobId').equals(jobId).first();
  }

  // create new assessment
  async createAssessment(assessmentData: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assessment> {
    const id = this.generateId();
    const assessment: Assessment = {
      ...assessmentData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.assessments.add(assessment);
    return assessment;
  }

  // update assessment
  async updateAssessment(id: string, updates: Partial<Assessment>): Promise<Assessment | undefined> {
    const assessment = await db.assessments.get(id);
    if (!assessment) return undefined;

    const updatedAssessment = {
      ...assessment,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await db.assessments.put(updatedAssessment);
    return updatedAssessment;
  }

  // delete assessment
  async deleteAssessment(id: string): Promise<boolean> {
    await db.transaction('rw', [db.assessments, db.assessmentResponses], async () => {
      // delete related responses
      await db.assessmentResponses.where('assessmentId').equals(id).delete();
      
      // delete assessment
      await db.assessments.delete(id);
    });

    return true;
  }

  // assessment Responses
  async getAssessmentResponses(assessmentId: string): Promise<AssessmentResponse[]> {
    return await db.assessmentResponses
      .where('assessmentId')
      .equals(assessmentId)
      .sortBy('completedAt')
      .then(responses => responses.reverse());
  }

  async getCandidateResponses(candidateId: string): Promise<AssessmentResponse[]> {
    return await db.assessmentResponses
      .where('candidateId')
      .equals(candidateId)
      .sortBy('completedAt')
      .then(responses => responses.reverse());
  }

  async submitAssessmentResponse(responseData: Omit<AssessmentResponse, 'id' | 'completedAt'>): Promise<AssessmentResponse> {
    const id = this.generateId();
    const response: AssessmentResponse = {
      ...responseData,
      id,
      completedAt: new Date().toISOString()
    };

    await db.assessmentResponses.add(response);
    return response;
  }

  async updateAssessmentResponse(id: string, updates: Partial<AssessmentResponse>): Promise<AssessmentResponse | undefined> {
    const response = await db.assessmentResponses.get(id);
    if (!response) return undefined;

    const updatedResponse = {
      ...response,
      ...updates
    };

    await db.assessmentResponses.put(updatedResponse);
    return updatedResponse;
  }

  // assessment statistics
  async getAssessmentStats(assessmentId: string): Promise<{
    totalResponses: number;
    averageScore?: number;
    completionRate: number;
  }> {
    const responses = await db.assessmentResponses
      .where('assessmentId')
      .equals(assessmentId)
      .toArray();

    const totalResponses = responses.length;
    const scores = responses.filter(r => r.score !== undefined).map(r => r.score!);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : undefined;

    // calculate completion rate
    const assessment = await this.getAssessmentById(assessmentId);
    if (!assessment) return { totalResponses, averageScore, completionRate: 0 };

    const totalCandidates = await db.candidates.where('jobId').equals(assessment.jobId).count();
    const completionRate = totalCandidates > 0 ? (totalResponses / totalCandidates) * 100 : 0;

    return {
      totalResponses,
      averageScore,
      completionRate
    };
  }

  // builder helper methods
  async addSectionToAssessment(jobId: string, sectionData: Partial<import('../../types').AssessmentSection>): Promise<Assessment> {
    const assessmentData = await this.getAssessmentByJobId(jobId);
    let assessment = assessmentData || undefined;
    
    if (!assessment) {
      // Create new assessment if it doesn't exist
      const id = this.generateId();
      assessment = {
        id,
        jobId,
        title: 'Assessment',
        description: '',
        sections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.assessments.add(assessment);
    }

    const newSection = {
      ...sectionData,
      id: this.generateId(),
      questions: [],
      order: assessment.sections.length
    };

    assessment.sections.push(newSection as import('../../types').AssessmentSection);
    assessment.updatedAt = new Date().toISOString();

    await db.assessments.put(assessment);
    return assessment;
  }

  async addQuestionToSection(jobId: string, sectionId: string, questionData: Partial<import('../../types').AssessmentQuestion>): Promise<Assessment> {
    const assessmentData = await this.getAssessmentByJobId(jobId);
    const assessment = assessmentData || undefined;
    if (!assessment) throw new Error('Assessment not found');

    const sectionIndex = assessment.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) throw new Error('Section not found');

    const newQuestion = {
      ...questionData,
      id: this.generateId(),
      order: assessment.sections[sectionIndex].questions.length
    };

    assessment.sections[sectionIndex].questions.push(newQuestion as import('../../types').AssessmentQuestion);
    assessment.updatedAt = new Date().toISOString();

    await db.assessments.put(assessment);
    return assessment;
  }

  // generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const assessmentService = new AssessmentService();
