import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../../types';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiClipboard, FiPlus } from 'react-icons/fi';

interface DraggableJobCardProps {
  job: Job;
  hasAssessment?: boolean;
  onAddAssessment?: (job: Job) => void;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
}

const DraggableJobCard: React.FC<DraggableJobCardProps> = ({ job, hasAssessment, onAddAssessment, onView, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const navigate = useNavigate();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow ${
        isDragging ? 'shadow-2xl opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          job.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {job.status}
        </span>
        <span className="text-sm text-gray-500 flex items-center gap-2">
          #{job.order}
          <button
            type="button"
            aria-label="Drag job card"
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h.01M12 9h.01M16 9h.01M8 15h.01M12 15h.01M16 15h.01" />
            </svg>
          </button>
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{job.location}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            {tag}
          </span>
        ))}
        {job.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            +{job.tags.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t gap-2">
        <span className="text-sm font-medium text-gray-900">
          ${job.salary?.min.toLocaleString()} - ${job.salary?.max.toLocaleString()}
        </span>
        <div className="flex gap-1">
          {hasAssessment ? (
            <Button
              aria-label="Take assessment"
              title="Assessment"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/assessments/${job.id}/take`);
              }}
              className="p-2"
            >
              <FiClipboard />
            </Button>
          ) : (
            <Button
              aria-label="Add assessment"
              title="Add assessment"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddAssessment?.(job);
              }}
              className="p-2"
            >
              <FiPlus />
            </Button>
          )}
          <Button
            aria-label="View job"
            title="View"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(job);
            }}
            className="p-2"
          >
            <FiEye />
          </Button>
          <Button
            aria-label="Edit job"
            title="Edit"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(job);
            }}
            className="p-2"
          >
            <FiEdit2 />
          </Button>
          <Button
            aria-label="Delete job"
            title="Delete"
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(job);
            }}
            className="p-2"
          >
            <FiTrash2 />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DraggableJobCard;
