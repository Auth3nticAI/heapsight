import type { GameLessonVariant } from "@/types/game";

export const lesson82SpaceShooter: GameLessonVariant = {
  lessonId: "82-particles",
  instructions: `# Game Builder: Explosion Particles — Visual Death Feedback

Wire particles into the game's death system. When an enemy dies, spawn an explosion at its position. The particles fly outward for a few frames, cycling through display characters. The player sees a burst of fragments where the enemy was. This is the visual proof of destruction.

## What Breaks Without This

Without death particles, the game provides no spatial feedback for kills. In a fast-moving shooter, knowing where kills happened helps the player track combat flow. Particles mark kill locations like tracer rounds — brief, bright, informative.

## The Fix

In the collision system, when an enemy's HP drops to zero, call spawnExplosion at the enemy's position. The particle system runs in the update loop alongside movement, collision, and cleanup. Particles have no collision — they are purely visual.

\\\`\\\`\\\`
// In collision: if (hp[e] <= 0) spawnExplosion(x[e], y[e], 8);
// In update: updateParticles() — move and age all active particles
// In render: draw active particles using their char
\\\`\\\`\\\`

## Your Task

1. Particle struct with x, y, vx, vy, lifetime, ch, active
2. Pool of 32 particles, all initially inactive
3. spawnExplosion(x, y, 8): random velocities, lifetime=4, cycling chars
4. Kill enemy at (200,80) on frame 1: spawn 8 particles
5. Simulate 4 frames: move, age, deactivate dead particles
6. Print: \\\`PARTICLE|spawn|frame|1|count|8|at|(200,80)\\\`
7. Print frame 2 particles: \\\`PARTICLE|frame|2|id|p0|pos|(<x>,<y>)|life|3|char|*\\\`
8. Print: \\\`PARTICLE|frame|4|alive|<n>|dead|<n>|total_spawned|8\\\`
9. Print: \\\`PARTICLE_SUMMARY|explosions|1|particles_spawned|8|peak_active|8\\\`

## Beginner Trap

**Common Mistake:** Not cycling the particle characters. All particles showing '*' looks like a blob. Cycling through '*', '+', '.', 'o' gives visual variety even in ASCII. Each particle gets a character based on its spawn index mod 4.

## Elite Insight

The particle count per explosion is a tuning parameter, not a design constant. 4 particles feels sparse. 8 feels solid. 16 feels heavy. 32 feels explosive. The engine should handle any count — the designer picks the number. Your pool size (32) limits the total active particles, not the per-explosion count. If two enemies die simultaneously, both explosions share the pool.

## Cross-Path Echo

Event-driven architectures spawn handlers the same way. An event fires. N handlers activate. Each handler processes independently and terminates when done. The event bus is the particle pool. Dead handlers free their resources. The pattern is identical: burst creation, independent processing, automatic cleanup.`,
  starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_PARTICLES = 32;

struct Particle {
    int x, y;
    int vx, vy;
    int lifetime;
    char ch;
    bool active;
};

Particle particles[MAX_PARTICLES];
int totalSpawned = 0;
int explosionCount = 0;
int peakActive = 0;

char particleChars[] = {'*', '+', '.', 'o'};

// TODO: Write spawnExplosion(cx, cy, count)
//   Find inactive slots, set random velocity and lifetime

// TODO: Write updateParticles()
//   Move, decrement lifetime, deactivate dead

// TODO: Write countActive()

int main() {
    srand(42);

    for (int i = 0; i < MAX_PARTICLES; i++) {
        particles[i].active = false;
    }

    // TODO: Frame 1: spawn explosion at (200, 80)
    // TODO: Frames 2-4: update and print particle status
    // TODO: Print PARTICLE_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_PARTICLES = 32;

struct Particle {
    int x, y;
    int vx, vy;
    int lifetime;
    char ch;
    bool active;
};

Particle particles[MAX_PARTICLES];
int totalSpawned = 0;
int explosionCount = 0;
int peakActive = 0;

char particleChars[] = {'*', '+', '.', 'o'};

void spawnExplosion(int cx, int cy, int count) {
    int spawned = 0;
    for (int i = 0; i < MAX_PARTICLES && spawned < count; i++) {
        if (!particles[i].active) {
            particles[i].x = cx;
            particles[i].y = cy;
            particles[i].vx = (rand() % 7) - 3;
            particles[i].vy = (rand() % 7) - 3;
            particles[i].lifetime = 4;
            particles[i].ch = particleChars[spawned % 4];
            particles[i].active = true;
            spawned++;
            totalSpawned++;
        }
    }
    explosionCount++;
}

void updateParticles() {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (!particles[i].active) continue;
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].lifetime--;
        if (particles[i].lifetime <= 0) {
            particles[i].active = false;
        }
    }
}

