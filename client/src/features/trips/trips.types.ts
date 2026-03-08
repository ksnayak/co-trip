export type Trip = {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  budget_cents: number;
  currency: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type TripWithRole = Trip & {
  role: "owner" | "editor" | "viewer";
  member_count?: number;
};

export type CreateTripInput = {
  title: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  budget_cents?: number;
  currency?: string;
};
