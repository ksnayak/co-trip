export type ItineraryDay = {
  id: string;
  trip_id: string;
  date: string;
  title: string | null;
  notes: string | null;
  position: number;
  activities: Activity[];
};

export type Activity = {
  id: string;
  day_id: string;
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
  created_by: string;
  created_at: string;
};

export type CreateActivityInput = {
  day_id: string;
  title: string;
  description?: string;
  location?: string;
  url?: string;
  time_start?: string;
  time_end?: string;
  category?: string;
  notes?: string;
  cost_cents?: number;
};

export type ReorderItem = {
  id: string;
  day_id: string;
  position: number;
};
