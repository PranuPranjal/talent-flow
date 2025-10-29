import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentService, jobService } from '../../db/services';
import type { Assessment, AssessmentSection, AssessmentQuestion } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { QUESTION_TYPES } from '../../utils/constants';

const AssessmentBuilder: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newQuestion, setNewQuestion] = useState<Partial<AssessmentQuestion>>({
    type: 'short_text',
    title: '',
    required: false,
    options: []
  });
  const [newOptionText, setNewOptionText] = useState('');

  useEffect(() => {
    if (jobId) {
      fetchAssessment();
      fetchJob();
    }
  }, [jobId]);

  const fetchAssessment = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const data = await assessmentService.getAssessmentByJobId(jobId);
      setAssessment(data || null);
      
      if (data && data.sections.length > 0) {
        setActiveSection(data.sections[0].id);
      }
    } catch (err) {
      console.error('Error fetching assessment:', err);
      setError('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const fetchJob = async () => {
    if (!jobId) return;

    try {
      const data = await jobService.getJobById(jobId);
      setJob(data);
    } catch (err) {
      console.error('Error fetching job:', err);
    }
  };

  const handleAddSection = async () => {
    if (!jobId || !newSectionTitle.trim()) return;

    try {
      const section: Partial<AssessmentSection> = {
        title: newSectionTitle.trim(),
        description: '',
        questions: [],
        order: assessment?.sections.length || 0
      };

      const updatedAssessment = await assessmentService.addSectionToAssessment(jobId, section);
      setAssessment(updatedAssessment);
      setNewSectionTitle('');
      setShowAddSection(false);
      setActiveSection(updatedAssessment.sections[updatedAssessment.sections.length - 1].id);
    } catch (err) {
      console.error('Error adding section:', err);
      setError('Failed to add section');
    }
  };

  const handleAddQuestion = async () => {
    if (!jobId || !activeSection || !newQuestion.title?.trim()) return;

    try {
      const question: Partial<AssessmentQuestion> = {
        ...newQuestion,
        title: newQuestion.title.trim(),
        order: assessment?.sections
          .find(s => s.id === activeSection)?.questions.length || 0
      };

      const updatedAssessment = await assessmentService.addQuestionToSection(
        jobId,
        activeSection,
        question
      );
      setAssessment(updatedAssessment);
      setNewQuestion({
        type: 'short_text',
        title: '',
        required: false,
        options: []
      });
      setShowAddQuestion(false);
    } catch (err) {
      console.error('Error adding question:', err);
      setError('Failed to add question');
    }
  };

  const handleSave = async () => {
    if (!assessment || !jobId) return;

    try {
      await assessmentService.updateAssessment(jobId, assessment);
      setError(null);
      navigate('/assessments');
    } catch (err) {
      console.error('Error saving assessment:', err);
      setError('Failed to save assessment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {job?.title || 'Assessment'} Builder
          </h1>
          <p className="text-sm text-gray-600 mt-1">Build your assessment</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {assessment?.sections.map((section) => (
            <div
              key={section.id}
              className={`mb-6 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                activeSection === section.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  {section.questions.length} questions
                </span>
              </div>
              {section.description && (
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="mt-2 text-xs"
              >
                Edit Section
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddQuestion(true);
                }}
                className="mt-2 text-xs w-full"
              >
                + Add Question
              </Button>
            </div>
          ))}

          <Button
            variant="secondary"
            onClick={() => setShowAddSection(true)}
            className="w-full"
          >
            + Add Section
          </Button>
        </div>

        <div className="p-6 border-t border-gray-200">
          <Button
            variant="primary"
            onClick={handleSave}
            className="w-full"
          >
            Save Assessment
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-3xl mx-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Assessment Preview</h2>
          
          {assessment ? (
            <div className="space-y-8">
              {assessment.sections.map((section) => (
                <div key={section.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h3>
                  {section.description && (
                    <p className="text-gray-600 mb-6">{section.description}</p>
                  )}
                  
                  <div className="space-y-4">
                    {section.questions.map((question, qIndex) => (
                      <div key={question.id} className="border-l-4 border-blue-500 pl-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {qIndex + 1}. {question.title}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {question.type === 'short_text' && (
                          <input
                            type="text"
                            placeholder="Type your answer..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            disabled
                          />
                        )}
                        
                        {question.type === 'long_text' && (
                          <textarea
                            placeholder="Type your answer..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            disabled
                          />
                        )}
                        
                        {question.type === 'single_choice' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <label key={optIndex} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  className="mr-2"
                                  disabled
                                />
                                <span className="text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'multi_choice' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <label key={optIndex} className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  disabled
                                />
                                <span className="text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'numeric' && (
                          <input
                            type="number"
                            placeholder="Enter a number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            disabled
                          />
                        )}
                        
                        {question.type === 'file_upload' && (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <div className="mt-2">
                                <p className="text-sm text-gray-600">Supported files: PDF, DOC, DOCX, TXT</p>
                                <p className="text-xs text-gray-500 mt-1">Up to 10MB</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No sections yet. Add a section to get started.</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showAddSection}
        onClose={() => setShowAddSection(false)}
        title="Add Section"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="e.g., Technical Skills"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAddSection(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddSection}
              disabled={!newSectionTitle.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAddQuestion}
        onClose={() => setShowAddQuestion(false)}
        title="Add Question"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type
            </label>
            <select
              value={newQuestion.type}
              onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as any })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {QUESTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <input
              type="text"
              value={newQuestion.title}
              onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
              placeholder="Enter your question"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          {(newQuestion.type === 'single_choice' || newQuestion.type === 'multi_choice') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {/* Existing options list */}
                {newQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const updatedOptions = [...(newQuestion.options || [])];
                        updatedOptions[index] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: updatedOptions });
                      }}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedOptions = [...(newQuestion.options || [])];
                        updatedOptions.splice(index, 1);
                        setNewQuestion({ ...newQuestion, options: updatedOptions });
                      }}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Add new option input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newOptionText}
                    onChange={(e) => setNewOptionText(e.target.value)}
                    placeholder="Type a new option"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newOptionText.trim()) {
                        e.preventDefault();
                        setNewQuestion({
                          ...newQuestion,
                          options: [...(newQuestion.options || []), newOptionText.trim()]
                        });
                        setNewOptionText('');
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!newOptionText.trim()}
                    onClick={() => {
                      if (newOptionText.trim()) {
                        setNewQuestion({
                          ...newQuestion,
                          options: [...(newQuestion.options || []), newOptionText.trim()]
                        });
                        setNewOptionText('');
                      }
                    }}
                  >
                    Add Option
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={newQuestion.required}
              onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="required" className="text-sm text-gray-700">
              Required
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAddQuestion(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddQuestion}
              disabled={!newQuestion.title?.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssessmentBuilder;

