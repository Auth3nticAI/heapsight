import { Lesson } from "@/types/lesson";

export const lessonRPG06: Lesson = {
  id: "rpg-06-enemy-spawn",
  title: "Enemy Spawn",
  description: "One enemy appears on the grid. Entities are parallel arrays — position, HP, glyph stored in separate arrays indexed by entity ID.",
  order: 6,
  xpReward: 50,
  tier: "free",
  concepts: ["parallel arrays", "entity representation", "SoA introduction", "grid rendering"],
  part1: {
    title: "Concept: Enemy Spawn",
    type: "concept",
    instructions: `# Enemy Spawn

## Mental Model

An entity is not an object. An entity is an index. Entity 0 has position entity_x[0], entity_y[0], health entity_hp[0], and glyph entity_glyph[0]. Entity 1 has the same data at index 1. This is Structure of Arrays (SoA): one array per attribute, all indexed by entity ID. Adding a new entity means writing values at the next index and incrementing the count.

## What Breaks Without This

Without parallel arrays, you store each entity as a struct with all its data bundled together. That works for 2 entities. At 50 entities, iterating all positions means jumping between structs scattered in memory. The CPU cache line loads 64 bytes of struct data when you only need 8 bytes of position. SoA stores all positions contiguously -- the prefetcher loads exactly what the movement system needs.

## The Fix: Parallel Entity Arrays

Declare four arrays: entity_x[], entity_y[], entity_hp[], entity_glyph[]. The player is entity 0: entity_x[0]=1, entity_y[0]=1, entity_hp[0]=100, entity_glyph[0]='@'. The enemy is entity 1: entity_x[1]=7, entity_y[1]=3, entity_hp[1]=20, entity_glyph[1]='E'.

The entity count variable tracks how many entities are alive. To add an entity, write its data at index entity_count and increment. To remove one, swap with the last and decrement. This is the swap-and-pop pattern -- O(1) removal with no gaps.

Rendering the grid is a two-pass process: first fill the grid with floor tiles, then stamp each entity's glyph at its position. The grid is the display buffer; the arrays are the source of truth.

\`\`\`cpp
const int MAX_ENTITIES = 64;
int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

// Spawn player (entity 0)
entity_x[0]=1; entity_y[0]=1; entity_hp[0]=100; entity_glyph[0]='@';
entity_count++;

// Spawn enemy (entity 1)
entity_x[1]=7; entity_y[1]=3; entity_hp[1]=20; entity_glyph[1]='E';
entity_count++;
\`\`\`

## Key Concepts

- **Parallel arrays (SoA)** -- one array per attribute, all indexed by entity ID. Position, health, glyph stored separately.
- **Entity as index** -- entity 0 is the player, entity 1 is the enemy. The index IS the identity.
- **Fixed-size arrays** -- MAX_ENTITIES is the capacity. No heap allocation. The arrays live on the stack.
- **Entity count** -- tracks how many entities are alive. Only indices 0..entity_count-1 are valid.

## Performance Insight

When the movement system iterates entity_x[] and entity_y[], it touches two contiguous arrays. The CPU prefetcher loads 16 positions per cache line (64 bytes / 4 bytes per int). Processing 64 entities touches 4 cache lines per array. The same iteration over an array of structs would touch 64 cache lines -- one per struct. SoA is 16x more cache-friendly for single-attribute sweeps.

## Memory Insight

Four arrays of 64 ints = 4 * 64 * 4 = 1024 bytes. Plus 64 chars = 64 bytes. Total: 1088 bytes on the stack. No heap. No malloc. The entire entity system fits in 17 cache lines. This is the data layout that scales to thousands of entities without allocation pressure.

## Your Task

Spawn the player at (1,1) HP:100 glyph '@' and one enemy at (7,3) HP:20 glyph 'E'. Print both entities:

\`\`\`
ENTITY|0|@|1,1|HP:100
ENTITY|1|E|7,3|HP:20
ENTITY_COUNT|2
TURN|1
HP|100
GOLD|0
GAME_MESSAGE|Enemy spawned at (7,3). 2 entities active.
\`\`\`

## Beginner Trap

**Using a struct array instead of parallel arrays.** \`struct Entity { int x, y, hp; char glyph; }; Entity entities[64];\` -- this is Array of Structs (AoS). It groups all attributes per entity. When you only need positions, you load hp and glyph too -- wasted bandwidth. SoA keeps attributes separate so systems only touch what they need. Start with SoA. You can always add an AoS wrapper later if ergonomics demand it.

## Elite Insight

Diablo 2's entity system used parallel arrays indexed by entity ID. Monsters, missiles, items -- all stored as indices into attribute tables. No class hierarchy, no virtual dispatch. The entity IS the index. This is the same pattern used by Unity DOTS and every ECS framework: data in arrays, identity as integer, behavior in systems that iterate arrays.

## Systems Thinking Connection

This SoA pattern is identical to the Space Shooter path's entity storage (Lesson 6 there too). Both paths store entities as parallel arrays. The difference: the Space Shooter iterates all entities every frame for physics. The RPG iterates them once per turn in the resolve pass. Same data layout, different access pattern.

## Skill Reinforcement

Lesson 5 introduced the grid and collision. This lesson adds entities ON the grid. Lesson 7 will add a turn pipeline that moves entities. Lesson 14 formalizes SoA with typed arrays in a World struct.

## Mastery Check

Why is entity_count separate from MAX_ENTITIES? MAX_ENTITIES is capacity -- the array size. entity_count is population -- how many slots are occupied. Iterating to MAX_ENTITIES would process dead/uninitialized slots. Iterating to entity_count processes only live entities. The distinction between capacity and population is fundamental to fixed-size container design.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24;
const int MAX_ENTITIES = 64;

int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

int main() {
    // Spawn player (entity 0)
    entity_x[0]=1; entity_y[0]=1; entity_hp[0]=100; entity_glyph[0]='@';
    entity_count++;

    // TODO: Spawn enemy (entity 1) at (7,3) HP:20 glyph 'E'

    // Print entities
    for (int i = 0; i < entity_count; i++) {
        cout << "ENTITY|" << i << "|" << entity_glyph[i]
             << "|" << entity_x[i] << "," << entity_y[i]
             << "|HP:" << entity_hp[i] << endl;
    }
    cout << "ENTITY_COUNT|" << entity_count << endl;
    cout << "TURN|1" << endl;
    cout << "HP|" << entity_hp[0] << endl;
    cout << "GOLD|0" << endl;
    cout << "GAME_MESSAGE|Enemy spawned at (" << entity_x[1] << "," << entity_y[1] << "). " << entity_count << " entities active." << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24;
const int MAX_ENTITIES = 64;

int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

int main() {
    // Spawn player (entity 0)
    entity_x[0]=1; entity_y[0]=1; entity_hp[0]=100; entity_glyph[0]='@';
    entity_count++;

    // Spawn enemy (entity 1)
    entity_x[1]=7; entity_y[1]=3; entity_hp[1]=20; entity_glyph[1]='E';
    entity_count++;

    // Print entities
    for (int i = 0; i < entity_count; i++) {
        cout << "ENTITY|" << i << "|" << entity_glyph[i]
             << "|" << entity_x[i] << "," << entity_y[i]
             << "|HP:" << entity_hp[i] << endl;
    }
    cout << "ENTITY_COUNT|" << entity_count << endl;
    cout << "TURN|1" << endl;
    cout << "HP|" << entity_hp[0] << endl;
    cout << "GOLD|0" << endl;
    cout << "GAME_MESSAGE|Enemy spawned at (" << entity_x[1] << "," << entity_y[1] << "). " << entity_count << " entities active." << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Entity 0 is player @ at (1,1) HP:100",
        expectedOutput: "ENTITY\\|0\\|@\\|1,1\\|HP:100",
        isPattern: true,
      },
      {
        id: "t2",
        description: "Entity 1 is enemy E at (7,3) HP:20",
        expectedOutput: "ENTITY\\|1\\|E\\|7,3\\|HP:20",
        isPattern: true,
      },
      {
        id: "t3",
        description: "Entity count is 2",
        expectedOutput: "ENTITY_COUNT\\|2",
        isPattern: true,
      },
    ],
    hints: [
      "Entity 1 follows the same pattern as entity 0: write to index 1 of each array, then increment entity_count.",
      "Set entity_x[1]=7, entity_y[1]=3, entity_hp[1]=20, entity_glyph[1]='E', then entity_count++.",
      "The print loop already handles any entity_count -- just spawn the enemy and the output appears.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Entity Grid",
    type: "game_builder",
    instructions: `# Build: Entity Grid

## Mental Model

The grid is a display buffer. Entities are the source of truth. To render: fill grid with floor tiles, then stamp each entity's glyph at its (x,y) position. The grid shows where things are; the arrays say what they are.

## What Breaks Without This

Without entity-to-grid stamping, the grid shows an empty room. Entities exist in data but are invisible. The player cannot see where enemies are. Debug is impossible -- you have no visual representation of game state.

## The Fix: Entity Grid Rendering

After building the grid (walls and floor), loop through all entities and place their glyph on the grid at their position. Then print the grid row by row. This two-pass approach -- build grid, stamp entities -- keeps rendering clean and separable from entity logic.

## Key Concepts

- **Two-pass render** -- fill grid, then stamp entities. No entity logic in the render pass.
- **Grid as display buffer** -- the 2D char array is for output only. Entity arrays are the source of truth.
- **Glyph stamping** -- grid[entity_y[i]][entity_x[i]] = entity_glyph[i] for all live entities.

## Performance Insight

Stamping N entities on a 10x10 grid is N array writes. At 64 entities, that is 64 writes into a 100-byte array -- all in L1 cache. The render pass is trivially fast compared to the grid print (100 characters of cout output).

## Memory Insight

The grid is a local 10x10 char array = 100 bytes on the stack. Entity arrays are global = 1088 bytes in the data segment. Total memory for the entire entity + rendering system: under 1200 bytes. No heap.

## Your Task

Spawn 3 enemies on the grid in addition to the player. Print the entity list and render the grid with '@' for the player and 'E' for enemies.

Expected output includes:
\`\`\`
DUNGEON|rpg-v0
ENTITY|0|@|1,1|HP:100
ENTITY|1|E|7,3|HP:20
ENTITY|2|E|4,5|HP:20
ENTITY|3|E|6,7|HP:20
ENTITY_COUNT|4
GRID_ROW|0|##########
GRID_ROW|1|#@.......#
GRID_ROW|3|#......E..#
GRID_ROW|5|#...E....#
GRID_ROW|7|#.....E..#
TURN|1
HP|100
GOLD|0
GAME_MESSAGE|3 enemies spawned. 4 entities active.
\`\`\`

## Beginner Trap

**Stamping entities before building the grid.** If you place glyphs first, then fill the grid with '.', the glyphs are overwritten. Always: build grid first (walls + floor), then stamp entities. Order matters.

## Elite Insight

Nethack renders its dungeon the same way -- a 2D character buffer stamped with entity glyphs each turn. The display array is rebuilt from scratch every frame. No persistent display state. This avoids display corruption from stale data. The grid is always a faithful projection of current entity positions.

## Mastery Check

Why rebuild the grid from scratch each turn instead of updating only changed tiles? Because tracking which tiles changed requires bookkeeping (dirty flags, previous positions). Rebuilding is 100 writes -- trivially fast. The bookkeeping costs more than the rebuild. When the grid is small, brute-force rebuild wins.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24;
const int MAX_ENTITIES = 64;

int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

void spawnEntity(int x, int y, int hp, char glyph) {
    entity_x[entity_count] = x;
    entity_y[entity_count] = y;
    entity_hp[entity_count] = hp;
    entity_glyph[entity_count] = glyph;
    entity_count++;
}

int main() {
    char grid[H][W];
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) grid[y][x]='.';
    for(int x=0;x<W;x++){grid[0][x]='#';grid[H-1][x]='#';}
    for(int y=0;y<H;y++){grid[y][0]='#';grid[y][W-1]='#';}

    // Spawn player
    spawnEntity(1, 1, 100, '@');

    // TODO: Spawn 3 enemies at (7,3), (4,5), (6,7) with HP:20 glyph 'E'

    // Stamp entities onto grid
    for (int i = 0; i < entity_count; i++) {
        grid[entity_y[i]][entity_x[i]] = entity_glyph[i];
    }

    cout << "DUNGEON|rpg-v0" << endl;

    // Print entity list
    for (int i = 0; i < entity_count; i++) {
        cout << "ENTITY|" << i << "|" << entity_glyph[i]
             << "|" << entity_x[i] << "," << entity_y[i]
             << "|HP:" << entity_hp[i] << endl;
    }
    cout << "ENTITY_COUNT|" << entity_count << endl;

    // Print grid
    for (int y = 0; y < H; y++) {
        cout << "GRID_ROW|" << y << "|";
        for (int x = 0; x < W; x++) cout << grid[y][x];
        cout << endl;
    }

    cout << "TURN|1" << endl;
    cout << "HP|" << entity_hp[0] << endl;
    cout << "GOLD|0" << endl;
    cout << "GAME_MESSAGE|3 enemies spawned. " << entity_count << " entities active." << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24;
const int MAX_ENTITIES = 64;

int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

void spawnEntity(int x, int y, int hp, char glyph) {
    entity_x[entity_count] = x;
    entity_y[entity_count] = y;
    entity_hp[entity_count] = hp;
    entity_glyph[entity_count] = glyph;
    entity_count++;
}

int main() {
    char grid[H][W];
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) grid[y][x]='.';
    for(int x=0;x<W;x++){grid[0][x]='#';grid[H-1][x]='#';}
    for(int y=0;y<H;y++){grid[y][0]='#';grid[y][W-1]='#';}

    // Spawn player
    spawnEntity(1, 1, 100, '@');

    // Spawn 3 enemies
    spawnEntity(7, 3, 20, 'E');
    spawnEntity(4, 5, 20, 'E');
    spawnEntity(6, 7, 20, 'E');

    // Stamp entities onto grid
    for (int i = 0; i < entity_count; i++) {
        grid[entity_y[i]][entity_x[i]] = entity_glyph[i];
    }

    cout << "DUNGEON|rpg-v0" << endl;

    // Print entity list
    for (int i = 0; i < entity_count; i++) {
        cout << "ENTITY|" << i << "|" << entity_glyph[i]
             << "|" << entity_x[i] << "," << entity_y[i]
             << "|HP:" << entity_hp[i] << endl;
    }
    cout << "ENTITY_COUNT|" << entity_count << endl;

    // Print grid
    for (int y = 0; y < H; y++) {
        cout << "GRID_ROW|" << y << "|";
        for (int x = 0; x < W; x++) cout << grid[y][x];
        cout << endl;
    }

    cout << "TURN|1" << endl;
    cout << "HP|" << entity_hp[0] << endl;
    cout << "GOLD|0" << endl;
    cout << "GAME_MESSAGE|3 enemies spawned. " << entity_count << " entities active." << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Dungeon header present",
        expectedOutput: "DUNGEON\\|rpg-v0",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Entity 1 enemy at (7,3)",
        expectedOutput: "ENTITY\\|1\\|E\\|7,3\\|HP:20",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Grid row 1 shows player @",
        expectedOutput: "GRID_ROW\\|1\\|#@",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Grid row 3 shows enemy E",
        expectedOutput: "GRID_ROW\\|3\\|#......E..#",
        isPattern: true,
      },
      {
        id: "g5",
        description: "4 entities active message",
        expectedOutput: "GAME_MESSAGE\\|3 enemies spawned\\. 4 entities active\\.",
        isPattern: true,
      },
    ],
    hints: [
      "Use the spawnEntity helper function three times -- once for each enemy position.",
      "spawnEntity(7,3,20,'E'); spawnEntity(4,5,20,'E'); spawnEntity(6,7,20,'E');",
      "The grid stamp loop already handles all entities. Just spawn them and the grid renders correctly.",
    ],
    estimatedMinutes: 12,
  },
};