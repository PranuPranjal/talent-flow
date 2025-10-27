import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../../types';
import Button from './Button';

interface DraggableJobCardProps {
  job: Job;
  onView: (job: Job) => void;
}

const DraggableJobCard: React.FC<DraggableJobCardProps> = ({ job, onView }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

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
      {...listeners}
      className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? 'shadow-2xl' : ''
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
        <span className="text-sm text-gray-500">#{job.order}</span>
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
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/assessments/${job.id}/take`;
            }}
          >
            Assessment
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(job);
            }}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DraggableJobCard;
