import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TripWithRole } from "../trips.types";

export function TripCard({ trip }: { trip: TripWithRole }) {
  const dateRange = trip.start_date && trip.end_date
    ? `${format(new Date(trip.start_date), "MMM d")} - ${format(new Date(trip.end_date), "MMM d, yyyy")}`
    : null;

  return (
    <Link to={`/trips/${trip.id}/itinerary` as string}>
      <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 luxe-border">
        {trip.cover_image ? (
          <div className="h-36 overflow-hidden relative">
            <img
              src={trip.cover_image}
              alt={trip.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
            <Badge
              variant={trip.role === "owner" ? "default" : "secondary"}
              className="absolute top-3 right-3 text-xs"
            >
              {trip.role}
            </Badge>
          </div>
        ) : (
          <div className="h-36 bg-gradient-to-br from-primary/10 via-muted to-card relative flex items-center justify-center">
            <MapPin className="h-10 w-10 text-primary/20" />
            <Badge
              variant={trip.role === "owner" ? "default" : "secondary"}
              className="absolute top-3 right-3 text-xs"
            >
              {trip.role}
            </Badge>
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-1 text-base">{trip.title}</h3>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
          </div>
          <div className="mt-2.5 flex flex-col gap-1.5 text-sm text-muted-foreground">
            {trip.destination && (
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{trip.destination}</span>
              </span>
            )}
            {dateRange && (
              <span className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {dateRange}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
