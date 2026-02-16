# Crash Demo — Interactive C++ Debugger Landing Page

## Overview

A single-page Next.js app that simulates a C++ game crash, lets users visually diagnose the root cause (dangling pointer / use-after-free), fix it with one click, and then sign up for a waitlist. Everything runs client-side — no real C++ execution.

---

## Tech Stack

| Layer       | Choice                              |
|-------------|--------------------------------------|
| Framework   | Next.js 14 (App Router)             |
| Language    | TypeScript                           |
| Styling     | Tailwind CSS                         |
| Canvas      | HTML5 Canvas (no extra libs)         |
| Syntax HL   | Prism.js (lightweight, C++ support)  |
| Backend     | Supabase (waitlist table only)       |
| Deployment  | Vercel                               |

---

## Directory Structure

```
crash-demo/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, fonts, metadata
│   │   ├── page.tsx            # Main landing page — wires all components
│   │   ├── globals.css         # Tailwind directives + custom styles
│   │   └── api/
│   │       └── waitlist/
│   │           └── route.ts    # POST handler → Supabase insert
│   ├── components/
│   │   ├── GameCanvas.tsx      # Shooter game + crash loop
│   │   ├── MemoryArena.tsx     # Heap memory block grid
│   │   ├── CodeDisplay.tsx     # Syntax-highlighted C++ code
│   │   ├── ReplayController.tsx# Slow-motion crash replay
│   │   └── WaitlistModal.tsx   # Email signup modal
│   ├── lib/
│   │   ├── game-engine.ts      # Game simulation logic (pure functions)
│   │   ├── memory-sim.ts       # Memory arena simulation state
│   │   └── supabase.ts         # Supabase client init
│   └── data/
│       └── code-snippets.ts    # Buggy + fixed C++ code strings
├── public/
│   └── (static assets if needed)
├── .env.local                  # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── next.config.js
```

---

## Component Architecture

### 1. GameCanvas (`components/GameCanvas.tsx`)

**Purpose:** 400x600 HTML5 canvas rendering a top-down space shooter that deterministically crashes every 6 seconds.

**Game elements:**
- Player ship (triangle) at bottom, moves left/right with auto-pilot
- Enemy sprites (rectangles) spawn from top, drift downward
- Bullets fired upward every 0.5s
- Particle explosions on enemy hit

**Crash simulation (at t=6s):**
- An "enemy" object is destroyed (removed from array) but its reference is kept in a separate `targetLock` variable
- The game tries to read `targetLock->position` — triggers a simulated SEGFAULT
- Canvas shows: screen glitch effect (random pixel noise), red flash, freeze
- "SEGFAULT" text overlay rendered on canvas
- After 2s freeze, the loop resets (total cycle: 8s = 6s play + 2s crash display)

**Props:**
```ts
interface GameCanvasProps {
  isFixed: boolean;        // false = buggy version, true = safe version
  isPaused: boolean;       // pause for replay controller
  onCrash: () => void;     // notify parent when crash happens
  onReset: () => void;     // notify parent when loop resets
  speed: number;           // 1.0 = normal, 0.25 = slow-mo for replay
}
```

**State machine:**
```
PLAYING → CRASHING → FROZEN → PLAYING (loop)
          ↓ (if isFixed=true)
PLAYING → PLAYING (no crash, runs indefinitely)
```

**Implementation notes:**
- Use `requestAnimationFrame` loop inside a `useEffect`
- All game state in a `useRef` to avoid re-renders
- Deterministic: same seed every loop so replay is consistent
- Canvas drawing: simple shapes only (no sprite sheets needed)

---

### 2. MemoryArena (`components/MemoryArena.tsx`)

**Purpose:** An 8x4 grid of colored blocks representing a simplified heap. Visualizes memory allocation, use, free, and the dangling pointer access.

**Visual design:**
- 32 blocks, each ~50x50px with rounded corners
- Color states:
  - `#1a1a2e` (dark) — free/unallocated
  - `#00ff88` (green) — allocated, healthy
  - `#ffaa00` (orange) — recently freed
  - `#ff0040` (red) — dangling pointer access (crash cause)
  - `#444` (gray) — corrupted after crash
- Subtle pulse animation on the "dangling" block
- Pointer arrows drawn between blocks (CSS pseudo-elements)

**Props:**
```ts
interface MemoryArenaProps {
  phase: 'idle' | 'running' | 'crash' | 'diagnosed' | 'fixed';
  highlightBlock: number | null;
  showPointers: boolean;
}
```

**Behavior by phase:**
| Phase      | Visualization                                               |
|------------|--------------------------------------------------------------|
| `idle`     | Some blocks green (allocated), most dark                     |
| `running`  | Blocks flicker green as game allocates enemies               |
| `crash`    | Block 14 turns orange (freed), pointer arrow to 14 turns red, block 14 pulses red |
| `diagnosed`| Same as crash but with label overlays ("FREED", "DANGLING PTR") |
| `fixed`    | Block 14 stays green (never freed while referenced), all healthy |

