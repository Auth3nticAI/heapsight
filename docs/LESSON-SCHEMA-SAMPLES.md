# Lesson Schema Samples
Generated: 2026-02-18
Lesson module folder: `src/data/lessons/`
Type definitions: `src/types/lesson.ts`

---

## TypeScript Interface Definitions (source of truth)

From `src/types/lesson.ts`:

```typescript
export interface LessonTest {
  id: string;
  description: string;
  expectedOutput: string;
  isPattern?: boolean;           // optional — if true, expectedOutput is a regex
}

export interface LessonPart {
  title: string;
  type: "concept" | "game_builder" | "robot_builder";
  instructions: string;          // markdown string (multi-line template literal)
  starterCode: string;           // C++ source shown to student
  solutionCode: string;          // C++ source with full solution
  tests: LessonTest[];
  hints: string[];
  estimatedMinutes: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  tier: "free" | "pro";
  concepts: string[];
  part1: LessonPart;
  part2: LessonPart;
}
```

---

## Sample 1 — Earliest Space Shooter Lesson

**File:** `src/data/lessons/lesson-01-boot-the-system.ts`
**Exported symbol:** `lesson01`
**Status:** COMPLETE (full content, production-ready)

### Top-Level Fields

| Field        | Type       | Value                                                       |
|--------------|------------|-------------------------------------------------------------|
| `id`         | string     | `"01-boot-the-system"`                                      |
| `title`      | string     | `"Boot the System"`                                         |
| `description`| string     | `"Print your first game frame. Output is existence."`       |
| `order`      | number     | `1`                                                         |
| `xpReward`   | number     | `50`                                                        |
| `tier`       | string     | `"free"`                                                    |
| `concepts`   | string[]   | `["cout", "main()", "game frame", "output protocol"]`       |
| `part1`      | LessonPart | type=`"concept"`, 3 tests, 3 hints, 3 min                   |
| `part2`      | LessonPart | type=`"game_builder"`, 3 tests, 3 hints, 5 min              |

### Part1 Summary
- **title:** `"Concept: cout"`
- **type:** `"concept"`
- **instructions:** Full markdown (Mental Model, What Breaks Without This, The Fix, Key Concepts, Performance Insight, Memory Insight, Your Task, Beginner Trap, Elite Insight, Mastery Check sections — ~60 lines)
- **starterCode:** Skeleton C++ with `#include <iostream>`, blank `main()`, 3 TODO comment lines
- **solutionCode:** Complete C++, 3 `cout` statements, 8 lines
- **tests:** 3 entries, all `isPattern: true`, using regex-escaped expected output
- **hints:** 3 strings, progressive

### Part2 Summary
- **title:** `"Game: First Frame"`
- **type:** `"game_builder"`
- **instructions:** Full markdown (~30 lines), explains ENTITY protocol format
- **starterCode:** Same skeleton pattern, 4 TODO comments
- **solutionCode:** 4 `cout` lines printing game protocol output
- **tests:** 4 entries (t1: frame header, t2: ENTITY line, t3: GAME_MESSAGE, t4: SCORE)

