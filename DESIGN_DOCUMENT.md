# HeapSight Design Document

**Authors:** Tray Branch + Contributors
**Version:** 1.0.0
**Last Updated:** 2026-02-17

---

## 1. PROJECT OVERVIEW

### Description

HeapSight is a Duolingo-style interactive C++ learning platform that teaches systems programming through hands-on coding challenges. Unlike traditional online courses that use video lectures and quizzes, HeapSight provides a gamified, project-based experience where students write real C++ code that compiles and runs in the browser, producing visual output in the form of 2D games or 3D robot simulations.

The platform offers 100 lesson variants across 4 learning paths, each teaching the same 25 core C++ concepts through different project paradigms: Entity Component Systems (Space Shooter), Finite State Machines (Platformer), Data-Driven OOP (Simple RPG), and Real-Time Embedded Systems (Differential Drive Robot). This multi-paradigm approach ensures students don't just learn syntax, but understand how C++ is used in real-world domains.

Engagement is driven by a comprehensive gamification layer inspired by Duolingo: daily streaks, 50-level XP progression, 15 achievements across 3 categories, weekly leaderboards, and daily goals. The freemium business model offers 5 free lessons with a one-time $67 payment for lifetime access to all content.

### Purpose

**Educational Goals:**
- Teach C++ fundamentals (variables, pointers, memory management, templates, STL) through project-based learning
- Expose students to 4 real-world C++ paradigms (ECS, FSM, Data-Driven OOP, Embedded Systems)
- Build consistent coding habits through streak mechanics and daily goals

**Business Goals:**
- Revenue model: One-time $67 payment for Pro tier (lifetime access)
- Conversion target: 5-10% of free users upgrade to Pro
- Retention target: 40% D7, 20% D30 (Duolingo-comparable)

**Technical Goals:**
- Sub-2-second page load times
- Real C++ compilation via Judge0 with < 5 second turnaround
- 99.9% uptime via serverless architecture

### End Users

**Primary:** Computer science students (18-30) learning C++ for the first time or transitioning from Python/JavaScript. They struggle with pointers, memory management, and low-level concepts. They want a structured, gamified path rather than reading textbooks.

**Secondary:** Self-taught developers preparing for game development, embedded systems, or systems programming roles. They know basic programming but need C++-specific skills.

**Persona 1 — Alex (CS Student, 20)**
- Background: Second-year CS student, comfortable with Python
- Goal: Learn C++ for data structures class and game dev side projects
- Frustration: Traditional C++ resources are dry; online courses lack hands-on coding
- Behavior: Studies in 20-minute bursts between classes, motivated by streaks

**Persona 2 — Jordan (Career Switcher, 28)**
- Background: JavaScript web developer wanting to move to game/embedded industry
- Goal: Build a C++ portfolio demonstrating systems programming competence
- Frustration: Doesn't know which C++ paradigms are industry-relevant
- Behavior: Codes on weekends, values completion certificates, price-conscious

### Scope

**In Scope (v1.0):**
- 25 lessons with 2-part structure (concept + applied coding)
- 4 learning paths with unique project outputs
- Real C++ compilation via Judge0
- Visual output (2D canvas games, 3D robot simulation)
- User authentication (email/password)
- Progress tracking (per-lesson, per-path)
- Gamification (streaks, XP, levels, achievements, leaderboards)
- Freemium model with Stripe payment
- Responsive design (mobile + desktop)
- Duolingo-style dashboard with sidebar navigation

**Out of Scope (v1.0):**
- Social features (following, comments, sharing)
- AI-powered hint system
- Mobile native app
- Team/corporate accounts
- Custom lesson creation
- Code playground/sandbox
- Certificate generation

**Future Roadmap (v2.0+):**
- AI Error Explainer (Claude API integration)
- Weekly timed challenges
- Code sharing and community solutions
- Mobile app (React Native)
- Corporate training packages
- Certification program

---

## 2. FUNCTIONALITY

### Feature 1: Lesson Completion Flow

**User Story:** "As a learner, I want to complete coding challenges that teach C++ concepts so that I build real programming skills."

