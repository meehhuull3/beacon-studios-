import { createClient } from '@supabase/supabase-js';
import { 
  User, College, Cohort, Founder, Startup, Event, Task, 
  Document, Message, Conversation, Notification 
} from './types';

// Detect if real Supabase keys exist
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
const hasRealSupabase = supabaseUrl !== '' && supabaseAnonKey !== '';

export const supabase = hasRealSupabase 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==========================================
// SEED VALUES FOR LOCAL FALLBACK DATABASE
// ==========================================
const SEED_COLLEGES: College[] = [
  { id: '1', name: 'MIT Manipal', city: 'Manipal', state: 'Karnataka', status: 'Active', cohort_name: 'Summer 2025', core_team_lead: 'Rahul Kumar' },
  { id: '2', name: 'VJTI Mumbai', city: 'Mumbai', state: 'Maharashtra', status: 'Active', cohort_name: 'Summer 2025', core_team_lead: 'Priya Mehta' },
  { id: '3', name: 'RVCE Bangalore', city: 'Bengaluru', state: 'Karnataka', status: 'Active', cohort_name: 'Summer 2025', core_team_lead: 'Sneha Nair' },
  { id: '4', name: 'SRM Chennai', city: 'Chennai', state: 'Tamil Nadu', status: 'Active', cohort_name: 'Summer 2025', core_team_lead: 'Divya R.' },
  { id: '5', name: 'Thapar Patiala', city: 'Patiala', state: 'Punjab', status: 'Active', cohort_name: 'Summer 2025', core_team_lead: 'Aryan S.' },
  { id: '6', name: 'NIT Trichy', city: 'Trichy', state: 'Tamil Nadu', status: 'Onboarding', cohort_name: 'Summer 2025', core_team_lead: 'TBD' },
  { id: '7', name: 'IIT Bombay', city: 'Mumbai', state: 'Maharashtra', status: 'Active', cohort_name: 'Summer 2025', core_team_lead: 'Karan Johar' },
  { id: '8', name: 'BITS Pilani', city: 'Pilani', state: 'Rajasthan', status: 'Active', cohort_name: 'Summer 2025', core_team_lead: 'Nikhil Kamath' },
];

const SEED_USERS: User[] = [
  { id: 'u1', email: 'admin@beaconindica.com', name: 'Arjun Rao', initials: 'AR', role: 'Admin', portal: 'bi', college_id: null, username: 'admin', password: 'demo123' },
  { id: 'u2', email: 'associate@beaconindica.com', name: 'Sneha Verma', initials: 'SV', role: 'Associate', portal: 'bi', college_id: null, username: 'associate', password: 'demo123' },
  { id: 'u3', email: 'rahul@mitmanipaltbi.edu.in', name: 'Rahul Kumar', initials: 'RK', role: 'Core Team', portal: 'college', college_id: '1', username: 'rahul', password: 'demo123', core_team_role: 'President' },
  { id: 'u4', email: 'dr.sharma@vjti.ac.in', name: 'Dr. Priya Sharma', initials: 'PS', role: 'Faculty', portal: 'college', college_id: '2', username: 'priya', password: 'demo123' },
];

const SEED_COHORTS: Cohort[] = [
  { id: 'co1', college_id: '1', name: 'MIT Manipal — Summer 2025', stage: 'Prototype', start_date: '2025-04-10', total_weeks: 16, current_week: 9, progress_pct: 68, status: 'On track' },
  { id: 'co2', college_id: '2', name: 'VJTI Mumbai — Summer 2025', stage: 'Validation', start_date: '2025-05-01', total_weeks: 16, current_week: 6, progress_pct: 45, status: 'Needs check' },
  { id: 'co3', college_id: '3', name: 'RVCE Bangalore — Summer 2025', stage: 'Ideation', start_date: '2025-05-20', total_weeks: 16, current_week: 3, progress_pct: 22, status: 'On track' },
  { id: 'co4', college_id: '4', name: 'SRM Chennai — Summer 2025', stage: 'Prototype', start_date: '2025-04-05', total_weeks: 16, current_week: 10, progress_pct: 71, status: 'On track' },
];

