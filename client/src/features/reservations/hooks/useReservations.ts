import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Reservation, CreateReservationInput } from "../reservations.types";

export function useReservations(tripId: string) {
  return useQuery({
    queryKey: ["reservations", tripId],
    queryFn: () => api.get<Reservation[]>(`/api/trips/${tripId}/reservations`),
    enabled: !!tripId,
  });
}

export function useCreateReservation(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReservationInput) =>
      api.post<Reservation>(`/api/trips/${tripId}/reservations`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reservations", tripId] }),
  });
}

export function useUpdateReservation(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Reservation> & { id: string }) =>
      api.patch<Reservation>(`/api/trips/${tripId}/reservations/${id}`, data),
    onMutate: async ({ id, ...data }) => {
      await qc.cancelQueries({ queryKey: ["reservations", tripId] });
      const previous = qc.getQueryData<Reservation[]>(["reservations", tripId]);

      qc.setQueryData<Reservation[]>(["reservations", tripId], (old) => {
        if (!old) return old;
        return old.map((r) => (r.id === id ? { ...r, ...data } : r));
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["reservations", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["reservations", tripId] }),
  });
}

export function useDeleteReservation(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/trips/${tripId}/reservations/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["reservations", tripId] });
      const previous = qc.getQueryData<Reservation[]>(["reservations", tripId]);

      qc.setQueryData<Reservation[]>(["reservations", tripId], (old) => {
        if (!old) return old;
        return old.filter((r) => r.id !== id);
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["reservations", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["reservations", tripId] }),
  });
}
