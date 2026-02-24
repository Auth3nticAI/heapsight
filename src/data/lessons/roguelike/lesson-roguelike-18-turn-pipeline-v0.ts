import { Lesson } from "@/types/lesson";

export const lessonRoguelike18: Lesson = {
  id: "roguelike-18-turn-pipeline-v0",
  title: "Turn Pipeline v0",
  description: "Extract input handling into a turn pipeline module. Each game tick follows an explicit sequence: player turn, enemy turn, cleanup.",
  order: 18,
  xpReward: 100,
  tier: "pro",
  concepts: ["turn pipeline", "game loop phases", "module extraction", "separation of concerns"],
  part1: {
    title: "Concept: The Turn Pipeline",
    type: "concept",
    instructions: `# Turn Pipeline v0

## Mental Model
A turn-based game is a PIPELINE. Every turn, three things happen in strict order:
1. **Player acts** (move, attack, use item)
2. **Enemies act** (chase, patrol, attack)
3. **Cleanup** (remove dead entities, check win/loss)

Skip any phase and the game breaks. Let enemies act before the player and combat feels unfair. Skip cleanup and dead enemies keep attacking. The order is sacred.

## What Breaks Without This
Right now our game loop has \`handleInput()\` doing everything: reading keys, moving the player, checking stairs, resolving combat. That works at 200 lines. At 2000 lines, you cannot find where combat happens, where movement happens, where cleanup happens.

## The Fix: Explicit Turn Phases
Split the game loop into named phases:

```cpp
while (!WindowShouldClose()) {
    processPlayerTurn(world);  // Phase 1
    processEnemyTurn(world);   // Phase 2
    cleanupTurn(world);        // Phase 3
    render(world);
}
```

Each phase is a function in \`hs_turns.h/.cpp\`. The game loop reads like a sentence.

## Key Concepts
- **Phase ordering**: Player then Enemy then Cleanup. Always.
- **Single responsibility**: Each phase function does ONE thing.
- **Placeholder phases**: \`processEnemyTurn()\` starts empty. The architecture is ready before the behavior is.
- **Cleanup is separate**: Dead entity removal happens AFTER all actions resolve.

## Your Task
Simulate 2 turns of a turn pipeline. Each turn prints its 4 phases.

Expected output:
```
Turn 1: input
Turn 1: player_action
Turn 1: enemy_action
Turn 1: cleanup
Turn 2: input
Turn 2: player_action
Turn 2: enemy_action
Turn 2: cleanup
Turns: 2
```

## Beginner Trap
**Combining player and enemy actions into one function.** The player and enemies have DIFFERENT decision-making. Combining them creates a function that does two unrelated things.

## Elite Insight
Nethack's main loop calls \`you_moved()\`, then \`movemon()\`, then \`docleanup()\`. Every shipped roguelike uses this exact three-phase pipeline.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write a loop that runs 2 turns
// Each turn has 4 phases: input, player_action, enemy_action, cleanup

int main() {
    int turns = 2;

    // TODO: Loop from turn 1 to turns
    // For each turn, print the 4 phases

    cout << \"Turns: \" << turns << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int turns = 2;

    for (int t = 1; t <= turns; t++) {
        cout << \"Turn \" << t << \": input\" << endl;
        cout << \"Turn \" << t << \": player_action\" << endl;
        cout << \"Turn \" << t << \": enemy_action\" << endl;
        cout << \"Turn \" << t << \": cleanup\" << endl;
    }

    cout << \"Turns: \" << turns << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Turn 1 input", expectedOutput: "Turn 1: input" },
      { id: "t2", description: "Turn 1 player", expectedOutput: "Turn 1: player_action" },
      { id: "t3", description: "Turn 1 enemy", expectedOutput: "Turn 1: enemy_action" },
      { id: "t4", description: "Turn 1 cleanup", expectedOutput: "Turn 1: cleanup" },
      { id: "t5", description: "Turn 2 input", expectedOutput: "Turn 2: input" },
      { id: "t6", description: "Turn 2 player", expectedOutput: "Turn 2: player_action" },
      { id: "t7", description: "Turn 2 enemy", expectedOutput: "Turn 2: enemy_action" },
      { id: "t8", description: "Turn 2 cleanup", expectedOutput: "Turn 2: cleanup" },
      { id: "t9", description: "Turn count", expectedOutput: "Turns: 2" },
    ],
    hints: [
      "Use a for loop: for (int t = 1; t <= turns; t++)",
      "Inside the loop, print each phase using cout with the turn number t.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Turn Pipeline Module",
    type: "game_builder",
    instructions: `# Build: Turn Pipeline Module

## Mental Model
The \`handleInput()\` function in main.cpp is doing too much. We extract this into a dedicated \`hs_turns\` module with three explicit pipeline phases.

## Your Task
Create \`hs_turns.h\` and \`hs_turns.cpp\`. Move the input/movement logic from \`handleInput()\` into \`processPlayerTurn()\`. Add placeholder functions \`processEnemyTurn()\` and \`cleanupTurn()\`. Update main.cpp.

Expected cout output:
```
Seed: 42
Floor: 1
Rooms: 4
Entities: 6
NextID: 7
Modules: generate|render|rooms|turns
```

## File Overview
| File | Purpose |
|------|---------|
| \`src/hs_types.h\` | Constants, enums, basic structs |
| \`src/hs_world.h\` | World struct definition |
| \`src/hs_generate.h/.cpp\` | Generation functions |
| \`src/hs_render.h/.cpp\` | Render functions |
| \`src/hs_rooms.h/.cpp\` | Room query functions |
| \`src/hs_turns.h/.cpp\` | **NEW** Turn pipeline |
| \`src/main.cpp\` | Game loop with three-phase pipeline |

## What to Do
1. In \`hs_turns.h\`: Declare processPlayerTurn, processEnemyTurn, cleanupTurn.
2. In \`hs_turns.cpp\`: Implement processPlayerTurn() by moving handleInput logic. Leave processEnemyTurn() and cleanupTurn() as placeholders.
3. In \`main.cpp\`: Remove handleInput(). Include hs_turns.h. Call the three pipeline functions.

## Did It Work?
Game plays identically to before. The cout output shows \`Modules: generate|render|rooms|turns\` confirming all 4 modules are loaded.

## Beginner Trap
**Forgetting to include \`hs_generate.h\` in hs_turns.cpp.** processPlayerTurn() calls generateFloor() and findEntityAt() which are declared in hs_generate.h.

## Elite Insight
The turn pipeline is the roguelike equivalent of the RPG's command pipeline. When you add enemy AI in later lessons, it slots into processEnemyTurn() without touching any other phase.`,
    starterCode: {
  "src/hs_types.h": `#pragma once

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
struct Room { int x, y, w, h, cx, cy; };`,
  "src/hs_world.h": `#pragma once
#include "hs_types.h"

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
};`,
  "src/hs_generate.h": `#pragma once
#include "hs_types.h"

struct World;
uint32_t rngNext(World& w);
int rngRange(World& w, int lo, int hi);
void bspSplit(World& w, int idx, int depth);
bool isLeaf(World& w, int idx);
void carveRoom(World& w, BSPNode node);
void carveCorridor(World& w, int x1, int y1, int x2, int y2);
void findRoomCenter(World& w, int idx, int& cx, int& cy);
void connectBSP(World& w, int idx, int& cc);
int addEntity(World& w, int type, int x, int y, int hp);
int findEntityById(World& w, int id);
int findEntityAt(World& w, int x, int y, int type);
void populateEnemies(World& w);
void generateFloor(World& w);`,
  "src/hs_generate.cpp": `#include "hs_generate.h"
#include "hs_world.h"
#include <cstring>

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
}`,
  "src/hs_render.h": `#pragma once

struct World;
void renderTerrain(World& w);
void renderEntities(World& w);
void renderHUD(World& w);`,
  "src/hs_render.cpp": `#include "hs_render.h"
#include "hs_world.h"
#include "hs_types.h"
#include "raylib.h"

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
}`,
  "src/hs_rooms.h": `#pragma once

struct World;
struct Room;
Room* getRoomAt(World& w, int x, int y);
int getRoomIndex(World& w, int x, int y);
bool isInRoom(Room& r, int x, int y);`,
  "src/hs_rooms.cpp": `#include "hs_rooms.h"
#include "hs_world.h"
#include "hs_types.h"

bool isInRoom(Room& r, int x, int y) {
    return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

Room* getRoomAt(World& w, int x, int y) {
    for (int i = 0; i < w.room_count; i++)
        if (isInRoom(w.rooms[i], x, y)) return &w.rooms[i];
    return nullptr;
}

int getRoomIndex(World& w, int x, int y) {
    for (int i = 0; i < w.room_count; i++)
        if (isInRoom(w.rooms[i], x, y)) return i;
    return -1;
}`,
  "src/hs_turns.h": `#pragma once

struct World;

// TODO: Declare three turn pipeline functions:
// void processPlayerTurn(World& w);
// void processEnemyTurn(World& w);
// void cleanupTurn(World& w);`,
  "src/hs_turns.cpp": `#include "hs_turns.h"
#include "hs_world.h"
#include "hs_generate.h"
#include "hs_types.h"
#include "raylib.h"

// TODO: Implement processPlayerTurn(World& w)
// Move the handleInput logic here:
// - If gameOver, return immediately
// - Read WASD keys to compute nx, ny
// - If no movement, return
// - Check stairs: if (nx == w.stairsX && ny == w.stairsY) advance floor
// - Check enemy at (nx, ny): bump combat
// - Otherwise: move if tile is not a wall

// TODO: Implement processEnemyTurn(World& w)
// Placeholder for now - enemies don't move yet

// TODO: Implement cleanupTurn(World& w)
// Placeholder for now - mark phase only`,
  "src/main.cpp": `#include <iostream>
#include "raylib.h"
#include "hs_types.h"
#include "hs_world.h"
#include "hs_generate.h"
#include "hs_render.h"
#include "hs_rooms.h"
#include "hs_turns.h"
using namespace std;

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.nextId = 1;
    generateFloor(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Entities: " << w.entity_count << endl;
    cout << "NextID: " << w.nextId << endl;
    cout << "Modules: generate|render|rooms|turns" << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (!WindowShouldClose()) {
        // TODO: Call the three-phase turn pipeline:
        // processPlayerTurn(w);
        // processEnemyTurn(w);
        // cleanupTurn(w);
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
    },
    solutionCode: {
  "src/hs_types.h": `#pragma once

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
struct Room { int x, y, w, h, cx, cy; };`,
  "src/hs_world.h": `#pragma once
#include "hs_types.h"

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
};`,
  "src/hs_generate.h": `#pragma once
#include "hs_types.h"

struct World;
uint32_t rngNext(World& w);
int rngRange(World& w, int lo, int hi);
void bspSplit(World& w, int idx, int depth);
bool isLeaf(World& w, int idx);
void carveRoom(World& w, BSPNode node);
void carveCorridor(World& w, int x1, int y1, int x2, int y2);
void findRoomCenter(World& w, int idx, int& cx, int& cy);
void connectBSP(World& w, int idx, int& cc);
int addEntity(World& w, int type, int x, int y, int hp);
int findEntityById(World& w, int id);
int findEntityAt(World& w, int x, int y, int type);
void populateEnemies(World& w);
void generateFloor(World& w);`,
  "src/hs_generate.cpp": `#include "hs_generate.h"
#include "hs_world.h"
#include <cstring>

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
}`,
  "src/hs_render.h": `#pragma once

struct World;
void renderTerrain(World& w);
void renderEntities(World& w);
void renderHUD(World& w);`,
  "src/hs_render.cpp": `#include "hs_render.h"
#include "hs_world.h"
#include "hs_types.h"
#include "raylib.h"

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
}`,
  "src/hs_rooms.h": `#pragma once

