import type { GameLessonVariant } from "@/types/game";

export const lesson77SpaceShooter: GameLessonVariant = {
  lessonId: "77-stats-screen",
  instructions: `# Game Builder: Stats Screen — Session Performance Dashboard

The stats screen is the player's report card. Every metric accumulated during gameplay — shots, hits, kills, damage, combos — formatted into a scannable display. Raw counters plus derived percentages. The player reads it once and knows exactly what to improve next session.

## What Breaks Without This

Without stats, the player optimizes blindly. They know their score went up but not why. Was it the accuracy improvement or the longer survival? The stats screen decomposes performance into actionable dimensions. Each stat is a lever the player can pull.

## The Fix

Accumulate during gameplay. Display after session. The GameStats struct holds raw counters updated by game events — kill increments kills and damageDealt, hit increments shotsHit, death increments damageTaken. At session end, compute derived metrics and format the display.

\\\`\\\`\\\`
// During gameplay: stats.kills++, stats.damageDealt += dmg
// After session: accuracy = hits * 1000 / shots
// Display: formatted aligned text
\\\`\\\`\\\`

## Your Task

1. Define GameStats with 8 fields
2. Simulate a complete 5-wave session accumulating all stats
3. Compute accuracy using integer math (multiply by 1000 for one decimal place)
4. Print the formatted stats screen with STATS| prefix on each line
5. Print: \\\`STATS|============ SESSION STATS ============\\\`
6. Print: \\\`STATS|Shots Fired:     45\\\`
7. Print: \\\`STATS|Accuracy:        75.5%\\\`
8. Print: \\\`STATS|Score:           3500\\\`

## Beginner Trap

**Common Mistake:** Using floating-point for accuracy display. Integer-only approach: \\\`hits * 1000 / shots\\\` gives tenths. Split into whole and decimal with \\\`/ 10\\\` and \\\`% 10\\\`. No floats needed. No precision issues.

## Elite Insight

Esports titles track hundreds of stats per match. Kill/death ratio, headshot percentage, utility damage, economy rating. Each stat feeds ranking algorithms and skill-based matchmaking. Your 10-line stats screen scales to that level because the pattern is identical: accumulate raw, derive computed, display formatted.

## Cross-Path Echo

Business intelligence dashboards follow the same pipeline. Raw events (page views, clicks, purchases) are accumulated in a data warehouse. Derived metrics (conversion rate, average order value, churn rate) are computed in batch. Display is a separate rendering layer. Your stats screen is a BI dashboard for a game session.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct GameStats {
    int shotsFired;
    int shotsHit;
    int kills;
    int damageDealt;
    int damageTaken;
    int framesPlayed;
    int maxCombo;
    int bossesKilled;
};

int score = 3500;

// TODO: Write initStats(GameStats &s) — zero all fields

// TODO: Write printStatsScreen(GameStats &s, int score)
//   Print header, each stat line with STATS| prefix, accuracy as XX.X%

int main() {
    GameStats stats;

    // TODO: Init stats, set values, print stats screen
    //   shotsFired=45, shotsHit=34, kills=12, damageDealt=1850
    //   damageTaken=60, framesPlayed=50, maxCombo=4, bossesKilled=1

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct GameStats {
    int shotsFired;
    int shotsHit;
    int kills;
    int damageDealt;
    int damageTaken;
    int framesPlayed;
    int maxCombo;
    int bossesKilled;
};

int score = 3500;

void initStats(GameStats &s) {
    s.shotsFired = 0;
    s.shotsHit = 0;
    s.kills = 0;
    s.damageDealt = 0;
    s.damageTaken = 0;
    s.framesPlayed = 0;
    s.maxCombo = 0;
    s.bossesKilled = 0;
}

void printStatsScreen(GameStats &s, int sc) {
    cout << "STATS|============ SESSION STATS ============" << endl;
    cout << "STATS|Shots Fired:     " << s.shotsFired << endl;
    cout << "STATS|Shots Hit:       " << s.shotsHit << endl;

    int accTenths = (s.shotsFired > 0) ? (s.shotsHit * 1000 / s.shotsFired) : 0;
    int accWhole = accTenths / 10;
    int accDec = accTenths % 10;
    cout << "STATS|Accuracy:        " << accWhole << "." << accDec << "%" << endl;

    cout << "STATS|Kills:           " << s.kills << endl;
    cout << "STATS|Damage Dealt:    " << s.damageDealt << endl;
    cout << "STATS|Damage Taken:    " << s.damageTaken << endl;
    cout << "STATS|Max Combo:       " << s.maxCombo << "x" << endl;
    cout << "STATS|Bosses Killed:   " << s.bossesKilled << endl;
    cout << "STATS|Frames Played:   " << s.framesPlayed << endl;
    cout << "STATS|Score:           " << sc << endl;
}

int main() {
    GameStats stats;
    initStats(stats);

    stats.shotsFired = 45;
    stats.shotsHit = 34;
    stats.kills = 12;
    stats.damageDealt = 1850;
    stats.damageTaken = 60;
    stats.framesPlayed = 50;
    stats.maxCombo = 4;
    stats.bossesKilled = 1;

    printStatsScreen(stats, score);

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Stats header printed", expectedOutput: "STATS\\|============ SESSION STATS ============", isPattern: true },
    { id: "g2", description: "Shots Fired shown", expectedOutput: "STATS\\|Shots Fired:.*45", isPattern: true },
    { id: "g3", description: "Shots Hit shown", expectedOutput: "STATS\\|Shots Hit:.*34", isPattern: true },
    { id: "g4", description: "Accuracy calculated correctly", expectedOutput: "STATS\\|Accuracy:.*75\\.5%", isPattern: true },
    { id: "g5", description: "Max Combo shown", expectedOutput: "STATS\\|Max Combo:.*4x", isPattern: true },
    { id: "g6", description: "Score shown", expectedOutput: "STATS\\|Score:.*3500", isPattern: true },
  ],
  hints: [
    "Zero all 8 struct fields in initStats, then assign the simulated values. Print each line with the STATS| prefix followed by the label and value.",
    "Accuracy: 34 * 1000 / 45 = 755. Whole part = 755 / 10 = 75. Decimal = 755 % 10 = 5. Print as 75.5%.",
    "Match the exact formatting: STATS|Label:           value. The spacing between label and value should be consistent for alignment.",
  ],
  accumulatedCode: `#include <iostream>
#include <cstdlib>
#include <cmath>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int FIXED_DT = 16;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;
const int MAX_LOG = 64;
const int MAX_FRAMES = 20;
const int NUM_ACHIEVEMENTS = 5;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;
int combo = 0;
int maxCombo = 0;
int shotsFired = 0;
int shotsHit = 0;
bool bossKilled = false;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK };

