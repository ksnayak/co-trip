import { supabase } from "../lib/supabase";

export async function findByExpenseId(expenseId: string) {
  const { data, error } = await supabase
    .from("expense_splits")
    .select("*, profiles:user_id(id, display_name, avatar_url, email)")
    .eq("expense_id", expenseId);

  if (error) throw error;
  return data ?? [];
}

export async function findByTripId(tripId: string) {
  const { data, error } = await supabase
    .from("expense_splits")
    .select("*, profiles:user_id(id, display_name, avatar_url, email)")
    .eq("trip_id", tripId);

  if (error) throw error;
  return data ?? [];
}

export async function createMany(
  splits: {
    expense_id: string;
    trip_id: string;
    user_id: string;
    amount_cents: number;
  }[]
) {
  if (splits.length === 0) return [];

  const { data, error } = await supabase
    .from("expense_splits")
    .insert(splits)
    .select();

  if (error) throw error;
  return data ?? [];
}

export async function deleteByExpenseId(expenseId: string) {
  const { error } = await supabase
    .from("expense_splits")
    .delete()
    .eq("expense_id", expenseId);

  if (error) throw error;
}

export async function settle(id: string) {
  const { data, error } = await supabase
    .from("expense_splits")
    .update({ is_settled: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
