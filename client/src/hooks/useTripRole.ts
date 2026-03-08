import { useContext } from "react";
import { TripRoleContext } from "@/features/trips/components/TripRoleProvider";

export type TripRole = "owner" | "editor" | "viewer";

export function useTripRole() {
  const ctx = useContext(TripRoleContext);
  if (!ctx) throw new Error("useTripRole must be used within TripRoleProvider");
  return ctx;
}
