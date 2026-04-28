import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Vote {
  id: string;
  run_id: string;
  user_id: string;
  scene_id: string;
  option_id: string;
  voted_at: string;
}

interface VoteCount {
  option_id: string;
  count: number;
}

/**
 * Hook для Realtime подписки на голоса в конкретной сцене
 * Возвращает как список голосов, так и подсчёт по опциям
 */
export function useRealtimeVotes(runId: string | null, sceneId: string | null) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voteCounts, setVoteCounts] = useState<VoteCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId || !sceneId) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel;

    const fetchVotes = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("votes")
          .select("*")
          .eq("run_id", runId)
          .eq("scene_id", sceneId)
          .order("voted_at", { ascending: true });

        if (fetchError) throw fetchError;
        
        const votesList = data || [];
        setVotes(votesList);
        
        // Подсчитываем голоса по опциям
        const counts = votesList.reduce((acc: Record<string, number>, vote) => {
          acc[vote.option_id] = (acc[vote.option_id] || 0) + 1;
          return acc;
        }, {});

        const countsArray = Object.entries(counts).map(([option_id, count]) => ({
          option_id,
          count: count as number,
        }));

        setVoteCounts(countsArray);
      } catch (err: any) {
        console.error("Error fetching votes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const setupRealtime = () => {
      channel = supabase
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
            console.log("Vote realtime event:", payload);

            // Фильтруем по scene_id на клиенте (т.к. в filter нельзя 2 условия)
            const newVote = payload.new as Vote;
            const oldVote = payload.old as Vote;

            if (payload.eventType === "INSERT" && newVote.scene_id === sceneId) {
              setVotes((prev) => [...prev, newVote]);
              
              // Обновляем счётчики
              setVoteCounts((prev) => {
                const existing = prev.find((c) => c.option_id === newVote.option_id);
                if (existing) {
                  return prev.map((c) =>
                    c.option_id === newVote.option_id
                      ? { ...c, count: c.count + 1 }
                      : c
                  );
                } else {
                  return [...prev, { option_id: newVote.option_id, count: 1 }];
                }
              });
            } else if (payload.eventType === "DELETE" && oldVote.scene_id === sceneId) {
              setVotes((prev) => prev.filter((v) => v.id !== oldVote.id));
              
              // Обновляем счётчики
              setVoteCounts((prev) =>
                prev
                  .map((c) =>
                    c.option_id === oldVote.option_id
                      ? { ...c, count: c.count - 1 }
                      : c
                  )
                  .filter((c) => c.count > 0)
              );
            }
          }
        )
        .subscribe((status) => {
          console.log("Votes realtime subscription status:", status);
        });
    };

    fetchVotes();
    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [runId, sceneId]);

  return { votes, voteCounts, loading, error };
}
