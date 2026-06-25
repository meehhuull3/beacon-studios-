-- Beacon Studio Complete Database Schema & Seed Data
-- PostgreSQL Compatible / Supabase Setup

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Active', 'Onboarding', 'Inactive', 'Active')),
    cohort_name VARCHAR(100) NOT NULL,
    core_team_lead VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    initials VARCHAR(10) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Associate', 'Core Team', 'Faculty')),
    portal VARCHAR(50) NOT NULL CHECK (portal IN ('bi', 'college')),
    college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. COHORTS TABLE
CREATE TABLE IF NOT EXISTS cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    stage VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    total_weeks INTEGER NOT NULL DEFAULT 16,
    current_week INTEGER NOT NULL DEFAULT 1,
    progress_pct INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'On track',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. STARTUPS TABLE
CREATE TABLE IF NOT EXISTS startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    stage VARCHAR(50) NOT NULL,
    lead_founder VARCHAR(255) NOT NULL,
    faculty_id UUID REFERENCES users(id) ON DELETE SET NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. FOUNDERS TABLE
CREATE TABLE IF NOT EXISTS founders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(100) NOT NULL,
    is_past BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    text VARCHAR(500) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    tag VARCHAR(100) NOT NULL,
    done BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    size VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'college',
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. CONVERSATION_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS conversation_members (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

-- 11. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- SEED DATA
-- ==========================================

-- seed colleges
INSERT INTO colleges (id, name, city, state, status, cohort_name, core_team_lead) VALUES
('aa111111-1111-1111-1111-111111111111', 'MIT Manipal', 'Manipal', 'Karnataka', 'Active', 'Summer 2025', 'Rahul Kumar'),
('aa222222-2222-2222-2222-222222222222', 'VJTI Mumbai', 'Mumbai', 'Maharashtra', 'Active', 'Summer 2025', 'Priya Mehta'),
('aa333333-3333-3333-3333-333333333333', 'RVCE Bangalore', 'Bengaluru', 'Karnataka', 'Active', 'Summer 2025', 'Sneha Nair'),
('aa444444-4444-4444-4444-444444444444', 'SRM Chennai', 'Chennai', 'Tamil Nadu', 'Active', 'Summer 2025', 'Divya R.'),
('aa555555-5555-5555-5555-555555555555', 'Thapar Patiala', 'Patiala', 'Punjab', 'Active', 'Summer 2025', 'Aryan S.'),
('aa666666-6666-6666-6666-666666666666', 'NIT Trichy', 'Trichy', 'Tamil Nadu', 'Onboarding', 'Summer 2025', 'TBD'),
('aa777777-7777-7777-7777-777777777777', 'IIT Bombay', 'Mumbai', 'Maharashtra', 'Active', 'Summer 2025', 'Karan Johar'),
('aa888888-8888-8888-8888-888888888888', 'BITS Pilani', 'Pilani', 'Rajasthan', 'Active', 'Summer 2025', 'Nikhil Kamath');

-- seed users
INSERT INTO users (id, email, name, initials, role, portal, college_id) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@beaconindica.com', 'Arjun Rao', 'AR', 'Admin', 'bi', NULL),
('22222222-2222-2222-2222-222222222222', 'associate@beaconindica.com', 'Sneha Verma', 'SV', 'Associate', 'bi', NULL),
('33333333-3333-3333-3333-333333333333', 'rahul@mitmanipaltbi.edu.in', 'Rahul Kumar', 'RK', 'Core Team', 'college', 'aa111111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444444', 'dr.sharma@vjti.ac.in', 'Dr. Priya Sharma', 'PS', 'Faculty', 'college', 'aa222222-2222-2222-2222-222222222222');

-- seed cohorts
INSERT INTO cohorts (id, college_id, name, stage, start_date, total_weeks, current_week, progress_pct, status) VALUES
('c1111111-1111-1111-1111-111111111111', 'aa111111-1111-1111-1111-111111111111', 'MIT Manipal - Summer 2025', 'Prototype', '2025-04-10', 16, 9, 68, 'On track'),
('c2222222-2222-2222-2222-222222222222', 'aa222222-2222-2222-2222-222222222222', 'VJTI Mumbai - Summer 2025', 'Validation', '2025-05-01', 16, 6, 45, 'Needs check'),
('c3333333-3333-3333-3333-333333333333', 'aa333333-3333-3333-3333-333333333333', 'RVCE Bangalore - Summer 2025', 'Ideation', '2025-05-20', 16, 3, 22, 'On track'),
('c4444444-4444-4444-4444-444444444444', 'aa444444-4444-4444-4444-444444444444', 'SRM Chennai - Summer 2025', 'Prototype', '2025-04-05', 16, 10, 71, 'On track');

-- seed startups
INSERT INTO startups (id, college_id, cohort_id, name, domain, stage, lead_founder, faculty_id) VALUES
('s1111111-1111-1111-1111-111111111111', 'aa222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'AgriSense', 'Agri-Tech', 'Revenue', 'Aditya Verma', '44444444-4444-4444-4444-444444444444'),
('s2222222-2222-2222-2222-222222222222', 'aa444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'MediRoute', 'Health-Tech', 'MVP live', 'Meera Pillai', NULL),
('s3333333-3333-3333-3333-333333333333', 'aa444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'CleanKart', 'CleanTech', 'Validating', 'Rohit Gupta', NULL),
('s4444444-4444-4444-4444-444444444444', 'aa111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'EduLens', 'Ed-Tech', 'MVP live', 'Nisha Reddy', NULL),
('s5555555-5555-5555-5555-555555555555', 'aa111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'LogiFlow', 'Logistics', 'Validating', 'Kartik Mehta', NULL),
('s6666666-6666-6666-6666-666666666666', 'aa333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'SafeNest', 'PropTech', 'Ideation', 'Saurabh Nair', NULL),
('s7777777-7777-7777-7777-777777777777', 'aa111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'FoodSync', 'FoodTech', 'Ideation', 'Tanmay Sen', NULL),
('s8888888-8888-8888-8888-888888888888', 'aa111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'GreenRoute', 'CleanTech', 'Ideation', 'Aisha Merchant', NULL);

-- seed founders
INSERT INTO founders (cohort_id, college_id, name, role, startup_id) VALUES
('c1111111-1111-1111-1111-111111111111', 'aa111111-1111-1111-1111-111111111111', 'Nisha Reddy', 'Team Lead', 's4444444-4444-4444-4444-444444444444'),
('c1111111-1111-1111-1111-111111111111', 'aa111111-1111-1111-1111-111111111111', 'Kartik Mehta', 'Co-Founder', 's4444444-4444-4444-4444-444444444444'),
('c2222222-2222-2222-2222-222222222222', 'aa222222-2222-2222-2222-222222222222', 'Aditya Verma', 'Team Lead', 's1111111-1111-1111-1111-111111111111'),
('c4444444-4444-4444-4444-444444444444', 'aa444444-4444-4444-4444-444444444444', 'Meera Pillai', 'Co-Founder', 's2222222-2222-2222-2222-222222222222');

-- seed events
INSERT INTO events (id, college_id, title, description, event_date, type, is_past) VALUES
('e1111111-1111-1111-1111-111111111111', 'aa111111-1111-1111-1111-111111111111', 'Demo Day — MIT Manipal', 'Prototype pitches to mentors and BI team.', '2026-06-14 10:00:00+00', 'Demo Day', false),
('e2222222-2222-2222-2222-222222222222', NULL, 'Mentor Roundtable', 'All colleges · Online via Zoom meeting.', '2026-06-19 14:00:00+00', 'Roundtable', false),
('e3333333-3333-3333-3333-333333333333', 'aa333333-3333-3333-3333-333333333333', 'Cohort Review — RVCE', 'In-person stage gate checkpoint assessment.', '2026-06-28 11:30:00+00', 'Review', false),
('e4444444-4444-4444-4444-444444444444', 'aa444444-4444-4444-4444-444444444444', 'Validation Workshop', 'SRM Chennai customer research training.', '2026-07-03 09:00:00+00', 'Workshop', false);

-- seed tasks
INSERT INTO tasks (id, assigned_to_user_id, assigned_to_college_id, text, due_date, tag, done) VALUES
('t1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NULL, 'Send MoU to RVCE core team', '2026-06-04 18:00:00+00', 'MoU', true),
('t2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NULL, 'Review Q2 cohort report — VJTI', '2026-06-10 18:00:00+00', 'Report', false),
('t3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NULL, 'Assign mentor to AgriSense', '2026-06-05 18:00:00+00', 'VJTI', false),
('t4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NULL, 'Upload pitch template to vault', '2026-06-15 18:00:00+00', 'Docs', false),
('t5555555-5555-5555-5555-555555555555', NULL, 'aa222222-2222-2222-2222-222222222222', 'VJTI: Submit mid-cohort feedback form', '2026-06-09 18:00:00+00', 'Report', false),
('t6666666-6666-6666-6666-666666666666', NULL, 'aa333333-3333-3333-3333-333333333333', 'RVCE: Finalize founder roster for cohort', '2026-06-03 18:00:00+00', 'Roster', false),
('t7777777-7777-7777-7777-777777777777', NULL, 'aa444444-4444-4444-4444-444444444444', 'SRM: Upload 3 startup one-pagers', '2026-06-14 18:00:00+00', 'Docs', false),
('t8888888-8888-8888-8888-888888888888', NULL, 'aa111111-1111-1111-1111-111111111111', 'MIT: Confirm Demo Day venue bookings', '2026-06-03 18:00:00+00', 'Events', true);

-- seed documents
INSERT INTO documents (id, college_id, name, type, size, file_url, uploaded_by) VALUES
('d1111111-1111-1111-1111-111111111111', 'aa222222-2222-2222-2222-222222222222', 'AgriSense — Pitch Deck v3', 'Deck', '2.4 MB', '#', 'Priya M.'),
('d2222222-2222-2222-2222-222222222222', 'aa333333-3333-3333-3333-333333333333', 'RVCE MoU — Summer 2025', 'MoU', '512 KB', '#', 'BI Admin'),
('d3333333-3333-3333-3333-333333333333', NULL, 'Cohort Progress Report — Q2', 'Report', '1.2 MB', '#', 'BI Admin'),
('d4444444-4444-4444-4444-444444444444', NULL, 'Pitch Template — Stage 2', 'Template', '3.1 MB', '#', 'BI Admin'),
('d5555555-5555-5555-5555-555555555555', NULL, 'Validation Playbook v2', 'Playbook', '4.5 MB', '#', 'BI Partner');

-- seed conversations
INSERT INTO conversations (id, name, type, college_id) VALUES
('fb111111-1111-1111-1111-111111111111', 'VJTI Core Team', 'college', 'aa222222-2222-2222-2222-222222222222'),
('fb222222-2222-2222-2222-222222222222', 'RVCE Core Team', 'college', 'aa333333-3333-3333-3333-333333333333'),
('fb333333-3333-3333-3333-333333333333', 'SRM Chennai Team', 'college', 'aa444444-4444-4444-4444-444444444444'),
('fb444444-4444-4444-4444-444444444444', 'MIT Manipal', 'college', 'aa111111-1111-1111-1111-111111111111');

-- seed messages
INSERT INTO messages (conversation_id, sender_id, text) VALUES
('fb111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'AgriSense just hit ₹2L from 3 pilot farms! Can we share the pilot agreement template with other colleges?'),
('fb111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Absolutely! Upload to the document vault and we''ll share with all teams. Also — can you confirm BI attendance for Demo Day Jun 14?'),
('fb111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Yes! Uploading now. Headcount: we need 3 seats for BI at Demo Day.'),
('fb444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Hi! Can you confirm how many BI seats you need for Demo Day on Jun 14? Need headcount by Jun 10.');

-- seed notifications
INSERT INTO notifications (id, user_id, text, read) VALUES
('n1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'AgriSense posted a milestone — ₹2L revenue reached', false),
('n2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'RVCE Core Team added 4 new founders to cohort', false),
('n3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Demo Day confirmed — MIT Manipal, Jun 14', false);
