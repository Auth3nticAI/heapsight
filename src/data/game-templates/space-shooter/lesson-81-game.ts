import type { GameLessonVariant } from "@/types/game";

export const lesson81SpaceShooter: GameLessonVariant = {
  lessonId: "81-screen-shake",
  instructions: `# Game Builder: Screen Shake — Camera Offset on Impact

Wire screen shake into the game. On enemy kill, the camera jolts. On boss hit, it jolts harder. The player feels every impact through the screen. This is the difference between a tech demo and a game that feels alive.

## What Breaks Without This

Without shake, combat has no weight. Every kill is silent and still. The player gets no physical feedback that something happened. Screen shake bridges the gap between abstract game logic and visceral player experience.

## The Fix

Add shakeIntensity to the game state. In the collision system, trigger shake on kill events. In the render system, apply shake offsets to the camera before drawing. After rendering, decay the intensity.

\\\`\\\`\\\`
// In collision: if enemy killed, triggerShake(4)
// In collision: if boss hit, triggerShake(8)
// In render: camX += shakeX, camY += shakeY
// After render: decayShake()
\\\`\\\`\\\`

## Your Task

1. shakeIntensity starts at 0. srand(42) at start
2. Frame 2: enemy kill, triggerShake(4)
3. Frame 5: boss hit, triggerShake(8)
4. Each frame: compute shakeX/shakeY, apply to camera, print, decay
5. Print: \\\`SHAKE|frame|2|trigger|KILL|intensity|4|offset|(<x>,<y>)\\\`
6. Print: \\\`SHAKE|frame|3|decay|intensity|2|offset|(<x>,<y>)\\\`
7. Print: \\\`SHAKE|frame|5|trigger|BOSS_HIT|intensity|8|offset|(<x>,<y>)\\\`
8. Print: \\\`SHAKE_SUMMARY|triggers|2|max_intensity|8|decay_rate|0.7\\\`

## Beginner Trap

**Common Mistake:** Applying shake offset to entity positions instead of camera position. Shake modifies the camera, not the entities. If you add shake to entity coordinates, entities drift permanently. Camera offset is temporary — applied during render, discarded after.

## Elite Insight

Screen shake stacks with other feedback: hitflash (1-frame color inversion), hitstop (1-frame pause), particle burst. Each layer adds a millisecond of visual information. Together they create impact that players describe as "crunchy" or "juicy." Shake alone gets you 60% of the way there.

## Cross-Path Echo

Error highlighting in IDEs uses the same principle. A red underline is the "shake" for code errors. It draws attention without being destructive. The intensity (underline vs full background highlight) scales with severity (warning vs error). Feedback proportional to event magnitude — the same design principle.`,
  starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

int shakeIntensity = 0;
int maxIntensity = 0;
int triggerCount = 0;

// TODO: Write triggerShake(intensity)

// TODO: Write computeShake(shakeX, shakeY)

// TODO: Write decayShake()

int main() {
    srand(42);

    // TODO: Simulate 7 frames
    //   Frame 2: trigger KILL (intensity 4)
    //   Frame 5: trigger BOSS_HIT (intensity 8)
    //   Each frame: compute, print, decay
    //   Print SHAKE_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

int shakeIntensity = 0;
int maxIntensity = 0;
int triggerCount = 0;

void triggerShake(int intensity) {
    shakeIntensity = intensity;
    if (intensity > maxIntensity) maxIntensity = intensity;
    triggerCount++;
}

void computeShake(int &shakeX, int &shakeY) {
    if (shakeIntensity > 0) {
        shakeX = (rand() % (shakeIntensity * 2 + 1)) - shakeIntensity;
        shakeY = (rand() % (shakeIntensity * 2 + 1)) - shakeIntensity;
    } else {
        shakeX = 0;
        shakeY = 0;
    }
}

void decayShake() {
    shakeIntensity = (int)(shakeIntensity * 0.7);
}

int main() {
    srand(42);

    for (int frame = 1; frame <= 7; frame++) {
        if (frame == 2) triggerShake(4);
        if (frame == 5) triggerShake(8);

        int sx = 0, sy = 0;
        computeShake(sx, sy);

        if (frame == 2) {
            cout << "SHAKE|frame|" << frame << "|trigger|KILL|intensity|" << shakeIntensity
                 << "|offset|(" << sx << "," << sy << ")" << endl;
        } else if (frame == 5) {
            cout << "SHAKE|frame|" << frame << "|trigger|BOSS_HIT|intensity|" << shakeIntensity
                 << "|offset|(" << sx << "," << sy << ")" << endl;
        } else if (shakeIntensity > 0) {
            cout << "SHAKE|frame|" << frame << "|decay|intensity|" << shakeIntensity
                 << "|offset|(" << sx << "," << sy << ")" << endl;
        } else {
            cout << "SHAKE|frame|" << frame << "|intensity|0|offset|(0,0)" << endl;
        }

        decayShake();
    }

    cout << "SHAKE_SUMMARY|triggers|" << triggerCount
         << "|max_intensity|" << maxIntensity
         << "|decay_rate|0.7" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 2 kill trigger", expectedOutput: "SHAKE\\|frame\\|2\\|trigger\\|KILL\\|intensity\\|4\\|offset\\|\\(-?\\d+,-?\\d+\\)", isPattern: true },
    { id: "g2", description: "Frame 3 decay", expectedOutput: "SHAKE\\|frame\\|3\\|decay\\|intensity\\|2\\|offset\\|\\(-?\\d+,-?\\d+\\)", isPattern: true },
    { id: "g3", description: "Frame 5 boss hit", expectedOutput: "SHAKE\\|frame\\|5\\|trigger\\|BOSS_HIT\\|intensity\\|8\\|offset\\|\\(-?\\d+,-?\\d+\\)", isPattern: true },
    { id: "g4", description: "Shake summary", expectedOutput: "SHAKE_SUMMARY\\|triggers\\|2\\|max_intensity\\|8\\|decay_rate\\|0\\.7", isPattern: true },
  ],
  hints: [
    "triggerShake sets shakeIntensity and tracks maxIntensity and triggerCount. The trigger fires before computeShake so the new intensity is used immediately on the trigger frame.",
    "computeShake: when intensity is 0, set both offsets to 0 without calling rand(). This preserves the RNG sequence for subsequent frames. Only call rand() when intensity > 0.",
    "Decay happens after printing. So frame 2 prints intensity 4, then decays to 2. Frame 3 prints intensity 2, then decays to 1. The sequence is: compute, print, decay.",
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

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK };

int aiPattern[POOL_SIZE];

// Screen shake state
int shakeIntensity = 0;
int maxShakeIntensity = 0;
int shakeTriggersCount = 0;

void triggerShake(int intensity) {
    shakeIntensity = intensity;
    if (intensity > maxShakeIntensity) maxShakeIntensity = intensity;
    shakeTriggersCount++;
}

void computeShake(int &shakeX, int &shakeY) {
    if (shakeIntensity > 0) {
        shakeX = (rand() % (shakeIntensity * 2 + 1)) - shakeIntensity;
        shakeY = (rand() % (shakeIntensity * 2 + 1)) - shakeIntensity;
    } else {
        shakeX = 0;
        shakeY = 0;
    }
}

void decayShake() {
    shakeIntensity = (int)(shakeIntensity * 0.7);
}

struct WaveConfig {
    int enemyCount;
    string enemyType;
    string bossName;
};

struct BossVariant {
    string name;
    int bossHp;
    string pattern;
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

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] == 2) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void boundsSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < -50) alive[i] = false;
    }
}

