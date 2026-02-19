import type { Lesson } from "@/types/lesson";

export const lesson93: Lesson = {
  id: "93-config-file",
  title: "Config File v2",
  description: "Save and load settings from a config file format.",
  order: 93,
  xpReward: 225,
  tier: "pro",
  concepts: ["configuration persistence", "key-value parsing", "file I/O simulation", "settings save/load"],
  part1: {
    title: "Concept: Config File v2",
    type: "concept",
    instructions: `# Config File v2 — Hardcoded Settings Do Not Ship

Every time you recompile to change a volume level, you waste time. Every time a player cannot adjust difficulty, they quit. Settings belong in a file the player can modify without rebuilding the binary. Key-value config files are the simplest format that works: one setting per line, name=value, no ceremony. Parse on load. Format on save. The game reads the file once at startup and writes it when settings change.

## What Breaks Without This

Without config persistence, settings reset every launch. The player sets volume to 3, closes the game, reopens — volume is back to 10. They set difficulty to easy, restart — difficulty is hard again. The player learns that settings do not matter. They stop configuring. They stop playing.

## The Fix

A Settings struct holds all configurable values. A parseConfig function reads lines, splits on '=', and assigns values to the struct. A saveConfig function iterates the struct fields and writes key=value lines. The load-modify-save cycle is: read file into string, parse into struct, modify struct, save struct back to string.

\\\`\\\`\\\`
// Config format:
// sfx_volume=8
// music_volume=5
// difficulty=normal
// shake_enabled=true

struct Settings {
    int sfxVolume;
    int musicVolume;
    string difficulty;
    bool shakeEnabled;
    bool trailsEnabled;
    bool highContrast;
    string playerName;
};

// Parse: split line on '=' -> key, value
// Save: write key=value per field
\\\`\\\`\\\`

The split is trivial: find '=' in the string, substr before it is the key, substr after it is the value. No JSON. No XML. No YAML. Just lines and an equals sign. This is the format that id Software used for Quake configs. It shipped millions of copies.

## Your Task

1. Define a Settings struct with 7 fields
2. Write parseConfig: take an array of config strings, parse into Settings
3. Parse these config lines:
   "sfx_volume=8", "music_volume=5", "difficulty=normal",
   "shake_enabled=true", "trails_enabled=true", "high_contrast=false", "player_name=PILOT"
4. Modify: difficulty -> "hard", shake_enabled -> false
5. Write saveConfig: format Settings back to key=value strings
6. Print: \\\`CONFIG_LOAD|sfx_volume|8|music_volume|5|difficulty|normal\\\`
7. Print: \\\`CONFIG_MODIFY|difficulty|normal->hard|shake_enabled|true->false\\\`
8. Print: \\\`CONFIG_SAVE|lines|7|modified|2\\\`
9. Print one saved line: \\\`CONFIG_FILE|difficulty=hard\\\`
10. Print: \\\`CONFIG_SUMMARY|loaded|7|modified|2|saved|7\\\`

Expected output:
\\\`\\\`\\\`
CONFIG_LOAD|sfx_volume|8|music_volume|5|difficulty|normal
CONFIG_MODIFY|difficulty|normal->hard|shake_enabled|true->false
CONFIG_SAVE|lines|7|modified|2
CONFIG_FILE|difficulty=hard
CONFIG_SUMMARY|loaded|7|modified|2|saved|7
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Parsing the value as the wrong type. "sfx_volume=8" — the 8 is a string until you call stoi(). "shake_enabled=true" — the "true" is a string until you compare it to "true". Every value comes off disk as a string. You convert it based on what the key expects. If the key is "sfx_volume," convert to int. If the key is "shake_enabled," compare to "true"/"false".

## Elite Insight

Production config systems use schema validation. Each key has a type, a default value, a min, a max, and a description. The parser validates every value against the schema. Unknown keys are warnings, not crashes. Missing keys use defaults. This prevents bad config files from breaking the game. Your parser is the minimal version. The schema-validated version ships.

## Cross-Path Echo

Environment variables in web applications follow the same pattern. \\\`.env\\\` files contain KEY=VALUE pairs. The application reads them at startup. DATABASE_URL, API_KEY, PORT — all strings parsed into typed values. Your config parser is a .env loader for games.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Settings {
    int sfxVolume;
    int musicVolume;
    string difficulty;
    bool shakeEnabled;
    bool trailsEnabled;
    bool highContrast;
    string playerName;
};

const int MAX_CONFIG_LINES = 10;

// TODO: Write parseConfig(lines[], count, settings)
//   For each line, split on '=' to get key and value
//   Assign to the correct Settings field based on key
//   "true"/"false" -> bool, numeric strings -> int

// TODO: Write saveConfig(settings, output[], &outCount)
//   Write each setting as "key=value" into output array
//   Return count of lines written

int main() {
    Settings settings;
    string configLines[MAX_CONFIG_LINES] = {
        "sfx_volume=8",
        "music_volume=5",
        "difficulty=normal",
        "shake_enabled=true",
        "trails_enabled=true",
        "high_contrast=false",
        "player_name=PILOT"
    };
    int lineCount = 7;

    // TODO: Parse config into settings
    // TODO: Print CONFIG_LOAD line
    // TODO: Modify difficulty to "hard" and shake_enabled to false
    // TODO: Print CONFIG_MODIFY line
    // TODO: Save config back to strings
    // TODO: Print CONFIG_SAVE, CONFIG_FILE, CONFIG_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Settings {
    int sfxVolume;
    int musicVolume;
    string difficulty;
    bool shakeEnabled;
    bool trailsEnabled;
    bool highContrast;
    string playerName;
};

const int MAX_CONFIG_LINES = 10;

void parseConfig(string lines[], int count, Settings &settings) {
    for (int i = 0; i < count; i++) {
        int eq = lines[i].find('=');
        string key = lines[i].substr(0, eq);
        string val = lines[i].substr(eq + 1);

        if (key == "sfx_volume") settings.sfxVolume = stoi(val);
        else if (key == "music_volume") settings.musicVolume = stoi(val);
        else if (key == "difficulty") settings.difficulty = val;
        else if (key == "shake_enabled") settings.shakeEnabled = (val == "true");
        else if (key == "trails_enabled") settings.trailsEnabled = (val == "true");
        else if (key == "high_contrast") settings.highContrast = (val == "true");
        else if (key == "player_name") settings.playerName = val;
    }
}

void saveConfig(Settings &settings, string output[], int &outCount) {
    outCount = 0;
    output[outCount++] = "sfx_volume=" + to_string(settings.sfxVolume);
    output[outCount++] = "music_volume=" + to_string(settings.musicVolume);
    output[outCount++] = "difficulty=" + settings.difficulty;
    output[outCount++] = "shake_enabled=" + string(settings.shakeEnabled ? "true" : "false");
    output[outCount++] = "trails_enabled=" + string(settings.trailsEnabled ? "true" : "false");
    output[outCount++] = "high_contrast=" + string(settings.highContrast ? "true" : "false");
    output[outCount++] = "player_name=" + settings.playerName;
}

int main() {
    Settings settings;
    string configLines[MAX_CONFIG_LINES] = {
        "sfx_volume=8",
        "music_volume=5",
        "difficulty=normal",
        "shake_enabled=true",
        "trails_enabled=true",
        "high_contrast=false",
        "player_name=PILOT"
    };
    int lineCount = 7;

    parseConfig(configLines, lineCount, settings);
    cout << "CONFIG_LOAD|sfx_volume|" << settings.sfxVolume
         << "|music_volume|" << settings.musicVolume
         << "|difficulty|" << settings.difficulty << endl;

    string oldDiff = settings.difficulty;
    bool oldShake = settings.shakeEnabled;
    settings.difficulty = "hard";
    settings.shakeEnabled = false;
    cout << "CONFIG_MODIFY|difficulty|" << oldDiff << "->" << settings.difficulty
         << "|shake_enabled|" << (oldShake ? "true" : "false") << "->"
         << (settings.shakeEnabled ? "true" : "false") << endl;

    string savedLines[MAX_CONFIG_LINES];
    int savedCount = 0;
    saveConfig(settings, savedLines, savedCount);
    cout << "CONFIG_SAVE|lines|" << savedCount << "|modified|2" << endl;

    for (int i = 0; i < savedCount; i++) {
        if (savedLines[i].find("difficulty") != string::npos) {
            cout << "CONFIG_FILE|" << savedLines[i] << endl;
            break;
        }
    }

    cout << "CONFIG_SUMMARY|loaded|" << lineCount << "|modified|2|saved|" << savedCount << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Config loads correctly", expectedOutput: "CONFIG_LOAD\\|sfx_volume\\|8\\|music_volume\\|5\\|difficulty\\|normal", isPattern: true },
      { id: "t2", description: "Config modify logged", expectedOutput: "CONFIG_MODIFY\\|difficulty\\|normal->hard\\|shake_enabled\\|true->false", isPattern: true },
      { id: "t3", description: "Config save count", expectedOutput: "CONFIG_SAVE\\|lines\\|7\\|modified\\|2", isPattern: true },
      { id: "t4", description: "Saved difficulty line", expectedOutput: "CONFIG_FILE\\|difficulty=hard", isPattern: true },
      { id: "t5", description: "Config summary", expectedOutput: "CONFIG_SUMMARY\\|loaded\\|7\\|modified\\|2\\|saved\\|7", isPattern: true },
    ],
    hints: [
      "parseConfig loops through each line, finds '=' with string::find, splits into key (substr before =) and value (substr after =). Match the key string to set the correct field.",
      "For bool fields, compare the value string to \"true\". For int fields, use stoi(). For string fields, assign directly. Save the old values before modifying so you can print the change.",
      "saveConfig builds key=value strings using to_string() for ints, ternary for bools (\"true\"/\"false\"), and direct concatenation for strings. Output count should be 7.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Config File v2",
    type: "game_builder",
    instructions: `# Game Builder: Config File v2 — Persistent Settings

Players expect their settings to survive between sessions. Volume, difficulty, accessibility options — all must persist. A config file in key=value format is the simplest solution that works. Parse on load, modify in-game, save on change. The load-modify-save cycle is the backbone of every settings system.

## What Breaks Without This

Without persistence, every launch is a fresh start. The player who spent 30 seconds configuring their preferred volume, difficulty, and accessibility settings has to redo it all. After the third time, they stop configuring and play with defaults that do not match their needs. Persistence respects the player's time.

## The Fix

A config file with one setting per line. Each line is key=value. The parser splits on '=', maps keys to struct fields, and converts strings to typed values. The save function reverses the process. The cycle is atomic: load everything, modify in memory, save everything.

\\\`\\\`\\\`
// Config file (data/config.txt):
// sfx_volume=8
// music_volume=5
// difficulty=normal
// shake_enabled=true
// trails_enabled=true
// high_contrast=false
// player_name=PILOT
\\\`\\\`\\\`

## Your Task

1. Parse 7 config lines into a Settings struct
2. Print: \\\`CONFIG_LOAD|sfx_volume|8|music_volume|5|difficulty|normal\\\`
3. Modify: difficulty -> "hard", shake_enabled -> false
4. Print: \\\`CONFIG_MODIFY|difficulty|normal->hard|shake_enabled|true->false\\\`
5. Save settings back to key=value format
6. Print: \\\`CONFIG_SAVE|lines|7|modified|2\\\`
7. Print: \\\`CONFIG_FILE|difficulty=hard\\\`
8. Print: \\\`CONFIG_SUMMARY|loaded|7|modified|2|saved|7\\\`

## Beginner Trap

**Common Mistake:** Not handling the save format consistently. If parseConfig expects "shake_enabled=true" but saveConfig writes "shake_enabled=1", the round-trip breaks. Parse and save must agree on format. Bools are "true"/"false" strings. Ints are decimal strings. Strings are raw values.

## Elite Insight

Config file versioning prevents breaking changes. Add a "config_version=2" line. When loading, check the version. If the file is version 1 and the code expects version 2, run a migration function that adds new keys with defaults. This is database migration for game settings. Never delete old keys. Append new ones.

## Cross-Path Echo

JSON.parse and JSON.stringify in JavaScript follow the same load-modify-save cycle. Read a JSON file, parse it into an object, modify properties, stringify back to JSON, write to file. Your key=value parser is a simplified JSON.parse. Same concept, simpler format.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Settings {
    int sfxVolume;
    int musicVolume;
    string difficulty;
    bool shakeEnabled;
    bool trailsEnabled;
    bool highContrast;
    string playerName;
};

const int MAX_CONFIG_LINES = 10;

// TODO: Write parseConfig(lines[], count, settings) — split on '='

// TODO: Write saveConfig(settings, output[], &outCount) — format key=value

int main() {
    Settings settings;
    string configLines[MAX_CONFIG_LINES] = {
        "sfx_volume=8",
        "music_volume=5",
        "difficulty=normal",
        "shake_enabled=true",
        "trails_enabled=true",
        "high_contrast=false",
        "player_name=PILOT"
    };
    int lineCount = 7;

    // TODO: Parse, print load, modify, print modify, save, print save+summary

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Settings {
    int sfxVolume;
    int musicVolume;
    string difficulty;
    bool shakeEnabled;
    bool trailsEnabled;
    bool highContrast;
    string playerName;
};

const int MAX_CONFIG_LINES = 10;

void parseConfig(string lines[], int count, Settings &settings) {
    for (int i = 0; i < count; i++) {
        int eq = lines[i].find('=');
        string key = lines[i].substr(0, eq);
        string val = lines[i].substr(eq + 1);

        if (key == "sfx_volume") settings.sfxVolume = stoi(val);
        else if (key == "music_volume") settings.musicVolume = stoi(val);
        else if (key == "difficulty") settings.difficulty = val;
        else if (key == "shake_enabled") settings.shakeEnabled = (val == "true");
        else if (key == "trails_enabled") settings.trailsEnabled = (val == "true");
        else if (key == "high_contrast") settings.highContrast = (val == "true");
        else if (key == "player_name") settings.playerName = val;
    }
}

void saveConfig(Settings &settings, string output[], int &outCount) {
    outCount = 0;
    output[outCount++] = "sfx_volume=" + to_string(settings.sfxVolume);
    output[outCount++] = "music_volume=" + to_string(settings.musicVolume);
    output[outCount++] = "difficulty=" + settings.difficulty;
    output[outCount++] = "shake_enabled=" + string(settings.shakeEnabled ? "true" : "false");
    output[outCount++] = "trails_enabled=" + string(settings.trailsEnabled ? "true" : "false");
    output[outCount++] = "high_contrast=" + string(settings.highContrast ? "true" : "false");
    output[outCount++] = "player_name=" + settings.playerName;
}

int main() {
    Settings settings;
    string configLines[MAX_CONFIG_LINES] = {
        "sfx_volume=8",
        "music_volume=5",
        "difficulty=normal",
        "shake_enabled=true",
        "trails_enabled=true",
        "high_contrast=false",
        "player_name=PILOT"
    };
    int lineCount = 7;

    parseConfig(configLines, lineCount, settings);
    cout << "CONFIG_LOAD|sfx_volume|" << settings.sfxVolume
         << "|music_volume|" << settings.musicVolume
         << "|difficulty|" << settings.difficulty << endl;

    string oldDiff = settings.difficulty;
    bool oldShake = settings.shakeEnabled;
    settings.difficulty = "hard";
    settings.shakeEnabled = false;
    cout << "CONFIG_MODIFY|difficulty|" << oldDiff << "->" << settings.difficulty
         << "|shake_enabled|" << (oldShake ? "true" : "false") << "->"
         << (settings.shakeEnabled ? "true" : "false") << endl;

    string savedLines[MAX_CONFIG_LINES];
    int savedCount = 0;
    saveConfig(settings, savedLines, savedCount);
    cout << "CONFIG_SAVE|lines|" << savedCount << "|modified|2" << endl;

    for (int i = 0; i < savedCount; i++) {
        if (savedLines[i].find("difficulty") != string::npos) {
            cout << "CONFIG_FILE|" << savedLines[i] << endl;
            break;
        }
    }

    cout << "CONFIG_SUMMARY|loaded|" << lineCount << "|modified|2|saved|" << savedCount << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Config loads values", expectedOutput: "CONFIG_LOAD\\|sfx_volume\\|8\\|music_volume\\|5\\|difficulty\\|normal", isPattern: true },
      { id: "t2", description: "Modifications tracked", expectedOutput: "CONFIG_MODIFY\\|difficulty\\|normal->hard\\|shake_enabled\\|true->false", isPattern: true },
      { id: "t3", description: "Save line count", expectedOutput: "CONFIG_SAVE\\|lines\\|7\\|modified\\|2", isPattern: true },
      { id: "t4", description: "Difficulty saved correctly", expectedOutput: "CONFIG_FILE\\|difficulty=hard", isPattern: true },
      { id: "t5", description: "Summary totals", expectedOutput: "CONFIG_SUMMARY\\|loaded\\|7\\|modified\\|2\\|saved\\|7", isPattern: true },
    ],
    hints: [
      "parseConfig uses string::find('=') to locate the separator. Key is substr(0, eq). Value is substr(eq+1). Match the key to assign the correct struct field.",
      "Save old values before modifying. oldDiff = settings.difficulty, oldShake = settings.shakeEnabled. Then modify. The MODIFY line shows old->new for each changed field.",
      "saveConfig writes 7 lines. Use to_string for ints, ternary \"true\"/\"false\" for bools, direct string for strings. Loop through saved lines to find and print the difficulty line.",
    ],
    estimatedMinutes: 10,
  },
};
