import type { GameLessonVariant } from "@/types/game";

export const lesson83SpaceShooter: GameLessonVariant = {
  lessonId: "83-trail-effects",
  instructions: `# Game Builder: Trail Effects — Ring Buffer Position History

Wire trail rendering into the bullet system. Every bullet carries a ring buffer of its last 4 positions. Each frame, the current position is pushed into the buffer before movement. The renderer draws the bullet at its current position and the trail behind it with fading characters. Bullets become streaks. Motion becomes visible.

## What Breaks Without This

Without trails, fast bullets are single pixels that teleport across the screen. The player cannot track them. They cannot see their own fire. In a fast shooter, bullet visibility is critical for aiming feedback. Trails solve this without slowing the bullets down.

## The Fix

Attach a TrailBuffer to each bullet entity. In the movement system, push the current position into the trail before updating position. In the render system, draw the trail by reading backward from the ring buffer head. Each older position gets a dimmer character.

\\\`\\\`\\\`
// Before move: addTrailPoint(bullet.trail, bullet.x, bullet.y)
// After move: bullet.y += bullet.vy
// Render: '|' at current, ':' at trail[0], '.' at trail[1]
\\\`\\\`\\\`

## Your Task

1. TrailBuffer with posX[4], posY[4], head, length
2. Each bullet gets a TrailBuffer initialized on spawn
3. Each frame: store current position, advance head, then move bullet
4. Render: '|' at current, ':' at most recent trail, '.' at next
5. 2 bullets moving upward for 5 frames
6. Print: \\\`TRAIL|frame|3|bullet_0|pos|(200,292)|trail|(:,200,296)(.,200,300)\\\`
7. Print: \\\`TRAIL|frame|5|bullet_0|pos|(200,284)|trail|(:,200,288)(.,200,292)\\\`
8. Print: \\\`TRAIL_SUMMARY|bullets_tracked|2|trail_length|3|chars|:|.|space\\\`

## Beginner Trap

**Common Mistake:** Storing the position after movement instead of before. The trail should show where the bullet WAS, not where it IS. Store current position in the trail, then move. If you move first, the trail shows the same position as the bullet — no visual separation.

## Elite Insight

Trail length is a visual design parameter. Short trails (2-3 frames) look like fast dashes. Long trails (8-10 frames) look like laser beams. The ring buffer capacity should match the desired visual length. For gameplay clarity, shorter is usually better — long trails can obscure enemies behind them.

## Cross-Path Echo

Browser history is a trail buffer. Each page visit pushes the URL onto the stack. The back button reads backward through the history. The trail length is limited by memory settings. Old entries are discarded. The rendering difference: browsers show one entry at a time, your trail shows all entries simultaneously.`,
  starterCode: `#include <iostream>
using namespace std;

const int TRAIL_SIZE = 4;
const int MAX_BULLETS = 8;

struct TrailBuffer {
    int posX[TRAIL_SIZE];
    int posY[TRAIL_SIZE];
    int head;
    int length;
};

struct Bullet {
    int x, y;
    int bvx, bvy;
    bool active;
    TrailBuffer trail;
};

Bullet bullets[MAX_BULLETS];
int bulletCount = 0;

// TODO: Write initTrail(TrailBuffer &t)

// TODO: Write addTrailPoint(TrailBuffer &t, int x, int y)
//   Store at head, advance head = (head+1) % TRAIL_SIZE

// TODO: Write spawnBullet(x, y, bvx, bvy)

// TODO: Write updateBullets()
//   addTrailPoint before moving

// TODO: Write printTrail(frame, bulletIdx)

int main() {
    // TODO: Spawn 2 bullets
    // TODO: Simulate 5 frames
    // TODO: Print TRAIL_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int TRAIL_SIZE = 4;
const int MAX_BULLETS = 8;

struct TrailBuffer {
    int posX[TRAIL_SIZE];
    int posY[TRAIL_SIZE];
    int head;
    int length;
};

struct Bullet {
    int x, y;
    int bvx, bvy;
    bool active;
    TrailBuffer trail;
};

Bullet bullets[MAX_BULLETS];
int bulletCount = 0;

void initTrail(TrailBuffer &t) {
    t.head = 0;
    t.length = 0;
}

void addTrailPoint(TrailBuffer &t, int tx, int ty) {
    t.posX[t.head] = tx;
    t.posY[t.head] = ty;
    t.head = (t.head + 1) % TRAIL_SIZE;
    if (t.length < TRAIL_SIZE) t.length++;
}

void spawnBullet(int sx, int sy, int svx, int svy) {
    Bullet &b = bullets[bulletCount];
    b.x = sx;
    b.y = sy;
    b.bvx = svx;
    b.bvy = svy;
    b.active = true;
    initTrail(b.trail);
    bulletCount++;
}

void updateBullets() {
    for (int i = 0; i < bulletCount; i++) {
        if (!bullets[i].active) continue;
        addTrailPoint(bullets[i].trail, bullets[i].x, bullets[i].y);
        bullets[i].x += bullets[i].bvx;
        bullets[i].y += bullets[i].bvy;
    }
}

void printTrail(int frame, int idx) {
    Bullet &b = bullets[idx];
    cout << "TRAIL|frame|" << frame << "|bullet_" << idx
         << "|pos|(" << b.x << "," << b.y << ")|trail|";

    char trailChars[] = {':', '.', ' '};
    int trailLen = b.trail.length;

    if (trailLen == 0) {
        cout << "none" << endl;
        return;
    }

    bool first = true;
    int maxShow = (trailLen < 3) ? trailLen : 3;
    for (int t = 0; t < maxShow; t++) {
        int idx2 = (b.trail.head - 1 - t + TRAIL_SIZE) % TRAIL_SIZE;
        char ch = trailChars[t];
        if (ch == ' ') continue;
        if (!first) cout << "";
        cout << "(" << ch << "," << b.trail.posX[idx2] << "," << b.trail.posY[idx2] << ")";
        first = false;
    }
    cout << endl;
}

int main() {
    spawnBullet(200, 300, 0, -4);
    spawnBullet(160, 300, 0, -4);

    for (int frame = 1; frame <= 5; frame++) {
        updateBullets();
        printTrail(frame, 0);
        printTrail(frame, 1);
    }

    cout << "TRAIL_SUMMARY|bullets_tracked|" << bulletCount
         << "|trail_length|3|chars|:|.|space" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 3 bullet_0 trail", expectedOutput: "TRAIL\\|frame\\|3\\|bullet_0\\|pos\\|\\(200,292\\)\\|trail\\|\\(:,200,296\\)\\(\\.,200,300\\)", isPattern: true },
    { id: "g2", description: "Frame 5 bullet_0 trail", expectedOutput: "TRAIL\\|frame\\|5\\|bullet_0\\|pos\\|\\(200,284\\)\\|trail\\|\\(:,200,288\\)\\(\\.,200,292\\)", isPattern: true },
    { id: "g3", description: "Frame 5 bullet_1 trail", expectedOutput: "TRAIL\\|frame\\|5\\|bullet_1\\|pos\\|\\(160,284\\)\\|trail\\|\\(:,160,288\\)\\(\\.,160,292\\)", isPattern: true },
    { id: "g4", description: "Trail summary", expectedOutput: "TRAIL_SUMMARY\\|bullets_tracked\\|2\\|trail_length\\|3\\|chars\\|:\\|\\.|space", isPattern: true },
  ],
  hints: [
    "addTrailPoint stores the current position BEFORE the bullet moves. On frame 1, trail stores (200,300), then bullet moves to (200,296). The trail shows where the bullet was one frame ago.",
    "Ring buffer index math: (head - 1 - t + TRAIL_SIZE) % TRAIL_SIZE. t=0 gives the most recent trail point (char ':'). t=1 gives the next older point (char '.'). The modulo handles the wrap-around.",
    "Trail length grows from 0 to TRAIL_SIZE as points are added. On frame 1, length=1 (one trail point). On frame 2, length=2. By frame 4+, length is capped at TRAIL_SIZE=4. Only show up to 3 trail characters (skip space).",
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
const int TRAIL_SIZE = 4;

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

// Trail system
struct TrailBuffer {
    int posX[TRAIL_SIZE];
    int posY[TRAIL_SIZE];
    int head;
    int length;
};

void initTrail(TrailBuffer &t) {
    t.head = 0;
    t.length = 0;
}

void addTrailPoint(TrailBuffer &t, int tx, int ty) {
    t.posX[t.head] = tx;
    t.posY[t.head] = ty;
    t.head = (t.head + 1) % TRAIL_SIZE;
    if (t.length < TRAIL_SIZE) t.length++;
}

// Trail buffers for entity pool bullets
TrailBuffer entityTrails[POOL_SIZE];

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
    if (stype == 1) initTrail(entityTrails[idx]);
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
        if (type[i] == 1) {
            addTrailPoint(entityTrails[i], x[i], y[i]);
        }
        if (type[i] == 2) continue;
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

    // Render trails for bullets
    char trailFade[] = {':', '.', ' '};
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 1) continue;
        TrailBuffer &t = entityTrails[i];
        int maxShow = (t.length < 3) ? t.length : 3;
        for (int tr = 0; tr < maxShow; tr++) {
            int tidx = (t.head - 1 - tr + TRAIL_SIZE) % TRAIL_SIZE;
            char tch = trailFade[tr];
            if (tch == ' ') continue;
            int scrX = worldToScreenX(t.posX[tidx], camX);
            int scrY = worldToScreenY(t.posY[tidx], camY);
            if (scrX >= 0 && scrX < SCREEN_W && scrY >= 0 && scrY < SCREEN_H) {
                grid[scrY][scrX] = tch;
            }
        }
    }

    // Render entities
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
        initTrail(entityTrails[i]);
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
    // Trail effect standalone demo
    const int TB_MAX = 8;
    struct DemoBullet {
        int bx, by, bvx, bvy;
        bool active;
        TrailBuffer trail;
    };

    DemoBullet demoBullets[TB_MAX];
    int demoBulletCount = 0;

    auto spawnDemo = [&](int sx, int sy, int svx, int svy) {
        DemoBullet &b = demoBullets[demoBulletCount];
        b.bx = sx; b.by = sy; b.bvx = svx; b.bvy = svy;
        b.active = true;
        initTrail(b.trail);
        demoBulletCount++;
    };

    spawnDemo(200, 300, 0, -4);
    spawnDemo(160, 300, 0, -4);

    char trailCharsDemo[] = {':', '.', ' '};

    for (int frame = 1; frame <= 5; frame++) {
        // Update: store trail, then move
        for (int i = 0; i < demoBulletCount; i++) {
            if (!demoBullets[i].active) continue;
            addTrailPoint(demoBullets[i].trail, demoBullets[i].bx, demoBullets[i].by);
            demoBullets[i].bx += demoBullets[i].bvx;
            demoBullets[i].by += demoBullets[i].bvy;
        }

        // Print trail info
        for (int i = 0; i < demoBulletCount; i++) {
            DemoBullet &b = demoBullets[i];
            cout << "TRAIL|frame|" << frame << "|bullet_" << i
                 << "|pos|(" << b.bx << "," << b.by << ")|trail|";

            int trailLen = b.trail.length;
            if (trailLen == 0) {
                cout << "none" << endl;
                continue;
            }

            bool first = true;
            int maxShow = (trailLen < 3) ? trailLen : 3;
            for (int t = 0; t < maxShow; t++) {
                int tidx = (b.trail.head - 1 - t + TRAIL_SIZE) % TRAIL_SIZE;
                char ch = trailCharsDemo[t];
                if (ch == ' ') continue;
                cout << "(" << ch << "," << b.trail.posX[tidx] << "," << b.trail.posY[tidx] << ")";
                first = false;
            }
            cout << endl;
        }
    }

    cout << "TRAIL_SUMMARY|bullets_tracked|" << demoBulletCount
         << "|trail_length|3|chars|:|.|space" << endl;

    return 0;
}
`,
};
