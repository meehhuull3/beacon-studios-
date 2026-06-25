import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapAdmin } from "@/lib/bootstrap.functions";
import { useAuth } from "@/lib/auth-context";
import { BeaconLogo } from "@/components/beacon-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Beacon Studios" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const bootstrap = useServerFn(bootstrapAdmin);
  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    bootstrap({}).catch(() => {});
    supabase.from("colleges").select("id, name").order("name").then(({ data }) => {
      setColleges(data ?? []);
    });
  }, []);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/10 via-background to-background border-r">
        <BeaconLogo />
        <div className="space-y-6">
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight">
            Run the venture<br />pipeline,<br />end to end.
          </h1>
          <p className="text-muted-foreground max-w-md">
            Beacon Studios is the internal operations platform for Beacon Indica — coordinate
            admins, faculty and college core teams across every cohort, startup and event.
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-md pt-4">
            {[
              { k: "Phase 1", v: "Genesis" },
              { k: "Phase 2", v: "Fellowship" },
              { k: "Phase 3", v: "Accelerator" },
            ].map((p) => (
              <div key={p.k} className="rounded-lg border bg-card p-3">
                <div className="text-[10px] tracking-widest text-primary font-semibold">{p.k}</div>
                <div className="text-sm font-semibold mt-1">{p.v}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© Beacon Indica · Internal use only</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><BeaconLogo /></div>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Request access</TabsTrigger>
            </TabsList>
            <TabsContent value="signin"><SignInForm /></TabsContent>
            <TabsContent value="signup"><SignUpForm colleges={colleges} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("mukulggn1@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Signed in");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-6">
      <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
      <p className="text-sm text-muted-foreground -mt-2">Sign in to your Beacon Studios account.</p>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      <p className="text-xs text-muted-foreground text-center">
        Need access? Use <strong>Request access</strong> — an admin will approve your role.
      </p>
    </form>
  );
}

function SignUpForm({ colleges }: { colleges: { id: string; name: string }[] }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "core_team" as "faculty" | "core_team" | "admin",
    college_id: "",
    position: "tech" as string,
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    });
    if (error) { setLoading(false); toast.error(error.message); return; }
    const userId = data.user?.id;
    if (userId) {
      await supabase.from("signup_requests").insert({
        user_id: userId,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        requested_role: form.role,
        college_id: form.role === "admin" ? null : form.college_id || null,
        position: form.role === "core_team" ? (form.position as "tech") : null,
      });
    }
    setLoading(false);
    toast.success("Request submitted! An admin will approve your account shortly.");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 mt-6">
      <h2 className="text-2xl font-semibold tracking-tight">Request access</h2>
      <p className="text-sm text-muted-foreground -mt-1">Fill the form. Admin approves before you can sign in.</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></div>
        <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      </div>
      <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
      <div className="space-y-1.5"><Label>Password</Label><Input type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as typeof form.role })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="core_team">Core Team</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>College</Label>
          <Select value={form.college_id} onValueChange={(v) => setForm({ ...form, college_id: v })} disabled={form.role === "admin"}>
            <SelectTrigger><SelectValue placeholder={form.role === "admin" ? "N/A" : "Select"} /></SelectTrigger>
            <SelectContent>
              {colleges.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {form.role === "core_team" && (
        <div className="space-y-1.5">
          <Label>Position</Label>
          <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="president">President</SelectItem>
              <SelectItem value="vice_president">Vice President</SelectItem>
              <SelectItem value="marketing">Marketing & Growth</SelectItem>
              <SelectItem value="tech">Tech</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Submitting…" : "Submit request"}</Button>
    </form>
  );
}
