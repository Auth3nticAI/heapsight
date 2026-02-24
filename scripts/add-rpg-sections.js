const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'data', 'lessons');

// RPG voice: Construct/Nystrom — project-first, practical
// Each entry: file, and optional bt/ei/st text (only for sections that are missing)
const lessons = [
  // === ST-only needed (already have BT + EI) ===
  {
    file: 'lesson-rpg-03-command-resolution.ts',
    st: 'The Shooter path processes player input the same way: raw key state becomes an intent struct, and a separate resolve function decides what happens. Decoupling input from action lets you swap control schemes without touching game logic.'
  },
  {
    file: 'lesson-rpg-06-enemy-on-grid.ts',
    st: 'The Platformer places enemies at grid-aligned positions too (Lesson 47), but converts to pixel coordinates for smooth movement. Your RPG keeps enemies in grid space permanently. Both approaches work — the key is consistency within your coordinate system.'
  },
  {
    file: 'lesson-rpg-07-combat-intent.ts',
    st: 'The Platformer uses a similar intent/action split — pressing jump sets a flag, but the physics system processes it next frame. Separating "what the player wants" from "what the game does" prevents order-dependent bugs across all genres.'
  },
  {
    file: 'lesson-rpg-08-damage-resolution.ts',
    st: 'The Shooter resolves bullet-enemy collision damage using the same "check then apply" pattern. Collect all hits first, then apply damage in a batch. This prevents the order of the entity array from affecting combat outcomes.'
  },
  {
    file: 'lesson-rpg-09-death-and-cleanup.ts',
    st: 'The Shooter marks dead entities with an active flag and skips them during updates, deferring actual removal to a cleanup pass. This deferred-removal pattern prevents iterator invalidation across every game genre.'
  },
  {
    file: 'lesson-rpg-11-world-state-struct.ts',
    st: 'The Platformer groups its game state into a single struct too — Level, Player, Enemies all live under one GameState. When you pass one struct instead of six globals, every function signature tells you exactly what data it touches.'
  },
  {
    file: 'lesson-rpg-12-types-and-coordinates.ts',
    st: 'The Crawler uses explicit 3D coordinate types (Vector3) to prevent mixing world-space and screen-space positions. Type safety catches coordinate bugs at compile time instead of letting them become visual glitches at runtime.'
  },

  // === BT + ST needed (already have EI) ===
  {
    file: 'lesson-rpg-71-profiling-timers.ts',
    bt: '**Profiling in debug mode only.** Debug builds add overhead that skews measurements. Always profile with optimization enabled (-O1 or higher). The hot path in debug might not be the hot path in release.',
    st: 'Shooter L71 and Platformer L71 add the same per-system profiling timers. Measuring each pass independently is universal — you cannot optimize what you have not measured, regardless of game genre.'
  },
  {
    file: 'lesson-rpg-72-hot-path-cleanup.ts',
    bt: '**Optimizing code that profiling shows is already fast.** If the resolve pass takes 0.1ms and the render pass takes 4ms, optimizing resolve is wasted effort. Fix the hot path first, leave cold code alone.',
    st: 'The Platformer audits its hot path the same way (L72). The main game loop is where 90% of frame time goes. Every path converges on the same lesson: profile first, then optimize only what the data says matters.'
  },
  {
    file: 'lesson-rpg-73-spatial-queries.ts',
    bt: '**Checking every entity against every other entity (O(n squared)) when a spatial structure gives O(n).** A grid lookup for "entities at position (x,y)" is constant time. The brute-force approach hides at low counts and explodes at scale.',
    st: 'The Shooter uses a spatial grid (L36), the Crawler uses spatial hashing (L54). Same problem, different data structures — all three paths need fast "what is near this position?" queries to keep frame times stable.'
  },
  {
    file: 'lesson-rpg-74-pool-audit.ts',
    bt: '**Setting pool capacity too small and silently falling back to heap allocation.** A pool that overflows defeats its purpose. Track peak usage and set capacity to peak + margin. Assert on overflow during development.',
    st: 'Platformer L74 audits the same metrics — pool utilization, peak usage, and waste ratio. Pool sizing is a universal optimization problem: too small wastes the guarantee, too large wastes memory.'
  },
  {
    file: 'lesson-rpg-75-milestone-stress-dungeon.ts',
    bt: '**Only testing with 5 entities when the game will have 50.** Performance problems hide at low entity counts. Stress testing early reveals the scaling cliff before players find it for you.',
    st: 'Shooter L75 runs the same stress test with 200+ entities on screen. Both paths prove the same thing: your architecture handles peak load without dropping frames. The entity count differs, the principle is identical.'
  },
  {
    file: 'lesson-rpg-76-command-pattern-formal.ts',
    bt: '**Making commands mutable after creation.** Commands should be immutable data describing an intent. If you modify a command after queueing it, the resolve pass sees different data than what was queued. Treat commands as sealed envelopes.',
    st: 'The Platformer maps keyboard input to action commands the same way — decouple "what happened" from "what to do." The command pattern is the backbone of undo systems, replay systems, and networked games across every genre.'
  },
  {
    file: 'lesson-rpg-77-observer-for-ui.ts',
    bt: '**Polling game state every frame from the UI layer.** If nothing changed, you are wasting cycles rebuilding the same display. Push events when state changes, and only redraw what the event affects.',
    st: 'The Shooter HUD (L38) uses the same observer pattern — score display updates only when the score changes, not every frame. Event-driven UI is more efficient and scales better than polling in every game genre.'
  },
  {
    file: 'lesson-rpg-78-strategy-as-tables.ts',
    bt: '**Hardcoding behavior in a switch statement when a lookup table is cleaner.** Each new enemy type means another case branch. A data table lets you add behavior by adding a row, not by editing logic code.',
    st: 'The Shooter enemy types (L42) use data tables too — each enemy type is a row of stats (speed, HP, score value), not a class. Data-driven design is the professional pattern for content that designers need to tune.'
  },
  {
    file: 'lesson-rpg-79-factory-for-spawns.ts',
    bt: '**Copy-pasting entity creation code for each enemy type.** One change (like adding a new field) requires updating every copy. A factory function creates entities from type IDs — one creation path, many entity types.',
    st: 'The Shooter wave spawner (L37) is a factory — it creates enemies from type IDs and a position, without knowing the details of each type. The factory pattern scales to any number of entity types across all game architectures.'
  },
  {
    file: 'lesson-rpg-80-milestone-content-pack.ts',
    bt: '**Adding content without regression testing.** New items, enemies, or rooms can break existing balance or trigger edge cases. Add content, run the full test suite, verify nothing regressed.',
    st: 'Platformer L80 and Shooter L80 validate the same thing — new content must not break existing systems. The "content pack" milestone proves your architecture separates data from code cleanly.'
  },

  // === BT + EI + ST needed ===
  {
    file: 'lesson-rpg-00-test-wasm.ts',
    bt: '**Skipping the diagnostic test because "it will probably work."** Pipeline failures are invisible until you try to compile. Run the smoke test first — if the WASM pipeline is broken, nothing else matters.',
    ei: 'Professional game studios run automated smoke tests before every coding session. CI/CD pipelines compile, link, and run a minimal executable to verify the toolchain. Your pipeline test follows the same principle.',
    st: 'Every path in this curriculum starts with a pipeline test. Shooter, Platformer, and Crawler all verify their WASM compilation before writing game code. Toolchain validation is universal — genre is irrelevant if the build is broken.'
  },
  {
    file: 'lesson-rpg-10-milestone-micro-dungeon.ts',
    bt: '**Rushing to add features before verifying the core loop works.** A milestone is a checkpoint, not a speedbump. If move-attack-kill-win does not work perfectly with one enemy, adding more enemies will not fix it.',
    ei: 'Minecraft started as a tiny room you could walk around in. Spelunky started as a single screen. Every successful game begins with a micro prototype that proves the core loop is fun before scaling up.',
    st: 'Every path has this milestone — Shooter L10, Platformer L10, Crawler L10 all validate their core loop before building on it. The micro prototype pattern is universal: prove the foundation before adding floors.'
  },
  {
    file: 'lesson-rpg-13-entity-ids-v0.ts',
    bt: '**Using array index as entity ID.** When you remove entity at index 3 and shift the array, entity 4 becomes index 3. Every reference to "entity 4" now points to the wrong entity. Use stable integer IDs instead.',
    ei: 'Unity ECS uses generation counters alongside entity IDs to detect stale references. Each slot has a version number that increments on reuse. If your stored version does not match, the reference is dead.',
    st: 'Shooter L13 solves the same problem for bullets and enemies — stable IDs that survive array compaction. The Crawler assigns 3D entity IDs the same way. Stable identity is a prerequisite for any system that references entities.'
  },
  {
    file: 'lesson-rpg-14-soa-components-v0.ts',
    bt: '**Storing all entity data in one big struct (Array of Structs) when you only need to iterate positions.** AoS loads HP, inventory, and AI data into cache just to read x and y. SoA keeps positions contiguous for fast iteration.',
    ei: 'Data-oriented design (DOD) powers every modern ECS engine — EnTT, flecs, Unity DOTS all use SoA layouts internally. Cache-friendly data access is the single biggest performance win in entity-heavy games.',
    st: 'Shooter L14 formalizes the same SoA split for bullets: position[], velocity[], active[] as parallel arrays. Both paths discover the same truth — memory layout determines iteration speed more than algorithm choice.'
  },
  {
    file: 'lesson-rpg-15-milestone-stable-update-order.ts',
    bt: '**Not testing update order explicitly.** The game "works" today, but adding a new system changes the order and breaks behavior. Print the pass sequence and verify it matches the spec every build.',
    ei: 'Fixed update ordering is a core guarantee in Unreal (tick groups) and Unity (script execution order). Professional engines let you declare "system A runs before system B" explicitly. Your ordered pass list is the same concept.',
    st: 'Platformer L15 hits the same milestone — stable update order is a prerequisite for deterministic replay. If pass order can change between runs, replay diverges. Every path enforces this before moving forward.'
  },
  {
    file: 'lesson-rpg-16-command-queue-formalized.ts',
    bt: '**Processing commands immediately instead of queuing them.** If "move north" triggers a trap that kills the player, and you process "use potion" next, the potion heals a dead player. Queue all commands, then resolve in order.',
    ei: 'StarCraft and Age of Empires batch all player commands into lockstep frames for networking. Each frame processes a fixed command buffer. Your command queue is the single-player version of the same architecture.',
    st: 'The Shooter uses an event queue for collision events — batch all hits detected this frame, then resolve after all checks complete. Command batching prevents order-dependent bugs in every game genre.'
  },
  {
    file: 'lesson-rpg-17-resolve-pass-isolated.ts',
    bt: '**Mixing movement resolution with rendering.** If you draw an entity, then move it, the drawn position is one frame behind. Resolve ALL movement first, then render the final positions. Separate concerns, separate passes.',
    ei: 'ECS architectures run movement systems before render systems, guaranteeing visual consistency. The system ordering is: Input > Movement > Collision > Render. Your isolated resolve pass follows the same pipeline.',
    st: 'Platformer L33 isolates its physics module from rendering the same way. The Shooter splits movement into its own system (L33). Every path converges on the same architecture: resolve first, render second.'
  },
  {
    file: 'lesson-rpg-18-combat-pass-isolated.ts',
    bt: '**Applying damage during the entity loop that checks for combat.** Modifying HP while iterating means later entities see different state than earlier ones. Collect all combat events first, then apply damage in a separate pass.',
    ei: 'Turn-based games from Civilization to Final Fantasy batch damage calculation before application. Simultaneous resolution means attack order does not affect outcome — both fighters deal damage at the same time.',
    st: 'Shooter L34 collects all collision hits first, then applies damage in a separate pass. The pattern is identical: separate detection from resolution so that iteration order cannot affect gameplay outcomes.'
  },
  {
    file: 'lesson-rpg-19-cleanup-pass-isolated.ts',
    bt: '**Removing dead entities during the main update loop.** Deleting element i while iterating from 0 to n skips element i+1 (it shifts down to index i). Defer all removals to a dedicated cleanup pass after updates complete.',
    ei: 'Most ECS frameworks defer entity destruction to end-of-frame cleanup. Unity marks entities for destruction with Destroy(), but the actual removal happens after all systems finish. Your cleanup pass follows the same lifecycle.',
    st: 'The Shooter uses pool-based recycling with the same deferred pattern — mark entities dead during gameplay, reclaim slots during cleanup. Deferred removal is the safest entity lifecycle pattern across all game types.'
  },
  {
    file: 'lesson-rpg-20-milestone-room-transition.ts',
    bt: '**Not resetting entity state when changing rooms.** If enemies from room A persist into room B, the player fights ghosts from a previous room. Clear the entity table on room load, then spawn fresh entities from the room data.',
    ei: 'Zelda: A Link to the Past loads room data from ROM on each screen transition, fully resetting the entity table. Enemies respawn when you re-enter a room. Your room transition follows the same load-and-reset pattern.',
    st: 'Platformer L16-L20 handles level transitions the same way — clear old state, load new level data, spawn entities. The Crawler loads dungeon floors (L49). State reset on transition is universal across all exploration games.'
  },
  {
    file: 'lesson-rpg-21-deterministic-rng-v0.ts',
    bt: '**Using rand() without seeding first.** Without a seed, behavior differs every run, making bugs unreproducible. Worse, some platforms seed rand() to the same value by default, hiding the problem until deployment.',
    ei: 'Spelunky and Minecraft both use seeded RNG so players can share and replay specific worlds. A "seed" field in the UI lets players type a world code. Deterministic generation from a single seed is an industry standard.',
    st: 'Every path implements deterministic RNG — Shooter, Platformer, and Crawler all use seeded generators. If your game cannot reproduce the same sequence from the same seed, replay and networking are impossible.'
  },
  {
    file: 'lesson-rpg-22-no-rand-rule.ts',
    bt: '**Calling rand() directly in gameplay code instead of the game RNG function.** One stray rand() call breaks determinism silently. The bug is invisible until a replay diverges hundreds of frames later.',
    ei: 'Factorio bans all non-deterministic calls in gameplay code — their multiplayer depends on perfect lockstep. A single desync crashes the session. Your no-rand rule enforces the same discipline at a smaller scale.',
    st: 'The Shooter enforces the same rule — all randomness routes through GameRNG, never through rand(). The Platformer and Crawler follow suit. This discipline is a prerequisite for replay in every path.'
  },
  {
    file: 'lesson-rpg-23-state-signature-v0.ts',
    bt: '**Hashing only some fields.** If you skip enemy HP or item counts, state divergence in those fields goes undetected. Hash EVERY gameplay-relevant field. If it affects outcomes, it must be in the signature.',
    ei: 'Lockstep networking games like Age of Empires hash the full game state every frame to detect desynchronization. If two clients produce different hashes, one has diverged and the game pauses to resync.',
    st: 'Platformer L23 implements the same state signature — hash all gameplay state each frame. The Shooter and Crawler do it too. State hashing is the universal tool for detecting determinism bugs across all paths.'
  },
  {
    file: 'lesson-rpg-24-save-file-v0.ts',
    bt: '**Writing raw structs to disk with fwrite().** Struct padding and field alignment differ between compilers and platforms. A save file from one build may be garbage on another. Serialize field by field in a defined order.',
    ei: 'Bethesda save files (Skyrim, Fallout) use tagged key-value pairs so new fields do not break old saves. Each field has a string tag and a type marker. Your explicit field-by-field write is the simplified version of this approach.',
    st: 'Every path implements save/load — Platformer uses checkpoint-based saves (L24), Shooter saves high scores and progress. The serialization pattern is identical: write fields in order, read them back in the same order.'
  },
  {
    file: 'lesson-rpg-25-milestone-restart-resume.ts',
    bt: '**Not testing the load path until late in development.** A save file that cannot be loaded is useless, but you will not know until you try. Test save-then-load immediately — round-trip verification catches serialization bugs early.',
    ei: 'Dark Souls uses bonfires as specialized save/load checkpoints — save full state on rest, restore on death. The core guarantee is: quit at any bonfire, resume exactly where you left off. Your milestone tests the same guarantee.',
    st: 'Platformer L25 tests the same round-trip — quit and resume without data loss. Every path hits this milestone because save/load integrity is a non-negotiable shipping requirement for any game with progression.'
  },
  {
    file: 'lesson-rpg-26-inventory-v0.ts',
    bt: '**Using item name strings as identifiers.** "Health Potion" vs "health_potion" vs "HealthPotion" all look different to strcmp(). Use integer IDs internally. Names are display-only strings looked up from a table.',
    ei: 'Diablo II stores items as numeric IDs internally — names are display strings looked up from a localization table. This makes translation trivial: change the name table, not the game logic. Your ID-based inventory follows the same architecture.',
    st: 'Crawler L48 implements loot tables with the same ID-based approach — items are data entries, not hardcoded strings. The Shooter uses powerup type IDs (L43). Integer-keyed item systems scale across every game genre.'
  },
  {
    file: 'lesson-rpg-27-items-as-ids.ts',
    bt: '**Storing full item objects in the inventory instead of IDs.** Duplicating item data (name, stats, description) for every stack wastes memory and makes comparison expensive. Store the ID, look up the data when needed.',
    ei: 'MMOs like World of Warcraft store inventory as (item_id, quantity, modifier_flags) tuples, never full item objects. The item database is shared and read-only. Your items-as-IDs approach follows the same pattern.',
    st: 'Shooter powerups (L43) use the same pattern — a powerup type ID triggers a lookup into a stats table. The Platformer stores pickup types as integers too. ID-based references prevent data duplication across all game systems.'
  },
  {
    file: 'lesson-rpg-28-loot-drop-deterministic.ts',
    bt: '**Rolling loot with rand() instead of the game RNG.** One non-deterministic loot roll breaks replay and makes save/load produce different items. All randomness — including loot — must flow through GameRNG.',
    ei: 'Diablo III uses data-driven loot tables — designers edit drop rates in spreadsheets, and the game reads them at runtime. Loot generation is a pure function: (enemy_type, rng_state) -> item_id. Your deterministic drops follow the same model.',
    st: 'Shooter L37 uses deterministic RNG to place wave enemies — same seed produces the same wave layout. The Crawler generates dungeon layouts from seeds (L45). Deterministic content generation is the foundation of replayable games in every path.'
  },
  {
    file: 'lesson-rpg-29-allocation-counter.ts',
    bt: '**Allocating inside the game loop without realizing it.** One new/malloc per frame means 3600 allocations per minute at 60fps. Each allocation is a potential stall. Count allocations per frame and drive the number to zero.',
    ei: 'Doom and Quake pre-allocate all memory at startup — zero heap allocations during gameplay. John Carmack called heap allocation in the hot path "a bug." Your allocation counter makes this discipline measurable.',
    st: 'Shooter L28 tracks the same metric — allocations per frame must be zero for consistent frame times. Platformer L28 does the same. Heap discipline is a cross-path gate that every path must pass.'
  },
  {
    file: 'lesson-rpg-30-gate-a-heap-freeze.ts',
    bt: '**Thinking zero allocations means no dynamic data.** You can still use pre-allocated pools, ring buffers, and fixed arrays. The rule is not "no dynamic data" — it is "no dynamic memory requests during gameplay."',
    ei: 'Embedded systems and real-time audio engines follow the same rule — all allocation happens at init time, and the runtime operates on pre-allocated buffers. Heap freeze is an engineering discipline, not a limitation.',
    st: 'Shooter L30 and Platformer L30 hit the same gate — heap freeze is a universal performance guarantee. The Crawler passes it too (L30). Zero allocations in the hot loop is the shared quality bar across all four paths.'
  },
  {
    file: 'lesson-rpg-81-hud-v2.ts',
    bt: '**Drawing HUD elements at hardcoded pixel positions.** If you later change the window size or add a panel, every coordinate breaks. Use anchor-relative positions (top-left + offset, bottom-right + offset) that adapt to layout changes.',
    ei: 'Professional game engines use anchor-based UI layouts that scale with resolution. Unreal UMG and Unity Canvas both position elements relative to screen edges and parent containers, not absolute pixel coordinates.',
    st: 'Shooter L81 redesigns its HUD the same way — anchored layout instead of absolute coordinates. Platformer L81 adds the same information hierarchy. HUD architecture patterns are identical across all game genres.'
  },
  {
    file: 'lesson-rpg-82-combat-feedback.ts',
    bt: '**Applying visual feedback (color flash, shake) during the damage calculation pass.** Feedback is a rendering concern, not a logic concern. Emit a "hit event" from combat, and let the render pass read it. Separate data from presentation.',
    ei: 'Street Fighter uses "hit stop" — freezing both characters for 2-3 frames on impact — to sell the weight of attacks. A 2-frame freeze communicates more force than any animation. Your hit flash follows the same psychology of impact feedback.',
    st: 'Platformer L82 adds screen shake, Shooter L83 adds particle bursts on kill. All three paths solve the same UX problem: the player needs instant, visceral confirmation that their action had an effect.'
  },
  {
    file: 'lesson-rpg-83-animation-v0.ts',
    bt: '**Tying animation speed to frame rate by incrementing a frame counter each tick.** On a 120fps monitor, animations play twice as fast. Use a delta-time accumulator: add dt each frame, advance the animation frame when the accumulator exceeds the frame duration.',
    ei: 'Sprite animation in professional 2D engines uses delta-time accumulators, not raw frame counters. The animation rate is defined in seconds-per-frame, making it independent of the game update rate.',
    st: 'Platformer L84 and Shooter L84 implement the same frame-independent animation system. All paths must decouple animation timing from frame rate — the solution is always a time accumulator, never a frame counter.'
  },
  {
    file: 'lesson-rpg-84-menu-flow.ts',
    bt: '**Using global booleans (isMenuOpen, isPaused, isGameOver) instead of a state machine.** With booleans, invalid combinations are possible — isPaused AND isGameOver simultaneously. An enum state machine guarantees exactly one state at a time.',
    ei: 'Unreal Engine uses a game mode state machine: Menu > Loading > Playing > Paused > GameOver with explicit transitions. Each state has enter/exit callbacks. Your enum-based flow follows the same architecture.',
    st: 'Platformer and Shooter both implement menu flow with state machines. The pattern is universal for game UI: explicit states with guarded transitions prevent the "impossible state" bugs that booleans allow.'
  },
  {
    file: 'lesson-rpg-85-milestone-beta-quality.ts',
    bt: '**Declaring "beta" without testing all systems end-to-end.** A beta that crashes on room transition or corrupts saves is not beta-quality. Every feature path (start > play > save > load > win) must work without intervention.',
    ei: 'Valve requires every feature to be playtested by someone who did not write it. Fresh eyes find assumptions the developer cannot see. Your beta milestone follows the same principle: verified by testing, not by intent.',
    st: 'All four paths hit this milestone — beta quality means every feature works together, not just the latest one. Shooter L85, Platformer L85, and Crawler share the same integration-testing bar.'
  },
  {
    file: 'lesson-rpg-86-assist-mode.ts',
    bt: '**Bolting on accessibility after the game is done.** Assist mode should be designed into the difficulty system from the start. If damage, speed, and enemy count are not data-driven, adding an "easy mode" requires rewriting game logic.',
    ei: 'Celeste lets players tune game speed, stamina, and invincibility independently through its assist menu. The key insight: accessibility is not one toggle — it is a set of independent dials that players combine to fit their needs.',
    st: 'Shooter L87 and Platformer L87 implement the same concept — accessibility as a first-class feature, not an afterthought. Data-driven difficulty makes assist mode a configuration change, not a code change, in every path.'
  },
  {
    file: 'lesson-rpg-87-difficulty-tables.ts',
    bt: '**Hardcoding difficulty multipliers in game logic instead of a lookup table.** You cannot tune balance without recompiling. A data table lets designers adjust enemy HP, damage, and speed per difficulty level without touching code.',
    ei: 'Resident Evil 4 dynamically adjusts difficulty based on player performance using internal data tables. If the player dies repeatedly, enemy aggression decreases. Your static difficulty table is the foundation for this kind of adaptive system.',
    st: 'Shooter L86 and Platformer L86 use the same data-driven difficulty approach. The Crawler scales dungeon depth difficulty from tables (L47). Externalizing balance data is the professional standard across every genre.'
  },
  {
    file: 'lesson-rpg-88-crash-proofing.ts',
    bt: '**Only handling errors on the happy path.** Edge cases — empty inventory, zero HP, null target, out-of-bounds position — crash silently when you forget to check. Validate at every system boundary: function entry, file load, user input.',
    ei: 'Production games validate all external data at system boundaries — save files, config files, network packets. Internal data is trusted (it came from your own code), but anything from outside gets checked before use.',
    st: 'Every path implements crash-proofing with the same boundary-validation pattern. Shooter L88, Platformer L88, and Crawler all guard the same entry points: file I/O, user input, and cross-system calls.'
  },
  {
    file: 'lesson-rpg-89-refactor-hygiene.ts',
    bt: '**Refactoring multiple systems at once.** Change one thing, test, confirm behavior is preserved, then change the next thing. A multi-system refactor that introduces a bug leaves you guessing which change caused it.',
    ei: 'Martin Fowler defines refactoring as "changing code structure without changing behavior, verified by tests." Each refactoring step should be small enough that reverting it is trivial. Your hygiene pass follows this discipline.',
    st: 'All paths perform the same cleanup pass — dead code removal, naming consistency, function extraction. Shooter L89, Platformer L89, and Crawler all converge on the same hygiene checklist before shipping.'
  },
  {
    file: 'lesson-rpg-90-milestone-public-beta.ts',
    bt: '**Releasing without a regression test suite.** Features that worked yesterday may break today if a refactor touched shared code. Automated tests catch regressions that manual testing misses.',
    ei: 'Steam Early Access games maintain changelogs and automated test suites for each build. A failing test blocks the release pipeline. Your public beta milestone follows the same quality gate.',
    st: 'All four paths share this milestone — public beta means automated tests pass and the game runs crash-free. The shipping bar is identical: Shooter, Platformer, Crawler, and RPG all converge on the same criteria.'
  },
  {
    file: 'lesson-rpg-91-build-id.ts',
    bt: '**Not embedding a version in the build.** When a player reports a bug, you need to know which build they are running. Without a build ID, you cannot reproduce the issue or confirm it is fixed in a later build.',
    ei: 'Every shipped game includes build metadata — version number, commit hash, build date. Steam, Xbox, and PlayStation all require version strings in the title bar or settings screen for certification.',
    st: 'Shooter L91 and Platformer L91 embed the same build ID pattern. Version tracking is universal — every shipped product needs a way to answer "which exact build is this?" for debugging and support.'
  },
  {
    file: 'lesson-rpg-92-tests-rng.ts',
    bt: '**Testing RNG output without fixing the seed first.** If the seed changes each run, expected values change too and the test is meaningless. Pin the seed, run the generator, compare output against a known-good sequence.',
    ei: 'Monte Carlo simulations use fixed seeds to make "random" experiments reproducible. The seed is part of the test specification. Your RNG test follows the same scientific methodology — controlled randomness for repeatable results.',
    st: 'Shooter L92 tests its RNG with the same approach — fixed seed, known output sequence. Every path that implements deterministic RNG must also test it deterministically. The test pattern is identical across all paths.'
  },
  {
    file: 'lesson-rpg-93-tests-save.ts',
    bt: '**Only testing save without testing load.** A save file that cannot be loaded is useless. The correct test is a round-trip: save state, load it back, compare field by field. If any field differs, serialization is broken.',
    ei: 'Database migration testing uses the same round-trip pattern: write data in format A, read it back, verify every field matches. Serialization bugs are invisible until the round-trip test catches them.',
    st: 'Platformer and Shooter test save/load the same way — round-trip verification catches serialization bugs that manual testing misses. The pattern is universal: save, load, compare, assert equality.'
  },
  {
    file: 'lesson-rpg-94-tests-combat.ts',
    bt: '**Testing combat with random damage values.** If damage is random, test outcomes are random, and "test passed" means nothing. Pin all RNG seeds and use fixed input values so outcomes are deterministic and assertions are meaningful.',
    ei: 'Professional game studios pin damage formulas to exact values in unit tests — any change to the formula is intentional and requires updating the expected values. Tests document the design, not just verify the code.',
    st: 'Shooter L94 tests collision with the same approach — known entity positions, expected collision results, zero randomness. Deterministic inputs produce deterministic outputs, making test failures actionable in every path.'
  },
  {
    file: 'lesson-rpg-95-gate-c-zero-warnings.ts',
    bt: '**Ignoring compiler warnings because "the game runs fine."** Warnings like "unused variable" or "implicit conversion" often indicate real bugs — an unused variable might mean you forgot to use it, and sign conversion can produce negative array indices.',
    ei: 'Google and Mozilla compile production code with -Wall -Werror, treating every warning as a build-breaking error. Zero warnings is not pedantry — it is a quality standard that prevents classes of bugs from shipping.',
    st: 'All paths hit this gate — zero warnings is a universal quality bar. Shooter L95, Platformer L95, and Crawler enforce the same standard. Clean compilation is the shared prerequisite for shippable code across every path.'
  },
  {
    file: 'lesson-rpg-96-readme.ts',
    bt: '**Writing documentation after the code is finished.** By then, you have forgotten the design decisions and edge cases. Write the README as you build — it is easier to document fresh decisions than to reconstruct forgotten ones.',
    ei: 'Open source projects live or die by README quality. A clear "how to build, how to play, how it works" section drives adoption more than features. Your README is the front door of your project portfolio.',
    st: 'All paths create a README as a shipping requirement. The structure is identical: project description, build instructions, controls, architecture overview. Documentation is a universal deliverable, not optional polish.'
  },
  {
    file: 'lesson-rpg-97-screenshots.ts',
    bt: '**Taking screenshots with debug UI visible.** Grid lines, profiling timers, and collision boxes should not appear in portfolio screenshots. Disable debug rendering, capture clean gameplay, then re-enable debug tools.',
    ei: 'Steam store pages have specific requirements for screenshot dimensions and content. Publishers review screenshots for quality because they are the first thing a potential player sees. Presentation matters as much as gameplay.',
    st: 'All paths capture screenshots as part of the release pipeline. Shooter, Platformer, and Crawler all produce the same artifacts: clean gameplay captures without debug overlays, sized for portfolio presentation.'
  },
  {
    file: 'lesson-rpg-98-content-pass.ts',
    bt: '**Polishing code and visuals but leaving placeholder text.** "Enemy 1," "Test Room," and "TODO: write description" are embarrassing in a shipped game. Review every player-facing string and replace placeholders with final content.',
    ei: 'Nintendo Treehouse reviews every text string before release — typos, placeholder text, and inconsistent naming are treated as bugs. Your content pass follows the same standard: every string the player sees must be intentional.',
    st: 'All paths perform the same content pass — consistent naming, clear messaging, no placeholder text. The checklist is identical across Shooter, Platformer, Crawler, and RPG because shipping standards are universal.'
  },
  {
    file: 'lesson-rpg-99-release-checklist.ts',
    bt: '**Skipping checklist items because they seem minor.** The one you skip is the one that causes a day-one bug report. Checklists exist because humans forget things under pressure. Follow every item, check every box.',
    ei: 'NASA uses pre-launch checklists because complex systems have too many interdependencies for anyone to remember. Atul Gawande documented the same principle in surgery. Your release checklist follows the same discipline.',
    st: 'All paths use the same release checklist pattern — systematic verification before shipping. Shooter L99, Platformer L99, and Crawler L99 all converge on the same final gate: nothing ships without every box checked.'
  },
  {
    file: 'lesson-rpg-100-ship-export-ready.ts',
    bt: '**Shipping without testing on a clean machine.** "Works on my machine" is not evidence of correctness. The export-ready test runs the build from scratch, with no local state, to verify the game works for a first-time user.',
    ei: 'Valve tests every Steam release on a standardized hardware profile to catch environment-specific bugs. The "clean room" build test is the final quality gate before players see your game.',
    st: 'All paths converge at Lesson 100 — the final export. Shooter, Platformer, Crawler, and RPG all produce a standalone build ready for a portfolio. The culmination of 100 lessons of engineering discipline is a shippable game.'
  },
];

