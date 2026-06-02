import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Trophy, Target, CheckCircle2, XCircle, Skull, ShoppingCart, RotateCcw, Crown } from "lucide-react";

type PlayerReveal = {
  id: string;
  name: string;
  role: string;
  roleTone: "good" | "evil" | "neutral";
  goal: string;
  achieved: boolean;
};

type Betrayal = { by: string; what: string };

type FinalData = {
  endingId: string;
  endingTitle: string;
  endingText: string;
  players: PlayerReveal[];
  betrayals: Betrayal[];
  state: Record<string, number>;
};

const roleToneClass: Record<PlayerReveal["roleTone"], string> = {
  good:    "text-acid border-acid/40 bg-acid/10",
  evil:    "text-destructive border-destructive/40 bg-destructive/10",
  neutral: "text-muted-foreground border-border bg-muted/40",
};

const Final = () => {
  const { runId } = useParams<{ runId: string }>();
  const [data, setData]       = useState<FinalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;
    const load = async () => {
      try {
        // Вызываем run-finish
        const { data: result, error: fnErr } = await supabase.functions.invoke("run-finish", {
          body: { run_id: runId },
        });
        if (fnErr) throw fnErr;
        const ending = result?.ending;

        // Загружаем run
        const { data: run } = await supabase
          .from("runs")
          .select("scenario_id, state_json")
          .eq("id", runId)
          .single();

        // Загружаем room
        const { data: room } = await supabase
          .from("rooms")
          .select("id")
          .eq("run_id", runId)
          .maybeSingle();

        // Загружаем сценарий
        const { data: scenario } = await supabase
          .from("scenarios")
          .select("scenario_json")
          .eq("id", run.scenario_id)
          .single();

        const sJson     = scenario.scenario_json as any;
        const roles: any[]      = sJson?.roles ?? [];
        const goalChecks: any[] = sJson?.goal_checks ?? [];

        // Загружаем player_results
        const { data: results } = await supabase
          .from("player_results")
          .select("player_id, display_name, role_id, goal_achieved")
          .eq("run_id", runId);

        // Загружаем room_players для display_name fallback
        const { data: roomPlayers } = await supabase
          .from("room_players")
          .select("user_id, display_name, role_id")
          .eq("room_id", room?.id ?? "");

        const players: PlayerReveal[] = (results ?? []).map((r) => {
          const roleData = roles.find((ro: any) => ro.id === r.role_id);
          const check    = goalChecks.find((g: any) => g.role_id === r.role_id);
          const isSaboteur = r.role_id === "saboteur";
          return {
            id:       r.player_id,
            name:     r.display_name,
            role:     roleData?.name ?? r.role_id ?? "Участник",
            roleTone: isSaboteur ? "evil" : "good",
            goal:     r.goal_achieved
              ? (check?.success_text ?? "Цель достигнута")
              : (check?.fail_text    ?? "Цель не достигнута"),
            achieved: r.goal_achieved ?? false,
          };
        });

        // Предательства из secret_actions
        const { data: secretActions } = await supabase
          .from("secret_actions")
          .select("player_id, choice_id, payload")
          .eq("run_id", runId);

        const betrayals: Betrayal[] = (secretActions ?? [])
          .filter((a: any) => a.choice_id === "yes")
          .map((a: any) => {
            const rp = roomPlayers?.find((p) => p.user_id === a.player_id);
            return {
              by:   rp?.display_name ?? "Неизвестный",
              what: a.payload?.question ?? "Совершил тайное действие",
            };
          });

        setData({
          endingId:    ending?.id    ?? "defeat",
          endingTitle: ending?.title ?? "Игра завершена",
          endingText:  ending?.text  ?? ending?.narration ?? "",
          players,
          betrayals,
          state: (run.state_json as any) ?? {},
        });
      } catch (err: any) {
        setError(err?.message ?? "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [runId]);

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-portal" />
      </main>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-destructive font-mono text-sm">{error ?? "Нет данных"}</p>
      </main>
    </div>
  );

  const achievedCount = data.players.filter((p) => p.achieved).length;
  const isGoodEnding  = data.endingId === "victory_diplomatic";
  const isChaosEnding = data.endingId === "victory_chaos";
  const emoji    = isGoodEnding ? "🛸" : isChaosEnding ? "💥" : "⚖️";
  const gradient = isGoodEnding
    ? "from-portal/40 via-cosmic/30 to-pink/30"
    : isChaosEnding
    ? "from-destructive/40 via-destructive/20 to-background"
    : "from-muted/40 via-muted/20 to-background";

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10">
        <div className="w-full max-w-6xl mx-auto space-y-8">

          <div className="text-center">
            <span className="hud-chip">
              <Sparkles className="h-3 w-3" />
              ФИНАЛ · {data.endingId}
            </span>
          </div>

          {/* Hero ending */}
          <article className="glass-card scanlines rounded-md overflow-hidden">
            <div className={`relative aspect-[21/9] bg-gradient-to-br ${gradient}`}>
              <div className="absolute inset-0 portal-orb opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[140px] md:text-[200px] drop-shadow-[0_8px_30px_hsl(var(--portal)/0.6)] select-none">
                  {emoji}
                </span>
              </div>
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-acid/50 bg-background/80 backdrop-blur px-3 py-1 text-xs font-mono uppercase tracking-[0.2em] text-acid">
                  <Trophy className="h-3.5 w-3.5" /> Финал
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="p-8 md:p-12 text-center">
              <h1 className="font-display font-bold text-4xl md:text-6xl text-balance">
                <span className="text-portal neon-text">{data.endingTitle}</span>
              </h1>
              {data.endingText && (
                <p className="text-muted-foreground mt-5 text-base md:text-xl text-pretty max-w-3xl mx-auto leading-relaxed">
                  {data.endingText}
                </p>
              )}
              {Object.entries(data.state).filter(([k, v]) => k !== "ending_id" && typeof v === "number").length > 0 && (
                <div className="mt-6 flex gap-4 justify-center flex-wrap">
                  {Object.entries(data.state)
                    .filter(([k, v]) => k !== "ending_id" && typeof v === "number")
                    .map(([key, val]) => (
                      <div key={key} className="glass-card rounded-xl px-4 py-2 border border-portal/20">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{key}</div>
                        <div className="text-xl font-display font-bold text-portal">{val as number}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </article>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Роли */}
            <div className="glass-card rounded-md p-6 md:p-8 lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl md:text-2xl inline-flex items-center gap-2">
                  <Crown className="h-5 w-5 text-portal" />
                  Раскрытие ролей и целей
                </h2>
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
                  {achievedCount}/{data.players.length} достигли цели
                </span>
              </div>

              {data.players.length === 0 ? (
                <p className="text-muted-foreground text-sm">Данные игроков не найдены</p>
              ) : (
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left font-mono uppercase tracking-[0.16em] text-[10px] text-muted-foreground">
                        <th className="px-3 py-2 font-normal">Игрок</th>
                        <th className="px-3 py-2 font-normal">Роль</th>
                        <th className="px-3 py-2 font-normal">Итог цели</th>
                        <th className="px-3 py-2 font-normal text-right">Результат</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.players.map((p) => (
                        <tr key={p.id} className="border-t border-border/60 align-middle">
                          <td className="px-3 py-3 font-display font-bold">{p.name}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono uppercase tracking-wider ${roleToneClass[p.roleTone]}`}>
                              {p.role}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground text-xs">
                            <span className="inline-flex items-center gap-1.5">
                              <Target className="h-3.5 w-3.5 text-portal/70 flex-none" />
                              {p.goal}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            {p.achieved ? (
                              <span className="inline-flex items-center gap-1 text-acid font-semibold">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Успех</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-destructive font-semibold">
                                <XCircle className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-wider">Провал</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Предательства */}
            <div className="glass-card rounded-md p-6 md:p-8">
              <h2 className="font-display font-bold text-xl inline-flex items-center gap-2 mb-5">
                <Skull className="h-5 w-5 text-destructive" />
                Тайные действия
              </h2>
              {data.betrayals.length === 0 ? (
                <p className="text-muted-foreground text-sm">В этой партии все были честны. Подозрительно.</p>
              ) : (
                <ul className="space-y-3">
                  {data.betrayals.map((b, i) => (
                    <li key={i} className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
                      <div className="text-sm font-display font-bold text-destructive">{b.by}</div>
                      <div className="text-xs text-muted-foreground mt-1">{b.what}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/catalog">
              <Button size="lg" className="bg-portal hover:bg-portal/90 text-primary-foreground font-display font-bold gap-2">
                <RotateCcw className="h-4 w-4" /> Сыграть ещё
              </Button>
            </Link>
            <Link to="/catalog">
              <Button size="lg" variant="outline" className="border-acid/50 text-acid hover:bg-acid/10 font-display font-bold gap-2">
                <ShoppingCart className="h-4 w-4" /> Купить следующий сценарий
              </Button>
            </Link>
          </section>

          {/* TG subscribe banner */}
          <section className="mt-8 glass-card rounded-xl p-8 text-center border border-portal/30 relative overflow-hidden">
            <div className="absolute inset-0 portal-orb opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-mono uppercase tracking-widest text-portal/70 mb-2">Не пропусти новые сценарии</p>
              <h2 className="text-3xl font-display font-bold mb-3">Подпишись на Telegram</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Новые сценарии, обновления и анонсы — первыми в канале.</p>
              
                href="https://t.me/portal_quest"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-portal hover:bg-portal/90 text-primary-foreground px-8 py-3 rounded-lg font-display text-lg shadow-[var(--shadow-portal)] transition-all hover:scale-105"
              >
                <Send className="h-5 w-5" />
                @portal_quest
              </a>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Final;
