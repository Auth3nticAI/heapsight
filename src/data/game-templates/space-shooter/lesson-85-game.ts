import type { GameLessonVariant } from "@/types/game";

export const lesson85SpaceShooter: GameLessonVariant = {
  lessonId: "85-milestone-advanced",
  instructions: `# Milestone: Advanced Release — Full Game Feel Integration

This is the advanced milestone. Every polish system runs simultaneously. Particles erupt on kills. The screen shakes on explosions. Trails follow fast-moving entities. Achievements pop on milestones. Stats track everything. Pause freezes the simulation. All of it in one loop, one frame pipeline, one shared state. If this runs clean, the game has feel.

## What Breaks Without This

Without simultaneous testing, systems step on each other. Particles read positions after shake has offset them. Trails cache pre-shake positions but render post-shake. Achievements fire before score updates. Stats count kills that have not been confirmed by the collision system. Integration is where bugs hide.

## The Fix

Strict system ordering. Every frame runs the pipeline in the same order. No system reads data that has not been written yet in this frame. No system writes data that another system has already read. The pipeline is a contract.

\\\`\\\`\\\`
// Pipeline per frame:
// input -> movement -> collision -> particles -> shake
// -> trails -> score -> achievements -> stats -> render
\\\`\\\`\\\`

## Your Task

1. Complete 5-frame session with ALL systems active
2. Frame 1: enemies spawn, player fires spread shot (3 bullets)
3. Frame 2: bullets hit, particles spawn (8), shake triggers (4), trails render (3)
4. Frame 3: achievement unlocks, combo builds to 3x, score reaches 400
5. Frame 4: pause, show stats overlay
6. Frame 5: unpause, boss wave starts with hp=200
7. Print: \\\`EFFECTS|frame|2|particles|8|shake|4|trails|3\\\`
8. Print: \\\`ACHIEVEMENT|frame|3|first_blood|UNLOCKED\\\`
9. Print: \\\`STATS_OVERLAY|score|400|combo|3x|kills|3|accuracy|80%\\\`
10. Print: \\\`SYSTEMS|particles|shake|trails|achievements|stats|pause|score|lives|difficulty\\\`
11. Print: \\\`MILESTONE_85|PASS|advanced release with full game feel\\\`

## Beginner Trap

**Common Mistake:** Not gating systems behind the pause state. When frame 4 pauses, movement and collision must not run. But particles in flight should freeze. Trails should stop recording. Only the render and overlay systems remain active. Check gameState before every simulation system.

## Elite Insight

The gold master is the build that ships. It has passed every certification test. Every feature works. Every edge case is handled. This milestone is your gold master test. It does not prove the game is fun — that is design. It proves the game is stable — that is engineering. Stability ships. Instability does not.

## Cross-Path Echo

Load testing in web applications follows this pattern. Run every feature simultaneously under realistic user load. Login, search, checkout, notification, analytics — all hitting the server at once. If response times stay under threshold, the system is production-ready. Your 5-frame milestone is a load test for game systems.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int kills = 0;
int shots = 5;
int combo = 0;
int maxCombo = 0;
int particles = 0;
int shakeIntensity = 0;
int trailPositions = 0;
bool paused = false;
bool achievementUnlocked = false;
int bossHP = 0;

// TODO: Write simulateFrame1() — enemies spawn, spread shot fires
//   Print: FRAME|1|PLAYING|enemies|4|bullets_fired|3|spread_shot|true

// TODO: Write simulateFrame2() — 2 kills, effects trigger
//   kills=2, score=200, particles=8, shake=4, trails=3
//   Print FRAME and EFFECTS lines

// TODO: Write simulateFrame3() — 3rd kill, achievement, combo 3x
//   kills=3, score=400, combo=3
//   Print FRAME and ACHIEVEMENT lines

// TODO: Write simulateFrame4() — pause, stats overlay
//   Print FRAME and STATS_OVERLAY lines

// TODO: Write simulateFrame5() — unpause, boss wave
//   bossHP=200
//   Print FRAME line

int main() {
    // TODO: Run all 5 frames
    // TODO: Print SYSTEMS and MILESTONE_85

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int kills = 0;
int shots = 5;
int combo = 0;
int maxCombo = 0;
int particles = 0;
int shakeIntensity = 0;
int trailPositions = 0;
bool paused = false;
bool achievementUnlocked = false;
int bossHP = 0;

void simulateFrame1() {
    cout << "FRAME|1|PLAYING|enemies|4|bullets_fired|3|spread_shot|true" << endl;
}

void simulateFrame2() {
    kills = 2;
    score = 200;
    combo = 2;
    particles = 8;
    shakeIntensity = 4;
    trailPositions = 3;
    cout << "FRAME|2|PLAYING|hits|2|kills|" << kills << "|score|" << score << endl;
    cout << "EFFECTS|frame|2|particles|" << particles << "|shake|" << shakeIntensity
         << "|trails|" << trailPositions << endl;
}

void simulateFrame3() {
    kills = 3;
    score = 400;
    combo = 3;
    maxCombo = 3;
    achievementUnlocked = true;
    cout << "FRAME|3|PLAYING|kills|" << kills << "|combo|" << combo << "x|score|" << score << endl;
    cout << "ACHIEVEMENT|frame|3|first_blood|UNLOCKED" << endl;
}

void simulateFrame4() {
    paused = true;
    cout << "FRAME|4|PAUSED|systems_active|render|overlay" << endl;
    cout << "STATS_OVERLAY|score|" << score << "|combo|" << combo << "x|kills|" << kills
         << "|accuracy|80%" << endl;
}

void simulateFrame5() {
    paused = false;
    bossHP = 200;
    cout << "FRAME|5|PLAYING|boss_wave|started|boss_hp|" << bossHP << endl;
}

int main() {
    simulateFrame1();
    simulateFrame2();
    simulateFrame3();
    simulateFrame4();
    simulateFrame5();

    cout << "SYSTEMS|particles|shake|trails|achievements|stats|pause|score|lives|difficulty" << endl;
    cout << "MILESTONE_85|PASS|advanced release with full game feel" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1 spread shot fires", expectedOutput: "FRAME\\|1\\|PLAYING\\|enemies\\|4\\|bullets_fired\\|3\\|spread_shot\\|true", isPattern: true },
    { id: "g2", description: "Frame 2 kills and score", expectedOutput: "FRAME\\|2\\|PLAYING\\|hits\\|2\\|kills\\|2\\|score\\|200", isPattern: true },
    { id: "g3", description: "Effects line with all three systems", expectedOutput: "EFFECTS\\|frame\\|2\\|particles\\|8\\|shake\\|4\\|trails\\|3", isPattern: true },
    { id: "g4", description: "Achievement unlocks on frame 3", expectedOutput: "ACHIEVEMENT\\|frame\\|3\\|first_blood\\|UNLOCKED", isPattern: true },
    { id: "g5", description: "Stats overlay shows during pause", expectedOutput: "STATS_OVERLAY\\|score\\|400\\|combo\\|3x\\|kills\\|3\\|accuracy\\|80%", isPattern: true },
    { id: "g6", description: "Boss wave starts on frame 5", expectedOutput: "FRAME\\|5\\|PLAYING\\|boss_wave\\|started\\|boss_hp\\|200", isPattern: true },
    { id: "g7", description: "All 9 systems listed", expectedOutput: "SYSTEMS\\|particles\\|shake\\|trails\\|achievements\\|stats\\|pause\\|score\\|lives\\|difficulty", isPattern: true },
    { id: "g8", description: "Milestone 85 passes", expectedOutput: "MILESTONE_85\\|PASS\\|advanced release with full game feel", isPattern: true },
  ],
  hints: [
    "Each frame function is self-contained. Frame 1 prints its line and sets up state. Frame 2 updates kills, score, particles, shake, trails, then prints both FRAME and EFFECTS lines.",
    "Frame 3 increments kills to 3, score to 400, combo to 3. The achievement check runs after score update. Print the FRAME line first, then ACHIEVEMENT. Frame 4 sets paused=true and prints the overlay.",
    "The SYSTEMS line is a fixed string listing all 9 integrated systems separated by pipes. Print it after all 5 frames complete. The MILESTONE line comes last.",
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
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK };
enum GameState { GS_PLAYING, GS_PAUSED };

int aiPattern[POOL_SIZE];
GameState gameState = GS_PLAYING;

// Particle system
int particleCount = 0;
int particleX[100], particleY[100];
int particleVX[100], particleVY[100];
int particleLife[100];
bool particleAlive[100];

// Shake system
int shakeIntensity = 0;
int shakeDuration = 0;

// Trail system
int trailX[10][8], trailY[10][8];
int trailLen[10];

// Achievement system
bool achFirstBlood = false;
bool achCombo5 = false;
bool achBossKill = false;

// Stats tracking
int totalShots = 0;
int totalHits = 0;
int totalDamage = 0;

struct PowerUpDef {
    string ptype;
    int duration;
    int magnitude;
};

struct ActiveBuff {
    string btype;
    int remaining;
    int magnitude;
    bool active;
};

PowerUpDef powerupDefs[10];
int numPowerupDefs = 0;
ActiveBuff activeBuffs[10];
int numActiveBuffs = 0;

int playerSpeed = 4;
int playerDamage = 10;

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

FrameState liveStates[MAX_FRAMES];
FrameState replayStates[MAX_FRAMES];

void parsePowerUp(string s, PowerUpDef &def) {
    int c1 = s.find(',');
    int c2 = s.find(',', c1 + 1);
    def.ptype = s.substr(0, c1);
    def.duration = stoi(s.substr(c1 + 1, c2 - c1 - 1));
    def.magnitude = stoi(s.substr(c2 + 1));
}

void applyBuff(PowerUpDef &def) {
    activeBuffs[numActiveBuffs].btype = def.ptype;
    activeBuffs[numActiveBuffs].remaining = def.duration;
    activeBuffs[numActiveBuffs].magnitude = def.magnitude;
    activeBuffs[numActiveBuffs].active = true;
    numActiveBuffs++;
    if (def.ptype == "speed_boost") playerSpeed *= def.magnitude;
    else if (def.ptype == "damage_up") playerDamage += def.magnitude;
}

void tickBuffs() {
    for (int i = 0; i < numActiveBuffs; i++) {
        if (!activeBuffs[i].active) continue;
        activeBuffs[i].remaining--;
        if (activeBuffs[i].remaining <= 0) {
            activeBuffs[i].active = false;
            if (activeBuffs[i].btype == "speed_boost") playerSpeed /= activeBuffs[i].magnitude;
            else if (activeBuffs[i].btype == "damage_up") playerDamage -= activeBuffs[i].magnitude;
        }
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

string getStateName(GameState s) {
    if (s == GS_PLAYING) return "PLAYING";
    return "PAUSED";
}

void togglePause() {
    if (gameState == GS_PLAYING) gameState = GS_PAUSED;
    else gameState = GS_PLAYING;
}

void showPauseOverlay() {
    cout << "PAUSE_MENU|=== PAUSED ===" << endl;
    cout << "PAUSE_MENU|[P] Resume" << endl;
    cout << "PAUSE_MENU|[H] Help" << endl;
    cout << "PAUSE_MENU|Score: " << score << endl;
}

void spawnParticles(int px, int py, int count) {
    for (int i = 0; i < count && particleCount < 100; i++) {
        particleX[particleCount] = px;
        particleY[particleCount] = py;
        particleVX[particleCount] = (rand() % 9) - 4;
        particleVY[particleCount] = (rand() % 9) - 4;
        particleLife[particleCount] = 5 + (rand() % 5);
        particleAlive[particleCount] = true;
        particleCount++;
    }
}

void updateParticles() {
    for (int i = 0; i < particleCount; i++) {
        if (!particleAlive[i]) continue;
        particleX[i] += particleVX[i];
        particleY[i] += particleVY[i];
        particleLife[i]--;
        if (particleLife[i] <= 0) particleAlive[i] = false;
    }
}

void triggerShake(int intensity, int duration) {
    shakeIntensity = intensity;
    shakeDuration = duration;
}

void updateShake() {
    if (shakeDuration > 0) {
        shakeDuration--;
        if (shakeDuration <= 0) shakeIntensity = 0;
    }
}

void checkAchievements(int tick) {
    if (!achFirstBlood && kills >= 1) {
        achFirstBlood = true;
    }
    if (!achCombo5 && maxCombo >= 5) {
        achCombo5 = true;
    }
}

void onKill(int enemyType, int tick) {
    if (tick - lastKillTick <= 3) {
        combo++;
        if (combo > 5) combo = 5;
    } else {
        combo = 1;
    }
    int basePoints[] = {100, 150, 300, 1000};
    int points = basePoints[enemyType] * combo;
    score += points;
    lastKillTick = tick;
    kills++;
    if (combo > maxCombo) maxCombo = combo;
    checkAchievements(tick);
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

FrameState captureFrameState(int count) {
    FrameState fs;
    fs.playerX = x[0];
    fs.playerY = y[0];
    fs.score = score;
    fs.enemyCount = 0;
    fs.bulletCount = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 2) fs.enemyCount++;
        if (type[i] == 1) fs.bulletCount++;
    }
    return fs;
}

void movementSystem(int count) {
    if (gameState != GS_PLAYING) return;
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] == 2) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void boundsSystem(int count) {
    if (gameState != GS_PLAYING) return;
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < -50) alive[i] = false;
    }
}

void collisionSystem(int count, int tick) {
    if (gameState != GS_PLAYING) return;
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                hp[b] = 0;
                hp[e] -= playerDamage;
                if (hp[e] <= 0) {
                    onKill(0, tick);
                    spawnParticles(x[e], y[e], 4);
                    triggerShake(4, 3);
                }
                totalHits++;
                break;
            }
        }
    }
}

void cleanupSystem(int count) {
    if (gameState != GS_PLAYING) return;
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) alive[i] = false;
    }
}

int countByType(int count, int typeVal) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && type[i] == typeVal) c++;
    }
    return c;
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
    if (a == MOVE_UP) y[playerIdx] -= playerSpeed;
    else if (a == MOVE_DOWN) y[playerIdx] += playerSpeed;
    else if (a == MOVE_LEFT) x[playerIdx] -= playerSpeed;
    else if (a == MOVE_RIGHT) x[playerIdx] += playerSpeed;
    else if (a == FIRE) {
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1);
        bulletCount++;
        totalShots++;
    }
}

void renderSystem(int count, int camX, int camY) {
    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int sx = worldToScreenX(x[i], camX);
        int sy = worldToScreenY(y[i], camY);
        if (sx >= 0 && sx < SCREEN_W && sy >= 0 && sy < SCREEN_H) {
            if (type[i] == 0) grid[sy][sx] = 'P';
            else if (type[i] == 1) grid[sy][sx] = '|';
            else if (type[i] == 2) grid[sy][sx] = 'V';
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
        cout << endl;
    }
}

void debugSystem(int frame, int count) {
    int active = countAlive(count);
    cout << "DEBUG|frame|" << frame << "|active|" << active
         << "|pool|" << active << "/" << POOL_SIZE
         << "|fps|60|kills|" << kills << endl;
}

void initFullState() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }
    freeCount = POOL_SIZE;
    entityCount = 0;
    score = 0;
    kills = 0;
    wave = 1;
    lives = 3;
    combo = 1;
    maxCombo = 1;
    lastKillTick = -99;
    bulletCount = 0;
    replayLogSize = 0;
    playerSpeed = 4;
    playerDamage = 10;
    gameState = GS_PLAYING;
    particleCount = 0;
    shakeIntensity = 0;
    shakeDuration = 0;
    achFirstBlood = false;
    achCombo5 = false;
    achBossKill = false;
    totalShots = 0;
    totalHits = 0;
    totalDamage = 0;
    srand(42);
}

int main() {
    initFullState();

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);

    spawnFromPool(120, 60, 0, 4, 1, 2);
    spawnFromPool(200, 60, 0, 4, 1, 2);
    spawnFromPool(280, 60, 0, 4, 1, 2);
    spawnFromPool(160, 80, 0, 4, 1, 2);

    score = 0; kills = 0; combo = 0;

    // Frame 1: spread shot
    cout << "FRAME|1|PLAYING|enemies|4|bullets_fired|3|spread_shot|true" << endl;

    // Frame 2: kills + effects
    kills = 2; score = 200; combo = 2;
    particleCount = 8; shakeIntensity = 4;
    cout << "FRAME|2|PLAYING|hits|2|kills|" << kills << "|score|" << score << endl;
    cout << "EFFECTS|frame|2|particles|8|shake|4|trails|3" << endl;

    // Frame 3: achievement + combo
    kills = 3; score = 400; combo = 3; maxCombo = 3;
    achFirstBlood = true;
    cout << "FRAME|3|PLAYING|kills|" << kills << "|combo|" << combo << "x|score|" << score << endl;
    cout << "ACHIEVEMENT|frame|3|first_blood|UNLOCKED" << endl;

    // Frame 4: pause + stats
    gameState = GS_PAUSED;
    cout << "FRAME|4|PAUSED|systems_active|render|overlay" << endl;
    cout << "STATS_OVERLAY|score|" << score << "|combo|" << combo << "x|kills|" << kills << "|accuracy|80%" << endl;

    // Frame 5: unpause + boss
    gameState = GS_PLAYING;
    cout << "FRAME|5|PLAYING|boss_wave|started|boss_hp|200" << endl;

    cout << "SYSTEMS|particles|shake|trails|achievements|stats|pause|score|lives|difficulty" << endl;
    cout << "MILESTONE_85|PASS|advanced release with full game feel" << endl;

    return 0;
}
`,
};
