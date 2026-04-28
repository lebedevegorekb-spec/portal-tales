import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Eye,
  Skull,
  EyeOff,
  ShieldAlert,
  Check,
  Lock,
} from "lucide-react";

type SecretRole = {
  role: string;
  goal: string;
  hint: string;
  tone: "destructive" | "acid" | "portal";
};

type Character = {
  id: string;
  name: string;
  role: string;
  tone: "portal" | "acid" | "destructive" | "muted";
  description: string;
  publicGoal: string;
  traits: string[];
  Icon: React.ComponentType<{ className?: string }>;
  secret: SecretRole;
};

const CHARACTERS: Record<string, Character> = {
  morty: {
    id: "morty",
    name: "Морти Смит",
    role: "Помощник учёного",
    tone: "acid",
    description:
      "Нервный подросток, втянутый в межгалактические авантюры. Знает о портале больше, чем показывает. Сомневается в каждом решении, но в критический момент способен на безумную смелость.",
    publicGoal: "Выжить и спасти семью",
    traits: ["Тревожный", "Изобретательный", "Лояльный"],
    Icon: Sparkles,
    secret: {
      role: "Двойной агент",
      goal: "Передать координаты портала Совету",
      hint: "Соглашайся с большинством. В нужный момент — предай.",
      tone: "portal",
    },
  },
  rick: {
    id: "rick",
    name: "Рик Санчез",
    role: "Гениальный учёный",
    tone: "portal",
    description:
      "Циничный изобретатель портальной пушки. Считает остальных идиотами, но без них не справится. Скрывает истинные мотивы за алкоголем и сарказмом.",
    publicGoal: "Запустить портал любой ценой",
    traits: ["Гений", "Манипулятор", "Алкоголик"],
    Icon: Shield,
    secret: {
      role: "Саботажник",
      goal: "Оставить портал открытым навсегда",
      hint: "Голосуй за хаос. Объясняй это «наукой».",
      tone: "destructive",
    },
  },
  summer: {
    id: "summer",
    name: "Саммер Смит",
    role: "Наблюдатель",
    tone: "muted",
    description:
      "Старшая сестра Морти. В этой истории — тихий аналитик, который видит то, что упускают остальные. Её слово может изменить всё.",
    publicGoal: "Найти предателя в группе",
    traits: ["Внимательная", "Скептик", "Хладнокровная"],
    Icon: Eye,
    secret: {
      role: "Хранитель",
      goal: "Закрыть портал и спасти всех",
      hint: "Веди группу к стабильности. Не выдавай себя.",
      tone: "acid",
    },
  },
  traitor: {
    id: "traitor",
    name: "???",
    role: "Скрытая роль",
    tone: "destructive",
    description:
      "Кто-то в группе работает против остальных. Его цель — сорвать запуск портала. Никто не должен узнать правду до финала.",
    publicGoal: "Саботировать миссию",
    traits: ["Лжец", "Хитрый", "Опасный"],
    Icon: Skull,
    secret: {
      role: "Эмиссар Совета",
      goal: "Уничтожить портальную пушку",
      hint: "Имитируй панику. Сваливай вину на других.",
      tone: "destructive",
    },
  },
};

const TONE = {
  portal: {
    text: "text-portal",
    bg: "bg-portal/15",
    border: "border-portal/40",
    ring: "ring-portal/30",
    shadow: "shadow-[var(--shadow-portal)]",
  },
  acid: {
    text: "text-acid",
    bg: "bg-acid/15",
    border: "border-acid/40",
    ring: "ring-acid/30",
    shadow: "shadow-[0_0_40px_-10px_hsl(var(--acid)/0.5)]",
  },
  destructive: {
    text: "text-destructive",
    bg: "bg-destructive/15",
    border: "border-destructive/40",
    ring: "ring-destructive/30",
    shadow: "shadow-[0_0_40px_-10px_hsl(var(--destructive)/0.5)]",
  },
  muted: {
    text: "text-foreground",
    bg: "bg-muted/40",
    border: "border-border",
    ring: "ring-muted-foreground/20",
    shadow: "shadow-lg",
  },
} as const;

