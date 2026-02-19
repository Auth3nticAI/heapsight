import type { Lesson } from "@/types/lesson";

export const lesson53: Lesson = {
  id: "53-screen-bounds",
  title: "Screen Bounds",
  description: "Prevent the player from moving outside the screen boundaries.",
  order: 53,
  xpReward: 200,
  tier: "pro",
  concepts: ["boundary clamping", "screen limits", "position constraint", "edge detection"],
  part1: {
    title: "Concept: Boundary Clamping",
    type: "concept",
    instructions: `# Boundary Clamping — Keeping Entities On Screen

Without clamping, the player walks off the screen. They press left and the ship disappears into negative coordinates. They press right and the ship sails past the screen edge into invisible space. The fix is one function: clamp. Three lines. Every game ships it.

## What Breaks Without This

Without bounds checking, the player moves to x=-200. The renderer draws nothing because the position is off-screen. The player thinks the game froze. Enemies continue to spawn and kill an invisible player. Alternatively, the player parks at x=9999 where no enemies can reach. Both cases break the game. Clamping prevents both.

## The Fix

\\\`\\\`\\\`
int clamp(int value, int min, int max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}
\\\`\\\`\\\`

After every movement update: \\\`x = clamp(x, 0, SCREEN_W)\\\` and \\\`y = clamp(y, 0, SCREEN_H)\\\`. The position is constrained before rendering. The player slides along the wall instead of passing through it.

## Your Task

1. Define clamp(value, min, max)
2. Screen bounds: x from 0 to 360, y from 0 to 400
3. Start player at (180, 200)
4. Process 8 movement commands that push the player past edges:
   - Step 1: move left by 200 (attempted x = -20)
   - Step 2: move right by 50 (attempted x = 30)
   - Step 3: move right by 400 (attempted x = 430)
   - Step 4: move left by 50 (attempted x = 310 after clamp to 360)
   - Step 5: move up by 250 (attempted y = -50)
   - Step 6: move down by 100 (attempted y = 50 after clamp to 0)
   - Step 7: move down by 500 (attempted y = 550)
   - Step 8: move up by 50 (attempted y = 350 after clamp to 400)
5. Each step: apply movement, then clamp. Detect which edge was hit
6. Print: \\\`BOUNDS|step|<s>|attempted|(<ax>,<ay>)|clamped|(<cx>,<cy>)|edge|<EDGE>\\\`
   - EDGE is LEFT, RIGHT, TOP, BOTTOM, or NONE
7. Print: \\\`BOUNDS_SUMMARY|clamps|<n>|left|<l>|right|<r>|top|<t>|bottom|<b>\\\`

Expected output (selected lines):
\\\`\\\`\\\`
BOUNDS|step|1|attempted|(-20,200)|clamped|(0,200)|edge|LEFT
BOUNDS|step|2|attempted|(50,200)|clamped|(50,200)|edge|NONE
BOUNDS|step|3|attempted|(450,200)|clamped|(360,200)|edge|RIGHT
BOUNDS|step|5|attempted|(310,-50)|clamped|(310,0)|edge|TOP
BOUNDS|step|7|attempted|(310,500)|clamped|(310,400)|edge|BOTTOM
BOUNDS_SUMMARY|clamps|4|left|1|right|1|top|1|bottom|1
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
using namespace std;

const int SCREEN_W = 360;
const int SCREEN_H = 400;

// TODO: Write clamp(value, min, max)

int main() {
    int px = 180, py = 200;

    // Movement deltas for 8 steps: {dx, dy}
    int dx[] = {-200, 50, 400, -50, 0, 0, 0, 0};
    int dy[] = {0, 0, 0, 0, -250, 100, 500, -50};

    int clampCount = 0;
    int leftCount = 0, rightCount = 0, topCount = 0, bottomCount = 0;

    // TODO: For each step:
    //   Apply dx/dy to get attempted position
    //   Clamp to screen bounds
    //   Detect which edge was hit (or NONE)
    //   Print BOUNDS line
    //   Track clamp counts

    // TODO: Print BOUNDS_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int SCREEN_W = 360;
const int SCREEN_H = 400;

int clamp(int value, int minVal, int maxVal) {
    if (value < minVal) return minVal;
    if (value > maxVal) return maxVal;
    return value;
}

int main() {
    int px = 180, py = 200;

    int dx[] = {-200, 50, 400, -50, 0, 0, 0, 0};
    int dy[] = {0, 0, 0, 0, -250, 100, 500, -50};

    int clampCount = 0;
    int leftCount = 0, rightCount = 0, topCount = 0, bottomCount = 0;

    for (int step = 1; step <= 8; step++) {
        int ax = px + dx[step - 1];
        int ay = py + dy[step - 1];

        int cx = clamp(ax, 0, SCREEN_W);
        int cy = clamp(ay, 0, SCREEN_H);

        string edge = "NONE";
        if (ax < 0) { edge = "LEFT"; leftCount++; clampCount++; }
        else if (ax > SCREEN_W) { edge = "RIGHT"; rightCount++; clampCount++; }
        else if (ay < 0) { edge = "TOP"; topCount++; clampCount++; }
        else if (ay > SCREEN_H) { edge = "BOTTOM"; bottomCount++; clampCount++; }

        cout << "BOUNDS|step|" << step << "|attempted|(" << ax << "," << ay
             << ")|clamped|(" << cx << "," << cy << ")|edge|" << edge << endl;

        px = cx;
        py = cy;
    }

    cout << "BOUNDS_SUMMARY|clamps|" << clampCount
         << "|left|" << leftCount << "|right|" << rightCount
         << "|top|" << topCount << "|bottom|" << bottomCount << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Step 1 clamps left edge", expectedOutput: "BOUNDS\\|step\\|1\\|attempted\\|\\(-20,200\\)\\|clamped\\|\\(0,200\\)\\|edge\\|LEFT", isPattern: true },
      { id: "t2", description: "Step 2 no clamping needed", expectedOutput: "BOUNDS\\|step\\|2\\|attempted\\|\\(50,200\\)\\|clamped\\|\\(50,200\\)\\|edge\\|NONE", isPattern: true },
      { id: "t3", description: "Step 3 clamps right edge", expectedOutput: "BOUNDS\\|step\\|3\\|attempted\\|\\(450,200\\)\\|clamped\\|\\(360,200\\)\\|edge\\|RIGHT", isPattern: true },
      { id: "t4", description: "Step 5 clamps top edge", expectedOutput: "BOUNDS\\|step\\|5\\|attempted\\|\\(310,-50\\)\\|clamped\\|\\(310,0\\)\\|edge\\|TOP", isPattern: true },
      { id: "t5", description: "Step 7 clamps bottom edge", expectedOutput: "BOUNDS\\|step\\|7\\|attempted\\|\\(310,500\\)\\|clamped\\|\\(310,400\\)\\|edge\\|BOTTOM", isPattern: true },
      { id: "t6", description: "Summary counts all clamps", expectedOutput: "BOUNDS_SUMMARY\\|clamps\\|4\\|left\\|1\\|right\\|1\\|top\\|1\\|bottom\\|1", isPattern: true },
    ],
    hints: [
      "clamp returns min if value < min, max if value > max, otherwise value unchanged. Apply to both x and y after computing the attempted position.",
      "Step 4: player was clamped to x=360 in step 3. Moving left by 50: attempted x = 360 - 50 = 310. No clamping needed. Edge is NONE.",
      "Track clamp counts by checking if the attempted position differs from the clamped position, or equivalently, if ax < 0 or ax > SCREEN_W or ay < 0 or ay > SCREEN_H.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Screen Bounds System",
    type: "game_builder",
    instructions: `# Game Builder: Screen Bounds Clamping

This is where the invisible walls go in. The player moves toward the edge and stops. No teleporting. No wrapping. No sailing into the void. The bounds system runs after movement and clamps every position to the screen rectangle. Three lines of logic that prevent an entire class of bugs.

## Your Task
1. Pool: 20 entity slots. SoA: x, y, vx, vy, hp, type, alive
2. Screen bounds: 0 to 360 for x, 0 to 400 for y
3. Entity size offset: player width=20, height=20. Clamp to (0, 0) through (340, 380)
4. Player at (180, 300), type=0, hp=100
5. 2 enemies at x=100,260 y=40 vy=4 hp=1 type=2
6. Input for 8 frames: "a","a","a","a","d","d","d","d" (repeated large steps of 100 each)
   - Player moves 100 pixels per input (speed=100 for testing)
7. boundsSystem: clamp player x to [0, 340], y to [0, 380]
8. Process 8 frames: input, move, bounds, collision, cleanup
9. Print per frame: \\\`BOUNDS|step|<f>|attempted|(<ax>,<ay>)|clamped|(<cx>,<cy>)|edge|<EDGE>\\\`
10. Print per frame: \\\`FRAME|<f>|player|<x>,<y>|enemies|<e>|score|<s>\\\`
11. Print: \\\`BOUNDS_SUMMARY|clamps|<n>|left|<l>|right|<r>|top|<t>|bottom|<b>\\\`
12. Print: \\\`BOUNDS_SYSTEM|PASS|player contained within screen\\\`

## Beginner Trap

**Common Mistake:** Clamping to the screen width instead of screen width minus entity width. A 20-pixel-wide entity at x=360 overflows the right edge by 20 pixels. Clamp to SCREEN_W - width, not SCREEN_W. Same for height. The entity's top-left corner plus its size must stay inside the screen rectangle.

## Elite Insight

Clamping is the cheapest constraint solver. Real physics engines solve constraints iteratively with projection and relaxation. But for axis-aligned screen bounds, a single clamp per axis is exact. No iteration. No error accumulation. No solver drift. When the constraint is a rectangle, use clamp. When the constraint is a circle, use normalize-and-scale. Match the solver to the shape.

## Cross-Path Echo

Input validation is boundary clamping for data. A form field that accepts ages 0-150 clamps the input to the valid range. A database column with CHECK constraints rejects out-of-range values. Your screen bounds system is the same pattern: constrain the value to the valid domain before it propagates through the system. Validate at the boundary, not in the interior.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 20;
const int SCREEN_W = 360;
const int SCREEN_H = 400;
const int PLAYER_W = 20;
const int PLAYER_H = 20;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;

// TODO: Write clamp(value, min, max)

// TODO: Write spawnEntity(px, py, pvx, pvy, php, ptype)

// TODO: Write movementSystem() — apply vx/vy to alive entities

// TODO: Write boundsSystem() — clamp player (type=0) to screen bounds
//       x: [0, SCREEN_W - PLAYER_W], y: [0, SCREEN_H - PLAYER_H]

// TODO: Write collisionSystem() — bullet(type=1) vs enemy(type=2)

// TODO: Write cleanupSystem() — alive=false if hp<=0

int main() {
    // TODO: Spawn player at (180,300) type=0 hp=100
    // TODO: Spawn 2 enemies at x=100,260 y=40 vy=4 hp=1 type=2

    // Movement: 100 pixels per step
    int moves[] = {-100, -100, -100, -100, 100, 100, 100, 100};

    // TODO: Run 8 frames
    //   Apply move to player x, run boundsSystem, detect edge
    //   Print BOUNDS and FRAME lines

    // TODO: Print BOUNDS_SUMMARY and BOUNDS_SYSTEM lines

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 20;
const int SCREEN_W = 360;
const int SCREEN_H = 400;
const int PLAYER_W = 20;
const int PLAYER_H = 20;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;

int clamp(int value, int minVal, int maxVal) {
    if (value < minVal) return minVal;
    if (value > maxVal) return maxVal;
    return value;
}

void spawnEntity(int px, int py, int pvx, int pvy, int php, int ptype) {
    x[entityCount] = px;
    y[entityCount] = py;
    vx[entityCount] = pvx;
    vy[entityCount] = pvy;
    hp[entityCount] = php;
    type[entityCount] = ptype;
    alive[entityCount] = true;
    entityCount++;
}

void movementSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void collisionSystem() {
    for (int b = 0; b < entityCount; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < entityCount; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                hp[b] = 0;
                hp[e]--;
                score += 100;
                break;
            }
        }
    }
}

void cleanupSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
        }
    }
}

int main() {
    spawnEntity(180, 300, 0, 0, 100, 0);

    spawnEntity(100, 40, 0, 4, 1, 2);
    spawnEntity(260, 40, 0, 4, 1, 2);

    int moves[] = {-100, -100, -100, -100, 100, 100, 100, 100};

    int clampCount = 0;
    int leftCount = 0, rightCount = 0, topCount = 0, bottomCount = 0;

    for (int frame = 1; frame <= 8; frame++) {
        int ax = x[0] + moves[frame - 1];
        int ay = y[0];

        x[0] = ax;

        movementSystem();

        int cx = clamp(x[0], 0, SCREEN_W - PLAYER_W);
        int cy = clamp(y[0], 0, SCREEN_H - PLAYER_H);

        string edge = "NONE";
        if (x[0] < 0) { edge = "LEFT"; leftCount++; clampCount++; }
        else if (x[0] > SCREEN_W - PLAYER_W) { edge = "RIGHT"; rightCount++; clampCount++; }
        else if (y[0] < 0) { edge = "TOP"; topCount++; clampCount++; }
        else if (y[0] > SCREEN_H - PLAYER_H) { edge = "BOTTOM"; bottomCount++; clampCount++; }

        x[0] = cx;
        y[0] = cy;

        collisionSystem();
        cleanupSystem();

        int enemyCount = 0;
        for (int i = 0; i < entityCount; i++) {
            if (alive[i] && type[i] == 2) enemyCount++;
        }

        cout << "BOUNDS|step|" << frame << "|attempted|(" << ax << "," << ay
             << ")|clamped|(" << cx << "," << cy << ")|edge|" << edge << endl;

        cout << "FRAME|" << frame << "|player|" << x[0] << "," << y[0]
             << "|enemies|" << enemyCount << "|score|" << score << endl;
    }

    cout << "BOUNDS_SUMMARY|clamps|" << clampCount
         << "|left|" << leftCount << "|right|" << rightCount
         << "|top|" << topCount << "|bottom|" << bottomCount << endl;
    cout << "BOUNDS_SYSTEM|PASS|player contained within screen" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Step 1 player moves left", expectedOutput: "BOUNDS\\|step\\|1\\|attempted\\|\\(80,300\\)\\|clamped\\|\\(80,300\\)\\|edge\\|NONE", isPattern: true },
      { id: "t2", description: "Step 2 clamps to left edge", expectedOutput: "BOUNDS\\|step\\|2\\|attempted\\|\\(-20,300\\)\\|clamped\\|\\(0,300\\)\\|edge\\|LEFT", isPattern: true },
      { id: "t3", description: "Step 3 stays at left wall", expectedOutput: "BOUNDS\\|step\\|3\\|attempted\\|\\(-100,300\\)\\|clamped\\|\\(0,300\\)\\|edge\\|LEFT", isPattern: true },
      { id: "t4", description: "Frame output shows clamped position", expectedOutput: "FRAME\\|\\d+\\|player\\|\\d+,\\d+\\|enemies\\|\\d+\\|score\\|\\d+", isPattern: true },
      { id: "t5", description: "Bounds summary counts all clamps", expectedOutput: "BOUNDS_SUMMARY\\|clamps\\|\\d+\\|left\\|\\d+\\|right\\|\\d+\\|top\\|\\d+\\|bottom\\|\\d+", isPattern: true },
      { id: "t6", description: "Bounds system passes", expectedOutput: "BOUNDS_SYSTEM\\|PASS\\|player contained within screen", isPattern: true },
    ],
    hints: [
      "clamp(value, min, max) returns min if value < min, max if value > max. The player max x is SCREEN_W - PLAYER_W = 340. Max y is SCREEN_H - PLAYER_H = 380.",
      "Step 1: player at 180, moves -100 to 80. No clamp. Step 2: at 80, moves -100 to -20. Clamped to 0. LEFT edge. Step 3: at 0, moves -100 to -100. Clamped to 0. LEFT again.",
      "Run boundsSystem AFTER movementSystem but BEFORE collisionSystem. The clamped position is what collision checks use. If you clamp after collision, the collision saw the unclamped position.",
    ],
    estimatedMinutes: 7,
  },
};
