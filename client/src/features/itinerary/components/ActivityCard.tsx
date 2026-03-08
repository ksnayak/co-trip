import { useState } from "react";
import { Clock, MapPin, Trash2, GripVertical, Link2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTripRole } from "@/hooks/useTripRole";
import { useUpdateActivity, useDeleteActivity } from "../hooks/useItinerary";
import type { Activity } from "../itinerary.types";
import { toast } from "sonner";

type Props = {
  activity: Activity;
  tripId?: string;
  isDragOverlay?: boolean;
  currencySymbol?: string;
};

export function ActivityCard({ activity, tripId, isDragOverlay, currencySymbol = "\u20B9" }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-lg border bg-card p-3 text-sm transition-all ${
        isDragOverlay
          ? "shadow-xl shadow-primary/10 rotate-2 border-primary/30"
          : "cursor-grab active:cursor-grabbing hover:border-primary/20 hover:shadow-sm"
      }`}
      onClick={() => !isDragOverlay && setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2">
        {!isDragOverlay && <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />}
        <div className="flex-1 min-w-0">
          <p className="font-medium leading-tight">{activity.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {activity.time_start && (
              <span className="flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5">
                <Clock className="h-3 w-3" />
                {activity.time_start.slice(0, 5)}
                {activity.time_end && ` - ${activity.time_end.slice(0, 5)}`}
              </span>
            )}
            {activity.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{activity.location}</span>
              </span>
            )}
            {activity.url && (
              <span className="flex items-center gap-1 text-primary/70">
                <Link2 className="h-3 w-3" />
              </span>
            )}
          </div>
          {activity.category && (
            <Badge variant="outline" className="mt-2 text-[10px] px-1.5 py-0 border-primary/20 text-primary/80">
              {activity.category}
            </Badge>
          )}
        </div>
      </div>

      {expanded && tripId && !isDragOverlay && (
        <ActivityDetail activity={activity} tripId={tripId} currencySymbol={currencySymbol} onClose={() => setExpanded(false)} />
      )}
    </div>
  );
}

function ActivityDetail({ activity, tripId, currencySymbol, onClose }: { activity: Activity; tripId: string; currencySymbol: string; onClose: () => void }) {
  const { canEdit } = useTripRole();
  const updateActivity = useUpdateActivity(tripId);
  const deleteActivity = useDeleteActivity(tripId);
  const [editing, setEditing] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const form = new FormData(e.currentTarget);
    try {
      await updateActivity.mutateAsync({
        id: activity.id,
        title: form.get("title") as string,
        description: (form.get("description") as string) || null,
        location: (form.get("location") as string) || null,
        url: (form.get("url") as string) || null,
        time_start: (form.get("time_start") as string) || null,
        time_end: (form.get("time_end") as string) || null,
        category: (form.get("category") as string) || null,
        notes: (form.get("notes") as string) || null,
        cost_cents: form.get("cost") ? Math.round(Number(form.get("cost")) * 100) : 0,
      });
      setEditing(false);
    } catch {
      toast.error("Failed to update activity");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteActivity.mutateAsync(activity.id);
      onClose();
    } catch {
      toast.error("Failed to delete activity");
    }
  };

  if (!editing) {
    return (
      <div className="mt-3 space-y-2 border-t border-border/50 pt-3" onClick={(e) => e.stopPropagation()}>
        {activity.description && <p className="text-xs text-muted-foreground">{activity.description}</p>}
        {activity.notes && <p className="text-xs italic text-muted-foreground">{activity.notes}</p>}
        {activity.url && (
          <a
            href={activity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            {activity.url.replace(/^https?:\/\//, "").slice(0, 40)}
          </a>
        )}
        {activity.cost_cents > 0 && (
          <p className="text-xs font-medium text-primary">{currencySymbol}{((activity.cost_cents ?? 0) / 100).toFixed(2)}</p>
        )}
        {canEdit && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="mt-3 space-y-3 border-t border-border/50 pt-3" onClick={(e) => e.stopPropagation()}>
      <div>
        <Label className="text-xs">Title</Label>
        <Input name="title" defaultValue={activity.title} className="h-8 text-xs mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Start time</Label>
          <Input name="time_start" type="time" defaultValue={activity.time_start || ""} className="h-8 text-xs mt-1" />
        </div>
        <div>
          <Label className="text-xs">End time</Label>
          <Input name="time_end" type="time" defaultValue={activity.time_end || ""} className="h-8 text-xs mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Location</Label>
        <Input name="location" defaultValue={activity.location || ""} className="h-8 text-xs mt-1" />
      </div>
      <div>
        <Label className="text-xs">URL</Label>
        <Input name="url" type="url" defaultValue={activity.url || ""} className="h-8 text-xs mt-1" placeholder="https://..." />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Category</Label>
          <Input name="category" defaultValue={activity.category || ""} className="h-8 text-xs mt-1" placeholder="food, sightseeing..." />
        </div>
        <div>
          <Label className="text-xs">Cost ({currencySymbol})</Label>
          <Input name="cost" type="number" step="0.01" min="0" defaultValue={activity.cost_cents ? (activity.cost_cents / 100).toFixed(2) : ""} className="h-8 text-xs mt-1" placeholder="0.00" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Description</Label>
        <Textarea name="description" defaultValue={activity.description || ""} className="text-xs mt-1" rows={2} />
      </div>
      <div>
        <Label className="text-xs">Notes</Label>
        <Textarea name="notes" defaultValue={activity.notes || ""} className="text-xs mt-1" rows={2} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-7 text-xs" disabled={updateActivity.isPending}>
          Save
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
