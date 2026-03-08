export type TripMember = {
  id: string;
  trip_id: string;
  user_id: string;
  role: "owner" | "editor" | "viewer";
  created_at: string;
  profile?: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
};

export type TripInvitation = {
  id: string;
  trip_id: string;
  invited_email: string;
  role: "editor" | "viewer";
  status: "pending" | "accepted" | "declined";
  token: string;
  invited_by: string;
  expires_at: string;
  created_at: string;
};

export type InviteInput = {
  email: string;
  role: "editor" | "viewer";
};