---

### 3. CodeDisplay (`components/CodeDisplay.tsx`)

**Purpose:** Swappable view of buggy vs. fixed C++ code, syntax-highlighted and read-only.

**Buggy code snippet:**
```cpp
class Enemy {
public:
    Vector2 position;
    int health;
};

Enemy* targetLock = nullptr;

void updateGame() {
    for (auto it = enemies.begin(); it != enemies.end();) {
        if (it->health <= 0) {
            // BUG: targetLock still points here!
            delete *it;
            it = enemies.erase(it);
        } else {
            ++it;
        }
    }

    // CRASH: use-after-free
    if (targetLock) {
        shoot(targetLock->position);  // SEGFAULT
    }
}
```

**Fixed code snippet:**
```cpp
void updateGame() {
    for (auto it = enemies.begin(); it != enemies.end();) {
        if (it->health <= 0) {
            if (targetLock == *it) {
                targetLock = nullptr;  // Clear before delete
            }
            delete *it;
            it = enemies.erase(it);
        } else {
            ++it;
        }
    }

    if (targetLock) {
        shoot(targetLock->position);  // Safe!
    }
}
```

**Props:**
```ts
interface CodeDisplayProps {
  variant: 'buggy' | 'fixed';
  highlightLines?: number[];
}
```

**Implementation:**
- Use Prism.js with the C++ grammar for syntax highlighting
- Highlighted lines get a red (buggy) or green (fixed) background glow
- Smooth fade transition when switching variants

---

### 4. ReplayController (`components/ReplayController.tsx`)

**Purpose:** A 4-second slow-motion replay of the crash sequence with a scrub timeline.

**UI elements:**
- Timeline bar (horizontal slider, 0-4s)
- Play/pause button
- Frame-by-frame step buttons (< >)
- Timestamp label: "T+5.8s ... T+6.0s (CRASH)"
- Auto-plays at 0.25x speed when activated

**Props:**
```ts
interface ReplayControllerProps {
  isActive: boolean;
  onSpeedChange: (speed: number) => void;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
}
```

**Behavior:**
- When user clicks "SHOW ME WHY", this activates
- Rewinds game to T=4s, replays at 0.25x speed to T=8s (crash + aftermath)
- Timeline shows keyframe markers: "Enemy killed" -> "Memory freed" -> "Pointer access" -> "SEGFAULT"
- Syncs with MemoryArena (blocks change state as timeline progresses)

---

### 5. WaitlistModal (`components/WaitlistModal.tsx`)

**Purpose:** Email signup modal that appears after the user fixes the crash.

**UI:**
- Backdrop overlay (semi-transparent dark)
- Centered card with:
  - Heading: "You just mass-prevented a class of crashes."
  - Subtext: "We're building a tool that does this automatically. Join the waitlist."
  - Email input field
  - "Join Waitlist" button
  - "No thanks" dismiss link
- Success state: checkmark + "You're in!" message

**Props:**
```ts
interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Supabase integration:**
- On submit, POST to `/api/waitlist` with `{ email }`
- API route validates email format, inserts into `waitlist` table
- Table schema: `id (uuid, pk)`, `email (text, unique)`, `created_at (timestamptz)`
- Handles duplicate emails gracefully (returns success, doesn't error)

---

## Main Page Flow (`app/page.tsx`)

### State Machine

```
ATTRACT → CRASHING → SHOW_ME_WHY → REPLAYING → DIAGNOSED → FIX_IT → FIXED → WAITLIST
```

| State          | What's visible                                              |
|----------------|--------------------------------------------------------------|
| `ATTRACT`      | Game playing, crash loop running. "SHOW ME WHY" button visible |
| `CRASHING`     | Game hits crash, glitch effect, SEGFAULT overlay             |
| `SHOW_ME_WHY`  | User clicks button. Transition to replay.                    |
| `REPLAYING`    | Game replays crash in slow-mo. MemoryArena + ReplayController active |
| `DIAGNOSED`    | Replay ends. Memory blocks labeled. Code panel visible with buggy code highlighted |
| `FIX_IT`       | "FIX IT" button appears on code panel                        |
| `FIXED`        | Code swaps to safe version. Game restarts clean. Memory stays green |
| `WAITLIST`     | After 3s of clean game, waitlist modal opens                 |

### Layout (Desktop)

```
+-----------------------------------------------------+
|  Header: "Why your game just crashed"                |
+-----------------------+-----------------------------+
|                       |                             |
|     GameCanvas        |     CodeDisplay             |
|     (400x600)         |     (right panel)           |
|                       |                             |
+-----------------------+-----------------------------+
|  MemoryArena (full width, below game)                |
+-----------------------------------------------------+
|  ReplayController (timeline bar)                     |
+-----------------------------------------------------+
|  CTA Button: "SHOW ME WHY" / "FIX IT"               |
+-----------------------------------------------------+
```

### Layout (Mobile, <=768px)

Single column stack: GameCanvas -> CTA -> MemoryArena -> CodeDisplay -> ReplayController

---

## Game Engine Details (`lib/game-engine.ts`)

### Core Types

```ts
interface Entity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  alive: boolean;
}

