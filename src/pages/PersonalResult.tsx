import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Share2,
  Check,
  X,
  Trophy,
  Skull,
  Vote,
  Eye,
  Flame,
  Sparkles,
  RotateCw,
  Copy,
} from "lucide-react";

type Outcome = "win" | "lose";

type PersonalResult = {
  role: string;
  goal: string;
  outcome: Outcome;
  Icon: React.ComponentType<{ className?: string }>;
  tone: "destructive" | "acid" | "portal";
  stats: {
    votes: number;
    secretActions: number;
    betrayals: number;
    survivedRounds: number;
  };
  summary: string;
};

const RESULTS: Record<string, PersonalResult> = {
  saboteur_win: {
    role: "Саботажник",
    goal: "Оставить портал открытым",
    outcome: "win",
    Icon: Skull,
    tone: "destructive",
    stats: { votes: 7, secretActions: 3, betrayals: 2, survivedRounds: 5 },
    summary: "Ты обманул всех. Портал работает. Совет в ярости.",
  },
  saboteur_lose: {
    role: "Саботажник",
    goal: "Оставить портал открытым",
    outcome: "lose",
    Icon: Skull,
    tone: "destructive",
    stats: { votes: 6, secretActions: 2, betrayals: 1, survivedRounds: 3 },
    summary: "Тебя раскрыли на четвёртой сцене. Морти оказался не таким уж простаком.",
  },
  guardian_win: {
    role: "Хранитель",
    goal: "Закрыть портал и спасти всех",
    outcome: "win",
    Icon: Sparkles,
    tone: "acid",
    stats: { votes: 7, secretActions: 4, betrayals: 0, survivedRounds: 5 },
    summary: "Ты удержал группу вместе. Портал закрыт. Хаос остановлен.",
  },
  pyromaniac_lose: {
    role: "Пироман",
    goal: "Сжечь лабораторию дотла",
    outcome: "lose",
    Icon: Flame,
    tone: "destructive",
    stats: { votes: 5, secretActions: 3, betrayals: 1, survivedRounds: 4 },
    summary: "Спички промокли. Лаборатория стоит. Рик уже точит вилы.",
  },
};

const TONE = {
  acid: {
    text: "text-acid",
    bg: "bg-acid/15",
    border: "border-acid/40",
    ring: "ring-acid/30",
    shadow: "shadow-[0_0_60px_-15px_hsl(var(--acid)/0.6)]",
  },
  destructive: {
    text: "text-destructive",
    bg: "bg-destructive/15",
    border: "border-destructive/40",
    ring: "ring-destructive/30",
    shadow: "shadow-[0_0_60px_-15px_hsl(var(--destructive)/0.6)]",
  },
  portal: {
    text: "text-portal",
    bg: "bg-portal/15",
    border: "border-portal/40",
    ring: "ring-portal/30",
    shadow: "shadow-[var(--shadow-portal)]",
  },
} as const;

