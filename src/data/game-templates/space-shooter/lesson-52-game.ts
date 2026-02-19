import type { GameLessonVariant } from "@/types/game";

export const lesson52SpaceShooter: GameLessonVariant = {
  lessonId: "52-fire-rate",
  instructions: `# Fire Rate Cooldowns — Bullet Spam Kills Performance

Unlimited fire fills the entity pool in under a second. Every bullet needs collision checks against every enemy. N bullets times M enemies is O(N*M) per frame. At 60 bullets per second, the collision system chokes in 10 frames. Cooldowns are not a design luxury. They are a performance constraint disguised as game feel.

## What Breaks Without This

Without cooldowns, the pool fills. Collision becomes quadratic over hundreds of entities. Frame time spikes. The game stutters. Even if performance held, unlimited fire trivializes the game. The player holds space and everything dies. Cooldowns force the player to time shots, creating the skill gap that makes the game worth playing.

## The Fix

\\\`\\\`\\\`
struct WeaponState {
    int cooldownMax;    // ticks between shots
    int cooldownCurrent; // ticks remaining
    int fireCount;       // total shots fired
};
\\\`\\\`\\\`

Each tick: decrement cooldownCurrent. If <= 0 and fire requested: spawn bullet, reset cooldown. Otherwise: block. Three lines of logic. Zero allocations. Total control over weapon feel.

## Your Task

1. Pool: 20 entity slots. SoA: x, y, vx, vy, hp, type, alive
2. Player at (180, 300), type=0, hp=100
3. WeaponState: cooldownMax=4, cooldownCurrent=0, fireCount=0
4. 2 enemies at x=160,200 y=60 vy=4 hp=1 type=2
5. Simulate 15 ticks. Player attempts to fire every tick
6. cooldownSystem: if cooldownCurrent > 0, decrement. Fire only when cooldownCurrent <= 0
7. On successful fire: spawn bullet at player pos with vy=-8, set cooldownCurrent = cooldownMax
8. Run movementSystem and collisionSystem each tick
9. Print per tick: \\\`FIRE|tick|<t>|success|bullet_<n>\\\` or \\\`FIRE|tick|<t>|blocked|cooldown|<c>\\\`
10. Print every 5 ticks: \\\`STATUS|tick|<t>|entities|<count>|bullets|<b>|enemies|<e>|score|<s>\\\`
11. Print: \\\`COOLDOWN_SUMMARY|attempts|15|fired|<n>|blocked|<b>|rate|<r>\\\`
12. Print: \\\`FIRE_RATE|PASS|cooldown system operational\\\`

## Beginner Trap

**Common Mistake:** Decrementing the cooldown AFTER checking fire. This off-by-one lets the weapon fire one tick early. The cooldown on tick 2 should be 3 after decrement, not 4 before decrement. Always: decrement first, then check. The order is the contract.

## Elite Insight

Weapon feel in shipped games comes down to three numbers: cooldown, projectile speed, and damage. Tweak cooldown by 1 frame and players notice. Fighting games publish frame data for exactly this reason. Your cooldownMax integer is a design parameter, not an engineering constant. Expose it to designers. Let them tune it without recompiling.

## Cross-Path Echo

API rate limiting is the same state machine. A server tracks requests per client per window. When the limit is hit, requests are rejected with a 429 status and a Retry-After header. The client waits for the cooldown to expire. Same pattern: attempt, check counter, allow or block, decrement timer. Your weapon cooldown is an HTTP rate limiter at 60Hz.`,
  starterCode: `#include <iostream>
#include <iomanip>
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

int cooldownMax = 4;
int cooldownCurrent = 0;
int fireCount = 0;
int blocked = 0;

// TODO: Write spawnEntity(px, py, pvx, pvy, php, ptype)

// TODO: Write movementSystem() — apply vx/vy to alive entities

// TODO: Write collisionSystem() — bullet(type=1) vs enemy(type=2)
//       If |dx|<18 && |dy|<18: bullet hp=0, enemy hp--, score+=100, kills++

// TODO: Write cleanupSystem() — alive=false if hp<=0

int main() {
    // TODO: Spawn player at (180,300) type=0 hp=100
    // TODO: Spawn 2 enemies at x=160,200 y=60 vy=4 hp=1 type=2

    // TODO: Run 15 ticks
    //   Each tick: decrement cooldown, attempt fire, move, collide, cleanup
    //   Print FIRE success or blocked
    //   Print STATUS every 5 ticks

    // TODO: Print COOLDOWN_SUMMARY and FIRE_RATE lines

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <iomanip>
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

int cooldownMax = 4;
int cooldownCurrent = 0;
int fireCount = 0;
int blocked = 0;

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

int main() {
    spawnEntity(180, 300, 0, 0, 100, 0);

    spawnEntity(160, 60, 0, 4, 1, 2);
    spawnEntity(200, 60, 0, 4, 1, 2);

    for (int tick = 1; tick <= 15; tick++) {
        if (cooldownCurrent > 0) {
            cooldownCurrent--;
        }

        if (cooldownCurrent <= 0) {
            cout << "FIRE|tick|" << tick << "|success|bullet_" << fireCount << endl;
            spawnEntity(x[0], y[0], 0, -8, 1, 1);
            cooldownCurrent = cooldownMax;
            fireCount++;
        } else {
            cout << "FIRE|tick|" << tick << "|blocked|cooldown|" << cooldownCurrent << endl;
            blocked++;
        }

        movementSystem();
        collisionSystem();
        cleanupSystem();

        if (tick % 5 == 0) {
            int aliveCount = 0;
            int bulletCount = 0;
            int enemyCount = 0;
            for (int i = 0; i < entityCount; i++) {
                if (!alive[i]) continue;
                aliveCount++;
                if (type[i] == 1) bulletCount++;
                if (type[i] == 2) enemyCount++;
            }
            cout << "STATUS|tick|" << tick << "|entities|" << aliveCount
                 << "|bullets|" << bulletCount << "|enemies|" << enemyCount
                 << "|score|" << score << endl;
        }
    }

    double rate = (double)fireCount / 15;
    cout << fixed << setprecision(2);
    cout << "COOLDOWN_SUMMARY|attempts|15|fired|" << fireCount
         << "|blocked|" << blocked << "|rate|" << rate << endl;
    cout << "FIRE_RATE|PASS|cooldown system operational" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "First tick fires successfully", expectedOutput: "FIRE\\|tick\\|1\\|success\\|bullet_0", isPattern: true },
    { id: "g2", description: "Second tick is blocked", expectedOutput: "FIRE\\|tick\\|2\\|blocked\\|cooldown\\|3", isPattern: true },
    { id: "g3", description: "Tick 5 fires again", expectedOutput: "FIRE\\|tick\\|5\\|success\\|bullet_1", isPattern: true },
    { id: "g4", description: "Status printed at tick 5", expectedOutput: "STATUS\\|tick\\|5\\|entities\\|\\d+\\|bullets\\|\\d+\\|enemies\\|\\d+\\|score\\|\\d+", isPattern: true },
    { id: "g5", description: "Cooldown summary with rate", expectedOutput: "COOLDOWN_SUMMARY\\|attempts\\|15\\|fired\\|4\\|blocked\\|11\\|rate\\|0\\.27", isPattern: true },
    { id: "g6", description: "Fire rate system passes", expectedOutput: "FIRE_RATE\\|PASS\\|cooldown system operational", isPattern: true },
  ],
  hints: [
    "Decrement cooldownCurrent BEFORE checking fire. On tick 1: cooldown is 0, fire succeeds, set to 4. On tick 2: decrement to 3, blocked. On tick 5: was 1, decrement to 0, fire.",
    "Bullets spawn at the player's position (180,300) with vy=-8. Each tick they move 8 pixels up. Track their y to determine when they collide with enemies descending from y=60 at vy=4.",
    "STATUS prints every 5 ticks. Count alive entities by type. The rate is fireCount/15 = 4/15 = 0.27 with fixed precision 2.",
  ],
  accumulatedCode: `#include <iostream>
#include <iomanip>
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

// Weapon state
int cooldownMax = 4;
int cooldownCurrent = 0;
int fireCount = 0;

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

void fireSpread(int px, int py, int count, int spread) {
    for (int i = 0; i < count; i++) {
        int bulletVx = -spread + i * spread;
        spawnFromPool(px, py, bulletVx, -4, 1, 1);
    }
}

// Cooldown-gated fire: returns true if fire succeeded
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
        cooldownSystem();
        tryFire(playerIdx);
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
        cooldownSystem();
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
