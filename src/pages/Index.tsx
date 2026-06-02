import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tv, Smartphone, UserCog, Users, Play, Mail, MessageCircle, Send } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroRickMorty from "@/assets/hero-rick-morty.png";

const Index = () => {
  const [scenarios, setScenarios] = useState<{ id: string; title: string; description: string }[]>([]);

  useEffect(() => {
    supabase
      .from("scenarios")
      .select("id,title,description")
      
      .order("id")
      .then(({ data }) => setScenarios(data ?? []));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* ====== HERO (оставляем кайфовых Рика и Морти) ====== */}
        <section className="container py-16 md:py-24 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 h-80 w-80 portal-orb opacity-60 pointer-events-none" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 portal-orb opacity-40 pointer-events-none" />

          <div className="relative grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-8 items-center">
            {/* Left: copy */}
            <div className="relative z-10 max-w-2xl">
              <span className="hud-chip mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-portal-glow shadow-[0_0_8px_hsl(var(--portal-glow))] animate-blink" />
                Party-game · 3–8 игроков · 30 минут
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-balance leading-[1.05]">
                Интерактивная party-game{" "}
                <span className="text-portal neon-text">для твоей компании</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground text-pretty max-w-2xl">
                Запусти на ТВ, друзья подключаются с телефонов. Тайные роли, общий сюжет,
                ор и измена за столом — всё что нужно для вечера.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/catalog">
                  <Button
                    size="lg"
                    className="bg-portal hover:bg-portal/90 text-primary-foreground shadow-[var(--shadow-portal)]"
                  >
                    Начать бесплатно
                  </Button>
                </Link>
                <a href="#demo">
                  <Button size="lg" variant="outline">
                    <Play className="h-4 w-4" /> Смотреть демо
                  </Button>
                </a>
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                <span>Без регистрации</span>
                <span className="h-1 w-1 rounded-full bg-portal/60" />
                <span>Работает в браузере</span>
              </div>
            </div>

            {/* Right: Rick & Morty illustration (без изменений) */}
            <div className="relative h-[420px] md:h-[520px] lg:h-[560px] pointer-events-none select-none">
              <div
                className="absolute inset-0 m-auto h-[78%] w-[78%] rounded-full blur-3xl opacity-70"
                style={{
                  background:
                    "radial-gradient(circle at 55% 45%, hsl(var(--portal-glow) / 0.75), hsl(var(--portal) / 0.35) 45%, transparent 70%)",
                }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[70%] w-[70%] portal-orb opacity-80" />
              <div className="absolute top-6 right-10 h-3 w-3 rounded-full bg-portal-glow shadow-[0_0_18px_hsl(var(--portal-glow))] animate-pulse" />
              <div className="absolute bottom-10 left-6 h-2 w-2 rounded-full bg-acid shadow-[0_0_14px_hsl(var(--acid))] animate-pulse [animation-delay:400ms]" />
              <div className="absolute top-20 left-16 h-2.5 w-2.5 rounded-full bg-pink shadow-[0_0_14px_hsl(var(--pink))] animate-pulse [animation-delay:900ms]" />

              <img
                src={heroRickMorty}
                alt="Рик в панике бежит, Морти плачет — хаос мультивселенной"
                width={1280}
                height={1280}
                className="relative z-10 h-full w-full object-contain drop-shadow-[0_18px_30px_hsl(var(--portal)/0.35)] animate-[fade-in_0.8s_ease-out]"
              />
            </div>
          </div>
        </section>

        {/* ====== ДЕМО ВИДЕО ====== */}
        <section id="demo" className="container py-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-xs text-portal/70">// 01</span>
            <h2 className="text-3xl font-display font-bold">Посмотри как это</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-portal/40 to-transparent" />
          </div>
          <div className="glass-card scanlines rounded-md overflow-hidden">
            <div className="relative aspect-video bg-background/60 flex items-center justify-center">
              {/* Заглушка под демо-видео 30 сек */}
              <div className="absolute inset-0 opacity-40 portal-orb" />
              <button
                type="button"
                className="relative z-10 inline-flex items-center gap-3 rounded-full border border-portal/50 bg-background/80 px-6 py-4 backdrop-blur-md hover:border-portal transition-colors"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-portal text-primary-foreground shadow-[var(--shadow-portal)]">
                  <Play className="h-5 w-5 ml-0.5" />
                </span>
                <span className="text-left">
                  <span className="block font-display font-semibold">Демо · 30 секунд</span>
                  <span className="block text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    Как выглядит вечер игры
                  </span>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ====== КАК ЭТО РАБОТАЕТ — 4 шага ====== */}
        <section className="container py-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="font-mono text-xs text-portal/70">// 02</span>
            <h2 className="text-3xl font-display font-bold">Как это работает</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-portal/40 to-transparent" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { i: <Tv className="h-5 w-5" />, t: "Запускаешь на ТВ", d: "Открой комнату на большом экране — это ваш общий стол.", k: "01" },
              { i: <Smartphone className="h-5 w-5" />, t: "Друзья подключаются", d: "QR-код на ТВ → телефон → готово. Никаких приложений.", k: "02" },
              { i: <UserCog className="h-5 w-5" />, t: "Роли и тайные цели", d: "Каждый получает персонажа и личную миссию. Молчи или блефуй.", k: "03" },
              { i: <Users className="h-5 w-5" />, t: "Влияете на сюжет", d: "Голосуете, спорите, предаёте. История идёт туда, куда вы её толкнёте.", k: "04" },
            ].map((s, i) => (
              <div
                key={i}
                className="glass-card scanlines rounded-md p-6 hover:border-portal/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-portal/40 bg-portal/15 text-portal shadow-[0_0_20px_-6px_hsl(var(--portal-glow)/0.8)]">
                    {s.i}
                  </div>
                  <span className="font-mono text-xs text-portal/60">{`>`} {s.k}</span>
                </div>
                <h3 className="font-display font-semibold text-lg">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link to="/catalog">
              <Button
                size="lg"
                className="bg-portal hover:bg-portal/90 text-primary-foreground shadow-[var(--shadow-portal)]"
              >
                Начать бесплатно
              </Button>
            </Link>
          </div>
        </section>

        {/* ====== ПРИМЕРЫ СЦЕНАРИЕВ ====== */}
        <section className="container py-16">
          <div className="flex items-end justify-between mb-6 gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-portal/70">// 03</span>
              <h2 className="text-3xl font-display font-bold">Примеры сценариев</h2>
            </div>
            <Link
              to="/catalog"
              className="font-mono text-xs uppercase tracking-[0.18em] text-portal hover:text-portal-glow transition-colors"
            >
              [ Все → ]
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.slice(0, 6).map((s) => (
              <Link
                key={s.id}
                to="/catalog"
                className="glass-card rounded-md p-5 hover:border-portal/50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-mono text-portal">{s.id}</div>
                  <span className="h-1.5 w-1.5 rounded-full bg-portal-glow shadow-[0_0_10px_hsl(var(--portal-glow))] opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-display font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{s.description}</p>
              </Link>
            ))}
            {scenarios.length === 0 &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card rounded-md p-5 animate-pulse">
                  <div className="h-3 w-12 bg-muted rounded mb-3" />
                  <div className="h-5 w-2/3 bg-muted rounded mb-2" />
                  <div className="h-3 w-full bg-muted rounded mb-1" />
                  <div className="h-3 w-4/5 bg-muted rounded" />
                </div>
              ))}
          </div>
        </section>

        {/* ====== FAQ ====== */}
        <section className="container py-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="font-mono text-xs text-portal/70">// 04</span>
            <h2 className="text-3xl font-display font-bold">Частые вопросы</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-portal/40 to-transparent" />
          </div>
          <div className="glass-card rounded-md p-2 sm:p-4 max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1">
                <AccordionTrigger className="text-left font-display">
                  Сколько нужно игроков?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  От 3 до 8. Идеально — 4–6, чтобы хватило интриг и предательств.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger className="text-left font-display">
                  Нужно скачивать приложение?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Нет. Открываешь сайт на ТВ, друзья сканируют QR — и они в игре.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger className="text-left font-display">
                  Сколько длится одна игра?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Около 30–45 минут на сценарий. В самый раз между двумя бутылками вина.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger className="text-left font-display">
                  Это правда бесплатно?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Базовые сценарии — да. Хочешь больше историй и режимов — есть подписка.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q5">
                <AccordionTrigger className="text-left font-display">
                  Можно играть удалённо?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Да. Один шарит экран в созвоне — остальные подключаются с телефонов.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* ====== FINAL CTA ====== */}
        <section className="container py-20">
          <div className="glass-card scanlines rounded-md p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute -top-24 -left-20 h-72 w-72 portal-orb opacity-50 pointer-events-none" />
            <div className="absolute -bottom-24 -right-20 h-80 w-80 portal-orb opacity-40 pointer-events-none" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-balance">
                Собирай друзей. <span className="text-portal neon-text">Открывай портал.</span>
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Бесплатная комната за 10 секунд. Без карты, без скачиваний, без душноты.
              </p>
              <div className="mt-8">
                <Link to="/catalog">
                  <Button
                    size="lg"
                    className="bg-portal hover:bg-portal/90 text-primary-foreground shadow-[var(--shadow-portal)]"
                  >
                    Начать бесплатно
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ====== ФУТЕР ====== */}
      <footer className="border-t border-portal/15 mt-4">
        <div className="container py-10 grid gap-8 md:grid-cols-3">
          <div>
            <div className="font-display font-bold text-lg neon-text">Портал-Квест</div>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Текстовые party-квесты в духе мультивселенной. Для друзей, не для душных.
            </p>
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-portal/70 mb-3">
              Контакты
            </div>
            <a
              href="mailto:lebedevegor.ekb@mail.ru"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-portal transition-colors"
            >
              <Mail className="h-4 w-4" /> lebedevegor.ekb@mail.ru
            </a>
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-portal/70 mb-3">
              Соцсети
            </div>
            <div className="flex gap-3">
              <a
                href="https://t.me/portal_quest"
                target="_blank" rel="noopener noreferrer"
                aria-label="Telegram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-portal/30 text-muted-foreground hover:text-portal hover:border-portal/60 transition-colors"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/easy_fitness_bot?utm_source=qr"
                target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-portal/30 text-muted-foreground hover:text-portal hover:border-portal/60 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-portal/10 py-5 text-center text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
          © Портал-Квест · Фан-проект, не аффилирован с Adult Swim
        </div>
      </footer>
    </div>
  );
};

export default Index;
