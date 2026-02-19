import type { GameLessonVariant } from "@/types/game";

export const lesson76SpaceShooter: GameLessonVariant = {
  lessonId: "76-achievement-hooks",
  instructions: `# Game Builder: Achievement Hooks — Event-Driven Unlock System

Achievements transform raw gameplay data into player goals. But checking every condition every frame is wasteful. Hook achievement checks to the events that can trigger them. Kill events check kill achievements. Combo events check combo achievements. The system scales to hundreds of achievements because each check only runs when its trigger fires.

## What Breaks Without This

Without event-driven hooks, achievement checking becomes a linear scan every frame. Five achievements is invisible. Fifty is noticeable. Five hundred is a frame spike. Worse, polling achievements misses the exact moment of unlock, making notifications feel laggy. Event hooks give you instant, zero-waste notifications.

## The Fix

Each achievement has a trigger type. After each game event, iterate only achievements matching that trigger. Check the condition. If met and not already unlocked, unlock it. Print the notification. Skip already-unlocked achievements immediately.

\\\`\\\`\\\`
// After kill event: check kill-triggered achievements
// After combo event: check combo-triggered achievements
// After wave clear: check survival-triggered achievements
\\\`\\\`\\\`

## Your Task

1. Define 5 achievements: first_blood, combo_3, boss_slayer, sharpshooter, survivor
2. Simulate a game session with these events:
   - Frame 3: first kill (kills=1)
   - Frame 7: combo reaches 3
   - Frame 12: boss killed, check accuracy (15/20 = 75%)
3. After each event, run only relevant achievement checks
4. Print: \\\`ACHIEVEMENT|UNLOCKED|first_blood|First Blood|frame|3\\\`
5. Print: \\\`ACHIEVEMENT|UNLOCKED|combo_3|Triple Threat|frame|7\\\`
6. Print: \\\`ACHIEVEMENT|UNLOCKED|boss_slayer|Boss Slayer|frame|12\\\`
7. Print: \\\`ACHIEVEMENT|CHECK|sharpshooter|progress|75%|needed|80%\\\`
8. Print: \\\`ACHIEVEMENT_SUMMARY|unlocked|3|total|5|completion|60%\\\`

## Beginner Trap

**Common Mistake:** Forgetting the unlocked guard. Without \\\`if (!unlocked)\\\`, a kill at frame 3 and another at frame 5 both print "First Blood." The guard ensures one notification per achievement, ever.

## Elite Insight

Steam, PlayStation, and Xbox achievement APIs all use this pattern internally. The SDK provides registerAchievement and unlockAchievement calls. Your local check determines when to call unlock. The platform handles persistence, notification display, and cloud sync. Your struct-based system is the local half of that pipeline.

## Cross-Path Echo

Feature flags in web applications are achievements in reverse. A feature flag checks a condition — user in beta group, A/B test variant, subscription tier — and enables functionality. Your achievement check is a feature flag that enables a notification and a badge. Same pattern, different domain.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Achievement {
    string id;
    string name;
    bool unlocked;
};

const int NUM_ACHIEVEMENTS = 5;
Achievement achievements[NUM_ACHIEVEMENTS];

int kills = 0;
int combo = 0;
int shotsFired = 0;
int shotsHit = 0;
bool bossKilled = false;
bool waveClearedNoHits = false;

// TODO: Write initAchievements()

// TODO: Write checkKillAchievements(frame) — first_blood and boss_slayer

// TODO: Write checkComboAchievements(frame) — combo_3

// TODO: Write checkAccuracyAchievements(frame) — sharpshooter

// TODO: Write checkSurvivorAchievements(frame) — survivor

// TODO: Write printSummary() — count unlocked, print summary

int main() {
    // TODO: Init achievements
    // TODO: Frame 3: kills=1, shotsFired=4, shotsHit=3, check kill achievements
    // TODO: Frame 7: combo=3, check combo achievements
    // TODO: Frame 12: bossKilled=true, kills=8, shotsFired=20, shotsHit=15
    //       Check kill achievements, then accuracy achievements
    // TODO: Print summary

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Achievement {
    string id;
    string name;
    bool unlocked;
};

const int NUM_ACHIEVEMENTS = 5;
Achievement achievements[NUM_ACHIEVEMENTS];

int kills = 0;
int combo = 0;
int shotsFired = 0;
int shotsHit = 0;
bool bossKilled = false;
bool waveClearedNoHits = false;

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

void checkAccuracyAchievements(int frame) {
    if (achievements[3].unlocked) return;
    int accuracy = (shotsFired > 0) ? (shotsHit * 100 / shotsFired) : 0;
    if (accuracy >= 80) {
        achievements[3].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[3].id << "|"
             << achievements[3].name << "|frame|" << frame << endl;
    } else {
        cout << "ACHIEVEMENT|CHECK|sharpshooter|progress|" << accuracy
             << "%|needed|80%" << endl;
    }
}

void checkSurvivorAchievements(int frame) {
    if (!achievements[4].unlocked && waveClearedNoHits) {
        achievements[4].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[4].id << "|"
             << achievements[4].name << "|frame|" << frame << endl;
    }
}

void printSummary() {
    int unlocked = 0;
    for (int i = 0; i < NUM_ACHIEVEMENTS; i++) {
        if (achievements[i].unlocked) unlocked++;
    }
    int pct = unlocked * 100 / NUM_ACHIEVEMENTS;
    cout << "ACHIEVEMENT_SUMMARY|unlocked|" << unlocked << "|total|"
         << NUM_ACHIEVEMENTS << "|completion|" << pct << "%" << endl;
}

int main() {
    initAchievements();

    // Frame 3: first kill
    kills = 1;
    shotsFired = 4;
    shotsHit = 3;
    checkKillAchievements(3);

    // Frame 7: combo reaches 3
    combo = 3;
    checkComboAchievements(7);

    // Frame 12: boss killed
    bossKilled = true;
    kills = 8;
    shotsFired = 20;
    shotsHit = 15;
    checkKillAchievements(12);
    checkAccuracyAchievements(12);

    printSummary();

    return 0;
}
`,
  tests: [
    { id: "g1", description: "First blood unlocks at frame 3", expectedOutput: "ACHIEVEMENT\\|UNLOCKED\\|first_blood\\|First Blood\\|frame\\|3", isPattern: true },
    { id: "g2", description: "Triple Threat unlocks at frame 7", expectedOutput: "ACHIEVEMENT\\|UNLOCKED\\|combo_3\\|Triple Threat\\|frame\\|7", isPattern: true },
    { id: "g3", description: "Boss Slayer unlocks at frame 12", expectedOutput: "ACHIEVEMENT\\|UNLOCKED\\|boss_slayer\\|Boss Slayer\\|frame\\|12", isPattern: true },
    { id: "g4", description: "Sharpshooter progress check", expectedOutput: "ACHIEVEMENT\\|CHECK\\|sharpshooter\\|progress\\|75%\\|needed\\|80%", isPattern: true },
    { id: "g5", description: "Achievement summary", expectedOutput: "ACHIEVEMENT_SUMMARY\\|unlocked\\|3\\|total\\|5\\|completion\\|60%", isPattern: true },
  ],
  hints: [
    "Set up achievements as an array of 5 structs. Index 0 = first_blood, 1 = combo_3, 2 = boss_slayer, 3 = sharpshooter, 4 = survivor. All start with unlocked = false.",
    "Accuracy = shotsHit * 100 / shotsFired = 15 * 100 / 20 = 75. Since 75 < 80, sharpshooter stays locked. Print the CHECK line showing current progress vs needed threshold.",
    "Summary counts unlocked achievements (3) out of total (5). Completion = 3 * 100 / 5 = 60%. Only first_blood, combo_3, and boss_slayer unlock in this simulation.",
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

Achievement achievements[NUM_ACHIEVEMENTS];

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

void checkAccuracyAchievements(int frame) {
    if (achievements[3].unlocked) return;
    int accuracy = (shotsFired > 0) ? (shotsHit * 100 / shotsFired) : 0;
    if (accuracy >= 80) {
        achievements[3].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[3].id << "|"
             << achievements[3].name << "|frame|" << frame << endl;
    } else {
        cout << "ACHIEVEMENT|CHECK|sharpshooter|progress|" << accuracy
             << "%|needed|80%" << endl;
    }
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

void recordInput(int tick, int action) {
    replayLog[replayLogSize].tick = tick;
    replayLog[replayLogSize].action = action;
    replayLogSize++;
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
                shotsHit++;
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
        shotsFired++;
    }
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    initAchievements();
    srand(42);

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);
    spawnFromPool(120, 60, 0, 4, 1, 2);
    spawnFromPool(200, 60, 0, 4, 1, 2);
    spawnFromPool(280, 60, 0, 4, 1, 2);

    // Simulate: first kill at frame 3
    kills = 1; shotsFired = 4; shotsHit = 3;
    checkKillAchievements(3);

    // Combo reaches 3 at frame 7
    combo = 3;
    checkComboAchievements(7);

    // Boss killed at frame 12
    bossKilled = true; kills = 8;
    shotsFired = 20; shotsHit = 15;
    checkKillAchievements(12);
    checkAccuracyAchievements(12);

    // Summary
    int unlocked = 0;
    for (int i = 0; i < NUM_ACHIEVEMENTS; i++) {
        if (achievements[i].unlocked) unlocked++;
    }
    int pct = unlocked * 100 / NUM_ACHIEVEMENTS;
    cout << "ACHIEVEMENT_SUMMARY|unlocked|" << unlocked << "|total|"
         << NUM_ACHIEVEMENTS << "|completion|" << pct << "%" << endl;

    return 0;
}
`,
};
