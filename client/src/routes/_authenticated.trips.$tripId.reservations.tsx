import { createFileRoute, useParams } from "@tanstack/react-router";
import { useReservations } from "@/features/reservations/hooks/useReservations";
import { ReservationTable } from "@/features/reservations/components/ReservationTable";
import { AddReservationDialog } from "@/features/reservations/components/ReservationForm";
import { useTripRole } from "@/hooks/useTripRole";
import { useTrip } from "@/features/trips/hooks/useTrips";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/trips/$tripId/reservations")({
  component: ReservationsPage,
});

function ReservationsPage() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/reservations" });
  const { data: reservations, isLoading } = useReservations(tripId);
  const { data: trip } = useTrip(tripId);
  const { canEdit } = useTripRole();
  const cs = getCurrencySymbol(trip?.currency);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          Reservations
        </h2>
        {canEdit && <AddReservationDialog tripId={tripId} />}
      </div>
      <ReservationTable reservations={reservations || []} tripId={tripId} currencySymbol={cs} />
    </div>
  );
}
