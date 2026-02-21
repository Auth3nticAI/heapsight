import { Lesson } from "../../types/lesson";

const lessonPlatformer3: Lesson = {
  id: "platformer-03-variable-jump",
  title: "Variable Jump Height",
  description:
    "Tap space for a short hop, hold it for a full jump. One simple velocity clamp makes the jump feel alive.",
  order: 3,
  xpReward: 50,
  tier: "free",
  concepts: [
    "variable jump height",
    "velocity clamping on key release",
    "IsKeyDown vs IsKeyPressed",
    "jump feel tuning",
    "minimum jump velocity",
  ],
  part1: {
    title: "Why Variable Jump Height Matters",
    type: "concept",
    instructions: `# Why Variable Jump Height Matters

## Mental Model

In the last lesson, every jump was the same height  --  full impulse, fixed arc. But real platformers let you control the jump height by how long you hold the button. Tap = short hop. Hold = full arc. This is **the** difference between a platformer that feels robotic and one that feels alive.

## What Breaks Without This

With fixed-height jumps, the player has no fine control. They overshoot small gaps, can't make precise landings, and the game feels like it's fighting them. Every great platformer  --  Mario, Celeste, Hollow Knight, Ori  --  has variable jump height.

## The Fix: Velocity Clamping on Release

The trick is simple: when the player *releases* the jump button while still rising, clamp their upward velocity to a smaller value. They were going to reach full height, but you cut the arc short.

\`\`\`
// If player released jump while still rising
if (!holding_jump && player_vy < -MIN_JUMP_VY) {
    player_vy = -MIN_JUMP_VY;  // clamp to minimum jump velocity
}
\`\`\`

\`MIN_JUMP_VY\` is the minimum upward speed after release  --  typically about 30-40% of the full jump speed. If the player releases early, velocity gets clamped to this value, creating a short hop. If they hold through the full arc, the clamp never triggers because velocity naturally decreases past the threshold.

## Key Concepts

**Velocity clamping**: Limiting a velocity to a max/min value. Here we clamp upward velocity on release, but the pattern is universal  --  clamping horizontal speed, terminal fall velocity, knockback decay. **IsKeyDown**: Returns true every frame the key is held. Use this (not IsKeyPressed) to detect "still holding."

## Performance Insight

One additional comparison per frame  --  completely free. The elegance here is that we're not adding a new system or timer. We're just clamping a value that already exists.

## Memory Insight

No new allocations. We add one constant (\`MIN_JUMP_VY\`)  --  4 bytes. The entire jump system is still pure arithmetic on file-scope floats.

## Your Task

Simulate variable jump height. A player jumps with JUMP_SPEED = 400.0 and gravity = 800.0. MIN_JUMP_VY = 150.0.

Scenario A (full jump  --  hold): Simulate 5 frames holding jump. No clamping occurs.
Scenario B (short hop  --  release on frame 2): Same jump, but on frame 2 the player releases. If velocity is more negative than -MIN_JUMP_VY, clamp it.

Print results for both scenarios.

## Beginner Trap

\`\`\`cpp
// WRONG: Checking if key is released instead of NOT held
if (IsKeyReleased(KEY_SPACE)) { player_vy = -MIN_JUMP_VY; }
\`\`\`

\`IsKeyReleased\` fires only on the frame of release. But you need to clamp velocity EVERY frame after release while the player is still rising. Use \`!IsKeyDown(KEY_SPACE)\`  --  this is true every frame the key isn't held.

## Elite Insight

Celeste's jump system is more nuanced: it uses different gravity multipliers for rising vs falling, plus a separate "fast fall" gravity when the player presses down. But the core variable height still comes from this velocity-clamp-on-release technique. Super Meat Boy uses a similar approach with a very aggressive clamp, giving it that snappy, twitchy feel.

## Systems Thinking Connection

Velocity clamping shows up in the Space Shooter as max bullet speed and in the RPG as damage caps. In the Robotics path, velocity limits prevent motor commands from exceeding safe thresholds. "Clamp to safe range" is a universal systems pattern.

## Skill Reinforcement

You now understand how to give players analog control over a digital action. One button, infinite heights.

## Mastery Check

**Q:** Why not use a timer to control jump height instead of velocity clamping?

**A:** A timer requires tracking state (frames held) and mapping it to height somehow. Velocity clamping achieves the same result with zero additional state  --  just one comparison against the existing velocity value. Simpler, more physics-correct, and easier to tune.`,
    starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    const float GRAVITY = 800.0f;
    const float JUMP_SPEED = 400.0f;
    const float MIN_JUMP_VY = 150.0f;
    const float FIXED_DT = 1.0f / 60.0f;
    const float GROUND_Y = 316.0f;

    cout << fixed << setprecision(2);

    // Scenario A: Full jump (hold entire time)
    cout << "=== Full Jump ===" << endl;
    // TODO: Start at GROUND_Y, apply jump impulse, simulate 5 frames
    // No clamping occurs because player holds button
    // Print: "Frame N: y = VALUE vy = VALUE"

    // Scenario B: Short hop (release on frame 2)
    cout << "=== Short Hop ===" << endl;
    // TODO: Start at GROUND_Y, apply jump impulse, simulate 5 frames
    // On frames 2+, player has released jump. If vy < -MIN_JUMP_VY, clamp to -MIN_JUMP_VY
    // Print: "Frame N: y = VALUE vy = VALUE"

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    const float GRAVITY = 800.0f;
    const float JUMP_SPEED = 400.0f;
    const float MIN_JUMP_VY = 150.0f;
    const float FIXED_DT = 1.0f / 60.0f;
    const float GROUND_Y = 316.0f;

    cout << fixed << setprecision(2);

    // Scenario A: Full jump (hold entire time)
    cout << "=== Full Jump ===" << endl;
    {
        float py = GROUND_Y;
        float vy = -JUMP_SPEED;
        for (int i = 1; i <= 5; i++) {
            vy += GRAVITY * FIXED_DT;
            py += vy * FIXED_DT;
            cout << "Frame " << i << ": y = " << py << " vy = " << vy << endl;
        }
    }

    // Scenario B: Short hop (release on frame 2)
    cout << "=== Short Hop ===" << endl;
    {
        float py = GROUND_Y;
        float vy = -JUMP_SPEED;
        bool holding = true;
        for (int i = 1; i <= 5; i++) {
            if (i >= 2) holding = false;
            if (!holding && vy < -MIN_JUMP_VY) {
                vy = -MIN_JUMP_VY;
            }
            vy += GRAVITY * FIXED_DT;
            py += vy * FIXED_DT;
            cout << "Frame " << i << ": y = " << py << " vy = " << vy << endl;
        }
    }

    return 0;
}`,
    tests: [
      {
        id: "p1-t1",
        description: "Full jump header printed",
        expectedOutput: "=== Full Jump ===",
      },
      {
        id: "p1-t2",
        description: "Short hop header printed",
        expectedOutput: "=== Short Hop ===",
      },
      {
        id: "p1-t3",
        description: "Full jump frame 1 is correct",
        expectedOutput: "Frame 1: y = 309.56 vy = -386.67",
      },
      {
        id: "p1-t4",
        description: "Short hop frame 2 shows clamped velocity",
        expectedOutput: "Frame 2: y = 307.28 vy = -136.67",
      },
    ],
    hints: [
      "For each scenario, initialize py = GROUND_Y and vy = -JUMP_SPEED (the jump impulse). Then loop 5 frames applying gravity and position update.",
      "For Scenario B, use a bool 'holding' that starts true and becomes false on frame 2. Each frame, if !holding and vy < -MIN_JUMP_VY, clamp vy = -MIN_JUMP_VY before applying gravity.",
      "Use scoped blocks {} around each scenario so you can reuse variable names. Print: cout << \"Frame \" << i << \": y = \" << py << \" vy = \" << vy << endl;",
    ],
    estimatedMinutes: 12,
  },
  part2: {
    title: "Variable Jump Height",
    type: "game_builder",
    instructions: `# Variable Jump Height

## Mental Model

Your jump already works  --  impulse on press, gravity pulls you back. Now we add *expression*. Tap for a hop, hold for a full arc. The player communicates their intent through how long they hold the button, and the physics responds.

## What Breaks Without This

Right now every jump is identical. The player can't clear a small gap with a hop or reach a high platform with a full jump. The game feels like it has training wheels.

## The Fix: Clamp Velocity When Space Is Released

After the jump impulse, check each frame: is the player still holding space? If not, and they're still rising (negative vy), clamp the velocity to \`-MIN_JUMP_VY\`. This cuts the arc short.

\`\`\`
// After jump input, before physics
if (!is_grounded && !IsKeyDown(KEY_SPACE) && player_vy < -MIN_JUMP_VY) {
    player_vy = -MIN_JUMP_VY;
}
\`\`\`

This goes between the jump input check and the physics integration  --  it modifies the velocity before gravity processes it.

## Key Concepts

The order matters: (1) check jump press -> (2) check jump release/clamp -> (3) integrate physics -> (4) resolve collision. This is the beginning of the **update pipeline** that will define the entire Platformer architecture.

## Performance Insight

Still just comparisons and assignments. The variable jump adds zero measurable cost  --  it's one more branch in the input phase.

## Your Task

Add variable jump height to your platformer:

1. Add \`MIN_JUMP_VY = 150.0f\` constant
2. After the jump input check, add the velocity clamp: if not grounded, space is NOT held, and player_vy < -MIN_JUMP_VY, clamp player_vy to -MIN_JUMP_VY
3. Update cout to print the jump speed and min jump values

Try it in the canvas: tap space quickly for a short hop, hold space for a full jump. The difference should be clearly visible.

## Beginner Trap

\`\`\`cpp
// WRONG: Clamping inside the jump press check
if (IsKeyPressed(KEY_SPACE) && is_grounded) {
    player_vy = -JUMP_SPEED;
    is_grounded = false;
    // Don't put the clamp here  --  this only runs on the press frame!
}
\`\`\`

The clamp must run every frame while airborne, not just on the press frame. It goes in a separate block that checks \`!IsKeyDown(KEY_SPACE)\`.

## Elite Insight

Celeste actually combines this velocity-clamp technique with separate gravity values: lower gravity while rising with the button held, higher gravity after release. This creates a "floaty peak" that gives the player more time to aim their landing. We could add that later  --  for now, the velocity clamp alone gives us 80% of the feel.

## Systems Thinking Connection

The update pipeline order (input -> clamp -> physics -> collision) is the same sequential processing pattern used in the RPG path's turn resolution (intent -> validate -> resolve -> apply) and the Robotics path's control loop (sense -> plan -> act -> observe). Order matters in all these systems.

## Mastery Check

**Q:** What happens if MIN_JUMP_VY equals JUMP_SPEED?

**A:** The clamp never fires  --  \`player_vy\` is never more negative than \`-JUMP_SPEED\`, and \`-MIN_JUMP_VY\` would equal \`-JUMP_SPEED\`. Every jump would be the same height regardless of hold time. The clamp only matters when MIN_JUMP_VY < JUMP_SPEED.`,
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

// TODO: Add MIN_JUMP_VY constant (150.0f)

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    // Test output (before game loop)
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "Grounded: true" << endl;
    // TODO: Print "JumpSpeed: 400" and "MinJumpVY: 150"

    while (!WindowShouldClose()) {
        // Jump input
        if (IsKeyPressed(KEY_SPACE) && is_grounded) {
            player_vy = -JUMP_SPEED;
            is_grounded = false;
        }

        // TODO: Variable jump  --  if not grounded AND space NOT held
        //       AND player_vy < -MIN_JUMP_VY, clamp player_vy to -MIN_JUMP_VY

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

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    // Test output (before game loop)
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "Grounded: true" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;

    while (!WindowShouldClose()) {
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
        description: "Jump speed printed",
        expectedOutput: "JumpSpeed: 400",
      },
      {
        id: "p2-t4",
        description: "Min jump velocity printed",
        expectedOutput: "MinJumpVY: 150",
      },
      {
        id: "p2-t5",
        description: "Grounded state printed",
        expectedOutput: "Grounded: true",
      },
    ],
    hints: [
      "Add at file scope: const float MIN_JUMP_VY = 150.0f;",
      "After the jump input block and before the physics section, add: if (!is_grounded && !IsKeyDown(KEY_SPACE) && player_vy < -MIN_JUMP_VY) { player_vy = -MIN_JUMP_VY; }",
      "Add two cout lines before the game loop: cout << \"JumpSpeed: \" << JUMP_SPEED << endl; and cout << \"MinJumpVY: \" << MIN_JUMP_VY << endl;",
    ],
    estimatedMinutes: 10,
  },
};

export default lessonPlatformer3;
