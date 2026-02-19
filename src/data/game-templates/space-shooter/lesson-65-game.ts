import type { GameLessonVariant } from "@/types/game";

export const lesson65SpaceShooter: GameLessonVariant = {
  lessonId: "65-boss-phases",
  instructions: `# Boss Phase System — The Fight That Evolves

Boss starts calm. One shot per frame. Slow movement. Then it drops below 75% HP and everything changes. Three-spread shots. Double speed. Below 25% HP: enraged. Five-spread, quadruple speed. The player who was coasting suddenly has to dodge, reposition, and fight for survival. This is what makes boss fights memorable.

## What Breaks Without This

A phaseless boss is a health bar countdown. The player watches a number decrease. Nothing surprises them. Nothing forces adaptation. Phases create narrative within combat. Phase 1 teaches the pattern. Phase 2 punishes complacency. Phase 3 tests mastery. Three acts in one encounter.

## The Fix

State integer. Threshold checks after damage. Behavior lookup arrays indexed by phase:

\\\`\\\`\\\`
// phase -> speed
int phaseSpeed[] = {0, 1, 2, 4};
// phase -> shot count
int phaseShots[] = {0, 1, 3, 5};

// After damage:
if (hp <= 75) phase = 3;
else if (hp <= 150) phase = 2;
else phase = 1;
\\\`\\\`\\\`

## Your Task

1. Boss: 200hp, starts phase 1
2. Phase 1 (hp > 150): speed=1, shots=1
3. Phase 2 (75 < hp <= 150): speed=2, shots=3 (3-spread)
4. Phase 3 (hp <= 75): speed=4, shots=5 (5-spread), enraged
5. Boss takes 50 damage per frame for 4 frames
6. Print per frame:
   - \\\`BOSS_PHASE|frame|1|hp|150|phase|2|speed|2|shots|3|TRANSITION\\\`
   - \\\`BOSS_PHASE|frame|2|hp|100|phase|2|speed|2|shots|3\\\`
   - \\\`BOSS_PHASE|frame|3|hp|50|phase|3|speed|4|shots|5|TRANSITION\\\`
   - \\\`BOSS_PHASE|frame|4|hp|0|phase|3|speed|4|shots|5|DEFEATED\\\`
7. Print: \\\`BOSS_PHASES_SUMMARY|phases_entered|3|transitions|2\\\`

## Beginner Trap

**Common Mistake:** Checking transitions with == instead of thresholds. If damage skips a value (boss goes from 80 to 30), a check for \\\`hp == 75\\\` misses the transition entirely. Always use <= or < comparisons against thresholds, not equality checks.

## Elite Insight

Commercial boss fights encode phase behavior in data tables, not if-else chains. A boss config file lists: phase number, HP threshold, movement pattern ID, attack pattern ID, sprite animation ID. The boss system reads the table and applies the current phase's row. Adding a phase means adding a row, not adding code. Your lookup arrays are the first step toward this architecture.

## Cross-Path Echo

Feature flags in deployment work the same way. At certain user counts (thresholds), you enable new features (phases). Under 1000 users: basic mode. Under 10000: add caching. Over 10000: add sharding. The system checks the threshold and activates the appropriate configuration. Your boss phases are feature flags for combat behavior.`,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    int bossHp = 200;
    int bossMaxHp = 200;
    int phase = 1;
    int transitions = 0;
    int phasesEntered = 1;
    int damagePerFrame = 50;

    // Phase behavior tables
    int phaseSpeed[] = {0, 1, 2, 4};
    int phaseShots[] = {0, 1, 3, 5};

    // TODO: Run 4 frames
    //   Each frame: apply damage, check phase thresholds
    //   hp > 150: phase 1
    //   75 < hp <= 150: phase 2
    //   hp <= 75: phase 3
    //   Print BOSS_PHASE line with |TRANSITION or |DEFEATED as needed

    // TODO: Print BOSS_PHASES_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int bossHp = 200;
    int bossMaxHp = 200;
    int phase = 1;
    int transitions = 0;
    int phasesEntered = 1;
    int damagePerFrame = 50;

    int phaseSpeed[] = {0, 1, 2, 4};
    int phaseShots[] = {0, 1, 3, 5};

    for (int frame = 1; frame <= 4; frame++) {
        bossHp -= damagePerFrame;
        if (bossHp < 0) bossHp = 0;

        int newPhase;
        if (bossHp <= 75) newPhase = 3;
        else if (bossHp <= 150) newPhase = 2;
        else newPhase = 1;

        bool transitioned = (newPhase != phase);
        if (transitioned) {
            transitions++;
            phasesEntered++;
            phase = newPhase;
        }

        cout << "BOSS_PHASE|frame|" << frame
             << "|hp|" << bossHp
             << "|phase|" << phase
             << "|speed|" << phaseSpeed[phase]
             << "|shots|" << phaseShots[phase];

        if (bossHp <= 0) cout << "|DEFEATED";
        else if (transitioned) cout << "|TRANSITION";

        cout << endl;
    }

    cout << "BOSS_PHASES_SUMMARY|phases_entered|" << phasesEntered
         << "|transitions|" << transitions << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1 transitions to phase 2", expectedOutput: "BOSS_PHASE\\|frame\\|1\\|hp\\|150\\|phase\\|2\\|speed\\|2\\|shots\\|3\\|TRANSITION", isPattern: true },
    { id: "g2", description: "Frame 2 stays in phase 2", expectedOutput: "BOSS_PHASE\\|frame\\|2\\|hp\\|100\\|phase\\|2\\|speed\\|2\\|shots\\|3$", isPattern: true },
    { id: "g3", description: "Frame 3 enters phase 3 enraged", expectedOutput: "BOSS_PHASE\\|frame\\|3\\|hp\\|50\\|phase\\|3\\|speed\\|4\\|shots\\|5\\|TRANSITION", isPattern: true },
    { id: "g4", description: "Frame 4 boss defeated", expectedOutput: "BOSS_PHASE\\|frame\\|4\\|hp\\|0\\|phase\\|3\\|speed\\|4\\|shots\\|5\\|DEFEATED", isPattern: true },
    { id: "g5", description: "Summary shows phases and transitions", expectedOutput: "BOSS_PHASES_SUMMARY\\|phases_entered\\|3\\|transitions\\|2", isPattern: true },
  ],
  hints: [
    "Apply damage first: 200-50=150. Then check thresholds. 150 <= 150 is true, so phase 2. Compare with old phase (1) — different, so it is a transition.",
    "Frame 3: 100-50=50. Check: 50 <= 75 is true, so phase 3. Phase changed from 2 to 3 — transition. Frame 4: 50-50=0. Still phase 3 (0 <= 75). No transition, but DEFEATED.",
    "Use lookup arrays for speed and shots: phaseSpeed[phase] and phaseShots[phase]. Index 1 gives phase 1 values, index 2 gives phase 2, index 3 gives phase 3.",
  ],
  accumulatedCode: `#include <iostream>
#include <cmath>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int FIXED_DT = 16;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], maxHp[POOL_SIZE];
int type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;

double enemyPhase[10];
int enemyPhaseCount = 0;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK, AI_ZIGZAG, AI_STRAIGHT };

int aiPattern[POOL_SIZE];
char spriteChar[POOL_SIZE];
int entityW[POOL_SIZE], entityH[POOL_SIZE];

// Archetype table
string archNames[] = {"basic", "fast", "tank"};
int archHp[] = {30, 15, 80};
int archSpeed[] = {2, 4, 1};
char archSprite[] = {'v', '>', '#'};
int archAi[] = {AI_LINEAR, AI_ZIGZAG, AI_STRAIGHT};

// Boss phase tables
int bossPhaseSpeed[] = {0, 1, 2, 4};
int bossPhaseShots[] = {0, 1, 3, 5};
int bossPhaseThresholds[] = {0, 150, 75, 0}; // phase transitions at these HP values
int bossCurrentPhase = 1;
int bossTransitions = 0;

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

int spawnFromPool(int px, int py, int pvx, int pvy, int php, int ptype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = pvx;
    vy[idx] = pvy;
    hp[idx] = php;
    maxHp[idx] = php;
    type[idx] = ptype;
    alive[idx] = true;
    aiPattern[idx] = AI_LINEAR;
    spriteChar[idx] = (ptype == 0) ? 'P' : (ptype == 1) ? '|' : 'V';
    entityW[idx] = 16;
    entityH[idx] = 16;
    return idx;
}

int spawnArchetype(int archIdx, int px, int py) {
    int idx = spawnFromPool(px, py, 0, archSpeed[archIdx], archHp[archIdx], 2);
    if (idx >= 0) {
        aiPattern[idx] = archAi[archIdx];
        spriteChar[idx] = archSprite[archIdx];
    }
    return idx;
}

int spawnBoss(int px, int py, int bossHp, int bw, int bh) {
    int idx = spawnFromPool(px, py, 0, 0, bossHp, 3);
    if (idx >= 0) {
        spriteChar[idx] = 'W';
        entityW[idx] = bw;
        entityH[idx] = bh;
    }
    bossCurrentPhase = 1;
    bossTransitions = 0;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

string buildHealthBar(int currentHp, int mHp) {
    int filled = currentHp * 10 / mHp;
    string bar = "";
    for (int i = 0; i < 10; i++) {
        bar += (i < filled) ? '=' : '.';
    }
    return bar;
}

int updateBossPhase(int bossHpNow) {
    int newPhase;
    if (bossHpNow <= 75) newPhase = 3;
    else if (bossHpNow <= 150) newPhase = 2;
    else newPhase = 1;

    if (newPhase != bossCurrentPhase) {
        bossTransitions++;
        bossCurrentPhase = newPhase;
    }
    return bossCurrentPhase;
}

void sineWaveSystem(int count, int tick) {
    int ei = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        if (aiPattern[i] == AI_SINE && ei < enemyPhaseCount) {
            x[i] = 200 + (int)(40 * sin(tick * 0.5 + enemyPhase[ei]));
            y[i] += 4;
        }
        if (type[i] == 2) ei++;
    }
}

void targetSystem(int count, int playerIdx) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        if (aiPattern[i] != AI_TRACK) continue;
        int dx = x[playerIdx] - x[i];
        if (dx > 0) x[i] += 2;
        else if (dx < 0) x[i] -= 2;
        y[i] += 4;
    }
}

void zigzagSystem(int count, int tick) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        if (aiPattern[i] != AI_ZIGZAG) continue;
        y[i] += vy[i];
        x[i] += (tick % 2 == 0) ? 15 : -15;
    }
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] == 2) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        if (aiPattern[i] == AI_LINEAR || aiPattern[i] == AI_STRAIGHT) {
            y[i] += vy[i];
        }
    }
}

void bossMovementSystem(int count, int bossPhase) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 3) continue;
        x[i] += bossPhaseSpeed[bossPhase];
    }
}

void boundsSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < 0) alive[i] = false;
    }
}

void collisionSystem(int count) {
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || (type[e] != 2 && type[e] != 3)) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            int hitW = entityW[e] / 2 + 8;
            int hitH = entityH[e] / 2 + 8;
            if (dx < hitW && dy < hitH) {
                hp[b] = 0;
                hp[e] -= playerDamage;
                score += 100;
                kills++;
                if (type[e] == 3) {
                    updateBossPhase(hp[e]);
                }
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
            grid[sy][sx] = spriteChar[i];
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

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    string puDefs[] = {"speed_boost,300,2", "damage_up,200,15", "shield,150,1", "spread_shot,100,5"};
    for (int i = 0; i < 4; i++) {
        parsePowerUp(puDefs[i], powerupDefs[numPowerupDefs++]);
    }

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);

    // Spawn boss with phases
    int bossIdx = spawnBoss(170, 40, 200, 60, 40);
    int bossMaxHpVal = 200;
    int damagePerFrame = 50;

    int count = POOL_SIZE;

    for (int frame = 1; frame <= 4; frame++) {
        // Boss takes damage
        if (alive[bossIdx]) {
            hp[bossIdx] -= damagePerFrame;
            if (hp[bossIdx] < 0) hp[bossIdx] = 0;

            int oldPhase = bossCurrentPhase;
            updateBossPhase(hp[bossIdx]);
            bool transitioned = (bossCurrentPhase != oldPhase);

            cout << "BOSS_PHASE|frame|" << frame
                 << "|hp|" << hp[bossIdx]
                 << "|phase|" << bossCurrentPhase
                 << "|speed|" << bossPhaseSpeed[bossCurrentPhase]
                 << "|shots|" << bossPhaseShots[bossCurrentPhase];

            if (hp[bossIdx] <= 0) {
                cout << "|DEFEATED";
                alive[bossIdx] = false;
            } else if (transitioned) {
                cout << "|TRANSITION";
            }

            cout << endl;
        }
    }

    cout << "BOSS_PHASES_SUMMARY|phases_entered|" << (bossTransitions + 1)
         << "|transitions|" << bossTransitions << endl;

    return 0;
}
`,
};
