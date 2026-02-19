import type { Lesson } from "@/types/lesson";

export const lesson36: Lesson = {
  id: "36-fixed-timestep",
  title: "Fixed Timestep Loop",
  description: "Decouple game logic from frame rate with a fixed-step update loop.",
  order: 36,
  xpReward: 150,
  tier: "pro",
  concepts: ["fixed timestep", "delta time", "accumulator pattern", "frame-rate independence", "simulation step"],
  part1: {
    title: "Concept: Fixed Timestep",
    type: "concept",
    instructions: `# Fixed Timestep — Why Variable Frame Rates Break Physics

A ball moves at velocity 10. At 60fps each frame is ~16ms, so it moves 10 per frame = 600 per second. At 30fps each frame is ~33ms, so it moves 10 per frame = 300 per second. Same code, half the speed. The physics is frame-rate dependent. This breaks everything.

## The Fix: Accumulator Pattern

Instead of updating once per frame, you accumulate elapsed time and step the simulation at a fixed interval:

\\\`\\\`\\\`
int accumulator = 0;
accumulator += elapsedMs;
while (accumulator >= FIXED_DT) {
    update();  // always the same time step
    accumulator -= FIXED_DT;
}
\\\`\\\`\\\`

If a frame takes 32ms and FIXED_DT is 16ms, you run 2 update steps. If a frame takes 16ms, you run 1 step. The simulation always advances at the same rate regardless of how fast the renderer runs.

## Your Task

1. Define FIXED_DT = 16 (milliseconds)
2. A ball starts at position 0 with velocity 5 (units per step)
3. Simulate 3 "frames" with different elapsed times: 16ms, 32ms, 16ms
4. For each frame, add elapsed time to an accumulator
5. While accumulator >= FIXED_DT, run one update step (position += velocity), subtract FIXED_DT from accumulator
6. After each frame, print the current state

Expected output:
\\\`\\\`\\\`
FRAME|1|elapsed|16|steps|1|position|5
FRAME|2|elapsed|32|steps|2|position|15
FRAME|3|elapsed|16|steps|1|position|20
TOTAL|steps|4|final_position|20
\\\`\\\`\\\`

Notice: total displacement is 20 regardless of frame timing. 4 steps * 5 velocity = 20. Deterministic.`,
    starterCode: `#include <iostream>
using namespace std;

const int FIXED_DT = 16;

int main() {
    int position = 0;
    int velocity = 5;
    int accumulator = 0;
    int totalSteps = 0;

    int frameTimes[] = {16, 32, 16};

    // TODO: Loop through 3 frames
    //   - Add frameTime to accumulator
    //   - Count steps this frame
    //   - While accumulator >= FIXED_DT: update position, subtract FIXED_DT
    //   - Print FRAME|<n>|elapsed|<time>|steps|<count>|position|<pos>

    // TODO: Print TOTAL|steps|<totalSteps>|final_position|<position>

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int FIXED_DT = 16;

int main() {
    int position = 0;
    int velocity = 5;
    int accumulator = 0;
    int totalSteps = 0;

    int frameTimes[] = {16, 32, 16};

    for (int f = 0; f < 3; f++) {
        accumulator += frameTimes[f];
        int stepsThisFrame = 0;
        while (accumulator >= FIXED_DT) {
            position += velocity;
            accumulator -= FIXED_DT;
            stepsThisFrame++;
            totalSteps++;
        }
        cout << "FRAME|" << (f + 1) << "|elapsed|" << frameTimes[f]
             << "|steps|" << stepsThisFrame << "|position|" << position << endl;
    }

    cout << "TOTAL|steps|" << totalSteps << "|final_position|" << position << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1: 16ms elapsed, 1 step, position 5", expectedOutput: "FRAME|1|elapsed|16|steps|1|position|5" },
      { id: "t2", description: "Frame 2: 32ms elapsed, 2 steps, position 15", expectedOutput: "FRAME|2|elapsed|32|steps|2|position|15" },
      { id: "t3", description: "Frame 3: 16ms elapsed, 1 step, position 20", expectedOutput: "FRAME|3|elapsed|16|steps|1|position|20" },
      { id: "t4", description: "Should show total of 4 steps and final position 20", expectedOutput: "TOTAL|steps|4|final_position|20" },
    ],
    hints: [
      "The accumulator is a running total of unprocessed time. Add each frame's elapsed time to it.",
      "Use a `while` loop, not `if`. A 32ms frame at 16ms fixed step needs 2 iterations.",
      "Each step: position += velocity (5), accumulator -= FIXED_DT (16). Track stepsThisFrame separately from totalSteps.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Fixed Timestep Simulation",
    type: "game_builder",
    instructions: `# Game Builder: Fixed Timestep Bullet Simulation

Apply the fixed timestep pattern to your space shooter. Variable frame times produce the same simulation result. This is the foundation of deterministic game physics.

## Your Task
1. Define FIXED_DT = 16 (ms, ~60fps)
2. Set up SoA arrays for 5 bullets: x[], y[], vy[], alive[] — all start at y=300, vy=-8
3. Simulate 3 "real" frames with different elapsed times: 16ms, 32ms, 16ms
4. Use an accumulator. Each update step moves all alive bullets by vy
5. After each frame, print bullet_0 position: \\\`TIMESTEP|frame|<n>|elapsed|<ms>|steps|<s>|bullet_y|<y>\\\`
6. After all frames print: \\\`DETERMINISTIC|total_steps|4|final_y|<y>|frame_independent|true\\\`
7. Print: \\\`SCORE|0\\\`

Frame 1 (16ms): 1 step, bullet_y = 300 + (-8) = 292
Frame 2 (32ms): 2 steps, bullet_y = 292 + (-8) + (-8) = 276
Frame 3 (16ms): 1 step, bullet_y = 276 + (-8) = 268

4 total steps. Same result whether frames are even or uneven.`,
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
    //   - Print TIMESTEP line with bullet_0 y position

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
      { id: "t1", description: "Frame 1: 1 step, bullet_y should be 292", expectedOutput: "TIMESTEP|frame|1|elapsed|16|steps|1|bullet_y|292" },
      { id: "t2", description: "Frame 2: 2 steps, bullet_y should be 276", expectedOutput: "TIMESTEP|frame|2|elapsed|32|steps|2|bullet_y|276" },
      { id: "t3", description: "Frame 3: 1 step, bullet_y should be 268", expectedOutput: "TIMESTEP|frame|3|elapsed|16|steps|1|bullet_y|268" },
      { id: "t4", description: "Should confirm deterministic result", expectedOutput: "DETERMINISTIC|total_steps|4|final_y|268|frame_independent|true" },
      { id: "t5", description: "Should show score", expectedOutput: "SCORE|0" },
    ],
    hints: [
      "initBullets sets all 5 bullets to x=200, y=300, vy=-8, alive=true in a loop.",
      "The accumulator pattern: add elapsed time, then while accumulator >= FIXED_DT, call updateBullets() and subtract FIXED_DT.",
      "After 4 total steps at vy=-8: 300 + (4 * -8) = 300 - 32 = 268. The split across frames does not matter.",
    ],
    estimatedMinutes: 8,
  },
};
