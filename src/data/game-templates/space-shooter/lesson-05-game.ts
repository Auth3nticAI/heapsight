import type { GameLessonVariant } from "@/types/game";

export const lesson05SpaceShooter: GameLessonVariant = {
  lessonId: "05-damage-function",
  instructions: `# Damage Function — Copy-Pasted Math Everywhere

Your damage logic is inline. \`enemyHp = enemyHp - 10; if (enemyHp < 0) enemyHp = 0;\` copy-pasted three times in the tick loop. Want to add armor? Edit three places. Want to add critical hits? Edit three places. Miss one and your game has inconsistent damage. This does not scale.

## What Breaks Without This

Every damage calculation is a separate copy of the same math. Change the formula in one place and the others diverge. Add a new weapon type and you copy-paste again. The codebase grows linearly with every feature. Bugs hide in the copies you forgot to update.

## The Fix

A function is a system. Input goes in, transform happens, output comes out. \`int applyDamage(int currentHp, int damage)\` takes the current HP and damage amount, subtracts, clamps at zero, returns the new HP. One function. One formula. Called from every combat interaction. Change it once and every weapon, every enemy type, every damage source updates.

This is system isolation. The damage system has exactly one entry point. You can test it independently: \`applyDamage(30, 10)\` returns 20. \`applyDamage(5, 10)\` returns 0 (clamped). Predictable. Deterministic. No side effects.

Write the function above \`main\`. The clamp is critical: \`int hp = currentHp - damage; if (hp < 0) hp = 0; return hp;\`. Without the clamp, HP goes negative. Your HUD shows -5 HP. Your death check fails because you test \`== 0\` but HP skipped past zero to -5. Clamping prevents an entire class of bugs.

## Performance Note

Function call cost: push two ints to stack, jump to function address, execute, return. A few nanoseconds. The compiler can inline this — the function body replaces the call site. In release builds, \`applyDamage\` vanishes. The compiled code is identical to writing the math inline. Zero overhead abstraction.

## Memory Note

Two int parameters = 8 bytes on the stack. Return value lands in a CPU register. Stack allocation is a pointer bump — the fastest allocation that exists. No heap. No allocation overhead. The function's stack frame is created and destroyed in the same instruction.

## Your Task

1. Write \`int applyDamage(int currentHp, int damage)\` above main — subtract and clamp at 0
2. Set up ship at (180, 300), enemy at (180, 60) with 30 HP
3. Simulate 3 ticks. Each tick: call \`applyDamage(enemyHp, 10)\`, save old HP for the message
4. Render HUD, ship, bullet (moving down 30 per tick), enemy with updated HP
5. On hit: print \`GAME_MESSAGE|Hit! Enemy HP: oldHp -> newHp\`
6. On kill (HP reaches 0): print \`GAME_MESSAGE|KILL! Enemy HP: 10 -> 0 (+100 points)\` and \`SCORE|100\`

## Beginner Trap

**Common Mistake:** Modifying a parameter inside the function and expecting the caller's variable to change. C++ passes by value. Inside \`applyDamage\`, \`currentHp\` is a copy. You must \`return\` the result and assign it: \`enemyHp = applyDamage(enemyHp, damage);\`. Forgetting the assignment means your function runs, computes correctly, and the result is thrown away.

## Elite Insight

Unreal Engine's damage pipeline: \`UGameplayStatics::ApplyDamage(AActor* target, float damage, ...)\`. Same pattern at industrial scale. One entry point. Damage type, instigator, hit location — all parameters. Your two-parameter function is the seed of that system. Lesson 39 revisits this with a full damage system. The function signature grows but the principle is identical.

## Cross-Path Echo

The RPG path writes \`applyDamage(hp, attack - defense)\` for turn-based combat. The Robotics path writes \`applyForce(velocity, force)\` for motor control. Same pattern — isolate the transform, call it everywhere.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// TODO: Write applyDamage function
// int applyDamage(int currentHp, int damage)
// Subtract damage from currentHp, clamp at 0, return result

int main() {
    int hp = 100, score = 0, lives = 3;
    int shipX = 180, shipY = 300;
    int bulletX = 192, bulletY = 280;
    int enemyX = 180, enemyY = 60;
    int enemyHp = 30;
    int damage = 10;

    // TODO: Loop 3 ticks
    // Each tick:
    //   1. Save oldHp, call applyDamage
    //   2. If kill (oldHp > 0 && enemyHp == 0), add 100 to score
    //   3. Move bullet (bulletY -= 30)
    //   4. Print tick header, HUD, ship, bullet, enemy
    //   5. Print hit or kill message

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
    { id: "g1", description: "Should show enemy HP dropping to 20", expectedOutput: "Enemy HP: 30 -> 20", isPattern: true },
    { id: "g2", description: "Should show kill message on third hit", expectedOutput: "KILL! Enemy HP: 10 -> 0", isPattern: true },
    { id: "g3", description: "Should show final score of 100", expectedOutput: "SCORE\\|100", isPattern: true },
  ],
  hints: [
    "Write `applyDamage` above main: `int hp = currentHp - damage; if (hp < 0) hp = 0; return hp;`",
    "Save old HP before the call: `int oldHp = enemyHp; enemyHp = applyDamage(enemyHp, damage);`",
    "Detect kill with `if (oldHp > 0 && enemyHp == 0)` — that is the exact frame the enemy transitions from alive to dead.",
  ],
  accumulatedCode: `#include <iostream>
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
};
