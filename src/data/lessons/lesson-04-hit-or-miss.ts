import type { Lesson } from "@/types/lesson";

export const lesson04: Lesson = {
  id: "04-hit-or-miss",
  title: "Hit or Miss",
  description: "Use conditionals to detect collisions and make bullets actually hit enemies.",
  order: 4,
  xpReward: 100,
  tier: "free",
  concepts: ["conditionals", "if/else", "boolean logic", "game rules"],
  part1: {
    title: "Concept: Conditionals",
    type: "concept",
    instructions: `# Hit or Miss

Every game interaction is a boolean test. Is the bullet near the enemy? True means damage. False means miss. Games are chains of \`if\` statements running sixty times per second.

## The Conditional

\`\`\`cpp
if (condition) {
    // runs when true
} else {
    // runs when false
}
\`\`\`

Comparison operators: \`==\` (equal), \`!=\` (not equal), \`<\`, \`>\`, \`<=\`, \`>=\`.

## What Breaks Without This

Without conditionals, the game cannot react. Bullets pass through enemies. Enemies never die. The simulation runs but nothing interacts. You have animation without gameplay.

## The Fix

Check distance between bullet and enemy. If the bullet's Y position reaches the enemy's Y zone, that is a hit. Apply damage. Otherwise, miss. One boolean test turns passive animation into combat.

## Performance Note

Branch prediction. The CPU guesses which branch you will take. Consistent patterns — always miss for 3 ticks, then hit — are fast. Random branching is slow. Game logic tends to be predictable, which is why \`if\` chains are cheap in practice.

## Memory Note

A boolean is 1 byte in memory. But comparison happens in CPU registers. The \`if\` check itself has zero memory cost.

## Beginner Trap

Using \`=\` instead of \`==\`. Single equals is assignment. Double equals is comparison. \`if (hp = 0)\` sets hp to 0 and evaluates as false. Silent corruption. The compiler may warn you but will not stop you.

## Elite Insight

Quake's combat system: same \`if\` chain. Is target in range? Is there line of sight? Is the weapon ready? All true means damage. Your proximity check is the seed of that system.

## Your Task

Simulate a bullet traveling toward an enemy over 4 ticks. The bullet starts at y=280 and moves up 80 per tick. The enemy starts at y=60 and moves down 20 per tick.

Each tick: check if \`bulletY <= enemyY + 22\` (within enemy hitbox). If true, print a HIT message with score. If false, print a miss status.

Expected output:
\`\`\`
=== TICK 1 ===
ENTITY|bullet|projectile|200|280|6|6|1
ENTITY|enemy|enemy|200|60|22|22|30
STATUS|miss - bullet at y=280, enemy at y=60
=== TICK 2 ===
ENTITY|bullet|projectile|200|200|6|6|1
ENTITY|enemy|enemy|200|80|22|22|30
STATUS|miss - bullet at y=200, enemy at y=80
=== TICK 3 ===
ENTITY|bullet|projectile|200|120|6|6|1
ENTITY|enemy|enemy|200|100|22|22|30
STATUS|miss - not close enough
=== TICK 4 ===
ENTITY|bullet|projectile|200|40|6|6|1
ENTITY|enemy|enemy|200|120|22|22|0
STATUS|HIT! Enemy destroyed! +100 points
SCORE|100
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int bulletX = 200, bulletY = 280;
    int enemyX = 200, enemyY = 60;
    int bulletSpeed = 80;
    int enemySpeed = 20;
    int enemyHp = 30;
    int score = 0;

    // TODO: Loop 4 ticks
    // Each tick:
    //   1. Print "=== TICK N ==="
    //   2. Print bullet ENTITY line
    //   3. Print enemy ENTITY line
    //   4. Check if bulletY <= enemyY + 22
    //      - If hit: set enemyHp = 0, score = 100, print HIT status + SCORE
    //      - If miss: print miss status with positions
    //   5. Move bullet up (bulletY -= bulletSpeed)
    //   6. Move enemy down (enemyY += enemySpeed)

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int bulletX = 200, bulletY = 280;
    int enemyX = 200, enemyY = 60;
    int bulletSpeed = 80;
    int enemySpeed = 20;
    int enemyHp = 30;
    int score = 0;

    for (int tick = 1; tick <= 4; tick++) {
        cout << "=== TICK " << tick << " ===" << endl;
        cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;
        cout << "ENTITY|enemy|enemy|" << enemyX << "|" << enemyY << "|22|22|" << enemyHp << endl;

        if (bulletY <= enemyY + 22) {
            enemyHp = 0;
            score = 100;
            cout << "STATUS|HIT! Enemy destroyed! +100 points" << endl;
            cout << "SCORE|" << score << endl;
        } else {
            if (bulletY - enemyY < 50) {
                cout << "STATUS|miss - not close enough" << endl;
            } else {
                cout << "STATUS|miss - bullet at y=" << bulletY << ", enemy at y=" << enemyY << endl;
            }
        }

        bulletY -= bulletSpeed;
        enemyY += enemySpeed;
    }

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Tick 1 should show miss with positions",
        expectedOutput: "STATUS\\|miss - bullet at y=280, enemy at y=60",
        isPattern: true,
      },
      {
        id: "t2",
        description: "Tick 4 should show HIT",
        expectedOutput: "STATUS\\|HIT! Enemy destroyed! \\+100 points",
        isPattern: true,
      },
      {
        id: "t3",
        description: "Score should be 100 after hit",
        expectedOutput: "SCORE\\|100",
        isPattern: true,
      },
    ],
    hints: [
      "Use a `for` loop: `for (int tick = 1; tick <= 4; tick++)`.",
      "The hit condition is `if (bulletY <= enemyY + 22)` — the bullet has entered the enemy's vertical zone.",
      "Move the bullet and enemy AFTER the hit check: `bulletY -= bulletSpeed; enemyY += enemySpeed;`",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Collision Detection",
    type: "game_builder",
    instructions: `# Game Builder: Bullet Hits Enemy

Now wire it into the full game scene. Ship at the bottom. Enemy at the top. Bullet fires upward. When the bullet reaches the enemy, damage applies and the enemy HP drops to zero.

## Your Task

1. Set up: ship at (180, 300), bullet at (192, 280), enemy at (180, 40)
2. Bullet speed = 80 upward per tick, enemy speed = 20 downward per tick
3. Run 4 ticks with full entity rendering and HUD
4. Each tick: render HUD, ship, bullet, enemy — then check for hit
5. On hit: set enemy HP to 0, add 100 to score, print damage message

Expected output:
\`\`\`
=== TICK 1 ===
HUD|HP:100|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|100
ENTITY|bullet|projectile|192|280|6|6|1
ENTITY|enemy|enemy|180|40|22|22|30
=== TICK 2 ===
HUD|HP:100|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|100
ENTITY|bullet|projectile|192|200|6|6|1
ENTITY|enemy|enemy|180|60|22|22|30
=== TICK 3 ===
HUD|HP:100|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|100
ENTITY|bullet|projectile|192|120|6|6|1
ENTITY|enemy|enemy|180|80|22|22|30
=== TICK 4 ===
HUD|HP:100|SCORE:100|LIVES:3
ENTITY|ship|player|180|300|24|24|100
ENTITY|bullet|projectile|192|40|6|6|1
ENTITY|enemy|enemy|180|100|22|22|0
GAME_MESSAGE|Enemy destroyed! +100 points
\`\`\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int hp = 100, score = 0, lives = 3;
    int shipX = 180, shipY = 300;
    int bulletX = 192, bulletY = 280, bulletSpeed = 80;
    int enemyX = 180, enemyY = 40, enemySpeed = 20;
    int enemyHp = 30;

    // TODO: Loop 4 ticks
    // Each tick:
    //   1. Print tick header
    //   2. Check hit BEFORE rendering: if bulletY <= enemyY + 22
    //      - Set enemyHp = 0 and score += 100
    //   3. Print HUD, ship, bullet, enemy entities
    //   4. If hit this tick, print GAME_MESSAGE
    //   5. Move bullet and enemy

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int hp = 100, score = 0, lives = 3;
    int shipX = 180, shipY = 300;
    int bulletX = 192, bulletY = 280, bulletSpeed = 80;
    int enemyX = 180, enemyY = 40, enemySpeed = 20;
    int enemyHp = 30;

    for (int tick = 1; tick <= 4; tick++) {
        cout << "=== TICK " << tick << " ===" << endl;

        bool hit = false;
        if (bulletY <= enemyY + 22) {
            enemyHp = 0;
            score += 100;
            hit = true;
        }

        cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
        cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|" << hp << endl;
        cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;
        cout << "ENTITY|enemy|enemy|" << enemyX << "|" << enemyY << "|22|22|" << enemyHp << endl;

        if (hit) {
            cout << "GAME_MESSAGE|Enemy destroyed! +100 points" << endl;
        }

        bulletY -= bulletSpeed;
        enemyY += enemySpeed;
    }

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should show enemy with 0 HP on hit tick",
        expectedOutput: "ENTITY\\|enemy\\|enemy\\|.*\\|0",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should show destruction message",
        expectedOutput: "GAME_MESSAGE\\|Enemy destroyed! \\+100 points",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should update score to 100",
        expectedOutput: "SCORE:100",
        isPattern: true,
      },
    ],
    hints: [
      "Check the hit condition before rendering: `if (bulletY <= enemyY + 22)`.",
      "Use a `bool hit = false;` flag to track whether a hit happened this tick, then print the message after entities.",
      "Move bullet and enemy at the END of each tick: `bulletY -= bulletSpeed; enemyY += enemySpeed;`",
    ],
    estimatedMinutes: 7,
  },
};