void collisionSystem(int count) {
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
                    triggerShake(4);
                }
                score += 100;
                kills++;
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
    }
}

void renderSystem(int count, int camX, int camY) {
    int sx = 0, sy = 0;
    computeShake(sx, sy);
    camX += sx;
    camY += sy;

    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int scrX = worldToScreenX(x[i], camX);
        int scrY = worldToScreenY(y[i], camY);
        if (scrX >= 0 && scrX < SCREEN_W && scrY >= 0 && scrY < SCREEN_H) {
            if (type[i] == 0) grid[scrY][scrX] = 'P';
            else if (type[i] == 1) grid[scrY][scrX] = '|';
            else if (type[i] == 2) grid[scrY][scrX] = 'V';
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
        cout << endl;
    }

    decayShake();
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
    bulletCount = 0;
    replayLogSize = 0;
    playerSpeed = 4;
    playerDamage = 10;
    shakeIntensity = 0;
    maxShakeIntensity = 0;
    shakeTriggersCount = 0;
    srand(42);
}

int main() {
    srand(42);

    for (int frame = 1; frame <= 7; frame++) {
        if (frame == 2) triggerShake(4);
        if (frame == 5) triggerShake(8);

        int sx = 0, sy = 0;
        computeShake(sx, sy);

        if (frame == 2) {
            cout << "SHAKE|frame|" << frame << "|trigger|KILL|intensity|" << shakeIntensity
                 << "|offset|(" << sx << "," << sy << ")" << endl;
        } else if (frame == 5) {
            cout << "SHAKE|frame|" << frame << "|trigger|BOSS_HIT|intensity|" << shakeIntensity
                 << "|offset|(" << sx << "," << sy << ")" << endl;
        } else if (shakeIntensity > 0) {
            cout << "SHAKE|frame|" << frame << "|decay|intensity|" << shakeIntensity
                 << "|offset|(" << sx << "," << sy << ")" << endl;
        } else {
            cout << "SHAKE|frame|" << frame << "|intensity|0|offset|(0,0)" << endl;
        }

        decayShake();
    }

    cout << "SHAKE_SUMMARY|triggers|" << shakeTriggersCount
         << "|max_intensity|" << maxShakeIntensity
         << "|decay_rate|0.7" << endl;

    return 0;
}
`,
};
