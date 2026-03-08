export type Checklist = {
  id: string;
  trip_id: string;
  title: string;
  type: "packing" | "todo" | "custom";
  position: number;
  created_by: string;
  created_at: string;
  items: ChecklistItem[];
};

export type ChecklistItem = {
  id: string;
  checklist_id: string;
  trip_id: string;
  label: string;
  is_checked: boolean;
  assigned_to: string | null;
  position: number;
};

export type CreateChecklistInput = {
  title: string;
  type?: "packing" | "todo" | "custom";
};

export type CreateChecklistItemInput = {
  label: string;
  assigned_to?: string;
};
