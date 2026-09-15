import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: { rpc: (fn: string, args: unknown) => Promise<{ data: unknown }> }, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (data !== true) throw new Error("Forbidden");
}

/** Admin-only: store the Paystack secret key where the browser can never read it. */
export const savePaystackSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ secretKey: z.string().trim().max(300) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const secret = data.secretKey.trim();
    const { error } = await supabaseAdmin
      .from("payment_secrets")
      .upsert({ id: 1, paystack_secret_key: secret, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);

    const { error: flagError } = await supabaseAdmin
      .from("site_settings")
      .update({ paystack_secret_set: secret.length > 0 })
      .eq("id", 1);
    if (flagError) throw new Error(flagError.message);

    return { ok: true, secretSet: secret.length > 0 };
  });

/** Starts a Paystack checkout. Returns a clear not-configured state when keys are missing. */
export const startPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ enrollmentId: z.string().uuid(), callbackUrl: z.string().url() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: secretRow } = await supabaseAdmin
      .from("payment_secrets")
      .select("paystack_secret_key")
      .eq("id", 1)
      .maybeSingle();
    const secretKey = secretRow?.paystack_secret_key?.trim() ?? "";

    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("paystack_public_key")
      .eq("id", 1)
      .maybeSingle();

    if (!secretKey || !settings?.paystack_public_key?.trim()) {
      return { configured: false as const };
    }

    const { data: enrollment, error } = await context.supabase
      .from("enrollments")
      .select("id, user_id, course_id, courses(title, price_ngn)")
      .eq("id", data.enrollmentId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!enrollment || enrollment.user_id !== context.userId) throw new Error("Enrollment not found");

    const course = enrollment.courses as unknown as { title: string; price_ngn: number } | null;
    const amount = Math.round(Number(course?.price_ngn ?? 0) * 100);
    const reference = `ESO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: context.claims?.email ?? "",
        amount,
        currency: "NGN",
        reference,
        callback_url: data.callbackUrl,
        metadata: { enrollment_id: enrollment.id, course: course?.title ?? "" },
      }),
    });

    const payload = (await response.json()) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url?: string };
    };

    if (!response.ok || !payload.status || !payload.data?.authorization_url) {
      return { configured: true as const, ok: false as const, error: payload.message ?? "Paystack rejected the request" };
    }

    await supabaseAdmin.from("payments").insert({
      user_id: context.userId,
      course_id: enrollment.course_id,
      enrollment_id: enrollment.id,
      amount_ngn: Number(course?.price_ngn ?? 0),
      status: "pending",
      reference,
      provider: "paystack",
    });

    return { configured: true as const, ok: true as const, authorizationUrl: payload.data.authorization_url };
  });

/** Confirms a Paystack transaction after the buyer returns from checkout. */
export const verifyPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ reference: z.string().min(4).max(120) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: secretRow } = await supabaseAdmin
      .from("payment_secrets")
      .select("paystack_secret_key")
      .eq("id", 1)
      .maybeSingle();
    const secretKey = secretRow?.paystack_secret_key?.trim() ?? "";
    if (!secretKey) return { configured: false as const };

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("id, user_id, enrollment_id")
      .eq("reference", data.reference)
      .maybeSingle();
    if (!payment || payment.user_id !== context.userId) throw new Error("Transaction not found");

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    const payload = (await response.json()) as { status?: boolean; data?: { status?: string } };
    const paystackStatus = payload.data?.status;
    const status = paystackStatus === "success" ? "successful" : paystackStatus === "failed" ? "failed" : "pending";

    await supabaseAdmin.from("payments").update({ status }).eq("id", payment.id);
    if (status === "successful" && payment.enrollment_id) {
      await supabaseAdmin.from("enrollments").update({ status: "active" }).eq("id", payment.enrollment_id);
    }

    return { configured: true as const, status };
  });

/**
 * One-time bootstrap: the first signed-in user can claim admin access while no
 * admin exists yet. Once an admin exists this always refuses.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    if ((count ?? 0) > 0) return { ok: false as const, reason: "An administrator already exists." };

    const { error: insertError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (insertError) throw new Error(insertError.message);
    return { ok: true as const };
  });
