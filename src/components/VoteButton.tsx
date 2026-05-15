import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

interface VoteButtonProps {
  runId: string;
  sceneId: string;
  optionId: string;
  optionText: string;
  disabled?: boolean;
}

export default function VoteButton({ runId, sceneId, optionId, optionText, disabled }: VoteButtonProps) {
  const [loading,  setLoading]  = useState(false);
  const [voted,    setVoted]    = useState(false);
  const [playerId, setPlayerId] = useState("");

  useEffect(() => {
    // guest_player_id — единый ключ во всём проекте
    let id = localStorage.getItem("guest_player_id");
    if (!id) {
      id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("guest_player_id", id);
    }
    setPlayerId(id);
  }, []);

  const handleVote = async () => {
    if (!playerId || loading || voted || disabled) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("votes").insert({
        run_id:    runId,
        player_id: playerId,
        scene_id:  sceneId,
        option_id: optionId,
      });
      if (error) throw error;
      setVoted(true);
      toast.success("Голос принят!");
    } catch (err: any) {
      toast.error(err?.message ?? "Ошибка голосования");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleVote}
      disabled={disabled || loading || voted || !playerId}
      size="lg"
      className={`w-full h-14 text-base font-display gap-2 transition-all
        ${voted
          ? "bg-acid/20 border-acid/40 text-acid hover:bg-acid/20"
          : "bg-portal/10 border-portal/40 text-portal hover:bg-portal/20"
        `} border`}
      variant="outline"
    >
      {loading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : voted ? (
        <Check className="size-5" />
      ) : null}
      {voted ? "Проголосовано" : optionText}
    </Button>
  );
}
