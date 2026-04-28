import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { EyeOff, Lock, Check, Loader2, ShieldAlert, ArrowRight, Skull, Flame, Ghost, Wrench } from "lucide-react";

type Option = {
  id: string;
  label: string;
  hint?: string;
  tone: "destructive" | "acid" | "portal" | "muted";
};

type SecretAction = {
  role: string;
  Icon: React.ComponentType<{ className?: string }>;
  question: string;
  context: string;
  options: Option[];
};

const ACTIONS: Record<string, SecretAction> = {
  saboteur: {
    role: "Саботажник",
    Icon: Skull,
    question: "Кого подставить этой ночью?",
    context: "Ты можешь подбросить улику одному из игроков. Утром группа найдёт её — и заподозрит его.",
    options: [
      { id: "morty", label: "Морти Смит", hint: "Самый нервный — поверят легко", tone: "acid" },
      { id: "summer", label: "Саммер Смит", hint: "Холодная — будет защищаться", tone: "muted" },
      { id: "rick", label: "Рик Санчез", hint: "Рискованно. Но эффектно", tone: "portal" },
      { id: "skip", label: "Пропустить ход", hint: "Не оставлять следов", tone: "destructive" },
    ],
  },
  spy: {
    role: "Шпион",
    Icon: Ghost,
    question: "Чью роль подсмотреть?",
    context: "Один раз за игру ты можешь узнать тайную роль другого игрока. Используй мудро.",
    options: [
      { id: "morty", label: "Морти Смит", tone: "acid" },
      { id: "summer", label: "Саммер Смит", tone: "muted" },
      { id: "rick", label: "Рик Санчез", tone: "portal" },
      { id: "skip", label: "Сохранить на потом", tone: "destructive" },
    ],
  },
  pyromaniac: {
    role: "Пироман",
    Icon: Flame,
    question: "Что поджечь?",
    context: "Огонь распространится быстрее, чем кто-то поймёт причину.",
    options: [
      { id: "lab", label: "Лабораторию Рика", hint: "+30 хаоса", tone: "destructive" },
      { id: "portal", label: "Портал", hint: "Высокий риск разоблачения", tone: "portal" },
      { id: "garage", label: "Гараж", hint: "Слабый эффект, низкий риск", tone: "acid" },
      { id: "skip", label: "Подождать", hint: "Сохранить спички", tone: "muted" },
    ],
  },
  guardian: {
    role: "Хранитель",
    Icon: Wrench,
    question: "Что укрепить ночью?",
    context: "Ты можешь усилить одну часть портала. Это снизит хаос на 15.",
    options: [
      { id: "core", label: "Ядро портала", hint: "+стабильность", tone: "acid" },
      { id: "shields", label: "Щиты лаборатории", hint: "защита от саботажа", tone: "portal" },
      { id: "logs", label: "Журнал событий", hint: "облегчит расследование", tone: "muted" },
      { id: "skip", label: "Не действовать", hint: "Ждать сцены", tone: "destructive" },
    ],
  },
};

const TONE = {
  portal: "border-portal/40 bg-portal/10 text-portal hover:bg-portal/20",
  acid: "border-acid/40 bg-acid/10 text-acid hover:bg-acid/20",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
  muted: "border-border bg-background/40 text-foreground hover:bg-muted/40",
} as const;

type Status = "idle" | "submitting" | "sent";

const SecretAction = () => {
  const { roleId } = useParams<{ roleId?: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const action = useMemo<SecretAction>(() => {
    return ACTIONS[roleId ?? "saboteur"] ?? ACTIONS.saboteur;
  }, [roleId]);

  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    setSelected(null);
    setStatus("idle");
  }, [action.role]);

  const submit = async () => {
    if (!selected || status !== "idle") return;
    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 900));
    setStatus("sent");
  };

  const next = () => {
    const roomId = params.get("room");
    if (roomId) navigate(`/lobby/${roomId}`);
    else navigate("/join");
  };

  const chosen = action.options.find((o) => o.id === selected);

  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md flex flex-col">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-2">
          <Lock className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
            Секретное действие · {action.role}
          </span>
        </div>

        {status !== "sent" ? (
          <>
            <h1 className="font-display font-bold text-2xl text-balance mb-2">
              {action.question}
            </h1>
            <p className="text-sm text-muted-foreground text-pretty mb-5">
              {action.context}
            </p>

            {/* Options */}
            <div className="space-y-2.5">
              {action.options.map((opt) => {
                const isSelected = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelected(opt.id)}
                    disabled={status === "submitting"}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${TONE[opt.tone]} ${
                      isSelected ? "ring-2 ring-offset-2 ring-offset-background ring-portal scale-[1.01]" : "opacity-90"
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-semibold text-base truncate">
                          {opt.label}
                        </div>
                        {opt.hint && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {opt.hint}
                          </div>
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

            {/* Warning */}
            <div className="mt-5 rounded-xl border border-border bg-background/40 p-3 flex gap-3">
              <EyeOff className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold">Никто не узнает</div>
                <div className="text-muted-foreground mt-0.5">
                  Действие отправляется анонимно. На ТВ появится только результат.
                </div>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={submit}
              disabled={!selected || status === "submitting"}
              size="lg"
              className="mt-5 w-full bg-portal hover:bg-portal/90 text-portal-foreground shadow-[var(--shadow-portal)] h-14 text-base font-display font-semibold disabled:opacity-40"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Отправляем…
                </>
              ) : (
                <>
                  Подтвердить выбор <ArrowRight className="size-5" />
                </>
              )}
            </Button>
          </>
        ) : (
          /* SENT STATE */
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
                  <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                    Твой выбор
                  </div>
                  <div className="mt-1 font-display font-semibold text-base">
                    {chosen.label}
                  </div>
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
              Вернуться в лобби <ArrowRight className="size-5" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SecretAction;
