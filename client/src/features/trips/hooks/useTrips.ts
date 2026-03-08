import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Trip, TripWithRole, CreateTripInput } from "../trips.types";

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: () => api.get<TripWithRole[]>("/api/trips"),
  });
}

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ["trips", tripId],
    queryFn: () => api.get<Trip>(`/api/trips/${tripId}`),
    enabled: !!tripId,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTripInput) => api.post<Trip>("/api/trips", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useUpdateTrip(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateTripInput>) =>
      api.patch<Trip>(`/api/trips/${tripId}`, data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ["trips", tripId] });
      const previousTrip = qc.getQueryData<Trip>(["trips", tripId]);
      const previousTrips = qc.getQueryData<TripWithRole[]>(["trips"]);

      if (previousTrip) {
        qc.setQueryData<Trip>(["trips", tripId], { ...previousTrip, ...data });
      }

      qc.setQueryData<TripWithRole[]>(["trips"], (old) => {
        if (!old) return old;
        return old.map((t) => (t.id === tripId ? { ...t, ...data } : t));
      });

      return { previousTrip, previousTrips };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTrip) {
        qc.setQueryData(["trips", tripId], context.previousTrip);
      }
      if (context?.previousTrips) {
        qc.setQueryData(["trips"], context.previousTrips);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["trips", tripId] });
    },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => api.delete(`/api/trips/${tripId}`),
    onMutate: async (tripId) => {
      await qc.cancelQueries({ queryKey: ["trips"] });
      const previous = qc.getQueryData<TripWithRole[]>(["trips"]);

      qc.setQueryData<TripWithRole[]>(["trips"], (old) => {
        if (!old) return old;
        return old.filter((t) => t.id !== tripId);
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["trips"], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}
