import { supabase } from "../lib/supabase";

export async function findByTripId(
  tripId: string,
  targetType?: string,
  targetId?: string
) {
  let query = supabase
    .from("comments")
    .select("*, profiles:author_id(id, display_name, avatar_url)")
    .eq("trip_id", tripId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (targetType) query = query.eq("target_type", targetType);
  if (targetId) query = query.eq("target_id", targetId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function findById(id: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) throw error;
  return data;
}

export async function create(data: {
  trip_id: string;
  target_type: string;
  target_id: string;
  body: string;
  author_id: string;
}) {
  const { data: comment, error } = await supabase
    .from("comments")
    .insert(data)
    .select("*, profiles:author_id(id, display_name, avatar_url)")
    .single();

  if (error) throw error;
  return comment;
}

export async function update(id: string, body: string) {
  const { data: comment, error } = await supabase
    .from("comments")
    .update({ body })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return comment;
}

export async function softDelete(id: string) {
  const { error } = await supabase
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
