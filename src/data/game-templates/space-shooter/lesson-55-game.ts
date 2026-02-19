import type { GameLessonVariant } from "@/types/game";

export const lesson55SpaceShooter: GameLessonVariant = {
  lessonId: "55-milestone-visual-feel",
  instructions: `# Milestone: Visual Feel — All Feedback Systems Running Together

This is where systems stop being isolated features and start being a game. Spread shot, cooldown, screen bounds, hit flash — four systems that individually do nothing impressive. Together they create the rhythm of combat. Fire, wait, watch bullets travel, see hits flash, enemies die, fire again. Every frame runs every system. The pipeline is the game.

## What Breaks Without This

Without integration, spread shot fires but cooldown does not limit it. Bullets fly forever because bounds are not checked. Enemies die silently because flash is not triggered. Each system works alone. Together they produce garbage. Integration testing is where games actually fail.

## The Fix

One pipeline. Fixed order. Every frame:

\\\`\\\`\\\`
input -> spawn (spread) -> move -> bounds -> collide -> flash -> cleanup -> render
\\\`\\\`\\\`

Cooldown blocks input. Spread spawns 3 bullets. Movement applies velocities. Bounds kills off-screen bullets. Collision triggers flash and damage. Flash decrements timers. Cleanup removes dead. Render draws everything with current sprites. The order is the contract.

## Your Task

1. Player at (200,300), type=0, sprite='P'. 4 enemies at y=60: x=120,180,220,280. vy=4, hp=2, type=2, sprite='v'
2. Frame 1: fire spread — 3 bullets at x-8, x, x+8 with vy=-16. Set cooldown=4
3. Run 8 frames. Each frame: move, bounds, collide, flash, cleanup
4. Collision: |dx|<18 && |dy|<18. On hit: bullet hp=0, enemy hp--, score+=100, flashTimer=3, sprite='X'
5. Enemies have hp=2. First hit flashes but survives. Second hit kills
6. Print: \\\`FRAME|<n>|bullets|<count>|enemies_flashing|<count>|score|<s>|cooldown|<cd>\\\`
7. Print: \\\`VISUAL|frame|<n>|spread_active|<bool>|flashes|<count>|bounds_clamps|<count>\\\`
8. Print ASCII grid on frame 4 and frame 8 (20x10, camera centered on player)
9. Print: \\\`MILESTONE_55|PASS|visual feel achieved\\\`

## Beginner Trap

**Common Mistake:** Running flash system before collision system. If flash runs first, a newly triggered flash immediately gets decremented. The flash duration is 2 frames instead of 3. Collision sets the flash, then flash decrements it next frame.

## Elite Insight

Game feel tuning is about these numbers: spread angle (8 pixels), cooldown duration (4 frames), flash duration (3 frames), bullet speed (-16), enemy speed (4). Change any one and the feel changes. Professional developers expose these as config values and tune them with playtesters. The architecture makes this possible because each constant is isolated in its system.

## Cross-Path Echo

Audio mixing is the same integration problem. Volume, EQ, compression, reverb, panning — each effect processes the signal independently. The order matters (compress before reverb, not after). The pipeline is the mix. Your game loop is an audio signal chain that processes entity state instead of sample buffers.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX = 20;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 400;
const int VIEW_H = 400;

int ex[MAX], ey[MAX], evx[MAX], evy[MAX], ehp[MAX], etype[MAX];
bool ealive[MAX];
int eflash[MAX];
char esprite[MAX];
int entityCount = 0;
int score = 0;
int cooldown = 0;

// TODO: Write spawnEntity(px, py, pvx, pvy, php, ptype, psprite)

// TODO: Write movementSystem(), flashSystem(), boundsSystem()
// TODO: Write collisionSystem() — on hit: flash enemy, destroy bullet
// TODO: Write cleanupSystem()
// TODO: Write renderGrid(camX, camY) — 20x10 grid using esprite[]

int main() {
    // TODO: Spawn player, 4 enemies with hp=2
    // TODO: Frame 1: fire spread, set cooldown=4
    // TODO: Run 8 frames, print FRAME and VISUAL lines
    // TODO: Render grid on frames 4 and 8
    // TODO: Print MILESTONE_55

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX = 20;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 400;
const int VIEW_H = 400;

int ex[MAX], ey[MAX], evx[MAX], evy[MAX], ehp[MAX], etype[MAX];
bool ealive[MAX];
int eflash[MAX];
char esprite[MAX];
int entityCount = 0;
int score = 0;
int cooldown = 0;

void spawnEntity(int px, int py, int pvx, int pvy, int php, int ptype, char psprite) {
    ex[entityCount] = px;
    ey[entityCount] = py;
    evx[entityCount] = pvx;
    evy[entityCount] = pvy;
    ehp[entityCount] = php;
    etype[entityCount] = ptype;
    ealive[entityCount] = true;
    eflash[entityCount] = 0;
    esprite[entityCount] = psprite;
    entityCount++;
}

void movementSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        ex[i] += evx[i];
        ey[i] += evy[i];
    }
}

void flashSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        if (eflash[i] > 0) {
            eflash[i]--;
            if (eflash[i] == 0) {
                esprite[i] = 'v';
            }
        }
    }
}

void boundsSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        if (etype[i] == 1 && ey[i] < 0) ealive[i] = false;
    }
}

void collisionSystem() {
    for (int b = 0; b < entityCount; b++) {
        if (!ealive[b] || etype[b] != 1) continue;
        for (int e = 0; e < entityCount; e++) {
            if (!ealive[e] || etype[e] != 2) continue;
            int dx = ex[b] - ex[e];
            int dy = ey[b] - ey[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                ehp[b] = 0;
                ehp[e]--;
                score += 100;
                eflash[e] = 3;
                esprite[e] = 'X';
                break;
            }
        }
    }
}

void cleanupSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (ealive[i] && ehp[i] <= 0) ealive[i] = false;
    }
}

void renderGrid(int camX, int camY) {
    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        int sx = (ex[i] - camX) * SCREEN_W / VIEW_W;
        int sy = (ey[i] - camY) * SCREEN_H / VIEW_H;
        if (sx >= 0 && sx < SCREEN_W && sy >= 0 && sy < SCREEN_H) {
            grid[sy][sx] = esprite[i];
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
        cout << endl;
    }
}

int main() {
    spawnEntity(200, 300, 0, 0, 100, 0, 'P');

    spawnEntity(120, 60, 0, 4, 2, 2, 'v');
    spawnEntity(180, 60, 0, 4, 2, 2, 'v');
    spawnEntity(220, 60, 0, 4, 2, 2, 'v');
    spawnEntity(280, 60, 0, 4, 2, 2, 'v');

    for (int frame = 1; frame <= 8; frame++) {
        bool spreadThisFrame = false;
        if (frame == 1 && cooldown == 0) {
            spawnEntity(192, 300, 0, -16, 1, 1, '|');
            spawnEntity(200, 300, 0, -16, 1, 1, '|');
            spawnEntity(208, 300, 0, -16, 1, 1, '|');
            cooldown = 4;
            spreadThisFrame = true;
        }

        movementSystem();
        boundsSystem();
        collisionSystem();
        flashSystem();
        cleanupSystem();

        if (cooldown > 0) cooldown--;

        int bullets = 0;
        int flashing = 0;
        int boundsClamps = 0;
        for (int i = 0; i < entityCount; i++) {
            if (!ealive[i]) continue;
            if (etype[i] == 1) bullets++;
            if (etype[i] == 2 && eflash[i] > 0) flashing++;
        }

        cout << "FRAME|" << frame << "|bullets|" << bullets
             << "|enemies_flashing|" << flashing << "|score|" << score
             << "|cooldown|" << cooldown << endl;

        cout << "VISUAL|frame|" << frame
             << "|spread_active|" << (spreadThisFrame ? "true" : "false")
             << "|flashes|" << flashing << "|bounds_clamps|" << boundsClamps << endl;

        if (frame == 4 || frame == 8) {
            int camX = ex[0] - VIEW_W / 2;
            int camY = ey[0] - VIEW_H / 2;
            renderGrid(camX, camY);
        }
    }

    cout << "MILESTONE_55|PASS|visual feel achieved" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1 spread shot with cooldown", expectedOutput: "FRAME\\|1\\|bullets\\|3\\|enemies_flashing\\|0\\|score\\|0\\|cooldown\\|4", isPattern: true },
    { id: "g2", description: "Visual shows spread active on frame 1", expectedOutput: "VISUAL\\|frame\\|1\\|spread_active\\|true\\|flashes\\|\\d+\\|bounds_clamps\\|\\d+", isPattern: true },
    { id: "g3", description: "Frame 8 final state printed", expectedOutput: "FRAME\\|8\\|bullets\\|\\d+\\|enemies_flashing\\|\\d+\\|score\\|\\d+\\|cooldown\\|\\d+", isPattern: true },
    { id: "g4", description: "ASCII grid rendered with entities", expectedOutput: "[\\.Pv|X]+", isPattern: true },
    { id: "g5", description: "Visual data per frame", expectedOutput: "VISUAL\\|frame\\|\\d+\\|spread_active\\|\\w+\\|flashes\\|\\d+\\|bounds_clamps\\|\\d+", isPattern: true },
    { id: "g6", description: "Milestone 55 passes", expectedOutput: "MILESTONE_55\\|PASS\\|visual feel achieved", isPattern: true },
  ],
  hints: [
    "Spread spawns 3 bullets at player x-8, x, x+8. All vy=-16. Cooldown=4 starts frame 1, reaches 0 by frame 5. Fire is only blocked while cooldown > 0.",
    "Enemies have hp=2. First hit: hp becomes 1, flash triggers for 3 frames. Enemy survives. Second hit: hp becomes 0, cleanup removes it. Flash on a dead enemy does not matter.",
    "Grid rendering uses esprite[] directly. Flashing enemies show 'X', normal enemies show 'v', player shows 'P', bullets show '|'. Camera centers on player.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int FIXED_DT = 16;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 400;
const int VIEW_H = 400;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int flashTimer[POOL_SIZE];
char sprite[POOL_SIZE];

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;
int cooldown = 0;

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

int spawnFromPool(int px, int py, int pvx, int pvy, int php, int ptype, char psprite) {
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
    flashTimer[idx] = 0;
    sprite[idx] = psprite;
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

void flashSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (flashTimer[i] > 0) {
            flashTimer[i]--;
            if (flashTimer[i] == 0) {
                sprite[i] = (type[i] == 2) ? 'V' : sprite[i];
            }
        }
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
                flashTimer[e] = 3;
                sprite[e] = 'X';
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
    else if (a == FIRE && cooldown == 0) {
        // Spread shot: 3 bullets
        spawnFromPool(x[playerIdx] - 8, y[playerIdx], 0, -16, 1, 1, '|');
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1, '|');
        spawnFromPool(x[playerIdx] + 8, y[playerIdx], 0, -16, 1, 1, '|');
        cooldown = 4;
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
            grid[sy][sx] = sprite[i];
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
        cout << endl;
    }
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    int playerIdx = spawnFromPool(200, 300, 0, 0, 100, 0, 'P');

    spawnFromPool(120, 60, 0, 4, 2, 2, 'V');
    spawnFromPool(180, 60, 0, 4, 2, 2, 'V');
    spawnFromPool(220, 60, 0, 4, 2, 2, 'V');
    spawnFromPool(280, 60, 0, 4, 2, 2, 'V');
    int count = 5;

    string frameInputs[] = {" ", "w", " ", "w", "d", " ", "w", "w"};

    for (int frame = 1; frame <= 8; frame++) {
        processInput(frameInputs[frame - 1][0], playerIdx);
        if (POOL_SIZE - freeCount > count) count = POOL_SIZE - freeCount;

        movementSystem(count);
        boundsSystem(count);
        collisionSystem(count);
        flashSystem(count);
        cleanupSystem(count);

        if (cooldown > 0) cooldown--;

        int bullets = countByType(count, 1);
        int enemies = countByType(count, 2);
        int flashing = 0;
        for (int i = 0; i < count; i++) {
            if (alive[i] && type[i] == 2 && flashTimer[i] > 0) flashing++;
        }

        int camX = x[playerIdx] - VIEW_W / 2;
        int camY = y[playerIdx] - VIEW_H / 2;

        cout << "FRAME|" << frame << "|bullets|" << bullets
             << "|enemies_flashing|" << flashing << "|score|" << score
             << "|cooldown|" << cooldown << endl;

        if (frame == 4 || frame == 8) {
            renderSystem(count, camX, camY);
        }
    }

    cout << "MILESTONE_55|PASS|visual feel achieved" << endl;
    cout << "SCORE|" << score << endl;
    return 0;
}
`,
};
