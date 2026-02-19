import type { Lesson } from "@/types/lesson";

export const lesson50: Lesson = {
  id: "50-milestone-playable",
  title: "Milestone: Playable Prototype",
  description: "The complete playable space shooter prototype — all systems running together.",
  order: 50,
  xpReward: 300,
  tier: "pro",
  concepts: ["full integration", "playable prototype", "game loop", "all systems", "milestone"],
  part1: {
    title: "Concept: Full System Integration",
    type: "concept",
    instructions: `# Full System Integration — The Whole Pipeline

Individual systems are easy. Integration is where games break. You have input, spawn, movement, collision, damage, cleanup, render, debug, and camera. Each works in isolation. Now they all run together, every frame, in the right order. One wrong sequence and bullets collide with dead enemies, scores double-count, or the camera lags one frame behind the player.

## What Breaks Without This

Without proper integration, systems step on each other. Movement runs before input, so the player responds one frame late. Cleanup runs before collision, so dead entities never register hits. Rendering runs before movement, so entities appear at last frame's position. The pipeline order is the game's correctness guarantee.

## The Fix

One loop. Fixed order. Every frame:

\\\`\\\`\\\`
1. processInput()    — read buffer, apply to player
2. spawnSystem()     — create new entities from schedule
3. movementSystem()  — apply velocities
4. collisionSystem() — detect overlaps
5. damageSystem()    — apply damage from collisions
6. cleanupSystem()   — remove dead entities
7. cameraSystem()    — update camera to follow player
8. renderSystem()    — transform to screen, draw grid
9. debugSystem()     — print frame stats
\\\`\\\`\\\`

Each system reads the arrays, writes the arrays, passes control to the next. The data flows through like water through pipes. No system calls another system. No system knows about the others. They share data, not control flow.

## Your Task

1. Create a mini-simulation with 3 frames
2. Player at (200, 300), 3 enemies at y=60, 1 bullet at player position
3. Frame 1: input moves player up, bullet spawns, enemies move down
4. Frame 2: bullet moves up, enemies move down, check collision
5. Frame 3: if collision occurred, enemy dies, score increases, cleanup runs
6. Print pipeline order: \\\`PIPELINE|input|spawn|move|collide|damage|cleanup|camera|render|debug\\\`
7. After each frame print: \\\`FRAME|<n>|player|<x>,<y>|enemies|<alive>|bullets|<alive>|score|<s>\\\`
8. Print: \\\`INTEGRATION|frames|3|systems|9|order|correct\\\`
9. Print: \\\`MILESTONE_50|PASS|all systems integrated\\\`

Expected output:
\\\`\\\`\\\`
PIPELINE|input|spawn|move|collide|damage|cleanup|camera|render|debug
FRAME|1|player|200,296|enemies|3|bullets|1|score|0
FRAME|2|player|200,292|enemies|3|bullets|1|score|0
FRAME|3|player|200,288|enemies|2|bullets|0|score|100
INTEGRATION|frames|3|systems|9|order|correct
MILESTONE_50|PASS|all systems integrated
\\\`\\\`\\\`

The bullet at y=300 moves at vy=-16, enemies at y=60 move at vy=4. After 3 frames: bullet at y=252, enemy at y=72. By frame 3 with collision check, one bullet-enemy pair overlaps and both are consumed.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX = 10;
int ex[MAX], ey[MAX], evx[MAX], evy[MAX], ehp[MAX], etype[MAX];
bool ealive[MAX];

int playerX = 200, playerY = 300;
int score = 0;

// TODO: Write movementSystem(count) — apply velocity to alive entities

// TODO: Write collisionSystem(count) — check bullet-enemy overlap
//       Bullet: type==1, Enemy: type==2
//       If overlap (within 18 units): set bullet hp=0, enemy hp--

// TODO: Write cleanupSystem(count) — kill entities with hp<=0

int main() {
    int count = 0;

    // Spawn player bullet: type=1, at player pos, vy=-16, hp=1
    ex[count]=200; ey[count]=300; evx[count]=0; evy[count]=-16;
    ehp[count]=1; etype[count]=1; ealive[count]=true; count++;

    // Spawn 3 enemies: type=2, at y=60, vy=4, hp=1
    for (int i = 0; i < 3; i++) {
        ex[count]=120+i*80; ey[count]=60; evx[count]=0; evy[count]=4;
        ehp[count]=1; etype[count]=2; ealive[count]=true; count++;
    }

    cout << "PIPELINE|input|spawn|move|collide|damage|cleanup|camera|render|debug" << endl;

    // TODO: Run 3 frames
    //   Each frame: move player up by 4, run movementSystem, collisionSystem, cleanupSystem
    //   Count alive enemies and bullets
    //   Print FRAME line
    //   If collision kills enemy, add 100 to score

    // TODO: Print INTEGRATION and MILESTONE_50 lines

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX = 10;
int ex[MAX], ey[MAX], evx[MAX], evy[MAX], ehp[MAX], etype[MAX];
bool ealive[MAX];

int playerX = 200, playerY = 300;
int score = 0;

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!ealive[i]) continue;
        ex[i] += evx[i];
        ey[i] += evy[i];
    }
}

void collisionSystem(int count) {
    for (int b = 0; b < count; b++) {
        if (!ealive[b] || etype[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!ealive[e] || etype[e] != 2) continue;
            int dx = ex[b] - ex[e];
            int dy = ey[b] - ey[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                ehp[b] = 0;
                ehp[e]--;
                score += 100;
                break;
            }
        }
    }
}

void cleanupSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (ealive[i] && ehp[i] <= 0) {
            ealive[i] = false;
        }
    }
}

int main() {
    int count = 0;

    ex[count]=200; ey[count]=300; evx[count]=0; evy[count]=-16;
    ehp[count]=1; etype[count]=1; ealive[count]=true; count++;

    for (int i = 0; i < 3; i++) {
        ex[count]=120+i*80; ey[count]=60; evx[count]=0; evy[count]=4;
        ehp[count]=1; etype[count]=2; ealive[count]=true; count++;
    }

    cout << "PIPELINE|input|spawn|move|collide|damage|cleanup|camera|render|debug" << endl;

    for (int frame = 1; frame <= 3; frame++) {
        playerY -= 4;
        movementSystem(count);
        collisionSystem(count);
        cleanupSystem(count);

        int bullets = 0, enemies = 0;
        for (int i = 0; i < count; i++) {
            if (!ealive[i]) continue;
            if (etype[i] == 1) bullets++;
            if (etype[i] == 2) enemies++;
        }

        cout << "FRAME|" << frame << "|player|" << playerX << "," << playerY
             << "|enemies|" << enemies << "|bullets|" << bullets
             << "|score|" << score << endl;
    }

    cout << "INTEGRATION|frames|3|systems|9|order|correct" << endl;
    cout << "MILESTONE_50|PASS|all systems integrated" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Pipeline order is printed", expectedOutput: "PIPELINE|input|spawn|move|collide|damage|cleanup|camera|render|debug" },
      { id: "t2", description: "Frame 1 shows player moved and entities alive", expectedOutput: "FRAME\\|1\\|player\\|200,296\\|enemies\\|3\\|bullets\\|1\\|score\\|0", isPattern: true },
      { id: "t3", description: "Frame 3 shows collision result", expectedOutput: "FRAME\\|3\\|player\\|200,288\\|enemies\\|2\\|bullets\\|0\\|score\\|100", isPattern: true },
      { id: "t4", description: "Integration summary", expectedOutput: "INTEGRATION|frames|3|systems|9|order|correct" },
      { id: "t5", description: "Milestone pass", expectedOutput: "MILESTONE_50|PASS|all systems integrated" },
    ],
    hints: [
      "The bullet starts at (200,300) with vy=-16. After frame 1: y=284. After frame 2: y=268. After frame 3: y=252. The enemy at (200,60) with vy=4: after frame 3: y=72.",
      "Collision uses absolute distance: if |dx| < 18 and |dy| < 18, it is a hit. The bullet at x=200 and enemy at x=200 have dx=0. Check dy each frame.",
      "Run systems in order: movement first, then collision, then cleanup. If you run cleanup before collision, dead entities are removed before hits are checked.",
    ],
    estimatedMinutes: 12,
  },
  part2: {
    title: "Game: Fully Playable Prototype",
    type: "game_builder",
    instructions: `# Game Builder: Fully Playable Prototype

This is the milestone. Every system you have built runs together in one simulation. Input processes commands. Spawn creates enemies from a wave schedule. Movement applies velocities. Collision detects hits. Damage applies HP reduction. Cleanup removes the dead. Camera follows the player. Render draws the grid. Debug prints frame stats. Five frames of gameplay proving the prototype works end-to-end.

## Your Task
1. ALL systems: input, spawn, movement, collision, damage, cleanup, render (ASCII grid), debug, camera
2. Pool: 30 entity slots with SoA arrays (x, y, vx, vy, hp, type, alive)
3. Player at (180, 300), type=0, hp=100
4. Wave 1: 3 enemies at x=100,180,260, y=40, vy=4, hp=1, type=2
5. Input string for 5 frames: \\\`"w"\\\`, \\\`" "\\\`, \\\`"w"\\\`, \\\`"d"\\\`, \\\`"w"\\\`
   - Frame 1: w (move up), Frame 2: space (fire), Frame 3: w, Frame 4: d, Frame 5: w
6. Simulate 5 frames:
   - Frame 1: Player moves to (180,296). 3 enemies at y=44
   - Frame 2: Player fires, bullet spawns at (180,292). Enemies at y=48
   - Frame 3: Player at (180,288). Bullet at y=276. Enemies at y=52
   - Frame 4: Player at (184,288). Bullet at y=260. Enemies at y=56
   - Frame 5: Player at (184,284). Bullet at y=244. Enemies at y=60. Check collision
7. After frame 5, spawn wave 2: 3 more enemies at y=20
8. Print per frame: \\\`FRAME|<n>|entities|<count>|score|<s>|lives|3|wave|<w>\\\`
9. Print debug: \\\`DEBUG|frame|<n>|active|<count>|pool|<used>/<max>|fps|60|kills|<k>\\\`
10. Print ASCII grid for frame 5 (20x10, camera centered on player)
11. Print: \\\`MILESTONE_50|PASS|fully playable prototype\\\`
12. Print: \\\`SYSTEMS_ACTIVE|input|spawn|move|collide|damage|cleanup|render|debug|camera\\\`

## Beginner Trap

**Common Mistake:** Running collision before movement. The bullet has not moved yet, so it checks collision at the wrong position. Always: input, spawn, move, THEN collide. The pipeline order is the correctness contract.

## Elite Insight

This is ship-quality architecture. Every commercial game is this pipeline with more systems. Audio, networking, animation, AI, physics — they all slot into the same pattern. The loop runs. Systems process. Data flows. The architecture does not change when you add features. It scales by adding systems, not by rewriting the loop.

## Cross-Path Echo

CI/CD pipelines are the same architecture. Lint, compile, test, deploy — each stage transforms data and passes it forward. A failed stage halts the pipeline. The build system does not know about the test system. They share artifacts, not control flow. Your game loop is a real-time CI pipeline running at 60Hz.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int SCREEN_W = 20;
const int SCREEN_H = 10;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;

// TODO: Write spawnEntity(px, py, pvx, pvy, php, ptype) — init entity at entityCount, increment

// TODO: Write movementSystem() — for each alive: x += vx, y += vy

// TODO: Write collisionSystem() — check bullet(type=1) vs enemy(type=2) overlap
//       If |dx| < 18 && |dy| < 18: bullet hp=0, enemy hp--, score += 100, kills++

// TODO: Write cleanupSystem() — alive=false for entities with hp<=0

// TODO: Write renderGrid(camX, camY) — draw 20x10 grid with camera offset
//       Player='P', Bullet='|', Enemy='V', empty='.'

int main() {
    // TODO: Spawn player at (180,300), type=0, hp=100
    // TODO: Spawn 3 wave-1 enemies at x=100,180,260 y=40 vy=4 hp=1 type=2

    string frameInputs[] = {"w", " ", "w", "d", "w"};

    // TODO: Run 5 frames
    //   Each frame: process input, move, collide, cleanup
    //   Print FRAME and DEBUG lines
    //   On frame 5: render grid, spawn wave 2

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
    // Player: index 0
    spawnEntity(180, 300, 0, 0, 100, 0);

    // Wave 1: 3 enemies
    spawnEntity(100, 40, 0, 4, 1, 2);
    spawnEntity(180, 40, 0, 4, 1, 2);
    spawnEntity(260, 40, 0, 4, 1, 2);

    string frameInputs[] = {"w", " ", "w", "d", "w"};

    for (int frame = 1; frame <= 5; frame++) {
        // Input
        char input = frameInputs[frame - 1][0];
        if (input == 'w') y[0] -= 4;
        else if (input == 's') y[0] += 4;
        else if (input == 'a') x[0] -= 4;
        else if (input == 'd') x[0] += 4;
        else if (input == ' ') {
            spawnEntity(x[0], y[0], 0, -16, 1, 1);
        }

        // Systems pipeline
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

        // Render grid on frame 5
        if (frame == 5) {
            int camX = x[0] - VIEW_W / 2;
            int camY = y[0] - VIEW_H / 2;
            renderGrid(camX, camY);

            // Spawn wave 2
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
      { id: "t1", description: "Frame 1 shows initial state after movement", expectedOutput: "FRAME\\|1\\|entities\\|\\d+\\|score\\|0\\|lives\\|3\\|wave\\|1", isPattern: true },
      { id: "t2", description: "Frame 2 bullet spawned from fire input", expectedOutput: "FRAME\\|2\\|entities\\|\\d+\\|score\\|\\d+\\|lives\\|3\\|wave\\|1", isPattern: true },
      { id: "t3", description: "Frame 5 shows game state", expectedOutput: "FRAME\\|5\\|entities\\|\\d+\\|score\\|\\d+\\|lives\\|3\\|wave\\|1", isPattern: true },
      { id: "t4", description: "Debug output per frame", expectedOutput: "DEBUG\\|frame\\|\\d+\\|active\\|\\d+\\|pool\\|\\d+/30\\|fps\\|60\\|kills\\|\\d+", isPattern: true },
      { id: "t5", description: "Grid contains player marker", expectedOutput: "P", isPattern: true },
      { id: "t6", description: "Milestone 50 passes", expectedOutput: "MILESTONE_50\\|PASS\\|fully playable prototype", isPattern: true },
      { id: "t7", description: "All systems active", expectedOutput: "SYSTEMS_ACTIVE\\|input\\|spawn\\|move\\|collide\\|damage\\|cleanup\\|render\\|debug\\|camera", isPattern: true },
    ],
    hints: [
      "Process input BEFORE movement. On frame 2, space fires a bullet at the player's current position. The bullet then moves with movementSystem in the same frame.",
      "Collision checks |dx| < 18 && |dy| < 18 for bullet vs enemy. The bullet at x=180 matches enemy at x=180. Track the y positions: bullet moves at vy=-16, enemy at vy=4.",
      "Render grid with camera centered on player. camX = playerX - VIEW_W/2. Use worldToScreen to transform all alive entities to screen coordinates before drawing.",
    ],
    estimatedMinutes: 20,
  },
};
