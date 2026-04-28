import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, CreditCard, Loader2, Smartphone, Wallet, XCircle, ArrowLeft, ShieldCheck } from "lucide-react";

type Method = "card" | "sbp" | "wallet";
type Status = "select" | "paying" | "success" | "error";

const SCENARIOS: Record<string, { title: string; subtitle: string; price: number; oldPrice?: number }> = {
  S02: { title: "Бункер 2347", subtitle: "Постапокалипсис · 6 игроков", price: 250, oldPrice: 350 },
  S03: { title: "Корпорация Лжи", subtitle: "Киберпанк-триллер · 5–7 игроков", price: 250 },
  S04: { title: "Последний поезд", subtitle: "Хоррор · 4–6 игроков", price: 350 },
};

const Payment = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const sid = scenarioId ?? params.get("scenario") ?? "S02";
  const scenario = SCENARIOS[sid] ?? SCENARIOS.S02;

  const [method, setMethod] = useState<Method>("card");
  const [status, setStatus] = useState<Status>("select");
  const [email, setEmail] = useState("");
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });

  const canPay = useMemo(() => {
    if (!email.includes("@")) return false;
    if (method === "card") {
      return card.number.replace(/\s/g, "").length >= 16 && card.exp.length >= 4 && card.cvc.length >= 3;
    }
    return true;
  }, [email, method, card]);

  const pay = async () => {
    setStatus("paying");
    // Имитация запроса к ЮKassa
    await new Promise((r) => setTimeout(r, 1800));
    // Демо: карта 4111 — успех, иначе ошибка
    const ok = method !== "card" || card.number.replace(/\s/g, "").startsWith("4111");
    setStatus(ok ? "success" : "error");
  };

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8 md:py-12 max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" /> Назад
        </button>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
          {/* LEFT — Форма */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-balance">Оплата сценария</h1>
              <p className="text-muted-foreground mt-1">Безопасная оплата через ЮKassa</p>
            </div>

            {status === "success" ? (
              <SuccessCard scenarioTitle={scenario.title} onContinue={() => navigate("/catalog")} />
            ) : status === "error" ? (
              <ErrorCard onRetry={() => setStatus("select")} />
            ) : (
              <>
                {/* Способы оплаты */}
                <div className="glass-card rounded-2xl p-5 md:p-6">
                  <div className="font-display font-semibold text-lg mb-4">Способ оплаты</div>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    <MethodTile active={method === "card"} onClick={() => setMethod("card")} icon={<CreditCard className="size-5" />} label="Карта" />
                    <MethodTile active={method === "sbp"} onClick={() => setMethod("sbp")} icon={<Smartphone className="size-5" />} label="СБП" />
                    <MethodTile active={method === "wallet"} onClick={() => setMethod("wallet")} icon={<Wallet className="size-5" />} label="ЮMoney" />
                  </div>
                </div>

                {/* Email */}
                <div className="glass-card rounded-2xl p-5 md:p-6 space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm">Email для чека</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5"
                    />
                  </div>

                  {/* Форма ЮKassa (имитация встроенной) */}
                  {method === "card" && (
                    <div className="rounded-xl border border-border bg-background/40 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">ЮKassa · защищённая форма</div>
                        <ShieldCheck className="size-4 text-acid" />
                      </div>
                      <div>
                        <Label htmlFor="card" className="text-xs text-muted-foreground">Номер карты</Label>
                        <Input
                          id="card"
                          value={card.number}
                          onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                          placeholder="4111 1111 1111 1111"
                          inputMode="numeric"
                          className="mt-1 font-mono tabular-nums"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="exp" className="text-xs text-muted-foreground">Срок</Label>
                          <Input
                            id="exp"
                            value={card.exp}
                            onChange={(e) => setCard({ ...card, exp: formatExp(e.target.value) })}
                            placeholder="MM/YY"
                            inputMode="numeric"
                            className="mt-1 font-mono tabular-nums"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc" className="text-xs text-muted-foreground">CVC</Label>
                          <Input
                            id="cvc"
                            type="password"
                            value={card.cvc}
                            onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                            placeholder="•••"
                            inputMode="numeric"
                            className="mt-1 font-mono tabular-nums"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Тест: используйте номер <span className="font-mono">4111 1111 1111 1111</span> для успеха.
                      </p>
                    </div>
                  )}

                  {method === "sbp" && (
                    <div className="rounded-xl border border-border bg-background/40 p-6 text-center">
                      <Smartphone className="size-10 mx-auto text-portal mb-2" />
                      <div className="font-medium">Оплата через СБП</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        После нажатия «Оплатить» откроется QR-код для приложения банка.
                      </div>
                    </div>
                  )}

                  {method === "wallet" && (
                    <div className="rounded-xl border border-border bg-background/40 p-6 text-center">
                      <Wallet className="size-10 mx-auto text-portal mb-2" />
                      <div className="font-medium">ЮMoney</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Вы будете перенаправлены в кошелёк ЮMoney для подтверждения.
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={pay}
                  disabled={!canPay || status === "paying"}
                  size="lg"
                  className="w-full bg-portal hover:bg-portal/90 text-portal-foreground h-14 text-base font-display font-semibold shadow-[var(--shadow-portal)]"
                >
                  {status === "paying" ? (
                    <>
                      <Loader2 className="size-5 animate-spin" /> Обработка платежа…
                    </>
                  ) : (
                    <>Оплатить {scenario.price} ₽</>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Нажимая «Оплатить», вы соглашаетесь с <Link to="#" className="underline">условиями</Link>.
                  Платёж обрабатывается ЮKassa, мы не храним данные карты.
                </p>
              </>
            )}
          </div>

          {/* RIGHT — Order summary */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="glass-card rounded-2xl p-5 md:p-6 space-y-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Заказ</div>
              <div>
                <div className="font-display font-bold text-xl">{scenario.title}</div>
                <div className="text-sm text-muted-foreground">{scenario.subtitle}</div>
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <Row label="Цена" value={`${scenario.price} ₽`} old={scenario.oldPrice ? `${scenario.oldPrice} ₽` : undefined} />
                <Row label="Комиссия" value="0 ₽" />
              </div>
              <div className="border-t border-border pt-4 flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Итого</span>
                <span className="font-display font-bold text-3xl tabular-nums text-portal">{scenario.price} ₽</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <ShieldCheck className="size-4 text-acid shrink-0" />
                Платёж защищён по стандарту PCI DSS
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

const MethodTile = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 md:p-4 transition-colors ${
      active
        ? "border-portal bg-portal/10 text-portal shadow-[var(--shadow-portal)]"
        : "border-border bg-background/40 text-foreground hover:border-portal/40"
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const Row = ({ label, value, old }: { label: string; value: string; old?: string }) => (
  <div className="flex justify-between items-baseline">
    <span className="text-muted-foreground">{label}</span>
    <span className="tabular-nums">
      {old && <span className="text-muted-foreground line-through mr-2 text-xs">{old}</span>}
      {value}
    </span>
  </div>
);

const SuccessCard = ({ scenarioTitle, onContinue }: { scenarioTitle: string; onContinue: () => void }) => (
  <div className="glass-card rounded-2xl p-8 text-center space-y-4 border-acid/40">
    <div className="mx-auto size-16 rounded-full bg-acid/15 flex items-center justify-center">
      <CheckCircle2 className="size-9 text-acid" />
    </div>
    <h2 className="text-2xl font-display font-bold">Оплата прошла успешно</h2>
    <p className="text-muted-foreground">
      Сценарий «{scenarioTitle}» открыт в вашей библиотеке. Чек отправлен на email.
    </p>
    <Button onClick={onContinue} size="lg" className="bg-portal hover:bg-portal/90 text-portal-foreground">
      Перейти к сценарию
    </Button>
  </div>
);

const ErrorCard = ({ onRetry }: { onRetry: () => void }) => (
  <div className="glass-card rounded-2xl p-8 text-center space-y-4 border-destructive/40">
    <div className="mx-auto size-16 rounded-full bg-destructive/15 flex items-center justify-center">
      <XCircle className="size-9 text-destructive" />
    </div>
    <h2 className="text-2xl font-display font-bold">Оплата не прошла</h2>
    <p className="text-muted-foreground">
      Проверьте данные карты и попробуйте снова. Если ошибка повторяется — используйте другой способ оплаты.
    </p>
    <Button onClick={onRetry} size="lg" variant="outline">
      Попробовать ещё раз
    </Button>
  </div>
);

export default Payment;
