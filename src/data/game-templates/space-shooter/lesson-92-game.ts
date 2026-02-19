import type { GameLessonVariant } from "@/types/game";

export const lesson92SpaceShooter: GameLessonVariant = {
  lessonId: "92-title-screen",
  instructions: `# Title Screen — The Front Door

The title screen is the first thing the player sees. It sets the tone. It provides navigation. It proves the game is not broken. A title screen with ASCII art, clear menu options, and a working selection system tells the player: this game was built by someone who cares. No title screen says: this is a prototype that might crash.

## What Breaks Without This

Without a title screen state, the game launches directly into gameplay. There is no way to restart without closing the program. There is no way to access settings. There is no way to quit cleanly. The title screen is the hub that connects all other states. Without it, the game is a dead-end hallway.

## The Fix

GameState starts at TITLE. The main loop checks state before processing. In TITLE state, draw the art and menu. Process input to navigate and select. On "New Game," transition to PLAYING. The PLAYING state already works from previous lessons. The title screen is the missing entry point.

\\\`\\\`\\\`
// Title state:
// 1. Draw ASCII art
// 2. Draw menu with ">" on selected
// 3. Input selects option
// 4. "New Game" -> PLAYING
\\\`\\\`\\\`

## Your Task

1. Draw ASCII title art for "SPACE SHOOTER" with TITLE| prefix
2. Show 4 menu options: New Game, Continue, Options, Quit
3. Mark selected option (index 0) with ">" indicator
4. Simulate selecting "New Game" — transition state TITLE->PLAYING
5. Print title lines and menu lines
6. Print: \\\`MENU_SELECT|option|1|action|NEW_GAME|state|TITLE->PLAYING\\\`

## Beginner Trap

**Common Mistake:** Forgetting that the title screen is a game state, not a one-time function. If the player finishes a game and returns to the title, the title screen must render again. Store title screen data in a struct that persists. Do not allocate it on the stack of a one-shot function.

## Elite Insight

Console certification requires specific title screen elements. Xbox requires the game title, a "Press A to start" prompt, and legal text. PlayStation requires the same plus a specific button icon. Nintendo requires language selection on first boot. Your title screen is the minimum viable version. Production adds platform-specific requirements.

## Cross-Path Echo

A CLI application's help screen follows the same pattern. The user runs the command with no arguments and sees: the program name (title art), available commands (menu options), and usage instructions (selection). Your title screen is \\\`--help\\\` for a game.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Menu {
    int selected;
    int optionCount;
    string options[4];
    string actions[4];
};

// TODO: Write drawTitle() — print ASCII art with TITLE| prefix

// TODO: Write drawMenu(menu) — print options with > on selected

// TODO: Write selectOption(menu) — print MENU_SELECT line

int main() {
    Menu menu;
    menu.selected = 0;
    menu.optionCount = 4;
    menu.options[0] = "New Game";
    menu.options[1] = "Continue";
    menu.options[2] = "Options";
    menu.options[3] = "Quit";
    menu.actions[0] = "NEW_GAME";
    menu.actions[1] = "CONTINUE";
    menu.actions[2] = "OPTIONS";
    menu.actions[3] = "QUIT";

    // TODO: Draw title, menu, select option 0

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Menu {
    int selected;
    int optionCount;
    string options[4];
    string actions[4];
};

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

int main() {
    Menu menu;
    menu.selected = 0;
    menu.optionCount = 4;
    menu.options[0] = "New Game";
    menu.options[1] = "Continue";
    menu.options[2] = "Options";
    menu.options[3] = "Quit";
    menu.actions[0] = "NEW_GAME";
    menu.actions[1] = "CONTINUE";
    menu.actions[2] = "OPTIONS";
    menu.actions[3] = "QUIT";

    drawTitle();
    drawMenu(menu);
    selectOption(menu);

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Title ASCII art renders", expectedOutput: "TITLE\\|  ___  ___   _   ___ ___", isPattern: true },
    { id: "g2", description: "New Game has selection indicator", expectedOutput: "TITLE\\|  > \\[1\\] New Game", isPattern: true },
    { id: "g3", description: "Continue without indicator", expectedOutput: "TITLE\\|    \\[2\\] Continue", isPattern: true },
    { id: "g4", description: "Options without indicator", expectedOutput: "TITLE\\|    \\[3\\] Options", isPattern: true },
    { id: "g5", description: "Quit without indicator", expectedOutput: "TITLE\\|    \\[4\\] Quit", isPattern: true },
    { id: "g6", description: "Menu select transitions to playing", expectedOutput: "MENU_SELECT\\|option\\|1\\|action\\|NEW_GAME\\|state\\|TITLE->PLAYING", isPattern: true },
  ],
  hints: [
    "drawTitle prints 5 lines of ASCII art. Each starts with \"TITLE|\" followed by the art. The fifth line is just \"TITLE|\" as a blank separator between art and menu.",
    "drawMenu loops 0 to 3. If i equals menu.selected (0), use \"  > \" prefix. Otherwise \"    \" (4 spaces). Format: [N] followed by the option label. N is i+1.",
    "selectOption reads menu.selected and prints MENU_SELECT with option number (selected+1), action name from menu.actions array, and state transition TITLE->PLAYING.",
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
    srand(42);
}

int main() {
    initFullState();

    // Title screen
    drawTitle();
    drawMenu(titleMenu);
    selectOption(titleMenu);

    // Transition to playing
    gameState = GS_PLAYING;

    return 0;
}
`,
};
