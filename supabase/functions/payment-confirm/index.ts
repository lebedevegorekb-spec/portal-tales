import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();

    if (body?.event !== "payment.succeeded") {
      return json({ ok: true, skipped: true });
    }

    const paymentId = body?.object?.id;
    const status = body?.object?.status;

    if (!paymentId || status !== "succeeded") {
      return json({ error: "Invalid payload" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: purchase, error: pErr } = await supabase
      .from("purchases")
      .select("*")
      .eq("payment_id", paymentId)
      .maybeSingle();

    if (pErr || !purchase) return json({ error: "Purchase not found" }, 404);
    if (purchase.status === "succeeded") return json({ ok: true, idempotent: true });

    // Получить email пользователя
    const { data: userData } = await supabase.auth.admin.getUserById(purchase.user_id);
    const userEmail = userData?.user?.email ?? null;

    // Обновить purchase
    await supabase
      .from("purchases")
      .update({
        status: "succeeded",
        paid_at: new Date().toISOString(),
        user_email: userEmail,
      })
      .eq("id", purchase.id);

    // Выдать доступ
    await supabase
      .from("entitlements")
      .insert({
        user_id: purchase.user_id,
        scope: purchase.scenario_id ?? "all",
        active: true,
        source: "purchase",
      });

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
