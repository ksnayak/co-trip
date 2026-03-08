import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useItinerary, useReorderActivities } from "../hooks/useItinerary";
import { DayColumn } from "./DayColumn";
import { ActivityCard } from "./ActivityCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Activity, ItineraryDay } from "../itinerary.types";
import { Calendar } from "lucide-react";

export function ItineraryBoard({ tripId, currencySymbol = "\u20B9" }: { tripId: string; currencySymbol?: string }) {
  const { data: days, isLoading } = useItinerary(tripId);
  const reorder = useReorderActivities(tripId);
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [localDays, setLocalDays] = useState<ItineraryDay[] | null>(null);

  const displayDays = localDays || days || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const activityMap = useMemo(() => {
    const map = new Map<string, Activity>();
    for (const day of displayDays) {
      for (const act of day.activities) {
        map.set(act.id, act);
      }
    }
    return map;
  }, [displayDays]);



  const handleDragStart = (event: DragStartEvent) => {
    const activity = activityMap.get(event.active.id as string);
    if (activity) {
      setActiveActivity(activity);
      setLocalDays(days ? [...days.map((d) => ({ ...d, activities: [...d.activities] }))] : null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !localDays) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeDay = localDays.find((d) => d.activities.some((a) => a.id === activeId));
    let overDay = localDays.find((d) => d.activities.some((a) => a.id === overId));

    if (!overDay) {
      overDay = localDays.find((d) => d.id === overId);
    }

    if (!activeDay || !overDay || activeDay.id === overDay.id) return;

    setLocalDays((prev) => {
      if (!prev) return prev;
      return prev.map((day) => {
        if (day.id === activeDay.id) {
          return { ...day, activities: day.activities.filter((a) => a.id !== activeId) };
        }
        if (day.id === overDay.id) {
          const activity = activeDay.activities.find((a) => a.id === activeId);
          if (!activity) return day;
          const overIndex = day.activities.findIndex((a) => a.id === overId);
          const newActivities = [...day.activities];
          const insertAt = overIndex >= 0 ? overIndex : newActivities.length;
          newActivities.splice(insertAt, 0, { ...activity, day_id: day.id });
          return { ...day, activities: newActivities };
        }
        return day;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveActivity(null);

    if (!over || !localDays) {
      setLocalDays(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeDay = localDays.find((d) => d.activities.some((a) => a.id === activeId));
    if (!activeDay) {
      setLocalDays(null);
      return;
    }

    if (activeId !== overId && activeDay.activities.some((a) => a.id === overId)) {
      const oldIndex = activeDay.activities.findIndex((a) => a.id === activeId);
      const newIndex = activeDay.activities.findIndex((a) => a.id === overId);
      const reordered = arrayMove(activeDay.activities, oldIndex, newIndex);

      setLocalDays((prev) =>
        prev!.map((d) => (d.id === activeDay.id ? { ...d, activities: reordered } : d)),
      );
    }

    const finalDays = localDays.map((d) => {
      if (d.id === activeDay.id && activeId !== overId) {
        const oldIndex = d.activities.findIndex((a) => a.id === activeId);
        const newIndex = d.activities.findIndex((a) => a.id === overId);
        if (oldIndex >= 0 && newIndex >= 0) {
          return { ...d, activities: arrayMove(d.activities, oldIndex, newIndex) };
        }
      }
      return d;
    });

    const items = finalDays.flatMap((day) =>
      day.activities.map((act, idx) => ({
        id: act.id,
        day_id: day.id,
        position: idx,
      })),
    );

    reorder.mutate(items, {
      onSettled: () => setLocalDays(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-72 shrink-0 rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
            <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-muted animate-pulse" />
              <div className="h-16 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayDays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-semibold">No itinerary days</p>
        <p className="text-sm text-muted-foreground mt-1">Set trip dates to auto-generate days</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {displayDays
            .sort((a, b) => a.position - b.position)
            .map((day) => (
              <DayColumn key={day.id} day={day} tripId={tripId} currencySymbol={currencySymbol} />
            ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DragOverlay>
        {activeActivity ? <ActivityCard activity={activeActivity} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