const PersonalResult = () => {
  const { resultId } = useParams<{ resultId?: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);

  const result = useMemo<PersonalResult>(() => {
    return RESULTS[resultId ?? "saboteur_win"] ?? RESULTS.saboteur_win;
  }, [resultId]);

  const tone = TONE[result.tone];
  const won = result.outcome === "win";

  useEffect(() => {
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, [result.role, result.outcome]);

  const share = async () => {
    const text = `Я был ${result.role} в Портал-Квесте. ${
      won ? "Цель выполнена ✅" : "Цель провалена ❌"
    }. ${result.summary}`;
    const url = window.location.origin;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Портал-Квест", text, url });
        return;
      } catch {
        // user cancelled — ignore
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} — ${url}`);
      toast({ title: "Скопировано", description: "Результат — в буфере обмена." });
    } catch {
      toast({ title: "Не удалось скопировать", variant: "destructive" });
    }
  };

  const playAgain = () => {
    const runId = params.get("run");
    if (runId) navigate(`/offer/${runId}`);
    else navigate("/catalog");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md flex flex-col">
        {/* Eyebrow */}
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Твой итог
        </div>
        <h1 className="font-display font-bold text-2xl text-balance mb-5">
          {won ? "Ты справился." : "Ты провалился."}
        </h1>

        {/* Result card */}
        <div
          className={`glass-card rounded-3xl p-6 space-y-5 border ${tone.border} ${tone.shadow} transition-all duration-500 ${
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {/* Avatar + role */}
          <div className="flex flex-col items-center text-center pt-2">
            <div
              className={`relative size-28 rounded-full ${tone.bg} ${tone.border} border-2 ring-4 ${tone.ring} flex items-center justify-center`}
            >
              <result.Icon className={`size-12 ${tone.text}`} />
              <div className="portal-orb absolute -inset-4 -z-10 opacity-70" />
            </div>
            <div className={`mt-4 text-[11px] font-mono uppercase tracking-[0.3em] ${tone.text}`}>
              Ты был
            </div>
            <div className={`mt-1 font-display font-bold text-3xl ${tone.text}`}>
              {result.role}
            </div>
          </div>

          {/* Goal */}
          <div className={`rounded-2xl border ${tone.border} ${tone.bg} p-4 text-center`}>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              Твоя цель
            </div>
            <div className="mt-1 font-display font-semibold text-base text-balance">
              {result.goal}
            </div>
          </div>

          {/* Outcome badge */}
          <div
            className={`rounded-2xl p-4 flex items-center gap-3 border-2 ${
              won
                ? "border-acid/50 bg-acid/10"
                : "border-destructive/50 bg-destructive/10"
            } animate-in fade-in zoom-in-95 duration-500`}
          >
            <div
              className={`size-12 rounded-full flex items-center justify-center shrink-0 ${
                won
                  ? "bg-acid/20 border-2 border-acid/40"
                  : "bg-destructive/20 border-2 border-destructive/40"
              }`}
            >
              {won ? (
                <Check className="size-6 text-acid" />
              ) : (
                <X className="size-6 text-destructive" />
              )}
            </div>
            <div className="flex-1">
              <div
                className={`font-display font-bold text-lg ${
                  won ? "text-acid" : "text-destructive"
                }`}
              >
                {won ? "Цель выполнена" : "Цель провалена"}
              </div>
              <div className="text-xs text-muted-foreground text-pretty">
                {result.summary}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2.5">
              Твоя статистика
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <StatCell Icon={Vote} label="Голосований" value={result.stats.votes} />
              <StatCell
                Icon={Eye}
                label="Тайных действий"
                value={result.stats.secretActions}
              />
              <StatCell
                Icon={Skull}
                label="Предательств"
                value={result.stats.betrayals}
                tone="destructive"
              />
              <StatCell
                Icon={Trophy}
                label="Раундов выжил"
                value={result.stats.survivedRounds}
                tone="acid"
              />
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-6 space-y-2.5">
          <Button
            onClick={share}
            size="lg"
            className="w-full bg-portal hover:bg-portal/90 text-portal-foreground shadow-[var(--shadow-portal)] h-14 text-base font-display font-semibold"
          >
            <Share2 className="size-5" /> Поделиться итогом
          </Button>
          <Button
            onClick={playAgain}
            variant="outline"
            size="lg"
            className="w-full h-12 font-display"
          >
            <RotateCw className="size-4" /> Сыграть ещё
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-4 px-4">
          На ТВ скоро покажут общий финал и раскрытие всех ролей.
        </p>
      </main>
    </div>
  );
};

const StatCell = ({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone?: "acid" | "destructive";
}) => {
  const accent =
    tone === "acid"
      ? "text-acid"
      : tone === "destructive"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-3.5">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className={`mt-1 font-display font-bold text-2xl tabular-nums ${accent}`}>
        {value}
      </div>
    </div>
  );
};

export default PersonalResult;
