import type { GameLessonVariant } from "@/types/game";

export const lesson48SpaceShooter: GameLessonVariant = {
  lessonId: "48-input-system",
  instructions: `# Input System — Without Abstraction, Every Key Change Is a Rewrite

Hardcoded key checks scatter input logic across every system. Movement checks \\\`'w'\\\`. Shooting checks \\\`' '\\\`. Pause checks \\\`'p'\\\`. Change the fire key and you hunt through every file. Add a gamepad and you duplicate every conditional. The code does not survive a control scheme change.

## What Breaks Without This

Without an input system, rebinding is impossible. Accessibility is impossible. Replay recording is impossible. Every system that reads raw keys is coupled to the physical keyboard layout. You cannot swap WASD for arrow keys without editing game logic. Input handling becomes a maintenance bottleneck.

## The Fix

One function maps raw characters to action enums. Game systems only see actions. \\\`mapInput('w')\\\` returns \\\`MOVE_UP\\\`. The game loop processes a buffer of characters, converts each to an action, and applies it to entity state. Movement and firing are table lookups, not scattered conditionals.

The input buffer is a string simulating keystrokes. Process it sequentially. Each character maps to exactly one action. Movement modifies player position. Fire spawns a bullet at the player location. The system is stateless — given the same buffer, it produces the same result.

## Your Task

1. Define Action enum: NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE
2. Write \\\`mapInput(char c)\\\` — maps w/a/s/d/space to actions
3. Player starts at x=180, y=300
4. Bullet pool: 10 slots with position and alive state
5. Input string (8 chars): \\\`"wwd  w d"\\\` — spaces are fire commands
6. For each input, map to action and apply:
   - MOVE_UP: y -= 4, MOVE_DOWN: y += 4, MOVE_LEFT: x -= 4, MOVE_RIGHT: x += 4
   - FIRE: spawn bullet at player position
7. Print movement: \\\`INPUT|<char>|action|<ACTION>|player_pos|<x>,<y>\\\`
8. Print fire: \\\`INPUT| |action|FIRE|bullet_spawned|bullet_<n>|at|<x>,<y>\\\`
9. Print: \\\`INPUT_SUMMARY|moves|<m>|fires|<f>|player_final|<x>,<y>\\\`

## Beginner Trap

**Common Mistake:** Printing position before applying movement. The output must show where the player IS after the move, not where they were. Apply the delta first, then print.

## Elite Insight

Professional input systems timestamp every action. When running at variable frame rates, you need to know exactly when within the frame an input arrived. At 240 FPS you have 4ms per frame. A buffered input with a timestamp lets the physics system interpolate correctly. This is critical for fighting games where 1-frame precision determines combos.

## Cross-Path Echo

Event-driven architectures work the same way. In web servers, raw HTTP bytes are parsed into request objects. Route handlers never see TCP packets — they see structured requests. The abstraction layer (input mapper / HTTP parser) exists so the business logic (game systems / route handlers) remain clean.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };

// TODO: Write mapInput(char c)

// TODO: Write actionName(Action a)

int main() {
    int playerX = 180;
    int playerY = 300;

    const int MAX_BULLETS = 10;
    int bulletX[MAX_BULLETS];
    int bulletY[MAX_BULLETS];
    bool bulletAlive[MAX_BULLETS];
    int nextBullet = 0;

    for (int i = 0; i < MAX_BULLETS; i++) bulletAlive[i] = false;

    string inputs = "wwd  w d";

    int moves = 0;
    int fires = 0;

    // TODO: Process each input character
    //   Map to action
    //   Apply movement or spawn bullet
    //   Print INPUT line with appropriate format

    // TODO: Print INPUT_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

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

string actionName(Action a) {
    switch (a) {
        case MOVE_UP: return "MOVE_UP";
        case MOVE_DOWN: return "MOVE_DOWN";
        case MOVE_LEFT: return "MOVE_LEFT";
        case MOVE_RIGHT: return "MOVE_RIGHT";
        case FIRE: return "FIRE";
        default: return "NONE";
    }
}

int main() {
    int playerX = 180;
    int playerY = 300;

    const int MAX_BULLETS = 10;
    int bulletX[MAX_BULLETS];
    int bulletY[MAX_BULLETS];
    bool bulletAlive[MAX_BULLETS];
    int nextBullet = 0;

    for (int i = 0; i < MAX_BULLETS; i++) bulletAlive[i] = false;

    string inputs = "wwd  w d";

    int moves = 0;
    int fires = 0;

    for (int i = 0; i < (int)inputs.size(); i++) {
        Action a = mapInput(inputs[i]);
        if (a == MOVE_UP) { playerY -= 4; moves++; }
        else if (a == MOVE_DOWN) { playerY += 4; moves++; }
        else if (a == MOVE_LEFT) { playerX -= 4; moves++; }
        else if (a == MOVE_RIGHT) { playerX += 4; moves++; }
        else if (a == FIRE) { fires++; }

        if (a != FIRE && a != NONE) {
            string displayChar = string(1, inputs[i]);
            cout << "INPUT|" << displayChar << "|action|" << actionName(a)
                 << "|player_pos|" << playerX << "," << playerY << endl;
        } else if (a == FIRE) {
            bulletX[nextBullet] = playerX;
            bulletY[nextBullet] = playerY;
            bulletAlive[nextBullet] = true;
            cout << "INPUT| |action|FIRE|bullet_spawned|bullet_" << nextBullet
                 << "|at|" << playerX << "," << playerY << endl;
            nextBullet++;
        }
    }

    cout << "INPUT_SUMMARY|moves|" << moves << "|fires|" << fires
         << "|player_final|" << playerX << "," << playerY << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "First w moves player to (180,296)", expectedOutput: "INPUT\\|w\\|action\\|MOVE_UP\\|player_pos\\|180,296", isPattern: true },
    { id: "g2", description: "Second w moves player to (180,292)", expectedOutput: "INPUT\\|w\\|action\\|MOVE_UP\\|player_pos\\|180,292", isPattern: true },
    { id: "g3", description: "d moves player right", expectedOutput: "INPUT\\|d\\|action\\|MOVE_RIGHT\\|player_pos\\|\\d+,\\d+", isPattern: true },
    { id: "g4", description: "Space spawns bullet", expectedOutput: "INPUT\\| \\|action\\|FIRE\\|bullet_spawned\\|bullet_\\d+\\|at\\|\\d+,\\d+", isPattern: true },
    { id: "g5", description: "Summary reports moves and fires", expectedOutput: "INPUT_SUMMARY\\|moves\\|\\d+\\|fires\\|\\d+\\|player_final\\|\\d+,\\d+", isPattern: true },
  ],
  hints: [
    "Input string is 'wwd  w d' — 8 characters. 'w','w','d' are moves, two spaces are fires, 'w' is a move, space is fire, 'd' is a move. That is 5 moves and 3 fires.",
    "Apply movement before printing. First 'w': playerY = 300 - 4 = 296. Second 'w': playerY = 296 - 4 = 292. Then 'd': playerX = 180 + 4 = 184.",
    "For FIRE, use nextBullet as the bullet index. Store playerX and playerY into the bullet arrays, set alive to true, print, then increment nextBullet.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 600;
const int FIXED_DT = 16;

int x[POOL_SIZE];
int y[POOL_SIZE];
int vx[POOL_SIZE];
int vy[POOL_SIZE];
int hp[POOL_SIZE];
int type[POOL_SIZE];
bool alive[POOL_SIZE];

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

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

string actionName(Action a) {
    switch (a) {
        case MOVE_UP: return "MOVE_UP";
        case MOVE_DOWN: return "MOVE_DOWN";
        case MOVE_LEFT: return "MOVE_LEFT";
        case MOVE_RIGHT: return "MOVE_RIGHT";
        case FIRE: return "FIRE";
        default: return "NONE";
    }
}

int spawnFromPool(int px, int py, int vel, int ehp, int etype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = 0;
    vy[idx] = vel;
    hp[idx] = ehp;
    type[idx] = etype;
    alive[idx] = true;
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

void formationSystem(int count, int step) {
    int offsets[] = {0, 10, 0, -10, 0};
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        x[i] += offsets[(i + step) % 5];
    }
}

void boundsSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < 0) {
            alive[i] = false;
        }
    }
}

int collisionSystem(int count) {
    int checks = 0;
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            checks++;
            bool overlapX = x[b] < x[e] + 18 && x[b] + 6 > x[e];
            bool overlapY = y[b] < y[e] + 18 && y[b] + 6 > y[e];
            if (overlapX && overlapY) {
                hp[b] = 0;
                hp[e]--;
                break;
            }
        }
    }
    return checks;
}

void cleanupSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
        }
    }
}

int countByType(int count, int typeVal) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && type[i] == typeVal) c++;
    }
    return c;
}

void processInput(string inputs, int& playerIdx, int count) {
    for (int i = 0; i < (int)inputs.size(); i++) {
        Action a = mapInput(inputs[i]);
        if (a == MOVE_UP) y[playerIdx] -= 4;
        else if (a == MOVE_DOWN) y[playerIdx] += 4;
        else if (a == MOVE_LEFT) x[playerIdx] -= 4;
        else if (a == MOVE_RIGHT) x[playerIdx] += 4;
        else if (a == FIRE) {
            spawnFromPool(x[playerIdx], y[playerIdx], -16, 1, 1);
        }
    }
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    // Player entity at index 0
    int playerIdx = spawnFromPool(180, 300, 0, 100, 0);
    int count = 1;

    // Spawn enemies
    for (int i = 0; i < 5; i++) {
        spawnFromPool(80 + i * 40, 60, 4, 3, 2);
        count++;
    }

    // Spawn bullets
    for (int i = 0; i < 5; i++) {
        spawnFromPool(200, 300 - i * 4, -16, 1, 1);
        count++;
    }

    // Process input buffer
    string inputBuffer = "wwd  w d";
    processInput(inputBuffer, playerIdx, count);

    // Fixed timestep simulation
    int accumulator = 0;
    int totalSteps = 0;
    int frameTimes[] = {16, 32, 16};

    for (int f = 0; f < 3; f++) {
        accumulator += frameTimes[f];
        int stepsThisFrame = 0;
        while (accumulator >= FIXED_DT) {
            movementSystem(count);
            formationSystem(count, totalSteps + 1);
            boundsSystem(count);
            collisionSystem(count);
            cleanupSystem(count);
            accumulator -= FIXED_DT;
            stepsThisFrame++;
            totalSteps++;
        }
        int bullets = countByType(count, 1);
        int enemies = countByType(count, 2);
        cout << "FRAME|" << (f + 1) << "|steps|" << stepsThisFrame
             << "|bullets|" << bullets << "|enemies|" << enemies << endl;
    }

    cout << "PIPELINE|input|spawn|movement|formation|bounds|collision|cleanup" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
