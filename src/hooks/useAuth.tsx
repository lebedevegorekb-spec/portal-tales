import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

// ⚠️ Временный режим тестирования: пропускает логин и подсовывает фейкового юзера.
// Чтобы вернуть нормальную авторизацию — поставь false.
const BYPASS_AUTH = true;

const FAKE_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "tester@portal.local",
  app_metadata: {},
  user_metadata: { display_name: "Тестер" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as User;

const FAKE_SESSION = {
  access_token: "dev",
  refresh_token: "dev",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: FAKE_USER,
} as unknown as Session;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(BYPASS_AUTH ? FAKE_SESSION : null);
  const [loading, setLoading] = useState(!BYPASS_AUTH);

  useEffect(() => {
    if (BYPASS_AUTH) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signOut: async () => {
          if (BYPASS_AUTH) return;
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
