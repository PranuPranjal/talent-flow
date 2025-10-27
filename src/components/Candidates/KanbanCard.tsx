import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Candidate } from '../../types';

interface KanbanCardProps {
  candidate: Candidate;
  onView: (candidate: Candidate) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ candidate }) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCardClick = () => {
    if (!isDragging) {
      setShowActions(true);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/candidates/${candidate.id}`);
  };

  const handleMove = () => {
    setShowActions(false);
    setIsDragMode(true);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg' : isDragMode ? 'cursor-grab' : ''
      }`}
    >
      {showActions ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-900 mb-2">What would you like to do?</p>
          <div className="flex gap-2">
            <button
              onClick={handleView}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
            >
              View
            </button>
            <button
              onClick={handleMove}
              className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs font-medium cursor-grab active:cursor-grabbing"
            >
              Move
            </button>
            <button
              onClick={() => setShowActions(false)}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="space-y-2"
          {...(isDragMode ? listeners : { onClick: handleCardClick })}
          style={isDragMode ? { cursor: 'grab' } : { cursor: 'pointer' }}
        >
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-gray-900 text-sm truncate">
              {candidate.name}
            </h4>
          </div>
        
        <p className="text-xs text-gray-600 truncate">{candidate.email}</p>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{candidate.experience}y exp</span>
          <span>•</span>
          <span>{formatDate(candidate.appliedAt)}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {(candidate.skills || []).slice(0, 2).map((skill) => (
            <span key={skill} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
              {skill}
            </span>
          ))}
          {(candidate.skills || []).length > 2 && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
              +{(candidate.skills || []).length - 2}
            </span>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default KanbanCard;