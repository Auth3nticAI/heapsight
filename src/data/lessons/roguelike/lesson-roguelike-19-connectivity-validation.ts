import { Lesson } from "@/types/lesson";

export const lessonRoguelike19: Lesson = {
  id: "roguelike-19-connectivity-validation",
  title: "Connectivity Validation",
  description: "Add BFS flood fill to validate all rooms are reachable. If the dungeon is disconnected, regenerate. This guarantees the player can always reach the stairs.",
  order: 19,
  xpReward: 100,
  tier: "pro",
  concepts: ["BFS flood fill", "connectivity validation", "graph reachability", "defensive generation"],
  part1: {
  part1: {
    title: "Concept: BFS Flood Fill",
    type: "concept",
    instructions: `# Connectivity Validation

## Mental Model
A dungeon generator can produce disconnected maps. Room A connects to Room B, Room C connects to Room D, but there's no path from A to C. The player spawns in Room A and can NEVER reach the stairs in Room D. Game over before it begins.

## What Breaks Without This
BSP corridor carving usually produces connected maps, but edge cases exist. A corridor might fail to connect if rooms are too small or nodes are badly split. Without validation, 1 in 20 maps is unwinnable. Players hit an invisible wall and blame the game.

## The Algorithm: BFS Flood Fill
BFS (Breadth-First Search) explores outward from a start cell like water filling a basin:

1. Start at one walkable cell (the player's position)
2. Add it to a queue and mark it visited
3. Pop a cell from the front of the queue
4. Check all 4 neighbors (up, down, left, right)
5. If a neighbor is walkable and not visited, mark it visited and add to queue
6. Repeat until the queue is empty
7. Count how many cells were reached

If reached == total walkable cells, the map is connected. If reached < total, some areas are cut off.

\`\`\`cpp
// BFS flood fill pseudocode
bool visited[H][W] = {};
queue.push(start);
visited[start.y][start.x] = true;
int reached = 0;
while (!queue.empty()) {
    cell = queue.pop_front();
    reached++;
    for each neighbor of cell {
        if (in_bounds && walkable && !visited) {
            visited[ny][nx] = true;
            queue.push(neighbor);
        }
    }
}
\`\`\`

## Your Task
Implement BFS flood fill on a small 5x5 grid. Count reachable cells from (0,0). Compare against total walkable cells.

The grid (1 = walkable, 0 = wall):
\`\`\`
1 1 1 0 0
0 0 1 0 0
0 0 1 1 1
0 0 0 0 0
0 0 0 0 0
\`\`\`

All 8 walkable cells are connected via a winding path from (0,0). Expected:
\`\`\`
Grid: 5x5
Start: (0,0)
Reachable: 8
Walkable: 8
Connected: yes
\`\`\`

## Beginner Trap
**Forgetting to mark cells visited BEFORE adding to queue.** If you mark on pop instead of on push, the same cell gets added multiple times. BFS still works but wastes memory and time. In a 40x30 dungeon, this can overflow fixed-size arrays.

## Elite Insight
Commercial roguelikes (Dungeon Crawl Stone Soup, Caves of Qud) use connectivity validation as a hard requirement. If generation produces a disconnected map, they throw it away and regenerate with a new seed. Some games limit retries (10 attempts max) and fall back to a simple rectangular room if all fail. Our approach: validate and regenerate.`,
    starterCode: `#include <iostream>
using namespace std;

const int W = 5, H = 5;
int grid[H][W] = {
    {1,1,1,0,0},
    {0,0,1,0,0},
    {0,0,1,1,1},
    {0,0,0,0,0},
    {0,0,0,0,0}
};

int bfsFloodFill(int startX, int startY) {
    bool visited[H][W] = {};
    int qx[W*H], qy[W*H];
    int front = 0, back = 0;

    // TODO 1: Add start cell to queue and mark visited
    // qx[back] = startX; qy[back] = startY; back++;
    // visited[startY][startX] = true;

    int reached = 0;
    while (front < back) {
        int cx = qx[front], cy = qy[front]; front++;
        reached++;

        int dx[] = {0,0,1,-1};
        int dy[] = {1,-1,0,0};

        // TODO 2: Check all 4 neighbors
        // For each direction d (0..3):
        //   int nx = cx+dx[d], ny = cy+dy[d];
        //   if in bounds, walkable (grid[ny][nx]==1), and !visited:
        //     mark visited, add to queue
    }
    return reached;
}

int countWalkable() {
    int count = 0;
    // TODO 3: Count all cells where grid[y][x] == 1
    return count;
}

int main() {
    int reached = bfsFloodFill(0, 0);
    int walkable = countWalkable();
    cout << "Grid: " << W << "x" << H << endl;
    cout << "Start: (0,0)" << endl;
    cout << "Reachable: " << reached << endl;
    cout << "Walkable: " << walkable << endl;
    cout << "Connected: " << (reached >= walkable ? "yes" : "no") << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W = 5, H = 5;
int grid[H][W] = {
    {1,1,1,0,0},
    {0,0,1,0,0},
    {0,0,1,1,1},
    {0,0,0,0,0},
    {0,0,0,0,0}
};

int bfsFloodFill(int startX, int startY) {
    bool visited[H][W] = {};
    int qx[W*H], qy[W*H];
    int front = 0, back = 0;
    qx[back] = startX; qy[back] = startY; back++;
    visited[startY][startX] = true;
    int reached = 0;
    while (front < back) {
        int cx = qx[front], cy = qy[front]; front++;
        reached++;
        int dx[] = {0,0,1,-1};
        int dy[] = {1,-1,0,0};
        for (int d = 0; d < 4; d++) {
            int nx = cx+dx[d], ny = cy+dy[d];
            if (nx >= 0 && nx < W && ny >= 0 && ny < H && grid[ny][nx] == 1 && !visited[ny][nx]) {
                visited[ny][nx] = true;
                qx[back] = nx; qy[back] = ny; back++;
            }
        }
    }
    return reached;
}

int countWalkable() {
    int count = 0;
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            if (grid[y][x] == 1) count++;
    return count;
}

int main() {
    int reached = bfsFloodFill(0, 0);
    int walkable = countWalkable();
    cout << "Grid: " << W << "x" << H << endl;
    cout << "Start: (0,0)" << endl;
    cout << "Reachable: " << reached << endl;
    cout << "Walkable: " << walkable << endl;
    cout << "Connected: " << (reached >= walkable ? "yes" : "no") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Grid size", expectedOutput: "Grid: 5x5" },
      { id: "t2", description: "Start position", expectedOutput: "Start: (0,0)" },
      { id: "t3", description: "Reachable count", expectedOutput: "Reachable: 8" },
      { id: "t4", description: "Walkable count", expectedOutput: "Walkable: 8" },
      { id: "t5", description: "Connected status", expectedOutput: "Connected: yes" },
    ],
    hints: [
      "TODO 1: Set qx[back]=startX, qy[back]=startY, increment back, set visited[startY][startX]=true.",
      "TODO 2: Loop d from 0 to 3. Compute nx=cx+dx[d], ny=cy+dy[d]. Check bounds, grid==1, !visited. If valid: mark visited, add to queue.",
      "TODO 3: Nested loop y 0..H-1, x 0..W-1. If grid[y][x]==1, count++.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Connectivity Validation",
    type: "game_builder",
    instructions: `# Build: Connectivity Validation

## Mental Model
Our dungeon generator carves rooms and corridors, but we have never PROVEN the result is connected. A single missing corridor tile means the player is trapped. BFS flood fill gives us a mathematical guarantee: every walkable tile is reachable from the player start position.

## Your Task
Add \`validateConnectivity()\` and \`countWalkable()\` to \`hs_generate.cpp\`. The generate function already calls \`validateConnectivity()\` - you implement the BFS.

Expected cout output:
\`\`\`
Seed: 42
Floor: 1
Rooms: 4
Entities: 6
NextID: 7
Connected: yes
\`\`\`

**Click Run** to verify the dungeon passes connectivity validation.

## File Changes
| File | Change |
|------|--------|
| \`src/hs_generate.h\` | Add \`bool validateConnectivity(World& w)\` and \`int countWalkable(World& w)\` declarations |
| \`src/hs_generate.cpp\` | Implement BFS flood fill in \`validateConnectivity\`, implement \`countWalkable\` |
| \`src/main.cpp\` | Print "Connected: yes" after generation |

## How It Works
1. \`generateFloor()\` generates the dungeon as before
2. After generation, \`validateConnectivity()\` runs BFS from the player position
3. BFS counts all reachable non-wall tiles
4. \`countWalkable()\` counts ALL non-wall tiles in the entire map
5. If reachable >= total walkable, the map is connected
6. If not connected, \`generateFloor\` would regenerate (fallback)

## Implementation Guide
In \`hs_generate.cpp\`, implement \`countWalkable\`:
- Loop every tile in the dungeon grid
- Count tiles that are not walls

Implement \`validateConnectivity\`:
- Create a visited array initialized to false
- Create queue arrays qx and qy
- Start BFS from player position
- Use front/back indices for the queue
- For each cell, check 4 neighbors
- A neighbor is valid if in bounds, not a wall, and not visited
- Count reached cells, compare against countWalkable result

## Did It Work?
The game looks identical. The new feature is invisible - it is a GUARANTEE, not a visual change. The cout "Connected: yes" proves the validation ran.

## Beginner Trap
**Using \`std::queue\`.** Our WASM compiler supports it, but fixed-size arrays are faster and teach you how BFS actually works. \`int qx[MAP_W*MAP_H]\` is more than enough - the dungeon has at most 1200 tiles.

## Elite Insight
Connectivity validation is O(n) where n is the number of tiles. For our 40x30 map, that is 1200 operations - essentially free. Dwarf Fortress validates connectivity on maps of 256x256x256 and still manages it in milliseconds. BFS is one of the most efficient graph algorithms in existence.`,
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
void generateFloor(World& w);
bool validateConnectivity(World& w);
int countWalkable(World& w);
`,
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
    validateConnectivity(w);
}

// TODO 1: Implement countWalkable(World& w)
// Loop through every tile in w.dungeon[y][x]
// Count tiles where the value is NOT TILE_WALL
// Return the count
int countWalkable(World& w) {
    // YOUR CODE HERE
    return 0;
}

// TODO 2: Implement validateConnectivity(World& w)
// BFS flood fill from player position w.entity_x[0], w.entity_y[0]
// Use arrays: bool visited[MAP_H][MAP_W] = {};
//             int qx[MAP_W*MAP_H], qy[MAP_W*MAP_H];
// Use front/back indices for the queue
// A neighbor is valid if: in bounds, not TILE_WALL, not visited
// Count reached cells, compare against countWalkable(w)
// Return reached >= total
bool validateConnectivity(World& w) {
    // YOUR CODE HERE
    return true;  // placeholder
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
#include "hs_types.h"

struct World;
void carveRoomsFromBSP(World& w);
void connectAllRooms(World& w);`,
  "src/hs_rooms.cpp": `#include "hs_rooms.h"
#include "hs_world.h"
#include "hs_generate.h"

void carveRoomsFromBSP(World& w) {
    for (int i = 0; i < w.node_count; i++)
        if (isLeaf(w, i)) carveRoom(w, w.nodes[i]);
}

void connectAllRooms(World& w) {
    int cc = 0;
    connectBSP(w, 0, cc);
}`,
  "src/hs_turns.h": `#pragma once

struct World;
void handlePlayerMove(World& w, int nx, int ny);
void handleStairs(World& w, int nx, int ny);
void handleCombat(World& w, int attackerIdx, int defenderIdx);`,
  "src/hs_turns.cpp": `#include "hs_turns.h"
#include "hs_world.h"
#include "hs_generate.h"
#include "hs_types.h"

void handleCombat(World& w, int attackerIdx, int defenderIdx) {
    w.entity_hp[defenderIdx]--;
    w.entity_hp[attackerIdx]--;
    if (w.entity_hp[defenderIdx] <= 0) {
        w.entity_active[defenderIdx] = false;
        w.score += 10;
    }
    if (w.entity_hp[attackerIdx] <= 0) w.gameOver = true;
}

void handleStairs(World& w, int nx, int ny) {
    if (nx == w.stairsX && ny == w.stairsY) {
        w.floor_num++;
        w.score += 50;
        w.rng_state = (uint32_t)(w.floor_num * 48271);
        generateFloor(w);
    }
}

void handlePlayerMove(World& w, int nx, int ny) {
    if (w.gameOver) return;
    if (nx == w.entity_x[0] && ny == w.entity_y[0]) return;
    if (nx == w.stairsX && ny == w.stairsY) { handleStairs(w, nx, ny); return; }
    int ei = findEntityAt(w, nx, ny, ENT_ENEMY);
    if (ei >= 0) { handleCombat(w, 0, ei); return; }
    if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != TILE_WALL) {
        w.entity_x[0] = nx; w.entity_y[0] = ny;
    }
}`,
  "src/main.cpp": `#include <iostream>
#include "raylib.h"
#include "hs_types.h"
#include "hs_world.h"
#include "hs_generate.h"
#include "hs_render.h"
#include "hs_turns.h"
using namespace std;

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.nextId = 1;
    generateFloor(w);
    bool connected = validateConnectivity(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Entities: " << w.entity_count << endl;
    cout << "NextID: " << w.nextId << endl;
    cout << "Connected: " << (connected ? "yes" : "no") << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (\!WindowShouldClose()) {
        int nx = w.entity_x[0], ny = w.entity_y[0];
        if (IsKeyPressed(KEY_W)) ny--;
        if (IsKeyPressed(KEY_S)) ny++;
        if (IsKeyPressed(KEY_A)) nx--;
        if (IsKeyPressed(KEY_D)) nx++;
        handlePlayerMove(w, nx, ny);
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
void generateFloor(World& w);
bool validateConnectivity(World& w);
int countWalkable(World& w);
`,
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
    validateConnectivity(w);
}

int countWalkable(World& w) {
    int count = 0;
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            if (w.dungeon[y][x] != TILE_WALL) count++;
    return count;
}

bool validateConnectivity(World& w) {
    bool visited[MAP_H][MAP_W] = {};
    int qx[MAP_W*MAP_H], qy[MAP_W*MAP_H];
    int front = 0, back = 0;
    qx[back] = w.entity_x[0]; qy[back] = w.entity_y[0]; back++;
    visited[w.entity_y[0]][w.entity_x[0]] = true;
    int reached = 0;
    while (front < back) {
        int cx = qx[front], cy = qy[front]; front++;
        reached++;
        int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
        for (int d = 0; d < 4; d++) {
            int nx = cx+dx[d], ny = cy+dy[d];
            if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && !visited[ny][nx] && w.dungeon[ny][nx] != TILE_WALL) {
                visited[ny][nx] = true;
                qx[back] = nx; qy[back] = ny; back++;
            }
        }
    }
    int total = countWalkable(w);
    return reached >= total;
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
#include "hs_types.h"

struct World;
void carveRoomsFromBSP(World& w);
void connectAllRooms(World& w);`,
  "src/hs_rooms.cpp": `#include "hs_rooms.h"
#include "hs_world.h"
#include "hs_generate.h"

void carveRoomsFromBSP(World& w) {
    for (int i = 0; i < w.node_count; i++)
        if (isLeaf(w, i)) carveRoom(w, w.nodes[i]);
}

void connectAllRooms(World& w) {
    int cc = 0;
    connectBSP(w, 0, cc);
}`,
  "src/hs_turns.h": `#pragma once

struct World;
void handlePlayerMove(World& w, int nx, int ny);
void handleStairs(World& w, int nx, int ny);
void handleCombat(World& w, int attackerIdx, int defenderIdx);`,
  "src/hs_turns.cpp": `#include "hs_turns.h"
#include "hs_world.h"
#include "hs_generate.h"
#include "hs_types.h"

void handleCombat(World& w, int attackerIdx, int defenderIdx) {
    w.entity_hp[defenderIdx]--;
    w.entity_hp[attackerIdx]--;
    if (w.entity_hp[defenderIdx] <= 0) {
        w.entity_active[defenderIdx] = false;
        w.score += 10;
    }
    if (w.entity_hp[attackerIdx] <= 0) w.gameOver = true;
}

void handleStairs(World& w, int nx, int ny) {
    if (nx == w.stairsX && ny == w.stairsY) {
        w.floor_num++;
        w.score += 50;
        w.rng_state = (uint32_t)(w.floor_num * 48271);
        generateFloor(w);
    }
}

void handlePlayerMove(World& w, int nx, int ny) {
    if (w.gameOver) return;
    if (nx == w.entity_x[0] && ny == w.entity_y[0]) return;
    if (nx == w.stairsX && ny == w.stairsY) { handleStairs(w, nx, ny); return; }
    int ei = findEntityAt(w, nx, ny, ENT_ENEMY);
    if (ei >= 0) { handleCombat(w, 0, ei); return; }
    if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && w.dungeon[ny][nx] != TILE_WALL) {
        w.entity_x[0] = nx; w.entity_y[0] = ny;
    }
}`,
  "src/main.cpp": `#include <iostream>
#include "raylib.h"
#include "hs_types.h"
#include "hs_world.h"
#include "hs_generate.h"
#include "hs_render.h"
#include "hs_turns.h"
using namespace std;

int main() {
    World w = {}; w.rng_state = 42; w.floor_num = 1; w.nextId = 1;
    generateFloor(w);
    bool connected = validateConnectivity(w);
    cout << "Seed: " << 42 << endl;
    cout << "Floor: " << w.floor_num << endl;
    cout << "Rooms: " << w.room_count << endl;
    cout << "Entities: " << w.entity_count << endl;
    cout << "NextID: " << w.nextId << endl;
    cout << "Connected: " << (connected ? "yes" : "no") << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);
    while (\!WindowShouldClose()) {
        int nx = w.entity_x[0], ny = w.entity_y[0];
        if (IsKeyPressed(KEY_W)) ny--;
        if (IsKeyPressed(KEY_S)) ny++;
        if (IsKeyPressed(KEY_A)) nx--;
        if (IsKeyPressed(KEY_D)) nx++;
        handlePlayerMove(w, nx, ny);
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
    ],
    hints: [
      "countWalkable: Loop y 0..MAP_H-1, x 0..MAP_W-1. If w.dungeon[y][x] != TILE_WALL, increment count.",
      "validateConnectivity: Start BFS at w.entity_x[0], w.entity_y[0]. Use front/back queue indices with qx[] and qy[] arrays.",
      "In the BFS loop: pop front, increment reached, check 4 neighbors. If in bounds, not wall, not visited: mark visited and push to queue.",
    ],
    estimatedMinutes: 20,
  },
};
