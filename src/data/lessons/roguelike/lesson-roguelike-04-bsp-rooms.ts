import { Lesson } from "@/types/lesson";

export const lessonRoguelike4: Lesson = {
  id: "roguelike-4-bsp-rooms",
  title: "BSP Rooms",
  description: "4-6 rooms generated from a full BSP tree with recursive splitting.",
  order: 4,
  xpReward: 50,
  tier: "free",
  concepts: ["recursive BSP", "tree depth", "leaf nodes", "room carving"],
  part1: {
    title: "Concept: Recursive BSP",
    type: "concept",
    instructions: `# BSP Rooms

## Mental Model
One split gives you 2 rooms. Two levels of splits give you 4 rooms. Three levels give 8. BSP is recursive — each split doubles the number of partitions. A depth-2 BSP tree on a 40x30 map produces 4 leaves, each containing one room. That's a real dungeon layout from a few lines of code.

## What Breaks Without This
Lesson 3's single split only produced 2 rooms. A real roguelike needs 4-8 rooms per floor. Without recursive splitting, you'd need to manually position each room — defeating the purpose of procedural generation.

## The Fix: Recursive BSP
Store nodes in a flat array using implicit tree layout:
- Node i's left child: 2*i + 1
- Node i's right child: 2*i + 2
- If both children are beyond array bounds, node i is a leaf

Split at each level alternates between vertical and horizontal. Level 0 splits vertical, level 1 splits horizontal. This produces a grid-like partition of the map.

\`\`\`cpp
const int MAX_NODES = 15;
BSPNode nodes[MAX_NODES];
int node_count = 0;

void bspSplit(int idx, int depth) {
    if (depth >= 2 || nodes[idx].w < 10 || nodes[idx].h < 10) return;
    int left = 2 * idx + 1;
    int right = 2 * idx + 2;
    if (right >= MAX_NODES) return;

    if (depth % 2 == 0) { // vertical split
        int sx = rngRange(nodes[idx].w/3, nodes[idx].w*2/3);
        nodes[left] = {nodes[idx].x, nodes[idx].y, sx, nodes[idx].h};
        nodes[right] = {nodes[idx].x+sx, nodes[idx].y, nodes[idx].w-sx, nodes[idx].h};
    } else { // horizontal split
        int sy = rngRange(nodes[idx].h/3, nodes[idx].h*2/3);
        nodes[left] = {nodes[idx].x, nodes[idx].y, nodes[idx].w, sy};
        nodes[right] = {nodes[idx].x, nodes[idx].y+sy, nodes[idx].w, nodes[idx].h-sy};
    }
    node_count = max(node_count, right + 1);
    bspSplit(left, depth + 1);
    bspSplit(right, depth + 1);
}
\`\`\`

## Key Concepts
- Implicit binary tree: children at 2i+1 and 2i+2
- Alternating split direction by depth
- Leaf detection: no valid children in array
- Minimum node size prevents unusable partitions

## Performance Insight
A depth-2 BSP tree has 7 nodes. Even depth-4 (31 nodes) is trivial. The tree is processed once during generation, never during gameplay. Generation cost is proportional to tree depth, not map size.

## Memory Insight
15 BSPNode structs = 15 * 16 bytes = 240 bytes. The flat array avoids pointer overhead entirely. With implicit tree indexing, parent-child navigation is just arithmetic — no pointer chasing, no cache misses.

## Your Task
Build a recursive BSP that splits to depth 2 (producing 4 leaves). Carve a room in each leaf. Print BSP stats and floor count.

Expected output (seed 42):
\`\`\`
Seed: 42
BSP depth: 2
Leaves: 4
Floor tiles: 450
\`\`\`

## Beginner Trap
**Using \`new\` to allocate BSP nodes.** A roguelike dungeon never has more than ~30 BSP nodes. Use a fixed-size array. Pre-allocate 15 or 31 nodes at file scope. No heap needed.

## Elite Insight
TinyKeep's dungeon generator uses a BSP variant called "Delaunay triangulation after BSP." First BSP subdivides space, then rooms are connected via Delaunay triangulation for more organic corridor layouts. Your BSP tree is the first half of that algorithm.

## Systems Thinking Connection
Recursive BSP is the roguelike equivalent of the RPG's scene graph — both are tree structures that organize spatial data. The RPG tree organizes rendering order; the Roguelike tree organizes dungeon partitions. Trees are everywhere in game engineering.

## Skill Reinforcement
Lesson 3 introduced the single BSP split. This lesson makes it recursive. Lesson 5 will connect the BSP rooms with corridors to make a walkable dungeon.

## Mastery Check
Question: Why alternate split direction between vertical and horizontal?
Answer: Always splitting vertically produces tall, narrow rooms. Always horizontally produces wide, flat rooms. Alternating produces roughly square partitions, which hold more naturally-shaped rooms. The aspect ratio of leaves matters for room quality.`,
    starterCode: `#include <iostream>
using namespace std;

struct BSPNode {
    int x, y, w, h;
};

const int MAX_NODES = 15;
BSPNode nodes[MAX_NODES];
int node_count = 1;

uint32_t rng_state = 42;
uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
int rngRange(int lo, int hi) {
    return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1));
}

// TODO: Implement bspSplit(int idx, int depth)
// If depth >= 2 or node too small, return
// Split vertically if depth is even, horizontally if odd
// Create children at 2*idx+1 and 2*idx+2

bool isLeaf(int idx) {
    int left = 2 * idx + 1;
    int right = 2 * idx + 2;
    return left >= node_count || (nodes[left].w == 0 && nodes[left].h == 0);
}

int main() {
    nodes[0] = {0, 0, 40, 30};
    // TODO: Call bspSplit(0, 0) to recursively split

    int leaf_count = 0;
    for (int i = 0; i < node_count; i++) {
        if (isLeaf(i)) leaf_count++;
    }

    cout << "Seed: " << 42 << endl;
    cout << "BSP depth: 2" << endl;
    cout << "Leaves: " << leaf_count << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct BSPNode {
    int x, y, w, h;
};

const int MAX_NODES = 15;
BSPNode nodes[MAX_NODES];
int node_count = 1;

uint32_t rng_state = 42;
uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
int rngRange(int lo, int hi) {
    return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1));
}

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
    int right = 2 * idx + 2;
    return left >= node_count || (nodes[left].w == 0 && nodes[left].h == 0);
}

int main() {
    nodes[0] = {0, 0, 40, 30};
    bspSplit(0, 0);

    int leaf_count = 0;
    for (int i = 0; i < node_count; i++) {
        if (isLeaf(i)) leaf_count++;
    }

    cout << "Seed: " << 42 << endl;
    cout << "BSP depth: 2" << endl;
    cout << "Leaves: " << leaf_count << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints seed", expectedOutput: "Seed: 42" },
      { id: "t2", description: "BSP depth", expectedOutput: "BSP depth: 2" },
      { id: "t3", description: "Leaf count", expectedOutput: "Leaves: 4" },
    ],
    hints: [
      "Check if depth >= 2 or the node is too small (w < 10 or h < 10). If so, return without splitting.",
      "For vertical split (depth % 2 == 0): sx = rngRange(w/3, w*2/3). Left child gets width sx, right gets w-sx.",
      "After creating both children, update node_count = max(node_count, right+1). Then recursively call bspSplit on both children with depth+1.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Four-Room BSP Dungeon",
    type: "game_builder",
    instructions: `# Build: Four-Room BSP Dungeon

## Mental Model
The BSP tree partitions the map into 4 leaves. Now carve a room inside each leaf, count floor tiles, and render. Four rooms, zero overlap, all from one recursive function and a seed.

## What Breaks Without This
BSP without rooms is just invisible partitions. The student needs to SEE the four separate rooms to understand that BSP guarantees non-overlap. The visual confirms the algorithm works.

## The Fix: Carve Rooms in BSP Leaves
After building the BSP tree, iterate over all nodes. For each leaf, call \`carveRoom()\` to place a random room inside the partition. The room is smaller than the leaf (with padding), so rooms never touch partition boundaries.

## Your Task
Build a depth-2 BSP tree with seed 42. Carve rooms in all 4 leaves. Print stats and render with raylib.

Expected cout output:
\`\`\`
Seed: 42
BSP depth: 2
Rooms: 4
Floor tiles: 450
\`\`\`

**Click Run** to see your four-room dungeon!

## Did It Work?
You should see 4 dark gray rectangles on a black background. They don't overlap because each room lives in its own BSP partition. The rooms have different sizes because the RNG picks random dimensions within each partition.

## Beginner Trap
**Carving rooms in non-leaf nodes.** Only leaves contain rooms. If you carve a room in the root node, it spans the entire map. Check \`isLeaf(i)\` before carving.

## Elite Insight
Brogue's dungeon generator uses BSP as a first pass, then applies cellular automata to soften room edges. The combination produces organic-looking caverns that still have the structural guarantees of BSP. Your four-room dungeon is the BSP pass — Lesson 31 will add automata.

## Mastery Check
Question: If you increase BSP depth from 2 to 3, how many rooms do you get?
Answer: 8 rooms (2^3 = 8 leaves). Each additional depth level doubles the number of partitions. Depth 4 = 16 rooms. But diminishing returns hit quickly — depth 3-4 is the sweet spot for 40x30 maps.`,
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

    nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(0, 0);

    // TODO: Iterate over all BSP nodes. For each leaf, call carveRoom(nodes[i])
    // and increment room_count.
    int room_count = 0;

    int floor_count = 0;
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            if (dungeon[y][x] == 1) floor_count++;

    cout << "Seed: " << 42 << endl;
    cout << "BSP depth: 2" << endl;
    cout << "Rooms: " << room_count << endl;
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

const int MAX_NODES = 15;
BSPNode nodes[MAX_NODES];
int node_count = 1;

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

    nodes[0] = {0, 0, MAP_W, MAP_H};
    bspSplit(0, 0);

    int room_count = 0;
    for (int i = 0; i < node_count; i++) {
        if (isLeaf(i)) {
            carveRoom(nodes[i]);
            room_count++;
        }
    }

    int floor_count = 0;
    for (int y = 0; y < MAP_H; y++)
        for (int x = 0; x < MAP_W; x++)
            if (dungeon[y][x] == 1) floor_count++;

    cout << "Seed: " << 42 << endl;
    cout << "BSP depth: 2" << endl;
    cout << "Rooms: " << room_count << endl;
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
      { id: "g2", description: "BSP depth", expectedOutput: "BSP depth: 2" },
      { id: "g3", description: "Room count", expectedOutput: "Rooms: 4" },
      { id: "g4", description: "Floor count", expectedOutput: "Floor tiles: 450" },
    ],
    hints: [
      "Loop from i=0 to node_count-1. For each i, check isLeaf(i). If true, call carveRoom(nodes[i]) and increment room_count.",
      "isLeaf returns true when a node has no children in the array. Only leaf nodes should have rooms carved.",
      "The complete loop: for (int i = 0; i < node_count; i++) { if (isLeaf(i)) { carveRoom(nodes[i]); room_count++; } }",
    ],
    estimatedMinutes: 15,
  },
};