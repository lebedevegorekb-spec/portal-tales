import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRoundAdvance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const advance = async (runId: string, roomId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await supabase.functions.invoke("round-advance", {
        body: { run_id: runId, room_id: roomId },
      });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { advance, loading, error };
}
