import React, { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Define props interface for TypeScript
interface SortableItemProps {
  id: string;
  children: ReactNode;
  data?: {
    from: string; // Can be 'toolbox' or 'form-preview'
    component?: any; // Optional for when the item comes from the toolbox
  };
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children, data }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  // Transform object to translate the draggable component's position smoothly
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} data-type={data?.from}>
      {children}
    </div>
  );
};

export default SortableItem;
