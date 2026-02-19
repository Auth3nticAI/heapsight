import type { GameLessonVariant } from "@/types/game";

export const lesson36SpaceShooter: GameLessonVariant = {
  lessonId: "36-fixed-timestep",
  instructions: `# Fixed Timestep Loop — Variable Frames Destroy Determinism

Your game loop runs as fast as the OS lets it. One frame takes 16ms. The next takes 32ms because the OS scheduled a background task. If you move bullets by velocity-per-frame, the 32ms frame moves them twice as far. Collision misses. Enemies phase through walls. Physics diverges between machines. The game is non-deterministic. Ship this and every bug report is unreproducible.

## What Breaks Without This

A bullet at velocity -8 per update. At 60fps (16ms frames), it moves 480 pixels per second. At 30fps (32ms frames, same velocity-per-frame), it moves 240 pixels per second. The bullet is half as fast on a slower machine. Enemies that should die survive. Patterns that should be dodgeable are not. The game plays differently on every machine.

## The Fix

Decouple simulation from rendering. Define a fixed timestep — 16ms. Accumulate real elapsed time. Run simulation steps at the fixed interval. A 32ms frame runs two 16ms steps. A 16ms frame runs one. Total simulation time is identical regardless of frame rate variation.

The accumulator pattern is three lines of logic:

\\\`\\\`\\\`
accumulator += elapsed;
while (accumulator >= FIXED_DT) {
    updateSimulation();
    accumulator -= FIXED_DT;
}
\\\`\\\`\\\`

Every shipped game engine uses this. Unreal, Unity, Godot — all of them. The fixed timestep is the boundary between the chaotic real world (variable frame times) and the deterministic simulation (fixed steps).

## Your Task

1. Define \\\`FIXED_DT = 16\\\` and set up SoA arrays for 5 bullets: \\\`x[]\\\`, \\\`y[]\\\`, \\\`vy[]\\\`, \\\`alive[]\\\`
2. Initialize all bullets at y=300, vy=-8, alive=true
3. Simulate 3 frames with elapsed times: 16ms, 32ms, 16ms
4. Use the accumulator pattern. Each step calls \\\`updateBullets()\\\` which adds vy to y for all alive bullets
5. After each frame print: \\\`TIMESTEP|frame|<n>|elapsed|<ms>|steps|<count>|bullet_y|<y[0]>\\\`
6. After all frames: \\\`DETERMINISTIC|total_steps|4|final_y|268|frame_independent|true\\\`
7. Print \\\`SCORE|0\\\`

## Beginner Trap

**Common Mistake:** Using \\\`if\\\` instead of \\\`while\\\` for the accumulator check. A 32ms frame needs two steps at 16ms fixed DT. An \\\`if\\\` only runs one step and leaks 16ms of accumulated time. Always use \\\`while\\\`.

## Elite Insight

The leftover accumulator after the while loop is your interpolation alpha. If accumulator = 8ms after processing, you are 50% of the way to the next step. Multiply that fraction by velocity to interpolate render positions between simulation states. This eliminates visual stutter at any frame rate. Every AAA engine does this.

## Cross-Path Echo

Financial trading systems use the same pattern. Market data arrives at irregular intervals. The risk engine runs at fixed time steps. An accumulator buffers incoming events and processes them in deterministic batches. Same problem, same solution, different domain.`,
  starterCode: `#include <iostream>
using namespace std;

const int FIXED_DT = 16;
const int BULLET_COUNT = 5;

int x[BULLET_COUNT];
int y[BULLET_COUNT];
int vy[BULLET_COUNT];
bool alive[BULLET_COUNT];

// TODO: Write initBullets() — set all bullets to x=200, y=300, vy=-8, alive=true

// TODO: Write updateBullets() — for each alive bullet, y += vy

int main() {
    // TODO: Initialize bullets

    int accumulator = 0;
    int totalSteps = 0;
    int frameTimes[] = {16, 32, 16};

    // TODO: Loop through 3 frames
    //   - Add frameTime to accumulator
    //   - While accumulator >= FIXED_DT: updateBullets(), subtract FIXED_DT
    //   - Print TIMESTEP|frame|<n>|elapsed|<ms>|steps|<count>|bullet_y|<y[0]>

    // TODO: Print DETERMINISTIC summary
    // TODO: Print SCORE|0

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int FIXED_DT = 16;
const int BULLET_COUNT = 5;

int x[BULLET_COUNT];
int y[BULLET_COUNT];
int vy[BULLET_COUNT];
bool alive[BULLET_COUNT];

void initBullets() {
    for (int i = 0; i < BULLET_COUNT; i++) {
        x[i] = 200;
        y[i] = 300;
        vy[i] = -8;
        alive[i] = true;
    }
}

void updateBullets() {
    for (int i = 0; i < BULLET_COUNT; i++) {
        if (alive[i]) {
            y[i] += vy[i];
        }
    }
}

int main() {
    initBullets();

    int accumulator = 0;
    int totalSteps = 0;
    int frameTimes[] = {16, 32, 16};

    for (int f = 0; f < 3; f++) {
        accumulator += frameTimes[f];
        int stepsThisFrame = 0;
        while (accumulator >= FIXED_DT) {
            updateBullets();
            accumulator -= FIXED_DT;
            stepsThisFrame++;
            totalSteps++;
        }
        cout << "TIMESTEP|frame|" << (f + 1) << "|elapsed|" << frameTimes[f]
             << "|steps|" << stepsThisFrame << "|bullet_y|" << y[0] << endl;
    }

    cout << "DETERMINISTIC|total_steps|" << totalSteps << "|final_y|" << y[0]
         << "|frame_independent|true" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1: 16ms elapsed, 1 step, bullet at y=292", expectedOutput: "TIMESTEP|frame|1|elapsed|16|steps|1|bullet_y|292" },
    { id: "g2", description: "Frame 2: 32ms elapsed, 2 steps, bullet at y=276", expectedOutput: "TIMESTEP|frame|2|elapsed|32|steps|2|bullet_y|276" },
    { id: "g3", description: "Frame 3: 16ms elapsed, 1 step, bullet at y=268", expectedOutput: "TIMESTEP|frame|3|elapsed|16|steps|1|bullet_y|268" },
    { id: "g4", description: "Should confirm deterministic simulation", expectedOutput: "DETERMINISTIC|total_steps|4|final_y|268|frame_independent|true" },
    { id: "g5", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "initBullets: loop 0 to BULLET_COUNT, set x[i]=200, y[i]=300, vy[i]=-8, alive[i]=true.",
    "The accumulator pattern uses `while`, not `if`. A 32ms frame at 16ms FIXED_DT runs two update steps.",
    "After 4 total steps: y = 300 + (4 * -8) = 268. The frame time distribution does not affect the final position.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 600;
const int FIXED_DT = 16;

int x[POOL_SIZE];
int y[POOL_SIZE];
int hp[POOL_SIZE];
int vy[POOL_SIZE];
int type[POOL_SIZE];
bool alive[POOL_SIZE];

void spawnEnemy(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    hp[idx] = 3;
    vy[idx] = 8;
    type[idx] = 2;
    alive[idx] = true;
}

void spawnBullet(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    hp[idx] = 1;
    vy[idx] = -8;
    type[idx] = 1;
    alive[idx] = true;
}

void moveSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        y[i] += vy[i];
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

int main() {
    int count = 0;
    for (int row = 0; row < 5; row++) {
        for (int col = 0; col < 10; col++) {
            spawnEnemy(count, 40 + col * 32, 40 + row * 32);
            count++;
        }
    }
    for (int i = 0; i < 500; i++) {
        spawnBullet(count, (i % 50) * 8, 300 + (i / 50) * 4);
        count++;
    }

    int accumulator = 0;
    int totalSteps = 0;
    int frameTimes[] = {16, 32, 16};
    for (int f = 0; f < 3; f++) {
        accumulator += frameTimes[f];
        int stepsThisFrame = 0;
        while (accumulator >= FIXED_DT) {
            moveSystem(count);
            int checks = collisionSystem(count);
            cleanupSystem(count);
            accumulator -= FIXED_DT;
            stepsThisFrame++;
            totalSteps++;
        }
        int bullets = countByType(count, 1);
        int enemies = countByType(count, 2);
        cout << "TIMESTEP|frame|" << (f + 1) << "|elapsed|" << frameTimes[f]
             << "|steps|" << stepsThisFrame << "|bullets|" << bullets
             << "|enemies|" << enemies << endl;
    }
    cout << "DETERMINISTIC|total_steps|" << totalSteps << "|frame_independent|true" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
