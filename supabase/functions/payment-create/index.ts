import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    const { data: { user } } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader ?? "" } } }
    ).auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { scenario_id, return_url } = await req.json();
    if (!scenario_id || !return_url) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Получить цену из БД
    const { data: scenario, error: scenarioErr } = await supabase
      .from("scenarios")
      .select("price_rub, title")
      .eq("id", scenario_id)
      .single();

    if (scenarioErr || !scenario) {
      return new Response(JSON.stringify({ error: "Scenario not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceRub = scenario.price_rub ?? 250;

    // Создать запись purchase
    const { data: purchase, error: purchaseErr } = await supabase
      .from("purchases")
      .insert({
        user_id: user.id,
        scenario_id,
        amount_rub: priceRub,
        status: "pending",
      })
      .select("id")
      .single();

    if (purchaseErr || !purchase) {
      return new Response(JSON.stringify({ error: purchaseErr?.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shopId = Deno.env.get("YOOKASSA_SHOP_ID")!;
    const secretKey = Deno.env.get("YOOKASSA_SECRET_KEY")!;

    const ykResponse = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": purchase.id,
        "Authorization": "Basic " + btoa(`${shopId}:${secretKey}`),
      },
      body: JSON.stringify({
        amount: { value: priceRub.toFixed(2), currency: "RUB" },
        confirmation: {
          type: "redirect",
          return_url: `${return_url}?purchase_id=${purchase.id}`,
        },
        capture: true,
        description: scenario.title,
        metadata: { purchase_id: purchase.id, scenario_id },
      }),
    });

    const payment = await ykResponse.json();

    if (!ykResponse.ok) {
      return new Response(JSON.stringify({ error: payment.description ?? "YooKassa error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("purchases")
      .update({ payment_id: payment.id })
      .eq("id", purchase.id);

    return new Response(JSON.stringify({
      confirmation_url: payment.confirmation.confirmation_url,
      purchase_id: purchase.id,
      price_rub: priceRub,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
