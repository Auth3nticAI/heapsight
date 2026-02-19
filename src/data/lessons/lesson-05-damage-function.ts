import type { Lesson } from "@/types/lesson";

export const lesson05: Lesson = {
  id: "05-damage-function",
  title: "Damage Function",
  description: "Extract damage logic into a reusable function with parameters and return values.",
  order: 5,
  xpReward: 100,
  tier: "free",
  concepts: ["functions", "parameters", "return values", "system isolation"],
  part1: {
    title: "Concept: Functions",
    type: "concept",
    instructions: `# Damage Function

A function IS a system. Input goes in. Transform happens. Output comes out. No side effects means predictable. This is how engine systems work.

## Function Anatomy

\`\`\`cpp
int applyDamage(int currentHp, int damage) {
    int hp = currentHp - damage;
    if (hp < 0) hp = 0;
    return hp;
}
\`\`\`

- \`int\` before the name — return type
- \`currentHp\`, \`damage\` — parameters (inputs)
- \`return hp;\` — output sent back to the caller

## What Breaks Without This

Without functions, damage logic is copy-pasted everywhere. Change the formula? Fix it in 50 places. Miss one and you have a bug. Want to add armor? Edit every copy. Want to clamp at zero? Hope you found them all.

## The Fix

One function. One formula. Used everywhere. \`applyDamage(currentHp, damage)\` takes current HP and damage amount, subtracts, clamps at zero, returns the result. Change the formula once and every damage interaction updates. This is system isolation — the damage system has one entry point.

## Performance Note

Function call overhead: push parameters to stack, jump to address, return. A few nanoseconds. The compiler can inline small functions — zero overhead. \`applyDamage\` is a prime candidate for inlining. In release builds, the function call vanishes entirely.

## Memory Note

Parameters go on the stack. Two ints = 8 bytes. The return value lands in a register. Instant. Stack allocation is a pointer bump — the fastest allocation possible.

## Beginner Trap

Modifying a parameter thinking it changes the original. C++ passes by value by default. Inside the function, \`currentHp\` is a copy. Changing it does nothing to the caller's variable. You must \`return\` the result and assign it.

## Elite Insight

Unreal Engine's damage pipeline: \`UGameplayStatics::ApplyDamage(target, amount, type)\`. Same pattern. Your function is the seed of that system. One entry point, predictable output, testable in isolation.

## Your Task

1. Write \`int applyDamage(int currentHp, int damage)\` that subtracts damage and clamps at 0
2. In \`main\`, start with \`enemyHp = 30\` and apply 10 damage four times
3. Print each result and detect when the enemy is destroyed

Expected output:
\`\`\`
Enemy HP: 30
applyDamage(30, 10) = 20
applyDamage(20, 10) = 10
applyDamage(10, 10) = 0
applyDamage(0, 10) = 0
Enemy destroyed after 3 hits
\`\`\`

The function clamps at 0. The fourth call returns 0 again. Count hits until HP first reaches 0.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write applyDamage function
// Takes currentHp and damage, returns currentHp - damage (clamped to 0)

int main() {
    int enemyHp = 30;
    int damage = 10;
    int hits = 0;

    cout << "Enemy HP: " << enemyHp << endl;

    // TODO: Apply damage 4 times in a loop
    // Each iteration:
    //   1. Call applyDamage and store result back in enemyHp
    //   2. Print "applyDamage(oldHp, 10) = newHp"
    //   3. If enemyHp > 0 before this hit, increment hits

    // TODO: Print "Enemy destroyed after N hits"

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int applyDamage(int currentHp, int damage) {
    int hp = currentHp - damage;
    if (hp < 0) hp = 0;
    return hp;
}

int main() {
    int enemyHp = 30;
    int damage = 10;
    int hits = 0;

    cout << "Enemy HP: " << enemyHp << endl;

    for (int i = 0; i < 4; i++) {
        int oldHp = enemyHp;
        enemyHp = applyDamage(enemyHp, damage);
        cout << "applyDamage(" << oldHp << ", " << damage << ") = " << enemyHp << endl;
        if (oldHp > 0 && enemyHp == 0) {
            hits = i + 1;
        }
    }

    cout << "Enemy destroyed after " << hits << " hits" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should show damage reducing HP to 20",
        expectedOutput: "applyDamage\\(30, 10\\) = 20",
        isPattern: true,
      },
      {
        id: "t2",
        description: "Should clamp HP at 0",
        expectedOutput: "applyDamage\\(0, 10\\) = 0",
        isPattern: true,
      },
      {
        id: "t3",
        description: "Should report 3 hits to destroy",
        expectedOutput: "Enemy destroyed after 3 hits",
        isPattern: true,
      },
    ],
    hints: [
      "The function signature is `int applyDamage(int currentHp, int damage)` — subtract and clamp: `if (hp < 0) hp = 0;`",
      "Save the old HP before calling: `int oldHp = enemyHp;` then `enemyHp = applyDamage(enemyHp, damage);`",
      "The enemy is destroyed when `oldHp > 0 && enemyHp == 0` — that transition happens on the 3rd hit.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Combat System",
    type: "game_builder",
    instructions: `# Game Builder: Three-Hit Kill

Wire the damage function into a full combat scene. Ship fires three shots. Each hit calls \`applyDamage\`. The enemy's HP drops 30 to 20 to 10 to 0. Kill confirmed on the third hit.

## Your Task

1. Write \`int applyDamage(int currentHp, int damage)\` with clamp at 0
2. Ship at (180, 300), enemy at (180, 60), bullet at (192, 280)
3. Simulate 3 ticks. Each tick: bullet hits enemy, apply 10 damage
4. Show HUD with score, render all entities, show damage per tick
5. On kill (HP reaches 0): add 100 to score and print kill message

Expected output:
\`\`\`
=== TICK 1 ===
HUD|HP:100|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|100
ENTITY|bullet|projectile|192|250|6|6|1
ENTITY|enemy|enemy|180|60|22|22|20
GAME_MESSAGE|Hit! Enemy HP: 30 -> 20
=== TICK 2 ===
HUD|HP:100|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|100
ENTITY|bullet|projectile|192|220|6|6|1
ENTITY|enemy|enemy|180|60|22|22|10
GAME_MESSAGE|Hit! Enemy HP: 20 -> 10
=== TICK 3 ===
HUD|HP:100|SCORE:100|LIVES:3
ENTITY|ship|player|180|300|24|24|100
ENTITY|bullet|projectile|192|190|6|6|1
ENTITY|enemy|enemy|180|60|22|22|0
GAME_MESSAGE|KILL! Enemy HP: 10 -> 0 (+100 points)
SCORE|100
\`\`\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

// TODO: Write applyDamage function

int main() {
    int hp = 100, score = 0, lives = 3;
    int shipX = 180, shipY = 300;
    int bulletX = 192, bulletY = 280;
    int enemyX = 180, enemyY = 60;
    int enemyHp = 30;
    int damage = 10;

    // TODO: Loop 3 ticks
    // Each tick:
    //   1. Save oldHp, call applyDamage to get new enemyHp
    //   2. If enemyHp reached 0, add 100 to score
    //   3. Move bullet down by 30 (visual only)
    //   4. Print tick header, HUD, entities
    //   5. Print hit/kill message with old -> new HP

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int applyDamage(int currentHp, int damage) {
    int hp = currentHp - damage;
    if (hp < 0) hp = 0;
    return hp;
}

int main() {
    int hp = 100, score = 0, lives = 3;
    int shipX = 180, shipY = 300;
    int bulletX = 192, bulletY = 280;
    int enemyX = 180, enemyY = 60;
    int enemyHp = 30;
    int damage = 10;

    for (int tick = 1; tick <= 3; tick++) {
        int oldHp = enemyHp;
        enemyHp = applyDamage(enemyHp, damage);
        bulletY -= 30;

        bool killed = (oldHp > 0 && enemyHp == 0);
        if (killed) {
            score += 100;
        }

        cout << "=== TICK " << tick << " ===" << endl;
        cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
        cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|" << hp << endl;
        cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;
        cout << "ENTITY|enemy|enemy|" << enemyX << "|" << enemyY << "|22|22|" << enemyHp << endl;

        if (killed) {
            cout << "GAME_MESSAGE|KILL! Enemy HP: " << oldHp << " -> " << enemyHp << " (+100 points)" << endl;
            cout << "SCORE|" << score << endl;
        } else {
            cout << "GAME_MESSAGE|Hit! Enemy HP: " << oldHp << " -> " << enemyHp << endl;
        }
    }

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should show enemy HP dropping to 20",
        expectedOutput: "Enemy HP: 30 -> 20",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should show kill message on third hit",
        expectedOutput: "KILL! Enemy HP: 10 -> 0",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should show final score of 100",
        expectedOutput: "SCORE\\|100",
        isPattern: true,
      },
    ],
    hints: [
      "Write `applyDamage` above main: subtract damage, clamp with `if (hp < 0) hp = 0;`, return.",
      "Save `int oldHp = enemyHp;` before calling the function so you can show the transition.",
      "Check `if (oldHp > 0 && enemyHp == 0)` to detect the kill — that is the frame the enemy dies.",
    ],
    estimatedMinutes: 7,
  },
};
