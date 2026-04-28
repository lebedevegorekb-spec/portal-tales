import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Vote {
  id: string;
  run_id: string;
  player_id: string;
  scene_id: string;
  option_id: string;
  created_at: string;
}

export function useRealtimeVotes(runId: string, sceneId: string) {
  const [votes, setVotes] = useState<Vote[]>([]);

  useEffect(() => {
    if (!runId || !sceneId) return;

    const fetchVotes = async () => {
      const { data } = await supabase
        .from("votes")
        .select("*")
        .eq("run_id", runId)
        .eq("scene_id", sceneId);

      setVotes(data || []);
    };

    const channel = supabase
      .channel(`votes:${runId}:${sceneId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `run_id=eq.${runId}`,
        },
        (payload) => {
          const newVote = payload.new as Vote;
          if (payload.eventType === "INSERT" && newVote.scene_id === sceneId) {
            setVotes((prev) => [...prev, newVote]);
          }
        }
      )
      .subscribe();

    fetchVotes();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [runId, sceneId]);

  return votes;
}
