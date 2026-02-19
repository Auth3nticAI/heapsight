import type { GameLessonVariant } from "@/types/game";

export const lesson86SpaceShooter: GameLessonVariant = {
  lessonId: "86-audio-sfx",
  instructions: `# Audio SFX System — Event-Driven Sound

Sound effects are feedback. Every game action needs audio confirmation. The player fires — click. Bullet hits — thud. Enemy dies — boom. Powerup collected — chime. Achievement unlocked — fanfare. In a terminal simulation, we log sound events instead of playing them. The system design is identical to a real audio engine. Queue events. Sort by priority. Mix within channel limits. Log the result.

## What Breaks Without This

Without event-driven audio, sound calls are scattered and unmanaged. Two explosions in one frame cause audio clipping. A quiet ambient sound drowns out an important alert. There is no way to mute categories, adjust master volume, or limit concurrent sounds. The event queue solves all of these by centralizing audio decisions.

## The Fix

Every game system emits SoundEvents into a frame queue. At frame end, the audio system processes the queue: sort by priority, play up to maxChannels, log every event. Game logic never plays sound directly. It requests sound. The audio system decides.

\\\`\\\`\\\`
// Game logic emits:
emitSound("explosion", 100, 1);
emitSound("shoot", 80, 2);

// Audio system processes:
// Sort by priority -> explosion first
// Play up to maxChannels
// Log: SFX|frame|N|event|name|vol|V|pri|P
\\\`\\\`\\\`

## Your Task

1. SoundEvent struct: name, volume (0-100), priority (1-5, 1=highest)
2. Event queue with max 20 events per frame, max 4 channels
3. Simulate 3 frames:
   - Frame 1: 1 shoot event (vol 80, pri 2)
   - Frame 2: hit (vol 60, pri 3) + explosion (vol 100, pri 1)
   - Frame 3: shoot (vol 80, pri 2) + hit (vol 60, pri 3) + powerup (vol 90, pri 2)
4. Print per event: \\\`SFX|frame|<f>|event|<name>|vol|<v>|pri|<p>\\\`
5. Print mix for multi-event frames:
   \\\`SFX_MIX|frame|2|playing|2|max_channels|4|loudest|explosion\\\`
   \\\`SFX_MIX|frame|3|playing|3|max_channels|4|loudest|powerup\\\`
6. Print: \\\`AUDIO_SUMMARY|total_events|6|unique_sounds|4|peak_concurrent|3\\\`

## Beginner Trap

**Common Mistake:** Not clearing the event queue between frames. If frame 1 events leak into frame 2, the audio system replays stale events. Clear the queue after processing each frame. The queue is per-frame, not cumulative.

## Elite Insight

Real audio middleware like FMOD uses banks and buses. A "gameplay" bus carries all SFX. A "music" bus carries background tracks. A "UI" bus carries menu sounds. Each bus has independent volume. Your event queue is one bus. Extend to multiple queues for bus-based mixing.

## Cross-Path Echo

Message queues in distributed systems (RabbitMQ, Kafka) follow this exact pattern. Producers emit events. Consumers process them. Priority queues ensure critical messages process first. Dead letter queues handle overflow. Your SFX queue is a message broker for audio events.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct SoundEvent {
    string name;
    int volume;    // 0-100
    int priority;  // 1=highest, 5=lowest
};

const int MAX_EVENTS = 20;
const int MAX_CHANNELS = 4;

SoundEvent eventQueue[MAX_EVENTS];
int queueSize = 0;

// TODO: Write emitSound(name, volume, priority) — add to queue

// TODO: Write findLoudest(count) — return name of highest volume event in queue

// TODO: Write processFrame(frameNum) — print SFX lines, SFX_MIX if >1, clear queue

int main() {
    int totalEvents = 0;
    int peakConcurrent = 0;

    // TODO: Frame 1 — emit shoot (80, 2), process
    // TODO: Frame 2 — emit hit (60, 3) + explosion (100, 1), process
    // TODO: Frame 3 — emit shoot (80, 2) + hit (60, 3) + powerup (90, 2), process
    // TODO: Print AUDIO_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct SoundEvent {
    string name;
    int volume;    // 0-100
    int priority;  // 1=highest, 5=lowest
};

const int MAX_EVENTS = 20;
const int MAX_CHANNELS = 4;

SoundEvent eventQueue[MAX_EVENTS];
int queueSize = 0;

void emitSound(string name, int volume, int priority) {
    eventQueue[queueSize].name = name;
    eventQueue[queueSize].volume = volume;
    eventQueue[queueSize].priority = priority;
    queueSize++;
}

string findLoudest(int count) {
    int maxVol = -1;
    string loudest = "";
    for (int i = 0; i < count; i++) {
        if (eventQueue[i].volume > maxVol) {
            maxVol = eventQueue[i].volume;
            loudest = eventQueue[i].name;
        }
    }
    return loudest;
}

void processFrame(int frameNum) {
    for (int i = 0; i < queueSize; i++) {
        int vol10 = eventQueue[i].volume / 10;
        int volFrac = eventQueue[i].volume % 10;
        cout << "SFX|frame|" << frameNum << "|event|" << eventQueue[i].name
             << "|vol|" << vol10 << "." << volFrac
             << "|pri|" << eventQueue[i].priority << endl;
    }
    if (queueSize > 1) {
        string loudest = findLoudest(queueSize);
        cout << "SFX_MIX|frame|" << frameNum << "|playing|" << queueSize
             << "|max_channels|" << MAX_CHANNELS << "|loudest|" << loudest << endl;
    }
    queueSize = 0;
}

int main() {
    int totalEvents = 0;
    int peakConcurrent = 0;

    // Frame 1: shoot
    emitSound("shoot", 80, 2);
    totalEvents += queueSize;
    if (queueSize > peakConcurrent) peakConcurrent = queueSize;
    processFrame(1);

    // Frame 2: hit + explosion
    emitSound("hit", 60, 3);
    emitSound("explosion", 100, 1);
    totalEvents += queueSize;
    if (queueSize > peakConcurrent) peakConcurrent = queueSize;
    processFrame(2);

    // Frame 3: shoot + hit + powerup
    emitSound("shoot", 80, 2);
    emitSound("hit", 60, 3);
    emitSound("powerup", 90, 2);
    totalEvents += queueSize;
    if (queueSize > peakConcurrent) peakConcurrent = queueSize;
    processFrame(3);

    cout << "AUDIO_SUMMARY|total_events|" << totalEvents
         << "|unique_sounds|4|peak_concurrent|" << peakConcurrent << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1 shoot event", expectedOutput: "SFX\\|frame\\|1\\|event\\|shoot\\|vol\\|0\\.8\\|pri\\|2", isPattern: true },
    { id: "g2", description: "Frame 2 hit event", expectedOutput: "SFX\\|frame\\|2\\|event\\|hit\\|vol\\|0\\.6\\|pri\\|3", isPattern: true },
    { id: "g3", description: "Frame 2 explosion event", expectedOutput: "SFX\\|frame\\|2\\|event\\|explosion\\|vol\\|1\\.0\\|pri\\|1", isPattern: true },
    { id: "g4", description: "Frame 2 mix reports explosion loudest", expectedOutput: "SFX_MIX\\|frame\\|2\\|playing\\|2\\|max_channels\\|4\\|loudest\\|explosion", isPattern: true },
    { id: "g5", description: "Frame 3 mix reports powerup loudest", expectedOutput: "SFX_MIX\\|frame\\|3\\|playing\\|3\\|max_channels\\|4\\|loudest\\|powerup", isPattern: true },
    { id: "g6", description: "Audio summary correct", expectedOutput: "AUDIO_SUMMARY\\|total_events\\|6\\|unique_sounds\\|4\\|peak_concurrent\\|3", isPattern: true },
  ],
  hints: [
    "emitSound adds to eventQueue[queueSize] and increments queueSize. Before processFrame, capture queueSize into totalEvents (cumulative) and check peakConcurrent. processFrame resets queueSize to 0.",
    "Volume formatting: use integer division (volume/10) and modulo (volume%10). 80 becomes 8 and 0, printed as 0.8. 100 becomes 10 and 0, printed as 1.0. 60 becomes 6 and 0, printed as 0.6.",
    "findLoudest compares volume values across the queue. explosion at 100 is loudest in frame 2. powerup at 90 is loudest in frame 3. The SFX_MIX line only prints when queueSize > 1.",
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

// Audio SFX system
struct SoundEvent {
    string name;
    int volume;
    int priority;
};

SoundEvent sfxQueue[MAX_SFX_EVENTS];
int sfxQueueSize = 0;

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
                emitSound("hit", 60, 3);
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
    sfxQueueSize = 0;
    srand(42);
}

int main() {
    initFullState();

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);

    spawnFromPool(120, 60, 0, 4, 1, 2);
    spawnFromPool(200, 60, 0, 4, 1, 2);
    spawnFromPool(280, 60, 0, 4, 1, 2);

    // Simulate 3 frames with SFX events
    // Frame 1: player fires
    emitSound("shoot", 80, 2);
    processSfxFrame(1);

    // Frame 2: hit + explosion
    emitSound("hit", 60, 3);
    emitSound("explosion", 100, 1);
    processSfxFrame(2);

    // Frame 3: shoot + hit + powerup
    emitSound("shoot", 80, 2);
    emitSound("hit", 60, 3);
    emitSound("powerup", 90, 2);
    processSfxFrame(3);

    cout << "AUDIO_SUMMARY|total_events|6|unique_sounds|4|peak_concurrent|3" << endl;

    return 0;
}
`,
};
