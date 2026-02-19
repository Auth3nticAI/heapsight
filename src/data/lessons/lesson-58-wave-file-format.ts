import type { Lesson } from "@/types/lesson";

export const lesson58: Lesson = {
  id: "58-wave-file-format",
  title: "Wave File Format",
  description: "Define and parse a wave file format for configurable enemy waves.",
  order: 58,
  xpReward: 200,
  tier: "pro",
  concepts: ["file format design", "data parsing", "wave definition", "string tokenization"],
  part1: {
    title: "Concept: Wave File Format",
    type: "concept",
    instructions: `# Wave File Format — Hardcoded Data Is a Prison

You have enemy waves hardcoded in your game loop. Want to change wave 3 from 5 enemies to 7? Recompile. Want to add a new wave? Rewrite spawn logic. Want a designer to tweak difficulty? They cannot touch your code. Hardcoded data locks you in.

## What Breaks Without This

Without data-driven waves, every balance change requires a code change. A code change requires a compile. A compile requires a programmer. Your designer cannot iterate. Your game cannot be modded. Your difficulty curve is frozen in source code. One string change should not require rebuilding the binary.

## The Fix

Define a simple text format. One line per wave:

\\\`\\\`\\\`
wave:1,count:5,type:basic,speed:2,pattern:line
\\\`\\\`\\\`

Parse it with string operations. Find the delimiter, extract the key, extract the value. Fill a struct. No XML. No JSON. No parser library. Just \\\`find\\\` and \\\`substr\\\`.

\\\`\\\`\\\`
pos = line.find("count:");
value = line.substr(pos + 6, line.find(",", pos) - pos - 6);
\\\`\\\`\\\`

Load multiple lines into an array of WaveDef structs. The game reads the data. The data drives the behavior. Change the data, change the game.

## Your Task

1. Define WaveDef struct: waveNum, count, typeName (string), speed, patternName (string)
2. Parse 3 wave definition strings using find/substr
3. Store parsed data in WaveDef array
4. Print each parsed wave: \\\`WAVE_DEF|wave:1|count:3|type:basic|speed:2|pattern:line\\\`
5. Calculate total enemies across all waves
6. Print: \\\`WAVES_LOADED|count|3|total_enemies|10\\\`

Expected output:
\\\`\\\`\\\`
WAVE_DEF|wave:1|count:3|type:basic|speed:2|pattern:line
WAVE_DEF|wave:2|count:5|type:fast|speed:4|pattern:zigzag
WAVE_DEF|wave:3|count:2|type:boss|speed:1|pattern:hover
WAVES_LOADED|count|3|total_enemies|10
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Using \\\`getline\\\` or \\\`cin\\\` to read wave data from actual files. In this exercise, the wave strings are hardcoded as string literals simulating file content. Parse the strings directly. File I/O is a separate concern.

## Elite Insight

This is the seed of every data-driven engine. Unreal has DataTables. Unity has ScriptableObjects. id Tech had .def files. The format does not matter. What matters is separation: code defines behavior, data configures it. Your game binary never changes when a designer tweaks a wave.

## Cross-Path Echo

Configuration files drive every production system. Nginx reads nginx.conf. Kubernetes reads YAML manifests. Docker reads Dockerfiles. The pattern is universal: define a format, parse it at startup, let the data drive behavior. Your wave file is a game-specific config format.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct WaveDef {
    int waveNum;
    int count;
    string typeName;
    int speed;
    string patternName;
};

const int MAX_WAVES = 10;
WaveDef waves[MAX_WAVES];
int waveCount = 0;

// TODO: Write parseValue(line, key) — find key in line, extract value until next comma or end
//       Example: parseValue("wave:1,count:5", "count:") returns "5"

// TODO: Write parseWave(line) — parse all fields, fill waves[waveCount], increment waveCount

int main() {
    string waveData[] = {
        "wave:1,count:3,type:basic,speed:2,pattern:line",
        "wave:2,count:5,type:fast,speed:4,pattern:zigzag",
        "wave:3,count:2,type:boss,speed:1,pattern:hover"
    };

    // TODO: Parse all 3 wave strings
    // TODO: Print WAVE_DEF for each wave
    // TODO: Calculate total enemies and print WAVES_LOADED

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct WaveDef {
    int waveNum;
    int count;
    string typeName;
    int speed;
    string patternName;
};

const int MAX_WAVES = 10;
WaveDef waves[MAX_WAVES];
int waveCount = 0;

string parseValue(const string& line, const string& key) {
    int pos = line.find(key);
    if (pos == string::npos) return "";
    int start = pos + key.length();
    int end = line.find(",", start);
    if (end == string::npos) end = line.length();
    return line.substr(start, end - start);
}

void parseWave(const string& line) {
    waves[waveCount].waveNum = stoi(parseValue(line, "wave:"));
    waves[waveCount].count = stoi(parseValue(line, "count:"));
    waves[waveCount].typeName = parseValue(line, "type:");
    waves[waveCount].speed = stoi(parseValue(line, "speed:"));
    waves[waveCount].patternName = parseValue(line, "pattern:");
    waveCount++;
}

int main() {
    string waveData[] = {
        "wave:1,count:3,type:basic,speed:2,pattern:line",
        "wave:2,count:5,type:fast,speed:4,pattern:zigzag",
        "wave:3,count:2,type:boss,speed:1,pattern:hover"
    };

    for (int i = 0; i < 3; i++) {
        parseWave(waveData[i]);
    }

    int totalEnemies = 0;
    for (int i = 0; i < waveCount; i++) {
        cout << "WAVE_DEF|wave:" << waves[i].waveNum
             << "|count:" << waves[i].count
             << "|type:" << waves[i].typeName
             << "|speed:" << waves[i].speed
             << "|pattern:" << waves[i].patternName << endl;
        totalEnemies += waves[i].count;
    }

    cout << "WAVES_LOADED|count|" << waveCount
         << "|total_enemies|" << totalEnemies << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Wave 1 parsed correctly", expectedOutput: "WAVE_DEF\\|wave:1\\|count:3\\|type:basic\\|speed:2\\|pattern:line", isPattern: true },
      { id: "t2", description: "Wave 2 parsed correctly", expectedOutput: "WAVE_DEF\\|wave:2\\|count:5\\|type:fast\\|speed:4\\|pattern:zigzag", isPattern: true },
      { id: "t3", description: "Wave 3 parsed correctly", expectedOutput: "WAVE_DEF\\|wave:3\\|count:2\\|type:boss\\|speed:1\\|pattern:hover", isPattern: true },
      { id: "t4", description: "All waves loaded with correct total", expectedOutput: "WAVES_LOADED\\|count\\|3\\|total_enemies\\|10", isPattern: true },
    ],
    hints: [
      "Use string::find(key) to locate the key. The value starts at pos + key.length(). The value ends at the next comma or the end of the string.",
      "For integer fields (wave, count, speed), parse the value string then convert with stoi(). For string fields (type, pattern), use the value directly.",
      "Total enemies = sum of all wave counts: 3 + 5 + 2 = 10.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Wave File Loader",
    type: "game_builder",
    instructions: `# Game Builder: Wave File Loader — Data-Driven Enemy Spawning

Your space shooter has hardcoded enemy spawns. That is brittle. Define a wave format, parse it, and spawn enemies from the parsed data. The game reads wave definitions from strings (simulating a file), builds WaveDef structs, and spawns enemies according to each wave's configuration.

## What Breaks Without This

Without data-driven waves, you cannot iterate on game feel without recompiling. A designer wants 7 enemies in wave 2 instead of 5? Code change. A playtester says wave 3 is too fast? Code change. Data-driven design separates what changes often (balance) from what changes rarely (systems).

## The Fix

Define the format. Parse the format. Spawn from the parsed data. Three clean steps. The game loop does not know how many waves exist or what they contain. It reads the WaveDef array and executes.

\\\`\\\`\\\`
for each WaveDef:
  for i = 0 to def.count:
    spawnEnemy(def.typeName, def.speed, def.patternName)
\\\`\\\`\\\`

## Your Task

1. Wave data strings (simulating data/waves.txt):
   - \\\`"wave:1,count:3,type:basic,speed:2,pattern:line,delay:0"\\\`
   - \\\`"wave:2,count:5,type:fast,speed:4,pattern:zigzag,delay:10"\\\`
   - \\\`"wave:3,count:2,type:boss,speed:1,pattern:hover,delay:20"\\\`
2. parseWave function tokenizes and fills WaveDef struct (with delay field)
3. Load all 3 waves into WaveDef array
4. Spawn enemies per wave definition: x starts at 80, spaced 60 apart, y=0
5. Print: \\\`WAVE_DEF|wave:1|count:3|type:basic|speed:2|pattern:line\\\`
6. Print per enemy: \\\`WAVE_SPAWN|wave|1|enemy|basic_0|pos|80,0|speed|2\\\`
7. Print: \\\`WAVES_LOADED|count|3|total_enemies|10\\\`

## Beginner Trap

**Common Mistake:** Parsing "delay:10" and getting "10" but also capturing trailing characters. Always check for the comma delimiter or end of string. \\\`substr(start, end - start)\\\` with correct bounds prevents off-by-one errors.

## Elite Insight

Game studios ship data editors, not code editors, to designers. The wave file format is the contract between programmer and designer. The programmer defines what fields exist. The designer fills in the values. The runtime parses and executes. This separation is why teams of 200 can ship a game.

## Cross-Path Echo

API contracts work the same way. The backend defines the schema. The frontend sends conforming requests. Neither side touches the other's code. Your wave format is an API between your data files and your game engine. Change the data, not the code.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct WaveDef {
    int waveNum;
    int count;
    string typeName;
    int speed;
    string patternName;
    int delay;
};

const int MAX_WAVES = 10;
WaveDef waves[MAX_WAVES];
int waveCount = 0;

// TODO: Write parseValue(line, key) — extract value for given key from comma-separated line

// TODO: Write parseWave(line) — fill waves[waveCount] from parsed values, increment

// TODO: Write spawnWaveEnemies(waveIdx) — spawn enemies per wave definition
//       x starts at 80, spaced 60 apart, y=0
//       Print WAVE_SPAWN for each enemy

int main() {
    string waveData[] = {
        "wave:1,count:3,type:basic,speed:2,pattern:line,delay:0",
        "wave:2,count:5,type:fast,speed:4,pattern:zigzag,delay:10",
        "wave:3,count:2,type:boss,speed:1,pattern:hover,delay:20"
    };

    // TODO: Parse all wave strings
    // TODO: Print WAVE_DEF for each wave
    // TODO: Spawn enemies for each wave
    // TODO: Print WAVES_LOADED

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct WaveDef {
    int waveNum;
    int count;
    string typeName;
    int speed;
    string patternName;
    int delay;
};

const int MAX_WAVES = 10;
WaveDef waves[MAX_WAVES];
int waveCount = 0;

string parseValue(const string& line, const string& key) {
    int pos = line.find(key);
    if (pos == string::npos) return "";
    int start = pos + key.length();
    int end = line.find(",", start);
    if (end == string::npos) end = line.length();
    return line.substr(start, end - start);
}

void parseWave(const string& line) {
    waves[waveCount].waveNum = stoi(parseValue(line, "wave:"));
    waves[waveCount].count = stoi(parseValue(line, "count:"));
    waves[waveCount].typeName = parseValue(line, "type:");
    waves[waveCount].speed = stoi(parseValue(line, "speed:"));
    waves[waveCount].patternName = parseValue(line, "pattern:");
    waves[waveCount].delay = stoi(parseValue(line, "delay:"));
    waveCount++;
}

void spawnWaveEnemies(int waveIdx) {
    WaveDef& w = waves[waveIdx];
    for (int i = 0; i < w.count; i++) {
        int spawnX = 80 + i * 60;
        int spawnY = 0;
        cout << "WAVE_SPAWN|wave|" << w.waveNum
             << "|enemy|" << w.typeName << "_" << i
             << "|pos|" << spawnX << "," << spawnY
             << "|speed|" << w.speed << endl;
    }
}

int main() {
    string waveData[] = {
        "wave:1,count:3,type:basic,speed:2,pattern:line,delay:0",
        "wave:2,count:5,type:fast,speed:4,pattern:zigzag,delay:10",
        "wave:3,count:2,type:boss,speed:1,pattern:hover,delay:20"
    };

    for (int i = 0; i < 3; i++) {
        parseWave(waveData[i]);
    }

    int totalEnemies = 0;
    for (int i = 0; i < waveCount; i++) {
        cout << "WAVE_DEF|wave:" << waves[i].waveNum
             << "|count:" << waves[i].count
             << "|type:" << waves[i].typeName
             << "|speed:" << waves[i].speed
             << "|pattern:" << waves[i].patternName << endl;
        totalEnemies += waves[i].count;
    }

    for (int i = 0; i < waveCount; i++) {
        spawnWaveEnemies(i);
    }

    cout << "WAVES_LOADED|count|" << waveCount
         << "|total_enemies|" << totalEnemies << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Wave 1 definition parsed", expectedOutput: "WAVE_DEF\\|wave:1\\|count:3\\|type:basic\\|speed:2\\|pattern:line", isPattern: true },
      { id: "t2", description: "Wave 2 definition parsed", expectedOutput: "WAVE_DEF\\|wave:2\\|count:5\\|type:fast\\|speed:4\\|pattern:zigzag", isPattern: true },
      { id: "t3", description: "Wave 1 enemy spawned", expectedOutput: "WAVE_SPAWN\\|wave\\|1\\|enemy\\|basic_0\\|pos\\|80,0\\|speed\\|2", isPattern: true },
      { id: "t4", description: "Wave 2 enemy spawned", expectedOutput: "WAVE_SPAWN\\|wave\\|2\\|enemy\\|fast_\\d+\\|pos\\|\\d+,0\\|speed\\|4", isPattern: true },
      { id: "t5", description: "All waves loaded", expectedOutput: "WAVES_LOADED\\|count\\|3\\|total_enemies\\|10", isPattern: true },
    ],
    hints: [
      "parseValue finds the key, then extracts from key.length() past the key position to the next comma. If no comma, extract to end of string. This handles the last field correctly.",
      "For spawning, x = 80 + i * 60. First enemy at x=80, second at x=140, third at x=200. All spawn at y=0.",
      "Total enemies: wave 1 has 3, wave 2 has 5, wave 3 has 2. Sum = 10.",
    ],
    estimatedMinutes: 10,
  },
};
