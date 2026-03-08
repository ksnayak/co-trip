import { supabase } from "../lib/supabase";

const BUCKET = "attachments";

export async function findByTripId(tripId: string) {
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((file) => ({
    ...file,
    file_url: resolveFileUrl(file.file_url),
  }));
}

function resolveFileUrl(fileUrl: string): string {
  if (fileUrl.startsWith("http")) return fileUrl;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileUrl);
  return data.publicUrl;
}

export async function create(data: {
  trip_id: string;
  target_type?: string;
  target_id?: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by: string;
}) {
  const { data: attachment, error } = await supabase
    .from("attachments")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return attachment;
}

export async function remove(id: string) {
  const { data: attachment, error: fetchError } = await supabase
    .from("attachments")
    .select("file_url")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  if (attachment?.file_url) {
    const path = attachment.file_url.split(`${BUCKET}/`)[1];
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }
  }

  const { error } = await supabase
    .from("attachments")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getSignedUploadUrl(
  tripId: string,
  fileName: string
) {
  const path = `${tripId}/${Date.now()}-${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error) throw error;
  return { signedUrl: data.signedUrl, path: data.path };
}
