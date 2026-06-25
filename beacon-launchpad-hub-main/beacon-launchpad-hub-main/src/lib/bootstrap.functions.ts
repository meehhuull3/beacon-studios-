import { createServerFn } from "@tanstack/react-start";

// Creates the seed admin user (mukulggn1@gmail.com) if no admin exists yet.
// Idempotent + safe: bails out if any admin already present.
export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Already an admin? skip
  const { data: existing } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("role", "admin")
    .limit(1);
  if (existing && existing.length > 0) return { ok: true, created: false };

  const email = "mukulggn1@gmail.com";
  const password = "mukul@@00";

  // Create or find user
  let userId: string | undefined;
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Mukul (Founder)" },
  });
  if (createErr && !createErr.message.toLowerCase().includes("already")) {
    throw createErr;
  }
  userId = created?.user?.id;
  if (!userId) {
    // find existing
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    userId = list.users.find((u) => u.email === email)?.id;
  }
  if (!userId) throw new Error("Could not provision admin user");

  // Ensure profile
  await supabaseAdmin.from("profiles").upsert({
    id: userId,
    email,
    full_name: "Mukul (Founder)",
  });

  // Grant admin role
  await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });

  return { ok: true, created: true };
});
