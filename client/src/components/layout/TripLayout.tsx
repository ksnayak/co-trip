import { Link, Outlet, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import { useTrip } from "@/features/trips/hooks/useTrips";
import { useMembers } from "@/features/members/hooks/useMembers";
import { TripRoleProvider } from "@/features/trips/components/TripRoleProvider";
import { EditTripDialog } from "@/features/trips/components/EditTripDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { TripRole } from "@/hooks/useTripRole";
import { useAuth } from "@/features/auth/hooks/useAuth";

const tabs = [
  { label: "Itinerary", path: "itinerary" },
  { label: "Budget", path: "budget" },
  { label: "Checklists", path: "checklists" },
  { label: "Reservations", path: "reservations" },
  { label: "Files", path: "files" },
  { label: "Members", path: "members" },
] as const;

export function TripLayout() {
  const { tripId } = useParams({ strict: false }) as { tripId: string };
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const { data: members } = useMembers(tripId);
  const { user } = useAuth();

  const currentMember = members?.find((m) => m.user_id === user?.id);
  const role: TripRole = (currentMember?.role as TripRole) || "viewer";

  if (tripLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="flex gap-2 overflow-x-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!trip) return <div className="p-8 text-center text-muted-foreground">Trip not found</div>;

  const dateRange = trip.start_date && trip.end_date
    ? `${format(new Date(trip.start_date), "MMM d")} - ${format(new Date(trip.end_date), "MMM d, yyyy")}`
    : null;

  return (
    <TripRoleProvider role={role}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Back link */}
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 py-2 -my-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to trips
        </Link>

        {/* Trip header */}
        <div className="mb-6 rounded-xl border border-border/50 bg-card/50 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{trip.title}</h1>
                {role === "owner" && <EditTripDialog trip={trip} />}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {trip.destination && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary/70" />
                    {trip.destination}
                  </span>
                )}
                {dateRange && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary/70" />
                    {dateRange}
                  </span>
                )}
                {members && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary/70" />
                    {members.length} member{members.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            {members && members.length > 0 && (
              <div className="flex -space-x-2 shrink-0">
                {members.slice(0, 5).map((m) => (
                  <Avatar key={m.id} className="h-8 w-8 border-2 border-card ring-1 ring-border/50">
                    <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
                      {m.profile?.display_name?.[0]?.toUpperCase() || m.profile?.email?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {members.length > 5 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium ring-1 ring-border/50">
                    +{members.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="mb-6 -mx-4 sm:mx-0 px-4 sm:px-0 flex gap-1 overflow-x-auto scrollbar-none border-b border-border/50">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={`/trips/${tripId}/${tab.path}` as string}
              className="whitespace-nowrap px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground border-b-2 border-transparent data-[status=active]:border-primary data-[status=active]:text-primary -mb-px"
              activeOptions={{ exact: true }}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <Outlet />
      </div>
    </TripRoleProvider>
  );
}
