import { supabase } from "../lib/supabase";
import { createUserClient } from "../lib/supabase";

export async function findByTripId(tripId: string) {
  const { data, error } = await supabase
    .from("trip_invitations")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function findByToken(token: string) {
  const { data, error } = await supabase
    .from("trip_invitations")
    .select("*")
    .eq("token", token)
    .single();

  if (error) throw error;
  return data;
}

export async function create(data: {
  trip_id: string;
  invited_email: string;
  role: string;
  invited_by: string;
}) {
  const { data: invitation, error } = await supabase
    .from("trip_invitations")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return invitation;
}

export async function accept(token: string, userToken: string) {
  const userClient = createUserClient(userToken);
  const { error } = await userClient.rpc("accept_invitation", {
    invite_token: token,
  });

  if (error) throw error;
}
