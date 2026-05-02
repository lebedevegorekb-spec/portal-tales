import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RoundSubmission } from "@/mechanics/types";

export function useRoundSubmissions(
  runId: string | null,
  roundId: string | null
): RoundSubmission[] {
  const [submissions, setSubmissions] = useState<RoundSubmission[]>([]);

  useEffect(() => {
    if (!runId || !roundId) return;

    const fetchSubmissions = async () => {
      const { data } = await supabase
        .from("round_submissions")
        .select("*")
        .eq("run_id", runId)
        .eq("round_id", roundId);
      setSubmissions((data as RoundSubmission[]) ?? []);
    };

    fetchSubmissions();

    const channel = supabase
      .channel(`submissions:${runId}:${roundId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "round_submissions",
          filter: `run_id=eq.${runId}`,
        },
        (payload) => {
          const s = payload.new as RoundSubmission;
          if (s.round_id === roundId) {
            setSubmissions((prev) => [...prev, s]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [runId, roundId]);

  return submissions;
}