### JSON-like Schema Outline
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "order": 1,
  "xpReward": 50,
  "tier": "free",
  "concepts": ["string", "..."],
  "part1": {
    "title": "string",
    "type": "concept",
    "instructions": "string (markdown)",
    "starterCode": "string (C++)",
    "solutionCode": "string (C++)",
    "tests": [
      { "id": "t1", "description": "string", "expectedOutput": "string", "isPattern": true }
    ],
    "hints": ["string"],
    "estimatedMinutes": 3
  },
  "part2": {
    "title": "string",
    "type": "game_builder",
    "instructions": "string (markdown)",
    "starterCode": "string (C++)",
    "solutionCode": "string (C++)",
    "tests": [
      { "id": "g1", "description": "string", "expectedOutput": "string", "isPattern": true }
    ],
    "hints": ["string"],
    "estimatedMinutes": 5
  }
}
```

---

## Sample 2 — Milestone 25 (Space Shooter)

**File:** `src/data/lessons/lesson-25-milestone-playable-loop.ts`
**Exported symbol:** `lesson25`
**Status:** COMPLETE (full content, production-ready)

### Top-Level Fields

| Field        | Type       | Value                                                                                      |
|--------------|------------|--------------------------------------------------------------------------------------------|
| `id`         | string     | `"25-milestone-playable-loop"`                                                             |
| `title`      | string     | `"Milestone: Mini Playable Loop"`                                                          |
| `description`| string     | `"25 lessons converge. Input, spawn, move, collide, damage, cleanup, render, diagnostics."`|
| `order`      | number     | `25`                                                                                       |
| `xpReward`   | number     | `300`                                                                                      |
| `tier`       | string     | `"pro"`                                                                                    |
| `concepts`   | string[]   | `["full game loop", "integration", "playable prototype", "all systems", "milestone"]`      |
| `part1`      | LessonPart | type=`"concept"`, 10 tests, 3 hints, 10 min                                                |
| `part2`      | LessonPart | type=`"game_builder"`, 11 tests, 3 hints, 15 min                                           |

### Notable Differences from Lesson 1
- `xpReward` is 300 (vs 50 for basic lessons) — milestone bonus
- `tier` is `"pro"` (vs `"free"` for early lessons)
- `tests` array has 10-11 entries (vs 3-4 for simple lessons)
- `starterCode` is ~100 lines (pre-built scaffolding with `// TODO:` stubs)
- `solutionCode` is ~120 lines (full multi-function implementation)
- Part1 and Part2 share the same expected output — both solve the same problem with different scaffolding

### Test ID Patterns
- Part1 tests: `t1` through `t10`
- Part2 (game_builder) tests: `g1` through `g11`
- All `isPattern: true` — expectedOutput contains regex-escaped strings

---

## Sample 3 — Milestone 50 (Space Shooter)

**File:** `src/data/lessons/lesson-50-milestone-playable.ts`
**Exported symbol:** `lesson50`
**Status:** COMPLETE (full content, production-ready)

### Top-Level Fields

| Field        | Type       | Value                                                                   |
|--------------|------------|-------------------------------------------------------------------------|
| `id`         | string     | `"50-milestone-playable"`                                               |
| `title`      | string     | `"Milestone: Playable Prototype"`                                       |
| `description`| string     | `"The complete playable space shooter prototype — all systems running"` |
| `order`      | number     | `50`                                                                    |
| `xpReward`   | number     | `300`                                                                   |
| `tier`       | string     | `"pro"`                                                                 |
| `concepts`   | string[]   | `["full integration", "playable prototype", "game loop", "milestone"]`  |
| `part1`      | LessonPart | type=`"concept"`, 5 tests, 3 hints, 12 min                              |
| `part2`      | LessonPart | type=`"game_builder"`, 7 tests, 3 hints, 20 min                         |

### Notable Differences
- `estimatedMinutes` grows: Part2 is 20 min (vs 5-15 for earlier lessons)
- Part2 `starterCode` is ~50 lines with a fully defined entity pool (SoA arrays)
- Part2 `solutionCode` is ~160 lines — includes a camera system, ASCII grid renderer
- `isPattern` varies: some tests have no `isPattern` field (defaults to `undefined`/falsy = exact match), while others are `true` for regex

---

## Sample 4 — Milestone 100 (Space Shooter)

**File:** `src/data/lessons/lesson-100-milestone-release.ts`
**Exported symbol:** `lesson100`
**Status:** COMPLETE (full content, production-ready)

### Top-Level Fields

| Field        | Type       | Value                                                  |
|--------------|------------|--------------------------------------------------------|
| `id`         | string     | `"100-milestone-release"`                              |
| `title`      | string     | `"Milestone: Release v1.0"`                            |
| `description`| string     | `"Tag version 1.0 — the complete Space Shooter ships"` |
| `order`      | number     | `100`                                                  |
| `xpReward`   | number     | `500`                                                  |
| `tier`       | string     | `"pro"`                                                |
| `concepts`   | string[]   | `["release", "version tagging", "final build", "ship it", "complete game"]` |
| `part1`      | LessonPart | type=`"concept"`, 9 tests, 3 hints, 15 min             |
| `part2`      | LessonPart | type=`"game_builder"`, 10 tests, 3 hints, 25 min       |

### Notable Differences
- `xpReward` is 500 — highest in the path (vs 300 for other milestones)
- Both parts have nearly identical problem — print a "release checklist" — demonstrating the concept→game_builder pattern at its most abstract
- `estimatedMinutes` Part2 = 25 — longest in path

---

