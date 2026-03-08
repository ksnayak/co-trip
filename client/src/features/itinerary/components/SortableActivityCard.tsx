import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActivityCard } from "./ActivityCard";
import type { Activity } from "../itinerary.types";

export function SortableActivityCard({ activity, tripId, currencySymbol }: { activity: Activity; tripId: string; currencySymbol?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ActivityCard activity={activity} tripId={tripId} currencySymbol={currencySymbol} />
    </div>
  );
}