int countActive() {
    int c = 0;
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (particles[i].active) c++;
    }
    if (c > peakActive) peakActive = c;
    return c;
}

int main() {
    srand(42);

    for (int i = 0; i < MAX_PARTICLES; i++) {
        particles[i].active = false;
    }

    // Frame 1: spawn explosion
    spawnExplosion(200, 80, 8);
    int active = countActive();
    cout << "PARTICLE|spawn|frame|1|count|8|at|(200,80)" << endl;

    // Frames 2-4: simulate
    for (int frame = 2; frame <= 4; frame++) {
        updateParticles();
        active = countActive();

        if (frame == 2) {
            int pid = 0;
            for (int i = 0; i < MAX_PARTICLES; i++) {
                if (!particles[i].active) continue;
                cout << "PARTICLE|frame|2|id|p" << pid
                     << "|pos|(" << particles[i].x << "," << particles[i].y
                     << ")|life|" << particles[i].lifetime
                     << "|char|" << particles[i].ch << endl;
                pid++;
            }
        }

        if (frame == 4) {
            int dead = totalSpawned - active;
            cout << "PARTICLE|frame|4|alive|" << active
                 << "|dead|" << dead
                 << "|total_spawned|" << totalSpawned << endl;
        }
    }

    cout << "PARTICLE_SUMMARY|explosions|" << explosionCount
         << "|particles_spawned|" << totalSpawned
         << "|peak_active|" << peakActive << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Explosion spawned", expectedOutput: "PARTICLE\\|spawn\\|frame\\|1\\|count\\|8\\|at\\|\\(200,80\\)", isPattern: true },
    { id: "g2", description: "Frame 2 particle p0", expectedOutput: "PARTICLE\\|frame\\|2\\|id\\|p0\\|pos\\|\\(-?\\d+,-?\\d+\\)\\|life\\|3\\|char\\|\\*", isPattern: true },
    { id: "g3", description: "Frame 4 status", expectedOutput: "PARTICLE\\|frame\\|4\\|alive\\|\\d+\\|dead\\|\\d+\\|total_spawned\\|8", isPattern: true },
    { id: "g4", description: "Particle summary", expectedOutput: "PARTICLE_SUMMARY\\|explosions\\|1\\|particles_spawned\\|8\\|peak_active\\|8", isPattern: true },
  ],
  hints: [
    "spawnExplosion iterates the pool looking for inactive slots. Set each particle's position to (cx,cy), random velocity with (rand()%7)-3 for both vx and vy, lifetime=4, and cycling character. Count spawned to stop at the requested count.",
    "updateParticles processes every active particle: add velocity to position, decrement lifetime. If lifetime <= 0, set active=false. After one update, lifetime goes from 4 to 3. After four updates, lifetime is 0 and particle deactivates.",
    "countActive loops through the pool counting active particles. Update peakActive if the current count exceeds it. Peak should be 8 since all particles spawn at once on frame 1.",
  ],
  accumulatedCode: `#include <iostream>
#include <cstdlib>
#include <cmath>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int FIXED_DT = 16;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;
const int MAX_PARTICLES = 32;

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
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK };

int aiPattern[POOL_SIZE];

// Screen shake
int shakeIntensity = 0;
int maxShakeIntensity = 0;
int shakeTriggersCount = 0;

void triggerShake(int intensity) {
    shakeIntensity = intensity;
    if (intensity > maxShakeIntensity) maxShakeIntensity = intensity;
    shakeTriggersCount++;
}

void computeShake(int &shakeX, int &shakeY) {
    if (shakeIntensity > 0) {
        shakeX = (rand() % (shakeIntensity * 2 + 1)) - shakeIntensity;
        shakeY = (rand() % (shakeIntensity * 2 + 1)) - shakeIntensity;
    } else {
        shakeX = 0;
        shakeY = 0;
    }
}

void decayShake() {
    shakeIntensity = (int)(shakeIntensity * 0.7);
}

// Particle system
struct Particle {
    int px, py;
    int pvx, pvy;
    int lifetime;
    char ch;
    bool active;
};

Particle particles[MAX_PARTICLES];
int totalParticlesSpawned = 0;
int explosionCount = 0;
int peakActiveParticles = 0;

char particleChars[] = {'*', '+', '.', 'o'};

void spawnExplosion(int cx, int cy, int count) {
    int spawned = 0;
    for (int i = 0; i < MAX_PARTICLES && spawned < count; i++) {
        if (!particles[i].active) {
            particles[i].px = cx;
            particles[i].py = cy;
            particles[i].pvx = (rand() % 7) - 3;
            particles[i].pvy = (rand() % 7) - 3;
            particles[i].lifetime = 4;
            particles[i].ch = particleChars[spawned % 4];
            particles[i].active = true;
            spawned++;
            totalParticlesSpawned++;
        }
    }
    explosionCount++;
}

void updateParticles() {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (!particles[i].active) continue;
        particles[i].px += particles[i].pvx;
        particles[i].py += particles[i].pvy;
        particles[i].lifetime--;
        if (particles[i].lifetime <= 0) {
            particles[i].active = false;
        }
    }
}

int countActiveParticles() {
    int c = 0;
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (particles[i].active) c++;
    }
    if (c > peakActiveParticles) peakActiveParticles = c;
    return c;
}

struct WaveConfig {
    int enemyCount;
    string enemyType;
    string bossName;
};

struct BossVariant {
    string name;
    int bossHp;
    string pattern;
};

int playerSpeed = 4;
int playerDamage = 10;
int bulletCount = 0;

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

int spawnFromPool(int spx, int spy, int svx, int svy, int shp, int stype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = spx;
    y[idx] = spy;
    vx[idx] = svx;
    vy[idx] = svy;
    hp[idx] = shp;
    type[idx] = stype;
    alive[idx] = true;
    aiPattern[idx] = AI_LINEAR;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
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
        if (type[i] == 1 && y[i] < -50) alive[i] = false;
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
                hp[e] -= playerDamage;
                if (hp[e] <= 0) {
                    triggerShake(4);
                    spawnExplosion(x[e], y[e], 8);
                }
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
    if (a == MOVE_UP) y[playerIdx] -= playerSpeed;
    else if (a == MOVE_DOWN) y[playerIdx] += playerSpeed;
    else if (a == MOVE_LEFT) x[playerIdx] -= playerSpeed;
    else if (a == MOVE_RIGHT) x[playerIdx] += playerSpeed;
    else if (a == FIRE) {
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1);
        bulletCount++;
    }
}

void renderSystem(int count, int camX, int camY) {
    int sx = 0, sy = 0;
    computeShake(sx, sy);
    camX += sx;
    camY += sy;

    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int scrX = worldToScreenX(x[i], camX);
        int scrY = worldToScreenY(y[i], camY);
        if (scrX >= 0 && scrX < SCREEN_W && scrY >= 0 && scrY < SCREEN_H) {
            if (type[i] == 0) grid[scrY][scrX] = 'P';
            else if (type[i] == 1) grid[scrY][scrX] = '|';
            else if (type[i] == 2) grid[scrY][scrX] = 'V';
        }
    }

    // Render particles
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (!particles[i].active) continue;
        int scrX = worldToScreenX(particles[i].px, camX);
        int scrY = worldToScreenY(particles[i].py, camY);
        if (scrX >= 0 && scrX < SCREEN_W && scrY >= 0 && scrY < SCREEN_H) {
            grid[scrY][scrX] = particles[i].ch;
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
        cout << endl;
    }

    decayShake();
}

void initFullState() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }
    for (int i = 0; i < MAX_PARTICLES; i++) {
        particles[i].active = false;
    }
    freeCount = POOL_SIZE;
    entityCount = 0;
    score = 0;
    kills = 0;
    wave = 1;
    bulletCount = 0;
    playerSpeed = 4;
    playerDamage = 10;
    shakeIntensity = 0;
    maxShakeIntensity = 0;
    shakeTriggersCount = 0;
    totalParticlesSpawned = 0;
    explosionCount = 0;
    peakActiveParticles = 0;
    srand(42);
}

int main() {
    srand(42);

    for (int i = 0; i < MAX_PARTICLES; i++) {
        particles[i].active = false;
    }

    // Frame 1: spawn explosion
    spawnExplosion(200, 80, 8);
    int active = countActiveParticles();
    cout << "PARTICLE|spawn|frame|1|count|8|at|(200,80)" << endl;

    // Frames 2-4: simulate
    for (int frame = 2; frame <= 4; frame++) {
        updateParticles();
        active = countActiveParticles();

        if (frame == 2) {
            int pid = 0;
            for (int i = 0; i < MAX_PARTICLES; i++) {
                if (!particles[i].active) continue;
                cout << "PARTICLE|frame|2|id|p" << pid
                     << "|pos|(" << particles[i].px << "," << particles[i].py
                     << ")|life|" << particles[i].lifetime
                     << "|char|" << particles[i].ch << endl;
                pid++;
            }
        }

        if (frame == 4) {
            int dead = totalParticlesSpawned - active;
            cout << "PARTICLE|frame|4|alive|" << active
                 << "|dead|" << dead
                 << "|total_spawned|" << totalParticlesSpawned << endl;
        }
    }

    cout << "PARTICLE_SUMMARY|explosions|" << explosionCount
         << "|particles_spawned|" << totalParticlesSpawned
         << "|peak_active|" << peakActiveParticles << endl;

    return 0;
}
`,
};
