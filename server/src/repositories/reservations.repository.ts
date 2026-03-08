import { supabase } from "../lib/supabase";

export async function findByTripId(tripId: string) {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("trip_id", tripId)
    .is("deleted_at", null)
    .order("start_datetime");

  if (error) throw error;
  return data ?? [];
}

export async function findById(id: string) {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) throw error;
  return data;
}

export async function create(data: {
  trip_id: string;
  type: string;
  title: string;
  confirmation_code?: string;
  provider?: string;
  location?: string;
  start_datetime?: string;
  end_datetime?: string;
  cost_cents?: number;
  notes?: string;
  created_by: string;
}) {
  const { data: reservation, error } = await supabase
    .from("reservations")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return reservation;
}

export async function update(
  id: string,
  data: Partial<{
    type: string;
    title: string;
    confirmation_code: string;
    provider: string;
    location: string;
    start_datetime: string;
    end_datetime: string;
    cost_cents: number;
    notes: string;
  }>
) {
  const { data: reservation, error } = await supabase
    .from("reservations")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return reservation;
}

export async function softDelete(id: string) {
  const { error } = await supabase
    .from("reservations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
