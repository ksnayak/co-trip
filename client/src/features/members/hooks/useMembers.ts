import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRealtime } from "@/hooks/useRealtime";
import type { TripMember, TripInvitation, InviteInput } from "../members.types";

type RawMember = Omit<TripMember, "profile"> & {
  profiles?: TripMember["profile"];
  profile?: TripMember["profile"];
};

export function useMembers(tripId: string) {
  const query = useQuery({
    queryKey: ["members", tripId],
    queryFn: async () => {
      const raw = await api.get<RawMember[]>(`/api/trips/${tripId}/members`);
      return raw.map((m) => ({
        ...m,
        profile: m.profile || m.profiles,
      })) as TripMember[];
    },
    enabled: !!tripId,
  });

  useRealtime({
    table: "trip_members",
    filter: `trip_id=eq.${tripId}`,
    queryKey: ["members", tripId],
    enabled: !!tripId,
  });

  return query;
}

export function useInvitations(tripId: string) {
  return useQuery({
    queryKey: ["invitations", tripId],
    queryFn: () => api.get<TripInvitation[]>(`/api/trips/${tripId}/invitations`),
    enabled: !!tripId,
  });
}

export function useInviteMember(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteInput) =>
      api.post<TripInvitation>(`/api/trips/${tripId}/invitations`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invitations", tripId] }),
  });
}

export function useUpdateMemberRole(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      api.patch(`/api/trips/${tripId}/members/${memberId}`, { role }),
    onMutate: async ({ memberId, role }) => {
      await qc.cancelQueries({ queryKey: ["members", tripId] });
      const previous = qc.getQueryData<TripMember[]>(["members", tripId]);

      qc.setQueryData<TripMember[]>(["members", tripId], (old) => {
        if (!old) return old;
        return old.map((m) => (m.id === memberId ? { ...m, role: role as TripMember["role"] } : m));
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["members", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["members", tripId] }),
  });
}

export function useRemoveMember(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      api.delete(`/api/trips/${tripId}/members/${memberId}`),
    onMutate: async (memberId) => {
      await qc.cancelQueries({ queryKey: ["members", tripId] });
      const previous = qc.getQueryData<TripMember[]>(["members", tripId]);

      qc.setQueryData<TripMember[]>(["members", tripId], (old) => {
        if (!old) return old;
        return old.filter((m) => m.id !== memberId);
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["members", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["members", tripId] }),
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (token: string) => api.post(`/api/invitations/${token}/accept`),
  });
}
