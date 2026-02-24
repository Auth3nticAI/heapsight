import { Lesson } from "../../types/lesson";

const lessonPlatformer2: Lesson = {
  id: "platformer-02-jump-impulse",
  title: "Jump Impulse",
  description:
    "Press space to jump. An impulse sets negative velocity, gravity brings you back down. The arc emerges from physics, not animation.",
  order: 2,
  xpReward: 50,
  tier: "free",
  concepts: [
    "impulse application",
    "grounded check",
    "negative velocity for upward motion",
    "boolean state flag",
    "input reading with raylib",
  ],
  part1: {
    title: "Impulses and Grounded Checks",
    type: "concept",
    instructions: `# Impulses and Grounded Checks

## Mental Model

A jump isn't animated. It's a sudden change in velocity  --  an **impulse**. You set \`velocity_y\` to a negative value (upward), and gravity does the rest. The arc is physics, not keyframes. The only question is: should the player be *allowed* to jump right now?

## What Breaks Without This

Without a grounded check, the player can jump mid-air infinitely. Without an impulse (just setting position), the jump has no arc  --  it teleports up. Both problems feel terrible.

## The Fix: Impulse + Grounded Flag

Track a \`bool is_grounded\` flag. Set it to \`true\` when the player lands on the ground, \`false\` when they jump. Only allow jumping when grounded.

\`\`\`
if (is_grounded && jump_pressed) {
    velocity_y = -JUMP_SPEED;  // negative = upward
    is_grounded = false;
}
\`\`\`

The negative velocity pushes the player up. Each frame, gravity pulls velocity back toward positive (downward). When velocity crosses zero, the player is at the apex. Then they fall. That's a parabolic arc  --  from two lines of code.

## Key Concepts

**Impulse**: An instant change to velocity (not acceleration). Used for jumps, knockback, explosions. **Grounded check**: A boolean that gates actions. You can only jump if you're on the ground. This is the seed of the player state machine we'll build in Lesson 6.

## Performance Insight

One boolean check per frame. The grounded flag is essentially free. Later, this becomes a proper enum state machine, but the cost stays near zero.

## Memory Insight

\`is_grounded\` is a single bool  --  1 byte. Combined with velocity and position, the entire player state is still under 20 bytes.

## Your Task

Simulate a jumping sequence. Start with a player at y=316 on the ground. The jump speed is 400.0. Gravity is 800.0. FIXED_DT is 1.0/60.0.

Frame 1: Player is grounded, jump is triggered  --  apply impulse.
Frames 2-5: Gravity pulls the player back down.

Print each frame: \`Frame N: y = VALUE grounded = true/false\`

## Beginner Trap

\`\`\`cpp
// WRONG: Setting position directly
if (jump_pressed) player_y -= 100;  // teleport, not physics
\`\`\`

This makes a step, not an arc. Real jumps apply velocity, and let integration create the curve.

## Elite Insight

In Mario, the jump impulse is famously tuned to feel "heavy"  --  a strong upward impulse combined with high gravity creates a punchy, responsive arc. Celeste uses different gravity values for rising vs falling to make jumps feel more controllable. Both start with this exact impulse pattern.

## Systems Thinking Connection

Impulse is the same concept used in the Space Shooter for bullet firing (instant velocity on spawn) and in Robotics for motor commands (instant torque application). Force application is universal across simulation domains.

## Skill Reinforcement

You can now apply instant velocity changes to any entity for any reason  --  jumps, bounces, explosions, knockback.

## Mastery Check

**Q:** Why use negative velocity for jumping instead of subtracting from position?

**A:** Subtracting from position is a teleport. Setting negative velocity lets gravity create a smooth parabolic arc  --  the player rises, slows, stops at the apex, then falls. Physics does the animation for free.`,
    starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    float player_y = 316.0f;
    float player_vy = 0.0f;
    bool is_grounded = true;
    const float GRAVITY = 800.0f;
    const float JUMP_SPEED = 400.0f;
    const float FIXED_DT = 1.0f / 60.0f;
    const float GROUND_Y = 316.0f;

    cout << fixed << setprecision(2);

    // TODO: Simulate 5 frames
    // Frame 1: If grounded, apply jump impulse (player_vy = -JUMP_SPEED, is_grounded = false)
    // All frames: Apply gravity, update position, check ground collision
    // Print: "Frame N: y = VALUE grounded = true/false"
    // Ground collision: if player_y >= GROUND_Y, snap to GROUND_Y, zero vy, set grounded

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    float player_y = 316.0f;
    float player_vy = 0.0f;
    bool is_grounded = true;
    const float GRAVITY = 800.0f;
    const float JUMP_SPEED = 400.0f;
    const float FIXED_DT = 1.0f / 60.0f;
    const float GROUND_Y = 316.0f;

    cout << fixed << setprecision(2);

    for (int i = 1; i <= 5; i++) {
        // Jump impulse on frame 1
        if (i == 1 && is_grounded) {
            player_vy = -JUMP_SPEED;
            is_grounded = false;
        }

        // Physics integration
        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;

        // Ground collision
        if (player_y >= GROUND_Y) {
            player_y = GROUND_Y;
            player_vy = 0.0f;
            is_grounded = true;
        }

        cout << "Frame " << i << ": y = " << player_y
             << " grounded = " << (is_grounded ? "true" : "false") << endl;
    }

    return 0;
}`,
    tests: [
      {
        id: "t1",
        description: "Frame 1: jump impulse applied, player moves up",
        expectedOutput: "Frame 1: y = 309.56 grounded = false",
      },
      {
        id: "t2",
        description: "Frame 2: player continues rising",
        expectedOutput: "Frame 2: y = 303.33 grounded = false",
      },
      {
        id: "t3",
        description: "Frame 5: player still airborne",
        expectedOutput: "Frame 5: y = 286.00 grounded = false",
      },
    ],
    hints: [
      "Use a for loop from 1 to 5. On frame 1, check is_grounded  --  if true, set player_vy = -JUMP_SPEED and is_grounded = false.",
      "After the jump check, apply gravity (player_vy += GRAVITY * FIXED_DT) then update position (player_y += player_vy * FIXED_DT). Then check ground collision.",
      "Print format: cout << \"Frame \" << i << \": y = \" << player_y << \" grounded = \" << (is_grounded ? \"true\" : \"false\") << endl;",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Jump Impulse",
    type: "game_builder",
    instructions: `# Jump Impulse

## Mental Model

You're adding the most important mechanic in a platformer: the jump. When the player presses space while on the ground, you apply a negative velocity impulse. Gravity does the rest  --  creating a parabolic arc that rises, peaks, and falls naturally.

## What Breaks Without This

A platformer without a jump is just a walking simulator on flat ground. The jump is what makes the genre. And a bad jump  --  teleporting up, floating, or infinite air jumps  --  kills the feel immediately.

## The Fix: IsKeyPressed + Grounded Gate

Use raylib's \`IsKeyPressed(KEY_SPACE)\` to detect the jump input. Only allow it when the player is on the ground. Apply the impulse, clear the grounded flag, and let physics handle the arc.

\`\`\`
if (IsKeyPressed(KEY_SPACE) && is_grounded) {
    player_vy = -JUMP_SPEED;
    is_grounded = false;
}
\`\`\`

The ground collision from Lesson 1 sets \`is_grounded = true\` when landing, which re-enables the jump. This creates a natural jump cycle: ground -> impulse -> arc -> land -> repeat.

## Key Concepts

**IsKeyPressed** fires once per press (not held). **IsKeyDown** fires every frame while held. For jumps, use IsKeyPressed so one press = one jump.

## Performance Insight

Input polling in raylib is O(1)  --  it checks a flag array. No allocation, no event queue overhead. Even checking 10 keys per frame is negligible.

## Your Task

Add jumping to your gravity simulation:

1. Add \`JUMP_SPEED = 400.0f\` constant and \`is_grounded\` flag (starts true since player starts on ground)
2. Before physics: if space is pressed AND grounded, set \`player_vy = -JUMP_SPEED\` and \`is_grounded = false\`
3. In ground collision: also set \`is_grounded = true\` when landing
4. Update cout to include grounded state: \`Grounded: true\`

Press space in the canvas  --  watch the blue block arc up and land. That's a real physics jump.

## Beginner Trap

\`\`\`cpp
// WRONG: Using IsKeyDown instead of IsKeyPressed
if (IsKeyDown(KEY_SPACE) && is_grounded) { ... }
\`\`\`

\`IsKeyDown\` fires every frame while held. For jumping, this would re-trigger the impulse on the landing frame if space is still held  --  launching the player again immediately. Use \`IsKeyPressed\` for single-fire actions.

## Elite Insight

Hollow Knight's jump uses \`IsKeyPressed\` for the initial impulse but then checks \`IsKeyDown\` to sustain the jump (variable height). We'll add that in the next lesson. For now, every jump is the same height  --  and that's fine.

## Systems Thinking Connection

The input -> gate -> impulse pattern appears everywhere: in the Space Shooter (fire button -> cooldown check -> spawn bullet), in the RPG (action key -> turn check -> execute command), and in Robotics (command -> safety check -> motor activation).

## Mastery Check

**Q:** Why must the grounded check happen in collision response, not in the jump input section?

**A:** Because landing can happen at any time during physics, not just when the player presses a key. The ground collision sets \`is_grounded = true\` regardless of input  --  it's a physics event, not an input event.`,
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

// TODO: Add JUMP_SPEED constant (400.0f)
// TODO: Add is_grounded flag (starts as true  --  player will land before first input)

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    // Test output (before game loop)
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    // TODO: Print "Grounded: true"

    while (!WindowShouldClose()) {
        // TODO: Jump input  --  if IsKeyPressed(KEY_SPACE) AND is_grounded,
        //       set player_vy = -JUMP_SPEED and is_grounded = false

        // Physics: gravity integration
        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;

        // Ground collision
        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
            // TODO: Set is_grounded = true when landing
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

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    // Test output (before game loop)
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "Grounded: true" << endl;

    while (!WindowShouldClose()) {
        // Jump input
        if (IsKeyPressed(KEY_SPACE) && is_grounded) {
            player_vy = -JUMP_SPEED;
            is_grounded = false;
        }

        // Physics: gravity integration
        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;

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
        id: "g1",
        description: "Player starts at correct position",
        expectedOutput: "Player: (388, 100)",
      },
      {
        id: "g2",
        description: "Gravity is 800",
        expectedOutput: "Gravity: 800",
      },
      {
        id: "g3",
        description: "Player starts grounded",
        expectedOutput: "Grounded: true",
      },
      {
        id: "g4",
        description: "JUMP_SPEED is defined",
        expectedOutput: "true",
        isPattern: true,
      },
    ],
    hints: [
      "Add two lines at file scope: const float JUMP_SPEED = 400.0f; and bool is_grounded = true;",
      "Before the physics section in the loop, add: if (IsKeyPressed(KEY_SPACE) && is_grounded) { player_vy = -JUMP_SPEED; is_grounded = false; }",
      "In the ground collision block, add: is_grounded = true; And before the loop, add: cout << \"Grounded: true\" << endl;",
    ],
    estimatedMinutes: 10,
  },
};

export default lessonPlatformer2;
