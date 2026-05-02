import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubmitParams {
  runId: string;
  roomId: string;
  playerId: string;
  roundId: string;
  mechanic: string;
  payload: Record<string, any>;
}

export function useRoundSubmit() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (params: SubmitParams) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("round-submit", {
        body: {
          run_id: params.runId,
          room_id: params.roomId,
          player_id: params.playerId,
          round_id: params.roundId,
          mechanic: params.mechanic,
          payload: params.payload,
        },
      });
      if (res.error) throw new Error(res.error.message);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setSubmitted(false); setError(null); };

  return { submit, loading, submitted, error, reset };
}
