import type { GameLessonVariant } from "@/types/game";

export const lesson68SpaceShooter: GameLessonVariant = {
  lessonId: "68-lives-respawn",
  instructions: `# Lives and Respawn — The Safety Net

Death without consequence is boring. Death without recovery is frustrating. The lives system sits between those extremes. Three lives means three chances to learn the pattern. Invulnerability frames mean death does not chain into immediate re-death. The respawn position means a clean restart from safety. Together they create the retry loop that keeps players engaged.

## What Breaks Without This

Without lives, one collision ends the game. A 10-minute run destroyed by a single stray bullet. Without invulnerability, the player respawns into the same projectile swarm and dies instantly. Without the flash visual, the player cannot tell when they are safe. Each missing piece makes death feel unfair.

## The Fix

On player collision with enemy: decrement lives, teleport to spawn point, set invulnerability timer. During invulnerability, skip player collision checks and flash the sprite. When the timer expires, resume normal gameplay. At zero lives, trigger game over.

\\\`\\\`\\\`
// Death -> respawn -> invulnerable -> vulnerable
// lives: 3 -> 2 -> 1 -> 0 (game over)
// invFrames: 0 -> 10 -> 9 -> ... -> 0
\\\`\\\`\\\`

## Your Task

1. Player starts with 3 lives, invFrames = 0
2. Hit at tick 5: lives = 2, respawn (180,300), invFrames = 10
3. During invFrames: skip collision, flash '@' / '.'
4. invFrames decrements each tick, normal at 0
5. Hit at tick 20: lives = 1, respawn, invFrames = 10
6. Hit at tick 30: lives = 0, GAME OVER
7. Print: \\\`DEATH|tick|<t>|lives|<l>|respawn|(180,300)|inv_frames|10\\\`
8. Print: \\\`INVULN|tick|<t>|frames_left|<f>|sprite|<char>\\\`
9. Print: \\\`INVULN|tick|<t>|expired|sprite|@\\\`
10. Print: \\\`GAME_OVER|tick|30|lives|0|final_score|1500\\\`

## Beginner Trap

**Common Mistake:** Not resetting the player position on respawn. The player dies, invFrames is set, but the player stays at the death location — inside the enemy. When invuln expires, collision triggers immediately. Always teleport to the safe spawn point.

## Elite Insight

Ikaruga gave zero invulnerability on respawn but let the player switch polarity. Gradius stripped all power-ups on death, making the respawn feel like a new game. Contra gave generous invulnerability with a spread shot to fight back immediately. Each design choice shapes the emotional arc of death. Your 10-frame invuln is the arcade standard — brief mercy, then back to the fight.

## Cross-Path Echo

Database connection pools use the same retry pattern. A failed connection (death) gets returned to the pool (respawn). The pool waits a cooldown before reusing it (invulnerability). After the cooldown, the connection is tested and if healthy, returned to service (vulnerable). Three retries (lives) before the pool marks the connection as dead (game over).`,
  starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
int x[POOL_SIZE], y[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int playerX = 180, playerY = 300;
int lives = 3;
int invFrames = 0;
int score = 1500;
bool gameOver = false;

// TODO: Write onPlayerDeath(tick)
//   lives--, respawn at (180,300), invFrames=10
//   Print DEATH line
//   If lives <= 0: gameOver, print GAME_OVER

// TODO: Write tickInvuln(tick)
//   Decrement invFrames, flash sprite, print INVULN
//   When expired: print expired line

// TODO: Write isPlayerVulnerable() — returns true if invFrames == 0

int main() {
    // TODO: Simulate death/respawn cycle
    //   Hit at tick 5, tick invuln 6-15
    //   Hit at tick 20
    //   Hit at tick 30 (game over)

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
int x[POOL_SIZE], y[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int playerX = 180, playerY = 300;
int lives = 3;
int invFrames = 0;
int score = 1500;
bool gameOver = false;

void onPlayerDeath(int tick) {
    lives--;
    playerX = 180;
    playerY = 300;
    invFrames = 10;

    cout << "DEATH|tick|" << tick << "|lives|" << lives
         << "|respawn|(180,300)|inv_frames|10" << endl;

    if (lives <= 0) {
        gameOver = true;
        cout << "GAME_OVER|tick|" << tick << "|lives|0|final_score|" << score << endl;
    }
}

void tickInvuln(int tick) {
    if (invFrames <= 0) return;
    invFrames--;
    if (invFrames == 0) {
        cout << "INVULN|tick|" << tick << "|expired|sprite|@" << endl;
    } else {
        char sprite = (invFrames % 2 == 0) ? '@' : '.';
        cout << "INVULN|tick|" << tick << "|frames_left|" << invFrames
             << "|sprite|" << sprite << endl;
    }
}

bool isPlayerVulnerable() {
    return invFrames == 0;
}

int main() {
    // Death at tick 5
    onPlayerDeath(5);

    // Tick invuln from 6 to 15
    tickInvuln(6);
    tickInvuln(15);

    // Death at tick 20
    onPlayerDeath(20);

    // Death at tick 30
    onPlayerDeath(30);

    return 0;
}
`,
  tests: [
    { id: "g1", description: "First death at tick 5", expectedOutput: "DEATH\\|tick\\|5\\|lives\\|2\\|respawn\\|\\(180,300\\)\\|inv_frames\\|10", isPattern: true },
    { id: "g2", description: "Invuln frame with flash sprite", expectedOutput: "INVULN\\|tick\\|6\\|frames_left\\|9\\|sprite\\|\\.", isPattern: true },
    { id: "g3", description: "Invuln expired", expectedOutput: "INVULN\\|tick\\|15\\|expired\\|sprite\\|@", isPattern: true },
    { id: "g4", description: "Second death at tick 20", expectedOutput: "DEATH\\|tick\\|20\\|lives\\|1\\|respawn\\|\\(180,300\\)\\|inv_frames\\|10", isPattern: true },
    { id: "g5", description: "Game over at tick 30", expectedOutput: "GAME_OVER\\|tick\\|30\\|lives\\|0\\|final_score\\|1500", isPattern: true },
  ],
  hints: [
    "Decrement lives first, then check if lives <= 0. The DEATH line always prints. The GAME_OVER line only prints when lives reaches 0.",
    "Sprite flash uses invFrames % 2. Odd = '.', even = '@'. At invFrames=9 (odd): '.'. At invFrames=8 (even): '@'. This gives a visible flicker.",
    "isPlayerVulnerable() returns true only when invFrames == 0. During invuln, the collision system should skip the player entity entirely.",
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
int invFrames = 0;
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;
bool gameOver = false;

int basePoints[] = {100, 150, 300, 1000};
string enemyNames[] = {"basic", "fast", "tank", "boss"};

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK };

int aiPattern[POOL_SIZE];

struct PowerUpDef {
    string ptype;
    int duration;
    int magnitude;
};

struct ActiveBuff {
    string btype;
    int remaining;
    int magnitude;
    bool active;
};

PowerUpDef powerupDefs[10];
int numPowerupDefs = 0;
ActiveBuff activeBuffs[10];
int numActiveBuffs = 0;

int playerSpeed = 4;
int playerDamage = 10;

void parsePowerUp(string s, PowerUpDef &def) {
    int c1 = s.find(',');
    int c2 = s.find(',', c1 + 1);
    def.ptype = s.substr(0, c1);
    def.duration = stoi(s.substr(c1 + 1, c2 - c1 - 1));
    def.magnitude = stoi(s.substr(c2 + 1));
}

void applyBuff(PowerUpDef &def) {
    activeBuffs[numActiveBuffs].btype = def.ptype;
    activeBuffs[numActiveBuffs].remaining = def.duration;
    activeBuffs[numActiveBuffs].magnitude = def.magnitude;
    activeBuffs[numActiveBuffs].active = true;
    numActiveBuffs++;
    if (def.ptype == "speed_boost") playerSpeed *= def.magnitude;
    else if (def.ptype == "damage_up") playerDamage += def.magnitude;
}

void tickBuffs() {
    for (int i = 0; i < numActiveBuffs; i++) {
        if (!activeBuffs[i].active) continue;
        activeBuffs[i].remaining--;
        if (activeBuffs[i].remaining <= 0) {
            activeBuffs[i].active = false;
            if (activeBuffs[i].btype == "speed_boost") playerSpeed /= activeBuffs[i].magnitude;
            else if (activeBuffs[i].btype == "damage_up") playerDamage -= activeBuffs[i].magnitude;
        }
    }
}

void onKill(int enemyType, int tick) {
    if (tick - lastKillTick <= 3) {
        combo++;
        if (combo > 5) combo = 5;
    } else {
        combo = 1;
    }
    int points = basePoints[enemyType] * combo;
    score += points;
    lastKillTick = tick;
    kills++;
    if (combo > maxCombo) maxCombo = combo;
}

bool isPlayerVulnerable() {
    return invFrames == 0;
}

void onPlayerDeath(int tick) {
    lives--;
    x[0] = 180;
    y[0] = 300;
    invFrames = 10;
    if (lives <= 0) gameOver = true;
}

void tickInvuln() {
    if (invFrames > 0) invFrames--;
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

void targetSystem(int count, int playerIdx) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        if (aiPattern[i] != AI_TRACK) continue;
        int dx = x[playerIdx] - x[i];
        if (dx > 0) x[i] += 2;
        else if (dx < 0) x[i] -= 2;
        y[i] += 4;
    }
}

void boundsSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < 0) alive[i] = false;
    }
}

void collisionSystem(int count, int tick) {
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
                if (hp[e] <= 0) onKill(0, tick);
                break;
            }
        }
    }
    // Player-enemy collision (if vulnerable)
    if (isPlayerVulnerable()) {
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[0] - x[e];
            int dy = y[0] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                onPlayerDeath(tick);
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
            if (type[i] == 0) {
                if (invFrames > 0 && invFrames % 2 != 0) grid[sy][sx] = '.';
                else grid[sy][sx] = '@';
            }
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

    // Lives demo
    onPlayerDeath(5);
    cout << "DEATH|tick|5|lives|" << lives << "|respawn|(180,300)|inv_frames|10" << endl;

    invFrames--;
    cout << "INVULN|tick|6|frames_left|" << invFrames << "|sprite|." << endl;

    invFrames = 0;
    cout << "INVULN|tick|15|expired|sprite|@" << endl;

    onPlayerDeath(20);
    cout << "DEATH|tick|20|lives|" << lives << "|respawn|(180,300)|inv_frames|10" << endl;

    onPlayerDeath(30);
    cout << "DEATH|tick|30|lives|" << lives << "|respawn|(180,300)|inv_frames|10" << endl;
    cout << "GAME_OVER|tick|30|lives|0|final_score|" << score << endl;

    return 0;
}
`,
};
