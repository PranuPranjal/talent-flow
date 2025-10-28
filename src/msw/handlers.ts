import { http, HttpResponse } from 'msw';
import { jobService, candidateService, assessmentService } from '../db/services';
import { getRandomDelay, shouldSimulateError } from '../utils/helpers';

// Jobs API handlers
export const jobsHandlers = [
  // GET /jobs - List jobs with pagination and filtering
  http.get('/api/jobs', async ({ request }) => {
    await getRandomDelay(200, 1200);
    
    if (shouldSimulateError(0.05)) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    try {
      const url = new URL(request.url);
      const params = {
        page: parseInt(url.searchParams.get('page') || '1'),
        pageSize: parseInt(url.searchParams.get('pageSize') || '10'),
        search: url.searchParams.get('search') || '',
        status: url.searchParams.get('status') || undefined,
        tags: url.searchParams.get('tags')?.split(',') || [],
        sort: url.searchParams.get('sort') || 'order'
      };

      const result = await jobService.getJobs(params);
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }
  }),

  // GET /jobs/:id - Get single job
  http.get('/api/jobs/:id', async ({ params }) => {
    await getRandomDelay(200, 800);
    
    if (shouldSimulateError(0.05)) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    try {
      const job = await jobService.getJobById(params.id as string);
      if (!job) {
        return HttpResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return HttpResponse.json(job);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to fetch job' },
        { status: 500 }
      );
    }
  }),

  // POST /jobs - Create new job
  http.post('/api/jobs', async ({ request }) => {
    await getRandomDelay(300, 1000);
    
    if (shouldSimulateError(0.08)) {
      return HttpResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    try {
      const jobData = await request.json() as any;
      const job = await jobService.createJob(jobData);
      return HttpResponse.json(job, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to create job' },
        { status: 400 }
      );
    }
  }),

  // PATCH /jobs/:id - Update job
  http.patch('/api/jobs/:id', async ({ params, request }) => {
    await getRandomDelay(300, 1000);
    
    if (shouldSimulateError(0.08)) {
      return HttpResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      );
    }

    try {
      const updates = await request.json() as any;
      const job = await jobService.updateJob(params.id as string, updates);
      if (!job) {
        return HttpResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return HttpResponse.json(job);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to update job' },
        { status: 400 }
      );
    }
  }),

  // PATCH /jobs/:id/reorder - Reorder jobs
  http.patch('/api/jobs/:id/reorder', async ({ request }) => {
    await getRandomDelay(400, 1200);
    
    if (shouldSimulateError(0.1)) {
      return HttpResponse.json(
        { error: 'Failed to reorder jobs' },
        { status: 500 }
      );
    }

    try {
      const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number };
      await jobService.reorderJobs(fromOrder, toOrder);
      return HttpResponse.json({ success: true });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to reorder jobs' },
        { status: 400 }
      );
    }
  }),

  // DELETE /jobs/:id - Delete job
  http.delete('/api/jobs/:id', async ({ params }) => {
    await getRandomDelay(300, 800);
    
    if (shouldSimulateError(0.05)) {
      return HttpResponse.json(
        { error: 'Failed to delete job' },
        { status: 500 }
      );
    }

    try {
      const success = await jobService.deleteJob(params.id as string);
      if (!success) {
        return HttpResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      return HttpResponse.json({ success: true });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to delete job' },
        { status: 500 }
      );
    }
  })
];

