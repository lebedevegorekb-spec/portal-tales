import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization");
    const { data: { user } } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader ?? "" } } }
    ).auth.getUser();

    if (!user) return json({ error: "Unauthorized" }, 401);

    const { purchase_id } = await req.json();
    if (!purchase_id) return json({ error: "Missing purchase_id" }, 400);

    // Получить purchase
    const { data: purchase } = await supabase
      .from("purchases")
      .select("*")
      .eq("id", purchase_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!purchase) return json({ error: "Purchase not found" }, 404);
    if (purchase.status === "succeeded") return json({ status: "succeeded" });

    // Проверить статус напрямую в ЮKassa
    if (purchase.payment_id) {
      const shopId = Deno.env.get("YOOKASSA_SHOP_ID")!;
      const secretKey = Deno.env.get("YOOKASSA_SECRET_KEY")!;

      const ykRes = await fetch(`https://api.yookassa.ru/v3/payments/${purchase.payment_id}`, {
        headers: {
          "Authorization": "Basic " + btoa(`${shopId}:${secretKey}`),
        },
      });

      const ykPayment = await ykRes.json();

      if (ykPayment.status === "succeeded") {
        // Обновить purchase
        const { data: userData } = await supabase.auth.admin.getUserById(user.id);
        const userEmail = userData?.user?.email ?? null;

        await supabase
          .from("purchases")
          .update({
            status: "succeeded",
            paid_at: new Date().toISOString(),
            user_email: userEmail,
          })
          .eq("id", purchase_id);

        // Проверить нет ли уже entitlement
        const { data: existing } = await supabase
          .from("entitlements")
          .select("id")
          .eq("user_id", user.id)
          .eq("scope", purchase.scenario_id)
          .maybeSingle();

        if (!existing) {
          await supabase
            .from("entitlements")
            .insert({
              user_id: user.id,
              scope: purchase.scenario_id,
              active: true,
              source: "purchase",
            });
        }

        return json({ status: "succeeded" });
      }

      if (ykPayment.status === "canceled") {
        await supabase
          .from("purchases")
          .update({ status: "failed" })
          .eq("id", purchase_id);
        return json({ status: "failed" });
      }

      return json({ status: ykPayment.status });
    }

    return json({ status: purchase.status });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
