import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Lock, Play as PlayIcon, Ticket, RotateCcw } from "lucide-react";

type Scenario = { id: string; title: string; description: string };

const FREE_SCENARIOS = new Set(["S01"]);
const FREE_SCENARIO_FALLBACKS: Scenario[] = [
  {
    id: "S01",
    title: "Налог на Реальность C-137",
    description:
      "Инспектор-бюрократ из Налоговой Службы Мультивселенной требует утилизировать измерение C-137 за 47 лет неуплаты налога на существование.",
  },
];

const Play = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenariosLoading, setScenariosLoading] = useState(true);
  const [scenariosError, setScenariosError] = useState<string | null>(null);
  const [entitledScopes, setEntitledScopes] = useState<Set<string>>(new Set());
  const [activeRuns, setActiveRuns] = useState<Map<string, string>>(new Map());
  const [busy, setBusy] = useState<string | null>(null);
  const [promo, setPromo] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const refresh = async () => {
    setScenariosLoading(true);
    setScenariosError(null);

    let loadedScenarios: Scenario[] | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data, error } = await supabase
        .from("scenarios")
        .select("id,title,description")
        .eq("is_active", true)
        .order("id");

      if (!error && data) {
        loadedScenarios = data;
        break;
      }

      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 900 * (attempt + 1)));
      }
    }

    if (loadedScenarios) {
      const merged = [...loadedScenarios];
      FREE_SCENARIO_FALLBACKS.forEach((fallback) => {
        if (!merged.some((scenario) => scenario.id === fallback.id)) merged.push(fallback);
      });
      merged.sort((a, b) => a.id.localeCompare(b.id));
      setScenarios(merged);
    } else {
      setScenarios(FREE_SCENARIO_FALLBACKS);
      setScenariosError("Не удалось загрузить сценарии. Попробуй ещё раз.");
    }

    setScenariosLoading(false);

    if (!user) return;
    const { data: ents } = await supabase
      .from("entitlements")
      .select("scope, expires_at, active")
      .eq("user_id", user.id)
      .eq("active", true);
    const now = Date.now();
    const set = new Set<string>();
    (ents ?? []).forEach((e) => {
      if (!e.expires_at || new Date(e.expires_at).getTime() > now) set.add(e.scope);
    });
    setEntitledScopes(set);

    const { data: runs } = await supabase
      .from("runs")
      .select("id, scenario_id")
      .eq("user_id", user.id)
      .eq("status", "active");
    const map = new Map<string, string>();
    (runs ?? []).forEach((r) => map.set(r.scenario_id, r.id));
    setActiveRuns(map);
  };

  useEffect(() => {
    if (user) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const isEntitled = (id: string) =>
    FREE_SCENARIOS.has(id) || entitledScopes.has("all") || entitledScopes.has(id) || entitledScopes.has(`scenario:${id}`);

  const startRun = async (id: string) => {
    setBusy(id);
    const { data, error } = await supabase.functions.invoke("run-start", {
      body: { scenario_id: id },
    });
    setBusy(null);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Не удалось запустить");
      return;
    }
    navigate(`/play/run/${data.run_id}`);
  };

  const redeem = async () => {
    if (!promo.trim()) return;
    setRedeeming(true);
    const { data, error } = await supabase.functions.invoke("promo-redeem", {
      body: { code: promo.trim() },
    });
    setRedeeming(false);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Ошибка");
      return;
    }
    toast.success(data.already ? "Уже активирован" : `Доступ открыт: ${data.scope}`);
    setPromo("");
    refresh();
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-4xl font-display font-bold">Выбери сценарий</h1>
            <p className="text-muted-foreground mt-1">10 историй сезона 1</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Ticket className="h-4 w-4 mr-2" />
                Промокод
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Активировать промокод</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="DEMO2025"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())}
                />
                <Button onClick={redeem} disabled={redeeming} className="w-full bg-portal hover:bg-portal/90">
                  {redeeming ? "..." : "Активировать"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Подсказка: <code className="font-mono bg-muted px-1.5 py-0.5 rounded">DEMO2025</code> — открывает все сценарии.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {scenariosError ? (
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4 mb-4">
            <p className="text-sm text-muted-foreground">{scenariosError}</p>
            <Button variant="outline" onClick={refresh}>Повторить</Button>
          </div>
        ) : null}

        {scenariosLoading ? (
          <div className="text-sm text-muted-foreground mb-4">Загружаю сценарии...</div>
        ) : null}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((s) => {
            const entitled = isEntitled(s.id);
            const activeRun = activeRuns.get(s.id);
            return (
              <div key={s.id} className="glass-card rounded-2xl p-5 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-portal">{s.id}</span>
                  {entitled ? (
                    <span className="text-xs font-semibold text-portal bg-portal/10 px-2 py-0.5 rounded-full">
                      Доступно
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Закрыто
                    </span>
                  )}
                </div>
                <h3 className="font-display font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex-1">{s.description}</p>
                <div className="mt-4 flex gap-2">
                  {entitled && activeRun ? (
                    <Button
                      onClick={() => navigate(`/play/run/${activeRun}`)}
                      className="flex-1 bg-portal hover:bg-portal/90"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" /> Продолжить
                    </Button>
                  ) : entitled ? (
                    <Button
                      onClick={() => startRun(s.id)}
                      disabled={busy === s.id}
                      className="flex-1 bg-portal hover:bg-portal/90"
                    >
                      <PlayIcon className="h-4 w-4 mr-2" /> {busy === s.id ? "..." : "Начать"}
                    </Button>
                  ) : (
                    <Link to="/pricing" className="flex-1">
                      <Button variant="outline" className="w-full">Открыть доступ</Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Play;
