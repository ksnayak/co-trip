import { createFileRoute, useParams } from "@tanstack/react-router";
import { ItineraryBoard } from "@/features/itinerary/components/ItineraryBoard";
import { useTrip } from "@/features/trips/hooks/useTrips";
import { getCurrencySymbol } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/trips/$tripId/itinerary")({
  component: ItineraryPage,
});

function ItineraryPage() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/itinerary" });
  const { data: trip } = useTrip(tripId);
  const cs = getCurrencySymbol(trip?.currency);
  return <ItineraryBoard tripId={tripId} currencySymbol={cs} />;
}
