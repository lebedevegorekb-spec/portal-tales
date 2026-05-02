import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PartyGameState } from "@/mechanics/types";

export function useGameState(runId: string | null): PartyGameState | null {
  const [state, setState] = useState<PartyGameState | null>(null);

  useEffect(() => {
    if (!runId) return;

    const fetchState = async () => {
      const { data } = await supabase
        .from("runs")
        .select("state_json")
        .eq("id", runId)
        .single();
      if (data?.state_json?.party_game) {
        setState(data.state_json.party_game as PartyGameState);
      }
    };

    fetchState();

    const channel = supabase
      .channel(`run_state:${runId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "runs", filter: `id=eq.${runId}` },
        (payload) => {
          const pg = (payload.new as any)?.state_json?.party_game;
          if (pg) setState(pg as PartyGameState);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [runId]);

  return state;
}
