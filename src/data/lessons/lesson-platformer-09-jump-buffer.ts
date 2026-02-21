import { Lesson } from "../../types/lesson";

const lessonPlatformer9: Lesson = {
  id: "platformer-09-jump-buffer",
  title: "Jump Buffer",
  description: "Queue a jump input so it fires the moment the player lands. Eliminates the frustration of pressing jump a frame too early.",
  order: 9,
  xpReward: 50,
  tier: "pro",
  concepts: ["jump buffer", "input buffering", "forgiveness mechanics", "paired timers"],
  part1: {
    title: "Concept: Input Buffering",
    type: "concept",
    instructions: `# Jump Buffer

## Mental Model
The player presses jump 0.05 seconds before landing. Without buffering, nothing happens — they were still in the air. With a **jump buffer**, the input is remembered for a brief window. The moment they land, the buffered jump fires immediately. This is the companion technique to coyote time: coyote time forgives late inputs, jump buffer forgives early inputs.

## The Pattern
\`\`\`cpp
const float JUMP_BUFFER = 0.1f;
float jump_buffer_timer = 0.0f;

// When space is pressed: start the buffer timer
if (IsKeyPressed(KEY_SPACE)) jump_buffer_timer = JUMP_BUFFER;

// Count down the buffer each frame
if (jump_buffer_timer > 0) jump_buffer_timer -= FIXED_DT;

// Jump fires when: buffer is active AND coyote window is open
if (jump_buffer_timer > 0 && coyote_timer > 0) {
    player_vy = -JUMP_SPEED;
    player_state = AIRBORNE;
    coyote_timer = 0;
    jump_buffer_timer = 0;
}
\`\`\`

## Key Concepts
- Jump buffer: remember a jump press for a short window
- Both timers consumed on jump: prevents double-jumps
- Paired with coyote time: together they handle all edge cases
- Input buffering: a general pattern for any action input

## Your Task
Simulate a jump buffer: print the buffer value, simulate it being set on press, then consumed on landing.

## Mastery Check
**Q:** With both coyote time (0.1s) and jump buffer (0.1s), what is the maximum timing error a player can make and still get a jump?
**A:** 0.2 seconds total — 0.1s late (coyote) plus 0.1s early (buffer). That is 12 frames at 60fps, which makes the game feel responsive even to imprecise input.`,
    starterCode: `#include <iostream>
using namespace std;

const float JUMP_BUFFER = 0.1f;

int main() {
    float jump_buffer_timer = 0.0f;
    // TODO: Print "Buffer: 0" (initial, no press yet)
    // TODO: Print "Jump buffer: active"
    // TODO: Set jump_buffer_timer = JUMP_BUFFER (simulating a press)
    // TODO: Print "Buffer: 0.1" (after press)
    // TODO: Set jump_buffer_timer = 0 (consumed on landing)
    // TODO: Print "Buffer: 0" (consumed)
    // TODO: Print "Jumped: buffered"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const float JUMP_BUFFER = 0.1f;

int main() {
    float jump_buffer_timer = 0.0f;
    cout << "Buffer: " << jump_buffer_timer << endl;
    cout << "Jump buffer: active" << endl;
    jump_buffer_timer = JUMP_BUFFER;
    cout << "Buffer: " << jump_buffer_timer << endl;
    jump_buffer_timer = 0;
    cout << "Buffer: " << jump_buffer_timer << endl;
    cout << "Jumped: buffered" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Initial buffer printed", expectedOutput: "Buffer: 0" },
      { id: "t2", description: "Active label printed", expectedOutput: "Jump buffer: active" },
      { id: "t3", description: "Buffer set on press", expectedOutput: "Buffer: 0.1" },
      { id: "t4", description: "Buffer consumed", expectedOutput: "Jumped: buffered" },
    ],
    hints: [
      "Start with cout << \"Buffer: \" << jump_buffer_timer << endl; then cout << \"Jump buffer: active\" << endl;",
      "Set jump_buffer_timer = JUMP_BUFFER; then print Buffer: again to show 0.1.",
      "Set jump_buffer_timer = 0; then print \"Jumped: buffered\".",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Jump Buffer",
    type: "game_builder",
    instructions: `# Build: Jump Buffer

## Mental Model
Add a \`jump_buffer_timer\`. When space is pressed, set it to \`JUMP_BUFFER\`. Count it down each frame. Fire the jump when both \`jump_buffer_timer > 0\` AND \`coyote_timer > 0\`. Consume both timers on jump.

## What's Already Here
Coyote time platformer from Lesson 8: coyote_timer, PlayerState FSM, air control.

## Your Task
1. **Add the constant:** \`const float JUMP_BUFFER = 0.1f;\` at file scope.

2. **Add the timer:** \`float jump_buffer_timer = 0.0f;\` at file scope.

3. **Set buffer on press:** Replace the jump condition with two separate steps in the game loop:
\`\`\`cpp
// Step A: record press (anywhere in the loop)
if (IsKeyPressed(KEY_SPACE)) jump_buffer_timer = JUMP_BUFFER;
// Step B: count down
if (jump_buffer_timer > 0) jump_buffer_timer -= FIXED_DT;
// Step C: fire jump
if (jump_buffer_timer > 0 && coyote_timer > 0) {
    player_vy = -JUMP_SPEED;
    player_state = AIRBORNE;
    coyote_timer = 0;
    jump_buffer_timer = 0;
}
\`\`\`

4. **Update cout:** Add \`cout << "Buffer: " << JUMP_BUFFER << endl;\` after the Coyote line.

## Did It Work?
Try pressing space while still in the air, just before landing. The jump should fire the instant you touch the ground. The gap between pressing and landing can be up to 0.1 seconds (6 frames).`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

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
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
// TODO: Add const float JUMP_BUFFER = 0.1f;

enum PlayerState { GROUNDED, AIRBORNE };
PlayerState player_state = GROUNDED;
float coyote_timer = 0.0f;
// TODO: Add float jump_buffer_timer = 0.0f;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "State: " << (player_state == GROUNDED ? "GROUNDED" : "AIRBORNE") << endl;
    cout << "FSM: active" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;
    cout << "Accel: " << ACCEL << endl;
    cout << "Friction: " << FRICTION << endl;
    cout << "MaxRun: " << MAX_RUN << endl;
    cout << "AirAccel: " << AIR_ACCEL << endl;
    cout << "Coyote: " << COYOTE_TIME << endl;
    // TODO: Add cout << "Buffer: " << JUMP_BUFFER << endl;

    while (!WindowShouldClose()) {
        if (player_state == AIRBORNE && coyote_timer > 0) coyote_timer -= FIXED_DT;
        // TODO: Add jump_buffer_timer countdown
        // TODO: Add if (IsKeyPressed(KEY_SPACE)) jump_buffer_timer = JUMP_BUFFER;
        float accel = (player_state == GROUNDED) ? ACCEL : AIR_ACCEL;
        if (IsKeyDown(KEY_RIGHT)) {
            player_vx += accel * FIXED_DT;
            if (player_vx > MAX_RUN) player_vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            player_vx -= accel * FIXED_DT;
            if (player_vx < -MAX_RUN) player_vx = -MAX_RUN;
        } else {
            if (player_vx > 0) {
                player_vx -= FRICTION * FIXED_DT;
                if (player_vx < 0) player_vx = 0;
            } else if (player_vx < 0) {
                player_vx += FRICTION * FIXED_DT;
                if (player_vx > 0) player_vx = 0;
            }
        }

        // TODO: Replace this block with the three-step buffer+coyote jump
        if (IsKeyPressed(KEY_SPACE) && coyote_timer > 0) {
            player_vy = -JUMP_SPEED;
            player_state = AIRBORNE;
            coyote_timer = 0;
        }

        if (player_state == AIRBORNE && !IsKeyDown(KEY_SPACE) && player_vy < -MIN_JUMP_VY) {
            player_vy = -MIN_JUMP_VY;
        }

        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;
        player_x += player_vx * FIXED_DT;

        if (player_x < 0) player_x = 0;
        if (player_x + PLAYER_W > SCREEN_W) player_x = SCREEN_W - PLAYER_W;

        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
            player_state = GROUNDED;
            coyote_timer = COYOTE_TIME;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);
        DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN);
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

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
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;

enum PlayerState { GROUNDED, AIRBORNE };
PlayerState player_state = GROUNDED;
float coyote_timer = 0.0f;
float jump_buffer_timer = 0.0f;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "State: " << (player_state == GROUNDED ? "GROUNDED" : "AIRBORNE") << endl;
    cout << "FSM: active" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;
    cout << "Accel: " << ACCEL << endl;
    cout << "Friction: " << FRICTION << endl;
    cout << "MaxRun: " << MAX_RUN << endl;
    cout << "AirAccel: " << AIR_ACCEL << endl;
    cout << "Coyote: " << COYOTE_TIME << endl;
    cout << "Buffer: " << JUMP_BUFFER << endl;

    while (!WindowShouldClose()) {
        if (player_state == AIRBORNE && coyote_timer > 0) coyote_timer -= FIXED_DT;
        if (jump_buffer_timer > 0) jump_buffer_timer -= FIXED_DT;
        if (IsKeyPressed(KEY_SPACE)) jump_buffer_timer = JUMP_BUFFER;
        float accel = (player_state == GROUNDED) ? ACCEL : AIR_ACCEL;
        if (IsKeyDown(KEY_RIGHT)) {
            player_vx += accel * FIXED_DT;
            if (player_vx > MAX_RUN) player_vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            player_vx -= accel * FIXED_DT;
            if (player_vx < -MAX_RUN) player_vx = -MAX_RUN;
        } else {
            if (player_vx > 0) {
                player_vx -= FRICTION * FIXED_DT;
                if (player_vx < 0) player_vx = 0;
            } else if (player_vx < 0) {
                player_vx += FRICTION * FIXED_DT;
                if (player_vx > 0) player_vx = 0;
            }
        }

        if (jump_buffer_timer > 0 && coyote_timer > 0) {
            player_vy = -JUMP_SPEED;
            player_state = AIRBORNE;
            coyote_timer = 0;
            jump_buffer_timer = 0;
        }

        if (player_state == AIRBORNE && !IsKeyDown(KEY_SPACE) && player_vy < -MIN_JUMP_VY) {
            player_vy = -MIN_JUMP_VY;
        }

        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;
        player_x += player_vx * FIXED_DT;

        if (player_x < 0) player_x = 0;
        if (player_x + PLAYER_W > SCREEN_W) player_x = SCREEN_W - PLAYER_W;

        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
            player_state = GROUNDED;
            coyote_timer = COYOTE_TIME;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);
        DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN);
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "p2-t1", description: "Player position printed", expectedOutput: "Player: (388, 100)" },
      { id: "p2-t2", description: "FSM active printed", expectedOutput: "FSM: active" },
      { id: "p2-t3", description: "Coyote time printed", expectedOutput: "Coyote: 0.1" },
      { id: "p2-t4", description: "Jump buffer printed", expectedOutput: "Buffer: 0.1" },
      { id: "p2-t5", description: "Accel printed", expectedOutput: "Accel: 600" },
    ],
    hints: [
      "Add const float JUMP_BUFFER = 0.1f; and float jump_buffer_timer = 0.0f; Add cout << \"Buffer: \" << JUMP_BUFFER << endl; in startup prints.",
      "In the game loop, add: if (jump_buffer_timer > 0) jump_buffer_timer -= FIXED_DT; and if (IsKeyPressed(KEY_SPACE)) jump_buffer_timer = JUMP_BUFFER;",
      "Replace the old jump check with: if (jump_buffer_timer > 0 && coyote_timer > 0) { player_vy = -JUMP_SPEED; player_state = AIRBORNE; coyote_timer = 0; jump_buffer_timer = 0; }",
    ],
    estimatedMinutes: 12,
  },
};

export default lessonPlatformer9;
