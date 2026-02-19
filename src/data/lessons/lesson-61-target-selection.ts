import type { Lesson } from "@/types/lesson";

export const lesson61: Lesson = {
  id: "61-target-selection",
  title: "Target Selection",
  description: "Enemies select targets based on distance to player position.",
  order: 61,
  xpReward: 200,
  tier: "pro",
  concepts: ["targeting AI", "distance calculation", "nearest enemy", "priority selection"],
  part1: {
    title: "Concept: Target Selection",
    type: "concept",
    instructions: `# Target Selection — Enemies That Ignore the Player Are Not Enemies

An enemy that drifts down the screen without acknowledging the player is scenery, not a threat. Real enemies track. They calculate distance, pick a target, and close the gap. Manhattan distance gives you targeting for free: \\\`|ax - bx| + |ay - by|\\\`. No square roots. No floating point. Pure integer math that runs in nanoseconds.

## What Breaks Without This

Without targeting, enemies are obstacles. They follow fixed paths regardless of player position. The player learns to sit in a safe zone and fire. No tension. No adaptation. The game plays itself. Targeting makes enemies react to the player, and reaction creates gameplay.

## The Fix

Manhattan distance: \\\`|ax - bx| + |ay - by|\\\`. Fast, branch-free with abs(), and good enough for targeting decisions. You do not need Euclidean distance for "which enemy is closest" — Manhattan preserves relative ordering in most cases and costs zero multiplies.

For tracking: compute dx = player.x - enemy.x. If dx > 0, enemy moves right. If dx < 0, enemy moves left. The enemy converges on the player's x-position over time.

\\\`\\\`\\\`
dx = playerX - enemyX;
if (dx > 0) enemyX += moveSpeed;
else if (dx < 0) enemyX -= moveSpeed;
\\\`\\\`\\\`

Sort enemies by distance to find the nearest threat. The closest enemy is the one the player should worry about.

## Your Task

1. Player starts at (180, 300). Player moves right each tick: x += 4
2. 3 tracking enemies at positions: (100, 60), (200, 80), (300, 50)
3. Each enemy has a move speed of 2 in x-direction toward the player
4. Run 5 ticks. Each tick:
   - Update player position (x += 4)
   - For each enemy: compute dx to player, move enemy x toward player by 2
   - Print: \\\`TARGET|tick|<t>|enemy_<i>|player_x|<px>|enemy_x|<ex>|dx|<dx>|move|<dir>\\\`
5. After tick 5: find closest enemy by Manhattan distance to player
6. Compute average distance across all enemies
7. Print: \\\`TARGET_SUMMARY|trackers|3|avg_distance|<avg>|closest|enemy_<i>\\\`

Expected output (first 2 ticks):
\\\`\\\`\\\`
TARGET|tick|1|enemy_0|player_x|184|enemy_x|102|dx|82|move|right
TARGET|tick|1|enemy_1|player_x|184|enemy_x|198|dx|-14|move|left
TARGET|tick|1|enemy_2|player_x|184|enemy_x|298|dx|-114|move|left
TARGET|tick|2|enemy_0|player_x|188|enemy_x|104|dx|84|move|right
TARGET|tick|2|enemy_1|player_x|188|enemy_x|196|dx|-8|move|left
TARGET|tick|2|enemy_2|player_x|188|enemy_x|296|dx|-108|move|left
\\\`\\\`\\\`

Enemy 1 starts closest and converges fast. Enemy 0 chases from the left. Enemy 2 trails from the right. The player's rightward drift changes the targeting dynamics each tick.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int playerX = 180;
    int playerY = 300;

    const int NUM_ENEMIES = 3;
    int enemyX[NUM_ENEMIES] = {100, 200, 300};
    int enemyY[NUM_ENEMIES] = {60, 80, 50};
    const int MOVE_SPEED = 2;
    const int TICKS = 5;

    // TODO: Run 5 ticks
    //   Each tick:
    //     playerX += 4
    //     For each enemy:
    //       Compute dx = playerX - enemyX[i]
    //       Move enemy: if dx > 0, enemyX[i] += MOVE_SPEED; else enemyX[i] -= MOVE_SPEED
    //       Determine direction string: "right" or "left"
    //       Print TARGET line

    // TODO: After all ticks, compute Manhattan distance for each enemy to player
    //   Find closest enemy (smallest |dx| + |dy|)
    //   Compute average distance (integer division)
    //   Print TARGET_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int playerX = 180;
    int playerY = 300;

    const int NUM_ENEMIES = 3;
    int enemyX[NUM_ENEMIES] = {100, 200, 300};
    int enemyY[NUM_ENEMIES] = {60, 80, 50};
    const int MOVE_SPEED = 2;
    const int TICKS = 5;

    for (int t = 1; t <= TICKS; t++) {
        playerX += 4;

        for (int i = 0; i < NUM_ENEMIES; i++) {
            int dx = playerX - enemyX[i];
            string dir;
            if (dx > 0) {
                enemyX[i] += MOVE_SPEED;
                dir = "right";
            } else {
                enemyX[i] -= MOVE_SPEED;
                dir = "left";
            }

            cout << "TARGET|tick|" << t << "|enemy_" << i
                 << "|player_x|" << playerX
                 << "|enemy_x|" << enemyX[i]
                 << "|dx|" << dx
                 << "|move|" << dir << endl;
        }
    }

    int minDist = 99999;
    int closest = 0;
    int totalDist = 0;

    for (int i = 0; i < NUM_ENEMIES; i++) {
        int dx = playerX - enemyX[i];
        if (dx < 0) dx = -dx;
        int dy = playerY - enemyY[i];
        if (dy < 0) dy = -dy;
        int dist = dx + dy;
        totalDist += dist;
        if (dist < minDist) {
            minDist = dist;
            closest = i;
        }
    }

    int avgDist = totalDist / NUM_ENEMIES;

    cout << "TARGET_SUMMARY|trackers|3|avg_distance|" << avgDist
         << "|closest|enemy_" << closest << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Tick 1 enemy 0 tracks right", expectedOutput: "TARGET\\|tick\\|1\\|enemy_0\\|player_x\\|184\\|enemy_x\\|102\\|dx\\|82\\|move\\|right", isPattern: true },
      { id: "t2", description: "Tick 1 enemy 1 tracks left", expectedOutput: "TARGET\\|tick\\|1\\|enemy_1\\|player_x\\|184\\|enemy_x\\|198\\|dx\\|-14\\|move\\|left", isPattern: true },
      { id: "t3", description: "Tick 1 enemy 2 tracks left", expectedOutput: "TARGET\\|tick\\|1\\|enemy_2\\|player_x\\|184\\|enemy_x\\|298\\|dx\\|-114\\|move\\|left", isPattern: true },
      { id: "t4", description: "All 5 ticks run", expectedOutput: "TARGET\\|tick\\|5\\|enemy_\\d+\\|player_x\\|200\\|enemy_x\\|\\d+\\|dx\\|-?\\d+\\|move\\|\\w+", isPattern: true },
      { id: "t5", description: "Summary with closest enemy", expectedOutput: "TARGET_SUMMARY\\|trackers\\|3\\|avg_distance\\|\\d+\\|closest\\|enemy_\\d+", isPattern: true },
    ],
    hints: [
      "dx is computed BEFORE moving the enemy. So dx = playerX - enemyX[i] gives the distance before the move. Then you move the enemy based on the sign of dx.",
      "Manhattan distance is |dx| + |dy|. Use absolute values. After 5 ticks, playerX = 200. Enemy y positions do not change in this simulation — only x tracking.",
      "Average distance uses integer division: totalDist / NUM_ENEMIES. This truncates, which is fine for a summary stat.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Target Selection AI",
    type: "game_builder",
    instructions: `# Game Builder: Target Selection AI — Enemies That Hunt

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
    estimatedMinutes: 10,
  },
};