const SEED_STARTUPS: Startup[] = [
  { id: 's1', college_id: '2', cohort_id: 'co2', name: 'AgriSense', domain: 'Agri-Tech', stage: 'Revenue', lead_founder: 'Aditya Verma', faculty_id: 'u4', last_updated: '2026-06-11T07:28:00Z' },
  { id: 's2', college_id: '4', cohort_id: 'co4', name: 'MediRoute', domain: 'Health-Tech', stage: 'MVP live', lead_founder: 'Meera Pillai', faculty_id: null, last_updated: '2026-06-11T05:12:00Z' },
  { id: 's3', college_id: '4', cohort_id: 'co4', name: 'CleanKart', domain: 'CleanTech', stage: 'Validating', lead_founder: 'Rohit Gupta', faculty_id: null, last_updated: '2026-06-11T02:30:00Z' },
  { id: 's4', college_id: '1', cohort_id: 'co1', name: 'EduLens', domain: 'Ed-Tech', stage: 'MVP live', lead_founder: 'Nisha Reddy', faculty_id: 'u4', last_updated: '2026-06-10T09:44:00Z' },
  { id: 's5', college_id: '1', cohort_id: 'co1', name: 'LogiFlow', domain: 'Logistics', stage: 'Validating', lead_founder: 'Kartik Mehta', faculty_id: null, last_updated: '2026-06-08T11:20:00Z' },
  { id: 's6', college_id: '3', cohort_id: 'co3', name: 'SafeNest', domain: 'PropTech', stage: 'Ideation', lead_founder: 'Saurabh Nair', faculty_id: null, last_updated: '2026-06-10T04:15:00Z' },
  { id: 's7', college_id: '1', cohort_id: 'co1', name: 'FoodSync', domain: 'FoodTech', stage: 'Ideation', lead_founder: 'Tanmay Sen', faculty_id: null, last_updated: '2026-06-05T09:00:00Z' },
  { id: 's8', college_id: '1', cohort_id: 'co1', name: 'GreenRoute', domain: 'CleanTech', stage: 'Ideation', lead_founder: 'Aisha Merchant', faculty_id: null, last_updated: '2026-06-09T18:00:00Z' },
];

const SEED_FOUNDERS: Founder[] = [
  { id: 'f1', cohort_id: 'co1', college_id: '1', name: 'Nisha Reddy', role: 'Team Lead', startup_id: 's4' },
  { id: 'f2', cohort_id: 'co1', college_id: '1', name: 'Kartik Mehta', role: 'Co-Founder', startup_id: 's4' },
  { id: 'f3', cohort_id: 'co2', college_id: '2', name: 'Aditya Verma', role: 'Team Lead', startup_id: 's1' },
  { id: 'f4', cohort_id: 'co4', college_id: '4', name: 'Meera Pillai', role: 'Co-Founder', startup_id: 's2' },
];

const SEED_EVENTS: Event[] = [
  { id: 'e1', college_id: '1', title: 'Demo Day — MIT Manipal', description: 'Prototype pitches to mentors and BI team.', event_date: '2026-06-14T10:00:00Z', type: 'Demo Day', is_past: false },
  { id: 'e2', college_id: null, title: 'Mentor Roundtable', description: 'All colleges · Online via Zoom meeting.', event_date: '2026-06-19T14:00:00Z', type: 'Roundtable', is_past: false },
  { id: 'e3', college_id: '3', title: 'Cohort Review — RVCE', description: 'In-person stage gate checkpoint assessment.', event_date: '2026-06-28T11:30:00Z', type: 'Review', is_past: false },
  { id: 'e4', college_id: '4', title: 'Validation Workshop', description: 'SRM Chennai customer research training.', event_date: '2026-07-03T09:00:00Z', type: 'Workshop', is_past: false },
];

