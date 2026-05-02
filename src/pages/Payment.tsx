import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

const PRICE_RUB = 250;

export default function Payment() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("purchase_id");
    if (pid) { setPurchaseId(pid); setPolling(true); }
  }, []);

  useEffect(() => {
    if (!polling || !purchaseId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("purchases")
        .select("status")
        .eq("id", purchaseId)
        .maybeSingle();
      if (data?.status === "succeeded") {
        clearInterval(interval);
        setPolling(false);
        navigate("/catalog");
      } else if (data?.status === "failed") {
        clearInterval(interval);
        setPolling(false);
        setError("Платёж не прошёл. Попробуй снова.");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [polling, purchaseId, navigate]);

  const handlePay = async () => {
    if (!user || !scenarioId) return;
    setLoading(true);
    setError(null);
    try {
      const returnUrl = `${window.location.origin}/payment/${scenarioId}`;

      const { data, error: fnError } = await supabase.functions.invoke("payment-create", {
        body: { scenario_id: scenarioId, return_url: returnUrl },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.confirmation_url) throw new Error("Нет ссылки на оплату");

      window.location.href = data.confirmation_url;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 max-w-sm w-full text-center space-y-6">
          <div className="text-4xl">🔓</div>
          <h1 className="font-display text-2xl font-bold">Открыть сценарий</h1>
          <p className="text-muted-foreground text-sm">Сценарий {scenarioId}</p>
          <div className="text-3xl font-bold text-portal">{PRICE_RUB} ₽</div>

          {polling ? (
            <div className="space-y-2">
              <div className="animate-pulse text-portal">Проверяем оплату...</div>
              <p className="text-xs text-muted-foreground">Это займёт несколько секунд</p>
            </div>
          ) : (
            <Button
              onClick={handlePay}
              disabled={loading || !user}
              className="w-full bg-portal hover:bg-portal/80"
            >
              {loading ? "Переход к оплате..." : "Оплатить через ЮKassa"}
            </Button>
          )}

          {!user && <p className="text-xs text-destructive">Войди в аккаунт чтобы купить</p>}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </main>
    </div>
  );
}
