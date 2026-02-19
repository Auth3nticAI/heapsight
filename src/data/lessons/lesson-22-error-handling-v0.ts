import type { Lesson } from "@/types/lesson";

export const lesson22: Lesson = {
  id: "22-error-handling-v0",
  title: "Error Handling v0",
  description: "Expect failure. Handle it. Missing files get defaults. Bad data gets clamped. The game never crashes from bad input.",
  order: 22,
  xpReward: 125,
  tier: "pro",
  concepts: ["error handling", "graceful degradation", "default values", "defensive programming"],
  part1: {
    title: "Concept: Error Handling v0",
    type: "concept",
    instructions: `# Error Handling v0

Expect failure. Handle it. Missing file = default values. Bad data = skip and log. The game never crashes from bad input.

## Mental Model

Every external input can fail. File missing. Data corrupted. Value out of range. Defensive code checks each failure point and falls back gracefully. The game starts with defaults instead of crashing.

## What Breaks

Load checkpoint from missing file = crash or garbage data. Parse corrupted save = wave=-1, score=999999. Without validation, any bad data propagates through the entire game state. One corrupted field breaks the whole session.

## The Fix

\\\`loadCheckpoint\\\` returns bool. If file missing = return false, use defaults. If data bad = validate ranges. Clamp to valid range.

\\\`\\\`\\\`cpp
int clampValue(int value, int minVal, int maxVal) {
    if (value < minVal) return minVal;
    if (value > maxVal) return maxVal;
    return value;
}
\\\`\\\`\\\`

Validation ranges:
- wave: 1-100
- score: 0-99999
- lives: 1-5
- hp: 1-100

## Performance Insight

Validation: a few comparisons per load. Runs once on startup. Cost: microseconds. The cost of NOT validating: corrupted game state, player frustration, support tickets.

## Memory Insight

Default values: same size as loaded values. No extra allocation. Validation adds zero memory overhead. Clamping operates in-place on existing variables.

## Beginner Trap

Assuming files always exist and data is always valid. They do not. It is not. A save file can be deleted by the user, corrupted by a crash during write, or edited by a curious player. Your code must handle every case.

## Elite Insight

Production games: save file CRC/checksum. If checksum fails = file corrupted = delete and start fresh. Your validation is the foundation. Add a hash of the data at the end of the file. On load, recompute and compare. Mismatch = corruption.

## Systems Thinking Connection

Error handling is a system. It has inputs (external data), processing (validation), and outputs (clean data or defaults). Every boundary between your code and the outside world needs this system. File I/O. Network packets. User input. Config files. The pattern is always the same: read, validate, clamp or reject.

## Skill Reinforcement

You know conditionals, functions, and reference parameters. \\\`clampValue\\\` is two if-statements. \\\`loadCheckpoint\\\` uses a bool return and reference parameters. Same tools. New discipline: never trust input.

## Mastery Check

Why clamp instead of reject? Because the game must start. A player with a corrupted save file should not be locked out. Clamp bad values to safe ranges and let them play. Log the correction so you can debug later.

## Your Task

1. Write \\\`clampValue(int value, int minVal, int maxVal)\\\`
2. Test 3 save scenarios: valid save, missing save, corrupted save
3. Valid: load normally, print STATUS|loaded
4. Missing: use defaults, print STATUS|defaults
5. Corrupted: clamp each bad value, show correction, print STATUS|recovered
6. Print final GAME_MESSAGE with case count and crash count`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write clampValue(int value, int minVal, int maxVal)

int main() {
    cout << "=== ERROR HANDLING DEMO ===" << endl;

    // --- Test 1: Valid save ---
    cout << endl << "--- Test 1: Valid save ---" << endl;
    // TODO: Simulate loading valid save (wave=3, score=500, lives=2, hp=75)
    // Print "Loading save... OK"
    // Print values
    // Print STATUS|loaded

    // --- Test 2: Missing save ---
    cout << endl << "--- Test 2: Missing save ---" << endl;
    // TODO: Simulate missing file
    // Print "Loading save... FILE NOT FOUND"
    // Print defaults: wave=1, score=0, lives=3, hp=100
    // Print STATUS|defaults

    // --- Test 3: Corrupted save ---
    cout << endl << "--- Test 3: Corrupted save (wave=-5 score=999999 lives=0 hp=-20) ---" << endl;
    // TODO: Simulate corrupted data, clamp each value
    // Print "Loading save... VALIDATION FAILED"
    // Show each clamped value
    // Print STATUS|recovered

    // TODO: Print GAME_MESSAGE with results

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int clampValue(int value, int minVal, int maxVal) {
    if (value < minVal) return minVal;
    if (value > maxVal) return maxVal;
    return value;
}

int main() {
    cout << "=== ERROR HANDLING DEMO ===" << endl;

    // --- Test 1: Valid save ---
    cout << endl << "--- Test 1: Valid save ---" << endl;
    cout << "Loading save... OK" << endl;
    int wave = 3, score = 500, lives = 2, hp = 75;
    cout << "wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;
    cout << "STATUS|loaded" << endl;

    // --- Test 2: Missing save ---
    cout << endl << "--- Test 2: Missing save ---" << endl;
    cout << "Loading save... FILE NOT FOUND" << endl;
    wave = 1; score = 0; lives = 3; hp = 100;
    cout << "Using defaults: wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;
    cout << "STATUS|defaults" << endl;

    // --- Test 3: Corrupted save ---
    cout << endl << "--- Test 3: Corrupted save (wave=-5 score=999999 lives=0 hp=-20) ---" << endl;
    cout << "Loading save... VALIDATION FAILED" << endl;
    int rawWave = -5, rawScore = 999999, rawLives = 0, rawHP = -20;

    wave = clampValue(rawWave, 1, 100);
    cout << "  wave=" << rawWave << " -> clamped to " << wave << endl;

    score = clampValue(rawScore, 0, 99999);
    cout << "  score=" << rawScore << " -> clamped to " << score << endl;

    lives = clampValue(rawLives, 1, 5);
    cout << "  lives=" << rawLives << " -> clamped to " << lives << endl;

    hp = clampValue(rawHP, 1, 100);
    cout << "  hp=" << rawHP << " -> clamped to " << hp << endl;

    cout << "STATUS|recovered" << endl;

    cout << endl << "GAME_MESSAGE|Error handling: 3 cases, 0 crashes" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should show valid save loaded",
        expectedOutput: "STATUS|loaded",
      },
      {
        id: "t2",
        description: "Should show defaults for missing save",
        expectedOutput: "STATUS|defaults",
      },
      {
        id: "t3",
        description: "Should clamp wave from -5 to 1",
        expectedOutput: "wave=-5 -> clamped to 1",
      },
      {
        id: "t4",
        description: "Should clamp score from 999999 to 99999",
        expectedOutput: "score=999999 -> clamped to 99999",
      },
      {
        id: "t5",
        description: "Should show recovered status",
        expectedOutput: "STATUS|recovered",
      },
      {
        id: "t6",
        description: "Should show 0 crashes message",
        expectedOutput: "GAME_MESSAGE\\|Error handling: 3 cases, 0 crashes",
        isPattern: true,
      },
    ],
    hints: [
      "`clampValue`: two comparisons. `if (value < minVal) return minVal; if (value > maxVal) return maxVal; return value;`",
      "Store raw corrupted values separately: `int rawWave = -5;` then `wave = clampValue(rawWave, 1, 100);` to show the correction.",
      "Missing file: just set defaults directly. No clamp needed. `wave=1; score=0; lives=3; hp=100;`",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Defensive Startup",
    type: "game_builder",
    instructions: `# Game Builder: Error-Proof Game Startup

Build a game startup sequence that handles every failure mode. Valid save, missing save, corrupted save. The game always starts. It never crashes. Graceful degradation is the mark of professional code.

## Your Task

1. Write \\\`clampValue\\\` function for range validation
2. Simulate 3 load attempts: valid, missing, corrupted
3. For each: show the result and STATUS line
4. After all tests, render the game with the recovered state from test 3
5. Output ENTITY for hero and 3 enemies
6. Output SCORE and final GAME_MESSAGE

Expected output:
\\\`\\\`\\\`
--- Valid save ---
STATUS|loaded
--- Missing save ---
STATUS|defaults
--- Corrupted save ---
STATUS|recovered
ENTITY|hero|player|180|220|24|24|1
ENTITY|e0|enemy|80|60|16|16|50
ENTITY|e1|enemy|180|60|16|16|50
ENTITY|e2|enemy|280|60|16|16|50
SCORE|99999
GAME_MESSAGE|Error handling: 3 cases, 0 crashes
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
using namespace std;

int clampValue(int value, int minVal, int maxVal) {
    if (value < minVal) return minVal;
    if (value > maxVal) return maxVal;
    return value;
}

int main() {
    int wave, score, lives, hp;

    // --- Test 1: Valid save ---
    cout << "--- Valid save ---" << endl;
    // TODO: Load valid save (wave=3, score=500, lives=2, hp=75), print STATUS|loaded

    // --- Test 2: Missing save ---
    cout << "--- Missing save ---" << endl;
    // TODO: Use defaults, print STATUS|defaults

    // --- Test 3: Corrupted save ---
    cout << "--- Corrupted save ---" << endl;
    // TODO: Clamp bad values (wave=-5, score=999999, lives=0, hp=-20)
    // Print STATUS|recovered

    // TODO: Render game state from test 3 (clamped values)
    // Hero at (180,220) with clamped hp
    // 3 enemies at x = 80 + i*100
    // Output SCORE and GAME_MESSAGE

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int clampValue(int value, int minVal, int maxVal) {
    if (value < minVal) return minVal;
    if (value > maxVal) return maxVal;
    return value;
}

int main() {
    int wave, score, lives, hp;

    // --- Test 1: Valid save ---
    cout << "--- Valid save ---" << endl;
    wave = 3; score = 500; lives = 2; hp = 75;
    cout << "STATUS|loaded" << endl;

    // --- Test 2: Missing save ---
    cout << "--- Missing save ---" << endl;
    wave = 1; score = 0; lives = 3; hp = 100;
    cout << "STATUS|defaults" << endl;

    // --- Test 3: Corrupted save ---
    cout << "--- Corrupted save ---" << endl;
    wave = clampValue(-5, 1, 100);
    score = clampValue(999999, 0, 99999);
    lives = clampValue(0, 1, 5);
    hp = clampValue(-20, 1, 100);
    cout << "STATUS|recovered" << endl;

    // Render game with recovered state
    cout << "ENTITY|hero|player|180|220|24|24|" << hp << endl;
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|e" << i << "|enemy|" << (80 + i * 100) << "|60|16|16|50" << endl;
    }

    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|Error handling: 3 cases, 0 crashes" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should show valid save loaded",
        expectedOutput: "STATUS\\|loaded",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should show defaults for missing save",
        expectedOutput: "STATUS\\|defaults",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should show recovered for corrupted save",
        expectedOutput: "STATUS\\|recovered",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Should render hero with clamped hp=1",
        expectedOutput: "ENTITY\\|hero\\|player\\|180\\|220\\|24\\|24\\|1",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Should render enemies",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|80\\|60\\|16\\|16\\|50",
        isPattern: true,
      },
      {
        id: "g6",
        description: "Should show clamped score",
        expectedOutput: "SCORE\\|99999",
        isPattern: true,
      },
      {
        id: "g7",
        description: "Should show 0 crashes message",
        expectedOutput: "GAME_MESSAGE\\|Error handling: 3 cases, 0 crashes",
        isPattern: true,
      },
    ],
    hints: [
      "Test 1: just assign valid values and print STATUS|loaded. No clamping needed.",
      "Test 3: `wave = clampValue(-5, 1, 100)` gives 1. `hp = clampValue(-20, 1, 100)` gives 1. `score = clampValue(999999, 0, 99999)` gives 99999.",
      "Render uses the clamped values from test 3. Hero hp = 1 (clamped from -20). Score = 99999 (clamped from 999999).",
    ],
    estimatedMinutes: 7,
  },
};
