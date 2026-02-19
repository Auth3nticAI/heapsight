import type { GameLessonVariant } from "@/types/game";

export const lesson60SpaceShooter: GameLessonVariant = {
  lessonId: "60-enemy-ai-sine",
  instructions: `# Sine Wave Enemy AI — Weaving Through the Kill Zone

Straight-line enemies are solved in one session. Sine wave enemies force the player to predict oscillation. Three enemies with 120-degree phase offsets create a braided formation — when one swings right, another swings left, and the third crosses center. The player cannot camp a single position and win.

## What Breaks Without This

Without sine motion, every enemy follows the same linear path. Players memorize it instantly. The game has zero replay value after the pattern is learned. Sine waves add unpredictability without randomness — the motion is deterministic but hard to track visually across multiple enemies.

## The Fix

Each enemy stores a phase offset. Every tick:

\\\`\\\`\\\`
x = baseX + amplitude * sin(tick * frequency + phase)
y += speed
\\\`\\\`\\\`

Three enemies at phases 0, 2.09, 4.18 (0, 120, 240 degrees) weave in a symmetric braid. The amplitude and frequency are tuning knobs — increase amplitude for wider sweeps, increase frequency for faster oscillation.

## Your Task

1. 3 sine-wave enemies, baseX=200, starting y=10, speed=4, amplitude=40, frequency=0.5
2. Phase offsets: 0.0, 2.09, 4.18
3. Player at (180, 300), bullet pool, standard collision
4. Run 8 ticks of simulation
5. Each tick: update enemy positions with sine wave, move bullets, check collisions
6. Print per enemy per tick: \\\`SINE|tick|<t>|enemy_<i>|x|<x>|y|<y>|phase|<phase>\\\`
7. Print: \\\`SINE_SUMMARY|enemies|3|ticks|8|amplitude|40|frequency|0.5\\\`
8. Print: \\\`FRAME|<n>|enemies|<alive>|bullets|<count>|score|<s>\\\`

## Beginner Trap

**Common Mistake:** Using degrees instead of radians. C++ sin() takes radians. 120 degrees is 2.09 radians, not 120. If you pass 120 to sin(), you get garbage oscillation with a period of ~360 ticks instead of ~12.

## Elite Insight

Layer sine waves for complex motion. \\\`x = A1*sin(f1*t) + A2*sin(f2*t)\\\` gives Lissajous-like patterns. Bosses in bullet-hell games use summed sine waves for multi-frequency oscillation. The math scales — add terms, not code.

## Cross-Path Echo

Signal processing is sine waves all the way down. Audio synthesis, radio transmission, image compression (DCT in JPEG) — they all decompose signals into sine components. Fourier proved any periodic motion can be built from sine waves. Your enemy AI uses the same math as an MP3 encoder.`,
  starterCode: `#include <iostream>
#include <cmath>
using namespace std;

const int POOL_SIZE = 20;
int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;

// TODO: Write spawnEntity(px, py, pvx, pvy, php, ptype)

// TODO: Write sineWaveSystem(tick) — for each alive enemy (type==2):
//       x[i] = 200 + (int)(40 * sin(tick * 0.5 + phase[i]))
//       y[i] += 4

// TODO: Write movementSystem() — apply vx/vy to non-enemy alive entities

// TODO: Write collisionSystem() — bullet(type=1) vs enemy(type=2)

// TODO: Write cleanupSystem()

int main() {
    double phase[] = {0.0, 2.09, 4.18};

    // TODO: Spawn player at (180, 300), type=0
    // TODO: Spawn 3 enemies at (200, 10), type=2

    // TODO: Run 8 ticks
    //   Update sine wave positions
    //   Print SINE lines per enemy
    //   Print FRAME line per tick

    // TODO: Print SINE_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

const int POOL_SIZE = 20;
int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;

double enemyPhase[3] = {0.0, 2.09, 4.18};

void spawnEntity(int px, int py, int pvx, int pvy, int php, int ptype) {
    x[entityCount] = px;
    y[entityCount] = py;
    vx[entityCount] = pvx;
    vy[entityCount] = pvy;
    hp[entityCount] = php;
    etype[entityCount] = ptype;
    alive[entityCount] = true;
    entityCount++;
}

void sineWaveSystem(int tick) {
    int ei = 0;
    for (int i = 0; i < entityCount; i++) {
        if (!alive[i] || etype[i] != 2) continue;
        x[i] = 200 + (int)(40 * sin(tick * 0.5 + enemyPhase[ei]));
        y[i] += 4;
        ei++;
    }
}

void movementSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!alive[i] || etype[i] == 2) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void collisionSystem() {
    for (int b = 0; b < entityCount; b++) {
        if (!alive[b] || etype[b] != 1) continue;
        for (int e = 0; e < entityCount; e++) {
            if (!alive[e] || etype[e] != 2) continue;
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
    spawnEntity(180, 300, 0, 0, 100, 0);  // player
    spawnEntity(200, 10, 0, 0, 1, 2);     // enemy 0
    spawnEntity(200, 10, 0, 0, 1, 2);     // enemy 1
    spawnEntity(200, 10, 0, 0, 1, 2);     // enemy 2

    for (int t = 1; t <= 8; t++) {
        sineWaveSystem(t);
        movementSystem();
        collisionSystem();
        cleanupSystem();

        int ei = 0;
        for (int i = 0; i < entityCount; i++) {
            if (!alive[i] || etype[i] != 2) continue;
            cout << "SINE|tick|" << t << "|enemy_" << ei
                 << "|x|" << x[i] << "|y|" << y[i]
                 << "|phase|" << enemyPhase[ei] << endl;
            ei++;
        }

        int enemyCount = 0, bulletCount = 0;
        for (int i = 0; i < entityCount; i++) {
            if (!alive[i]) continue;
            if (etype[i] == 2) enemyCount++;
            if (etype[i] == 1) bulletCount++;
        }

        cout << "FRAME|" << t << "|enemies|" << enemyCount
             << "|bullets|" << bulletCount
             << "|score|" << score << endl;
    }

    cout << "SINE_SUMMARY|enemies|3|ticks|8|amplitude|40|frequency|0.5" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Tick 1 enemy 0 sine wave position", expectedOutput: "SINE\\|tick\\|1\\|enemy_0\\|x\\|\\d+\\|y\\|14\\|phase\\|0", isPattern: true },
    { id: "g2", description: "Tick 1 enemy 1 phase offset", expectedOutput: "SINE\\|tick\\|1\\|enemy_1\\|x\\|\\d+\\|y\\|14\\|phase\\|2\\.09", isPattern: true },
    { id: "g3", description: "Tick 1 enemy 2 phase offset", expectedOutput: "SINE\\|tick\\|1\\|enemy_2\\|x\\|\\d+\\|y\\|14\\|phase\\|4\\.18", isPattern: true },
    { id: "g4", description: "Frame output per tick", expectedOutput: "FRAME\\|\\d+\\|enemies\\|\\d+\\|bullets\\|\\d+\\|score\\|\\d+", isPattern: true },
    { id: "g5", description: "All 8 ticks complete", expectedOutput: "SINE\\|tick\\|8\\|enemy_\\d+\\|x\\|\\d+\\|y\\|42\\|phase\\|", isPattern: true },
    { id: "g6", description: "Summary line", expectedOutput: "SINE_SUMMARY\\|enemies\\|3\\|ticks\\|8\\|amplitude\\|40\\|frequency\\|0\\.5", isPattern: true },
  ],
  hints: [
    "The sineWaveSystem must track which enemy index maps to which phase. Use a separate counter (ei) that increments only for alive type-2 entities. Enemy 0 gets phase[0], enemy 1 gets phase[1], etc.",
    "Enemies use sine for x-position, not vx. Set x[i] directly each tick: x[i] = 200 + (int)(40 * sin(t * 0.5 + phase)). The y position increments by 4 each tick independently.",
    "movementSystem should skip type-2 entities since their position is controlled by sineWaveSystem. Only move bullets (type=1) and other non-enemy entities with vx/vy.",
  ],
  accumulatedCode: `#include <iostream>
#include <cmath>
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

double enemyPhase[10];
int enemyPhaseCount = 0;

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

void sineWaveSystem(int count, int tick) {
    int ei = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        if (ei < enemyPhaseCount) {
            x[i] = 200 + (int)(40 * sin(tick * 0.5 + enemyPhase[ei]));
            y[i] += 4;
        }
        ei++;
    }
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] == 2) continue;
        x[i] += vx[i];
        y[i] += vy[i];
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

    // Wave 1: sine wave enemies
    double phases[] = {0.0, 2.09, 4.18};
    for (int i = 0; i < 3; i++) {
        spawnFromPool(200, 10, 0, 0, 1, 2);
        enemyPhase[enemyPhaseCount++] = phases[i];
    }
    int count = entityCount;

    for (int t = 1; t <= 8; t++) {
        sineWaveSystem(count, t);
        movementSystem(count);
        collisionSystem(count);
        cleanupSystem(count);

        int ei = 0;
        for (int i = 0; i < count; i++) {
            if (!alive[i] || type[i] != 2) continue;
            cout << "SINE|tick|" << t << "|enemy_" << ei
                 << "|x|" << x[i] << "|y|" << y[i]
                 << "|phase|" << enemyPhase[ei] << endl;
            ei++;
        }

        int enemies = countByType(count, 2);
        int bullets = countByType(count, 1);
        cout << "FRAME|" << t << "|enemies|" << enemies
             << "|bullets|" << bullets
             << "|score|" << score << endl;
    }

    cout << "SINE_SUMMARY|enemies|3|ticks|8|amplitude|40|frequency|0.5" << endl;
    return 0;
}
`,
};