struct World;
struct Room;
Room* getRoomAt(World& w, int x, int y);
int getRoomIndex(World& w, int x, int y);
bool isInRoom(Room& r, int x, int y);`,
  "src/hs_rooms.cpp": `#include "hs_rooms.h"
#include "hs_world.h"
#include "hs_types.h"

bool isInRoom(Room& r, int x, int y) {
    return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

Room* getRoomAt(World& w, int x, int y) {
    for (int i = 0; i < w.room_count; i++)
        if (isInRoom(w.rooms[i], x, y)) return &w.rooms[i];
    return nullptr;
}

int getRoomIndex(World& w, int x, int y) {
    for (int i = 0; i < w.room_count; i++)
        if (isInRoom(w.rooms[i], x, y)) return i;
    return -1;
}`,
  "src/hs_turns.h": `#pragma once

struct World;
void processPlayerTurn(World& w);
void processEnemyTurn(World& w);
void cleanupTurn(World& w);`,
  "src/hs_turns.cpp": `#include "hs_turns.h"
#include "hs_world.h"
#include "hs_generate.h"
#include "hs_types.h"
#include "raylib.h"

void processPlayerTurn(World& w) {
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

void processEnemyTurn(World& w) {
    // Placeholder: enemies don't move yet
    // Future lessons will add enemy AI here
}

void cleanupTurn(World& w) {
    // Mark phase -- no array compaction, just status checks
    // Future: compact dead entities, update references
}`,
  "src/main.cpp": `#include <iostream>
#include "raylib.h"
#include "hs_types.h"
#include "hs_world.h"
#include "hs_generate.h"
#include "hs_render.h"
#include "hs_rooms.h"
#include "hs_turns.h"
using namespace std;

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.nextId = 1;
    generateFloor(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Entities: " << w.entity_count << endl;
    cout << "NextID: " << w.nextId << endl;
    cout << "Modules: generate|render|rooms|turns" << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (!WindowShouldClose()) {
        processPlayerTurn(w);
        processEnemyTurn(w);
        cleanupTurn(w);
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
    },
    tests: [
      { id: "g1", description: "Prints seed", expectedOutput: "Seed: 42" },
      { id: "g2", description: "Floor number", expectedOutput: "Floor: 1" },
      { id: "g3", description: "Room count", expectedOutput: "Rooms: 4" },
      { id: "g4", description: "Entity count", expectedOutput: "Entities: 6" },
      { id: "g5", description: "Next ID counter", expectedOutput: "NextID: 7" },
      { id: "g6", description: "All modules loaded", expectedOutput: "Modules: generate|render|rooms|turns" },
    ],
    hints: [
      "In hs_turns.h, declare: void processPlayerTurn(World& w); void processEnemyTurn(World& w); void cleanupTurn(World& w);",
      "In hs_turns.cpp, include hs_generate.h because processPlayerTurn calls generateFloor() and findEntityAt().",
      "In main.cpp, replace the TODO comments with: processPlayerTurn(w); processEnemyTurn(w); cleanupTurn(w);",
    ],
    estimatedMinutes: 20,
  },
};