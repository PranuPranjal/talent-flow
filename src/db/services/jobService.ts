import { db } from '../schema';
import type { Job, PaginatedResponse } from '../../types';

export class JobService {
  // jobs with pagination and filtering
  async getJobs(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    tags?: string[];
    sort?: string;
  }): Promise<PaginatedResponse<Job>> {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      status,
      tags = [],
      sort = 'order'
    } = params;

    let collection = db.jobs.orderBy(sort);

    // filters
    if (status) {
      collection = collection.filter(job => job.status === status);
    }

    if (search) {
      collection = collection.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        (job.description ? job.description.toLowerCase().includes(search.toLowerCase()) : false)
      );
    }

    if (tags.length > 0) {
      collection = collection.filter(job => 
        tags.some(tag => job.tags.includes(tag))
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

  // get single job by ID
  async getJobById(id: string): Promise<Job | undefined> {
    return await db.jobs.get(id);
  }

  // get job by slug
  async getJobBySlug(slug: string): Promise<Job | undefined> {
    return await db.jobs.where('slug').equals(slug).first();
  }

  // create new job
  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    const id = this.generateId();
    const job: Job = {
      ...jobData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.jobs.add(job);
    return job;
  }

  // update job
  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = await db.jobs.get(id);
    if (!job) return undefined;

    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await db.jobs.put(updatedJob);
    return updatedJob;
  }

  // archive/unarchive job
  async toggleArchive(id: string): Promise<Job | undefined> {
    const job = await db.jobs.get(id);
    if (!job) return undefined;

    const newStatus = job.status === 'active' ? 'archived' : 'active';
    return await this.updateJob(id, { status: newStatus });
  }

  // reorder jobs
  async reorderJobs(fromOrder: number, toOrder: number): Promise<void> {
    await db.transaction('rw', db.jobs, async () => {
      const jobs = await db.jobs.orderBy('order').toArray();
      
      // fromOrder to toOrder
      const item = jobs[fromOrder];
      if (!item) return;

      // remove item from original position
      jobs.splice(fromOrder, 1);
      
      // insert item at new position
      jobs.splice(toOrder, 0, item);

      // update order values
      for (let i = 0; i < jobs.length; i++) {
        await db.jobs.update(jobs[i].id, { order: i });
      }
    });
  }

  // delete job
  async deleteJob(id: string): Promise<boolean> {
    try {
      await db.jobs.delete(id);
      return true;
    } catch {
      return false;
    }
  }

  // get job statistics
  async getJobStats(): Promise<{
    total: number;
    active: number;
    archived: number;
  }> {
    const total = await db.jobs.count();
    const active = await db.jobs.where('status').equals('active').count();
    const archived = await db.jobs.where('status').equals('archived').count();

    return { total, active, archived };
  }

  // generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const jobService = new JobService();
