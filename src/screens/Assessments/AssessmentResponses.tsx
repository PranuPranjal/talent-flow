import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { assessmentService } from '../../db/services';
import type { AssessmentResponse } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';

const AssessmentResponses: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchResponses();
    }
  }, [jobId]);

  const fetchResponses = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);
      
      const assessment = await assessmentService.getAssessmentByJobId(jobId);
      if (!assessment) {
        setError('Assessment not found');
        return;
      }
      const assessmentResponses = await assessmentService.getAssessmentResponses(assessment.id);
      setResponses(assessmentResponses);
    } catch (err) {
      setError('Failed to load responses');
      console.error('Error fetching responses:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
        <Button onClick={() => fetchResponses()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Responses</h1>
          <p className="text-gray-600">
            {responses.length > 0 
              ? `${responses.length} response${responses.length !== 1 ? 's' : ''} received`
              : 'No responses yet'
            }
          </p>
        </div>
        <Button onClick={() => fetchResponses()}>
          Refresh
        </Button>
      </div>

      {responses.length > 0 ? (
        <div className="space-y-4">
          {responses.map((response) => (
            <div key={response.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Response #{response.id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Candidate: {response.candidateId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Completed: {formatDate(response.completedAt)}
                  </p>
                  {response.score !== undefined && (
                    <p className="text-sm font-medium text-blue-600">
                      Score: {response.score}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Responses:</h4>
                {Object.entries(response.responses).map(([questionId, answer], index) => (
                  <div key={questionId} className="border-l-4 border-blue-500 pl-4">
                    <p className="text-sm font-medium text-gray-700">
                      Question {index + 1}: {questionId}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {String(answer)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
            <p className="text-gray-500">
              Assessment responses will appear here once candidates complete the assessment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentResponses;
