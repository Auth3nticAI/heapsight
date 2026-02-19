import type { GameLessonVariant } from "@/types/game";

export const lesson22SpaceShooter: GameLessonVariant = {
  lessonId: "22-error-handling-v0",
  instructions: `# Error Handling v0 -- Defensive Game Startup

Your game loads a checkpoint file. The file does not exist. The game crashes. A player edits their save file. wave=-9999. The game crashes. A disk error corrupts two bytes. The game crashes. Three failure modes, three crashes, zero players left.

## What Breaks Without This

Without error handling, any external data failure kills the game. Missing file = null pointer dereference or garbage read. Corrupted data = out-of-range values propagate through every system. One bad integer in a save file can break collision, rendering, scoring, and spawning simultaneously.

## The Fix

Defensive loading. Three cases, three responses:

1. **Valid save**: Load values, verify ranges, use them. STATUS|loaded.
2. **Missing save**: No file found. Use defaults (wave=1, score=0, lives=3, hp=100). STATUS|defaults.
3. **Corrupted save**: File exists but data is garbage. Clamp every value to valid range. STATUS|recovered.

The \\\`clampValue\\\` function is the core primitive: \\\`if (value < min) return min; if (value > max) return max; return value;\\\`. Two comparisons. Runs in nanoseconds. Prevents catastrophic state corruption.

Validation ranges: wave [1,100], score [0,99999], lives [1,5], hp [1,100]. Any value outside these ranges is clamped to the nearest boundary. The game always starts with valid state.

## Your Task

1. Use the \\\`clampValue\\\` function provided
2. Test 3 save scenarios: valid, missing, corrupted
3. Valid save (wave=3, score=500, lives=2, hp=75): print STATUS|loaded
4. Missing save: use defaults, print STATUS|defaults
5. Corrupted save (wave=-5, score=999999, lives=0, hp=-20): clamp all values, print STATUS|recovered
6. Render the game with the recovered (clamped) state from test 3
7. Output hero ENTITY with clamped hp, 3 enemies, SCORE with clamped score
8. Output GAME_MESSAGE with case count and crash count

## Performance Insight

Validation: 4 clamp calls = 8 comparisons. Runs once at startup. Cost: ~10 nanoseconds. The cost of NOT validating: undefined behavior, memory corruption, crash. The ratio of prevention cost to failure cost is infinite.

## Memory Insight

clampValue operates on stack values. No heap allocation. No dynamic memory. Defaults are literal constants compiled into the binary. Zero runtime memory overhead for the entire error handling system.

## Beginner Trap

**Common Mistake:** Assuming files always exist and data is always valid. They do not. It is not. A save file can be deleted, corrupted by a crash during write, or hand-edited by a curious player. Every external input is hostile until validated.

## Elite Insight

Production games use CRC32 checksums on save files. Write the checksum at the end of the file. On load, recompute the checksum over the data and compare. Mismatch = corruption = delete file and start fresh. Your \\\`clampValue\\\` is the first layer of defense. Checksums are the second.

## Systems Thinking Connection

Error handling is a system boundary. Inside your game loop, data is trusted -- you validated it at load time. Outside (files, network, user input), data is untrusted. Every boundary crossing needs validation. This is the same pattern as firewall rules, input sanitization, and type checking. Defense in depth.

## Skill Reinforcement

You know conditionals and functions. \\\`clampValue\\\` is two if-statements. The three test cases use the same conditional branching you have been writing since L4. No new syntax. New discipline: never trust external data.

## Mastery Check

Why clamp instead of rejecting the entire save? Because the player's time matters. If 3 of 4 values are valid and only hp is corrupted, clamping hp and keeping the rest preserves the player's progress. Rejecting the entire save punishes the player for a single corrupted byte.`,
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
    // TODO: Load valid save (wave=3, score=500, lives=2, hp=75)
    // Print STATUS|loaded

    // --- Test 2: Missing save ---
    cout << "--- Missing save ---" << endl;
    // TODO: Use defaults (wave=1, score=0, lives=3, hp=100)
    // Print STATUS|defaults

    // --- Test 3: Corrupted save ---
    cout << "--- Corrupted save ---" << endl;
    // TODO: Clamp bad values (wave=-5, score=999999, lives=0, hp=-20)
    // Print STATUS|recovered

    // TODO: Render game with clamped values from test 3
    // Hero: ENTITY|hero|player|180|220|24|24|hp
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
    "Test 1: assign valid values directly. Test 2: assign defaults. No clamping needed for either.",
    "Test 3: `clampValue(-5, 1, 100)` = 1, `clampValue(999999, 0, 99999)` = 99999, `clampValue(0, 1, 5)` = 1, `clampValue(-20, 1, 100)` = 1.",
    "Render uses clamped values from test 3. Hero hp = 1. Score = 99999. Enemies at x = 80, 180, 280.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// --- Error handling utilities (L22) ---
int clampValue(int value, int minVal, int maxVal) {
    if (value < minVal) return minVal;
    if (value > maxVal) return maxVal;
    return value;
}

// --- Validated checkpoint loading (L21 + L22) ---
bool loadCheckpointSafe(int& wave, int& score, int& lives, int& hp,
                        bool fileExists, int sw, int ss, int sl, int sh) {
    if (!fileExists) {
        wave = 1; score = 0; lives = 3; hp = 100;
        return false;
    }
    wave = clampValue(sw, 1, 100);
    score = clampValue(ss, 0, 99999);
    lives = clampValue(sl, 1, 5);
    hp = clampValue(sh, 1, 100);
    return true;
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
};
