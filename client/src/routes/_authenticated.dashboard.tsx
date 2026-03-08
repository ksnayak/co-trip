import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTrips } from "@/features/trips/hooks/useTrips";
import { TripCard } from "@/features/trips/components/TripCard";
import { CreateTripDialog } from "@/features/trips/components/TripForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Compass, Map } from "lucide-react";
import { isAfter, isBefore, parseISO } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Filter = "all" | "upcoming" | "past";

function Dashboard() {
  const { data: trips, isLoading } = useTrips();
  const [filter, setFilter] = useState<Filter>("all");

  const now = new Date();

  const filtered = trips?.filter((trip) => {
    if (filter === "all") return true;
    if (!trip.end_date) return filter === "upcoming";
    if (filter === "upcoming") return isAfter(parseISO(trip.end_date), now);
    return isBefore(parseISO(trip.end_date), now);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Trips</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {trips?.length || 0} trip{trips?.length !== 1 ? "s" : ""} planned
          </p>
        </div>
        <CreateTripDialog />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-muted/50 rounded-lg w-fit">
        {(["all", "upcoming", "past"] as Filter[]).map((f) => (
          <Button
            key={f}
            variant="ghost"
            size="sm"
            onClick={() => setFilter(f)}
            className={`capitalize rounded-md px-4 transition-all ${
              filter === f
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="h-36" />
              <div className="p-4 space-y-2 bg-card">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trip grid */}
      {!isLoading && filtered && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            {filter === "all" ? (
              <Compass className="h-8 w-8 text-primary" />
            ) : (
              <Map className="h-8 w-8 text-primary" />
            )}
          </div>
          <p className="text-lg font-semibold">
            {filter === "all" ? "No trips yet" : `No ${filter} trips`}
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {filter === "all" ? "Create your first trip to get started" : "Check back later"}
          </p>
          {filter === "all" && <CreateTripDialog />}
        </div>
      )}
    </div>
  );
}
