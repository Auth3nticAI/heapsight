import type { GameLessonVariant } from "@/types/game";

export const lesson58SpaceShooter: GameLessonVariant = {
  lessonId: "58-wave-file-format",
  instructions: `# Wave File Format — Data-Driven Waves for Your Space Shooter

Your enemy spawns are hardcoded. Wave 1 spawns 3 basics. Wave 2 spawns 5 fasts. Want to change that? Recompile. Define a simple text format, parse it with string operations, and spawn enemies from data. The game becomes configurable without touching code.

## What Breaks Without This

Without data-driven waves, your space shooter is frozen at compile time. Every balance tweak is a code change. Every new wave is a new block of spawn calls. The game cannot be modded, cannot be tuned by non-programmers, and cannot load different wave sets for different difficulty levels.

## The Fix

One string per wave. Comma-separated key:value pairs. Parse with \\\`find\\\` and \\\`substr\\\`. Fill a struct. Spawn from the struct. The game loop reads data, not hardcoded values.

\\\`\\\`\\\`
"wave:1,count:3,type:basic,speed:2,pattern:line,delay:0"
\\\`\\\`\\\`

Parse each field. Build a WaveDef. Iterate the WaveDef array to spawn enemies. Add a wave by adding a string. Remove a wave by removing a string. No code changes.

## Your Task

1. Wave data strings:
   - \\\`"wave:1,count:3,type:basic,speed:2,pattern:line,delay:0"\\\`
   - \\\`"wave:2,count:5,type:fast,speed:4,pattern:zigzag,delay:10"\\\`
   - \\\`"wave:3,count:2,type:boss,speed:1,pattern:hover,delay:20"\\\`
2. Write parseValue(line, key) to extract a value from the format
3. Write parseWave(line) to fill a WaveDef struct
4. Load all 3 waves, print WAVE_DEF for each
5. Spawn enemies per wave: x starts at 80, spaced 60 apart, y=0
6. Print: \\\`WAVE_SPAWN|wave|1|enemy|basic_0|pos|80,0|speed|2\\\`
7. Print: \\\`WAVES_LOADED|count|3|total_enemies|10\\\`

## Beginner Trap

**Common Mistake:** Forgetting that the last field has no trailing comma. Your parseValue must handle both cases: value ends at comma OR at end of string. Use \\\`find(",", start)\\\` and check for \\\`string::npos\\\`.

## Elite Insight

id Software shipped .def files with Doom 3. Every entity, every weapon, every monster was defined in text files. Modders changed the game without touching a line of C++. Data-driven design is not a luxury. It is the difference between a game that ships and a game that stalls.

## Cross-Path Echo

Infrastructure as Code follows the same principle. Terraform defines servers in HCL files. CloudFormation uses YAML. The infrastructure changes by editing data, not by manually clicking in a console. Your wave file is game design as data.`,
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

// TODO: Write parseValue(line, key) — extract value for given key

// TODO: Write parseWave(line) — fill waves[waveCount], increment

// TODO: Write spawnWaveEnemies(waveIdx) — spawn enemies per wave def
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
    { id: "g1", description: "Wave 1 definition parsed", expectedOutput: "WAVE_DEF\\|wave:1\\|count:3\\|type:basic\\|speed:2\\|pattern:line", isPattern: true },
    { id: "g2", description: "Wave 3 definition parsed", expectedOutput: "WAVE_DEF\\|wave:3\\|count:2\\|type:boss\\|speed:1\\|pattern:hover", isPattern: true },
    { id: "g3", description: "Wave 1 first enemy spawned", expectedOutput: "WAVE_SPAWN\\|wave\\|1\\|enemy\\|basic_0\\|pos\\|80,0\\|speed\\|2", isPattern: true },
    { id: "g4", description: "Wave 2 enemy spawned", expectedOutput: "WAVE_SPAWN\\|wave\\|2\\|enemy\\|fast_\\d+\\|pos\\|\\d+,0\\|speed\\|4", isPattern: true },
    { id: "g5", description: "Boss enemy spawned", expectedOutput: "WAVE_SPAWN\\|wave\\|3\\|enemy\\|boss_\\d+\\|pos\\|\\d+,0\\|speed\\|1", isPattern: true },
    { id: "g6", description: "All waves loaded with total", expectedOutput: "WAVES_LOADED\\|count\\|3\\|total_enemies\\|10", isPattern: true },
  ],
  hints: [
    "parseValue: find the key position, then start = pos + key.length(). Find the next comma after start. If no comma (string::npos), use line.length() as end. Return substr(start, end - start).",
    "Enemies spawn at x = 80 + i * 60 for i = 0 to count-1. Wave 1: x = 80, 140, 200. Wave 2: x = 80, 140, 200, 260, 320.",
    "The delay field is parsed but not used for spawning in this exercise. It defines the frame at which the wave should begin spawning in a real game loop.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int FIXED_DT = 16;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;

const int GRID_W = 4;
const int GRID_H = 4;
const int CELL_SIZE = 100;
const int MAX_PER_CELL = 10;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

int grid[GRID_W * GRID_H][MAX_PER_CELL];
int gridCount[GRID_W * GRID_H];

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;

// Wave file format
struct WaveDef {
    int waveNum;
    int count;
    string typeName;
    int speed;
    string patternName;
    int delay;
};

const int MAX_WAVES = 10;
WaveDef waveDefs[MAX_WAVES];
int waveDefCount = 0;

string parseValue(const string& line, const string& key) {
    int pos = line.find(key);
    if (pos == string::npos) return "";
    int start = pos + key.length();
    int end = line.find(",", start);
    if (end == string::npos) end = line.length();
    return line.substr(start, end - start);
}

void parseWaveDef(const string& line) {
    waveDefs[waveDefCount].waveNum = stoi(parseValue(line, "wave:"));
    waveDefs[waveDefCount].count = stoi(parseValue(line, "count:"));
    waveDefs[waveDefCount].typeName = parseValue(line, "type:");
    waveDefs[waveDefCount].speed = stoi(parseValue(line, "speed:"));
    waveDefs[waveDefCount].patternName = parseValue(line, "pattern:");
    waveDefs[waveDefCount].delay = stoi(parseValue(line, "delay:"));
    waveDefCount++;
}

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };

