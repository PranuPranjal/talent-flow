import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import type { Candidate } from '../../types';
import { FiEye, FiTrash2 } from 'react-icons/fi';

interface KanbanCardProps {
  candidate: Candidate;
  onView: (candidate: Candidate) => void;
  onDelete?: (candidate: Candidate) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ candidate, onView, onDelete }) => {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: candidate.id,
    animateLayoutChanges: () => false
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
    zIndex: isDragging ? 999 : 1,
    willChange: 'transform'
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleView = () => {
    onView ? onView(candidate) : navigate(`/candidates/${candidate.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-gray-900 text-sm truncate">
          {candidate.name}
        </h4>
        <button
          type="button"
          aria-label="Drag card"
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h.01M12 9h.01M16 9h.01M8 15h.01M12 15h.01M16 15h.01" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-gray-600 truncate">{candidate.email}</p>

      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
        <span>{candidate.experience}y exp</span>
        <span>•</span>
        <span>{formatDate(candidate.appliedAt)}</span>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
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

      <div className="flex justify-end gap-1 pt-3 mt-2 border-t">
        <button
          type="button"
          aria-label="View candidate"
          title="View"
          onClick={(e) => { e.stopPropagation(); handleView(); }}
          className="p-2 text-gray-600 hover:text-gray-800"
        >
          <FiEye />
        </button>
        {onDelete && (
          <button
            type="button"
            aria-label="Delete candidate"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); onDelete(candidate); }}
            className="p-2 text-red-600 hover:text-red-700"
          >
            <FiTrash2 />
          </button>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;