import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { format } from "date-fns";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTripRole } from "@/hooks/useTripRole";
import { useCreateActivity } from "../hooks/useItinerary";
import { SortableActivityCard } from "./SortableActivityCard";
import type { ItineraryDay } from "../itinerary.types";
import { toast } from "sonner";

export function DayColumn({ day, tripId, currencySymbol = "\u20B9" }: { day: ItineraryDay; tripId: string; currencySymbol?: string }) {
  const { setNodeRef } = useDroppable({ id: day.id });
  const { canEdit } = useTripRole();
  const createActivity = useCreateActivity(tripId);
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const activityIds = day.activities
    .sort((a, b) => a.position - b.position)
    .map((a) => a.id);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try {
      await createActivity.mutateAsync({
        day_id: day.id,
        title: newTitle.trim(),
        cost_cents: newCost ? Math.round(Number(newCost) * 100) : undefined,
        url: newUrl.trim() || undefined,
      });
      setNewTitle("");
      setNewCost("");
      setNewUrl("");
      setAdding(false);
      setExpanded(false);
    } catch {
      toast.error("Failed to add activity");
    }
  };

  return (
    <div className="w-[85vw] sm:w-72 shrink-0">
      <div className="mb-3 flex items-center justify-between rounded-lg bg-card/80 border border-border/50 px-3 py-2.5">
        <div>
          <p className="text-sm font-semibold">
            {format(new Date(day.date), "EEE, MMM d")}
          </p>
          {day.title && (
            <p className="text-xs text-muted-foreground mt-0.5">{day.title}</p>
          )}
        </div>
        <span className="flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-primary/10 text-[11px] font-medium text-primary">
          {day.activities.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="min-h-[200px] space-y-2 rounded-xl border border-dashed border-border/40 bg-muted/20 p-2.5 transition-colors"
      >
        <SortableContext items={activityIds} strategy={verticalListSortingStrategy}>
          {day.activities
            .sort((a, b) => a.position - b.position)
            .map((activity) => (
              <SortableActivityCard key={activity.id} activity={activity} tripId={tripId} currencySymbol={currencySymbol} />
            ))}
        </SortableContext>

        {adding ? (
          <div className="space-y-1.5">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Activity name *"
              className="h-9 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !expanded) handleAdd();
                if (e.key === "Escape") { setAdding(false); setExpanded(false); }
              }}
            />
            {expanded && (
              <>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Cost ({currencySymbol})</Label>
                    <Input
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">URL</Label>
                    <Input
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      type="url"
                      placeholder="https://..."
                      className="h-8 text-xs"
                      onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-1.5 items-center">
              <Button size="sm" variant="ghost" className="h-8 px-3 text-primary" onClick={handleAdd}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-muted-foreground"
                onClick={() => setExpanded(!expanded)}
                type="button"
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
              <Button size="sm" variant="ghost" className="h-8 px-2 text-muted-foreground ml-auto" onClick={() => { setAdding(false); setExpanded(false); }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : canEdit ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-primary"
            onClick={() => setAdding(true)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add activity
          </Button>
        ) : null}
      </div>
    </div>
  );
}
