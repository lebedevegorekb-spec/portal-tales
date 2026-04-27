import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const Pricing = () => {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const redeem = async () => {
    if (!user) return toast.error("Сначала войди");
    if (!code.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("promo-redeem", {
      body: { code: code.trim() },
    });
    setLoading(false);
    if (error || data?.error) return toast.error(data?.error || error?.message || "Ошибка");
    toast.success(data.already ? "Уже активирован" : `Доступ открыт: ${data.scope}`);
    setCode("");
  };

  const tiers = [
    { name: "Один портал", price: "$1", desc: "1 сценарий на выбор" },
    { name: "Тройка", price: "$3", desc: "3 сценария", highlight: true },
    { name: "Полный сезон", price: "$5", desc: "Все 10 сценариев" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-12 max-w-4xl">
        <h1 className="text-4xl font-display font-bold mb-2">Тарифы</h1>
        <p className="text-muted-foreground mb-8">
          Оплата подключится позже. Пока доступ открывается через промокод.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`glass-card rounded-2xl p-6 ${
                t.highlight ? "border-2 border-portal shadow-[var(--shadow-portal)]" : ""
              }`}
            >
              {t.highlight && (
                <span className="inline-block text-xs font-bold text-portal-foreground bg-portal px-2 py-0.5 rounded-full mb-2">
                  Популярный
                </span>
              )}
              <div className="font-display font-semibold text-xl">{t.name}</div>
              <div className="text-4xl font-display font-bold my-3 tabular-nums">{t.price}</div>
              <div className="text-sm text-muted-foreground mb-4">{t.desc}</div>
              <Button disabled className="w-full" variant="outline">
                Скоро
              </Button>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6 max-w-md">
          <h2 className="font-display font-semibold text-xl mb-2">Есть промокод?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Попробуй <code className="font-mono bg-muted px-1.5 py-0.5 rounded">DEMO2025</code> — открывает все 10 сценариев.
          </p>
          {user ? (
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="DEMO2025"
              />
              <Button onClick={redeem} disabled={loading} className="bg-portal hover:bg-portal/90">
                {loading ? "..." : "Активировать"}
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button className="bg-portal hover:bg-portal/90">Войти, чтобы активировать</Button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
};

export default Pricing;
