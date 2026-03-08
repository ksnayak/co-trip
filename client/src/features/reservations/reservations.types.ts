export type Reservation = {
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
  created_by: string;
  created_at: string;
};

export type CreateReservationInput = {
  type: Reservation["type"];
  title: string;
  confirmation_code?: string;
  provider?: string;
  location?: string;
  start_datetime?: string;
  end_datetime?: string;
  cost_cents?: number;
  notes?: string;
};
