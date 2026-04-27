// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { code } = await req.json().catch(() => ({}));
    const normCode = String(code ?? "").trim().toUpperCase();
    if (!normCode) return json({ error: "code required" }, 400);

    const { data: promo, error: pErr } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", normCode)
      .maybeSingle();
    if (pErr || !promo) return json({ error: "Промокод не найден" }, 404);
    if (!promo.active) return json({ error: "Промокод не активен" }, 400);
    if (promo.used_count >= promo.max_uses) return json({ error: "Промокод исчерпан" }, 400);
    if (promo.expires_at && new Date(promo.expires_at).getTime() < Date.now()) {
      return json({ error: "Промокод истёк" }, 400);
    }

    // Already entitled?
    const { data: existing } = await supabase
      .from("entitlements")
      .select("id")
      .eq("user_id", userId)
      .eq("scope", promo.scope)
      .eq("active", true)
      .maybeSingle();
    if (existing) {
      return json({ ok: true, scope: promo.scope, already: true });
    }

    const { error: insErr } = await supabase.from("entitlements").insert({
      user_id: userId,
      scope: promo.scope,
      source: "promo",
      active: true,
    });
    if (insErr) return json({ error: insErr.message }, 500);

    await supabase
      .from("promo_codes")
      .update({ used_count: promo.used_count + 1 })
      .eq("code", promo.code);

    return json({ ok: true, scope: promo.scope });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
