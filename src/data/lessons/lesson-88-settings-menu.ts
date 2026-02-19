import type { Lesson } from "@/types/lesson";

export const lesson88: Lesson = {
  id: "88-settings-menu",
  title: "Settings Menu",
  description: "Build a settings menu for volume, difficulty, and visual options.",
  order: 88,
  xpReward: 225,
  tier: "pro",
  concepts: ["settings system", "configuration", "user preferences", "menu UI"],
  part1: {
    title: "Concept: Settings Menu",
    type: "concept",
    instructions: `# Settings Menu — Hardcoded Values Cannot Ship

Every game ships with defaults. Volume at 7. Difficulty on Normal. Screen shake on. But players are not default. One plays at midnight with a sleeping partner — volume 0. Another has motion sensitivity — shake off. A third wants punishment — difficulty Hard. If the player cannot change these values, the game excludes them. A settings struct and a menu that mutates it solve this permanently.

## What Breaks Without This

Without a settings system, values are scattered across the codebase. Volume is a global in audio.cpp. Difficulty is a constant in enemy.cpp. Shake toggle is a bool in effects.cpp. Changing one means finding it, recompiling, and hoping nothing else reads the old value. Players cannot change anything at runtime. The game ships with one configuration that fits nobody perfectly.

## The Fix

One struct holds every user-facing preference. One menu displays current values and accepts changes. Every system reads from the struct instead of hardcoded constants. Change the struct, change the behavior. The settings struct is the single source of truth for user preferences.

\\\`\\\`\\\`
struct Settings {
    int sfxVolume;     // 0-10
    int musicVolume;   // 0-10
    int difficulty;    // 1=Easy, 2=Normal, 3=Hard
    bool shakeEnabled;
    bool trailsEnabled;
};
\\\`\\\`\\\`

The menu renders the current state, not a static screen. If sfxVolume is 8, the menu shows "8/10". If shakeEnabled is false, it shows "OFF". The menu is a live view of the settings struct. User input mutates the struct. The next frame, every system sees the new values.

## Your Task

1. Define a Settings struct: sfxVolume(0-10), musicVolume(0-10), difficulty(1-3), shakeEnabled(bool), trailsEnabled(bool)
2. Set defaults: sfx=7, music=5, difficulty=2, shake=true, trails=true
3. Apply changes: sfx 7->8, difficulty 2->3, shake true->false
4. Print the settings menu:
   \\\`SETTINGS|=== OPTIONS ===\\\`
   \\\`SETTINGS|[1] SFX Volume:    8/10\\\`
   \\\`SETTINGS|[2] Music Volume:  5/10\\\`
   \\\`SETTINGS|[3] Difficulty:    Hard\\\`
   \\\`SETTINGS|[4] Screen Shake:  OFF\\\`
   \\\`SETTINGS|[5] Bullet Trails: ON\\\`
5. Print: \\\`SETTINGS_CHANGED|sfx|7->8|difficulty|2->3|shake|ON->OFF\\\`

Expected output:
\\\`\\\`\\\`
SETTINGS|=== OPTIONS ===
SETTINGS|[1] SFX Volume:    8/10
SETTINGS|[2] Music Volume:  5/10
SETTINGS|[3] Difficulty:    Hard
SETTINGS|[4] Screen Shake:  OFF
SETTINGS|[5] Bullet Trails: ON
SETTINGS_CHANGED|sfx|7->8|difficulty|2->3|shake|ON->OFF
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Storing difficulty as a string "Normal" instead of an int. Strings are for display, not logic. The enemy spawn system needs \\\`if (difficulty >= 3) spawnExtra()\\\`. Comparing strings for game logic is slow, fragile, and error-prone. Store the int. Convert to string only at render time. Data is integers. Display is strings.

## Elite Insight

Professional settings systems serialize to disk. The struct writes to a config file on change. On startup, the game reads the file and populates the struct. If the file is missing, use defaults. If the file is corrupt, use defaults. The settings struct is the runtime representation. The file is the persistent representation. Two representations, one truth.

## Cross-Path Echo

Environment variables in web applications follow the same pattern. \\\`DATABASE_URL\\\`, \\\`PORT\\\`, \\\`LOG_LEVEL\\\` — all configurable without code changes. Your settings struct is the environment for the game. Different values, different behavior, same binary.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Settings {
    int sfxVolume;     // 0-10
    int musicVolume;   // 0-10
    int difficulty;    // 1=Easy, 2=Normal, 3=Hard
    bool shakeEnabled;
    bool trailsEnabled;
};

Settings settings;

// TODO: Write initDefaults() — set sfx=7, music=5, difficulty=2,
//       shake=true, trails=true

// TODO: Write getDifficultyName(int d) — return "Easy"/"Normal"/"Hard"

// TODO: Write printMenu() — print all 6 SETTINGS lines
//       Use getDifficultyName for difficulty
//       Use "ON"/"OFF" for booleans

// TODO: Write applyChanges() — sfx=8, difficulty=3, shake=false
//       Print SETTINGS_CHANGED line

int main() {
    // TODO: Init defaults
    // TODO: Apply changes
    // TODO: Print menu
    // TODO: Print SETTINGS_CHANGED

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Settings {
    int sfxVolume;     // 0-10
    int musicVolume;   // 0-10
    int difficulty;    // 1=Easy, 2=Normal, 3=Hard
    bool shakeEnabled;
    bool trailsEnabled;
};

Settings settings;

void initDefaults() {
    settings.sfxVolume = 7;
    settings.musicVolume = 5;
    settings.difficulty = 2;
    settings.shakeEnabled = true;
    settings.trailsEnabled = true;
}

string getDifficultyName(int d) {
    if (d == 1) return "Easy";
    if (d == 2) return "Normal";
    if (d == 3) return "Hard";
    return "Unknown";
}

void printMenu() {
    cout << "SETTINGS|=== OPTIONS ===" << endl;
    cout << "SETTINGS|[1] SFX Volume:    " << settings.sfxVolume << "/10" << endl;
    cout << "SETTINGS|[2] Music Volume:  " << settings.musicVolume << "/10" << endl;
    cout << "SETTINGS|[3] Difficulty:    " << getDifficultyName(settings.difficulty) << endl;
    cout << "SETTINGS|[4] Screen Shake:  " << (settings.shakeEnabled ? "ON" : "OFF") << endl;
    cout << "SETTINGS|[5] Bullet Trails: " << (settings.trailsEnabled ? "ON" : "OFF") << endl;
}

void applyChanges() {
    settings.sfxVolume = 8;
    settings.difficulty = 3;
    settings.shakeEnabled = false;
}

int main() {
    initDefaults();
    applyChanges();
    printMenu();

    cout << "SETTINGS_CHANGED|sfx|7->8|difficulty|2->3|shake|ON->OFF" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Settings header", expectedOutput: "SETTINGS\\|=== OPTIONS ===", isPattern: true },
      { id: "t2", description: "SFX volume updated to 8", expectedOutput: "SETTINGS\\|\\[1\\] SFX Volume:    8/10", isPattern: true },
      { id: "t3", description: "Music volume stays at 5", expectedOutput: "SETTINGS\\|\\[2\\] Music Volume:  5/10", isPattern: true },
      { id: "t4", description: "Difficulty shows Hard", expectedOutput: "SETTINGS\\|\\[3\\] Difficulty:    Hard", isPattern: true },
      { id: "t5", description: "Screen shake OFF", expectedOutput: "SETTINGS\\|\\[4\\] Screen Shake:  OFF", isPattern: true },
      { id: "t6", description: "Bullet trails ON", expectedOutput: "SETTINGS\\|\\[5\\] Bullet Trails: ON", isPattern: true },
      { id: "t7", description: "Settings changed summary", expectedOutput: "SETTINGS_CHANGED\\|sfx\\|7->8\\|difficulty\\|2->3\\|shake\\|ON->OFF", isPattern: true },
    ],
    hints: [
      "initDefaults sets five fields: sfxVolume=7, musicVolume=5, difficulty=2, shakeEnabled=true, trailsEnabled=true. applyChanges modifies three of them before printMenu is called.",
      "getDifficultyName maps integers to strings: 1->\"Easy\", 2->\"Normal\", 3->\"Hard\". Use this in printMenu for the difficulty line. For booleans, use the ternary operator: (value ? \"ON\" : \"OFF\").",
      "The SETTINGS_CHANGED line is a single cout statement with the old and new values separated by pipes. The format is field|old->new for each changed setting. Print it after the menu.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Settings Menu System",
    type: "game_builder",
    instructions: `# Settings Menu — Hardcoded Values Cannot Ship

Every game ships with defaults. But players are not default. One plays at midnight — volume 0. Another has motion sensitivity — shake off. A third wants punishment — difficulty Hard. A settings struct holds all user preferences. A menu displays and mutates them. Every system reads from the struct. Change the struct, change the behavior.

## What Breaks Without This

Without a settings system, values are scattered. Volume in audio.cpp. Difficulty in enemy.cpp. Shake in effects.cpp. Players cannot change anything at runtime. The game ships with one configuration that fits nobody.

## The Fix

One struct. One menu. Every system reads from it. The settings struct is the single source of truth.

\\\`\\\`\\\`
struct Settings {
    int sfxVolume;     // 0-10
    int musicVolume;   // 0-10
    int difficulty;    // 1=Easy, 2=Normal, 3=Hard
    bool shakeEnabled;
    bool trailsEnabled;
};
\\\`\\\`\\\`

## Your Task

1. Define Settings struct with 5 fields
2. Set defaults: sfx=7, music=5, difficulty=2, shake=true, trails=true
3. Apply changes: sfx 7->8, difficulty 2->3, shake true->false
4. Print settings menu with current values
5. Print: \\\`SETTINGS|=== OPTIONS ===\\\`
6. Print: \\\`SETTINGS|[1] SFX Volume:    8/10\\\`
7. Print: \\\`SETTINGS|[2] Music Volume:  5/10\\\`
8. Print: \\\`SETTINGS|[3] Difficulty:    Hard\\\`
9. Print: \\\`SETTINGS|[4] Screen Shake:  OFF\\\`
10. Print: \\\`SETTINGS|[5] Bullet Trails: ON\\\`
11. Print: \\\`SETTINGS_CHANGED|sfx|7->8|difficulty|2->3|shake|ON->OFF\\\`

## Beginner Trap

**Common Mistake:** Printing the menu before applying changes. The menu must reflect the current state of the struct, not the defaults. Apply changes first, then print. The menu is a view of live data.

## Elite Insight

Settings menus in shipped games handle edge cases: clamping values to valid ranges, reverting on cancel, confirming destructive changes. Your struct validation should reject sfxVolume=15 or difficulty=0. Clamp to valid ranges. Invalid input produces valid state.

## Cross-Path Echo

Form state management in React follows the same pattern. A state object holds form values. Inputs mutate state. The render function displays current state. onChange updates the object. onSubmit persists it. Your settings menu is a form with live preview.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Settings {
    int sfxVolume;     // 0-10
    int musicVolume;   // 0-10
    int difficulty;    // 1=Easy, 2=Normal, 3=Hard
    bool shakeEnabled;
    bool trailsEnabled;
};

Settings settings;

// TODO: Write initDefaults() — set sfx=7, music=5, difficulty=2,
//       shake=true, trails=true

// TODO: Write getDifficultyName(int d) — return "Easy"/"Normal"/"Hard"

// TODO: Write printMenu() — print all 6 SETTINGS lines

// TODO: Write applyChanges() — sfx=8, difficulty=3, shake=false

int main() {
    // TODO: Init defaults, apply changes, print menu
    // TODO: Print SETTINGS_CHANGED

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Settings {
    int sfxVolume;     // 0-10
    int musicVolume;   // 0-10
    int difficulty;    // 1=Easy, 2=Normal, 3=Hard
    bool shakeEnabled;
    bool trailsEnabled;
};

Settings settings;

void initDefaults() {
    settings.sfxVolume = 7;
    settings.musicVolume = 5;
    settings.difficulty = 2;
    settings.shakeEnabled = true;
    settings.trailsEnabled = true;
}

string getDifficultyName(int d) {
    if (d == 1) return "Easy";
    if (d == 2) return "Normal";
    if (d == 3) return "Hard";
    return "Unknown";
}

void printMenu() {
    cout << "SETTINGS|=== OPTIONS ===" << endl;
    cout << "SETTINGS|[1] SFX Volume:    " << settings.sfxVolume << "/10" << endl;
    cout << "SETTINGS|[2] Music Volume:  " << settings.musicVolume << "/10" << endl;
    cout << "SETTINGS|[3] Difficulty:    " << getDifficultyName(settings.difficulty) << endl;
    cout << "SETTINGS|[4] Screen Shake:  " << (settings.shakeEnabled ? "ON" : "OFF") << endl;
    cout << "SETTINGS|[5] Bullet Trails: " << (settings.trailsEnabled ? "ON" : "OFF") << endl;
}

void applyChanges() {
    settings.sfxVolume = 8;
    settings.difficulty = 3;
    settings.shakeEnabled = false;
}

int main() {
    initDefaults();
    applyChanges();
    printMenu();

    cout << "SETTINGS_CHANGED|sfx|7->8|difficulty|2->3|shake|ON->OFF" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Settings header renders", expectedOutput: "SETTINGS\\|=== OPTIONS ===", isPattern: true },
      { id: "t2", description: "SFX volume at 8", expectedOutput: "SETTINGS\\|\\[1\\] SFX Volume:    8/10", isPattern: true },
      { id: "t3", description: "Music volume at 5", expectedOutput: "SETTINGS\\|\\[2\\] Music Volume:  5/10", isPattern: true },
      { id: "t4", description: "Difficulty Hard", expectedOutput: "SETTINGS\\|\\[3\\] Difficulty:    Hard", isPattern: true },
      { id: "t5", description: "Shake OFF", expectedOutput: "SETTINGS\\|\\[4\\] Screen Shake:  OFF", isPattern: true },
      { id: "t6", description: "Trails ON", expectedOutput: "SETTINGS\\|\\[5\\] Bullet Trails: ON", isPattern: true },
      { id: "t7", description: "Change log correct", expectedOutput: "SETTINGS_CHANGED\\|sfx\\|7->8\\|difficulty\\|2->3\\|shake\\|ON->OFF", isPattern: true },
    ],
    hints: [
      "Define the Settings struct with 5 fields. initDefaults sets them to: sfxVolume=7, musicVolume=5, difficulty=2, shakeEnabled=true, trailsEnabled=true. Call initDefaults first in main.",
      "applyChanges modifies three fields: sfxVolume to 8, difficulty to 3, shakeEnabled to false. Call it after initDefaults but before printMenu so the menu shows updated values.",
      "printMenu prints 6 lines. Use getDifficultyName(settings.difficulty) for the difficulty display. Use ternary (bool ? \"ON\" : \"OFF\") for shake and trails. The SETTINGS_CHANGED line is a static string.",
    ],
    estimatedMinutes: 8,
  },
};
