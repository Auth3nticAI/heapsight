# Legacy Quarantine

This directory holds files that were removed from the canonical HeapSight
application but preserved for safety. No file here is permanently deleted.

## Contents

- `moved/` — files copied from their original paths, directory structure preserved
- Each file can be restored by copying it back to the path shown in
  `docs/cleanup/LEGACY_MOVE_MAP.md`

## Why These Files Were Quarantined

### `moved/src/data/game-templates/simple-rpg/lesson-{01-50}-rpg.ts`

These 50 files are the **old RPG game variant files** from before the RPG path
was rewritten to 100 lessons. They were previously imported by
`src/data/game-templates/simple-rpg/index.ts` under keys like
`"rpg-01-boot-system"`, `"rpg-25-mini-dungeon"`, etc.

During the RPG curriculum rewrite (2025):
- All 100 RPG lesson IDs changed (e.g. `rpg-01-boot-system` → `rpg-01-boot-dungeon`)
- `simple-rpg/index.ts` was updated to remove these imports
- The 50 `-rpg.ts` files became unreferenced (orphaned)

They are preserved here in case the old RPG content (game code) is useful as
a reference when writing the new RPG variant files.

## Restoration

To restore a file, copy it back from `legacy/moved/` to its original path
and add the corresponding import + key back to
`src/data/game-templates/simple-rpg/index.ts`.

## Date

Quarantined: 2026-02-18
