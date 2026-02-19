import type { GameLessonVariant } from "@/types/game";

export const lesson91SpaceShooter: GameLessonVariant = {
  lessonId: "91-hud-v2",
  instructions: `# HUD v2 Layout — Quadrant-Based Information Display

A wall of numbers is not a HUD. Four quadrants, each answering one question. Top-left: score and combo. Top-right: wave and time. Bottom-left: HP bar. Bottom-right: lives and ammo. The player glances for 200ms and gets the answer they need.

## What Breaks Without This

Seven values in one line. The player scans left to right looking for HP during a boss fight. By the time they find it, they are dead. Layout is not cosmetic. Layout is survival.

## The Fix

Group by question. "How am I doing?" — score, combo. "How far am I?" — wave, time. "Am I alive?" — HP bar. "What do I have?" — lives, ammo. Position by importance. HP bar is bottom-left because eyes drift down-left under stress.

\\\`\\\`\\\`
// HUD_TOP: score + combo | wave + time
// HUD_BOT: HP bar        | lives + ammo
\\\`\\\`\\\`

## Your Task

1. Set state: score=2500, combo=3, wave=3/10, time=45, hp=80/100, lives=2/3, ammo=3
2. Build HP bar: 10 chars, '#' for filled, '.' for empty
3. Build lives: '*' remaining, '.' lost
4. Build ammo: '|' per unit
5. Print: \\\`HUD_TOP|SCORE: 2500  COMBO: 3x  |  WAVE 3/10  TIME: 45\\\`
6. Print: \\\`HUD_BOT|HP [########..] 80/100  |  LIVES: **. AMMO: |||\\\`
7. Print: \\\`HUD_LAYOUT|sections|4|top_left|score_combo|top_right|wave_time|bot_left|hp_bar|bot_right|lives_ammo\\\`

## Beginner Trap

**Common Mistake:** Hardcoding the HP bar. Calculate filled = hp * 10 / maxHp. Build it with a loop. If you hardcode "########..", it breaks when HP changes.

## Elite Insight

Professional HUDs animate transitions. HP slides instead of jumping. Score rolls up digit by digit. Combo flashes on increment. Your static layout is the data layer. Animation is the presentation layer that makes it feel alive.

## Cross-Path Echo

Web dashboards use the same quadrant layout. Revenue top-left. Active users top-right. Server health bottom-left. Resource usage bottom-right. Information hierarchy transcends medium.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int hudScore = 2500;
int hudCombo = 3;
int hudWave = 3;
int hudMaxWave = 10;
int hudTime = 45;
int hudHp = 80;
int hudMaxHp = 100;
int hudLives = 2;
int hudMaxLives = 3;
int hudAmmo = 3;

// TODO: Write buildHpBar() — 10-char string, '#' filled, '.' empty
// TODO: Write buildLivesDisplay() — '*' remaining, '.' lost
// TODO: Write buildAmmoDisplay() — '|' per ammo

// TODO: Write printHudTop() — score, combo, wave, time
// TODO: Write printHudBot() — HP bar, lives, ammo

int main() {
    // TODO: Print HUD_TOP, HUD_BOT, HUD_LAYOUT

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int hudScore = 2500;
int hudCombo = 3;
int hudWave = 3;
int hudMaxWave = 10;
int hudTime = 45;
int hudHp = 80;
int hudMaxHp = 100;
int hudLives = 2;
int hudMaxLives = 3;
int hudAmmo = 3;

string buildHpBar() {
    int filled = hudHp * 10 / hudMaxHp;
    string bar = "";
    for (int i = 0; i < filled; i++) bar += '#';
    for (int i = filled; i < 10; i++) bar += '.';
    return bar;
}

string buildLivesDisplay() {
    string disp = "";
    for (int i = 0; i < hudLives; i++) disp += '*';
    for (int i = hudLives; i < hudMaxLives; i++) disp += '.';
    return disp;
}

string buildAmmoDisplay() {
    string disp = "";
    for (int i = 0; i < hudAmmo; i++) disp += '|';
    return disp;
}

void printHudTop() {
    cout << "HUD_TOP|SCORE: " << hudScore << "  COMBO: " << hudCombo
         << "x  |  WAVE " << hudWave << "/" << hudMaxWave
         << "  TIME: " << hudTime << endl;
}

void printHudBot() {
    cout << "HUD_BOT|HP [" << buildHpBar() << "] " << hudHp << "/" << hudMaxHp
         << "  |  LIVES: " << buildLivesDisplay()
         << " AMMO: " << buildAmmoDisplay() << endl;
}

int main() {
    printHudTop();
    printHudBot();

    cout << "HUD_LAYOUT|sections|4|top_left|score_combo|top_right|wave_time|bot_left|hp_bar|bot_right|lives_ammo" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "HUD top with score combo wave time", expectedOutput: "HUD_TOP\\|SCORE: 2500  COMBO: 3x  \\|  WAVE 3/10  TIME: 45", isPattern: true },
    { id: "g2", description: "HUD bottom with HP bar lives ammo", expectedOutput: "HUD_BOT\\|HP \\[########\\.\\.\\] 80/100  \\|  LIVES: \\*\\*\\. AMMO: \\|\\|\\|", isPattern: true },
    { id: "g3", description: "HUD layout describes 4 sections", expectedOutput: "HUD_LAYOUT\\|sections\\|4\\|top_left\\|score_combo\\|top_right\\|wave_time\\|bot_left\\|hp_bar\\|bot_right\\|lives_ammo", isPattern: true },
  ],
  hints: [
    "buildHpBar: filled = 80 * 10 / 100 = 8. Eight '#' then two '.'. Use a for loop, not a hardcoded string, so it adapts when HP changes.",
    "buildLivesDisplay: loop hudLives (2) times for '*', then (hudMaxLives - hudLives = 1) times for '.'. Result: \"**.\". buildAmmoDisplay: loop hudAmmo (3) times for '|'. Result: \"|||\".",
    "The HUD lines have exact spacing: two spaces between values, two spaces around the pipe separator. Match the format precisely. The HUD_LAYOUT line is a static string describing the four quadrants.",
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

// HUD system
int hudScore = 0;
int hudCombo = 1;
int hudWave = 1;
int hudMaxWave = 10;
int hudTime = 0;
int hudHp = 100;
int hudMaxHp = 100;
int hudLives = 3;
int hudMaxLives = 3;
int hudAmmo = 3;

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

// HUD functions
string buildHpBar() {
    int filled = hudHp * 10 / hudMaxHp;
    string bar = "";
    for (int i = 0; i < filled; i++) bar += '#';
    for (int i = filled; i < 10; i++) bar += '.';
    return bar;
}

string buildLivesDisplay() {
    string disp = "";
    for (int i = 0; i < hudLives; i++) disp += '*';
    for (int i = hudLives; i < hudMaxLives; i++) disp += '.';
    return disp;
}

string buildAmmoDisplay() {
    string disp = "";
    for (int i = 0; i < hudAmmo; i++) disp += '|';
    return disp;
}

void printHudTop() {
    cout << "HUD_TOP|SCORE: " << hudScore << "  COMBO: " << hudCombo
         << "x  |  WAVE " << hudWave << "/" << hudMaxWave
         << "  TIME: " << hudTime << endl;
}

void printHudBot() {
    cout << "HUD_BOT|HP [" << buildHpBar() << "] " << hudHp << "/" << hudMaxHp
         << "  |  LIVES: " << buildLivesDisplay()
         << " AMMO: " << buildAmmoDisplay() << endl;
}

void syncHud() {
    hudScore = score;
    hudCombo = combo;
    hudWave = wave;
    hudHp = hp[0];
    hudLives = lives;
}

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
    hudScore = 0;
    hudCombo = 1;
    hudWave = 1;
    hudMaxWave = 10;
    hudTime = 0;
    hudHp = 100;
    hudMaxHp = 100;
    hudLives = 3;
    hudMaxLives = 3;
    hudAmmo = 3;
    srand(42);
}

int main() {
    initFullState();

    // Set HUD state for display
    hudScore = 2500;
    hudCombo = 3;
    hudWave = 3;
    hudTime = 45;
    hudHp = 80;
    hudLives = 2;

    printHudTop();
    printHudBot();

    cout << "HUD_LAYOUT|sections|4|top_left|score_combo|top_right|wave_time|bot_left|hp_bar|bot_right|lives_ammo" << endl;

    return 0;
}
`,
};
