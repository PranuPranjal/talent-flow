import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../../db/services';
import type { Job } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import { MdArrowBack, MdEdit, MdPeople, MdViewModule } from 'react-icons/md';

const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await jobService.getJobById(jobId);
        if (!data) {
          setError('Job not found');
        }
        setJob(data || null);
      } catch (e) {
        setError('Failed to load job');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString();
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
        <Button onClick={() => navigate('/jobs')} className="mt-4">
          Back to Jobs
        </Button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
        <p className="text-gray-500 mb-4">The requested job does not exist.</p>
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => navigate(-1)} className="inline-flex items-center gap-2">
          <MdArrowBack className="w-4 h-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/assessments/${job.id}/builder`)} className="inline-flex items-center gap-2">
            <MdEdit className="w-4 h-4 text-gray-700" />
            Edit Assessment
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/candidates?jobId=${job.id}`)} className="inline-flex items-center gap-2">
            <MdPeople className="w-4 h-4 text-gray-700" />
            Candidates (List)
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/candidates/kanban?jobId=${job.id}`)} className="inline-flex items-center gap-2">
            <MdViewModule className="w-4 h-4 text-gray-700" />
            Candidates (Kanban)
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-sm text-gray-500">/{job.slug}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {job.status}
          </span>
        </div>

        {job.location && (
          <p className="text-sm text-gray-700 mb-2"><strong>Location:</strong> {job.location}</p>
        )}

        {job.salary && (
          <p className="text-sm text-gray-700 mb-4">
            <strong>Salary:</strong> ${formatCurrency(job.salary.min)} - ${formatCurrency(job.salary.max)} {job.salary.currency}
          </p>
        )}

        {job.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{tag}</span>
            ))}
          </div>
        )}

        {job.description && (
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>
        )}

        {job.requirements && job.requirements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {job.requirements.map((req) => (
                <li key={req}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>Created: {new Date(job.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(job.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;


