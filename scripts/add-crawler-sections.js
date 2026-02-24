const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'data', 'lessons');

// Crawler voice: Carmack + Cherno — low-level, performance-aware, 3D-focused
// All Crawler files need BT, EI, ST
const lessons = [
  {
    file: 'lesson-crawler-01-boot-dungeon-3d.ts',
    bt: '**Placing the camera at (0,0,0) inside a wall.** If the camera starts inside geometry, the first frame renders nothing or shows inside-out faces. Always initialize the camera at a known open tile position, facing a known direction.',
    ei: 'Doom initialized the player at a map-defined spawn point with a fixed facing angle. Every 3D engine since follows this pattern: the level data tells the engine where the camera starts. Never hardcode spawn coordinates.',
    st: 'The RPG path boots a 2D grid and places the player at a known open tile. Same problem, different dimension — both paths need a valid spawn point before the first render. The Platformer spawns at a level-defined start position too.'
  },
  {
    file: 'lesson-crawler-02-look-around.ts',
    bt: '**Not clamping pitch.** Without a clamp, the camera can flip upside down when pitch exceeds 89 degrees. The view matrix degenerates at exactly 90 degrees (gimbal lock). Clamp pitch to [-89, 89] to prevent the flip.',
    ei: 'Quake was the first major game to implement true 6DOF mouse look. Carmack used Euler angles with a pitch clamp — the same approach you are implementing. Modern engines use quaternions for full rotation, but Euler angles with clamping work perfectly for FPS cameras.',
    st: 'The Platformer does not need mouse look, but the RPG could add it for a real-time mode. Camera control is a fundamental 3D skill that transfers directly to any game with a movable viewpoint, including third-person cameras.'
  },
  {
    file: 'lesson-crawler-03-wasd-walk.ts',
    bt: '**Moving along world axes instead of camera-relative axes.** If the camera faces east and you press W, the player should move east, not north. Build the forward vector from yaw angle using sin/cos, not from fixed world directions.',
    ei: 'Every FPS since Quake computes movement vectors from the camera yaw. The forward vector is (sin(yaw), 0, cos(yaw)), and the right vector is the perpendicular. This decouples movement direction from world orientation.',
    st: 'The RPG path moves on a grid — one tile per keypress, no continuous movement. The Shooter moves in 2D screen space. Your 3D movement is the most complex: camera-relative vectors projected onto the ground plane.'
  },
  {
    file: 'lesson-crawler-04-wall-collision.ts',
    bt: '**Testing collision with the final position instead of each axis separately.** Moving diagonally into a corner should slide along the wall, not stop dead. Check X movement first, resolve, then check Z movement. Axis-separated collision enables wall sliding.',
    ei: 'Doom and Quake both use axis-separated collision for wall sliding. Check X, clip X, then check Z, clip Z. This simple approach handles corners, doorways, and narrow passages without complex swept-volume math.',
    st: 'The RPG checks tiles[new_y][new_x] for wall collision — same grid lookup, but in 2D. The Platformer separates horizontal and vertical collision the same way. Axis-separated resolution is the standard pattern across all tile-based games.'
  },
  {
    file: 'lesson-crawler-05-multi-room-dungeon.ts',
    bt: '**Hardcoding room positions instead of reading them from the grid.** If you later change the grid layout, hardcoded room coordinates break. Detect rooms programmatically by scanning for connected open tiles.',
    ei: 'Wolfenstein 3D stored its entire level as a 64x64 grid with rooms defined by wall placement. The engine did not know about "rooms" — it just rendered whatever tiles the player could see. Your grid approach follows the same data-driven philosophy.',
    st: 'The RPG uses room arrays with exit tiles for transitions. The Platformer uses level arrays loaded from data. All three approaches treat the world as grid data, not hardcoded geometry — the dimension count changes, but the pattern stays the same.'
  },
  {
    file: 'lesson-crawler-15-milestone-puzzle-room.ts',
    bt: '**Triggering events every frame instead of once.** Without a one-shot guard, stepping on a pressure plate fires the event 60 times per second. Use a boolean flag: check if not triggered, fire the event, set triggered to true.',
    ei: 'Zelda dungeons use one-shot triggers for puzzle mechanics — push a block onto a switch, the door opens once and stays open. The "one-shot guard" is a fundamental game design pattern found in every puzzle game.',
    st: 'The RPG uses one-shot triggers for room transitions and loot pickups. The Shooter uses them for powerup collection. One-shot activation is a universal pattern — fire once, set a flag, never fire again.'
  },
  {
    file: 'lesson-crawler-16-sphere-collision.ts',
    bt: '**Using the sphere center for distance checks instead of the nearest point on the AABB.** A sphere can overlap an AABB corner without the center being inside the box. Always find the closest point on the AABB to the sphere center, then check distance.',
    ei: 'The nearest-point sphere-AABB test is the standard 3D collision primitive. Unreal, Unity, and Bullet Physics all implement this exact algorithm. The clamp-then-distance approach generalizes to sphere vs any convex shape.',
    st: 'The Platformer uses AABB-AABB collision (rectangle overlap). The RPG uses grid-cell checks. Your sphere-AABB test is the 3D equivalent — different geometry, same "find overlap, then resolve" pattern.'
  },
  {
    file: 'lesson-crawler-17-slope-detection.ts',
    bt: '**Snapping the player to floor height every frame without smoothing.** Abrupt Y changes when crossing slope boundaries feel jarring. Interpolate the player Y toward the target floor height over a few frames for smooth transitions.',
    ei: 'Quake used a ground-trace approach: cast a ray downward from the player, find the floor height, then adjust the player Y. Modern engines do the same with swept-capsule traces. Your height-map lookup is the simplified grid version.',
    st: 'The Platformer handles elevation through gravity and jump arcs — continuous vertical movement. Your height map is the discrete equivalent: the floor tells the player where to stand. Both paths solve "where is the ground?" with different methods.'
  },
  {
    file: 'lesson-crawler-18-moving-platforms.ts',
    bt: '**Not applying the platform velocity to the player.** If the player stands on a moving platform but only uses their own velocity, they slide off. Add the platform delta-position to the player position each frame while standing on it.',
    ei: 'Half-Life 2 tracks which entity the player is "parented" to and applies the parent entity velocity to the player. This relative-motion approach works for elevators, trains, and any moving surface the player can ride.',
    st: 'The Platformer implements moving platforms (L38) with the same relative-motion pattern in 2D. The problem is identical: detect "standing on," apply platform delta, release when the player jumps. Dimension count does not change the logic.'
  },
  {
    file: 'lesson-crawler-19-key-lock-system.ts',
    bt: '**Checking key ownership in the rendering code instead of the game logic.** Doors should become passable when the key is consumed, not when the renderer changes the sprite. Separate the state change (key consumed, door unlocked) from the visual change (door sprite removed).',
    ei: 'Doom color-coded keys and doors — red key opens red doors. The key-lock system is a state gate: possession of item X transitions door Y from locked to unlocked. Your implementation follows the same classic FPS design pattern.',
    st: 'The RPG implements inventory-gated progression the same way — specific items unlock specific encounters or areas. The key-lock pattern is a universal game design primitive: gate progress behind item acquisition.'
  },
  {
    file: 'lesson-crawler-20-milestone-multi-floor.ts',
    bt: '**Not resetting entity state when loading a new floor.** Enemies, items, and triggers from the previous floor persist as ghost data. Clear all entity arrays before populating the new floor from its data source.',
    ei: 'Diablo clears and regenerates each dungeon floor on entry. Entity state is not preserved between floors — each floor is a fresh procedural generation from a floor seed. Your milestone follows the same clean-load pattern.',
    st: 'The RPG room transition milestone (L20) resets entity state the same way. The Platformer clears the level on transition. Every exploration game must answer: "what happens to old entities when the player moves to a new area?"'
  },
  {
    file: 'lesson-crawler-21-ambient-light.ts',
    bt: '**Using a single brightness value for all tiles regardless of distance.** Without distance-based shading, the dungeon looks flat. Multiply tile color by a factor that decreases with distance from the camera to create depth perception.',
    ei: 'Wolfenstein 3D shaded walls by distance — farther walls were drawn darker. This distance-based dimming is the simplest form of atmospheric lighting and predates real lighting calculations. It remains effective for creating depth in grid-based 3D.',
    st: 'The RPG uses color tinting for different tile types but has no distance shading. The Shooter does not need depth cues in 2D. Your 3D dungeon is the first path to implement spatial lighting — a technique unique to 3D rendering.'
  },
  {
    file: 'lesson-crawler-22-point-light.ts',
    bt: '**Using linear falloff instead of inverse-square.** Linear falloff (1 - d/range) looks unnaturally uniform. Inverse-square falloff (1 / (1 + d*d)) concentrates light near the source and fades quickly, matching real-world physics and looking natural.',
    ei: 'Real light follows the inverse-square law: intensity = 1/d squared. Doom approximated this with lookup tables. Modern engines compute it per-pixel in shaders. Your CPU-side approximation achieves the same visual result for a grid-based world.',
    st: 'The RPG has no lighting system — all tiles are uniformly lit. The Platformer uses background layers for atmosphere. Your point light system is 3D-specific: lighting in tile-based 3D creates atmosphere that 2D games achieve through art alone.'
  },
  {
    file: 'lesson-crawler-23-multiple-lights.ts',
    bt: '**Replacing the current light value instead of accumulating.** If two torches illuminate the same tile, the second torch overwrites the first. Accumulate: tile_light = max(tile_light, new_light) or tile_light += new_light (clamped to 1.0).',
    ei: 'Forward rendering accumulates light contributions per pixel — each light adds its contribution. Deferred rendering stores surface data first, then applies all lights in a screen-space pass. Your per-tile accumulation is the grid-based forward approach.',
    st: 'The RPG could add torch lighting to its dungeon grid using the same per-cell accumulation. Light accumulation is a spatial problem: "how much light reaches this position?" The data structure (grid cell vs pixel) changes, but the algorithm is the same.'
  },
  {
    file: 'lesson-crawler-24-torch-flicker.ts',
    bt: '**Using rand() for flicker, producing different results every playthrough.** Flicker should use the game RNG so replays produce identical lighting. Cosmetic randomness still needs determinism if you record or replay game state.',
    ei: 'Dark Souls torches flicker with a pre-computed noise table, not real-time random. The table loops seamlessly and produces consistent results. Your deterministic flicker follows the same principle: predictable "randomness" for visual effects.',
    st: 'The RPG enforces the no-rand rule for all gameplay randomness (L22). Your flicker faces the same question: is visual randomness "gameplay?" If replays include visual state, the answer is yes. The Shooter decides the same for particle effects.'
  },
  {
    file: 'lesson-crawler-25-milestone-atmospheric-dungeon.ts',
    bt: '**Adding atmosphere without testing performance.** Multiple lights, fog, and color zones each add computation per tile per frame. Profile the render pass before and after atmospheric effects to ensure frame times stay under budget.',
    ei: 'Professional studios budget frame time per system: 2ms for physics, 4ms for rendering, 1ms for AI. If atmospheric effects push rendering over budget, you optimize or simplify. Your milestone should include a performance check alongside the visual check.',
    st: 'The Shooter hits a similar milestone with its visual effects (L85). The Platformer adds parallax and particles. Every path must balance visual richness against frame budget — atmosphere that drops FPS below 60 is worse than no atmosphere.'
  },
  {
    file: 'lesson-crawler-26-fog.ts',
    bt: '**Applying fog before lighting.** If fog darkens a tile and then lighting brightens it, the fog effect is cancelled. Apply lighting first (base color * light), then blend the lit color toward the fog color based on distance.',
    ei: 'OpenGL and DirectX apply fog as a post-lighting blend: final_color = lerp(lit_color, fog_color, fog_factor). The order matters because fog represents atmospheric scattering of already-lit surfaces. Your fog lerp follows the same pipeline order.',
    st: 'The Platformer uses parallax backgrounds for depth. The Shooter has no depth fog in 2D. Fog is a 3D-specific technique that your Crawler shares with every first-person game from Quake to modern titles — distance-based color blending.'
  },
  {
    file: 'lesson-crawler-27-color-zones.ts',
    bt: '**Using a single global tint instead of per-zone tints.** A dungeon with one color is monotonous. Different zones (cave, crypt, sewer) should have distinct tints applied per-tile based on which zone the tile belongs to.',
    ei: 'Diablo II uses palette-shifted tilesets for different dungeon areas — the same geometry with different color palettes creates visual variety. Your per-zone tint achieves the same result without requiring separate art assets.',
    st: 'The RPG could apply zone-based tinting to differentiate dungeon areas visually. The Shooter uses background color to distinguish wave phases. Color-based environmental storytelling works in any game with distinct areas.'
  },
  {
    file: 'lesson-crawler-28-dynamic-light.ts',
    bt: '**Updating dynamic light position after rendering.** If the player moves and you update the light after drawing, the light lags one frame behind. Update dynamic light positions during the update pass, before the render pass.',
    ei: 'Doom 3 revolutionized dynamic lighting by computing per-pixel shadows in real time. Your player light is simpler — a moving point light with no shadows — but follows the same principle: light position tracks entity position every frame.',
    st: 'The RPG has no dynamic lighting. The Shooter has no 3D lighting at all. Dynamic light is uniquely impactful in 3D — it reveals geometry, creates tension, and guides the player through space in ways that 2D games achieve through sprite art.'
  },
  {
    file: 'lesson-crawler-29-alloc-counter.ts',
    bt: '**Ignoring small allocations because "they are just a few bytes."** One allocation per frame at 60fps is 3600 allocations per minute. The allocator overhead (lock, search, bookkeeping) matters more than the allocation size. Count everything.',
    ei: 'Doom and Quake pre-allocate all memory at startup using a zone allocator. Zero heap allocations during gameplay is not a suggestion — it is a hard engineering constraint for consistent frame times. Your allocation counter measures this discipline.',
    st: 'The RPG (L29) and Shooter (L28) track the same metric. Allocation counting is universal: every path must prove zero heap activity during gameplay. The gate is identical across all four paths because the performance impact is the same.'
  },
  {
    file: 'lesson-crawler-30-gate-a-heap-freeze.ts',
    bt: '**Confusing "no allocations" with "no dynamic data."** Pre-allocated pools, ring buffers, and fixed arrays all provide dynamic behavior without heap allocation. The rule is not "static only" — it is "allocate at init, reuse at runtime."',
    ei: 'Real-time audio and embedded systems follow the same heap-freeze discipline. All memory is allocated during initialization, and the runtime operates on pre-allocated buffers. Game engines adopted this from aerospace and audio engineering.',
    st: 'RPG L30, Shooter L30, and Platformer L30 hit the same gate. Heap freeze is the most universal quality bar in this curriculum — all four paths must prove zero allocations in the game loop before advancing.'
  },
  {
    file: 'lesson-crawler-31-billboard-sprites.ts',
    bt: '**Rotating the billboard to face the camera using the full 3D direction.** Billboards should only rotate around the Y axis (yaw) to face the camera. If you include pitch, the sprite tilts when the player looks up or down, breaking the illusion.',
    ei: 'Doom rendered all sprites as camera-facing billboards — 2D images that always face the player. This technique is still used for particles, distant trees, and NPCs in modern games. Your DrawBillboard call implements the same classic technique.',
    st: 'The RPG and Shooter render entities as 2D sprites on a 2D canvas — no billboard math needed. Billboard sprites are the bridge between 2D art and 3D worlds, and they are unique to 3D game rendering.'
  },
  {
    file: 'lesson-crawler-32-enemy-on-grid.ts',
    bt: '**Placing enemies at grid centers without converting to world coordinates.** Grid position (5, 3) is not the same as world position (5.0, 0.5, 3.0). Convert grid coordinates to world coordinates by adding 0.5 to center the entity in the tile.',
    ei: 'Wolfenstein 3D stored enemy positions as grid coordinates and converted to world space for rendering. The grid-to-world conversion (multiply by tile size, offset by half) is a fundamental operation in every tile-based 3D game.',
    st: 'The RPG places enemies at grid positions and renders at pixel positions using the same grid-to-screen conversion. The coordinate systems differ (2D tiles vs 3D cubes) but the conversion pattern is identical.'
  },
  {
    file: 'lesson-crawler-33-enemy-facing.ts',
    bt: '**Computing atan2 with arguments in the wrong order.** atan2(dx, dz) and atan2(dz, dx) produce different angles. In a Y-up 3D coordinate system with Z forward, use atan2(dx, dz) for yaw. Swapping arguments rotates enemies 90 degrees.',
    ei: 'The atan2 function maps a 2D direction vector to an angle. It handles all four quadrants correctly, unlike atan which only covers [-90, 90]. Every 3D game uses atan2 for direction calculations — it is the fundamental tool for "face toward target."',
    st: 'The RPG computes enemy facing with simpler grid-relative directions (north, south, east, west). The Shooter uses atan2 for aiming direction in 2D. Your 3D facing calculation is the full-precision version of the same direction-to-angle conversion.'
  },
  {
    file: 'lesson-crawler-34-enemy-ai-patrol.ts',
    bt: '**Checking arrival with exact equality (pos == target) instead of distance threshold.** Floating-point positions rarely land exactly on the target. Check if distance < threshold (e.g., 0.1). Exact equality causes enemies to overshoot and never stop.',
    ei: 'Waypoint-based patrol is the simplest AI behavior in every game genre. Professional engines implement it as a state machine: move toward current waypoint, on arrival switch to next waypoint. Your lerp-based approach is the same pattern with smooth interpolation.',
    st: 'The RPG moves enemies one grid cell per turn — no interpolation needed. The Shooter enemies move continuously in 2D. Your 3D patrol interpolates between waypoints in world space, adding smooth motion that grid-based movement does not require.'
  },
  {
    file: 'lesson-crawler-35-milestone-living-dungeon.ts',
    bt: '**Declaring the milestone complete without testing all enemy states.** If enemies patrol, they must also handle blocked paths, reached-final-waypoint, and respawn. Test every state transition, not just the happy path.',
    ei: 'Valve uses "playtesting pyramids" — test the core behavior first, then edge cases, then stress cases. A "living dungeon" milestone means entities behave correctly under all conditions, not just the demo scenario.',
    st: 'The RPG milestone (L10) validates the full turn pipeline. The Shooter milestone (L10) validates the core shoot-and-dodge loop. Every path has "proof-of-life" milestones that verify systems work together before building on them.'
  },
  {
    file: 'lesson-crawler-36-line-of-sight.ts',
    bt: '**Casting a ray through tile centers instead of along the actual line.** A Bresenham-style ray that only visits tile centers can miss thin walls between tiles. Step through the grid at sub-tile intervals to catch all wall crossings.',
    ei: 'Wolfenstein 3D cast rays through a DDA (Digital Differential Analyzer) grid traversal — stepping through grid cells along the ray direction. This algorithm is exact for axis-aligned walls and runs in O(grid_distance) time.',
    st: 'The RPG has no line-of-sight — enemies see through walls. The Platformer has no visibility system. Ray-grid traversal is a 3D-specific technique that adds tactical depth: enemies that cannot see you cannot chase you.'
  },
  {
    file: 'lesson-crawler-37-chase-behavior.ts',
    bt: '**Switching from patrol to chase without a way to return to patrol.** If the enemy loses sight of the player, it should return to its patrol route, not stand still forever. Implement both transitions: patrol-to-chase and chase-to-patrol.',
    ei: 'FSM-based AI (Finite State Machine) is the standard approach for simple enemy behaviors. Halo enemies use FSMs with states like Idle, Patrol, Alert, Attack, Flee. Your patrol-chase FSM is the foundation that scales to more complex behaviors.',
    st: 'The RPG enemy AI (L06) uses a simple chase algorithm without states. The Shooter enemies follow fixed paths. Your FSM-based AI is the most sophisticated across all paths — explicit states with guarded transitions prevent behavior bugs.'
  },
  {
    file: 'lesson-crawler-38-first-person-combat.ts',
    bt: '**Raycasting against the visual billboard position instead of the collision volume.** Billboards are visual approximations. Collision should check against the entity AABB (axis-aligned bounding box), not the sprite quad. Billboard orientation changes with camera angle; the AABB does not.',
    ei: 'Doom hit-tested enemies using 2D bounding circles projected into the player view. Modern FPS games use capsule colliders for humanoid enemies. Your AABB approach is the 3D grid equivalent — simple, fast, and sufficient for tile-based combat.',
    st: 'The RPG resolves combat by adjacency — bump into an enemy to attack. The Shooter uses circle-circle collision. Your raycast targeting is the 3D equivalent: aim at a target, check if the ray intersects the target volume.'
  },
  {
    file: 'lesson-crawler-39-enemy-attack.ts',
    bt: '**Applying damage every frame while the enemy is in range.** Without a cooldown timer, the enemy deals 60x intended damage per second. Use an attack cooldown: deal damage, start a timer, do not deal damage again until the timer expires.',
    ei: 'Every melee combat system uses attack cooldowns — from Dark Souls to Minecraft. The cooldown ensures one attack per swing animation. Your timer-based approach is the standard implementation: damage once, wait, repeat.',
    st: 'The RPG resolves combat once per turn — the turn system is a natural cooldown. The Shooter fires bullets with a cooldown timer. Your real-time melee cooldown is the 3D-specific version of the same "rate limit damage" pattern.'
  },
  {
    file: 'lesson-crawler-40-milestone-combat-dungeon.ts',
    bt: '**Testing combat with only one enemy.** One enemy does not reveal targeting priority bugs, friendly-fire issues, or performance problems with many combatants. Test with at least 5 enemies in a single room.',
    ei: 'Doom tested combat encounters with carefully designed "monster closets" — rooms packed with enemies that triggered on entry. Combat milestones must test worst-case scenarios, not best-case ones.',
    st: 'The RPG combat milestone validates the full turn pipeline with multiple enemies. The Shooter combat validates bullet-enemy collision at scale. Every path must prove combat works under realistic load, not just with a single target.'
  },
  {
    file: 'lesson-crawler-41-room-templates.ts',
    bt: '**Hardcoding room layouts in the generation code instead of reading from data.** Each new room type requires a code change. Store room layouts as 2D arrays in a data table, and the generator stamps them into the grid without knowing the room details.',
    ei: 'Spelunky stores room templates as small tile grids and assembles levels by selecting and connecting templates. The level generator has no knowledge of specific room content — it just picks and places templates. Your approach follows the same pattern.',
    st: 'The RPG loads room data from arrays — same data-driven approach in 2D. The Platformer loads level data from tile arrays. Template-based level assembly is the standard approach for any game that wants varied content without hand-crafting every room.'
  },
  {
    file: 'lesson-crawler-42-corridor-generation.ts',
    bt: '**Carving corridors before rooms.** If corridors are carved first, rooms may overwrite them. Carve rooms first (stamp templates), then connect room centers with L-shaped corridors. Order matters in grid modification.',
    ei: 'Rogue (1980) connected rooms with L-shaped corridors — pick two room centers, carve horizontally then vertically. This simple algorithm produces natural-looking dungeon layouts. Your corridor generation follows the same classic approach.',
    st: 'The RPG connects rooms with exit tiles. The Platformer connects level sections with doors. Your corridor carving is the procedural version — automatically connecting rooms that other paths connect by hand.'
  },
  {
    file: 'lesson-crawler-43-bsp-dungeon-v0.ts',
    bt: '**Splitting too many times and creating rooms smaller than the minimum size.** BSP recursion should stop when the partition is below a minimum width or height. Without a base case, you generate unusable 1x1 "rooms."',
    ei: 'Binary Space Partitioning was invented for Doom to solve 3D rendering order, but it works equally well for dungeon generation. Split space recursively, place rooms in leaf nodes, connect siblings. The same data structure serves two very different purposes.',
    st: 'The RPG and Platformer use hand-authored or simple random room placement. BSP generation is the most algorithmically sophisticated level generation across all four paths — a technique borrowed from 3D rendering to solve a 2D layout problem.'
  },
  {
    file: 'lesson-crawler-44-door-placement.ts',
    bt: '**Placing doors at every room boundary instead of only where corridors connect.** A room with doors on all four walls when only one corridor leads in looks wrong. Detect where corridors actually touch the room boundary and place doors only there.',
    ei: 'Diablo places doors at corridor-room intersections by scanning the boundary tiles of each room. If a boundary tile is adjacent to a corridor tile, it becomes a door. Your detection algorithm follows the same spatial query pattern.',
    st: 'The RPG places exit tiles manually in room data. The Platformer does not have doors — levels transition by screen edge. Your automated door placement is the procedural version of what other paths do by hand.'
  },
  {
    file: 'lesson-crawler-45-milestone-random-dungeon.ts',
    bt: '**Testing generation with only one seed.** A single seed cannot reveal generation bugs — some seeds may produce overlapping rooms, disconnected areas, or impossible layouts. Test with at least 20 different seeds to verify robustness.',
    ei: 'Spelunky tests level generation with thousands of seeds to find degenerate cases. Professional procedural generation includes a "seed sweep" test that generates hundreds of levels and checks invariants (connectivity, minimum room count, no overlaps).',
    st: 'The RPG uses hand-crafted rooms with no procedural generation. The Shooter generates wave patterns from data tables. Your seeded dungeon generation is the most complex content creation system across all four paths.'
  },
  {
    file: 'lesson-crawler-46-entity-placement.ts',
    bt: '**Spawning entities on wall tiles or inside other entities.** Always check that the spawn position is a floor tile and that no other entity already occupies it. A valid-position check prevents entities from spawning inside geometry.',
    ei: 'Diablo II uses spawn budgets per room type — a library spawns 2-4 mages, a crypt spawns 3-6 skeletons. The entity count and type are data-driven, not hardcoded. Your room-based spawn budget follows the same design.',
    st: 'The RPG spawns enemies at fixed grid positions from room data. The Shooter places enemies via wave definitions. Your spawn-budget system is the procedural version — automatically placing entities based on room type and difficulty level.'
  },
  {
    file: 'lesson-crawler-47-difficulty-scaling.ts',
    bt: '**Scaling difficulty linearly when players expect exponential challenge.** Doubling enemy HP every floor quickly becomes impossible. Use diminishing multipliers: floor 1 = 1.0x, floor 2 = 1.2x, floor 3 = 1.35x. The curve should feel like increasing challenge, not a wall.',
    ei: 'Diablo uses multiplicative difficulty scaling per difficulty tier (Normal, Nightmare, Hell) with carefully tuned curves. The scaling factors are stored in data tables, not formulas, so designers can tune individual breakpoints.',
    st: 'The RPG implements difficulty tables (L87) with the same data-driven approach. The Shooter scales wave difficulty (L47). Every path faces the same design challenge: scaling difficulty to match player skill growth without creating frustration spikes.'
  },
  {
    file: 'lesson-crawler-48-loot-tables.ts',
    bt: '**Using equal probability for all items.** If a healing potion and a legendary sword have the same drop chance, the game economy breaks. Weight items by rarity: common items high weight, rare items low weight. Normalize weights to probabilities.',
    ei: 'Diablo III loot tables use weighted random selection with guaranteed minimums for rare drops ("pity timer"). The weights are data-driven — designers tune drop rates in spreadsheets without changing code. Your weighted-random approach follows this pattern.',
    st: 'The RPG implements loot drops (L28) with the same weighted-random approach. The Shooter drops powerups with fixed probabilities (L43). Weighted random selection from data tables is the industry standard for item generation across all genres.'
  },
  {
    file: 'lesson-crawler-49-multi-level-dungeon.ts',
    bt: '**Generating all floors at startup.** If the dungeon has 10 floors, generating all 10 on launch wastes memory and time. Generate each floor on demand using a seed derived from the floor number: seed_for_floor_N = base_seed + N.',
    ei: 'Minecraft generates chunks on demand as the player explores — never pre-generating the entire world. Seed chaining (floor_seed = hash(base_seed, floor_number)) guarantees the same floor layout for the same base seed.',
    st: 'The RPG loads rooms from pre-defined data. The Platformer loads levels from arrays. Your on-demand generation is the most memory-efficient content system across all paths — generating content only when the player needs it.'
  },
  {
    file: 'lesson-crawler-50-milestone-roguelike-core.ts',
    bt: '**Declaring "roguelike" without testing the full loop: generate, explore, fight, loot, descend, die, restart.** Every step in the loop must work seamlessly. A roguelike that crashes on death or loses loot on floor transition is not a roguelike.',
    ei: 'The "Berlin Interpretation" defines roguelike core features: procedural generation, permadeath, turn-based or real-time combat, resource management. Your milestone validates the essential roguelike gameplay loop.',
    st: 'The RPG plays a 10-minute dungeon run. The Shooter plays a 10-minute arcade session. Your roguelike run is the most system-integrated milestone across all paths — generation, combat, loot, and progression must all work together.'
  },
  {
    file: 'lesson-crawler-51-frustum-culling-v0.ts',
    bt: '**Culling with a full frustum matrix when a simple dot-product cone check works.** For a grid-based dungeon, checking if a tile is within the camera view cone (dot(forward, to_tile) > cos(fov/2)) is sufficient and much faster than full frustum plane extraction.',
    ei: 'Quake computed a view frustum from six planes and tested bounding boxes against each plane. Modern engines use hierarchical frustum culling (octree + AABB). Your dot-product check is the grid-optimized version of the same concept.',
    st: 'The RPG and Shooter render everything — no culling needed for small 2D grids. Frustum culling is uniquely important in 3D: the camera sees a fraction of the world, so skipping invisible geometry is a major performance win.'
  },
  {
    file: 'lesson-crawler-52-cell-visibility.ts',
    bt: '**Marking cells visible only from the camera position, ignoring one-tile-away cells.** Flood fill from the camera cell should include adjacent cells to prevent "popping" — tiles appearing one frame late as the camera moves. Include a one-cell margin.',
    ei: 'Doom used a BSP-based visibility system to determine which walls were visible. Modern engines use PVS (Potentially Visible Set) or occlusion queries. Your flood-fill visibility is the grid-based equivalent — simpler geometry, same goal.',
    st: 'The RPG has no visibility system — all entities are visible. The Platformer renders one screen at a time. Your cell-based visibility is a 3D-specific optimization that determines which parts of the dungeon to draw each frame.'
  },
  {
    file: 'lesson-crawler-53-fog-of-war.ts',
    bt: '**Resetting exploration state when the player revisits a floor.** Once a cell has been explored, it should stay explored. Store exploration data in a persistent array per floor, not in the transient visibility data that resets each frame.',
    ei: 'Civilization and StarCraft track exploration with a per-cell "visited" flag that persists across the game. Visible cells show live data, explored cells show last-known data, unexplored cells are black. Your fog of war follows the same three-state model.',
    st: 'The RPG has no exploration tracking. The Shooter has no fog of war. Fog of war adds strategic depth to your Crawler by rewarding spatial memory — the player must remember what they have seen, a mechanic unique to exploration-focused games.'
  },
  {
    file: 'lesson-crawler-54-spatial-hashing.ts',
    bt: '**Using a hash cell size smaller than the largest entity.** If a cell is smaller than an entity, the entity spans multiple cells, and every query must check all neighboring cells. Set cell size >= largest entity size so each entity fits in one cell.',
    ei: 'Spatial hashing maps 3D coordinates to a 1D hash table: hash(x/cell, y/cell, z/cell) -> bucket index. This gives O(1) average-case neighbor queries regardless of world size. Unity and Bullet Physics both offer spatial hash implementations.',
    st: 'The Shooter uses a spatial grid (L36) — same concept, different implementation. The RPG uses direct grid lookup (grid[y][x]). Your spatial hash generalizes to arbitrarily large worlds because it does not require a bounded grid.'
  },
  {
    file: 'lesson-crawler-55-milestone-optimized-renderer.ts',
    bt: '**Optimizing rendering without measuring first.** Profile the render pass before and after each optimization (frustum culling, cell visibility, spatial hashing) to verify each one actually helps. An optimization that does not reduce measured frame time is unnecessary complexity.',
    ei: 'Carmack famously said "measure, don\'t guess." Professional game optimization follows a strict cycle: profile, identify the bottleneck, optimize it, re-profile to verify improvement. Never optimize based on intuition alone.',
    st: 'The Shooter milestone L75 stress-tests with 200+ entities. The RPG milestone L75 tests with 50. Your render optimization milestone is unique: 3D rendering has more opportunities for spatial culling than 2D, making optimization both more necessary and more impactful.'
  },
  {
    file: 'lesson-crawler-56-astar-pathfinding.ts',
    bt: '**Using Euclidean distance as the heuristic on a grid where only 4-directional movement is allowed.** Euclidean distance overestimates the cost for 4-connected grids, making A* non-optimal. Use Manhattan distance (|dx| + |dz|) for 4-directional movement.',
    ei: 'A* was published by Hart, Nilsson, and Raphael in 1968 and remains the standard pathfinding algorithm in games. Warcraft, StarCraft, and Civilization all use A* with grid-specific heuristics. Your implementation follows the same algorithm.',
    st: 'The RPG enemies use a simple chase algorithm (move toward player). The Shooter enemies follow fixed paths. A* pathfinding gives your Crawler enemies the most intelligent movement across all paths — they navigate around obstacles instead of walking into walls.'
  },
  {
    file: 'lesson-crawler-57-sound-propagation.ts',
    bt: '**Using Euclidean distance for sound volume instead of path distance.** Sound in a dungeon must travel through corridors, not through walls. A monster two rooms away is far by path distance even if the rooms are adjacent in grid space.',
    ei: 'Thief: The Dark Project computed sound propagation through portals — doors and openings transmitted sound, walls blocked it. Your grid-based sound propagation simulates the same physical behavior without portal geometry.',
    st: 'The RPG has no spatial audio. The Shooter plays sounds at fixed volumes. Your sound propagation is the most physically realistic audio system across all paths — sound travels through corridors, not through solid walls.'
  },
  {
    file: 'lesson-crawler-58-particle-system.ts',
    bt: '**Allocating new particles with new/malloc.** Particle systems can emit hundreds of particles per frame. Use a fixed-size pool and recycle dead particles by overwriting their data. Zero allocations in the particle system keeps frame times stable.',
    ei: 'Every particle system in professional engines uses a pool allocator. Unity particles, Unreal Niagara, and Godot GPU particles all pre-allocate a fixed buffer and cycle through it. Your pool-based approach follows the same industry standard.',
    st: 'The Platformer implements particle pools (L27) in 2D. The Shooter allocates from bullet pools. Pool-based particle systems are universal — the 2D and 3D implementations differ only in the number of coordinates per particle.'
  },
  {
    file: 'lesson-crawler-59-projectiles.ts',
    bt: '**Not checking collision along the trajectory between frames.** A fast projectile can pass through a thin wall in one frame (tunneling). For grid-based worlds, step along the trajectory at sub-tile intervals to catch all wall crossings.',
    ei: 'Quake used swept traces (traceLines) for all projectiles — checking collision along the entire path from old position to new position. This prevents tunneling regardless of projectile speed. Your sub-tile stepping is the grid-based version.',
    st: 'The Shooter fires bullets in 2D with per-frame collision checks. The RPG has no projectiles. Your 3D projectiles add trajectory arcs and wall collision in three dimensions — the most complex projectile system across all paths.'
  },
  {
    file: 'lesson-crawler-60-milestone-rich-3d-world.ts',
    bt: '**Treating the milestone as "add more content" instead of "verify all systems work together."** Pathfinding, sound, particles, and projectiles must interoperate correctly. Test them simultaneously: an enemy hears the player, pathfinds toward them, attacks, and triggers particles.',
    ei: 'Rich game worlds emerge from system interactions, not from individual features. Emergent gameplay happens when AI, physics, sound, and combat interact in unplanned but consistent ways. Your milestone tests this system integration.',
    st: 'The RPG content-pack milestone (L80) validates system integration. The Shooter milestone L60 verifies ECS pipeline. Every path has a "systems work together" milestone — the difference is your 3D world has more interacting systems to verify.'
  },
  {
    file: 'lesson-crawler-61-save-file-v0.ts',
    bt: '**Writing the entire game state in one fwrite() call.** Struct layout varies between compilers. Serialize each field individually in a defined order with explicit sizes. This makes the save format portable and version-safe.',
    ei: 'Bethesda save files serialize each field with a tag and type marker. This makes saves forward-compatible — a newer game version can skip unknown tags. Your field-by-field approach is the simplified version of this tagged serialization.',
    st: 'The RPG implements save files (L24) with the same field-by-field approach. The Platformer uses checkpoint saves. All paths serialize game state the same way — write fields in order, read them back in order. The serialization pattern is universal.'
  },
  {
    file: 'lesson-crawler-62-load-and-resume.ts',
    bt: '**Not verifying the save file version before reading fields.** If the save format changes between updates, loading an old save reads garbage. Store a version number as the first field, and check it before deserializing the rest.',
    ei: 'Database migrations check schema version before applying updates. Game saves follow the same pattern: read version, apply the correct deserialization logic for that version. This enables backward compatibility across updates.',
    st: 'The RPG load system (L24-L25) checks version the same way. The Platformer checkpoint system stores version metadata. Version-checked deserialization is the standard pattern for any system that persists state across software updates.'
  },
  {
    file: 'lesson-crawler-63-deterministic-rng.ts',
    bt: '**Using multiple independent RNG sources.** Two RNG streams that advance at different rates produce different state signatures on replay. Use ONE RNG instance for all gameplay randomness. One seed, one stream, one truth.',
    ei: 'Spelunky uses a single seeded RNG for all procedural generation — level layout, enemy placement, and loot drops all come from one stream. This ensures the same seed always produces the exact same dungeon.',
    st: 'RPG (L21), Shooter, and Platformer all enforce single-source RNG. Deterministic randomness is a prerequisite for replay in every path. The seed determines the entire playthrough — different paths, same engineering discipline.'
  },
  {
    file: 'lesson-crawler-64-state-signature.ts',
    bt: '**Hashing only player state and forgetting enemy and world state.** If an enemy position diverges during replay, the signature does not catch it unless you hash everything. Include every gameplay-relevant field: player, enemies, items, dungeon state.',
    ei: 'Age of Empires computes a game-state hash every frame during multiplayer to detect desynchronization. Any divergence between clients triggers a resync. Your per-frame signature serves the same debugging purpose for single-player replay.',
    st: 'RPG (L23), Shooter, and Platformer compute state signatures the same way. The hash function and field selection differ by game, but the pattern is identical: hash all gameplay state, compare between runs to detect divergence.'
  },
  {
    file: 'lesson-crawler-65-milestone-save-resume.ts',
    bt: '**Testing save/load without comparing state signatures.** A save that "loads without crashing" may still have corrupted fields. Save, load, compute the state signature, and compare it to the pre-save signature. If they differ, serialization is broken.',
    ei: 'Round-trip testing (serialize, deserialize, compare) is the standard for save system verification. Database replication uses the same approach — write to replica, read back, compare against source. Your signature comparison follows this pattern.',
    st: 'RPG (L25), Shooter, and Platformer hit the same save/resume milestone. The testing approach is identical across all paths: save state, load state, verify state signature matches. Save integrity is a universal shipping requirement.'
  },
  {
    file: 'lesson-crawler-66-input-recording.ts',
    bt: '**Recording processed actions instead of raw input.** If you record "move forward 0.5 units" instead of "W key down," the replay cannot reconstruct the exact input timing. Record raw key states and mouse delta per frame.',
    ei: 'Doom recorded raw input as "tics" — one input snapshot per game frame. Replays fed these tics back into the game loop. Your per-frame input capture follows the same design that made Doom demos possible.',
    st: 'RPG (L64), Shooter, and Platformer all record raw input per frame. The input types differ (keyboard vs mouse+keyboard, 2D vs 3D) but the recording pattern is the same: capture everything, store in order, replay identically.'
  },
  {
    file: 'lesson-crawler-67-replay-playback.ts',
    bt: '**Feeding replay input at the wrong frame rate.** If the game recorded at 60fps and replays at variable fps, input arrives at the wrong time. Lock replay to the same fixed timestep as recording. Frame rate must match exactly.',
    ei: 'StarCraft replays run at the original game speed by feeding stored input at the original tick rate. The simulation is deterministic, so the same input at the same tick produces the same result. Your locked-timestep replay follows the same principle.',
    st: 'RPG, Shooter, and Platformer implement replay playback the same way — lock timestep, feed input, compare state. The challenge is greater in 3D because mouse input adds continuous floating-point precision concerns.'
  },
  {
    file: 'lesson-crawler-68-replay-verification.ts',
    bt: '**Only checking the final state signature.** A divergence on frame 50 that self-corrects by frame 1000 is still a bug. Compare signatures every frame (or every N frames) to catch divergence at the exact point it occurs.',
    ei: 'Lockstep networking games verify state every few frames — if signatures diverge, the clients resync immediately. Waiting until the end to check hides where the divergence started. Your per-frame check enables precise debugging.',
    st: 'RPG, Shooter, and Platformer verify replay with the same per-frame signature check. The verification pattern is identical across all paths because determinism bugs manifest the same way regardless of game genre.'
  },
  {
    file: 'lesson-crawler-69-replay-speed-control.ts',
    bt: '**Fast-forwarding by skipping frames instead of running them faster.** Skipping frames breaks determinism — the game state at frame N depends on all previous frames. Fast-forward by running multiple simulation steps per render frame, not by dropping frames.',
    ei: 'Debugging replays in professional engines supports pause, step-forward, and variable-speed playback. The simulation runs at 1x, 2x, 4x, or pauses, but never skips frames. Your speed control follows the same debugging-tool design.',
    st: 'RPG, Shooter, and Platformer implement the same replay speed controls. The tooling is identical because the debugging need is identical: "replay broke on frame 847 — let me fast-forward to frame 840 and step through."'
  },
  {
    file: 'lesson-crawler-70-gate-b-replay-determinism.ts',
    bt: '**Passing the gate with one replay test.** Run multiple replays with different seeds, different play styles, and different lengths. A determinism bug that only appears with specific RNG sequences or long play sessions will escape a single test.',
    ei: 'Professional QA runs hundreds of automated replay tests nightly. Each test records a play session, replays it, and verifies state signatures match. Your gate requires the same level of confidence — verified determinism across multiple scenarios.',
    st: 'RPG (L70), Shooter (L70), and Platformer (L70) all hit the same replay determinism gate. This is the most universal engineering gate in the curriculum — all four paths must prove their simulation is perfectly reproducible.'
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
