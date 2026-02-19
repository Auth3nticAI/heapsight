import type { GameLessonVariant } from "@/types/game";

export const lesson93SpaceShooter: GameLessonVariant = {
  lessonId: "93-config-file",
  instructions: `# Config File v2 — Persistent Settings for Space Shooter

Players expect their settings to survive between sessions. Volume, difficulty, accessibility options — all must persist. A config file in key=value format is the simplest solution that works. Parse on load, modify in-game, save on change. The load-modify-save cycle is the backbone of every settings system.

## What Breaks Without This

Without persistence, every launch is a fresh start. The player who spent 30 seconds configuring their preferred volume, difficulty, and accessibility settings has to redo it all. After the third time, they stop configuring and play with defaults that do not match their needs. Persistence respects the player's time.

## The Fix

A config file with one setting per line. Each line is key=value. The parser splits on '=', maps keys to struct fields, and converts strings to typed values. The save function reverses the process. The cycle is atomic: load everything, modify in memory, save everything.

\\\`\\\`\\\`
// Config file (data/config.txt):
// sfx_volume=8
// music_volume=5
// difficulty=normal
// shake_enabled=true
// trails_enabled=true
// high_contrast=false
// player_name=PILOT
\\\`\\\`\\\`

## Your Task

1. Parse 7 config lines into a Settings struct
2. Print: \\\`CONFIG_LOAD|sfx_volume|8|music_volume|5|difficulty|normal\\\`
3. Modify: difficulty -> "hard", shake_enabled -> false
4. Print: \\\`CONFIG_MODIFY|difficulty|normal->hard|shake_enabled|true->false\\\`
5. Save settings back to key=value format
6. Print: \\\`CONFIG_SAVE|lines|7|modified|2\\\`
7. Print: \\\`CONFIG_FILE|difficulty=hard\\\`
8. Print: \\\`CONFIG_SUMMARY|loaded|7|modified|2|saved|7\\\`

## Beginner Trap

**Common Mistake:** Not handling the save format consistently. If parseConfig expects "shake_enabled=true" but saveConfig writes "shake_enabled=1", the round-trip breaks. Parse and save must agree on format. Bools are "true"/"false" strings. Ints are decimal strings. Strings are raw values.

## Elite Insight

Config file versioning prevents breaking changes. Add a "config_version=2" line. When loading, check the version. If the file is version 1 and the code expects version 2, run a migration function that adds new keys with defaults. This is database migration for game settings. Never delete old keys. Append new ones.

## Cross-Path Echo

JSON.parse and JSON.stringify in JavaScript follow the same load-modify-save cycle. Read a JSON file, parse it into an object, modify properties, stringify back to JSON, write to file. Your key=value parser is a simplified JSON.parse. Same concept, simpler format.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Settings {
    int sfxVolume;
    int musicVolume;
    string difficulty;
    bool shakeEnabled;
    bool trailsEnabled;
    bool highContrast;
    string playerName;
};

const int MAX_CONFIG_LINES = 10;

// TODO: Write parseConfig(lines[], count, settings) — split on '='

// TODO: Write saveConfig(settings, output[], &outCount) — format key=value

int main() {
    Settings settings;
    string configLines[MAX_CONFIG_LINES] = {
        "sfx_volume=8",
        "music_volume=5",
        "difficulty=normal",
        "shake_enabled=true",
        "trails_enabled=true",
        "high_contrast=false",
        "player_name=PILOT"
    };
    int lineCount = 7;

    // TODO: Parse, print load, modify, print modify, save, print save+summary

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Settings {
    int sfxVolume;
    int musicVolume;
    string difficulty;
    bool shakeEnabled;
    bool trailsEnabled;
    bool highContrast;
    string playerName;
};

const int MAX_CONFIG_LINES = 10;

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

int main() {
    Settings settings;
    string configLines[MAX_CONFIG_LINES] = {
        "sfx_volume=8",
        "music_volume=5",
        "difficulty=normal",
        "shake_enabled=true",
        "trails_enabled=true",
        "high_contrast=false",
        "player_name=PILOT"
    };
    int lineCount = 7;

    parseConfig(configLines, lineCount, settings);
    cout << "CONFIG_LOAD|sfx_volume|" << settings.sfxVolume
         << "|music_volume|" << settings.musicVolume
         << "|difficulty|" << settings.difficulty << endl;

    string oldDiff = settings.difficulty;
    bool oldShake = settings.shakeEnabled;
    settings.difficulty = "hard";
    settings.shakeEnabled = false;
    cout << "CONFIG_MODIFY|difficulty|" << oldDiff << "->" << settings.difficulty
         << "|shake_enabled|" << (oldShake ? "true" : "false") << "->"
         << (settings.shakeEnabled ? "true" : "false") << endl;

    string savedLines[MAX_CONFIG_LINES];
    int savedCount = 0;
    saveConfig(settings, savedLines, savedCount);
    cout << "CONFIG_SAVE|lines|" << savedCount << "|modified|2" << endl;

    for (int i = 0; i < savedCount; i++) {
        if (savedLines[i].find("difficulty") != string::npos) {
            cout << "CONFIG_FILE|" << savedLines[i] << endl;
            break;
        }
    }

    cout << "CONFIG_SUMMARY|loaded|" << lineCount << "|modified|2|saved|" << savedCount << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Config loads values", expectedOutput: "CONFIG_LOAD\\|sfx_volume\\|8\\|music_volume\\|5\\|difficulty\\|normal", isPattern: true },
    { id: "g2", description: "Modifications tracked", expectedOutput: "CONFIG_MODIFY\\|difficulty\\|normal->hard\\|shake_enabled\\|true->false", isPattern: true },
    { id: "g3", description: "Save line count", expectedOutput: "CONFIG_SAVE\\|lines\\|7\\|modified\\|2", isPattern: true },
    { id: "g4", description: "Difficulty saved correctly", expectedOutput: "CONFIG_FILE\\|difficulty=hard", isPattern: true },
    { id: "g5", description: "Summary totals", expectedOutput: "CONFIG_SUMMARY\\|loaded\\|7\\|modified\\|2\\|saved\\|7", isPattern: true },
  ],
  hints: [
    "parseConfig uses string::find('=') to get the separator position. Key is substr(0, eq), value is substr(eq+1). Use if/else chain to match key names to struct fields.",
    "Save old values before modifying so you can print the transition. oldDiff = settings.difficulty before setting it to \"hard\". Same for shakeEnabled — save the bool before flipping to false.",
    "saveConfig builds 7 key=value strings. Use to_string() for ints, ternary for bools, direct concatenation for strings. The CONFIG_FILE line prints the difficulty entry from the saved array.",
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

    // Load config
    string configLines[MAX_CONFIG_LINES] = {
        "sfx_volume=8",
        "music_volume=5",
        "difficulty=normal",
        "shake_enabled=true",
        "trails_enabled=true",
        "high_contrast=false",
        "player_name=PILOT"
    };
    int lineCount = 7;

    parseConfig(configLines, lineCount, gameSettings);
    cout << "CONFIG_LOAD|sfx_volume|" << gameSettings.sfxVolume
         << "|music_volume|" << gameSettings.musicVolume
         << "|difficulty|" << gameSettings.difficulty << endl;

    string oldDiff = gameSettings.difficulty;
    bool oldShake = gameSettings.shakeEnabled;
    gameSettings.difficulty = "hard";
    gameSettings.shakeEnabled = false;
    cout << "CONFIG_MODIFY|difficulty|" << oldDiff << "->" << gameSettings.difficulty
         << "|shake_enabled|" << (oldShake ? "true" : "false") << "->"
         << (gameSettings.shakeEnabled ? "true" : "false") << endl;

    string savedLines[MAX_CONFIG_LINES];
    int savedCount = 0;
    saveConfig(gameSettings, savedLines, savedCount);
    cout << "CONFIG_SAVE|lines|" << savedCount << "|modified|2" << endl;

    for (int i = 0; i < savedCount; i++) {
        if (savedLines[i].find("difficulty") != string::npos) {
            cout << "CONFIG_FILE|" << savedLines[i] << endl;
            break;
        }
    }

    cout << "CONFIG_SUMMARY|loaded|" << lineCount << "|modified|2|saved|" << savedCount << endl;

    return 0;
}
`,
};