Action mapInput(char c) {
    switch (c) {
        case 'w': return MOVE_UP;
        case 's': return MOVE_DOWN;
        case 'a': return MOVE_LEFT;
        case 'd': return MOVE_RIGHT;
        case ' ': return FIRE;
        default: return NONE;
    }
}

int spawnFromPool(int px, int py, int pvx, int pvy, int php, int ptype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = pvx;
    vy[idx] = pvy;
    hp[idx] = php;
    type[idx] = ptype;
    alive[idx] = true;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

int hashPosition(int wx, int wy) {
    int cx = wx / CELL_SIZE;
    int cy = wy / CELL_SIZE;
    return cy * GRID_W + cx;
}

void clearGrid() {
    for (int i = 0; i < GRID_W * GRID_H; i++) {
        gridCount[i] = 0;
    }
}

void insertAllToGrid(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int idx = hashPosition(x[i], y[i]);
        if (idx >= 0 && idx < GRID_W * GRID_H && gridCount[idx] < MAX_PER_CELL) {
            grid[idx][gridCount[idx]] = i;
            gridCount[idx]++;
        }
    }
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void spatialCollisionSystem() {
    for (int c = 0; c < GRID_W * GRID_H; c++) {
        if (gridCount[c] < 2) continue;
        for (int i = 0; i < gridCount[c]; i++) {
            for (int j = i + 1; j < gridCount[c]; j++) {
                int a = grid[c][i];
                int b = grid[c][j];
                if (type[a] == type[b]) continue;
                int bIdx = (type[a] == 1) ? a : b;
                int eIdx = (type[a] == 2) ? a : b;
                if (type[bIdx] != 1 || type[eIdx] != 2) continue;
                int dx = x[bIdx] - x[eIdx];
                int dy = y[bIdx] - y[eIdx];
                if (dx < 0) dx = -dx;
                if (dy < 0) dy = -dy;
                if (dx < 18 && dy < 18) {
                    hp[bIdx] = 0;
                    hp[eIdx]--;
                    score += 100;
                    kills++;
                }
            }
        }
    }
}

void cleanupSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) alive[i] = false;
    }
}

int countAlive(int count) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i]) c++;
    }
    return c;
}

int worldToScreenX(int wx, int camX) {
    return (wx - camX) * SCREEN_W / VIEW_W;
}

int worldToScreenY(int wy, int camY) {
    return (wy - camY) * SCREEN_H / VIEW_H;
}

void processInput(char input, int playerIdx) {
    Action a = mapInput(input);
    if (a == MOVE_UP) y[playerIdx] -= 4;
    else if (a == MOVE_DOWN) y[playerIdx] += 4;
    else if (a == MOVE_LEFT) x[playerIdx] -= 4;
    else if (a == MOVE_RIGHT) x[playerIdx] += 4;
    else if (a == FIRE) {
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1);
    }
}

void spawnWaveFromDef(int waveIdx) {
    WaveDef& w = waveDefs[waveIdx];
    int spd = w.speed;
    for (int i = 0; i < w.count; i++) {
        int spawnX = 80 + i * 60;
        spawnFromPool(spawnX, 0, 0, spd, 1, 2);
    }
}

void renderSystem(int count, int camX, int camY) {
    char screenGrid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            screenGrid[r][c] = '.';

    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int sx = worldToScreenX(x[i], camX);
        int sy = worldToScreenY(y[i], camY);
        if (sx >= 0 && sx < SCREEN_W && sy >= 0 && sy < SCREEN_H) {
            if (type[i] == 0) screenGrid[sy][sx] = 'P';
            else if (type[i] == 1) screenGrid[sy][sx] = '|';
            else if (type[i] == 2) screenGrid[sy][sx] = 'V';
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << screenGrid[r][c];
        cout << endl;
    }
}

void debugSystem(int frame, int count) {
    int active = countAlive(count);
    cout << "DEBUG|frame|" << frame << "|active|" << active
         << "|pool|" << active << "/" << POOL_SIZE
         << "|fps|60|kills|" << kills << endl;
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    // Load wave definitions
    string waveData[] = {
        "wave:1,count:3,type:basic,speed:2,pattern:line,delay:0",
        "wave:2,count:5,type:fast,speed:4,pattern:zigzag,delay:10",
        "wave:3,count:2,type:boss,speed:1,pattern:hover,delay:20"
    };
    for (int i = 0; i < 3; i++) parseWaveDef(waveData[i]);

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);

    // Spawn wave 1 from data
    spawnWaveFromDef(0);
    int count = entityCount;

    string frameInputs[] = {"w", " ", "w", "d", "w"};

    for (int frame = 1; frame <= 5; frame++) {
        processInput(frameInputs[frame - 1][0], playerIdx);
        count = (entityCount > count) ? entityCount : count;

        movementSystem(count);
        clearGrid();
        insertAllToGrid(count);
        spatialCollisionSystem();
        cleanupSystem(count);

        int active = countAlive(count);
        cout << "FRAME|" << frame << "|entities|" << active
             << "|score|" << score << "|lives|" << lives
             << "|wave|" << wave << endl;
        debugSystem(frame, count);
    }

    cout << "SCORE|" << score << endl;
    return 0;
}
`,
};
