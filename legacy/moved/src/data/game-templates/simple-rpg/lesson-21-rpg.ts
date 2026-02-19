import type { GameLessonVariant } from "@/types/game";

export const lesson21RPG: GameLessonVariant = {
  lessonId: "rpg-21-hud",

  instructions: `# HUD System — Observer Pattern Seed

## Mental Model

The HUD pattern: observe game state, format for display. The HUD never changes state, only reads it. That's the Observer pattern seed.

The HUD function is a snapshot machine. Feed it the current values of HP, gold, room, enemies. It formats and prints. It does not care how those values got there. It does not care what happens next. It reads the current moment and reports it. Call it before combat and you get the pre-fight status. Call it after and you get the post-fight damage. The function is identical. The output reflects the state it received.

This is why the Observer pattern is so powerful: the display layer is completely decoupled from the logic layer. The logic layer does not know the HUD exists. The HUD does not know how combat works. They are connected by the values passed between them. Change the combat formula? The HUD still works. Change the HUD format? Combat still works. Zero coupling. Maximum flexibility.

## What Breaks Without This

Without the HUD, the player fights blind. They deal damage. They take hits. They collect gold. Nothing visible confirms any of it. The grid shows positions — not consequences. The HP integer changes internally but the display never reflects it. The game is correct but unreadable. Players quit games they cannot read. Feedback is not optional. The HUD is the feedback system.

## The Fix

\\\`\\\`\\\`cpp
void printHUD(int hp, int maxHP, int atk, int gold,
              int roomId, string roomName, int enemies) {
    // Header
    cout << "=== " << roomName << " (Room " << roomId << ") ===" << endl;

    // HP bar — ratio to 10 chars, multiply before divide
    int filled = (hp * 10) / maxHP;
    cout << "HP: [";
    for (int i = 0; i < 10; i++) cout << (i < filled ? '#' : '.');
    cout << "] " << hp << "/" << maxHP << endl;

    // Stats
    cout << "ATK: " << atk << "  GOLD: " << gold << endl;
    cout << "Enemies: " << enemies << " alive" << endl;

    // Protocol line — machine-readable
    cout << "HUD|HP:" << hp << "|GOLD:" << gold << endl;
}
\\\`\\\`\\\`

Call after every state change: after combat, after pickup, after transition. The HUD is always accurate because it always reads live values.

## Pattern Insight

In Unity, MonoBehaviour components that update UI are pure observers. A HealthBarUI script subscribes to an OnHealthChanged event from the Player component. When health changes, the event fires, the bar updates. No polling. No coupling. Your \\\`printHUD\\\` function is the polling version of the same pattern: you call it explicitly after state changes rather than subscribing to automatic notifications. Both are valid. Polling is simpler to implement. Events are more scalable. You are at step one.

## Scalability Insight

The next step is a full UI system: a list of display components, each observing a different piece of state. The mana bar observes mana. The XP bar observes experience. The minimap observes room layout. Each component is a function that reads one piece of state and formats one output. Compose them to build the full HUD. Your \\\`printHUD\\\` function is the first component. Break it into smaller observers as the game grows.

## Your Task

Write the complete combat-and-HUD sequence:

1. Player: HP=100, maxHP=100, ATK=10, GOLD=0 at (10,5) in Room 1 "Dark Chamber"
2. Enemy 1 at (5,3), HP=20. Enemy 2 at (8,5), HP=20.
3. Combat: enemy 1 hits player (15 damage), player kills enemy 1 (20 damage, dies), enemy 2 hits player (10 damage)
4. Player HP ends at 75. AliveCount = 1 (enemy 2 survives).
5. Render final grid: @ at (10,5), E at (8,5), enemy 1 removed
6. Call printHUD(75, 100, 10, 0, 1, "Dark Chamber", 1)
7. Output:
   - \\\`GAME_MESSAGE|The HUD reflects reality.\\\`

## Common Mistake (Beginner Trap)

Calling printHUD with pre-combat values. The function should be called AFTER all combat resolves, reading the final state. If you call it before the last enemy attack, the HP is wrong. If you call it before counting survivors, the enemy count is wrong. Snapshot timing matters. Take the snapshot at the moment you want to display.

## Elite Insight (WoW, Diablo)

World of Warcraft renders 30+ data points in the UI every frame: HP, mana, buffs, debuffs, cooldowns, threat, combat log, minimap, chat. Each one is an observer over a specific piece of game state. The UI addon system (Lua-based) lets players write custom observers over any exported game state value. Diablo's UI is similar: stat panels, item tooltips, skill cooldowns, health orbs — all observers, all reading from the same authoritative game state. Your \\\`printHUD\\\` function is the seed. A UI system is an array of these functions with a scheduler that calls them each frame.

## Pattern Recognition

Observer-style display is not just a game pattern — it is the dominant pattern for all reactive UIs. React.js components observe state. Vue components observe reactive data. SwiftUI views observe observable objects. Angular components observe RxJS streams. Every modern UI framework is built on the Observer pattern you just implemented in its most elemental form. The pattern scales from a C++ terminal function to a billion-user web application without changing its fundamental shape.

## Skill Reinforcement

- printHUD: pure observer function, reads state, writes display
- HP bar formula: filled = (hp * barWidth) / maxHP — multiply first
- Combat sequencing: resolve all damage before calling HUD
- aliveCount: sum the alive flags after combat, pass to HUD
- Protocol line: machine-readable data for automated testing

## Mastery Check

Why is the HP bar formula \\\`(hp * 10) / maxHP\\\` instead of \\\`(hp / maxHP) * 10\\\`? Integer division. \\\`hp / maxHP\\\` with integers gives 0 for any HP below maxHP, and 1 only when hp equals maxHP. Multiplying by 10 first gives a number in the 0-1000 range before dividing by maxHP. The result is the bar fill count in 0-10. This is why order of operations matters in integer arithmetic. The formula is a fixed-point ratio calculation.`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

void printHUD(int hp, int maxHP, int atk, int gold,
              int roomId, string roomName, int enemies) {
    cout << "=== " << roomName << " (Room " << roomId << ") ===" << endl;
    int filled = (hp * 10) / maxHP;
    cout << "HP: [";
    for (int i = 0; i < 10; i++) cout << (i < filled ? '#' : '.');
    cout << "] " << hp << "/" << maxHP << endl;
    cout << "ATK: " << atk << "  GOLD: " << gold << endl;
    cout << "Enemies: " << enemies << " alive" << endl;
    cout << "HUD|HP:" << hp << "|GOLD:" << gold << endl;
}

int main() {
    // Player: HP=100, maxHP=100, ATK=10, GOLD=0, position (10,5)
    // Room 1: "Dark Chamber"

    // Enemy 1: (5,3), HP=20, alive=true
    // Enemy 2: (8,5), HP=20, alive=true

    // === COMBAT SEQUENCE ===
    // Enemy 1 hits player: playerHP -= 15
    // Player kills enemy 1: e1HP -= 20 -> e1alive=false
    // Enemy 2 hits player: playerHP -= 10

    // Count aliveCount after combat

    // === RENDER FINAL GRID ===
    // @ at (10,5), E at e2 position only (e1 is dead)

    // === PRINT HUD ===
    // printHUD(playerHP, 100, 10, 0, 1, "Dark Chamber", aliveCount)

    // === PROTOCOL ===
    // GAME_MESSAGE|The HUD reflects reality.

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

void printHUD(int hp, int maxHP, int atk, int gold,
              int roomId, string roomName, int enemies) {
    cout << "=== " << roomName << " (Room " << roomId << ") ===" << endl;
    int filled = (hp * 10) / maxHP;
    cout << "HP: [";
    for (int i = 0; i < 10; i++) cout << (i < filled ? '#' : '.');
    cout << "] " << hp << "/" << maxHP << endl;
    cout << "ATK: " << atk << "  GOLD: " << gold << endl;
    cout << "Enemies: " << enemies << " alive" << endl;
    cout << "HUD|HP:" << hp << "|GOLD:" << gold << endl;
}

int main() {
    // Player
    int playerX = 10, playerY = 5;
    int playerHP = 100, maxHP = 100;
    int playerATK = 10, playerGold = 0;

    // Enemy 1
    int e1x = 5, e1y = 3;
    int e1HP = 20;
    bool e1alive = true;

    // Enemy 2
    int e2x = 8, e2y = 5;
    int e2HP = 20;
    bool e2alive = true;

    // === COMBAT SEQUENCE ===
    playerHP -= 15;               // Enemy 1 hits player

    e1HP -= 20;                   // Player kills enemy 1
    if (e1HP <= 0 && e1alive) e1alive = false;

    playerHP -= 10;               // Enemy 2 hits player

    // Count survivors
    int aliveCount = 0;
    if (e1alive) aliveCount++;
    if (e2alive) aliveCount++;

    // === RENDER FINAL GRID ===
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9) {
                cout << '#';
            } else if (col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerX && row == playerY) {
                cout << '@';
            } else if (e1alive && col == e1x && row == e1y) {
                cout << 'E';
            } else if (e2alive && col == e2x && row == e2y) {
                cout << 'E';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }

    // === PRINT HUD ===
    printHUD(playerHP, maxHP, playerATK, playerGold, 1, "Dark Chamber", aliveCount);

    // === PROTOCOL ===
    cout << "GAME_MESSAGE|The HUD reflects reality." << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Player @ appears in the rendered grid at (10,5)",
      expectedOutput: "@",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Dead enemy E1 does not appear at (5,3) — row 3 col 5",
      expectedOutput: "^(?!.*#\\.{4}E).*$",
      isPattern: true,
    },
    {
      id: "g3",
      description: "HP bar shows 7 filled after 25 total damage (75 HP remaining)",
      expectedOutput: "HP: \\[#{7}\\.{3}\\] 75/100",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Enemy count shows 1 alive after combat",
      expectedOutput: "Enemies: 1 alive",
      isPattern: true,
    },
    {
      id: "g5",
      description: "GAME_MESSAGE confirms HUD reflects reality",
      expectedOutput: "GAME_MESSAGE\\|The HUD reflects reality\\.",
      isPattern: true,
    },
  ],

  hints: [
    "Apply damage in sequence: playerHP -= 15, then e1HP -= 20 (set e1alive=false if <= 0), then playerHP -= 10. Final playerHP = 75.",
    "Count aliveCount AFTER all combat is resolved: \\\`int aliveCount = (e1alive ? 1 : 0) + (e2alive ? 1 : 0);\\\`",
    "Render grid before printHUD — grid first, then HUD lines, then GAME_MESSAGE.",
    "In the render, gate E1 on \\\`e1alive\\\`: \\\`else if (e1alive && col == e1x && row == e1y) cout << 'E';\\\` — dead enemies do not render.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

// ==============================
// PHASE 2 — HUD SYSTEM
// Lesson 21: Observer-Style Display
// ==============================

// === HUD: PURE OBSERVER FUNCTION ===
// Reads game state, formats display. Never modifies state.
// HP bar: filled = (hp * 10) / maxHP — multiply before divide!
void printHUD(int hp, int maxHP, int atk, int gold,
              int roomId, string roomName, int enemies) {
    cout << "=== " << roomName << " (Room " << roomId << ") ===" << endl;

    int filled = (hp * 10) / maxHP;
    cout << "HP: [";
    for (int i = 0; i < 10; i++) cout << (i < filled ? '#' : '.');
    cout << "] " << hp << "/" << maxHP << endl;

    cout << "ATK: " << atk << "  GOLD: " << gold << endl;
    cout << "Enemies: " << enemies << " alive" << endl;
    cout << "HUD|HP:" << hp << "|GOLD:" << gold << endl;
}

int main() {
    // === PLAYER STATE ===
    int playerX = 10, playerY = 5;
    int playerHP = 100, maxHP = 100;
    int playerATK = 10, playerGold = 0;

    // === ENEMY STATE ===
    int e1x = 5, e1y = 3, e1HP = 20;
    bool e1alive = true;

    int e2x = 8, e2y = 5, e2HP = 20;
    bool e2alive = true;

    // === COMBAT SEQUENCE ===
    // Damage applies in game-loop order
    playerHP -= 15;                          // E1 attacks player
    e1HP -= 20;                              // Player attacks E1
    if (e1HP <= 0 && e1alive) e1alive = false; // E1 dies
    playerHP -= 10;                          // E2 attacks player

    // Count survivors (used by HUD and protocol)
    int aliveCount = (e1alive ? 1 : 0) + (e2alive ? 1 : 0);

    // === GRID RENDER ===
    // Dead enemies are gated by alive flag — they disappear from render
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9) {
                cout << '#';
            } else if (col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerX && row == playerY) {
                cout << '@';
            } else if (e1alive && col == e1x && row == e1y) {
                cout << 'E';
            } else if (e2alive && col == e2x && row == e2y) {
                cout << 'E';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }

    // === HUD: Snapshot after combat ===
    printHUD(playerHP, maxHP, playerATK, playerGold, 1, "Dark Chamber", aliveCount);

    // === PROTOCOL OUTPUT ===
    cout << "GAME_MESSAGE|The HUD reflects reality." << endl;

    return 0;
}
`,
};
