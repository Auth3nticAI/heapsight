import { Lesson } from "@/types/lesson";

export const lessonRoguelike20: Lesson = {
  id: "roguelike-20-milestone-data-owned-dungeon",
  title: "Milestone: Data-Owned Dungeon",
  description: "Prove all state lives in World, all modules are split, turns are explicit, connectivity is validated. Write a diagnostic function that inspects World and reports its state.",
  order: 20,
  xpReward: 300,
  tier: "pro",
  concepts: ["data ownership", "single source of truth", "state validation", "milestone proof"],
  customizationPrompt: "This is your 300 XP data ownership milestone! Every byte of game state lives in World. Every module reads World, does its job, writes World back. Customize: add new fields to World (message log, turn counter, kill stats), change the HUD to show them, add color themes. Tests only check cout.",
  part1: {
    title: "Concept: Data Ownership",
    type: "concept",
    instructions: `# Milestone: Data-Owned Dungeon

## Mental Model
One struct owns ALL game state. Not scattered globals. Not variables hiding in different files. One struct: World. A function that takes `World&` has access to EVERYTHING. No surprises, no hidden state, no spooky action at a distance.

## What Breaks Without This
Imagine debugging a crash. `entity_hp[3]` is -5 but you never set it negative. Where did it change? If hp lives as a global array in hs_generate.cpp, any file can modify it. If hp lives inside `World`, you search for `w.entity_hp` and find EVERY access. Data ownership = debuggability.

## The Pattern

```cpp
struct World {
    int dungeon[MAP_H][MAP_W];
    Room rooms[8];
    int room_count;
    int entity_hp[64];
    int entity_count;
    int floor_num;
    int score;
    bool gameOver;
    uint32_t rng_state;
};
```

Every module takes `World&`:
- `generateFloor(World& w)` reads rng_state, writes dungeon + rooms + entities
- `renderTerrain(World& w)` reads dungeon, writes nothing
- `handleInput(World& w)` reads input + entities, writes entity positions
- `processTurn(World& w)` reads entities, writes hp + positions

## Your Task
Build a simple World struct and a printState function that reports all fields. This proves the concept: one struct, one truth, total visibility.

Expected output:
```
World state:
  Floor: 1
  Rooms: 3
  Entities: 5
  Score: 0
  GameOver: no
State: valid
```

## Beginner Trap
**Storing state in multiple places.** If `floor_num` exists as a global AND inside World, which is the truth? One will drift. One struct. One truth.

## Elite Insight
This pattern is called "single source of truth" in professional software. React uses it (one state tree). Game engines use it (ECS world). Databases use it (one schema). The roguelike's World struct is the same idea: every function that touches game state takes `World&`, so you can serialize, validate, or debug the ENTIRE game by inspecting one object.`,
    starterCode: `#include <iostream>
using namespace std;

struct World {
    int floor_num;
    int room_count;
    int entity_count;
    int score;
    bool gameOver;
};

// TODO: Write printState(World& w) that prints:
// World state:
//   Floor: <floor_num>
//   Rooms: <room_count>
//   Entities: <entity_count>
//   Score: <score>
//   GameOver: yes or no

bool validate(World& w) {
    return w.room_count > 0 && w.entity_count > 0;
}

int main() {
    World w = {};
    w.floor_num = 1;
    w.room_count = 3;
    w.entity_count = 5;
    w.score = 0;
    w.gameOver = false;

    printState(w);
    cout << "State: " << (validate(w) ? "valid" : "INVALID") << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct World {
    int floor_num;
    int room_count;
    int entity_count;
    int score;
    bool gameOver;
};

void printState(World& w) {
    cout << "World state:" << endl;
    cout << "  Floor: " << w.floor_num << endl;
    cout << "  Rooms: " << w.room_count << endl;
    cout << "  Entities: " << w.entity_count << endl;
    cout << "  Score: " << w.score << endl;
    cout << "  GameOver: " << (w.gameOver ? "yes" : "no") << endl;
}

bool validate(World& w) {
    return w.room_count > 0 && w.entity_count > 0;
}

int main() {
    World w = {};
    w.floor_num = 1;
    w.room_count = 3;
    w.entity_count = 5;
    w.score = 0;
    w.gameOver = false;

    printState(w);
    cout << "State: " << (validate(w) ? "valid" : "INVALID") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "World state header", expectedOutput: "World state:" },
      { id: "t2", description: "Floor number", expectedOutput: "Floor: 1" },
      { id: "t3", description: "Room count", expectedOutput: "Rooms: 3" },
      { id: "t4", description: "Entity count", expectedOutput: "Entities: 5" },
      { id: "t5", description: "Score", expectedOutput: "Score: 0" },
      { id: "t6", description: "GameOver state", expectedOutput: "GameOver: no" },
      { id: "t7", description: "Validation", expectedOutput: "State: valid" },
    ],
    hints: [
      "printState takes World& w and uses standard output to print each field.",
      "For GameOver, use the ternary: w.gameOver ? yes : no",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Data-Owned Dungeon Milestone",
    type: "game_builder",
    instructions: `# Build: Data-Owned Dungeon Milestone

## 300 XP Milestone
This is a milestone lesson. You've built:
- **World struct** that owns ALL game state (L11)
- **Type definitions** and coordinates (L12)
- **Entity IDs** for stable references (L13)
- **SoA entity arrays** for cache-friendly access (L14)
- **Multi-file split** with headers and sources (L15-L16)
- **Room registry** module (L17)
- **Turn pipeline** with explicit player/enemy turns (L18)
- **Connectivity validation** via BFS flood fill (L19)

Now prove it: write `printWorldState(World& w)` in main.cpp that inspects World and reports every critical metric. This function is your proof that ALL state lives in one place.

## Your Task
`printWorldState` goes in main.cpp (not a module). It's a debug/diagnostic function that reads from ALL modules:

Then call it in main() after `generateFloor(w)`.

Expected output:
```
Seed: 42
Floor: 1
Rooms: 4
Entities: 6
NextID: 7
Connected: yes
Modules: generate|render|rooms|turns
Milestone: data-owned-dungeon
```

## File Overview
| File | Purpose |
|------|--------|
| `src/hs_types.h` | Constants, enums, basic structs |
| `src/hs_world.h` | World struct definition |
| `src/hs_generate.h/.cpp` | Generation + connectivity validation |
| `src/hs_render.h/.cpp` | Rendering functions |
| `src/hs_rooms.h/.cpp` | Room registry and queries |
| `src/hs_turns.h/.cpp` | Turn pipeline (player + enemy) |
| `src/main.cpp` | Game loop + printWorldState (YOUR TODO) |

## Did It Work?
The game plays the same as before. But the output now proves:
1. All state is in World (printWorldState reads it all from w)
2. Connectivity passes (validateConnectivity returns true)
3. All 4 modules are loaded (generate, render, rooms, turns)
4. This is the data-owned-dungeon milestone

## Beginner Trap
**Putting printWorldState in a module file.** It's a diagnostic function that reads from ALL modules. It belongs in main.cpp where it has access to all headers. Modules should be single-responsibility.

## Elite Insight
Professional games have a `dumpState()` function that writes the entire game state to a log file for crash debugging. Your printWorldState is the same pattern. When something breaks, you call it and see EVERYTHING. No guessing, no breakpoints, no wondering what floor_num is.`,
    starterCode: {
  "src/hs_types.h": `#pragma once

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;
const int MAX_NODES = 15;
const int MAX_ENTITIES = 64;
const int MAX_ROOMS = 8;

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
    Room rooms[MAX_ROOMS];
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
    int turnNumber;
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
void generateFloor(World& w);
bool validateConnectivity(World& w);`,
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
}

bool validateConnectivity(World& w) {
    if (w.room_count < 2) return false;
    bool visited[MAP_H][MAP_W];
    memset(visited, false, sizeof(visited));
    int qx[MAP_W * MAP_H], qy[MAP_W * MAP_H];
    int front = 0, back = 0;
    qx[back] = w.rooms[0].cx; qy[back] = w.rooms[0].cy; back++;
    visited[w.rooms[0].cy][w.rooms[0].cx] = true;
    while (front < back) {
        int cx = qx[front], cy = qy[front]; front++;
        int dx[] = {0,0,1,-1};
        int dy[] = {1,-1,0,0};
        for (int d = 0; d < 4; d++) {
            int nx = cx+dx[d], ny = cy+dy[d];
            if (nx>=0 && nx<MAP_W && ny>=0 && ny<MAP_H && !visited[ny][nx] && w.dungeon[ny][nx]!=TILE_WALL) {
                visited[ny][nx] = true;
                qx[back] = nx; qy[back] = ny; back++;
            }
        }
    }
    for (int i = 0; i < w.room_count; i++) {
        if (!visited[w.rooms[i].cy][w.rooms[i].cx]) return false;
    }
    return true;
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
    DrawText(TextFormat("HP: %d  Floor: %d  Score: %d  Turn: %d",w.entity_hp[0],w.floor_num,w.score,w.turnNumber),10,SCREEN_H-25,20,GREEN);
    if (w.gameOver) DrawText("GAME OVER",SCREEN_W/2-80,SCREEN_H/2,30,RED);
}`,
  "src/hs_rooms.h": `#pragma once
#include "hs_types.h"

struct World;
int getRoomAt(World& w, int x, int y);
Room getRoomByIndex(World& w, int idx);
bool isInRoom(Room& r, int x, int y);`,
  "src/hs_rooms.cpp": `#include "hs_rooms.h"
#include "hs_world.h"

int getRoomAt(World& w, int x, int y) {
    for (int i = 0; i < w.room_count; i++) {
        if (x >= w.rooms[i].x && x < w.rooms[i].x + w.rooms[i].w &&
            y >= w.rooms[i].y && y < w.rooms[i].y + w.rooms[i].h) return i;
    }
    return -1;
}

Room getRoomByIndex(World& w, int idx) {
    if (idx >= 0 && idx < w.room_count) return w.rooms[idx];
    return {0,0,0,0,0,0};
}

bool isInRoom(Room& r, int x, int y) {
    return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}`,
  "src/hs_turns.h": `#pragma once

struct World;
void processPlayerTurn(World& w, int dx, int dy);
void processEnemyTurns(World& w);
void cleanupDead(World& w);`,
  "src/hs_turns.cpp": `#include "hs_turns.h"
#include "hs_world.h"
#include "hs_generate.h"

void processPlayerTurn(World& w, int dx, int dy) {
    if (w.gameOver) return;
    int nx = w.entity_x[0] + dx;
    int ny = w.entity_y[0] + dy;
    if (nx == w.stairsX && ny == w.stairsY) {
        w.floor_num++; w.score += 50;
        w.rng_state = (uint32_t)(w.floor_num * 48271);
        generateFloor(w);
        return;
    }
    int ei = findEntityAt(w, nx, ny, ENT_ENEMY);
    if (ei >= 0) {
        w.entity_hp[ei]--; w.entity_hp[0]--;
        if (w.entity_hp[ei] <= 0) { w.entity_active[ei] = false; w.score += 10; }
        if (w.entity_hp[0] <= 0) w.gameOver = true;
    } else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != TILE_WALL) {
        w.entity_x[0] = nx; w.entity_y[0] = ny;
    }
    w.turnNumber++;
}

void processEnemyTurns(World& w) {
    for (int i = 1; i < w.entity_count; i++) {
        if (!w.entity_active[i]) continue;
        int dx = 0, dy = 0;
        int distX = w.entity_x[0] - w.entity_x[i];
        int distY = w.entity_y[0] - w.entity_y[i];
        int absDX = distX < 0 ? -distX : distX;
        int absDY = distY < 0 ? -distY : distY;
        if (absDX + absDY <= 5) {
            if (absDX > absDY) dx = (distX > 0) ? 1 : -1;
            else dy = (distY > 0) ? 1 : -1;
        }
        int nx = w.entity_x[i] + dx;
        int ny = w.entity_y[i] + dy;
        if (nx == w.entity_x[0] && ny == w.entity_y[0]) {
            w.entity_hp[0]--;
            if (w.entity_hp[0] <= 0) w.gameOver = true;
        } else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != TILE_WALL) {
            w.entity_x[i] = nx; w.entity_y[i] = ny;
        }
    }
}

void cleanupDead(World& w) {
    for (int i = w.entity_count - 1; i > 0; i--) {
        if (!w.entity_active[i]) {
            int last = w.entity_count - 1;
            if (i != last) {
                w.entity_id[i] = w.entity_id[last];
                w.entity_x[i] = w.entity_x[last];
                w.entity_y[i] = w.entity_y[last];
                w.entity_hp[i] = w.entity_hp[last];
                w.entity_type[i] = w.entity_type[last];
                w.entity_active[i] = w.entity_active[last];
            }
            w.entity_count--;
        }
    }
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

// TODO: Write printWorldState(World& w)
// It should print (using standard output):
//   Seed: 42
//   Floor: <w.floor_num>
//   Rooms: <w.room_count>
//   Entities: <w.entity_count>
//   NextID: <w.nextId>
//   Connected: yes or no (call validateConnectivity(w))
//   Modules: generate|render|rooms|turns
//   Milestone: data-owned-dungeon

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.nextId = 1;
    generateFloor(w);

    // TODO: Call printWorldState(w) here

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (!WindowShouldClose()) {
        int dx = 0, dy = 0;
        if (IsKeyPressed(KEY_W)) dy = -1;
        if (IsKeyPressed(KEY_S)) dy = 1;
        if (IsKeyPressed(KEY_A)) dx = -1;
        if (IsKeyPressed(KEY_D)) dx = 1;
        if (dx != 0 || dy != 0) {
            processPlayerTurn(w, dx, dy);
            processEnemyTurns(w);
            cleanupDead(w);
        }
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
const int MAX_ROOMS = 8;

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
    Room rooms[MAX_ROOMS];
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
    int turnNumber;
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
void generateFloor(World& w);
bool validateConnectivity(World& w);`,
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
}

bool validateConnectivity(World& w) {
    if (w.room_count < 2) return false;
    bool visited[MAP_H][MAP_W];
    memset(visited, false, sizeof(visited));
    int qx[MAP_W * MAP_H], qy[MAP_W * MAP_H];
    int front = 0, back = 0;
    qx[back] = w.rooms[0].cx; qy[back] = w.rooms[0].cy; back++;
    visited[w.rooms[0].cy][w.rooms[0].cx] = true;
    while (front < back) {
        int cx = qx[front], cy = qy[front]; front++;
        int dx[] = {0,0,1,-1};
        int dy[] = {1,-1,0,0};
        for (int d = 0; d < 4; d++) {
            int nx = cx+dx[d], ny = cy+dy[d];
            if (nx>=0 && nx<MAP_W && ny>=0 && ny<MAP_H && !visited[ny][nx] && w.dungeon[ny][nx]!=TILE_WALL) {
                visited[ny][nx] = true;
                qx[back] = nx; qy[back] = ny; back++;
            }
        }
    }
    for (int i = 0; i < w.room_count; i++) {
        if (!visited[w.rooms[i].cy][w.rooms[i].cx]) return false;
    }
    return true;
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
    DrawText(TextFormat("HP: %d  Floor: %d  Score: %d  Turn: %d",w.entity_hp[0],w.floor_num,w.score,w.turnNumber),10,SCREEN_H-25,20,GREEN);
    if (w.gameOver) DrawText("GAME OVER",SCREEN_W/2-80,SCREEN_H/2,30,RED);
}`,
  "src/hs_rooms.h": `#pragma once
#include "hs_types.h"

struct World;
int getRoomAt(World& w, int x, int y);
Room getRoomByIndex(World& w, int idx);
bool isInRoom(Room& r, int x, int y);`,
  "src/hs_rooms.cpp": `#include "hs_rooms.h"
#include "hs_world.h"

int getRoomAt(World& w, int x, int y) {
    for (int i = 0; i < w.room_count; i++) {
        if (x >= w.rooms[i].x && x < w.rooms[i].x + w.rooms[i].w &&
            y >= w.rooms[i].y && y < w.rooms[i].y + w.rooms[i].h) return i;
    }
    return -1;
}

Room getRoomByIndex(World& w, int idx) {
    if (idx >= 0 && idx < w.room_count) return w.rooms[idx];
    return {0,0,0,0,0,0};
}

bool isInRoom(Room& r, int x, int y) {
    return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}`,
  "src/hs_turns.h": `#pragma once

struct World;
void processPlayerTurn(World& w, int dx, int dy);
void processEnemyTurns(World& w);
void cleanupDead(World& w);`,
  "src/hs_turns.cpp": `#include "hs_turns.h"
#include "hs_world.h"
#include "hs_generate.h"

void processPlayerTurn(World& w, int dx, int dy) {
    if (w.gameOver) return;
    int nx = w.entity_x[0] + dx;
    int ny = w.entity_y[0] + dy;
    if (nx == w.stairsX && ny == w.stairsY) {
        w.floor_num++; w.score += 50;
        w.rng_state = (uint32_t)(w.floor_num * 48271);
        generateFloor(w);
        return;
    }
    int ei = findEntityAt(w, nx, ny, ENT_ENEMY);
    if (ei >= 0) {
        w.entity_hp[ei]--; w.entity_hp[0]--;
        if (w.entity_hp[ei] <= 0) { w.entity_active[ei] = false; w.score += 10; }
        if (w.entity_hp[0] <= 0) w.gameOver = true;
    } else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != TILE_WALL) {
        w.entity_x[0] = nx; w.entity_y[0] = ny;
    }
    w.turnNumber++;
}

