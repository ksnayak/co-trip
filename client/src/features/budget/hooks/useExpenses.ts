import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRealtime } from "@/hooks/useRealtime";
import type { Expense, BudgetSummary, CreateExpenseInput, SettlementSummary } from "../budget.types";

export function useExpenses(tripId: string) {
  const query = useQuery({
    queryKey: ["expenses", tripId],
    queryFn: () => api.get<Expense[]>(`/api/trips/${tripId}/expenses`),
    enabled: !!tripId,
  });

  useRealtime({
    table: "expenses",
    filter: `trip_id=eq.${tripId}`,
    queryKey: ["expenses", tripId],
    enabled: !!tripId,
  });

  return query;
}

export function useBudgetSummary(tripId: string) {
  return useQuery({
    queryKey: ["budget-summary", tripId],
    queryFn: () => api.get<BudgetSummary>(`/api/trips/${tripId}/budget/summary`),
    enabled: !!tripId,
  });
}

export function useSettlements(tripId: string) {
  return useQuery({
    queryKey: ["settlements", tripId],
    queryFn: () => api.get<SettlementSummary>(`/api/trips/${tripId}/budget/settlements`),
    enabled: !!tripId,
  });
}

function invalidateBudget(qc: ReturnType<typeof useQueryClient>, tripId: string) {
  qc.invalidateQueries({ queryKey: ["expenses", tripId] });
  qc.invalidateQueries({ queryKey: ["budget-summary", tripId] });
  qc.invalidateQueries({ queryKey: ["settlements", tripId] });
}

export function useCreateExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseInput) =>
      api.post<Expense>(`/api/trips/${tripId}/expenses`, data),
    onSuccess: () => invalidateBudget(qc, tripId),
  });
}

export function useUpdateExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Expense> & { id: string }) =>
      api.patch<Expense>(`/api/trips/${tripId}/expenses/${id}`, data),
    onMutate: async ({ id, ...data }) => {
      await qc.cancelQueries({ queryKey: ["expenses", tripId] });
      const previous = qc.getQueryData<Expense[]>(["expenses", tripId]);

      qc.setQueryData<Expense[]>(["expenses", tripId], (old) => {
        if (!old) return old;
        return old.map((e) => (e.id === id ? { ...e, ...data } : e));
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["expenses", tripId], context.previous);
      }
    },
    onSettled: () => invalidateBudget(qc, tripId),
  });
}

export function useDeleteExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) =>
      api.delete(`/api/trips/${tripId}/expenses/${expenseId}`),
    onMutate: async (expenseId) => {
      await qc.cancelQueries({ queryKey: ["expenses", tripId] });
      const previous = qc.getQueryData<Expense[]>(["expenses", tripId]);

      qc.setQueryData<Expense[]>(["expenses", tripId], (old) => {
        if (!old) return old;
        return old.filter((e) => e.id !== expenseId);
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["expenses", tripId], context.previous);
      }
    },
    onSettled: () => invalidateBudget(qc, tripId),
  });
}
