import { supabase } from "../lib/supabase";

export async function findByTripId(tripId: string) {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("trip_id", tripId)
    .is("deleted_at", null)
    .order("position");

  if (error) throw error;
  return data ?? [];
}

export async function findByDayId(dayId: string) {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("day_id", dayId)
    .is("deleted_at", null)
    .order("position");

  if (error) throw error;
  return data ?? [];
}

export async function findById(id: string) {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) throw error;
  return data;
}

export async function create(data: {
  trip_id: string;
  day_id?: string;
  title: string;
  description?: string;
  location?: string;
  url?: string;
  time_start?: string;
  time_end?: string;
  category?: string;
  notes?: string;
  cost_cents?: number;
  position: number;
  created_by: string;
}) {
  const { data: activity, error } = await supabase
    .from("activities")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return activity;
}

export async function update(
  id: string,
  data: Partial<{
    day_id: string;
    title: string;
    description: string;
    location: string;
    url: string;
    time_start: string;
    time_end: string;
    category: string;
    notes: string;
    cost_cents: number;
    position: number;
  }>
) {
  const { data: activity, error } = await supabase
    .from("activities")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return activity;
}

export async function softDelete(id: string) {
  const { error } = await supabase
    .from("activities")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function reorder(
  items: { id: string; day_id: string; position: number }[]
) {
  const updates = items.map((item) =>
    supabase
      .from("activities")
      .update({ day_id: item.day_id, position: item.position })
      .eq("id", item.id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}
