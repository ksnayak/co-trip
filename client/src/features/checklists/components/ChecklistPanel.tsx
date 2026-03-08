import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, ListChecks, Package, CheckSquare, GripVertical, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTripRole } from "@/hooks/useTripRole";
import { useMembers } from "@/features/members/hooks/useMembers";
import {
  useChecklists,
  useCreateChecklist,
  useDeleteChecklist,
  useAddChecklistItem,
  useToggleChecklistItem,
  useUpdateChecklistItem,
  useReorderChecklistItems,
  useDeleteChecklistItem,
} from "../hooks/useChecklists";
import { toast } from "sonner";
import type { Checklist, ChecklistItem } from "../checklists.types";
import type { TripMember } from "@/features/members/members.types";

const typeIcons = { packing: Package, todo: CheckSquare, custom: ListChecks };

export function ChecklistPanel({ tripId }: { tripId: string }) {
  const { data: checklists, isLoading } = useChecklists(tripId);
  const { canEdit } = useTripRole();
  const createChecklist = useCreateChecklist(tripId);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      await createChecklist.mutateAsync({ title: newTitle.trim() });
      setNewTitle("");
      setShowCreate(false);
    } catch {
      toast.error("Failed to create checklist");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({length: 2}).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canEdit && (
        <div>
          {showCreate ? (
            <div className="flex gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Checklist name"
                className="max-w-xs h-10"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setShowCreate(false);
                }}
              />
              <Button size="sm" className="h-10" onClick={handleCreate}>Create</Button>
              <Button size="sm" variant="ghost" className="h-10" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New checklist
            </Button>
          )}
        </div>
      )}

      {!checklists?.length && (
        <div className="text-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
            <ListChecks className="h-8 w-8 text-primary" />
          </div>
          <p className="font-medium">No checklists yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create one to start tracking items</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {checklists?.map((checklist) => (
          <ChecklistCard key={checklist.id} checklist={checklist} tripId={tripId} />
        ))}
      </div>
    </div>
  );
}

function ChecklistCard({ checklist, tripId }: { checklist: Checklist; tripId: string }) {
  const { canEdit } = useTripRole();
  const deleteChecklist = useDeleteChecklist(tripId);
  const addItem = useAddChecklistItem(tripId);
  const toggleItem = useToggleChecklistItem(tripId);
  const deleteItem = useDeleteChecklistItem(tripId);
  const updateItem = useUpdateChecklistItem(tripId);
  const reorderItems = useReorderChecklistItems(tripId);
  const { data: members } = useMembers(tripId);
  const [newLabel, setNewLabel] = useState("");

  const Icon = typeIcons[checklist.type] || ListChecks;
  const items = [...(checklist.items || [])].sort((a, b) => a.position - b.position);
  const checked = items.filter((i) => i.is_checked).length;
  const total = items.length;
  const percent = total > 0 ? (checked / total) * 100 : 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    const reorderPayload = reordered.map((item, idx) => ({ id: item.id, position: idx }));
    reorderItems.mutate({ checklistId: checklist.id, items: reorderPayload });
  };

  const handleAddItem = async () => {
    if (!newLabel.trim()) return;
    await addItem.mutateAsync({ checklistId: checklist.id, label: newLabel.trim() });
    setNewLabel("");
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5 transition-colors hover:bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium truncate">{checklist.title}</h3>
          {total > 0 && (
            <span className="text-xs text-muted-foreground shrink-0">{checked}/{total}</span>
          )}
        </div>
        {canEdit && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => deleteChecklist.mutate(checklist.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {total > 0 && (
        <div className="mb-4 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {items.map((item) => (
              <SortableChecklistItemRow
                key={item.id}
                item={item}
                checklistId={checklist.id}
                onToggle={toggleItem}
                onDelete={deleteItem}
                onAssign={updateItem}
                canEdit={canEdit}
                members={members}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {canEdit && (
        <div className="mt-3 flex gap-2">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Add item..."
            className="h-9 text-sm"
            onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(); }}
          />
          {newLabel.trim() && (
            <Button size="sm" variant="ghost" className="h-9 text-primary" onClick={handleAddItem}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SortableChecklistItemRow({ item, checklistId, onToggle, onDelete, onAssign, canEdit, members }: {
  item: ChecklistItem;
  checklistId: string;
  onToggle: ReturnType<typeof useToggleChecklistItem>;
  onDelete: ReturnType<typeof useDeleteChecklistItem>;
  onAssign: ReturnType<typeof useUpdateChecklistItem>;
  canEdit: boolean;
  members?: TripMember[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const assignee = members?.find((m) => m.user_id === item.assigned_to);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 rounded-lg px-2 py-1.5 -mx-1 hover:bg-muted/30 transition-colors"
    >
      {canEdit && (
        <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -m-1">
          <GripVertical className="h-4 w-4 text-muted-foreground/40" />
        </span>
      )}
      <Checkbox
        checked={item.is_checked}
        onCheckedChange={(checked) => onToggle.mutate({ checklistId, itemId: item.id, is_checked: !!checked })}
        disabled={!canEdit}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <span className={`flex-1 text-sm transition-all ${item.is_checked ? "line-through text-muted-foreground/60" : ""}`}>
        {item.label}
      </span>

      {/* Assignee avatar / assign button */}
      {canEdit ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              {assignee ? (
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-primary/10 text-[8px] font-medium text-primary">
                    {assignee.profile?.display_name?.[0]?.toUpperCase() || assignee.profile?.email?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <UserCircle className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-opacity" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="end">
            <div className="text-[10px] font-medium text-muted-foreground px-2 py-1">Assign to</div>
            {item.assigned_to && (
              <button
                className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted transition-colors text-muted-foreground"
                onClick={() => onAssign.mutate({ checklistId, itemId: item.id, assigned_to: null })}
              >
                Unassign
              </button>
            )}
            {members?.map((m) => (
              <button
                key={m.user_id}
                className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted transition-colors ${m.user_id === item.assigned_to ? "bg-muted" : ""}`}
                onClick={() => onAssign.mutate({ checklistId, itemId: item.id, assigned_to: m.user_id })}
              >
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="bg-primary/10 text-[7px] font-medium text-primary">
                    {m.profile?.display_name?.[0]?.toUpperCase() || m.profile?.email?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{m.profile?.display_name || m.profile?.email}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      ) : (
        assignee && (
          <Avatar className="h-5 w-5 shrink-0">
            <AvatarFallback className="bg-primary/10 text-[8px] font-medium text-primary">
              {assignee.profile?.display_name?.[0]?.toUpperCase() || assignee.profile?.email?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        )
      )}

      {canEdit && (
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={() => onDelete.mutate({ checklistId, itemId: item.id })}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
