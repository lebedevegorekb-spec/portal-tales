import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string | null;
  display_name: string;
  is_host: boolean;
  ready: boolean;
  joined_at: string;
}

/**
 * Hook для Realtime подписки на игроков в комнате
 * Автоматически обновляет список при изменениях
 */
export function useRealtimePlayers(roomId: string | null) {
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel;

    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("room_players")
          .select("*")
          .eq("room_id", roomId)
          .order("joined_at", { ascending: true });

        if (fetchError) throw fetchError;
        setPlayers(data || []);
      } catch (err: any) {
        console.error("Error fetching players:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const setupRealtime = () => {
      channel = supabase
        .channel(`room_players:${roomId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "room_players",
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            console.log("Realtime event:", payload);

            if (payload.eventType === "INSERT") {
              setPlayers((prev) => [...prev, payload.new as RoomPlayer]);
            } else if (payload.eventType === "UPDATE") {
              setPlayers((prev) =>
                prev.map((p) =>
                  p.id === (payload.new as RoomPlayer).id
                    ? (payload.new as RoomPlayer)
                    : p
                )
              );
            } else if (payload.eventType === "DELETE") {
              setPlayers((prev) =>
                prev.filter((p) => p.id !== (payload.old as RoomPlayer).id)
              );
            }
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status:", status);
        });
    };

    fetchPlayers();
    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [roomId]);

  return { players, loading, error };
}
