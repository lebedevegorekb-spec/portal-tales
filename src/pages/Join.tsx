import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Join = () => {
  const { code: codeParam } = useParams<{ code?: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState(codeParam ?? "");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (codeParam) setCode(codeParam);
  }, [codeParam]);

  const join = async () => {
    if (!code.trim() || !name.trim()) {
      toast.error("Введи имя и код");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("room-join", {
      body: {
        code: code.trim(),
        display_name: name.trim(),
        user_id: user?.id ?? null,
      },
    });
    setBusy(false);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Не удалось зайти");
      return;
    }
    navigate(`/lobby/${data.room.id}`);
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10 max-w-md">
        <h1 className="font-display font-bold text-3xl mb-2">Подключиться к комнате</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Введи код, который показал хост на ТВ.
        </p>
        <div className="space-y-4 glass-card rounded-md p-5">
          <div>
            <label className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Имя
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 24))}
              placeholder="Морти"
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Код комнаты
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="456789"
              inputMode="numeric"
              className="mt-1.5 font-display font-bold text-2xl tabular-nums tracking-[0.2em] text-center"
            />
          </div>
          <Button
            onClick={join}
            disabled={busy}
            className="w-full bg-portal hover:bg-portal/90 text-primary-foreground shadow-[var(--shadow-portal)]"
            size="lg"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Войти
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Join;