**Acceptance Criteria:**
- Each lesson has Part 1 (concept basics) and Part 2 (applied project code)
- User writes C++ code in Monaco editor
- "Run" compiles via Judge0 and shows output
- "Submit" runs tests; all must pass to complete
- Visual output renders in game canvas (2D) or robot canvas (3D)
- Progress saved per-path (same lesson ID, different path)
- XP awarded on Part 2 completion only

**Implementation:**
- `src/app/lesson/[id]/page.tsx` — Main lesson page (668 lines)
- `src/lib/cpp-runner.ts` — Sends code to `/api/compile`, runs tests
- `src/app/api/compile/route.ts` — Server-side Judge0 proxy with rate limiting
- `src/store/lesson-store.ts` — Zustand store for lesson state
- `lesson_progress` table with `(user_id, lesson_id, path)` unique constraint

### Feature 2: Daily Streaks

**User Story:** "As a learner, I want to maintain a daily coding streak so that I build a consistent habit."

**Acceptance Criteria:**
- Streak increments when user completes >= 1 lesson per day
- Streak resets if user misses a day (unless streak freeze active for Pro)
- Milestone celebrations at 7, 14, 30, 60, 100, 365 days
- Streak freeze (Pro only): 3 per month, auto-applied on missed day

**Implementation:**
- `update_user_streak(p_user_id)` PL/pgSQL function handles consecutive-day logic
- `src/lib/streak-manager.ts` — Client-side wrapper, milestone detection
- `user_streaks` table: `current_streak`, `longest_streak`, `last_activity_date`
- `streak_history` table: daily snapshots for analytics

### Feature 3: Achievement System

**User Story:** "As a learner, I want to unlock achievement badges so that I feel rewarded for milestones."

**Acceptance Criteria:**
- 15 achievements across 3 categories (learning, streak, mastery)
- 4 rarity tiers (common, rare, epic, legendary)
- XP bonus awarded on unlock (25-5000 XP)
- Popup notification on first unlock
- Achievement gallery on progress page

**Implementation:**
- `src/lib/achievements.ts` — 15 achievement definitions with unlock criteria
- `src/lib/achievement-manager.ts` — Checks all criteria after lesson completion
- `user_achievements` table: `(user_id, achievement_id)` unique constraint
- `src/components/feedback/AchievementUnlocked.tsx` — Popup component

### Feature 4: XP & Level System

**User Story:** "As a learner, I want to see my XP and level progress so that I have a sense of advancement."

**Acceptance Criteria:**
- 50 levels with exponential XP curve: `100 * 1.12^(level-2)` per level
- 12 title tiers (Novice → Immortal)
- Level bar in sidebar, progress page, and account page
- Level-up celebration with confetti

**Implementation:**
- `src/lib/lesson-metadata.ts` — `getLevelInfo(xp)` calculates level, title, progress %
- XP stored in `profiles.total_xp`
- Level-up detection: compare pre/post XP after lesson completion

### Feature 5: Leaderboard

**User Story:** "As a learner, I want to see how I rank against other students so that I'm motivated by competition."

**Acceptance Criteria:**
- Weekly leaderboard (resets every 7 days)
- Shows top 100 users by weekly XP
- User's own rank displayed
- Top 3 get medal icons
- Preview widget on learn page dashboard

**Implementation:**
- `weekly_leaderboard` SQL view — aggregates `daily_activity.xp_earned` over 7 days
- `src/app/(dashboard)/leaderboard/page.tsx` — Full leaderboard page
- `src/components/dashboard/LeaderboardPreview.tsx` — Compact top-3 widget

### Feature 6: Path-Isolated Progress

**User Story:** "As a Pro user, I want to switch between learning paths without losing progress."