int aiPattern[POOL_SIZE];

struct Achievement {
    string id;
    string name;
    bool unlocked;
};

struct GameStats {
    int shotsFired;
    int shotsHit;
    int kills;
    int damageDealt;
    int damageTaken;
    int framesPlayed;
    int maxCombo;
    int bossesKilled;
};

Achievement achievements[NUM_ACHIEVEMENTS];
GameStats sessionStats;

struct InputEvent {
    int tick;
    int action;
};

struct FrameState {
    int playerX, playerY;
    int score;
    int enemyCount;
    int bulletCount;
};

InputEvent replayLog[MAX_LOG];
int replayLogSize = 0;
int bulletCount = 0;

int playerSpeed = 4;
int playerDamage = 10;

void initAchievements() {
    achievements[0] = {"first_blood", "First Blood", false};
    achievements[1] = {"combo_3", "Triple Threat", false};
    achievements[2] = {"boss_slayer", "Boss Slayer", false};
    achievements[3] = {"sharpshooter", "Sharpshooter", false};
    achievements[4] = {"survivor", "Survivor", false};
}

void checkKillAchievements(int frame) {
    if (!achievements[0].unlocked && kills >= 1) {
        achievements[0].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[0].id << "|"
             << achievements[0].name << "|frame|" << frame << endl;
    }
    if (!achievements[2].unlocked && bossKilled) {
        achievements[2].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[2].id << "|"
             << achievements[2].name << "|frame|" << frame << endl;
    }
}

