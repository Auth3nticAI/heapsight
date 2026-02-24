import { Lesson } from "../../types/lesson";

const lessonPlatformer10: Lesson = {
  id: "platformer-10-milestone-micro-platformer",
  title: "Milestone: Micro Platformer",
  description: "All Phase 1 techniques combined: FSM, air control, coyote time, jump buffer. Add three static platforms and a visual HUD.",
  order: 10,
  xpReward: 100,
  tier: "free",
  concepts: ["milestone", "platform collision", "HUD overlay", "phase 1 integration"],
  part1: {
    title: "Concept: Phase 1 Complete",
    type: "concept",
    instructions: `# Milestone: Micro Platformer

## What You Built
Over the last nine lessons you assembled a complete platformer feel loop from scratch:

- **L1:** Gravity + ground collision — physics integration
- **L2:** Jump impulse — velocity-based jumping
- **L3:** Variable jump height — hold for higher, tap for lower
- **L4:** Left/right movement — basic horizontal control
- **L5:** Acceleration + friction — movement that feels good
- **L6:** Player FSM — explicit states, no boolean soup
- **L7:** Air control — state-dependent acceleration
- **L8:** Coyote time — grace window after leaving ledge
- **L9:** Jump buffer — queue a jump before landing

Every one of these is in shipped games. Together they form the core feel loop that players experience as "good controls."

## What Is a Milestone?
A milestone lesson integrates all previous lessons and adds one new visible feature. This milestone adds **three static platforms** the player can jump onto. The code is mostly complete — your job is to understand it and make it compile.

## Platform Collision Pattern
\`\`\`cpp
// Three platforms: x, y, width, height
const int PLAT_COUNT = 3;
int plat_x[3] = {100, 350, 580};
int plat_y[3] = {280, 240, 200};
int plat_w[3] = {150, 150, 150};

// Check each platform for landing
for (int i = 0; i < PLAT_COUNT; i++) {
    if (player_x + PLAYER_W > plat_x[i] &&
        player_x < plat_x[i] + plat_w[i] &&
        player_y + PLAYER_H >= plat_y[i] &&
        player_y + PLAYER_H <= plat_y[i] + 10 &&
        player_vy >= 0) {
        player_y = plat_y[i] - PLAYER_H;
        player_vy = 0;
        player_state = GROUNDED;
        coyote_timer = COYOTE_TIME;
    }
}
\`\`\`

## Milestone Check
**Q:** Why check \`player_y + PLAYER_H <= plat_y[i] + 10\`?
**A:** The +10 tolerance prevents the player from snapping to the platform top when coming from below. Without it, the player would get stuck on the underside of platforms.

## Beginner Trap
**Adding new mechanics before the core loop (move, jump, land, collide) works perfectly.** Wall jumps do not fix a broken ground collision. Verify the minimal platformer end-to-end before layering complexity.

## Elite Insight
Super Mario Bros shipped with only run and jump. Mega Man added shooting. Celeste added dash. Every great platformer starts with a tight core loop and layers mechanics on top. Your milestone proves the core is solid.

## Systems Thinking Connection
Every path hits this milestone — RPG L10, Shooter L10, Crawler L10. The core loop test is universal: prove the minimal viable game works before building on it. The genre changes, the milestone principle does not.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Print "Phase: 1 complete"
    // TODO: Print "FSM: active"
    // TODO: Print "Coyote: 0.1"
    // TODO: Print "Buffer: 0.1"
    // TODO: Print "Platforms: 3"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Phase: 1 complete" << endl;
    cout << "FSM: active" << endl;
    cout << "Coyote: 0.1" << endl;
    cout << "Buffer: 0.1" << endl;
    cout << "Platforms: 3" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Phase complete printed", expectedOutput: "Phase: 1 complete" },
      { id: "t2", description: "FSM active printed", expectedOutput: "FSM: active" },
      { id: "t3", description: "Coyote time printed", expectedOutput: "Coyote: 0.1" },
      { id: "t4", description: "Jump buffer printed", expectedOutput: "Buffer: 0.1" },
      { id: "t5", description: "Platform count printed", expectedOutput: "Platforms: 3" },
    ],
    hints: [
      "Five cout statements in order: Phase, FSM, Coyote, Buffer, Platforms.",
      "cout << \"Phase: 1 complete\" << endl; — copy the exact string.",
      "Last line: cout << \"Platforms: 3\" << endl;",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Micro Platformer",
    type: "game_builder",
    instructions: `# Build: Micro Platformer

## Mental Model
The complete Phase 1 platformer. Add three static platforms and a HUD that shows player state. The movement code is unchanged — you only add platform data, collision checks, and DrawText calls.

## What's Already Here
Full Phase 1 platformer from Lesson 9: FSM, air control, coyote time, jump buffer.

## Your Task
1. **Add platform arrays at file scope:**
\`\`\`cpp
const int PLAT_COUNT = 3;
int plat_x[3] = {100, 350, 580};
int plat_y[3] = {280, 240, 200};
int plat_w[3] = {150, 150, 150};
const int PLAT_H = 16;
\`\`\`

2. **Add platform collision** in the game loop, BEFORE the ground collision block:
\`\`\`cpp
for (int i = 0; i < PLAT_COUNT; i++) {
    if (player_x + PLAYER_W > plat_x[i] &&
        player_x < plat_x[i] + plat_w[i] &&
        player_y + PLAYER_H >= plat_y[i] &&
        player_y + PLAYER_H <= plat_y[i] + 10 &&
        player_vy >= 0) {
        player_y = plat_y[i] - PLAYER_H;
        player_vy = 0;
        player_state = GROUNDED;
        coyote_timer = COYOTE_TIME;
    }
}
\`\`\`

3. **Draw platforms** inside BeginDrawing/EndDrawing:
\`\`\`cpp
for (int i = 0; i < PLAT_COUNT; i++)
    DrawRectangle(plat_x[i], plat_y[i], plat_w[i], PLAT_H, DARKGREEN);
\`\`\`

4. **Add HUD** (after drawing platforms):
\`\`\`cpp
DrawText(player_state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
\`\`\`

5. **Update cout:** Add \`cout << "Platforms: " << PLAT_COUNT << endl;\` after the Buffer line.

## Did It Work?
You should see three green platforms at different heights. Jump to reach them. The HUD shows your current state. Coyote time and jump buffer work on platform edges too.`,
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
const float JUMP_BUFFER = 0.1f;
// TODO: Add platform arrays: PLAT_COUNT, plat_x[3], plat_y[3], plat_w[3], PLAT_H

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
    // TODO: Add cout << "Platforms: " << PLAT_COUNT << endl;

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

        // TODO: Add platform collision loop here

        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
            player_state = GROUNDED;
            coyote_timer = COYOTE_TIME;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);
        DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN);
        // TODO: Draw platforms with DrawRectangle loop
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);
        // TODO: Add DrawText HUD showing player_state
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

