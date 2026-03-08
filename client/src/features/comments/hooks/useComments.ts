import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRealtime } from "@/hooks/useRealtime";
import type { Comment, CreateCommentInput } from "../comments.types";

export function useComments(tripId: string, targetType?: string, targetId?: string) {
  const params = new URLSearchParams();
  if (targetType) params.set("target_type", targetType);
  if (targetId) params.set("target_id", targetId);
  const qs = params.toString();

  const query = useQuery({
    queryKey: ["comments", tripId, targetType, targetId],
    queryFn: () => api.get<Comment[]>(`/api/trips/${tripId}/comments${qs ? `?${qs}` : ""}`),
    enabled: !!tripId,
  });

  useRealtime({
    table: "comments",
    filter: `trip_id=eq.${tripId}`,
    queryKey: ["comments", tripId],
    enabled: !!tripId,
  });

  return query;
}

export function useCreateComment(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentInput) =>
      api.post<Comment>(`/api/trips/${tripId}/comments`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", tripId] }),
  });
}

export function useDeleteComment(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      api.delete(`/api/trips/${tripId}/comments/${commentId}`),
    onMutate: async (commentId) => {
      await qc.cancelQueries({ queryKey: ["comments", tripId] });
      const queryFilter = { queryKey: ["comments", tripId], type: "active" as const };
      const queries = qc.getQueriesData<Comment[]>(queryFilter);

      const previousMap = new Map(queries);

      for (const [key] of queries) {
        qc.setQueryData<Comment[]>(key, (old) => {
          if (!old) return old;
          return old.filter((c) => c.id !== commentId);
        });
      }

      return { previousMap };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMap) {
        for (const [key, data] of context.previousMap) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["comments", tripId] }),
  });
}
