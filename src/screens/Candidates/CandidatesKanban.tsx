import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects,} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { candidateService } from '../../db/services';
import type { Candidate } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import KanbanColumn from '../../components/Candidates/KanbanColumn';
import KanbanCard from '../../components/Candidates/KanbanCard';
import { CANDIDATE_STAGES } from '../../utils/constants';

const CandidatesKanban: React.FC = () => {
  const navigate = useNavigate();
  const [candidatesByStage, setCandidatesByStage] = useState<Record<string, Candidate[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [stageStats, setStageStats] = useState<Record<string, { total: number; hasMore: boolean }>>({});
  
  // calculate maximum total pages across all stages
  const totalPages = Math.max(
    ...Object.values(stageStats).map(stats => 
      Math.ceil(stats.total / pageSize)
    ),
    0
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0,
        delay: 0,
        tolerance: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const allCandidates = Object.values(candidatesByStage).flat();
  const activeCandidate = activeId ? allCandidates.find(c => c.id === activeId) : null;

  const fetchCandidates = async (currentPage = page) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await candidateService.getCandidatesByStages({
        page: currentPage,
        pageSize,
        stages: [...CANDIDATE_STAGES] as Candidate['stage'][]
      });
      
      const newCandidatesByStage = { ...candidatesByStage };
      const newStageStats = { ...stageStats };

      Object.entries(response).forEach(([stage, stageData]) => {
        newCandidatesByStage[stage] = stageData.data;

        newStageStats[stage] = {
          total: stageData.pagination.total,
          hasMore: stageData.data.length === pageSize && 
            currentPage * pageSize < stageData.pagination.total
        };
      });

      setCandidatesByStage(newCandidatesByStage);
      setStageStats(newStageStats);
      setPage(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(1);
  }, []); 

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const candidateId = active.id as string;
    const overId = over.id as string;

    const targetCandidateStage = Object.keys(candidatesByStage).find(stage => 
      candidatesByStage[stage].some(c => c.id === overId)
    );
    const draggedCandidateStage = Object.keys(candidatesByStage).find(stage => 
      candidatesByStage[stage].some(c => c.id === candidateId)
    );
    
    if (!targetCandidateStage || !draggedCandidateStage) return;

    const targetCandidate = candidatesByStage[targetCandidateStage].find(c => c.id === overId);
    const draggedCandidate = candidatesByStage[draggedCandidateStage].find(c => c.id === candidateId);

    if (!targetCandidate || !draggedCandidate) return;

    if (targetCandidate.stage === draggedCandidate.stage) {
      const stageCandidates = [...candidatesByStage[targetCandidate.stage]]
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const draggedIndex = stageCandidates.findIndex(c => c.id === candidateId);
      const targetIndex = stageCandidates.findIndex(c => c.id === overId);
      
      if (draggedIndex === -1 || targetIndex === -1) return;

      const newStageCandidates = [...stageCandidates];
      [newStageCandidates[draggedIndex], newStageCandidates[targetIndex]] = 
      [newStageCandidates[targetIndex], newStageCandidates[draggedIndex]];

      // update state
      setIsUpdating(true);

      try {
        const candidateIds = newStageCandidates.map(c => c.id);
        await candidateService.reorderCandidatesInStage(draggedCandidate.stage, candidateIds);
        await fetchCandidates(page); // Refresh current page to ensure order is consistent
      } catch (error) {
        console.error('Failed to reorder candidates:', error);
        setError('Failed to reorder candidates. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    } else {
      // moving to different stage
      setIsUpdating(true);

      try {
        // use updateCandidateStage so a timeline event is created
        await candidateService.updateCandidateStage(candidateId, targetCandidate.stage as Candidate['stage']);
        // ensure ordering resets for the moved candidate
        await candidateService.updateCandidate(candidateId, { order: 0 });
        await fetchCandidates(page); // Refresh current page
      } catch (error) {
        console.error('Failed to update candidate stage:', error);
        setError('Failed to update candidate stage. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleViewCandidate = (candidate: Candidate) => {
    navigate(`/candidates/${candidate.id}`);
  };
  const handleDeleteCandidate = async (candidate: Candidate) => {
    const ok = window.confirm(`Delete candidate "${candidate.name}"?`);
    if (!ok) return;
    await candidateService.deleteCandidate(candidate.id);
    await fetchCandidates();
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
        </div>
      </div>

      {isUpdating && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Updating candidate...
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(active.id as string)}
        onDragEnd={(event) => {
          setActiveId(null);
          handleDragEnd(event);
        }}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {CANDIDATE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              candidates={candidatesByStage[stage] || []}
              totalCount={stageStats[stage]?.total || 0}
              onViewCandidate={handleViewCandidate}
              onDeleteCandidate={handleDeleteCandidate}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{
          duration: 50,
          easing: 'linear',
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.8'
              }
            }
          })
        }}>
          {activeId && activeCandidate ? (
            <KanbanCard
              candidate={activeCandidate}
              onView={handleViewCandidate}
              onDelete={handleDeleteCandidate}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchCandidates(page - 1)}
            disabled={page === 1 || isUpdating}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchCandidates(page + 1)}
            disabled={page >= totalPages || isUpdating}
          >
            Next
          </Button>
        </div>
      )}

      {allCandidates.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first candidate</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesKanban;
