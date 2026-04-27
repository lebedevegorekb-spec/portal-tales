import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Zap, Trophy } from "lucide-react";
import heroRickMorty from "@/assets/hero-rick-morty.png";

const Index = () => {
  const [scenarios, setScenarios] = useState<{ id: string; title: string; description: string }[]>([]);

  useEffect(() => {
    supabase
      .from("scenarios")
      .select("id,title,description")
      .eq("is_active", true)
      .order("id")
      .then(({ data }) => setScenarios(data ?? []));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="container py-16 md:py-24 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 h-80 w-80 portal-orb opacity-60 pointer-events-none" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 portal-orb opacity-40 pointer-events-none" />

          <div className="relative grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-8 items-center">
            {/* Left: copy */}
            <div className="relative z-10 max-w-2xl">
              <span className="hud-chip mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-portal-glow shadow-[0_0_8px_hsl(var(--portal-glow))] animate-blink" />
                MVP · Сезон 1 · 10 сценариев
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-balance leading-[1.05]">
                Текстовые квесты <span className="text-portal neon-text">в мультивселенной</span>
              </h1>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-balance leading-[1.05]">
                Текстовые квесты <span className="text-portal">в мультивселенной</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground text-pretty max-w-2xl">
                Открывай порталы, торгуйся с инопланетянами, спасай Морти. Каждый сценарий —
                30–45 минут чата, до 50 шагов, с финальной иллюстрацией.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/play">
                  <Button size="lg" className="bg-portal hover:bg-portal/90 text-primary-foreground shadow-[var(--shadow-portal)]">
                    Начать приключение
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline">Тарифы и промокод</Button>
                </Link>
              </div>
            </div>

            {/* Right: Rick & Morty illustration */}
            <div className="relative h-[420px] md:h-[520px] lg:h-[560px] pointer-events-none select-none">
              {/* Portal glow behind characters */}
              <div
                className="absolute inset-0 m-auto h-[78%] w-[78%] rounded-full blur-3xl opacity-70"
                style={{
                  background:
                    "radial-gradient(circle at 55% 45%, hsl(var(--portal-glow) / 0.75), hsl(var(--portal) / 0.35) 45%, transparent 70%)",
                }}
              />
              {/* Spinning portal ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[70%] w-[70%] portal-orb opacity-80" />
              {/* Energy particles */}
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

        {/* How it works */}
        <section className="container py-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="font-mono text-xs text-portal/70">// 01</span>
            <h2 className="text-3xl font-display font-bold">Как это работает</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-portal/40 to-transparent" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { i: <Zap className="h-5 w-5" />, t: "Выбери сценарий", d: "10 готовых историй: от паразита-имитатора до ограбления хранилища.", k: "01" },
              { i: <MessageSquare className="h-5 w-5" />, t: "Играй в чате", d: "Пиши действия (до 80 символов). ИИ-ведущий отвечает в духе Рика.", k: "02" },
              { i: <Trophy className="h-5 w-5" />, t: "Дойди до финала", d: "До 50 шагов, чекпойнты сохраняют прогресс. В конце — финальная картинка.", k: "03" },
            ].map((s, i) => (
              <div key={i} className="glass-card scanlines rounded-md p-6 hover:border-portal/50 transition-colors">
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
        </section>

        {/* Scenarios preview */}
        <section className="container py-16">
          <div className="flex items-end justify-between mb-6 gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-portal/70">// 02</span>
              <h2 className="text-3xl font-display font-bold">Сценарии сезона</h2>
            </div>
            <Link to="/play" className="font-mono text-xs uppercase tracking-[0.18em] text-portal hover:text-portal-glow transition-colors">[ Все → ]</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.slice(0, 6).map((s) => (
              <div key={s.id} className="glass-card rounded-md p-5 hover:border-portal/50 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-mono text-portal">{s.id}</div>
                  <span className="h-1.5 w-1.5 rounded-full bg-portal-glow shadow-[0_0_10px_hsl(var(--portal-glow))] opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-display font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{s.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-portal/15 py-8 text-center text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
        © Портал-Квест · Фан-проект, не аффилирован с Adult Swim
      </footer>
    </div>
  );
};

export default Index;
