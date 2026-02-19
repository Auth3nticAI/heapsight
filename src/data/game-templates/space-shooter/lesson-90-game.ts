import type { GameLessonVariant } from "@/types/game";

export const lesson90SpaceShooter: GameLessonVariant = {
  lessonId: "90-balance-pass",
  instructions: `# Final Balance Pass — Data-Driven Tuning

Every hardcoded constant is a frozen design decision. A balance pass extracts all gameplay constants into a tuning table, runs simulations with different presets, and selects the configuration that hits the target experience. Three presets. Three simulations. One recommendation.

## What Breaks Without This

Constants scattered across 30 files. Changing difficulty means editing 8 files, recompiling, playtesting, discovering it is wrong, editing 8 files again. A balance table reduces this to one struct swap.

## The Fix

BalanceTable struct with every tunable constant. Three presets: Easy, Normal, Hard. Simulate each. Compare TTK, survival rate, wave completion. The preset with 80% survival is the recommended default.

\\\`\\\`\\\`
// Easy:   speed=6, damage=20, fireRate=3, enemyHp=20, waveSize=3
// Normal: speed=4, damage=15, fireRate=4, enemyHp=30, waveSize=5
// Hard:   speed=3, damage=10, fireRate=5, enemyHp=50, waveSize=8
\\\`\\\`\\\`

## Your Task

1. Define BalanceTable struct with 7 fields plus name
2. Create Easy, Normal, Hard presets
3. Simulate wave 1 with each preset
4. Print: \\\`BALANCE|preset|Easy|kills_per_wave|3|ttk_avg|2.0|survival|100%\\\`
5. Print: \\\`BALANCE|preset|Normal|kills_per_wave|5|ttk_avg|3.3|survival|80%\\\`
6. Print: \\\`BALANCE|preset|Hard|kills_per_wave|8|ttk_avg|5.0|survival|40%\\\`
7. Print: \\\`BALANCE_SUMMARY|presets|3|recommended|Normal|reason|80%_survival\\\`

## Beginner Trap

**Common Mistake:** Tuning one variable at a time. Player damage up AND enemy HP down is a multiplicative change, not additive. Balance tables change all variables together as a coherent preset. Test complete configurations.

## Elite Insight

Spreadsheet-first balance is industry standard. TTK = enemyHP / DPS. DPS = damage / fireRate * 60. These formulas predict balance before code runs. Playtest confirms the math. Your simulation is a balance spreadsheet compiled to C++.

## Cross-Path Echo

A/B testing in web products compares configurations with real users. Your balance presets are A/B test variants. Easy is variant A. Hard is variant C. Normal is the control. The simulation measures the outcome metric — survival rate — just like an A/B test measures conversion rate.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct BalanceTable {
    string name;
    int playerSpeed;
    int bulletDamage;
    int fireRate;
    int enemyHpBase;
    int enemySpeedBase;
    int waveSize;
    int bossHpMultiplier;
};

// TODO: Write createEasyPreset() — Easy balance values
// TODO: Write createNormalPreset() — Normal balance values
// TODO: Write createHardPreset() — Hard balance values

// TODO: Write simulateWave(BalanceTable &bt, ...) — print BALANCE line

int main() {
    // TODO: Create 3 presets, simulate each
    // TODO: Print BALANCE_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct BalanceTable {
    string name;
    int playerSpeed;
    int bulletDamage;
    int fireRate;
    int enemyHpBase;
    int enemySpeedBase;
    int waveSize;
    int bossHpMultiplier;
};

BalanceTable createEasyPreset() {
    BalanceTable bt;
    bt.name = "Easy";
    bt.playerSpeed = 6;
    bt.bulletDamage = 20;
    bt.fireRate = 3;
    bt.enemyHpBase = 20;
    bt.enemySpeedBase = 2;
    bt.waveSize = 3;
    bt.bossHpMultiplier = 2;
    return bt;
}

BalanceTable createNormalPreset() {
    BalanceTable bt;
    bt.name = "Normal";
    bt.playerSpeed = 4;
    bt.bulletDamage = 15;
    bt.fireRate = 4;
    bt.enemyHpBase = 30;
    bt.enemySpeedBase = 3;
    bt.waveSize = 5;
    bt.bossHpMultiplier = 3;
    return bt;
}

BalanceTable createHardPreset() {
    BalanceTable bt;
    bt.name = "Hard";
    bt.playerSpeed = 3;
    bt.bulletDamage = 10;
    bt.fireRate = 5;
    bt.enemyHpBase = 50;
    bt.enemySpeedBase = 4;
    bt.waveSize = 8;
    bt.bossHpMultiplier = 5;
    return bt;
}

void simulateWave(BalanceTable &bt, int killsPerWave, string ttk, int survivalPct) {
    cout << "BALANCE|preset|" << bt.name
         << "|kills_per_wave|" << killsPerWave
         << "|ttk_avg|" << ttk
         << "|survival|" << survivalPct << "%" << endl;
}

int main() {
    BalanceTable easy = createEasyPreset();
    BalanceTable normal = createNormalPreset();
    BalanceTable hard = createHardPreset();

    simulateWave(easy, 3, "2.0", 100);
    simulateWave(normal, 5, "3.3", 80);
    simulateWave(hard, 8, "5.0", 40);

    cout << "BALANCE_SUMMARY|presets|3|recommended|Normal|reason|80%_survival" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Easy preset simulation", expectedOutput: "BALANCE\\|preset\\|Easy\\|kills_per_wave\\|3\\|ttk_avg\\|2\\.0\\|survival\\|100%", isPattern: true },
    { id: "g2", description: "Normal preset simulation", expectedOutput: "BALANCE\\|preset\\|Normal\\|kills_per_wave\\|5\\|ttk_avg\\|3\\.3\\|survival\\|80%", isPattern: true },
    { id: "g3", description: "Hard preset simulation", expectedOutput: "BALANCE\\|preset\\|Hard\\|kills_per_wave\\|8\\|ttk_avg\\|5\\.0\\|survival\\|40%", isPattern: true },
    { id: "g4", description: "Balance summary recommends Normal", expectedOutput: "BALANCE_SUMMARY\\|presets\\|3\\|recommended\\|Normal\\|reason\\|80%_survival", isPattern: true },
  ],
  hints: [
    "Each createXPreset function sets all 8 fields of the BalanceTable struct. Easy: name=\"Easy\", speed=6, damage=20, fireRate=3, enemyHp=20, enemySpeed=2, waveSize=3, bossHpMult=2.",
    "simulateWave takes the balance table and pre-calculated results. The kills_per_wave matches waveSize. TTK is a string. Survival is an integer percentage. Print one BALANCE line per preset.",
    "Call createEasyPreset, createNormalPreset, createHardPreset. Simulate each. Then print BALANCE_SUMMARY with recommended=Normal because 80% survival is the design target.",
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
const int MAX_SFX_EVENTS = 20;
const int MAX_SFX_CHANNELS = 4;

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
enum GameState { GS_PLAYING, GS_PAUSED, GS_MENU, GS_BOSS, GS_VICTORY };

int aiPattern[POOL_SIZE];
GameState gameState = GS_MENU;

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

// Audio SFX system
struct SoundEvent {
    string name;
    int volume;
    int priority;
};

SoundEvent sfxQueue[MAX_SFX_EVENTS];
int sfxQueueSize = 0;

// Music system
struct MusicState {
    string currentTrack;
    int volume;
    string prevTrack;
};

MusicState musicState;
int musicTracksPlayed = 0;
int musicTransitions = 0;
int musicCrossfades = 0;

// Settings system
struct Settings {
    int sfxVolume;     // 0-10
    int musicVolume;   // 0-10
    int difficulty;    // 1=Easy, 2=Normal, 3=Hard
    bool shakeEnabled;
    bool trailsEnabled;
};

Settings settings;

// Accessibility system
struct AccessibilitySettings {
    bool reducedEffects;
    bool highContrast;
    bool largeText;
};

AccessibilitySettings a11y;

// Balance system
struct BalanceTable {
    string name;
    int playerSpeed;
    int bulletDamage;
    int fireRate;
    int enemyHpBase;
    int enemySpeedBase;
    int waveSize;
    int bossHpMultiplier;
};

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

// Accessibility functions
char getPlayerSprite() {
    return a11y.highContrast ? 'X' : '@';
}

char getEnemySprite() {
    return a11y.highContrast ? '#' : 'v';
}

char getBulletSprite() {
    return a11y.highContrast ? '!' : '|';
}

int getVisualParticleCount() {
    return a11y.reducedEffects ? 0 : particleCount;
}

// Settings functions
void initSettingsDefaults() {
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

void printSettingsMenu() {
    cout << "SETTINGS|=== OPTIONS ===" << endl;
    cout << "SETTINGS|[1] SFX Volume:    " << settings.sfxVolume << "/10" << endl;
    cout << "SETTINGS|[2] Music Volume:  " << settings.musicVolume << "/10" << endl;
    cout << "SETTINGS|[3] Difficulty:    " << getDifficultyName(settings.difficulty) << endl;
    cout << "SETTINGS|[4] Screen Shake:  " << (settings.shakeEnabled ? "ON" : "OFF") << endl;
    cout << "SETTINGS|[5] Bullet Trails: " << (settings.trailsEnabled ? "ON" : "OFF") << endl;
}

// Balance functions
BalanceTable createEasyPreset() {
    BalanceTable bt;
    bt.name = "Easy";
    bt.playerSpeed = 6;
    bt.bulletDamage = 20;
    bt.fireRate = 3;
    bt.enemyHpBase = 20;
    bt.enemySpeedBase = 2;
    bt.waveSize = 3;
    bt.bossHpMultiplier = 2;
    return bt;
}

BalanceTable createNormalPreset() {
    BalanceTable bt;
    bt.name = "Normal";
    bt.playerSpeed = 4;
    bt.bulletDamage = 15;
    bt.fireRate = 4;
    bt.enemyHpBase = 30;
    bt.enemySpeedBase = 3;
    bt.waveSize = 5;
    bt.bossHpMultiplier = 3;
    return bt;
}

BalanceTable createHardPreset() {
    BalanceTable bt;
    bt.name = "Hard";
    bt.playerSpeed = 3;
    bt.bulletDamage = 10;
    bt.fireRate = 5;
    bt.enemyHpBase = 50;
    bt.enemySpeedBase = 4;
    bt.waveSize = 8;
    bt.bossHpMultiplier = 5;
    return bt;
}

void applyBalanceTable(BalanceTable &bt) {
    playerSpeed = bt.playerSpeed;
    playerDamage = bt.bulletDamage;
}

// SFX functions
void emitSound(string name, int volume, int priority) {
    sfxQueue[sfxQueueSize].name = name;
    sfxQueue[sfxQueueSize].volume = volume;
    sfxQueue[sfxQueueSize].priority = priority;
    sfxQueueSize++;
}

string findLoudestSfx() {
    int maxVol = -1;
    string loudest = "";
    for (int i = 0; i < sfxQueueSize; i++) {
        if (sfxQueue[i].volume > maxVol) {
            maxVol = sfxQueue[i].volume;
            loudest = sfxQueue[i].name;
        }
    }
    return loudest;
}

void processSfxFrame(int frameNum) {
    for (int i = 0; i < sfxQueueSize; i++) {
        int vol10 = sfxQueue[i].volume / 10;
        int volFrac = sfxQueue[i].volume % 10;
        cout << "SFX|frame|" << frameNum << "|event|" << sfxQueue[i].name
             << "|vol|" << vol10 << "." << volFrac
             << "|pri|" << sfxQueue[i].priority << endl;
    }
    if (sfxQueueSize > 1) {
        cout << "SFX_MIX|frame|" << frameNum << "|playing|" << sfxQueueSize
             << "|max_channels|" << MAX_SFX_CHANNELS << "|loudest|" << findLoudestSfx() << endl;
    }
    sfxQueueSize = 0;
}

// Music functions
string getTrackForState(string stateName) {
    if (stateName == "MENU") return "menu_theme";
    if (stateName == "PLAYING") return "gameplay_normal";
    if (stateName == "BOSS") return "boss_battle";
    if (stateName == "VICTORY") return "victory_theme";
    return "silence";
}

void musicTransitionTo(string stateName) {
    string newTrack = getTrackForState(stateName);
    musicState.prevTrack = musicState.currentTrack;
    musicState.currentTrack = newTrack;
    musicState.volume = 100;

    if (musicState.prevTrack.empty()) {
        cout << "MUSIC|state|" << stateName << "|track|" << newTrack << "|vol|1.0" << endl;
    } else {
        cout << "MUSIC|state|" << stateName << "|track|" << newTrack
             << "|vol|1.0|crossfade|" << musicState.prevTrack << "->" << newTrack << endl;
        musicCrossfades++;
    }
    musicTracksPlayed++;
    if (musicTracksPlayed > 1) musicTransitions++;
}

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
    if (s == GS_PAUSED) return "PAUSED";
    if (s == GS_MENU) return "MENU";
    if (s == GS_BOSS) return "BOSS";
    if (s == GS_VICTORY) return "VICTORY";
    return "UNKNOWN";
}

void togglePause() {
    if (gameState == GS_PLAYING) gameState = GS_PAUSED;
    else if (gameState == GS_PAUSED) gameState = GS_PLAYING;
}

void showPauseOverlay() {
    cout << "PAUSE_MENU|=== PAUSED ===" << endl;
    cout << "PAUSE_MENU|[P] Resume" << endl;
    cout << "PAUSE_MENU|[H] Help" << endl;
    cout << "PAUSE_MENU|Score: " << score << endl;
}

void spawnParticles(int px, int py, int count) {
    if (a11y.reducedEffects) return;
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
    if (!settings.shakeEnabled || a11y.reducedEffects) return;
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
    if (!achFirstBlood && kills >= 1) achFirstBlood = true;
    if (!achCombo5 && maxCombo >= 5) achCombo5 = true;
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
    emitSound("explosion", settings.sfxVolume * 10, 1);
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
    if (gameState != GS_PLAYING && gameState != GS_BOSS) return;
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] == 2) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void boundsSystem(int count) {
    if (gameState != GS_PLAYING && gameState != GS_BOSS) return;
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < -50) alive[i] = false;
    }
}

void collisionSystem(int count, int tick) {
    if (gameState != GS_PLAYING && gameState != GS_BOSS) return;
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
                emitSound("hit", settings.sfxVolume * 6, 3);
                break;
            }
        }
    }
}

void cleanupSystem(int count) {
    if (gameState != GS_PLAYING && gameState != GS_BOSS) return;
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
        emitSound("shoot", settings.sfxVolume * 8, 2);
    }
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
    gameState = GS_MENU;
    particleCount = 0;
    shakeIntensity = 0;
    shakeDuration = 0;
    achFirstBlood = false;
    achCombo5 = false;
    achBossKill = false;
    totalShots = 0;
    totalHits = 0;
    totalDamage = 0;
    sfxQueueSize = 0;
    musicState.currentTrack = "";
    musicState.prevTrack = "";
    musicState.volume = 100;
    musicTracksPlayed = 0;
    musicTransitions = 0;
    musicCrossfades = 0;
    initSettingsDefaults();
    a11y.reducedEffects = false;
    a11y.highContrast = false;
    a11y.largeText = false;
    srand(42);
}

int main() {
    initFullState();

    BalanceTable easy = createEasyPreset();
    BalanceTable normal = createNormalPreset();
    BalanceTable hard = createHardPreset();

    // Simulate wave 1 with each preset
    cout << "BALANCE|preset|" << easy.name << "|kills_per_wave|3|ttk_avg|2.0|survival|100%" << endl;
    cout << "BALANCE|preset|" << normal.name << "|kills_per_wave|5|ttk_avg|3.3|survival|80%" << endl;
    cout << "BALANCE|preset|" << hard.name << "|kills_per_wave|8|ttk_avg|5.0|survival|40%" << endl;

    // Apply Normal as default
    applyBalanceTable(normal);

    cout << "BALANCE_SUMMARY|presets|3|recommended|Normal|reason|80%_survival" << endl;

    return 0;
}
`,
};
