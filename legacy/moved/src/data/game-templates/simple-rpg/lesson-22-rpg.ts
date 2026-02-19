import type { GameLessonVariant } from "@/types/game";

export const lesson22RPG: GameLessonVariant = {
  lessonId: "rpg-22-error-handling",

  instructions: `# Error Handling — Defensive Programming

## Mental Model

Defensive programming pattern. Validate at boundaries. Clamp at edges. Never trust external data.

A save file is a message from the past. The past version of your game might have had different valid ranges. The file might have been corrupted on disk. The player might have edited it manually. You cannot trust it. But you also cannot refuse to load it — that crashes the game. The solution is the three-case pattern: valid (use it), missing (default it), corrupted (clamp it). Handle all three and the startup never fails.

\\\`clampValue\\\` is the utility that makes this possible. It is three conditional returns. Feed it any integer and it comes out in range. No matter what the save file says, after clamping the value is valid. The game can start. The player can play. The corruption is absorbed at the boundary and never propagates inward.

## What Breaks Without This

Without defensive loading, corrupted saves crash or produce absurd states. HP of -10 means the player spawns dead. Gold of 999999 overflows display buffers. A missing save file causes an uninitialized read — undefined behavior in C++ that can manifest as anything from a segfault to silently wrong values. Production games ship defensive loaders because real users have corrupted saves, and real patches change valid ranges. The undefended game fails in the field.

## The Fix

\\\`\\\`\\\`cpp
int clampValue(int val, int minVal, int maxVal) {
    if (val < minVal) return minVal;
    if (val > maxVal) return maxVal;
    return val;
}

// Three-case startup
// Case 1: valid save — use values
int hp = 75, gold = 42;
cout << "STATUS|loaded" << endl;

// Case 2: no save — use defaults
hp = 100; gold = 0;
cout << "STATUS|defaults" << endl;

// Case 3: corrupted — clamp before using
hp   = clampValue(-10,    1,    100);  // -> 1
gold = clampValue(999999, 0, 9999);    // -> 9999
cout << "STATUS|recovered" << endl;
\\\`\\\`\\\`

After Case 3, use the clamped values for the game session. The player starts with HP=1 — alive, if barely. Gold=9999 — the cap. The game renders correctly. The HUD is accurate.

## Pattern Insight

Validate at the boundary is a principle, not just a technique. The boundary is any point where untrusted data enters your system. For a game: file load, network receive, config parse, command-line argument parse. At each boundary, run validation. Clamp numerics. Default booleans. Sanitize strings. Inside the boundary, trust your own data — you validated it on entry. Outside the boundary, validate everything. This discipline is what separates hobby code from production code.

## Scalability Insight

A production save validator is a function that takes a raw data buffer and returns a validated struct. Each field in the struct has a valid range. The validator checks every field, applying clamp, default, or rejection rules. The rest of the game only ever receives validated structs. The validator is the only place where untrusted data is handled. This architecture scales from a two-field save (HP, gold) to a thousand-field save (character build, inventory, world state, quest flags) without changing the architecture. Your three-case pattern is the validator for a two-field save.

## Your Task

Write the complete resilient startup sequence:

1. Run all three load cases, printing the STATUS line for each
2. Use the Case 3 clamped values (hp=1, gold=9999) for the game session
3. Render a 20x10 grid with the player at (10,5)
4. Call printHUD with the recovered stats and roomName="Startup Room"
5. Output:
   - \\\`GAME_MESSAGE|Resilient startup complete.\\\`

Confirm that all three STATUS lines appear before the grid, and the HUD reflects the clamped values.

## Common Mistake (Beginner Trap)

Using the corrupted values before clamping. If you pass hp=-10 directly to printHUD, the HP bar calculation gives a negative filled count — the bar loop behaves incorrectly. Always clamp before using. The corrected value replaces the corrupted one at the moment of load, not downstream.

## Elite Insight (Dark Souls, Diablo)

Dark Souls' save system validates every player stat against the current game version's stat table on load. After the remaster's stat rebalancing, saves from the original version were loaded and every stat clamped to the new valid range. No player lost their save. They kept playing with adjusted values. Diablo II's ladder reset works similarly: at season end, character saves are transferred to non-ladder with stat auditing — any illegitimate values are clamped or zeroed. The clamp function you wrote is the core of both systems. Professional save validation at scale is this exact three-line function called several thousand times per save file.

## Pattern Recognition

Three-case external data handling is universal across software disciplines. In web development, it is input sanitization and form validation. In network programming, it is packet parsing with range checks. In databases, it is constraint checking and migration validation. In games, it is save loading and config parsing. The three cases are always the same: valid (pass through), missing (default), out-of-range (clamp or reject). You now know the universal pattern for defensive boundary handling.

## Skill Reinforcement

- \\\`clampValue\\\`: universal defensive utility, three lines, zero crashes
- Three-case mindset: valid, missing, corrupted — handle all three
- Validate at the boundary — once, completely, before using data
- STATUS protocol: machine-readable case confirmation for testing
- The HUD after a corrupted load must show clamped values, not raw ones

## Mastery Check

Why is the minimum HP clamp set to 1 rather than 0? An HP of 0 is a valid dead state. A corrupted save with HP=-10 is not a player who died — it is bad data. The game should not interpret bad data as a meaningful game state. Clamping to 1 keeps the player alive and gives them a chance to play. If you want to support loading at dead (e.g., the player died in a hardcore save), set the minimum to 0 and handle the death state separately. The choice of minimum is a design decision. The clamping itself is always required.`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

int clampValue(int val, int minVal, int maxVal) {
    if (val < minVal) return minVal;
    if (val > maxVal) return maxVal;
    return val;
}

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
    int hp, gold;

    // === STEP 1: Three load scenarios ===
    // Case 1: hp=75, gold=42  -> STATUS|loaded
    // Case 2: hp=100, gold=0  -> STATUS|defaults
    // Case 3: hp=-10, gold=999999 -> clamp -> STATUS|recovered

    // After Step 1: hp=1, gold=9999 (Case 3 clamped values)

    // === STEP 2: Render 20x10 grid ===
    // Player at (10,5)

    // === STEP 3: HUD with recovered values ===
    // printHUD(hp, 100, 10, gold, 0, "Startup Room", 0)

    // === STEP 4: Protocol ===
    // GAME_MESSAGE|Resilient startup complete.

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int clampValue(int val, int minVal, int maxVal) {
    if (val < minVal) return minVal;
    if (val > maxVal) return maxVal;
    return val;
}

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
    int hp, gold;

    // === STEP 1: Three load scenarios ===

    // Case 1: Valid save
    hp = 75; gold = 42;
    cout << "STATUS|loaded" << endl;

    // Case 2: Missing save — defaults
    hp = 100; gold = 0;
    cout << "STATUS|defaults" << endl;

    // Case 3: Corrupted save — clamp to valid range
    hp   = clampValue(-10,    1,    100);
    gold = clampValue(999999, 0, 9999);
    cout << "STATUS|recovered" << endl;

    // hp=1, gold=9999 — use these for the game session

    // === STEP 2: Render 20x10 grid ===
    int playerX = 10, playerY = 5;
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9) {
                cout << '#';
            } else if (col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerX && row == playerY) {
                cout << '@';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }

    // === STEP 3: HUD with recovered values ===
    printHUD(hp, 100, 10, gold, 0, "Startup Room", 0);

    // === STEP 4: Protocol ===
    cout << "GAME_MESSAGE|Resilient startup complete." << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "STATUS|loaded appears for Case 1",
      expectedOutput: "STATUS\\|loaded",
      isPattern: true,
    },
    {
      id: "g2",
      description: "STATUS|recovered appears for Case 3 corrupted save",
      expectedOutput: "STATUS\\|recovered",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Player @ appears at (10,5) in the grid — row 5, col 10",
      expectedOutput: "#\\.{9}@\\.{9}#",
      isPattern: true,
    },
    {
      id: "g4",
      description: "HUD shows clamped HP=1 and clamped GOLD=9999",
      expectedOutput: "HUD\\|HP:1\\|GOLD:9999",
      isPattern: true,
    },
    {
      id: "g5",
      description: "GAME_MESSAGE confirms resilient startup complete",
      expectedOutput: "GAME_MESSAGE\\|Resilient startup complete\\.",
      isPattern: true,
    },
  ],

  hints: [
    "Run all three cases in sequence: Case 1 sets hp=75/gold=42, Case 2 resets to hp=100/gold=0, Case 3 clamps hp=-10 to 1 and gold=999999 to 9999.",
    "After Case 3, hp=1 and gold=9999. Use these same variables for the render and HUD — do not reset them.",
    "Standard 20x10 grid render: # on borders, @ at (10,5), . everywhere else. No enemies in this startup sequence.",
    "printHUD call: \\\`printHUD(hp, 100, 10, gold, 0, \"Startup Room\", 0);\\\` — hp is 1 and gold is 9999 at this point.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

// ==============================
// PHASE 2 — ERROR HANDLING
// Lesson 22: Defensive Programming
// ==============================

// === CLAMP UTILITY ===
// Three lines. Zero crashes. The boundary guard for all numeric data.
// Always multiply before divide when computing ratios in integers.
int clampValue(int val, int minVal, int maxVal) {
    if (val < minVal) return minVal;
    if (val > maxVal) return maxVal;
    return val;
}

// === HUD: OBSERVER FUNCTION (from Lesson 21) ===
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
    int hp, gold;

    // === THREE-CASE SAVE LOADER ===
    // Validate at the boundary. Trust everywhere inside.

    // Case 1: Valid save data — use directly
    hp = 75; gold = 42;
    cout << "STATUS|loaded" << endl;

    // Case 2: Missing save file — apply defaults
    hp = 100; gold = 0;
    cout << "STATUS|defaults" << endl;

    // Case 3: Corrupted save — clamp to valid range
    // hp=-10 clamped to min 1 (player alive). gold=999999 clamped to max 9999.
    hp   = clampValue(-10,    1,    100);
    gold = clampValue(999999, 0, 9999);
    cout << "STATUS|recovered" << endl;

    // hp=1, gold=9999 — used for this game session

    // === GRID RENDER ===
    // Player spawns at (10,5) with recovered stats
    int playerX = 10, playerY = 5;
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9) {
                cout << '#';
            } else if (col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerX && row == playerY) {
                cout << '@';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }

    // === HUD: Shows clamped values, not corrupted ones ===
    printHUD(hp, 100, 10, gold, 0, "Startup Room", 0);

    // === PROTOCOL OUTPUT ===
    cout << "GAME_MESSAGE|Resilient startup complete." << endl;

    return 0;
}
`,
};
