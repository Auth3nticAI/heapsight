import type { GameLessonVariant } from "@/types/game";

export const lesson10RPG: GameLessonVariant = {
  lessonId: "rpg-10-pickup",

  instructions: `# Pickup Gold — Phase 1 Complete

## Mental Model

The loop completes. Kill → drop → collect. Three states, three transitions. Enemy alive → enemy dead. Gold on floor → gold collected. Player inventory empty → player inventory full. Each transition is a condition check that fires exactly once. Data drives every step.

There is a pattern here. Every interaction in a game is a state machine with two states and one trigger. Enemy: alive/dead, trigger is HP reaching zero. Gold: active/collected, trigger is player position matching gold position. Door: closed/open, trigger is player having a key. Chest: unopened/empty, trigger is player pressing interact. Same pattern. Different data. That is the whole game.

## What Breaks Without This

Without the pickup trigger, the loop cannot close. The player kills. The gold appears. The player walks over it. Nothing happens. The economy is broken at the last step. In design terms: the reward is visible but unreachable. Players will feel the loop is incomplete — because it is. Feedback loops must close. This lesson closes the loop.

## The Fix

After every movement, check whether the player's position equals the gold's position and the gold is still active:

\\\`\\\`\\\`cpp
playerY -= 1; // move up
if (playerX == goldX && playerY == goldY && goldActive) {
    playerGold += goldValue;
    goldActive = false;
}
\\\`\\\`\\\`

The flag prevents double-collection. Once \\\`goldActive\\\` is false, the condition never fires again. The HUD updates to reflect the new inventory total.

## Pattern Insight

Position-equality interaction is one of the oldest patterns in games. Every grid game uses it. Pac-Man checks if Pac-Man's tile equals a pellet tile every frame. The pellet is removed. The score updates. Roguelikes check if the player stepped onto a trap tile. The trap fires. Your pickup is the same check: player tile equals gold tile, condition fires, state transfers. The pattern predates video games — it is how board games work too.

## Scalability Insight

One gold pickup becomes many by adding an array. Each element has \\\`x\\\`, \\\`y\\\`, \\\`value\\\`, and \\\`active\\\`. On movement, loop over every element. If position matches and active is true, collect it. An inventory system is just the collected elements tracked separately. A shop is the inventory displayed with buy/sell triggers. Your single gold pickup is the prototype for all of it.

## Your Task

Implement the full Phase 1 sequence in one program:

1. Enemy at (10,3), HP 30, \\\`alive = true\\\`
2. Player at (10,5), HP 100, \\\`playerGold = 0\\\`
3. Gold: \\\`goldActive = false\\\`, \\\`goldValue = 25\\\`
4. Move player up to (10,4) — adjacent to enemy
5. Attack 3 times (10 damage each). On death: \\\`alive = false\\\`, gold spawns at (10,3)
6. Move player up to (10,3). Pickup fires: \\\`playerGold += 25\\\`, \\\`goldActive = false\\\`
7. Render final 20x10 grid: \\\`@\\\` at (10,3). No \\\`E\\\`. No \\\`G\\\`.
8. Output:
   - \\\`GAME_MESSAGE|Phase 1 Complete: Kill, loot, collect!\\\`
   - \\\`HUD|HP:100|GOLD:25\\\`
   - \\\`SCORE|125\\\`

You have built a complete RPG loop from scratch. Grid. Entity. Movement. Combat. Death. Loot. Economy. This is Phase 1.

## Common Mistake (Beginner Trap)

Checking pickup before moving. The position check must happen after \\\`playerY -= 1;\\\`. Move first. Check after. The trigger fires on arrival. If you check before moving, the player never picks anything up no matter where they stand.

## Elite Insight (Diablo Loot Tables, Zelda Drops)

Diablo's billion-dollar loot loop started exactly here: enemy dies, item appears, player walks over it to collect. The treasure class system is just a probability distribution for step two. The pickup radius system is just a distance threshold for step three. Your code uses distance zero (exact tile match). Diablo uses a small radius. Diablo IV added auto-loot. But the state machine is the same: item active → item collected. The trigger was always position. The Diablo team scaled this pattern to handle millions of items across hundreds of player characters and thousands of monster types. The core remains a position check and a flag.

## Pattern Recognition

You have now implemented a complete feedback loop. The loop is: player acts → world responds → player benefits → player acts again. Attack → enemy dies → gold appears → player collects → player is stronger → player attacks again. This is the core of every RPG, from the original Rogue in 1980 to Path of Exile in 2013. The loop was always this. The content changed. The loop did not.

## Skill Reinforcement

- Full Phase 1 state machine: three entities, three flags, three transitions
- Sequencing: order of operations matters (move before check, combat before loot)
- Economy: playerGold is the output of the loop, the score that persists
- Data drives rendering: the grid shows current state, not past states

## Mastery Check

Why is Phase 1 a complete game? Because it has every element: a world (grid), an agent (player), an obstacle (enemy), a mechanic (combat), a reward (gold), and an economy (playerGold). Every RPG expansion from here adds more of the same: more enemies, more loot types, more mechanics. But the structure — the loop — does not change. You have built the loop. Everything else is content.`,

  starterCode: `#include <iostream>
using namespace std;

int main() {
    // === SETUP ===
    // Enemy: (10,3), HP 30, alive
    // Player: (10,5), HP 100, playerGold=0
    // Gold: inactive, value=25

    // === STEP 1: Move player up to (10,4) ===

    // === STEP 2: Attack 3 times (10 dmg each) ===
    // On death: alive=false, spawn gold at enemy position

    // === STEP 3: Move player up to (10,3) ===
    // Pickup check: if positions match and goldActive -> collect

    // === STEP 4: Render final 20x10 grid ===
    // @ at (10,3). No E. No G.

    // === STEP 5: Protocol output ===
    // GAME_MESSAGE|Phase 1 Complete: Kill, loot, collect!
    // HUD|HP:100|GOLD:25
    // SCORE|125

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // === SETUP ===
    int enemyX = 10, enemyY = 3;
    int enemyHP = 30;
    bool alive = true;

    int playerX = 10, playerY = 5;
    int playerHP = 100;
    int playerGold = 0;

    int goldX = 0, goldY = 0;
    bool goldActive = false;
    int goldValue = 25;

    // === STEP 1: Move player up to (10,4) ===
    playerY -= 1;
    // No pickup yet — gold not active

    // === STEP 2: Attack 3 times ===
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

    // === STEP 3: Move player up to (10,3) ===
    playerY -= 1;
    if (playerX == goldX && playerY == goldY && goldActive) {
        playerGold += goldValue;
        goldActive = false;
    }

    // === STEP 4: Render final grid ===
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

    // === STEP 5: Protocol output ===
    cout << "GAME_MESSAGE|Phase 1 Complete: Kill, loot, collect!" << endl;
    cout << "HUD|HP:100|GOLD:25" << endl;
    cout << "SCORE|125" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Enemy E does not appear in the final grid — it died",
      expectedOutput: "^(?!.*\\bE\\b).*$",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Gold G does not appear in the final grid — it was collected",
      expectedOutput: "^(?!.*\\bG\\b).*$",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Player @ appears at (10,3) in the final grid — row 3, column 10",
      expectedOutput: "#\\.{9}@\\.{9}#",
      isPattern: true,
    },
    {
      id: "g4",
      description: "HUD shows HP 100 and GOLD 25 after collection",
      expectedOutput: "HUD\\|HP:100\\|GOLD:25",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Game message announces Phase 1 complete",
      expectedOutput: "GAME_MESSAGE\\|Phase 1 Complete: Kill, loot, collect!",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Score is 125",
      expectedOutput: "SCORE\\|125",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Top wall renders correctly — 20 hash characters",
      expectedOutput: "####################",
      isPattern: true,
    },
  ],

  hints: [
    "The sequence is strict: move to (10,4), then attack 3 times, then move to (10,3). Each step enables the next.",
    "The death condition inside the attack loop sets \\\`goldActive = true\\\`. The pickup condition after the second move checks \\\`goldActive\\\`. These two flags are the handshake between combat and economy.",
    "After pickup, \\\`goldActive\\\` is false. In the render, \\\`goldActive && col == goldX && row == goldY\\\` is false. No \\\`G\\\` appears. The player's \\\`@\\\` occupies that cell instead.",
    "HUD|HP:100|GOLD:25 — the 25 comes from \\\`playerGold\\\` after the pickup. SCORE|125 is fixed for this lesson.",
    "You have mastered Phase 1. Grid rendering, entity state, movement, bounds, combat, death triggers, loot drops, pickup mechanics, and a working economy. Phase 2 builds on every one of these.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

// ==============================
// PHASE 1 COMPLETE — RPG CORE
// Lessons 1-10: Full Loop
// ==============================

// === UTILITIES ===
// isAdjacent: true if entities are within 1 tile (used in combat)
// |dx| + |dy| <= 1 means touching horizontally or vertically

bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx;
    int dy = ay - by;
    if (dx < 0) dx = -dx;
    if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

int main() {
    // === GRID ===
    // 20 columns x 10 rows
    // # = wall (border), . = floor (interior)
    // Rendered via nested loop — state drives output

    // === ENTITY STATE ===
    // Enemy
    int enemyX = 10, enemyY = 3;
    int enemyHP = 30;
    bool alive = true;

    // Player
    int playerX = 10, playerY = 5;
    int playerHP = 100;
    int playerGold = 0;

    // Gold (loot drop)
    int goldX = 0, goldY = 0;
    bool goldActive = false;
    int goldValue = 25;

    // === PHASE 1 SEQUENCE ===

    // Step 1: Move player up to (10,4) — adjacent to enemy
    playerY -= 1;

    // Step 2: Combat — 3 attacks of 10 damage each
    // Death trigger: alive flag + loot spawn
    int damage = 10;
    for (int i = 0; i < 3; i++) {
        enemyHP -= damage;
        if (enemyHP <= 0 && alive) {
            alive = false;
            goldX = enemyX;  // Loot spawns at enemy's last position
            goldY = enemyY;
            goldActive = true;
        }
    }

    // Step 3: Move player up to (10,3) — pickup trigger
    playerY -= 1;
    if (playerX == goldX && playerY == goldY && goldActive) {
        playerGold += goldValue;
        goldActive = false;  // Gold consumed — flag prevents double-collect
    }

    // === GRID RENDER ===
    // State-driven: reads current entity positions and flags
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
    cout << "GAME_MESSAGE|Phase 1 Complete: Kill, loot, collect!" << endl;
    cout << "HUD|HP:" << playerHP << "|GOLD:" << playerGold << endl;
    cout << "SCORE|125" << endl;

    return 0;
}
`,
};
