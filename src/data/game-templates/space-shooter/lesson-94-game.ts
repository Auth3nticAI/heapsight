import type { GameLessonVariant } from "@/types/game";

export const lesson94SpaceShooter: GameLessonVariant = {
  lessonId: "94-crash-proofing",
  instructions: `# Crash Proofing — Survive Bad Data in Space Shooter

Players will edit your config files. Mods will inject bad data. Save files will get corrupted. Network packets will arrive malformed. Your game must survive all of it. Every external input gets validated. Every parse gets a fallback. Every array access gets a bounds check. Zero crashes from bad data. Zero.

## What Breaks Without This

Without validation, the game is fragile. One typo in config.txt crashes the launcher. One corrupted save file prevents loading. One modded enemy with HP=-50 breaks the combat system. The game works perfectly with perfect data. It explodes with imperfect data. Players never provide perfect data.

## The Fix

Validate at every boundary. Config parser validates each value against type and range. Pool access validates indices. Difficulty strings validate against known values. Missing keys produce defaults. The pattern is consistent: parse, validate, fallback, continue. Never crash. Always log.

\\\`\\\`\\\`
// Validation chain:
// 1. Parse raw string
// 2. Type check (is it a number? a known string?)
// 3. Range check (min <= val <= max)
// 4. Fallback (use default if invalid)
// 5. Log result
\\\`\\\`\\\`

## Your Task

1. Feed 5 bad inputs through validators:
   - "sfx_volume=abc" -> default 5
   - "difficulty=extreme" -> clamp to "hard"
   - "enemy_hp=-50" -> clamp to 1
   - Missing key "player_name" -> default "PILOT"
   - Pool index 99 -> out of bounds, skip
2. Print: \\\`VALIDATE|sfx_volume|input|abc|invalid|using_default|5\\\`
3. Print: \\\`VALIDATE|difficulty|input|extreme|invalid|clamped|hard\\\`
4. Print: \\\`VALIDATE|enemy_hp|input|-50|invalid|clamped|1\\\`
5. Print: \\\`VALIDATE|missing_key|player_name|not_found|using_default|PILOT\\\`
6. Print: \\\`VALIDATE|pool_index|input|99|invalid|out_of_bounds|skipped\\\`
7. Print: \\\`CRASHPROOF|bad_inputs|5|handled|5|crashes|0\\\`
8. Print: \\\`VALIDATION_SUMMARY|checks|5|passed|0|defaulted|2|clamped|2|errors|0\\\`

## Beginner Trap

**Common Mistake:** Validating only on load, not on use. The config loads correctly, but later a mod changes enemy_hp to -50 at runtime. If the spawn function does not validate HP, the negative value propagates. Validate at both boundaries: when data enters the system and when data is used by a critical function.

## Elite Insight

Erlang's "let it crash" philosophy is the opposite approach — and it works because Erlang has supervisor processes that restart crashed workers in milliseconds. In C++, you do not have supervisors. A crash is a crash. Defensive programming is the C++ answer to fault tolerance. Validate everything because there is no safety net.

## Cross-Path Echo

API input validation in web services follows the same pattern. Every endpoint validates every field of every request. Type checking, range checking, required field checking, enum validation. Your config validator is an API input validator for game data. Same checks, same fallbacks, same principle: trust nothing from outside.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
int badInputs = 0;
int handled = 0;
int passed = 0;
int defaulted = 0;
int clamped = 0;

// TODO: Write safeParseInt(val, defaultVal, minVal, maxVal)

// TODO: Write validateDifficulty(val)

// TODO: Write validatePoolIndex(idx, poolSize)

int main() {
    // TODO: Validate 5 bad inputs, print VALIDATE lines
    // TODO: Print CRASHPROOF and VALIDATION_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
int badInputs = 0;
int handled = 0;
int passed = 0;
int defaulted = 0;
int clamped = 0;

int safeParseInt(string val, int defaultVal, int minVal, int maxVal) {
    try {
        int result = stoi(val);
        if (result < minVal) return minVal;
        if (result > maxVal) return maxVal;
        return result;
    } catch (...) {
        return defaultVal;
    }
}

string validateDifficulty(string val) {
    if (val == "easy" || val == "normal" || val == "hard") return val;
    return "hard";
}

bool validatePoolIndex(int idx, int poolSize) {
    return (idx >= 0 && idx < poolSize);
}

int main() {
    // Test 1: sfx_volume = "abc"
    string sfxInput = "abc";
    int sfxVal = safeParseInt(sfxInput, 5, 0, 10);
    cout << "VALIDATE|sfx_volume|input|" << sfxInput << "|invalid|using_default|" << sfxVal << endl;
    badInputs++; handled++; defaulted++;

    // Test 2: difficulty = "extreme"
    string diffInput = "extreme";
    string diffVal = validateDifficulty(diffInput);
    cout << "VALIDATE|difficulty|input|" << diffInput << "|invalid|clamped|" << diffVal << endl;
    badInputs++; handled++; clamped++;

    // Test 3: enemy_hp = "-50"
    string hpInput = "-50";
    int hpVal = safeParseInt(hpInput, 10, 1, 999);
    cout << "VALIDATE|enemy_hp|input|" << hpInput << "|invalid|clamped|" << hpVal << endl;
    badInputs++; handled++; clamped++;

    // Test 4: missing key
    string playerName = "PILOT";
    cout << "VALIDATE|missing_key|player_name|not_found|using_default|" << playerName << endl;
    badInputs++; handled++; defaulted++;

    // Test 5: pool index 99
    int testIdx = 99;
    bool valid = validatePoolIndex(testIdx, POOL_SIZE);
    cout << "VALIDATE|pool_index|input|" << testIdx << "|invalid|out_of_bounds|skipped" << endl;
    badInputs++; handled++;

    cout << "CRASHPROOF|bad_inputs|" << badInputs << "|handled|" << handled << "|crashes|0" << endl;
    cout << "VALIDATION_SUMMARY|checks|" << badInputs << "|passed|" << passed
         << "|defaulted|" << defaulted << "|clamped|" << clamped << "|errors|0" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Bad int validated", expectedOutput: "VALIDATE\\|sfx_volume\\|input\\|abc\\|invalid\\|using_default\\|5", isPattern: true },
    { id: "g2", description: "Bad difficulty validated", expectedOutput: "VALIDATE\\|difficulty\\|input\\|extreme\\|invalid\\|clamped\\|hard", isPattern: true },
    { id: "g3", description: "Negative HP validated", expectedOutput: "VALIDATE\\|enemy_hp\\|input\\|-50\\|invalid\\|clamped\\|1", isPattern: true },
    { id: "g4", description: "Missing key handled", expectedOutput: "VALIDATE\\|missing_key\\|player_name\\|not_found\\|using_default\\|PILOT", isPattern: true },
    { id: "g5", description: "Pool bounds checked", expectedOutput: "VALIDATE\\|pool_index\\|input\\|99\\|invalid\\|out_of_bounds\\|skipped", isPattern: true },
    { id: "g6", description: "Zero crashes", expectedOutput: "CRASHPROOF\\|bad_inputs\\|5\\|handled\\|5\\|crashes\\|0", isPattern: true },
    { id: "g7", description: "Validation summary correct", expectedOutput: "VALIDATION_SUMMARY\\|checks\\|5\\|passed\\|0\\|defaulted\\|2\\|clamped\\|2\\|errors\\|0", isPattern: true },
  ],
  hints: [
    "safeParseInt uses try-catch around stoi(). \"abc\" throws, so return defaultVal=5. \"-50\" parses to -50, which is less than minVal=1, so return 1. Both are handled but for different reasons.",
    "validateDifficulty checks against \"easy\", \"normal\", \"hard\". \"extreme\" matches none, so return \"hard\". For the missing key test, just print the default \"PILOT\" directly — no parsing needed.",
    "Track all 5 counters carefully. badInputs=5, handled=5, passed=0 (all inputs are bad), defaulted=2 (tests 1 and 4), clamped=2 (tests 2 and 3). Test 5 is out of bounds — not defaulted or clamped.",
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
const int MAX_CONFIG_LINES = 10;

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
enum GameState { GS_TITLE, GS_PLAYING, GS_PAUSED, GS_MENU, GS_BOSS, GS_VICTORY, GS_GAME_OVER };

int aiPattern[POOL_SIZE];
GameState gameState = GS_TITLE;

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

// Title screen / Menu system
struct Menu {
    int selected;
    int optionCount;
    string options[4];
    string actions[4];
};

Menu titleMenu;

// Config / Settings system
struct Settings {
    int sfxVolume;
    int musicVolume;
    string difficulty;
    bool shakeEnabled;
    bool trailsEnabled;
    bool highContrast;
    string playerName;
};

Settings gameSettings;

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
    if (stateName == "TITLE") return "menu_theme";
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

// Title screen functions
void drawTitle() {
    cout << "TITLE|  ___  ___   _   ___ ___" << endl;
    cout << "TITLE| / __|/ _ \\\\ / | / __| __|" << endl;
    cout << "TITLE| \\\\__ \\\\  __/ /| || (__| _|" << endl;
    cout << "TITLE| |___/\\\\___|/ |_|\\\\___|___|" << endl;
    cout << "TITLE|" << endl;
}

void drawMenu(Menu &menu) {
    for (int i = 0; i < menu.optionCount; i++) {
        if (i == menu.selected) {
            cout << "TITLE|  > [" << (i + 1) << "] " << menu.options[i] << endl;
        } else {
            cout << "TITLE|    [" << (i + 1) << "] " << menu.options[i] << endl;
        }
    }
}

void selectOption(Menu &menu) {
    cout << "MENU_SELECT|option|" << (menu.selected + 1) << "|action|"
         << menu.actions[menu.selected] << "|state|TITLE->PLAYING" << endl;
}

void initTitleMenu() {
    titleMenu.selected = 0;
    titleMenu.optionCount = 4;
    titleMenu.options[0] = "New Game";
    titleMenu.options[1] = "Continue";
    titleMenu.options[2] = "Options";
    titleMenu.options[3] = "Quit";
    titleMenu.actions[0] = "NEW_GAME";
    titleMenu.actions[1] = "CONTINUE";
    titleMenu.actions[2] = "OPTIONS";
    titleMenu.actions[3] = "QUIT";
}

// Config functions
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

void initDefaultSettings() {
    gameSettings.sfxVolume = 5;
    gameSettings.musicVolume = 5;
    gameSettings.difficulty = "normal";
    gameSettings.shakeEnabled = true;
    gameSettings.trailsEnabled = true;
    gameSettings.highContrast = false;
    gameSettings.playerName = "PILOT";
}

// Crash proofing / Validation functions
int safeParseInt(string val, int defaultVal, int minVal, int maxVal) {
    try {
        int result = stoi(val);
        if (result < minVal) return minVal;
        if (result > maxVal) return maxVal;
        return result;
    } catch (...) {
        return defaultVal;
    }
}

string validateDifficulty(string val) {
    if (val == "easy" || val == "normal" || val == "hard") return val;
    return "hard";
}

bool validatePoolIndex(int idx, int poolSize) {
    return (idx >= 0 && idx < poolSize);
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
    if (s == GS_TITLE) return "TITLE";
    if (s == GS_PLAYING) return "PLAYING";
    if (s == GS_PAUSED) return "PAUSED";
    if (s == GS_MENU) return "MENU";
    if (s == GS_BOSS) return "BOSS";
    if (s == GS_VICTORY) return "VICTORY";
    if (s == GS_GAME_OVER) return "GAME_OVER";
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
    emitSound("explosion", 100, 1);
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
                emitSound("hit", 60, 3);
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
        emitSound("shoot", 80, 2);
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
    gameState = GS_TITLE;
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
    initTitleMenu();
    initDefaultSettings();
    srand(42);
}

int main() {
    initFullState();

    int badInputs = 0, handled = 0, passed = 0, defaulted = 0, clamped2 = 0;

    // Test 1: sfx_volume = "abc"
    string sfxInput = "abc";
    int sfxVal = safeParseInt(sfxInput, 5, 0, 10);
    cout << "VALIDATE|sfx_volume|input|" << sfxInput << "|invalid|using_default|" << sfxVal << endl;
    badInputs++; handled++; defaulted++;

    // Test 2: difficulty = "extreme"
    string diffInput = "extreme";
    string diffVal = validateDifficulty(diffInput);
    cout << "VALIDATE|difficulty|input|" << diffInput << "|invalid|clamped|" << diffVal << endl;
    badInputs++; handled++; clamped2++;

    // Test 3: enemy_hp = "-50"
    string hpInput = "-50";
    int hpVal = safeParseInt(hpInput, 10, 1, 999);
    cout << "VALIDATE|enemy_hp|input|" << hpInput << "|invalid|clamped|" << hpVal << endl;
    badInputs++; handled++; clamped2++;

    // Test 4: missing key
    string pname = "PILOT";
    cout << "VALIDATE|missing_key|player_name|not_found|using_default|" << pname << endl;
    badInputs++; handled++; defaulted++;

    // Test 5: pool index 99
    int testIdx = 99;
    bool valid = validatePoolIndex(testIdx, POOL_SIZE);
    cout << "VALIDATE|pool_index|input|" << testIdx << "|invalid|out_of_bounds|skipped" << endl;
    badInputs++; handled++;

    cout << "CRASHPROOF|bad_inputs|" << badInputs << "|handled|" << handled << "|crashes|0" << endl;
    cout << "VALIDATION_SUMMARY|checks|" << badInputs << "|passed|" << passed
         << "|defaulted|" << defaulted << "|clamped|" << clamped2 << "|errors|0" << endl;

    return 0;
}
`,
};
