export type Attachment = {
  id: string;
  trip_id: string;
  target_type: string | null;
  target_id: string | null;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
};
