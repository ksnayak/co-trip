import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

type RealtimeConfig = {
  table: string;
  filter?: string;
  queryKey: unknown[];
  enabled?: boolean;
};

export function useRealtime({ table, filter, queryKey, enabled = true }: RealtimeConfig) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    let channel: RealtimeChannel;

    const channelName = `${table}-${filter || "all"}-${Date.now()}`;

    channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, JSON.stringify(queryKey), enabled, queryClient]);
}
