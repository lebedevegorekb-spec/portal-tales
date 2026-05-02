import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Loader2, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Scenario = {
  id: string;
  title: string;
  description: string;
  price_rub: number;
  created_at: string;
};

export default function AdminScenarios() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.role !== "admin") { navigate("/catalog"); return; }
        setIsAdmin(true);
        setChecking(false);
      });
  }, [user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("scenarios")
      .select("id, title, description, price_rub, created_at")
      .order("id")
      .then(({ data }) => setScenarios(data ?? []));
  }, [isAdmin]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-portal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 container py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-display">Сценарии</h1>
          <span className="text-xs uppercase tracking-widest text-muted-foreground border border-border px-3 py-1 rounded-sm">
            Admin
          </span>
        </div>

        <div className="grid gap-4">
          {scenarios.map((s) => (
            <div key={s.id} className="glass-card p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs text-portal border border-portal/30 px-2 py-0.5 rounded-sm">{s.id}</span>
                  <h3 className="font-display text-lg">{s.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{s.description}</p>
                <p className="text-xs text-muted-foreground mt-1">₽{s.price_rub}</p>
              </div>
              <Link to={`/admin/scenarios/${s.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="w-4 h-4" /> Редактировать
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
