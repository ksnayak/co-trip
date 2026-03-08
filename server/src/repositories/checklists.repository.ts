import { supabase } from "../lib/supabase";

export async function findByTripId(tripId: string) {
  const { data, error } = await supabase
    .from("checklists")
    .select("*, items:checklist_items(*)")
    .eq("trip_id", tripId)
    .order("position")
    .order("position", { referencedTable: "items" });

  if (error) throw error;
  return data ?? [];
}

export async function findById(id: string) {
  const { data, error } = await supabase
    .from("checklists")
    .select("*, items:checklist_items(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function create(data: {
  trip_id: string;
  title: string;
  type?: string;
  position?: number;
  created_by: string;
}) {
  const { data: checklist, error } = await supabase
    .from("checklists")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return checklist;
}

export async function update(
  id: string,
  data: Partial<{ title: string; position: number }>
) {
  const { data: checklist, error } = await supabase
    .from("checklists")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return checklist;
}

export async function remove(id: string) {
  const { error } = await supabase
    .from("checklists")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function createItem(data: {
  checklist_id: string;
  trip_id: string;
  label: string;
  assigned_to?: string;
  position?: number;
}) {
  const { data: item, error } = await supabase
    .from("checklist_items")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return item;
}

export async function updateItem(
  id: string,
  data: Partial<{
    label: string;
    is_checked: boolean;
    assigned_to: string;
    position: number;
  }>
) {
  const { data: item, error } = await supabase
    .from("checklist_items")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return item;
}

export async function reorderItems(items: { id: string; position: number }[]) {
  const updates = items.map((item) =>
    supabase
      .from("checklist_items")
      .update({ position: item.position })
      .eq("id", item.id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

export async function removeItem(id: string) {
  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