## Sample 5 — Earliest RPG Lesson (TODO skeleton)

**File:** `src/data/lessons/lesson-rpg-01-boot-dungeon.ts`
**Exported symbol:** `lessonRPG01`
**Status:** SKELETON / TODO (no real content yet)

### Top-Level Fields

| Field        | Type       | Value                                                                |
|--------------|------------|----------------------------------------------------------------------|
| `id`         | string     | `"rpg-01-boot-dungeon"`                                              |
| `title`      | string     | `"Boot the Dungeon"`                                                 |
| `description`| string     | `"20x10 dungeon grid renders. Game loop skeleton is the foundation"` |
| `order`      | number     | `1`                                                                  |
| `xpReward`   | number     | `50`                                                                 |
| `tier`       | string     | `"free"`                                                             |
| `concepts`   | string[]   | `["game loop", "cout", "grid rendering", "output protocol"]`         |
| `part1`      | LessonPart | type=`"concept"`, 1 test (TODO), 1 hint (TODO), 10 min               |
| `part2`      | LessonPart | type=`"game_builder"`, 1 test (TODO), 1 hint (TODO), 15 min          |

### TODO Skeleton Pattern
```typescript
// instructions — placeholder:
`# Boot the Dungeon\n\nTODO: Add concept instructions.`

// starterCode — placeholder:
`// TODO: Add starter code`

// solutionCode — placeholder:
`// TODO: Add solution code`

// tests — single placeholder test:
[{ id: "t1", description: "TODO: Add test", expectedOutput: "TODO", isPattern: false }]

// hints — single placeholder:
["TODO: Add hints"]
```

This is the **standard skeleton format** used for all 300 unwritten lessons
(100 RPG + 100 Platformer + 100 Robot). The `id`, `title`, `description`,
`order`, `xpReward`, `tier`, and `concepts` are filled in. All code content is
marked TODO.

---

## Canonical Lesson Schema

Union of all fields found across all sampled lessons.

```typescript
interface Lesson {
  // ---- ALWAYS PRESENT ----
  id:          string;               // lesson identifier, used as route key
  title:       string;               // display name
  description: string;               // one-line summary
  order:       number;               // sort order within path (1-100)
  xpReward:    number;               // XP granted on completion (50 | 100 | 200 | 300 | 500)
  tier:        "free" | "pro";       // access level
  concepts:    string[];             // 3-6 tag strings
  part1:       LessonPart;           // concept learning part
  part2:       LessonPart;           // game builder / application part

  // ---- NO OPTIONAL FIELDS OBSERVED AT LESSON LEVEL ----
}

interface LessonPart {
  // ---- ALWAYS PRESENT ----
  title:            string;
  type:             "concept" | "game_builder" | "robot_builder";
  instructions:     string;          // markdown, can be full article or "TODO: ..."
  starterCode:      string;          // C++ source or "// TODO: Add starter code"
  solutionCode:     string;          // C++ source or "// TODO: Add solution code"
  tests:            LessonTest[];    // 1-11 entries observed; 1 TODO entry in skeletons
  hints:            string[];        // 1-3 entries observed; ["TODO: Add hints"] in skeletons
  estimatedMinutes: number;          // 3-25 observed

  // ---- NO OPTIONAL FIELDS OBSERVED AT PART LEVEL ----
}

interface LessonTest {
  // ---- ALWAYS PRESENT ----
  id:             string;            // "t1"..."t10" for part1, "g1"..."g11" for part2
  description:    string;
  expectedOutput: string;            // literal string or regex pattern string

