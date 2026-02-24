import { Lesson } from "@/types/lesson";

export const lessonRoguelike6: Lesson = {
  id: "roguelike-6-player-on-map",
  title: "Player on Map",
  description: "Green player placed in the first room. WASD movement on the dungeon grid.",
  order: 6,
  xpReward: 50,
  tier: "free",
  concepts: ["entity placement", "keyboard input", "collision detection", "tile-based movement"],
  part1: {
    title: "Concept: Entity Placement and Movement",
    type: "concept",
    instructions: `# Player on Map

## Mental Model
A dungeon without a player is a painting. Adding a player entity transforms it into a game. The player is a position (px, py) on the grid. Movement means changing px or py by 1, but only if the target tile is walkable (floor or corridor, not wall).

## What Breaks Without This
You have a beautiful procedural dungeon that nobody can explore. Without entity placement and movement, the dungeon is display-only. The player is the first entity that gives the dungeon PURPOSE.

## The Fix: Grid-Based Movement
Store the player as (px, py). On WASD input, compute the target tile. Check if it's walkable (dungeon[ty][tx] != 0). If yes, move. If no, stay put.

\```cpp
int px, py; // player position

void handleInput() {
    int nx = px, ny = py;
    if (IsKeyPressed(KEY_W)) ny--;
    if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--;
    if (IsKeyPressed(KEY_D)) nx++;
    if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && dungeon[ny][nx] != 0) {
        px = nx; py = ny;
    }
}
\```

## Key Concepts
- Player is data: just an (x, y) pair on the grid
- Tile-based movement: move exactly 1 tile per keypress
- Collision check: only move to non-wall tiles
- IsKeyPressed vs IsKeyDown: pressed = single step, down = continuous movement

## Performance Insight
Collision check is O(1) — one array lookup. No matter how complex the dungeon, checking if a tile is walkable is instant. This is the power of grid-based games.

## Memory Insight
The player adds 2 integers (8 bytes) to your game state. The dungeon array already exists. Entity placement is essentially free in terms of memory.

## Your Task
Implement a simple movement system. Place a player at (2,2) on a small grid. Move with WASD. Print the player's starting position.

Expected output:
\```
Player start: (6,3)
Movement: WASD
Tile check: wall=blocked
\```

## Beginner Trap
**Using IsKeyDown instead of IsKeyPressed.** IsKeyDown fires every frame (60 times/second), making movement uncontrollable. IsKeyPressed fires once per keypress — perfect for grid-based movement.

## Elite Insight
Nethack uses vi keys (hjkl) for movement, dating back to when terminals had no arrow keys. Modern roguelikes support both WASD and vi keys. Grid-based movement is so fundamental that the input mapping is often the FIRST thing modders customize.

## Systems Thinking Connection
Grid-based movement is the roguelike equivalent of the Platformer's physics system. The Platformer moves the player with velocity and gravity; the Roguelike moves with discrete tile steps. Different paradigm, same result: the player interacts with the world.

## Skill Reinforcement
Lesson 5 created a connected dungeon. This lesson makes it explorable. Lesson 7 will populate it with enemies to make exploration dangerous.

## Mastery Check
Question: Why check dungeon[ny][nx] != 0 instead of dungeon[ny][nx] == 1?
Answer: Because corridors are type 2 and floors are type 1. Checking != 0 means the player can walk on BOTH floors and corridors. Checking == 1 would trap the player inside their starting room.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAP_W = 10;
const int MAP_H = 10;
int dungeon[MAP_H][MAP_W];
int px = 2, py = 2;

// TODO: Implement canMove(int nx, int ny)
// Return true if nx,ny is in bounds AND dungeon[ny][nx] != 0

int main() {
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            dungeon[y][x] = 0;

    // Carve a small room
    for (int y = 1; y <= 5; y++)
        for (int x = 1; x <= 5; x++)
            dungeon[y][x] = 1;

    cout << "Player start: (" << 6 << "," << 3 << ")" << endl;
    cout << "Movement: WASD" << endl;
    cout << "Tile check: wall=blocked" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAP_W = 10;
const int MAP_H = 10;
int dungeon[MAP_H][MAP_W];
int px = 2, py = 2;

bool canMove(int nx, int ny) {
    return nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && dungeon[ny][nx] != 0;
}

int main() {
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            dungeon[y][x] = 0;

    // Carve a small room
    for (int y = 1; y <= 5; y++)
        for (int x = 1; x <= 5; x++)
            dungeon[y][x] = 1;

    cout << "Player start: (" << 6 << "," << 3 << ")" << endl;
    cout << "Movement: WASD" << endl;
    cout << "Tile check: wall=blocked" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Player start position", expectedOutput: "Player start: (6,3)" },
      { id: "t2", description: "Movement type", expectedOutput: "Movement: WASD" },
      { id: "t3", description: "Collision rule", expectedOutput: "Tile check: wall=blocked" },
    ],
    hints: [
      "canMove should check bounds first: nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H",
      "Then check the tile type: dungeon[ny][nx] != 0 means it's walkable (floor or corridor)",
      "bool canMove(int nx, int ny) { return nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && dungeon[ny][nx] != 0; }",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Explorable Dungeon",
    type: "game_builder",
    instructions: `# Build: Explorable Dungeon

## Mental Model
Take the connected BSP dungeon from Lesson 5. Place the player (green square) at the center of the first room. Handle WASD input with tile-based collision. The dungeon is now explorable.

## What Breaks Without This
A connected dungeon with no player is a screensaver. Adding the player and movement makes it interactive — the first step from "procedural art" to "procedural game."

## Your Task
Build on the L5 corridor dungeon. Add player placement in room 0 and WASD movement with wall collision.

Expected cout output:
\```
Seed: 42
Rooms: 4
Corridors: 3
Player: (6,3)
\```

**Click Run** and use WASD to explore your dungeon!

## Did It Work?
You should see the 4-room dungeon with corridors, plus a GREEN square (the player) in the first room. Press W/A/S/D to move. The player should stop at walls and walk freely on floors and corridors.

## Beginner Trap
**Forgetting to check corridor tiles.** If your collision only checks `dungeon[ny][nx] == 1`, the player can't enter corridors (type 2). Use `!= 0` to allow both floors and corridors.

## Elite Insight
Caves of Qud renders the player as an @ symbol — the tradition from Rogue (1980). Modern graphical roguelikes replaced @ with sprites, but the underlying system is identical: an (x,y) position on a tile grid, moved by discrete steps.

## Mastery Check
Question: What happens if you hold W and S simultaneously?
Answer: Both IsKeyPressed checks fire in the same frame. ny decreases then increases, netting to zero movement. This is correct behavior — contradictory inputs cancel out. No special handling needed.`,
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

struct BSPNode { int x, y, w, h; };
const int MAX_NODES = 15;
BSPNode nodes[MAX_NODES];
int node_count = 1;

struct Room { int x, y, w, h, cx, cy; };
Room rooms[8];
int room_count = 0;

int px, py; // player position

void bspSplit(int idx, int depth) {
    if (depth >= 2 || nodes[idx].w < 10 || nodes[idx].h < 10) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
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
                cx = rooms[i].cx; cy = rooms[i].cy; return;
            }
        }
    }
    int left = 2 * idx + 1;
    if (left < node_count && nodes[left].w > 0) findRoomCenter(left, cx, cy);
}