const SEED_TASKS: Task[] = [
  { id: 't1', assigned_to_user_id: 'u1', assigned_to_college_id: null, text: 'Send MoU to RVCE core team', due_date: '2026-06-04T18:00:00Z', tag: 'MoU', done: true },
  { id: 't2', assigned_to_user_id: 'u1', assigned_to_college_id: null, text: 'Review Q2 cohort report — VJTI', due_date: '2026-06-15T18:00:00Z', tag: 'Report', done: false },
  { id: 't3', assigned_to_user_id: 'u1', assigned_to_college_id: null, text: 'Assign mentor to AgriSense', due_date: '2026-06-05T18:00:00Z', tag: 'VJTI', done: false },
  { id: 't4', assigned_to_user_id: 'u1', assigned_to_college_id: null, text: 'Upload pitch template to vault', due_date: '2026-06-15T18:00:00Z', tag: 'Docs', done: false },
  { id: 't5', assigned_to_user_id: null, assigned_to_college_id: '2', text: 'VJTI: Submit mid-cohort feedback form', due_date: '2026-06-09T18:00:00Z', tag: 'Report', done: false },
  { id: 't6', assigned_to_user_id: null, assigned_to_college_id: '3', text: 'RVCE: Finalize founder roster for cohort', due_date: '2026-06-03T18:00:00Z', tag: 'Roster', done: false },
  { id: 't7', assigned_to_user_id: null, assigned_to_college_id: '4', text: 'SRM: Upload 3 startup one-pagers', due_date: '2026-06-14T18:00:00Z', tag: 'Docs', done: false },
  { id: 't8', assigned_to_user_id: null, assigned_to_college_id: '1', text: 'MIT: Confirm Demo Day venue bookings', due_date: '2026-06-03T18:00:00Z', tag: 'Events', done: true },
];

const SEED_DOCUMENTS: Document[] = [
  { id: 'd1', college_id: '2', name: 'AgriSense — Pitch Deck v3', type: 'Deck', size: '2.4 MB', file_url: '#', uploaded_by: 'Priya M.', created_at: '2026-06-11T07:28:00Z' },
  { id: 'd2', college_id: '3', name: 'RVCE MoU — Summer 2025', type: 'MoU', size: '512 KB', file_url: '#', uploaded_by: 'BI Admin', created_at: '2026-06-01T10:00:00Z' },
  { id: 'd3', college_id: null, name: 'Cohort Progress Report — Q2', type: 'Report', size: '1.2 MB', file_url: '#', uploaded_by: 'BI Admin', created_at: '2026-05-30T14:00:00Z' },
  { id: 'd4', college_id: null, name: 'Pitch Template — Stage 2', type: 'Template', size: '3.1 MB', file_url: '#', uploaded_by: 'BI Admin', created_at: '2026-05-20T09:00:00Z' },
  { id: 'd5', college_id: null, name: 'Validation Playbook v2', type: 'Playbook', size: '4.5 MB', file_url: '#', uploaded_by: 'BI Partner', created_at: '2026-05-10T12:00:00Z' },
];

const SEED_CONVERSATIONS: Conversation[] = [
  { id: 'conv1', name: 'VJTI Core Team', type: 'college', college_id: '2' },
  { id: 'conv2', name: 'RVCE Core Team', type: 'college', college_id: '3' },
  { id: 'conv3', name: 'SRM Chennai Team', type: 'college', college_id: '4' },
  { id: 'conv4', name: 'MIT Manipal', type: 'college', college_id: '1' },
];

