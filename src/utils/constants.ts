// application constants

export const API_BASE_URL = '/api';

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const CANDIDATE_STAGES = [
  'applied',
  'screen',
  'tech',
  'offer',
  'hired',
  'rejected',
] as const;

export const JOB_STATUSES = ['active', 'archived'] as const;

export const QUESTION_TYPES = [
  'single_choice',
  'multi_choice',
  'short_text',
  'long_text',
  'numeric',
  'file_upload',
] as const;

export const DEBOUNCE_DELAY = 300; // milliseconds

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

export const SUCCESS_MESSAGES = {
  JOB_CREATED: 'Job created successfully',
  JOB_UPDATED: 'Job updated successfully',
  JOB_ARCHIVED: 'Job archived successfully',
  CANDIDATE_UPDATED: 'Candidate updated successfully',
  ASSESSMENT_SAVED: 'Assessment saved successfully',
} as const;