void checkComboAchievements(int frame) {
    if (!achievements[1].unlocked && combo >= 3) {
        achievements[1].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[1].id << "|"
             << achievements[1].name << "|frame|" << frame << endl;
    }
}

void initStats(GameStats &s) {
    s.shotsFired = 0; s.shotsHit = 0; s.kills = 0;
    s.damageDealt = 0; s.damageTaken = 0; s.framesPlayed = 0;
    s.maxCombo = 0; s.bossesKilled = 0;
}

void printStatsScreen(GameStats &s, int sc) {
    cout << "STATS|============ SESSION STATS ============" << endl;
    cout << "STATS|Shots Fired:     " << s.shotsFired << endl;
    cout << "STATS|Shots Hit:       " << s.shotsHit << endl;
    int accTenths = (s.shotsFired > 0) ? (s.shotsHit * 1000 / s.shotsFired) : 0;
    cout << "STATS|Accuracy:        " << accTenths / 10 << "." << accTenths % 10 << "%" << endl;
    cout << "STATS|Kills:           " << s.kills << endl;
    cout << "STATS|Damage Dealt:    " << s.damageDealt << endl;
    cout << "STATS|Damage Taken:    " << s.damageTaken << endl;
    cout << "STATS|Max Combo:       " << s.maxCombo << "x" << endl;
    cout << "STATS|Bosses Killed:   " << s.bossesKilled << endl;
    cout << "STATS|Frames Played:   " << s.framesPlayed << endl;
    cout << "STATS|Score:           " << sc << endl;
}

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

string getActionName(int action) {
    if (action == MOVE_UP) return "MOVE_UP";
    if (action == MOVE_DOWN) return "MOVE_DOWN";
    if (action == MOVE_LEFT) return "MOVE_LEFT";
    if (action == MOVE_RIGHT) return "MOVE_RIGHT";
    if (action == FIRE) return "FIRE";
    return "NONE";
}

int spawnFromPool(int px, int py, int pvx, int pvy, int php, int ptype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px; y[idx] = py;
    vx[idx] = pvx; vy[idx] = pvy;
    hp[idx] = php; type[idx] = ptype;
    alive[idx] = true;
    aiPattern[idx] = AI_LINEAR;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] == 2) continue;
        x[i] += vx[i]; y[i] += vy[i];
    }
}

void collisionSystem(int count) {
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[b] - x[e]; int dy = y[b] - y[e];
            if (dx < 0) dx = -dx; if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                hp[b] = 0; hp[e] -= playerDamage;
                score += 100; kills++;
                sessionStats.kills++;
                sessionStats.damageDealt += playerDamage;
                sessionStats.shotsHit++;
                break;
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
    for (int i = 0; i < count; i++) { if (alive[i]) c++; }
    return c;
}

void processInput(char input, int playerIdx) {
    Action a = mapInput(input);
    if (a == MOVE_UP) y[playerIdx] -= playerSpeed;
    else if (a == MOVE_DOWN) y[playerIdx] += playerSpeed;
    else if (a == MOVE_LEFT) x[playerIdx] -= playerSpeed;
    else if (a == MOVE_RIGHT) x[playerIdx] += playerSpeed;
    else if (a == FIRE) {
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1);
        bulletCount++;
        sessionStats.shotsFired++;
    }
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    initAchievements();
    initStats(sessionStats);
    srand(42);

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);
    spawnFromPool(120, 60, 0, 4, 1, 2);
    spawnFromPool(200, 60, 0, 4, 1, 2);
    spawnFromPool(280, 60, 0, 4, 1, 2);

    // Simulate session stats
    sessionStats.shotsFired = 45;
    sessionStats.shotsHit = 34;
    sessionStats.kills = 12;
    sessionStats.damageDealt = 1850;
    sessionStats.damageTaken = 60;
    sessionStats.framesPlayed = 50;
    sessionStats.maxCombo = 4;
    sessionStats.bossesKilled = 1;
    score = 3500;

    printStatsScreen(sessionStats, score);

    return 0;
}
`,
};
