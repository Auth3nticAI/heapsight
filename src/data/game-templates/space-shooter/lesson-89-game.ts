import type { GameLessonVariant } from "@/types/game";

export const lesson89SpaceShooter: GameLessonVariant = {
  lessonId: "89-accessibility",
  instructions: `# Accessibility System — Inclusive Rendering Pipeline

Screen shake causes nausea. Rapid particles trigger seizures. Low contrast excludes colorblind players. An AccessibilitySettings struct controls these features with booleans. The render pipeline checks the flags. Same game, different presentation. Zero gameplay impact, maximum player reach.

## What Breaks Without This

Without accessibility, one configuration ships. Full effects, standard contrast. Players who cannot tolerate motion effects uninstall silently. The game works for 85% and excludes 15%. That is a bug with a two-line fix.

## The Fix

A struct with three booleans. Every visual system checks the flags before rendering. Particles check reducedEffects. Sprites check highContrast. The game logic is identical. Only the presentation adapts.

\\\`\\\`\\\`
// Normal: '@' 'v' '|' + particles + shake
// Accessible: 'X' '#' '!' + no particles + no shake
\\\`\\\`\\\`

## Your Task

1. AccessibilitySettings struct: reducedEffects, highContrast, largeText
2. Sprite remap: player '@'->'X', enemy 'v'->'#', bullet '|'->'!'
3. Render normal mode: \\\`RENDER|mode|normal|player|@|enemy|v|bullet|||particles|8\\\`
4. Render accessible mode: \\\`RENDER|mode|accessible|player|X|enemy|#|bullet|!|particles|0\\\`
5. Print: \\\`ACCESSIBILITY|reduced_effects|ON|high_contrast|ON|features_disabled|3\\\`
6. Print: \\\`A11Y_SUMMARY|modes|2|sprite_remaps|3|effects_disabled|particles,shake,trails\\\`

## Beginner Trap

**Common Mistake:** Creating separate render functions for each mode. One render function that branches on flags. If you duplicate the renderer, every bug fix must be applied twice. One path, conditional presentation.

## Elite Insight

Sony requires accessibility features for PlayStation certification. Microsoft mandates them for Xbox. These are not optional nice-to-haves. They are shipping requirements. A boolean and a branch cost nothing. Failing cert costs months.

## Cross-Path Echo

CSS \\\`prefers-reduced-motion\\\` and \\\`prefers-contrast\\\` media queries solve the same problem for the web. Same content, adapted presentation based on user preference. Your accessibility flags are media queries for game rendering.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct AccessibilitySettings {
    bool reducedEffects;
    bool highContrast;
    bool largeText;
};

AccessibilitySettings a11y;

// TODO: Write getPlayerSprite() — '@' or 'X' based on highContrast
// TODO: Write getEnemySprite() — 'v' or '#' based on highContrast
// TODO: Write getBulletSprite() — '|' or '!' based on highContrast
// TODO: Write getParticleCount() — 8 or 0 based on reducedEffects

// TODO: Write renderScene(string mode) — print RENDER line with sprites

// TODO: Write printAccessibilityStatus()
// TODO: Write printA11ySummary()

int main() {
    // TODO: Normal mode render, then accessible mode render
    // TODO: Print ACCESSIBILITY and A11Y_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct AccessibilitySettings {
    bool reducedEffects;
    bool highContrast;
    bool largeText;
};

AccessibilitySettings a11y;

char getPlayerSprite() {
    return a11y.highContrast ? 'X' : '@';
}

char getEnemySprite() {
    return a11y.highContrast ? '#' : 'v';
}

char getBulletSprite() {
    return a11y.highContrast ? '!' : '|';
}

int getParticleCount() {
    return a11y.reducedEffects ? 0 : 8;
}

void renderScene(string mode) {
    cout << "RENDER|mode|" << mode << "|player|" << getPlayerSprite()
         << "|enemy|" << getEnemySprite() << "|bullet|" << getBulletSprite()
         << "|particles|" << getParticleCount() << endl;
}

void printAccessibilityStatus() {
    int disabled = 0;
    if (a11y.reducedEffects) disabled = 3;
    cout << "ACCESSIBILITY|reduced_effects|" << (a11y.reducedEffects ? "ON" : "OFF")
         << "|high_contrast|" << (a11y.highContrast ? "ON" : "OFF")
         << "|features_disabled|" << disabled << endl;
}

void printA11ySummary() {
    cout << "A11Y_SUMMARY|modes|2|sprite_remaps|3|effects_disabled|particles,shake,trails" << endl;
}

int main() {
    a11y.reducedEffects = false;
    a11y.highContrast = false;
    a11y.largeText = false;
    renderScene("normal");

    a11y.reducedEffects = true;
    a11y.highContrast = true;
    a11y.largeText = true;
    renderScene("accessible");

    printAccessibilityStatus();
    printA11ySummary();

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Normal mode standard sprites", expectedOutput: "RENDER\\|mode\\|normal\\|player\\|@\\|enemy\\|v\\|bullet\\|\\|\\|particles\\|8", isPattern: true },
    { id: "g2", description: "Accessible mode remapped sprites", expectedOutput: "RENDER\\|mode\\|accessible\\|player\\|X\\|enemy\\|#\\|bullet\\|!\\|particles\\|0", isPattern: true },
    { id: "g3", description: "Accessibility features disabled count", expectedOutput: "ACCESSIBILITY\\|reduced_effects\\|ON\\|high_contrast\\|ON\\|features_disabled\\|3", isPattern: true },
    { id: "g4", description: "A11Y summary complete", expectedOutput: "A11Y_SUMMARY\\|modes\\|2\\|sprite_remaps\\|3\\|effects_disabled\\|particles,shake,trails", isPattern: true },
  ],
  hints: [
    "Each sprite function checks a11y.highContrast and returns one of two characters. getParticleCount checks a11y.reducedEffects. These are simple ternary expressions.",
    "renderScene builds one cout line using all the sprite functions. Call it twice: once with flags false (normal), once with flags true (accessible). The flags control the output, not the mode string.",
    "printAccessibilityStatus prints ON/OFF for each flag and counts disabled features (3 when reducedEffects is true). The A11Y_SUMMARY is a static string with totals.",
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

    // Normal mode render
    cout << "RENDER|mode|normal|player|" << getPlayerSprite()
         << "|enemy|" << getEnemySprite() << "|bullet|" << getBulletSprite()
         << "|particles|8" << endl;

    // Switch to accessible mode
    a11y.reducedEffects = true;
    a11y.highContrast = true;
    a11y.largeText = true;

    cout << "RENDER|mode|accessible|player|" << getPlayerSprite()
         << "|enemy|" << getEnemySprite() << "|bullet|" << getBulletSprite()
         << "|particles|0" << endl;

    cout << "ACCESSIBILITY|reduced_effects|ON|high_contrast|ON|features_disabled|3" << endl;
    cout << "A11Y_SUMMARY|modes|2|sprite_remaps|3|effects_disabled|particles,shake,trails" << endl;

    return 0;
}
`,
};
