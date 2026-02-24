import { Lesson } from "@/types/lesson";

export const lessonRoguelike14: Lesson = {
  id: "roguelike-14-soa-entities",
  title: "SoA Entities",
  description: "Transform Enemy struct into parallel arrays. Structure of Arrays: separate arrays for position, HP, type, and active flag. Cache-friendly, iteration-friendly, refactoring-proof.",
  order: 14,
  xpReward: 100,
  tier: "pro",
  concepts: ["structure of arrays", "data-oriented design", "parallel arrays", "cache performance"],
  part1: {
    title: "Concept: AoS vs SoA",
    type: "concept",
    instructions: `# SoA Entities

## Mental Model
Array of Structs (AoS): each element is a complete object. \`Enemy enemies[32]\` stores 32 enemies, each with id, x, y, hp, alive packed together. Structure of Arrays (SoA): each FIELD gets its own array. \`entity_x[64]\`, \`entity_y[64]\`, \`entity_hp[64]\` — separate arrays, same indices.

## What Breaks Without This
When you iterate "update all entity positions," AoS loads entire Enemy structs into cache — including id, hp, alive fields you don't need. Wasted bandwidth. SoA loads ONLY the x[] and y[] arrays — pure position data, nothing else. For 64 entities, that's the difference between loading 64\u00d720 bytes (AoS) vs 64\u00d78 bytes (SoA) per position update.

## AoS (What We Have Now)

\`\`\`cpp
struct Enemy { int id, x, y, hp; bool alive; };
Enemy enemies[32];  // each element: id|x|y|hp|alive|pad
int enemy_count;
\`\`\`

## SoA (What We're Building)

\`\`\`cpp
int entity_id[64], entity_x[64], entity_y[64], entity_hp[64];
int entity_type[64];  // ENT_PLAYER or ENT_ENEMY
bool entity_active[64];
int entity_count;
\`\`\`

## Key Concepts
- **Same index = same entity**: \`entity_x[3]\`, \`entity_hp[3]\`, \`entity_type[3]\` all describe entity #3.
- **addEntity()**: One function that sets all arrays at \`count\` index, then increments count.
- **Unified entities**: Player and enemies are both entities. \`entity_type[i]\` distinguishes them. Player is always entity 0.
- **No struct, no padding**: Parallel arrays pack tighter. Iteration over one field skips all others.

## Performance Insight
CPU caches load data in 64-byte cache lines. AoS iteration loads the entire struct per entity even if you only need position. SoA iteration over entity_x[] loads 16 integers per cache line — 16 entities' x-positions in one load. For position-only operations (collision, rendering), SoA is 2-4x faster on large entity counts.

## Memory Insight
AoS: \`Enemy\` is 4+4+4+4+1 = 17 bytes, padded to 20. Array of 32: 640 bytes. SoA: 5 arrays \u00d7 64 \u00d7 4 bytes = 1280 bytes. More memory, but FASTER iteration because each array is contiguous. The trade-off is worth it when iteration speed matters more than storage.

## Your Task
Convert a struct-based entity system to parallel arrays. Add entities with a helper function, kill by ID, count active.

Expected output:
\`\`\`
Entity 1 at (5,5) HP:10
Entity 2 at (10,3) HP:5
Entity 3 at (15,7) HP:3
Killed ID 2
Total: 3
Active: 2
NextID: 4
\`\`\`

## Beginner Trap
**Forgetting to set ALL arrays when adding an entity.** If you set entity_x and entity_y but forget entity_active, the entity is invisible. addEntity must touch every array at the new index.

## Elite Insight
Data-Oriented Design (DOD) is the foundation of modern game engines. Unity's ECS (Entity Component System) stores components as SoA by default. Unreal's Mass framework does the same. The pattern you're learning here — parallel arrays indexed by entity ID — is how AAA engines handle millions of entities at 60fps.

## Mastery Check
Question: When should you use AoS instead of SoA?
Answer: When you frequently access ALL fields of ONE entity (e.g., serialization, networking). If your hot loop touches one field across all entities, SoA wins. If your hot loop touches all fields of one entity, AoS wins. Most game loops are field-oriented (update all positions, check all HP), so SoA is the default choice in performance-critical systems.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX = 8;

// SoA: parallel arrays instead of struct array
int ent_id[MAX], ent_x[MAX], ent_y[MAX], ent_hp[MAX];
bool ent_active[MAX];
int count = 0;
int nextId = 1;

// TODO: Write addEntity(int x, int y, int hp)
// Sets ent_id[count]=nextId++, ent_x[count]=x, ent_y[count]=y, ent_hp[count]=hp, ent_active[count]=true
// Then increment count

int findById(int id) {
    for (int i = 0; i < count; i++)
        if (ent_id[i] == id) return i;
    return -1;
}

int main() {
    // TODO: Add 3 entities: (5,5,10), (10,3,5), (15,7,3)

    for (int i = 0; i < count; i++)
        cout << "Entity " << ent_id[i] << " at (" << ent_x[i] << "," << ent_y[i] << ") HP:" << ent_hp[i] << endl;

    // TODO: Find entity with ID 2, set ent_active[idx] = false
    // Print: "Killed ID 2"

    int active = 0;
    for (int i = 0; i < count; i++)
        if (ent_active[i]) active++;

    cout << "Total: " << count << endl;
    cout << "Active: " << active << endl;
    cout << "NextID: " << nextId << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX = 8;

int ent_id[MAX], ent_x[MAX], ent_y[MAX], ent_hp[MAX];
bool ent_active[MAX];
int count = 0;
int nextId = 1;

void addEntity(int x, int y, int hp) {
    int i = count++;
    ent_id[i] = nextId++;
    ent_x[i] = x; ent_y[i] = y;
    ent_hp[i] = hp;
    ent_active[i] = true;
}

int findById(int id) {
    for (int i = 0; i < count; i++)
        if (ent_id[i] == id) return i;
    return -1;
}

int main() {
    addEntity(5, 5, 10);
    addEntity(10, 3, 5);
    addEntity(15, 7, 3);

    for (int i = 0; i < count; i++)
        cout << "Entity " << ent_id[i] << " at (" << ent_x[i] << "," << ent_y[i] << ") HP:" << ent_hp[i] << endl;

    int idx = findById(2);
    ent_active[idx] = false;
    cout << "Killed ID 2" << endl;

    int active = 0;
    for (int i = 0; i < count; i++)
        if (ent_active[i]) active++;

    cout << "Total: " << count << endl;
    cout << "Active: " << active << endl;
    cout << "NextID: " << nextId << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Entity 1 created", expectedOutput: "Entity 1 at (5,5) HP:10" },
      { id: "t2", description: "Entity 3 created", expectedOutput: "Entity 3 at (15,7) HP:3" },
      { id: "t3", description: "Kill by ID", expectedOutput: "Killed ID 2" },
      { id: "t4", description: "Active count", expectedOutput: "Active: 2" },
      { id: "t5", description: "NextID counter", expectedOutput: "NextID: 4" },
    ],
    hints: [
      "addEntity sets all 5 arrays: ent_id, ent_x, ent_y, ent_hp, ent_active at index count.",
      "Use findById(2) to get the index, then set ent_active[idx] = false.",
      "Remember to increment both count and nextId in addEntity.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: SoA Roguelike",
    type: "game_builder",
    instructions: `# Build: SoA Roguelike

## Mental Model
The Enemy struct dies. In its place: parallel arrays. \`entity_x[]\`, \`entity_y[]\`, \`entity_hp[]\`, \`entity_type[]\`, \`entity_active[]\`, \`entity_id[]\`. The player becomes entity 0. Enemies are entities 1+. Same index across all arrays = same entity.

## What Breaks Without This
With a dedicated Enemy struct and separate player fields (px, py, playerHp), every system needs special-case code: "if it's a player, read px/py. If it's an enemy, read enemies[i].x/y." SoA unifies everything. Rendering loops over entity_x/entity_y regardless of type. Combat checks entity_hp regardless of type. One code path for all entities.

## Your Task
Replace Enemy struct with parallel arrays in World. Player becomes entity 0 (type ENT_PLAYER). Enemies become entities 1+ (type ENT_ENEMY). Update populateEnemies, findEntityAt, generateFloor, handleInput, and rendering.

Expected cout output:
\`\`\`
Seed: 42
Floor: 1
Rooms: 4
Entities: 6
NextID: 7
\`\`\`

**Click Run** to see the unified entity system in action.

## Did It Work?
Game looks identical to L13. Player is green, enemies are red, stairs are yellow. But the code is cleaner: no separate px/py/playerHp fields, no Enemy struct. Everything is entities in parallel arrays. The cout proves it: 6 entities (1 player + 5 enemies), next ID is 7.

## Key Changes
1. **World struct**: Remove Enemy array and px/py/playerHp. Add 6 parallel arrays + entity_count + nextId.
2. **addEntity()**: Sets all arrays at entity_count index, increments count and nextId.
3. **generateFloor()**: Creates player as entity 0 FIRST (saves HP across floors), then calls populateEnemies.
4. **findEntityAt()**: Scans entity_x/entity_y/entity_active/entity_type arrays.
5. **handleInput()**: Uses entity_x[0]/entity_y[0] for player position, entity_hp[0] for player HP.
6. **Rendering**: One loop over all entities, color by type (GREEN for player, RED for enemy).

## Beginner Trap
**Losing player HP on floor transition.** \`generateFloor()\` resets entity_count to 0, destroying the player entity. Save \`entity_hp[0]\` before reset and pass it to \`addEntity()\` when recreating the player. Without this, the player gets full HP every floor — too easy.

## Elite Insight
Data-Oriented Design (DOD) is the philosophy behind this refactoring. Mike Acton's famous CppCon talk: "Where there is one, there are many." If you have one enemy, you'll have hundreds. Design for the many from the start. SoA is the default data layout in Unity DOTS, Unreal Mass, and every custom engine built after 2018.

## Mastery Check
Question: Why is entity 0 always the player?
Answer: Convention. \`generateFloor()\` creates the player FIRST (addEntity with ENT_PLAYER), so it gets index 0. Every system can assume entity_x[0] is the player without searching. This is a zero-cost abstraction — no lookup, no branching, just array index 0.`,
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
    // SoA entity arrays
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

// TODO: Write findEntityAt(World& w, int x, int y, int type)
// Scan entity_x, entity_y, entity_active, entity_type arrays
// Return index where all match, or -1

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
    // TODO: Save player HP before reset (entity_hp[0] if entity_count > 0, else 10)
    memset(w.dungeon, 0, sizeof(w.dungeon));
    w.node_count = 1; w.room_count = 0; w.entity_count = 0;
    memset(w.nodes, 0, sizeof(w.nodes));
    w.nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(w, 0, 0);
    for (int i = 0; i < w.node_count; i++) if (isLeaf(w, i)) carveRoom(w, w.nodes[i]);
    int cc = 0; connectBSP(w, 0, cc);
    // TODO: Create player as entity 0 using addEntity(w, ENT_PLAYER, rooms[0].cx, rooms[0].cy, savedHp)
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
    // TODO: Use findEntityAt(w, nx, ny, ENT_ENEMY) to find enemy
    // TODO: Combat: entity_hp[ei]--, entity_hp[0]--, check death/gameOver
    // TODO: Movement: set entity_x[0] = nx, entity_y[0] = ny
}

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.nextId = 1;
    generateFloor(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Entities: " << w.entity_count << endl;
    cout << "NextID: " << w.nextId << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (!WindowShouldClose()) {
        handleInput(w);
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < MAP_H; y++) for (int x = 0; x < MAP_W; x++) {
            if (w.dungeon[y][x] == TILE_FLOOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,DARKGRAY);
            else if (w.dungeon[y][x] == TILE_CORRIDOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,(Color){60,60,60,255});
        }
        DrawRectangle(w.stairsX*TILE_SIZE,w.stairsY*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,YELLOW);
        // TODO: Replace with unified entity loop
        // for (int i = 0; i < w.entity_count; i++) {
        //     if (!w.entity_active[i]) continue;
        //     Color c = (w.entity_type[i] == ENT_PLAYER) ? GREEN : RED;
        //     DrawRectangle(w.entity_x[i]*TILE_SIZE,w.entity_y[i]*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,c);
        // }
        DrawText(TextFormat("HP: %d  Floor: %d  Score: %d",w.entity_hp[0],w.floor_num,w.score),10,SCREEN_H-25,20,GREEN);
        if (w.gameOver) DrawText("GAME OVER",SCREEN_W/2-80,SCREEN_H/2,30,RED);
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

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.nextId = 1;
    generateFloor(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Entities: " << w.entity_count << endl;
    cout << "NextID: " << w.nextId << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (!WindowShouldClose()) {
        handleInput(w);
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < MAP_H; y++) for (int x = 0; x < MAP_W; x++) {
            if (w.dungeon[y][x] == TILE_FLOOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,DARKGRAY);
            else if (w.dungeon[y][x] == TILE_CORRIDOR) DrawRectangle(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,(Color){60,60,60,255});
        }
        DrawRectangle(w.stairsX*TILE_SIZE,w.stairsY*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,YELLOW);
        for (int i = 0; i < w.entity_count; i++) {
            if (!w.entity_active[i]) continue;
            Color c = (w.entity_type[i] == ENT_PLAYER) ? GREEN : RED;
            DrawRectangle(w.entity_x[i]*TILE_SIZE,w.entity_y[i]*TILE_SIZE,TILE_SIZE-1,TILE_SIZE-1,c);
        }
        DrawText(TextFormat("HP: %d  Floor: %d  Score: %d",w.entity_hp[0],w.floor_num,w.score),10,SCREEN_H-25,20,GREEN);
        if (w.gameOver) DrawText("GAME OVER",SCREEN_W/2-80,SCREEN_H/2,30,RED);
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
    ],
    hints: [
      "findEntityAt scans entity_x, entity_y, entity_active, entity_type — return index where all match.",
      "In generateFloor, save entity_hp[0] before resetting entity_count, then pass it to addEntity for the player.",
      "For rendering, loop all entities: Color c = (entity_type[i] == ENT_PLAYER) ? GREEN : RED;",
    ],
    estimatedMinutes: 25,
  },
};
