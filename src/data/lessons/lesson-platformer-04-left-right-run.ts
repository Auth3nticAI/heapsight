import { Lesson } from "../../types/lesson";

const lessonPlatformer4: Lesson = {
  id: "platformer-04-left-right-run",
  title: "Left-Right Run",
  description:
    "Arrow keys move the player left and right. Horizontal velocity is independent of vertical  --  run and jump at the same time.",
  order: 4,
  xpReward: 50,
  tier: "free",
  concepts: [
    "horizontal velocity",
    "input mapping",
    "independent axes",
    "screen bounds clamping",
    "IsKeyDown for held input",
  ],
  part1: {
    title: "Horizontal Movement as Velocity",
    type: "concept",
    instructions: `# Horizontal Movement as Velocity

## Mental Model

Vertical movement uses acceleration (gravity). Horizontal movement in a basic platformer is simpler  --  you directly set horizontal velocity based on input. Left arrow = negative velocity, right arrow = positive, nothing held = zero. Two axes, completely independent.

## What Breaks Without This

Without horizontal movement, your player is stuck in one column. They can jump in place, but can't reach platforms, dodge enemies, or explore the level. The game is broken at the most fundamental level.

## The Fix: Input-Driven Horizontal Velocity

Each frame, read the arrow keys and set \`player_vx\`:

\`\`\`
float player_vx = 0.0f;
if (IsKeyDown(KEY_RIGHT)) player_vx = RUN_SPEED;
if (IsKeyDown(KEY_LEFT))  player_vx = -RUN_SPEED;
player_x += player_vx * FIXED_DT;
\`\`\`

Note: we use \`IsKeyDown\`, not \`IsKeyPressed\`. Movement should happen every frame the key is held, not just the first frame of the press. This is the opposite of jumping, where we use \`IsKeyPressed\` for a single impulse.

## Key Concepts

**Independent axes**: Horizontal (x) and vertical (y) velocities are separate. Pressing right while falling doesn't affect the fall speed. This orthogonality is what makes platformer controls feel clean  --  you can run AND jump simultaneously.

**IsKeyDown**: Returns true every frame the key is held. Perfect for continuous movement. **IsKeyPressed**: Returns true only on the frame the key is first pressed. Perfect for single-fire actions like jumping.

## Performance Insight

Two key checks and one multiplication per frame. Horizontal movement is effectively free. The cost comes later when we add acceleration curves, friction, and air control  --  but the key checking stays O(1).

## Memory Insight

\`player_vx\` can be a local variable inside the loop since it's recalculated from input every frame. But we'll move it to file scope soon when friction needs to persist between frames. For now, local is fine.

## Your Task

Simulate horizontal movement. A player starts at x=100. RUN_SPEED = 200.0. FIXED_DT = 1/60.

Simulate 3 frames moving right, then 3 frames with no input, then 3 frames moving left.

Print: \`Frame N: x = VALUE direction = left/right/none\`

## Beginner Trap

\`\`\`cpp
// WRONG: Moving position directly by a constant
if (right_pressed) player_x += 3;
\`\`\`

Without multiplying by dt, movement speed depends on framerate. At 60 FPS you move 180 pixels/sec, at 30 FPS you move 90 pixels/sec. Always multiply by FIXED_DT.

## Elite Insight

Most platformers don't use instant velocity for horizontal movement  --  they use acceleration and friction curves (next lesson). But starting with direct velocity gives you the clearest mental model of independent axes before adding complexity.

## Systems Thinking Connection

Input mapping (key -> velocity) is the same pattern used in the Robotics path for teleop (key -> motor command) and in the Space Shooter for ship steering. The abstraction of "input -> intent -> physics" appears everywhere.

## Skill Reinforcement

You can now move an entity in any direction based on input. This is the foundation of every controllable character in every game.

## Mastery Check

**Q:** Why is horizontal velocity set from input each frame, while vertical velocity persists between frames?

**A:** Vertical velocity is governed by physics (gravity accumulates). Horizontal velocity (for now) is purely input-driven  --  no physics force pushes you sideways. So we reset it from input each frame. In the next lesson, we'll add friction, which means horizontal velocity will also need to persist.`,
    starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    float player_x = 100.0f;
    const float RUN_SPEED = 200.0f;
    const float FIXED_DT = 1.0f / 60.0f;

    cout << fixed << setprecision(2);

    // TODO: Simulate 9 frames of movement
    // Frames 1-3: moving right (vx = RUN_SPEED)
    // Frames 4-6: no input (vx = 0)
    // Frames 7-9: moving left (vx = -RUN_SPEED)
    //
    // Each frame: player_x += vx * FIXED_DT
    // Print: "Frame N: x = VALUE direction = right/none/left"

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    float player_x = 100.0f;
    const float RUN_SPEED = 200.0f;
    const float FIXED_DT = 1.0f / 60.0f;

    cout << fixed << setprecision(2);

    for (int i = 1; i <= 9; i++) {
        float vx = 0.0f;
        const char* dir = "none";
        if (i <= 3) {
            vx = RUN_SPEED;
            dir = "right";
        } else if (i >= 7) {
            vx = -RUN_SPEED;
            dir = "left";
        }
        player_x += vx * FIXED_DT;
        cout << "Frame " << i << ": x = " << player_x << " direction = " << dir << endl;
    }

    return 0;
}`,
    tests: [
      {
        id: "p1-t1",
        description: "Frame 1 moves right",
        expectedOutput: "Frame 1: x = 103.33 direction = right",
      },
      {
        id: "p1-t2",
        description: "Frame 4 has no movement",
        expectedOutput: "Frame 4: x = 110.00 direction = none",
      },
      {
        id: "p1-t3",
        description: "Frame 7 moves left",
        expectedOutput: "Frame 7: x = 106.67 direction = left",
      },
      {
        id: "p1-t4",
        description: "Frame 9 position is correct",
        expectedOutput: "Frame 9: x = 100.00 direction = left",
      },
    ],
    hints: [
      "Loop from 1 to 9. Set vx based on the frame number: if i <= 3 then vx = RUN_SPEED, if i >= 7 then vx = -RUN_SPEED, else vx = 0.",
      "Track direction as a string: \"right\" for frames 1-3, \"none\" for 4-6, \"left\" for 7-9. Use const char* dir.",
      "Update position: player_x += vx * FIXED_DT; Then print: cout << \"Frame \" << i << \": x = \" << player_x << \" direction = \" << dir << endl;",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Left-Right Run",
    type: "game_builder",
    instructions: `# Left-Right Run

## Mental Model

Your block can jump. Now it can run. Arrow keys set horizontal velocity, and the x-position updates each frame. Combined with gravity and jumping, you now have the two-axis movement that defines a platformer.

## What Breaks Without This

A jumping block stuck in one column isn't a platformer. Horizontal movement is what turns a physics demo into a game. Once you can run and jump, you can design levels with gaps, platforms at different heights, and paths to explore.

## The Fix: Input -> Velocity -> Position

Each frame, read the arrow keys and set horizontal velocity. Apply it to position. Add screen bounds clamping so the player can't run off the edges.

\`\`\`
player_vx = 0.0f;
if (IsKeyDown(KEY_RIGHT)) player_vx = RUN_SPEED;
if (IsKeyDown(KEY_LEFT))  player_vx = -RUN_SPEED;
player_x += player_vx * FIXED_DT;

// Screen bounds
if (player_x < 0) player_x = 0;
if (player_x + PLAYER_W > SCREEN_W) player_x = SCREEN_W - PLAYER_W;
\`\`\`

## Key Concepts

**Screen bounds clamping**: Prevent the player from leaving the visible area. Check both edges  --  left (x < 0) and right (x + width > screen width). This is the horizontal equivalent of ground collision.

## Performance Insight

Two key checks, one multiply, two comparisons for bounds. Negligible cost. The pattern stays the same even with 100 entities  --  you'd just check bounds per entity.

## Your Task

Add horizontal movement to your platformer:

1. Add \`RUN_SPEED = 200.0f\` constant and \`player_vx = 0.0f\` at file scope
2. Before physics: read arrow keys, set player_vx
3. Apply: \`player_x += player_vx * FIXED_DT\`
4. Clamp player_x to screen bounds (0 to SCREEN_W - PLAYER_W)
5. Update cout to print \`RunSpeed: 200\`

Run the game  --  arrow keys should move the block left and right, and you can run while jumping.

## Beginner Trap

\`\`\`cpp
// WRONG: Setting both directions when neither key is pressed
player_vx = RUN_SPEED;  // always running right!
if (IsKeyDown(KEY_LEFT)) player_vx = -RUN_SPEED;
\`\`\`

Always start with \`player_vx = 0\`, then conditionally set direction. Otherwise the player drifts when no keys are pressed.

## Elite Insight

Mario's horizontal movement uses acceleration, not instant velocity. When you press right, speed ramps up over several frames. When you release, speed decays via friction. This creates the "skidding" feel. We'll add that in the next lesson  --  for now, instant velocity gives clean, responsive control.

## Systems Thinking Connection

Screen bounds clamping is the same pattern used in the Space Shooter for keeping the ship on screen and in the Robotics path for keeping the robot within the simulation bounds. "Constrain to valid range" is one of the most common patterns in all of systems programming.

## Mastery Check

**Q:** Why do we reset player_vx to 0 at the start of each frame instead of keeping last frame's value?

**A:** Without friction (which we haven't added yet), there's no force to slow down horizontal movement. If we kept the old velocity, releasing the arrow key would leave the player sliding forever. Resetting to 0 gives us instant stop behavior, which is correct for input-driven velocity without friction.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

// Game state at file scope
const int SCREEN_W = 800;
const int SCREEN_H = 450;
float player_x = 388.0f;
float player_y = 100.0f;
float player_vy = 0.0f;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const int GROUND_Y = 340;
const float JUMP_SPEED = 400.0f;
bool is_grounded = true;
const float MIN_JUMP_VY = 150.0f;

// TODO: Add RUN_SPEED constant (200.0f)
// TODO: Add player_vx (0.0f)

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    // Test output (before game loop)
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "Grounded: true" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;
    // TODO: Print "RunSpeed: 200"

    while (!WindowShouldClose()) {
        // TODO: Horizontal input
        // Reset player_vx to 0
        // If right arrow held, player_vx = RUN_SPEED
        // If left arrow held, player_vx = -RUN_SPEED

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

        // TODO: Apply horizontal velocity
        // player_x += player_vx * FIXED_DT

        // TODO: Screen bounds clamping
        // if player_x < 0, clamp to 0
        // if player_x + PLAYER_W > SCREEN_W, clamp to SCREEN_W - PLAYER_W

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
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const int GROUND_Y = 340;
const float JUMP_SPEED = 400.0f;
bool is_grounded = true;
const float MIN_JUMP_VY = 150.0f;
const float RUN_SPEED = 200.0f;
float player_vx = 0.0f;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    // Test output (before game loop)
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "Grounded: true" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;
    cout << "RunSpeed: " << RUN_SPEED << endl;

    while (!WindowShouldClose()) {
        // Horizontal input
        player_vx = 0.0f;
        if (IsKeyDown(KEY_RIGHT)) player_vx = RUN_SPEED;
        if (IsKeyDown(KEY_LEFT))  player_vx = -RUN_SPEED;

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
        description: "Run speed printed",
        expectedOutput: "RunSpeed: 200",
      },
      {
        id: "p2-t4",
        description: "Jump speed printed",
        expectedOutput: "JumpSpeed: 400",
      },
      {
        id: "p2-t5",
        description: "Min jump velocity printed",
        expectedOutput: "MinJumpVY: 150",
      },
      {
        id: "p2-t6",
        description: "Grounded state printed",
        expectedOutput: "Grounded: true",
      },
    ],
    hints: [
      "At file scope, add: const float RUN_SPEED = 200.0f; and float player_vx = 0.0f;",
      "At the start of the while loop (before jump input), reset and read horizontal input: player_vx = 0.0f; if (IsKeyDown(KEY_RIGHT)) player_vx = RUN_SPEED; if (IsKeyDown(KEY_LEFT)) player_vx = -RUN_SPEED;",
      "After gravity integration, add: player_x += player_vx * FIXED_DT; Then bounds: if (player_x < 0) player_x = 0; if (player_x + PLAYER_W > SCREEN_W) player_x = SCREEN_W - PLAYER_W; And the cout: cout << \"RunSpeed: \" << RUN_SPEED << endl;",
    ],
    estimatedMinutes: 10,
  },
};

export default lessonPlatformer4;
