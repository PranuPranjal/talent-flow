import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentService } from '../../db/services';
import type { Assessment } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';

const AssessmentsList: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await assessmentService.getAssessments({
        page: 1,
        pageSize: 100
      });
      
      setAssessments(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessments');
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalQuestions = (assessment: Assessment): number => {
    return assessment.sections.reduce((total, section) => total + section.questions.length, 0);
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
        <Button onClick={() => fetchAssessments()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600">
            {assessments.length > 0 
              ? `${assessments.length} assessment${assessments.length !== 1 ? 's' : ''} available`
              : 'Create and manage job-specific assessments'
            }
          </p>
        </div>
      </div>

      {assessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {assessment.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {assessment.sections.length} section{assessment.sections.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {getTotalQuestions(assessment)} questions
                </span>
              </div>

              {assessment.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {assessment.description}
                </p>
              )}

              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/assessments/${assessment.jobId}/take`)}
                  className="w-full"
                >
                  Take Assessment
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/assessments/${assessment.jobId}/builder`)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/assessments/${assessment.jobId}/responses`)}
                    className="flex-1"
                  >
                    Responses
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/jobs/${assessment.jobId}`)}
                  className="w-full"
                >
                  View Job
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
            <p className="text-gray-500 mb-4">
              Assessments are created automatically when you open the builder for a job.
            </p>
            <Button 
              variant="primary"
              onClick={() => navigate('/jobs')}
            >
              View Jobs
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentsList;
