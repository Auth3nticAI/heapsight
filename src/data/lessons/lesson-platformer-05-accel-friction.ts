import { Lesson } from "../../types/lesson";

const lessonPlatformer5: Lesson = {
  id: "platformer-05-accel-friction",
  title: "Acceleration & Friction",
  description:
    "Replace instant velocity with acceleration curves and friction. Movement ramps up, coasts, and decelerates  --  like a real character, not a teleporting box.",
  order: 5,
  xpReward: 50,
  tier: "free",
  concepts: [
    "acceleration curves",
    "friction coefficient",
    "velocity persistence",
    "movement feel tuning",
    "terminal horizontal velocity",
  ],
  part1: {
    title: "Acceleration and Friction Make Movement Feel Real",
    type: "concept",
    instructions: `# Acceleration and Friction Make Movement Feel Real

## Mental Model

In the last lesson, horizontal velocity was instant  --  press right, immediately going 200 pixels/sec. Release, instantly stopped. That's responsive, but it feels robotic. Real movement has **ramp-up** (acceleration) and **ramp-down** (friction). You press right, speed builds over a few frames. You release, speed decays. This is what makes Mario slide, Celeste feel crisp, and Mega Man snap.

## What Breaks Without This

Instant velocity changes feel "digital"  --  on or off, no in-between. The player can't make micro-adjustments. Fast direction changes feel jarring. There's no sense of weight or momentum. The character feels like a cursor, not a body.

## The Fix: Acceleration + Friction

Instead of setting \`player_vx\` directly, **add** acceleration to it each frame (up to a max speed). When no input, apply friction to decay velocity toward zero.

\`\`\`
// Acceleration when input held
if (right_pressed) {
    player_vx += ACCEL * FIXED_DT;
    if (player_vx > MAX_RUN) player_vx = MAX_RUN;
}
// Friction when no input
else {
    if (player_vx > 0) {
        player_vx -= FRICTION * FIXED_DT;
        if (player_vx < 0) player_vx = 0;
    }
}
\`\`\`

**ACCEL** controls how fast you reach full speed (higher = snappier). **FRICTION** controls how fast you stop (higher = less slide). **MAX_RUN** caps the top speed.

## Key Concepts

**Acceleration**: Rate of velocity change per second. \`ACCEL = 600\` means velocity increases by 600 px/s each second. At 60 FPS, that's 10 px/s per frame. **Friction**: A decelerating force applied when no input is given. It opposes the current direction of movement. **Terminal velocity**: The max speed. Without a cap, acceleration would push velocity to infinity.

Friction is NOT a constant subtraction  --  it opposes motion. If moving right, friction subtracts. If moving left, friction adds. Always moves velocity toward zero.

## Performance Insight

A few extra additions and comparisons per frame. Trivial cost. The feel improvement is enormous relative to the computation cost.

## Memory Insight

\`player_vx\` must now persist between frames (file scope, not local). It's no longer recalculated from input  --  it's accumulated. Same 4 bytes, different lifecycle.

## Your Task

Simulate acceleration and friction. Player starts at x=100, vx=0. ACCEL = 600.0, FRICTION = 500.0, MAX_RUN = 200.0, FIXED_DT = 1/60.

Frames 1-4: pressing right (accelerate)
Frames 5-8: no input (friction decelerates)

Print: \`Frame N: x = VALUE vx = VALUE\`

## Beginner Trap

\`\`\`cpp
// WRONG: Applying friction in the same direction as movement
player_vx -= FRICTION * FIXED_DT;  // always subtracts  --  breaks when moving left!
\`\`\`

Friction must oppose the *current* direction. If vx > 0, subtract friction. If vx < 0, add friction. Or use a simpler approach: multiply by a decay factor like 0.85.

## Elite Insight

Celeste uses different acceleration and friction values for ground vs air, creating distinct "feel" for each state. Mario famously has low friction (ice-like sliding) while Mega Man has high friction (snappy stops). These constants define the identity of the character more than any art asset.

## Systems Thinking Connection

Acceleration and friction are the horizontal equivalent of gravity for vertical motion. In the Robotics path, PID controllers use similar tuning  --  proportional gain is like acceleration, damping is like friction. In the Space Shooter, bullet deceleration uses the same decay pattern.

## Skill Reinforcement

After this lesson, you can tune the "feel" of any character by adjusting three numbers: ACCEL, FRICTION, and MAX_RUN.

## Mastery Check

**Q:** If ACCEL = 600, FRICTION = 600, and MAX_RUN = 200, how many frames to reach max speed? How many to stop?

**A:** Each frame adds 600/60 = 10 px/s of velocity. To reach 200 from 0: 200/10 = 20 frames (1/3 second). Same for stopping  --  20 frames. Equal accel and friction gives symmetrical movement.`,
    starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    float player_x = 100.0f;
    float player_vx = 0.0f;
    const float ACCEL = 600.0f;
    const float FRICTION = 500.0f;
    const float MAX_RUN = 200.0f;
    const float FIXED_DT = 1.0f / 60.0f;

    cout << fixed << setprecision(2);

    // TODO: Simulate 8 frames
    // Frames 1-4: pressing right  --  accelerate player_vx toward MAX_RUN
    //   player_vx += ACCEL * FIXED_DT
    //   if player_vx > MAX_RUN, clamp to MAX_RUN
    // Frames 5-8: no input  --  apply friction to decelerate
    //   if player_vx > 0: player_vx -= FRICTION * FIXED_DT
    //   if player_vx < 0 after friction: player_vx = 0
    // All frames: player_x += player_vx * FIXED_DT
    // Print: "Frame N: x = VALUE vx = VALUE"

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    float player_x = 100.0f;
    float player_vx = 0.0f;
    const float ACCEL = 600.0f;
    const float FRICTION = 500.0f;
    const float MAX_RUN = 200.0f;
    const float FIXED_DT = 1.0f / 60.0f;

    cout << fixed << setprecision(2);

    for (int i = 1; i <= 8; i++) {
        if (i <= 4) {
            // Accelerate right
            player_vx += ACCEL * FIXED_DT;
            if (player_vx > MAX_RUN) player_vx = MAX_RUN;
        } else {
            // Friction deceleration
            if (player_vx > 0) {
                player_vx -= FRICTION * FIXED_DT;
                if (player_vx < 0) player_vx = 0;
            }
        }
        player_x += player_vx * FIXED_DT;
        cout << "Frame " << i << ": x = " << player_x << " vx = " << player_vx << endl;
    }

    return 0;
}`,
    tests: [
      {
        id: "p1-t1",
        description: "Frame 1 shows initial acceleration",
        expectedOutput: "Frame 1: x = 100.17 vx = 10.00",
      },
      {
        id: "p1-t2",
        description: "Frame 4 shows higher velocity",
        expectedOutput: "Frame 4: x = 101.67 vx = 40.00",
      },
      {
        id: "p1-t3",
        description: "Frame 5 shows friction starting",
        expectedOutput: "Frame 5: x = 102.19 vx = 31.67",
      },
      {
        id: "p1-t4",
        description: "Frame 8 shows further deceleration",
        expectedOutput: "Frame 8: x = 102.94 vx = 6.67",
      },
    ],
    hints: [
      "Loop from 1 to 8. If i <= 4, add ACCEL * FIXED_DT to player_vx and clamp to MAX_RUN. Otherwise, subtract FRICTION * FIXED_DT from player_vx and clamp to 0.",
      "After the accel/friction logic, always apply: player_x += player_vx * FIXED_DT.",
      "Print: cout << \"Frame \" << i << \": x = \" << player_x << \" vx = \" << player_vx << endl;",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Acceleration & Friction",
    type: "game_builder",
    instructions: `# Acceleration & Friction

## Mental Model

Your block moves, but it starts and stops instantly  --  like flipping a switch. Real characters have weight. Press right and speed ramps up. Release and the character coasts to a stop. This is the difference between "I'm controlling a cursor" and "I'm controlling a body."

## What Breaks Without This

Instant velocity makes precision impossible. The player can't make small adjustments  --  they're either at full speed or stopped. Direction changes are jarring. There's no sense of momentum, and the character feels disconnected from the physics world.

## The Fix: Acceleration + Friction + Max Speed

Replace the direct velocity assignment with acceleration when keys are held, and friction when keys are released. Cap velocity at MAX_RUN.

\`\`\`
player_vx = player_vx;  // Persists between frames now

if (IsKeyDown(KEY_RIGHT)) {
    player_vx += ACCEL * FIXED_DT;
    if (player_vx > MAX_RUN) player_vx = MAX_RUN;
} else if (IsKeyDown(KEY_LEFT)) {
    player_vx -= ACCEL * FIXED_DT;
    if (player_vx < -MAX_RUN) player_vx = -MAX_RUN;
} else {
    // Friction: move toward zero
    if (player_vx > 0) {
        player_vx -= FRICTION * FIXED_DT;
        if (player_vx < 0) player_vx = 0;
    } else if (player_vx < 0) {
        player_vx += FRICTION * FIXED_DT;
        if (player_vx > 0) player_vx = 0;
    }
}
\`\`\`

## Key Concepts

**The three constants define feel:** ACCEL (how snappy), FRICTION (how slidy), MAX_RUN (how fast). Celeste: high accel, high friction (responsive, tight). Mario: medium accel, low friction (momentum, sliding). Mega Man: very high accel, very high friction (instant, crisp).

## Performance Insight

Same computational cost as before  --  a few comparisons and additions. But the feel improvement is dramatic. This is the best cost-to-quality ratio in game development.

## Your Task

Replace instant horizontal velocity with acceleration and friction:

1. Add constants: \`ACCEL = 600.0f\`, \`FRICTION = 500.0f\`, \`MAX_RUN = 200.0f\`
2. Remove the old \`player_vx = 0; if (right) vx = SPEED;\` pattern
3. Replace with acceleration when keys held, friction when released (handle both directions!)
4. player_vx now persists between frames  --  don't reset it to 0 at the top of the loop
5. Update cout to print all movement constants

Try it in the canvas  --  press right briefly, watch the block accelerate and coast. Hold longer, reach full speed. Release and see it decelerate. This is what "game feel" means.

## Beginner Trap

\`\`\`cpp
// WRONG: Forgetting to handle the left-direction friction
if (player_vx > 0) {
    player_vx -= FRICTION * FIXED_DT;
    if (player_vx < 0) player_vx = 0;
}
// What if player_vx is negative? They'll slide forever!
\`\`\`

Always handle both positive and negative velocity in friction. If vx > 0, subtract. If vx < 0, add. Both clamp to zero.

## Elite Insight

Super Meat Boy uses ACCEL ~ 2000 and FRICTION ~ 2000  --  nearly instant response in both directions. This creates the "twitchy" feel that defines the game. Ori and the Blind Forest uses lower values for a more graceful feel. There's no "correct" values  --  only values that match your game's identity.

## Systems Thinking Connection

Acceleration/friction tuning is a form of PID control  --  the same concept used in the Robotics path for motor speed regulation. Acceleration is proportional gain, friction is damping. The RPG path handles similar "ramp" logic in damage-over-time effects where damage builds up and decays.

## Mastery Check

**Q:** You want a character that feels "heavy" (slow to start, slow to stop). How would you tune ACCEL, FRICTION, and MAX_RUN?

**A:** Low ACCEL (slow ramp-up), low FRICTION (long slide), and moderate MAX_RUN. Think of a tank  --  takes a while to get going, but once moving, it doesn't stop easily. This is also how ice levels work in Mario  --  they just lower the friction constant.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

// Game state at file scope
const int SCREEN_W = 800;
const int SCREEN_H = 450;
float player_x = 388.0f;
float player_y = 100.0f;
float player_vy = 0.0f;
float player_vx = 0.0f;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const int GROUND_Y = 340;
const float JUMP_SPEED = 400.0f;
bool is_grounded = true;
const float MIN_JUMP_VY = 150.0f;

// TODO: Replace RUN_SPEED with three constants:
// ACCEL = 600.0f, FRICTION = 500.0f, MAX_RUN = 200.0f

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    // Test output (before game loop)
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "Grounded: true" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;
    // TODO: Print "Accel: 600", "Friction: 500", "MaxRun: 200"

    while (!WindowShouldClose()) {
        // TODO: Replace instant velocity with acceleration/friction
        // If right arrow held: accelerate player_vx (add ACCEL*FIXED_DT, cap at MAX_RUN)
        // Else if left arrow held: accelerate player_vx negative (subtract ACCEL*FIXED_DT, cap at -MAX_RUN)
        // Else: apply friction (move player_vx toward 0)
        //   If vx > 0: subtract FRICTION*FIXED_DT, clamp to 0
        //   If vx < 0: add FRICTION*FIXED_DT, clamp to 0

        // Jump input
        if (IsKeyPressed(KEY_SPACE) && is_grounded) {
            player_vy = -JUMP_SPEED;
            is_grounded = false;
        }

        // Variable jump height
        if (!is_grounded && !IsKeyDown(KEY_SPACE) && player_vy < -MIN_JUMP_VY) {
            player_vy = -MIN_JUMP_VY;
        }

        // Physics: gravity integration
        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;

        // Horizontal movement
        player_x += player_vx * FIXED_DT;

        // Screen bounds clamping
        if (player_x < 0) player_x = 0;
        if (player_x + PLAYER_W > SCREEN_W) player_x = SCREEN_W - PLAYER_W;

        // Ground collision
        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
            is_grounded = true;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);

        // Ground
        DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN);

        // Player
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

// Game state at file scope
const int SCREEN_W = 800;
const int SCREEN_H = 450;
float player_x = 388.0f;
float player_y = 100.0f;
float player_vy = 0.0f;
float player_vx = 0.0f;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const int GROUND_Y = 340;
const float JUMP_SPEED = 400.0f;
bool is_grounded = true;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    // Test output (before game loop)
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "Grounded: true" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;
    cout << "Accel: " << ACCEL << endl;
    cout << "Friction: " << FRICTION << endl;
    cout << "MaxRun: " << MAX_RUN << endl;

    while (!WindowShouldClose()) {
        // Horizontal movement with acceleration and friction
        if (IsKeyDown(KEY_RIGHT)) {
            player_vx += ACCEL * FIXED_DT;
            if (player_vx > MAX_RUN) player_vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            player_vx -= ACCEL * FIXED_DT;
            if (player_vx < -MAX_RUN) player_vx = -MAX_RUN;
        } else {
            // Friction: move toward zero
            if (player_vx > 0) {
                player_vx -= FRICTION * FIXED_DT;
                if (player_vx < 0) player_vx = 0;
            } else if (player_vx < 0) {
                player_vx += FRICTION * FIXED_DT;
                if (player_vx > 0) player_vx = 0;
            }
        }

        // Jump input
        if (IsKeyPressed(KEY_SPACE) && is_grounded) {
            player_vy = -JUMP_SPEED;
            is_grounded = false;
        }

        // Variable jump height
        if (!is_grounded && !IsKeyDown(KEY_SPACE) && player_vy < -MIN_JUMP_VY) {
            player_vy = -MIN_JUMP_VY;
        }

        // Physics: gravity integration
        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;

        // Horizontal movement
        player_x += player_vx * FIXED_DT;

        // Screen bounds clamping
        if (player_x < 0) player_x = 0;
        if (player_x + PLAYER_W > SCREEN_W) player_x = SCREEN_W - PLAYER_W;

        // Ground collision
        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
            is_grounded = true;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);

        // Ground
        DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN);

        // Player
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      {
        id: "p2-t1",
        description: "Player starts at correct position",
        expectedOutput: "Player: (388, 100)",
      },
      {
        id: "p2-t2",
        description: "Gravity value printed",
        expectedOutput: "Gravity: 800",
      },
      {
        id: "p2-t3",
        description: "Acceleration value printed",
        expectedOutput: "Accel: 600",
      },
      {
        id: "p2-t4",
        description: "Friction value printed",
        expectedOutput: "Friction: 500",
      },
      {
        id: "p2-t5",
        description: "Max run speed printed",
        expectedOutput: "MaxRun: 200",
      },
      {
        id: "p2-t6",
        description: "Jump speed printed",
        expectedOutput: "JumpSpeed: 400",
      },
    ],
    hints: [
      "Add three constants at file scope: const float ACCEL = 600.0f; const float FRICTION = 500.0f; const float MAX_RUN = 200.0f;",
      "Replace the old horizontal input block with: if (IsKeyDown(KEY_RIGHT)) { player_vx += ACCEL * FIXED_DT; if (player_vx > MAX_RUN) player_vx = MAX_RUN; } else if (IsKeyDown(KEY_LEFT)) { player_vx -= ACCEL * FIXED_DT; if (player_vx < -MAX_RUN) player_vx = -MAX_RUN; } else { /* friction */ }",
      "For friction in the else block: if (player_vx > 0) { player_vx -= FRICTION * FIXED_DT; if (player_vx < 0) player_vx = 0; } else if (player_vx < 0) { player_vx += FRICTION * FIXED_DT; if (player_vx > 0) player_vx = 0; }",
    ],
    estimatedMinutes: 12,
  },
};

export default lessonPlatformer5;
