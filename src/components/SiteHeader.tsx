import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";

export const SiteHeader = () => {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="relative inline-flex h-8 w-8 items-center justify-center">
            <span className="portal-orb absolute inset-0" />
            <Sparkles className="h-4 w-4 text-portal relative" />
          </span>
          Портал-Квест
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/play" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
            Сценарии
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
            Тарифы
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
                Профиль
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" /> Выйти
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="default">Войти</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
