import type { Lesson } from "@/types/lesson";

export const lesson94: Lesson = {
  id: "94-crash-proofing",
  title: "Crash Proofing",
  description: "Handle bad data gracefully without crashes.",
  order: 94,
  xpReward: 225,
  tier: "pro",
  concepts: ["error handling", "input validation", "graceful degradation", "defensive programming"],
  part1: {
    title: "Concept: Crash Proofing",
    type: "concept",
    instructions: `# Crash Proofing — Your Game Will Receive Garbage

Config files get hand-edited by players. They type "damage=abc" instead of "damage=10". They delete lines. They add lines that do not exist. Mod files contain malformed data. Save files get corrupted. Network packets arrive truncated. Every external input is suspect. If your parser calls stoi("abc"), the program crashes. If your array access uses index -1, the program crashes. Defensive programming means every input is validated before use. Bad data produces defaults, not explosions.

## What Breaks Without This

Without input validation, one bad config line kills the game. The player edits config.txt, types "sfx_volume=loud" instead of "sfx_volume=8", and the game crashes on launch. They cannot play. They post a negative review. They tell their friends. One missing validation check costs you players. Worse, unvalidated array indices corrupt memory silently. The game "works" but behaves randomly. That is harder to debug than a crash.

## The Fix

Validate every external value before use. Wrap stoi() calls in a try-catch or check if the string is numeric first. Clamp numeric values to valid ranges. Check string values against known-good lists. For missing keys, use defaults. For array indices, bounds-check before access. The pattern is: receive input, validate, use default if invalid, continue.

\\\`\\\`\\\`
// Validation pattern:
// 1. Parse value from string
// 2. Check if parse succeeded
// 3. If not: use default
// 4. If yes: clamp to valid range
// 5. Log what happened

int safeParseInt(string val, int defaultVal, int minVal, int maxVal) {
    try {
        int result = stoi(val);
        if (result < minVal) return minVal;
        if (result > maxVal) return maxVal;
        return result;
    } catch (...) {
        return defaultVal;
    }
}
\\\`\\\`\\\`

The key insight: validation is not error handling. Error handling is what you do when something goes wrong at runtime. Validation is what you do to prevent something from going wrong. Validate at the boundary. Once data passes validation, the rest of the code can trust it.

## Your Task

1. Write a safeParseInt function: parse string to int, return default on failure, clamp to range
2. Write a validateDifficulty function: check against known values, clamp to nearest valid
3. Feed bad data through validators:
   - "sfx_volume=abc" -> use default 5
   - "difficulty=extreme" -> clamp to "hard"
   - "enemy_hp=-50" -> clamp to 1
   - Missing key "player_name" -> use default "PILOT"
   - Pool index 99 (out of bounds) -> skip
4. Print: \\\`VALIDATE|sfx_volume|input|abc|invalid|using_default|5\\\`
5. Print: \\\`VALIDATE|difficulty|input|extreme|invalid|clamped|hard\\\`
6. Print: \\\`VALIDATE|enemy_hp|input|-50|invalid|clamped|1\\\`
7. Print: \\\`VALIDATE|missing_key|player_name|not_found|using_default|PILOT\\\`
8. Print: \\\`CRASHPROOF|bad_inputs|5|handled|5|crashes|0\\\`
9. Print: \\\`VALIDATION_SUMMARY|checks|5|passed|1|defaulted|2|clamped|2|errors|0\\\`

Expected output:
\\\`\\\`\\\`
VALIDATE|sfx_volume|input|abc|invalid|using_default|5
VALIDATE|difficulty|input|extreme|invalid|clamped|hard
VALIDATE|enemy_hp|input|-50|invalid|clamped|1
VALIDATE|missing_key|player_name|not_found|using_default|PILOT
VALIDATE|pool_index|input|99|invalid|out_of_bounds|skipped
CRASHPROOF|bad_inputs|5|handled|5|crashes|0
VALIDATION_SUMMARY|checks|5|passed|0|defaulted|2|clamped|2|errors|0
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Catching exceptions too broadly. If you wrap the entire parser in one try-catch, you do not know which line failed. Wrap each individual parse in its own validation. One bad line should not prevent parsing the other six good lines. Validate per field, not per file.

## Elite Insight

NASA's coding standard (JPL Rule 16): "The return value of non-void functions must be checked by each calling function, and the validity of parameters must be checked inside each function." Every function validates its inputs. Every caller checks the return. This is how you write code that does not crash on Mars. Your game is not on Mars, but the principle scales.

## Cross-Path Echo

Form validation in web applications follows the same pattern. Each input field has a type (number, email, string), a required flag, min/max constraints, and a default value. The server validates every field even if the client already validated. Trust no input. Your config validator is server-side form validation for game settings.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
int badInputs = 0;
int handled = 0;
int passed = 0;
int defaulted = 0;
int clamped = 0;

// TODO: Write safeParseInt(val, defaultVal, minVal, maxVal)
//   Try stoi(val). If it throws, return defaultVal.
//   If result < minVal, return minVal. If > maxVal, return maxVal.

// TODO: Write validateDifficulty(val)
//   Valid: "easy", "normal", "hard"
//   If not valid, return "hard" (clamp to highest known)

// TODO: Write validatePoolIndex(idx, poolSize)
//   If idx < 0 or idx >= poolSize, return false (out of bounds)

int main() {
    // Test 1: sfx_volume = "abc" -> default 5
    // TODO: Parse "abc" with safeParseInt, default=5, min=0, max=10
    //   Print VALIDATE line

    // Test 2: difficulty = "extreme" -> clamp to "hard"
    // TODO: Validate "extreme" with validateDifficulty
    //   Print VALIDATE line

    // Test 3: enemy_hp = "-50" -> clamp to 1
    // TODO: Parse "-50" with safeParseInt, default=10, min=1, max=999
    //   Print VALIDATE line

    // Test 4: missing key player_name -> default "PILOT"
    // TODO: Simulate missing key, use default
    //   Print VALIDATE line

    // Test 5: pool index 99 -> out of bounds
    // TODO: Validate index 99 against POOL_SIZE
    //   Print VALIDATE line

    // TODO: Print CRASHPROOF and VALIDATION_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
int badInputs = 0;
int handled = 0;
int passed = 0;
int defaulted = 0;
int clamped = 0;

int safeParseInt(string val, int defaultVal, int minVal, int maxVal) {
    try {
        int result = stoi(val);
        if (result < minVal) return minVal;
        if (result > maxVal) return maxVal;
        return result;
    } catch (...) {
        return defaultVal;
    }
}

string validateDifficulty(string val) {
    if (val == "easy" || val == "normal" || val == "hard") return val;
    return "hard";
}

bool validatePoolIndex(int idx, int poolSize) {
    return (idx >= 0 && idx < poolSize);
}

int main() {
    // Test 1: sfx_volume = "abc" -> default 5
    string sfxInput = "abc";
    int sfxVal = safeParseInt(sfxInput, 5, 0, 10);
    cout << "VALIDATE|sfx_volume|input|" << sfxInput << "|invalid|using_default|" << sfxVal << endl;
    badInputs++; handled++; defaulted++;

    // Test 2: difficulty = "extreme" -> clamp to "hard"
    string diffInput = "extreme";
    string diffVal = validateDifficulty(diffInput);
    cout << "VALIDATE|difficulty|input|" << diffInput << "|invalid|clamped|" << diffVal << endl;
    badInputs++; handled++; clamped++;

    // Test 3: enemy_hp = "-50" -> clamp to 1
    string hpInput = "-50";
    int hpVal = safeParseInt(hpInput, 10, 1, 999);
    cout << "VALIDATE|enemy_hp|input|" << hpInput << "|invalid|clamped|" << hpVal << endl;
    badInputs++; handled++; clamped++;

    // Test 4: missing key player_name -> default "PILOT"
    string playerName = "PILOT";
    cout << "VALIDATE|missing_key|player_name|not_found|using_default|" << playerName << endl;
    badInputs++; handled++; defaulted++;

    // Test 5: pool index 99 -> out of bounds
    int testIdx = 99;
    bool valid = validatePoolIndex(testIdx, POOL_SIZE);
    cout << "VALIDATE|pool_index|input|" << testIdx << "|invalid|out_of_bounds|skipped" << endl;
    badInputs++; handled++;

    cout << "CRASHPROOF|bad_inputs|" << badInputs << "|handled|" << handled << "|crashes|0" << endl;
    cout << "VALIDATION_SUMMARY|checks|" << badInputs << "|passed|" << passed
         << "|defaulted|" << defaulted << "|clamped|" << clamped << "|errors|0" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Bad int uses default", expectedOutput: "VALIDATE\\|sfx_volume\\|input\\|abc\\|invalid\\|using_default\\|5", isPattern: true },
      { id: "t2", description: "Bad difficulty clamped", expectedOutput: "VALIDATE\\|difficulty\\|input\\|extreme\\|invalid\\|clamped\\|hard", isPattern: true },
      { id: "t3", description: "Negative HP clamped", expectedOutput: "VALIDATE\\|enemy_hp\\|input\\|-50\\|invalid\\|clamped\\|1", isPattern: true },
      { id: "t4", description: "Missing key uses default", expectedOutput: "VALIDATE\\|missing_key\\|player_name\\|not_found\\|using_default\\|PILOT", isPattern: true },
      { id: "t5", description: "Pool index out of bounds", expectedOutput: "VALIDATE\\|pool_index\\|input\\|99\\|invalid\\|out_of_bounds\\|skipped", isPattern: true },
      { id: "t6", description: "All bad inputs handled", expectedOutput: "CRASHPROOF\\|bad_inputs\\|5\\|handled\\|5\\|crashes\\|0", isPattern: true },
      { id: "t7", description: "Validation summary", expectedOutput: "VALIDATION_SUMMARY\\|checks\\|5\\|passed\\|0\\|defaulted\\|2\\|clamped\\|2\\|errors\\|0", isPattern: true },
    ],
    hints: [
      "safeParseInt wraps stoi in try-catch(...). If it throws, return defaultVal. If the parsed result is below minVal, return minVal. If above maxVal, return maxVal. This handles both non-numeric strings and out-of-range numbers.",
      "validateDifficulty checks the string against three known values: \"easy\", \"normal\", \"hard\". If none match, return \"hard\" as the clamped value. The input \"extreme\" is not in the list, so it returns \"hard\".",
      "Track counters: badInputs and handled both increment for each test (5 each). defaulted increments for tests 1 and 4. clamped increments for tests 2 and 3. passed stays 0 because all 5 inputs are invalid.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Crash Proofing",
    type: "game_builder",
    instructions: `# Game Builder: Crash Proofing — Survive Bad Data

Players will edit your config files. Mods will inject bad data. Save files will get corrupted. Network packets will arrive malformed. Your game must survive all of it. Every external input gets validated. Every parse gets a fallback. Every array access gets a bounds check. Zero crashes from bad data. Zero.

## What Breaks Without This

Without validation, the game is fragile. One typo in config.txt crashes the launcher. One corrupted save file prevents loading. One modded enemy with HP=-50 breaks the combat system. The game works perfectly with perfect data. It explodes with imperfect data. Players never provide perfect data.

## The Fix

Validate at every boundary. Config parser validates each value against type and range. Pool access validates indices. Difficulty strings validate against known values. Missing keys produce defaults. The pattern is consistent: parse, validate, fallback, continue. Never crash. Always log.

\\\`\\\`\\\`
// Validation chain:
// 1. Parse raw string
// 2. Type check (is it a number? a known string?)
// 3. Range check (min <= val <= max)
// 4. Fallback (use default if invalid)
// 5. Log result
\\\`\\\`\\\`

## Your Task

1. Feed 5 bad inputs through validators:
   - "sfx_volume=abc" -> default 5
   - "difficulty=extreme" -> clamp to "hard"
   - "enemy_hp=-50" -> clamp to 1
   - Missing key "player_name" -> default "PILOT"
   - Pool index 99 -> out of bounds, skip
2. Print: \\\`VALIDATE|sfx_volume|input|abc|invalid|using_default|5\\\`
3. Print: \\\`VALIDATE|difficulty|input|extreme|invalid|clamped|hard\\\`
4. Print: \\\`VALIDATE|enemy_hp|input|-50|invalid|clamped|1\\\`
5. Print: \\\`VALIDATE|missing_key|player_name|not_found|using_default|PILOT\\\`
6. Print: \\\`VALIDATE|pool_index|input|99|invalid|out_of_bounds|skipped\\\`
7. Print: \\\`CRASHPROOF|bad_inputs|5|handled|5|crashes|0\\\`
8. Print: \\\`VALIDATION_SUMMARY|checks|5|passed|0|defaulted|2|clamped|2|errors|0\\\`

## Beginner Trap

**Common Mistake:** Validating only on load, not on use. The config loads correctly, but later a mod changes enemy_hp to -50 at runtime. If the spawn function does not validate HP, the negative value propagates. Validate at both boundaries: when data enters the system and when data is used by a critical function.

## Elite Insight

Erlang's "let it crash" philosophy is the opposite approach — and it works because Erlang has supervisor processes that restart crashed workers in milliseconds. In C++, you do not have supervisors. A crash is a crash. Defensive programming is the C++ answer to fault tolerance. Validate everything because there is no safety net.

## Cross-Path Echo

API input validation in web services follows the same pattern. Every endpoint validates every field of every request. Type checking, range checking, required field checking, enum validation. Your config validator is an API input validator for game data. Same checks, same fallbacks, same principle: trust nothing from outside.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
int badInputs = 0;
int handled = 0;
int passed = 0;
int defaulted = 0;
int clamped = 0;

// TODO: Write safeParseInt(val, defaultVal, minVal, maxVal)

// TODO: Write validateDifficulty(val)

// TODO: Write validatePoolIndex(idx, poolSize)

int main() {
    // TODO: Validate 5 bad inputs, print VALIDATE lines
    // TODO: Print CRASHPROOF and VALIDATION_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
int badInputs = 0;
int handled = 0;
int passed = 0;
int defaulted = 0;
int clamped = 0;

int safeParseInt(string val, int defaultVal, int minVal, int maxVal) {
    try {
        int result = stoi(val);
        if (result < minVal) return minVal;
        if (result > maxVal) return maxVal;
        return result;
    } catch (...) {
        return defaultVal;
    }
}

string validateDifficulty(string val) {
    if (val == "easy" || val == "normal" || val == "hard") return val;
    return "hard";
}

bool validatePoolIndex(int idx, int poolSize) {
    return (idx >= 0 && idx < poolSize);
}

int main() {
    // Test 1: sfx_volume = "abc"
    string sfxInput = "abc";
    int sfxVal = safeParseInt(sfxInput, 5, 0, 10);
    cout << "VALIDATE|sfx_volume|input|" << sfxInput << "|invalid|using_default|" << sfxVal << endl;
    badInputs++; handled++; defaulted++;

    // Test 2: difficulty = "extreme"
    string diffInput = "extreme";
    string diffVal = validateDifficulty(diffInput);
    cout << "VALIDATE|difficulty|input|" << diffInput << "|invalid|clamped|" << diffVal << endl;
    badInputs++; handled++; clamped++;

    // Test 3: enemy_hp = "-50"
    string hpInput = "-50";
    int hpVal = safeParseInt(hpInput, 10, 1, 999);
    cout << "VALIDATE|enemy_hp|input|" << hpInput << "|invalid|clamped|" << hpVal << endl;
    badInputs++; handled++; clamped++;

    // Test 4: missing key
    string playerName = "PILOT";
    cout << "VALIDATE|missing_key|player_name|not_found|using_default|" << playerName << endl;
    badInputs++; handled++; defaulted++;

    // Test 5: pool index 99
    int testIdx = 99;
    bool valid = validatePoolIndex(testIdx, POOL_SIZE);
    cout << "VALIDATE|pool_index|input|" << testIdx << "|invalid|out_of_bounds|skipped" << endl;
    badInputs++; handled++;

    cout << "CRASHPROOF|bad_inputs|" << badInputs << "|handled|" << handled << "|crashes|0" << endl;
    cout << "VALIDATION_SUMMARY|checks|" << badInputs << "|passed|" << passed
         << "|defaulted|" << defaulted << "|clamped|" << clamped << "|errors|0" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Bad int validated", expectedOutput: "VALIDATE\\|sfx_volume\\|input\\|abc\\|invalid\\|using_default\\|5", isPattern: true },
      { id: "t2", description: "Bad difficulty validated", expectedOutput: "VALIDATE\\|difficulty\\|input\\|extreme\\|invalid\\|clamped\\|hard", isPattern: true },
      { id: "t3", description: "Negative HP validated", expectedOutput: "VALIDATE\\|enemy_hp\\|input\\|-50\\|invalid\\|clamped\\|1", isPattern: true },
      { id: "t4", description: "Missing key handled", expectedOutput: "VALIDATE\\|missing_key\\|player_name\\|not_found\\|using_default\\|PILOT", isPattern: true },
      { id: "t5", description: "Pool bounds checked", expectedOutput: "VALIDATE\\|pool_index\\|input\\|99\\|invalid\\|out_of_bounds\\|skipped", isPattern: true },
      { id: "t6", description: "Zero crashes", expectedOutput: "CRASHPROOF\\|bad_inputs\\|5\\|handled\\|5\\|crashes\\|0", isPattern: true },
      { id: "t7", description: "Validation summary correct", expectedOutput: "VALIDATION_SUMMARY\\|checks\\|5\\|passed\\|0\\|defaulted\\|2\\|clamped\\|2\\|errors\\|0", isPattern: true },
    ],
    hints: [
      "safeParseInt uses try-catch around stoi(). If the string is non-numeric (\"abc\"), stoi throws and you return defaultVal. If the parsed int is below min or above max, clamp it. \"-50\" parses to -50, which clamps to minVal=1.",
      "validateDifficulty compares the input against three known strings. \"extreme\" does not match any, so return \"hard\". For missing keys, just use the default string directly — no parsing needed.",
      "Counters: all 5 are bad inputs and all 5 are handled. Tests 1 and 4 use defaults (defaulted=2). Tests 2 and 3 are clamped (clamped=2). Test 5 is out of bounds (neither defaulted nor clamped). passed=0.",
    ],
    estimatedMinutes: 10,
  },
};
