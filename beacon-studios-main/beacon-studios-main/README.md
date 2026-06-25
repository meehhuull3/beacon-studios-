# Beacon Studio Operating System

Beacon Studio is a private, role-based internal operating workspace designed as the operational engine supporting **Beacon Indica**—a premium venture studio operating across college incubators in India.

This workspace connects core administrative leads with college hubs, cohort startup portfolios, mentor networks, and legal document repositories.

---

## Technical Architecture

This application utilizes a robust dual-mode full-stack implementation architecture:

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + Lucide Icons + Recharts Analytics.
- **Dynamic Database Layer:** Integrated through standard PostgreSQL table structures with direct `Supabase` support.
- **Dual-Mode Sync Fallback:** When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided in your environment, the app connects directly to the Supabase Cloud. Otherwise, it transparently boots a high-fidelity client-side browser database (localStorage persistence) complete with automated SQL seed loading, real-time message event triggers, searchable lists, document blob generators, and interactive dashboards.

---

## Role-Based Credentials (OTP: 123456)

Access and operational scopes differ dynamically across roles:

| User Role | Email Node | Accessible Portal & View Scope |
| :--- | :--- | :--- |
| **BI Admin** | `admin@beaconindica.com` | Full BI headquarters overview (KPI analytics, all universities, broadcast alerts, global tasks, and documents) |
| **BI Associate** | `associate@beaconindica.com` | Operations executive view (no delete privileges) |
| **College Core Team** | `rahul@mitmanipaltbi.edu.in` | Dedicated college campus dashboard (founders list, startup statuses, and incoming advisory notifications) |
| **Faculty Advisor** | `dr.sharma@vjti.ac.in` | Read-only mentor hub (endorse individual pitches, student milestones, and schedule check-ins) |

*For demonstration, any work email credentials list will initiate email verification. Mock OTP code is **123456**.*

---

## Database Schemas & Seed Data

All table creation scripts, relational mappings, and demo listings are pre-seeded in the root `/schema.sql` file.

To configure your Supabase cloud backend database:
1. Navigate to your Supabase SQL Editor.
2. Content-copy the tables and mock seeds structured inside `/schema.sql`.
3. Paste the contents into the query box and click **Run**. This will build:
   - `users`, `colleges`, `cohorts`, `startups`, `founders`
   - `events`, `tasks`, `documents`, `messages`, `notifications`

---

## Getting Started

### Local Setup

To set up the application workspace on your local machine:

1. Clone or export the repository folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Configure optional Supabase environment variables under `.env` to hook real cloud clusters:
   ```env
   VITE_SUPABASE_URL="https://your-supabase-url.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-role-key"
   ```
5. Spin up development server:
   ```bash
   npm run dev
   ```

### Operational Workflows

1. **Dual Portal Styles:** When logging in as BI Executive, the sidebar is styled with a premium deep dark canvas. College user logins immediately shift to a clean, crisp light dashboard format.
2. **Interactive checklists:** Clicking checkboxes in Tasks checklist immediately records done state and updates dashboard stats graphs instantly.
3. **Downloadable documents:** Drag-and-drop or select any file in the Document page modal, select a file tag. It will immediately publish. Clicking "Download" retrieves the original binary file from the browser.
