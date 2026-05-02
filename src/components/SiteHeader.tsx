import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";

export const SiteHeader = () => {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-portal/20">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-portal/40 bg-portal/10 shadow-[0_0_18px_-4px_hsl(var(--portal-glow)/0.8)]">
            <span className="portal-orb absolute inset-1 opacity-80" />
            <Sparkles className="h-4 w-4 text-portal relative" />
          </span>
          <span className="neon-text">Портал-Квест</span>
          <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-[0.22em] text-portal/70 ml-1 px-1.5 py-0.5 border border-portal/30 rounded-sm">v0.1</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/catalog" className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-portal px-3 py-2 transition-colors">
            Сценарии
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-portal px-3 py-2 transition-colors">
                Профиль
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" /> Выйти
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm" className="bg-portal hover:bg-portal/90 text-primary-foreground shadow-[0_0_18px_-4px_hsl(var(--portal-glow)/0.8)]">Войти</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
