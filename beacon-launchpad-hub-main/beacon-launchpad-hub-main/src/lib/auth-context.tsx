import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "faculty" | "core_team";

export interface RoleRow {
  role: AppRole;
  college_id: string | null;
  position: string | null;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  roles: AppRole[];
  collegeId: string | null;
  isAdmin: boolean;
  isFaculty: boolean;
  isCoreTeam: boolean;
  refreshRoles: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleRows, setRoleRows] = useState<RoleRow[]>([]);

  const loadRoles = async (uid: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role, college_id, position")
      .eq("user_id", uid);
    setRoleRows((data ?? []) as RoleRow[]);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => loadRoles(session.user.id), 0);
      } else {
        setRoleRows([]);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadRoles(data.session.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const roles = roleRows.map((r) => r.role);
  const value: AuthCtx = {
    user,
    loading,
    roles,
    collegeId: roleRows[0]?.college_id ?? null,
    isAdmin: roles.includes("admin"),
    isFaculty: roles.includes("faculty"),
    isCoreTeam: roles.includes("core_team"),
    refreshRoles: async () => {
      if (user) await loadRoles(user.id);
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
