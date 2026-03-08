import { supabase } from "../lib/supabase";

export async function findByTripId(tripId: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*, profiles:paid_by(id, display_name, avatar_url, email)")
    .eq("trip_id", tripId)
    .is("deleted_at", null)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function findById(id: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) throw error;
  return data;
}

export async function create(data: {
  trip_id: string;
  title: string;
  amount_cents: number;
  currency?: string;
  category?: string;
  split_type?: string;
  paid_by: string;
  date?: string;
  notes?: string;
}) {
  const { data: expense, error } = await supabase
    .from("expenses")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return expense;
}

export async function update(
  id: string,
  data: Partial<{
    title: string;
    amount_cents: number;
    currency: string;
    category: string;
    split_type: string;
    paid_by: string;
    date: string;
    notes: string;
  }>
) {
  const { data: expense, error } = await supabase
    .from("expenses")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return expense;
}

export async function softDelete(id: string) {
  const { error } = await supabase
    .from("expenses")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function getBudgetSummary(tripId: string) {
  const { data, error } = await supabase
    .from("budget_summary")
    .select("*")
    .eq("trip_id", tripId);

  if (error) throw error;
  return data ?? [];
}