// Candidates API handlers
export const candidatesHandlers = [
  // GET /candidates - List candidates with pagination and filtering
  http.get('/api/candidates', async ({ request }) => {
    await getRandomDelay(200, 1200);
    
    if (shouldSimulateError(0.05)) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    try {
      const url = new URL(request.url);
      const params = {
        page: parseInt(url.searchParams.get('page') || '1'),
        pageSize: parseInt(url.searchParams.get('pageSize') || '10'),
        search: url.searchParams.get('search') || '',
        stage: url.searchParams.get('stage') || undefined,
        jobId: url.searchParams.get('jobId') || undefined,
        sort: url.searchParams.get('sort') || 'appliedAt'
      };

      const result = await candidateService.getCandidates(params);
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to fetch candidates' },
        { status: 500 }
      );
    }
  }),

  // GET /candidates/:id - Get single candidate
  http.get('/api/candidates/:id', async ({ params }) => {
    await getRandomDelay(200, 800);
    
    if (shouldSimulateError(0.05)) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    try {
      const candidate = await candidateService.getCandidateById(params.id as string);
      if (!candidate) {
        return HttpResponse.json(
          { error: 'Candidate not found' },
          { status: 404 }
        );
      }
      return HttpResponse.json(candidate);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to fetch candidate' },
        { status: 500 }
      );
    }
  }),

  // GET /candidates/:id/timeline - Get candidate timeline
  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await getRandomDelay(200, 800);
    
    if (shouldSimulateError(0.05)) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    try {
      const timeline = await candidateService.getCandidateTimeline(params.id as string);
      return HttpResponse.json(timeline);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to fetch timeline' },
        { status: 500 }
      );
    }
  }),

  // POST /candidates - Create new candidate
  http.post('/api/candidates', async ({ request }) => {
    await getRandomDelay(300, 1000);
    
    if (shouldSimulateError(0.08)) {
      return HttpResponse.json(
        { error: 'Failed to create candidate' },
        { status: 500 }
      );
    }

    try {
      const candidateData = await request.json() as any;
      const candidate = await candidateService.createCandidate(candidateData);
      return HttpResponse.json(candidate, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to create candidate' },
        { status: 400 }
      );
    }
  }),

  // PATCH /candidates/:id - Update candidate
  http.patch('/api/candidates/:id', async ({ params, request }) => {
    await getRandomDelay(300, 1000);
    
    if (shouldSimulateError(0.08)) {
      return HttpResponse.json(
        { error: 'Failed to update candidate' },
        { status: 500 }
      );
    }

    try {
      const updates = await request.json() as any;
      const candidate = await candidateService.updateCandidate(params.id as string, updates);
      if (!candidate) {
        return HttpResponse.json(
          { error: 'Candidate not found' },
          { status: 404 }
        );
      }
      return HttpResponse.json(candidate);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to update candidate' },
        { status: 400 }
      );
    }
  })
];

// Assessments API handlers
export const assessmentsHandlers = [
  // GET /assessments - List assessments
  http.get('/api/assessments', async ({ request }) => {
    await getRandomDelay(200, 1000);
    
    if (shouldSimulateError(0.05)) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    try {
      const url = new URL(request.url);
      const params = {
        page: parseInt(url.searchParams.get('page') || '1'),
        pageSize: parseInt(url.searchParams.get('pageSize') || '10'),
        jobId: url.searchParams.get('jobId') || undefined,
        search: url.searchParams.get('search') || ''
      };

      const result = await assessmentService.getAssessments(params);
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to fetch assessments' },
        { status: 500 }
      );
    }
  }),

  // GET /assessments/:jobId - Get assessment by job ID
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await getRandomDelay(200, 800);
    
    if (shouldSimulateError(0.05)) {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    try {
      const assessment = await assessmentService.getAssessmentByJobId(params.jobId as string);
      if (!assessment) {
        return HttpResponse.json(
          { error: 'Assessment not found' },
          { status: 404 }
        );
      }
      return HttpResponse.json(assessment);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to fetch assessment' },
        { status: 500 }
      );
    }
  }),

  // PUT /assessments/:jobId - Create or update assessment
  http.put('/api/assessments/:jobId', async ({ params, request }) => {
    await getRandomDelay(400, 1200);
    
    if (shouldSimulateError(0.1)) {
      return HttpResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      );
    }

    try {
      const assessmentData = await request.json() as any;
      const existingAssessment = await assessmentService.getAssessmentByJobId(params.jobId as string);
      
      if (existingAssessment) {
        const assessment = await assessmentService.updateAssessment(existingAssessment.id, assessmentData);
        return HttpResponse.json(assessment);
      } else {
        const assessment = await assessmentService.createAssessment({
          ...assessmentData,
          jobId: params.jobId as string
        });
        return HttpResponse.json(assessment, { status: 201 });
      }
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to save assessment' },
        { status: 400 }
      );
    }
  }),

  // POST /assessments/:jobId/submit - Submit assessment response
  http.post('/api/assessments/:jobId/submit', async ({ params, request }) => {
    await getRandomDelay(500, 1500);
    
    if (shouldSimulateError(0.1)) {
      return HttpResponse.json(
        { error: 'Failed to submit assessment' },
        { status: 500 }
      );
    }

    try {
      const responseData = await request.json() as any;
      const response = await assessmentService.submitAssessmentResponse({
        ...responseData,
        assessmentId: params.jobId as string
      });
      return HttpResponse.json(response, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Failed to submit assessment' },
        { status: 400 }
      );
    }
  })
];

// Combine all handlers
export const handlers = [
  ...jobsHandlers,
  ...candidatesHandlers,
  ...assessmentsHandlers
];

