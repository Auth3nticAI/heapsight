import type { GameLessonVariant } from "@/types/game";

export const lesson61SpaceShooter: GameLessonVariant = {
  lessonId: "61-target-selection",
  instructions: `# Target Selection AI — Enemies That Hunt

Tracking enemies change the game. Instead of dodging fixed patterns, the player must outmaneuver enemies that converge on their position. Three trackers with different starting positions create a pincer effect — the player cannot run in one direction without closing distance to another enemy. This is the foundation of all pursuit AI.

## What Breaks Without This

Without targeting, enemy placement is the only difficulty tuning knob. You spawn more enemies or make them faster. With targeting, even three enemies create dynamic tension. The player must read the formation, predict convergence points, and choose escape routes. Targeting turns enemy count into enemy intelligence.

## The Fix

Each tracker computes dx to the player every tick. Move toward player by a fixed speed. The tracking is deterministic — no randomness needed. The emergent behavior comes from multiple trackers with different positions converging simultaneously.

\\\`\\\`\\\`
dx = playerX - enemyX;
if (dx > 0) enemyX += speed;
else if (dx < 0) enemyX -= speed;
\\\`\\\`\\\`

Manhattan distance for priority: \\\`|dx| + |dy|\\\`. The closest enemy is the biggest threat. Sort by distance to identify which tracker is closing fastest.

## Your Task

1. Player at (180, 300). Player moves right: x += 4 each tick
2. 3 tracking enemies: (100, 60), (200, 80), (300, 50), move speed 2 in x toward player
3. Enemies also move down: y += 4 each tick (advancing toward player)
4. Run 5 ticks
5. Each tick: update player, update enemies (track x + advance y), check if any bullet hits
6. Print per enemy per tick: \\\`TARGET|tick|<t>|enemy_<i>|player_x|<px>|enemy_x|<ex>|dx|<dx>|move|<dir>\\\`
7. After tick 5: compute avg distance and find closest
8. Print: \\\`TARGET_SUMMARY|trackers|3|avg_distance|<avg>|closest|enemy_<i>\\\`
9. Print: \\\`FRAME|<n>|enemies|<alive>|score|<s>\\\`

## Beginner Trap

**Common Mistake:** Computing dx after moving the enemy. The dx should reflect the distance before the move decision. Compute dx first, then move. If you move first and then compute dx, the reported distance is wrong and the direction may flip incorrectly.

## Elite Insight

Real AI systems use weighted targeting. Distance is one factor. Health, threat level, and player facing direction all contribute. A weighted sum \\\`priority = w1*distance + w2*health + w3*angle\\\` gives richer targeting. But distance-only tracking is the 80/20 — it gets you most of the behavior for none of the complexity.

## Cross-Path Echo

Search engines rank results by distance too — semantic distance in embedding space. The query is the player. Documents are enemies. The nearest document wins. The math is the same: compute distance, sort, select. Targeting AI and information retrieval are the same algorithm at different scales.`,
  starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 20;
int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;

// TODO: Write spawnEntity(px, py, pvx, pvy, php, ptype)

// TODO: Write targetSystem(playerX) — for each alive enemy (type==2):
//       compute dx = playerX - x[i]
//       move enemy x toward player by 2
//       move enemy y down by 4

// TODO: Write collisionSystem()
// TODO: Write cleanupSystem()

int main() {
    // TODO: Spawn player at (180, 300), type=0
    // TODO: Spawn 3 enemies: (100,60), (200,80), (300,50), type=2

    // TODO: Run 5 ticks
    //   playerX += 4 each tick
    //   Run targetSystem, collision, cleanup
    //   Print TARGET line per enemy
    //   Print FRAME line per tick

    // TODO: Compute and print TARGET_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 20;
int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;

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
    spawnEntity(100, 60, 0, 0, 1, 2);     // enemy 0
    spawnEntity(200, 80, 0, 0, 1, 2);     // enemy 1
    spawnEntity(300, 50, 0, 0, 1, 2);     // enemy 2

    for (int t = 1; t <= 5; t++) {
        x[0] += 4;  // player moves right

        // Target system: each enemy tracks player x
        for (int i = 1; i < entityCount; i++) {
            if (!alive[i] || etype[i] != 2) continue;
            int ei = i - 1;
            int dx = x[0] - x[i];
            string dir;
            if (dx > 0) {
                x[i] += 2;
                dir = "right";
            } else {
                x[i] -= 2;
                dir = "left";
            }
            y[i] += 4;

            cout << "TARGET|tick|" << t << "|enemy_" << ei
                 << "|player_x|" << x[0]
                 << "|enemy_x|" << x[i]
                 << "|dx|" << dx
                 << "|move|" << dir << endl;
        }

        collisionSystem();
        cleanupSystem();

        int enemyCount = 0;
        for (int i = 0; i < entityCount; i++) {
            if (alive[i] && etype[i] == 2) enemyCount++;
        }

        cout << "FRAME|" << t << "|enemies|" << enemyCount
             << "|score|" << score << endl;
    }

    // Compute summary
    int minDist = 99999;
    int closest = 0;
    int totalDist = 0;

    for (int i = 1; i < entityCount; i++) {
        if (etype[i] != 2) continue;
        int ei = i - 1;
        int dx = x[0] - x[i];
        if (dx < 0) dx = -dx;
        int dy = y[0] - y[i];
        if (dy < 0) dy = -dy;
        int dist = dx + dy;
        totalDist += dist;
        if (dist < minDist) {
            minDist = dist;
            closest = ei;
        }
    }

    int avgDist = totalDist / 3;

    cout << "TARGET_SUMMARY|trackers|3|avg_distance|" << avgDist
         << "|closest|enemy_" << closest << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Tick 1 enemy 0 tracks right", expectedOutput: "TARGET\\|tick\\|1\\|enemy_0\\|player_x\\|184\\|enemy_x\\|102\\|dx\\|82\\|move\\|right", isPattern: true },
    { id: "g2", description: "Tick 1 enemy 1 tracks left", expectedOutput: "TARGET\\|tick\\|1\\|enemy_1\\|player_x\\|184\\|enemy_x\\|198\\|dx\\|-14\\|move\\|left", isPattern: true },
    { id: "g3", description: "Tick 1 enemy 2 tracks left", expectedOutput: "TARGET\\|tick\\|1\\|enemy_2\\|player_x\\|184\\|enemy_x\\|298\\|dx\\|-114\\|move\\|left", isPattern: true },
    { id: "g4", description: "Frame output per tick", expectedOutput: "FRAME\\|\\d+\\|enemies\\|\\d+\\|score\\|\\d+", isPattern: true },
    { id: "g5", description: "All 5 ticks complete", expectedOutput: "TARGET\\|tick\\|5\\|enemy_\\d+\\|player_x\\|200\\|enemy_x\\|\\d+\\|dx\\|-?\\d+\\|move\\|\\w+", isPattern: true },
    { id: "g6", description: "Summary with closest enemy", expectedOutput: "TARGET_SUMMARY\\|trackers\\|3\\|avg_distance\\|\\d+\\|closest\\|enemy_\\d+", isPattern: true },
  ],
  hints: [
    "Compute dx = playerX - enemyX BEFORE moving the enemy. The dx value printed is the pre-move distance. Then apply the move: enemyX += 2 or enemyX -= 2 based on the sign of dx.",
    "The player is at index 0. Enemies start at index 1. Enemy 0 in the output corresponds to array index 1, enemy 1 to index 2, etc. Use (i - 1) for the enemy label.",
    "Manhattan distance for the summary: |dx| + |dy|. After 5 ticks the player is at x=200. Enemy y positions have increased by 4*5=20 from their starting positions. Compute final distances for the summary.",
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
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK };

int aiPattern[POOL_SIZE];

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

void sineWaveSystem(int count, int tick) {
    int ei = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        if (aiPattern[i] == AI_SINE && ei < enemyPhaseCount) {
            x[i] = 200 + (int)(40 * sin(tick * 0.5 + enemyPhase[ei]));
            y[i] += 4;
        }
        if (type[i] == 2) ei++;
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

    // Tracking enemies
    int e0 = spawnFromPool(100, 60, 0, 0, 1, 2);
    aiPattern[e0] = AI_TRACK;
    int e1 = spawnFromPool(200, 80, 0, 0, 1, 2);
    aiPattern[e1] = AI_TRACK;
    int e2 = spawnFromPool(300, 50, 0, 0, 1, 2);
    aiPattern[e2] = AI_TRACK;

    int count = entityCount;

    for (int t = 1; t <= 5; t++) {
        x[playerIdx] += 4;

        targetSystem(count, playerIdx);
        movementSystem(count);
        collisionSystem(count);
        cleanupSystem(count);

        int ei = 0;
        for (int i = 0; i < count; i++) {
            if (!alive[i] || type[i] != 2) continue;
            int dx = x[playerIdx] - x[i];
            string dir = (dx > 0) ? "right" : "left";
            cout << "TARGET|tick|" << t << "|enemy_" << ei
                 << "|player_x|" << x[playerIdx]
                 << "|enemy_x|" << x[i]
                 << "|dx|" << dx
                 << "|move|" << dir << endl;
            ei++;
        }

        int enemies = countByType(count, 2);
        cout << "FRAME|" << t << "|enemies|" << enemies
             << "|score|" << score << endl;
    }

    int minDist = 99999;
    int closest = 0;
    int totalDist = 0;
    int ei = 0;
    for (int i = 0; i < count; i++) {
        if (type[i] != 2) continue;
        int dx = x[playerIdx] - x[i];
        if (dx < 0) dx = -dx;
        int dy = y[playerIdx] - y[i];
        if (dy < 0) dy = -dy;
        int dist = dx + dy;
        totalDist += dist;
        if (dist < minDist) {
            minDist = dist;
            closest = ei;
        }
        ei++;
    }

    cout << "TARGET_SUMMARY|trackers|3|avg_distance|" << totalDist / 3
         << "|closest|enemy_" << closest << endl;

    return 0;
}
`,
};
