import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { WifiOff, Loader2, RefreshCw, Check, AlertTriangle, Signal } from "lucide-react";

type Status = "reconnecting" | "online" | "failed";

const MAX_ATTEMPTS = 5;

const Reconnect = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Demo: ?fail=1 — всегда падает; ?ok=1 — мгновенно онлайн
  const forceFail = params.get("fail") === "1";
  const forceOk = params.get("ok") === "1";

  const [status, setStatus] = useState<Status>("reconnecting");
  const [attempt, setAttempt] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  const tryReconnect = (n: number) => {
    setStatus("reconnecting");
    setAttempt(n);
    const ms = 1500 + n * 400;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      // Simulate: 60% success per attempt; forceFail/forceOk override.
      const success = forceOk || (!forceFail && Math.random() < 0.6);
      if (success) {
        setStatus("online");
      } else if (n >= MAX_ATTEMPTS) {
        setStatus("failed");
      } else {
        tryReconnect(n + 1);
      }
    }, ms);
  };

  useEffect(() => {
    tryReconnect(1);
    const t = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const manualRefresh = () => {
    setElapsed(0);
    tryReconnect(1);
  };

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const tone = useMemo(() => {
    if (status === "online")
      return {
        border: "border-acid/40",
        glow: "shadow-[0_0_60px_-15px_hsl(var(--acid)/0.6)]",
        text: "text-acid",
        bg: "bg-acid/15",
      };
    if (status === "failed")
      return {
        border: "border-destructive/40",
        glow: "shadow-[0_0_60px_-15px_hsl(var(--destructive)/0.6)]",
        text: "text-destructive",
        bg: "bg-destructive/15",
      };
    return {
      border: "border-portal/40",
      glow: "shadow-[var(--shadow-portal)]",
      text: "text-portal",
      bg: "bg-portal/15",
    };
  }, [status]);

  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md flex flex-col">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-2">
          <WifiOff className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
            Сетевой сбой
          </span>
        </div>
        <h1 className="font-display font-bold text-2xl text-balance mb-5">
          {status === "online"
            ? "Снова в игре"
            : status === "failed"
              ? "Не получилось"
              : "Соединение потеряно"}
        </h1>

        {/* Status card */}
        <div
          className={`glass-card rounded-3xl p-7 flex flex-col items-center text-center gap-5 border ${tone.border} ${tone.glow} transition-all duration-500`}
        >
          {/* Big icon */}
          <div className="relative size-28 flex items-center justify-center">
            <div className="portal-orb absolute inset-0 -z-10 opacity-60" />
            {status === "reconnecting" && (
              <div
                className={`size-20 rounded-full ${tone.bg} border-2 ${tone.border} ring-4 ring-portal/20 flex items-center justify-center`}
              >
                <Loader2 className={`size-10 ${tone.text} animate-spin`} />
              </div>
            )}
            {status === "online" && (
              <div
                className={`size-20 rounded-full ${tone.bg} border-2 ${tone.border} ring-4 ring-acid/20 flex items-center justify-center animate-in zoom-in-95 duration-300`}
              >
                <Check className={`size-10 ${tone.text}`} />
              </div>
            )}
            {status === "failed" && (
              <div
                className={`size-20 rounded-full ${tone.bg} border-2 ${tone.border} ring-4 ring-destructive/20 flex items-center justify-center animate-in zoom-in-95 duration-300`}
              >
                <WifiOff className={`size-10 ${tone.text}`} />
              </div>
            )}
          </div>

          {/* Status text */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
              Статус
            </div>
            <div className={`mt-1 font-display font-bold text-2xl ${tone.text}`}>
              {status === "reconnecting" && "Переподключаемся…"}
              {status === "online" && "Соединение восстановлено"}
              {status === "failed" && "Сервер недоступен"}
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-pretty max-w-[280px] mx-auto">
              {status === "reconnecting" &&
                "Не закрывай экран. Мы сохраним твой прогресс и место в раунде."}
              {status === "online" &&
                "Возвращаемся в игру. Если экран не обновился — нажми «Продолжить»."}
              {status === "failed" &&
                "Проверь Wi-Fi или мобильную сеть. Затем нажми «Обновить»."}
            </p>
          </div>

          {/* Animated progress (during reconnecting) */}
          {status === "reconnecting" && (
            <div className="w-full">
              <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden relative">
                <div
                  className="absolute inset-y-0 w-1/3 bg-portal rounded-full animate-[slide_1.4s_ease-in-out_infinite]"
                  style={{
                    animation: "reconnect-slide 1.4s ease-in-out infinite",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[11px] font-mono text-muted-foreground tabular-nums">
                <span>
                  Попытка {attempt} / {MAX_ATTEMPTS}
                </span>
                <span>
                  {mm}:{ss}
                </span>
              </div>
            </div>
          )}

          {/* Network hint chips */}
          <div className="flex gap-1.5 flex-wrap justify-center">
            <Chip Icon={Signal} label="Wi-Fi" />
            <Chip Icon={Signal} label="Сотовая сеть" />
            <Chip Icon={AlertTriangle} label="VPN может мешать" tone="muted" />
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-6 space-y-2.5">
          {status !== "online" ? (
            <Button
              onClick={manualRefresh}
              disabled={status === "reconnecting"}
              size="lg"
              className="w-full bg-portal hover:bg-portal/90 text-portal-foreground shadow-[var(--shadow-portal)] h-14 text-base font-display font-semibold disabled:opacity-50"
            >
              {status === "reconnecting" ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Подключаемся…
                </>
              ) : (
                <>
                  <RefreshCw className="size-5" /> Обновить
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goBack}
              size="lg"
              className="w-full bg-acid hover:bg-acid/90 text-background shadow-[0_0_40px_-10px_hsl(var(--acid)/0.5)] h-14 text-base font-display font-semibold"
            >
              <Check className="size-5" /> Продолжить
            </Button>
          )}

          {status === "failed" && (
            <Button
              onClick={goBack}
              variant="outline"
              size="lg"
              className="w-full h-12 font-display"
            >
              Вернуться назад
            </Button>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-4 px-4">
          Хост на ТВ держит игру для тебя — у тебя есть до 60 секунд.
        </p>
      </main>

      <style>{`
        @keyframes reconnect-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

const Chip = ({
  Icon,
  label,
  tone,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: "muted";
}) => (
  <span
    className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${
      tone === "muted"
        ? "border-border bg-background/30 text-muted-foreground"
        : "border-portal/30 bg-portal/10 text-portal"
    }`}
  >
    <Icon className="size-3" />
    {label}
  </span>
);

export default Reconnect;
