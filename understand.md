# Understanding BDIE (Behavioral Drift Intelligence Engine)

This document provides a comprehensive overview of how the BDIE platform works, its core architecture, and how its technology stacks are implemented and utilized across the project.

---

## 🏗️ 1. High-Level Architecture

BDIE is built entirely on the **Next.js 15 (App Router)** framework, functioning as a full-stack application.

- **Frontend (Client UI)**: Rich, highly interactive dashboard utilizing React 19, custom WebGL components, and advanced animation libraries. It communicates with the backend via internal API routes.
- **Backend (API Layer)**: Serverless Next.js API Routes (`app/api/*`) handles business logic, authentication, and database interactions.
- **Database Layer**: Dual-mode storage. By default, it operates using a local JSON file (`data.json` via `lib/jsonDb.ts`) for easy development/prototyping, but it seamlessly scales to **MongoDB** (via `mongoose` and `lib/db.ts`) for production deployments if a `MONGODB_URI` environment variable is provided.
- **Core Intelligence Logic**: Pure TypeScript modules housed in the `lib/` directory act as independent engines (Risk Engine, Simulation Engine) decoupled from Next.js specifics, making them testable and scalable.

---

## 🛠️ 2. Tech Stack Implementation & Usage

### Next.js 15 & React 19 (Core Framework)
- **Where**: The `app/` directory.
- **How**: Utilizes the modern App Router architecture with Server Components for fast initial loads and Client Components (`"use client"`) where interactivity is needed. The `(dashboard)` route group ensures all main application pages share a common layout and authentication state, while `/login` and `/register` sit outside the protected scope.

### TypeScript 5.9 (Language)
- **Where**: Everywhere (`.ts` and `.tsx` files).
- **How**: Ensures end-to-end type safety. Types and interfaces definitions (like `User`, `RiskScore`, `AuditEvent`) are centralized in `lib/types.ts` and mapped cleanly to database schemas in the `models/` directory.

### UI & Styling (Tailwind CSS v4 + Lucide React)
- **Where**: `components/ui/`, `app/globals.css`, and throughout the DOM.
- **How**: Tailwind is used extensively for utility-first styling, responsive design, and rapid prototyping. **Lucide React** provides a consistent, clean SVG icon system used in the sidebar, tables, and top navigation.

### State Management (Zustand 5)
- **Where**: `store/useAppStore.ts`.
- **How**: Used as a fast, boilerplate-free global state container. It manages UI states that need to be accessed globally across disjointed components, such as opening side panels, storing live alerts, caching the current user session, and handling "System Health" toggles in the settings page.

### 3D Graphics & Visualizations (Three.js + React Three Fiber/Drei)
- **Where**: `components/three/` (e.g., the Digital Twin visualization).
- **How**: Renders a dynamic WebGL canvas that morphs or changes color based on the real-time "Risk Score" of a user. The `@react-three/fiber` library maps React components to Three.js elements, and `drei` provides helpful abstractions like controls and cameras.

### Animations (AnimeJS + Framer Motion)
- **Where**: Loading screens (`components/ui/LoadingScreen`), page transitions, and the custom cursor (`components/ui/CustomCursor`).
- **How**: **AnimeJS** handles complex timeline-based cinematic animations (like the startup sequence and equalizer bars), while **Framer Motion (`motion`)** handles fluid layout transitions, spring-physics interactions, and hover micro-animations throughout the dashboard.

### Data Visualization (Recharts 3)
- **Where**: `components/dashboard/` (Predictive Risk Graph).
- **How**: Renders the historical activity versus the machine-learning predicted future risk forecast. It utilizes Recharts for its declarative, React-friendly API to draw dynamic SVGs, line charts, and confidence intervals.

### Security & Authentication (JWT + Bcrypt + Middleware)
- **Where**: `middleware.ts`, `lib/auth.ts`, `lib/jwt.ts`, `app/api/auth/`.
- **How**: 
  - **Bcrypt**: Hashes passwords before storing them in the DB. Check happens on login.
  - **JWT (JSON Web Tokens)**: Issues a signed token upon a successful login. This token is stored in an `httpOnly` cookie for security against XSS.
  - **Next.js Middleware**: `middleware.ts` runs prior to every request, validating the JWT. If a user trying to access `/dashboard` lacks a valid token, they are automatically intercepted and redirected to `/login`.

---

## 🧠 3. Key Backend Systems & Engines

The true power of BDIE comes from its backend intelligence engines located in the `lib/` folder:

### A. The Risk Engine (`lib/riskEngine.ts`)
- **Purpose**: Calculates the continuous "Risk Score" of users ranging from 0 to 100.
- **Mechanism**: Analyzes incoming `ActivityLog` and `AuditEvent` records. It applies heuristics (e.g., logging in from an unknown IP, extreme download volume) to adjust the behavioral drift metric.

### B. The Simulation Engine (`lib/simulationEngine.ts`)
- **Purpose**: Allows administrators/red teams to test scenarios (e.g., mimic a data exfiltration attempt).
- **Mechanism**: Takes predefined simulation templates, injects simulated events into the audit log, and rapidly fast-forwards the Risk Engine to observe how the platform reacts and if alerts trigger correctly.

### C. The Explainability Engine (`lib/explainability.ts`)
- **Purpose**: Makes "black-box" risk scores understandable to human operators.
- **Mechanism**: Generates natural-language insights (via the `Google Gemini API` or heuristic-based text generation). When a risk score spikes, it outputs a human-readable summarization like: *"Risk score elevated due to 5x increase in file downloads combined with an anomalous late-night login."*

---

## 🔄 4. The Standard Data Flow Loop

To understand how all these pieces fit together, here is the lifecycle of a user action triggering an alert:

1. **User Action**: An employee downloads 500 files within 5 minutes.
2. **Event Trigger**: A request is sent to an internal Next.js API route (`/api/events/log`).
3. **Engine Processing**: The API invokes `lib/riskEngine.ts`, which runs the event against historical behavior, noticing a severe anomaly. The Risk Score for the user is updated from `15` to `82` in the database (`mongoose`).
4. **Explainability**: `lib/explainability.ts` kicks in, writing a natural-language reason for the score spike.
5. **Real-time Feedback**: The client dashboard frequently polls (or listens via WebSockets/Server-Sent Events) and receives the updated score.
6. **UI Reaction**: 
   - State updates in `zustand`.
   - The Three.js Digital Twin morphs from a calm blue sphere to a jagged, pulsing red shape.
   - Framer Motion slide-in animation fires to pop a `SmartAlertBanner` onto the operator's screen.
   - The Predictive Risk Graph (Recharts) updates to plot the historical spike.
