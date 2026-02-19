import type { GameLessonVariant } from "@/types/game";

export const lesson50SpaceShooter: GameLessonVariant = {
  lessonId: "50-milestone-playable",
  instructions: `# Milestone: Playable Prototype — Every System, Every Frame

This is not a drill. Nine systems. Five frames. One pipeline. Input reads the command buffer. Spawn creates entities from the wave schedule. Movement applies velocities. Collision detects overlaps. Damage reduces HP. Cleanup removes the dead. Camera follows the player. Render draws the grid. Debug reports frame stats. Miss one system and the prototype fails. Get the order wrong and the simulation diverges.

## What Breaks Without This

Without full integration, you have parts that work alone but fail together. The bullet hits an enemy that was already cleaned up. The camera renders last frame's positions. The score counts a kill that the collision system never detected. Integration bugs are the hardest to find because each system passes its unit tests. The bug lives in the seam between systems.

## The Fix

Strict pipeline order, enforced by the game loop. No system can skip ahead. No system can run out of order. The loop is the law:

\\\`\\\`\\\`
input -> spawn -> move -> collide -> damage -> cleanup -> camera -> render -> debug
\\\`\\\`\\\`

Each frame, each system runs exactly once. The data arrays are the shared contract. Systems read and write the same SoA arrays. The pipeline is a function composition: \\\`debug(render(camera(cleanup(damage(collide(move(spawn(input(state)))))))))\\\`.

## Your Task

1. Pool: 30 entity slots. SoA: x, y, vx, vy, hp, type, alive
2. Player: (180,300), type=0, hp=100. Wave 1: 3 enemies at x=100,180,260 y=40 vy=4 hp=1 type=2
3. Input per frame: "w", " ", "w", "d", "w"
4. Each frame runs: input, spawn (from fire), movement, collision, cleanup
5. Frame 1: Player moves up. 3 enemies move down. No bullet yet
6. Frame 2: Player fires. Bullet spawns at player pos. All entities move
7. Frame 3: Bullet moves up. Enemies move down. Check collisions
8. Frame 4: Player moves right. Bullet continues. Enemies continue
9. Frame 5: Check collisions. If hit: enemy dies, score += 100. Render grid. Spawn wave 2
10. Print per frame: \\\`FRAME|<n>|entities|<count>|score|<s>|lives|3|wave|<w>\\\`
11. Print debug: \\\`DEBUG|frame|<n>|active|<count>|pool|<used>/<max>|fps|60|kills|<k>\\\`
12. Print ASCII grid on frame 5 (20x10, camera centered on player)
13. Print: \\\`MILESTONE_50|PASS|fully playable prototype\\\`
14. Print: \\\`SYSTEMS_ACTIVE|input|spawn|move|collide|damage|cleanup|render|debug|camera\\\`

## Beginner Trap

**Common Mistake:** Spawning the bullet and then immediately calling movementSystem, which moves the bullet before it should. The bullet spawns from input at the player's current position. Movement happens after spawn. So on the spawn frame, the bullet moves one step. On the next frame, it moves again. Track positions carefully through each frame.

## Elite Insight

This pipeline is the skeleton of every shipped game. Unreal Engine runs 30+ systems per frame in a dependency graph. Unity's ECS runs systems in explicit order groups. The pattern is identical: ordered systems, shared data, no coupling. Your 9-system prototype runs the same architecture at smaller scale.

## Cross-Path Echo

Operating system schedulers are the same pattern. Process management, memory management, I/O, networking — each subsystem runs in a defined order per tick. The OS kernel is a game loop. The scheduler picks processes. The memory manager pages. The I/O system flushes buffers. Each subsystem transforms shared state. The order is the correctness guarantee.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;

// TODO: Write spawnEntity(px, py, pvx, pvy, php, ptype)

// TODO: Write movementSystem() — apply vx/vy to alive entities

// TODO: Write collisionSystem() — bullet(type=1) vs enemy(type=2)
//       If |dx|<18 && |dy|<18: bullet hp=0, enemy hp--, score+=100, kills++

// TODO: Write cleanupSystem() — set alive=false if hp<=0

// TODO: Write worldToScreenX/Y and renderGrid(camX, camY)

int main() {
    // TODO: Spawn player and wave 1 enemies
    // TODO: Run 5 frames with input string per frame
    // TODO: Print FRAME, DEBUG, grid on frame 5, wave 2 spawn
    // TODO: Print MILESTONE_50 and SYSTEMS_ACTIVE

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;

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

int worldToScreenX(int wx, int camX) {
    return (wx - camX) * SCREEN_W / VIEW_W;
}

int worldToScreenY(int wy, int camY) {
    return (wy - camY) * SCREEN_H / VIEW_H;
}

void renderGrid(int camX, int camY) {
    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    for (int i = 0; i < entityCount; i++) {
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

int countAlive() {
    int c = 0;
    for (int i = 0; i < entityCount; i++) {
        if (alive[i]) c++;
    }
    return c;
}

int main() {
    spawnEntity(180, 300, 0, 0, 100, 0);

    spawnEntity(100, 40, 0, 4, 1, 2);
    spawnEntity(180, 40, 0, 4, 1, 2);
    spawnEntity(260, 40, 0, 4, 1, 2);

    string frameInputs[] = {"w", " ", "w", "d", "w"};

    for (int frame = 1; frame <= 5; frame++) {
        char input = frameInputs[frame - 1][0];
        if (input == 'w') y[0] -= 4;
        else if (input == 's') y[0] += 4;
        else if (input == 'a') x[0] -= 4;
        else if (input == 'd') x[0] += 4;
        else if (input == ' ') {
            spawnEntity(x[0], y[0], 0, -16, 1, 1);
        }

        movementSystem();
        collisionSystem();
        cleanupSystem();

        int activeCount = countAlive();

        cout << "FRAME|" << frame << "|entities|" << activeCount
             << "|score|" << score << "|lives|" << lives
             << "|wave|" << wave << endl;

        cout << "DEBUG|frame|" << frame << "|active|" << activeCount
             << "|pool|" << activeCount << "/" << POOL_SIZE
             << "|fps|60|kills|" << kills << endl;

        if (frame == 5) {
            int camX = x[0] - VIEW_W / 2;
            int camY = y[0] - VIEW_H / 2;
            renderGrid(camX, camY);

            wave = 2;
            spawnEntity(80, 20, 0, 4, 1, 2);
            spawnEntity(180, 20, 0, 4, 1, 2);
            spawnEntity(280, 20, 0, 4, 1, 2);
        }
    }

    cout << "MILESTONE_50|PASS|fully playable prototype" << endl;
    cout << "SYSTEMS_ACTIVE|input|spawn|move|collide|damage|cleanup|render|debug|camera" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1 initial state", expectedOutput: "FRAME\\|1\\|entities\\|\\d+\\|score\\|0\\|lives\\|3\\|wave\\|1", isPattern: true },
    { id: "g2", description: "Frame 2 with bullet spawned", expectedOutput: "FRAME\\|2\\|entities\\|\\d+\\|score\\|\\d+\\|lives\\|3\\|wave\\|1", isPattern: true },
    { id: "g3", description: "Frame 5 final state", expectedOutput: "FRAME\\|5\\|entities\\|\\d+\\|score\\|\\d+\\|lives\\|3\\|wave\\|1", isPattern: true },
    { id: "g4", description: "Debug output shows pool usage", expectedOutput: "DEBUG\\|frame\\|\\d+\\|active\\|\\d+\\|pool\\|\\d+/30\\|fps\\|60\\|kills\\|\\d+", isPattern: true },
    { id: "g5", description: "ASCII grid rendered with entities", expectedOutput: "[\\.PV|]+", isPattern: true },
    { id: "g6", description: "Milestone 50 passes", expectedOutput: "MILESTONE_50\\|PASS\\|fully playable prototype", isPattern: true },
    { id: "g7", description: "All 9 systems listed as active", expectedOutput: "SYSTEMS_ACTIVE\\|input\\|spawn\\|move\\|collide\\|damage\\|cleanup\\|render\\|debug\\|camera", isPattern: true },
  ],
  hints: [
    "Frame order: process input first (move player or spawn bullet), then movementSystem (everything moves), then collisionSystem, then cleanupSystem. This ensures bullets move before collision is checked.",
    "Player index is 0. Modify x[0] and y[0] directly for input. Bullet spawns at x[0], y[0] with vy=-16. The bullet entity is appended to the arrays via spawnEntity.",
    "For the grid: camX = x[0] - VIEW_W/2, camY = y[0] - VIEW_H/2. Transform all alive entities to screen space. Type 0 is 'P', type 1 is '|', type 2 is 'V'.",
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
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1);
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

    // Wave 1
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

        if (frame == 5) {
            int camX = x[playerIdx] - VIEW_W / 2;
            int camY = y[playerIdx] - VIEW_H / 2;
            renderSystem(count, camX, camY);

            wave = 2;
            spawnFromPool(80, 20, 0, 4, 1, 2);
            spawnFromPool(180, 20, 0, 4, 1, 2);
            spawnFromPool(280, 20, 0, 4, 1, 2);
        }
    }

    cout << "MILESTONE_50|PASS|fully playable prototype" << endl;
    cout << "SYSTEMS_ACTIVE|input|spawn|move|collide|damage|cleanup|render|debug|camera" << endl;
    cout << "SCORE|" << score << endl;
    return 0;
}
`,
};
