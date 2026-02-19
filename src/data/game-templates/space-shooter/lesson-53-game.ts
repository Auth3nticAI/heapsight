import type { GameLessonVariant } from "@/types/game";

export const lesson53SpaceShooter: GameLessonVariant = {
  lessonId: "53-screen-bounds",
  instructions: `# Screen Bounds — The Invisible Wall

The player holds left. The ship slides off-screen. The player is now playing blind. Enemies kill them from off-screen. The game is broken. One clamp function per axis fixes this permanently. Run it after movement, before collision. The player hits the wall and stops. Every shipped game has this system. Most implement it in the first week.

## What Breaks Without This

Without bounds, entities escape the screen rectangle. The player disappears. Bullets fly into infinite negative space and never get cleaned up. The pool fills with invisible off-screen bullets. Enemies spawn at y=-1000 and never reach the player. Every position-dependent system assumes entities are on-screen. Bounds enforcement is that assumption's guarantee.

## The Fix

\\\`\\\`\\\`
int clamp(int value, int min, int max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

// After movement, before collision:
x[i] = clamp(x[i], 0, SCREEN_W - entityWidth);
y[i] = clamp(y[i], 0, SCREEN_H - entityHeight);
\\\`\\\`\\\`

Subtract entity size from the max bound. A 20-pixel entity at x=360 overflows a 360-pixel screen. Clamp to 340.

## Your Task

1. Pool: 20 entity slots. SoA: x, y, vx, vy, hp, type, alive
2. Screen bounds: 0 to 360 x, 0 to 400 y. Player size: 20x20
3. Clamp player to x=[0, 340], y=[0, 380]
4. Player at (180, 300), type=0, hp=100
5. 2 enemies at x=100,260 y=40 vy=4 hp=1 type=2
6. Input: 8 frames of horizontal movement, 100 pixels per step
   - Frames 1-4: move left by 100 each. Frames 5-8: move right by 100 each
7. Each frame: apply input, movementSystem, boundsSystem (clamp player), collisionSystem, cleanupSystem
8. Print per frame: \\\`BOUNDS|step|<f>|attempted|(<ax>,<ay>)|clamped|(<cx>,<cy>)|edge|<EDGE>\\\`
9. Print per frame: \\\`FRAME|<f>|player|<x>,<y>|enemies|<e>|score|<s>\\\`
10. Print: \\\`BOUNDS_SUMMARY|clamps|<n>|left|<l>|right|<r>|top|<t>|bottom|<b>\\\`
11. Print: \\\`BOUNDS_SYSTEM|PASS|player contained within screen\\\`

## Beginner Trap

**Common Mistake:** Clamping to SCREEN_W instead of SCREEN_W - PLAYER_W. The entity occupies pixels from x to x+width. If x = SCREEN_W, the entity's right edge is at SCREEN_W + width, which is off-screen. Always subtract entity dimensions from the max bound. This is not optional.

## Elite Insight

AAA engines clamp in world space, not screen space. The camera transform converts world bounds to screen bounds. But the principle is identical: constrain position to a rectangle. Physics engines use AABB (axis-aligned bounding box) overlap tests that are just two clamp checks per axis. Clamp is the atom of spatial constraint solving.

## Cross-Path Echo

Memory protection in operating systems is boundary clamping for addresses. A process cannot read below its base address or above its limit. The MMU checks every memory access against the bounds. If the access is out of range, it traps. Your screen bounds system is an MMU for game entities. The clamp function is the bounds check. The screen rectangle is the address space.`,
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
    { id: "g1", description: "Step 1 player moves left within bounds", expectedOutput: "BOUNDS\\|step\\|1\\|attempted\\|\\(80,300\\)\\|clamped\\|\\(80,300\\)\\|edge\\|NONE", isPattern: true },
    { id: "g2", description: "Step 2 player hits left boundary", expectedOutput: "BOUNDS\\|step\\|2\\|attempted\\|\\(-20,300\\)\\|clamped\\|\\(0,300\\)\\|edge\\|LEFT", isPattern: true },
    { id: "g3", description: "Step 3 player clamped at left wall", expectedOutput: "BOUNDS\\|step\\|3\\|attempted\\|\\(-100,300\\)\\|clamped\\|\\(0,300\\)\\|edge\\|LEFT", isPattern: true },
    { id: "g4", description: "Frame output with player position", expectedOutput: "FRAME\\|\\d+\\|player\\|\\d+,\\d+\\|enemies\\|\\d+\\|score\\|\\d+", isPattern: true },
    { id: "g5", description: "Bounds summary with clamp counts", expectedOutput: "BOUNDS_SUMMARY\\|clamps\\|\\d+\\|left\\|\\d+\\|right\\|\\d+\\|top\\|\\d+\\|bottom\\|\\d+", isPattern: true },
    { id: "g6", description: "Bounds system passes", expectedOutput: "BOUNDS_SYSTEM\\|PASS\\|player contained within screen", isPattern: true },
  ],
  hints: [
    "clamp(value, min, max) returns min if value < min, max if value > max. The player max x is SCREEN_W - PLAYER_W = 340. Max y is SCREEN_H - PLAYER_H = 380.",
    "Step 1: player at 180, moves -100 to 80. No clamp. Step 2: at 80, moves -100 to -20. Clamped to 0. LEFT edge. Step 3: at 0, moves -100 to -100. Clamped to 0. LEFT again.",
    "Run boundsSystem AFTER movementSystem but BEFORE collisionSystem. The clamped position is what collision checks use. If you clamp after collision, the collision saw the unclamped position.",
  ],
  accumulatedCode: `#include <iostream>
#include <iomanip>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int FIXED_DT = 16;
const int SCREEN_W = 360;
const int SCREEN_H = 400;
const int PLAYER_W = 20;
const int PLAYER_H = 20;
const int GRID_W = 20;
const int GRID_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;

// Weapon state
int cooldownMax = 4;
int cooldownCurrent = 0;
int fireCount = 0;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };

int clamp(int value, int minVal, int maxVal) {
    if (value < minVal) return minVal;
    if (value > maxVal) return maxVal;
    return value;
}

Action mapInput(char c) {
    switch (c) {
        case 'w': return MOVE_UP;
        case 's': return MOVE_DOWN;
        case 'a': return MOVE_LEFT;
        case 'd': return MOVE_RIGHT;
        case ' ': return FIRE;
        default: return NONE;
    }
}

int spawnFromPool(int px, int py, int pvx, int pvy, int php, int ptype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = pvx;
    vy[idx] = pvy;
    hp[idx] = php;
    type[idx] = ptype;
    alive[idx] = true;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

void fireSpread(int px, int py, int count, int spread) {
    for (int i = 0; i < count; i++) {
        int bulletVx = -spread + i * spread;
        spawnFromPool(px, py, bulletVx, -4, 1, 1);
    }
}

bool tryFire(int playerIdx) {
    if (cooldownCurrent <= 0) {
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -8, 1, 1);
        cooldownCurrent = cooldownMax;
        fireCount++;
        return true;
    }
    return false;
}

void cooldownSystem() {
    if (cooldownCurrent > 0) cooldownCurrent--;
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

// Clamp player to screen bounds (accounting for entity size)
void boundsSystem(int playerIdx) {
    x[playerIdx] = clamp(x[playerIdx], 0, SCREEN_W - PLAYER_W);
    y[playerIdx] = clamp(y[playerIdx], 0, SCREEN_H - PLAYER_H);
}

void formationSystem(int count, int step) {
    int offsets[] = {0, 10, 0, -10, 0};
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        x[i] += offsets[(i + step) % 5];
    }
}

void collisionSystem(int count) {
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                hp[b] = 0;
                hp[e]--;
                score += 100;
                kills++;
                break;
            }
        }
    }
}

void cleanupSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) alive[i] = false;
    }
}

int countByType(int count, int typeVal) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && type[i] == typeVal) c++;
    }
    return c;
}

int countAlive(int count) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i]) c++;
    }
    return c;
}

int worldToScreenX(int wx, int camX) {
    return (wx - camX) * GRID_W / VIEW_W;
}

int worldToScreenY(int wy, int camY) {
    return (wy - camY) * GRID_H / VIEW_H;
}

void processInput(char input, int playerIdx) {
    Action a = mapInput(input);
    if (a == MOVE_UP) y[playerIdx] -= 4;
    else if (a == MOVE_DOWN) y[playerIdx] += 4;
    else if (a == MOVE_LEFT) x[playerIdx] -= 4;
    else if (a == MOVE_RIGHT) x[playerIdx] += 4;
    else if (a == FIRE) {
        cooldownSystem();
        tryFire(playerIdx);
    }
}

void renderSystem(int count, int camX, int camY) {
    char grid[GRID_H][GRID_W];
    for (int r = 0; r < GRID_H; r++)
        for (int c = 0; c < GRID_W; c++)
            grid[r][c] = '.';

    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int sx = worldToScreenX(x[i], camX);
        int sy = worldToScreenY(y[i], camY);
        if (sx >= 0 && sx < GRID_W && sy >= 0 && sy < GRID_H) {
            if (type[i] == 0) grid[sy][sx] = 'P';
            else if (type[i] == 1) grid[sy][sx] = '|';
            else if (type[i] == 2) grid[sy][sx] = 'V';
        }
    }

    for (int r = 0; r < GRID_H; r++) {
        for (int c = 0; c < GRID_W; c++) cout << grid[r][c];
        cout << endl;
    }
}

void debugSystem(int frame, int count) {
    int active = countAlive(count);
    cout << "DEBUG|frame|" << frame << "|active|" << active
         << "|pool|" << active << "/" << POOL_SIZE
         << "|fps|60|kills|" << kills << endl;
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);

    spawnFromPool(100, 40, 0, 4, 1, 2);
    spawnFromPool(180, 40, 0, 4, 1, 2);
    spawnFromPool(260, 40, 0, 4, 1, 2);
    int count = 4;

    string frameInputs[] = {"w", " ", "w", "d", "w"};

    for (int frame = 1; frame <= 5; frame++) {
        cooldownSystem();
        processInput(frameInputs[frame - 1][0], playerIdx);
        count = (entityCount > count) ? entityCount : count;

        movementSystem(count);
        boundsSystem(playerIdx);
        collisionSystem(count);
        cleanupSystem(count);

        int active = countAlive(count);
        cout << "FRAME|" << frame << "|entities|" << active
             << "|score|" << score << "|lives|" << lives
             << "|wave|" << wave << endl;
        debugSystem(frame, count);
    }

    cout << "MILESTONE_50|PASS|fully playable prototype" << endl;
    cout << "SYSTEMS_ACTIVE|input|spawn|move|bounds|collide|damage|cleanup|render|debug|camera" << endl;
    cout << "SCORE|" << score << endl;
    return 0;
}
`,
};