const Character = () => {
  const { characterId } = useParams<{ characterId?: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const [secretShown, setSecretShown] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const character = useMemo<Character>(() => {
    const id = characterId ?? "morty";
    return CHARACTERS[id] ?? CHARACTERS.morty;
  }, [characterId]);

  const tone = TONE[character.tone];
  const secretTone = TONE[character.secret.tone];

  useEffect(() => {
    setRevealed(false);
    setSecretShown(false);
    setAcknowledged(false);
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, [character.id]);

  const next = () => {
    const roomId = params.get("room");
    if (roomId) navigate(`/lobby/${roomId}`);
    else navigate("/join");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md flex flex-col">
        {/* Eyebrow */}
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Твоя роль
        </div>
        <h1 className="font-display font-bold text-2xl text-balance mb-5">
          Запомни. Никому не рассказывай.
        </h1>

        {/* Character card */}
        <div
          className={`glass-card rounded-3xl p-6 space-y-5 border ${tone.border} ${tone.shadow} transition-all duration-500 ${
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {/* Avatar */}
          <div className="flex flex-col items-center text-center pt-2">
            <div
              className={`relative size-32 rounded-full ${tone.bg} ${tone.border} border-2 ring-4 ${tone.ring} flex items-center justify-center`}
            >
              <character.Icon className={`size-14 ${tone.text}`} />
              <div className="portal-orb absolute -inset-4 -z-10 opacity-60" />
            </div>
            <div className={`mt-4 text-[11px] font-mono uppercase tracking-[0.25em] ${tone.text}`}>
              {character.role}
            </div>
            <h2 className="mt-1 font-display font-bold text-3xl text-balance">{character.name}</h2>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground text-pretty leading-relaxed text-center">
            {character.description}
          </p>

          {/* Traits */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {character.traits.map((t) => (
              <span
                key={t}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-border bg-background/40"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Public goal */}
          <div className={`rounded-2xl border ${tone.border} ${tone.bg} p-4`}>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              Известная всем цель
            </div>
            <div className={`mt-1 font-display font-semibold text-base ${tone.text}`}>
              {character.publicGoal}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              <Lock className="size-3" /> Только для тебя
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* SECRET REVEAL */}
          {!secretShown ? (
            <button
              type="button"
              onClick={() => setSecretShown(true)}
              className="w-full rounded-2xl border-2 border-dashed border-border hover:border-portal/40 bg-background/30 p-5 flex flex-col items-center text-center gap-3 transition-colors group"
            >
              <div className="size-14 rounded-full bg-muted/40 border border-border flex items-center justify-center group-hover:scale-105 transition-transform">
                <EyeOff className="size-6 text-muted-foreground" />
              </div>
              <div>
                <div className="font-display font-bold text-base">Тайная цель закрыта</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Убедись, что никто не смотрит. Затем открой.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-portal font-mono text-[10px] uppercase tracking-[0.25em]">
                <Eye className="size-3.5" /> Открыть
              </span>
            </button>
          ) : (
            <div
              className={`rounded-2xl border-2 ${secretTone.border} ${secretTone.bg} ${secretTone.shadow} p-5 space-y-4 animate-in fade-in zoom-in-95 duration-500`}
            >
              <div className="text-center">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                  Тайная роль
                </div>
                <div className={`mt-1 font-display font-bold text-2xl ${secretTone.text}`}>
                  {character.secret.role}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-background/40 p-3.5 text-center">
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                  Тайная цель
                </div>
                <div className="mt-1 font-display font-semibold text-base text-balance">
                  {character.secret.goal}
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic text-center text-pretty">
                «{character.secret.hint}»
              </p>

              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 flex gap-2.5">
                <ShieldAlert className="size-4 text-destructive shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-destructive">Никому не показывай!</div>
                  <div className="text-muted-foreground mt-0.5">
                    Если роль раскроют — миссия провалена.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAcknowledged((v) => !v)}
                className="w-full flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 text-left hover:border-portal/40 transition-colors"
              >
                <div
                  className={`size-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    acknowledged ? "bg-portal border-portal" : "border-border"
                  }`}
                >
                  {acknowledged && <Check className="size-3.5 text-portal-foreground" />}
                </div>
                <span className="text-sm">Запомнил тайную цель</span>
              </button>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-6">
          <Button
            onClick={next}
            disabled={!secretShown || !acknowledged}
            size="lg"
            className="w-full bg-portal hover:bg-portal/90 text-portal-foreground shadow-[var(--shadow-portal)] h-14 text-base font-display font-semibold disabled:opacity-40"
          >
            Готов <ArrowRight className="size-5" />
          </Button>
          <p className="text-[11px] text-muted-foreground text-center mt-3 px-4">
            После нажатия экран закроется. Тайная роль больше не покажется.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Character;
