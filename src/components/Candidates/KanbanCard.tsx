import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Candidate } from '../../types';

interface KanbanCardProps {
  candidate: Candidate;
  onView: (candidate: Candidate) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ candidate, onView }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-gray-900 text-sm truncate">
            {candidate.name}
          </h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(candidate);
            }}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
          >
            View
          </button>
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
    </div>
  );
};

export default KanbanCard;