function findPart1InstructionsEnd(content) {
  const part1Idx = content.indexOf('part1:');
  if (part1Idx === -1) return -1;
  const marker = 'instructions: `';
  const instrStart = content.indexOf(marker, part1Idx);
  if (instrStart === -1) return -1;
  const openTick = instrStart + marker.length;
  let closeTick = openTick;
  while (closeTick < content.length) {
    if (content[closeTick] === '`' && content[closeTick - 1] !== '\\') break;
    closeTick++;
  }
  return closeTick;
}

let modified = 0;
let skipped = 0;
let errors = 0;

for (const lesson of lessons) {
  const filePath = path.join(dir, lesson.file);
  if (!fs.existsSync(filePath)) {
    console.log('ERROR (not found): ' + lesson.file);
    errors++;
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const insertPos = findPart1InstructionsEnd(content);
  if (insertPos === -1) {
    console.log('ERROR (no part1 instructions): ' + lesson.file);
    errors++;
    continue;
  }

  // Check what's already present
  const part1Start = content.indexOf('part1:');
  const existing = content.substring(part1Start, insertPos);
  const hasBT = /beginner trap|common mistake/i.test(existing);
  const hasEI = /elite insight|pro insight/i.test(existing);
  const hasST = /systems thinking|cross-path/i.test(existing);

  let sections = '';
  if (!hasBT && lesson.bt) sections += '\n\n## Beginner Trap\n' + lesson.bt;
  if (!hasEI && lesson.ei) sections += '\n\n## Elite Insight\n' + lesson.ei;
  if (!hasST && lesson.st) sections += '\n\n## Systems Thinking Connection\n' + lesson.st;

  if (sections === '') {
    console.log('SKIP (all present): ' + lesson.file);
    skipped++;
    continue;
  }

  content = content.substring(0, insertPos) + sections + content.substring(insertPos);
  fs.writeFileSync(filePath, content, 'utf8');
  modified++;

  // Verify the template literal is still valid (check backtick count)
  const part1Section = content.substring(content.indexOf('part1:'), content.indexOf('part2:'));
  const instrBackticks = (part1Section.match(/(?<!\\)`/g) || []).length;
  if (instrBackticks % 2 !== 0) {
    console.log('WARNING (odd backticks in part1): ' + lesson.file);
  } else {
    console.log('OK: ' + lesson.file);
  }
}

console.log('\n=== SUMMARY ===');
console.log('Modified: ' + modified);
console.log('Skipped: ' + skipped);
console.log('Errors: ' + errors);
console.log('Total: ' + lessons.length);
