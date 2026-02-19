import type { GameLessonVariant } from "@/types/game";

export const lesson25RPG: GameLessonVariant = {
  lessonId: "rpg-25-mini-dungeon",

  instructions: `# Mini Dungeon — Milestone Complete

## THIS IS IT. YOU BUILT A DUNGEON RPG.

Two rooms. One hero. An economy. Combat. Loot. Room transitions. A diagnostics system. A save file. Everything connects. Everything works. You are not learning toy examples anymore — you built the structural DNA of every dungeon game ever made.

The badge is yours: **Dungeon Builder**.

## Mental Model

Everything connects. Grid, entities, combat, loot, rooms, save. That is a game. You built a dungeon RPG. Two rooms. One hero. An economy. A save system. This is what Zelda 1 started with.

Each lesson was a system. Lesson 1: grid. Lesson 6: combat. Lesson 9: loot. Lesson 10: pickup. Lesson 19: game states. Lesson 21: save/load. Lesson 22: error handling. Lesson 23: lambda queries. Lesson 24: diagnostics. Lesson 25: all of them. Together.

The mini dungeon is not a hello-world program pretending to be a game. It is a game with every foundational system in place. When id Software built Doom, they started here: player, rooms, enemies, pickups, save. They added more rooms (levels), more enemies (Imps, Barons), more pickups (weapons, armor, keys), and more save slots. The core loop — fight, loot, explore, save — was always this.

## What Breaks Without This

Any missing system breaks the playability. No game states: the title screen and gameplay bleed together. No diagnostics: you cannot debug the live system. No save: the player's progress vanishes on close. No room transitions: the dungeon has one room. No loot economy: killing enemies has no reward. Every system is load-bearing. The mini dungeon tests all of them together for the first time.

## The Fix

Build in the established sequence. Print the title. Render Room 0. Fight the enemy. Pick up gold. Transition to Room 1. Render Room 1. Run diagnostics. Save. Print the milestone. Every step depends on the previous. That dependency chain is the architecture of a game session.

\`\`\`cpp
// The state machine
cout << "=== DUNGEON RPG ===" << endl; // MENU
// -> enter PLAYING state
renderGrid(...); // Room 0
// -> combat
// -> loot
// -> transition
renderGrid(...); // Room 1
// -> diagnostics
// -> save
cout << "GAME_MESSAGE|Badge: Dungeon Builder unlocked!" << endl;
\`\`\`

## Pattern Insight

The mini dungeon is a vertical slice. Every feature is present, at minimal scope. One enemy per room instead of twenty. One loot drop instead of a table. One transition instead of a map. One save field per variable instead of a full serialization format. Vertical slices prove integration. Horizontal expansion (more content, more features) comes after. You built the slice. Expansion is straightforward from here.

## Scalability Insight

Add a third room: one more transition check at the east edge of Room 1. Add a second enemy to Room 0: one more entity in the arrays. Add a weapon pickup: one more active flag and position pair. Add a health potion: one more pickup type with a different effect. Add a third save field: one more variable in the snapshot. None of these additions require restructuring the core loop. The architecture is correct. Content is additive.

## Your Task (MILESTONE — CELEBRATE THIS)

You have done the work across 25 lessons. Now integrate it all:

**Game State:**
- Start in MENU. Print \`=== DUNGEON RPG ===\`
- Transition to PLAYING

**Room 0 — Fight and Loot:**
1. Render grid: @ at (3,5), E at (10,3)
2. HUD: \`HUD|HP:100|Gold:0|Room:0\`
3. Move player to (9,3) — adjacent to enemy
4. Attack 3×10 damage — enemy HP: 30→20→10→0
5. Print each attack: \`Attack! Enemy HP: X\`
6. On death: gold spawns at (10,3). Print \`Enemy defeated! Gold dropped at (10,3)\`
7. Move to (10,3) — pickup fires. Print \`Picked up 25 gold! Total: 25\`
8. DIAG: \`DIAG|frame=4|alive=0|dead=1|pool=1/20|room=0\`

**Room Transition:**
9. Move east to col 18. Print \`Room transition: 0 -> 1\`. room=1.

**Room 1 — New Enemies:**
10. Reset player to (1,5). Two enemies at (5,3) and (14,3).
11. Render grid.
12. HUD: \`HUD|HP:100|Gold:25|Room:1\`
13. DIAG: \`DIAG|frame=7|alive=2|dead=1|pool=3/20|room=1\`

**Save and Badge:**
14. Print \`Saving... wave=2 score=100 hp=100 gold=25\`
15. \`GAME_MESSAGE|Badge: Dungeon Builder unlocked!\`
16. \`SCORE|125\`

## Common Mistake

Checking DIAG counts before updating state. Run all state updates for a frame first, then call printDiagnostics. The DIAG line is a snapshot of state AFTER the frame completes. DIAG after frame 4 should show alive=0 because the enemy is already dead. If you call DIAG before setting enemyAlive=false, you get alive=1. Order matters.

## Elite Insight

Everything connects. Grid, entities, combat, loot, rooms, save. That is a game. You built a dungeon RPG. Two rooms. One hero. An economy. A save system. This is what Zelda 1 started with.

Nintendo's Legend of Zelda (1986): 8x8 overworld rooms, 9 dungeon rooms each, one hero, eight heart containers, 256 rupees max, eight dungeons, one save slot per cartridge. You have two rooms, one hero, 25 gold max right now, one level, one save. The structure is identical. The content differs by thirty-eight years of iteration. You built Zelda 1. The 1986 version. Miyamoto would recognize this code.

## Pattern Recognition

The milestone is an integration test. Integration tests are the most important tests in software. They catch assumption mismatches between systems. "I assumed loot spawns at enemyX,enemyY." Correct — we verified that. "I assumed pickup sets goldActive=false." Correct — we verified that. "I assumed room transition sets room=1." Correct. Every GAME_MESSAGE and DIAG line in this lesson is a checkpoint in the integration test. All ten tests passing means all joints connect.

## Skill Reinforcement

- State machine: MENU → PLAYING, game state as an integer flag
- Entity lifecycle: spawn → fight → die → loot → collect
- Economy: kill → gold → pickup → HUD update
- Room transitions: edge detection → state reset → new room render
- Diagnostics integration: DIAG lines after key frames, not just at end
- Save snapshot: wave, score, hp, gold — all persistent state in one print

## Mastery Check

Why is this a milestone lesson worth 300 XP instead of 125? Because integration is harder than implementation. Writing \`countWhere\` is one skill. Making \`countWhere\` queries show up in the HUD while the combat loop runs and the diagnostics system observes — that is a different skill. The milestone proves you can hold the whole system in your head at once. That skill is what separates engineers who build features from engineers who build products.

You built a product. Two rooms. A complete RPG loop. The badge is earned.`,

  starterCode: `#include <iostream>
using namespace std;

void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

void renderGrid(int px, int py,
                int ex1, int ey1, bool e1alive,
                int ex2, int ey2, bool e2alive,
                bool goldActive, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (e1alive && col == ex1 && row == ey1) {
                cout << 'E';
            } else if (e2alive && col == ex2 && row == ey2) {
                cout << 'E';
            } else if (goldActive && col == gx && row == gy) {
                cout << 'G';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    // === STATE ===
    int playerX = 3, playerY = 5;
    int playerHP = 100, playerGold = 0;

    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;

    int goldX = 0, goldY = 0;
    bool goldActive = false;
    int goldValue = 25;

    int room = 0;
    int wave = 2, score = 100;

    // TODO: MENU — print "=== DUNGEON RPG ==="

    // TODO: PLAYING — render Room 0 grid, print HUD|HP:100|Gold:0|Room:0

    // TODO: Move player to (9,3), print "Player moved to (9,3)"

    // TODO: Attack loop — 3 attacks of 10 dmg
    //   Print "Attack! Enemy HP: X" each time
    //   On death: enemyAlive=false, goldX=enemyX, goldY=enemyY, goldActive=true
    //   Print "Enemy defeated! Gold dropped at (10,3)"

    // TODO: Move player to (10,3), pickup check
    //   Print "Picked up 25 gold! Total: 25"

    // TODO: DIAG frame=4 — alive=0, dead=1, pool=1/20, room=0

    // TODO: Move east to col 18, print "Room transition: 0 -> 1", room=1

    // TODO: Reset playerX=1, playerY=5
    //   Render Room 1 with 2 enemies at (5,3) and (14,3)
    //   HUD|HP:100|Gold:25|Room:1

    // TODO: DIAG frame=7 — alive=2, dead=1, pool=3/20, room=1

    // TODO: Print "Saving... wave=2 score=100 hp=100 gold=25"
    // TODO: GAME_MESSAGE|Badge: Dungeon Builder unlocked!
    // TODO: SCORE|125

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

void renderGrid(int px, int py,
                int ex1, int ey1, bool e1alive,
                int ex2, int ey2, bool e2alive,
                bool goldActive, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (e1alive && col == ex1 && row == ey1) {
                cout << 'E';
            } else if (e2alive && col == ex2 && row == ey2) {
                cout << 'E';
            } else if (goldActive && col == gx && row == gy) {
                cout << 'G';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    int playerX = 3, playerY = 5;
    int playerHP = 100, playerGold = 0;

    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;

    int goldX = 0, goldY = 0;
    bool goldActive = false;
    int goldValue = 25;

    int room = 0;
    int wave = 2, score = 100;

    // === MENU ===
    cout << "=== DUNGEON RPG ===" << endl;

    // === Room 0 Render ===
    renderGrid(playerX, playerY,
               enemyX, enemyY, enemyAlive,
               -1, -1, false,
               goldActive, goldX, goldY);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:" << room << endl;

    // === Move to adjacent ===
    playerX = 9; playerY = 3;
    cout << "Player moved to (9,3)" << endl;

    // === Combat ===
    int damage = 10;
    for (int i = 0; i < 3; i++) {
        enemyHP -= damage;
        cout << "Attack! Enemy HP: " << enemyHP << endl;
        if (enemyHP <= 0 && enemyAlive) {
            enemyAlive = false;
            goldX = enemyX;
            goldY = enemyY;
            goldActive = true;
        }
    }
    cout << "Enemy defeated! Gold dropped at (10,3)" << endl;

    // === Pickup ===
    playerX = 10; playerY = 3;
    if (playerX == goldX && playerY == goldY && goldActive) {
        playerGold += goldValue;
        goldActive = false;
    }
    cout << "Picked up 25 gold! Total: " << playerGold << endl;

    // === DIAG frame 4 ===
    printDiagnostics(4, 0, 1, 1, 20, room);

    // === Room Transition ===
    playerX = 18;
    cout << "Room transition: 0 -> 1" << endl;
    room = 1;

    // === Room 1 ===
    playerX = 1; playerY = 5;
    int r1ex1 = 5,  r1ey1 = 3;
    int r1ex2 = 14, r1ey2 = 3;
    renderGrid(playerX, playerY,
               r1ex1, r1ey1, true,
               r1ex2, r1ey2, true,
               false, 0, 0);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:" << room << endl;

    // === DIAG frame 7 ===
    printDiagnostics(7, 2, 1, 3, 20, room);

    // === Save + Badge ===
    cout << "Saving... wave=" << wave << " score=" << score
         << " hp=" << playerHP << " gold=" << playerGold << endl;
    cout << "GAME_MESSAGE|Badge: Dungeon Builder unlocked!" << endl;
    cout << "SCORE|125" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Title screen prints MENU header",
      expectedOutput: "=== DUNGEON RPG ===",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Room 0 grid renders with wall borders",
      expectedOutput: "####################",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Room 0 HUD shows zero gold and room 0",
      expectedOutput: "HUD\\|HP:100\\|Gold:0\\|Room:0",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Player movement to adjacent position logged",
      expectedOutput: "Player moved to \\(9,3\\)",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Enemy defeated with gold drop message",
      expectedOutput: "Enemy defeated! Gold dropped at \\(10,3\\)",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Gold pickup message shows total of 25",
      expectedOutput: "Picked up 25 gold! Total: 25",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Frame 4 DIAG: 0 alive, 1 dead, pool 1/20, room 0",
      expectedOutput: "DIAG\\|frame=4\\|alive=0\\|dead=1\\|pool=1/20\\|room=0",
      isPattern: true,
    },
    {
      id: "g8",
      description: "Room transition message printed",
      expectedOutput: "Room transition: 0 -> 1",
      isPattern: true,
    },
    {
      id: "g9",
      description: "Room 1 HUD shows 25 gold and room 1",
      expectedOutput: "HUD\\|HP:100\\|Gold:25\\|Room:1",
      isPattern: true,
    },
    {
      id: "g10",
      description: "Badge unlocked GAME_MESSAGE printed",
      expectedOutput: "GAME_MESSAGE\\|Badge: Dungeon Builder unlocked!",
      isPattern: true,
    },
  ],

  hints: [
    "Start with the MENU print, then transition to PLAYING. Render Room 0 with @ at (3,5) and E at (10,3). Print the HUD.",
    "Combat: loop 3 times. Each iteration: enemyHP -= 10, print 'Attack! Enemy HP: X'. Inside the loop, check if enemyHP <= 0 && enemyAlive to set the death trigger exactly once.",
    "After combat: move playerX=10, playerY=3. Check pickup condition. If match and goldActive: playerGold+=25, goldActive=false. Print pickup message.",
    "DIAG frame 4: alive=0 (enemy dead), dead=1, pool=1 (one enemy was allocated), room=0. State is already updated before calling printDiagnostics.",
    "Room 1: playerX=1, playerY=5. Set r1ex1=5,r1ey1=3 and r1ex2=14,r1ey2=3. DIAG frame 7: alive=2, dead=1, pool=3 (1 from Room 0 + 2 new).",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

// ==============================
// RPG CORE — Lesson 25
// MILESTONE: Mini Dungeon Complete
// Two rooms. One hero. An economy. A save system.
// ==============================

// === DIAGNOSTICS — Read-Only Observer ===
void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

// === GRID RENDER — State-Driven ===
// Supports two enemy slots + one gold slot
void renderGrid(int px, int py,
                int ex1, int ey1, bool e1alive,
                int ex2, int ey2, bool e2alive,
                bool goldActive, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (e1alive && col == ex1 && row == ey1) {
                cout << 'E';
            } else if (e2alive && col == ex2 && row == ey2) {
                cout << 'E';
            } else if (goldActive && col == gx && row == gy) {
                cout << 'G';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    // === PLAYER ===
    int playerX = 3, playerY = 5;
    int playerHP = 100, playerGold = 0;

    // === ROOM 0 ENEMY ===
    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;

    // === LOOT ===
    int goldX = 0, goldY = 0;
    bool goldActive = false;
    int goldValue = 25;

    // === PERSISTENT STATE ===
    int room = 0;
    int wave = 2, score = 100;

    // =========================================================
    // GAME SESSION — Full 8-Frame Sequence
    // =========================================================

    // === MENU State ===
    cout << "=== DUNGEON RPG ===" << endl;

    // === PLAYING State: Room 0 Initial Render ===
    renderGrid(playerX, playerY,
               enemyX, enemyY, enemyAlive,
               -1, -1, false,
               goldActive, goldX, goldY);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:" << room << endl;

    // === Frame 3: Move to Adjacent ===
    playerX = 9; playerY = 3;
    cout << "Player moved to (9,3)" << endl;

    // === Frame 4: Combat ===
    int damage = 10;
    for (int i = 0; i < 3; i++) {
        enemyHP -= damage;
        cout << "Attack! Enemy HP: " << enemyHP << endl;
        if (enemyHP <= 0 && enemyAlive) {
            enemyAlive = false;
            goldX = enemyX;  // loot spawns at death position
            goldY = enemyY;
            goldActive = true;
        }
    }
    cout << "Enemy defeated! Gold dropped at (10,3)" << endl;

    // === Frame 5: Pickup ===
    playerX = 10; playerY = 3;
    if (playerX == goldX && playerY == goldY && goldActive) {
        playerGold += goldValue;
        goldActive = false;  // flag prevents double-collect
    }
    cout << "Picked up 25 gold! Total: " << playerGold << endl;

    // Diagnostics: post-combat snapshot
    printDiagnostics(4, 0, 1, 1, 20, room);

    // === Frame 6: Room Transition ===
    playerX = 18;
    cout << "Room transition: 0 -> 1" << endl;
    room = 1;

    // === Frame 7: Room 1 ===
    playerX = 1; playerY = 5;
    int r1ex1 = 5,  r1ey1 = 3;
    int r1ex2 = 14, r1ey2 = 3;
    renderGrid(playerX, playerY,
               r1ex1, r1ey1, true,
               r1ex2, r1ey2, true,
               false, 0, 0);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:" << room << endl;

    // Diagnostics: post-transition snapshot
    printDiagnostics(7, 2, 1, 3, 20, room);

    // === Frame 8: Save + Milestone ===
    cout << "Saving... wave=" << wave << " score=" << score
         << " hp=" << playerHP << " gold=" << playerGold << endl;
    cout << "GAME_MESSAGE|Badge: Dungeon Builder unlocked!" << endl;
    cout << "SCORE|125" << endl;

    return 0;
}
`,
};
