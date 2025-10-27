import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { candidateService } from '../../db/services';
import type { Candidate } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import KanbanColumn from '../../components/Candidates/KanbanColumn';
import { CANDIDATE_STAGES } from '../../utils/constants';

const CandidatesKanban: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await candidateService.getCandidates({
        page: 1,
        pageSize: 1000, // Load all for kanban
      });
      
      setCandidates(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const candidateId = active.id as string;
    const overId = over.id as string;

    // Check if dropping on another candidate (swap positions)
    const targetCandidate = candidates.find(c => c.id === overId);
    const draggedCandidate = candidates.find(c => c.id === candidateId);
    
    if (!targetCandidate || !draggedCandidate) return;

    // If dropping on a candidate in the same stage, swap positions
    if (targetCandidate.stage === draggedCandidate.stage) {
      const stageCandidates = candidates
        .filter(c => c.stage === draggedCandidate.stage)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const draggedIndex = stageCandidates.findIndex(c => c.id === candidateId);
      const targetIndex = stageCandidates.findIndex(c => c.id === overId);
      
      if (draggedIndex === -1 || targetIndex === -1) return;

      // Swap positions
      const newStageCandidates = [...stageCandidates];
      [newStageCandidates[draggedIndex], newStageCandidates[targetIndex]] = 
      [newStageCandidates[targetIndex], newStageCandidates[draggedIndex]];

      // Update order values
      const updatedCandidates = candidates.map(candidate => {
        if (candidate.stage === draggedCandidate.stage) {
          const newIndex = newStageCandidates.findIndex(nc => nc.id === candidate.id);
          return { ...candidate, order: newIndex };
        }
        return candidate;
      });

      setCandidates(updatedCandidates);
      setIsUpdating(true);

      try {
        const candidateIds = newStageCandidates.map(c => c.id);
        await candidateService.reorderCandidatesInStage(draggedCandidate.stage, candidateIds);
      } catch (error) {
        console.error('Failed to reorder candidates:', error);
        setCandidates(candidates);
        setError('Failed to reorder candidates. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Moving to different stage
      const updatedCandidates = candidates.map(c => 
        c.id === candidateId ? { ...c, stage: targetCandidate.stage as Candidate['stage'], order: 0 } : c
      );
      setCandidates(updatedCandidates);
      setIsUpdating(true);

      try {
        await candidateService.updateCandidate(candidateId, { 
          stage: targetCandidate.stage as Candidate['stage'],
          order: 0
        });
      } catch (error) {
        console.error('Failed to update candidate stage:', error);
        setCandidates(candidates);
        setError('Failed to update candidate stage. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleViewCandidate = (candidate: Candidate) => {
    console.log('View candidate:', candidate.id);
  };
  const candidatesByStage = CANDIDATE_STAGES.reduce((acc, stage) => {
    acc[stage] = candidates.filter(candidate => candidate.stage === stage);
    return acc;
  }, {} as Record<string, Candidate[]>);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Pipeline</h1>
          <p className="text-gray-600">
            Drag and drop candidates between stages to manage their progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/candidates')}
          >
            List View
          </Button>
          <Button variant="primary">Add Candidate</Button>
        </div>
      </div>

      {isUpdating && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Updating candidate...
        </div>
      )}

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {CANDIDATE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              candidates={candidatesByStage[stage] || []}
              onViewCandidate={handleViewCandidate}
            />
          ))}
        </div>
      </DndContext>

      {candidates.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first candidate</p>
            <Button variant="primary">Add Candidate</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesKanban;