void processEnemyTurns(World& w) {
    for (int i = 1; i < w.entity_count; i++) {
        if (!w.entity_active[i]) continue;
        int dx = 0, dy = 0;
        int distX = w.entity_x[0] - w.entity_x[i];
        int distY = w.entity_y[0] - w.entity_y[i];
        int absDX = distX < 0 ? -distX : distX;
        int absDY = distY < 0 ? -distY : distY;
        if (absDX + absDY <= 5) {
            if (absDX > absDY) dx = (distX > 0) ? 1 : -1;
            else dy = (distY > 0) ? 1 : -1;
        }
        int nx = w.entity_x[i] + dx;
        int ny = w.entity_y[i] + dy;
        if (nx == w.entity_x[0] && ny == w.entity_y[0]) {
            w.entity_hp[0]--;
            if (w.entity_hp[0] <= 0) w.gameOver = true;
        } else if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != TILE_WALL) {
            w.entity_x[i] = nx; w.entity_y[i] = ny;
        }
    }
}

void cleanupDead(World& w) {
    for (int i = w.entity_count - 1; i > 0; i--) {
        if (!w.entity_active[i]) {
            int last = w.entity_count - 1;
            if (i != last) {
                w.entity_id[i] = w.entity_id[last];
                w.entity_x[i] = w.entity_x[last];
                w.entity_y[i] = w.entity_y[last];
                w.entity_hp[i] = w.entity_hp[last];
                w.entity_type[i] = w.entity_type[last];
                w.entity_active[i] = w.entity_active[last];
            }
            w.entity_count--;
        }
    }
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

void printWorldState(World& w) {
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Entities: " << w.entity_count << endl;
    cout << "NextID: " << w.nextId << endl;
    cout << "Connected: " << (validateConnectivity(w) ? "yes" : "no") << endl;
    cout << "Modules: generate|render|rooms|turns" << endl;
    cout << "Milestone: data-owned-dungeon" << endl;
}

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.nextId = 1;
    generateFloor(w);
    printWorldState(w);

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (!WindowShouldClose()) {
        int dx = 0, dy = 0;
        if (IsKeyPressed(KEY_W)) dy = -1;
        if (IsKeyPressed(KEY_S)) dy = 1;
        if (IsKeyPressed(KEY_A)) dx = -1;
        if (IsKeyPressed(KEY_D)) dx = 1;
        if (dx != 0 || dy != 0) {
            processPlayerTurn(w, dx, dy);
            processEnemyTurns(w);
            cleanupDead(w);
        }
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
      { id: "g6", description: "Connectivity validated", expectedOutput: "Connected: yes" },
      { id: "g7", description: "All modules listed", expectedOutput: "Modules: generate|render|rooms|turns" },
      { id: "g8", description: "Milestone tag", expectedOutput: "Milestone: data-owned-dungeon" },
    ],
    hints: [
      "printWorldState takes World& w and uses standard output to print each field. Seed is always 42.",
      "For Connected, call validateConnectivity(w) and use ternary: yes or no.",
      "The Modules and Milestone lines are literal strings, not computed from World fields.",
    ],
    estimatedMinutes: 20,
  },
};
