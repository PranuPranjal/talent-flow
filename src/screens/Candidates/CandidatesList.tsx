import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { candidateService } from '../../db/services';
import type { Candidate } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import { CANDIDATE_STAGES } from '../../utils/constants';
import { jobService } from '../../db/services';
import { useDebounce } from '../../hooks/useDebounce';

const CandidatesList: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [stage, setStage] = useState<string | undefined>(undefined);
  const [exportStage, setExportStage] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobFilter, setJobFilter] = useState<string | undefined>(undefined);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'screen':
        return 'bg-yellow-100 text-yellow-800';
      case 'tech':
        return 'bg-purple-100 text-purple-800';
      case 'offer':
        return 'bg-green-100 text-green-800';
      case 'hired':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchCandidates = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await candidateService.getCandidates({
        page,
        pageSize: pagination.pageSize,
        search: debouncedSearch || undefined,
        stage,
        jobId: jobFilter
      });
      
      setCandidates(response.data);
      setPagination(prev => ({
        ...prev,
        page,
        total: response.pagination.total,
        totalPages: Math.ceil(response.pagination.total / pagination.pageSize)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // check URL param for jobId
    const params = new URLSearchParams(location.search);
    const jid = params.get('jobId') || undefined;
    if (jid) setJobFilter(jid);

    // fetch job list for filter options
    const loadJobs = async () => {
      try {
        const resp = await jobService.getJobs({ page: 1, pageSize: 1000 });
        setJobs(resp.data || []);
      } catch (err) {
        console.error('Failed to load jobs for filter', err);
      }
    };

    loadJobs();
    fetchCandidates();
  }, [debouncedSearch, stage]);

  useEffect(() => {
    fetchCandidates();
  }, [jobFilter]);

  useEffect(() => {
    if (searchInputRef.current && search) {
      searchInputRef.current.focus();
    }
  }, [candidates, search]); 

  const handleViewCandidate = (candidateId: string) => {
    navigate(`/candidates/${candidateId}`);
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
        <Button onClick={() => fetchCandidates()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} candidates
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="w-full md:w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select
              value={stage ?? ''}
              onChange={(e) => setStage(e.target.value || undefined)}
              className="w-full md:w-40 rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Stages</option>
              {CANDIDATE_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job</label>
            <select
              value={jobFilter ?? ''}
              onChange={(e) => setJobFilter(e.target.value || undefined)}
              className="w-full md:w-56 rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Export</label>
            <div className="flex gap-2">
              <select
                value={exportStage ?? ''}
                onChange={(e) => setExportStage(e.target.value || undefined)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                {CANDIDATE_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    // fetch all matching candidates (large pageSize)
                    const resp = await candidateService.getCandidates({ page: 1, pageSize: 10000, stage: exportStage });
                    const rows = resp.data || [];

                    if (rows.length === 0) {
                      alert('No candidates to export for selected filter');
                      return;
                    }

                    // build CSV
                    const headers = ['Name','Email','Phone','Stage','Applied At','Experience','Skills','Resume'];
                    const escape = (v: any) => {
                      if (v === null || v === undefined) return '';
                      const s = typeof v === 'string' ? v : String(v);
                      // escape quotes
                      return `"${s.replace(/"/g, '""')}"`;
                    };

                    const csv = [headers.join(',')].concat(rows.map(c => {
                      return [
                        escape(c.name),
                        escape(c.email),
                        escape(c.phone || ''),
                        escape(c.stage),
                        escape(c.appliedAt),
                        escape(c.experience ?? ''),
                        escape((c.skills || []).join('; ')),
                        escape(c.resume || '')
                      ].join(',');
                    })).join('\n');

                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    const now = new Date().toISOString().slice(0,10);
                    const stageName = exportStage || 'all';
                    link.href = url;
                    link.setAttribute('download', `candidates_${stageName}_${now}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 10000);
                  } catch (err) {
                    console.error('Export failed', err);
                    alert('Failed to export candidates');
                  }
                }}
              >
                Export
              </Button>
            </div>
          </div>

          <div className="md:self-start">
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/candidates/kanban')}
              >
                Kanban View
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <div className="min-h-[600px] overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stage</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {candidate.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{candidate.email}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{candidate.phone}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStageColor(candidate.stage)}`}>
                      {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Button
                      variant="ghost"
                      onClick={() => handleViewCandidate(candidate.id)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {candidates.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    {search || stage ? 
                      'Try adjusting your search or filter criteria' : 
                      'Get started by adding your first candidate'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchCandidates(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchCandidates(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default CandidatesList;