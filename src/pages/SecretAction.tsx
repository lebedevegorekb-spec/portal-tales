import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { EyeOff, Lock, Check, Loader2, ShieldAlert, ArrowRight, Skull } from "lucide-react";
import { toast } from "sonner";

function getPlayerId(userId?: string | null): string {
  if (userId) return userId;
  let id = localStorage.getItem("guest_player_id");
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("guest_player_id", id);
  }
  return id;
}

type PrivateOption = {
  id: string;
  text: string;
  effect: Record<string, number>;
  revealed_in_final?: boolean;
};

type PrivateAction = {
  role_id: string;
  question: string;
  options: PrivateOption[];
};

type Status = "loading" | "idle" | "submitting" | "sent" | "waiting" | "no_action";

const TONE_MAP: Record<string, string> = {
  yes: "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
  no:  "border-border bg-background/40 text-foreground hover:bg-muted/40",
};

const SecretAction = () => {
  const { roleId } = useParams<{ roleId?: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const runId  = params.get("run");
  const roomId = params.get("room");
  const sceneId = params.get("scene");
  const playerId = useMemo(() => getPlayerId(user?.id), [user?.id]);
console.log("playerId:", playerId, "roomId:", roomId);
  const [privateAction, setPrivateAction] = useState<PrivateAction | null>(null);
  const [playerRoleId, setPlayerRoleId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [chosen, setChosen] = useState<PrivateOption | null>(null);

useEffect(() => {
    if (!runId || !sceneId) return;
    if (!playerId || playerId === "") return;

    const load = async () => {
      try {
        // Получаем role_id игрока
        const { data: playerRow } = await supabase
          .from("room_players")
          .select("role_id")
.eq("user_id", playerId)
.eq("room_id", roomId)
.maybeSingle();
        const pRoleId = playerRow?.role_id ?? roleId ?? null;
        setPlayerRoleId(pRoleId);

        // Получаем scenario_json
        const { data: run } = await supabase
          .from("runs")
          .select("scenario_id")
          .eq("id", runId)
          .single();

        const { data: scenario } = await supabase
          .from("scenarios")
          .select("scenario_json")
          .eq("id", run.scenario_id)
          .single();

        const scenes = (scenario.scenario_json as any)?.scenes ?? [];
        const scene = scenes.find((s: any) => s.scene_id === sceneId);
        const action: PrivateAction | undefined = scene?.private_actions?.find(
          (a: any) => a.role_id === pRoleId
        );

        if (!action) {
          setStatus("waiting"); // нет действия для этой роли — ждём
          return;
        }

        setPrivateAction(action);
        setStatus("idle");
      } catch (err: any) {
        toast.error(err?.message ?? "Ошибка загрузки");
        setStatus("no_action");
      }
    };

    load();
  }, [runId, sceneId, playerId, roleId]);

  const submit = async () => {
    if (!selected || !privateAction || !runId || !sceneId || status !== "idle") return;
    setStatus("submitting");

    try {
      const res = await fetch(
        `https://cdhzfeeueilgecmfgawy.supabase.co/functions/v1/secret-action`,
        {
          method: "POST",
          headers: {
  "Content-Type": "application/json",
  "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkaHpmZWV1ZWlsZ2VjbWZnYXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczOTEwNzEsImV4cCI6MjA5Mjk2NzA3MX0.ROklLakq8rC7Y0ioZYC3armIz1lhVs82kt29KD39Re0",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkaHpmZWV1ZWlsZ2VjbWZnYXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczOTEwNzEsImV4cCI6MjA5Mjk2NzA3MX0.ROklLakq8rC7Y0ioZYC3armIz1lhVs82kt29KD39Re0",
},
          body: JSON.stringify({
            run_id: runId,
            player_id: playerId,
            scene_id: sceneId,
            action_id: `${sceneId}_${playerRoleId}`,
            choice_id: selected,
          }),
        }
      );

      if (!res.ok) throw new Error("Ошибка сервера");

      const option = privateAction.options.find((o) => o.id === selected) ?? null;
      setChosen(option);
      setStatus("sent");
    } catch (err: any) {
      toast.error(err?.message ?? "Ошибка отправки");
      setStatus("idle");
    }
  };

  const next = () => {
    if (roomId && runId) navigate(`/vote?run=${runId}&room=${roomId}`);
    else navigate("/join");
  };

  // Не та роль — просто ждём
  if (status === "waiting" || status === "no_action") {
    return (
      <div className="min-h-screen flex flex-col bg-background scanlines">
        <SiteHeader />
        <main className="flex-1 container py-6 max-w-md flex flex-col items-center justify-center gap-4">
          <EyeOff className="size-10 text-muted-foreground" />
          <p className="text-sm font-mono text-muted-foreground text-center">
            Кое-кто делает тайный выбор…
          </p>
          <p className="text-xs text-muted-foreground/50">Жди следующей сцены</p>
        </main>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-background scanlines">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-portal" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
            Секретное действие · {playerRoleId}
          </span>
        </div>

        {status !== "sent" ? (
          <>
            <div className="flex items-center gap-3 mb-2">
              <Skull className="size-6 text-destructive shrink-0" />
              <h1 className="font-display font-bold text-2xl text-balance">
                {privateAction?.question}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Твой выбор повлияет на ход игры. Никто не узнает.
            </p>

            <div className="space-y-2.5">
              {privateAction?.options.map((opt) => {
                const isSelected = selected === opt.id;
                const tone = TONE_MAP[opt.id] ?? TONE_MAP["no"];
                const effectStr = Object.entries(opt.effect ?? {})
                  .map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${k}`)
                  .join(", ");

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelected(opt.id)}
                    disabled={status === "submitting"}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${tone} ${
                      isSelected ? "ring-2 ring-offset-2 ring-offset-background ring-portal scale-[1.01]" : "opacity-90"
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-semibold text-base">{opt.text}</div>
                        {effectStr && (
                          <div className="text-xs text-muted-foreground mt-0.5">{effectStr}</div>
                        )}
                      </div>
                      <div
                        className={`size-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "bg-portal border-portal" : "border-border"
                        }`}
                      >
                        {isSelected && <Check className="size-3.5 text-portal-foreground" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-border bg-background/40 p-3 flex gap-3">
              <EyeOff className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold">Никто не узнает</div>
                <div className="text-muted-foreground mt-0.5">
                  Действие отправляется анонимно. На TV появится только результат.
                </div>
              </div>
            </div>

            <Button
              onClick={submit}
              disabled={!selected || status === "submitting"}
              size="lg"
              className="mt-5 w-full bg-portal hover:bg-portal/90 text-portal-foreground shadow-[var(--shadow-portal)] h-14 text-base font-display font-semibold disabled:opacity-40"
            >
              {status === "submitting" ? (
                <><Loader2 className="size-5 animate-spin" /> Отправляем…</>
              ) : (
                <>Подтвердить выбор <ArrowRight className="size-5" /></>
              )}
            </Button>
          </>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="glass-card rounded-3xl p-6 text-center space-y-4 border-acid/40 shadow-[0_0_40px_-10px_hsl(var(--acid)/0.5)] animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto size-16 rounded-full bg-acid/15 border-2 border-acid/40 flex items-center justify-center">
                <Check className="size-8 text-acid" />
              </div>
              <div>
                <h2 className="font-display font-bold text-2xl">Действие отправлено</h2>
                <p className="text-sm text-muted-foreground mt-1.5 text-pretty">
                  Результат проявится в ходе следующей сцены. Никто не узнает, что выбрал именно ты.
                </p>
              </div>

              {chosen && (
                <div className="rounded-2xl border border-border bg-background/40 p-4 text-left">
                  <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Твой выбор</div>
                  <div className="mt-1 font-display font-semibold text-base">{chosen.text}</div>
                </div>
              )}

              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 flex gap-2.5">
                <ShieldAlert className="size-4 text-destructive shrink-0 mt-0.5" />
                <div className="text-xs text-left">
                  <div className="font-semibold text-destructive">Закрой экран</div>
                  <div className="text-muted-foreground mt-0.5">
                    Не позволяй соседу увидеть, что ты выбрал.
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={next}
              size="lg"
              className="mt-6 w-full bg-portal hover:bg-portal/90 text-portal-foreground shadow-[var(--shadow-portal)] h-14 text-base font-display font-semibold"
            >
              Продолжить <ArrowRight className="size-5" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SecretAction;
