import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateService, jobService } from '../../db/services';
import type { Candidate, CandidateTimelineEvent, Note } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';

const CandidateProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<any>(null);
  const [timeline, setTimeline] = useState<CandidateTimelineEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const mentionUsers = useMemo(() => [
    { id: 'u1', name: 'Pranu Pranjal' },
    { id: 'u2', name: 'Priya Shah' },
    { id: 'u3', name: 'Divyanshu Bajpai' },
    { id: 'u4', name: 'Chinmay Kumar Singh' },
    { id: 'u5', name: 'Indrajeet Banerjee' }
  ], []);
  const nameToId = useMemo(() => Object.fromEntries(mentionUsers.map(u => [u.name, u.id])), [mentionUsers]);
  const currentMentionQuery = useMemo(() => {
    const match = newNote.match(/@([^\s@]{0,30})$/);
    return match ? match[1] : '';
  }, [newNote]);
  const mentionSuggestions = useMemo(() => {
    if (!currentMentionQuery) return [] as { id: string; name: string }[];
    const q = currentMentionQuery.toLowerCase();
    return mentionUsers.filter(u => u.name.toLowerCase().includes(q)).slice(0, 5);
  }, [currentMentionQuery, mentionUsers]);

  useEffect(() => {
    if (id) {
      fetchCandidateData();
    }
  }, [id]);

  const fetchCandidateData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const [candidateData, timelineData, notesData] = await Promise.all([
        candidateService.getCandidateById(id),
        candidateService.getCandidateTimeline(id),
        candidateService.getCandidateNotes(id)
      ]);

      if (!candidateData) {
        setError('Candidate not found');
        return;
      }

      setCandidate(candidateData);
      setTimeline(timelineData);
      setNotes(notesData);

      // Fetch job details
      if (candidateData.jobId) {
        const jobData = await jobService.getJobById(candidateData.jobId);
        setJob(jobData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidate data');
      console.error('Error fetching candidate data:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractMentions = (text: string): string[] => {
    const names = Array.from(text.matchAll(/@([A-Za-z][A-Za-z\s]{0,48}[A-Za-z])/g)).map(m => m[1].trim());
    const ids = names.map(n => nameToId[n]).filter(Boolean) as string[];
    return Array.from(new Set(ids));
  };

  const insertMention = (name: string) => {
    const ta = noteInputRef.current;
    const atText = `@${name}`;
    if (!ta) {
      setNewNote(prev => prev.replace(/@([^\s@]{0,30})$/, atText + ' '));
      return;
    }
    const start = ta.selectionStart ?? newNote.length;
    const before = newNote.slice(0, start).replace(/@([^\s@]{0,30})$/, atText + ' ');
    const after = newNote.slice(start);
    setNewNote(before + after);
    requestAnimationFrame(() => ta.focus());
  };

  const handleAddNote = async () => {
    if (!id || !newNote.trim()) return;

    try {
      const mentions = extractMentions(newNote);
      const note = await candidateService.addNote(id, {
        content: newNote.trim(),
        createdBy: 'current-user', // TODO: Get from auth context
        mentions
      });

      setNotes(prev => [note, ...prev]);
      setNewNote('');
      setShowAddNoteModal(false);
    } catch (err) {
      console.error('Failed to add note:', err);
      setError('Failed to add note. Please try again.');
    }
  };

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">{error || 'Candidate not found'}</p>
        <Button onClick={() => navigate('/candidates')} className="mt-4">
          Back to Candidates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/candidates')}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Candidates
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Edit Candidate</Button>
          <Button 
            variant="primary"
            onClick={() => navigate(`/assessments/${candidate.jobId}/take`)}
          >
            Take Assessment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
              <p className="text-gray-600">{candidate.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStageColor(candidate.stage)}`}>
                {candidate.stage}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {candidate.email}
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {candidate.phone}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Job Application</h3>
                <div className="text-sm text-gray-600">
                  <p><strong>Position:</strong> {job?.title || 'Loading...'}</p>
                  <p><strong>Applied:</strong> {formatDate(candidate.appliedAt)}</p>
                  {candidate.experience && (
                    <p><strong>Experience:</strong> {candidate.experience} years</p>
                  )}
                </div>
              </div>

              {candidate.skills && candidate.skills.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {candidate.resume && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Resume</h3>
                  <a 
                    href={candidate.resume} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Resume
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline and Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Timeline</h2>
            </div>

            <div className="space-y-4">
              {timeline.length > 0 ? (
                timeline.map((event) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{event.type.replace('_', ' ')}</span>
                        <span className="text-sm text-gray-500">{formatDate(event.timestamp)}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{event.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No timeline events yet</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Notes</h2>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowAddNoteModal(true)}
              >
                Add Note
              </Button>
            </div>

            <div className="space-y-4">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500">{formatDate(note.createdAt)}</span>
                      <span className="text-sm text-gray-400">by {note.createdBy}</span>
                    </div>
                    <p className="text-gray-700">{note.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No notes yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      <Modal
        isOpen={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
        title="Add Note"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Content
            </label>
            <textarea
              ref={noteInputRef}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add your note here..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            {mentionSuggestions.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-md bg-white shadow-sm">
                {mentionSuggestions.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => insertMention(s.name)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    @{s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setShowAddNoteModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddNote}
              disabled={!newNote.trim()}
            >
              Add Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateProfile;
