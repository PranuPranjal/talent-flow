import { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { jobService } from '../../db/services';
import type { Job } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import DraggableJobCard from '../../components/UI/DraggableJobCard';
import { JOB_STATUSES } from '../../utils/constants';
import { useDebounce } from '../../hooks/useDebounce';

const JobsList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [isReordering, setIsReordering] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobService.getJobs({
        page,
        pageSize: pagination.pageSize,
        search: debouncedSearch || undefined,
        status
      });
      
      setJobs(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, [debouncedSearch, status]);

  useEffect(() => {
    if (searchInputRef.current && search) {
      searchInputRef.current.focus();
    }
  }, [jobs]); 

  const handlePageChange = (newPage: number) => {
    fetchJobs(newPage);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = jobs.findIndex((job) => job.id === active.id);
      const newIndex = jobs.findIndex((job) => job.id === over.id);

      const reorderedJobs = arrayMove(jobs, oldIndex, newIndex);
      setJobs(reorderedJobs);
      setIsReordering(true);

      try {
        // update order in database
        await jobService.reorderJobs(jobs[oldIndex].order, jobs[newIndex].order);

        await fetchJobs(pagination.page);
      } catch (error) {
        console.error('Failed to reorder jobs:', error);
        // rollback on failure
        setJobs(jobs);
        setError('Failed to reorder jobs. Please try again.');
      } finally {
        setIsReordering(false);
      }
    }
  };

  const handleViewJob = (job: Job) => {
    console.log('View job:', job.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => fetchJobs()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600">Showing {jobs.length} of {pagination.total} jobs</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title..."
              className="w-full md:w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status ?? ''}
              onChange={(e) => setStatus(e.target.value || undefined)}
              className="w-full md:w-40 rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="md:self-start">
            <Button variant="primary">Create Job</Button>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <DraggableJobCard
                key={job.id}
                job={job}
                onView={handleViewJob}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Reordering indicator */}
      {isReordering && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Reordering jobs...
        </div>
      )}

      {/* Empty State */}
      {jobs.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first job posting</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobsList;
