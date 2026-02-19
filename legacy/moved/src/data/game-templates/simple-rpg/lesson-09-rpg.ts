import type { GameLessonVariant } from "@/types/game";

export const lesson09RPG: GameLessonVariant = {
  lessonId: "rpg-09-loot",

  instructions: `# Gold Drop — Death Triggers Loot

## Mental Model

Death triggers loot. That is a game loop beginning to form. Kill → drop → collect. The enemy carries no gold while alive. The moment HP reaches zero, a state transfer fires: the enemy's position becomes the gold's position. Two entities share one coordinate at the moment of transition. Then the enemy vanishes and the gold remains.

There is a pattern here. Data flows from one state to another. \\\`enemyX\\\` and \\\`enemyY\\\` were the enemy's data. Now they are copied to \\\`goldX\\\` and \\\`goldY\\\`. The enemy's position becomes the gold's birth position. Data transforms: entity → coordinates → new entity. That is not random. That is designed.

## What Breaks Without This

Without the death trigger, killing enemies is a dead end. The dungeon empties of threats but fills with nothing. No reward appears. The player has no reason to fight. The loop never closes. In game design terms: the feedback loop is broken. Action (attack) has no meaningful consequence (reward).

## The Fix

The fix is a condition on death. After reducing HP, check if HP has dropped to zero or below. If it has, and the enemy is still marked alive, flip the flag and transfer the position:

\\\`\\\`\\\`cpp
enemyHP -= damage;
if (enemyHP <= 0 && alive) {
    alive = false;
    goldX = enemyX;
    goldY = enemyY;
    goldActive = true;
}
\\\`\\\`\\\`

Then render: the enemy tile is gone. The gold tile appears in its place. The grid reads current state, not history.

## Pattern Insight

In Diablo, every monster has a loot table — a list of possible drops with probabilities. When HP hits zero, the engine samples from that table and spawns items at the monster's last coordinates. Here it is simple: enemy dies, gold appears. Same pattern. Smaller table. One entry, one hundred percent chance. The architecture is identical. Yours just has a table of one.

## Scalability Insight

The next step is an array. Instead of one \\\`goldActive\\\` boolean, you have an array of items. Each item has a position, a type, and an active flag. The loot table is another array: item types with drop weights. On death, roll a random index into the loot table, spawn that item at the enemy position. Your current code is the minimum viable loot system. The arrays are the Diablo loot system. Same trigger. More data.

## Your Task

Write the complete combat-to-loot sequence:

1. Enemy at (10, 3), HP 30, \\\`alive = true\\\`
2. Player at (10, 4), HP 100
3. Gold: \\\`goldX = 0\\\`, \\\`goldY = 0\\\`, \\\`goldActive = false\\\`
4. Attack 3 times (10 damage each). On death: set \\\`alive = false\\\`, copy enemy position to gold, set \\\`goldActive = true\\\`
5. Render the 20x10 grid: \\\`@\\\` at (10,4), \\\`G\\\` at (10,3), walls on edges, dots everywhere else
6. Output:
   - \\\`GAME_MESSAGE|Treasure gleams on the dungeon floor.\\\`
   - \\\`HUD|HP:100|GOLD:0\\\`
   - \\\`SCORE|100\\\`

Gold is on the floor. The player has not stepped on it yet. GOLD in the HUD stays at 0.

## Common Mistake (Beginner Trap)

Rendering the enemy after death. After setting \\\`alive = false\\\`, the enemy must not appear in the grid. Every render should check the alive flag first. If \\\`alive\\\` is false, that cell is empty floor — or gold, if gold is there. Never render a dead entity.

## Elite Insight (Diablo Loot Tables, Zelda Drops)

Diablo II's loot system is famous for its depth, but the core mechanic is what you just built. Monster dies, engine checks treasure class, item spawns at monster coordinates. The treasure class is just a weighted random selection from an array. Legend of Zelda: enemies drop rupees, hearts, or bombs. Each enemy type has a fixed drop table. A Stalfos always drops the same things. Your enemy always drops gold. Same system. Zelda's table has three entries. Yours has one. Diablo's tables have hundreds. The trigger is the same.

## Pattern Recognition

You have implemented the fundamental game event pattern: condition → trigger → state change → render. This pattern appears everywhere. Enemy HP reaches zero → death event → loot spawns. Player enters zone → trigger → cutscene starts. Timer reaches zero → trigger → level ends. Learn this pattern. You will use it in every game you build.

## Skill Reinforcement

- Boolean flags as entity lifecycle controllers (\\\`alive\\\`, \\\`goldActive\\\`)
- Position inheritance: new entity spawns at old entity's coordinates
- Condition-triggered state transitions
- Grid rendering reads current state — no memory of past states

## Mastery Check

Why set \\\`goldX = enemyX\\\` inside the death condition rather than at the start? Because you want the gold to appear where the enemy died — at its current position at the moment of death. If enemies could move (they will in later lessons), the spawn position must be captured at death time. You are already writing it correctly for a moving enemy, even though this enemy is stationary.`,

  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Enemy: position (10,3), HP 30, alive
    int enemyX = 10, enemyY = 3;
    int enemyHP = 30;
    bool alive = true;

    // Player: position (10,4), HP 100
    int playerX = 10, playerY = 4;
    int playerHP = 100;

    // Gold: inactive at start
    int goldX = 0, goldY = 0;
    bool goldActive = false;

    // TODO: Attack 3 times (10 damage each)
    // When enemyHP <= 0: set alive=false, goldX=enemyX, goldY=enemyY, goldActive=true

    // TODO: Render 20x10 grid
    // Walls: row 0, row 9, col 0, col 19
    // @ at (playerX, playerY)
    // G at (goldX, goldY) if goldActive
    // . everywhere else

    // TODO: Print protocol
    // GAME_MESSAGE|Treasure gleams on the dungeon floor.
    // HUD|HP:100|GOLD:0
    // SCORE|100

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Enemy setup
    int enemyX = 10, enemyY = 3;
    int enemyHP = 30;
    bool alive = true;

    // Player setup
    int playerX = 10, playerY = 4;
    int playerHP = 100;

    // Gold setup
    int goldX = 0, goldY = 0;
    bool goldActive = false;

    // Combat: 3 attacks of 10 damage
    int damage = 10;
    for (int i = 0; i < 3; i++) {
        enemyHP -= damage;
        if (enemyHP <= 0 && alive) {
            alive = false;
            goldX = enemyX;
            goldY = enemyY;
            goldActive = true;
        }
    }

    // Render 20x10 grid
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9) {
                cout << '#';
            } else if (col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerX && row == playerY) {
                cout << '@';
            } else if (goldActive && col == goldX && row == goldY) {
                cout << 'G';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }

    // Protocol output
    cout << "GAME_MESSAGE|Treasure gleams on the dungeon floor." << endl;
    cout << "HUD|HP:100|GOLD:0" << endl;
    cout << "SCORE|100" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Enemy E does not appear in the grid after death",
      expectedOutput: "^(?!.*\\bE\\b).*$",
      isPattern: true,
    },
    {
      id: "g2",
      description: "G appears in the grid at the enemy's former position (column 10, row 3)",
      expectedOutput: "#\\.{9}G",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Player @ appears at (10,4) in the grid",
      expectedOutput: "#\\.{9}@",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Game message announces treasure on the floor",
      expectedOutput: "GAME_MESSAGE\\|Treasure gleams on the dungeon floor\\.",
      isPattern: true,
    },
    {
      id: "g5",
      description: "HUD shows HP 100 and GOLD 0 — gold not yet collected",
      expectedOutput: "HUD\\|HP:100\\|GOLD:0",
      isPattern: true,
    },
  ],

  hints: [
    "Inside your attack loop, after \\\`enemyHP -= damage;\\\`, check \\\`if (enemyHP <= 0 && alive)\\\` to trigger the death-loot sequence.",
    "Grid render priority: check player position first, then gold (if \\\`goldActive\\\`), then walls, then floor. Order matters when entities share a cell.",
    "GOLD in the HUD stays at 0. The gold is on the dungeon floor, not in the player's inventory yet.",
    "No \\\`E\\\` should appear anywhere in your output. The enemy is dead. Its only trace is the \\\`G\\\` that inherited its position.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    // === GRID STATE ===
    // 20x10 dungeon: # walls on border, . interior

    // === PLAYER STATE ===
    int playerX = 10, playerY = 4;
    int playerHP = 100;

    // === ENEMY STATE ===
    int enemyX = 10, enemyY = 3;
    int enemyHP = 30;
    bool alive = true;

    // === GOLD STATE (loot drop) ===
    int goldX = 0, goldY = 0;
    bool goldActive = false;

    // === COMBAT (attack function pattern) ===
    // isAdjacent: |dx| + |dy| <= 1
    // attack: subtract 10 from enemyHP per hit
    int damage = 10;
    for (int i = 0; i < 3; i++) {
        enemyHP -= damage;
        if (enemyHP <= 0 && alive) {
            alive = false;
            goldX = enemyX;
            goldY = enemyY;
            goldActive = true;
        }
    }

    // === GRID RENDER ===
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9) {
                cout << '#';
            } else if (col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerX && row == playerY) {
                cout << '@';
            } else if (goldActive && col == goldX && row == goldY) {
                cout << 'G';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }

    // === PROTOCOL OUTPUT ===
    cout << "GAME_MESSAGE|Treasure gleams on the dungeon floor." << endl;
    cout << "HUD|HP:100|GOLD:0" << endl;
    cout << "SCORE|100" << endl;

    return 0;
}
`,
};
