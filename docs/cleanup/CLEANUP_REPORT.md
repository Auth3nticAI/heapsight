# HeapSight Cleanup Report
Date: 2026-02-18
Engineer: Claude Code (senior repo cleanup pass)

---

## PHASE 1 — Canonical Entry Points

### App Entry Point
`src/app/` — Next.js 14 App Router
- Root layout: `src/app/layout.tsx`
- All route pages under `src/app/(dashboard)/` and `src/app/lesson/`

### Lesson Index Files (canonical databases)
| File | Path | Lessons |
|------|------|---------|
| Space Shooter | `src/data/lessons/index.ts` | 100 |
| RPG | `src/data/lessons/rpg-index.ts` | 100 |
| Platformer | `src/data/lessons/platformer-index.ts` | 100 |
| Robot | `src/data/lessons/robot-index.ts` | 100 |

### Game Template Index Files (canonical variant registries)
| File | Path | Imports |
|------|------|---------|
| Root | `src/data/game-templates/index.ts` | assembles all 4 paths |
| Space Shooter | `src/data/game-templates/space-shooter/index.ts` | lesson-01-game → lesson-100-game |
| Platformer | `src/data/game-templates/platformer/index.ts` | lesson-01-game → lesson-25-game |
| Simple RPG | `src/data/game-templates/simple-rpg/index.ts` | lesson-01-game → lesson-25-game |
| Robot | `src/data/game-templates/differential-drive-robot/index.ts` | lesson-01-robot → lesson-25-robot |

---

## PHASE 2 — Classification Results

### Classification A: ACTIVE — Keep

| File/Directory | Used By | Notes |
|---------------|---------|-------|
| `src/data/lessons/lesson-{01-100}-*.ts` | `src/data/lessons/index.ts` | 100 SS lessons, all canonical |
| `src/data/lessons/lesson-rpg-{01-100}-*.ts` | `src/data/lessons/rpg-index.ts` | 100 RPG lessons, all canonical |
| `src/data/lessons/lesson-platformer-{01-100}-*.ts` | `src/data/lessons/platformer-index.ts` | 100 platformer lessons |
| `src/data/lessons/lesson-robot-{01-100}-*.ts` | `src/data/lessons/robot-index.ts` | 100 robot lessons |
| `src/data/game-templates/space-shooter/lesson-{01-100}-game.ts` | `space-shooter/index.ts` | 100 SS variants, canonical |
| `src/data/game-templates/simple-rpg/lesson-{01-25}-game.ts` | `simple-rpg/index.ts` | 25 SS overlay variants |
| `src/data/game-templates/platformer/lesson-{01-25}-game.ts` | `platformer/index.ts` | 25 platformer variants |
| `src/data/game-templates/differential-drive-robot/lesson-{01-25}-robot.ts` | `robot/index.ts` | 25 robot variants |
| `src/data/game-templates/differential-drive-robot/lesson-titles.ts` | `learn/page.tsx`, `lesson/[id]/page.tsx` | ACTIVE — 2 runtime imports |
| All `src/app/` pages and routes | app runtime | canonical |
| All `src/components/` | app runtime | canonical |
| All `src/lib/`, `src/types/`, `src/store/` | app runtime | canonical |
| All `src/migrations/` | database | canonical SQL |

### Classification C: UNUSED — Quarantine

| File | Reason | Import Count |
|------|--------|-------------|
| `src/data/game-templates/simple-rpg/lesson-01-rpg.ts` | Not imported by any index after RPG ID rewrite | 0 |
| `src/data/game-templates/simple-rpg/lesson-02-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-03-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-04-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-05-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-06-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-07-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-08-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-09-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-10-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-11-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-12-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-13-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-14-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-15-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-16-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-17-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-18-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-19-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-20-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-21-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-22-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-23-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-24-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-25-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-26-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-27-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-28-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-29-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-30-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-31-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-32-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-33-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-34-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-35-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-36-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-37-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-38-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-39-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-40-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-41-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-42-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-43-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-44-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-45-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-46-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-47-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-48-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-49-rpg.ts` | Same | 0 |
| `src/data/game-templates/simple-rpg/lesson-50-rpg.ts` | Same | 0 |

**Total orphaned files: 50**

### Why They Are Orphaned

These files (`lesson-NN-rpg.ts`) were variant files for the **old 50-lesson RPG path**
whose lesson IDs used keys like `"rpg-01-boot-system"`, `"rpg-07-range"`, etc.

After the RPG curriculum was rewritten to 100 lessons:
- All 100 lesson IDs changed (e.g., `rpg-01-boot-dungeon` instead of `rpg-01-boot-system`)
- `simple-rpg/index.ts` was cleaned up to remove all 50 old imports
- No other file imports from `lesson-NN-rpg.ts`

The variant keys they would have provided (`"rpg-01-boot-system"` etc.) no longer
exist in any lesson's `id` field, so the `getGameVariant()` function would never
look them up even if they were still registered.

---

## PHASE 3 — Quarantine Actions

**Action taken:** All 50 orphaned files moved to `legacy/moved/` with original
path structure preserved.

See `LEGACY_MOVE_MAP.md` for the full origin → destination mapping.

**Tombstones:** Original file locations replaced with a comment redirect to
the quarantine location, so any future accidental import of a moved file
produces a helpful compiler error rather than a silent type mismatch.

---

## PHASE 4 — Build Verification

| Check | Result | Notes |
|-------|--------|-------|
| `npm run build` | PASS | Zero type errors, 24 routes generated |
| Orphan import check | PASS | Grep confirms 0 imports of moved files |
| Runtime pages | PASS | All canonical pages reference active files only |

---

## Summary

| Category | Count |
|----------|-------|
| Active files (kept) | 703+ |
| Orphaned files (quarantined) | 50 |
| Files deleted | 0 |
| Build broken | NO |

The only orphaned files in this repository are the 50 old RPG variant files
(`lesson-{01-50}-rpg.ts`) in `src/data/game-templates/simple-rpg/`. They were
identified, quarantined to `legacy/moved/`, and replaced with tombstone comments
at the original paths. The build continues to pass.
