import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Admin/faculty approves a signup request, granting the requested role
export const approveSignup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { request_id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // verify caller is admin
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");
    const isFaculty = (roles ?? []).some((r: any) => r.role === "faculty");
    if (!isAdmin && !isFaculty) throw new Error("Forbidden");

    const { data: req, error: reqErr } = await supabase
      .from("signup_requests").select("*").eq("id", data.request_id).single();
    if (reqErr || !req) throw new Error("Request not found");
    if (req.status !== "pending") throw new Error("Already reviewed");

    // Faculty can't approve admins
    if (req.requested_role === "admin" && !isAdmin) throw new Error("Only admin can approve admins");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Upsert profile
    await supabaseAdmin.from("profiles").upsert({
      id: req.user_id, email: req.email, full_name: req.full_name,
      phone: req.phone, college_id: req.college_id, position: req.position,
    });

    // Grant role
    const { error: rErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: req.user_id, role: req.requested_role,
      college_id: req.college_id, position: req.position,
    });
    if (rErr && !rErr.message.includes("duplicate")) throw rErr;

    await supabaseAdmin.from("signup_requests").update({
      status: "approved", reviewed_by: userId, reviewed_at: new Date().toISOString(),
    }).eq("id", data.request_id);

    return { ok: true };
  });

export const rejectSignup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { request_id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");
    const isFaculty = (roles ?? []).some((r: any) => r.role === "faculty");
    if (!isAdmin && !isFaculty) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("signup_requests").update({
      status: "rejected", reviewed_by: userId, reviewed_at: new Date().toISOString(),
    }).eq("id", data.request_id);
    return { ok: true };
  });
