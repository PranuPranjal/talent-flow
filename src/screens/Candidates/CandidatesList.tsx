import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { List } from 'react-virtualized';
import 'react-virtualized/styles.css';
import { candidateService } from '../../db/services';
import type { Candidate } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import CandidateRow from '../../components/Candidates/CandidateRow';
import { CANDIDATE_STAGES } from '../../utils/constants';
import { useDebounce } from '../../hooks/useDebounce';

const CandidatesList: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [stage, setStage] = useState<string | undefined>(undefined);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await candidateService.getCandidates({
        page: 1,
        pageSize: 1000,
        search: debouncedSearch || undefined,
        stage
      });
      
      setCandidates(response.data);
      setTotalCount(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [debouncedSearch, stage]);

  const handleViewCandidate = (candidate: Candidate) => {
    // TODO: Navigate to candidate detail page
    console.log('View candidate:', candidate.id);
  };

  const filteredCandidates = useMemo(() => {
    return candidates;
  }, [candidates]);

  const rowRenderer = ({ index, key, style }: any) => {
    return (
      <div key={key} style={style}>
        <CandidateRow
          index={index}
          style={{}}
          data={{
            candidates: filteredCandidates,
            onViewCandidate: handleViewCandidate
          }}
        />
      </div>
    );
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
          <p className="text-gray-600">Showing {filteredCandidates.length} of {totalCount} candidates</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
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

          <div className="md:self-start">
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/candidates/kanban')}
              >
                Kanban View
              </Button>
              <Button variant="primary">Add Candidate</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Virtualized Candidates List */}
      {filteredCandidates.length > 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="h-96">
            <List
              width={800}
              height={384}
              rowCount={filteredCandidates.length}
              rowHeight={120}
              rowRenderer={rowRenderer}
              overscanRowCount={3}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-500 mb-4">
              {search || stage ? 'Try adjusting your search or filter criteria' : 'Get started by adding your first candidate'}
            </p>
            {!search && !stage && (
              <Button variant="primary">Add Candidate</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesList;