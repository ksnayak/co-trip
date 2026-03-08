import type { User, Session } from "@supabase/supabase-js";

export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
};
