import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [scopes, setScopes] = useState<string[]>([]);
  const [runsCount, setRunsCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("entitlements")
      .select("scope")
      .eq("user_id", user.id)
      .eq("active", true)
      .then(({ data }) => setScopes((data ?? []).map((d) => d.scope)));
    supabase
      .from("runs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setRunsCount(count ?? 0));
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-12 max-w-2xl">
        <h1 className="text-3xl font-display font-bold mb-6">Профиль</h1>
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div>
            <div className="text-xs font-mono text-muted-foreground">EMAIL</div>
            <div className="font-medium">{user.email}</div>
          </div>
          <div>
            <div className="text-xs font-mono text-muted-foreground">ДОСТУПЫ</div>
            <div className="font-medium">{scopes.length ? scopes.join(", ") : "нет"}</div>
          </div>
          <div>
            <div className="text-xs font-mono text-muted-foreground">ПРОХОЖДЕНИЙ</div>
            <div className="font-medium tabular-nums">{runsCount}</div>
          </div>
          <Button variant="outline" onClick={async () => { await signOut(); navigate("/"); }}>
            Выйти
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
