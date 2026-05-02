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
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) return json({ error: "Unauthorized" }, 401);

    const { data: { user }, error: authError } = await serviceClient.auth.getUser(token);
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const { purchase_id } = body;
    if (!purchase_id) return json({ error: "Missing purchase_id" }, 400);

    const { data: purchase } = await serviceClient
      .from("purchases")
      .select("*")
      .eq("id", purchase_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!purchase) return json({ error: "Purchase not found" }, 404);
    if (purchase.status === "succeeded") return json({ status: "succeeded" });

    if (!purchase.payment_id) return json({ status: purchase.status });

    const shopId = Deno.env.get("YOOKASSA_SHOP_ID")!;
    const secretKey = Deno.env.get("YOOKASSA_SECRET_KEY")!;

    const ykRes = await fetch(`https://api.yookassa.ru/v3/payments/${purchase.payment_id}`, {
      headers: {
        "Authorization": "Basic " + btoa(`${shopId}:${secretKey}`),
      },
    });

    const ykPayment = await ykRes.json();
    console.log("YK payment status:", ykPayment.status, "purchase_id:", purchase_id);

    if (ykPayment.status === "succeeded") {
      const { data: userData } = await serviceClient.auth.admin.getUserById(user.id);
      const userEmail = userData?.user?.email ?? null;

      await serviceClient
        .from("purchases")
        .update({ status: "succeeded", paid_at: new Date().toISOString(), user_email: userEmail })
        .eq("id", purchase_id);

      const { data: existing } = await serviceClient
        .from("entitlements")
        .select("id")
        .eq("user_id", user.id)
        .eq("scope", purchase.scenario_id)
        .maybeSingle();

      if (!existing) {
        await serviceClient.from("entitlements").insert({
          user_id: user.id,
          scope: purchase.scenario_id,
          active: true,
          source: "purchase",
        });
      }

      return json({ status: "succeeded" });
    }

    if (ykPayment.status === "canceled") {
      await serviceClient.from("purchases").update({ status: "failed" }).eq("id", purchase_id);
      return json({ status: "failed" });
    }

    return json({ status: ykPayment.status ?? "pending" });

  } catch (e) {
    console.error("payment-check error:", String(e));
    return json({ error: String(e) }, 500);
  }
});
