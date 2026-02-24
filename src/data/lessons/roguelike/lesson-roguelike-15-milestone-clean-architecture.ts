import { Lesson } from "@/types/lesson";

export const lessonRoguelike15: Lesson = {
  id: "roguelike-15-milestone-clean-architecture",
  title: "Milestone: Clean Architecture",
  description: "Formalize the game loop into named passes with stable execution order. Extract render phases, verify pipeline integrity. 300 XP milestone.",
  order: 15,
  xpReward: 300,
  tier: "pro",
  concepts: ["game loop pipeline", "named passes", "stable execution order", "separation of concerns"],
  part1: {
    title: "Concept: Pipeline Architecture",
    type: "concept",
    instructions: `# Pipeline Architecture

## Mental Model
A game loop is a pipeline. Each frame, the same phases execute in the same order: input \u2192 update \u2192 render. Inside render, sub-phases execute in order: terrain \u2192 entities \u2192 HUD. This stable order guarantees deterministic output. Same input, same frame, same pixels.

## What Breaks Without This
A monolithic game loop with all logic in \`while (!WindowShouldClose())\` works for small games. But as code grows, bugs hide in ordering: Did the enemy move before or after the player? Was the HUD drawn before or after entities? Named passes make the order explicit and auditable.

## The Pattern

\`\`\`cpp
// Named pass functions
void passInput(World& w);        // Read keys, update state
void passRenderTerrain(World& w); // Draw tiles, corridors, stairs
void passRenderEntities(World& w); // Draw player, enemies
void passRenderHUD(World& w);     // Draw HP, floor, score

// Game loop - stable order, every frame
while (!WindowShouldClose()) {
    passInput(w);
    BeginDrawing();
    ClearBackground(BLACK);
    passRenderTerrain(w);
    passRenderEntities(w);
    passRenderHUD(w);
    EndDrawing();
}
\`\`\`

## Key Concepts
- **Named passes**: Each phase has a function name that describes its job. Reading the game loop tells you the exact frame order.
- **Stable order**: Terrain renders first (back), entities next (middle), HUD last (front). This is the painter's algorithm.
- **Single responsibility**: Each pass reads World, does ONE job, optionally writes World. No cross-cutting concerns.
- **Testable**: Each pass can be called independently for unit testing.

## Performance Insight
Named passes enable profiling. Wrap each pass in a timer: "passInput: 0.1ms, passRenderTerrain: 0.3ms." You instantly know which phase is the bottleneck. Monolithic loops hide this information.

## Your Task
Simulate a game pipeline with named functions. Each pass prints its name. Verify the order is stable.

Expected output:
\`\`\`
Pass: input
Pass: render_terrain
Pass: render_entities
Pass: render_hud
Pipeline: 4 passes
Order: stable
\`\`\`

## Beginner Trap
**Mixing update and render logic.** If passInput() draws something, or passRenderHUD() modifies entity positions, the pipeline breaks. Update passes change state. Render passes read state and draw. Never mix.

## Elite Insight
Doom (1993) pioneered the render pipeline: BSP traversal \u2192 wall rendering \u2192 floor/ceiling \u2192 sprites \u2192 HUD. Modern engines have 20+ render passes (shadow maps, G-buffer, lighting, post-processing, UI). The pattern scales from roguelikes to AAA.

## Systems Thinking Connection
L11: organized state (World struct). L12: type safety (enums). L13: identity safety (IDs). L14: optimized layout (SoA). L15: organized execution (pipeline). Each lesson removes a class of bugs. Together, they form a clean architecture.

## Mastery Check
Question: What's the difference between a pipeline and a function call?
Answer: A pipeline is a CONTRACT. The order of passes is guaranteed every frame. Adding a new pass means deciding WHERE in the pipeline it goes. A function call is ad-hoc. Pipelines prevent "I'll just add this render call at the end" chaos that breaks layering.`,
    starterCode: `#include <iostream>
using namespace std;

int passCount = 0;

// TODO: Write passInput() - prints "Pass: input", increments passCount
// TODO: Write passRenderTerrain() - prints "Pass: render_terrain", increments passCount
// TODO: Write passRenderEntities() - prints "Pass: render_entities", increments passCount
// TODO: Write passRenderHUD() - prints "Pass: render_hud", increments passCount

int main() {
    // TODO: Call all 4 passes in order

    cout << "Pipeline: " << passCount << " passes" << endl;
    cout << "Order: stable" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int passCount = 0;

void passInput() { cout << "Pass: input" << endl; passCount++; }
void passRenderTerrain() { cout << "Pass: render_terrain" << endl; passCount++; }
void passRenderEntities() { cout << "Pass: render_entities" << endl; passCount++; }
void passRenderHUD() { cout << "Pass: render_hud" << endl; passCount++; }

int main() {
    passInput();
    passRenderTerrain();
    passRenderEntities();
    passRenderHUD();

    cout << "Pipeline: " << passCount << " passes" << endl;
    cout << "Order: stable" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Input pass", expectedOutput: "Pass: input" },
      { id: "t2", description: "Terrain pass", expectedOutput: "Pass: render_terrain" },
      { id: "t3", description: "Entities pass", expectedOutput: "Pass: render_entities" },
      { id: "t4", description: "HUD pass", expectedOutput: "Pass: render_hud" },
      { id: "t5", description: "Pass count", expectedOutput: "Pipeline: 4 passes" },
      { id: "t6", description: "Stable order", expectedOutput: "Order: stable" },
    ],
    hints: [
      "Each pass function prints its name and increments passCount.",
      "Call them in order: passInput, passRenderTerrain, passRenderEntities, passRenderHUD.",
      "The order matters - terrain before entities before HUD (painter algorithm).",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Pipeline Roguelike",
    type: "game_builder",
    instructions: `# Build: Pipeline Roguelike

## Mental Model
The monolithic game loop becomes a pipeline. Each frame executes exactly 4 named passes in stable order: \`handleInput\` \u2192 \`renderTerrain\` \u2192 \`renderEntities\` \u2192 \`renderHUD\`. The game loop is now a readable pipeline definition.

## What Breaks Without This
The L14 game loop has 25+ lines of rendering code inline. Adding fog of war, minimap, or particle effects means more inline code. At 50+ lines, the loop becomes unreadable. Named passes keep each concern in its own function.

## Your Task
Extract rendering code into named pass functions: \`renderTerrain()\`, \`renderEntities()\`, \`renderHUD()\`. The game loop becomes a clean pipeline.

Expected cout output:
\`\`\`
Seed: 42
Floor: 1
Rooms: 4
Entities: 6
NextID: 7
Pipeline: input|terrain|entities|hud
\`\`\`

**Click Run** to see the pipeline-organized roguelike.

## Did It Work?
Game is visually identical to L14. Green player, red enemies, yellow stairs. But the code is now organized: each render phase is a separate function. The cout output confirms the pipeline: "input|terrain|entities|hud".

## Key Changes
1. **renderTerrain(World& w)**: Draws floor tiles, corridors, and stairs.
2. **renderEntities(World& w)**: Draws all active entities with type-based coloring.
3. **renderHUD(World& w)**: Draws HP/Floor/Score text and game over message.
4. **Game loop**: BeginDrawing \u2192 ClearBackground \u2192 renderTerrain \u2192 renderEntities \u2192 renderHUD \u2192 EndDrawing.

## Beginner Trap
**Passing \`World\` by value instead of reference.** Each render function takes \`World& w\` (reference). Passing by value copies 5000+ bytes every frame.

## Elite Insight
Modern engines use multi-threaded pipelines. Unreal's game thread runs update passes while the render thread processes LAST frame's render commands. Named passes make this parallelism possible because each pass's data dependencies are explicit.

## Make It Yours!
This is your 300 XP milestone. The architecture is clean: World struct owns state, SoA arrays store entities, pipeline organizes execution. Customize the visuals: try different entity colors based on HP, add a border around the dungeon, change the HUD layout, or add a title screen. Tests only check cout output — the visual layer is your creative playground.

## Mastery Check
Question: What determines the order of render passes?
Answer: The painter's algorithm — draw back to front. Terrain is the background (first). Entities are on top of terrain (second). HUD is on top of everything (last). The order is a visual correctness requirement, not arbitrary.`,
    starterCode: `#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;
const int MAX_NODES = 15;
const int MAX_ENTITIES = 64;

enum TileType { TILE_WALL = 0, TILE_FLOOR = 1, TILE_CORRIDOR = 2, TILE_STAIRS = 3 };
enum EntityType { ENT_PLAYER = 0, ENT_ENEMY = 1 };
struct Vec2i { int x, y; };
struct BSPNode { int x, y, w, h; };
struct Room { int x, y, w, h, cx, cy; };

struct World {
    int dungeon[MAP_H][MAP_W];
    BSPNode nodes[MAX_NODES];
    int node_count;
    Room rooms[8];
    int room_count;
    int entity_id[MAX_ENTITIES];
    int entity_x[MAX_ENTITIES];
    int entity_y[MAX_ENTITIES];
    int entity_hp[MAX_ENTITIES];
    int entity_type[MAX_ENTITIES];
    bool entity_active[MAX_ENTITIES];
    int entity_count;
    int nextId;
    int stairsX, stairsY;
    int floor_num;
    int score;
    bool gameOver;
    uint32_t rng_state;
};

uint32_t rngNext(World& w) { w.rng_state = w.rng_state * 48271u % 0x7fffffffu; return w.rng_state; }
int rngRange(World& w, int lo, int hi) { return lo + (int)(rngNext(w) % (uint32_t)(hi - lo + 1)); }

void bspSplit(World& w, int idx, int depth) {
    if (depth >= 2 || w.nodes[idx].w < 10 || w.nodes[idx].h < 10) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
    if (right >= MAX_NODES) return;
    if (depth % 2 == 0) {
        int sx = rngRange(w, w.nodes[idx].w / 3, w.nodes[idx].w * 2 / 3);
        w.nodes[left] = {w.nodes[idx].x, w.nodes[idx].y, sx, w.nodes[idx].h};
        w.nodes[right] = {w.nodes[idx].x + sx, w.nodes[idx].y, w.nodes[idx].w - sx, w.nodes[idx].h};
    } else {
        int sy = rngRange(w, w.nodes[idx].h / 3, w.nodes[idx].h * 2 / 3);
        w.nodes[left] = {w.nodes[idx].x, w.nodes[idx].y, w.nodes[idx].w, sy};
        w.nodes[right] = {w.nodes[idx].x, w.nodes[idx].y + sy, w.nodes[idx].w, w.nodes[idx].h - sy};
    }
    if (right + 1 > w.node_count) w.node_count = right + 1;
    bspSplit(w, left, depth + 1);
    bspSplit(w, right, depth + 1);
}

bool isLeaf(World& w, int idx) {
    int left = 2 * idx + 1;
    return left >= w.node_count || (w.nodes[left].w == 0 && w.nodes[left].h == 0);
}

void carveRoom(World& w, BSPNode node) {
    int rw = rngRange(w, 3, node.w - 2);
    int rh = rngRange(w, 3, node.h - 2);
    int rx = rngRange(w, node.x + 1, node.x + node.w - rw - 1);
    int ry = rngRange(w, node.y + 1, node.y + node.h - rh - 1);
    for (int y = ry; y < ry + rh; y++)
        for (int x = rx; x < rx + rw; x++)
            w.dungeon[y][x] = TILE_FLOOR;
    w.rooms[w.room_count] = {rx, ry, rw, rh, rx + rw/2, ry + rh/2};
    w.room_count++;
}

void carveCorridor(World& w, int x1, int y1, int x2, int y2) {
    int dx = (x2 > x1) ? 1 : -1;
    for (int x = x1; x != x2; x += dx)
        if (w.dungeon[y1][x] == TILE_WALL) w.dungeon[y1][x] = TILE_CORRIDOR;
    int dy = (y2 > y1) ? 1 : -1;
    for (int y = y1; y != y2 + dy; y += dy)
        if (w.dungeon[y][x2] == TILE_WALL) w.dungeon[y][x2] = TILE_CORRIDOR;
}

void findRoomCenter(World& w, int idx, int& cx, int& cy) {
    if (isLeaf(w, idx)) { for (int i = 0; i < w.room_count; i++) { if (w.rooms[i].x >= w.nodes[idx].x && w.rooms[i].x < w.nodes[idx].x + w.nodes[idx].w && w.rooms[i].y >= w.nodes[idx].y && w.rooms[i].y < w.nodes[idx].y + w.nodes[idx].h) { cx = w.rooms[i].cx; cy = w.rooms[i].cy; return; } } }
    int left = 2 * idx + 1; if (left < w.node_count && w.nodes[left].w > 0) findRoomCenter(w, left, cx, cy);
}

void connectBSP(World& w, int idx, int& cc) {
    if (isLeaf(w, idx)) return;
    int left = 2*idx+1, right = 2*idx+2; if (right >= w.node_count) return;
    int lcx=0,lcy=0,rcx=0,rcy=0; findRoomCenter(w,left,lcx,lcy); findRoomCenter(w,right,rcx,rcy);
    carveCorridor(w,lcx,lcy,rcx,rcy); cc++; connectBSP(w,left,cc); connectBSP(w,right,cc);
}

int addEntity(World& w, int type, int x, int y, int hp) {
    int i = w.entity_count++;
    w.entity_id[i] = w.nextId++;
    w.entity_type[i] = type;
    w.entity_x[i] = x;
    w.entity_y[i] = y;
    w.entity_hp[i] = hp;
    w.entity_active[i] = true;
    return i;
}

int findEntityById(World& w, int id) {
    for (int i = 0; i < w.entity_count; i++)
        if (w.entity_id[i] == id) return i;
    return -1;
}

int findEntityAt(World& w, int x, int y, int type) {
    for (int i = 0; i < w.entity_count; i++)
        if (w.entity_active[i] && w.entity_type[i] == type && w.entity_x[i] == x && w.entity_y[i] == y) return i;
    return -1;
}

void populateEnemies(World& w) {
    for (int i = 1; i < w.room_count; i++) {
        int count = rngRange(w, 1, 3);
        for (int j = 0; j < count; j++) {
            int ex = rngRange(w, w.rooms[i].x, w.rooms[i].x + w.rooms[i].w - 1);
            int ey = rngRange(w, w.rooms[i].y, w.rooms[i].y + w.rooms[i].h - 1);
            addEntity(w, ENT_ENEMY, ex, ey, 3);
        }
    }
}

void generateFloor(World& w) {
    int savedHp = (w.entity_count > 0) ? w.entity_hp[0] : 10;
    memset(w.dungeon, 0, sizeof(w.dungeon));
    w.node_count = 1; w.room_count = 0; w.entity_count = 0;
    memset(w.nodes, 0, sizeof(w.nodes));
    w.nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(w, 0, 0);
    for (int i = 0; i < w.node_count; i++) if (isLeaf(w, i)) carveRoom(w, w.nodes[i]);
    int cc = 0; connectBSP(w, 0, cc);
    addEntity(w, ENT_PLAYER, w.rooms[0].cx, w.rooms[0].cy, savedHp);
    w.stairsX = w.rooms[w.room_count-1].cx; w.stairsY = w.rooms[w.room_count-1].cy;
    populateEnemies(w);
}

void handleInput(World& w) {
    if (w.gameOver) return;
    int nx = w.entity_x[0], ny = w.entity_y[0];
    if (IsKeyPressed(KEY_W)) ny--; if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--; if (IsKeyPressed(KEY_D)) nx++;
    if (nx == w.entity_x[0] && ny == w.entity_y[0]) return;
    if (nx == w.stairsX && ny == w.stairsY) { w.floor_num++; w.score += 50; w.rng_state = (uint32_t)(w.floor_num * 48271); generateFloor(w); return; }
    int ei = findEntityAt(w, nx, ny, ENT_ENEMY);
    if (ei >= 0) {
        w.entity_hp[ei]--; w.entity_hp[0]--;
        if (w.entity_hp[ei] <= 0) { w.entity_active[ei] = false; w.score += 10; }
        if (w.entity_hp[0] <= 0) w.gameOver = true;
    }
    else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != TILE_WALL) {
        w.entity_x[0] = nx; w.entity_y[0] = ny;
    }
}

// TODO: Write renderTerrain(World& w)
// Draw floor tiles (DARKGRAY), corridors ({60,60,60,255}), and stairs (YELLOW)

// TODO: Write renderEntities(World& w)
// Loop all entities, skip inactive, color by type (GREEN for player, RED for enemy)

// TODO: Write renderHUD(World& w)
// Draw HP/Floor/Score text and GAME OVER message

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.nextId = 1;
    generateFloor(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Entities: " << w.entity_count << endl;
    cout << "NextID: " << w.nextId << endl;
    cout << "Pipeline: input|terrain|entities|hud" << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (!WindowShouldClose()) {
        handleInput(w);
        BeginDrawing();
        ClearBackground(BLACK);
        // TODO: Call renderTerrain(w), renderEntities(w), renderHUD(w)
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;
const int MAX_NODES = 15;
const int MAX_ENTITIES = 64;

enum TileType { TILE_WALL = 0, TILE_FLOOR = 1, TILE_CORRIDOR = 2, TILE_STAIRS = 3 };
enum EntityType { ENT_PLAYER = 0, ENT_ENEMY = 1 };
struct Vec2i { int x, y; };
struct BSPNode { int x, y, w, h; };
struct Room { int x, y, w, h, cx, cy; };

struct World {
    int dungeon[MAP_H][MAP_W];
    BSPNode nodes[MAX_NODES];
    int node_count;
    Room rooms[8];
    int room_count;
    int entity_id[MAX_ENTITIES];
    int entity_x[MAX_ENTITIES];
    int entity_y[MAX_ENTITIES];
    int entity_hp[MAX_ENTITIES];
    int entity_type[MAX_ENTITIES];
    bool entity_active[MAX_ENTITIES];
    int entity_count;
    int nextId;
    int stairsX, stairsY;
    int floor_num;
    int score;
    bool gameOver;
    uint32_t rng_state;
};

uint32_t rngNext(World& w) { w.rng_state = w.rng_state * 48271u % 0x7fffffffu; return w.rng_state; }
int rngRange(World& w, int lo, int hi) { return lo + (int)(rngNext(w) % (uint32_t)(hi - lo + 1)); }

void bspSplit(World& w, int idx, int depth) {
    if (depth >= 2 || w.nodes[idx].w < 10 || w.nodes[idx].h < 10) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
    if (right >= MAX_NODES) return;
    if (depth % 2 == 0) {
        int sx = rngRange(w, w.nodes[idx].w / 3, w.nodes[idx].w * 2 / 3);
        w.nodes[left] = {w.nodes[idx].x, w.nodes[idx].y, sx, w.nodes[idx].h};
        w.nodes[right] = {w.nodes[idx].x + sx, w.nodes[idx].y, w.nodes[idx].w - sx, w.nodes[idx].h};
    } else {
        int sy = rngRange(w, w.nodes[idx].h / 3, w.nodes[idx].h * 2 / 3);
        w.nodes[left] = {w.nodes[idx].x, w.nodes[idx].y, w.nodes[idx].w, sy};
        w.nodes[right] = {w.nodes[idx].x, w.nodes[idx].y + sy, w.nodes[idx].w, w.nodes[idx].h - sy};
    }
    if (right + 1 > w.node_count) w.node_count = right + 1;
    bspSplit(w, left, depth + 1);
    bspSplit(w, right, depth + 1);
}

bool isLeaf(World& w, int idx) {
    int left = 2 * idx + 1;
    return left >= w.node_count || (w.nodes[left].w == 0 && w.nodes[left].h == 0);
}

void carveRoom(World& w, BSPNode node) {
    int rw = rngRange(w, 3, node.w - 2);
    int rh = rngRange(w, 3, node.h - 2);
    int rx = rngRange(w, node.x + 1, node.x + node.w - rw - 1);
    int ry = rngRange(w, node.y + 1, node.y + node.h - rh - 1);
    for (int y = ry; y < ry + rh; y++)
        for (int x = rx; x < rx + rw; x++)
            w.dungeon[y][x] = TILE_FLOOR;
    w.rooms[w.room_count] = {rx, ry, rw, rh, rx + rw/2, ry + rh/2};
    w.room_count++;
}

void carveCorridor(World& w, int x1, int y1, int x2, int y2) {
    int dx = (x2 > x1) ? 1 : -1;
    for (int x = x1; x != x2; x += dx)
        if (w.dungeon[y1][x] == TILE_WALL) w.dungeon[y1][x] = TILE_CORRIDOR;
    int dy = (y2 > y1) ? 1 : -1;
    for (int y = y1; y != y2 + dy; y += dy)
        if (w.dungeon[y][x2] == TILE_WALL) w.dungeon[y][x2] = TILE_CORRIDOR;
}

void findRoomCenter(World& w, int idx, int& cx, int& cy) {
    if (isLeaf(w, idx)) { for (int i = 0; i < w.room_count; i++) { if (w.rooms[i].x >= w.nodes[idx].x && w.rooms[i].x < w.nodes[idx].x + w.nodes[idx].w && w.rooms[i].y >= w.nodes[idx].y && w.rooms[i].y < w.nodes[idx].y + w.nodes[idx].h) { cx = w.rooms[i].cx; cy = w.rooms[i].cy; return; } } }
    int left = 2 * idx + 1; if (left < w.node_count && w.nodes[left].w > 0) findRoomCenter(w, left, cx, cy);
}

void connectBSP(World& w, int idx, int& cc) {
    if (isLeaf(w, idx)) return;
    int left = 2*idx+1, right = 2*idx+2; if (right >= w.node_count) return;
    int lcx=0,lcy=0,rcx=0,rcy=0; findRoomCenter(w,left,lcx,lcy); findRoomCenter(w,right,rcx,rcy);
    carveCorridor(w,lcx,lcy,rcx,rcy); cc++; connectBSP(w,left,cc); connectBSP(w,right,cc);
}

int addEntity(World& w, int type, int x, int y, int hp) {
    int i = w.entity_count++;
    w.entity_id[i] = w.nextId++;
    w.entity_type[i] = type;
    w.entity_x[i] = x;
    w.entity_y[i] = y;
    w.entity_hp[i] = hp;
    w.entity_active[i] = true;
    return i;
}

int findEntityById(World& w, int id) {
    for (int i = 0; i < w.entity_count; i++)
        if (w.entity_id[i] == id) return i;
    return -1;
}

int findEntityAt(World& w, int x, int y, int type) {
    for (int i = 0; i < w.entity_count; i++)
        if (w.entity_active[i] && w.entity_type[i] == type && w.entity_x[i] == x && w.entity_y[i] == y) return i;
    return -1;
}

void populateEnemies(World& w) {
    for (int i = 1; i < w.room_count; i++) {
        int count = rngRange(w, 1, 3);
        for (int j = 0; j < count; j++) {
            int ex = rngRange(w, w.rooms[i].x, w.rooms[i].x + w.rooms[i].w - 1);
            int ey = rngRange(w, w.rooms[i].y, w.rooms[i].y + w.rooms[i].h - 1);
            addEntity(w, ENT_ENEMY, ex, ey, 3);
        }
    }
}

void generateFloor(World& w) {
    int savedHp = (w.entity_count > 0) ? w.entity_hp[0] : 10;
    memset(w.dungeon, 0, sizeof(w.dungeon));
    w.node_count = 1; w.room_count = 0; w.entity_count = 0;
    memset(w.nodes, 0, sizeof(w.nodes));
    w.nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(w, 0, 0);
    for (int i = 0; i < w.node_count; i++) if (isLeaf(w, i)) carveRoom(w, w.nodes[i]);
    int cc = 0; connectBSP(w, 0, cc);
    addEntity(w, ENT_PLAYER, w.rooms[0].cx, w.rooms[0].cy, savedHp);
    w.stairsX = w.rooms[w.room_count-1].cx; w.stairsY = w.rooms[w.room_count-1].cy;
    populateEnemies(w);
}

void handleInput(World& w) {
    if (w.gameOver) return;
    int nx = w.entity_x[0], ny = w.entity_y[0];
    if (IsKeyPressed(KEY_W)) ny--; if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--; if (IsKeyPressed(KEY_D)) nx++;
    if (nx == w.entity_x[0] && ny == w.entity_y[0]) return;
    if (nx == w.stairsX && ny == w.stairsY) { w.floor_num++; w.score += 50; w.rng_state = (uint32_t)(w.floor_num * 48271); generateFloor(w); return; }
    int ei = findEntityAt(w, nx, ny, ENT_ENEMY);
    if (ei >= 0) {
        w.entity_hp[ei]--; w.entity_hp[0]--;
        if (w.entity_hp[ei] <= 0) { w.entity_active[ei] = false; w.score += 10; }
        if (w.entity_hp[0] <= 0) w.gameOver = true;
    }
    else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != TILE_WALL) {
        w.entity_x[0] = nx; w.entity_y[0] = ny;
    }
}

void renderTerrain(World& w) {
    for (int y = 0; y < MAP_H; y++) for (int x = 0; x < MAP_W; x++) {
        if (w.dungeon[y][x] == TILE_FLOOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,DARKGRAY);
        else if (w.dungeon[y][x] == TILE_CORRIDOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,(Color){60,60,60,255});
    }
    DrawRectangle(w.stairsX*TILE_SIZE,w.stairsY*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,YELLOW);
}

void renderEntities(World& w) {
    for (int i = 0; i < w.entity_count; i++) {
        if (!w.entity_active[i]) continue;
        Color c = (w.entity_type[i] == ENT_PLAYER) ? GREEN : RED;
        DrawRectangle(w.entity_x[i]*TILE_SIZE,w.entity_y[i]*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,c);
    }
}

void renderHUD(World& w) {
    DrawText(TextFormat("HP: %d  Floor: %d  Score: %d",w.entity_hp[0],w.floor_num,w.score),10,SCREEN_H-25,20,GREEN);
    if (w.gameOver) DrawText("GAME OVER",SCREEN_W/2-80,SCREEN_H/2,30,RED);
}

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.nextId = 1;
    generateFloor(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Entities: " << w.entity_count << endl;
    cout << "NextID: " << w.nextId << endl;
    cout << "Pipeline: input|terrain|entities|hud" << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (!WindowShouldClose()) {
        handleInput(w);
        BeginDrawing();
        ClearBackground(BLACK);
        renderTerrain(w);
        renderEntities(w);
        renderHUD(w);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints seed", expectedOutput: "Seed: 42" },
      { id: "g2", description: "Floor number", expectedOutput: "Floor: 1" },
      { id: "g3", description: "Room count", expectedOutput: "Rooms: 4" },
      { id: "g4", description: "Entity count", expectedOutput: "Entities: 6" },
      { id: "g5", description: "Next ID counter", expectedOutput: "NextID: 7" },
      { id: "g6", description: "Pipeline passes", expectedOutput: "Pipeline: input|terrain|entities|hud" },
    ],
    hints: [
      "renderTerrain draws floor, corridor, and stairs tiles using the dungeon array.",
      "renderEntities loops all entities, skips inactive, colors by type (GREEN=player, RED=enemy).",
      "renderHUD uses DrawText with TextFormat for HP, floor, and score display.",
    ],
    estimatedMinutes: 20,
    customizationPrompt: "This is your 300 XP milestone! The architecture is clean: World struct owns state, SoA arrays store entities, pipeline organizes execution. Customize the visuals: try different entity colors based on HP, add a border around the dungeon, change the HUD layout, or add a title screen. Tests only check cout output, so the visual layer is your creative playground.",
  },
};
