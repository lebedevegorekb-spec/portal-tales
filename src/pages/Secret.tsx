import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ShieldAlert, Check, Skull, Flame, Lock, Ghost } from "lucide-react";

type SecretRole = {
  id: string;
  role: string;
  goal: string;
  hint: string;
  tone: "destructive" | "acid" | "portal";
  Icon: React.ComponentType<{ className?: string }>;
};

const ROLES: Record<string, SecretRole> = {
  saboteur: {
    id: "saboteur",
    role: "Саботажник",
    goal: "Оставить портал открытым",
    hint: "Голосуй так, чтобы хаос рос. Но не попадись.",
    tone: "destructive",
    Icon: Skull,
  },
  pyromaniac: {
    id: "pyromaniac",
    role: "Пироман",
    goal: "Сжечь лабораторию дотла",
    hint: "Выбирай самые рискованные сцены. Огонь — твой друг.",
    tone: "destructive",
    Icon: Flame,
  },
  guardian: {
    id: "guardian",
    role: "Хранитель",
    goal: "Закрыть портал и спасти всех",
    hint: "Веди группу к стабильности. Не выдавай себя.",
    tone: "acid",
    Icon: Lock,
  },
  spy: {
    id: "spy",
    role: "Шпион",
    goal: "Узнать роль каждого игрока",
    hint: "Слушай. Задавай вопросы. Делай выводы.",
    tone: "portal",
    Icon: Ghost,
  },
};

const TONE: Record<SecretRole["tone"], { text: string; bg: string; border: string; ring: string; glow: string }> = {
  destructive: {
    text: "text-destructive",
    bg: "bg-destructive/15",
    border: "border-destructive/40",
    ring: "ring-destructive/30",
    glow: "shadow-[0_0_60px_-15px_hsl(var(--destructive)/0.6)]",
  },
  acid: {
    text: "text-acid",
    bg: "bg-acid/15",
    border: "border-acid/40",
    ring: "ring-acid/30",
    glow: "shadow-[0_0_60px_-15px_hsl(var(--acid)/0.6)]",
  },
  portal: {
    text: "text-portal",
    bg: "bg-portal/15",
    border: "border-portal/40",
    ring: "ring-portal/30",
    glow: "shadow-[var(--shadow-portal)]",
  },
};

const Secret = () => {
  const { roleId } = useParams<{ roleId?: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const role = useMemo<SecretRole>(() => {
    return ROLES[roleId ?? "saboteur"] ?? ROLES.saboteur;
  }, [roleId]);

  const tone = TONE[role.tone];

  useEffect(() => {
    setRevealed(false);
    setAcknowledged(false);
  }, [role.id]);

  const ready = () => {
    const roomId = params.get("room");
    if (roomId) navigate(`/lobby/${roomId}`);
    else navigate("/join");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md flex flex-col">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-2">
          <Lock className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
            Только для твоих глаз
          </span>
        </div>
        <h1 className="font-display font-bold text-2xl text-balance mb-5">
          Твоя тайная роль
        </h1>

        {/* Reveal area */}
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="glass-card rounded-3xl p-8 flex flex-col items-center text-center gap-4 border-dashed border-2 border-border hover:border-portal/40 transition-colors group"
          >
            <div className="size-24 rounded-full bg-muted/40 border border-border flex items-center justify-center group-hover:scale-105 transition-transform">
              <EyeOff className="size-10 text-muted-foreground" />
            </div>
            <div>
              <div className="font-display font-bold text-xl">Карта закрыта</div>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-[260px]">
                Убедись, что никто не смотрит в экран. Затем нажми, чтобы открыть.
              </p>
            </div>
            <span className="mt-2 inline-flex items-center gap-2 text-portal font-mono text-[11px] uppercase tracking-[0.25em]">
              <Eye className="size-4" /> Открыть
            </span>
          </button>
        ) : (
          <div
            className={`glass-card rounded-3xl p-6 space-y-5 border ${tone.border} ${tone.glow} animate-in fade-in zoom-in-95 duration-500`}
          >
            {/* Icon */}
            <div className="flex justify-center pt-2">
              <div className={`relative size-28 rounded-full ${tone.bg} ${tone.border} border-2 ring-4 ${tone.ring} flex items-center justify-center`}>
                <role.Icon className={`size-12 ${tone.text}`} />
                <div className="portal-orb absolute -inset-4 -z-10 opacity-70" />
              </div>
            </div>

            {/* Role */}
            <div className="text-center">
              <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                Тайная роль
              </div>
              <div className={`mt-1 font-display font-bold text-3xl ${tone.text}`}>
                {role.role}
              </div>
            </div>

            {/* Goal */}
            <div className={`rounded-2xl border ${tone.border} ${tone.bg} p-4 text-center`}>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                Твоя цель
              </div>
              <div className="mt-1 font-display font-semibold text-xl text-balance">
                {role.goal}
              </div>
            </div>

            {/* Hint */}
            <p className="text-sm text-muted-foreground text-pretty text-center italic">
              «{role.hint}»
            </p>

            {/* Warning */}
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 flex gap-3">
              <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold text-destructive">Никому не показывай!</div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  Если роль раскроют — миссия провалена.
                </div>
              </div>
            </div>

            {/* Acknowledge checkbox */}
            <button
              type="button"
              onClick={() => setAcknowledged((v) => !v)}
              className="w-full flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3.5 text-left hover:border-portal/40 transition-colors"
            >
              <div
                className={`size-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  acknowledged ? "bg-portal border-portal" : "border-border"
                }`}
              >
                {acknowledged && <Check className="size-3.5 text-portal-foreground" />}
              </div>
              <span className="text-sm">Запомнил роль и цель</span>
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-6">
          <Button
            onClick={ready}
            disabled={!revealed || !acknowledged}
            size="lg"
            className="w-full bg-portal hover:bg-portal/90 text-portal-foreground shadow-[var(--shadow-portal)] h-14 text-base font-display font-semibold disabled:opacity-40"
          >
            <Check className="size-5" /> Готов
          </Button>
          <p className="text-[11px] text-muted-foreground text-center mt-3 px-4">
            После нажатия экран закроется. Роль больше не покажется.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Secret;
