import { createFileRoute } from "@tanstack/react-router";
import { TripLayout } from "@/components/layout/TripLayout";

export const Route = createFileRoute("/_authenticated/trips/$tripId")({
  component: TripLayout,
});
