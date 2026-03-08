import { supabase } from "../lib/supabase";

export async function findByTripId(tripId: string) {
  const { data, error } = await supabase
    .from("trip_members")
    .select("*, profiles(*)")
    .eq("trip_id", tripId);

  if (error) throw error;
  return data ?? [];
}

export async function findMembership(tripId: string, userId: string) {
  const { data, error } = await supabase
    .from("trip_members")
    .select("*")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function updateRole(id: string, role: string) {
  const { data, error } = await supabase
    .from("trip_members")
    .update({ role })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function remove(id: string) {
  const { error } = await supabase
    .from("trip_members")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