const SEED_MESSAGES: Message[] = [
  { id: 'm1', conversation_id: 'conv1', sender_id: 'u4', text: 'AgriSense just hit ₹2L from 3 pilot farms! Can we share the pilot agreement template with other colleges?' },
  { id: 'm2', conversation_id: 'conv1', sender_id: 'u1', text: 'Absolutely! Upload to the document vault and we\'ll share with all teams. Also — can you confirm BI attendance for Demo Day Jun 14?' },
  { id: 'm3', conversation_id: 'conv1', sender_id: 'u4', text: 'Yes! Uploading now. Headcount: we need 3 seats for BI at Demo Day.' },
  { id: 'm4', conversation_id: 'conv4', sender_id: 'u1', text: 'Hi! Can you confirm how many BI seats you need for Demo Day on Jun 14? Need headcount by Jun 10.' },
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'n1', user_id: 'u1', text: 'AgriSense posted a milestone — ₹2L revenue reached', read: false, created_at: '2026-06-11T07:28:00Z' },
  { id: 'n2', user_id: 'u1', text: 'RVCE Core Team added 4 new founders to cohort', read: false, created_at: '2026-06-11T04:00:00Z' },
  { id: 'n3', user_id: 'u1', text: 'Demo Day confirmed — MIT Manipal, Jun 14', read: false, created_at: '2026-06-10T18:00:00Z' },
];

