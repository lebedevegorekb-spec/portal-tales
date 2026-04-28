import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Eye, Skull } from "lucide-react";

type Character = {
  id: string;
  name: string;
  role: string;
  tone: "portal" | "acid" | "destructive" | "muted";
  description: string;
  goal: string;
  traits: string[];
  Icon: React.ComponentType<{ className?: string }>;
};

const CHARACTERS: Record<string, Character> = {
  morty: {
    id: "morty",
    name: "Морти Смит",
    role: "Помощник учёного",
    tone: "acid",
    description:
      "Нервный подросток, втянутый в межгалактические авантюры. Знает о портале больше, чем показывает. Сомневается в каждом решении, но в критический момент способен на безумную смелость.",
    goal: "Выжить и спасти семью",
    traits: ["Тревожный", "Изобретательный", "Лояльный"],
    Icon: Sparkles,
  },
  rick: {
    id: "rick",
    name: "Рик Санчез",
    role: "Гениальный учёный",
    tone: "portal",
    description:
      "Циничный изобретатель портальной пушки. Считает остальных идиотами, но без них не справится. Скрывает истинные мотивы за алкоголем и сарказмом.",
    goal: "Запустить портал любой ценой",
    traits: ["Гений", "Манипулятор", "Алкоголик"],
    Icon: Shield,
  },
  summer: {
    id: "summer",
    name: "Саммер Смит",
    role: "Наблюдатель",
    tone: "muted",
    description:
      "Старшая сестра Морти. В этой истории — тихий аналитик, который видит то, что упускают остальные. Её слово может изменить всё.",
    goal: "Найти предателя в группе",
    traits: ["Внимательная", "Скептик", "Хладнокровная"],
    Icon: Eye,
  },
  traitor: {
    id: "traitor",
    name: "???",
    role: "Скрытая роль",
    tone: "destructive",
    description:
      "Кто-то в группе работает против остальных. Его цель — сорвать запуск портала. Никто не должен узнать правду до финала.",
    goal: "Саботировать миссию",
    traits: ["Лжец", "Хитрый", "Опасный"],
    Icon: Skull,
  },
};

const TONE: Record<Character["tone"], { ring: string; bg: string; text: string; border: string; shadow: string }> = {
  portal: {
    ring: "ring-portal/40",
    bg: "bg-portal/15",
    text: "text-portal",
    border: "border-portal/40",
    shadow: "shadow-[var(--shadow-portal)]",
  },
  acid: {
    ring: "ring-acid/40",
    bg: "bg-acid/15",
    text: "text-acid",
    border: "border-acid/40",
    shadow: "shadow-[0_0_40px_-10px_hsl(var(--acid)/0.5)]",
  },
  destructive: {
    ring: "ring-destructive/40",
    bg: "bg-destructive/15",
    text: "text-destructive",
    border: "border-destructive/40",
    shadow: "shadow-[0_0_40px_-10px_hsl(var(--destructive)/0.5)]",
  },
  muted: {
    ring: "ring-muted-foreground/30",
    bg: "bg-muted/40",
    text: "text-foreground",
    border: "border-border",
    shadow: "shadow-lg",
  },
};

const Character = () => {
  const { characterId } = useParams<{ characterId?: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);

  const character = useMemo<Character>(() => {
    const id = characterId ?? "morty";
    return CHARACTERS[id] ?? CHARACTERS.morty;
  }, [characterId]);

  const tone = TONE[character.tone];

  // Reveal animation
  useEffect(() => {
    setRevealed(false);
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
            <div className={`relative size-32 rounded-full ${tone.bg} ${tone.border} border-2 ring-4 ${tone.ring} flex items-center justify-center`}>
              <character.Icon className={`size-14 ${tone.text}`} />
              <div className="portal-orb absolute -inset-4 -z-10 opacity-60" />
            </div>
            <div className={`mt-4 text-[11px] font-mono uppercase tracking-[0.25em] ${tone.text}`}>
              {character.role}
            </div>
            <h2 className="mt-1 font-display font-bold text-3xl text-balance">
              {character.name}
            </h2>
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

          {/* Goal */}
          <div className={`rounded-2xl border ${tone.border} ${tone.bg} p-4`}>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              Твоя цель
            </div>
            <div className={`mt-1 font-display font-semibold text-base ${tone.text}`}>
              {character.goal}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6">
          <Button
            onClick={next}
            size="lg"
            className="w-full bg-portal hover:bg-portal/90 text-portal-foreground shadow-[var(--shadow-portal)] h-14 text-base font-display font-semibold"
          >
            Далее <ArrowRight className="size-5" />
          </Button>
          <p className="text-[11px] text-muted-foreground text-center mt-3 px-4">
            Держи телефон от чужих глаз. Роль видишь только ты.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Character;
