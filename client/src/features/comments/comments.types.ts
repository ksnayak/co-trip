export type Comment = {
  id: string;
  trip_id: string;
  target_type: "day" | "activity";
  target_id: string;
  body: string;
  author_id: string;
  created_at: string;
  author?: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
};

export type CreateCommentInput = {
  target_type: "day" | "activity";
  target_id: string;
  body: string;
};
