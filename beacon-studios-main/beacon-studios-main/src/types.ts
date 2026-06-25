export type UserRole = 'Admin' | 'Associate' | 'Core Team' | 'Faculty';
export type PortalType = 'bi' | 'college';

export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: UserRole;
  portal: PortalType;
  college_id: string | null;
  created_at?: string;
  username?: string;
  password?: string;
  core_team_role?: string;
}

export interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  status: 'Active' | 'Onboarding' | 'Inactive';
  cohort_name: string;
  core_team_lead: string;
  created_at?: string;
}

export interface Cohort {
  id: string;
  college_id: string;
  name: string;
  stage: 'Ideation' | 'Validation' | 'Prototype' | 'Validating' | 'Scaling';
  start_date: string;
  total_weeks: number;
  current_week: number;
  progress_pct: number;
  status: 'On track' | 'Needs check' | 'Just started' | 'Completed';
  created_at?: string;
}

export interface Founder {
  id: string;
  cohort_id: string;
  college_id: string;
  name: string;
  role: string; // e.g. Team Lead, Co-founder
  startup_id: string;
  created_at?: string;
}

export interface Startup {
  id: string;
  college_id: string;
  cohort_id: string;
  name: string;
  domain: string;
  stage: 'Ideation' | 'Validation' | 'Prototype' | 'Validating' | 'Scaling' | 'Revenue' | 'MVP live' | 'Onboarding';
  lead_founder: string;
  faculty_id: string | null;
  last_updated: string;
  created_at?: string;
}

export interface Event {
  id: string;
  college_id: string | null; // null for Global / BI Events, otherwise specific college
  title: string;
  description: string;
  event_date: string;
  type: string; // e.g. 'Demo Day', 'Workshop', 'Review', 'Roundtable'
  is_past: boolean;
  created_at?: string;
}

export interface Task {
  id: string;
  assigned_to_user_id: string | null;
  assigned_to_college_id: string | null;
  text: string;
  due_date: string;
  tag: string; // e.g. 'VJTI', 'Events', 'Docs', 'Report'
  done: boolean;
  created_at?: string;
}

export interface Document {
  id: string;
  college_id: string | null;
  name: string;
  type: 'Template' | 'MoU' | 'Deck' | 'Report' | 'Playbook';
  size: string; // e.g., '14 KB', '2.1 MB'
  file_url: string;
  uploaded_by: string; // user name or email
  created_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at?: string;
}

export interface Conversation {
  id: string;
  name: string;
  type: 'college' | 'direct' | 'global' | 'team';
  college_id: string | null;
  created_at?: string;
}

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
}

export interface Notification {
  id: string;
  user_id: string | null; // null means broadcast to everyone
  text: string;
  read: boolean;
  created_at?: string;
}
