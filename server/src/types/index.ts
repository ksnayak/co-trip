import { User } from "@supabase/supabase-js";
import type { Request } from "express";

export type TripRole = "owner" | "editor" | "viewer";

export type Params = Record<string, string>;

export type TypedRequest<P extends Params = Params> = Request<P> & {
  user?: User;
  tripRole?: TripRole;
};

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  budget_cents: number;
  currency: string;
  created_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripRole;
  created_at: string;
  updated_at: string;
}

export interface TripInvitation {
  id: string;
  trip_id: string;
  invited_email: string;
  role: TripRole;
  status: "pending" | "accepted" | "declined";
  token: string;
  invited_by: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  date: string;
  title: string | null;
  notes: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  day_id: string | null;
  trip_id: string;
  title: string;
  description: string | null;
  location: string | null;
  url: string | null;
  time_start: string | null;
  time_end: string | null;
  category: string | null;
  notes: string | null;
  cost_cents: number;
  position: number;
  created_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  trip_id: string;
  target_type: "day" | "activity";
  target_id: string;
  body: string;
  author_id: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Checklist {
  id: string;
  trip_id: string;
  title: string;
  type: "packing" | "todo" | "custom";
  position: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  trip_id: string;
  label: string;
  is_checked: boolean;
  assigned_to: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  trip_id: string;
  type: "hotel" | "flight" | "restaurant" | "car" | "train" | "other";
  title: string;
  confirmation_code: string | null;
  provider: string | null;
  location: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  cost_cents: number;
  notes: string | null;
  created_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  title: string;
  amount_cents: number;
  currency: string;
  category: string | null;
  split_type: "equal" | "custom" | "full" | null;
  paid_by: string | null;
  date: string | null;
  notes: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  trip_id: string;
  user_id: string;
  amount_cents: number;
  is_settled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  trip_id: string;
  target_type: string | null;
  target_id: string | null;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      tripRole?: TripRole;
    }
  }
}
