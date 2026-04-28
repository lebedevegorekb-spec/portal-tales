import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, QrCode, AlertTriangle, ArrowRight } from "lucide-react";

type Status = "idle" | "connecting" | "connected" | "error";
type ErrorKind = "not_found" | "full" | "generic";

const ERROR_COPY: Record<ErrorKind, { title: string; hint: string }> = {
  not_found: {
    title: "Комната не найдена",
    hint: "Проверь код на экране ТВ — возможно, опечатка.",
  },
  full: {
    title: "Комната заполнена",
    hint: "Все слоты заняты. Попроси хоста создать новую игру.",
  },
  generic: {
    title: "Не удалось подключиться",
    hint: "Что-то пошло не так. Попробуй ещё раз.",
  },
};

const Join = () => {
  const { code: codeParam } = useParams<{ code?: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState(codeParam ?? "");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorKind, setErrorKind] = useState<ErrorKind>("generic");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (codeParam) setCode(codeParam.replace(/\D/g, "").slice(0, 6));
  }, [codeParam]);

  const canSubmit = useMemo(
    () => code.trim().length === 6 && name.trim().length >= 1 && status !== "connecting",
    [code, name, status],
  );

  const classifyError = (msg?: string): ErrorKind => {
    const m = (msg ?? "").toLowerCase();
    if (m.includes("not_found") || m.includes("not found") || m.includes("не найден")) return "not_found";
    if (m.includes("full") || m.includes("заполнен")) return "full";
    return "generic";
  };

  const join = async () => {
    if (!canSubmit) return;
    setStatus("connecting");
    const { data, error } = await supabase.functions.invoke("room-join", {
      body: {
        code: code.trim(),
        display_name: name.trim(),
        user_id: user?.id ?? null,
      },
    });
    if (error || data?.error) {
      setErrorKind(classifyError(data?.error || error?.message));
      setStatus("error");
      return;
    }
    setStatus("connected");
    setTimeout(() => navigate(`/lobby/${data.room.id}`), 700);
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl text-balance">Подключиться к игре</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Введи код, который хост показал на ТВ, или отсканируй QR-код.
          </p>
        </div>

        {/* SUCCESS STATE */}
        {status === "connected" && (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3 border-acid/40 animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto size-16 rounded-full bg-acid/15 flex items-center justify-center">
              <CheckCircle2 className="size-9 text-acid" />
            </div>
            <h2 className="text-xl font-display font-bold">Подключено!</h2>
            <p className="text-sm text-muted-foreground">Заходим в лобби…</p>
          </div>
        )}

        {/* IDLE / CONNECTING / ERROR */}
        {status !== "connected" && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5 space-y-5">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  Твоё имя
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 24))}
                  placeholder="Морти"
                  className="mt-1.5 h-12 text-base"
                  disabled={status === "connecting"}
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  Код комнаты
                </label>
                <Input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  disabled={status === "connecting"}
                  className="mt-1.5 h-16 font-display font-bold text-3xl tabular-nums tracking-[0.4em] text-center"
                />
              </div>

              {/* ERROR */}
              {status === "error" && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 flex gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-semibold text-destructive">{ERROR_COPY[errorKind].title}</div>
                    <div className="text-muted-foreground mt-0.5">{ERROR_COPY[errorKind].hint}</div>
                  </div>
                </div>
              )}

              <Button
                onClick={join}
                disabled={!canSubmit}
                size="lg"
                className="w-full bg-portal hover:bg-portal/90 text-portal-foreground shadow-[var(--shadow-portal)] h-14 text-base font-display font-semibold"
              >
                {status === "connecting" ? (
                  <>
                    <Loader2 className="size-5 animate-spin" /> Подключаемся…
                  </>
                ) : (
                  <>
                    Присоединиться <ArrowRight className="size-5" />
                  </>
                )}
              </Button>
            </div>

            {/* QR hint */}
            <button
              type="button"
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left hover:border-portal/40 transition-colors"
              onClick={() => {
                // QR-сканер пока заглушка
              }}
            >
              <div className="size-11 rounded-xl bg-portal/10 border border-portal/30 flex items-center justify-center text-portal">
                <QrCode className="size-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Сканировать QR-код</div>
                <div className="text-xs text-muted-foreground">Откроется камера</div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </button>

            <p className="text-[11px] text-muted-foreground text-center px-4">
              Код состоит из 6 цифр. Попроси хоста показать его на экране ТВ.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Join;
