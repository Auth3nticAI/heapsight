import { Lesson } from "../../types/lesson";

const lessonPlatformer8: Lesson = {
  id: "platformer-08-coyote-time",
  title: "Coyote Time",
  description: "Give players a grace window to jump after walking off a ledge. This single technique makes every platformer feel more fair.",
  order: 8,
  xpReward: 50,
  tier: "free",
  concepts: ["coyote time", "grace window", "forgiveness mechanics", "timer variables"],
  part1: {
    title: "Concept: Coyote Time",
    type: "concept",
    instructions: `# Coyote Time

## Mental Model
Named after the Looney Tunes coyote who runs off a cliff and hangs in the air for a moment before falling. In platformers, **coyote time** is a grace period during which the player can still jump even after walking off a ledge. Without it, players feel cheated — they pressed jump, but they were one frame past the edge so nothing happened. With it, the game feels fair.

## The Pattern
\`\`\`cpp
const float COYOTE_TIME = 0.1f;  // 6 frames at 60fps
float coyote_timer = 0.0f;

// When grounded: reset timer
if (player_state == GROUNDED) coyote_timer = COYOTE_TIME;

// Each frame: count down
if (player_state == AIRBORNE) coyote_timer -= FIXED_DT;

// Jump is valid while timer > 0 (still in grace window)
if (IsKeyPressed(KEY_SPACE) && coyote_timer > 0) {
    player_vy = -JUMP_SPEED;
    coyote_timer = 0;  // consume the grace window
    player_state = AIRBORNE;
}
\`\`\`

## Key Concepts
- Coyote time: grace period after leaving a ledge
- Timer variable: counts down from COYOTE_TIME to 0
- Consume on use: set timer to 0 after jumping to prevent double-jumps
- Forgiveness mechanics: make hard things feel possible

## Your Task
Simulate a coyote timer: print the initial timer value, print after consuming it (jumping), then print after it expires.

## Mastery Check
**Q:** Why must you set \`coyote_timer = 0\` after jumping?
**A:** Without it, the player could jump again immediately if still in the air with timer > 0. Setting to 0 consumes the grace window — it can only be used once per ledge exit.

## Beginner Trap
**Starting the coyote timer when the player presses jump instead of when they leave the ground.** Coyote time is the grace period AFTER leaving a ledge where a jump is still allowed. If you start it on jump press, you have implemented a jump buffer instead.

## Elite Insight
The term "coyote time" comes from Wile E. Coyote running off cliffs and not falling immediately. Celeste, Hollow Knight, and nearly every modern platformer grants 6-10 frames of coyote time. Players perceive it as "the game is fair" rather than noticing the mechanic.

## Systems Thinking Connection
The RPG path has no jump mechanic — movement is grid-based. The Shooter has no gravity. But input forgiveness is universal: the RPG queues movement commands, and the Shooter buffers rapid-fire input. Every path forgives imprecise timing in its own way.`,
    starterCode: `#include <iostream>
using namespace std;

const float COYOTE_TIME = 0.1f;

int main() {
    float coyote_timer = COYOTE_TIME;
    // TODO: Print "Coyote: 0.1"
    // TODO: Print "Coyote time: active"
    // TODO: Set coyote_timer = 0 (jump consumed the window)
    // TODO: Print "Coyote: 0" (after consuming)
    // TODO: Print "Jumped: ok"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const float COYOTE_TIME = 0.1f;

int main() {
    float coyote_timer = COYOTE_TIME;
    cout << "Coyote: " << coyote_timer << endl;
    cout << "Coyote time: active" << endl;
    coyote_timer = 0;
    cout << "Coyote: " << coyote_timer << endl;
    cout << "Jumped: ok" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Initial timer printed", expectedOutput: "Coyote: 0.1" },
      { id: "t2", description: "Active label printed", expectedOutput: "Coyote time: active" },
      { id: "t3", description: "Consumed timer printed", expectedOutput: "Coyote: 0" },
      { id: "t4", description: "Jump confirmation printed", expectedOutput: "Jumped: ok" },
    ],
    hints: [
      "cout << \"Coyote: \" << coyote_timer << endl; prints the timer value.",
      "After printing, set coyote_timer = 0; then print again to show it was consumed.",
      "Final line: cout << \"Jumped: ok\" << endl;",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Coyote Time",
    type: "game_builder",
    instructions: `# Build: Coyote Time

## Mental Model
Add a \`coyote_timer\` float. When grounded, reset it to \`COYOTE_TIME\`. While airborne, count it down. Allow jumping while the timer is still positive — even after leaving a ledge.

## What's Already Here
Air control platformer from Lesson 7: PlayerState FSM, ACCEL/AIR_ACCEL, variable jump.

## Your Task
1. **Add the constant:** \`const float COYOTE_TIME = 0.1f;\` at file scope.

2. **Add the timer variable:** \`float coyote_timer = 0.0f;\` at file scope.

3. **Reset timer when grounded:** In the landing block, after \`player_state = GROUNDED;\`, add \`coyote_timer = COYOTE_TIME;\`

4. **Count down while airborne:** At the start of the game loop (before movement), add:
\`\`\`cpp
if (player_state == AIRBORNE && coyote_timer > 0) coyote_timer -= FIXED_DT;
\`\`\`

5. **Use timer in jump check:** Replace \`player_state == GROUNDED\` in the jump condition with \`coyote_timer > 0\`. After jumping, set \`coyote_timer = 0;\`

6. **Update cout:** Add \`cout << "Coyote: " << COYOTE_TIME << endl;\` after the AirAccel line.

## Did It Work?
Run off the edge of the ground area and immediately press space. You should be able to jump for a brief window after leaving. Without this code, that jump would fail.`,
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
// TODO: Add const float COYOTE_TIME = 0.1f;

enum PlayerState { GROUNDED, AIRBORNE };
PlayerState player_state = GROUNDED;
// TODO: Add float coyote_timer = 0.0f;

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
    // TODO: Add cout << "Coyote: " << COYOTE_TIME << endl;

    while (!WindowShouldClose()) {
        // TODO: Add coyote_timer countdown here (if AIRBORNE and timer > 0)
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

        // TODO: Replace player_state == GROUNDED with coyote_timer > 0
        if (IsKeyPressed(KEY_SPACE) && player_state == GROUNDED) {
            player_vy = -JUMP_SPEED;
            player_state = AIRBORNE;
            // TODO: Add coyote_timer = 0;
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
            // TODO: Add coyote_timer = COYOTE_TIME;
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

enum PlayerState { GROUNDED, AIRBORNE };
PlayerState player_state = GROUNDED;
float coyote_timer = 0.0f;

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

    while (!WindowShouldClose()) {
        if (player_state == AIRBORNE && coyote_timer > 0) coyote_timer -= FIXED_DT;
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
    tests: [
      { id: "g1", description: "Player position printed", expectedOutput: "Player: (388, 100)" },
      { id: "g2", description: "FSM active printed", expectedOutput: "FSM: active" },
      { id: "g3", description: "Air accel printed", expectedOutput: "AirAccel: 300" },
      { id: "g4", description: "Coyote time printed", expectedOutput: "Coyote: 0.1" },
      { id: "g5", description: "Accel printed", expectedOutput: "Accel: 600" },
    ],
    hints: [
      "Add const float COYOTE_TIME = 0.1f; and float coyote_timer = 0.0f; at file scope. Add cout << \"Coyote: \" << COYOTE_TIME << endl; in startup prints.",
      "In the game loop, add: if (player_state == AIRBORNE && coyote_timer > 0) coyote_timer -= FIXED_DT; before movement code.",
      "Change jump condition to coyote_timer > 0. After jumping, set coyote_timer = 0. On landing, set coyote_timer = COYOTE_TIME.",
    ],
    estimatedMinutes: 12,
  },
};

export default lessonPlatformer8;
