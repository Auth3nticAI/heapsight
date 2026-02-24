import { Lesson } from "@/types/lesson";

export const lessonRoguelike5: Lesson = {
  id: "roguelike-5-corridor-connection",
  title: "Corridor Connection",
  description: "Rooms connected by L-shaped corridors. The dungeon becomes walkable.",
  order: 5,
  xpReward: 50,
  tier: "free",
  concepts: ["corridor generation", "L-shaped paths", "sibling connection", "walkable dungeon"],
  part1: {
    title: "Concept: Connecting Rooms with Corridors",
    type: "concept",
    instructions: `# Corridor Connection

## Mental Model
BSP rooms float in isolation — you can see them but can't walk between them. Corridors fix this. Connect sibling rooms (rooms that share a parent BSP node) with L-shaped paths. Horizontal first, then vertical. The dungeon transforms from separate rooms into a connected network.

## What Breaks Without This
Four disconnected rooms are four separate prisons. Without corridors, the player is stuck in their starting room forever. A roguelike needs connectivity — every room must be reachable from every other room.

## The Fix: L-Shaped Corridors
Given two room centers (cx1,cy1) and (cx2,cy2), carve an L-shaped path:
1. Horizontal: carve from (cx1,cy1) to (cx2,cy1) — same y, changing x
2. Vertical: carve from (cx2,cy1) to (cx2,cy2) — same x, changing y

This creates an L-shaped corridor that connects any two rooms. Mark corridor tiles as type 2 (distinct from floor type 1) so you can render them differently.

\```cpp
void carveCorridor(int x1, int y1, int x2, int y2) {
    int dx = (x2 > x1) ? 1 : -1;
    for (int x = x1; x != x2; x += dx) {
        if (dungeon[y1][x] == 0) dungeon[y1][x] = 2;
    }
    int dy = (y2 > y1) ? 1 : -1;
    for (int y = y1; y != y2 + dy; y += dy) {
        if (dungeon[y][x2] == 0) dungeon[y][x2] = 2;
    }
}
\```

## Key Concepts
- L-shaped corridors: horizontal then vertical carving
- Sibling connection: connect rooms that share a BSP parent
- Tile type 2 for corridors (distinct from floor type 1)
- Corridors only overwrite walls (type 0), not existing floors

## Performance Insight
A corridor between two rooms is at most MAP_W + MAP_H tile writes — about 70 operations. With 3 corridors (connecting 4 rooms), that's ~210 writes. Trivial compared to room carving.

## Memory Insight
Corridors reuse the existing dungeon array. No new data structures needed. The corridor is just a different value (2) in the same grid. Zero additional memory.

## Your Task
Write a function that carves an L-shaped corridor between two points. Connect rooms (0,0)-(5,5) center and (15,0)-(20,5) center. Print the path.

Expected output:
\```
Corridor: (3,3) to (17,3)
Path: L-shape (horizontal then vertical)
Corridor tiles: 9
\```

## Beginner Trap
**Assuming x2 > x1.** If the second room is to the LEFT of the first, dx must be -1. Always compute direction: `dx = (x2 > x1) ? 1 : -1`. Same for dy.

## Elite Insight
Spelunky connects rooms with a "guaranteed path" from entrance to exit, then adds optional side corridors. The guaranteed path ensures the level is always solvable. Your sibling corridors serve the same purpose — BSP siblings are always connected, so the dungeon is always traversable.

## Systems Thinking Connection
L-shaped corridors are the roguelike equivalent of the Platformer's moving platforms — both create paths between otherwise isolated areas. The Platformer moves the player mechanically; the Roguelike carves the path statically. Different mechanism, same goal: connectivity.

## Skill Reinforcement
Lesson 4 created isolated BSP rooms. This lesson connects them. Lesson 6 will place the player in the connected dungeon and add movement.

## Mastery Check
Question: Why connect BSP siblings instead of random room pairs?
Answer: BSP siblings share a parent partition, so they're geometrically adjacent. Connecting adjacent rooms produces short, sensible corridors. Connecting random rooms might create corridors that span the entire map — crossing through other rooms and creating visual noise.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAP_W = 30;
const int MAP_H = 10;
int dungeon[MAP_H][MAP_W];

// TODO: Implement carveCorridor(x1, y1, x2, y2)
// Carve horizontal from (x1,y1) to (x2,y1)
// Then carve vertical from (x2,y1) to (x2,y2)
// Set corridor tiles to 2 (only overwrite walls, type 0)

int main() {
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            dungeon[y][x] = 0;

    // Room A: (1,1) to (5,5)
    for (int y = 1; y <= 5; y++)
        for (int x = 1; x <= 5; x++)
            dungeon[y][x] = 1;

    // Room B: (15,1) to (20,5)
    for (int y = 1; y <= 5; y++)
        for (int x = 15; x <= 20; x++)
            dungeon[y][x] = 1;

    // Connect room centers
    int cx1 = 3, cy1 = 3;
    int cx2 = 17, cy2 = 3;
    // TODO: call carveCorridor(cx1, cy1, cx2, cy2)

    int corr_count = 0;
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            if (dungeon[y][x] == 2) corr_count++;

    cout << "Corridor: (" << cx1 << "," << cy1 << ") to (" << cx2 << "," << cy2 << ")" << endl;
    cout << "Path: L-shape (horizontal then vertical)" << endl;
    cout << "Corridor tiles: " << corr_count << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAP_W = 30;
const int MAP_H = 10;
int dungeon[MAP_H][MAP_W];

void carveCorridor(int x1, int y1, int x2, int y2) {
    int dx = (x2 > x1) ? 1 : -1;
    for (int x = x1; x != x2; x += dx) {
        if (dungeon[y1][x] == 0) dungeon[y1][x] = 2;
    }
    int dy = (y2 > y1) ? 1 : -1;
    for (int y = y1; y != y2 + dy; y += dy) {
        if (dungeon[y][x2] == 0) dungeon[y][x2] = 2;
    }
}

int main() {
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            dungeon[y][x] = 0;

    // Room A: (1,1) to (5,5)
    for (int y = 1; y <= 5; y++)
        for (int x = 1; x <= 5; x++)
            dungeon[y][x] = 1;

    // Room B: (15,1) to (20,5)
    for (int y = 1; y <= 5; y++)
        for (int x = 15; x <= 20; x++)
            dungeon[y][x] = 1;

    // Connect room centers
    int cx1 = 3, cy1 = 3;
    int cx2 = 17, cy2 = 3;
    carveCorridor(cx1, cy1, cx2, cy2);

    int corr_count = 0;
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            if (dungeon[y][x] == 2) corr_count++;

    cout << "Corridor: (" << cx1 << "," << cy1 << ") to (" << cx2 << "," << cy2 << ")" << endl;
    cout << "Path: L-shape (horizontal then vertical)" << endl;
    cout << "Corridor tiles: " << corr_count << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Corridor endpoints", expectedOutput: "Corridor: (3,3) to (17,3)" },
      { id: "t2", description: "Path type", expectedOutput: "Path: L-shape (horizontal then vertical)" },
      { id: "t3", description: "Corridor tile count", expectedOutput: "Corridor tiles: 9" },
    ],
    hints: [
      "carveCorridor needs two loops: one for horizontal (changing x at fixed y) and one for vertical (changing y at fixed x).",
      "For horizontal: loop x from x1 to x2 using dx = (x2>x1)?1:-1. For vertical: loop y from y1 to y2 using dy.",
      "void carveCorridor(int x1, int y1, int x2, int y2) { int dx=(x2>x1)?1:-1; for(int x=x1;x!=x2;x+=dx) if(dungeon[y1][x]==0) dungeon[y1][x]=2; int dy=(y2>y1)?1:-1; for(int y=y1;y!=y2+dy;y+=dy) if(dungeon[y][x2]==0) dungeon[y][x2]=2; }",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Connected BSP Dungeon",
    type: "game_builder",
    instructions: `# Build: Connected BSP Dungeon

## Mental Model
The BSP tree tells you which rooms are siblings. Connect each pair of siblings with an L-shaped corridor. Now the dungeon is fully connected — you could walk from any room to any other room through corridors.

## What Breaks Without This
Four isolated rooms with no way to travel between them. The dungeon is visually interesting but functionally useless. Corridors transform it from a display to a playable space.

## The Fix: Connect BSP Siblings
After carving all rooms, find sibling pairs in the BSP tree. For each pair, get the room center coordinates and call `carveCorridor()`. Since we have 4 leaves in 2 sibling pairs, we need exactly 2 corridors plus 1 corridor connecting the two halves of the BSP tree.

## Your Task
Using seed 42, generate a BSP dungeon with 4 rooms. Connect siblings with corridors. Render corridors as slightly darker gray than floors.

Expected cout output:
\```
Seed: 42
Rooms: 4
Corridors: 3
\```

**Click Run** to see your connected dungeon!

## Did It Work?
You should see 4 dark gray rooms connected by corridors. The corridors appear as slightly different-colored paths between rooms. You can visually trace a path from any room to any other.

## Beginner Trap
**Only connecting leaf siblings and forgetting the top-level connection.** With a depth-2 BSP, you have 2 sibling pairs (left children, right children) and 1 top-level connection between the left and right halves. Without the top-level corridor, the dungeon splits into two disconnected halves.

## Elite Insight
Dead Cells uses a similar corridor generation: rooms are connected to their BSP neighbors, then a validation pass ensures full connectivity. If any room is unreachable, an extra corridor is forced. Your BSP sibling connection guarantees connectivity by construction — no validation needed.

## Mastery Check
Question: How many corridors does a depth-N BSP tree need to fully connect all rooms?
Answer: 2^N - 1 corridors. Each internal node connects its two children. A depth-2 tree has 3 internal nodes = 3 corridors. A depth-3 tree has 7 corridors. The tree structure itself defines the corridor network.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;

int dungeon[MAP_H][MAP_W];
uint32_t rng_state = 42;

uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
int rngRange(int lo, int hi) {
    return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1));
}

struct BSPNode {
    int x, y, w, h;
};
const int MAX_NODES = 15;
BSPNode nodes[MAX_NODES];
int node_count = 1;

struct Room {
    int x, y, w, h;
    int cx, cy; // center
};
Room rooms[8];
int room_count = 0;

void bspSplit(int idx, int depth) {
    if (depth >= 2 || nodes[idx].w < 10 || nodes[idx].h < 10) return;
    int left = 2 * idx + 1;
    int right = 2 * idx + 2;
    if (right >= MAX_NODES) return;
    if (depth % 2 == 0) {
        int sx = rngRange(nodes[idx].w / 3, nodes[idx].w * 2 / 3);
        nodes[left] = {nodes[idx].x, nodes[idx].y, sx, nodes[idx].h};
        nodes[right] = {nodes[idx].x + sx, nodes[idx].y, nodes[idx].w - sx, nodes[idx].h};
    } else {
        int sy = rngRange(nodes[idx].h / 3, nodes[idx].h * 2 / 3);
        nodes[left] = {nodes[idx].x, nodes[idx].y, nodes[idx].w, sy};
        nodes[right] = {nodes[idx].x, nodes[idx].y + sy, nodes[idx].w, nodes[idx].h - sy};
    }
    if (right + 1 > node_count) node_count = right + 1;
    bspSplit(left, depth + 1);
    bspSplit(right, depth + 1);
}

bool isLeaf(int idx) {
    int left = 2 * idx + 1;
    return left >= node_count || (nodes[left].w == 0 && nodes[left].h == 0);
}

void carveRoom(BSPNode node) {
    int rw = rngRange(3, node.w - 2);
    int rh = rngRange(3, node.h - 2);
    int rx = rngRange(node.x + 1, node.x + node.w - rw - 1);
    int ry = rngRange(node.y + 1, node.y + node.h - rh - 1);
    for (int y = ry; y < ry + rh; y++)
        for (int x = rx; x < rx + rw; x++)
            dungeon[y][x] = 1;
    rooms[room_count] = {rx, ry, rw, rh, rx + rw/2, ry + rh/2};
    room_count++;
}

void carveCorridor(int x1, int y1, int x2, int y2) {
    int dx = (x2 > x1) ? 1 : -1;
    for (int x = x1; x != x2; x += dx)
        if (dungeon[y1][x] == 0) dungeon[y1][x] = 2;
    int dy = (y2 > y1) ? 1 : -1;
    for (int y = y1; y != y2 + dy; y += dy)
        if (dungeon[y][x2] == 0) dungeon[y][x2] = 2;
}

// Find any room center inside a BSP subtree
void findRoomCenter(int idx, int& cx, int& cy) {
    if (isLeaf(idx)) {
        for (int i = 0; i < room_count; i++) {
            if (rooms[i].x >= nodes[idx].x && rooms[i].x < nodes[idx].x + nodes[idx].w &&
                rooms[i].y >= nodes[idx].y && rooms[i].y < nodes[idx].y + nodes[idx].h) {
                cx = rooms[i].cx; cy = rooms[i].cy;
                return;
            }
        }
    }
    int left = 2 * idx + 1;
    if (left < node_count && nodes[left].w > 0)
        findRoomCenter(left, cx, cy);
}

int main() {
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            dungeon[y][x] = 0;

    nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(0, 0);

    for (int i = 0; i < node_count; i++)
        if (isLeaf(i)) carveRoom(nodes[i]);

    // TODO: Connect BSP siblings with corridors
    // For each internal node, find a room center in left child and right child
    // Then call carveCorridor to connect them
    int corridor_count = 0;

    cout << "Seed: " << 42 << endl;
    cout << "Rooms: " << room_count << endl;
    cout << "Corridors: " << corridor_count << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < MAP_H; y++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[y][x] == 1)
                    DrawRectangle(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, DARKGRAY);
                else if (dungeon[y][x] == 2)
                    DrawRectangle(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, (Color){60,60,60,255});
            }
        }
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;

int dungeon[MAP_H][MAP_W];
uint32_t rng_state = 42;

uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
int rngRange(int lo, int hi) {
    return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1));
}

struct BSPNode {
    int x, y, w, h;
};
const int MAX_NODES = 15;
BSPNode nodes[MAX_NODES];
int node_count = 1;

struct Room {
    int x, y, w, h;
    int cx, cy;
};
Room rooms[8];
int room_count = 0;

void bspSplit(int idx, int depth) {
    if (depth >= 2 || nodes[idx].w < 10 || nodes[idx].h < 10) return;
    int left = 2 * idx + 1;
    int right = 2 * idx + 2;
    if (right >= MAX_NODES) return;
    if (depth % 2 == 0) {
        int sx = rngRange(nodes[idx].w / 3, nodes[idx].w * 2 / 3);
        nodes[left] = {nodes[idx].x, nodes[idx].y, sx, nodes[idx].h};
        nodes[right] = {nodes[idx].x + sx, nodes[idx].y, nodes[idx].w - sx, nodes[idx].h};
    } else {
        int sy = rngRange(nodes[idx].h / 3, nodes[idx].h * 2 / 3);
        nodes[left] = {nodes[idx].x, nodes[idx].y, nodes[idx].w, sy};
        nodes[right] = {nodes[idx].x, nodes[idx].y + sy, nodes[idx].w, nodes[idx].h - sy};
    }
    if (right + 1 > node_count) node_count = right + 1;
    bspSplit(left, depth + 1);
    bspSplit(right, depth + 1);
}

bool isLeaf(int idx) {
    int left = 2 * idx + 1;
    return left >= node_count || (nodes[left].w == 0 && nodes[left].h == 0);
}

void carveRoom(BSPNode node) {
    int rw = rngRange(3, node.w - 2);
    int rh = rngRange(3, node.h - 2);
    int rx = rngRange(node.x + 1, node.x + node.w - rw - 1);
    int ry = rngRange(node.y + 1, node.y + node.h - rh - 1);
    for (int y = ry; y < ry + rh; y++)
        for (int x = rx; x < rx + rw; x++)
            dungeon[y][x] = 1;
    rooms[room_count] = {rx, ry, rw, rh, rx + rw/2, ry + rh/2};
    room_count++;
}

void carveCorridor(int x1, int y1, int x2, int y2) {
    int dx = (x2 > x1) ? 1 : -1;
    for (int x = x1; x != x2; x += dx)
        if (dungeon[y1][x] == 0) dungeon[y1][x] = 2;
    int dy = (y2 > y1) ? 1 : -1;
    for (int y = y1; y != y2 + dy; y += dy)
        if (dungeon[y][x2] == 0) dungeon[y][x2] = 2;
}

void findRoomCenter(int idx, int& cx, int& cy) {
    if (isLeaf(idx)) {
        for (int i = 0; i < room_count; i++) {
            if (rooms[i].x >= nodes[idx].x && rooms[i].x < nodes[idx].x + nodes[idx].w &&
                rooms[i].y >= nodes[idx].y && rooms[i].y < nodes[idx].y + nodes[idx].h) {
                cx = rooms[i].cx; cy = rooms[i].cy;
                return;
            }
        }
    }
    int left = 2 * idx + 1;
    if (left < node_count && nodes[left].w > 0)
        findRoomCenter(left, cx, cy);
}

void connectBSP(int idx, int& corridor_count) {
    if (isLeaf(idx)) return;
    int left = 2 * idx + 1;
    int right = 2 * idx + 2;
    if (right >= node_count) return;

    int lcx = 0, lcy = 0, rcx = 0, rcy = 0;
    findRoomCenter(left, lcx, lcy);
    findRoomCenter(right, rcx, rcy);
    carveCorridor(lcx, lcy, rcx, rcy);
    corridor_count++;

    connectBSP(left, corridor_count);
    connectBSP(right, corridor_count);
}

int main() {
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            dungeon[y][x] = 0;

    nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(0, 0);

    for (int i = 0; i < node_count; i++)
        if (isLeaf(i)) carveRoom(nodes[i]);

    int corridor_count = 0;
    connectBSP(0, corridor_count);

    cout << "Seed: " << 42 << endl;
    cout << "Rooms: " << room_count << endl;
    cout << "Corridors: " << corridor_count << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < MAP_H; y++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[y][x] == 1)
                    DrawRectangle(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, DARKGRAY);
                else if (dungeon[y][x] == 2)
                    DrawRectangle(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, (Color){60,60,60,255});
            }
        }
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints seed", expectedOutput: "Seed: 42" },
      { id: "g2", description: "Room count", expectedOutput: "Rooms: 4" },
      { id: "g3", description: "Corridor count", expectedOutput: "Corridors: 3" },
    ],
    hints: [
      "You need to traverse the BSP tree and connect children of each internal node. Write a connectBSP function that recurses.",
      "For each internal node: find a room center in its left subtree and right subtree using findRoomCenter, then call carveCorridor between them.",
      "connectBSP(int idx, int& count) { if (isLeaf(idx)) return; findRoomCenter(left, lcx, lcy); findRoomCenter(right, rcx, rcy); carveCorridor(lcx,lcy,rcx,rcy); count++; connectBSP(left,count); connectBSP(right,count); }",
    ],
    estimatedMinutes: 15,
  },
};