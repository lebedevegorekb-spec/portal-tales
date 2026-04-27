import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/play", { replace: true });
  }, [user, navigate]);

  const handleSignUp = async () => {
    if (!email || !password) return toast.error("Введи email и пароль");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/play` },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Аккаунт создан! Можно войти.");
  };

  const handleSignIn = async () => {
    if (!email || !password) return toast.error("Введи email и пароль");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    navigate("/play");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-16 max-w-md">
        <h1 className="text-3xl font-display font-bold mb-2">Войти в портал</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Email и пароль. Прогресс сохранится между сессиями.
        </p>
        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Вход</TabsTrigger>
            <TabsTrigger value="signup">Регистрация</TabsTrigger>
          </TabsList>
          {(["signin", "signup"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4 pt-4">
              <div>
                <Label htmlFor={`email-${tab}`}>Email</Label>
                <Input
                  id={`email-${tab}`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rick@c137.com"
                />
              </div>
              <div>
                <Label htmlFor={`pw-${tab}`}>Пароль</Label>
                <Input
                  id={`pw-${tab}`}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="минимум 6 символов"
                />
              </div>
              <Button
                disabled={loading}
                onClick={tab === "signin" ? handleSignIn : handleSignUp}
                className="w-full bg-portal hover:bg-portal/90"
              >
                {loading ? "..." : tab === "signin" ? "Войти" : "Создать аккаунт"}
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default Login;
