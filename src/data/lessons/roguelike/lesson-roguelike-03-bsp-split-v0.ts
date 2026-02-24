import { Lesson } from "@/types/lesson";

export const lessonRoguelike3: Lesson = {
  id: "roguelike-3-bsp-split-v0",
  title: "BSP Split v0",
  description: "Binary space partitioning splits a rectangle in half. Two rooms carved from BSP leaves — the foundation of dungeon generation.",
  order: 3,
  xpReward: 50,
  tier: "free",
  concepts: ["binary space partitioning", "recursive splitting", "tree data structure", "leaf nodes"],
  part1: {
    title: "Concept: Binary Space Partitioning",
    type: "concept",
    instructions: `# BSP Split v0

## Mental Model
BSP stands for Binary Space Partitioning. Start with one big rectangle (the entire dungeon). Split it in half — either vertically or horizontally. Now you have two rectangles. Each one becomes a "leaf" where a room can be carved. This is the core algorithm behind most roguelike dungeon generators.

## What Breaks Without This
With random placement (Lesson 2), rooms can overlap. Two rooms at the same position merge into one big blob. With 10 rooms, you get a mess of overlapping rectangles that looks nothing like a dungeon. BSP guarantees non-overlapping rooms by subdividing space before placing rooms.

## The Fix: Split Then Carve
The BSP approach:
1. Start with the full map as one rectangle
2. Choose a split direction (horizontal or vertical)
3. Choose a split position using the RNG
4. Split into two child rectangles
5. Carve a room inside each child

For this lesson, we'll do ONE split — producing two rectangles, each with one room. Lesson 4 will make it recursive.

We represent each BSP node as a simple struct:
```cpp
struct BSPNode {
    int x, y, w, h;  // bounding rectangle
};
```

## Key Concepts
- BSP splits space, not rooms — rooms are carved INSIDE leaves
- Split direction: horizontal splits top/bottom, vertical splits left/right
- Split position: random within the rectangle (with minimum size constraint)
- Each leaf contains exactly one room, smaller than the leaf itself

## Performance Insight
BSP with 2 leaves processes 3 nodes total (root + 2 children). Even a full BSP tree with 16 leaves is only 31 nodes. The tree is tiny — generation cost is dominated by the room carving loops, not the tree traversal.

## Memory Insight
A BSP node is 4 integers = 16 bytes. An array of 64 nodes = 1024 bytes. We store the tree as a flat array using the implicit binary tree layout: node i's children are at 2i+1 and 2i+2. No pointers. No heap. No linked list. Just an array.

## Your Task
Split a 20x10 rectangle vertically at position 10. Carve a room in each half. Print the split info and room locations.

Expected output:
```
BSP: split 20x10 vertical at x=10
Left: (0,0) 10x10
Right: (10,0) 10x10
Room A: (1,1) to (8,8)
Room B: (11,1) to (18,8)
```

## Beginner Trap
**Splitting at the edge.** If you split a 20-wide rectangle at x=1 or x=19, one child is too small for a room. Always enforce a minimum child size: `split_pos = rngRange(min_size, w - min_size)`. For this lesson, we use a fixed split at the midpoint.

## Elite Insight
Spelunky's level generator uses a 4x4 grid (not BSP), but Dead Cells and Hades both use BSP-like space partitioning. Dead Cells recursively subdivides the level into zones, then connects zones with corridors. Your BSP tree follows the same principle — subdivide, then populate.

## Systems Thinking Connection
BSP is a spatial data structure. The Dungeon Crawler path uses BSP for 3D rendering (Binary Space Partition trees for wall occlusion). The Roguelike uses BSP for 2D generation. Same algorithm, different application — spatial subdivision is universal.

## Skill Reinforcement
Lesson 2 gave you random room placement. This lesson introduces structured placement via BSP. Lesson 4 makes BSP recursive for 4-6 rooms. Lesson 5 connects rooms with corridors.

## Mastery Check
Question: Why split space BEFORE placing rooms, instead of placing rooms and checking for overlap?
Answer: Overlap checking is O(n^2) — every new room must be tested against all existing rooms. BSP guarantees non-overlap by construction — each room lives in its own partition. Zero overlap checks needed. The algorithm scales to any number of rooms.`,
    starterCode: `#include <iostream>
using namespace std;

struct BSPNode {
    int x, y, w, h;
};

int main() {
    BSPNode root = {0, 0, 20, 10};

    // Split vertically at midpoint
    int split_x = root.w / 2;

    // TODO: Create left and right children
    // Left: (root.x, root.y) with width split_x
    // Right: (root.x + split_x, root.y) with width root.w - split_x
    BSPNode left = {0, 0, 0, 0};
    BSPNode right = {0, 0, 0, 0};

    cout << "BSP: split " << root.w << "x" << root.h << " vertical at x=" << split_x << endl;
    cout << "Left: (" << left.x << "," << left.y << ") " << left.w << "x" << left.h << endl;
    cout << "Right: (" << right.x << "," << right.y << ") " << right.w << "x" << right.h << endl;

    // TODO: Define rooms inside each partition (1-cell padding from edges)
    // Room A in left: from (left.x+1, left.y+1) to (left.x+left.w-2, left.y+left.h-2)
    // Room B in right: from (right.x+1, right.y+1) to (right.x+right.w-2, right.y+right.h-2)
    int ax1=0, ay1=0, ax2=0, ay2=0;
    int bx1=0, by1=0, bx2=0, by2=0;

    cout << "Room A: (" << ax1 << "," << ay1 << ") to (" << ax2 << "," << ay2 << ")" << endl;
    cout << "Room B: (" << bx1 << "," << by1 << ") to (" << bx2 << "," << by2 << ")" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct BSPNode {
    int x, y, w, h;
};

int main() {
    BSPNode root = {0, 0, 20, 10};

    // Split vertically at midpoint
    int split_x = root.w / 2;

    BSPNode left = {root.x, root.y, split_x, root.h};
    BSPNode right = {root.x + split_x, root.y, root.w - split_x, root.h};

    cout << "BSP: split " << root.w << "x" << root.h << " vertical at x=" << split_x << endl;
    cout << "Left: (" << left.x << "," << left.y << ") " << left.w << "x" << left.h << endl;
    cout << "Right: (" << right.x << "," << right.y << ") " << right.w << "x" << right.h << endl;

    int ax1 = left.x + 1, ay1 = left.y + 1;
    int ax2 = left.x + left.w - 2, ay2 = left.y + left.h - 2;
    int bx1 = right.x + 1, by1 = right.y + 1;
    int bx2 = right.x + right.w - 2, by2 = right.y + right.h - 2;

    cout << "Room A: (" << ax1 << "," << ay1 << ") to (" << ax2 << "," << ay2 << ")" << endl;
    cout << "Room B: (" << bx1 << "," << by1 << ") to (" << bx2 << "," << by2 << ")" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Split info printed", expectedOutput: "BSP: split 20x10 vertical at x=10" },
      { id: "t2", description: "Left partition", expectedOutput: "Left: (0,0) 10x10" },
      { id: "t3", description: "Right partition", expectedOutput: "Right: (10,0) 10x10" },
      { id: "t4", description: "Room A bounds", expectedOutput: "Room A: (1,1) to (8,8)" },
      { id: "t5", description: "Room B bounds", expectedOutput: "Room B: (11,1) to (18,8)" },
    ],
    hints: [
      "The left child starts at root.x with width split_x. The right child starts at root.x + split_x with width root.w - split_x.",
      "Left: {root.x, root.y, split_x, root.h} and Right: {root.x + split_x, root.y, root.w - split_x, root.h}.",
      "For Room A: ax1 = left.x+1, ay1 = left.y+1, ax2 = left.x+left.w-2, ay2 = left.y+left.h-2. Same pattern for Room B with right.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Two-Room BSP Dungeon",
    type: "game_builder",
    instructions: `# Build: Two-Room BSP Dungeon

## Mental Model
Take the BSP split concept and apply it to the full dungeon grid. Split the map vertically using the RNG, carve a room in each half, and render both rooms. This is a real BSP dungeon — two rooms that never overlap, positioned by the algorithm.

## What Breaks Without This
Random placement (Lesson 2) gives you one room. Adding a second room randomly risks overlap. BSP guarantees separation by giving each room its own partition of the map.

## The Fix: BSP Split + Carve
1. Split the map vertically at a random position
2. In each partition, generate a random room (smaller than the partition)
3. Carve both rooms into the dungeon grid
4. Render as before — floor tiles as dark gray rectangles

## Your Task
Using seed 42, split the 40x30 map vertically, carve a room in each half, and render. Print generation stats.

Expected cout output (seed 42):
```
Seed: 42
Split at x=22
Rooms: 2
Floor tiles: 108
```

**Click Run** to see your two-room BSP dungeon!

## Did It Work?
You should see TWO dark gray rectangles on a black background, separated by a vertical gap. The rooms don't overlap because BSP gave each one its own half of the map.

## Beginner Trap
**Forgetting to offset room coordinates by the partition's position.** If the right partition starts at x=22, the room inside it must start at x=22+padding, not x=padding. Always add the partition's origin to room coordinates.

## Elite Insight
The original Rogue (1980) used a similar approach — divide the screen into a 3x3 grid, place rooms in some cells, connect with corridors. BSP is the modern evolution: recursive subdivision produces more organic layouts. Your two-room dungeon is the first step.

## Mastery Check
Question: What determines the exact room positions in this dungeon?
Answer: The seed (42) determines everything. The first RNG call picks the split position. Subsequent calls pick room sizes and positions within each partition. Same seed, same split, same rooms, same dungeon.`,
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

void carveRoom(BSPNode node) {
    int rw = rngRange(3, node.w - 2);
    int rh = rngRange(3, node.h - 2);
    int rx = rngRange(node.x + 1, node.x + node.w - rw - 1);
    int ry = rngRange(node.y + 1, node.y + node.h - rh - 1);
    for (int y = ry; y < ry + rh; y++) {
        for (int x = rx; x < rx + rw; x++) {
            dungeon[y][x] = 1;
        }
    }
}

int main() {
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            dungeon[y][x] = 0;

    BSPNode root = {0, 0, MAP_W, MAP_H};

    // TODO: Split root vertically at a random position
    // split_x = rngRange(10, root.w - 10)
    int split_x = 0;

    // TODO: Create left and right children
    BSPNode left = {0, 0, 0, 0};
    BSPNode right = {0, 0, 0, 0};

    // TODO: Carve rooms in both children
    // carveRoom(left);
    // carveRoom(right);

    int floor_count = 0;
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            if (dungeon[y][x] == 1) floor_count++;

    cout << "Seed: " << 42 << endl;
    cout << "Split at x=" << split_x << endl;
    cout << "Rooms: 2" << endl;
    cout << "Floor tiles: " << floor_count << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < MAP_H; y++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[y][x] == 1) {
                    DrawRectangle(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1, DARKGRAY);
                }
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

void carveRoom(BSPNode node) {
    int rw = rngRange(3, node.w - 2);
    int rh = rngRange(3, node.h - 2);
    int rx = rngRange(node.x + 1, node.x + node.w - rw - 1);
    int ry = rngRange(node.y + 1, node.y + node.h - rh - 1);
    for (int y = ry; y < ry + rh; y++) {
        for (int x = rx; x < rx + rw; x++) {
            dungeon[y][x] = 1;
        }
    }
}

int main() {
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            dungeon[y][x] = 0;

    BSPNode root = {0, 0, MAP_W, MAP_H};

    int split_x = rngRange(10, root.w - 10);

    BSPNode left = {root.x, root.y, split_x, root.h};
    BSPNode right = {root.x + split_x, root.y, root.w - split_x, root.h};

    carveRoom(left);
    carveRoom(right);

    int floor_count = 0;
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            if (dungeon[y][x] == 1) floor_count++;

    cout << "Seed: " << 42 << endl;
    cout << "Split at x=" << split_x << endl;
    cout << "Rooms: 2" << endl;
    cout << "Floor tiles: " << floor_count << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < MAP_H; y++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[y][x] == 1) {
                    DrawRectangle(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1, DARKGRAY);
                }
            }
        }

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints seed", expectedOutput: "Seed: 42" },
      { id: "g2", description: "Split position", expectedOutput: "Split at x=10" },
      { id: "g3", description: "Room count", expectedOutput: "Rooms: 2" },
      { id: "g4", description: "Floor tile count", expectedOutput: "Floor tiles: 120" },
    ],
    hints: [
      "split_x = rngRange(10, root.w - 10) gives a split position between 10 and 30.",
      "Left = {root.x, root.y, split_x, root.h}. Right = {root.x + split_x, root.y, root.w - split_x, root.h}.",
      "Call carveRoom(left) then carveRoom(right). The function handles room sizing and placement within each partition.",
    ],
    estimatedMinutes: 15,
  },
};