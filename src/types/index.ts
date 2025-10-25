export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description?: string;
  requirements?: string[];
  location?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  appliedAt: string;
  updatedAt: string;
  resume?: string;
  coverLetter?: string;
  notes?: string;
  skills?: string[];
  experience?: number;
}

export interface CandidateTimelineEvent {
  id: string;
  candidateId: string;
  type: 'stage_change' | 'note_added' | 'assessment_completed' | 'interview_scheduled';
  description: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  sections: AssessmentSection[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  questions: AssessmentQuestion[];
  order: number;
}

export interface AssessmentQuestion {
  id: string;
  type: 'single_choice' | 'multi_choice' | 'short_text' | 'long_text' | 'numeric' | 'file_upload';
  title: string;
  description?: string;
  required: boolean;
  order: number;
  options?: string[]; // For single_choice and multi_choice
  validation?: {
    min?: number;
    max?: number;
    maxLength?: number;
    pattern?: string;
  };
  conditional?: {
    dependsOn: string; // Question ID
    condition: string; // Value that triggers this question
  };
}

export interface AssessmentResponse {
  id: string;
  candidateId: string;
  assessmentId: string;
  responses: Record<string, any>;
  completedAt: string;
  score?: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FilterState {
  search: string;
  status?: string;
  stage?: string;
  tags?: string[];
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// Drag and Drop types
export interface DragItem {
  id: string;
  type: 'job' | 'candidate';
  index: number;
}

export interface DropResult {
  item: DragItem;
  destination: {
    index: number;
    droppableId: string;
  };
}

// Form types
export interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
  tags: string[];
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface CandidateFormData {
  name: string;
  email: string;
  phone: string;
  resume: File | null;
  coverLetter: string;
  skills: string[];
  experience: number;
}

// Note with mentions
export interface Note {
  id: string;
  candidateId: string;
  content: string;
  mentions: string[]; // User IDs mentioned
  createdAt: string;
  createdBy: string;
}

// User context (for mentions)
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'hr' | 'manager' | 'admin';
}
