import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Clock, X } from "lucide-react";

type Player = {
  id: string;
  name: string;
  ready: boolean;
};

const MOCK_PLAYERS: Player[] = [
  { id: "1", name: "Морти", ready: true },
  { id: "2", name: "Рик", ready: true },
  { id: "3", name: "Саммер", ready: true },
  { id: "4", name: "Бет", ready: true },
  { id: "5", name: "Джерри", ready: true },
  { id: "6", name: "Бёрдперсон", ready: false },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Waiting = () => {
  const { runId } = useParams<{ runId?: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [elapsed, setElapsed] = useState(0);

  // Live counter
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate the last player arriving (only on demo route, no runId)
  useEffect(() => {
    if (runId) return;
    const t = setTimeout(() => {
      setPlayers((ps) => ps.map((p) => ({ ...p, ready: true })));
    }, 6000);
    return () => clearTimeout(t);
  }, [runId]);

  const ready = useMemo(() => players.filter((p) => p.ready).length, [players]);
  const total = players.length;
  const allReady = ready === total;
  const progress = (ready / total) * 100;

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const next = () => {
    const roomId = params.get("room");
    if (roomId) navigate(`/lobby/${roomId}`);
    else navigate("/scene");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md flex flex-col">
        {/* Eyebrow */}
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Раунд закрыт
        </div>
        <h1 className="font-display font-bold text-2xl text-balance mb-5">
          {allReady ? "Все готовы!" : "Ждём остальных…"}
        </h1>

        {/* Big status card */}
        <div
          className={`glass-card rounded-3xl p-7 flex flex-col items-center text-center gap-5 border ${
            allReady ? "border-acid/40 shadow-[0_0_40px_-10px_hsl(var(--acid)/0.5)]" : "border-portal/40 shadow-[var(--shadow-portal)]"
          } transition-colors`}
        >
          {/* Loader / Check */}
          <div className="relative size-28 flex items-center justify-center">
            <div className="portal-orb absolute inset-0 -z-10 opacity-70" />
            {allReady ? (
              <div className="size-20 rounded-full bg-acid/15 border-2 border-acid/40 ring-4 ring-acid/20 flex items-center justify-center animate-in zoom-in-95 duration-300">
                <Check className="size-10 text-acid" />
              </div>
            ) : (
              <div className="size-20 rounded-full bg-portal/15 border-2 border-portal/40 ring-4 ring-portal/20 flex items-center justify-center">
                <Loader2 className="size-10 text-portal animate-spin" />
              </div>
            )}
          </div>

          {/* Counter */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
              Готовы
            </div>
            <div className="mt-1 font-display font-bold text-5xl tabular-nums">
              <span className={allReady ? "text-acid" : "text-portal"}>{ready}</span>
              <span className="text-muted-foreground/50"> / {total}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full">
            <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  allReady ? "bg-acid" : "bg-portal"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono tabular-nums">
            <Clock className="size-3.5" />
            {mm}:{ss}
          </div>
        </div>

        {/* Player list */}
        <div className="mt-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2.5 px-1">
            Игроки
          </div>
          <div className="glass-card rounded-2xl divide-y divide-border/60 overflow-hidden">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3.5 transition-colors"
              >
                <div
                  className={`size-10 rounded-full border flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                    p.ready
                      ? "bg-acid/15 border-acid/40 text-acid"
                      : "bg-muted/40 border-border text-muted-foreground"
                  }`}
                >
                  {initials(p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {p.ready ? "Выбор сделан" : "Ещё думает…"}
                  </div>
                </div>
                {p.ready ? (
                  <div className="size-6 rounded-full bg-acid/15 border border-acid/40 flex items-center justify-center">
                    <Check className="size-3.5 text-acid" />
                  </div>
                ) : (
                  <Loader2 className="size-4 text-muted-foreground animate-spin" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hint / CTA */}
        {allReady ? (
          <Button
            onClick={next}
            size="lg"
            className="mt-6 w-full bg-portal hover:bg-portal/90 text-portal-foreground shadow-[var(--shadow-portal)] h-14 text-base font-display font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            К следующей сцене
          </Button>
        ) : (
          <p className="text-[11px] text-muted-foreground text-center mt-6 px-4">
            Не закрывай экран. Как только все проголосуют — игра продолжится автоматически.
          </p>
        )}
      </main>
    </div>
  );
};

export default Waiting;