// Helper to get from localstorage with fallback
function getLocal<T>(key: string, fallback: T): T {
  const data = localStorage.getItem(`beacon_${key}`);
  if (!data) {
    localStorage.setItem(`beacon_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(data) as T;
}

function saveLocal<T>(key: string, data: T): void {
  localStorage.setItem(`beacon_${key}`, JSON.stringify(data));
}

// Memory real-time subscriptions callback list
const messageListeners: { [conversation_id: string]: Array<(msg: Message) => void> } = {};

export const dbService = {
  // --- USERS ---
  getUsers: async (): Promise<User[]> => getLocal<User[]>('users', SEED_USERS),
  getUserByEmail: async (email: string): Promise<User | null> => {
    const list = await dbService.getUsers();
    return list.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase()) || null;
  },
  getUserByUsername: async (username: string): Promise<User | null> => {
    const list = await dbService.getUsers();
    return list.find(u => (u.username || '').trim().toLowerCase() === username.trim().toLowerCase()) || null;
  },
  getUserByEmailOrUsername: async (identifier: string): Promise<User | null> => {
    const list = await dbService.getUsers();
    const ident = identifier.trim().toLowerCase();
    return list.find(u => 
      u.email.trim().toLowerCase() === ident || 
      (u.username || '').trim().toLowerCase() === ident
    ) || null;
  },
  registerUser: async (user: Omit<User, 'id'>): Promise<User> => {
    const list = await dbService.getUsers();
    
    // Check if unique email
    const emailExists = list.some(u => u.email.trim().toLowerCase() === user.email.trim().toLowerCase());
    if (emailExists) {
      throw new Error('Email address is already registered on Beacon Indica.');
    }
    
    // Check if unique username
    if (user.username) {
      const usernameExists = list.some(u => (u.username || '').trim().toLowerCase() === user.username!.trim().toLowerCase());
      if (usernameExists) {
        throw new Error('Username is already taken. Please pick another unique brand username.');
      }
    }

    const newUser: User = {
      ...user,
      id: 'u_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };

    list.push(newUser);
    saveLocal('users', list);
    return newUser;
  },
  updateUserPassword: async (username: string, newPass: string): Promise<boolean> => {
    const list = await dbService.getUsers();
    const idx = list.findIndex(u => (u.username || '').trim().toLowerCase() === username.trim().toLowerCase());
    if (idx === -1) return false;
    list[idx] = {
      ...list[idx],
      password: newPass
    };
    saveLocal('users', list);
    return true;
  },
  
  // --- COLLEGES ---
  getColleges: async (): Promise<College[]> => getLocal<College[]>('colleges', SEED_COLLEGES),
  getCollegeById: async (id: string): Promise<College | null> => {
    const list = await dbService.getColleges();
    return list.find(c => c.id === id) || null;
  },
  addCollege: async (college: Omit<College, 'id'>): Promise<College> => {
    const list = await dbService.getColleges();
    const newCollege: College = {
      ...college,
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    list.push(newCollege);
    saveLocal('colleges', list);
    
    // Auto-create a conversation as well
    await dbService.getOrCreateCollegeConversation(newCollege.id, newCollege.name);
    
    // Auto-create notification for admin
    await dbService.addNotification(null, `New college registered: <b>${newCollege.name}</b> in ${newCollege.city}`);
    
    return newCollege;
  },

  // --- COHORTS ---
  getCohorts: async (): Promise<Cohort[]> => getLocal<Cohort[]>('cohorts', SEED_COHORTS),
  getCohortsByCollege: async (collegeId: string): Promise<Cohort[]> => {
    const list = await dbService.getCohorts();
    return list.filter(c => c.college_id === collegeId);
  },
  addCohort: async (cohort: Omit<Cohort, 'id'>): Promise<Cohort> => {
    const list = await dbService.getCohorts();
    const newCohort: Cohort = {
      ...cohort,
      id: 'co_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    list.push(newCohort);
    saveLocal('cohorts', list);
    
    // Auto create notification
    const college = await dbService.getCollegeById(cohort.college_id);
    await dbService.addNotification(null, `New cohort <b>${newCohort.name}</b> added for ${college?.name || 'College'}`);
    return newCohort;
  },

  // --- STARTUPS ---
  getStartups: async (): Promise<Startup[]> => getLocal<Startup[]>('startups', SEED_STARTUPS),
  getStartupsByCollege: async (collegeId: string): Promise<Startup[]> => {
    const list = await dbService.getStartups();
    return list.filter(s => s.college_id === collegeId);
  },
  getStartupsByCohort: async (cohortId: string): Promise<Startup[]> => {
    const list = await dbService.getStartups();
    return list.filter(s => s.cohort_id === cohortId);
  },
  addStartup: async (startup: Omit<Startup, 'id' | 'last_updated'>): Promise<Startup> => {
    const list = await dbService.getStartups();
    const newStartup: Startup = {
      ...startup,
      id: 's_' + Math.random().toString(36).substring(2, 9),
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    list.push(newStartup);
    saveLocal('startups', list);
    
    // Notification
    const college = await dbService.getCollegeById(startup.college_id);
    await dbService.addNotification(null, `New startup <b>${newStartup.name}</b> added to cohort at ${college?.name || 'Partner college'}`);
    return newStartup;
  },
  updateStartupStage: async (id: string, stage: Startup['stage']): Promise<Startup | null> => {
    const list = await dbService.getStartups();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      stage,
      last_updated: new Date().toISOString()
    };
    saveLocal('startups', list);
    return list[idx];
  },
  updateStartupFaculty: async (id: string, facultyId: string | null): Promise<Startup | null> => {
    const list = await dbService.getStartups();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      faculty_id: facultyId,
      last_updated: new Date().toISOString()
    };
    saveLocal('startups', list);
    return list[idx];
  },

  // --- FOUNDERS ---
  getFounders: async (): Promise<Founder[]> => getLocal<Founder[]>('founders', SEED_FOUNDERS),
  getFoundersByCohort: async (cohortId: string): Promise<Founder[]> => {
    const list = await dbService.getFounders();
    return list.filter(f => f.cohort_id === cohortId);
  },
  getFoundersByCollege: async (collegeId: string): Promise<Founder[]> => {
    const list = await dbService.getFounders();
    return list.filter(f => f.college_id === collegeId);
  },
  addFounder: async (founder: Omit<Founder, 'id'>): Promise<Founder> => {
    const list = await dbService.getFounders();
    const newFounder: Founder = {
      ...founder,
      id: 'f_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    list.push(newFounder);
    saveLocal('founders', list);
    return newFounder;
  },

  // --- EVENTS ---
  getEvents: async (): Promise<Event[]> => getLocal<Event[]>('events', SEED_EVENTS),
  getEventsByCollege: async (collegeId: string | null): Promise<Event[]> => {
    const list = await dbService.getEvents();
    if (collegeId === null) {
      return list;
    }
    return list.filter(e => e.college_id === null || e.college_id === collegeId);
  },
  addEvent: async (event: Omit<Event, 'id' | 'is_past'>): Promise<Event> => {
    const list = await dbService.getEvents();
    const newEvent: Event = {
      ...event,
      id: 'e_' + Math.random().toString(36).substring(2, 9),
      is_past: false,
      created_at: new Date().toISOString()
    };
    list.push(newEvent);
    saveLocal('events', list);
    
    // Notification creation
    await dbService.addNotification(null, `New event scheduled: <b>${newEvent.title}</b> (${newEvent.type})`);
    return newEvent;
  },
  markEventPast: async (id: string, isPast: boolean): Promise<Event | null> => {
    const list = await dbService.getEvents();
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], is_past: isPast };
    saveLocal('events', list);
    return list[idx];
  },
  deleteEvent: async (id: string): Promise<boolean> => {
    const list = await dbService.getEvents();
    const filtered = list.filter(e => e.id !== id);
    if (filtered.length === list.length) return false;
    saveLocal('events', filtered);
    return true;
  },

  // --- TASKS ---
  getTasks: async (): Promise<Task[]> => getLocal<Task[]>('tasks', SEED_TASKS),
  getTasksForUser: async (userId: string): Promise<Task[]> => {
    const list = await dbService.getTasks();
    return list.filter(t => t.assigned_to_user_id === userId);
  },
  getTasksForCollege: async (collegeId: string): Promise<Task[]> => {
    const list = await dbService.getTasks();
    return list.filter(t => t.assigned_to_college_id === collegeId);
  },
  addTask: async (task: Omit<Task, 'id' | 'done'>): Promise<Task> => {
    const list = await dbService.getTasks();
    const newTask: Task = {
      ...task,
      id: 't_' + Math.random().toString(36).substring(2, 9),
      done: false,
      created_at: new Date().toISOString()
    };
    list.push(newTask);
    saveLocal('tasks', list);
    
    // Notify
    if (task.assigned_to_college_id) {
      await dbService.addNotification(null, `Task assigned to college cohort: "<b>${newTask.text}</b>"`);
    } else if (task.assigned_to_user_id) {
      await dbService.addNotification(task.assigned_to_user_id, `New task assigned to you: "<b>${newTask.text}</b>"`);
    }
    
    return newTask;
  },
  toggleTaskDone: async (id: string, done: boolean): Promise<Task | null> => {
    const list = await dbService.getTasks();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], done };
    saveLocal('tasks', list);
    return list[idx];
  },

  // --- DOCUMENTS ---
  getDocuments: async (): Promise<Document[]> => getLocal<Document[]>('documents', SEED_DOCUMENTS),
  getDocumentsByCollege: async (collegeId: string | null): Promise<Document[]> => {
    const list = await dbService.getDocuments();
    if (collegeId === null) return list;
    return list.filter(d => d.college_id === null || d.college_id === collegeId);
  },
  addDocument: async (doc: Omit<Document, 'id'>): Promise<Document> => {
    const list = await dbService.getDocuments();
    const newDoc: Document = {
      ...doc,
      id: 'd_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    list.push(newDoc);
    saveLocal('documents', list);
    return newDoc;
  },

  // --- CONVERSATIONS & MESSAGES (REAL TIME EMULATION) ---
  getConversations: async (): Promise<Conversation[]> => getLocal<Conversation[]>('conversations', SEED_CONVERSATIONS),
  addTeamConversation: async (name: string, type: 'team' | 'college' | 'direct', collegeId: string | null, memberIds: string[]): Promise<Conversation> => {
    const list = await dbService.getConversations();
    const newConv: Conversation = {
      id: 'conv_' + Math.random().toString(36).substring(2, 9),
      name,
      type: type as any,
      college_id: collegeId,
      created_at: new Date().toISOString()
    };
    list.push(newConv);
    saveLocal('conversations', list);

    // Register membership ids so recipients can view their chats 
    const membersList = getLocal<{conversation_id: string, user_id: string}[]>('conversation_members', []);
    memberIds.forEach(uId => {
      membersList.push({ conversation_id: newConv.id, user_id: uId });
    });
    saveLocal('conversation_members', membersList);

    // Add general notification that a new team/channel has been initialized
    await dbService.addNotification(null, `New group conversation <b>"${name}"</b> has been formed`);

    return newConv;
  },
  getOrCreateCollegeConversation: async (collegeId: string, collegeName: string): Promise<Conversation> => {
    const list = await dbService.getConversations();
    let conv = list.find(c => c.college_id === collegeId);
    if (!conv) {
      conv = {
        id: 'conv_' + Math.random().toString(36).substring(2, 9),
        name: `${collegeName} Team`,
        type: 'college',
        college_id: collegeId,
        created_at: new Date().toISOString()
      };
      list.push(conv);
      saveLocal('conversations', list);
    }
    return conv;
  },
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const list = getLocal<Message[]>('messages', SEED_MESSAGES);
    return list.filter(m => m.conversation_id === conversationId);
  },
  sendMessage: async (conversationId: string, senderId: string, text: string): Promise<Message> => {
    const list = getLocal<Message[]>('messages', SEED_MESSAGES);
    const newMsg: Message = {
      id: 'm_' + Math.random().toString(36).substring(2, 9),
      conversation_id: conversationId,
      sender_id: senderId,
      text,
      created_at: new Date().toISOString()
    };
    list.push(newMsg);
    saveLocal('messages', list);
    
    // Trigger real-time callbacks
    if (messageListeners[conversationId]) {
      messageListeners[conversationId].forEach(listener => {
        try {
          listener(newMsg);
        } catch (e) {
          console.error("Error in real-time message listener", e);
        }
      });
    }
    
    return newMsg;
  },
  subscribeMessages: (conversationId: string, cb: (msg: Message) => void) => {
    if (!messageListeners[conversationId]) {
      messageListeners[conversationId] = [];
    }
    messageListeners[conversationId].push(cb);
    
    // Return unsubscribe method
    return () => {
      messageListeners[conversationId] = messageListeners[conversationId].filter(l => l !== cb);
    };
  },

  // --- NOTIFICATIONS ---
  getNotifications: async (userId: string | null): Promise<Notification[]> => {
    const list = getLocal<Notification[]>('notifications', SEED_NOTIFICATIONS);
    if (!userId) return list;
    return list.filter(n => n.user_id === null || n.user_id === userId);
  },
  addNotification: async (userId: string | null, text: string): Promise<Notification> => {
    const list = getLocal<Notification[]>('notifications', SEED_NOTIFICATIONS);
    const newNotif: Notification = {
      id: 'n_' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      text,
      read: false,
      created_at: new Date().toISOString()
    };
    list.unshift(newEventAndPush(newNotif));
    saveLocal('notifications', list);
    return newNotif;
  },
  markAllNotificationsRead: async (userId: string | null): Promise<void> => {
    const list = getLocal<Notification[]>('notifications', SEED_NOTIFICATIONS);
    const updated = list.map(n => {
      if (userId === null || n.user_id === userId || n.user_id === null) {
        return { ...n, read: true };
      }
      return n;
    });
    saveLocal('notifications', updated);
  }
};

// Internal helper for pushing notifications cleanly
function newEventAndPush(notif: Notification) {
  return notif;
}
