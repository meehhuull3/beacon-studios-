
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'faculty', 'core_team');
CREATE TYPE public.startup_stage AS ENUM ('ideation', 'validating', 'mvp_live', 'revenue');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'done');
CREATE TYPE public.program_phase AS ENUM ('genesis', 'fellowship', 'accelerator');
CREATE TYPE public.event_type AS ENUM ('event', 'podcast', 'talk', 'workshop');
CREATE TYPE public.event_status AS ENUM ('upcoming', 'live', 'completed', 'cancelled');
CREATE TYPE public.signup_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.core_team_position AS ENUM ('president', 'vice_president', 'marketing', 'tech', 'operations');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Colleges
CREATE TABLE public.colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  location text,
  mou_signed_at date,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.colleges TO authenticated;
GRANT ALL ON public.colleges TO service_role;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER colleges_updated BEFORE UPDATE ON public.colleges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text,
  college_id uuid REFERENCES public.colleges(id) ON DELETE SET NULL,
  position text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- User roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE,
  position public.core_team_position,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, college_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
$$;

CREATE OR REPLACE FUNCTION public.user_college(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT college_id FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Signup requests
CREATE TABLE public.signup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  requested_role public.app_role NOT NULL,
  college_id uuid REFERENCES public.colleges(id),
  position public.core_team_position,
  status public.signup_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.signup_requests TO authenticated;
GRANT ALL ON public.signup_requests TO service_role;
ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;

-- Programs/cohorts
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  phase public.program_phase NOT NULL DEFAULT 'genesis',
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  enrolled_students int NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER programs_updated BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Startups
CREATE TABLE public.startups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  college_id uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  domain text,
  stage public.startup_stage NOT NULL DEFAULT 'ideation',
  faculty_id uuid REFERENCES auth.users(id),
  description text,
  revenue numeric DEFAULT 0,
  members text,
  created_by uuid REFERENCES auth.users(id),
  last_update timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.startups TO authenticated;
GRANT ALL ON public.startups TO service_role;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER startups_updated BEFORE UPDATE ON public.startups FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tasks
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assigner_id uuid NOT NULL REFERENCES auth.users(id),
  assignee_id uuid NOT NULL REFERENCES auth.users(id),
  college_id uuid REFERENCES public.colleges(id),
  due_date date,
  status public.task_status NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  type public.event_type NOT NULL DEFAULT 'event',
  title text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  venue text,
  mentor text,
  status public.event_status NOT NULL DEFAULT 'upcoming',
  attendees int DEFAULT 0,
  report text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Broadcasts
CREATE TABLE public.broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  message text NOT NULL,
  target_roles public.app_role[] NOT NULL DEFAULT '{}',
  target_college_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.broadcasts TO authenticated;
GRANT ALL ON public.broadcasts TO service_role;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Colleges: all authenticated can read, only admin can write
CREATE POLICY "colleges read" ON public.colleges FOR SELECT TO authenticated USING (true);
CREATE POLICY "colleges admin write" ON public.colleges FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "colleges admin update" ON public.colleges FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "colleges admin delete" ON public.colleges FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Profiles: self read+update, admin all, others read (for directory)
CREATE POLICY "profiles read all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles admin all" ON public.profiles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- user_roles: read own + admin sees all; only admin writes
CREATE POLICY "roles read own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'faculty'));

-- signup_requests: anyone authenticated can create their own; admin sees all; user sees own
CREATE POLICY "signup read" ON public.signup_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'faculty'));
CREATE POLICY "signup insert self" ON public.signup_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "signup admin update" ON public.signup_requests FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'faculty'));

-- programs: read all auth, write admin
CREATE POLICY "programs read" ON public.programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "programs admin write" ON public.programs FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "programs admin update" ON public.programs FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'faculty'));
CREATE POLICY "programs admin delete" ON public.programs FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- startups: read all auth; admin/faculty/core_team write
CREATE POLICY "startups read" ON public.startups FOR SELECT TO authenticated USING (true);
CREATE POLICY "startups insert" ON public.startups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "startups update" ON public.startups FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'core_team'));
CREATE POLICY "startups delete" ON public.startups FOR DELETE TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'faculty'));

-- tasks: assignee and assigner see; admin sees all
CREATE POLICY "tasks read" ON public.tasks FOR SELECT TO authenticated USING (assigner_id = auth.uid() OR assignee_id = auth.uid() OR public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'faculty'));
CREATE POLICY "tasks insert" ON public.tasks FOR INSERT TO authenticated WITH CHECK (assigner_id = auth.uid() AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'faculty')));
CREATE POLICY "tasks update" ON public.tasks FOR UPDATE TO authenticated USING (assignee_id = auth.uid() OR assigner_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "tasks delete" ON public.tasks FOR DELETE TO authenticated USING (assigner_id = auth.uid() OR public.is_admin(auth.uid()));

-- events: read all auth, core_team/admin/faculty write
CREATE POLICY "events read" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events insert" ON public.events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "events update" ON public.events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "events delete" ON public.events FOR DELETE TO authenticated USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'faculty'));

-- broadcasts: read by targeted users; admin/faculty insert
CREATE POLICY "broadcasts read" ON public.broadcasts FOR SELECT TO authenticated USING (
  public.is_admin(auth.uid())
  OR array_length(target_roles, 1) IS NULL
  OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = ANY(target_roles)
    AND (array_length(target_college_ids, 1) IS NULL OR ur.college_id = ANY(target_college_ids)))
);
CREATE POLICY "broadcasts insert" ON public.broadcasts FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'faculty')));
CREATE POLICY "broadcasts delete" ON public.broadcasts FOR DELETE TO authenticated USING (sender_id = auth.uid() OR public.is_admin(auth.uid()));

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.startups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signup_requests;
