import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Candidate } from '../../types';
import KanbanCard from './KanbanCard';
import { useMemo } from 'react';

interface KanbanColumnProps {
  stage: string;
  candidates: Candidate[];
  onViewCandidate: (candidate: Candidate) => void;
  onDeleteCandidate?: (candidate: Candidate) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, candidates, onViewCandidate, onDeleteCandidate }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: stage,
    data: {
      accepts: ['candidate'],
      stage
    }
  });

  const sortedCandidates = useMemo(() => 
    [...candidates].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [candidates]
  );

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'applied':
        return 'bg-blue-50 border-blue-200';
      case 'screen':
        return 'bg-yellow-50 border-yellow-200';
      case 'tech':
        return 'bg-purple-50 border-purple-200';
      case 'offer':
        return 'bg-green-50 border-green-200';
      case 'hired':
        return 'bg-emerald-50 border-emerald-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStageTitle = (stage: string) => {
    switch (stage) {
      case 'applied':
        return 'Applied';
      case 'screen':
        return 'Screening';
      case 'tech':
        return 'Technical';
      case 'offer':
        return 'Offer';
      case 'hired':
        return 'Hired';
      case 'rejected':
        return 'Rejected';
      default:
        return stage;
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
        <div className={`p-4 border-b ${getStageColor(stage)}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 capitalize">
              {getStageTitle(stage)}
            </h3>
            <span className="bg-white text-gray-600 text-sm px-2 py-1 rounded-full">
              {sortedCandidates.length}
            </span>
          </div>
        </div>
        
        <div
          ref={setNodeRef}
          className={`p-4 min-h-96 transition-all duration-200 ease-in-out ${
            isOver ? 'bg-blue-50 scale-102' : 'bg-gray-50'
          }`}
        >
          <SortableContext items={sortedCandidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {sortedCandidates.map((candidate) => (
                    <KanbanCard
                  key={candidate.id}
                  candidate={candidate}
                      onView={onViewCandidate}
                      onDelete={onDeleteCandidate}
                />
              ))}
              
              {sortedCandidates.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No candidates in this stage
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  );
};

export default KanbanColumn;
