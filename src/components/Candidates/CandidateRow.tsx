import { useNavigate } from 'react-router-dom';
import type { Candidate } from '../../types';

interface CandidateRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    candidates: Candidate[];
    onViewCandidate: (candidate: Candidate) => void;
  };
}

const CandidateRow: React.FC<CandidateRowProps> = ({ index, style, data }) => {
  const navigate = useNavigate();
  const { candidates } = data;
  const candidate = candidates[index];

  if (!candidate) {
    return <div style={style}>Loading...</div>;
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={style} className="px-4 py-2">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {candidate.name}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}>
                {candidate.stage}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {candidate.email}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {candidate.phone}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Applied: {formatDate(candidate.appliedAt)}</span>
              <span>{candidate.experience} years exp</span>
              <div className="flex flex-wrap gap-1">
                {(candidate.skills || []).slice(0, 3).map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {skill}
                  </span>
                ))}
                {(candidate.skills || []).length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                    +{(candidate.skills || []).length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => navigate(`/candidates/${candidate.id}`)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateRow;
