import { Lesson } from "../../types/lesson";

const lessonPlatformer1: Lesson = {
  id: "platformer-01-boot-gravity",
  title: "Boot & Gravity",
  description:
    "A blue block falls from the sky and lands on brown ground. You build gravity from two lines of physics.",
  order: 1,
  xpReward: 50,
  tier: "free",
  concepts: [
    "velocity integration",
    "gravity as acceleration",
    "game loop structure",
    "file-scope state",
    "raylib drawing basics",
  ],
  part1: {
    title: "How Gravity Works in Code",
    type: "concept",
    instructions: `# How Gravity Works in Code

## Mental Model

In the real world, gravity is an acceleration  --  it doesn't set your speed, it *adds* to your speed every moment you're falling. A dropped ball isn't instantly fast. It starts slow and gets faster. That's the difference between setting velocity and *integrating* acceleration.

## What Breaks Without This

If you just move the player down by a fixed amount each frame (\`player_y += 5\`), the fall looks robotic  --  no acceleration, no arc, no weight. It doesn't feel like physics. It feels like an elevator.

## The Fix: Velocity Integration

Gravity is an acceleration value (like 800 pixels per second squared). Every frame, you add gravity to the player's vertical velocity. Then you add velocity to position. Two lines:

\`\`\`
velocity_y += GRAVITY * FIXED_DT;
position_y += velocity_y * FIXED_DT;
\`\`\`

\`FIXED_DT\` is the time step  --  \`1.0 / 60.0\` for 60 FPS. Multiplying by dt keeps the physics framerate-independent. This is called **Euler integration**  --  the simplest physics integrator, and the one every platformer starts with.

## Key Concepts

**Velocity** is how fast something moves (pixels per second). **Acceleration** is how fast velocity changes (pixels per second per second). **Integration** means accumulating  --  velocity accumulates into position, acceleration accumulates into velocity.

The key insight: gravity doesn't move you. Gravity changes your *velocity*, and velocity moves you.

## Performance Insight

Two additions and two multiplications per entity per frame. This is the cheapest physics you'll ever write. Even 10,000 entities can integrate in under a millisecond.

## Memory Insight

\`player_y\` and \`player_vy\` are floats on the stack (or file scope). 4 bytes each. No heap allocation needed for basic gravity.

## Your Task

Write a program that simulates a ball falling under gravity. Start the ball at height 50.0. Apply gravity of 800.0 with a fixed timestep of 1.0/60.0. Simulate 5 frames and print the position after each frame.

Print each frame as: \`Frame N: y = VALUE\`

Use \`cout << fixed\` and set precision to 2 decimal places.

## Beginner Trap

\`\`\`cpp
// WRONG: Setting position directly
player_y += 5;  // constant speed, no acceleration
\`\`\`

This isn't gravity  --  it's a conveyor belt. Real gravity accelerates, which means velocity must change every frame BEFORE updating position.

## Elite Insight

Every commercial platformer  --  from Super Mario Bros to Celeste  --  uses some form of velocity integration for gravity. Celeste uses a tuned gravity curve with different fall speeds depending on whether you're holding jump. But it all starts with these same two lines.

## Systems Thinking Connection

This exact integration pattern appears in the Robotics path for simulating robot motion under motor forces, and in the Space Shooter for bullet trajectories. Acceleration -> velocity -> position is universal.

## Skill Reinforcement

After this lesson, you can simulate any constant-acceleration motion: falling, throwing, launching.

## Mastery Check

**Q:** If gravity is 800 and the timestep is 1/60, what is the velocity after 1 second (60 frames)?

**A:** 800.0 pixels/second. Each frame adds 800 * (1/60) ~ 13.33 to velocity. After 60 frames: 60 * 13.33 ~ 800.`,
    starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    float ball_y = 50.0f;
    float ball_vy = 0.0f;
    const float GRAVITY = 800.0f;
    const float FIXED_DT = 1.0f / 60.0f;

    cout << fixed << setprecision(2);

    // TODO: Simulate 5 frames of gravity
    // Each frame:
    //   1. Add GRAVITY * FIXED_DT to ball_vy
    //   2. Add ball_vy * FIXED_DT to ball_y
    //   3. Print "Frame N: y = VALUE" (where N is 1-5)

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    float ball_y = 50.0f;
    float ball_vy = 0.0f;
    const float GRAVITY = 800.0f;
    const float FIXED_DT = 1.0f / 60.0f;

    cout << fixed << setprecision(2);

    for (int i = 1; i <= 5; i++) {
        ball_vy += GRAVITY * FIXED_DT;
        ball_y += ball_vy * FIXED_DT;
        cout << "Frame " << i << ": y = " << ball_y << endl;
    }

    return 0;
}`,
    tests: [
      {
        id: "t1",
        description: "Frame 1 position is correct",
        expectedOutput: "Frame 1: y = 50.22",
      },
      {
        id: "t2",
        description: "Frame 2 position is correct",
        expectedOutput: "Frame 2: y = 50.67",
      },
      {
        id: "t3",
        description: "Frame 5 position is correct",
        expectedOutput: "Frame 5: y = 53.33",
      },
    ],
    hints: [
      "Use a for loop from 1 to 5. Inside, update velocity first (ball_vy += GRAVITY * FIXED_DT), then position (ball_y += ball_vy * FIXED_DT).",
      "Print format is exactly: cout << \"Frame \" << i << \": y = \" << ball_y << endl;",
      "Full solution: for (int i = 1; i <= 5; i++) { ball_vy += GRAVITY * FIXED_DT; ball_y += ball_vy * FIXED_DT; cout << \"Frame \" << i << \": y = \" << ball_y << endl; }",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Boot & Gravity",
    type: "game_builder",
    instructions: `# Boot & Gravity

## Mental Model

You're building the first frame of a platformer. A blue block sits in the sky. Gravity pulls it down. Brown ground stops it. Two systems working together  --  integration and collision response  --  and you can already see physics.

## What Breaks Without This

Without gravity, your player floats. Without ground collision, your player falls forever. Both systems must exist from frame one, or the game feels broken.

## The Fix: Integration + Ground Check

Apply the same two-line integration from Part 1 inside the game loop. Then add a ground check: if the player's bottom edge goes past the ground line, snap them back and zero their velocity. That's your first collision response.

\`\`\`
// Physics
player_vy += GRAVITY * FIXED_DT;
player_y += player_vy * FIXED_DT;

// Ground collision
if (player_y + PLAYER_H >= GROUND_Y) {
    player_y = GROUND_Y - PLAYER_H;
    player_vy = 0.0f;
}
\`\`\`

## Key Concepts

**Ground collision** is the simplest collision response: detect overlap, correct position, zero velocity. Every platformer collision  --  walls, ceilings, platforms  --  is a variation of this pattern.

## Performance Insight

One comparison per entity per frame for ground checking. This scales to hundreds of entities with zero concern. Later, tile grid collision will replace this simple check, but the pattern is identical.

## Memory Insight

All state lives at file scope: \`player_x\`, \`player_y\`, \`player_vy\`, and constants. No heap allocations. The entire game state fits in a few dozen bytes.

## Your Task

Complete the game loop to make the blue block fall under gravity and land on the brown ground.

1. Set up constants: \`PLAYER_W = 24\`, \`PLAYER_H = 24\`, \`GROUND_Y = 340\`
2. Apply gravity integration each frame
3. Add ground collision: if player bottom >= GROUND_Y, snap to ground and zero velocity
4. Print initial state before the loop: \`Player: (STARTX, STARTY)\` and \`Gravity: VALUE\`
5. Draw the player as a blue rectangle and the ground as a brown rectangle

The block should fall from y=100 and land on the ground at y=316 (which is GROUND_Y - PLAYER_H).

## Beginner Trap

\`\`\`cpp
// WRONG: Checking player_y instead of player bottom edge
if (player_y >= GROUND_Y) { ... }
\`\`\`

This makes the player sink INTO the ground by PLAYER_H pixels before stopping. Always check the bottom edge: \`player_y + PLAYER_H\`.

## Elite Insight

In Celeste, the ground collision response isn't just "stop." It triggers a landing state, spawns dust particles, and resets the coyote timer. But it all starts with this same position correction + velocity zero. We'll add those layers in later lessons.

## Systems Thinking Connection

This ground-check pattern is identical to how the Space Shooter handles screen bounds  --  detect violation, correct position, modify velocity. In the Robotics path, the same pattern prevents the robot from driving through walls.

## Mastery Check

**Q:** Why do we set \`player_vy = 0.0f\` when landing, not just correct the position?

**A:** Without zeroing velocity, gravity continues adding to it while the player sits on the ground. Next frame, the accumulated velocity would push them through the floor. Zeroing velocity is the "response" part of collision response.`,
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

// TODO: Define PLAYER_W (24), PLAYER_H (24), and GROUND_Y (340)

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    // Test output (before game loop)
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;

    while (!WindowShouldClose()) {
        // TODO: Apply gravity to player_vy
        // TODO: Apply velocity to player_y
        // TODO: Ground collision - if player bottom >= GROUND_Y,
        //       snap player_y to GROUND_Y - PLAYER_H and zero player_vy

        BeginDrawing();
        ClearBackground(SKYBLUE);

        // TODO: Draw ground - brown rectangle from GROUND_Y to bottom of screen
        //       DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN);

        // TODO: Draw player - blue rectangle at (player_x, player_y) size PLAYER_W x PLAYER_H
        //       DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);

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

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    // Test output (before game loop)
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;

    while (!WindowShouldClose()) {
        // Physics: gravity integration
        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;

        // Ground collision
        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
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
        id: "g1",
        description: "Player starts at correct position",
        expectedOutput: "Player: (388, 100)",
      },
      {
        id: "g2",
        description: "Gravity is set to 800",
        expectedOutput: "Gravity: 800",
      },
      {
        id: "g3",
        description: "Player x-coordinate is 388",
        expectedOutput: "388",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Player y-coordinate starts at 100",
        expectedOutput: "100",
        isPattern: true,
      },
    ],
    hints: [
      "Define the three constants after the existing state: const int PLAYER_W = 24; const int PLAYER_H = 24; const int GROUND_Y = 340;",
      "Inside the while loop, add physics first: player_vy += GRAVITY * FIXED_DT; then player_y += player_vy * FIXED_DT; Then the ground check: if (player_y + PLAYER_H >= GROUND_Y) { player_y = GROUND_Y - PLAYER_H; player_vy = 0.0f; }",
      "For drawing: DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN); for the ground, and DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE); for the player.",
    ],
    estimatedMinutes: 10,
  },
};

export default lessonPlatformer1;