**Acceptance Criteria:**
- Progress tracked per-path (completing Lesson 5 on Space Shooter doesn't affect Lesson 5 on Robot)
- Path switching available from /paths page
- Free users limited to 1 path (selected during onboarding)
- Pro users can switch freely

**Implementation:**
- `lesson_progress` table has `path` column: unique on `(user_id, lesson_id, path)`
- `src/app/(dashboard)/paths/page.tsx` — Path switching with progress bars
- Path switch updates `profiles.selected_game_template` + `user_games`

### Feature 7: Payment & Subscription

**User Story:** "As a free user, I want to upgrade to Pro so that I can access all lessons."

**Acceptance Criteria:**
- One-time $67 payment via Stripe Checkout
- Instant upgrade to Pro tier after payment
- Lifetime access (no subscription)
- 30-day money-back guarantee

**Implementation:**
- `src/app/upgrade/page.tsx` — Pricing page with feature comparison
- `/api/checkout/onetime` — Creates Stripe Checkout session (TO BE BUILT)
- Stripe webhook handler updates `profiles.tier` to 'pro' (TO BE BUILT)
- `src/components/PaywallModal.tsx` — Shown when free user hits pro lesson

---

## 3. TECHNOLOGY STACK

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2.35 | App Router framework (SSR + client components) |
| React | 18.x | UI component library |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 3.4.1 | Utility-first styling |
| Monaco Editor | 4.7.0 | VS Code-quality code editor |
| Three.js | 0.169.0 | 3D robot visualization |
| React Three Fiber | 8.18.0 | React renderer for Three.js |
| Zustand | 5.0.11 | Lightweight state management |
| canvas-confetti | 1.9.4 | Celebration animations |
| Prism.js | 1.30.0 | Syntax highlighting |
| JSCPP | 2.0.9 | Client-side C++ interpreter (fallback) |

### Backend
| Technology | Purpose |
|-----------|---------|
| Vercel | Serverless hosting & edge functions |
| Supabase | PostgreSQL database, Auth, Realtime, RLS |
| Judge0 | Remote C++ compilation service |
| Stripe | Payment processing |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code linting (Next.js config) |
| PostCSS | CSS processing for Tailwind |
| Git + GitHub | Version control |
| npm | Package manager |

---

## 4. USE CASES

### UC1: New User Onboarding
- **Actor:** First-time visitor
- **Preconditions:** User has navigated to heapsight.dev
- **Flow:**
  1. User clicks "Start Learning Free" on landing page
  2. Redirected to `/signup` — enters email + password
  3. Email verification sent (Supabase Auth)
  4. After verification, redirected to `/onboarding`
  5. Onboarding wizard: choose 1 of 4 learning paths
  6. Profile created with `selected_game_template` set
  7. Redirected to `/learn` dashboard
  8. First 5 lessons visible and unlocked
- **Postconditions:** `profiles` row created, `onboarding_completed = true`
- **Error Paths:** Invalid email format, password < 6 chars, email already registered

### UC2: Daily Lesson Completion
- **Actor:** Returning authenticated user
- **Preconditions:** User has incomplete lessons
- **Flow:**
  1. User navigates to `/learn`
  2. Sees "Continue" card highlighting next lesson
  3. Clicks lesson -> navigates to `/lesson/[id]`
  4. Reads Part 1 instructions, writes C++ code
  5. Clicks "Run" -> Judge0 compiles, output displayed
  6. Clicks "Submit" -> tests run, all pass
  7. Part 1 complete -> auto-transitions to Part 2
  8. Writes Part 2 code (game/robot variant)
  9. "Submit" -> tests pass -> lesson complete
  10. XP awarded, confetti fires, streak updated
  11. Achievement check runs -> popup if new badge
  12. Level check -> level-up celebration if threshold crossed
- **Postconditions:** `lesson_progress` updated, `profiles.total_xp` incremented, `user_streaks` updated, `daily_activity` incremented

### UC3: Path Switching (Pro User)
- **Actor:** Pro tier user
- **Flow:**
  1. User navigates to `/paths`
  2. Sees 4 path cards with progress bars
  3. Clicks "Switch" on a different path
  4. Confirmation: "Switch to Space Shooter?"
  5. `profiles.selected_game_template` updated
  6. Redirected to `/learn` with new path's lessons
  7. Previous path progress preserved
- **Postconditions:** `profiles.selected_game_template` changed, no progress lost

### UC4: Pro Upgrade Purchase
- **Actor:** Free tier user
- **Flow:**
  1. User hits locked lesson OR clicks "Upgrade to Pro" in sidebar
  2. Navigated to `/upgrade`
  3. Reviews feature comparison and pricing ($67)
  4. Clicks "Upgrade Now"
  5. Redirected to Stripe Checkout
  6. Completes payment
  7. Stripe webhook fires -> `profiles.tier` set to 'pro'
  8. Redirected back to HeapSight
  9. All 25 lessons unlocked, path switching enabled
- **Postconditions:** `profiles.tier = 'pro'`, `profiles.stripe_customer_id` set

### UC5: Settings Update
- **Actor:** Authenticated user
- **Flow:**
  1. User clicks "Settings" in sidebar
  2. Navigated to `/settings`
  3. Views profile info (avatar, email, level)
  4. Enters new password in security section
  5. Clicks "Update Password"
  6. Supabase Auth updates password
  7. Success message shown
- **Postconditions:** Password updated in Supabase Auth

### UC6: Data Export
- **Actor:** Any authenticated user
- **Flow:**
  1. User navigates to `/settings`
  2. Scrolls to "Danger Zone"
  3. Clicks "Export My Data"
  4. JSON file downloaded with profile, progress, streaks, achievements
- **Postconditions:** JSON file saved to user's device

---

## 5. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Dashboard   │  │ Lesson Page  │  │  Settings    │             │
│  │  /learn      │  │ /lesson/[id] │  │  /settings   │             │
│  │  /paths      │  │  Monaco      │  │  /account    │             │
│  │  /progress   │  │  Editor      │  │  Password    │             │
│  │  /leaderboard│  │  Canvas/3D   │  │  Export      │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                  │                      │
│  ┌──────┴─────────────────┴──────────────────┴───────┐             │
│  │              Supabase Client (Browser)             │             │
│  │              Zustand State Store                   │             │
│  └──────────────────────┬────────────────────────────┘             │
└─────────────────────────┼───────────────────────────────────────────┘
                          │ HTTPS (Supabase SDK + Fetch)
                          │
┌─────────────────────────┼───────────────────────────────────────────┐
│              NEXT.JS APP (Vercel Serverless)                        │
│                          │                                          │
│  ┌───────────────────────┴───────────────────────────────────┐     │
│  │  Middleware (src/middleware.ts)                            │     │
│  │  - Auth check on protected routes                         │     │
│  │  - Onboarding redirect                                    │     │
│  │  - Login/signup redirect for authed users                 │     │
│  └───────────────────────┬───────────────────────────────────┘     │
│                          │                                          │
│  ┌───────────────────────┴───────────────────────────────────┐     │
│  │  API Routes (Serverless Functions)                        │     │
│  │  POST /api/compile         → Judge0 proxy                │     │
│  │  POST /api/checkout/onetime → Stripe checkout (planned)   │     │
│  │  POST /api/stripe/webhook  → Payment handler (planned)    │     │
│  └───────┬──────────────────────────┬────────────────┬───────┘     │
└──────────┼──────────────────────────┼────────────────┼──────────────┘
           │                          │                │
           ▼                          ▼                ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│    SUPABASE      │   │     JUDGE0       │   │     STRIPE       │
│                  │   │                  │   │                  │
│ PostgreSQL DB    │   │ C++ Compilation  │   │ Checkout         │
│ ├─ profiles      │   │ GCC 9.2.0        │   │ Webhooks         │
│ ├─ lesson_progress│  │ 5s CPU limit     │   │ Payment Intent   │
│ ├─ user_streaks  │   │ 128MB RAM limit  │   │                  │
│ ├─ user_achieve. │   │                  │   │                  │
│ ├─ daily_activity│   │                  │   │                  │
│ └─ weekly_leader.│   │                  │   │                  │
│                  │   │                  │   │                  │
│ Auth (email/pw)  │   │                  │   │                  │
│ RLS Policies     │   │                  │   │                  │
│ RPC Functions    │   │                  │   │                  │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## 6. COMPONENT-LEVEL DESIGN

### Sidebar (`src/components/layout/Sidebar.tsx`)
- **Purpose:** Persistent left navigation for all dashboard pages
- **Props:** `userEmail`, `totalXp`, `userTier`, `streakCount`
- **Behavior:** Desktop: fixed w-64 sidebar. Mobile: hamburger button + slide-in overlay.
- **Nav Items:** Learn, Leaderboard, Paths, Progress. Bottom: Settings, Sign Out.
- **Active State:** Highlights based on `usePathname()` match.

### LessonPage (`src/app/lesson/[id]/page.tsx`)
- **Purpose:** Full lesson experience with editor, instructions, and visual output
- **State (Zustand):** `currentPart`, `part1Code/part2Code`, `output`, `errors`, `testResults`, `isRunning`, `gameFrame`, `robotFrames`
- **Layout:** Desktop: 3-column (instructions | editor | preview). Mobile: 4-tab (Lesson | Code | Preview | Output).
- **Key Flow:** Load saved code -> Edit -> Run (Judge0) -> Submit (run tests) -> Complete (award XP)

### DashboardLayout (`src/app/(dashboard)/layout.tsx`)
- **Purpose:** Shared wrapper for all dashboard routes
- **Behavior:** Fetches user data once (email, XP, tier, streak), passes to Sidebar. Redirects to /login if unauthenticated, /onboarding if no template selected.
- **Children:** All dashboard pages render inside `flex-1 lg:ml-64 pb-20 md:pb-0`.

### GamePreviewCanvas (`src/components/lesson/GamePreviewCanvas.tsx`)
- **Purpose:** Renders 2D game output from C++ code (Space Shooter, Platformer, RPG)
- **Input:** `GameFrame` parsed from stdout protocol lines
- **Technology:** HTML5 Canvas API

### RobotPreviewCanvas (`src/components/lesson/RobotPreviewCanvas.tsx`)
- **Purpose:** Renders 3D robot visualization from C++ code
- **Input:** `RobotFrame[]` parsed from `ROBOT|` protocol lines
- **Technology:** React Three Fiber (Three.js)
- **Loading:** Dynamic import with `ssr: false`

### AchievementUnlocked (`src/components/feedback/AchievementUnlocked.tsx`)
- **Purpose:** Full-screen popup showing newly unlocked achievement
- **Props:** `achievement: Achievement`, `onClose: () => void`
- **Behavior:** Auto-dismisses after 4 seconds, fires confetti

---

## 7. DESIGN PATTERNS

### 1. Route Groups (Next.js App Router)
The `(dashboard)` route group provides a shared layout (sidebar + bottom nav) for `/learn`, `/leaderboard`, `/paths`, `/progress`, `/settings`, `/account`, `/practice` without affecting URL paths.

### 2. Row-Level Security (Supabase RLS)
All tables use RLS policies: `auth.uid() = user_id`. Users can only read/write their own data. The `SECURITY DEFINER` functions (`update_user_streak`, `increment_xp`) run with elevated privileges but accept only the caller's user ID.

### 3. Path-Isolated Data
The `lesson_progress` table uses a composite unique key `(user_id, lesson_id, path)` so progress is tracked per-path. This allows Pro users to complete the same lesson across multiple paths independently.

### 4. Protocol-Based Output Parsing
Game and robot templates output structured protocol lines (`GAME|entity|...`, `ROBOT|position|...`) that the client parses into typed frames for visualization. This decouples C++ output from rendering.

### 5. Lazy Loading (Dynamic Import)
Three.js and React Three Fiber are loaded via `next/dynamic` with `ssr: false` to avoid server-side rendering issues and reduce initial bundle size for non-robot paths.

### 6. Zustand Store (Lesson State)
The lesson page uses Zustand instead of React context for performance. Individual selectors (`useLessonStore(s => s.part1Code)`) prevent unnecessary re-renders when unrelated state changes.

### 7. Serverless Rate Limiting
The compile API uses an in-memory Map for rate limiting (20 req/min per user). While this resets on cold starts, it provides basic protection against abuse.

### 8. Optimistic Streak Updates
The streak is calculated server-side via a PL/pgSQL function that handles consecutive-day logic atomically, preventing race conditions from concurrent lesson completions.

---

## 8. DATABASE SCHEMA

### `profiles`
```sql
-- Core user profile (created by Supabase Auth trigger)
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
email TEXT NOT NULL
total_xp INTEGER DEFAULT 0
tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro'))
selected_game_template TEXT
onboarding_completed BOOLEAN DEFAULT false
stripe_customer_id TEXT
last_activity_date DATE
timezone TEXT DEFAULT 'UTC'
created_at TIMESTAMPTZ DEFAULT NOW()
```

### `lesson_progress`
```sql
-- Per-lesson, per-path progress tracking
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
lesson_id TEXT NOT NULL
path TEXT NOT NULL
status TEXT DEFAULT 'not_started' -- not_started | in_progress | completed
part1_status TEXT
part2_status TEXT
part1_user_code TEXT
part2_user_code TEXT
completed_at TIMESTAMPTZ
UNIQUE(user_id, lesson_id, path)
INDEX(user_id, path)
```

### `user_streaks`
```sql
-- Daily streak tracking
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE
current_streak INT DEFAULT 0
longest_streak INT DEFAULT 0
last_activity_date DATE
streak_freeze_count INT DEFAULT 0
updated_at TIMESTAMPTZ DEFAULT NOW()
```

### `user_achievements`
```sql
-- Earned achievement badges
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
achievement_id TEXT REFERENCES achievements(id)
earned_at TIMESTAMPTZ DEFAULT NOW()
UNIQUE(user_id, achievement_id)
INDEX(user_id)
```

### `daily_activity`
```sql
-- Daily XP/lesson counters for leaderboard
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
activity_date DATE NOT NULL DEFAULT CURRENT_DATE
xp_earned INT DEFAULT 0
lessons_completed INT DEFAULT 0
UNIQUE(user_id, activity_date)
INDEX(user_id, activity_date)
```

### `weekly_leaderboard` (VIEW)
```sql
-- Aggregated weekly rankings
SELECT p.id, p.total_xp,
  COALESCE(SUM(da.xp_earned), 0) AS weekly_xp
FROM profiles p
LEFT JOIN daily_activity da ON p.id = da.user_id
  AND da.activity_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY p.id ORDER BY weekly_xp DESC LIMIT 100
```

---

## 9. API SPECIFICATION

### POST /api/compile
**Purpose:** Proxy C++ code to Judge0 for compilation and execution
**Auth:** Required (Supabase session cookie)
**Rate Limit:** 20 requests/minute per user

**Request:**
```json
{ "source_code": "string (max 10,000 chars)" }
```

**Response (200):**
```json
{
  "output": "string (stdout)",
  "errors": ["string (error messages)"],
  "compile_output": "string",
  "status_id": 3,
  "time": "0.01",
  "memory": 3456
}
```

**Error Codes:** 401 (Unauthorized), 429 (Rate Limited), 400 (Invalid Input), 502 (Judge0 Down), 503 (Not Configured)

### POST /api/checkout/onetime (PLANNED)
**Purpose:** Create Stripe Checkout session for Pro upgrade
**Auth:** Required

**Response (200):**
```json
{ "url": "https://checkout.stripe.com/..." }
```

### POST /api/stripe/webhook (PLANNED)
**Purpose:** Handle Stripe payment events
**Auth:** Stripe webhook signature verification

---

## 10. UI/UX DESIGN

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#0a0a0f` | Page backgrounds |
| `surface` | `#12121a` | Card backgrounds |
| `primary` | `#00ff88` | CTAs, success states, active nav |
| `danger` | `#ff0040` | Errors, destructive actions |
| `warning` | `#ffaa00` | Warnings |
| Purple gradient | `#a855f7` → `#6366f1` | Pro features, levels, achievements |
| Orange | `#f97316` | Streaks, fire |
| Yellow | `#fbbf24` | XP, gold medals |
| Border | `#1a1a2e` | Card/section borders |
| Muted text | `#666` / `#888` | Secondary text |

### Typography
- **Headings:** Inter, bold, white
- **Body:** Inter, regular, `#e0e0e0`
- **Code/Data:** JetBrains Mono, monospace
- **Micro text:** 8-10px mono, uppercase, muted

### Responsive Breakpoints
- **Mobile (<768px):** Single column, hamburger menu, bottom tab bar, touch targets >= 44px
- **Tablet (768-1024px):** 2 columns, bottom tab bar visible
- **Desktop (>1024px):** Sidebar (w-64) + main content, no bottom nav

### Key Animations
| Name | Usage | Duration |
|------|-------|----------|
| `shimmer` | Level progress bars | 2s linear infinite |
| `pulse` | Loading states | Standard CSS pulse |
| `slide_in_left` | Mobile sidebar | 0.3s ease-out |
| `fade_in` | Overlay backdrops | 0.3s ease-out |
| `bounce_in` | Achievement popup | 0.6s cubic-bezier |
| `confetti` | Lesson completion, streaks, level-up | canvas-confetti |

---

## 11. SECURITY CONSIDERATIONS

| Area | Implementation | Status |
|------|---------------|--------|
| Authentication | Supabase Auth (email/password, JWT sessions) | Implemented |
| Authorization | RLS policies on all user-data tables | Partially implemented |
| Middleware | Route protection for /learn, /lesson, /onboarding | Needs expansion |
| Input Validation | Source code length limit (10KB), type checking | Implemented |
| Rate Limiting | 20 req/min on compile API (in-memory) | Needs persistence |
| Payment Security | Stripe Checkout (PCI compliant) | Planned |
| Data Privacy | Data export feature, email not in leaderboard (planned fix) | Needs work |
| HTTPS | Automatic via Vercel | Implemented |
| CORS | Default Next.js same-origin | Implemented |

---

## 12. PERFORMANCE BENCHMARKS

| Metric | Current | Target |
|--------|---------|--------|
| Average page size | 4.6 KB | < 10 KB |
| Largest page (lesson) | 115 KB (includes Monaco) | < 150 KB |
| Shared JS bundle | 87.6 KB | < 100 KB |
| Total routes | 17 | - |
| Static pages | 15 of 17 | Maximize static |
| Middleware size | 74.6 KB | < 100 KB |
| Judge0 compile time | ~2-4 seconds | < 5 seconds |
| Dashboard load queries | 3-4 (parallel) | < 5 |
| Lesson completion queries | ~8 (sequential) | Reduce to 4-5 |

---

## 13. DEPLOYMENT & OPERATIONS

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anonymous key (public)
SUPABASE_SERVICE_ROLE_KEY       # Supabase service key (server only)
JUDGE0_API_URL                  # Judge0 API endpoint
JUDGE0_API_KEY                  # Judge0 RapidAPI key
JUDGE0_API_HOST                 # Judge0 RapidAPI host
STRIPE_SECRET_KEY               # Stripe secret key (server only)
STRIPE_WEBHOOK_SECRET           # Stripe webhook signing secret
```

### Deployment
- **Platform:** Vercel (auto-deploy from GitHub main branch)
- **Build:** `next build` (~30s)
- **Database:** Supabase Cloud (managed PostgreSQL)
- **Migrations:** Manual SQL execution in Supabase SQL Editor

### Monitoring (Planned)
- Error tracking: Sentry
- Analytics: PostHog or Vercel Analytics
- Uptime: Vercel built-in monitoring

---

## 14. FUTURE ENHANCEMENTS

### V2.0 (3-6 months)
- AI Error Explainer — Claude API explains C++ compilation errors in plain English
- Weekly Challenges — timed coding competitions with prizes
- Code Playground — shareable sandbox for experimenting
- Social features — follow users, see friends' streaks
- Certificate generation — PDF completion certificates

### V3.0 (6-12 months)
- Mobile app (React Native) — offline-capable coding
- Live coding sessions — multiplayer collaborative coding
- Mentor marketplace — paid 1-on-1 tutoring
- Corporate training — team accounts, admin dashboard
- Content creator tools — community-submitted lessons

### Scalability Targets
- V1.0: 1,000 DAU
- V2.0: 10,000 DAU
- V3.0: 100,000+ DAU
