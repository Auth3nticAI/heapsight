import type { Lesson } from "@/types/lesson";

export const lesson52: Lesson = {
  id: "52-fire-rate",
  title: "Fire Rate and Cooldowns",
  description: "Implement fire rate cooldowns to prevent bullet spam.",
  order: 52,
  xpReward: 200,
  tier: "pro",
  concepts: ["cooldown timer", "rate limiting", "tick-based timing", "state machine"],
  part1: {
    title: "Concept: Cooldown Timers",
    type: "concept",
    instructions: `# Cooldown Timers — Rate Limiting Fire

Without cooldowns, the player fires every frame. At 60 fps, that is 60 bullets per second. The entity pool fills in half a second. The screen becomes a wall of projectiles. The game is trivial. Cooldowns gate the fire rate so each shot matters. The player must time their fire. This is the difference between a toy and a game.

## What Breaks Without This

Without cooldowns, the player holds the fire button and wins. No timing, no skill, no resource management. The pool overflows. The collision system checks thousands of pairs. Performance drops. Gameplay drops harder. Every shipped shooter has fire rate limits because unlimited fire breaks both the game design and the game engine.

## The Fix

One integer per weapon: cooldownCurrent. After firing, set it to cooldownMax. Each tick, decrement by 1. Fire is allowed only when cooldownCurrent <= 0.

\\\`\\\`\\\`
cooldownMax = 5
tick 1: fire! cooldownCurrent = 5
tick 2: cooldownCurrent = 4 (blocked)
tick 3: cooldownCurrent = 3 (blocked)
tick 4: cooldownCurrent = 2 (blocked)
tick 5: cooldownCurrent = 1 (blocked)
tick 6: cooldownCurrent = 0 — fire! cooldownCurrent = 5
\\\`\\\`\\\`

The pattern is: decrement, check, fire-or-block. Three lines of logic. Zero allocations. Zero complexity. Maximum control over game feel.

## Your Task

1. Set cooldownMax = 4, cooldownCurrent = 0
2. Simulate 15 ticks where the player tries to fire every tick
3. Each tick: decrement cooldownCurrent (if > 0), then attempt fire
4. If cooldownCurrent <= 0: fire succeeds, set cooldownCurrent = cooldownMax, increment fireCount
5. If cooldownCurrent > 0: fire blocked
6. Print each tick: \\\`FIRE|tick|<t>|success|bullet_<n>\\\` or \\\`FIRE|tick|<t>|blocked|cooldown|<remaining>\\\`
7. After all ticks: \\\`COOLDOWN_SUMMARY|attempts|15|fired|<n>|blocked|<b>|rate|<r>\\\`
   - rate = fired / attempts, printed to 2 decimal places

Expected output (first 6 ticks):
\\\`\\\`\\\`
FIRE|tick|1|success|bullet_0
FIRE|tick|2|blocked|cooldown|3
FIRE|tick|3|blocked|cooldown|2
FIRE|tick|4|blocked|cooldown|1
FIRE|tick|5|success|bullet_1
FIRE|tick|6|blocked|cooldown|3
\\\`\\\`\\\`

The pattern repeats: fire on tick 1, 5, 9, 13. Four successful fires out of 15 attempts.`,
    starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int cooldownMax = 4;
    int cooldownCurrent = 0;
    int fireCount = 0;
    int blocked = 0;

    // TODO: Simulate 15 ticks
    //   Each tick: if cooldownCurrent > 0, decrement it
    //   Attempt fire: if cooldownCurrent <= 0, fire succeeds
    //     Print success line, set cooldownCurrent = cooldownMax, increment fireCount
    //   Else: fire blocked
    //     Print blocked line with remaining cooldown

    // TODO: Print COOLDOWN_SUMMARY with rate as fixed 2 decimal places

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int cooldownMax = 4;
    int cooldownCurrent = 0;
    int fireCount = 0;
    int blocked = 0;

    for (int tick = 1; tick <= 15; tick++) {
        if (cooldownCurrent > 0) {
            cooldownCurrent--;
        }

        if (cooldownCurrent <= 0) {
            cout << "FIRE|tick|" << tick << "|success|bullet_" << fireCount << endl;
            cooldownCurrent = cooldownMax;
            fireCount++;
        } else {
            cout << "FIRE|tick|" << tick << "|blocked|cooldown|" << cooldownCurrent << endl;
            blocked++;
        }
    }

    double rate = (double)fireCount / 15;
    cout << fixed << setprecision(2);
    cout << "COOLDOWN_SUMMARY|attempts|15|fired|" << fireCount
         << "|blocked|" << blocked << "|rate|" << rate << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First tick fires successfully", expectedOutput: "FIRE\\|tick\\|1\\|success\\|bullet_0", isPattern: true },
      { id: "t2", description: "Second tick is blocked with cooldown 3", expectedOutput: "FIRE\\|tick\\|2\\|blocked\\|cooldown\\|3", isPattern: true },
      { id: "t3", description: "Tick 5 fires again", expectedOutput: "FIRE\\|tick\\|5\\|success\\|bullet_1", isPattern: true },
      { id: "t4", description: "Tick 13 fires bullet_3", expectedOutput: "FIRE\\|tick\\|13\\|success\\|bullet_3", isPattern: true },
      { id: "t5", description: "Summary shows 4 fired out of 15", expectedOutput: "COOLDOWN_SUMMARY\\|attempts\\|15\\|fired\\|4\\|blocked\\|11\\|rate\\|0\\.27", isPattern: true },
    ],
    hints: [
      "Decrement cooldownCurrent BEFORE checking if you can fire. On tick 1, cooldownCurrent starts at 0, so the fire succeeds immediately. Then cooldownCurrent = 4.",
      "On tick 2, cooldownCurrent is 4. Decrement to 3. Still > 0, so blocked. On tick 5: cooldownCurrent was 1, decrement to 0, fire succeeds.",
      "Rate = 4 / 15 = 0.2666... which rounds to 0.27 with fixed precision 2. Use cout << fixed << setprecision(2) before printing.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Fire Rate System",
    type: "game_builder",
    instructions: `# Game Builder: Fire Rate Cooldown System

This is where bullet spam dies. The player fires every frame but the weapon only responds when the cooldown expires. The cooldown timer gates the fire rate. The system tracks attempts, successes, and blocks. Weapon feel is defined by this single integer.

## Your Task
1. Pool: 20 entity slots. SoA: x, y, vx, vy, hp, type, alive
2. Player at (180, 300), type=0, hp=100
3. WeaponState: cooldownMax=4, cooldownCurrent=0, fireCount=0
4. 2 enemies at x=160,200 y=60 vy=4 hp=1 type=2
5. Simulate 15 ticks. Player tries to fire every tick
6. cooldownSystem: if cooldownCurrent > 0, decrement. Fire only when cooldownCurrent <= 0
7. On successful fire: spawn bullet at player pos with vy=-8, set cooldownCurrent = cooldownMax
8. Run movementSystem and collisionSystem each tick
9. Print per tick: \\\`FIRE|tick|<t>|success|bullet_<n>\\\` or \\\`FIRE|tick|<t>|blocked|cooldown|<c>\\\`
10. Print every 5 ticks: \\\`STATUS|tick|<t>|entities|<count>|bullets|<b>|enemies|<e>|score|<s>\\\`
11. Print: \\\`COOLDOWN_SUMMARY|attempts|15|fired|<n>|blocked|<b>|rate|<r>\\\`
12. Print: \\\`FIRE_RATE|PASS|cooldown system operational\\\`

## Beginner Trap

**Common Mistake:** Decrementing the cooldown AFTER checking if fire is allowed. This off-by-one means the weapon fires one tick too early. Always decrement first, then check. The decrement happens every tick. The fire check happens after the decrement.

## Elite Insight

Weapon feel is frame data. A cooldown of 4 at 60fps gives 15 shots per second. A cooldown of 10 gives 6 shots per second. Fighting games call this recovery frames. The number is small but the feel difference is massive. Tuning this integer is game design, not engineering. Ship it as a config value, not a constant.

## Cross-Path Echo

TCP congestion control is the same pattern. After a packet loss, the sender backs off for a cooldown period. The window shrinks. Retransmission waits. When the cooldown expires, the sender ramps back up. Rate limiting in networking, rate limiting in games — same state machine, different domains.`,
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
      { id: "t1", description: "First tick fires successfully", expectedOutput: "FIRE\\|tick\\|1\\|success\\|bullet_0", isPattern: true },
      { id: "t2", description: "Second tick is blocked", expectedOutput: "FIRE\\|tick\\|2\\|blocked\\|cooldown\\|3", isPattern: true },
      { id: "t3", description: "Tick 5 fires again", expectedOutput: "FIRE\\|tick\\|5\\|success\\|bullet_1", isPattern: true },
      { id: "t4", description: "Status printed at tick 5", expectedOutput: "STATUS\\|tick\\|5\\|entities\\|\\d+\\|bullets\\|\\d+\\|enemies\\|\\d+\\|score\\|\\d+", isPattern: true },
      { id: "t5", description: "Cooldown summary with rate", expectedOutput: "COOLDOWN_SUMMARY\\|attempts\\|15\\|fired\\|4\\|blocked\\|11\\|rate\\|0\\.27", isPattern: true },
      { id: "t6", description: "Fire rate system passes", expectedOutput: "FIRE_RATE\\|PASS\\|cooldown system operational", isPattern: true },
    ],
    hints: [
      "Decrement cooldownCurrent BEFORE checking fire. On tick 1: cooldown is 0, fire succeeds, set to 4. On tick 2: decrement to 3, blocked. On tick 5: was 1, decrement to 0, fire.",
      "Bullets spawn at the player's position (180,300) with vy=-8. Each tick they move 8 pixels up. Track their y to determine when they collide with enemies descending from y=60 at vy=4.",
      "STATUS prints every 5 ticks. Count alive entities by type. The rate is fireCount/15 = 4/15 = 0.27 with fixed precision 2.",
    ],
    estimatedMinutes: 10,
  },
};
