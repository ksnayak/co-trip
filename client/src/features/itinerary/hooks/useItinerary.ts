import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRealtime } from "@/hooks/useRealtime";
import type { ItineraryDay, CreateActivityInput, ReorderItem, Activity } from "../itinerary.types";

export function useItinerary(tripId: string) {
  const query = useQuery({
    queryKey: ["itinerary", tripId],
    queryFn: () => api.get<ItineraryDay[]>(`/api/trips/${tripId}/days`),
    enabled: !!tripId,
  });

  useRealtime({
    table: "activities",
    filter: `trip_id=eq.${tripId}`,
    queryKey: ["itinerary", tripId],
    enabled: !!tripId,
  });

  return query;
}

export function useCreateActivity(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActivityInput) =>
      api.post<Activity>(`/api/trips/${tripId}/activities`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["itinerary", tripId] }),
  });
}

export function useUpdateActivity(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Activity> & { id: string }) =>
      api.patch<Activity>(`/api/trips/${tripId}/activities/${id}`, data),
    onMutate: async ({ id, ...data }) => {
      await qc.cancelQueries({ queryKey: ["itinerary", tripId] });
      const previous = qc.getQueryData<ItineraryDay[]>(["itinerary", tripId]);

      qc.setQueryData<ItineraryDay[]>(["itinerary", tripId], (old) => {
        if (!old) return old;
        return old.map((day) => ({
          ...day,
          activities: day.activities.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        }));
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["itinerary", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["itinerary", tripId] }),
  });
}

export function useDeleteActivity(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) =>
      api.delete(`/api/trips/${tripId}/activities/${activityId}`),
    onMutate: async (activityId) => {
      await qc.cancelQueries({ queryKey: ["itinerary", tripId] });
      const previous = qc.getQueryData<ItineraryDay[]>(["itinerary", tripId]);

      qc.setQueryData<ItineraryDay[]>(["itinerary", tripId], (old) => {
        if (!old) return old;
        return old.map((day) => ({
          ...day,
          activities: day.activities.filter((a) => a.id !== activityId),
        }));
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["itinerary", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["itinerary", tripId] }),
  });
}

export function useReorderActivities(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: ReorderItem[]) =>
      api.post(`/api/trips/${tripId}/activities/reorder`, { items }),
    onMutate: async (items) => {
      await qc.cancelQueries({ queryKey: ["itinerary", tripId] });
      const previous = qc.getQueryData<ItineraryDay[]>(["itinerary", tripId]);

      qc.setQueryData<ItineraryDay[]>(["itinerary", tripId], (old) => {
        if (!old) return old;

        const activityMap = new Map<string, Activity>();
        for (const day of old) {
          for (const a of day.activities) {
            activityMap.set(a.id, a);
          }
        }

        return old.map((day) => {
          const dayItems = items
            .filter((i) => i.day_id === day.id)
            .sort((a, b) => a.position - b.position);

          const activities = dayItems
            .map((i) => {
              const activity = activityMap.get(i.id);
              if (!activity) return null;
              return { ...activity, day_id: day.id, position: i.position };
            })
            .filter((a): a is Activity => a !== null);

          if (dayItems.length === 0) {
            const movedIds = new Set(items.map((i) => i.id));
            return {
              ...day,
              activities: day.activities.filter((a) => !movedIds.has(a.id)),
            };
          }

          return { ...day, activities };
        });
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["itinerary", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["itinerary", tripId] }),
  });
}
