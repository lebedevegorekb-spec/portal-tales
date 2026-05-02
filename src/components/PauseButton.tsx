import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Pause, Play, Loader2 } from "lucide-react";

interface PauseButtonProps {
  roomId: string;
  status: string;
}

export function PauseButton({ roomId, status }: PauseButtonProps) {
  const [loading, setLoading] = useState(false);
  const isPaused = status === "paused";

  const handlePause = async () => {
    setLoading(true);
    const { error } = await supabase.functions.invoke("room-pause", {
      body: { room_id: roomId },
    });
    if (error) console.error("Pause error:", error);
    setLoading(false);
  };

  return (
    <Button
      onClick={handlePause}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : isPaused
        ? <Play className="w-4 h-4" />
        : <Pause className="w-4 h-4" />}
      {isPaused ? "Продолжить" : "Пауза"}
    </Button>
  );
}
