import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Shield, Zap } from "lucide-react";

function getPlayerId(userId?: string | null): string | null {
  if (userId) return userId;
  return localStorage.getItem("guest_player_id");
}

const Character = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const runId  = searchParams.get("run");
  const roomId = searchParams.get("room");

  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [character, setCharacter] = useState<any>(null);
  const [isSaboteur, setIsSaboteur] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const userId = getPlayerId(user?.id);
        if (!userId || !runId || !roomId) return;

        // Найти player_id в room_players
        const { data: rp } = await supabase
          .from("room_players")
          .select("id")
          .eq("room_id", roomId)
          .eq("user_id", userId)
          .maybeSingle();

        if (!rp) throw new Error("Игрок не найден");
        const pid = rp.id;
        setPlayerId(pid);

        // Загрузить run + scenario
        const { data: run } = await supabase
          .from("runs")
          .select("state_json, scenarios(scenario_json)")
          .eq("id", runId)
          .single();

        if (!run) throw new Error("Игра не найдена");

        const pg = run.state_json?.party_game;
        const role = pg?.player_roles?.[pid];
        setIsSaboteur(role === "saboteur");

        const charId = pg?.player_characters?.[pid];
        const characters = (run as any).scenarios?.scenario_json?.characters ?? [];
        const char = characters.find((c: any) => c.id === charId);
        setCharacter(char ?? null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [runId, roomId, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-portal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground text-center">Твоя роль</p>

        {/* Персонаж */}
        {character && (
          <div className="glass-card p-6 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-display mb-2">{character.name}</h2>
            <p className="text-muted-foreground text-sm mb-4">{character.description}</p>
            {character.traits?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {character.traits.map((t: string, i: number) => (
                  <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">{t}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Роль — показывается по нажатию */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full glass-card p-6 rounded-2xl border border-dashed border-border text-center hover:border-portal/40 transition-colors"
          >
            <p className="text-muted-foreground text-sm">Нажми чтобы узнать секретную роль</p>
          </button>
        ) : (
          <div className={`glass-card p-6 rounded-2xl animate-in zoom-in-95 duration-300 ${isSaboteur ? "border-destructive/40" : "border-acid/40"}`}>
            {isSaboteur ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-8 h-8 text-destructive" />
                  <h3 className="text-xl font-display text-destructive">Ты — Саботажник</h3>
                </div>
                <p className="text-sm text-muted-foreground">Твоя цель: помешать команде и незаметно всё сломать окончательно. Не раскрывайся.</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-8 h-8 text-acid" />
                  <h3 className="text-xl font-display text-acid">Ты — в Команде</h3>
                </div>
                <p className="text-sm text-muted-foreground">Ваша цель: спасти вселенную и найти саботажника среди вас.</p>
              </>
            )}
          </div>
        )}

        {revealed && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
            <button
              onClick={() => navigate(`/scene/${runId}`)}
              className="w-full h-14 bg-portal text-portal-foreground rounded-lg font-display text-lg"
            >
              Понял, играем →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Character;
