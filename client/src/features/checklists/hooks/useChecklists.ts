import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRealtime } from "@/hooks/useRealtime";
import type { Checklist, CreateChecklistInput, CreateChecklistItemInput } from "../checklists.types";

export function useChecklists(tripId: string) {
  const query = useQuery({
    queryKey: ["checklists", tripId],
    queryFn: () => api.get<Checklist[]>(`/api/trips/${tripId}/checklists`),
    enabled: !!tripId,
  });

  useRealtime({
    table: "checklist_items",
    filter: `trip_id=eq.${tripId}`,
    queryKey: ["checklists", tripId],
    enabled: !!tripId,
  });

  return query;
}

export function useCreateChecklist(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChecklistInput) =>
      api.post<Checklist>(`/api/trips/${tripId}/checklists`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklists", tripId] }),
  });
}

export function useDeleteChecklist(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checklistId: string) =>
      api.delete(`/api/trips/${tripId}/checklists/${checklistId}`),
    onMutate: async (checklistId) => {
      await qc.cancelQueries({ queryKey: ["checklists", tripId] });
      const previous = qc.getQueryData<Checklist[]>(["checklists", tripId]);

      qc.setQueryData<Checklist[]>(["checklists", tripId], (old) => {
        if (!old) return old;
        return old.filter((c) => c.id !== checklistId);
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["checklists", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["checklists", tripId] }),
  });
}

export function useAddChecklistItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, ...data }: CreateChecklistItemInput & { checklistId: string }) =>
      api.post(`/api/trips/${tripId}/checklists/${checklistId}/items`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklists", tripId] }),
  });
}

export function useToggleChecklistItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, itemId, is_checked }: { checklistId: string; itemId: string; is_checked: boolean }) =>
      api.patch(`/api/trips/${tripId}/checklists/${checklistId}/items/${itemId}`, { is_checked }),
    onMutate: async ({ checklistId, itemId, is_checked }) => {
      await qc.cancelQueries({ queryKey: ["checklists", tripId] });
      const previous = qc.getQueryData<Checklist[]>(["checklists", tripId]);

      qc.setQueryData<Checklist[]>(["checklists", tripId], (old) => {
        if (!old) return old;
        return old.map((cl) => {
          if (cl.id !== checklistId) return cl;
          return { ...cl, items: cl.items.map((item) => item.id === itemId ? { ...item, is_checked } : item) };
        });
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["checklists", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["checklists", tripId] }),
  });
}

export function useUpdateChecklistItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, itemId, ...data }: { checklistId: string; itemId: string; assigned_to?: string | null }) =>
      api.patch(`/api/trips/${tripId}/checklists/${checklistId}/items/${itemId}`, data),
    onMutate: async ({ checklistId, itemId, ...data }) => {
      await qc.cancelQueries({ queryKey: ["checklists", tripId] });
      const previous = qc.getQueryData<Checklist[]>(["checklists", tripId]);

      qc.setQueryData<Checklist[]>(["checklists", tripId], (old) => {
        if (!old) return old;
        return old.map((cl) => {
          if (cl.id !== checklistId) return cl;
          return { ...cl, items: cl.items.map((item) => item.id === itemId ? { ...item, ...data } : item) };
        });
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["checklists", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["checklists", tripId] }),
  });
}

export function useReorderChecklistItems(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, items }: { checklistId: string; items: { id: string; position: number }[] }) =>
      api.post(`/api/trips/${tripId}/checklists/${checklistId}/items/reorder`, { items }),
    onMutate: async ({ checklistId, items: reorderedItems }) => {
      await qc.cancelQueries({ queryKey: ["checklists", tripId] });
      const previous = qc.getQueryData<Checklist[]>(["checklists", tripId]);

      qc.setQueryData<Checklist[]>(["checklists", tripId], (old) => {
        if (!old) return old;
        return old.map((checklist) => {
          if (checklist.id !== checklistId) return checklist;
          const positionMap = new Map(reorderedItems.map((i) => [i.id, i.position]));
          const updatedItems = checklist.items.map((item) => ({
            ...item,
            position: positionMap.get(item.id) ?? item.position,
          }));
          return { ...checklist, items: updatedItems };
        });
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["checklists", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["checklists", tripId] }),
  });
}

export function useDeleteChecklistItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, itemId }: { checklistId: string; itemId: string }) =>
      api.delete(`/api/trips/${tripId}/checklists/${checklistId}/items/${itemId}`),
    onMutate: async ({ checklistId, itemId }) => {
      await qc.cancelQueries({ queryKey: ["checklists", tripId] });
      const previous = qc.getQueryData<Checklist[]>(["checklists", tripId]);

      qc.setQueryData<Checklist[]>(["checklists", tripId], (old) => {
        if (!old) return old;
        return old.map((cl) => {
          if (cl.id !== checklistId) return cl;
          return { ...cl, items: cl.items.filter((item) => item.id !== itemId) };
        });
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["checklists", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["checklists", tripId] }),
  });
}
