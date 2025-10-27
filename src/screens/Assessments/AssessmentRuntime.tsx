import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentService } from '../../db/services';
import type { Assessment, AssessmentQuestion } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';

const AssessmentRuntime: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchAssessment();
    }
  }, [jobId]);

  const fetchAssessment = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const assessmentData = await assessmentService.getAssessmentByJobId(jobId);
      setAssessment(assessmentData || null);
    } catch (err) {
      setError('Failed to load assessment');
      console.error('Error fetching assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateQuestion = (question: AssessmentQuestion): string | null => {
    if (question.required && !responses[question.id]) {
      return 'This field is required';
    }

    if (responses[question.id] && question.validation) {
      const value = responses[question.id];
      
      if (question.validation.maxLength && value.length > question.validation.maxLength) {
        return `Maximum length is ${question.validation.maxLength} characters`;
      }
      
      if (question.type === 'numeric' && question.validation.min !== undefined && question.validation.max !== undefined) {
        const numValue = Number(value);
        if (numValue < question.validation.min || numValue > question.validation.max) {
          return `Please enter a value between ${question.validation.min} and ${question.validation.max}`;
        }
      }
    }
    if (question.conditional && assessment) {
      const dependsOnQuestion = assessment.sections
        .flatMap(s => s.questions)
        .find(q => q.id === question.conditional?.dependsOn);
      
      if (dependsOnQuestion) {
        const dependsOnResponse = responses[dependsOnQuestion.id];
        const expectedCondition = question.conditional?.condition;
        
        if (expectedCondition && dependsOnResponse !== expectedCondition) {
          return null;
        }
      }
    }

    return null;
  };

  const validateCurrentSection = (): boolean => {
    if (!assessment) return false;

    const currentSection = assessment.sections[currentSectionIndex];
    const errors: Record<string, string> = {};

    currentSection.questions.forEach(question => {
      // Check if question should be visible based on conditional logic
      if (question.conditional) {
        const dependsOnQuestion = assessment.sections
          .flatMap(s => s.questions)
          .find(q => q.id === question.conditional?.dependsOn);
        
        if (dependsOnQuestion) {
          const dependsOnResponse = responses[dependsOnQuestion.id];
          const expectedCondition = question.conditional?.condition;
          
          if (expectedCondition && dependsOnResponse !== expectedCondition) {
            return;
          }
        }
      }

      const error = validateQuestion(question);
      if (error) {
        errors[question.id] = error;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      if (currentSectionIndex < (assessment?.sections.length || 0) - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessment || !jobId) return;

    try {
      // Store directly in IndexedDB
      await assessmentService.submitAssessmentResponse({
        assessmentId: assessment.id,
        candidateId: 'current-candidate',
        responses: Object.entries(responses).map(([questionId, value]) => ({
          questionId,
          value: Array.isArray(value) ? value.join(', ') : String(value)
        }))
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError('Failed to submit assessment');
    }
  };

  const shouldShowQuestion = (question: AssessmentQuestion): boolean => {
    if (!question.conditional || !assessment) return true;

    const dependsOnQuestion = assessment.sections
      .flatMap(s => s.questions)
      .find(q => q.id === question.conditional?.dependsOn);
    
    if (!dependsOnQuestion) return true;

    const dependsOnResponse = responses[dependsOnQuestion.id];
    const expectedCondition = question.conditional?.condition;
    
    return expectedCondition ? dependsOnResponse === expectedCondition : true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Assessment not found'}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Submitted</h2>
          <p className="text-gray-600 mb-6">Thank you for completing the assessment!</p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            Return to Jobs
          </Button>
        </div>
      </div>
    );
  }

  const currentSection = assessment.sections[currentSectionIndex];
  const totalSections = assessment.sections.length;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{assessment.title}</h1>
        {assessment.description && (
          <p className="text-gray-600">{assessment.description}</p>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Section {currentSectionIndex + 1} of {totalSections}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentSectionIndex + 1) / totalSections) * 100)}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentSectionIndex + 1) / totalSections) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{currentSection.title}</h2>
        {currentSection.description && (
          <p className="text-gray-600 mb-6">{currentSection.description}</p>
        )}

        <div className="space-y-6">
          {currentSection.questions.map((question) => {
            if (!shouldShowQuestion(question)) return null;

            return (
              <div key={question.id} className="border-l-4 border-blue-500 pl-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {question.order}. {question.title}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {question.type === 'short_text' && (
                  <input
                    type="text"
                    value={responses[question.id] || ''}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors[question.id] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Type your answer..."
                  />
                )}

                {question.type === 'long_text' && (
                  <textarea
                    value={responses[question.id] || ''}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors[question.id] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Type your answer..."
                  />
                )}

                {question.type === 'single_choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={responses[question.id] === option}
                          onChange={(e) => handleResponseChange(question.id, e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'multi_choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          value={option}
                          checked={responses[question.id]?.includes(option) || false}
                          onChange={(e) => {
                            const currentValues = responses[question.id] || [];
                            if (e.target.checked) {
                              handleResponseChange(question.id, [...currentValues, option]);
                            } else {
                              handleResponseChange(question.id, currentValues.filter((v: string) => v !== option));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'numeric' && (
                  <input
                    type="number"
                    value={responses[question.id] || ''}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    min={question.validation?.min}
                    max={question.validation?.max}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors[question.id] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter a number"
                  />
                )}

                {validationErrors[question.id] && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors[question.id]}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentSectionIndex === 0}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
        >
          {currentSectionIndex < totalSections - 1 ? 'Next' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default AssessmentRuntime;