interface GameState {
  player: Entity;
  enemies: Entity[];
  bullets: Entity[];
  particles: Particle[];
  targetLock: Entity | null;    // The dangling pointer analog
  elapsed: number;              // seconds since loop start
  phase: 'playing' | 'crashing' | 'frozen';
  crashTriggered: boolean;
}
```

### Simulation Loop (per frame)

1. **Spawn enemies** — every 1.5s, spawn at random x along top
2. **Move entities** — apply velocities
3. **Collision detection** — bullet hits enemy -> enemy.health -= 1
4. **Kill and remove dead enemies** — when health <= 0:
   - In buggy mode: remove from array but keep `targetLock` pointing to it
   - In fixed mode: nullify `targetLock` first, then remove
5. **Target lock access** — if `targetLock` exists, read its position
   - In buggy mode at ~6s: this triggers the crash (accessing removed entity)
6. **Auto-pilot player** — slight left/right tracking toward nearest enemy
7. **Auto-fire** — shoot every 0.5s

### Crash Visual Effect

```ts
function renderCrashEffect(ctx: CanvasRenderingContext2D, progress: number) {
  // 0..1 progress over 2 seconds
  // Phase 1 (0-0.3): Screen tear — horizontal slice displacement
  // Phase 2 (0.3-0.6): Pixel noise — random colored rectangles
  // Phase 3 (0.6-1.0): Red tint fade + "SEGFAULT" text
}
```

---

## Memory Simulation (`lib/memory-sim.ts`)

### Timeline Events

Pre-scripted events for the crash scenario:
- T=0.0s: Alloc blocks 0-5 (Player, initial enemies)
- T=1.5s: Alloc block 6 (new enemy)
- T=3.0s: Alloc block 7 (targetLock pointer -> block 14)
- T=4.0s: Alloc blocks 8-14 (more enemies, bullets)
- T=5.5s: Free block 14 (enemy killed)
- T=6.0s: Access block 14 via targetLock -> CRASH (dangling)
- T=6.0s: Corrupt blocks 14-18

---

## Styling

### Color Palette

| Usage          | Color                  |
|---------------|------------------------|
| Background    | `#0a0a0f` (near black) |
| Surface       | `#12121a`              |
| Primary       | `#00ff88` (matrix green) |
| Danger/crash  | `#ff0040` (hot red)    |
| Warning       | `#ffaa00` (amber)      |
| Text          | `#e0e0e0`              |
| Muted text    | `#666`                 |
| Canvas bg     | `#0d0d1a`              |

### Fonts

- Headings: Inter (via Next.js font)
- Code: JetBrains Mono (monospace)
- Canvas text: monospace

### Animations

- Crash glitch: CSS `@keyframes` for screen shake on the canvas wrapper
- Memory block pulse: `@keyframes pulse` on red blocks
- Code transition: `opacity` + `transform` fade between buggy/fixed
- Button glow: subtle box-shadow pulse on CTA buttons
- Modal entrance: `scale(0.95)` -> `scale(1)` with opacity

---

## API Route (`app/api/waitlist/route.ts`)

```ts
// POST /api/waitlist
// Body: { email: string }
// Response: { success: boolean, message: string }

// Validation: email format check (regex)

// Supabase:
// - INSERT INTO waitlist (email) VALUES ($1)
// - ON CONFLICT (email) DO NOTHING
// - Return success either way
```

---

## Supabase Setup

### Table SQL

```sql
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON waitlist
  FOR INSERT TO anon
  WITH CHECK (true);
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.2",
    "react": "^18.3",
    "react-dom": "^18.3",
    "@supabase/supabase-js": "^2.45",
    "prismjs": "^1.29"
  },
  "devDependencies": {
    "typescript": "^5.5",
    "@types/react": "^18.3",
    "@types/react-dom": "^18.3",
    "@types/prismjs": "^1.26",
    "tailwindcss": "^3.4",
    "postcss": "^8.4",
    "autoprefixer": "^10.4",
    "eslint": "^8",
    "eslint-config-next": "^14.2"
  }
}
```

---

## Build Order

1. **Project scaffold** — `create-next-app`, install deps, configure Tailwind
2. **GameCanvas** — Canvas rendering, entity system, crash at 6s, glitch effect
3. **MemoryArena** — Grid rendering, color states, pointer arrows
4. **CodeDisplay** — Prism.js setup, buggy/fixed code, line highlighting
5. **ReplayController** — Timeline UI, speed control, sync hooks
6. **Main page** — State machine, layout, component wiring
7. **WaitlistModal** — Modal UI, form, validation
8. **API route** — Supabase connection, insert logic
9. **Polish** — Animations, responsiveness, edge cases
10. **Deploy** — Environment variables on Vercel, test end-to-end
