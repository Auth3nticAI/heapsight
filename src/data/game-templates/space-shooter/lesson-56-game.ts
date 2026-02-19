import type { GameLessonVariant } from "@/types/game";

export const lesson56SpaceShooter: GameLessonVariant = {
  lessonId: "56-collision-resolve",
  instructions: `# Collision Resolution — What Happens After the Overlap

Detection says "these two things are touching." Resolution says "here is what we do about it." Without resolution, your collision system is a lie detector that never acts on the truth. Bullets detect enemies but pass through. Enemies detect the player but stack on top. Resolution is the action layer: destroy, damage, push, flash, score. Every collision pair gets a type-specific response.

## What Breaks Without This

Without resolution, collision detection is useless data. You know a bullet overlaps an enemy but neither entity changes state. The bullet keeps flying. The enemy keeps moving. The player walks through enemies without taking damage. Your game has perfect detection and zero consequences.

## The Fix

One \\\`collisionResolve\\\` function dispatches on pair type:

\\\`\\\`\\\`
BULLET vs ENEMY:
  bullet.hp = 0 (despawn)
  enemy.hp -= bullet.damage
  if (enemy.hp <= 0) mark killed
  else trigger flash
  score += 100

ENEMY vs PLAYER:
  if (player.invFrames > 0) skip
  player.hp -= enemy.damage
  enemy.y -= pushback
  player.invFrames = 60
\\\`\\\`\\\`

Resolution runs after detection. Detection builds a list of collision pairs. Resolution iterates the list and applies consequences. This separation keeps detection pure (no side effects) and resolution centralized (one function, all outcomes).

## Your Task

1. Implement \\\`resolveBulletHit\\\` and \\\`resolveEnemyContact\\\`
2. Process 5 collision events:
   - bullet_0 vs enemy_2: BULLET_HIT, damage 10, enemy hp 20->10
   - bullet_1 vs enemy_0: BULLET_HIT, damage 10, enemy hp 20->10
   - enemy_1 vs player: ENEMY_CONTACT, damage 15, player hp 100->85, pushback 20
   - bullet_2 vs enemy_2: BULLET_HIT, damage 10, enemy hp 10->0, killed
   - enemy_0 vs player: ENEMY_CONTACT, blocked by invincibility
3. Print RESOLVE line for each collision
4. Print: \\\`RESOLVE_SUMMARY|frame|3|bullet_hits|3|contact_hits|2|kills|1|player_hp|85\\\`

## Beginner Trap

**Common Mistake:** Forgetting to set invincibility frames after the first enemy contact. Without invFrames, the second enemy contact also deals 15 damage, dropping the player to 70 HP. The invulnerability window exists to prevent damage stacking from multiple enemies in the same frame.

## Elite Insight

Game engines like Unreal use collision channels and response matrices. Each pair of channels has a defined response: ignore, overlap, block. Your type-based dispatch is the same concept in miniature. The matrix scales to dozens of entity types without modifying the resolution loop.

## Cross-Path Echo

Exception handlers in software follow the same dispatch pattern. A try block detects the error (collision). The catch block resolves it based on type (IOException vs NullPointerException). Each exception type gets a specific response. The catch chain is a collision resolution dispatcher.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int playerHp = 100;
int invFrames = 0;
int bulletHits = 0;
int contactHits = 0;
int totalKills = 0;

// TODO: Write resolveBulletHit(bulletName, enemyName, damage, enemyHp)
//   Apply damage to enemy (pass by reference)
//   Increment bulletHits
//   Print RESOLVE line with updated enemy hp
//   If enemy hp <= 0, increment totalKills

// TODO: Write resolveEnemyContact(enemyName, damage, pushback)
//   Increment contactHits
//   If invFrames > 0: print blocked line, return
//   Apply damage to playerHp, set invFrames=60
//   Print RESOLVE line

int main() {
    int enemyHp[] = {20, 20, 20};

    // TODO: Process 5 collision events in order
    // TODO: Print RESOLVE_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int playerHp = 100;
int invFrames = 0;
int bulletHits = 0;
int contactHits = 0;
int totalKills = 0;

void resolveBulletHit(string bulletName, string enemyName, int damage, int &enemyHp) {
    enemyHp -= damage;
    bulletHits++;
    cout << "RESOLVE|" << bulletName << "|" << enemyName
         << "|type|BULLET_HIT|damage|" << damage
         << "|enemy_hp|" << enemyHp << "|bullet|despawned" << endl;
    if (enemyHp <= 0) totalKills++;
}

void resolveEnemyContact(string enemyName, int damage, int pushback) {
    contactHits++;
    if (invFrames > 0) {
        cout << "RESOLVE|" << enemyName << "|player|type|ENEMY_CONTACT|damage|0|player_hp|"
             << playerHp << "|blocked|invincible" << endl;
        return;
    }
    playerHp -= damage;
    invFrames = 60;
    cout << "RESOLVE|" << enemyName << "|player|type|ENEMY_CONTACT|damage|" << damage
         << "|player_hp|" << playerHp << "|pushback|" << pushback << endl;
}

int main() {
    int enemyHp[] = {20, 20, 20};

    resolveBulletHit("bullet_0", "enemy_2", 10, enemyHp[2]);
    resolveBulletHit("bullet_1", "enemy_0", 10, enemyHp[0]);
    resolveEnemyContact("enemy_1", 15, 20);
    resolveBulletHit("bullet_2", "enemy_2", 10, enemyHp[2]);
    resolveEnemyContact("enemy_0", 15, 20);

    cout << "RESOLVE_SUMMARY|frame|3|bullet_hits|" << bulletHits
         << "|contact_hits|" << contactHits << "|kills|" << totalKills
         << "|player_hp|" << playerHp << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Bullet hit resolves correctly", expectedOutput: "RESOLVE\\|bullet_0\\|enemy_2\\|type\\|BULLET_HIT\\|damage\\|10\\|enemy_hp\\|10\\|bullet\\|despawned", isPattern: true },
    { id: "g2", description: "Enemy contact with damage and pushback", expectedOutput: "RESOLVE\\|enemy_1\\|player\\|type\\|ENEMY_CONTACT\\|damage\\|15\\|player_hp\\|85\\|pushback\\|20", isPattern: true },
    { id: "g3", description: "Kill registered on zero hp", expectedOutput: "RESOLVE\\|bullet_2\\|enemy_2\\|type\\|BULLET_HIT\\|damage\\|10\\|enemy_hp\\|0\\|bullet\\|despawned", isPattern: true },
    { id: "g4", description: "Invincibility blocks damage", expectedOutput: "RESOLVE\\|enemy_0\\|player\\|type\\|ENEMY_CONTACT\\|damage\\|0\\|player_hp\\|85\\|blocked\\|invincible", isPattern: true },
    { id: "g5", description: "Summary with correct counts", expectedOutput: "RESOLVE_SUMMARY\\|frame\\|3\\|bullet_hits\\|3\\|contact_hits\\|2\\|kills\\|1\\|player_hp\\|85", isPattern: true },
  ],
  hints: [
    "Enemy_2 is hit twice: bullet_0 reduces hp from 20 to 10, bullet_2 reduces from 10 to 0. Pass enemyHp[2] by reference so both hits accumulate.",
    "The first resolveEnemyContact sets invFrames=60. The second call sees invFrames > 0 and prints 'blocked|invincible' without modifying playerHp.",
    "Order matters. Process all 5 collisions sequentially. Each collision can modify state that affects subsequent resolutions (invFrames, enemyHp).",
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
int damage[POOL_SIZE];

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;
int cooldown = 0;
int playerHp = 100;
int invFrames = 0;

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

int spawnFromPool(int px, int py, int pvx, int pvy, int php, int ptype, char psprite, int pdmg) {
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
    damage[idx] = pdmg;
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

void resolveBulletHit(int bulletIdx, int enemyIdx) {
    hp[bulletIdx] = 0;
    hp[enemyIdx] -= damage[bulletIdx];
    score += 100;
    if (hp[enemyIdx] <= 0) {
        kills++;
    } else {
        flashTimer[enemyIdx] = 3;
        sprite[enemyIdx] = 'X';
    }
}

void resolveEnemyContact(int enemyIdx, int playerIdx) {
    if (invFrames > 0) return;
    playerHp -= damage[enemyIdx];
    y[enemyIdx] -= 20;
    invFrames = 60;
}

void collisionSystem(int count, int playerIdx) {
    // Bullet vs Enemy
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                resolveBulletHit(b, e);
                break;
            }
        }
    }

    // Enemy vs Player
    for (int e = 0; e < count; e++) {
        if (!alive[e] || type[e] != 2) continue;
        int dx = x[e] - x[playerIdx];
        int dy = y[e] - y[playerIdx];
        if (dx < 0) dx = -dx;
        if (dy < 0) dy = -dy;
        if (dx < 18 && dy < 18) {
            resolveEnemyContact(e, playerIdx);
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
        spawnFromPool(x[playerIdx] - 8, y[playerIdx], 0, -16, 1, 1, '|', 10);
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1, '|', 10);
        spawnFromPool(x[playerIdx] + 8, y[playerIdx], 0, -16, 1, 1, '|', 10);
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

    int playerIdx = spawnFromPool(200, 300, 0, 0, 100, 0, 'P', 0);

    spawnFromPool(120, 60, 0, 4, 20, 2, 'V', 15);
    spawnFromPool(180, 60, 0, 4, 20, 2, 'V', 15);
    spawnFromPool(220, 60, 0, 4, 20, 2, 'V', 15);
    int count = 4;

    string frameInputs[] = {" ", "w", "w", " ", "w", "d", " ", "w"};

    for (int frame = 1; frame <= 8; frame++) {
        processInput(frameInputs[frame - 1][0], playerIdx);
        if (POOL_SIZE - freeCount > count) count = POOL_SIZE - freeCount;

        movementSystem(count);
        boundsSystem(count);
        collisionSystem(count, playerIdx);
        flashSystem(count);
        cleanupSystem(count);

        if (cooldown > 0) cooldown--;
        if (invFrames > 0) invFrames--;

        int camX = x[playerIdx] - VIEW_W / 2;
        int camY = y[playerIdx] - VIEW_H / 2;

        cout << "FRAME|" << frame << "|score|" << score
             << "|kills|" << kills << "|player_hp|" << playerHp << endl;
    }

    cout << "SCORE|" << score << endl;
    return 0;
}
`,
};
