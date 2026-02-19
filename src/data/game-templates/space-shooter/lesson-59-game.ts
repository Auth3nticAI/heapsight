import type { GameLessonVariant } from "@/types/game";

export const lesson59SpaceShooter: GameLessonVariant = {
  lessonId: "59-enemy-ai-linear",
  instructions: `# Enemy AI: Linear — Pattern-Driven Movement for Your Space Shooter

Every enemy falls straight down. The player sits in one spot and fires upward. No challenge. No variety. No reason to move laterally. Give enemies movement patterns. Linear enemies march straight down. Diagonal enemies sweep across the screen. The player must read the pattern and dodge accordingly.

## What Breaks Without This

Without AI patterns, your space shooter is a shooting gallery. Enemies are targets on a rail. The player learns the single pattern and autopilots. Diagonal enemies force the player to move. Mixed patterns create formations that require reading and reacting. The game becomes a game.

## The Fix

AI is a function that returns a velocity. One function per pattern. The AI system dispatches based on pattern type, gets the velocity, applies it. Adding a new pattern is one function and one case in the dispatcher.

\\\`\\\`\\\`
aiLinear:        vx = 0,  vy = speed
aiDiagonalLeft:  vx = -1, vy = speed
aiDiagonalRight: vx = 1,  vy = speed
\\\`\\\`\\\`

The AI system runs every tick before movement. It reads the pattern, calls the function, writes the velocity. The movement system applies it. Clean pipeline.

## Your Task

1. Define 3 AI functions: aiLinear, aiDiagonalLeft, aiDiagonalRight
2. 5 enemies at (100,40), (200,40), (150,40), (250,40), (300,40) with speed=2
3. Patterns: enemy_0=linear, enemy_1=linear, enemy_2=diag_left, enemy_3=diag_left, enemy_4=diag_right
4. Run AI system for 5 ticks
5. Print per tick per enemy: \\\`AI|tick|1|enemy_0|pattern|linear|move|0,2|pos|100,42\\\`
6. Print: \\\`AI|tick|1|enemy_2|pattern|diag_left|move|-1,2|pos|149,42\\\`
7. After 5 ticks: \\\`AI_SUMMARY|tick|5|linear|2|diag_left|2|diag_right|1\\\`

## Beginner Trap

**Common Mistake:** Applying AI velocity to the stored vx/vy fields instead of directly to position. The AI function returns a per-tick delta. Add it to x and y. The stored velocity fields belong to the movement system in the full pipeline. Do not mix them.

## Elite Insight

The dispatch table is the most important pattern in game AI. Doom used function pointers in state tables. Each monster state had a think function. The AI system called the function for the current state. Your if/else chain on a pattern int is the same mechanism. When you add 10 more patterns, you will want a function pointer array. But the architecture is set now.

## Cross-Path Echo

HTTP routers dispatch requests to handler functions by URL pattern. Express uses app.get('/path', handler). Your AI system dispatches to movement functions by pattern type. Same pattern: lookup, dispatch, execute. Every request-response system uses this architecture.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENEMIES = 10;
int ex[MAX_ENEMIES], ey[MAX_ENEMIES];
int espeed[MAX_ENEMIES];
int epattern[MAX_ENEMIES]; // 0=linear, 1=diag_left, 2=diag_right
bool ealive[MAX_ENEMIES];
int enemyCount = 0;

// TODO: Write aiLinear(outVX, outVY, speed)
// TODO: Write aiDiagonalLeft(outVX, outVY, speed)
// TODO: Write aiDiagonalRight(outVX, outVY, speed)

// TODO: Write getPatternName(pattern) — return string name

// TODO: Write aiSystem(tick) — dispatch AI, apply velocity, print

int main() {
    int positions[][2] = {{100,40}, {200,40}, {150,40}, {250,40}, {300,40}};
    int patterns[] = {0, 0, 1, 1, 2};
    int speed = 2;

    for (int i = 0; i < 5; i++) {
        ex[i] = positions[i][0];
        ey[i] = positions[i][1];
        espeed[i] = speed;
        epattern[i] = patterns[i];
        ealive[i] = true;
    }
    enemyCount = 5;

    // TODO: Run 5 ticks of aiSystem
    // TODO: Print AI_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENEMIES = 10;
int ex[MAX_ENEMIES], ey[MAX_ENEMIES];
int espeed[MAX_ENEMIES];
int epattern[MAX_ENEMIES];
bool ealive[MAX_ENEMIES];
int enemyCount = 0;

void aiLinear(int& outVX, int& outVY, int speed) {
    outVX = 0;
    outVY = speed;
}

void aiDiagonalLeft(int& outVX, int& outVY, int speed) {
    outVX = -1;
    outVY = speed;
}

void aiDiagonalRight(int& outVX, int& outVY, int speed) {
    outVX = 1;
    outVY = speed;
}

string getPatternName(int pattern) {
    if (pattern == 0) return "linear";
    if (pattern == 1) return "diag_left";
    if (pattern == 2) return "diag_right";
    return "unknown";
}

void aiSystem(int tick) {
    for (int i = 0; i < enemyCount; i++) {
        if (!ealive[i]) continue;
        int mvx = 0, mvy = 0;
        if (epattern[i] == 0) aiLinear(mvx, mvy, espeed[i]);
        else if (epattern[i] == 1) aiDiagonalLeft(mvx, mvy, espeed[i]);
        else if (epattern[i] == 2) aiDiagonalRight(mvx, mvy, espeed[i]);

        ex[i] += mvx;
        ey[i] += mvy;

        cout << "AI|tick|" << tick << "|enemy_" << i
             << "|pattern|" << getPatternName(epattern[i])
             << "|move|" << mvx << "," << mvy
             << "|pos|" << ex[i] << "," << ey[i] << endl;
    }
}

int main() {
    int positions[][2] = {{100,40}, {200,40}, {150,40}, {250,40}, {300,40}};
    int patterns[] = {0, 0, 1, 1, 2};
    int speed = 2;

    for (int i = 0; i < 5; i++) {
        ex[i] = positions[i][0];
        ey[i] = positions[i][1];
        espeed[i] = speed;
        epattern[i] = patterns[i];
        ealive[i] = true;
    }
    enemyCount = 5;

    for (int tick = 1; tick <= 5; tick++) {
        aiSystem(tick);
    }

    int linearCount = 0, diagLeftCount = 0, diagRightCount = 0;
    for (int i = 0; i < enemyCount; i++) {
        if (!ealive[i]) continue;
        if (epattern[i] == 0) linearCount++;
        else if (epattern[i] == 1) diagLeftCount++;
        else if (epattern[i] == 2) diagRightCount++;
    }

    cout << "AI_SUMMARY|tick|5|linear|" << linearCount
         << "|diag_left|" << diagLeftCount
         << "|diag_right|" << diagRightCount << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Tick 1 linear enemy at correct position", expectedOutput: "AI\\|tick\\|1\\|enemy_0\\|pattern\\|linear\\|move\\|0,2\\|pos\\|100,42", isPattern: true },
    { id: "g2", description: "Tick 1 diagonal left enemy", expectedOutput: "AI\\|tick\\|1\\|enemy_2\\|pattern\\|diag_left\\|move\\|-1,2\\|pos\\|149,42", isPattern: true },
    { id: "g3", description: "Tick 1 diagonal right enemy", expectedOutput: "AI\\|tick\\|1\\|enemy_4\\|pattern\\|diag_right\\|move\\|1,2\\|pos\\|301,42", isPattern: true },
    { id: "g4", description: "Tick 5 accumulated position", expectedOutput: "AI\\|tick\\|5\\|enemy_0\\|pattern\\|linear\\|move\\|0,2\\|pos\\|100,50", isPattern: true },
    { id: "g5", description: "AI summary pattern counts", expectedOutput: "AI_SUMMARY\\|tick\\|5\\|linear\\|2\\|diag_left\\|2\\|diag_right\\|1", isPattern: true },
  ],
  hints: [
    "AI functions use reference parameters. aiLinear sets outVX = 0 and outVY = speed. The caller reads the values after the function returns.",
    "Dispatch with if/else: epattern[i] == 0 calls aiLinear, == 1 calls aiDiagonalLeft, == 2 calls aiDiagonalRight. Apply mvx/mvy to ex[i]/ey[i].",
    "After 5 ticks at speed 2: y goes from 40 to 50. Diagonal left x goes from 150 to 145. Diagonal right x goes from 300 to 305. Linear x stays at 100.",
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
int aiPattern[POOL_SIZE]; // 0=linear, 1=diag_left, 2=diag_right
int aiSpeed[POOL_SIZE];
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

int patternFromName(const string& name) {
    if (name == "line" || name == "linear") return 0;
    if (name == "zigzag" || name == "diag_left") return 1;
    if (name == "hover" || name == "diag_right") return 2;
    return 0;
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
    aiPattern[idx] = 0;
    aiSpeed[idx] = 0;
    alive[idx] = true;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

// AI functions
void aiLinear(int& outVX, int& outVY, int speed) {
    outVX = 0;
    outVY = speed;
}

void aiDiagonalLeft(int& outVX, int& outVY, int speed) {
    outVX = -1;
    outVY = speed;
}

void aiDiagonalRight(int& outVX, int& outVY, int speed) {
    outVX = 1;
    outVY = speed;
}

void aiSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        int mvx = 0, mvy = 0;
        if (aiPattern[i] == 0) aiLinear(mvx, mvy, aiSpeed[i]);
        else if (aiPattern[i] == 1) aiDiagonalLeft(mvx, mvy, aiSpeed[i]);
        else if (aiPattern[i] == 2) aiDiagonalRight(mvx, mvy, aiSpeed[i]);
        vx[i] = mvx;
        vy[i] = mvy;
    }
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
    int pat = patternFromName(w.patternName);
    for (int i = 0; i < w.count; i++) {
        int spawnX = 80 + i * 60;
        int idx = spawnFromPool(spawnX, 0, 0, spd, 1, 2);
        if (idx >= 0) {
            aiPattern[idx] = pat;
            aiSpeed[idx] = spd;
        }
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

    // Spawn wave 1 from data with AI patterns
    spawnWaveFromDef(0);
    int count = entityCount;

    string frameInputs[] = {"w", " ", "w", "d", "w"};

    for (int frame = 1; frame <= 5; frame++) {
        processInput(frameInputs[frame - 1][0], playerIdx);
        count = (entityCount > count) ? entityCount : count;

        // AI decides velocities for enemies
        aiSystem(count);

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
