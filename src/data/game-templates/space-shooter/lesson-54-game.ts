import type { GameLessonVariant } from "@/types/game";

export const lesson54SpaceShooter: GameLessonVariant = {
  lessonId: "54-hit-flash",
  instructions: `# Hit Flash — Damage Without Feedback Is Invisible

A bullet hits an enemy. The HP decrements. Nothing visible changes. The player has no confirmation the shot landed. Hit flash fixes this with the cheapest possible visual feedback: swap the sprite for a few frames. The entity becomes \\\`X\\\` for 3 ticks, then restores to \\\`v\\\`. Three frames at 60fps is 50ms — fast enough to feel instant, long enough to see.

## What Breaks Without This

Without hit flash, your game feels unresponsive. Players cannot distinguish between a miss and a hit. They fire more bullets than necessary because they never got confirmation. Worse, they assume the game is bugged. Every commercial shooter has hit markers, flash effects, or damage numbers. Flash is the minimum viable version.

## The Fix

A \\\`flashTimer\\\` per entity. Zero means normal. Positive means flashing. On hit: set timer to 3, swap sprite. Each tick: decrement all positive timers. When a timer hits zero, restore the sprite. This is a state machine with two states and a timer-driven transition:

\\\`\\\`\\\`
NORMAL (flashTimer == 0, sprite == 'v')
  -> on hit -> FLASHING (flashTimer = 3, sprite = 'X')
  -> each tick -> flashTimer--
  -> flashTimer == 0 -> NORMAL (sprite = 'v')
\\\`\\\`\\\`

## Your Task

1. Add \\\`flashTimer\\\` and \\\`sprite\\\` arrays to the entity pool
2. Init 3 enemies: sprite='v', flashTimer=0
3. At tick 2: hit enemy_1 — flashTimer=3, sprite='X'
4. Run flashSystem each tick after the hit
5. Print: \\\`FLASH|tick|2|enemy_1|start|sprite|X|timer|3\\\`
6. Print: \\\`FLASH|tick|3|enemy_1|active|sprite|X|timer|2\\\`
7. Print: \\\`FLASH|tick|4|enemy_1|active|sprite|X|timer|1\\\`
8. Print: \\\`FLASH|tick|5|enemy_1|end|sprite|v|timer|0\\\`
9. Print: \\\`RENDER|tick|2|enemy_1|X\\\`
10. Print: \\\`RENDER|tick|5|enemy_1|v\\\`
11. Print: \\\`FLASH_SUMMARY|entity|enemy_1|duration|3|restored|true\\\`

## Beginner Trap

**Common Mistake:** Running flashSystem on the same tick as the hit. The timer goes from 3 to 2 immediately, so the flash only lasts 2 visible ticks instead of 3. Apply the hit, then wait until the next tick to start decrementing.

## Elite Insight

Production engines use a \\\`VisualState\\\` component with multiple overlapping effects: flash, tint, outline, scale pulse. Each has its own timer. The flash system generalizes to any timed visual override. The data layout is identical: parallel arrays of timers and target values.

## Cross-Path Echo

CSS transitions work the same way. \\\`transition: background-color 0.3s\\\` sets a timer-based state change. The browser interpolates between start and end values over the duration. Your flash system is a discrete version of the same concept — instant swap with a timed restore.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 3;
char sprite[MAX_ENTITIES];
int flashTimer[MAX_ENTITIES];
string names[] = {"enemy_0", "enemy_1", "enemy_2"};

// TODO: Write flashSystem(count) — for each entity:
//   if flashTimer[i] > 0, decrement
//   if flashTimer[i] reaches 0, restore sprite to 'v'

int main() {
    for (int i = 0; i < MAX_ENTITIES; i++) {
        sprite[i] = 'v';
        flashTimer[i] = 0;
    }

    // TODO: Simulate ticks 1-6
    //   At tick 2: hit enemy_1 (flashTimer=3, sprite='X')
    //   Print FLASH and RENDER lines per specification
    //   Run flashSystem each tick after the hit

    // TODO: Print FLASH_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 3;
char sprite[MAX_ENTITIES];
int flashTimer[MAX_ENTITIES];
string names[] = {"enemy_0", "enemy_1", "enemy_2"};

void flashSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (flashTimer[i] > 0) {
            flashTimer[i]--;
            if (flashTimer[i] == 0) {
                sprite[i] = 'v';
            }
        }
    }
}

int main() {
    for (int i = 0; i < MAX_ENTITIES; i++) {
        sprite[i] = 'v';
        flashTimer[i] = 0;
    }

    for (int tick = 1; tick <= 6; tick++) {
        if (tick == 2) {
            flashTimer[1] = 3;
            sprite[1] = 'X';
            cout << "FLASH|tick|2|enemy_1|start|sprite|X|timer|3" << endl;
            cout << "RENDER|tick|2|enemy_1|X" << endl;
        }

        if (tick > 2) {
            int prevTimer = flashTimer[1];
            flashSystem(MAX_ENTITIES);
            if (prevTimer > 0) {
                if (flashTimer[1] > 0) {
                    cout << "FLASH|tick|" << tick << "|enemy_1|active|sprite|X|timer|" << flashTimer[1] << endl;
                } else {
                    cout << "FLASH|tick|" << tick << "|enemy_1|end|sprite|v|timer|0" << endl;
                    cout << "RENDER|tick|5|enemy_1|v" << endl;
                }
            }
        }
    }

    cout << "FLASH_SUMMARY|entity|enemy_1|duration|3|restored|true" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Flash starts on hit at tick 2", expectedOutput: "FLASH\\|tick\\|2\\|enemy_1\\|start\\|sprite\\|X\\|timer\\|3", isPattern: true },
    { id: "g2", description: "Render shows flash sprite at tick 2", expectedOutput: "RENDER\\|tick\\|2\\|enemy_1\\|X", isPattern: true },
    { id: "g3", description: "Flash active during countdown", expectedOutput: "FLASH\\|tick\\|\\d+\\|enemy_1\\|active\\|sprite\\|X\\|timer\\|\\d+", isPattern: true },
    { id: "g4", description: "Flash ends with sprite restore", expectedOutput: "FLASH\\|tick\\|5\\|enemy_1\\|end\\|sprite\\|v\\|timer\\|0", isPattern: true },
    { id: "g5", description: "Render shows restored sprite", expectedOutput: "RENDER\\|tick\\|5\\|enemy_1\\|v", isPattern: true },
    { id: "g6", description: "Flash summary confirms restore", expectedOutput: "FLASH_SUMMARY\\|entity\\|enemy_1\\|duration\\|3\\|restored\\|true", isPattern: true },
  ],
  hints: [
    "Hit at tick 2 sets flashTimer[1]=3. FlashSystem starts running at tick 3. Timer: 3->2 (tick 3), 2->1 (tick 4), 1->0 (tick 5). Sprite restores at tick 5.",
    "Save the previous timer value before calling flashSystem. Compare before/after to determine if you should print 'active' or 'end'.",
    "RENDER lines only print at tick 2 (sprite='X') and tick 5 (sprite='v'). These are the two moments where the visual state changes.",
  ],
  accumulatedCode: `#include <iostream>
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
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int flashTimer[POOL_SIZE];
char sprite[POOL_SIZE];

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };

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

