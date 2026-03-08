import { supabase } from "../lib/supabase";

export async function findByUserId(userId: string) {
  const { data, error } = await supabase
    .from("trip_members")
    .select("trip_id, role, trips(*)")
    .eq("user_id", userId)
    .is("trips.deleted_at", null);

  if (error) throw error;
  return data?.filter((m) => m.trips !== null) ?? [];
}

export async function findById(id: string) {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) throw error;
  return data;
}

export async function create(data: {
  title: string;
  description?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  budget_cents?: number;
  currency?: string;
  cover_image?: string;
  created_by: string;
}) {
  const { data: trip, error } = await supabase
    .from("trips")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return trip;
}

export async function update(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget_cents: number;
    currency: string;
    cover_image: string;
  }>
) {
  const { data: trip, error } = await supabase
    .from("trips")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return trip;
}

export async function softDelete(id: string) {
  const { error } = await supabase
    .from("trips")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
