import * as activitiesRepo from "../repositories/activities.repository";
import { supabase } from "../lib/supabase";
import { NotFoundError } from "../utils/errors";

export async function getDaysWithActivities(tripId: string) {
  const { data: days, error } = await supabase
    .from("itinerary_days")
    .select("*, activities(*)")
    .eq("trip_id", tripId)
    .is("activities.deleted_at", null)
    .order("position")
    .order("position", { referencedTable: "activities" });

  if (error) throw error;
  return days ?? [];
}

export async function updateDay(
  dayId: string,
  data: Partial<{ title: string; notes: string }>
) {
  const { data: day, error } = await supabase
    .from("itinerary_days")
    .update(data)
    .eq("id", dayId)
    .select()
    .single();

  if (error) throw error;
  return day;
}

export async function createActivity(
  userId: string,
  data: {
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
    position?: number;
  }
) {
  let position = data.position;
  if (position == null && data.day_id) {
    const { count } = await supabase
      .from("activities")
      .select("id", { count: "exact", head: true })
      .eq("day_id", data.day_id)
      .is("deleted_at", null);
    position = count ?? 0;
  }
  return activitiesRepo.create({ ...data, position: position ?? 0, created_by: userId });
}

export async function updateActivity(
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
  const activity = await activitiesRepo.update(id, data);
  if (!activity) throw new NotFoundError("Activity not found");
  return activity;
}

export async function deleteActivity(id: string) {
  await activitiesRepo.softDelete(id);
}

export async function reorderActivities(
  items: { id: string; day_id: string; position: number }[]
) {
  await activitiesRepo.reorder(items);
}
