import type { GameLessonVariant } from "@/types/game";

export const lesson51SpaceShooter: GameLessonVariant = {
  lessonId: "51-spread-shot",
  instructions: `# Spread Shot — Single Bullets Are Not Enough

One bullet per frame covers one lane. Enemies spawn across the full screen width. The player cannot be everywhere. The fix is projectile fan-out: one fire input, multiple bullets, diverging trajectories. Each bullet gets a unique velocity vector. The spread grows every frame. Three bullets cover three lanes for the cost of one input.

## What Breaks Without This

Without spread, the player fires a single column of bullets. Enemies at x=140 and x=220 are unreachable unless the player moves first. Movement costs frames. Frames cost lives. A spread shot lets the player hold position and still cover width. Every commercial shooter ships with spread weapons for exactly this reason.

## The Fix

\\\`\\\`\\\`
fireSpread(x, y, count=3, spread=2):
  bullet 0: vx = -2, vy = -4   // drifts left
  bullet 1: vx =  0, vy = -4   // straight up
  bullet 2: vx = +2, vy = -4   // drifts right
\\\`\\\`\\\`

Same spawn point. Different vx. The vy is constant so all bullets maintain the same vertical speed. Horizontal divergence grows linearly: after N steps, bullet 0 is at x - N*spread, bullet 2 is at x + N*spread.

## Your Task

1. Pool: 20 entity slots. SoA: x, y, vx, vy, hp, type, alive
2. Player at (180, 300), type=0, hp=100
3. 3 enemies at x=140,180,220 y=60 vy=4 hp=1 type=2
4. Implement fireSpread(px, py, count, spread) — spawns 3 bullets with vx = -spread, 0, +spread
5. Input for 5 frames: "w", " ", "w", "w", "w"
6. Each frame: process input, fire on space, movementSystem, collisionSystem, cleanupSystem
7. Print alive bullets each frame: \\\`BULLET|spread_<i>|vx|<vx>|vy|<vy>|pos|<x>,<y>\\\`
8. Print per frame: \\\`FRAME|<n>|entities|<count>|score|<s>|bullets|<b>\\\`
9. Print: \\\`FIRE_PATTERN|spread|count|3|angle_range|30\\\`
10. Print: \\\`SPREAD_SYSTEM|PASS|bullets diverge correctly\\\`

## Beginner Trap

**Common Mistake:** Computing vx as \\\`-spread + i * spread\\\` but using the wrong loop bounds. For count=3 and spread=2: i=0 gives vx=-2, i=1 gives vx=0, i=2 gives vx=2. If you loop from 1 to count, bullet 0 gets vx=0 and the pattern is off-center.

## Elite Insight

Bullet hell games spawn hundreds of projectiles per frame using this exact pattern. The architecture is identical: a spawn function, a velocity table, and the movement system handles the rest. Touhou ships patterns with 2000+ active bullets. Same SoA arrays. Same movement loop. The pattern scales because the data layout scales.

## Cross-Path Echo

Ray tracing uses the same fan-out. A camera casts rays through each pixel with slightly different direction vectors. Each ray diverges through the scene. Same origin, different angles, growing separation. Your spread shot is a 2D ray cast with collision detection.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 20;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;
int kills = 0;

// TODO: Write spawnEntity(px, py, pvx, pvy, php, ptype)

// TODO: Write fireSpread(px, py, count, spread)
//       Spawns count bullets at (px,py) with vx = -spread, 0, +spread and vy = -4

// TODO: Write movementSystem() — apply vx/vy to alive entities

// TODO: Write collisionSystem() — bullet(type=1) vs enemy(type=2)
//       If |dx|<18 && |dy|<18: bullet hp=0, enemy hp--, score+=100, kills++

// TODO: Write cleanupSystem() — alive=false if hp<=0

int main() {
    // TODO: Spawn player at (180,300) type=0 hp=100
    // TODO: Spawn 3 enemies at x=140,180,220 y=60 vy=4 hp=1 type=2

    string inputs[] = {"w", " ", "w", "w", "w"};

    // TODO: Run 5 frames
    //   Process input, fire spread on space, move, collide, cleanup
    //   Print BULLET lines for alive bullets
    //   Print FRAME line

    // TODO: Print FIRE_PATTERN and SPREAD_SYSTEM lines

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 20;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;
int kills = 0;

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

void fireSpread(int px, int py, int count, int spread) {
    for (int i = 0; i < count; i++) {
        int bulletVx = -spread + i * spread;
        spawnEntity(px, py, bulletVx, -4, 1, 1);
    }
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
                kills++;
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

    spawnEntity(140, 60, 0, 4, 1, 2);
    spawnEntity(180, 60, 0, 4, 1, 2);
    spawnEntity(220, 60, 0, 4, 1, 2);

    string inputs[] = {"w", " ", "w", "w", "w"};

    for (int frame = 1; frame <= 5; frame++) {
        char input = inputs[frame - 1][0];
        if (input == 'w') y[0] -= 4;
        else if (input == 's') y[0] += 4;
        else if (input == 'a') x[0] -= 4;
        else if (input == 'd') x[0] += 4;
        else if (input == ' ') {
            fireSpread(x[0], y[0], 3, 2);
        }

        movementSystem();
        collisionSystem();
        cleanupSystem();

        int bulletCount = 0;
        int bulletIdx = 0;
        for (int i = 0; i < entityCount; i++) {
            if (alive[i] && type[i] == 1) {
                cout << "BULLET|spread_" << bulletIdx << "|vx|" << vx[i]
                     << "|vy|" << vy[i] << "|pos|" << x[i] << "," << y[i] << endl;
                bulletIdx++;
                bulletCount++;
            }
        }

        int aliveCount = 0;
        for (int i = 0; i < entityCount; i++) {
            if (alive[i]) aliveCount++;
        }

        cout << "FRAME|" << frame << "|entities|" << aliveCount
             << "|score|" << score << "|bullets|" << bulletCount << endl;
    }

    cout << "FIRE_PATTERN|spread|count|3|angle_range|30" << endl;
    cout << "SPREAD_SYSTEM|PASS|bullets diverge correctly" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "No bullets in frame 1", expectedOutput: "FRAME\\|1\\|entities\\|4\\|score\\|0\\|bullets\\|0", isPattern: true },
    { id: "g2", description: "Spread bullets spawned in frame 2", expectedOutput: "BULLET\\|spread_\\d+\\|vx\\|-?\\d+\\|vy\\|-4\\|pos\\|\\d+,\\d+", isPattern: true },
    { id: "g3", description: "Frame 2 has 3 bullets", expectedOutput: "FRAME\\|2\\|entities\\|\\d+\\|score\\|\\d+\\|bullets\\|3", isPattern: true },
    { id: "g4", description: "Left bullet has negative vx", expectedOutput: "BULLET\\|spread_0\\|vx\\|-2\\|vy\\|-4", isPattern: true },
    { id: "g5", description: "Fire pattern summary", expectedOutput: "FIRE_PATTERN\\|spread\\|count\\|3\\|angle_range\\|30", isPattern: true },
    { id: "g6", description: "Spread system passes", expectedOutput: "SPREAD_SYSTEM\\|PASS\\|bullets diverge correctly", isPattern: true },
  ],
  hints: [
    "fireSpread spawns 3 bullets. For i=0: vx = -spread + 0*spread = -2. For i=1: vx = -spread + 1*spread = 0. For i=2: vx = -spread + 2*spread = 2. All get vy=-4.",
    "On frame 2, input is space. The player is at (180,292) after the w from frame 1. Bullets spawn there. Then movementSystem moves them: bullet 0 goes to (178,288), bullet 1 to (180,288), bullet 2 to (182,288).",
    "Collision uses |dx|<18 && |dy|<18. Track the center bullet (vx=0) vs the center enemy (x=180). Their x values match. The collision depends on when their y values converge within 18 units.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int FIXED_DT = 16;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
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

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };

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

// Spread shot: spawns count bullets with diverging vx
void fireSpread(int px, int py, int count, int spread) {
    for (int i = 0; i < count; i++) {
        int bulletVx = -spread + i * spread;
        spawnFromPool(px, py, bulletVx, -4, 1, 1);
    }
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void formationSystem(int count, int step) {
    int offsets[] = {0, 10, 0, -10, 0};
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        x[i] += offsets[(i + step) % 5];
    }
}

void boundsSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < 0) alive[i] = false;
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
    return (wx - camX) * SCREEN_W / VIEW_W;
}

int worldToScreenY(int wy, int camY) {
    return (wy - camY) * SCREEN_H / VIEW_H;
}

void processInput(char input, int playerIdx) {
    Action a = mapInput(input);
    if (a == MOVE_UP) y[playerIdx] -= 4;
    else if (a == MOVE_DOWN) y[playerIdx] += 4;
    else if (a == MOVE_LEFT) x[playerIdx] -= 4;
    else if (a == MOVE_RIGHT) x[playerIdx] += 4;
    else if (a == FIRE) {
        fireSpread(x[playerIdx], y[playerIdx], 3, 2);
    }
}

void renderSystem(int count, int camX, int camY) {
    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int sx = worldToScreenX(x[i], camX);
        int sy = worldToScreenY(y[i], camY);
        if (sx >= 0 && sx < SCREEN_W && sy >= 0 && sy < SCREEN_H) {
            if (type[i] == 0) grid[sy][sx] = 'P';
            else if (type[i] == 1) grid[sy][sx] = '|';
            else if (type[i] == 2) grid[sy][sx] = 'V';
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
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
        processInput(frameInputs[frame - 1][0], playerIdx);
        count = (entityCount > count) ? entityCount : count;

        movementSystem(count);
        collisionSystem(count);
        cleanupSystem(count);

        int active = countAlive(count);
        cout << "FRAME|" << frame << "|entities|" << active
             << "|score|" << score << "|lives|" << lives
             << "|wave|" << wave << endl;
        debugSystem(frame, count);
    }

    cout << "MILESTONE_50|PASS|fully playable prototype" << endl;
    cout << "SYSTEMS_ACTIVE|input|spawn|move|collide|damage|cleanup|render|debug|camera" << endl;
    cout << "SCORE|" << score << endl;
    return 0;
}
`,
};
