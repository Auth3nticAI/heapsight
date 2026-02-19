import type { GameLessonVariant } from "@/types/game";

export const lesson04SpaceShooter: GameLessonVariant = {
  lessonId: "04-hit-or-miss",
  instructions: `# Hit or Miss — Bullets Pass Through Everything

Your bullet travels upward. The enemy travels downward. They occupy the same pixel at the same moment and nothing happens. The bullet phases through the enemy like a ghost. Your game has no interaction.

## What Breaks Without This

Without conditionals, the simulation is a screensaver. Entities move but never interact. The player fires but never kills anything. Score stays at zero forever. You have animation without gameplay. The entire combat system is missing.

## The Fix

Every game interaction is a boolean test executed every frame. Is the bullet's Y position within the enemy's vertical zone? That is one comparison: \`bulletY <= enemyY + 22\`. True means the bullet reached the enemy's hitbox. Apply damage. Set enemy HP to zero. Add 100 to score. False means miss — the bullet is still traveling.

This is the same pattern every engine uses. Quake's \`G_Damage\` checks range, line of sight, armor. Each check is a boolean. All true means damage applies. Your single proximity check is the seed of that system.

The bullet starts at y=280 moving up 80 per tick. The enemy starts at y=40 moving down 20 per tick. They converge around tick 4: bullet at y=40, enemy at y=100. The check fires, \`40 <= 100 + 22\` evaluates true, combat happens.

## Performance Note

Branch prediction. The CPU guesses which branch you take next. For 3 ticks you miss, then you hit. That consistent pattern is fast — the predictor learns it. Random branching in chaotic game states costs more. But even worst-case, a branch is a few nanoseconds. Conditionals are nearly free.

## Memory Note

A boolean is 1 byte in storage. But comparison happens in CPU registers. The \`if\` check itself allocates zero memory. The result stays in a flag register — hardware-level free.

## Your Task

1. Set up ship at (180, 300), bullet at (192, 280), enemy at (180, 40)
2. Bullet speed = 80 up per tick, enemy speed = 20 down per tick
3. Loop 4 ticks. Each tick: print header, check hit, render HUD + entities
4. Hit condition: \`bulletY <= enemyY + 22\`. On hit: enemyHp = 0, score += 100
5. On hit tick: print \`GAME_MESSAGE|Enemy destroyed! +100 points\`
6. Move bullet and enemy at end of each tick

## Beginner Trap

**Common Mistake:** Using \`=\` instead of \`==\` in comparisons. \`if (enemyHp = 0)\` assigns zero to enemyHp and evaluates as false. Your enemy dies silently and the hit never registers. Use \`<=\` for proximity checks. The compiler warns about assignment-in-condition but compiles it anyway.

## Elite Insight

Quake's combat: \`if (tr.fraction < 1.0)\` — did the trace hit something? \`if (ent->health > 0)\` — is it alive? \`if (distance < weapon->range)\` — in range? Same chain of booleans. Your proximity check is step one of a full combat pipeline.

## Cross-Path Echo

The Platformer path uses the same \`if\` pattern for ground collision: is the player's Y >= platform Y? True means land. False means fall. Different axis, identical boolean logic.`,
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
    //   1. Print "=== TICK N ==="
    //   2. Check hit: if (bulletY <= enemyY + 22)
    //      - Set enemyHp = 0, score += 100, set hit flag
    //   3. Print HUD, ship, bullet, enemy
    //   4. If hit this tick, print GAME_MESSAGE
    //   5. Move bullet up, enemy down

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
    { id: "g1", description: "Should show enemy with 0 HP on hit", expectedOutput: "ENTITY\\|enemy\\|enemy\\|.*\\|0", isPattern: true },
    { id: "g2", description: "Should show destruction message", expectedOutput: "GAME_MESSAGE\\|Enemy destroyed! \\+100 points", isPattern: true },
    { id: "g3", description: "Should update score to 100", expectedOutput: "SCORE:100", isPattern: true },
  ],
  hints: [
    "The hit check is `if (bulletY <= enemyY + 22)` — bullet has entered the enemy's hitbox zone.",
    "Use a `bool hit = false;` flag before the check, set it true on hit, then use it to conditionally print GAME_MESSAGE after entities.",
    "Move bullet and enemy at the END of each tick: `bulletY -= bulletSpeed; enemyY += enemySpeed;`",
  ],
  accumulatedCode: `#include <iostream>
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
};