int spawnFromPool(int px, int py, int pvx, int pvy, int php, int ptype, char psprite) {
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
    flashTimer[idx] = 0;
    sprite[idx] = psprite;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void flashSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (flashTimer[i] > 0) {
            flashTimer[i]--;
            if (flashTimer[i] == 0) {
                sprite[i] = (type[i] == 2) ? 'V' : sprite[i];
            }
        }
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
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                hp[b] = 0;
                hp[e]--;
                score += 100;
                kills++;
                flashTimer[e] = 3;
                sprite[e] = 'X';
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

int worldToScreenX(int wx, int camX) {
    return (wx - camX) * SCREEN_W / VIEW_W;
}

int worldToScreenY(int wy, int camY) {
    return (wy - camY) * SCREEN_H / VIEW_H;
}

void processInput(char input, int playerIdx) {
    Action a = mapInput(input);
    if (a == MOVE_UP) y[playerIdx] -= 4;
    else if (a == MOVE_DOWN) y[playerIdx] += 4;
    else if (a == MOVE_LEFT) x[playerIdx] -= 4;
    else if (a == MOVE_RIGHT) x[playerIdx] += 4;
    else if (a == FIRE) {
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1, '|');
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
            grid[sy][sx] = sprite[i];
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
        cout << endl;
    }
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0, 'P');

    spawnFromPool(100, 40, 0, 4, 1, 2, 'V');
    spawnFromPool(180, 40, 0, 4, 1, 2, 'V');
    spawnFromPool(260, 40, 0, 4, 1, 2, 'V');
    int count = 4;

    string frameInputs[] = {"w", " ", "w", "d", "w"};

    for (int frame = 1; frame <= 5; frame++) {
        processInput(frameInputs[frame - 1][0], playerIdx);
        if (POOL_SIZE - freeCount > count) count = POOL_SIZE - freeCount;

        movementSystem(count);
        collisionSystem(count);
        flashSystem(count);
        cleanupSystem(count);

        int camX = x[playerIdx] - VIEW_W / 2;
        int camY = y[playerIdx] - VIEW_H / 2;

        cout << "FRAME|" << frame << "|score|" << score << "|kills|" << kills << endl;
    }

    cout << "SCORE|" << score << endl;
    return 0;
}
`,
};