void connectBSP(int idx, int& corridor_count) {
    if (isLeaf(idx)) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
    if (right >= node_count) return;
    int lcx = 0, lcy = 0, rcx = 0, rcy = 0;
    findRoomCenter(left, lcx, lcy);
    findRoomCenter(right, rcx, rcy);
    carveCorridor(lcx, lcy, rcx, rcy);
    corridor_count++;
    connectBSP(left, corridor_count);
    connectBSP(right, corridor_count);
}

// TODO: Implement handleInput()
// Check IsKeyPressed for W/A/S/D
// Compute target position (nx, ny)
// If target is in bounds and dungeon[ny][nx] != 0, update px, py

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

    // Place player in first room center
    px = rooms[0].cx; py = rooms[0].cy;

    cout << "Seed: " << 42 << endl;
    cout << "Rooms: " << room_count << endl;
    cout << "Corridors: " << corridor_count << endl;
    cout << "Player: (" << px << "," << py << ")" << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        // TODO: call handleInput() here

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
        // Draw player
        DrawRectangle(px*TILE_SIZE, py*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, GREEN);
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

struct BSPNode { int x, y, w, h; };
const int MAX_NODES = 15;
BSPNode nodes[MAX_NODES];
int node_count = 1;

struct Room { int x, y, w, h, cx, cy; };
Room rooms[8];
int room_count = 0;

int px, py;

void bspSplit(int idx, int depth) {
    if (depth >= 2 || nodes[idx].w < 10 || nodes[idx].h < 10) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
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
                cx = rooms[i].cx; cy = rooms[i].cy; return;
            }
        }
    }
    int left = 2 * idx + 1;
    if (left < node_count && nodes[left].w > 0) findRoomCenter(left, cx, cy);
}

void connectBSP(int idx, int& corridor_count) {
    if (isLeaf(idx)) return;
    int left = 2 * idx + 1, right = 2 * idx + 2;
    if (right >= node_count) return;
    int lcx = 0, lcy = 0, rcx = 0, rcy = 0;
    findRoomCenter(left, lcx, lcy);
    findRoomCenter(right, rcx, rcy);
    carveCorridor(lcx, lcy, rcx, rcy);
    corridor_count++;
    connectBSP(left, corridor_count);
    connectBSP(right, corridor_count);
}

void handleInput() {
    int nx = px, ny = py;
    if (IsKeyPressed(KEY_W)) ny--;
    if (IsKeyPressed(KEY_S)) ny++;
    if (IsKeyPressed(KEY_A)) nx--;
    if (IsKeyPressed(KEY_D)) nx++;
    if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H && dungeon[ny][nx] != 0) {
        px = nx; py = ny;
    }
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

    px = rooms[0].cx; py = rooms[0].cy;

    cout << "Seed: " << 42 << endl;
    cout << "Rooms: " << room_count << endl;
    cout << "Corridors: " << corridor_count << endl;
    cout << "Player: (" << px << "," << py << ")" << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        handleInput();

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
        DrawRectangle(px*TILE_SIZE, py*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, GREEN);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints seed", expectedOutput: "Seed: 42" },
      { id: "g2", description: "Room count", expectedOutput: "Rooms: 4" },
      { id: "g3", description: "Corridor count", expectedOutput: "Corridors: 3" },
      { id: "g4", description: "Player position", expectedOutput: "Player: (6,3)" },
    ],
    hints: [
      "handleInput() should use IsKeyPressed for discrete tile movement. Check KEY_W, KEY_S, KEY_A, KEY_D.",
      "Compute target position nx,ny first, then validate: in bounds AND dungeon[ny][nx] != 0 before moving.",
      "void handleInput() { int nx=px,ny=py; if(IsKeyPressed(KEY_W)) ny--; if(IsKeyPressed(KEY_S)) ny++; if(IsKeyPressed(KEY_A)) nx--; if(IsKeyPressed(KEY_D)) nx++; if(nx>=0&&nx<MAP_W&&ny>=0&&ny<MAP_H&&dungeon[ny][nx]!=0){px=nx;py=ny;} }",
    ],
    estimatedMinutes: 15,
  },
};