const int PLAT_COUNT = 3;
int plat_x[3] = {100, 350, 580};
int plat_y[3] = {280, 240, 200};
int plat_w[3] = {150, 150, 150};
const int PLAT_H = 16;

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
    cout << "Platforms: " << PLAT_COUNT << endl;

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

        for (int i = 0; i < PLAT_COUNT; i++) {
            if (player_x + PLAYER_W > plat_x[i] &&
                player_x < plat_x[i] + plat_w[i] &&
                player_y + PLAYER_H >= plat_y[i] &&
                player_y + PLAYER_H <= plat_y[i] + 10 &&
                player_vy >= 0) {
                player_y = plat_y[i] - PLAYER_H;
                player_vy = 0;
                player_state = GROUNDED;
                coyote_timer = COYOTE_TIME;
            }
        }

        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
            player_state = GROUNDED;
            coyote_timer = COYOTE_TIME;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);
        DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN);
        for (int i = 0; i < PLAT_COUNT; i++)
            DrawRectangle(plat_x[i], plat_y[i], plat_w[i], PLAT_H, DARKGREEN);
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(player_state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player position printed", expectedOutput: "Player: (388, 100)" },
      { id: "g2", description: "FSM active printed", expectedOutput: "FSM: active" },
      { id: "g3", description: "Coyote time printed", expectedOutput: "Coyote: 0.1" },
      { id: "g4", description: "Jump buffer printed", expectedOutput: "Buffer: 0.1" },
      { id: "g5", description: "Platform count printed", expectedOutput: "Platforms: 3" },
    ],
    hints: [
      "Add PLAT_COUNT=3, plat_x[], plat_y[], plat_w[], PLAT_H=16 at file scope. Add cout << \"Platforms: \" << PLAT_COUNT << endl;",
      "Platform collision loop goes BEFORE the ground collision block. Check AABB overlap plus the +10 bottom tolerance.",
      "In BeginDrawing: loop DrawRectangle for each platform in DARKGREEN. Add DrawText for the HUD state label.",
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer10;