  // ---- OPTIONAL ----
  isPattern?:     boolean;           // default: undefined (falsy = exact match)
                                     // true = expectedOutput is a regex string
}
```

### Common vs Optional Fields Summary

| Field              | Level      | Status   | Notes                                         |
|--------------------|------------|----------|-----------------------------------------------|
| `id`               | Lesson     | Required | Unique across all paths                       |
| `title`            | Lesson     | Required |                                               |
| `description`      | Lesson     | Required |                                               |
| `order`            | Lesson     | Required | Sequential 1-100 within path                  |
| `xpReward`         | Lesson     | Required | 50 (basic), 200 (advanced), 300-500 (milestone)|
| `tier`             | Lesson     | Required | Early lessons free, rest pro                  |
| `concepts`         | Lesson     | Required | 3-6 strings                                   |
| `part1`            | Lesson     | Required | Always type="concept"                         |
| `part2`            | Lesson     | Required | Always type="game_builder" or "robot_builder" |
| `title`            | LessonPart | Required |                                               |
| `type`             | LessonPart | Required | "concept"\|"game_builder"\|"robot_builder"    |
| `instructions`     | LessonPart | Required | Can be TODO placeholder                       |
| `starterCode`      | LessonPart | Required | Can be TODO placeholder                       |
| `solutionCode`     | LessonPart | Required | Can be TODO placeholder                       |
| `tests`            | LessonPart | Required | Min 1 entry (even if TODO placeholder)        |
| `hints`            | LessonPart | Required | Min 1 entry (even if TODO placeholder)        |
| `estimatedMinutes` | LessonPart | Required |                                               |
| `id`               | LessonTest | Required |                                               |
| `description`      | LessonTest | Required |                                               |
| `expectedOutput`   | LessonTest | Required |                                               |
| `isPattern`        | LessonTest | Optional | Omitted = false/exact match                   |

---

## XP Reward Observed Values

| Lesson Type             | xpReward |
|-------------------------|----------|
| Introductory / Phase 1  | 50       |
| Standard content        | 50-100   |
| Advanced content        | 200      |
| Milestone (25, 50, 75)  | 300      |
| Final milestone (100)   | 500      |

---

## Part Type Usage by Path

| Path            | Part1 type   | Part2 type      |
|-----------------|--------------|-----------------|
| Space Shooter   | "concept"    | "game_builder"  |
| Simple RPG      | "concept"    | "game_builder"  |
| Platformer      | "concept"    | "game_builder"  |
| Robot           | "concept"    | "robot_builder" |

---

## File Naming → Export Symbol → Lesson ID Mapping

| File pattern                         | Export symbol         | id field                      |
|--------------------------------------|-----------------------|-------------------------------|
| `lesson-{NN}-{slug}.ts`              | `lesson{NN}`          | `"{NN}-{slug}"`               |
| `lesson-rpg-{NN}-{slug}.ts`          | `lessonRPG{NN}`       | `"rpg-{NN}-{slug}"`           |
| `lesson-platformer-{NN}-{slug}.ts`   | `lessonPlatformer{NN}`| `"platformer-{NN}-{slug}"`    |
| `lesson-robot-{NN}-{slug}.ts`        | `lessonRobot{NN}`     | `"robot-{NN}-{slug}"`         |

---

## Instructions Section Structure (complete lessons)

Fully written lessons follow this markdown section structure:

```
# {Title}

## Mental Model
(Why this concept matters, what it maps to in reality)

## What Breaks Without This
(Visible failure state when concept is missing)

## The Fix
(The actual technique/concept introduced)

## Key Concepts
(Bullet list of syntax/API being taught)

## Performance Insight
(CPU/memory implication, data-oriented angle)

## Memory Insight
(Stack vs heap, allocation, lifetime discussion)

## Your Task
(Precise expected output, often in a code block)

## Beginner Trap
(Most common mistake in bold, explanation)

## Elite Insight
(Historical/industry reference: Doom, Carmack, etc.)

## Systems Thinking Connection  [optional]
(Cross-path echo or broader architecture point)

## Skill Reinforcement  [optional]
(Callback to prior lessons)

## Mastery Check
(Question + answer testing conceptual understanding)
```

Not all sections are present in every lesson. The most consistent are:
Mental Model, What Breaks Without This, The Fix, Your Task, Beginner Trap, Elite Insight, Mastery Check.

---

## GameLessonVariant Schema (game-templates/)

From `src/types/game.ts` and confirmed in `src/data/game-templates/space-shooter/lesson-01-game.ts`:

```typescript
interface GameLessonVariant {
  lessonId:      string;       // matches lesson.id  (e.g. "01-boot-the-system")
  instructions?: string;       // OPTIONAL — overrides lesson.part2.instructions if present
  starterCode:   string;       // C++ starter shown in game_builder part
  solutionCode:  string;       // C++ solution
  tests:         LessonTest[];
  hints:         string[];
  accumulatedCode: string;     // full running game up to this lesson
}
```

The `accumulatedCode` field is unique to GameLessonVariant (not in Lesson/LessonPart).
It holds the complete C++ source that runs in the live game preview — building on all
prior lessons to show a working game state.
